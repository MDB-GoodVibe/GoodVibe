import Image from "next/image";

import { cn } from "@/lib/utils";

type IconAsset =
  | {
      type: "logo";
      src: string;
      alt: string;
    }
  | {
      type: "emoji";
      value: string;
      alt: string;
    };

type IconMatcher = {
  match: string[];
  icon: IconAsset;
};

function logo(src: string, alt: string): IconAsset {
  return {
    type: "logo",
    src,
    alt,
  };
}

function emoji(value: string, alt: string): IconAsset {
  return {
    type: "emoji",
    value,
    alt,
  };
}

const channelIcons: Record<string, IconAsset> = {
  youtube: logo("/brand-icons/youtube.svg", "YouTube"),
  github: logo("/brand-icons/github.svg", "GitHub"),
  x: logo("/brand-icons/x.svg", "X"),
  threads: logo("/brand-icons/threads.svg", "Threads"),
  docs: emoji("📘", "Docs"),
  blog: emoji("✍️", "Blog"),
  news: emoji("📰", "News"),
  community: emoji("💬", "Community"),
  other: emoji("🔗", "External"),
};

const categoryIcons: Record<string, IconAsset> = {
  "ai-agent": emoji("🤖", "AI Agent"),
  deploy: emoji("🚀", "Deploy"),
  database: emoji("🗄️", "Database"),
  web: emoji("🌐", "Web"),
  automation: emoji("⚙️", "Automation"),
  backend: emoji("🧩", "Backend"),
  design: emoji("🎨", "Design"),
  productivity: emoji("⚡", "Productivity"),
  general: emoji("📎", "General"),
};

const subcategoryIcons: Record<string, IconAsset> = {
  claude: logo("/brand-icons/anthropic.svg", "Claude"),
  codex: logo("/brand-icons/openai.svg", "Codex"),
  gemini: logo("/brand-icons/googlegemini.svg", "Gemini"),
  cursor: logo("/brand-icons/cursor.svg", "Cursor"),
  windsurf: emoji("🏄", "Windsurf"),
  openai: logo("/brand-icons/openai.svg", "OpenAI"),
  vercel: logo("/vercel.svg", "Vercel"),
  cloudflare: logo("/brand-icons/cloudflare.svg", "Cloudflare"),
  netlify: logo("/brand-icons/netlify.svg", "Netlify"),
  render: logo("/brand-icons/render.svg", "Render"),
  docker: logo("/brand-icons/docker.svg", "Docker"),
  aws: logo("/brand-icons/amazonaws.svg", "AWS"),
  supabase: logo("/brand-icons/supabase.svg", "Supabase"),
  postgres: logo("/brand-icons/postgresql.svg", "Postgres"),
  sqlite: logo("/brand-icons/sqlite.svg", "SQLite"),
  mysql: logo("/brand-icons/mysql.svg", "MySQL"),
  mongodb: logo("/brand-icons/mongodb.svg", "MongoDB"),
  prisma: logo("/brand-icons/prisma.svg", "Prisma"),
  drizzle: logo("/brand-icons/drizzle.svg", "Drizzle"),
  nextjs: logo("/next.svg", "Next.js"),
  react: logo("/brand-icons/react.svg", "React"),
  vite: logo("/brand-icons/vite.svg", "Vite"),
  tailwind: logo("/brand-icons/tailwindcss.svg", "Tailwind"),
  vue: logo("/brand-icons/vuedotjs.svg", "Vue"),
  svelte: logo("/brand-icons/svelte.svg", "Svelte"),
  n8n: logo("/brand-icons/n8n.svg", "n8n"),
  zapier: logo("/brand-icons/zapier.svg", "Zapier"),
  make: emoji("🪄", "Make"),
  "github-actions": logo("/brand-icons/githubactions.svg", "GitHub Actions"),
  cron: emoji("⏱️", "Cron"),
  auth: emoji("🔐", "Auth"),
  api: emoji("🔌", "API"),
  node: logo("/brand-icons/nodedotjs.svg", "Node.js"),
  express: logo("/brand-icons/express.svg", "Express"),
  nest: logo("/brand-icons/nestjs.svg", "NestJS"),
  figma: logo("/brand-icons/figma.svg", "Figma"),
  ui: emoji("🪄", "UI"),
  ux: emoji("🧭", "UX"),
  branding: emoji("✨", "Branding"),
  git: logo("/brand-icons/git.svg", "Git"),
  testing: emoji("🧪", "Testing"),
  debugging: emoji("🐞", "Debugging"),
  review: emoji("📝", "Code Review"),
  general: emoji("📎", "General"),
};

