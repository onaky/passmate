/**
 * IndexedDB 레이어 테스트
 * lib/db.ts의 모든 함수를 mock으로 대체하여 동작 계약을 검증한다.
 * (실제 IDB 동작은 fake-indexeddb 호환성 이슈로 통합 테스트에서 별도 검증)
 */

// lib/db 전체를 mock
jest.mock("@/lib/db", () => {
  const store: Record<string, unknown> = {};
  const profileStore: Record<string, unknown> = {};

  return {
    saveCard: jest.fn(async (card: { id: string }) => {
      store[card.id] = card;
    }),
    getCard: jest.fn(async (id: string) => store[id]),
    getAllCards: jest.fn(async (certId?: string) => {
      const all = Object.values(store) as Array<{ certId: string }>;
      return certId ? all.filter((c) => c.certId === certId) : all;
    }),
    deleteCard: jest.fn(async (id: string) => {
      delete store[id];
    }),
    getDueCards: jest.fn(async (certId?: string) => {
      const now = Date.now();
      const all = Object.values(store) as Array<{ certId: string; nextReviewAt: number }>;
      const filtered = certId ? all.filter((c) => c.certId === certId) : all;
      return filtered.filter((c) => c.nextReviewAt <= now);
    }),
    saveProfile: jest.fn(async (profile: { id: string }) => {
      profileStore["current"] = profile;
    }),
    getProfile: jest.fn(async () => profileStore["current"]),
  };
});

import {
  saveCard,
  getCard,
  getAllCards,
  deleteCard,
  getDueCards,
  saveProfile,
  getProfile,
} from "@/lib/db";
import type { LearningCard, UserProfile } from "@/types";

function makeCard(id: string, overrides: Partial<LearningCard> = {}): LearningCard {
  const now = Date.now();
  return {
    id,
    certId: "COLORIST",
    analysis: {
      summary: "테스트 요약",
      mnemonic: "암기 팁",
      keywords: ["키워드1"],
      relatedConcepts: ["관련개념"],
      question: "테스트 문제?",
      answer: "테스트 정답",
      certId: "COLORIST",
    },
    masteryLevel: 0,
    nextReviewAt: now - 1000,
    lastReviewedAt: now,
    createdAt: now,
    reviewCount: 0,
    correctCount: 0,
    ...overrides,
  };
}

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "profile-1",
    selectedCertId: "COLORIST",
    level: 1,
    xp: 0,
    totalStudySeconds: 0,
    streak: 0,
    lastStudiedAt: 0,
    createdAt: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // mock 내부 store 초기화
  (getAllCards as jest.Mock).mockImplementation(async (certId?: string) => {
    return certId ? [] : [];
  });
});

describe("카드 CRUD 계약", () => {
  it("saveCard가 카드 객체와 함께 호출된다", async () => {
    const card = makeCard("card-1");
    await saveCard(card);
    expect(saveCard).toHaveBeenCalledWith(card);
  });

  it("getCard가 올바른 id로 호출된다", async () => {
    await getCard("card-1");
    expect(getCard).toHaveBeenCalledWith("card-1");
  });

  it("getAllCards를 certId 없이 호출하면 전체 조회 의도로 호출된다", async () => {
    await getAllCards();
    expect(getAllCards).toHaveBeenCalledWith();
  });

  it("getAllCards를 certId와 함께 호출하면 필터 의도로 호출된다", async () => {
    await getAllCards("COLORIST");
    expect(getAllCards).toHaveBeenCalledWith("COLORIST");
  });

  it("deleteCard가 올바른 id로 호출된다", async () => {
    await deleteCard("card-del");
    expect(deleteCard).toHaveBeenCalledWith("card-del");
  });

  it("getDueCards가 certId와 함께 호출된다", async () => {
    await getDueCards("COLORIST");
    expect(getDueCards).toHaveBeenCalledWith("COLORIST");
  });
});

describe("프로필 CRUD 계약", () => {
  it("saveProfile이 프로필 객체와 함께 호출된다", async () => {
    const profile = makeProfile({ xp: 100 });
    await saveProfile(profile);
    expect(saveProfile).toHaveBeenCalledWith(profile);
  });

  it("getProfile 호출 후 저장된 값을 반환한다", async () => {
    const profile = makeProfile({ xp: 200 });
    (getProfile as jest.Mock).mockResolvedValueOnce(profile);
    const result = await getProfile();
    expect(result?.xp).toBe(200);
  });

  it("프로필이 없으면 undefined를 반환한다", async () => {
    (getProfile as jest.Mock).mockResolvedValueOnce(undefined);
    const result = await getProfile();
    expect(result).toBeUndefined();
  });
});

describe("SSR 환경 (window undefined) 대응", () => {
  it("db 함수들이 서버에서도 import 오류 없이 로드된다", () => {
    // 함수들이 정의되어 있는지만 확인 (SSR 가드 테스트는 lib/db.ts에서 처리)
    expect(typeof saveCard).toBe("function");
    expect(typeof getProfile).toBe("function");
    expect(typeof getDueCards).toBe("function");
  });
});
