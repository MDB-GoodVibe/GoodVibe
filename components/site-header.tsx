import Link from "next/link";
import { Compass, Lightbulb, LibraryBig, Sparkles, UserRound } from "lucide-react";

import { getCurrentViewer } from "@/lib/auth/viewer";

const navItems = [
  { href: "/ideas", label: "아이디어", icon: Lightbulb },
  { href: "/knowledge/basics", label: "지식창고", icon: LibraryBig },
  { href: "/helper/idea", label: "Helper", icon: Sparkles },
] as const;

export async function SiteHeader() {
  const viewer = await getCurrentViewer();

  return (
    <header className="sticky top-0 z-40 border-b border-[#b8b8d1]/25 bg-[rgba(255,255,251,0.72)] backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-5">
          <Link href="/" className="space-y-1">
            <p className="text-xs uppercase tracking-[0.26em] text-primary">
              Good Vibe
            </p>
            <p className="text-sm font-semibold text-foreground">
              AI로 만드는 서비스 빌드 허브
            </p>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full border border-[#b8b8d1]/35 bg-[#fffffb]/72 px-3 py-2 text-sm text-muted-foreground transition hover:border-accent/35 hover:text-foreground"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/setup"
            className="hidden items-center gap-2 rounded-full border border-[#b8b8d1]/35 bg-[#fffffb]/72 px-3 py-2 text-sm text-muted-foreground transition hover:border-accent/35 hover:text-foreground sm:inline-flex"
          >
            <Compass className="size-4" />
            설정
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-[#b8b8d1]/35 bg-[#fffffb]/72 px-3 py-2 text-sm text-foreground transition hover:border-primary/30"
          >
            <UserRound className="size-4 text-primary" />
            {viewer?.nickname ?? "로그인"}
          </Link>
        </div>
      </div>
    </header>
  );
}
