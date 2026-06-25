"use client";

import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Message, Source } from "@/types/about";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("chat-history");
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const savedSessionId = localStorage.getItem("chat-session-id");
    return savedSessionId || Date.now().toString();
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Save sessionId to localStorage
    if (typeof window !== "undefined" && sessionId) {
      localStorage.setItem("chat-session-id", sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    // Save conversation to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      } else {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          sessionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      // Check if response is streaming
      const contentType = response.headers.get("content-type");
      const isStreaming = contentType?.includes("text/event-stream");

      if (isStreaming) {
        // Create empty assistant message immediately for streaming
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        let sources: Source[] = [];

        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const dataStr = line.slice(6).trim();

                  if (!dataStr) continue;

                  // Try to parse as JSON first
                  let data;
                  try {
                    data = JSON.parse(dataStr);
                  } catch {
                    // If not JSON, treat as plain text content
                    data = { content: dataStr };
                  }

                  if (data.content) {
                    assistantContent += data.content;
                  }

                  if (data.sources) {
                    sources = data.sources;
                  }

                  // Update the last message (assistant)
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];

                    if (lastMessage?.role === "assistant") {
                      lastMessage.content = assistantContent;
                      lastMessage.sources = sources;
                    }

                    return newMessages;
                  });
                } catch (e) {
                  console.error("Error parsing SSE data:", line, e);
                }
              }
            }
          }
        }
      } else {
        // Handle non-streaming response
        const data = await response.json();

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              data.content ||
              data.response ||
              data.answer ||
              data.message ||
              "",
            timestamp: Date.now(),
            sources: data.sources || [],
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("chat-history");
    }
    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    if (typeof window !== "undefined") {
      localStorage.setItem("chat-session-id", newSessionId);
    }
  };

  const t = useTranslations("Prompt");

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto p-6 gap-6">
      <header className="flex items-center justify-between">
        <a
          target="_blank"
          href="https://linkedin.com/in/tmendesilva"
          className="flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer group">
            <Image
              src="/profile.png"
              alt="Profile"
              width={40}
              height={40}
              className="h-full w-full object-cover transition-transform duration-300 scale-130"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Tiago Mendes
            </h1>
            <p className="text-sm text-muted-foreground">
              Senior Developer | PHP | Node.js | Linux | AWS
            </p>
          </div>
        </a>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConversation}
          className="gap-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          {t("clearButton")}
        </Button>
      </header>

      <Card className="flex-1 flex flex-col overflow-hidden rounded-2xl border-2">
        <ScrollArea className="flex-1 px-2 overflow-y-auto" ref={scrollRef}>
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                  <svg
                    className="h-8 w-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  {t("messagesTitle")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {t("messageSubtitle")}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-3 text-muted-foreground py-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                </div>
                <span className="text-sm">{t("thinking")}</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </Card>
    </div>
  );
}
