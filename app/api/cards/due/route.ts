import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDueCards } from "@/lib/server-db";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const certId = req.nextUrl.searchParams.get("certId") ?? undefined;
  const cards = await getDueCards(session.userId, certId);
  return NextResponse.json(cards);
}
