"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { ArrowUpIcon } from "./icons";

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  busy: boolean;
  suggestions: string[];
  onSuggestion: (text: string) => void;
};

const MAX_TEXTAREA_PX = 200;

export function Composer({
  value,
  onChange,
  onSubmit,
  disabled,
  busy,
  suggestions,
  onSuggestion,
}: ComposerProps) {
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_PX)}px`;
  }, [value]);

  useEffect(() => {
    if (!disabled && !busy) textarea.current?.focus();
  }, [disabled, busy]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  const canSend = !disabled && !busy && value.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {suggestions.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestion(s)}
              disabled={busy}
              className="animate-rise rounded-full border border-line bg-paper-raised px-3.5 py-1.5 text-[13px] text-ink-soft transition hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-line-strong bg-paper-raised p-1.5 shadow-paper transition focus-within:border-ink-muted">
        <label htmlFor="question" className="sr-only">
          Ask a question about your document
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="question"
            ref={textarea}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            disabled={disabled}
            rows={1}
            placeholder={
              disabled ? "Upload a PDF to start asking questions" : "Ask anything about this document…"
            }
            className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-ink outline-none placeholder:text-ink-muted disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send question"
            className="mb-0.5 mr-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink transition hover:brightness-110 disabled:bg-paper-sunken disabled:text-ink-muted"
          >
            <ArrowUpIcon />
          </button>
        </div>
      </div>
      <p className="mt-2.5 text-center text-[11px] text-ink-muted">
        <span className="hidden sm:inline">
          <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift + Enter</kbd> for a new
          line ·{" "}
        </span>
        Check important claims against the cited pages.
      </p>
    </form>
  );
}
