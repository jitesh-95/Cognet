from services.llms import get_openai_model
from typing import List
import logging

logger = logging.getLogger(__name__)

def summarize_chunk(llm, chunk_text: str) -> str:
    """
    One-call summarizer wrapper. Depending on langchain version:
      - use llm.predict(prompt)
      - or llm.invoke(prompt)
      - or llm.generate([...])
    Adjust the call if you get AttributeError.
    """
    prompt = (
        "Summarize the following text into 3 concise bullet points (each on a new line):\n\n"
        f"{chunk_text}\n\nBullets:"
    )
    # attempt multiple common APIs
    if hasattr(llm, "invoke"):
        resp = llm.invoke(prompt)
        # resp may be a simple object, check attribute
        return getattr(resp, "content", str(resp))
    if hasattr(llm, "predict"):
        return llm.predict(prompt)
    if hasattr(llm, "generate"):
        # generate sometimes returns complex object -> extract text
        gen = llm.generate([prompt])
        try:
            return gen.generations[0][0].text
        except Exception:
            return str(gen)
    raise RuntimeError("LLM object has no known invoke/predict/generate method")

def summarize_chunks(chunks: List[str], use_openai: bool = True) -> List[str]:
    llm = get_openai_model() if use_openai else get_openai_model()  # swap for gemini later
    results = []
    for c in chunks:
        try:
            s = summarize_chunk(llm, c)
            results.append(s)
        except Exception as e:
            logger.exception("Summarization failed for chunk")
            results.append("")  # fallback
    return results
