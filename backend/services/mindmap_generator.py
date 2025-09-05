# backend/mindmap_generator.py
from fastapi import HTTPException,UploadFile
from langchain_text_splitters import RecursiveCharacterTextSplitter
from services.llm import get_graph_llm, get_summarizer_llm
from langchain.prompts import PromptTemplate
from utils.llm_handler import LLMTokenExpiredError, safe_invoke
from langchain.schema.runnable import RunnableSequence
from services import extractor
import json
import re
import uuid
import logging
from io import BytesIO

logger = logging.getLogger(__name__)

# ✅ PromptTemplate for graph generation
GRAPH_PROMPT = PromptTemplate(
    input_variables=["text"],
    template="""
You are a mindmap generator. Based on the following text, create a JSON mindmap with "nodes" and "edges".

Requirements:
- Each node must include:
  - id (unique)
  - type (MUST follow these depth-based rules):
    * "root": exactly ONE node that represents the central/main idea (depth = 0).
    * "sub": direct children of the root (depth = 1).
    * "detail": all deeper nodes (depth >= 2).
  - data: {{
      "label": "Heading of the node",
      "content": "One-line description/detail/summary of the node"
    }}
- Each edge must include:
  - id (unique)
  - source (node id)
  - target (node id)

Text:
{text}

Rules:
- Return **strict JSON ONLY**, no explanations, comments, or extra text.
- Ensure all node and edge ids are unique.
- There must be exactly one "root" node.
- All direct children of the root must be "sub".
- Only nodes below the "sub" layer can be "detail".
- `content` should always be a one-line summary/detail of the node label based on the text and cannot be empty.
- Do not include children arrays.
- All references in source and target must use the unique node IDs.

Example:
{{
  "nodes": [
    {{
      "id": "node1",
      "type": "root",
      "data": {{
        "label": "Main Topic",
        "content": "Central idea of the text"
      }}
    }},
    {{
      "id": "node2",
      "type": "sub",
      "data": {{
        "label": "Sub Idea",
        "content": "Direct child of root"
      }}
    }},
    {{
      "id": "node3",
      "type": "detail",
      "data": {{
        "label": "Supporting Detail",
        "content": "Lower-level explanation"
      }}
    }}
  ],
  "edges": [
    {{
      "id": "edge1",
      "source": "node1",
      "target": "node2"
    }},
    {{
      "id": "edge2",
      "source": "node2",
      "target": "node3"
    }}
  ]
}}
"""
)

# ✅ New PromptTemplate for title generation
TITLE_PROMPT = PromptTemplate(
    input_variables=["text"],
    template="""
You are a text summarizer. Generate a **short, descriptive title** for the following text.
Text:
{text}

Rules:
- Return only a concise title (5 words max) summarizing the main idea.
- Do not include any punctuation, explanations, or quotes.
"""
)

def merge_mindmaps(mindmaps: list[dict]) -> dict:
    """
    Merge multiple mindmaps (from different chunks) into one.
    - Deduplicate root nodes by label (case-insensitive).
    - Deduplicate sub/detail nodes by (parent_id + label).
    - Ensure all edges point to the correct merged nodes.
    """
    merged_nodes = []
    merged_edges = []

    # Track unique nodes
    root_map = {}        # label_lower -> root_id
    child_map = {}       # (parent_id, label_lower) -> node_id
    id_remap = {}        # old_id -> new_id

    for mm in mindmaps:
        for node in mm.get("nodes", []):
            old_id = node["id"]
            node_label = node["data"]["label"].strip().lower()

            # ✅ Root deduplication
            if node["type"] == "root":
                if node_label in root_map:
                    id_remap[old_id] = root_map[node_label]
                    continue
                else:
                    root_map[node_label] = old_id
                    merged_nodes.append(node)
                    continue

            # ✅ For sub/detail nodes, check if parent exists in edges
            parent_id = None
            for e in mm.get("edges", []):
                if e["target"] == old_id:
                    parent_id = e["source"]
                    break

            key = (parent_id, node_label)
            if parent_id and key in child_map:
                # Map old_id to existing deduped node
                id_remap[old_id] = child_map[key]
                continue
            else:
                child_map[key] = old_id
                merged_nodes.append(node)

        # ✅ Process edges
        for edge in mm.get("edges", []):
            edge = edge.copy()
            if edge["source"] in id_remap:
                edge["source"] = id_remap[edge["source"]]
            if edge["target"] in id_remap:
                edge["target"] = id_remap[edge["target"]]

            # avoid duplicate edges
            if not any(
                e["source"] == edge["source"] and e["target"] == edge["target"]
                for e in merged_edges
            ):
                merged_edges.append(edge)

    return {"nodes": merged_nodes, "edges": merged_edges}

