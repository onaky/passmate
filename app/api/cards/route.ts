import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllCards, saveCard } from "@/lib/server-db";
import type { LearningCard } from "@/types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const certId = req.nextUrl.searchParams.get("certId") ?? undefined;
  const cards = await getAllCards(session.userId, certId);
  return NextResponse.json(cards);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const card = await req.json() as LearningCard;
  await saveCard(session.userId, card);
  return NextResponse.json({ ok: true }, { status: 201 });
}
