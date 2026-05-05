/**
 * Absorb 페이지 테스트
 * - sessionStorage에 데이터 없으면 /scan으로 리다이렉트
 * - AI 분석 결과가 표시된다
 * - 저장 버튼 클릭 시 saveCard 호출
 * - 다시 스캔 버튼 클릭 시 /scan으로 이동
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { AnalysisResult } from "@/types";

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock("@/lib/db", () => ({
  saveCard: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("react-markdown", () => {
  const ReactMarkdown = ({ children }: { children: string }) => <span>{children}</span>;
  ReactMarkdown.displayName = "ReactMarkdown";
  return ReactMarkdown;
});

jest.mock("remark-gfm", () => () => {});

jest.mock("next/image", () => {
  const NextImage = ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />;
  NextImage.displayName = "NextImage";
  return NextImage;
});

const mockAnalysis: AnalysisResult = {
  summary: "색채의 핵심 원리 요약",
  mnemonic: "😄 기억 꿀팁: 빨주노초파남보!",
  keywords: ["색상", "채도", "명도"],
  relatedConcepts: ["색상환", "보색"],
  question: "먼셀 기호에서 채도를 나타내는 요소는?",
  answer: "먼셀 기호에서 채도는 /C로 표기됩니다.",
  certId: "COLORIST",
};

const mockSessionData = {
  result: mockAnalysis,
  imageBase64: "data:image/png;base64,abc123",
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
});

describe("Absorb 페이지", () => {
  it("sessionStorage에 데이터 없으면 /scan으로 리다이렉트한다", async () => {
    const { default: AbsorbPage } = await import("@/app/(main)/absorb/page");
    render(<AbsorbPage />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/scan");
    });
  });

  it("AI 분석 결과(summary)가 표시된다", async () => {
    sessionStorage.setItem("passmate-analysis", JSON.stringify(mockSessionData));
    const { default: AbsorbPage } = await import("@/app/(main)/absorb/page");
    render(<AbsorbPage />);
    await waitFor(() => {
      expect(screen.getByText("색채의 핵심 원리 요약")).toBeInTheDocument();
    });
  });

  it("키워드가 모두 표시된다", async () => {
    sessionStorage.setItem("passmate-analysis", JSON.stringify(mockSessionData));
    const { default: AbsorbPage } = await import("@/app/(main)/absorb/page");
    render(<AbsorbPage />);
    await waitFor(() => {
      expect(screen.getByText("색상")).toBeInTheDocument();
      expect(screen.getByText("채도")).toBeInTheDocument();
      expect(screen.getByText("명도")).toBeInTheDocument();
    });
  });

  it("저장 버튼 클릭 시 saveCard가 호출된다", async () => {
    const { saveCard } = await import("@/lib/db");
    sessionStorage.setItem("passmate-analysis", JSON.stringify(mockSessionData));
    const { default: AbsorbPage } = await import("@/app/(main)/absorb/page");
    render(<AbsorbPage />);
    await waitFor(() => screen.getByText(/암기장에 저장/));
    fireEvent.click(screen.getByText(/암기장에 저장/));
    await waitFor(() => {
      expect(saveCard).toHaveBeenCalledTimes(1);
    });
  });

  it("다시 스캔 버튼 클릭 시 /scan으로 이동한다", async () => {
    sessionStorage.setItem("passmate-analysis", JSON.stringify(mockSessionData));
    const { default: AbsorbPage } = await import("@/app/(main)/absorb/page");
    render(<AbsorbPage />);
    await waitFor(() => screen.getByText(/다시 스캔/));
    fireEvent.click(screen.getByText(/다시 스캔/));
    expect(mockPush).toHaveBeenCalledWith("/scan");
  });
});
