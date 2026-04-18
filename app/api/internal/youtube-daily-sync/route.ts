import { NextResponse } from "next/server";

import { getYouTubeRuntime } from "@/lib/youtube/config";
import { runYoutubeDailySync } from "@/lib/youtube/sync";

function isAuthorized(request: Request, expectedSecret: string) {
  const authHeader = request.headers.get("authorization") ?? "";
  const customHeader = request.headers.get("x-youtube-sync-secret") ?? "";
  const bearerSecret = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  return bearerSecret === expectedSecret || customHeader === expectedSecret;
}

async function handleRequest(request: Request) {
  const runtime = getYouTubeRuntime();

  if (!runtime.syncSecret) {
    return NextResponse.json(
      { error: "YOUTUBE_SYNC_SECRET is not configured." },
      { status: 500 },
    );
  }

  if (!isAuthorized(request, runtime.syncSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runYoutubeDailySync();

    return NextResponse.json({
      ok: true,
      triggeredAt: new Date().toISOString(),
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "YouTube daily sync failed.";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleRequest(request);
}

export async function GET(request: Request) {
  return handleRequest(request);
}

