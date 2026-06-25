import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Card } from "@/app/components/ui/card";
import { Message } from "@/types/about";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SourceList } from "./SourceList";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}
      >
        <Card
          className={`p-4 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ul: ({ children }) => (
                    <ul
                      style={{
                        whiteSpace: "pre-wrap",
                        lineHeight: ".9",
                      }}
                    >
                      {children}
                    </ul>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </Card>

        {message.sources && message.sources.length > 0 && (
          <SourceList sources={message.sources} />
        )}

        <span className="text-xs text-muted-foreground">
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString()
            : ""}
        </span>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
