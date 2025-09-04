# backend/services/cleaner.py
from readability import Document
from bs4 import BeautifulSoup
import fitz

def extract_main_html(html: str) -> str:
    """
    Extract the main content from HTML.
    Removes navigation, ads, headers/footers.
    """
    doc = Document(html)
    content_html = doc.summary()
    # Optional: strip HTML tags to get plain text
    soup = BeautifulSoup(content_html, "html.parser")
    return soup.get_text(separator="\n", strip=True)

def extract_text_from_pdf(pdf_file) -> str:
    """
    Extracts text from the uploaded PDF file.
    """
    doc = fitz.open(pdf_file)
    text = ""
    for page in doc:
        text += page.get_text("text")  # Extract raw text
    return text