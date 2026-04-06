import Link from "next/link";
import { FileText, Plus, Search, Sparkles } from "lucide-react";

import { IdeaVoteButton } from "@/components/ideas/idea-vote-button";
import { Button } from "@/components/ui/button";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { getCurrentViewer } from "@/lib/auth/viewer";
import { listIdeaPosts } from "@/lib/repositories/ideas";
import type { IdeaSort } from "@/types/good-vibe";

function formatIdeaDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const params = await searchParams;
  const sort: IdeaSort = params.sort === "popular" ? "popular" : "latest";
  const query = params.q?.trim() ?? "";
  const viewer = await getCurrentViewer();
  const ideas = await listIdeaPosts(sort, viewer?.id, query);
  const currentIdeasPath = query
    ? `/ideas?sort=${sort}&q=${encodeURIComponent(query)}`
    : sort === "popular"
      ? "/ideas?sort=popular"
      : "/ideas";

  const topVoted = [...ideas]
    .sort((a, b) => b.upvoteCount - a.upvoteCount)
    .slice(0, 3)
    .reduce((sum, idea) => sum + idea.upvoteCount, 0);

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-[linear-gradient(180deg,#fcfbfb_0%,#f7f5f7_100%)] px-5 py-5 shadow-[0_14px_28px_rgba(37,31,74,0.05)] sm:rounded-[2rem] sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
              Idea Board
            </p>
            <h1 className="text-[1.4rem] font-bold tracking-[-0.05em] text-primary sm:text-[1.6rem]">
              아이디어 보드
            </h1>
            <p className="text-[13px] leading-6 text-muted-foreground">
              등록된 아이디어를 보고, 추천하고, 바로 헬퍼로 이어갈 수 있습니다.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href="/ideas/new">
                <Plus className="size-4" />
                아이디어 등록
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
              <Link href="/ideas/mine">내가 등록한 아이디어</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:gap-4 xl:grid-cols-[1.4fr_0.7fr_0.9fr]">
        <div className="rounded-[1.5rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(37,31,74,0.05)] sm:rounded-[1.7rem] sm:px-5 sm:py-5">
          <p className="text-[12px] font-semibold text-muted-foreground">아이디어 플로우</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["01", "등록", "생각한 문제나 서비스 아이디어를 올립니다."],
              ["02", "추천", "좋은 아이디어를 먼저 골라냅니다."],
              ["03", "연결", "선택한 아이디어를 헬퍼로 이어갑니다."],
            ].map(([step, title, body]) => (
              <div key={step} className="rounded-[1.1rem] bg-[rgba(244,243,243,0.9)] px-3.5 py-3.5 sm:rounded-[1.2rem] sm:px-4 sm:py-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-secondary">
                  {step}
                </p>
                <p className="mt-2 text-[15px] font-semibold text-primary">{title}</p>
                <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(37,31,74,0.05)] sm:rounded-[1.7rem] sm:px-5 sm:py-5">
          <p className="text-[12px] font-semibold text-muted-foreground">등록 수</p>
          <p className="mt-3 text-[1.75rem] font-bold tracking-[-0.05em] text-primary sm:text-[2rem]">{ideas.length}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {query ? "검색 결과 기준" : "전체 공개 아이디어"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(37,31,74,0.05)] sm:rounded-[1.7rem] sm:px-5 sm:py-5">
          <p className="text-[12px] font-semibold text-muted-foreground">상위 추천 수</p>
          <p className="mt-3 text-[1.75rem] font-bold tracking-[-0.05em] text-primary sm:text-[2rem]">{topVoted}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">상위 3개 아이디어 합계</p>
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(37,31,74,0.05)] sm:rounded-[1.8rem] sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form action="/ideas" className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-[520px]">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="아이디어 검색"
                className="h-11 w-full rounded-xl border border-[rgba(121,118,127,0.12)] bg-[rgba(244,243,243,0.92)] pl-10 pr-4 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
              <input type="hidden" name="sort" value={sort} />
            </div>
            <PendingSubmitButton size="sm" pendingLabel="검색 중...">
              검색
            </PendingSubmitButton>
          </form>

          <div className="flex w-full lg:w-auto lg:justify-end">
            <div className="inline-flex w-full justify-between rounded-full border border-[rgba(121,118,127,0.12)] bg-[rgba(244,243,243,0.92)] p-1 sm:w-auto sm:justify-start">
            <Button asChild size="sm" variant={sort === "latest" ? "secondary" : "ghost"}>
              <Link href={query ? `/ideas?sort=latest&q=${encodeURIComponent(query)}` : "/ideas?sort=latest"}>
                최신순
              </Link>
            </Button>
            <Button asChild size="sm" variant={sort === "popular" ? "secondary" : "ghost"}>
              <Link href={query ? `/ideas?sort=popular&q=${encodeURIComponent(query)}` : "/ideas?sort=popular"}>
                추천순
              </Link>
            </Button>
            </div>
          </div>
        </div>
      </section>

      {ideas.length > 0 ? (
        <section className="grid gap-3 sm:gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {ideas.map((idea) => (
            <article
              key={idea.id}
              className="group flex min-h-[220px] flex-col rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(37,31,74,0.05)] transition hover:-translate-y-0.5 sm:rounded-[1.8rem] sm:px-5 sm:py-5"
            >
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                  <span>{formatIdeaDate(idea.createdAt)}</span>
                  <span>{idea.authorName}</span>
                </div>
                <div className="self-end sm:self-auto">
                  <IdeaVoteButton
                    key={`${idea.id}:${idea.upvoteCount}:${idea.viewerHasVoted}`}
                    ideaId={idea.id}
                    nextPath={currentIdeasPath}
                    upvoteCount={idea.upvoteCount}
                    viewerHasVoted={idea.viewerHasVoted}
                  />
                </div>
              </div>

              <div className="mt-4 flex-1 space-y-3">
                <h2 className="line-clamp-2 text-[1rem] font-semibold leading-[1.3] tracking-[-0.03em] text-primary sm:text-[1.1rem]">
                  {idea.title}
                </h2>
                <p className="line-clamp-4 text-[13px] leading-6 text-muted-foreground">
                  {idea.content}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(244,243,243,0.92)] px-3 py-1">
                  <FileText className="size-3.5" />
                  참고 링크 {idea.referenceLinks.length}개
                </span>
              </div>

              <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
                <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                  <Link href={`/ideas/${idea.id}`}>자세히 보기</Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="w-full sm:w-auto">
                  <Link href={`/helper/idea?sourceIdeaId=${idea.id}&autoAnalyze=1`}>
                    <Sparkles className="size-4" />
                    헬퍼로
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-[1.6rem] border border-dashed border-[rgba(121,118,127,0.18)] bg-white px-5 py-8 text-center shadow-[0_12px_24px_rgba(37,31,74,0.04)] sm:rounded-[1.8rem] sm:px-6 sm:py-10">
          <p className="text-[15px] font-semibold text-primary">조건에 맞는 아이디어가 없습니다.</p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            검색어를 바꾸거나 새 아이디어를 등록해 보세요.
          </p>
        </section>
      )}
    </div>
  );
}
