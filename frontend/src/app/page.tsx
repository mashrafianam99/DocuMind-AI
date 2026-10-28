
"use client";

import { useRef, useState } from "react";

type Source = {
  source: string;
  page: number;
  similarity: number;
  text: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

type DocumentInfo = {
  id: string;
  filename: string;
  pages: number;
  chunks: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [document, setDocument] = useState<DocumentInfo | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function uploadPDF(selectedFile?: File) {
    const pdf = selectedFile || file;
    if (!pdf) {
      setError("Choose a PDF file first.");
      return;
    }

    if (!pdf.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }

    if (pdf.size > 10 * 1024 * 1024) {
      setError("The maximum PDF size is 10 MB.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", pdf);

    try {
      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "PDF upload failed.");
      }

      setDocument({
        id: data.document_id,
        filename: data.filename,
        pages: data.pages,
        chunks: data.chunks,
      });

      setMessages([
        {
          role: "assistant",
          content: `I've processed "${data.filename}" and indexed ${data.chunks} text passages across ${data.pages} pages. Ask me anything about this document, and I'll find relevant evidence for my answers.`,
        },
      ]);

      setFile(pdf);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend."
      );
    } finally {
      setUploading(false);
    }
  }

  async function askQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const questionText = question.trim();
    if (!questionText || !document || asking) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: questionText },
    ]);
    setQuestion("");
    setAsking(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: document.id,
          question: questionText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not answer the question.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend."
      );
    } finally {
      setAsking(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-[#090b10] text-slate-100">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-[#0d1017] p-5 md:flex">
        <a href="/" className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold shadow-lg shadow-violet-900/30">
            D
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              DocuMind<span className="text-violet-400"> AI</span>
            </h1>
            <p className="text-xs text-slate-500">Your document intelligence</p>
          </div>
        </a>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        <button
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-3 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-left text-sm text-violet-200 transition hover:bg-violet-500/20"
        >
          <span className="text-xl">＋</span>
          Upload a document
        </button>

        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Current document
          </p>

          {document ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-rose-500/10 p-2 text-rose-300">
                  PDF
                </div>
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium">
                    {document.filename}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {document.pages} pages · {document.chunks} passages
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Indexed in Supabase
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-6 text-slate-500">
              Your uploaded document will appear here.
            </p>
          )}
        </div>

        <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <span className="text-violet-400">✦</span>
            Powered by AI
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Groq inference, semantic retrieval, and Supabase vector storage.
          </p>
        </div>
      </aside>

      <section className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
          <div>
            <p className="text-sm text-slate-400">Document workspace</p>
            <h2 className="mt-1 text-lg font-semibold">
              Chat with your documents
            </h2>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs text-emerald-300">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
            AI workspace
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-8">
          {!document && messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-3xl text-violet-300">
                ✦
              </div>
              <p className="mb-3 text-sm font-medium text-violet-300">
                YOUR PERSONAL RESEARCH ASSISTANT
              </p>
              <h3 className="max-w-xl text-center text-3xl font-semibold tracking-tight sm:text-5xl">
                Your documents.
                <br />
                <span className="text-slate-500">Understood.</span>
              </h3>
              <p className="mt-5 max-w-lg text-center text-sm leading-7 text-slate-400 sm:text-base">
                Upload a PDF, ask questions in natural language, and explore
                answers grounded in your document&apos;s content.
              </p>

              <button
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="mt-8 flex items-center gap-3 rounded-xl bg-violet-600 px-6 py-3.5 font-medium shadow-lg shadow-violet-900/30 transition hover:bg-violet-500 disabled:opacity-50"
              >
                {uploading ? "Processing document..." : "↑  Upload your first PDF"}
              </button>

              <div className="mt-4 text-xs text-slate-500">
                PDF files · Maximum 10 MB
              </div>

              <div className="mt-12 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  ["01", "Upload", "Add a research paper or report"],
                  ["02", "Ask", "Explore the document's content"],
                  ["03", "Discover", "Review evidence and page citations"],
                ].map(([number, title, description]) => (
                  <div
                    key={number}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                  >
                    <p className="text-xs text-violet-400">{number}</p>
                    <p className="mt-3 font-medium">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-6 py-8">
              {messages.map((message, index) => (
                <article
                  key={`${index}-${message.role}`}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 font-semibold text-violet-300">
                      D
                    </div>
                  )}

                  <div
                    className={`min-w-0 max-w-[88%] rounded-2xl p-4 sm:max-w-[80%] ${
                      message.role === "user"
                        ? "bg-violet-600 text-white"
                        : "border border-white/[0.08] bg-white/[0.03]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-7">
                      {message.content}
                    </p>

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-5 border-t border-white/10 pt-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Sources · {message.sources.length} passages
                        </p>
                        <div className="space-y-3">
                          {message.sources.map((source, sourceIndex) => (
                            <div
                              key={`${source.page}-${sourceIndex}`}
                              className="rounded-xl border border-white/[0.08] bg-black/20 p-3"
                            >
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-violet-500/15 px-2 py-1 text-xs text-violet-300">
                                  Page {source.page}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {source.source}
                                </span>
                              </div>
                              <p className="text-xs leading-6 text-slate-400">
                                {source.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {asking && (
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                  Searching your document and generating an answer...
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-300"
            >
              {error}
            </div>
          )}

          <form onSubmit={askQuestion} className="sticky bottom-0 pb-5 pt-3">
            <div className="rounded-2xl border border-white/10 bg-[#11141d] p-2 shadow-2xl shadow-black/20 focus-within:border-violet-400/40">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                disabled={!document || asking}
                placeholder={
                  document
                    ? "Ask a question about your document..."
                    : "Upload a PDF to start asking questions..."
                }
                rows={2}
                className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
              />
              <div className="flex items-center justify-between gap-3 px-2 pb-1">
                <div className="text-xs text-slate-500">
                  {document ? "Answers grounded in your PDF" : "PDF upload required"}
                </div>
                <button
                  type="submit"
                  disabled={!document || !question.trim() || asking}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {asking ? "Thinking..." : "Ask  ↑"}
                </button>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-600">
              AI-generated answers can be incorrect. Verify important claims
              against the original document.
            </p>
          </form>
        </div>
      </section>

      <input
        ref={fileInput}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) {
            setFile(selected);
            void uploadPDF(selected);
          }
          e.currentTarget.value = "";
        }}
      />
    </main>
  );
}
