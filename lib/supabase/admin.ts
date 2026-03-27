import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicRuntime } from "@/lib/env";

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getSupabaseAdminKey() {
  return (
    normalizeEnvValue(process.env.SUPABASE_SECRET_KEY) ??
    normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export function hasSupabaseAdminEnv() {
  const runtime = getSupabasePublicRuntime();
  return Boolean(runtime.supabaseUrl && getSupabaseAdminKey());
}

export function createSupabaseAdminClient() {
  const runtime = getSupabasePublicRuntime();
  const adminKey = getSupabaseAdminKey();

  if (!runtime.supabaseUrl || !adminKey) {
    return null;
  }

  return createClient(runtime.supabaseUrl, adminKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
