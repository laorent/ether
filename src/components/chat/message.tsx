import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Citations } from './citations';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';

interface MessageProps {
  message: ChatMessage;
  isLast: boolean;
  isLoading: boolean;
}

export function Message({ message, isLast, isLoading }: MessageProps) {
  const { role, parts } = message;
  const isModel = role === 'model';

  return (
    <div className={cn('group flex items-start gap-3 mb-6', !isModel && 'justify-end')}>
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
            return (
              <Card
                key={index}
                className={cn(
                  "w-fit rounded-lg whitespace-pre-wrap",
                  isModel ? 'bg-secondary' : 'bg-primary text-primary-foreground'
                )}
              >
                <CardContent className="p-3">
                    <div
                        className="prose prose-sm dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: part.text }}
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
