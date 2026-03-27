import { NextResponse } from "next/server";

import { getExploreCatalog } from "@/lib/explore/catalog";
import type {
  CatalogKind,
  CatalogQuery,
  CatalogSort,
  CatalogSourceFilter,
} from "@/types/project";

const validKinds = new Set<CatalogKind>(["skills", "marketplaces"]);
const validSources = new Set<CatalogSourceFilter>([
  "all",
  "skills-sh",
  "claude-marketplaces",
]);
const validSorts = new Set<CatalogSort>(["popular", "trending", "hot"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") as CatalogKind | null;
  const q = searchParams.get("q") ?? "";
  const source = (searchParams.get("source") ?? "all") as CatalogSourceFilter;
  const sort = (searchParams.get("sort") ?? "popular") as CatalogSort;
  const limit = Number(searchParams.get("limit") ?? 18);

  if (!kind || !validKinds.has(kind)) {
    return NextResponse.json(
      { error: "Invalid kind. Use kind=skills or kind=marketplaces." },
      { status: 400 },
    );
  }

  if (!validSources.has(source)) {
    return NextResponse.json(
      {
        error:
          "Invalid source. Use source=all, source=skills-sh, or source=claude-marketplaces.",
      },
      { status: 400 },
    );
  }

  if (!validSorts.has(sort)) {
    return NextResponse.json(
      { error: "Invalid sort. Use popular, trending, or hot." },
      { status: 400 },
    );
  }

  const response = await getExploreCatalog({
    kind,
    q,
    source,
    sort,
    limit,
  } satisfies CatalogQuery);

  return NextResponse.json(response);
}
