"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PromptStage } from "@/types/project";

interface PromptCardProps {
  stage: PromptStage;
  compact?: boolean;
  showObjective?: boolean;
  showChecklist?: boolean;
}

export function PromptCard({
  stage,
  compact = false,
  showObjective = true,
  showChecklist = true,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(stage.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <section className="rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_18px_34px_rgba(37,31,74,0.05)] sm:px-6 sm:py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/70">
            Stage {stage.stage}
          </p>
          <h3 className={compact ? "text-xl font-semibold text-primary" : "text-2xl font-semibold text-primary"}>
            {stage.title}
          </h3>
          {showObjective ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {stage.objective}
            </p>
          ) : null}
        </div>

        <Button size="sm" variant="outline" onClick={handleCopy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "복사 완료" : "복사"}
        </Button>
      </div>

      {!compact && showChecklist ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {stage.checklist.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[rgba(121,118,127,0.12)] bg-[rgba(244,243,243,0.9)] px-3 py-1 text-xs text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-[1.8rem] bg-[linear-gradient(180deg,#231c45_0%,#19152f_100%)] shadow-[0_18px_36px_rgba(37,31,74,0.14)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72">
          <span>Prompt</span>
          <span>Copy & Use</span>
        </div>
        <pre className="overflow-x-auto px-4 py-4 text-sm leading-7 whitespace-pre-wrap text-white">
          {stage.prompt}
        </pre>
      </div>
    </section>
  );
}
