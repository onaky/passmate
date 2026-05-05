import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/features/quiz/progress-bar";

describe("ProgressBar", () => {
  it("label이 있으면 렌더링된다", () => {
    render(<ProgressBar completed={3} total={10} label="진행" />);
    expect(screen.getByText("진행")).toBeInTheDocument();
  });

  it("completed/total 텍스트가 표시된다", () => {
    render(<ProgressBar completed={3} total={10} label="진행" />);
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  it("total이 0이면 오류 없이 렌더링된다", () => {
    render(<ProgressBar completed={0} total={0} />);
    // 아무 오류 없이 렌더링되면 통과
  });

  it("완료 비율이 100%를 초과하지 않는다", () => {
    const { container } = render(<ProgressBar completed={15} total={10} />);
    const bar = container.querySelector("[style*='width']") as HTMLElement;
    if (bar) {
      const width = parseInt(bar.style.width);
      expect(width).toBeLessThanOrEqual(100);
    }
  });
});
