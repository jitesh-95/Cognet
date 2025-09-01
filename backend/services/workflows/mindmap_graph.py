from schemas.mindmap import MindmapRequest
from utils.chunking import chunk_text_by_size
from services.summarizer import summarize_chunks
from services.graph_builder import build_graph_from_summaries
from utils.cache import cached_fetch_url
# from services.extractor import extract_text_from_pdf_bytes
# from typing import List
import logging

logger = logging.getLogger(__name__)

def run_mindmap_flow(req: MindmapRequest):
    source = req.source
    content_text = ""
    if source.type == "url":
        # use cached fetch that wraps fetch_url_text
        content_text = cached_fetch_url(source.value)
    elif source.type == "document":
        # for now expect source.value to contain raw text or a base64 file path.
        content_text = source.value
    elif source.type == "query":
        content_text = source.value
    else:
        content_text = source.value

    # chunk
    chunks = chunk_text_by_size(content_text, max_chars=3000)
    # summarize each chunk (LLM placeholder)
    summaries = summarize_chunks(chunks, use_openai=True)  # toggle model in LLM wrappers
    # build graph
    response = build_graph_from_summaries(summaries, source=source)
    return response
