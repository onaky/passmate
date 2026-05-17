# PassMate — 자격증 합격 파트너 📚

> 사진 한 장으로 이해하고, 게임처럼 암기하는 AI 자격증 학습 PWA

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://prisma.io)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://passmate-hazel.vercel.app)

**🔗 Live Demo: [passmate-hazel.vercel.app](https://passmate-hazel.vercel.app)**

---

## 서비스 소개

PassMate는 자격증 수험생을 위한 AI 기반 학습 앱입니다. 교재나 기출문제를 **사진 한 장** 찍으면 AI가 핵심 개념을 분석하고, K-문화 기반의 창의적인 암기법을 제시합니다. 에빙하우스 망각 곡선 알고리즘으로 최적의 복습 시기를 자동 계산해 게임처럼 즐기면서 암기할 수 있습니다.

### 지원 자격증

| 자격증 | 아이콘 | AI 페르소나 |
|--------|--------|-------------|
| 컬러리스트 산업기사 | 🎨 | 색채 전문가 — 색상환·먼셀 기호를 시각적 비유로 설명 |
| 공인중개사 | 🏠 | 베테랑 법무사 — 법 조문을 실제 거래 사례로 풀어냄 |
| 전기기사 | ⚡ | 현장 엔지니어 — 수식을 실생활 현상으로 비유 |
| 기타 자격증 | 📚 | 범용 전문 강사 |

---

## 핵심 기능

### 1. AI 이미지 분석
교재, 기출문제, 노트를 촬영하면 Google Gemini AI가 자동으로 분석합니다.

- **핵심 원리** 2~3문장 요약
- **K-문화 암기법** — K-팝 가사 개사, 아재 개그, K-드라마 상황극 등 창의적 암기 팁
- **핵심 키워드** 및 관련 개념
- **예상 시험 문제** + 정답
- 최대 5장 동시 분석 지원

### 2. 에빙하우스 기반 간격 반복 학습
SM-2 알고리즘으로 망각 직전에 복습 알림을 보냅니다.

| 마스터리 레벨 | 심볼 | 다음 복습 |
|--------------|------|-----------|
| 0단계 | 🌱 | 1분 후 |
| 1단계 | 📗 | 10분 후 |
| 2단계 | 📘 | 1일 후 |
| 3단계 | 📙 | 3일 후 |
| 4단계 | 🏆 | 7일 후 |
| 5단계 | 💎 | 30일 후 |

### 3. 게임화된 퀴즈
- **콤보 시스템** — 연속 정답 시 XP 보너스
- **파티클 이펙트** — 정답/오답 시각 피드백
- **레벨 & XP** — 학습할수록 성장하는 캐릭터
- **Shake 애니메이션** — 오답 시 카드 흔들림

### 4. PWA (Progressive Web App)
- 홈 화면에 설치해 네이티브 앱처럼 사용
- 오프라인 캐싱 (Service Worker)
- 복습 시간이 되면 푸시 알림

### 5. 멀티 유저
- ID/Password 기반 계정 시스템
- JWT + HttpOnly Cookie 인증 (30일 유지)
- 유저별 카드 데이터 완전 격리

---

## 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                   Client (PWA)                       │
│  Next.js 16 App Router + React 19 + Tailwind CSS    │
│                                                     │
│  /scan ──▶ /absorb ──▶ /play ──▶ /cards            │
│   촬영       분석 검토    퀴즈     카드 관리          │
└─────────────┬──────────────────────────┬────────────┘
              │ API Routes               │ Service Worker
              ▼                          ▼
┌─────────────────────────┐   ┌──────────────────────┐
│   Next.js API Routes    │   │   Push Notifications  │
│                         │   │   (로컬 스케줄링)     │
│  POST /api/analyze ─────┼──▶  Google Gemini AI     │
│  POST /api/auth/*       │   └──────────────────────┘
│  CRUD /api/cards/*      │
│  GET|PUT /api/profile   │
└─────────────┬───────────┘
              │ Prisma ORM
              ▼
┌─────────────────────────┐
│   PostgreSQL (Supabase) │
│                         │
│  User ──┬── Profile     │
│         └── Card[]      │
└─────────────────────────┘
```

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **UI** | React 19, Tailwind CSS v4, Radix UI, Lucide React |
| **AI** | Google Gemini API (`@google/genai`) |
| **Auth** | JWT (`jose`) + bcryptjs + HttpOnly Cookie |
| **ORM** | Prisma 5 |
| **DB** | PostgreSQL via Supabase (Session Connection Pooler) |
| **PWA** | Service Worker, Web Push API |
| **Deploy** | Vercel |
| **Test** | Jest + React Testing Library |

---

## 유저 플로우

```
회원가입 / 로그인
        │
        ▼
  자격증 선택 (온보딩)
        │
        ▼
┌────── SCAN ───────────────────────────────┐
│  교재 / 기출문제 사진 촬영 (최대 5장)      │
│  Google Gemini AI 이미지 분석             │
└───────────────┬───────────────────────────┘
                │
                ▼
┌────── ABSORB ─────────────────────────────┐
│  AI 분석 결과 검토                         │
│  · 핵심 원리 요약                          │
│  · K-문화 암기법 (K-팝 개사, 아재 개그 등) │
│  · 예상 시험 문제 / 정답                   │
│  마음에 드는 카드 저장                     │
└───────────────┬───────────────────────────┘
                │
                ▼
┌────── PLAY ───────────────────────────────┐
│  에빙하우스 알고리즘 복습 퀴즈              │
│  맞혔어요 → 마스터리 +1, 복습 연기         │
│  틀렸어요 → 마스터리 0, 1분 후 재출제      │
│  콤보 + XP + 레벨업                       │
└───────────────┬───────────────────────────┘
                │
                ▼
         복습 알림 수신
    (망각 직전 자동 푸시 알림)
```

---

## 로컬 개발 환경 설정

### 사전 요구사항
- Node.js 20+
- PostgreSQL (또는 Supabase 계정)
- Google AI Studio API 키 ([발급받기](https://aistudio.google.com/apikey))

### 설치

```bash
git clone https://github.com/onaky/passmate.git
cd passmate
npm install
```

### 환경변수 설정

`.env.local` 파일 생성:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# PostgreSQL — Supabase Session Pooler 권장
DATABASE_URL="postgresql://username:password@host:5432/postgres"

# JWT 서명 시크릿 (랜덤 문자열)
JWT_SECRET="your-random-secret"
```

### DB 테이블 생성

Supabase SQL Editor에서 실행:

```sql
CREATE TABLE "User" (
  "id" TEXT NOT NULL, "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Profile" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL,
  "selectedCertId" TEXT NOT NULL DEFAULT 'COLORIST',
  "level" INTEGER NOT NULL DEFAULT 1, "xp" INTEGER NOT NULL DEFAULT 0,
  "totalStudySeconds" INTEGER NOT NULL DEFAULT 0, "streak" INTEGER NOT NULL DEFAULT 0,
  "lastStudiedAt" BIGINT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Card" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "certId" TEXT NOT NULL,
  "imageBase64" TEXT, "analysisJson" TEXT NOT NULL,
  "masteryLevel" INTEGER NOT NULL DEFAULT 0, "nextReviewAt" BIGINT NOT NULL,
  "lastReviewedAt" BIGINT NOT NULL, "createdAt" BIGINT NOT NULL,
  "reviewCount" INTEGER NOT NULL DEFAULT 0, "correctCount" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE INDEX "Card_userId_certId_idx" ON "Card"("userId", "certId");
CREATE INDEX "Card_userId_nextReviewAt_idx" ON "Card"("userId", "nextReviewAt");
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 실행

```bash
npx prisma generate
npm run dev
# http://localhost:3000
```

---

## 배포 (Vercel)

```bash
npm i -g vercel
vercel login
vercel --prod --yes

# 환경변수 등록
vercel env add GEMINI_API_KEY production
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
```

> `package.json` build 스크립트에 `prisma generate`가 포함되어 배포 시 자동 실행됩니다.

---

## 프로젝트 구조

```
PassMate/
├── app/
│   ├── (main)/              # 인증된 사용자 레이아웃
│   │   ├── scan/            # 이미지 촬영 & AI 분석
│   │   ├── absorb/          # 분석 결과 검토 & 카드 저장
│   │   ├── play/            # 에빙하우스 퀴즈
│   │   └── cards/           # 카드 목록 관리
│   ├── api/
│   │   ├── analyze/         # POST: Gemini AI 이미지 분석
│   │   ├── auth/            # 회원가입, 로그인, 로그아웃, me
│   │   ├── cards/           # 카드 CRUD + 복습 예정 조회
│   │   └── profile/         # 프로필 조회/수정
│   ├── auth/                # 로그인/회원가입 페이지
│   └── onboarding/          # 자격증 선택 온보딩
├── components/
│   ├── features/
│   │   ├── quiz/            # 콤보, 파티클, 프로그레스바
│   │   ├── scan/            # 이미지 피커, 분석 오버레이
│   │   └── notifications/   # 푸시 알림 권한 요청
│   └── layout/              # 하단 네비, 유저바, SW 등록
├── lib/
│   ├── spaced-repetition.ts # SM-2 에빙하우스 알고리즘
│   ├── certifications.ts    # 자격증 메타데이터 & AI 페르소나
│   ├── server-db.ts         # Prisma CRUD (서버)
│   ├── client-db.ts         # API fetch 래퍼 (클라이언트)
│   └── auth.ts              # JWT sign/verify 유틸
├── prisma/
│   └── schema.prisma        # User, Profile, Card 모델
└── public/
    ├── manifest.json        # PWA 설정
    ├── sw.js                # Service Worker (캐싱 + 알림)
    └── icons/               # 앱 아이콘 (192px, 512px)
```

---

## 개발 과정

이 프로젝트는 **Claude Code**와 페어 프로그래밍 방식으로 개발됐습니다.

### 개발 순서

1. **MVP 설계** — 핵심 플로우(스캔 → 흡수 → 퀴즈) 정의
2. **UI/UX 구현** — 모바일 우선 PWA 디자인, 다크 테마
3. **AI 연동** — Google Gemini API 이미지 분석 + 프롬프트 엔지니어링
4. **학습 알고리즘** — SM-2 에빙하우스 간격 반복 구현
5. **게임화** — 콤보, XP, 레벨, 파티클 이펙트 추가
6. **인증 시스템** — JWT + bcrypt 멀티유저 구현
7. **DB 마이그레이션** — IndexedDB → PostgreSQL (Supabase)
8. **PWA** — Service Worker, 푸시 알림, 홈 화면 설치
9. **배포** — Vercel + GitHub

### 주요 기술적 결정

**Next.js App Router 선택**
서버 컴포넌트와 API Routes를 하나의 레포에서 관리. 별도 백엔드 없이 풀스택 구현.

**Supabase Session Pooler 사용**
Vercel 서버리스 환경은 함수 실행마다 새 DB 연결을 생성합니다. Transaction Pooler(6543포트)는 Prisma와 호환 안 되므로 Session Pooler(5432포트)를 사용해 연결 수 제한 문제를 해결했습니다.

**`lib/client-db.ts` 인터페이스 추상화**
기존 IndexedDB API와 동일한 함수 시그니처를 유지하면서 내부 구현만 API 호출로 교체. 기존 컴포넌트를 수정 없이 서버 DB로 마이그레이션할 수 있었습니다.

**JWT + HttpOnly Cookie 인증**
별도 세션 스토어 없이 stateless 인증 구현. HttpOnly 설정으로 XSS 공격에서 토큰을 보호합니다.

**Gemini thinking 모델 파싱**
`gemini-2.5-flash`는 thinking 모델로 응답 candidates에 `thought: true` 파트가 섞입니다. 이를 필터링하고 실제 응답 텍스트만 추출하는 로직으로 파싱 안정성을 확보했습니다.

---

## 테스트

```bash
npm test
npm run test:coverage
```

---

## 라이선스

MIT
