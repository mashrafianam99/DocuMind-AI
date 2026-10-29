
from app.database import get_supabase
from app.main import encode_texts, vector_literal


BATCH_SIZE = 16


def main():
    db = get_supabase()

    result = (
        db.table("document_chunks")
        .select("id,content")
        .order("id")
        .execute()
    )
    chunks = result.data or []

    if not chunks:
        print("No document chunks found.")
        return

    print(f"Found {len(chunks)} chunks to migrate.")

    for start in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[start:start + BATCH_SIZE]

        vectors = encode_texts(
            [chunk["content"] for chunk in batch],
            task="retrieval.passage",
        )

        for chunk, vector in zip(batch, vectors):
            (
                db.table("document_chunks")
                .update({"embedding_jina": vector_literal(vector)})
                .eq("id", chunk["id"])
                .execute()
            )

        completed = min(start + len(batch), len(chunks))
        print(f"Updated {completed}/{len(chunks)} chunks.")

    print("Migration completed. Original embeddings are preserved.")


if __name__ == "__main__":
    main()
