import { LoaderCircle } from "lucide-react";

export default function AppLoading() {
  return (
    <main className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="glass-panel flex w-full max-w-[420px] flex-col items-center rounded-[2rem] border border-[rgba(121,118,127,0.08)] px-8 py-10 text-center shadow-[0_24px_60px_rgba(37,31,74,0.08)]">
        <div className="flex size-14 items-center justify-center rounded-full bg-[rgba(255,107,108,0.12)] text-secondary">
          <LoaderCircle className="size-6 animate-spin" />
        </div>
        <h1 className="mt-5 text-[1.6rem] font-bold tracking-[-0.05em] text-primary">
          페이지를 불러오는 중입니다
        </h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          요청 결과를 정리하고 있어요. 잠시만 기다려 주세요.
        </p>
      </div>
    </main>
  );
}
