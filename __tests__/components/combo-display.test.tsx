import { render, screen } from "@testing-library/react";
import { ComboDisplay } from "@/components/features/quiz/combo-display";

describe("ComboDisplay", () => {
  it("콤보가 2 미만이면 아무것도 렌더링하지 않는다", () => {
    const { container } = render(<ComboDisplay combo={1} />);
    expect(container.firstChild).toBeNull();
  });

  it("콤보가 2 이상이면 콤보 수를 표시한다", () => {
    render(<ComboDisplay combo={3} />);
    expect(screen.getByText(/3 COMBO/)).toBeInTheDocument();
  });

  it("3콤보 이상에서 milestone 라벨이 표시된다", () => {
    render(<ComboDisplay combo={3} />);
    expect(screen.getByText(/NICE/i)).toBeInTheDocument();
  });

  it("10콤보에서 UNSTOPPABLE 라벨이 표시된다", () => {
    render(<ComboDisplay combo={10} />);
    expect(screen.getByText(/UNSTOPPABLE/i)).toBeInTheDocument();
  });
});
