import Link from "next/link";
import { ExternalLink, FileText, Inbox, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentViewer } from "@/lib/auth/viewer";
import { listKnowledgeArticlesForAdmin } from "@/lib/repositories/knowledge";
import { listKnowledgeSubmissionsForAdmin } from "@/lib/repositories/knowledge-submissions";
import type { KnowledgeTrack } from "@/types/good-vibe";

const trackLabelMap: Record<KnowledgeTrack, string> = {
  basics: "기초",
  "level-up": "레벨업",
  tips: "팁 모음",
  external: "외부 자료",
};

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

export default async function AdminKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
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
          <p className="text-base font-semibold text-foreground">
            관리자 권한이 필요합니다.
          </p>
        </div>
      </main>
    );
  }

  const [articles, submissions] = await Promise.all([
    listKnowledgeArticlesForAdmin(),
    listKnowledgeSubmissionsForAdmin(),
  ]);

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
              작성 중인 draft, 게시된 문서, 사용자 제보 상태를 한 화면에서 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
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

        {params.error ? (
          <div className="rounded-[1rem] border border-[rgba(255,107,108,0.18)] bg-[rgba(255,107,108,0.08)] px-4 py-3 text-[13px] text-secondary">
            권한 또는 접근 상태를 다시 확인해 주세요.
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-white shadow-[0_14px_30px_rgba(37,31,74,0.05)]">
          <div className="grid grid-cols-[1.1fr_120px_110px_150px_120px] gap-3 border-b border-[rgba(121,118,127,0.08)] px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-foreground/52">
            <span>문서</span>
            <span>트랙</span>
            <span>상태</span>
            <span>업데이트</span>
            <span>열기</span>
          </div>

          <div className="divide-y divide-[rgba(121,118,127,0.08)]">
            {articles.map((article) => (
              <div
                key={article.id}
                className="grid grid-cols-[1.1fr_120px_110px_150px_120px] gap-3 px-5 py-4"
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
                <div className="flex gap-2">
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
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2">
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
                  수동 작성과 미리보기를 거쳐 바로 draft를 저장합니다.
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
                  제보를 확인하고 AI 초안 작성 화면으로 바로 넘길 수 있습니다.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
