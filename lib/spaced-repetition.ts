import {
  SPACED_REPETITION_INTERVALS,
  XP_PER_CORRECT,
  type LearningCard,
  type QuizAnswer,
} from "@/types";

export function calculateNextReview(
  card: LearningCard,
  answer: QuizAnswer
): Pick<LearningCard, "masteryLevel" | "nextReviewAt" | "reviewCount" | "correctCount"> {
  const now = Date.now();

  if (answer === "correct") {
    const newLevel = Math.min(card.masteryLevel + 1, 5);
    const intervalMinutes = SPACED_REPETITION_INTERVALS[newLevel] ?? 43200;
    return {
      masteryLevel: newLevel,
      nextReviewAt: now + intervalMinutes * 60 * 1000,
      reviewCount: card.reviewCount + 1,
      correctCount: card.correctCount + 1,
    };
  }

  if (answer === "incorrect") {
    return {
      masteryLevel: 0,
      nextReviewAt: now + SPACED_REPETITION_INTERVALS[0] * 60 * 1000,
      reviewCount: card.reviewCount + 1,
      correctCount: card.correctCount,
    };
  }

  // skip: 레벨 유지, 10분 후 재노출
  return {
    masteryLevel: card.masteryLevel,
    nextReviewAt: now + 10 * 60 * 1000,
    reviewCount: card.reviewCount,
    correctCount: card.correctCount,
  };
}

export function calculateXP(
  answer: QuizAnswer,
  combo: number
): number {
  if (answer !== "correct") return 0;
  const comboBonus = Math.min(combo, 5);
  return XP_PER_CORRECT + comboBonus * 2;
}

export function getMasteryLabel(level: number): string {
  const labels = ["🌱 시작", "🌿 익숙", "🌳 이해", "⭐ 암기", "🔥 능숙", "💎 마스터"];
  return labels[Math.min(level, 5)];
}
