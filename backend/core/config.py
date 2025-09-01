from pydantic import BaseSettings

class Settings(BaseSettings):
    # put your keys in .env
    OPENAI_API_KEY: str | None = None
    GOOGLE_API_KEY: str | None = None
    VECTOR_DB: str = "faiss"  # faiss | pinecone | etc
    FAISS_DIR: str = "./.faiss"
    REDIS_URL: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
