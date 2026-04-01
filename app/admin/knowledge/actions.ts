"use server";

import { revalidatePath } from "next/cache";

import {
  getDefaultKnowledgeTopic,
  isValidKnowledgeTopic,
  normalizeKnowledgeTrack,
  slugifyKnowledgeTitle,
} from "@/lib/knowledge/editor";
import { getCurrentViewer } from "@/lib/auth/viewer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CreateKnowledgeArticleInput,
  CreateKnowledgeArticleResult,
  GenerateKnowledgeDraftInput,
  GenerateKnowledgeDraftResult,
} from "@/types/admin-knowledge";

type SupabaseWritableClient =
  | NonNullable<ReturnType<typeof createSupabaseAdminClient>>
  | NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

function cleanText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

async function getWritableSupabaseClient(): Promise<SupabaseWritableClient | null> {
  const adminClient = createSupabaseAdminClient();

  if (adminClient) {
    return adminClient;
  }

  return createSupabaseServerClient();
}

async function requireAdminViewer() {
  const viewer = await getCurrentViewer();

  if (!viewer || viewer.role !== "admin") {
    return null;
  }

  return viewer;
}

function normalizeTopic(track: ReturnType<typeof normalizeKnowledgeTrack>, topic: string) {
  const trimmed = topic.trim();
  return isValidKnowledgeTopic(track, trimmed)
    ? trimmed
    : getDefaultKnowledgeTopic(track);
}

async function resolveUniqueSlug(
  supabase: SupabaseWritableClient,
  desiredSlug: string,
) {
  const baseSlug = slugifyKnowledgeTitle(desiredSlug);
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("knowledge_articles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function generateKnowledgeDraftAction(
  input: GenerateKnowledgeDraftInput,
): Promise<GenerateKnowledgeDraftResult> {
  const viewer = await requireAdminViewer();

  if (!viewer) {
    return {
      ok: false,
      error: "관리자만 AI 초안을 생성할 수 있습니다.",
      warnings: [],
    };
  }

  const track = normalizeKnowledgeTrack(input.track);
  const topic = normalizeTopic(track, input.topic);
  const titleHint = cleanText(input.titleHint);
  const summaryHint = cleanText(input.summaryHint);
  const details = cleanText(input.details);
  const resourceUrl = cleanText(input.resourceUrl);

  if (!titleHint && !summaryHint && !details && !resourceUrl) {
    return {
      ok: false,
      error: "AI 생성을 위해 최소 한 가지 이상의 정보나 링크를 입력해 주세요.",
      warnings: [],
    };
  }

  const supabase = await getWritableSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      error: "Supabase 설정이 없어 AI 초안을 생성할 수 없습니다.",
      warnings: [],
    };
  }

  const { data, error } = await supabase.functions.invoke(
    "generate-knowledge-draft",
    {
      body: {
        track,
        topic,
        titleHint,
        summaryHint,
        details,
        resourceUrl: resourceUrl || null,
        sourceSubmissionId: cleanText(input.sourceSubmissionId ?? "") || null,
      },
    },
  );

  if (error) {
    return {
      ok: false,
      error: "AI 초안 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      warnings: [],
    };
  }

  const title =
    typeof data?.title === "string" ? data.title.trim() : "";
  const summary =
    typeof data?.summary === "string" ? data.summary.trim() : "";
  const contentMd =
    typeof data?.contentMd === "string" ? data.contentMd.trim() : "";
  const warnings = Array.isArray(data?.warnings)
    ? data.warnings.filter(
        (warning: unknown): warning is string => typeof warning === "string",
      )
    : [];

  if (!title || !summary || !contentMd) {
    return {
      ok: false,
      error: "AI가 초안을 충분히 생성하지 못했습니다. 입력 정보를 조금 더 보강해 주세요.",
      warnings,
    };
  }

  return {
    ok: true,
    warnings,
    draft: {
      title,
      summary,
      contentMd,
    },
  };
}

export async function createKnowledgeArticleAction(
  input: CreateKnowledgeArticleInput,
): Promise<CreateKnowledgeArticleResult> {
  const viewer = await requireAdminViewer();

  if (!viewer) {
    return {
      ok: false,
      error: "관리자만 문서를 저장할 수 있습니다.",
    };
  }

  const supabase = await getWritableSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      error: "Supabase 설정이 없어 문서를 저장할 수 없습니다.",
    };
  }

  const mode = input.mode === "ai" ? "ai" : "manual";
  const track = normalizeKnowledgeTrack(input.track);
  const topic = normalizeTopic(track, input.topic);
  const title = cleanText(input.title);
  const summary = cleanText(input.summary);
  const contentMd = cleanText(input.contentMd);
  const resourceUrl = cleanText(input.resourceUrl);
  const sourceSubmissionId = cleanText(input.sourceSubmissionId ?? "") || null;

  if (!title || !summary || !contentMd) {
    return {
      ok: false,
      error: "제목, 요약, Markdown 본문은 모두 입력해 주세요.",
    };
  }

  if (mode === "ai" && !input.aiGenerated) {
    return {
      ok: false,
      error: "AI 모드에서는 초안을 먼저 생성한 뒤 저장해 주세요.",
    };
  }

  let slug: string;

  try {
    slug = await resolveUniqueSlug(
      supabase,
      cleanText(input.slug) || title,
    );
  } catch {
    return {
      ok: false,
      error: "slug를 확인하는 중 문제가 발생했습니다.",
    };
  }

  const { error } = await supabase.from("knowledge_articles").insert({
    slug,
    title,
    summary,
    content_md: contentMd,
    track,
    topic,
    status: "draft",
    featured: false,
    resource_url: resourceUrl || null,
    source_submission_id: sourceSubmissionId,
    author_id: viewer.id,
  });

  if (error) {
    return {
      ok: false,
      error: "문서 초안을 저장하지 못했습니다. 입력값을 다시 확인해 주세요.",
    };
  }

  if (sourceSubmissionId) {
    await supabase
      .from("knowledge_submissions")
      .update({ status: "reviewing" })
      .eq("id", sourceSubmissionId);
  }

  revalidatePath("/admin/knowledge");
  revalidatePath("/admin/knowledge/new");
  revalidatePath("/admin/knowledge/submissions");
  revalidatePath("/knowledge/basics");
  revalidatePath("/knowledge/level-up");
  revalidatePath("/knowledge/tips");
  revalidatePath("/knowledge/external");

  return {
    ok: true,
    redirectTo: "/admin/knowledge",
    slug,
  };
}
