# NEXT_SESSION — PassMate

## 마지막 세션 요약
- 세션 날짜: 2026-05-05
- 작업자: Claude (MVP 구축 세션)
- 완료한 것: Phase 1 MVP 전체 구축 및 10개 커밋 완료

## 완료된 작업 목록
1. 하네스 문서 초기화 (CONSTITUTION, PLANS, open-decisions, tech-debt)
2. Next.js 16 + TypeScript strict 프로젝트 셋업
3. PWA 설정 (manifest.json, Service Worker 수동 구현)
4. IndexedDB 데이터 레이어 (idb 기반, Generic Knowledge Schema)
5. AI API Route (/api/analyze, Claude 3.5 Sonnet Vision)
6. 온보딩 페이지 (자격증 선택)
7. Scan 페이지 (카메라/갤러리 + AI 분석 흐름)
8. Absorb 페이지 (AI 결과 카드 + IndexedDB 저장)
9. Play 페이지 (간격 반복 퀴즈 + 콤보/파티클/XP 게임 요소)
10. Cards 대시보드 (카드 목록, 통계, 레벨 표시)

## 다음 세션 시작점
Phase 2 시작: UX 개선 및 다중 자격증 강화

## 즉시 해야 할 일
1. `.env.local`에 실제 ANTHROPIC_API_KEY 입력
2. `npm run dev` → 브라우저에서 로컬 테스트
3. 컬러리스트 교재 사진으로 Scan → Absorb → Play 전체 플로우 테스트
4. (선택) Vercel 배포 후 모바일에서 PWA '홈 화면에 추가' 테스트

## Phase 2 후보 작업
- 자격증 변경 설정 화면
- 틀린 카드 즉시 재학습 모드
- 카드별 상세 통계 페이지
- 학습 스트릭 (연속 학습일) 기능
- 이미지 없는 수동 카드 추가 기능

## 알려진 이슈
- next-pwa를 next.js 16 Turbopack 호환 문제로 수동 SW로 대체함
- public/icons/*.png는 placeholder (실제 아이콘으로 교체 필요)
