"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function saveNicknameAction(formData: FormData) {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const next = String(formData.get("next") ?? "/profile");

  if (nickname.length < 2) {
    redirect(`/auth/onboarding?next=${encodeURIComponent(next)}&error=nickname`);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/setup");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/profile");
  }

  await supabase.auth.updateUser({
    data: {
      nickname,
      role: user.user_metadata?.role ?? "user",
    },
  });

  try {
    await supabase.from("profiles").upsert({
      id: user.id,
      nickname,
      avatar_url:
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : null,
      role: user.user_metadata?.role === "admin" ? "admin" : "user",
    });
  } catch {
    // profiles table is optional during initial bootstrap.
  }

  redirect(next);
}
