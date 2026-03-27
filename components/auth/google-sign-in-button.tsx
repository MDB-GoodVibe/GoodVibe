"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getSupabasePublicRuntime } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export function GoogleSignInButton({
  next = "/profile",
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

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${redirectBase}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      className={cn(
        "h-14 w-full justify-center rounded-2xl border-[rgba(121,118,127,0.14)] bg-white text-[17px] font-semibold text-foreground shadow-none hover:bg-white",
        className,
      )}
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <span className="inline-flex size-7 items-center justify-center rounded-md border border-[rgba(121,118,127,0.12)] bg-[#0f0f16] text-sm font-bold text-white">
          G
        </span>
      )}
      Google로 계속하기
    </Button>
  );
}
