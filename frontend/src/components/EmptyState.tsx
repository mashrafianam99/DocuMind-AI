"use client";

import { useEffect, useState, type DragEvent } from "react";
import { UploadIcon } from "./icons";

type EmptyStateProps = {
  uploading: boolean;
  fileName: string | null;
  onPick: () => void;
  onDropFile: (file: File) => void;
};

const STAGES = [
  "Reading pages",
  "Splitting into passages",
  "Embedding passages",
  "Saving to the index",
];
const STAGE_INTERVAL_MS = 2200;

const STEPS = [
  { n: "1", title: "Drop in a PDF", body: "Papers, reports, contracts, manuals. Up to 10 MB." },
  { n: "2", title: "Ask in plain words", body: "Questions, summaries, comparisons, definitions." },
  { n: "3", title: "Check the evidence", body: "Every citation opens the exact passage and page." },
];

function UploadProgress({ fileName }: { fileName: string | null }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      STAGE_INTERVAL_MS
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center py-4" role="status" aria-live="polite">
      <div className="relative h-36 w-28 overflow-hidden rounded-lg border border-line-strong bg-paper-raised shadow-paper">
        <div className="space-y-2 p-4">
          {[100, 85, 92, 60, 88, 75, 95, 50].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-line" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="animate-scan absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-highlight/70 to-transparent" />
      </div>
      <p className="mt-6 max-w-xs truncate text-sm font-medium text-ink">
        {fileName ?? "Your document"}
      </p>
      <p className="mt-1 text-sm text-ink-muted">{STAGES[stage]}…</p>
      <div className="mt-4 flex gap-1.5" aria-hidden>
        {STAGES.map((_, i) => (
          <span
            key={i}
            className={`h-1 w-6 rounded-full transition-colors duration-500 ${
              i <= stage ? "bg-accent" : "bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ uploading, fileName, onPick, onDropFile }: EmptyStateProps) {
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && !uploading) onDropFile(dropped);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-1 py-10 sm:py-14">
      <p className="animate-rise text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
        Document Q&amp;A, with receipts
      </p>
      <h1 className="animate-rise mt-4 max-w-2xl text-balance text-center font-serif text-[2.6rem] font-normal leading-[1.05] tracking-tight text-ink sm:text-6xl">
        Read less. <span className="marker italic">Understand</span> more.
      </h1>
      <p className="animate-rise mt-5 max-w-md text-center text-[15px] leading-7 text-ink-soft">
        Upload a PDF and ask anything. DocuMind answers from the document
        itself and shows you the exact passages it relied on.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`animate-rise mt-10 w-full max-w-xl rounded-2xl border-2 border-dashed p-2 transition ${
          dragging ? "border-accent bg-accent-soft/60" : "border-line-strong"
        }`}
      >
        <div className="paper-grain rounded-xl bg-paper-raised px-6 py-8 shadow-paper">
          {uploading ? (
            <UploadProgress fileName={fileName} />
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                <UploadIcon width={22} height={22} />
              </div>
              <p className="mt-4 text-base font-medium text-ink">
                {dragging ? "Drop it here" : "Drag a PDF here"}
              </p>
              <p className="mt-1 text-sm text-ink-muted">or</p>
              <button
                type="button"
                onClick={onPick}
                className="mt-3 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink shadow-paper transition hover:brightness-110 active:translate-y-px"
              >
                Choose a file
              </button>
              <p className="mt-4 font-mono text-[11px] text-ink-muted">PDF · max 10 MB</p>
            </div>
          )}
        </div>
      </div>

      <ol className="mt-12 grid w-full max-w-3xl gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.n} className="bg-paper p-5">
            <span className="font-serif text-2xl italic text-accent">{step.n}</span>
            <p className="mt-2 text-sm font-medium text-ink">{step.title}</p>
            <p className="mt-1 text-[13px] leading-5 text-ink-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
