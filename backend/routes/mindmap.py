from fastapi import APIRouter, HTTPException
from services.llm import get_summarizer_llm  # import summarizer
from schemas.mindmap import MindmapRequest
from services import fetcher, extractor, mindmap_generator
from utils.cache import cache

router = APIRouter()

mindmap_gen = mindmap_generator.MindmapGenerator()

@router.post("/generate-mindmap-by-url")
async def generate_mindmap(request: MindmapRequest):
    """
    Main endpoint to generate mindmap from a URL.
    Includes:
        - Cache check
        - Fetch + extract main content
        - Summarization
        - Chunking
        - Mindmap generation (nodes + edges)
        - Caching
    """
    try:
        url = request.url.strip()
        # 1️⃣ Check cache first
        cached = cache.get_cache(url)
        if cached:
            return {"source": url, "graph": cached["graph"], "cached": True}

        # 2️⃣ Fetch HTML
        html = await fetcher.fetch_url(url)

        # 3️⃣ Extract main content (remove ads/headers)
        text = extractor.extract_main_html(html)

        # 5️⃣ Generate mindmap
        graph = await mindmap_gen.generate_mindmap(text)

        # 6️⃣ Cache and return
        cache.set_cache(url, {"graph": graph, "text": text})

        return {
            "source": url,
            "graph": graph,
            "cached": False
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
