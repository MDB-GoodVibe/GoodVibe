import Link from "next/link";
import { ExternalLink, FileText, Inbox, Sparkles, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";

import { deleteKnowledgeArticleAction } from "@/app/admin/knowledge/actions";
import { Button } from "@/components/ui/button";
import { getCurrentViewer } from "@/lib/auth/viewer";
import { listKnowledgeArticlesForAdmin } from "@/lib/repositories/knowledge";
import { listKnowledgeSubmissionsForAdmin } from "@/lib/repositories/knowledge-submissions";
import { cn } from "@/lib/utils";
import type { KnowledgeTrack } from "@/types/good-vibe";

const trackLabelMap: Record<KnowledgeTrack, string> = {
  basics: "기초",
  "level-up": "레벨업",
  tips: "팁 모음",
  external: "외부 자료",
};

type AdminTrackFilter = KnowledgeTrack | "all";

function isKnowledgeTrack(value: string): value is KnowledgeTrack {
  return value === "basics" || value === "level-up" || value === "tips" || value === "external";
}

function formatDate(value: string | null) {
  if (!value) {
    return "업데이트 예정";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function buildTrackHref(track: AdminTrackFilter) {
  return track === "all" ? "/admin/knowledge" : `/admin/knowledge?track=${track}`;
}

export default async function AdminKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; track?: string }>;
}) {
  const viewer = await getCurrentViewer();
  const params = await searchParams;

  if (!viewer) {
    redirect("/profile");
  }

  if (viewer.role !== "admin") {
    return (
      <main className="flex-1 py-10">
        <div className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-white px-6 py-10 text-center shadow-[0_12px_24px_rgba(37,31,74,0.05)]">
          <p className="text-base font-semibold text-foreground">관리자 권한이 필요합니다.</p>
        </div>
      </main>
    );
  }

  const [articles, submissions] = await Promise.all([
    listKnowledgeArticlesForAdmin(),
    listKnowledgeSubmissionsForAdmin(),
  ]);

  const requestedTrack = typeof params.track === "string" ? params.track : "all";
  const selectedTrack: AdminTrackFilter = isKnowledgeTrack(requestedTrack)
    ? requestedTrack
    : "all";
  const filteredArticles =
    selectedTrack === "all"
      ? articles
      : articles.filter((article) => article.track === selectedTrack);

  const trackOptions: Array<{
    value: AdminTrackFilter;
    label: string;
    count: number;
  }> = [
    {
      value: "all",
      label: "전체",
      count: articles.length,
    },
    {
      value: "basics",
      label: "기초",
      count: articles.filter((article) => article.track === "basics").length,
    },
    {
      value: "level-up",
      label: "레벨업",
      count: articles.filter((article) => article.track === "level-up").length,
    },
    {
      value: "tips",
      label: "팁 모음",
      count: articles.filter((article) => article.track === "tips").length,
    },
    {
      value: "external",
      label: "외부 자료",
      count: articles.filter((article) => article.track === "external").length,
    },
  ];

  return (
    <main className="flex-1 py-10">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
              Admin
            </p>
            <h1 className="text-[1.8rem] font-bold tracking-[-0.04em] text-foreground">
              지식 문서 관리
            </h1>
            <p className="max-w-2xl text-[13px] leading-6 text-muted-foreground">
              상단 카테고리로 빠르게 필터링하고, 문서를 바로 확인하거나 삭제할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/knowledge/youtube">유튜브 동기화</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/knowledge/submissions">지식 제보함</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/knowledge/new?mode=manual">직접 작성</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/knowledge/new?mode=ai">
                <Sparkles className="size-4" />
                AI로 초안 만들기
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.4rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-4 shadow-[0_10px_22px_rgba(37,31,74,0.04)]">
            <p className="text-[12px] text-muted-foreground">전체 문서</p>
            <p className="mt-2 text-[1.8rem] font-bold tracking-[-0.04em] text-primary">
              {articles.length}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-4 shadow-[0_10px_22px_rgba(37,31,74,0.04)]">
            <p className="text-[12px] text-muted-foreground">게시 중</p>
            <p className="mt-2 text-[1.8rem] font-bold tracking-[-0.04em] text-primary">
              {articles.filter((article) => article.status === "published").length}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-4 shadow-[0_10px_22px_rgba(37,31,74,0.04)]">
            <p className="text-[12px] text-muted-foreground">검토 대기 제보</p>
            <p className="mt-2 text-[1.8rem] font-bold tracking-[-0.04em] text-primary">
              {submissions.filter((submission) => submission.status === "pending").length}
            </p>
          </div>
        </div>

        <section className="rounded-[1.4rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4 shadow-[0_10px_22px_rgba(37,31,74,0.04)]">
          <p className="mb-3 text-[12px] font-semibold text-muted-foreground">카테고리 선택</p>
          <div className="flex flex-wrap gap-2">
            {trackOptions.map((option) => {
              const active = selectedTrack === option.value;

              return (
                <Link
                  key={option.value}
                  href={buildTrackHref(option.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-[rgba(121,118,127,0.14)] bg-[rgba(250,249,249,0.9)] text-primary hover:border-secondary/30",
                  )}
                >
                  <span>{option.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px]",
                      active ? "bg-white/20" : "bg-[rgba(59,53,97,0.08)]",
                    )}
                  >
                    {option.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {params.error ? (
          <div className="rounded-[1rem] border border-[rgba(255,107,108,0.18)] bg-[rgba(255,107,108,0.08)] px-4 py-3 text-[13px] text-secondary">
            요청 처리 중 문제가 발생했습니다. 다시 시도해 주세요.
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-white shadow-[0_14px_30px_rgba(37,31,74,0.05)]">
          <div className="grid grid-cols-[1.1fr_120px_110px_150px_180px] gap-3 border-b border-[rgba(121,118,127,0.08)] px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-foreground/52">
            <span>문서</span>
            <span>트랙</span>
            <span>상태</span>
            <span>업데이트</span>
            <span>작업</span>
          </div>

          <div className="divide-y divide-[rgba(121,118,127,0.08)]">
            {filteredArticles.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-muted-foreground">
                선택한 카테고리에 문서가 없습니다.
              </div>
            ) : null}

            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="grid grid-cols-[1.1fr_120px_110px_150px_180px] gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-primary">{article.title}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-muted-foreground">
                    {article.summary}
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="rounded-full bg-[rgba(244,243,243,0.92)] px-3 py-1 text-[12px] text-primary">
                    {trackLabelMap[article.track]}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="rounded-full bg-[rgba(244,243,243,0.92)] px-3 py-1 text-[12px] text-muted-foreground">
                    {article.status === "draft" ? "draft" : "게시"}
                  </span>
                </div>
                <div className="text-[13px] text-muted-foreground">
                  {formatDate(article.updatedAt)}
                </div>
                <div className="flex items-center gap-2">
                  {article.status === "published" ? (
                    <Button asChild variant="ghost" size="sm" className="h-9 px-3">
                      <Link href={`/knowledge/${article.slug}`}>
                        <ExternalLink className="size-4" />
                        보기
                      </Link>
                    </Button>
                  ) : (
                    <span className="flex h-9 items-center rounded-xl px-3 text-[12px] text-muted-foreground">
                      draft
                    </span>
                  )}

                  <form action={deleteKnowledgeArticleAction}>
                    <input type="hidden" name="articleId" value={article.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 text-secondary hover:text-secondary"
                    >
                      <Trash2 className="size-4" />
                      삭제
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-3">
          <Link
            href="/admin/knowledge/new?mode=manual"
            className="rounded-[1.5rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_10px_22px_rgba(37,31,74,0.04)] transition hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(59,53,97,0.08)] text-primary">
                <FileText className="size-4" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-primary">직접 Markdown 작성</p>
                <p className="text-[13px] text-muted-foreground">
                  수동 작성과 미리보기를 거쳐 바로 draft로 등록합니다.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/knowledge/submissions"
            className="rounded-[1.5rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_10px_22px_rgba(37,31,74,0.04)] transition hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(255,107,108,0.08)] text-secondary">
                <Inbox className="size-4" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-primary">지식 제보 확인</p>
                <p className="text-[13px] text-muted-foreground">
                  제보를 확인하고 AI 초안 작성 화면으로 바로 이동할 수 있습니다.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/knowledge/youtube"
            className="rounded-[1.5rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_10px_22px_rgba(37,31,74,0.04)] transition hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(255,0,0,0.08)] text-secondary">
                <ExternalLink className="size-4" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-primary">유튜브 동기화</p>
                <p className="text-[13px] text-muted-foreground">
                  등록 채널 관리와 신규 영상 동기화 상태를 확인합니다.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
