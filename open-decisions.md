# PassMate — Open Decisions

## 상태 범례
- 🔴 블로커 (작업 불가)
- 🟡 결정 필요 (작업 가능하나 확인 필요)
- 🟢 완료

---

## 🟡 API Key 관리
**질문:** Anthropic API Key를 어떻게 관리할 것인가?
**결정:** .env.local에 ANTHROPIC_API_KEY 환경변수로 관리. 사용자가 직접 발급 후 입력.
**상태:** MVP에서는 서버 사이드 API Route에서만 사용 (클라이언트 노출 없음)

## 🟢 스토리지 선택
**결정:** IndexedDB (idb 라이브러리)
**이유:** LocalStorage는 용량 제한(5MB)과 이미지 저장 불가 문제. IndexedDB는 50MB+ 지원.

## 🟢 퀴즈 알고리즘
**결정:** 에빙하우스 망각 곡선 기반 SM-2 변형 알고리즘
- Mastery 0 (처음): 1분 후 재출제
- Mastery 1 (한 번 맞춤): 10분 후 재출제  
- Mastery 2 (두 번 맞춤): 1일 후 재출제
- Mastery 3+: 간격 × 2.5 증가

## 🟡 이미지 저장 방식
**결정:** Base64로 IndexedDB에 저장 (MVP). 파일 크기 큰 경우 압축 적용.
