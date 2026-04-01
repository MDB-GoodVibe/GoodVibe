import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { saveNicknameAction } from "@/app/auth/onboarding/actions";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { FormPendingOverlay } from "@/components/ui/form-pending-overlay";
import { Input } from "@/components/ui/input";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { getCurrentViewer } from "@/lib/auth/viewer";

function AuthCanvas({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#faf9f9_0%,#f4f2f5_100%)]">
      <div className="absolute left-[-8%] top-[14%] h-80 w-80 rounded-full bg-[rgba(91,95,151,0.08)] blur-3xl" />
      <div className="absolute right-[-6%] top-[28%] h-72 w-72 rounded-full bg-[rgba(255,107,108,0.08)] blur-3xl" />

      <div className="relative flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-6 py-16">{children}</div>

        <footer className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-8 pb-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-primary">Good Vibe</p>
          <div className="flex flex-wrap gap-6">
            <span>개인정보처리방침</span>
            <span>이용약관</span>
            <span>고객지원</span>
            <span>상태</span>
          </div>
          <span>© 2024 Good Vibe Service. All rights reserved.</span>
        </footer>
      </div>
    </main>
  );
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const viewer = await getCurrentViewer();
  const params = await searchParams;

  if (!viewer) {
    redirect("/profile");
  }

  if (viewer.nickname) {
    redirect(params.next || "/home");
  }

  return (
    <AuthCanvas>
      <section className="w-full max-w-[460px] rounded-[2.2rem] border border-[rgba(121,118,127,0.08)] bg-white/96 px-7 py-8 shadow-[0_30px_80px_rgba(37,31,74,0.08)] backdrop-blur-xl sm:px-9 sm:py-10">
        <div className="space-y-3 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-primary/45">
            Google Login
          </p>
          <h1 className="text-4xl font-extrabold tracking-[-0.08em] text-primary sm:text-5xl">
            닉네임을 정해 주세요
          </h1>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            이 단계까지 끝나야 GoodVibe 로그인이 완료됩니다.
          </p>
        </div>

        <form action={saveNicknameAction} className="relative mt-8 space-y-5">
          <input type="hidden" name="next" value={params.next || "/home"} />

          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-semibold text-foreground">
              닉네임
            </label>
            <Input
              id="nickname"
              name="nickname"
              placeholder="2자 이상 닉네임을 입력해 주세요."
              minLength={2}
              className="h-14 rounded-[1.35rem] px-5 text-base"
              required
            />
          </div>

          {params.error === "nickname" ? (
            <p className="rounded-[1.15rem] bg-[rgba(255,107,108,0.08)] px-4 py-3 text-sm text-secondary">
              닉네임은 2자 이상으로 입력해 주세요.
            </p>
          ) : null}

          <PendingSubmitButton
            variant="secondary"
            className="h-14 w-full rounded-[1.35rem] text-lg shadow-[0_18px_28px_rgba(176,72,72,0.18)]"
            pendingLabel="저장 중..."
          >
            계속하기
          </PendingSubmitButton>

          <FormPendingOverlay
            label="닉네임을 저장하고 있어요..."
            className="rounded-[1.35rem]"
          />
        </form>

        <SignOutButton
          label="로그인 취소"
          redirectTo="/profile"
          variant="ghost"
          className="mt-3 h-12 w-full rounded-[1.35rem]"
        />
      </section>
    </AuthCanvas>
  );
}
