/**
 * 온보딩 페이지 테스트
 * - 자격증 목록이 표시된다
 * - 자격증 선택 후 버튼 활성화
 * - 선택 후 저장 및 /scan 이동
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/lib/db", () => ({
  saveProfile: jest.fn().mockResolvedValue(undefined),
}));

import OnboardingPage from "@/app/onboarding/page";
import { CERTIFICATIONS } from "@/lib/certifications";
import { saveProfile } from "@/lib/db";
const mockSaveProfile = saveProfile as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("온보딩 페이지", () => {
  it("모든 자격증 이름이 렌더링된다", () => {
    render(<OnboardingPage />);
    for (const cert of CERTIFICATIONS) {
      expect(screen.getByText(cert.name)).toBeInTheDocument();
    }
  });

  it("초기 상태에서 시작 버튼이 비활성화되어 있다", () => {
    render(<OnboardingPage />);
    const button = screen.getByRole("button", { name: /학습 시작/ });
    expect(button).toBeDisabled();
  });

  it("자격증을 선택하면 시작 버튼이 활성화된다", () => {
    render(<OnboardingPage />);
    const firstCert = screen.getByText(CERTIFICATIONS[0].name);
    fireEvent.click(firstCert.closest("button")!);
    const startButton = screen.getByRole("button", { name: /학습 시작/ });
    expect(startButton).not.toBeDisabled();
  });

  it("자격증 선택 후 시작 버튼 클릭 시 saveProfile이 호출된다", async () => {
    render(<OnboardingPage />);
    fireEvent.click(screen.getByText(CERTIFICATIONS[0].name).closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: /학습 시작/ }));
    await waitFor(() => {
      expect(mockSaveProfile).toHaveBeenCalledTimes(1);
    });
  });

  it("시작 후 /scan으로 이동한다", async () => {
    render(<OnboardingPage />);
    fireEvent.click(screen.getByText(CERTIFICATIONS[0].name).closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: /학습 시작/ }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/scan");
    });
  });
});
