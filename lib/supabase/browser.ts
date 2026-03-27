import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicRuntime } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  const runtime = getSupabasePublicRuntime();

  if (!runtime.supabaseUrl || !runtime.browserKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      runtime.supabaseUrl,
      runtime.browserKey,
    );
  }

  return browserClient;
}

export function requireSupabaseBrowserClient() {
  const client = createSupabaseBrowserClient();

  if (!client) {
    throw new Error(
      "Supabase 환경변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 확인해 주세요.",
    );
  }

  return client;
}
