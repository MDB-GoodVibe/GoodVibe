import "server-only";

import { classifyExternalResource } from "@/lib/knowledge/external-resource";
import { seedKnowledgeArticles } from "@/lib/mock/knowledge-library";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { KnowledgeArticle, KnowledgeTrack } from "@/types/good-vibe";

function normalizeKnowledgeRow(
  row: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    content_md: string;
    track: string;
    topic: string;
    status: string;
    featured: boolean | null;
    platform_tags: string[] | null;
    tool_tags: string[] | null;
    resource_url: string | null;
    external_provider: string | null;
    external_source_id: string | null;
    external_source_label: string | null;
    external_item_id: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
  },
): KnowledgeArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    contentMd: row.content_md,
    track:
      row.track === "level-up" ||
      row.track === "tips" ||
      row.track === "external"
        ? row.track
        : "basics",
    topic: row.topic,
    status: row.status === "draft" ? "draft" : "published",
    featured: Boolean(row.featured),
    platformTags: row.platform_tags ?? [],
    toolTags: row.tool_tags ?? [],
    resourceUrl: row.resource_url ?? null,
    authorName: "Good Vibe",
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    externalProvider: row.external_provider ?? null,
    externalSourceId: row.external_source_id ?? null,
    externalSourceLabel: row.external_source_label ?? null,
    externalItemId: row.external_item_id ?? null,
    externalTaxonomy:
      row.track === "external" || row.resource_url
        ? classifyExternalResource({
            url: row.resource_url,
            title: row.title,
            summary: row.summary,
            platformTags: row.platform_tags ?? [],
            toolTags: row.tool_tags ?? [],
          })
        : null,
    source: "supabase",
  };
}

export async function listKnowledgeArticles(track: KnowledgeTrack) {
  const supabase = await createSupabaseServerClient();
  const fallbackArticles = seedKnowledgeArticles
    .filter((article) => article.track === track && article.status === "published")
    .sort((left, right) => {
      const featuredDiff = Number(right.featured) - Number(left.featured);

      if (featuredDiff !== 0) {
        return featuredDiff;
      }

      return (
        new Date(right.publishedAt ?? right.createdAt).getTime() -
        new Date(left.publishedAt ?? left.createdAt).getTime()
      );
    });

  if (!supabase) {
    return fallbackArticles;
  }

  const { data, error } = await supabase
    .from("knowledge_articles")
    .select(
      "id,slug,title,summary,content_md,track,topic,status,featured,platform_tags,tool_tags,resource_url,external_provider,external_source_id,external_source_label,external_item_id,published_at,created_at,updated_at",
    )
    .eq("track", track)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error || !data) {
    return fallbackArticles;
  }

  return data.map(normalizeKnowledgeRow);
}

export async function getKnowledgeArticleBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      seedKnowledgeArticles.find(
        (article) => article.slug === slug && article.status === "published",
      ) ?? null
    );
  }

  const { data, error } = await supabase
    .from("knowledge_articles")
    .select(
      "id,slug,title,summary,content_md,track,topic,status,featured,platform_tags,tool_tags,resource_url,external_provider,external_source_id,external_source_label,external_item_id,published_at,created_at,updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return (
      seedKnowledgeArticles.find(
        (article) => article.slug === slug && article.status === "published",
      ) ?? null
    );
  }

  return normalizeKnowledgeRow(data);
}

export async function getKnowledgeArticleById(id: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      seedKnowledgeArticles.find(
        (article) => article.id === id && article.status === "published",
      ) ?? null
    );
  }

  const { data, error } = await supabase
    .from("knowledge_articles")
    .select(
      "id,slug,title,summary,content_md,track,topic,status,featured,platform_tags,tool_tags,resource_url,external_provider,external_source_id,external_source_label,external_item_id,published_at,created_at,updated_at",
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return (
      seedKnowledgeArticles.find(
        (article) => article.id === id && article.status === "published",
      ) ?? null
    );
  }

  return normalizeKnowledgeRow(data);
}

export async function listKnowledgeArticlesForAdmin() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return seedKnowledgeArticles;
  }

  const { data, error } = await supabase
    .from("knowledge_articles")
    .select(
      "id,slug,title,summary,content_md,track,topic,status,featured,platform_tags,tool_tags,resource_url,external_provider,external_source_id,external_source_label,external_item_id,published_at,created_at,updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return seedKnowledgeArticles;
  }

  return data.map(normalizeKnowledgeRow);
}
