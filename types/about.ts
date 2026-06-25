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
  config?: Record<string, any>;
}

export interface Source {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score?: number;
}
