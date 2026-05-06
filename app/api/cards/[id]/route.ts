import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteCard, saveCard } from "@/lib/server-db";
import type { LearningCard } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { id } = await params;
  const card = await req.json() as LearningCard;
  if (card.id !== id) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  await saveCard(session.userId, card);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { id } = await params;
  await deleteCard(session.userId, id);
  return NextResponse.json({ ok: true });
}
