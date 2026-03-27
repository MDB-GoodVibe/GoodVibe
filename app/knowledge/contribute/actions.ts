"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentViewer } from "@/lib/auth/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KnowledgeTrack } from "@/types/good-vibe";

function normalizeCategory(value: string): KnowledgeTrack {
  if (
    value === "level-up" ||
    value === "tips" ||
    value === "external"
  ) {
    return value;
  }

  return "basics";
}

export async function createKnowledgeSubmissionAction(formData: FormData) {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/profile");
  }

  const category = normalizeCategory(String(formData.get("category") ?? "basics"));
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const resourceUrl = String(formData.get("resourceUrl") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();

  if (!title || !summary || !details) {
    redirect("/knowledge/contribute?error=required");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/setup");
  }

  const { error } = await supabase.from("knowledge_submissions").insert({
    requester_id: viewer.id,
    category,
    title,
    summary,
    resource_url: resourceUrl || null,
    details,
    status: "pending",
  });

  if (error) {
    redirect("/knowledge/contribute?error=save");
  }

  revalidatePath("/knowledge/contribute");
  revalidatePath("/admin/knowledge/submissions");
  redirect("/knowledge/contribute?success=1");
}
