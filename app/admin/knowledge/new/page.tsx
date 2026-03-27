import Link from "next/link";
import { redirect } from "next/navigation";

import { createKnowledgeArticleAction } from "@/app/admin/knowledge/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentViewer } from "@/lib/auth/viewer";

export default async function AdminKnowledgeNewPage({
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
    redirect("/admin/knowledge?error=forbidden");
  }

  return (
    <main className="flex-1 py-10">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
            Admin
          </p>
          <h1 className="text-[1.8rem] font-bold tracking-[-0.04em] text-foreground">
            지식 글 작성
          </h1>
          <p className="text-[13px] leading-6 text-muted-foreground">
            필요한 정보만 입력해서 빠르게 초안을 저장할 수 있게 정리했습니다.
          </p>
        </div>

        <section className="rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-white px-6 py-6 shadow-[0_14px_28px_rgba(37,31,74,0.05)]">
          <form action={createKnowledgeArticleAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-foreground" htmlFor="track">
                  트랙
                </label>
                <select
                  id="track"
                  name="track"
                  className="h-11 w-full rounded-xl border border-[rgba(121,118,127,0.12)] bg-white px-4 text-[13px] text-foreground outline-none"
                  defaultValue="basics"
                >
                  <option value="basics">기초</option>
                  <option value="level-up">레벨업</option>
                  <option value="tips">꿀팁</option>
                  <option value="external">외부지식창고</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-foreground" htmlFor="topic">
                  주제
                </label>
                <Input id="topic" name="topic" defaultValue="concepts-and-tips" required className="h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground" htmlFor="title">
                제목
              </label>
              <Input id="title" name="title" required className="h-11" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-foreground" htmlFor="slug">
                  슬러그
                </label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="비워두면 제목 기준으로 자동 생성"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-foreground" htmlFor="resourceUrl">
                  외부 링크
                </label>
                <Input id="resourceUrl" name="resourceUrl" placeholder="https://example.com" className="h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground" htmlFor="summary">
                요약
              </label>
              <Textarea id="summary" name="summary" className="min-h-24" required />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground" htmlFor="contentMd">
                본문
              </label>
              <Textarea id="contentMd" name="contentMd" className="min-h-64" required />
            </div>

            {params.error ? (
              <p className="text-[13px] text-secondary">
                저장에 실패했습니다. 권한 또는 입력값을 다시 확인해 주세요.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm">초안 저장</Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/knowledge">취소</Link>
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
