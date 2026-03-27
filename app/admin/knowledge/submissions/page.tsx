import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentViewer } from "@/lib/auth/viewer";
import { listKnowledgeSubmissionsForAdmin } from "@/lib/repositories/knowledge-submissions";
import type { KnowledgeSubmissionStatus, KnowledgeTrack } from "@/types/good-vibe";

const categoryLabelMap: Record<KnowledgeTrack, string> = {
  basics: "기초",
  "level-up": "레벨업",
  tips: "꿀팁",
  external: "외부지식창고",
};

const statusLabelMap: Record<KnowledgeSubmissionStatus, string> = {
  pending: "검토 대기",
  reviewing: "검토 중",
  accepted: "반영 예정",
  rejected: "보류",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminKnowledgeSubmissionsPage() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/profile");
  }

  if (viewer.role !== "admin") {
    redirect("/admin/knowledge?error=forbidden");
  }

  const submissions = await listKnowledgeSubmissionsForAdmin();

  return (
    <main className="flex-1 py-10">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
              Admin
            </p>
            <h1 className="text-[1.8rem] font-bold tracking-[-0.04em] text-foreground">
              지식 제보함
            </h1>
            <p className="text-[13px] leading-6 text-muted-foreground">
              사용자 제보를 간단히 확인하고 필요한 링크를 열 수 있습니다.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/knowledge">문서 관리로 돌아가기</Link>
          </Button>
        </div>

        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <article
                key={submission.id}
                className="rounded-[1.5rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_10px_22px_rgba(37,31,74,0.04)]"
              >
                <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                  <span className="rounded-full bg-[rgba(59,53,97,0.08)] px-3 py-1 font-semibold text-primary">
                    {categoryLabelMap[submission.category]}
                  </span>
                  <span className="rounded-full bg-[rgba(255,107,108,0.08)] px-3 py-1 font-semibold text-secondary">
                    {statusLabelMap[submission.status]}
                  </span>
                  <span>{submission.requesterName}</span>
                  <span>{formatDate(submission.createdAt)}</span>
                </div>

                <h2 className="mt-4 text-[1.1rem] font-semibold tracking-[-0.03em] text-primary">
                  {submission.title}
                </h2>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                  {submission.summary}
                </p>
                <div className="mt-4 rounded-[1.1rem] bg-[rgba(244,243,243,0.92)] px-4 py-4 text-[13px] leading-6 text-foreground/82">
                  {submission.details}
                </div>

                {submission.resourceUrl ? (
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={submission.resourceUrl} target="_blank" rel="noreferrer">
                        참고 링크 열기
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-[rgba(121,118,127,0.18)] bg-white px-6 py-8 text-[13px] text-muted-foreground">
            아직 등록된 지식 제보가 없습니다.
          </div>
        )}
      </div>
    </main>
  );
}
