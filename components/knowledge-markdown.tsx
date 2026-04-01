import Link from "next/link";
import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { MermaidDiagram } from "@/components/mermaid-diagram";
import { cn } from "@/lib/utils";

function MarkdownAnchor({
  href,
  children,
  ...props
}: ComponentProps<"a">) {
  const normalizedHref = href ?? "";
  const isExternal = /^https?:\/\//.test(normalizedHref);

  if (normalizedHref.startsWith("/")) {
    return (
      <Link href={normalizedHref} className="knowledge-link">
        {children}
      </Link>
    );
  }

  return (
    <a
      href={normalizedHref}
      className="knowledge-link"
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
}

function MarkdownCode({
  className,
  children,
  ...props
}: ComponentProps<"code"> & { inline?: boolean }) {
  const value = String(children).replace(/\n$/, "");
  const languageMatch = /language-([\w-]+)/.exec(className ?? "");
  const language = languageMatch?.[1]?.toLowerCase() ?? null;
  const isInline = !className?.includes("language-");

  if (isInline) {
    return (
      <code className="knowledge-inline-code" {...props}>
        {children}
      </code>
    );
  }

  if (language === "mermaid") {
    return <MermaidDiagram chart={value} />;
  }

  return (
    <div className="knowledge-code-block">
      <div className="knowledge-code-header">{language ?? "text"}</div>
      <pre className="knowledge-code-pre">
        <code className={cn("knowledge-code-content", className)} {...props}>
          {value}
        </code>
      </pre>
    </div>
  );
}

export function KnowledgeMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("knowledge-prose", className)}>
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: ["knowledge-heading-anchor"],
                ariaLabel: "heading link",
              },
              content: {
                type: "text",
                value: "#",
              },
            },
          ],
        ]}
        components={{
          a: MarkdownAnchor,
          code: MarkdownCode,
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <div className="knowledge-table-wrap">
              <table>{children}</table>
            </div>
          ),
          blockquote: ({ children }) => (
            <blockquote className="knowledge-blockquote">{children}</blockquote>
          ),
          hr: () => <hr className="knowledge-divider" />,
          img: ({ alt, src }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={alt ?? ""}
              src={src ?? ""}
              className="knowledge-image"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
