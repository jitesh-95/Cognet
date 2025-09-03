# backend/mindmap_generator.py
from langchain_text_splitters import RecursiveCharacterTextSplitter
from services.llm import get_graph_llm
import asyncio
import json
import re
import uuid

# Prompt template to generate nodes and edges
PROMPT_TEMPLATE = """
You are a mindmap generator. Based on the following text, create a JSON mindmap with "nodes" and "edges".

Requirements:
- Each node must include:
  - id (unique)
  - type ("root" if it represents the central/main idea, "sub" if it's a direct child of root, or "detail" for lower-level nodes)
  - data: {{
      "label": "Heading of the node",
      "content": "One-line description of the node"
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
- `content` should always be a one-line summary of the node label based on the text.
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

class MindmapGenerator:
    def __init__(self):
        self.llm = get_graph_llm()

    async def generate_chunk_mindmap(self, chunk: str) -> dict:
        """Generate mindmap JSON for a single text chunk."""
        response = await self.llm.ainvoke(PROMPT_TEMPLATE.format(text=chunk))
        text = getattr(response, "content", None) or str(response)

        # Extract JSON block from LLM response
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            text = match.group(0)

        try:
            mindmap = json.loads(text)
            return mindmap
        except Exception as e:
            print("JSON parse error:", e)
            return {"nodes": [], "edges": []}

    async def generate_mindmap(self, text: str) -> dict:
        """Generate a full mindmap from text, handling chunking and merging."""
        # 1️⃣ Split text into manageable chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=3000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        chunks = splitter.split_text(text)

        # 2️⃣ Generate mindmaps per chunk in parallel
        chunk_maps = await asyncio.gather(
            *[self.generate_chunk_mindmap(c) for c in chunks]
        )

        final_nodes = []
        final_edges = []

        # 3️⃣ Merge nodes and edges with unique IDs
        for i, cm in enumerate(chunk_maps):
            node_id_map = {}
            # Rename nodes uniquely
            for node in cm.get("nodes", []):
                old_id = node["id"]
                new_id = f"chunk{i}_{old_id}_{uuid.uuid4().hex[:6]}"
                node_id_map[old_id] = new_id
                node["id"] = new_id

            # Rename edges and update source/target
            for edge in cm.get("edges", []):
                edge["id"] = f"edge_{uuid.uuid4().hex[:8]}"
                edge["source"] = node_id_map.get(edge["source"], edge["source"])
                edge["target"] = node_id_map.get(edge["target"], edge["target"])

            final_nodes.extend(cm.get("nodes", []))
            final_edges.extend(cm.get("edges", []))

        return {"nodes": final_nodes, "edges": final_edges}
