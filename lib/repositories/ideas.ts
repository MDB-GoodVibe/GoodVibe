import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { seedIdeaPosts } from "@/lib/mock/good-vibe-seed";
import type { IdeaPost, IdeaSort } from "@/types/good-vibe";

function filterIdeas(items: IdeaPost[], query?: string) {
  const normalizedQuery = query?.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    const haystack = `${item.title} ${item.content} ${item.authorName}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

function sortIdeas(items: IdeaPost[], sort: IdeaSort) {
  const cloned = [...items];

  if (sort === "popular") {
    return cloned.sort((a, b) => b.upvoteCount - a.upvoteCount);
  }

  return cloned.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function normalizeIdeaRow(
  row: {
    id: string;
    title: string;
    content: string;
    author_id: string;
    status: string;
    upvote_count: number | null;
    created_at: string;
    updated_at: string;
    profiles?: { nickname?: string | null } | Array<{ nickname?: string | null }> | null;
  },
  viewerHasVoted: boolean,
): IdeaPost {
  const authorProfile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    authorId: row.author_id,
    authorName: authorProfile?.nickname || "Good Vibe 사용자",
    status: row.status === "hidden" ? "hidden" : "published",
    upvoteCount: row.upvote_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    viewerHasVoted,
    source: "supabase",
  };
}

export async function listIdeaPosts(
  sort: IdeaSort = "latest",
  viewerId?: string | null,
  query?: string,
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return sortIdeas(filterIdeas(seedIdeaPosts, query), sort);
  }

  let request = supabase
    .from("ideas")
    .select(
      "id,title,content,author_id,status,upvote_count,created_at,updated_at,profiles:profiles!ideas_author_id_fkey(nickname)",
    )
    .eq("status", "published");

  const normalizedQuery = query?.trim();

  if (normalizedQuery) {
    request = request.or(
      `title.ilike.%${normalizedQuery}%,content.ilike.%${normalizedQuery}%`,
    );
  }

  const { data, error } = await request.order(
    sort === "popular" ? "upvote_count" : "created_at",
    {
      ascending: false,
    },
  );

  if (error || !data) {
    return sortIdeas(filterIdeas(seedIdeaPosts, query), sort);
  }

  let votedIds = new Set<string>();

  if (viewerId && data.length > 0) {
    const { data: votes } = await supabase
      .from("idea_votes")
      .select("idea_id")
      .eq("user_id", viewerId)
      .in(
        "idea_id",
        data.map((item) => item.id),
      );

    votedIds = new Set((votes ?? []).map((vote) => vote.idea_id));
  }

  return data.map((item) => normalizeIdeaRow(item, votedIds.has(item.id)));
}

export async function getIdeaPostById(
  ideaId: string,
  viewerId?: string | null,
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return seedIdeaPosts.find((item) => item.id === ideaId) ?? null;
  }

  const { data, error } = await supabase
    .from("ideas")
    .select(
      "id,title,content,author_id,status,upvote_count,created_at,updated_at,profiles:profiles!ideas_author_id_fkey(nickname)",
    )
    .eq("id", ideaId)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return seedIdeaPosts.find((item) => item.id === ideaId) ?? null;
  }

  let viewerHasVoted = false;

  if (viewerId) {
    const { data: vote } = await supabase
      .from("idea_votes")
      .select("idea_id")
      .eq("idea_id", ideaId)
      .eq("user_id", viewerId)
      .maybeSingle();

    viewerHasVoted = Boolean(vote);
  }

  return normalizeIdeaRow(data, viewerHasVoted);
}
