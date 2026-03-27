import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicRuntime } from "@/lib/env";

export async function createSupabaseServerClient() {
  const runtime = getSupabasePublicRuntime();

  if (!runtime.supabaseUrl || !runtime.browserKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(runtime.supabaseUrl, runtime.browserKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // 서버 컴포넌트에서 읽기 전용으로 호출되는 경우가 있어 조용히 무시합니다.
        }
      },
    },
  });
}
