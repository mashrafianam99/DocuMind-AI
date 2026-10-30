# DocuMind AI

**An AI-powered document assistant that helps you chat with PDFs and find answers with source references.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20DocuMind%20AI-2563eb?style=for-the-badge)](https://docu-mind-ai-navy.vercel.app)

**Live application:** https://docu-mind-ai-navy.vercel.app

DocuMind AI is a document question-answering application created and developed by **[@mashrafianam99](https://github.com/mashrafianam99)**. Upload a PDF, ask questions in natural language, and receive answers grounded in the document, together with relevant source excerpts and page references.

## Features

- Upload and process PDF documents.
- Ask questions about document content in natural language.
- Generate answers grounded in retrieved document passages.
- Display supporting source excerpts and page citations.
- Use semantic vector search to find relevant information.
- Store document metadata and searchable chunks persistently.

## How It Works

1. A user uploads a PDF through the web application.
2. The FastAPI backend extracts text and divides it into searchable chunks.
3. Jina AI generates vector embeddings for the document chunks.
4. Document data and embeddings are stored in Supabase.
5. A submitted question is embedded and used to retrieve relevant chunks.
6. Groq generates an answer based on the retrieved context.
7. The frontend displays the answer with its supporting sources and page references.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | Supabase PostgreSQL |
| Vector search | pgvector |
| Embeddings | Jina AI `jina-embeddings-v3` |
| Answer generation | Groq |
| Frontend hosting | Vercel |
| Backend hosting | Render |

## Architecture

```text
                 User
                  |
                  v
       Next.js Frontend (Vercel)
                  |
                  v
        FastAPI Backend (Render)
           /             \
          v               v
   Jina AI Embeddings   Groq LLM
          |
          v
  Supabase PostgreSQL
       + pgvector
          |
          v
  Retrieved document chunks
          |
          v
  Grounded answers + sources
```

## Repository Structure

```text
DocuMind-AI/
├── backend/        # FastAPI API, PDF processing and retrieval
├── frontend/       # Next.js web application
└── README.md
```

## Run Locally

### Requirements

- Python 3.10+
- Node.js and npm
- A Supabase project with pgvector enabled
- Groq and Jina AI API credentials

### 1. Backend

Open a terminal in the `backend` directory, create and activate a virtual environment, then install dependencies:

```bash
pip install -r requirements.txt
```

Create a local `.env` file with the environment variables required by the backend:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_groq_model
JINA_API_KEY=your_jina_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

Start the API from the backend directory:

```bash
uvicorn app.main:app --reload
```

### 2. Frontend

Open another terminal in the `frontend` directory:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Live Links

- **Web application:** https://docu-mind-ai-navy.vercel.app
- **Backend API:** https://documind-ai-hm2c.onrender.com
- **Backend health check:** https://documind-ai-hm2c.onrender.com/health

## Security

Never commit API keys, passwords, or secret environment files. Keep credentials in local `.env` / `.env.local` files and configure production secrets through the hosting provider's environment settings. Only expose frontend environment variables that are safe to make public.

## Project Status

DocuMind AI is an actively developed project. The deployed application supports PDF upload, document-based question answering, and source/page references.

---

**Created and developed by [@mashrafianam99](https://github.com/mashrafianam99).**
