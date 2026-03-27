"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      window.location.href = "/";
      return;
    }

    setIsLoading(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      로그아웃
    </Button>
  );
}
