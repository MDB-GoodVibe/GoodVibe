import type { ReactNode } from "react";

import { WorkspaceProvider } from "@/components/workspace-provider";

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
