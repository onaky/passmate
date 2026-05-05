/**
 * 루트 페이지 라우팅 테스트
 * - 프로필 없음 → /onboarding
 * - 프로필 있음 → /scan
 * - db 오류 → /onboarding (fallback)
 */
import { render, waitFor } from "@testing-library/react";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("@/lib/db", () => ({
  getProfile: jest.fn(),
}));

import { getProfile } from "@/lib/db";
const mockGetProfile = getProfile as jest.Mock;

// 매 테스트 전 mock 초기화
beforeEach(() => {
  jest.clearAllMocks();
});

async function renderRootPage() {
  const { default: RootPage } = await import("@/app/page");
  return render(<RootPage />);
}

describe("루트 페이지 라우팅", () => {
  it("프로필이 없으면 /onboarding으로 이동한다", async () => {
    mockGetProfile.mockResolvedValue(undefined);
    jest.resetModules();
    const { default: RootPage } = await import("@/app/page");
    render(<RootPage />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/onboarding");
    });
  });

  it("프로필이 있으면 /scan으로 이동한다", async () => {
    mockGetProfile.mockResolvedValue({ selectedCertId: "COLORIST" });
    jest.resetModules();
    const { default: RootPage } = await import("@/app/page");
    render(<RootPage />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/scan");
    });
  });

  it("db 오류 시 /onboarding으로 fallback한다", async () => {
    mockGetProfile.mockRejectedValue(new Error("IndexedDB not available"));
    jest.resetModules();
    const { default: RootPage } = await import("@/app/page");
    render(<RootPage />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/onboarding");
    });
  });

  it("로딩 중에 스피너가 표시된다", async () => {
    // resolve를 지연시켜 로딩 상태 확인
    mockGetProfile.mockReturnValue(new Promise(() => {}));
    jest.resetModules();
    const { default: RootPage } = await import("@/app/page");
    const { container } = render(<RootPage />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
