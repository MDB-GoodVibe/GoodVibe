"use client";

import { CircleHelp } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTipProps {
  content: string;
}

export function HelpTip({ content }: HelpTipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="도움말"
            className="inline-flex size-5 items-center justify-center rounded-full border border-[#b8b8d1]/45 bg-[#fffffb]/72 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <CircleHelp className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
