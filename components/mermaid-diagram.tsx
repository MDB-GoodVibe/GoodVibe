"use client";

import { useEffect, useId, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const diagramId = useId().replaceAll(":", "");

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      try {
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "base",
          flowchart: {
            useMaxWidth: true,
            curve: "basis",
            nodeSpacing: 42,
            rankSpacing: 54,
            padding: 18,
          },
          themeVariables: {
            background: "#f7f8fc",
            primaryColor: "#eef2ff",
            primaryBorderColor: "#6a78e7",
            primaryTextColor: "#1f2a5a",
            lineColor: "#94a3b8",
            secondaryColor: "#f8fafc",
            tertiaryColor: "#fff7e6",
            mainBkg: "#ffffff",
            secondBkg: "#f8fafc",
            tertiaryBkg: "#fff7e6",
            clusterBkg: "#ffffff",
            clusterBorder: "#d7ddea",
            edgeLabelBackground: "#f8fafc",
            fontFamily:
              "Pretendard Variable, SUIT Variable, Noto Sans KR, sans-serif",
          },
        });

        const rendered = await mermaid.render(
          `mermaid-${diagramId}-${Date.now()}`,
          chart,
        );

        if (!isMounted) {
          return;
        }

        setSvg(rendered.svg);
        setError(null);
      } catch (renderError) {
        if (!isMounted) {
          return;
        }

        setError("다이어그램을 불러오지 못했습니다.");
        setSvg("");
        console.error(renderError);
      }
    }

    void renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart, diagramId]);

  if (error) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[rgba(121,118,127,0.16)] bg-[rgba(248,247,248,0.92)] px-4 py-10 text-center text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="rounded-[2rem] border border-[rgba(121,118,127,0.12)] bg-[rgba(248,247,248,0.92)] px-4 py-10 text-center text-sm text-muted-foreground">
        다이어그램을 준비하고 있습니다.
      </div>
    );
  }

  return (
    <div
      className="mermaid-svg overflow-x-auto rounded-[2rem] border border-[rgba(121,118,127,0.12)] bg-[linear-gradient(180deg,#fcfcfe_0%,#f4f7fb_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
