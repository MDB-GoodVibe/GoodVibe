import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-2xl border border-[rgba(121,118,127,0.08)] bg-input px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition placeholder:text-muted-foreground focus-visible:border-secondary/30 focus-visible:ring-4 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
