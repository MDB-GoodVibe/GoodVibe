
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers.js";

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
          // ?쒕쾭 而댄룷?뚰듃?먯꽌 ?쎄린 ?꾩슜?쇰줈 ?몄텧?섎뒗 寃쎌슦媛 ?덉뼱 議곗슜??臾댁떆?⑸땲??
        }
      },
    },
  });
}
