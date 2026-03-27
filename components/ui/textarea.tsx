import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-32 w-full rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-input px-4 py-4 text-sm leading-7 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition placeholder:text-muted-foreground focus-visible:border-secondary/30 focus-visible:ring-4 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
