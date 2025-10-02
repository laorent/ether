"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage, MessagePart, StreamPart } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";

// Maximum size for image uploads (8 MB)
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ChatLayout() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setSessionId(localStorage.getItem("sessionId") || `session-${uuidv4()}`);
  }, []);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("sessionId", sessionId);
    }
  }, [sessionId]);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "文件太大",
          description: `请选择小于 ${MAX_FILE_SIZE / 1024 / 1024} MB 的文件。`,
        });
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
        toast({
          variant: "destructive",
          title: "文件类型无效",
          description: "请选择 JPEG, PNG, WEBP, 或 GIF 图片。",
        });
        return;
      }
    }
    setFile(selectedFile);
  };
  
  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setFile(null);
    setInput("");
    const newSessionId = `session-${uuidv4()}`;
    setSessionId(newSessionId);
    localStorage.setItem("sessionId", newSessionId);
    toast({
        title: "聊天已清除",
        description: "新的聊天会话已开始。",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) {
      return;
    }

    setIsLoading(true);
    const newParts: MessagePart[] = [];
    if (input.trim()) {
      newParts.push({ type: 'text', text: input });
    }

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        newParts.push({ type: 'image', mimeType: file.type, data: base64Data });
        await sendMessage(newParts);
      };
      reader.onerror = (error) => {
        console.error("读取文件时出错:", error);
        toast({
          variant: "destructive",
          title: "读取文件时出错",
          description: "无法处理所选文件。",
        });
        setIsLoading(false);
      };
    } else {
      await sendMessage(newParts);
    }
  };
  
  const sendMessage = async (newParts: MessagePart[]) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      parts: newParts,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setFile(null);

    const modelMessageId = uuidv4();
    const modelMessage: ChatMessage = {
      id: modelMessageId,
      role: 'model',
      parts: [{ type: 'text', text: '' }],
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, modelMessage]);

    try {
      abortControllerRef.current = new AbortController();
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          history: messages,
          newParts: newParts,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const errorData = await res.json();
        throw new Error(errorData.error || "发生未知错误。");
      }
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      const processStream = async () => {
          let done = false;
          let fullText = "";

          while (!done) {
              const { value, done: doneReading } = await reader.read();
              done = doneReading;
              const chunk = decoder.decode(value, { stream: true });
              const eventLines = chunk.split('\n\n').filter(line => line.startsWith('data:'));
              
              for (const line of eventLines) {
                  const jsonStr = line.replace('data: ', '');
                  try {
                      const parsed: StreamPart = JSON.parse(jsonStr);
                      if (parsed.text) {
                          fullText += parsed.text;
                          setMessages((prev) =>
                            prev.map((msg) =>
                              msg.id === modelMessageId
                                ? { ...msg, parts: [{ type: 'text', text: fullText }] }
                                : msg
                            )
                          );
                      }
                      if (parsed.citations) {
                          setMessages((prev) =>
                            prev.map((msg) =>
                              msg.id === modelMessageId
                                ? { ...msg, citations: parsed.citations }
                                : msg
                            )
                          );
                      }
                      if (parsed.error) {
                          throw new Error(parsed.error);
                      }
                  } catch (e) {
                      // Ignore JSON parsing errors for incomplete chunks
                  }
              }
          }
      };

      await processStream();

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages((prev) => prev.filter(msg => msg.id !== modelMessageId));
        toast({
          variant: "destructive",
          title: "发生错误",
          description: error.message,
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="relative flex w-full max-w-4xl flex-1 flex-col rounded-lg border bg-card shadow-sm">
      <ChatHeader onClearChat={handleClearChat} />
      <MessageList messages={messages} isLoading={isLoading} />
      <div className="mx-2 mb-2 rounded-lg border bg-background p-2 sm:p-4">
        <ChatInput
          input={input}
          setInput={setInput}
          file={file}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
        />
      </div>
    </div>
  );
}
