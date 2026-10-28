
"""Semantic search over extracted document chunks."""

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from app.document_processor import DocumentChunk


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


class SemanticRetriever:
    def __init__(self, chunks: list[DocumentChunk]):
        if not chunks:
            raise ValueError("Cannot index an empty document.")

        self.chunks = chunks
        self.model = SentenceTransformer(MODEL_NAME)

        texts = [chunk.text for chunk in chunks]

        self.embeddings = self.model.encode(
            texts,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )

    def search(
        self,
        question: str,
        top_k: int = 4,
    ) -> list[tuple[DocumentChunk, float]]:
        if not question.strip():
            return []

        if top_k < 1:
            raise ValueError("top_k must be at least 1.")

        query_embedding = self.model.encode(
            [question],
            normalize_embeddings=True,
            convert_to_numpy=True,
        )

        scores = cosine_similarity(
            query_embedding,
            self.embeddings,
        )[0]

        indices = np.argsort(scores)[::-1][:top_k]

        return [
            (self.chunks[int(index)], float(scores[index]))
            for index in indices
        ]
