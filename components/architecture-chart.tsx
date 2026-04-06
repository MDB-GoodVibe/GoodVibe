import { Sparkles } from "lucide-react";

import { MermaidDiagram } from "@/components/mermaid-diagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateArchitectureBlueprint } from "@/lib/architecture-generator";

const sampleBlueprint = generateArchitectureBlueprint({
  idea: "카페 메뉴를 소개하고 예약 문의를 받으면 운영자가 요청 내용을 쉽게 확인할 수 있는 간단한 웹 서비스를 만들고 싶어요.",
  projectName: "카페 예약 랜딩",
  serviceType: "웹 서비스",
  serviceTypeId: "web-service",
  budget: "free",
  design: "standard",
  environment: "local",
});

export function ArchitectureChart() {
  return (
    <Card className="glass-panel overflow-hidden border-[#b8b8d1]/35">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              구조 미리보기
            </p>
            <CardTitle className="text-xl">
              방향만 정해도
              <br />
              구조가 바로 보입니다.
            </CardTitle>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#b8b8d1]/45 bg-[#fffffb]/80 px-3 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Mermaid 미리보기
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          {sampleBlueprint.highlights.map((item) => (
            <div key={item.label} className="rounded-2xl panel-muted px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          서비스 유형, 예산, UI 방향을 바꾸면 구조도 함께 달라져 처음 보는 사람도 흐름을 이해하기 쉽습니다.
        </p>
        <MermaidDiagram chart={sampleBlueprint.mermaid} />
      </CardContent>
    </Card>
  );
}
