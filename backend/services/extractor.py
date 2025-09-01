import httpx
from bs4 import BeautifulSoup
from pypdf import PdfReader
from typing import Optional
import io

def fetch_url_text(url: str) -> str:
    """
    Simple fetch + extract text (paragraphs). Not perfect, but works for many articles.
    """
    r = httpx.get(url, timeout=20.0)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    # naive: join <p> tags
    paragraphs = [p.get_text(strip=True) for p in soup.find_all("p")]
    return "\n\n".join([p for p in paragraphs if p])

def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    for p in reader.pages:
        pages.append(p.extract_text() or "")
    return "\n\n".join(pages)
