"use client";

import * as React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import type { Citation } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface CitationsProps {
  citations: Citation[];
}

export function Citations({ citations }: CitationsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();

  const copyCitations = () => {
    const textToCopy = citations.map((c, i) => `[${i+1}] ${c.title}\n${c.uri}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Citations Copied',
      description: 'The citation sources have been copied to your clipboard.',
    });
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 h-auto text-xs">
            {isOpen ? 'Hide' : 'Show'} {citations.length} Sources
          </Button>
        </CollapsibleTrigger>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyCitations}>
            <Icons.Copy className="h-3 w-3" />
            <span className="sr-only">Copy Citations</span>
        </Button>
      </div>
      <CollapsibleContent className="space-y-2">
        {citations.map((citation, index) => (
            <a href={citation.uri} target="_blank" rel="noopener noreferrer" key={citation.uri + index} className="block">
                <Card className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium flex items-start gap-2">
                           <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs shrink-0">{index + 1}</span>
                           <span className="truncate">{citation.title}</span>
                        </CardTitle>
                        <CardDescription className="text-xs truncate">{citation.uri}</CardDescription>
                    </CardHeader>
                </Card>
            </a>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
