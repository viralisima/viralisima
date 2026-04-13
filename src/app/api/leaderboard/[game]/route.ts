import { NextResponse } from "next/server";
import { getTop, submitScore, isValidGame } from "@/lib/leaderboard";

export const runtime = "edge";

// GET /api/leaderboard/[game]?limit=100
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ game: string }> }
) {
  const { game } = await params;
  if (!isValidGame(game)) {
    return NextResponse.json({ error: "invalid_game" }, { status: 400 });
  }
  try {
    const top = await getTop(game, 100);
    return NextResponse.json({ top });
  } catch (e) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// POST /api/leaderboard/[game]  body: { name, score }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ game: string }> }
) {
  const { game } = await params;
  if (!isValidGame(game)) {
    return NextResponse.json({ error: "invalid_game" }, { status: 400 });
  }
  let body: { name?: string; score?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const name = String(body.name ?? "");
  const score = Number(body.score);
  if (!name.trim() || !Number.isFinite(score)) {
    return NextResponse.json({ error: "bad_input" }, { status: 400 });
  }
  try {
    const finalScore = await submitScore(game, name, score);
    const top = await getTop(game, 100);
    return NextResponse.json({ saved: finalScore, top });
  } catch (e) {
    const msg = (e as Error).message || "server_error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
