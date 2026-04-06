import Link from "next/link";
import { ArrowRight, Link2, PencilLine, Sparkles } from "lucide-react";

import { IdeaVoteButton } from "@/components/ideas/idea-vote-button";
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
        <p className="text-lg font-semibold text-foreground">
          아이디어를 찾지 못했어요.
        </p>
      </div>
    );
  }

  const helperImportHref = `/helper/idea?sourceIdeaId=${idea.id}&autoAnalyze=1&from=idea-detail`;
  const canEdit = viewer?.id === idea.authorId;

  return (
    <div className="grid gap-5 sm:gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <article className="min-w-0 space-y-5 sm:space-y-8">
        <header className="rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_18px_38px_rgba(37,31,74,0.05)] sm:rounded-[2rem] sm:px-7 sm:py-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-[rgba(91,95,151,0.12)] bg-[rgba(255,255,255,0.72)] px-3 py-1">
              {idea.authorName}
            </span>
            <span>{formatIdeaDate(idea.createdAt)}</span>
            <span className="rounded-full border border-[rgba(91,95,151,0.12)] bg-[rgba(255,255,255,0.72)] px-3 py-1">
              추천 {idea.upvoteCount}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <h1 className="text-[clamp(1.3rem,1.9vw,1.8rem)] font-extrabold tracking-[-0.04em] text-primary">
              {idea.title}
            </h1>
            <p className="max-w-4xl whitespace-pre-wrap text-[14px] leading-7 text-foreground/92 sm:text-[15px] sm:leading-8">
              {idea.content}
            </p>
          </div>
        </header>

        {idea.referenceLinks.length > 0 ? (
          <section className="rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_18px_38px_rgba(37,31,74,0.05)] sm:rounded-[2rem] sm:px-7 sm:py-7">
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
                  References
                </p>
                <h2 className="mt-2 text-[1.05rem] font-bold tracking-[-0.03em] text-primary">
                  참고 링크
                </h2>
              </div>

              <div className="grid gap-3">
                {idea.referenceLinks.map((referenceLink) => (
                  <a
                    key={referenceLink}
                    href={referenceLink}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-[1.3rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(244,243,243,0.72)] px-4 py-4 text-sm text-foreground transition hover:-translate-y-0.5 hover:border-secondary/25"
                  >
                    <span className="min-w-0 truncate">{referenceLink}</span>
                    <Link2 className="size-4 shrink-0 text-muted-foreground transition group-hover:text-secondary" />
                  </a>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </article>

      <aside className="space-y-4">
        <div className="rounded-[1.7rem] bg-secondary px-5 py-5 text-white shadow-[0_22px_46px_rgba(176,72,72,0.18)] sm:rounded-[1.9rem] sm:px-6 sm:py-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
            참여하기
          </p>
          <p className="mt-3 text-sm leading-7 text-white/76">
            좋은 아이디어라면 추천하고, 바로 헬퍼로 가져가 구조 초안까지
            만들어 보세요.
          </p>

          <div className="mt-5 grid gap-2.5">
            <IdeaVoteButton
              key={`${idea.id}:${idea.upvoteCount}:${idea.viewerHasVoted}`}
              ideaId={idea.id}
              nextPath={`/ideas/${idea.id}`}
              upvoteCount={idea.upvoteCount}
              viewerHasVoted={idea.viewerHasVoted}
              mode="panel"
            />

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

            {canEdit ? (
              <Button
                asChild
                variant="outline"
                className="w-full border-white/18 bg-white/10 text-white hover:bg-white/16"
              >
                <Link href={`/ideas/${idea.id}/edit`}>
                  <PencilLine className="size-4" />
                  글 수정
                </Link>
              </Button>
            ) : null}

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
