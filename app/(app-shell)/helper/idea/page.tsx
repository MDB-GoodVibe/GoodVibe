import { IdeaWorkspaceScreen } from "@/components/workspace-screens";
import { getIdeaPostById } from "@/lib/repositories/ideas";

export default async function HelperIdeaPage({
  searchParams,
}: {
  searchParams: Promise<{ sourceIdeaId?: string; autoAnalyze?: string }>;
}) {
  const params = await searchParams;
  const importedIdea = params.sourceIdeaId
    ? await getIdeaPostById(params.sourceIdeaId)
    : null;

  return (
    <IdeaWorkspaceScreen
      autoAnalyze={params.autoAnalyze === "1"}
      importedIdea={
        importedIdea
          ? {
              sourceIdeaId: importedIdea.id,
              sourceIdeaTitle: importedIdea.title,
              idea: importedIdea.content,
            }
          : null
      }
    />
  );
}
