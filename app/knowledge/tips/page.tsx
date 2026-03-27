import { KnowledgeTrackView } from "@/components/knowledge-track-view";
import { listKnowledgeArticles } from "@/lib/repositories/knowledge";

export default async function KnowledgeTipsPage() {
  const articles = await listKnowledgeArticles("tips");

  return (
    <KnowledgeTrackView
      track="tips"
      title="꿀팁"
      description="작은 디테일에서 차이를 만드는 프롬프트 습관, 서비스 기획 팁, 배포 플랫폼 비교, 검증 아이디어까지 실전에 바로 쓸 수 있는 팁을 모았습니다."
      articles={articles}
    />
  );
}
