"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Compass,
  Layers3,
  Lightbulb,
  Menu,
  PanelLeftClose,
  ScrollText,
  X,
} from "lucide-react";

import { useWorkspace } from "@/components/workspace-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkspaceSection } from "@/types/project";

type NavItem = {
  href: string;
  targetHref?: string;
  label: string;
  section: WorkspaceSection;
  icon: typeof Lightbulb;
  isWorkspaceStep?: boolean;
};

type SubNavItem = {
  href: string;
  label: string;
};

const buildItems: NavItem[] = [
  {
    href: "/helper/idea",
    label: "아이디어",
    section: "idea",
    icon: Lightbulb,
    isWorkspaceStep: true,
  },
  {
    href: "/helper/architecture",
    label: "구조",
    section: "architecture",
    icon: PanelLeftClose,
    isWorkspaceStep: true,
  },
  {
    href: "/helper/prompts",
    label: "프롬프트",
    section: "prompts",
    icon: ScrollText,
    isWorkspaceStep: true,
  },
];

const exploreSubNav: SubNavItem[] = [
  { href: "/helper/explore/skills", label: "스킬" },
  { href: "/helper/explore/plugins", label: "플러그인" },
];

const projectSubNav: SubNavItem[] = [
  { href: "/helper/projects/in-progress", label: "진행 중" },
  { href: "/helper/projects/saved", label: "저장됨" },
];

const navGroups: Array<{
  id: "build" | "library";
  label: string;
  items: NavItem[];
}> = [
  {
    id: "build",
    label: "빌드",
    items: buildItems,
  },
  {
    id: "library",
    label: "라이브러리",
    items: [
      {
        href: "/helper/explore",
        targetHref: "/helper/explore/skills",
        label: "탐색",
        section: "explore",
        icon: Compass,
      },
      {
        href: "/helper/projects",
        targetHref: "/helper/projects/in-progress",
        label: "프로젝트",
        section: "projects",
        icon: Layers3,
      },
    ],
  },
];

const navItems = navGroups.flatMap((group) => group.items);

function isActivePath(pathname: string, href: string) {
  if (href === pathname) {
    return true;
  }

  return href !== "/" && pathname.startsWith(`${href}/`);
}

