import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface WorkspaceEmptyStateProps {
  eyebrow: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}

export function WorkspaceEmptyState({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: WorkspaceEmptyStateProps) {
  return (
    <section className="surface-subtle rounded-[2rem] px-6 py-10 sm:px-8">
      <p className="section-kicker">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      <Button asChild className="mt-6">
        <Link href={actionHref}>
          {actionLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </section>
  );
}
