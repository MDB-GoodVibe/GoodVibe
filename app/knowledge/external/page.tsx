import { KnowledgeExternalTrackView } from "@/components/knowledge-external-track-view";
import { listKnowledgeArticles } from "@/lib/repositories/knowledge";

export default async function KnowledgeExternalPage() {
  const articles = await listKnowledgeArticles("external");

  return <KnowledgeExternalTrackView title="외부 리소스" articles={articles} />;
}
