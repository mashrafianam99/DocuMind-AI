"use client";

import { useState } from "react";
import type { Message } from "@/lib/types";
import { AnswerText } from "./AnswerText";
import { CheckIcon, CopyIcon, LogoMark, QuoteIcon } from "./icons";

type ChatMessageProps = {
  message: Message;
  isFocused: boolean;
  activeSource: number | null;
  onCite: (messageId: string, sourceIndex: number) => void;
  onShowSources: (messageId: string) => void;
};

const COPY_RESET_MS = 1600;

export function ChatMessage({
  message,
  isFocused,
  activeSource,
  onCite,
  onShowSources,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  if (message.role === "user") {
    return (
      <div className="animate-rise flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[15px] leading-6 text-paper sm:max-w-[75%]">
          {message.content}
        </p>
      </div>
    );
  }

  const sourceCount = message.sources?.length ?? 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="animate-rise group flex gap-3.5">
      <LogoMark width={28} height={28} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div
          className={`font-serif text-[17px] leading-[1.7] text-ink-soft ${
            message.intro ? "italic" : ""
          }`}
        >
          <AnswerText
            text={message.content}
            sourceCount={sourceCount}
            activeSource={isFocused ? activeSource : null}
            onCite={(i) => onCite(message.id, i)}
          />
        </div>

        {!message.intro && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {sourceCount > 0 && (
              <button
                type="button"
                onClick={() => onShowSources(message.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                  isFocused
                    ? "border-highlight bg-highlight-soft text-ink"
                    : "border-line text-ink-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                <QuoteIcon width={14} height={14} />
                {sourceCount} source{sourceCount === 1 ? "" : "s"}
              </button>
            )}
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-ink-muted transition hover:bg-paper-sunken hover:text-ink"
            >
              {copied ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function ThinkingMessage() {
  return (
    <div className="flex gap-3.5" role="status" aria-live="polite">
      <LogoMark width={28} height={28} className="mt-0.5 shrink-0" />
      <div className="flex items-center gap-3 pt-1">
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot h-1.5 w-1.5 rounded-full bg-accent"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
        <span className="text-sm text-ink-muted">Searching the document…</span>
      </div>
    </div>
  );
}
