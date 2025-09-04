# backend/mindmap_generator.py
from fastapi import HTTPException
from langchain_text_splitters import RecursiveCharacterTextSplitter
from services.llm import get_graph_llm, get_summarizer_llm
from langchain.prompts import PromptTemplate
from utils.llm_handler import LLMTokenExpiredError, safe_invoke
import json
import re
import uuid

# ✅ PromptTemplate for graph generation
GRAPH_PROMPT = PromptTemplate(
    input_variables=["text"],
    template="""
You are a mindmap generator. Based on the following text, create a JSON mindmap with "nodes" and "edges".

Requirements:
- Each node must include:
  - id (unique)
  - type ("root" if it represents the central/main idea, "sub" if it's a direct child of root, or "detail" for lower-level nodes)
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
- Use type "root" for the main central concept, "sub" for first-level children of root, and "detail" for deeper levels.
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
