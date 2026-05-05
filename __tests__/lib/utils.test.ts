import { cn, generateId, formatStudyTime, xpToLevel } from "@/lib/utils";

describe("cn", () => {
  it("클래스를 합친다", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("조건부 클래스를 처리한다", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("Tailwind 충돌을 마지막 값으로 해소한다", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });
});

describe("generateId", () => {
  it("문자열을 반환한다", () => {
    expect(typeof generateId()).toBe("string");
  });

  it("매번 다른 ID를 생성한다", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("formatStudyTime", () => {
  it("60초 미만은 초 단위로 표시한다", () => {
    expect(formatStudyTime(45)).toBe("45초");
  });

  it("60초 이상 3600초 미만은 분 단위로 표시한다", () => {
    expect(formatStudyTime(90)).toBe("1분");
    expect(formatStudyTime(3599)).toBe("59분");
  });

  it("3600초 이상은 시간+분으로 표시한다", () => {
    expect(formatStudyTime(3660)).toBe("1시간 1분");
    expect(formatStudyTime(7200)).toBe("2시간 0분");
  });
});

describe("xpToLevel", () => {
  it("0 XP는 레벨 1이다", () => {
    expect(xpToLevel(0).level).toBe(1);
  });

  it("100 XP는 레벨 2가 된다", () => {
    expect(xpToLevel(100).level).toBe(2);
  });

  it("progress는 0~1 사이다", () => {
    const { progress } = xpToLevel(50);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(1);
  });

  it("레벨 경계에서 progress가 0이다", () => {
    expect(xpToLevel(200).progress).toBe(0);
  });
});
