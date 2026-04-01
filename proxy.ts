import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { normalizeNickname } from "@/lib/auth/nickname";
import { getSupabasePublicRuntime } from "@/lib/env";

export async function proxy(request: NextRequest) {
  const runtime = getSupabasePublicRuntime();

  if (!runtime.supabaseUrl || !runtime.browserKey) {
    return NextResponse.next({
      request,
    });
  }

  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    runtime.supabaseUrl,
    runtime.browserKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;
  const allowIncompleteProfile =
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/onboarding") ||
    pathname.startsWith("/setup");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || allowIncompleteProfile) {
    return response;
  }

  let nickname = normalizeNickname(user.user_metadata?.nickname);

  if (!nickname) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .maybeSingle();

      nickname = normalizeNickname(profile?.nickname);
    } catch {
      nickname = null;
    }
  }

  if (nickname) {
    return response;
  }

  const nextPath =
    pathname === "/" || pathname === "/profile"
      ? "/home"
      : `${pathname}${request.nextUrl.search}`;

  const redirectResponse = NextResponse.redirect(
    new URL(`/auth/onboarding?next=${encodeURIComponent(nextPath)}`, request.url),
  );

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
