"use client";

import type { VariantProps } from "class-variance-authority";
import { LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SignOutButtonProps = {
  className?: string;
  label?: string;
  redirectTo?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
};

export function SignOutButton({
  className,
  label = "로그아웃",
  redirectTo = "/",
  variant = "outline",
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      window.location.href = redirectTo;
      return;
    }

    setIsLoading(true);
    await supabase.auth.signOut();
    window.location.href = redirectTo;
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      {isLoading ? "로그아웃 중..." : label}
    </Button>
  );
}
