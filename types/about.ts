export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
  sources?: Source[];
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  config?: Record<string, unknown>;
}

export interface Source {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  score?: number;
}
