"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePicker } from "@/components/features/scan/image-picker";
import { AnalyzingOverlay } from "@/components/features/scan/analyzing-overlay";
import { PageHeader } from "@/components/layout/page-header";
import { getCertification } from "@/lib/certifications";
import { getProfile } from "@/lib/db";
import type { AnalysisResult } from "@/types";

export default function ScanPage() {
  const router = useRouter();
  const [certId, setCertId] = useState("COLORIST");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then((p) => {
      if (p) setCertId(p.selectedCertId);
      else router.replace("/onboarding");
    });
  }, [router]);

  const cert = getCertification(certId);

  async function handleImage(base64: string) {
    setPreviewSrc(base64);
    setError(null);
    setAnalyzing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, certId }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "AI 분석에 실패했습니다.");
      }

      const result = await res.json() as AnalysisResult;

      // 결과를 sessionStorage에 임시 저장 후 Absorb 페이지로 이동
      sessionStorage.setItem("passmate-analysis", JSON.stringify({ result, imageBase64: base64 }));
      router.push("/absorb");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setAnalyzing(false);
    }
  }

  return (
    <>
      {analyzing && <AnalyzingOverlay />}

      <div className="px-5">
        <PageHeader
          title="📷 스캔"
          subtitle={`${cert.icon} ${cert.name} 학습 중`}
        />

        {/* 미리보기 */}
        {previewSrc && !analyzing && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-[var(--border)] relative aspect-video">
            <Image
              src={previewSrc}
              alt="업로드된 이미지"
              fill
              className="object-contain"
            />
            <button
              onClick={() => { setPreviewSrc(null); setError(null); }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* 이미지 선택 UI */}
        {!previewSrc && <ImagePicker onImage={handleImage} />}

        {/* 안내 */}
        <div className="mt-8 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
            이런 사진을 찍어보세요!
          </h3>
          <ul className="text-xs text-[var(--muted-foreground)] space-y-1">
            <li>📖 교재의 개념 설명 페이지</li>
            <li>❓ 기출문제나 연습 문제</li>
            <li>📊 색상환, 도표, 그림</li>
            <li>🗒️ 직접 정리한 노트</li>
          </ul>
        </div>
      </div>
    </>
  );
}
