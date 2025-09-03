from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from urllib.parse import urlparse, urlunparse

router = APIRouter()


class URLRequest(BaseModel):
    url: str


class URLResponse(BaseModel):
    url: str
    is_valid: bool
    is_reachable: bool
    message: str


def normalize_url(url: str) -> str:
    """
    Normalize user input URLs.
    - Add 'http://' if missing
    - Fix common scheme typos like 'http:/abcd.com'
    """
    parsed = urlparse(url)

    # If scheme is missing, add 'http'
    scheme = parsed.scheme if parsed.scheme else "http"

    # Handle cases where user typed only domain
    netloc = parsed.netloc or parsed.path
    path = parsed.path if parsed.netloc else ""

    normalized = urlunparse((scheme, netloc, path, "", "", ""))
    return normalized


def is_valid_url(url: str) -> bool:
    """Check if URL has at least a valid scheme and netloc"""
    parsed = urlparse(url)
    return all([parsed.scheme in ("http", "https"), parsed.netloc])


@router.post("/validate-url", response_model=URLResponse)
async def validate_url(request: URLRequest):
    raw_url = request.url
    url = normalize_url(raw_url)

    # Step 1: Validate format manually
    if not is_valid_url(url):
        raise HTTPException(status_code=400, detail=f"Invalid URL: {raw_url}")

    # Step 2: Check reachability
    is_reachable = False
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            if response.status_code < 400:
                is_reachable = True
    except httpx.RequestError:
        is_reachable = False

    # Step 3: Return clean response
    return {
        "url": url,
        "is_valid": True,
        "is_reachable": is_reachable,
        "message": "URL is valid and reachable" if is_reachable else "URL is valid but not reachable",
    }
