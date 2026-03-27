import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { saveNicknameAction } from "@/app/auth/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    redirect(params.next || "/profile");
  }

  return (
    <AuthCanvas>
      <section className="w-full max-w-[500px] rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-white/94 px-7 py-8 shadow-[0_26px_70px_rgba(37,31,74,0.08)] backdrop-blur-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-5xl font-extrabold tracking-[-0.08em] text-primary">GoodVibe</h1>
          <p className="text-base text-muted-foreground">
            사용할 이름을 정하면 바로 Good Vibe를 시작할 수 있어요.
          </p>
        </div>

        <form action={saveNicknameAction} className="mt-8 space-y-6">
          <input type="hidden" name="next" value={params.next || "/profile"} />

          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-semibold text-foreground">
              닉네임 또는 이름
            </label>
            <Input
              id="nickname"
              name="nickname"
              placeholder="사용할 이름을 입력해 주세요"
              minLength={2}
              className="h-14 rounded-2xl"
              required
            />
          </div>

          {params.error === "nickname" ? (
            <p className="rounded-[1rem] bg-[rgba(255,107,108,0.08)] px-4 py-3 text-sm text-secondary">
              닉네임은 2글자 이상으로 입력해 주세요.
            </p>
          ) : null}

          <Button
            type="submit"
            variant="secondary"
            className="h-14 w-full rounded-2xl text-lg shadow-[0_18px_28px_rgba(176,72,72,0.18)]"
          >
            시작하기
          </Button>
        </form>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          이 이름은 게시글 작성과 활동 기록에 함께 표시됩니다.
        </p>
      </section>
    </AuthCanvas>
  );
}
