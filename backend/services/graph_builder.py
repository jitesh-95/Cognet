import uuid
from typing import List
from schemas.mindmap import Node, Edge, Chunk, MindmapResponse, SourceModel

def build_graph_from_summaries(summaries: List[str], source: SourceModel) -> MindmapResponse:
    """
    Basic graph builder: create one node per summary and connect to root.
    Replace with more advanced connector agent later.
    """
    nodes = []
    edges = []
    chunks = []

    root_id = "node_root"
    nodes.append(Node(
        id=root_id,
        label=source.value if source.value else "Root",
        type="root",
        content="Root node representing source",
        parent=None,
        children=[],
        metadata={"sourceType": source.type}
    ))

    for i, s in enumerate(summaries):
        nid = f"node_{i+1}"
        nodes.append(Node(
            id=nid,
            label=(s.splitlines()[0][:60] if s else f"Summary {i+1}"),
            type="ai_suggestion",
            content=s or "",
            parent=root_id,
            children=[],
            metadata={"confidence": 0.9}
        ))
        edges.append(Edge(
            id=str(uuid.uuid4()),
            source=root_id,
            target=nid,
            relation="supports",
            metadata={"createdBy": "graph_builder"}
        ))
        chunks.append(Chunk(chunkId=f"chunk_{i+1}", text="", summary=s or ""))

    response = MindmapResponse(
        mapId=str(uuid.uuid4()),
        title=f"Mindmap for {source.value}",
        source=source,
        nodes=nodes,
        edges=edges,
        chunks=chunks,
        export={"formats": ["json"], "lastExportedAt": None}
    )
    return response
