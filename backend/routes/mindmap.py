from fastapi import File, UploadFile, APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from services.llm import get_summarizer_llm
from schemas.mindmap import MindmapRequest
from services import fetcher, extractor, mindmap_generator
from utils.cache import cache
from io import BytesIO
from langchain.prompts import PromptTemplate
import tempfile, os, json, logging

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

# allowed types mapping
ALLOWED_FILE_TYPES = {
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
    "text/markdown": "md",
    "text/html": "html",
}

async def extract_text_from_file(file: UploadFile):
    """Extract text based on file type."""
    content_type = file.content_type
    if content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Allowed types: {', '.join(ALLOWED_FILE_TYPES.keys())}"
        )

    file_bytes = BytesIO(await file.read())

    if content_type == "application/pdf":
        return extractor.extract_text_from_pdf(file_bytes)
    elif content_type in ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        return extractor.extract_text_from_doc(file_bytes)
    elif content_type in ["text/plain", "text/markdown"]:
        return (await file.read()).decode("utf-8") if hasattr(file, "read") else file_bytes.getvalue().decode("utf-8")
    elif content_type == "text/html":
        html_content = file_bytes.getvalue().decode("utf-8")
        return extractor.extract_main_html(html_content)
    else:
        return ""
    

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
        final_graph = await mindmap_gen.process_chunks_and_generate_mindmap(chunks, summarizer, SUMMARY_PROMPT)

        # 8️⃣ Cache result
        cache.set_cache(url, {"graph": final_graph, "text": text,"title": title})

        return {"source": url, "graph": final_graph,"title": title, "cached": False}

    except Exception as e:
        logger.error(f"Error generating mindmap from URL: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Streaming response of every step
@router.get("/generate-mindmap-by-url-sse")
async def generate_mindmap_sse(url:str):
    """
    SSE endpoint to generate mindmap and stream step updates.
    """

    async def sse_wrapper_generate_mindmap(url: str):
        """SSE generator yielding step updates."""
        try:
            # Step 1: Cache lookup
            yield f"data: Checking cache for URL...\n\n"
            cached = cache.get_cache(url)
            if cached:
                yield f"data: Cache hit! Returning cached mindmap.\n\n"
                yield f"data: {json.dumps({'graph': cached['graph'], 'title': cached.get('title')})}\n\n"
                return

            # Step 2: Fetch content
            yield f"data: Fetching webpage content...\n\n"
            html = await fetcher.fetch_url(url)

            # Step 3: Extract main content
            yield f"data: Extracting main content from HTML...\n\n"
            text = extractor.extract_main_html(html)

            # Step 4: Generate title
            yield f"data: Generating title for the document...\n\n"
            title = await mindmap_gen.generate_title(text)

            # Step 5: Split text into chunks
            yield f"data: Splitting text into chunks...\n\n"
            chunks = await mindmap_gen.split_text_into_chunks(text, chunk_size=3000)

            # Step 6: Summarizer
            summarizer = get_summarizer_llm()

            # Step 7: Process & generate mindmap (only one update for all chunks)
            yield f"data: Generating mindmap data...\n\n"
            final_graph = await mindmap_gen.process_chunks_and_generate_mindmap(
                chunks, summarizer, SUMMARY_PROMPT
            )

            # Step 8: Cache result
            yield f"data: Caching generated mindmap...\n\n"
            cache.set_cache(url, {"graph": final_graph, "text": text, "title": title})

            # Step 9: Done
            yield f"data: Done\n\n"
            yield f"data: {json.dumps({'graph': final_graph, 'title': title})}\n\n"

        except Exception as e:
            logger.error(f"Error in SSE wrapper: {e}", exc_info=True)
            yield f"data: Error generating mindmap: {str(e)}\n\n"

    return StreamingResponse(
        sse_wrapper_generate_mindmap(url),
        media_type="text/event-stream"
    )

# -------------------------
# Normal POST endpoint
# -------------------------
@router.post("/generate-mindmap-by-file")
async def generate_mindmap_from_file(file: UploadFile = File(...)):
    try:
        # 1️⃣ Extract text based on type
        text = await extract_text_from_file(file)

        # 2️⃣ Generate title
        title = await mindmap_gen.generate_title(text)

        # 3️⃣ Split into chunks
        chunks = await mindmap_gen.split_text_into_chunks(text, chunk_size=3000)

        # 4️⃣ Summarizer
        summarizer = get_summarizer_llm()

        # 5️⃣ Process and generate mindmap
        final_graph = await mindmap_gen.process_chunks_and_generate_mindmap(chunks, summarizer, SUMMARY_PROMPT)

        return {"source": file.filename, "graph": final_graph, "title": title}

    except Exception as e:
        logger.error(f"Error generating mindmap from file: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    

# -----------------------------
#  Upload file temporarily
# -----------------------------
@router.post("/upload-temp-file")
async def upload_file_temp(file: UploadFile):
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed types: {', '.join(ALLOWED_FILE_TYPES.keys())}"
        )

    try:
        suffix = "." + ALLOWED_FILE_TYPES[file.content_type]
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        temp_file.write(await file.read())
        temp_file.close()

        token = os.path.basename(temp_file.name)
        return {"token": token}

    except Exception as e:
        logger.error(f"Error uploading file: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to upload file")
    

# -----------------------------
# 2️⃣ SSE endpoint to generate mindmap from uploaded file
# -----------------------------
@router.get("/generate-mindmap-by-file-sse")
async def generate_mindmap_file_sse(token: str, background_tasks: BackgroundTasks):
    """
    SSE endpoint to process a file and stream step updates.
    Token corresponds to the temporary file.
    """

    file_path = os.path.join(tempfile.gettempdir(), token)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found or expired")

    async def sse_stream():
        try:
            yield f"data: Validating file...\n\n"

            # Detect file type by extension
            ext = os.path.splitext(file_path)[1].lower()
            if ext not in [".pdf", ".txt", ".doc", ".docx"]:
                yield f"data: Error: Unsupported file type {ext}\n\n"
                return

            # Extract text
            yield f"data: Extracting text from file...\n\n"
            if ext == ".pdf":
                text = extractor.extract_text_from_pdf(open(file_path, "rb"))
            elif ext in [".doc", ".docx"]:
                text = extractor.extract_text_from_doc(open(file_path, "rb"))
            else:
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()

            # Generate title
            yield f"data: Generating document title...\n\n"
            title = await mindmap_gen.generate_title(text)

            # Split into chunks
            yield f"data: Splitting text into chunks...\n\n"
            chunks = await mindmap_gen.split_text_into_chunks(text, chunk_size=3000)

            # Summarizer
            summarizer = get_summarizer_llm()

            # Process chunks and generate mindmap (single step update)
            yield f"data: Generating mindmap data...\n\n"
            final_graph = await mindmap_gen.process_chunks_and_generate_mindmap(chunks, summarizer, SUMMARY_PROMPT)

            # Done
            yield f"data: Mindmap generation complete!\n\n"
            yield f"data: {json.dumps({'graph': final_graph, 'title': title})}\n\n"

        except Exception as e:
            logger.error(f"Error generating mindmap from file: {e}", exc_info=True)
            yield f"data: Error: {str(e)}\n\n"

        finally:
            # Cleanup temp file
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"Failed to delete temp file {file_path}: {e}")

    return StreamingResponse(sse_stream(), media_type="text/event-stream")