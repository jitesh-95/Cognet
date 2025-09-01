from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Node(BaseModel):
    id: str
    label: str
    type: str  # root|section|concept|ai_suggestion
    content: str
    parent: Optional[str] = None
    children: List[str] = []
    metadata: Dict[str, Any] = {}

class Edge(BaseModel):
    id: str
    source: str
    target: str
    relation: str
    metadata: Dict[str, Any] = {}

class Chunk(BaseModel):
    chunkId: str
    text: str
    summary: Optional[str] = None

class SourceModel(BaseModel):
    type: str  # url | document | query
    value: str
    metadata: Optional[Dict[str, Any]] = {}

class MindmapRequest(BaseModel):
    source: SourceModel
    options: Optional[Dict[str, Any]] = {}

class MindmapResponse(BaseModel):
    mapId: str
    title: str
    source: SourceModel
    nodes: List[Node] = []
    edges: List[Edge] = []
    chunks: List[Chunk] = []
    export: Optional[Dict[str, Any]] = {}
