import { NextResponse, type NextRequest } from "next/server";

import { normalizeNickname } from "@/lib/auth/nickname";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/home";

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/setup", url.origin));
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/profile", url.origin));
  }

  const nickname = normalizeNickname(user.user_metadata?.nickname);

  if (!nickname) {
    return NextResponse.redirect(
      new URL(`/auth/onboarding?next=${encodeURIComponent(next)}`, url.origin),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
