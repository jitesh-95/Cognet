from fastapi import APIRouter, HTTPException
from schemas.mindmap import MindmapRequest, MindmapResponse
from services.workflows.mindmap_graph import run_mindmap_flow
import logging

router = APIRouter(prefix="/mindmap", tags=["Mindmap"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=MindmapResponse)
def generate_mindmap(req: MindmapRequest):
    """
    Orchestrator endpoint: accepts { source: { type, value } } and returns a MindmapResponse
    """
    try:
        result = run_mindmap_flow(req)
        return result
    except Exception as e:
        logger.exception("Error generating mindmap")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/echo")
def echo_mindmap(req: MindmapRequest):
    # Simple echo for frontend testing
    return {
        "mapId": "echo-1",
        "title": "Echo Mindmap",
        "source": req.source,
        "nodes": [],
        "edges": [],
        "chunks": []
    }
