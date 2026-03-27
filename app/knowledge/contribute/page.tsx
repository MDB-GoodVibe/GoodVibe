import Link from "next/link";
import { redirect } from "next/navigation";

import { createKnowledgeSubmissionAction } from "@/app/knowledge/contribute/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentViewer } from "@/lib/auth/viewer";
import { listKnowledgeSubmissionsForViewer } from "@/lib/repositories/knowledge-submissions";
import type {
  KnowledgeSubmissionStatus,
  KnowledgeTrack,
} from "@/types/good-vibe";

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
  }).format(new Date(value));
}

export default async function KnowledgeContributePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const viewer = await getCurrentViewer();
  const params = await searchParams;

  if (!viewer) {
    redirect("/profile");
  }

  const submissions = await listKnowledgeSubmissionsForViewer(viewer.id);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <span className="inline-flex rounded-full bg-[rgba(255,107,108,0.08)] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
          Knowledge Contribution
        </span>
        <h1 className="max-w-4xl text-[clamp(2.6rem,4.6vw,4.4rem)] font-extrabold leading-[1.04] tracking-[-0.07em] text-primary">
          좋은 지식을 제보해 주세요
        </h1>
        <p className="max-w-3xl text-base leading-8 text-muted-foreground">
          새로운 가이드, 유용한 링크, 실제로 도움이 되었던 팁을 보내주시면 관리자가 검토 후 지식
          베이스에 반영합니다.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[2rem] border border-[rgba(121,118,127,0.08)] px-6 py-6">
          <form action={createKnowledgeSubmissionAction} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-semibold text-foreground">
                  카테고리
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue="basics"
                  className="h-12 w-full rounded-2xl border border-[rgba(121,118,127,0.12)] bg-white px-4 text-sm text-foreground outline-none"
                >
                  <option value="basics">기초</option>
                  <option value="level-up">레벨업</option>
                  <option value="tips">꿀팁</option>
                  <option value="external">외부지식창고</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="resourceUrl" className="text-sm font-semibold text-foreground">
                  참고 링크
                </label>
                <Input id="resourceUrl" name="resourceUrl" placeholder="https://example.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-foreground">
                제목
              </label>
              <Input id="title" name="title" placeholder="예: Claude Code 설치 체크리스트" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="summary" className="text-sm font-semibold text-foreground">
                한 줄 요약
              </label>
              <Textarea
                id="summary"
                name="summary"
                className="min-h-24"
                placeholder="이 지식이 왜 도움이 되는지 짧게 적어 주세요."
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="details" className="text-sm font-semibold text-foreground">
                제보 내용
              </label>
              <Textarea
                id="details"
                name="details"
                className="min-h-40"
                placeholder="핵심 내용, 추천 이유, 어떤 사용자에게 도움이 되는지 적어 주세요."
                required
              />
            </div>

            {params.error ? (
              <p className="rounded-[1rem] bg-[rgba(255,107,108,0.08)] px-4 py-3 text-sm text-secondary">
                필수 항목을 확인한 뒤 다시 제출해 주세요.
              </p>
            ) : null}

            {params.success ? (
              <p className="rounded-[1rem] bg-[rgba(81,163,163,0.12)] px-4 py-3 text-sm text-primary">
                제보가 등록되었습니다. 관리자가 검토 후 상태를 업데이트합니다.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" variant="secondary">
                지식 제보하기
              </Button>
              <Button asChild variant="outline">
                <Link href="/knowledge/basics">지식창고로 돌아가기</Link>
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="surface-subtle rounded-[2rem] px-6 py-6">
            <p className="text-2xl font-bold tracking-[-0.04em] text-primary">제보 전에 확인해 주세요</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>중복 링크보다 직접 도움이 된 이유를 함께 적어 주면 검토가 훨씬 쉬워집니다.</li>
              <li>외부 자료는 공식 문서, 안정적인 가이드, 검증된 튜토리얼 위주로 추천해 주세요.</li>
              <li>프롬프트 팁은 복사해서 바로 써볼 수 있는 예시가 있으면 더 좋습니다.</li>
            </ul>
          </div>

          <div className="surface-subtle rounded-[2rem] px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-2xl font-bold tracking-[-0.04em] text-primary">내 제보 내역</p>
              <span className="text-sm text-muted-foreground">{submissions.length}건</span>
            </div>
            <div className="mt-5 space-y-3">
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-[1.4rem] border border-[rgba(121,118,127,0.08)] bg-white px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-[rgba(59,53,97,0.08)] px-3 py-1 font-bold text-primary">
                        {categoryLabelMap[submission.category]}
                      </span>
                      <span className="rounded-full bg-[rgba(255,107,108,0.08)] px-3 py-1 font-bold text-secondary">
                        {statusLabelMap[submission.status]}
                      </span>
                      <span>{formatDate(submission.createdAt)}</span>
                    </div>
                    <h2 className="mt-3 text-lg font-bold tracking-[-0.03em] text-primary">
                      {submission.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {submission.summary}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-[rgba(121,118,127,0.18)] px-4 py-6 text-sm text-muted-foreground">
                  아직 등록한 제보가 없습니다. 좋은 자료를 발견했다면 첫 제보를 남겨 보세요.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
