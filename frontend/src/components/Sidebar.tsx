import { formatBytes } from "@/lib/api";
import type { DocumentInfo } from "@/lib/types";
import { FileIcon, LogoMark, PlusIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

type SidebarProps = {
  document: DocumentInfo | null;
  questionCount: number;
  busy: boolean;
  onNewDocument: () => void;
};

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark width={30} height={30} />
      <span className="font-serif text-[1.35rem] font-medium tracking-tight">
        DocuMind
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[11px] text-ink-muted">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm tabular-nums text-ink">{value}</dd>
    </div>
  );
}

export function Sidebar({
  document,
  questionCount,
  busy,
  onNewDocument,
}: SidebarProps) {
  return (
    <aside className="hidden w-[272px] shrink-0 flex-col border-r border-line bg-paper-raised/60 px-4 py-5 lg:flex">
      <div className="flex items-center justify-between px-1">
        <Brand />
        <ThemeToggle />
      </div>

      <button
        type="button"
        onClick={onNewDocument}
        disabled={busy}
        className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper shadow-paper transition hover:opacity-90 disabled:opacity-50"
      >
        <PlusIcon width={16} height={16} />
        {document ? "New document" : "Upload a PDF"}
      </button>

      <p className="mt-8 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        Reading
      </p>

      {document ? (
        <div className="animate-rise mt-2.5 rounded-xl border border-line bg-paper-raised p-3.5 shadow-paper">
          <div className="flex items-start gap-3">
            <div className="relative flex h-11 w-9 shrink-0 items-end justify-center rounded-md border border-line-strong bg-paper pb-1">
              <span className="font-mono text-[8px] font-semibold text-accent">PDF</span>
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-bl-sm border-b border-l border-line-strong bg-paper-sunken" />
            </div>
            <div className="min-w-0">
              <p
                className="line-clamp-2 break-words text-sm font-medium leading-snug"
                title={document.filename}
              >
                {document.filename}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Indexed and ready
              </p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
            <Stat label="Pages" value={document.pages} />
            <Stat label="Passages" value={document.chunks} />
            <Stat label="Size" value={formatBytes(document.sizeBytes)} />
          </dl>
        </div>
      ) : (
        <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-dashed border-line-strong p-3.5 text-ink-muted">
          <FileIcon />
          <p className="text-xs leading-5">No document yet. Your PDF will show up here.</p>
        </div>
      )}

      {document && (
        <p className="mt-3 px-1 text-xs text-ink-muted">
          {questionCount === 0
            ? "No questions asked yet"
            : `${questionCount} question${questionCount === 1 ? "" : "s"} asked`}
        </p>
      )}

      <div className="mt-auto space-y-3 px-1">
        <div className="rounded-xl bg-paper-sunken/70 p-3.5">
          <p className="font-serif text-[15px] italic leading-snug text-ink-soft">
            “Every answer points back to the page it came from.”
          </p>
          <p className="mt-2 text-[11px] leading-4 text-ink-muted">
            Answers are generated only from passages retrieved from your PDF.
          </p>
        </div>
      </div>
    </aside>
  );
}
