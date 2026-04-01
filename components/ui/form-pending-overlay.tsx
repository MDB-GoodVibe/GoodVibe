"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

export function FormPendingOverlay({
  label = "처리 중입니다...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-center bg-white/72 backdrop-blur-[3px]",
        className,
      )}
    >
      <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(121,118,127,0.12)] bg-white px-4 py-2 text-sm font-semibold text-primary shadow-[0_16px_30px_rgba(37,31,74,0.08)]">
        <LoaderCircle className="size-4 animate-spin text-secondary" />
        {label}
      </div>
    </div>
  );
}
