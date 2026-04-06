import "server-only";

import { parseIdeaReferenceLinks } from "@/lib/ideas/reference-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IdeaPost, IdeaSort } from "@/types/good-vibe";

type IdeaRow = {
  id: string;
  title: string;
  content: string;
  reference_links: string | null;
  author_id: string;
  status: string;
  upvote_count: number | null;
  created_at: string;
  updated_at: string;
  profiles?: { nickname?: string | null } | Array<{ nickname?: string | null }> | null;
};

function normalizeIdeaRow(
  row: IdeaRow,
  viewerHasVoted: boolean,
): IdeaPost {
  const authorProfile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    referenceLinks: parseIdeaReferenceLinks(row.reference_links),
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

async function getViewerVoteIds(
  ideaIds: string[],
  viewerId?: string | null,
) {
  if (!viewerId || ideaIds.length === 0) {
    return new Set<string>();
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return new Set<string>();
  }

  const { data: votes } = await supabase
    .from("idea_votes")
    .select("idea_id")
    .eq("user_id", viewerId)
    .in("idea_id", ideaIds);

  return new Set((votes ?? []).map((vote) => vote.idea_id));
}

export async function listIdeaPosts(
  sort: IdeaSort = "latest",
  viewerId?: string | null,
  query?: string,
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as IdeaPost[];
  }

  let request = supabase
    .from("ideas")
    .select(
      "id,title,content,reference_links,author_id,status,upvote_count,created_at,updated_at,profiles:profiles!ideas_author_id_fkey(nickname)",
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
    return [] as IdeaPost[];
  }

  const votedIds = await getViewerVoteIds(
    data.map((item) => item.id),
    viewerId,
  );

  return data.map((item) => normalizeIdeaRow(item, votedIds.has(item.id)));
}

export async function listIdeaPostsByAuthor(authorId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as IdeaPost[];
  }

  const { data, error } = await supabase
    .from("ideas")
    .select(
      "id,title,content,reference_links,author_id,status,upvote_count,created_at,updated_at,profiles:profiles!ideas_author_id_fkey(nickname)",
    )
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [] as IdeaPost[];
  }

  return data.map((item) => normalizeIdeaRow(item, false));
}

export async function getIdeaPostById(
  ideaId: string,
  viewerId?: string | null,
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("ideas")
    .select(
      "id,title,content,reference_links,author_id,status,upvote_count,created_at,updated_at,profiles:profiles!ideas_author_id_fkey(nickname)",
    )
    .eq("id", ideaId)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const votedIds = await getViewerVoteIds([ideaId], viewerId);

  return normalizeIdeaRow(data, votedIds.has(ideaId));
}

export async function getEditableIdeaPostById(
  ideaId: string,
  viewerId: string,
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("ideas")
    .select(
      "id,title,content,reference_links,author_id,status,upvote_count,created_at,updated_at,profiles:profiles!ideas_author_id_fkey(nickname)",
    )
    .eq("id", ideaId)
    .eq("author_id", viewerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeIdeaRow(data, false);
}
