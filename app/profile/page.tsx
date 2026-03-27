import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

  if (!viewer) {
    return (
      <AuthCanvas>
        <section className="w-full max-w-[500px] rounded-[2rem] border border-[rgba(121,118,127,0.08)] bg-white/94 px-7 py-8 shadow-[0_26px_70px_rgba(37,31,74,0.08)] backdrop-blur-xl">
          <div className="space-y-2 text-center">
            <h1 className="text-5xl font-extrabold tracking-[-0.08em] text-primary">GoodVibe</h1>
            <p className="text-base text-muted-foreground">
              당신만의 긍정적인 빌드 공간에 오신 것을 환영합니다.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <GoogleSignInButton next="/profile" />

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="h-px flex-1 bg-[rgba(121,118,127,0.12)]" />
              또는
              <span className="h-px flex-1 bg-[rgba(121,118,127,0.12)]" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">닉네임 또는 이름</label>
              <div className="rounded-2xl border border-[rgba(121,118,127,0.1)] bg-[rgba(244,243,243,0.72)] px-5 py-4 text-base text-muted-foreground">
                로그인 후 사용할 이름을 설정할 수 있어요.
              </div>
            </div>

            <Button
              disabled
              variant="secondary"
              className="h-14 w-full rounded-2xl text-lg shadow-[0_18px_28px_rgba(176,72,72,0.18)]"
            >
              시작하기
            </Button>
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            로그인에 문제가 있다면 Google Provider 설정과 Redirect URL을 다시 확인해 주세요.
          </p>
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
          <p className="text-base text-muted-foreground">{viewer.email ?? "이메일 정보 없음"}</p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-[1.6rem] border border-[rgba(121,118,127,0.08)] bg-[rgba(244,243,243,0.72)] px-5 py-5">
            <p className="text-sm font-semibold text-foreground">현재 상태</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {viewer.role === "admin"
                ? "관리자 권한이 활성화되어 있어 지식 문서와 제보함을 운영할 수 있어요."
                : "아이디어 작성, 투표, 바이브 헬퍼 저장 기능을 바로 사용할 수 있어요."}
            </p>
          </div>

          {!viewer.nickname ? (
            <Button asChild variant="secondary" className="h-14 w-full rounded-2xl text-lg">
              <Link href="/auth/onboarding">
                닉네임 설정하기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="secondary" className="h-14 w-full rounded-2xl text-lg">
              <Link href="/home">
                홈으로 이동
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="h-12 rounded-2xl">
              <Link href="/helper/idea">바이브 헬퍼 열기</Link>
            </Button>
            <SignOutButton className="h-12 rounded-2xl" />
          </div>
        </div>
      </section>
    </AuthCanvas>
  );
}
