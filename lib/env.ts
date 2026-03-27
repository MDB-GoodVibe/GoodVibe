export interface SupabasePublicRuntime {
  siteUrl: string;
  supabaseUrl: string | null;
  publishableKey: string | null;
  legacyAnonKey: string | null;
  browserKey: string | null;
}

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getSupabasePublicRuntime(): SupabasePublicRuntime {
  const publishableKey = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const legacyAnonKey = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return {
    siteUrl:
      normalizeEnvValue(process.env.NEXT_PUBLIC_SITE_URL) ??
      "http://localhost:3000",
    supabaseUrl: normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey,
    legacyAnonKey,
    browserKey: publishableKey ?? legacyAnonKey,
  };
}

export function hasSupabasePublicEnv() {
  const runtime = getSupabasePublicRuntime();
  return Boolean(runtime.supabaseUrl && runtime.browserKey);
}

export function getSupabaseSetupChecklist() {
  const runtime = getSupabasePublicRuntime();

  return {
    siteUrl: Boolean(runtime.siteUrl),
    supabaseUrl: Boolean(runtime.supabaseUrl),
    browserKey: Boolean(runtime.browserKey),
    publishableKey: Boolean(runtime.publishableKey),
    legacyAnonKey: Boolean(runtime.legacyAnonKey),
  };
}
