"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createIdeaPostAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    redirect("/ideas/new?error=required");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/setup");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/profile");
  }

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      title,
      content,
      author_id: user.id,
      status: "published",
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/ideas/new?error=save");
  }

  revalidatePath("/ideas");
  redirect(`/ideas/${data.id}`);
}

export async function toggleIdeaVoteAction(formData: FormData) {
  const ideaId = String(formData.get("ideaId") ?? "").trim();

  if (!ideaId) {
    return;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/setup");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/profile?next=/ideas/${ideaId}`);
  }

  const { data: existingVote } = await supabase
    .from("idea_votes")
    .select("idea_id")
    .eq("idea_id", ideaId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingVote) {
    await supabase
      .from("idea_votes")
      .delete()
      .eq("idea_id", ideaId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("idea_votes").insert({
      idea_id: ideaId,
      user_id: user.id,
    });
  }

  revalidatePath("/ideas");
  revalidatePath(`/ideas/${ideaId}`);
}
