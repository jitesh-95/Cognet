def chunk_text_by_size(text: str, max_chars: int = 3000):
    """
    Very simple chunker by approximate characters. Replace with token-aware chunker later.
    """
    if not text:
        return []
    sentences = text.split(". ")
    chunks = []
    current = ""
    for s in sentences:
        part = s.strip()
        if not part:
            continue
        add = (part + (". " if not part.endswith(".") else " "))
        if len(current) + len(add) > max_chars:
            chunks.append(current.strip())
            current = add
        else:
            current += add
    if current.strip():
        chunks.append(current.strip())
    return chunks
