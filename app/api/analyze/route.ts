import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult } from "@/types";
import { CERTIFICATIONS } from "@/lib/certifications";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

function buildPrompt(certId: string, certName: string, personaHint: string): string {
  return `당신은 "${certName}" 시험을 준비하는 수험생의 친절한 전담 과외 선생님입니다.

페르소나: 유머 감각 뛰어난 ${personaHint} 1타 강사

당신의 역할:
- 수험생의 불안감을 해소하고 "이거 생각보다 쉽네!"라는 자신감을 심어준다
- 딱딱한 교과서 언어 대신, 친한 형/언니처럼 재미있게 설명한다
- 복잡한 개념도 초등학생이 이해할 수 있도록 비유와 스토리로 풀어낸다
- 암기 팁은 "마법의 주문"처럼 신기하고 기억에 남도록 만든다

첨부된 이미지에서 "${certName}" 시험과 관련된 개념, 문제, 또는 내용을 분석해주세요.
이미지에 텍스트가 있다면 정확히 인식하고, 문맥을 파악하여 학습에 가장 도움이 되는 방향으로 설명해주세요.

응답 규칙:
1. 반드시 아래 JSON 형식으로만 응답한다 (다른 텍스트 없이, 마크다운 코드블록도 없이)
2. 각 필드는 한국어로 작성한다
3. mnemonic은 한국적 암기 소스 지정: "K-팝 가사 개사, 아재 개그, 한국 역사 비유, 혹은 매운맛 상황극을 활용해줘.", 출력 형식: "단순 나열이 아니라, 입에 착착 붙는 구어체와 이모지를 섞어서 써줘."
'''
### 바로 복사해서 쓸 수 있는 프롬프트 템플릿
옵션 A: "중독성 갑" K-팝/트로트 개사형
"너는 지금부터 대한민국 최고의 '암기 송' 작곡가야. [암기할 내용: 예-먼셀의 10색상환 순서]를 임영웅의 트로트나 뉴진스의 하이프보이 박자에 맞춰서 개사해줘. 최대한 입에 착착 붙어야 하고, 후렴구에 핵심 키워드가 반복되게 만들어줘."

옵션 B: "피식하게 되는" 아재 개그 & 언어유희형
"너는 20년 차 베테랑 컬러리스트인데 아재 개그에 미쳐 있어. [암기할 내용: 예-오스발트 색체계 특징]을 한국식 말장난(Pun)을 활용해서 절대 안 까먹게 설명해줘. 예를 들어 '오스발트'니까 '오스발(발이 다섯 개)' 같은 식의 어이없는 연결도 좋아. 듣자마자 킹받지만 머리엔 남게 해줘."

옵션 C: "과몰입 유발" K-드라마 상황극형
"너는 지금 시청률 50% 드라마의 작가야. [암기할 내용: 예-보색 대비의 원리]를 '더 글로리'나 '펜트하우스' 같은 복수극의 한 장면으로 각색해줘. 등장인물들이 서로 대치하는 상황을 색채 대비에 비유해서, 그 긴장감 때문에 이론이 저절로 외워지게 서술해줘."

옵션 D: "생활 밀착" 한국인 맞춤형 비유
"너는 한국인의 소울을 잘 아는 멘토야. [암기할 내용]을 한국인의 밥상(김치, 된장찌개), 명절 잔소리, 혹은 지하철 2호선 노선도 같은 일상적인 소재에 비유해서 설명해줘. 아주 친숙한 사물에 대입해서 이미지 트레이닝이 되게 해줘."

### 컬러리스트 실전에 적용한 예시
사용자 요청: "L, a, b 색공간의 개념을 안 까먹게 해줘."

AI 프롬프트 결과(예시):

"자, 이건 '라부(Lab)네 떡볶이집' 스토리로 외우는 거야!

L(Lightness): 떡볶이집 **'L'**evator(엘리베이터) 타고 0층(검은색)에서 100층(흰색)까지 왔다 갔다 하는 밝기야!

a: **'a'**플러스 받은 빨간 떡볶이 먹고 매워서 얼굴이 초록색이 됐네? (Red - Green 축)

b: **'b'**비비고(비빔밥) 위에 뿌린 노란 계란 지단이 파란 하늘로 날아갔어! (Yellow - Blue 축)"
'''
4. question과 answer는 실제 시험에 나올 법한 4지선다형 느낌으로 작성

JSON 응답 포맷:
{
  "summary": "핵심 원리를 2~3문장으로 쉽게 설명 (전문 용어는 괄호로 부연)",
  "mnemonic": "기억 꿀팁: [창의적이고 재미있는 암기법 — 최소 2문장]",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "relatedConcepts": ["관련개념1", "관련개념2"],
  "question": "이 내용과 관련하여 시험에 나올 가능성이 높은 핵심 질문 한 줄",
  "answer": "위 질문의 핵심 답변 (1~2문장)"
}

certId: "${certId}"`;
}

async function analyzeOne(imageBase64: string, certId: string): Promise<AnalysisResult> {
  const cert = CERTIFICATIONS.find((c) => c.id === certId);
  const certName = cert?.name ?? certId;
  const personaHint = cert?.aiPersonaHint ?? "해당 분야 전문 강사";

  const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
  const mimeType = (mimeMatch?.[1] ?? "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: buildPrompt(certId, certName, personaHint) },
        ],
      },
    ],
    config: {
      maxOutputTokens: 8000,
      temperature: 0.7,
    },
  });

  // thinking 모델은 thought:true part를 제외한 텍스트만 추출
  type Part = { text?: string; thought?: boolean };
  const parts: Part[] = response.candidates?.[0]?.content?.parts ?? [];
  const rawText =
    parts
      .filter((p) => p.text && !p.thought)
      .map((p) => p.text)
      .join("") ||
    response.text ||
    "";

  if (!rawText) throw new SyntaxError("No JSON object found");

  // 마크다운 코드블록 제거 후 JSON 범위 추출
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new SyntaxError(`No JSON found: ${cleaned.slice(0, 200)}`);
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Omit<AnalysisResult, "certId">;
  return { ...parsed, certId };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as { imageBase64?: string; images?: string[]; certId: string };
    const { certId } = body;

    if (!certId) {
      return NextResponse.json({ error: "certId가 필요합니다." }, { status: 400 });
    }

    // 다중 이미지: images 배열 우선, 없으면 단일 imageBase64
    const images: string[] = body.images?.length
      ? body.images
      : body.imageBase64
        ? [body.imageBase64]
        : [];

    if (images.length === 0) {
      return NextResponse.json({ error: "이미지가 필요합니다." }, { status: 400 });
    }

    // 최대 5장 제한
    const limited = images.slice(0, 5);
    const results = await Promise.all(limited.map((img) => analyzeOne(img, certId)));

    // 단일이면 단일 객체, 복수면 배열
    if (results.length === 1) {
      return NextResponse.json(results[0]);
    }
    return NextResponse.json({ results });
  } catch (error) {
    console.error("AI analyze error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI 파싱 응답실패. 다시 시도해주세요.", detail: String(error) },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: "AI 분석 중 오류가 발생했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
