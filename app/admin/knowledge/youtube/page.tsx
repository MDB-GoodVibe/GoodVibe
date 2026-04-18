import Link from "next/link";
import { redirect } from "next/navigation";

import {
  registerYoutubeChannelAction,
} from "@/app/admin/knowledge/youtube/actions";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentViewer } from "@/lib/auth/viewer";
import {
  listYoutubeChannelsForAdmin,
} from "@/lib/repositories/youtube";

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminKnowledgeYoutubePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const viewer = await getCurrentViewer();
  const params = await searchParams;

  if (!viewer) {
    redirect("/profile");
  }

  if (viewer.role !== "admin") {
    redirect("/admin/knowledge?error=forbidden");
  }

  const channels = await listYoutubeChannelsForAdmin();

  return (
    <main className="flex-1 py-10">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary">
              Admin
            </p>
            <h1 className="text-[1.8rem] font-bold tracking-[-0.04em] text-foreground">
              유튜브 동기화
            </h1>
            <p className="max-w-2xl text-[13px] leading-6 text-muted-foreground">
              채널을 한 번 등록하면 자동화 실행 시 최초 10개 영상을 수집하고, 이후에는 신규 업로드만 반영합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/knowledge">지식 문서 관리로 돌아가기</Link>
            </Button>
            <Button variant="secondary" size="sm" disabled title="현재 Codex 자동화 전용으로 운영 중입니다.">
              일일 동기화 (비활성화)
            </Button>
          </div>
        </div>

        {params.success ? (
          <div className="rounded-[1rem] border border-[rgba(81,163,163,0.22)] bg-[rgba(81,163,163,0.08)] px-4 py-3 text-[13px] text-primary">
            {params.success}
          </div>
        ) : null}

        {params.error ? (
          <div className="rounded-[1rem] border border-[rgba(255,107,108,0.22)] bg-[rgba(255,107,108,0.08)] px-4 py-3 text-[13px] text-secondary">
            {params.error}
          </div>
        ) : null}

        <section className="rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(37,31,74,0.05)]">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-primary">채널 등록</h2>
            <p className="text-[13px] leading-6 text-muted-foreground">
              채널 URL, @핸들, 채널 ID(UC...)를 지원합니다.
            </p>
            <p className="text-[12px] leading-6 text-muted-foreground">
              수집/요약 실행은 수동 버튼 대신 Codex 자동화(`YouTube Daily Knowledge Sync`)로만 동작합니다.
            </p>
          </div>
          <form action={registerYoutubeChannelAction} className="mt-4 flex gap-2">
            <Input
              name="channelInput"
              placeholder="https://www.youtube.com/@fireship"
              required
            />
            <FormSubmitButton idleLabel="등록" pendingLabel="등록 중..." />
          </form>
        </section>

        <section className="rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-white shadow-[0_14px_30px_rgba(37,31,74,0.05)]">
          <div className="border-b border-[rgba(121,118,127,0.08)] px-5 py-4">
            <h2 className="text-lg font-semibold text-primary">등록된 채널</h2>
          </div>

          {channels.length > 0 ? (
            <div className="divide-y divide-[rgba(121,118,127,0.08)]">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]"
                >
                  <div className="space-y-1">
                    <p className="text-[15px] font-semibold text-primary">{channel.title}</p>
                    <p className="text-xs text-muted-foreground">{channel.youtubeChannelId}</p>
                    <p className="text-xs text-muted-foreground">
                      {channel.handle ? `@${channel.handle}` : "-"}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p className="font-semibold text-primary">마지막 동기화</p>
                    <p>{formatDate(channel.lastSyncedAt)}</p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p className="font-semibold text-primary">마지막 업로드</p>
                    <p>{formatDate(channel.lastVideoPublishedAt)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={channel.channelUrl} target="_blank" rel="noreferrer">
                        채널 열기
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled
                      title="현재 Codex 자동화 전용으로 운영 중입니다."
                    >
                      초기 수집 (비활성화)
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              아직 등록된 채널이 없습니다.
            </p>
          )}
        </section>

      </div>
    </main>
  );
}
