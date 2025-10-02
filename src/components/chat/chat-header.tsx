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
}

export function ChatHeader({ onClearChat }: ChatHeaderProps) {
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
              <Button variant="ghost" size="icon" title="Clear Chat">
                <Icons.Trash2 />
                <span className="sr-only">Clear Chat</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently clear the current chat history. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearChat}>
                  Clear Chat
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ThemeToggle />
        </div>
      </div>
      <Separator />
    </>
  );
}
