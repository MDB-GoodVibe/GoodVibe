import { redirect } from "next/navigation";

export default async function DashboardProjectRedirect({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/helper/projects/${projectId}`);
}
