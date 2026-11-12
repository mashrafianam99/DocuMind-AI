export type Source = {
  source: string;
  page: number;
  similarity: number;
  text: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  intro?: boolean;
};

export type DocumentInfo = {
  id: string;
  filename: string;
  pages: number;
  chunks: number;
  sizeBytes: number;
};
