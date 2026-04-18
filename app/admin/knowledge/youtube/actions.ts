"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { getCurrentViewer } from "@/lib/auth/viewer";
import {
  enqueueYoutubeSync,
  registerYoutubeChannel,
  runYoutubeDailySync,
  runYoutubeSyncWorker,
} from "@/lib/youtube/sync";

function buildRedirectUrl(input: {
  success?: string;
  error?: string;
}) {
  const params = new URLSearchParams();

  if (input.success) {
    params.set("success", input.success);
  }

  if (input.error) {
    params.set("error", input.error);
  }

  const query = params.toString();
  return query
    ? `/admin/knowledge/youtube?${query}`
    : "/admin/knowledge/youtube";
}

async function requireAdminOrRedirect() {
  const viewer = await getCurrentViewer();

  if (!viewer || viewer.role !== "admin") {
    redirect("/admin/knowledge?error=forbidden");
  }

  return viewer;
}

function refreshYoutubeViews() {
  revalidatePath("/admin/knowledge");
  revalidatePath("/admin/knowledge/youtube");
  revalidatePath("/knowledge/external");
}

function toActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const message =
      "message" in error ? (error as { message?: unknown }).message : undefined;
    const code = "code" in error ? (error as { code?: unknown }).code : undefined;
    const details =
      "details" in error ? (error as { details?: unknown }).details : undefined;

    const parts = [message, code, details]
      .filter(
        (part): part is string =>
          typeof part === "string" && part.trim().length > 0,
      )
      .map((part) => part.trim());

    if (parts.length > 0) {
      return parts.join(" | ");
    }
  }

  return fallback;
}

export async function registerYoutubeChannelAction(formData: FormData) {
  await requireAdminOrRedirect();
  const channelInput = String(formData.get("channelInput") ?? "").trim();

  if (!channelInput) {
    redirect(
      buildRedirectUrl({
        error: "유튜브 채널 URL, @핸들, 또는 채널 ID를 입력해 주세요.",
      }),
    );
  }

  try {
    const result = await registerYoutubeChannel({
      channelInput,
    });
    refreshYoutubeViews();
    redirect(
      buildRedirectUrl({
        success: result.isNewChannel
          ? "유튜브 채널이 등록되었습니다. 일일 자동화 실행 시 최신 10개 영상부터 요약 노트가 생성됩니다."
          : "이미 등록된 유튜브 채널입니다. 이후 일일 자동화에서 신규 영상만 반영됩니다.",
      }),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = toActionErrorMessage(
      error,
      "유튜브 채널 등록에 실패했습니다.",
    );
    redirect(
      buildRedirectUrl({
        error: message,
      }),
    );
  }
}

export async function enqueueYoutubeBackfillAction(formData: FormData) {
  await requireAdminOrRedirect();
  const youtubeChannelId = String(formData.get("youtubeChannelId") ?? "").trim();

  if (!youtubeChannelId) {
    redirect(
      buildRedirectUrl({
        error: "초기 수집 작업 등록을 위해 youtubeChannelId가 필요합니다.",
      }),
    );
  }

  try {
    await enqueueYoutubeSync({
      jobType: "backfill",
      payload: {
        youtubeChannelId,
        source: "manual-backfill",
      },
    });
    await runYoutubeSyncWorker({ maxJobs: 4 });
    refreshYoutubeViews();
    redirect(
      buildRedirectUrl({
        success: `${youtubeChannelId} 채널의 초기 수집 작업이 큐에 추가되었습니다.`,
      }),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = toActionErrorMessage(
      error,
      "초기 수집 작업 등록에 실패했습니다.",
    );
    redirect(
      buildRedirectUrl({
        error: message,
      }),
    );
  }
}

export async function enqueueYoutubeDailySyncAction() {
  await requireAdminOrRedirect();

  try {
    const result = await runYoutubeDailySync();
    refreshYoutubeViews();
    redirect(
      buildRedirectUrl({
        success: `일일 동기화 완료: 처리 작업=${result.processedJobs}, 생성 노트=${result.createdArticles}`,
      }),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = toActionErrorMessage(
      error,
      "일일 동기화 실행에 실패했습니다.",
    );
    redirect(
      buildRedirectUrl({
        error: message,
      }),
    );
  }
}
