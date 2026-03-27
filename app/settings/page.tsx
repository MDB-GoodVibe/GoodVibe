import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentViewer } from "@/lib/auth/viewer";

export default async function SettingsPage() {
  const viewer = await getCurrentViewer();

  return (
    <div className="space-y-8">
      <section className="hero-surface px-7 py-8 sm:px-9 sm:py-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <p className="inline-flex rounded-full bg-white/12 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/82">
            Settings
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.07em] text-white sm:text-5xl">
            계정과 서비스 설정
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
            사용자 설정만 이 화면에서 다룹니다. 개발용 연결 확인 화면은 공개 메뉴에서 제외되어 있어요.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface-subtle rounded-[2rem] px-6 py-6">
          <div className="flex items-center gap-2">
            <Wrench className="size-4 text-primary" />
            <p className="text-lg font-bold text-primary">계정</p>
          </div>
          <p className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-primary">
            {viewer?.nickname ?? "로그인이 필요해요"}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            프로필과 관리자 권한 상태는 프로필 화면에서 확인할 수 있습니다.
          </p>
          <Button asChild className="mt-6">
            <Link href="/profile">
              프로필 보기
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="surface-subtle rounded-[2rem] px-6 py-6">
          <p className="text-lg font-bold text-primary">서비스</p>
          <p className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-primary">
            Good Vibe 기본 설정
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            이후 알림, 기본 작업 흐름, 개인화 설정이 여기에 추가될 예정입니다.
          </p>
        </div>
      </section>
    </div>
  );
}
