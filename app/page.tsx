import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="section-shell flex min-h-screen items-center py-10">
        <div className="hero-surface w-full px-7 py-10 shadow-[0_30px_70px_rgba(37,31,74,0.18)] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="absolute inset-y-0 right-0 w-[46%] bg-[radial-gradient(circle_at_top,rgba(221,115,115,0.28),transparent_56%),linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_100%)]" />
          <div className="absolute bottom-[-10%] right-[-2%] h-64 w-64 rounded-full bg-[rgba(81,163,163,0.18)] blur-3xl" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(240px,0.58fr)] lg:items-end">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="inline-flex rounded-full bg-white/12 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.26em] text-white/82">
                  Good Vibe
                </p>
                <h1 className="max-w-4xl text-2xl font-extrabold leading-[1.08] tracking-[-0.06em] text-white sm:text-3xl lg:text-4xl">
                  아이디어에서
                  <br />
                  바이브 빌드까지.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/74 sm:text-lg">
                  아이디어 보드, 지식 베이스, Vibe Helper를 하나의 흐름으로 연결한 Good Vibe
                  서비스입니다.
                </p>
              </div>

              <Button asChild size="lg" variant="secondary" className="min-w-44">
                <Link href="/home">
                  참여하기
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 lg:justify-self-end">
              <div className="rounded-[1.8rem] border border-white/12 bg-white/10 px-5 py-5 backdrop-blur-md">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/58">
                  Knowledge
                </p>
                <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-white">
                  처음부터 실전까지
                </p>
              </div>

              <div className="rounded-[1.8rem] border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-md">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/58">
                  Community
                </p>
                <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-white">
                  좋은 아이디어를 고르고
                </p>
              </div>

              <div className="rounded-[1.8rem] border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-md">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/58">
                  Helper
                </p>
                <p className="mt-3 text-lg font-bold tracking-[-0.03em] text-white">
                  구조와 프롬프트로 이어갑니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
