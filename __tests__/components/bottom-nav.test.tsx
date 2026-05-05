import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/layout/bottom-nav";

// next/navigation mock
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

import { usePathname } from "next/navigation";
const mockUsePathname = usePathname as jest.Mock;

// next/link mock
jest.mock("next/link", () => {
  const Link = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  Link.displayName = "Link";
  return Link;
});

describe("BottomNav", () => {
  it("3개 탭이 모두 렌더링된다", () => {
    mockUsePathname.mockReturnValue("/scan");
    render(<BottomNav />);
    expect(screen.getByText("스캔")).toBeInTheDocument();
    expect(screen.getByText("암기장")).toBeInTheDocument();
    expect(screen.getByText("퀴즈")).toBeInTheDocument();
  });

  it("현재 경로에 해당하는 탭이 활성화 스타일을 가진다", () => {
    mockUsePathname.mockReturnValue("/cards");
    render(<BottomNav />);
    const cardsLink = screen.getByText("암기장").closest("a");
    expect(cardsLink).toHaveAttribute("href", "/cards");
  });

  it("각 탭의 링크 href가 올바르다", () => {
    mockUsePathname.mockReturnValue("/");
    render(<BottomNav />);
    expect(screen.getByText("스캔").closest("a")).toHaveAttribute("href", "/scan");
    expect(screen.getByText("퀴즈").closest("a")).toHaveAttribute("href", "/play");
  });
});
