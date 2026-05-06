import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProfile, saveProfile } from "@/lib/server-db";
import type { UserProfile } from "@/types";

export async function GET(): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const profile = await getProfile(session.userId);
  return NextResponse.json(profile ?? null);
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const body = await req.json() as Partial<UserProfile>;
  await saveProfile(session.userId, body);
  return NextResponse.json({ ok: true });
}
