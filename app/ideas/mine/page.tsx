import Link from "next/link";
import { FileText, Plus, ThumbsUp } from "lucide-react";
import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentViewer } from "@/lib/auth/viewer";
import { listIdeaPostsByAuthor } from "@/lib/repositories/ideas";

function formatIdeaDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function MyIdeasPage() {
  const viewer = await getCurrentViewer();

  if (viewer && !viewer.nickname) {
    redirect("/auth/onboarding?next=/ideas/mine");
  }

  if (!viewer) {
    return (
      <main className="section-shell flex-1 py-12">
        <div className="mx-auto max-w-2xl">
          <Card className="glass-panel rounded-[2rem] border-[#b8b8d1]/35">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl">내가 등록한 아이디어를 보려면 로그인해 주세요</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Google 로그인 후 내가 등록한 아이디어 목록과 수정 기능을 바로 사용할 수 있어요.
              </p>
              <GoogleSignInButton next="/ideas/mine" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const ideas = await listIdeaPostsByAuthor(viewer.id);
  const totalVotes = ideas.reduce((sum, idea) => sum + idea.upvoteCount, 0);

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-[linear-gradient(180deg,#fcfbfb_0%,#f7f5f7_100%)] px-6 py-6 shadow-[0_14px_28px_rgba(37,31,74,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
              My Ideas
            </p>
            <h1 className="text-[1.4rem] font-bold tracking-[-0.04em] text-primary">
              내가 등록한 아이디어
            </h1>
            <p className="text-[13px] leading-6 text-muted-foreground">
              내가 작성한 아이디어를 카드로 모아 보고, 상세 페이지나 수정 화면으로 바로 이동할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/ideas/new">
                <Plus className="size-4" />
                아이디어 등록
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/ideas">아이디어 보드</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.7rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_12px_24px_rgba(37,31,74,0.05)]">
          <p className="text-[12px] font-semibold text-muted-foreground">내 등록 수</p>
          <p className="mt-3 text-[1.45rem] font-bold tracking-[-0.04em] text-primary">{ideas.length}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">내 계정으로 등록한 전체 아이디어</p>
        </div>

        <div className="rounded-[1.7rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_12px_24px_rgba(37,31,74,0.05)]">
          <p className="text-[12px] font-semibold text-muted-foreground">누적 추천수</p>
          <p className="mt-3 text-[1.45rem] font-bold tracking-[-0.04em] text-primary">{totalVotes}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">내 아이디어에 모인 전체 추천 수</p>
        </div>
      </section>

      {ideas.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {ideas.map((idea) => (
            <article
              key={idea.id}
              className="flex min-h-[250px] flex-col rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_12px_24px_rgba(37,31,74,0.05)]"
            >
              <Link href={`/ideas/${idea.id}`} className="flex flex-1 flex-col">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                    <span>{formatIdeaDate(idea.createdAt)}</span>
                    <span>{idea.status === "hidden" ? "비공개" : "공개"}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(244,243,243,0.92)] px-3 py-1 text-[12px] font-semibold text-primary">
                    <ThumbsUp className="size-3.5" />
                    {idea.upvoteCount}
                  </span>
                </div>

                <div className="mt-4 flex-1 space-y-3">
                  <h2 className="line-clamp-2 text-[1.15rem] font-semibold leading-[1.3] tracking-[-0.03em] text-primary">
                    {idea.title}
                  </h2>
                  <p className="line-clamp-4 text-[13px] leading-6 text-muted-foreground">
                    {idea.content}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(244,243,243,0.92)] px-3 py-1">
                    <FileText className="size-3.5" />
                    참고 링크 {idea.referenceLinks.length}개
                  </span>
                </div>
              </Link>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/ideas/${idea.id}`}>상세 보기</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/ideas/${idea.id}/edit`}>수정하기</Link>
                </Button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-[1.8rem] border border-dashed border-[rgba(121,118,127,0.18)] bg-white px-6 py-10 text-center shadow-[0_12px_24px_rgba(37,31,74,0.04)]">
          <p className="text-[15px] font-semibold text-primary">아직 등록한 아이디어가 없습니다.</p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            첫 아이디어를 등록하면 여기에서 한눈에 모아볼 수 있어요.
          </p>
        </section>
      )}
    </div>
  );
}
