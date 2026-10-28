
"""PDF extraction and page-aware text chunking."""

from dataclasses import dataclass
from io import BytesIO

import fitz


@dataclass
class DocumentChunk:
    text: str
    page: int
    source: str


def extract_pdf_chunks(
    pdf_bytes: bytes,
    source: str,
    chunk_size: int = 180,
    overlap: int = 35,
) -> list[DocumentChunk]:
    """Extract selectable PDF text into overlapping chunks."""

    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive.")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size.")

    chunks = []

    with fitz.open(stream=BytesIO(pdf_bytes), filetype="pdf") as pdf:
        for page_number, page in enumerate(pdf, start=1):
            text = " ".join(page.get_text().split())

            if not text:
                continue

            words = text.split()
            step = chunk_size - overlap

            for start in range(0, len(words), step):
                text_chunk = " ".join(words[start:start + chunk_size])

                if text_chunk:
                    chunks.append(
                        DocumentChunk(
                            text=text_chunk,
                            page=page_number,
                            source=source,
                        )
                    )

                if start + chunk_size >= len(words):
                    break

    return chunks
