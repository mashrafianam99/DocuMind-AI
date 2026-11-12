"use client";

import { useEffect, useRef } from "react";
import type { Source } from "@/lib/types";
import { QuoteIcon } from "./icons";

type EvidencePanelProps = {
  sources: Source[];
  activeSource: number | null;
  onSelect: (index: number) => void;
};

function MatchMeter({ similarity }: { similarity: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(similarity * 100)));
  return (
    <div className="flex items-center gap-2" title={`Relevance score ${pct}%`}>
      <div className="h-1 w-14 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] tabular-nums text-ink-muted">{pct}%</span>
    </div>
  );
}

export function EvidencePanel({ sources, activeSource, onSelect }: EvidencePanelProps) {
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (activeSource === null) return;
    refs.current[activeSource]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeSource, sources]);

  if (sources.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-sunken text-ink-muted">
          <QuoteIcon />
        </div>
        <p className="mt-4 text-sm font-medium text-ink">No evidence yet</p>
        <p className="mt-1 max-w-[220px] text-[13px] leading-5 text-ink-muted">
          Ask a question. The passages behind each answer will be listed here.
        </p>
      </div>
    );
  }

  return (
    <ol className="scroll-thin flex-1 space-y-3 overflow-y-auto px-4 pb-6">
      {sources.map((source, i) => {
        const active = activeSource === i;
        return (
          <li
            key={`${source.page}-${i}`}
            ref={(el) => {
              refs.current[i] = el;
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={active}
              className={`w-full rounded-xl border p-3.5 text-left transition ${
                active
                  ? "border-highlight bg-highlight-soft shadow-paper"
                  : "border-line bg-paper-raised hover:border-line-strong"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[11px] font-semibold tabular-nums ${
                      active ? "bg-ink text-paper" : "bg-paper-sunken text-ink-soft"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
                    Page {source.page}
                  </span>
                </div>
                <MatchMeter similarity={source.similarity} />
              </div>
              <p
                className={`mt-2.5 font-serif text-[14.5px] leading-6 text-ink-soft ${
                  active ? "" : "line-clamp-5"
                }`}
              >
                {source.text}
              </p>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
