import { getCertification, CERTIFICATIONS } from "@/lib/certifications";

describe("CERTIFICATIONS", () => {
  it("최소 1개 이상의 자격증이 정의되어 있다", () => {
    expect(CERTIFICATIONS.length).toBeGreaterThan(0);
  });

  it("각 자격증은 필수 필드를 모두 가진다", () => {
    for (const cert of CERTIFICATIONS) {
      expect(cert.id).toBeTruthy();
      expect(cert.name).toBeTruthy();
      expect(cert.icon).toBeTruthy();
      expect(cert.aiPersonaHint).toBeTruthy();
    }
  });

  it("COLORIST 자격증이 포함되어 있다", () => {
    expect(CERTIFICATIONS.some((c) => c.id === "COLORIST")).toBe(true);
  });
});

describe("getCertification", () => {
  it("존재하는 certId로 올바른 자격증을 반환한다", () => {
    const cert = getCertification("COLORIST");
    expect(cert.id).toBe("COLORIST");
    expect(cert.name).toContain("컬러리스트");
  });

  it("존재하지 않는 certId는 마지막 항목(기타)을 반환한다", () => {
    const fallback = getCertification("UNKNOWN_CERT_XYZ");
    expect(fallback).toBeDefined();
    expect(fallback.id).toBe(CERTIFICATIONS[CERTIFICATIONS.length - 1].id);
  });
});
