import type { Certification } from "@/types";

export const CERTIFICATIONS: Certification[] = [
  {
    id: "COLORIST",
    name: "컬러리스트 산업기사",
    description: "색채 이론, 배색, 색채 심리학 등을 다루는 자격증",
    icon: "🎨",
    color: "#ec4899",
    gradientFrom: "#ec4899",
    gradientTo: "#8b5cf6",
    aiPersonaHint:
      "색채 전문가이자 아트 디렉터. 색상 이름, 색상환, 먼셀 기호, 배색 원리를 친숙하게 설명한다. 시각적 비유를 자주 사용한다.",
  },
  {
    id: "REAL_ESTATE",
    name: "공인중개사",
    description: "부동산 법률, 공시법, 중개실무 등을 다루는 자격증",
    icon: "🏠",
    color: "#10b981",
    gradientFrom: "#10b981",
    gradientTo: "#06b6d4",
    aiPersonaHint:
      "경험 많은 부동산 전문 법무사. 법 조문을 일상 언어로 풀어 설명하고, 실제 거래 사례를 예시로 든다.",
  },
  {
    id: "ELECTRICIAN",
    name: "전기기사",
    description: "전기 이론, 전력공학, 전기기기 등을 다루는 자격증",
    icon: "⚡",
    color: "#f59e0b",
    gradientFrom: "#f59e0b",
    gradientTo: "#ef4444",
    aiPersonaHint:
      "현장 경험이 풍부한 전기 엔지니어. 수식과 법칙을 실생활 전기 현상으로 비유하여 설명한다.",
  },
  {
    id: "CUSTOM",
    name: "기타 자격증",
    description: "직접 자격증 이름을 입력하세요",
    icon: "📚",
    color: "#6366f1",
    gradientFrom: "#6366f1",
    gradientTo: "#8b5cf6",
    aiPersonaHint: "해당 분야 전문 강사. 핵심을 짚어 쉽고 명확하게 설명한다.",
  },
];

export function getCertification(certId: string): Certification {
  return (
    CERTIFICATIONS.find((c) => c.id === certId) ??
    CERTIFICATIONS[CERTIFICATIONS.length - 1]
  );
}
