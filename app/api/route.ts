import { ChatRequest, Source } from "@/types/about";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, sessionId, config } = body;

    // Get RAG API URL from settings or environment variable
    const ragApiUrl = process.env.RAG_API_URL;

    if (!ragApiUrl) {
      return NextResponse.json(
        { error: "RAG_API_URL environment variable is not set" },
        { status: 500 },
      );
    }

    const bodyPayload = JSON.stringify({
      query: message,
      session_id: sessionId,
      ...config,
    });

    // Prepare the request to your RAG backend
    const response = await fetch(ragApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyPayload,
    });

    if (!response.ok) {
      throw new Error(`RAG API responded with status: ${response.status}`);
    }

    // Check if the response is streaming
    const contentType = response.headers.get("content-type") || "";
    const isStreaming = contentType.includes("text/event-stream");

    if (isStreaming) {
      // Return streaming response - pass through raw backend response
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              controller.enqueue(value);
            }
          } catch (error) {
            console.error("Streaming error:", error);
          } finally {
            controller.close();
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Handle non-streaming response
      const text = await response.text();

      // Transform the response to match our expected format
      const sources: Source[] = [];

      return NextResponse.json({
        content: text || "",
        sources,
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