const tagMatchers: IconMatcher[] = [
  { match: ["claude", "anthropic"], icon: logo("/brand-icons/anthropic.svg", "Claude") },
  { match: ["codex"], icon: logo("/brand-icons/openai.svg", "Codex") },
  { match: ["openai"], icon: logo("/brand-icons/openai.svg", "OpenAI") },
  { match: ["gemini"], icon: logo("/brand-icons/googlegemini.svg", "Gemini") },
  { match: ["cursor"], icon: logo("/brand-icons/cursor.svg", "Cursor") },
  { match: ["vercel"], icon: logo("/vercel.svg", "Vercel") },
  { match: ["supabase"], icon: logo("/brand-icons/supabase.svg", "Supabase") },
  { match: ["next.js", "nextjs"], icon: logo("/next.svg", "Next.js") },
  { match: ["react"], icon: logo("/brand-icons/react.svg", "React") },
  { match: ["vite"], icon: logo("/brand-icons/vite.svg", "Vite") },
  { match: ["tailwind"], icon: logo("/brand-icons/tailwindcss.svg", "Tailwind") },
  { match: ["cloudflare"], icon: logo("/brand-icons/cloudflare.svg", "Cloudflare") },
  { match: ["docker"], icon: logo("/brand-icons/docker.svg", "Docker") },
  { match: ["aws"], icon: logo("/brand-icons/amazonaws.svg", "AWS") },
  { match: ["postgres"], icon: logo("/brand-icons/postgresql.svg", "Postgres") },
  { match: ["mongodb"], icon: logo("/brand-icons/mongodb.svg", "MongoDB") },
  { match: ["mysql"], icon: logo("/brand-icons/mysql.svg", "MySQL") },
  { match: ["prisma"], icon: logo("/brand-icons/prisma.svg", "Prisma") },
  { match: ["drizzle"], icon: logo("/brand-icons/drizzle.svg", "Drizzle") },
  { match: ["n8n"], icon: logo("/brand-icons/n8n.svg", "n8n") },
  { match: ["zapier"], icon: logo("/brand-icons/zapier.svg", "Zapier") },
  { match: ["github actions"], icon: logo("/brand-icons/githubactions.svg", "GitHub Actions") },
  { match: ["node.js", "nodejs"], icon: logo("/brand-icons/nodedotjs.svg", "Node.js") },
  { match: ["express"], icon: logo("/brand-icons/express.svg", "Express") },
  { match: ["nestjs", "nest"], icon: logo("/brand-icons/nestjs.svg", "NestJS") },
  { match: ["figma"], icon: logo("/brand-icons/figma.svg", "Figma") },
  { match: ["git", "github"], icon: logo("/brand-icons/git.svg", "Git") },
  { match: ["docs"], icon: emoji("📘", "Docs") },
  { match: ["editor"], icon: emoji("⌨️", "Editor") },
  { match: ["backend"], icon: emoji("🧩", "Backend") },
  { match: ["deploy"], icon: emoji("🚀", "Deploy") },
  { match: ["youtube"], icon: logo("/brand-icons/youtube.svg", "YouTube") },
];

function findMatchedIcon(value: string, matchers: IconMatcher[]) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return matchers.find((matcher) =>
    matcher.match.some((candidate) => normalized.includes(candidate)),
  )?.icon;
}

export function getChannelIcon(channel: string) {
  return channelIcons[channel] ?? channelIcons.other;
}

export function getCategoryIcon(category: string) {
  return categoryIcons[category] ?? categoryIcons.general;
}

export function getSubcategoryIcon(subcategory: string) {
  return subcategoryIcons[subcategory] ?? subcategoryIcons.general;
}

export function getTagIcon(label: string) {
  return findMatchedIcon(label, tagMatchers);
}

export function BrandIcon({
  icon,
  size = 16,
  className,
  bubbleClassName,
}: {
  icon: IconAsset;
  size?: number;
  className?: string;
  bubbleClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-white/85 ring-1 ring-black/5",
        bubbleClassName,
      )}
      style={{ width: size + 10, height: size + 10 }}
      aria-hidden="true"
      title={icon.alt}
    >
      {icon.type === "logo" ? (
        <Image
          src={icon.src}
          alt={icon.alt}
          width={size}
          height={size}
          className={cn("object-contain", className)}
        />
      ) : (
        <span className={cn("text-[0.95rem] leading-none", className)}>{icon.value}</span>
      )}
    </span>
  );
}
