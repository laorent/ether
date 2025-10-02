"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage, MessagePart, StreamPart } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Icons } from "../icons";

// Maximum size for image uploads (8 MB)
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCESS_TOKEN_KEY = "aether-access-token";

export default function ChatLayout() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean | null>(null);
  const [accessPassword, setAccessPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkPasswordProtection = async () => {
      try {
        const response = await fetch('/api/verify-password');
        const data = await response.json();
        setIsPasswordProtected(data.isPasswordProtected);

        if (!data.isPasswordProtected) {
          setIsAuthenticated(true);
        } else {
          // Check if user is already authenticated from a previous session
          const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
          if (storedToken) {
              // You might want to add an extra verification step here
              // For simplicity, we trust the token.
              setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("无法检查密码保护状态:", error);
        // Fallback to not protected if API fails
        setIsAuthenticated(true); 
      } finally {
        setIsVerifying(false);
      }
    };
    checkPasswordProtection();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setSessionId(localStorage.getItem("sessionId") || `session-${uuidv4()}`);
    }
  }, [isAuthenticated]);

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: accessPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem(ACCESS_TOKEN_KEY, 'true'); // Store a simple token
          setIsAuthenticated(true);
        } else {
          toast({ variant: 'destructive', title: '密码错误', description: '请输入正确的访问密码。' });
        }
      } else {
        toast({ variant: 'destructive', title: '验证失败', description: '无法验证密码，请稍后重试。' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: '发生错误', description: '网络错误，请检查您的连接。' });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isVerifying) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Icons.Loader className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  if (!isAuthenticated && isPasswordProtected) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">需要访问密码</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <Input
                type="password"
                placeholder="请输入密码..."
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !accessPassword}>
                {isLoading ? <Icons.Loader className="animate-spin" /> : '进入'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
