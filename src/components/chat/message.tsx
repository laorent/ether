import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Citations } from './citations';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

interface MessageProps {
  message: ChatMessage;
  isLast: boolean;
  isLoading: boolean;
}

export function Message({ message, isLast, isLoading }: MessageProps) {
  const { role, parts } = message;
  const isModel = role === 'model';
  const { toast } = useToast();
  const contentRef = React.useRef<HTMLDivElement>(null);

  const onCopy = () => {
    let textToCopy = '';
    if (contentRef.current) {
      // Prefer innerText to get the rendered text content without HTML tags
      textToCopy = contentRef.current.innerText;
    } else {
      // Fallback for an unlikely case where ref is not attached
      textToCopy = parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('\\n');
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      toast({
        title: '已复制',
        description: '内容已复制到剪贴板。',
      });
    }
  };

  // Function to clean markdown-like characters
  const cleanText = (text: string) => {
    // Removes **, *, and list-like prefixes
    return text
      .replace(/\*\*/g, '')
      .replace(/ \*/g, '\n') // Keep line breaks for lists
      .replace(/^\*/g, '')  // For lists at the beginning
      .trim();
  };

  return (
    <div className={cn('group/message flex items-start gap-3 mb-6', !isModel && 'justify-end')}>
      {isModel && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback><Icons.Bot /></AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col gap-2 max-w-[85%]', !isModel && 'items-end')}>
        {parts.map((part, index) => {
          if (part.type === 'image') {
            const dataUrl = `data:${part.mimeType};base64,${part.data}`;
            return (
              <Card key={index} className="w-fit max-w-xs overflow-hidden rounded-lg">
                <Image src={dataUrl} alt="User upload" width={300} height={300} className="object-cover"/>
              </Card>
            )
          }
          if (part.type === 'text') {
            const isEmpty = !part.text.trim();
            const showLoader = isModel && isLast && isLoading && isEmpty;
            if (showLoader) {
              return (
                 <Card key={index} className="w-fit rounded-lg bg-secondary p-3">
                    <Icons.Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                 </Card>
              )
            }
            if (isEmpty && !showLoader) return null;
            
            const cleanedText = cleanText(part.text);

            return (
              <Card
                key={index}
                className={cn(
                  "relative w-fit rounded-lg whitespace-pre-wrap",
                  isModel ? 'bg-secondary' : 'bg-primary text-primary-foreground'
                )}
              >
                {isModel && !isLoading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 opacity-0 transition-opacity group-hover/message:opacity-100"
                    onClick={onCopy}
                    title="复制"
                  >
                    <Icons.Copy className="h-4 w-4" />
                  </Button>
                )}
                <CardContent className="p-3">
                    <div
                        ref={contentRef}
                        className="prose prose-sm dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: cleanedText }}
                    />
                    {isModel && isLast && isLoading && <span className="inline-block h-4 w-1 animate-pulse bg-foreground/50 ml-1"></span>}
                </CardContent>
                {message.citations && message.citations.length > 0 && (
                  <CardFooter className="p-3 pt-0">
                    <Citations citations={message.citations} />
                  </CardFooter>
                )}
              </Card>
            )
          }
          return null;
        })}
      </div>

      {!isModel && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback><Icons.User /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
