import { Fragment, type ReactNode } from "react";

type AnswerTextProps = {
  text: string;
  sourceCount: number;
  activeSource: number | null;
  onCite: (sourceIndex: number) => void;
};

// Matches "[Source 1]", "[Source 1, Source 3]", "[Sources 1, 2]".
const CITATION = /\[(Sources?\s*\d+(?:\s*[,;&]\s*(?:and\s+)?(?:Source\s*)?\d+)*)\]/gi;
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={key}
          className="rounded bg-paper-sunken px-1 py-0.5 font-mono text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

function renderLine(
  line: string,
  keyPrefix: string,
  props: Omit<AnswerTextProps, "text">
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(CITATION)) {
    const index = match.index ?? 0;
    nodes.push(...renderInline(line.slice(lastIndex, index), `${keyPrefix}-t${index}`));

    const numbers = (match[1].match(/\d+/g) ?? []).map(Number);
    numbers.forEach((n, j) => {
      const sourceIndex = n - 1;
      const valid = sourceIndex >= 0 && sourceIndex < props.sourceCount;
      const active = props.activeSource === sourceIndex;
      nodes.push(
        <button
          key={`${keyPrefix}-c${index}-${j}`}
          type="button"
          disabled={!valid}
          onClick={() => props.onCite(sourceIndex)}
          aria-label={`Show source ${n}`}
          className={`mx-0.5 inline-flex h-[1.35em] min-w-[1.35em] -translate-y-[0.1em] items-center justify-center rounded-md px-1 align-middle font-sans text-[0.68em] font-semibold tabular-nums transition ${
            active
              ? "bg-ink text-paper"
              : "bg-highlight-soft text-ink-soft ring-1 ring-highlight hover:bg-highlight"
          } disabled:cursor-default disabled:opacity-50`}
        >
          {n}
        </button>
      );
    });
    lastIndex = index + match[0].length;
  }

  nodes.push(...renderInline(line.slice(lastIndex), `${keyPrefix}-end`));
  return nodes;
}

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "h"; text: string };

function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const last = blocks[blocks.length - 1];
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^#{1,4}\s+(.*)$/);

    if (!line.trim()) {
      blocks.push({ kind: "p", lines: [] });
    } else if (heading) {
      blocks.push({ kind: "h", text: heading[1] });
    } else if (bullet || ordered) {
      const kind = bullet ? "ul" : "ol";
      const item = (bullet ?? ordered)![1];
      if (last?.kind === kind) last.items.push(item);
      else blocks.push({ kind, items: [item] });
    } else if (last?.kind === "p") {
      last.lines.push(line);
    } else {
      blocks.push({ kind: "p", lines: [line] });
    }
  }
  return blocks.filter((b) => b.kind !== "p" || b.lines.length > 0);
}

export function AnswerText({ text, ...props }: AnswerTextProps) {
  return (
    <div className="space-y-3">
      {toBlocks(text).map((block, i) => {
        const key = `b${i}`;
        if (block.kind === "h") {
          return (
            <p key={key} className="pt-1 font-sans text-sm font-semibold text-ink">
              {renderLine(block.text, key, props)}
            </p>
          );
        }
        if (block.kind === "p") {
          return (
            <p key={key}>
              {block.lines.map((line, j) => (
                <Fragment key={`${key}-${j}`}>
                  {j > 0 && <br />}
                  {renderLine(line, `${key}-${j}`, props)}
                </Fragment>
              ))}
            </p>
          );
        }
        const ListTag = block.kind;
        return (
          <ListTag
            key={key}
            className={`space-y-1.5 pl-5 marker:text-ink-muted ${
              block.kind === "ul" ? "list-disc" : "list-decimal"
            }`}
          >
            {block.items.map((item, j) => (
              <li key={`${key}-${j}`} className="pl-1">
                {renderLine(item, `${key}-${j}`, props)}
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
