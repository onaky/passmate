// 자격증 정보
export interface Certification {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  aiPersonaHint: string;
}

// AI 분석 결과 표준 포맷 (CONSTITUTION에 정의된 불변 포맷)
export interface AnalysisResult {
  summary: string;
  mnemonic: string;
  keywords: string[];
  relatedConcepts: string[];
  question: string;
  answer: string;
  certId: string;
}

// 학습 카드 (IndexedDB에 저장되는 단위)
export interface LearningCard {
  id: string;
  certId: string;
  imageBase64?: string;
  analysis: AnalysisResult;
  masteryLevel: number;        // 0~5: 에빙하우스 마스터리
  nextReviewAt: number;        // timestamp (ms)
  lastReviewedAt: number;      // timestamp (ms)
  createdAt: number;           // timestamp (ms)
  reviewCount: number;
  correctCount: number;
}

// 퀴즈 세션 상태
export interface QuizSession {
  currentCard: LearningCard;
  totalCards: number;
  completedCards: number;
  combo: number;
  maxCombo: number;
  xpEarned: number;
  startedAt: number;
}

// 퀴즈 응답
export type QuizAnswer = 'correct' | 'incorrect' | 'skip';

// 사용자 프로필 (로컬)
export interface UserProfile {
  id: string;
  selectedCertId: string;
  level: number;
  xp: number;
  totalStudySeconds: number;
  streak: number;
  lastStudiedAt: number;
  createdAt: number;
}

// 에빙하우스 SM-2 간격 (분 단위)
export const SPACED_REPETITION_INTERVALS: Record<number, number> = {
  0: 1,       // 1분 후
  1: 10,      // 10분 후
  2: 1440,    // 1일 후
  3: 4320,    // 3일 후
  4: 10080,   // 7일 후
  5: 43200,   // 30일 후
};

export const XP_PER_CORRECT = 10;
export const XP_PER_LEVEL = 100;
