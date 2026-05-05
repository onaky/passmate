import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult } from "@/types";
import { CERTIFICATIONS } from "@/lib/certifications";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

function buildPrompt(certId: string, certName: string, personaHint: string): string {
  return `당신은 "${certName}" 시험을 준비하는 수험생의 친절한 전담 과외 선생님입니다.

페르소나: ${personaHint}

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
3. mnemonic은 앞글자 따기, 라임, 비유, 스토리텔링 등 다양한 방법 활용
4. question과 answer는 실제 시험에 나올 법한 4지선다형 느낌으로 작성

JSON 응답 포맷:
{
  "summary": "핵심 원리를 2~3문장으로 쉽게 설명 (전문 용어는 괄호로 부연)",
  "mnemonic": "😄 기억 꿀팁: [창의적이고 재미있는 암기법 — 최소 2문장]",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "relatedConcepts": ["관련개념1", "관련개념2"],
  "question": "이 내용과 관련하여 시험에 나올 가능성이 높은 핵심 질문 한 줄",
  "answer": "위 질문의 핵심 답변 (1~2문장)"
}

certId: "${certId}"`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as { imageBase64: string; certId: string };
    const { imageBase64, certId } = body;

    if (!imageBase64 || !certId) {
      return NextResponse.json(
        { error: "imageBase64와 certId가 필요합니다." },
        { status: 400 }
      );
    }

    const cert = CERTIFICATIONS.find((c) => c.id === certId);
    const certName = cert?.name ?? certId;
    const personaHint = cert?.aiPersonaHint ?? "해당 분야 전문 강사";

    // base64에서 데이터 URL prefix 분리
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = (mimeMatch?.[1] ?? "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const model = genai.models;
    const response = await model.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: buildPrompt(certId, certName, personaHint),
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const rawText = response.text ?? "";

    // JSON 파싱 (코드 블록 제거)
    const jsonText = rawText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonText) as Omit<AnalysisResult, "certId">;

    const result: AnalysisResult = {
      ...parsed,
      certId,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI analyze error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI 응답 파싱 실패. 다시 시도해주세요." },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "AI 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
