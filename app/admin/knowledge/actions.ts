"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentViewer } from "@/lib/auth/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KnowledgeTrack } from "@/types/good-vibe";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeTrack(value: string): KnowledgeTrack {
  if (
    value === "level-up" ||
    value === "tips" ||
    value === "external"
  ) {
    return value;
  }

  return "basics";
}

export async function createKnowledgeArticleAction(formData: FormData) {
  const viewer = await getCurrentViewer();

  if (!viewer || viewer.role !== "admin") {
    redirect("/admin/knowledge?error=forbidden");
  }

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const contentMd = String(formData.get("contentMd") ?? "").trim();
  const track = normalizeTrack(String(formData.get("track") ?? "basics"));
  const topic = String(formData.get("topic") ?? "concepts-and-tips").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const resourceUrl = String(formData.get("resourceUrl") ?? "").trim();

  if (!title || !summary || !contentMd) {
    redirect("/admin/knowledge/new?error=required");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/setup");
  }

  const slug = slugInput || slugify(title);

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
    author_id: viewer.id,
  });

  if (error) {
    redirect("/admin/knowledge/new?error=save");
  }

  revalidatePath("/admin/knowledge");
  revalidatePath("/admin/knowledge/submissions");
  revalidatePath("/knowledge/basics");
  revalidatePath("/knowledge/level-up");
  revalidatePath("/knowledge/tips");
  revalidatePath("/knowledge/external");
  redirect("/admin/knowledge");
}
