import {
  calculateNextReview,
  calculateXP,
  getMasteryLabel,
} from "@/lib/spaced-repetition";
import type { LearningCard } from "@/types";
import { SPACED_REPETITION_INTERVALS } from "@/types";

function makeCard(overrides: Partial<LearningCard> = {}): LearningCard {
  return {
    id: "test-id",
    certId: "COLORIST",
    analysis: {
      summary: "test",
      mnemonic: "tip",
      keywords: [],
      relatedConcepts: [],
      question: "Q?",
      answer: "A.",
      certId: "COLORIST",
    },
    masteryLevel: 0,
    nextReviewAt: Date.now(),
    lastReviewedAt: Date.now(),
    createdAt: Date.now(),
    reviewCount: 0,
    correctCount: 0,
    ...overrides,
  };
}

describe("calculateNextReview", () => {
  const before = Date.now();

  it("정답 시 masteryLevel이 1 증가한다", () => {
    const card = makeCard({ masteryLevel: 0 });
    const result = calculateNextReview(card, "correct");
    expect(result.masteryLevel).toBe(1);
  });

  it("masteryLevel은 최대 5를 넘지 않는다", () => {
    const card = makeCard({ masteryLevel: 5 });
    const result = calculateNextReview(card, "correct");
    expect(result.masteryLevel).toBe(5);
  });

  it("오답 시 masteryLevel이 0으로 리셋된다", () => {
    const card = makeCard({ masteryLevel: 4 });
    const result = calculateNextReview(card, "incorrect");
    expect(result.masteryLevel).toBe(0);
  });

  it("정답 시 nextReviewAt이 현재보다 미래여야 한다", () => {
    const card = makeCard({ masteryLevel: 0 });
    const result = calculateNextReview(card, "correct");
    expect(result.nextReviewAt).toBeGreaterThan(before);
  });

  it("오답 시 nextReviewAt은 1분(60000ms) 이상 미래다", () => {
    const card = makeCard({ masteryLevel: 3 });
    const result = calculateNextReview(card, "incorrect");
    const expectedInterval = SPACED_REPETITION_INTERVALS[0] * 60 * 1000;
    expect(result.nextReviewAt).toBeGreaterThanOrEqual(Date.now() + expectedInterval - 10);
  });

  it("skip 시 masteryLevel이 유지된다", () => {
    const card = makeCard({ masteryLevel: 2 });
    const result = calculateNextReview(card, "skip");
    expect(result.masteryLevel).toBe(2);
  });

  it("정답 시 correctCount가 증가한다", () => {
    const card = makeCard({ reviewCount: 3, correctCount: 2 });
    const result = calculateNextReview(card, "correct");
    expect(result.correctCount).toBe(3);
    expect(result.reviewCount).toBe(4);
  });

  it("오답 시 correctCount는 유지되고 reviewCount만 증가한다", () => {
    const card = makeCard({ reviewCount: 3, correctCount: 2 });
    const result = calculateNextReview(card, "incorrect");
    expect(result.correctCount).toBe(2);
    expect(result.reviewCount).toBe(4);
  });
});

describe("calculateXP", () => {
  it("정답 시 기본 10 XP를 반환한다", () => {
    expect(calculateXP("correct", 0)).toBe(10);
  });

  it("콤보가 있으면 보너스 XP가 추가된다", () => {
    expect(calculateXP("correct", 3)).toBeGreaterThan(10);
  });

  it("콤보 보너스는 5콤보에서 최대다 (5 초과 시 동일)", () => {
    const xp5 = calculateXP("correct", 5);
    const xp10 = calculateXP("correct", 10);
    expect(xp5).toBe(xp10);
  });

  it("오답/skip 시 0 XP를 반환한다", () => {
    expect(calculateXP("incorrect", 5)).toBe(0);
    expect(calculateXP("skip", 3)).toBe(0);
  });
});

describe("getMasteryLabel", () => {
  it("레벨 0은 시작 라벨을 반환한다", () => {
    expect(getMasteryLabel(0)).toContain("시작");
  });

  it("레벨 5는 마스터 라벨을 반환한다", () => {
    expect(getMasteryLabel(5)).toContain("마스터");
  });

  it("레벨 6 이상도 안전하게 처리된다 (5 클램핑)", () => {
    expect(getMasteryLabel(99)).toBe(getMasteryLabel(5));
  });
});
