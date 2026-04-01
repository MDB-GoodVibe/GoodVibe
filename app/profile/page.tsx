import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { getCurrentViewer } from "@/lib/auth/viewer";

function AuthCanvas({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#faf9f9_0%,#f4f2f5_100%)]">
      <div className="absolute left-[-8%] top-[14%] h-80 w-80 rounded-full bg-[rgba(91,95,151,0.08)] blur-3xl" />
      <div className="absolute right-[-6%] top-[28%] h-72 w-72 rounded-full bg-[rgba(255,107,108,0.08)] blur-3xl" />
      <div className="absolute bottom-[-8%] left-[30%] h-72 w-72 rounded-full bg-[rgba(255,193,69,0.08)] blur-3xl" />

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

export default async function ProfilePage() {
  const viewer = await getCurrentViewer();

  if (viewer && !viewer.nickname) {
    redirect("/auth/onboarding?next=/home");
  }

  if (!viewer) {
    return (
      <AuthCanvas>
        <section className="w-full max-w-[430px] rounded-[2.2rem] border border-[rgba(121,118,127,0.08)] bg-white/96 px-7 py-8 shadow-[0_30px_80px_rgba(37,31,74,0.08)] backdrop-blur-xl sm:px-9 sm:py-10">
          <div className="space-y-8">
            <div className="space-y-3 text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.36em] text-primary/45">
                Good Vibe
              </p>
              <h1 className="text-5xl font-extrabold tracking-[-0.08em] text-primary sm:text-6xl">
                GoodVibe
              </h1>
            </div>

            <GoogleSignInButton
              next="/home"
              className="h-16 rounded-[1.8rem] text-[1.15rem]"
            />
          </div>
        </section>
      </AuthCanvas>
    );
  }

  return (
    <AuthCanvas>
      <section className="w-full max-w-[540px] rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-white/94 px-7 py-8 shadow-[0_26px_70px_rgba(37,31,74,0.08)] backdrop-blur-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-extrabold tracking-[-0.08em] text-primary">
            {viewer.nickname ?? "GoodVibe 사용자"}
          </h1>
          <p className="text-base text-muted-foreground">
            {viewer.email ?? "이메일 정보를 불러오지 못했어요."}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(244,243,243,0.72)] px-5 py-5">
            <p className="text-sm font-semibold text-foreground">현재 상태</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {viewer.role === "admin"
                ? "관리자 권한이 활성화되어 있어 지식 문서와 제안 흐름을 함께 운영할 수 있어요."
                : "아이디어 작성, 지식 탐색, Vibe Helper 기능을 바로 사용할 수 있어요."}
            </p>
          </div>

          <Button asChild variant="secondary" className="h-14 w-full rounded-2xl text-lg">
            <Link href="/home">
              홈으로 이동
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="h-12 rounded-2xl">
              <Link href="/helper/idea">Vibe Helper 열기</Link>
            </Button>
            <SignOutButton className="h-12 rounded-2xl" />
          </div>
        </div>
      </section>
    </AuthCanvas>
  );
}
