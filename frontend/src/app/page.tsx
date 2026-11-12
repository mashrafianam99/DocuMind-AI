"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { askDocument, uploadDocument, validatePdf } from "@/lib/api";
import type { DocumentInfo, Message } from "@/lib/types";
import { ChatMessage, ThinkingMessage } from "@/components/ChatMessage";
import { Composer } from "@/components/Composer";
import { EmptyState } from "@/components/EmptyState";
import { EvidencePanel } from "@/components/EvidencePanel";
import { Brand, Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AlertIcon, CloseIcon, PlusIcon } from "@/components/icons";

const SUGGESTIONS = [
  "Summarize this document",
  "What are the key findings?",
  "What methods or approach does it use?",
  "What limitations are mentioned?",
];

const WIDE_SCREEN = "(min-width: 1280px)";

export default function Home() {
  const [document, setDocument] = useState<DocumentInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const scrollEnd = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);

  const nextId = () => `m${++idCounter.current}`;

  const focused = useMemo(
    () => messages.find((m) => m.id === focusedId) ?? null,
    [messages, focusedId]
  );
  const focusedQuestion = useMemo(() => {
    const index = messages.findIndex((m) => m.id === focusedId);
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content;
    }
    return null;
  }, [messages, focusedId]);

  const questionCount = messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    if (messages.length === 0) return;
    scrollEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, asking]);

  async function handleFile(file: File) {
    const problem = validatePdf(file);
    if (problem) {
      setError(problem);
      return;
    }

    setUploading(true);
    setPendingName(file.name);
    setError("");

    try {
      const info = await uploadDocument(file);
      setDocument(info);
      setMessages([
        {
          id: nextId(),
          role: "assistant",
          intro: true,
          content: `I've read “${info.filename}”: ${info.pages} pages, split into ${info.chunks} passages. Ask me anything about it and I'll cite the passages I use.`,
        },
      ]);
      setFocusedId(null);
      setActiveSource(null);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The PDF couldn't be processed.");
    } finally {
      setUploading(false);
      setPendingName(null);
    }
  }

  async function ask(text: string) {
    const questionText = text.trim();
    if (!questionText || !document || asking) return;

    setMessages((prev) => [...prev, { id: nextId(), role: "user", content: questionText }]);
    setQuestion("");
    setAsking(true);
    setError("");

    try {
      const { answer, sources } = await askDocument(document.id, questionText);
      const id = nextId();
      setMessages((prev) => [...prev, { id, role: "assistant", content: answer, sources }]);
      if (sources.length > 0) {
        setFocusedId(id);
        setActiveSource(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The question couldn't be answered.");
    } finally {
      setAsking(false);
    }
  }

  function openEvidence(messageId: string, sourceIndex: number | null) {
    setFocusedId(messageId);
    setActiveSource(sourceIndex);
    if (!window.matchMedia(WIDE_SCREEN).matches) setDrawerOpen(true);
  }

  const pickFile = () => fileInput.current?.click();
  const showEmpty = !document;
  const evidence = (
    <EvidencePanel
      sources={focused?.sources ?? []}
      activeSource={activeSource}
      onSelect={(i) => setActiveSource(i === activeSource ? null : i)}
    />
  );
  const evidenceHeading = (
    <div className="min-w-0">
      <h2 className="font-serif text-xl">Evidence</h2>
      <p className="mt-0.5 truncate text-xs text-ink-muted">
        {focusedQuestion ? `For “${focusedQuestion}”` : "Passages behind the selected answer"}
      </p>
    </div>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-paper text-ink">
      <Sidebar
        document={document}
        questionCount={questionCount}
        busy={uploading}
        onNewDocument={pickFile}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Mobile / tablet header */}
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:hidden">
          <Brand />
          <div className="flex items-center gap-1">
            {document && (
              <button
                type="button"
                onClick={pickFile}
                disabled={uploading}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-ink-soft hover:bg-paper-sunken"
              >
                <PlusIcon width={16} height={16} /> New
              </button>
            )}
            <ThemeToggle />
          </div>
        </header>

        {document && (
          <div className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-8">
            <span className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
              PDF
            </span>
            <p className="min-w-0 truncate font-serif text-lg" title={document.filename}>
              {document.filename}
            </p>
            <span className="ml-auto hidden shrink-0 font-mono text-xs text-ink-muted sm:block">
              {document.pages} pp · {document.chunks} passages
            </span>
          </div>
        )}

        <div className="scroll-thin flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-[720px] flex-col px-4 sm:px-8">
            {showEmpty ? (
              <EmptyState
                uploading={uploading}
                fileName={pendingName}
                onPick={pickFile}
                onDropFile={handleFile}
              />
            ) : (
              <div className="flex flex-1 flex-col gap-8 py-8">
                {messages.map((m) => (
                  <ChatMessage
                    key={m.id}
                    message={m}
                    isFocused={m.id === focusedId}
                    activeSource={activeSource}
                    onCite={(id, i) => openEvidence(id, i)}
                    onShowSources={(id) => openEvidence(id, null)}
                  />
                ))}
                {asking && <ThinkingMessage />}
                {uploading && (
                  <p className="text-sm text-ink-muted" role="status">
                    Reading “{pendingName}”…
                  </p>
                )}
              </div>
            )}
            <div ref={scrollEnd} />
          </div>
        </div>

        <div
          className={`px-4 pb-4 sm:px-8 ${
            document ? "border-t border-line bg-paper/90 pt-3 backdrop-blur" : ""
          }`}
        >
          <div className="mx-auto w-full max-w-[720px]">
            {error && (
              <div
                role="alert"
                className="animate-rise mb-3 flex items-start gap-2.5 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
              >
                <AlertIcon className="mt-0.5 shrink-0" width={16} height={16} />
                <p className="flex-1">{error}</p>
                <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
                  <CloseIcon width={16} height={16} />
                </button>
              </div>
            )}
            {document && (
              <Composer
                value={question}
                onChange={setQuestion}
                onSubmit={() => void ask(question)}
                disabled={uploading}
                busy={asking}
                suggestions={questionCount === 0 && !asking ? SUGGESTIONS : []}
                onSuggestion={(s) => void ask(s)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Evidence column (wide screens) */}
      {document && (
        <aside className="hidden w-[380px] shrink-0 flex-col border-l border-line bg-paper-raised/60 xl:flex">
          <div className="px-5 pb-4 pt-5">{evidenceHeading}</div>
          {evidence}
        </aside>
      )}

      {/* Evidence drawer (narrow screens) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 xl:hidden" role="dialog" aria-modal="true" aria-label="Evidence">
          <button
            type="button"
            aria-label="Close evidence"
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="animate-rise absolute inset-x-0 bottom-0 flex max-h-[80dvh] flex-col rounded-t-2xl border-t border-line bg-paper shadow-paper sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[400px] sm:rounded-none sm:border-l sm:border-t-0">
            <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
              {evidenceHeading}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close evidence"
                className="rounded-lg p-1.5 text-ink-muted hover:bg-paper-sunken hover:text-ink"
              >
                <CloseIcon />
              </button>
            </div>
            {evidence}
          </div>
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) void handleFile(selected);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}
