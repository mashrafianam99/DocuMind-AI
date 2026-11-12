import type { DocumentInfo, Source } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const MAX_PDF_BYTES = 10 * 1024 * 1024;

const NETWORK_ERROR =
  "Can't reach the DocuMind server. Check your connection and try again.";

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function detailOf(data: Record<string, unknown>, fallback: string): string {
  return typeof data.detail === "string" ? data.detail : fallback;
}

/** Returns an error message, or null when the file is acceptable. */
export function validatePdf(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return "That file isn't a PDF. Choose a .pdf file.";
  }
  if (file.size > MAX_PDF_BYTES) {
    return "That PDF is larger than 10 MB. Try a smaller file.";
  }
  return null;
}

export async function uploadDocument(file: File): Promise<DocumentInfo> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/documents/upload`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(NETWORK_ERROR);
  }

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(detailOf(data, "The PDF couldn't be processed."));
  }

  return {
    id: String(data.document_id),
    filename: String(data.filename ?? file.name),
    pages: Number(data.pages ?? 0),
    chunks: Number(data.chunks ?? 0),
    sizeBytes: file.size,
  };
}

export async function askDocument(
  documentId: string,
  question: string
): Promise<{ answer: string; sources: Source[] }> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, question }),
    });
  } catch {
    throw new Error(NETWORK_ERROR);
  }

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(detailOf(data, "The question couldn't be answered."));
  }

  return {
    answer: typeof data.answer === "string" ? data.answer : "",
    sources: Array.isArray(data.sources) ? (data.sources as Source[]) : [],
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
