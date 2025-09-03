from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from core.config import settings

# -----------------------------
# Helper function: fresh LLM per call
# -----------------------------
def get_chat_openai(model: str, temperature: float = 0, max_tokens: int = 131000):
    """
    Returns a fresh ChatOpenAI instance for each call.
    """
    return ChatOpenAI(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        openai_api_key=settings.OPENAI_API_KEY
    )

def get_chat_gemini(model: str, temperature: float = 0, max_tokens: int = 131000):
    """
    Returns a fresh Chatgemini instance for each call.
    """
    return ChatGoogleGenerativeAI(
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        google_api_key=settings.GEMINI_API_KEY
    )

# -----------------------------
# Specialized LLM getters
# -----------------------------
def get_summarizer_llm():
    return get_chat_gemini(
        model=settings.GEMINI_MODEL_SUMMARIZER,
        temperature=0.3,
        max_tokens=131000
    )
    # return get_chat_openai(
    #     model=settings.OPENAI_MODEL_SUMMARIZER,
    #     temperature=0.3,
    #     max_tokens=131000
    # )

def get_graph_llm():
    return get_chat_gemini(
        model=settings.GEMINI_MODEL_GRAPH,
        temperature=0,
        max_tokens=131000
    )
    # return get_chat_openai(
    #     model=settings.OPENAI_MODEL_GRAPH,
    #     temperature=0,
    #     max_tokens=131000
    # )
