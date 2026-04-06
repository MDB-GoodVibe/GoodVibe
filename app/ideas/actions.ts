"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  collectIdeaReferenceLinks,
  serializeIdeaReferenceLinks,
} from "@/lib/ideas/reference-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireIdeaAuthor(
  ideaId: string,
  userId: string,
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/setup");
  }

  const { data: idea } = await supabase
    .from("ideas")
    .select("id, author_id")
    .eq("id", ideaId)
    .maybeSingle();

  if (!idea || idea.author_id !== userId) {
    redirect(`/ideas/${ideaId}`);
  }

  return supabase;
}

export type ToggleIdeaVoteState = {
  count: number;
  voted: boolean;
  status: "idle" | "success" | "error";
  redirectTo: string | null;
};

export async function createIdeaPostAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const { links, hasInvalidLink } = collectIdeaReferenceLinks(
    formData.getAll("referenceLinks"),
  );

  if (!title || !content) {
    redirect("/ideas/new?error=required");
  }

  if (hasInvalidLink) {
    redirect("/ideas/new?error=invalid-links");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/setup");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/profile?next=/ideas/new");
  }

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      title,
      content,
      reference_links: serializeIdeaReferenceLinks(links),
      author_id: user.id,
      status: "published",
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/ideas/new?error=save");
  }

  revalidatePath("/ideas");
  revalidatePath("/ideas/mine");
  redirect(`/ideas/${data.id}`);
}

export async function updateIdeaPostAction(formData: FormData) {
  const ideaId = String(formData.get("ideaId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const { links, hasInvalidLink } = collectIdeaReferenceLinks(
    formData.getAll("referenceLinks"),
  );

  if (!ideaId || !title || !content) {
    redirect(`/ideas/${ideaId}/edit?error=required`);
  }

  if (hasInvalidLink) {
    redirect(`/ideas/${ideaId}/edit?error=invalid-links`);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/setup");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/profile?next=/ideas/${ideaId}/edit`);
  }

  const authorScopedSupabase = await requireIdeaAuthor(ideaId, user.id);

  const { error } = await authorScopedSupabase
    .from("ideas")
    .update({
      title,
      content,
      reference_links: serializeIdeaReferenceLinks(links),
    })
    .eq("id", ideaId);

  if (error) {
    redirect(`/ideas/${ideaId}/edit?error=save`);
  }

  revalidatePath("/ideas");
  revalidatePath("/ideas/mine");
  revalidatePath(`/ideas/${ideaId}`);
  redirect(`/ideas/${ideaId}`);
}

export async function toggleIdeaVoteAction(
  previousState: ToggleIdeaVoteState,
  formData: FormData,
) {
  const ideaId = String(formData.get("ideaId") ?? "").trim();
  const nextPath = String(formData.get("nextPath") ?? "").trim();
  const fallbackPath = nextPath || `/ideas/${ideaId}`;

  if (!ideaId) {
    return {
      ...previousState,
      status: "error" as const,
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ...previousState,
      status: "error" as const,
      redirectTo: "/setup",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ...previousState,
      status: "error" as const,
      redirectTo: `/profile?next=${encodeURIComponent(fallbackPath)}`,
    };
  }

  if (previousState.voted) {
    const { error } = await supabase
      .from("idea_votes")
      .delete()
      .eq("idea_id", ideaId)
      .eq("user_id", user.id);

    if (error) {
      return {
        ...previousState,
        status: "error" as const,
      };
    }

    return {
      count: Math.max(0, previousState.count - 1),
      voted: false,
      status: "success" as const,
      redirectTo: null,
    };
  }

  const { error } = await supabase.from("idea_votes").insert({
    idea_id: ideaId,
    user_id: user.id,
  });

  if (error) {
    return {
      ...previousState,
      status: "error" as const,
    };
  }

  return {
    count: previousState.count + 1,
    voted: true,
    status: "success" as const,
    redirectTo: null,
  };
}
