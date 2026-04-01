"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  FileText,
  Lightbulb,
  Menu,
  Settings2,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type ViewerState = {
  nickname: string | null;
  role: "user" | "admin";
} | null;

type SidebarItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: string[];
  exact?: boolean;
};

type SidebarGroup = {
  title?: string;
  items: SidebarItem[];
};

type SidebarCallout = {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
};

type SidebarConfig = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  groups: SidebarGroup[];
  callout?: SidebarCallout;
};

const mainTabs = [
  { href: "/home", label: "Home", match: ["/home"] },
  {
    href: "/knowledge/basics",
    label: "지식베이스",
    match: ["/knowledge", "/admin/knowledge"],
  },
  { href: "/ideas", label: "아이디어보드", match: ["/ideas"] },
  { href: "/helper/idea", label: "바이브 헬퍼", match: ["/helper"] },
] as const;

function matchesPath(
  pathname: string,
  candidates: readonly string[],
  exact = false,
) {
  return candidates.some((candidate) => {
    if (pathname === candidate) {
      return true;
    }

    if (exact) {
      return false;
    }

    return candidate !== "/" && pathname.startsWith(`${candidate}/`);
  });
}

function isActiveMainTab(
  pathname: string,
  href: string,
  matches?: readonly string[],
) {
  return matchesPath(pathname, matches ?? [href]);
}

function isActivePath(pathname: string, item: SidebarItem) {
  return matchesPath(pathname, item.match ?? [item.href], item.exact);
}

function getSection(pathname: string) {
  if (pathname.startsWith("/knowledge")) {
    return "knowledge" as const;
  }

  if (pathname.startsWith("/admin")) {
    return "admin" as const;
  }

  return null;
}

function getSidebarConfig(
  section: ReturnType<typeof getSection>,
  isAdmin: boolean,
) {
  switch (section) {
    case "knowledge":
      return {
        title: "지식베이스",
        subtitle: "Good Vibe 백과사전",
        icon: BookOpen,
        groups: [
          {
            items: [
              {
                href: "/knowledge/basics",
                label: "기초 가이드",
                icon: BookOpen,
              },
              {
                href: "/knowledge/level-up",
                label: "레벨업",
                icon: ArrowUpRight,
              },
              {
                href: "/knowledge/tips",
                label: "팁 모음",
                icon: Lightbulb,
              },
              {
                href: "/knowledge/skills",
                label: "스킬 정보",
                icon: WandSparkles,
              },
              {
                href: "/knowledge/external",
                label: "외부 리소스",
                icon: ExternalLink,
              },
            ],
          },
          ...(isAdmin
            ? [
                {
                  title: "운영",
                  items: [
                    {
                      href: "/admin/knowledge",
                      label: "지식 문서 관리",
                      icon: FileText,
                      match: ["/admin/knowledge", "/admin/knowledge/new"],
                      exact: true,
                    },
                    {
                      href: "/admin/knowledge/submissions",
                      label: "지식 제보함",
                      icon: WandSparkles,
                      match: ["/admin/knowledge/submissions"],
                      exact: true,
                    },
                  ],
                },
              ]
            : []),
        ],
        callout: {
          title: "지식 제보하기",
          description:
            "새로운 인사이트나 유용한 링크를 관리자에게 추천해 보세요.",
          actionLabel: "기여하기",
          href: "/knowledge/contribute",
        },
      } satisfies SidebarConfig;

    case "admin":
      return {
        title: "관리 센터",
        subtitle: "콘텐츠와 제보 운영",
        icon: Settings2,
        groups: [
          {
            items: [
              {
                href: "/admin/knowledge",
                label: "지식 문서 관리",
                icon: FileText,
                match: ["/admin/knowledge", "/admin/knowledge/new"],
                exact: true,
              },
              {
                href: "/admin/knowledge/submissions",
                label: "지식 제보함",
                icon: WandSparkles,
                match: ["/admin/knowledge/submissions"],
                exact: true,
              },
            ],
          },
        ],
      } satisfies SidebarConfig;

    default:
      return null;
  }
}

