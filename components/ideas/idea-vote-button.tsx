"use client";

import { useState } from "react";
import { LoaderCircle, ThumbsUp } from "lucide-react";
import { useFormStatus } from "react-dom";

import { toggleIdeaVoteAction } from "@/app/ideas/actions";
import { cn } from "@/lib/utils";

type IdeaVoteButtonProps = {
  ideaId: string;
  nextPath: string;
  upvoteCount: number;
  viewerHasVoted: boolean;
  mode?: "chip" | "panel";
  className?: string;
};

function IdeaVoteSubmit({
  count,
  voted,
  mode,
  className,
}: {
  count: number;
  voted: boolean;
  mode: "chip" | "panel";
  className?: string;
}) {
  const { pending } = useFormStatus();

  if (mode === "panel") {
    return (
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        aria-pressed={voted}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-secondary transition hover:bg-white/92 disabled:pointer-events-none disabled:opacity-70",
          className,
        )}
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <ThumbsUp className="size-4" />
        )}
        {pending ? "반영 중.." : voted ? `추천 취소 (${count})` : `추천하기 (${count})`}
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-pressed={voted}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold transition disabled:pointer-events-none disabled:opacity-70",
        voted
          ? "bg-[rgba(59,53,97,0.12)] text-primary"
          : "bg-[rgba(244,243,243,0.92)] text-primary hover:bg-[rgba(59,53,97,0.08)]",
        className,
      )}
    >
      {pending ? (
        <LoaderCircle className="size-3.5 animate-spin" />
      ) : (
        <ThumbsUp className="size-3.5" />
      )}
      {count}
    </button>
  );
}

export function IdeaVoteButton({
  ideaId,
  nextPath,
  upvoteCount,
  viewerHasVoted,
  mode = "chip",
  className,
}: IdeaVoteButtonProps) {
  const [optimisticCount, setOptimisticCount] = useState(upvoteCount);
  const [optimisticVoted, setOptimisticVoted] = useState(viewerHasVoted);

  function handleSubmit() {
    setOptimisticCount((current) =>
      optimisticVoted ? Math.max(0, current - 1) : current + 1,
    );
    setOptimisticVoted((current) => !current);
  }

  return (
    <form action={toggleIdeaVoteAction} onSubmit={handleSubmit}>
      <input type="hidden" name="ideaId" value={ideaId} />
      <input type="hidden" name="nextPath" value={nextPath} />
      <IdeaVoteSubmit
        count={optimisticCount}
        voted={optimisticVoted}
        mode={mode}
        className={className}
      />
    </form>
  );
}
