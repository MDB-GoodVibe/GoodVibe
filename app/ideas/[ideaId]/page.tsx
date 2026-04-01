import Link from "next/link";
import { ArrowRight, Sparkles, ThumbsUp } from "lucide-react";

import { toggleIdeaVoteAction } from "@/app/ideas/actions";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { Button } from "@/components/ui/button";
import { getCurrentViewer } from "@/lib/auth/viewer";
import { getIdeaPostById } from "@/lib/repositories/ideas";

function formatIdeaDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const { ideaId } = await params;
  const viewer = await getCurrentViewer();
  const idea = await getIdeaPostById(ideaId, viewer?.id);

  if (!idea) {
    return (
      <div className="rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-white px-6 py-12 text-center shadow-[0_14px_30px_rgba(37,31,74,0.05)]">
        <p className="text-lg font-semibold text-foreground">아이디어를 찾지 못했어요.</p>
      </div>
    );
  }

  const helperImportHref = `/helper/idea?sourceIdeaId=${idea.id}&autoAnalyze=1&from=idea-detail`;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <article className="min-w-0 space-y-8">
        <header className="rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-white px-7 py-8 shadow-[0_18px_38px_rgba(37,31,74,0.05)]">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-[rgba(91,95,151,0.12)] bg-[rgba(255,255,255,0.72)] px-3 py-1">
              {idea.authorName}
            </span>
            <span>{formatIdeaDate(idea.createdAt)}</span>
            <span className="rounded-full border border-[rgba(91,95,151,0.12)] bg-[rgba(255,255,255,0.72)] px-3 py-1">
              투표 {idea.upvoteCount}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <h1 className="text-[clamp(2.3rem,4vw,4rem)] font-extrabold tracking-[-0.06em] text-primary">
              {idea.title}
            </h1>
            <p className="max-w-4xl whitespace-pre-wrap text-[15px] leading-8 text-foreground/92">
              {idea.content}
            </p>
          </div>
        </header>
      </article>

      <aside className="space-y-4">
        <div className="rounded-[1.9rem] bg-secondary px-6 py-6 text-white shadow-[0_22px_46px_rgba(176,72,72,0.18)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
            참여하기
          </p>
          <p className="mt-3 text-sm leading-7 text-white/76">
            공감되는 아이디어라면 투표하고, 바로 헬퍼로 가져가 구조 초안까지 만들어 보세요.
          </p>

          <div className="mt-5 grid gap-2.5">
            <form action={toggleIdeaVoteAction}>
              <input type="hidden" name="ideaId" value={idea.id} />
              <PendingSubmitButton
                className="w-full bg-white text-secondary hover:bg-white/92"
                pendingLabel="반영 중..."
              >
                <ThumbsUp className="size-4" />
                {idea.viewerHasVoted ? "투표 취소" : "투표하기"}
              </PendingSubmitButton>
            </form>

            <Button
              asChild
              variant="outline"
              className="w-full border-white/18 bg-white/10 text-white hover:bg-white/16"
            >
              <Link href={helperImportHref}>
                <Sparkles className="size-4" />
                헬퍼로 가져오기
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-white/18 bg-white/10 text-white hover:bg-white/16"
            >
              <Link href="/ideas">
                목록으로
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
