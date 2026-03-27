"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ServiceShell } from "@/components/service-shell";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStandalone =
    pathname === "/" ||
    pathname === "/profile" ||
    pathname.startsWith("/auth/onboarding");

  if (isStandalone) {
    return <>{children}</>;
  }

  return <ServiceShell>{children}</ServiceShell>;
}
