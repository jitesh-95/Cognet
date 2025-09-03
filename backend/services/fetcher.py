# backend/app/services/fetcher.py
import httpx

async def fetch_url(url: str) -> str:
    async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.text