class MindmapGenerator:
    def __init__(self):
        self.llm = get_graph_llm()

    async def generate_chunk_mindmap(self, chunk: str, chunk_index: int) -> dict:
        """Generate mindmap JSON for a single text chunk with unique IDs."""
        chain = GRAPH_PROMPT | self.llm
        
        try:
        # ✅ Wrap LLM call with safe_invoke
          response = await safe_invoke(
              chain.ainvoke,
              {"text": chunk}
          )
        except LLMTokenExpiredError:
        # Token expired — bubble up so FastAPI can handle
          raise HTTPException(status_code=401, detail="LLM token expired")

        text = getattr(response, "content", None) or str(response)

        # Extract JSON block
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            text = match.group(0)

        try:
            mindmap = json.loads(text)
        except Exception as e:
            print("JSON parse error:", e)
            return {"nodes": [], "edges": []}

        final_nodes = []
        final_edges = []
        node_id_map = {}

        # Assign unique IDs to nodes
        for node in mindmap.get("nodes", []):
            old_id = node["id"]
            new_id = f"chunk{chunk_index}_{uuid.uuid4().hex[:8]}"
            node_id_map[old_id] = new_id
            node["id"] = new_id
            final_nodes.append(node)

        # Assign unique IDs to edges and re-map source/target
        for edge in mindmap.get("edges", []):
            edge["id"] = f"edge_{uuid.uuid4().hex[:8]}"
            edge["source"] = node_id_map.get(edge["source"], edge["source"])
            edge["target"] = node_id_map.get(edge["target"], edge["target"])
            final_edges.append(edge)

        return {"nodes": final_nodes, "edges": final_edges}
    
    async def generate_title(self, text: str) -> str:
        """Generate a short descriptive title for the given text."""
        summarizer = get_summarizer_llm()

        chain = TITLE_PROMPT | summarizer
        
        try:
            response = await safe_invoke(chain.ainvoke, {"text": text})
        except LLMTokenExpiredError:
            raise HTTPException(status_code=401, detail="LLM token expired")
        
        title = getattr(response, "content", None) or str(response)
        # Clean title (remove whitespace/newlines)
        return title.strip()

    async def split_text_into_chunks(self, text: str, chunk_size: int = 3000):
        """Split the text into chunks of a specific size."""
        splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size)
        return splitter.split_text(text)
    
    # calling LLM every chunk
    async def process_chunks_and_generate_mindmap(self,chunks: list[str], summarizer, prompt_template: PromptTemplate):
        """
        Summarize text chunks progressively and generate a combined mindmap.
        """
        prev_summary = ""
        chunk_mindmaps = []  # ✅ Collect all chunk-level mindmaps

        # Build summarization chain once
        chain: RunnableSequence = prompt_template | summarizer

        for i, chunk in enumerate(chunks):
            try:
                # ✅ Run summarization with safe_invoke
                result = await safe_invoke(
                    chain.ainvoke,
                    {"previous_summary": prev_summary, "current_chunk": chunk}
                )

                if result is None:
                    logger.warning(f"Summarization returned None for chunk {i}")
                    summarized_text = ""
                else:
                    summarized_text = (
                        result.content if hasattr(result, "content") else str(result)
                    )

                # Generate mindmap for this chunk
                mindmap = await self.generate_chunk_mindmap(
                    summarized_text, chunk_index=i
                )

                # ✅ Collect per-chunk mindmap instead of merging here
                chunk_mindmaps.append(mindmap)

                prev_summary = summarized_text
            except Exception as e:
                logger.error(f"Failed processing chunk: {e}", exc_info=True)
                raise

        # ✅ Merge all collected mindmaps into one final graph
        final_graph = merge_mindmaps(chunk_mindmaps)
        return final_graph


    async def extract_text_from_pdf(file: UploadFile) -> str:
        """
        Extract text from a PDF file.
        """
        pdf_bytes = await file.read()
        return extractor.extract_text_from_pdf(BytesIO(pdf_bytes))