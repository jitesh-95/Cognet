from fastapi import File, UploadFile, APIRouter, HTTPException
from services.llm import get_summarizer_llm
from schemas.mindmap import MindmapRequest
from services import fetcher, extractor, mindmap_generator
from utils.cache import cache
from io import BytesIO
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableSequence
from utils.llm_handler import LLMTokenExpiredError, safe_invoke
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

mindmap_gen = mindmap_generator.MindmapGenerator()

# ✅ PromptTemplate for summarization
SUMMARY_PROMPT = PromptTemplate(
    input_variables=["previous_summary", "current_chunk"],
    template=(
        "Summarize the following text, combining with the previous summary:\n\n"
        "Previous Summary: {previous_summary}\n\n"
        "Current Chunk: {current_chunk}\n\n"
        "Summary:"
    ),
)

# calling LLM every chunk
async def process_chunks_and_generate_mindmap(chunks: list[str], summarizer, prompt_template: PromptTemplate):
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
            mindmap = await mindmap_gen.generate_chunk_mindmap(
                summarized_text, chunk_index=i
            )

            # ✅ Collect per-chunk mindmap instead of merging here
            chunk_mindmaps.append(mindmap)

            prev_summary = summarized_text
        except Exception as e:
            logger.error(f"Failed processing chunk: {e}", exc_info=True)
            raise

    # ✅ Merge all collected mindmaps into one final graph
    final_graph = mindmap_generator.merge_mindmaps(chunk_mindmaps)
    return final_graph


async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extract text from a PDF file.
    """
    pdf_bytes = await file.read()
    return extractor.extract_text_from_pdf(BytesIO(pdf_bytes))


@router.post("/generate-mindmap-by-url")
async def generate_mindmap_from_url(request: MindmapRequest):
    """
    Generate a mindmap from a webpage URL.
    """
    try:
        url = request.url.strip()

        # 1️⃣ Cache lookup
        cached = cache.get_cache(url)
        if cached:
            return {"source": url, "graph": cached["graph"],"title": cached.get("title", None), "cached": True}

        # 2️⃣ Fetch HTML
        html = await fetcher.fetch_url(url)

        # 3️⃣ Extract main content
        text = extractor.extract_main_html(html)

        # 4️⃣ Generate title from text
        title = await mindmap_gen.generate_title(text)

        # 5️⃣ Split into chunks
        chunks = await mindmap_gen.split_text_into_chunks(text, chunk_size=3000)

        # 6️⃣ Summarizer
        summarizer = get_summarizer_llm()

        # 7️⃣ Process and generate mindmap
        final_graph = await process_chunks_and_generate_mindmap(chunks, summarizer, SUMMARY_PROMPT)

        # 8️⃣ Cache result
        cache.set_cache(url, {"graph": final_graph, "text": text,"title": title})

        return {"source": url, "graph": final_graph,"title": title, "cached": False}

    except Exception as e:
        logger.error(f"Error generating mindmap from URL: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-mindmap-by-file")
async def generate_mindmap_from_file(file: UploadFile = File(...)):
    """
    Generate a mindmap from a PDF or TXT file.
    Only files with .pdf or .txt extensions are allowed.
    """
    try:
        # 1️⃣ Validate file type
        allowed_types = ["application/pdf", "text/plain"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file.content_type}. Only PDF and TXT are allowed."
            )
        # 2️⃣ Extract text based on type
        if file.content_type == "application/pdf":
            text = await extractor.extract_text_from_pdf(BytesIO(await file.read()))
        elif file.content_type == "text/plain":
            text = (await file.read()).decode("utf-8")
       
        # 3️⃣ Generate title of document
        title = await mindmap_gen.generate_title(text)

        # 4️⃣ Split into chunks
        chunks = await mindmap_gen.split_text_into_chunks(text, chunk_size=3000)

        # 5️⃣ Summarizer
        summarizer = get_summarizer_llm()

        # 6️⃣ Process and generate mindmap
        final_graph = await process_chunks_and_generate_mindmap(chunks, summarizer, SUMMARY_PROMPT)

        return {"source": file.filename, "graph": final_graph, "title": title}

    except Exception as e:
        logger.error(f"Error generating mindmap from file: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

