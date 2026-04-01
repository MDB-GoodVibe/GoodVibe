"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getSupabasePublicRuntime } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const BUTTON_LABEL = "Google\uB85C \uACC4\uC18D\uD558\uAE30";

export function GoogleSignInButton({
  next = "/home",
  className,
}: {
  next?: string;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      window.location.href = "/setup";
      return;
    }

    setIsLoading(true);

    const runtime = getSupabasePublicRuntime();
    const redirectBase = window.location.origin || runtime.siteUrl;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${redirectBase}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      className={cn(
        "group relative isolate h-14 w-full justify-center gap-3 overflow-hidden rounded-[1.65rem] border-[rgba(59,53,97,0.12)] bg-white text-[17px] font-semibold text-primary shadow-[0_18px_36px_rgba(37,31,74,0.08)] hover:-translate-y-1 hover:border-[rgba(59,53,97,0.2)] hover:bg-white hover:shadow-[0_24px_48px_rgba(37,31,74,0.14)]",
        className,
      )}
      onClick={handleSignIn}
      disabled={isLoading}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(91,95,151,0.12),transparent_58%),linear-gradient(120deg,transparent_18%,rgba(255,255,255,0.92)_50%,transparent_82%)] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:[background-position:140%_0] [background-position:-140%_0]"
      />
      {isLoading ? (
        <LoaderCircle className="relative size-4 animate-spin" />
      ) : (
        <span className="relative inline-flex size-8 items-center justify-center rounded-full bg-[#11111b] text-sm font-bold text-white shadow-[0_8px_18px_rgba(17,17,27,0.18)] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
          G
        </span>
      )}
      <span className="relative transition-transform duration-300 group-hover:translate-x-0.5">
        {isLoading ? "Google 로그인 연결 중..." : BUTTON_LABEL}
      </span>
    </Button>
  );
}