function getSectionTitle(pathname: string, section: WorkspaceSection) {
  if (section === "projects" && /^\/helper\/projects\/[^/]+$/.test(pathname)) {
    return "프로젝트 상세";
  }

  switch (section) {
    case "idea":
      return "아이디어 정리";
    case "architecture":
      return "구조 초안";
    case "prompts":
      return "프롬프트 묶음";
    case "explore":
      return "탐색";
    case "projects":
      return "프로젝트";
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { completion, draft, summary, visitSection } = useWorkspace();

  useEffect(() => {
    const activeItem = navItems.find((item) => isActivePath(pathname, item.href));

    if (activeItem) {
      visitSection(activeItem.section);
    }
  }, [pathname, visitSection]);

  const currentItem =
    navItems.find((item) => isActivePath(pathname, item.href)) ?? navItems[0];
  const currentGroup =
    navGroups.find((group) =>
      group.items.some((item) => isActivePath(pathname, item.href)),
    ) ?? navGroups[0];

  const completionMap = {
    idea: completion.idea,
    architecture: completion.architecture,
    prompts: completion.prompts,
  };
  const completedSteps = Object.values(completionMap).filter(Boolean).length;
  const progressWidth = `${(completedSteps / 3) * 100}%`;

  const headerSubNav =
    currentGroup.id === "build"
      ? buildItems.map((item, index) => ({
          href: item.href,
          label: item.label,
          number: index + 1,
          complete: completionMap[item.section as keyof typeof completionMap],
        }))
      : currentItem.section === "explore"
        ? exploreSubNav.map((item) => ({ ...item, number: null, complete: false }))
        : projectSubNav.map((item) => ({ ...item, number: null, complete: false }));

  return (
    <div className="min-h-screen">
      <div className="section-shell py-4 md:py-6">
        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside
            className={cn(
              "glass-panel shadow-soft fixed inset-y-4 left-4 z-50 w-[min(280px,calc(100vw-2rem))] rounded-[2rem] border border-[#b8b8d1]/35 p-4 transition xl:static xl:w-auto",
              isMenuOpen ? "translate-x-0" : "-translate-x-[110%] xl:translate-x-0",
            )}
          >
            <div className="flex items-center justify-between gap-3 px-1 pb-4">
              <Link href="/" className="space-y-1">
                <p className="text-xs uppercase tracking-[0.26em] text-primary">
                  Good Vibe
                </p>
                <p className="text-lg font-semibold text-foreground">Helper 워크스페이스</p>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="rounded-[1.6rem] panel-accent px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-primary">
                  현재 초안
                </p>
                <span className="rounded-full border border-primary/15 bg-primary px-2.5 py-1 text-[11px] text-primary-foreground">
                  자동 저장
                </span>
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">{summary.title}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#b8b8d1]/45 bg-[#fffffb]/72 px-3 py-1 text-xs text-muted-foreground">
                  {summary.serviceType}
                </span>
                <span className="rounded-full border border-[#b8b8d1]/45 bg-[#fffffb]/72 px-3 py-1 text-xs text-muted-foreground">
                  {draft.options.design === "standard" ? "기본 UI" : "브랜드 UI"}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>진행도</span>
                  <span>{completedSteps}/3</span>
                </div>
                <div className="h-2 rounded-full bg-[#b8b8d1]/30">
                  <div
                    className="h-2 rounded-full bg-accent transition-all"
                    style={{ width: progressWidth }}
                  />
                </div>
              </div>
            </div>

            <nav className="mt-5 space-y-4">
              {navGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <p className="px-1 text-xs uppercase tracking-[0.22em] text-primary">
                    {group.label}
                  </p>

                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActivePath(pathname, item.href);
                      const isComplete = item.isWorkspaceStep
                        ? completionMap[item.section as keyof typeof completionMap]
                        : false;

                      return (
                        <Link
                          key={item.href}
                          href={item.targetHref ?? item.href}
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-[1.4rem] border px-4 py-3 transition",
                            isActive
                              ? "border-primary/30 bg-primary text-primary-foreground"
                              : "border-[#b8b8d1]/35 bg-[#fffffb]/72 hover:border-accent/35 hover:bg-[#fffffb]",
                          )}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "inline-flex size-10 items-center justify-center rounded-2xl",
                                isActive
                                  ? "bg-[#fffffb]/20 text-primary-foreground"
                                  : "bg-[#b8b8d1]/18 text-primary",
                              )}
                            >
                              <Icon className="size-4" />
                            </div>
                            <p
                              className={cn(
                                "text-sm font-semibold",
                                isActive ? "text-primary-foreground" : "text-foreground",
                              )}
                            >
                              {item.label}
                            </p>
                          </div>

                          {item.isWorkspaceStep ? (
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                isComplete
                                  ? isActive
                                    ? "bg-[#fffffb]"
                                    : "bg-accent"
                                  : "bg-[#b8b8d1]/55",
                              )}
                            />
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          <div className="space-y-4">
            <header className="glass-panel shadow-soft rounded-[2rem] border border-[#b8b8d1]/35 px-4 py-4 sm:px-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="xl:hidden"
                    onClick={() => setIsMenuOpen(true)}
                  >
                    <Menu className="size-4" />
                  </Button>
                  <p className="text-xs uppercase tracking-[0.24em] text-accent">
                    {currentGroup.label}
                  </p>
                </div>

                <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                  {getSectionTitle(pathname, currentItem.section)}
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                  {headerSubNav.map((item) => {
                    const isActive = isActivePath(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition",
                          isActive
                            ? "border-primary/30 bg-primary text-primary-foreground"
                            : "border-[#b8b8d1]/45 bg-[#fffffb]/72 text-muted-foreground hover:border-accent/35 hover:text-foreground",
                        )}
                      >
                        {item.number ? (
                          <span
                            className={cn(
                              "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                              isActive
                                ? "bg-[#fffffb]/16 text-primary-foreground"
                                : item.complete
                                  ? "bg-[#ffc145]/35 text-foreground"
                                  : "bg-[#b8b8d1]/22 text-muted-foreground",
                            )}
                          >
                            {item.number}
                          </span>
                        ) : null}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </header>

            <main>{children}</main>
          </div>
        </div>
      </div>

      {isMenuOpen ? (
        <button
          type="button"
          aria-label="메뉴 닫기"
          className="fixed inset-0 z-40 bg-[#5b5f97]/20 backdrop-blur-[2px] xl:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      ) : null}
    </div>
  );
}
