import { prisma } from "@/lib/prisma";
import type { LearningCard, UserProfile, AnalysisResult } from "@/types";

// Card DB Row ↔ LearningCard 변환
function rowToCard(row: {
  id: string;
  certId: string;
  imageBase64: string | null;
  analysisJson: string;
  masteryLevel: number;
  nextReviewAt: bigint;
  lastReviewedAt: bigint;
  createdAt: bigint;
  reviewCount: number;
  correctCount: number;
}): LearningCard {
  return {
    id: row.id,
    certId: row.certId,
    imageBase64: row.imageBase64 ?? undefined,
    analysis: JSON.parse(row.analysisJson) as AnalysisResult,
    masteryLevel: row.masteryLevel,
    nextReviewAt: Number(row.nextReviewAt),
    lastReviewedAt: Number(row.lastReviewedAt),
    createdAt: Number(row.createdAt),
    reviewCount: row.reviewCount,
    correctCount: row.correctCount,
  };
}

// --- Cards ---

export async function saveCard(userId: string, card: LearningCard): Promise<void> {
  await prisma.card.upsert({
    where: { id: card.id },
    update: {
      certId: card.certId,
      imageBase64: card.imageBase64 ?? null,
      analysisJson: JSON.stringify(card.analysis),
      masteryLevel: card.masteryLevel,
      nextReviewAt: BigInt(card.nextReviewAt),
      lastReviewedAt: BigInt(card.lastReviewedAt),
      reviewCount: card.reviewCount,
      correctCount: card.correctCount,
    },
    create: {
      id: card.id,
      userId,
      certId: card.certId,
      imageBase64: card.imageBase64 ?? null,
      analysisJson: JSON.stringify(card.analysis),
      masteryLevel: card.masteryLevel,
      nextReviewAt: BigInt(card.nextReviewAt),
      lastReviewedAt: BigInt(card.lastReviewedAt),
      createdAt: BigInt(card.createdAt),
      reviewCount: card.reviewCount,
      correctCount: card.correctCount,
    },
  });
}

export async function getAllCards(userId: string, certId?: string): Promise<LearningCard[]> {
  const rows = await prisma.card.findMany({
    where: certId ? { userId, certId } : { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(rowToCard);
}

export async function getDueCards(userId: string, certId?: string, limit = 20): Promise<LearningCard[]> {
  const now = BigInt(Date.now());
  const rows = await prisma.card.findMany({
    where: certId
      ? { userId, certId, nextReviewAt: { lte: now } }
      : { userId, nextReviewAt: { lte: now } },
    orderBy: { nextReviewAt: "asc" },
    take: limit,
  });
  return rows.map(rowToCard);
}

export async function deleteCard(userId: string, cardId: string): Promise<void> {
  await prisma.card.deleteMany({ where: { id: cardId, userId } });
}

// --- Profile ---

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const row = await prisma.profile.findUnique({ where: { userId } });
  if (!row) return null;
  return {
    id: row.id,
    selectedCertId: row.selectedCertId,
    level: row.level,
    xp: row.xp,
    totalStudySeconds: row.totalStudySeconds,
    streak: row.streak,
    lastStudiedAt: Number(row.lastStudiedAt),
    createdAt: row.createdAt.getTime(),
  };
}

export async function saveProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  await prisma.profile.upsert({
    where: { userId },
    update: {
      selectedCertId: profile.selectedCertId,
      level: profile.level,
      xp: profile.xp,
      totalStudySeconds: profile.totalStudySeconds,
      streak: profile.streak,
      lastStudiedAt: profile.lastStudiedAt !== undefined ? BigInt(profile.lastStudiedAt) : undefined,
    },
    create: {
      userId,
      selectedCertId: profile.selectedCertId ?? "COLORIST",
      level: profile.level ?? 1,
      xp: profile.xp ?? 0,
      totalStudySeconds: profile.totalStudySeconds ?? 0,
      streak: profile.streak ?? 0,
      lastStudiedAt: BigInt(profile.lastStudiedAt ?? 0),
    },
  });
}
