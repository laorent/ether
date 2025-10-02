"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";
import { Icons } from "../icons";

interface ChatHeaderProps {
  onClearChat: () => void;
  onLogout: () => void;
}

export function ChatHeader({ onClearChat, onLogout }: ChatHeaderProps) {
  return (
    <>
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Icons.Bot className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Aether</h1>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="清除对话">
                <Icons.Trash2 />
                <span className="sr-only">清除对话</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确定吗？</AlertDialogTitle>
                <AlertDialogDescription>
                  这将永久清除当前聊天记录。此操作无法撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onClearChat}>
                  清除对话
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ThemeToggle />
          <Button variant="ghost" size="icon" title="退出登录" onClick={onLogout}>
            <Icons.LogOut />
            <span className="sr-only">退出登录</span>
          </Button>
        </div>
      </div>
      <Separator />
    </>
  );
}
