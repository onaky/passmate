# PassMate — CONSTITUTION.md

> 이 파일은 불변 원칙을 정의한다. 어떤 작업도 이 원칙을 위반할 수 없다.

## 핵심 비전
어떤 자격증이든 사진 한 장으로 이해하고 게임처럼 암기할 수 있는 범용 자격증 합격 보조 서비스.

## 불변 원칙

### 1. 범용성 최우선
- 특정 자격증 이름이 컴포넌트명/변수명에 하드코딩되어선 안 된다
- `certId` 기반 multi-tenancy 구조를 항상 유지한다
- 새 자격증 추가 시 코드 변경 없이 데이터만 추가 가능해야 한다

### 2. 오프라인 우선 (Offline-First)
- 모든 학습 데이터는 IndexedDB에 영속화된다
- 네트워크 없이도 저장된 카드로 퀴즈를 진행할 수 있어야 한다
- PWA로 홈 화면에 추가 가능해야 한다

### 3. 모바일 우선 (Mobile-First)
- 모든 UI는 375px 기준으로 설계한다
- 터치 인터랙션이 마우스보다 우선이다

### 4. AI 응답 표준 포맷 (변경 금지)
모든 AI 분석 결과는 아래 구조를 반드시 포함한다:
```typescript
{
  summary: string;      // 핵심 원리 (쉬운 설명)
  mnemonic: string;     // 암기 비결
  keywords: string[];   // 핵심 키워드
  relatedConcepts: string[]; // 관련 개념
  question: string;     // 자동 생성 퀴즈 문제
  answer: string;       // 퀴즈 정답
}
```

### 5. TypeScript strict mode 필수
- `any` 타입 금지
- `@ts-ignore` 금지
- 모든 props, 상태에 명시적 타입 선언

### 6. 아이콘 — Lucide React 전용 (필수)
- **모든 아이콘은 `lucide-react` 패키지만 사용한다**
- 유니코드 이모지(🎓, 📚, 🎮 등)를 아이콘 대용으로 UI에 사용하는 것을 금지한다
- `react-icons`, SVG 인라인, 이미지 아이콘도 사용하지 않는다
- 신규 컴포넌트 작성 시 아이콘이 필요하면 반드시 Lucide에서 먼저 탐색한다

## 현재 타겟
- **첫 번째 자격증:** 컬러리스트 산업기사 (certId: "COLORIST")
- **대상 사용자:** 시험 2주 전 집중 학습이 필요한 수험생

## 기술 스택 (변경 시 CONSTITUTION 개정 필요)
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS + shadcn/ui
- Storage: IndexedDB (idb 라이브러리)
- AI: Claude 3.5 Sonnet API (Vision)
- PWA: next-pwa
