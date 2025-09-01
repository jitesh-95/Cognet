from core.config import settings
# NOTE: The exact wrapper names/constructors vary by langchain version.
# the following are example imports; if your langchain version exposes different names,
# adjust accordingly.
try:
    from langchain_openai import ChatOpenAI
except Exception:
    ChatOpenAI = None

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except Exception:
    ChatGoogleGenerativeAI = None

def get_openai_model(model: str = "gpt-4o-mini", temperature: float = 0.0):
    if ChatOpenAI is None:
        raise RuntimeError("langchain-openai not available; install and import correctly")
    # Some LangChain versions accept api_key, some read env; adjust if needed
    return ChatOpenAI(model=model, temperature=temperature, api_key=settings.OPENAI_API_KEY)

def get_gemini_model(model: str = "gemini-2.0-flash-lite", temperature: float = 0.0):
    if ChatGoogleGenerativeAI is None:
        raise RuntimeError("langchain-google-genai not available; install and import correctly")
    return ChatGoogleGenerativeAI(model=model, temperature=temperature, api_key=settings.GOOGLE_API_KEY)
