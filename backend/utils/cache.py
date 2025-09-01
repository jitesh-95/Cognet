from functools import lru_cache

# App-level in-memory cache for simplicity. Replace with Redis for production.
@lru_cache(maxsize=128)
def cached_fetch_url(url: str):
    # Import inside function to avoid circular imports in tests
    from services.extractor import fetch_url_text
    return fetch_url_text(url)
