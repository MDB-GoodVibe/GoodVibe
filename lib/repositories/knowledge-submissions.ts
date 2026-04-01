import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  KnowledgeSubmission,
  KnowledgeSubmissionStatus,
  KnowledgeTrack,
} from "@/types/good-vibe";

function normalizeCategory(value: string): KnowledgeTrack {
  if (value === "level-up" || value === "tips" || value === "external") {
    return value;
  }

  return "basics";
}

function normalizeStatus(value: string): KnowledgeSubmissionStatus {
  if (value === "reviewing" || value === "accepted" || value === "rejected") {
    return value;
  }

  return "pending";
}

function normalizeRow(
  row: {
    id: string;
    requester_id: string;
    category: string;
    title: string;
    summary: string;
    resource_url: string | null;
    details: string;
    status: string;
    created_at: string;
    updated_at: string;
    requester:
      | {
          nickname: string | null;
        }
      | {
          nickname: string | null;
        }[]
      | null;
  },
): KnowledgeSubmission {
  const profile = Array.isArray(row.requester) ? row.requester[0] : row.requester;

  return {
    id: row.id,
    requesterId: row.requester_id,
    requesterName: profile?.nickname?.trim() || "익명 사용자",
    category: normalizeCategory(row.category),
    title: row.title,
    summary: row.summary,
    resourceUrl: row.resource_url,
    details: row.details,
    status: normalizeStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: "supabase",
  };
}

const submissionSelect = `
  id,
  requester_id,
  category,
  title,
  summary,
  resource_url,
  details,
  status,
  created_at,
  updated_at,
  requester:profiles!knowledge_submissions_requester_id_fkey (
    nickname
  )
`;

export async function listKnowledgeSubmissionsForViewer(viewerId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("knowledge_submissions")
    .select(submissionSelect)
    .eq("requester_id", viewerId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(normalizeRow);
}

export async function listKnowledgeSubmissionsForAdmin() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("knowledge_submissions")
    .select(submissionSelect)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(normalizeRow);
}

export async function getKnowledgeSubmissionForAdmin(id: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("knowledge_submissions")
    .select(submissionSelect)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeRow(data);
}
