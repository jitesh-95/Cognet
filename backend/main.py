# run server -> uvicorn main:app --reload --port 8000

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI(title="Mindmap Backend", version="0.1.0")

# Define Node and Edge models
class Node(BaseModel):
    id: str
    label: str
    type: str
    content: str
    parent: str | None = None
    children: List[str] = []
    metadata: Dict = {}

class Edge(BaseModel):
    id: str
    source: str
    target: str
    relation: str
    metadata: Dict = {}

class MindmapData(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

@app.post("/mindmap")
def receive_mindmap(data: MindmapData):
    # For now, just echo back what frontend sent
    return {
        "message": "Mindmap received successfully ✅",
        "nodes": data.nodes,
        "edges": data.edges
    }

@app.get("/")
def root():
    return {"message": "Backend is running 🚀"}
