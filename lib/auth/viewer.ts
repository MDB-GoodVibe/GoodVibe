import "server-only";

import { normalizeNickname } from "@/lib/auth/nickname";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ViewerProfile, ViewerRole } from "@/types/good-vibe";

function extractNickname(user: {
  user_metadata?: Record<string, unknown> | null;
}) {
  return normalizeNickname(user.user_metadata?.nickname);
}

function extractRole(user: {
  user_metadata?: Record<string, unknown> | null;
}): ViewerRole {
  const role = user.user_metadata?.role;
  return role === "admin" ? "admin" : "user";
}

export async function getCurrentViewer(): Promise<ViewerProfile | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let nickname = extractNickname(user);
  let avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;
  let role: ViewerRole = extractRole(user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    nickname = normalizeNickname(profile.nickname) ?? nickname;
    avatarUrl =
      typeof profile.avatar_url === "string" ? profile.avatar_url : avatarUrl;
    role = profile.role === "admin" ? "admin" : role;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    nickname,
    avatarUrl,
    role,
  };
}
