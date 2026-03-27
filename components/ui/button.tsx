import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_14px_28px_rgba(37,31,74,0.14)] hover:-translate-y-0.5 hover:bg-primary/96",
        outline:
          "border border-[rgba(121,118,127,0.12)] bg-white/84 text-foreground hover:border-secondary/25 hover:bg-white",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_14px_28px_rgba(221,115,115,0.2)] hover:-translate-y-0.5 hover:bg-secondary/92",
        ghost:
          "bg-transparent text-foreground/72 shadow-none hover:bg-white/70 hover:text-primary",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        lg: "h-12 px-6 py-3 text-base",
        sm: "h-9 px-4 py-2 text-sm",
        icon: "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
