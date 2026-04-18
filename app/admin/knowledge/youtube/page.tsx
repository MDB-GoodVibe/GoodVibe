import Link from "next/link";
import { redirect } from "next/navigation";

import {
  enqueueYoutubeBackfillAction,
  enqueueYoutubeDailySyncAction,
  registerYoutubeChannelAction,
} from "@/app/admin/knowledge/youtube/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentViewer } from "@/lib/auth/viewer";
import {
  listYoutubeChannelsForAdmin,
  listYoutubeSyncJobsForAdmin,
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

function formatJobPayload(payload: Record<string, unknown>) {
  const channelId =
    typeof payload.youtubeChannelId === "string" ? payload.youtubeChannelId : null;

  if (channelId) {
    return channelId;
  }

  return "전체 활성 채널";
}

function formatJobType(value: string) {
  if (value === "backfill") {
    return "초기 수집";
  }

  if (value === "daily") {
    return "일일 동기화";
  }

  return value;
}

function formatJobStatus(value: string) {
  if (value === "pending") {
    return "대기";
  }

  if (value === "running") {
    return "실행 중";
  }

  if (value === "retrying") {
    return "재시도 대기";
  }

  if (value === "completed") {
    return "완료";
  }

  if (value === "failed") {
    return "실패";
  }

  return value;
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

  const [channels, jobs] = await Promise.all([
    listYoutubeChannelsForAdmin(),
    listYoutubeSyncJobsForAdmin(30),
  ]);

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
              채널을 한 번 등록해 두면 매일 자동화 실행 시 신규 채널은 최신 10개를 초기 수집하고, 이후에는 신규 업로드만 반영합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/knowledge">지식 문서 관리로 돌아가기</Link>
            </Button>
            <form action={enqueueYoutubeDailySyncAction}>
              <Button type="submit" variant="secondary" size="sm">
                지금 일일 동기화 실행
              </Button>
            </form>
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
          </div>
          <form action={registerYoutubeChannelAction} className="mt-4 flex gap-2">
            <Input
              name="channelInput"
              placeholder="https://www.youtube.com/@fireship"
              required
            />
            <Button type="submit">등록</Button>
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
                    <p className="text-[15px] font-semibold text-primary">
                      {channel.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {channel.youtubeChannelId}
                    </p>
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
                    <form action={enqueueYoutubeBackfillAction}>
                      <input
                        type="hidden"
                        name="youtubeChannelId"
                        value={channel.youtubeChannelId}
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        초기 수집
                      </Button>
                    </form>
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

        <section className="rounded-[1.8rem] border border-[rgba(121,118,127,0.08)] bg-white shadow-[0_14px_30px_rgba(37,31,74,0.05)]">
          <div className="border-b border-[rgba(121,118,127,0.08)] px-5 py-4">
            <h2 className="text-lg font-semibold text-primary">동기화 작업 내역</h2>
          </div>
          {jobs.length > 0 ? (
            <div className="divide-y divide-[rgba(121,118,127,0.08)]">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[0.7fr_0.7fr_1fr_1.2fr]"
                >
                  <div className="text-xs">
                    <p className="font-semibold text-primary">{formatJobType(job.jobType)}</p>
                    <p className="text-muted-foreground">{formatJobStatus(job.status)}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>시도 횟수: {job.attempts}</p>
                    <p>예약 시각: {formatDate(job.scheduledAt)}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>대상: {formatJobPayload(job.payload)}</p>
                    <p>시작: {formatDate(job.startedAt)}</p>
                    <p>종료: {formatDate(job.finishedAt)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {job.error ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              아직 동기화 작업 내역이 없습니다.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