export function ServiceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewer, setViewer] = useState<ViewerState>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadViewer() {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        if (isMounted) {
          setViewer(null);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setViewer(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      setViewer({
        nickname:
          typeof profile?.nickname === "string"
            ? profile.nickname
            : typeof user.user_metadata?.nickname === "string"
              ? user.user_metadata.nickname
              : null,
        role:
          profile?.role === "admin" || user.user_metadata?.role === "admin"
            ? "admin"
            : "user",
      });
    }

    void loadViewer();

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadViewer();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const section = getSection(pathname);
  const showSidebar = Boolean(section);
  const sidebarConfig = useMemo(
    () => getSidebarConfig(section, viewer?.role === "admin"),
    [section, viewer?.role],
  );

  const SidebarIcon = sidebarConfig?.icon ?? BookOpen;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-[rgba(121,118,127,0.08)] bg-[rgba(250,249,249,0.82)] backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className={cn("lg:hidden", !showSidebar && "hidden")}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-4" />
            </Button>

            <Link
              href="/home"
              className="shrink-0 text-[1.45rem] font-extrabold tracking-[-0.06em] text-primary"
            >
              GoodVibe
            </Link>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
            {mainTabs.map((tab) => {
              const active = isActiveMainTab(pathname, tab.href, tab.match);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "border-b-2 pb-1 text-[13px] font-medium transition-colors",
                    active
                      ? "border-secondary text-secondary"
                      : "border-transparent text-foreground/58 hover:text-primary",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Link href="/settings" aria-label="설정">
                <Settings2 className="size-4" />
              </Link>
            </Button>

            <Button asChild size="sm">
              <Link href="/profile">
                <UserRound className="size-4" />
                {viewer ? viewer.nickname ?? "내 계정" : "로그인"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {showSidebar && menuOpen ? (
        <button
          type="button"
          aria-label="사이드바 닫기"
          className="fixed inset-0 z-40 bg-[rgba(37,31,74,0.24)] lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div className="section-shell flex gap-8 px-0 py-8">
        {showSidebar && sidebarConfig ? (
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-[286px] overflow-y-auto border-r border-[rgba(121,118,127,0.08)] bg-[rgba(250,249,249,0.98)] px-5 py-6 shadow-[0_28px_70px_rgba(37,31,74,0.12)] transition-transform duration-300 lg:sticky lg:top-24 lg:z-0 lg:h-[calc(100vh-120px)] lg:translate-x-0 lg:rounded-[1.85rem] lg:border lg:bg-[rgba(250,249,249,0.84)] lg:shadow-none",
              menuOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <p className="text-sm font-semibold text-primary">메뉴</p>
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex min-h-full flex-col">
              <div className="rounded-[1.8rem] bg-[rgba(91,95,151,0.06)] px-5 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-primary text-white">
                    <SidebarIcon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-extrabold tracking-[-0.04em] text-primary">
                      {sidebarConfig.title}
                    </h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {sidebarConfig.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex-1 space-y-7">
                {sidebarConfig.groups.map((group) => (
                  <div
                    key={
                      ("title" in group ? group.title : undefined) ??
                      group.items.map((item) => item.href).join("-")
                    }
                    className="space-y-2"
                  >
                    {"title" in group && group.title ? (
                      <p className="px-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-foreground/48">
                        {group.title}
                      </p>
                    ) : null}
                    <div className="space-y-1.5">
                      {group.items.map((item) => {
                        const active = isActivePath(pathname, item);
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-[1rem] px-4 py-2.5 transition-all",
                              active
                                ? "bg-white text-primary shadow-[0_14px_30px_rgba(37,31,74,0.08)]"
                                : "text-foreground/72 hover:bg-white/72 hover:text-primary",
                            )}
                          >
                            <div
                              className={cn(
                                "flex size-9 items-center justify-center rounded-full",
                                active
                                  ? "bg-[rgba(255,107,108,0.12)] text-secondary"
                                  : "bg-[rgba(59,53,97,0.06)] text-primary/72",
                              )}
                            >
                              <Icon className="size-4" />
                            </div>
                            <span
                              className={cn(
                                "text-[13px]",
                                active ? "font-semibold" : "font-medium",
                              )}
                            >
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {sidebarConfig.callout ? (
                <div className="mt-7 rounded-[1.7rem] border border-[rgba(255,107,108,0.22)] bg-[rgba(255,107,108,0.06)] px-5 py-5 text-primary">
                  <p className="text-lg font-bold tracking-[-0.03em]">
                    {sidebarConfig.callout.title}
                  </p>
                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                    {sidebarConfig.callout.description}
                  </p>
                  <Button asChild variant="secondary" className="mt-5 w-full">
                    <Link href={sidebarConfig.callout.href}>
                      {sidebarConfig.callout.actionLabel}
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
