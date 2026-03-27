import { KnowledgeTrackView } from "@/components/knowledge-track-view";
import { listKnowledgeArticles } from "@/lib/repositories/knowledge";

export default async function KnowledgeLevelUpPage() {
  const articles = await listKnowledgeArticles("level-up");

  return (
    <KnowledgeTrackView
      track="level-up"
      title="레벨업"
      description="서비스 구현, 데이터 구조, 권한 설계, SaaS 연동, 배포와 운영까지 실제 제품을 굴리는 데 필요한 중요한 지식을 정리했습니다."
      articles={articles}
    />
  );
}
