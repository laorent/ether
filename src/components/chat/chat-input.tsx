import { useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  file: File | null;
  handleFileChange: (file: File | null) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  stop: () => void;
}

export function ChatInput({
  input,
  setInput,
  file,
  handleFileChange,
  handleSubmit,
  isLoading,
  stop,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      {file && (
        <div className="mb-2 w-fit relative">
            <div className="absolute top-1 right-1 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full bg-background/70 hover:bg-background"
                    onClick={() => handleFileChange(null)}
                >
                    <Icons.X className="h-4 w-4" />
                </Button>
            </div>
          <Image
            src={URL.createObjectURL(file)}
            alt="Selected file"
            width={80}
            height={80}
            className="rounded-lg object-cover"
          />
        </div>
      )}
      <div className="relative flex items-end">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 bottom-2 shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Icons.Paperclip className="h-5 w-5" />
                        <span className="sr-only">Attach file</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>附上图片</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/webp, image/gif"
          onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        />
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="问任何问题..."
          className="min-h-12 w-full resize-none rounded-lg border-input bg-background pl-12 pr-20 py-3 text-base scroll-py-3"
          rows={1}
        />
        <div className="absolute right-2 bottom-2 flex gap-2">
          {isLoading ? (
            <Button type="button" size="icon" onClick={stop}>
              <Icons.X className="h-5 w-5" />
              <span className="sr-only">停止</span>
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim() && !file}>
              <Icons.Send className="h-5 w-5" />
              <span className="sr-only">发送</span>
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
