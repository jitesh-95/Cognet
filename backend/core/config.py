from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENV: str = "dev"
    PORT: int = 8000
    TIMEOUT_SECS: int = 15

    # Choose one or both keys; we’ll auto-route
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL_SUMMARIZER: str = "gpt-4o-mini"
    OPENAI_MODEL_GRAPH: str = "gpt-4"

    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL_SUMMARIZER: str = "gemini-2.0-flash-lite"
    GEMINI_MODEL_GRAPH: str = "gemini-2.0-flash"

    CHUNK_SIZE: int = 1200
    CHUNK_OVERLAP: int = 120

    CORS_ORIGINS: list[str] = ["http://localhost:3000","http://localhost:3001"]

    class Config:
        env_file = ".env"

settings = Settings()
