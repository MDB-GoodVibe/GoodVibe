"use client";

import { startTransition, useActionState, useEffect, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ThumbsUp } from "lucide-react";

import { toggleIdeaVoteAction } from "@/app/ideas/actions";
import { cn } from "@/lib/utils";

type ToggleIdeaVoteState = {
  count: number;
  voted: boolean;
  status: "idle" | "success" | "error";
  redirectTo: string | null;
};

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
  pending,
  className,
}: {
  count: number;
  voted: boolean;
  mode: "chip" | "panel";
  pending: boolean;
  className?: string;
}) {
  if (mode === "panel") {
    return (
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        aria-pressed={voted}
        className={cn(
          "inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white font-semibold text-secondary transition hover:bg-white/92 disabled:pointer-events-none disabled:opacity-70",
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
        "inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold transition disabled:pointer-events-none disabled:opacity-70",
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
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ToggleIdeaVoteState, FormData>(
    toggleIdeaVoteAction,
    {
      count: upvoteCount,
      voted: viewerHasVoted,
      status: "idle",
      redirectTo: null,
    },
  );
  const [optimisticState, addOptimisticVote] = useOptimistic(
    {
      count: state.count,
      voted: state.voted,
    },
    (currentState) => ({
      count: currentState.voted
        ? Math.max(0, currentState.count - 1)
        : currentState.count + 1,
      voted: !currentState.voted,
    }),
  );

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo);
      return;
    }

    if (state.status === "success") {
      startTransition(() => {
        router.refresh();
      });
    }
  }, [router, state]);

  function handleSubmit() {
    addOptimisticVote(null);
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="ideaId" value={ideaId} />
      <input type="hidden" name="nextPath" value={nextPath} />
      <IdeaVoteSubmit
        count={optimisticState.count}
        voted={optimisticState.voted}
        mode={mode}
        pending={pending}
        className={className}
      />
    </form>
  );
}
