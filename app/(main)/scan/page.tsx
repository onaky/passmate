"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BookOpenCheck, HelpCircle, BarChart2, NotebookPen } from "lucide-react";
import { ImagePicker } from "@/components/features/scan/image-picker";
import { AnalyzingOverlay } from "@/components/features/scan/analyzing-overlay";
import { PageHeader } from "@/components/layout/page-header";
import { getCertification } from "@/lib/certifications";
import { getProfile } from "@/lib/db";
import type { AnalysisResult } from "@/types";

export default function ScanPage() {
  const router = useRouter();
  const [certId, setCertId] = useState("COLORIST");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    getProfile().then((p) => {
      if (p) setCertId(p.selectedCertId);
      else router.replace("/onboarding");
    });
  }, [router]);

  const cert = getCertification(certId);

  async function handleImages(images: string[]) {
    setError(null);
    setAnalyzing(true);
    setProgress({ done: 0, total: images.length });

    try {
      const results: Array<{ result: AnalysisResult; imageBase64: string }> = [];

      for (let i = 0; i < images.length; i++) {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: images[i], certId }),
        });

        if (!res.ok) {
          const data = await res.json() as { error?: string };
          throw new Error(data.error ?? "AI 분석에 실패했습니다.");
        }

        const result = await res.json() as AnalysisResult;
        results.push({ result, imageBase64: images[i] });
        setProgress({ done: i + 1, total: images.length });
      }

      sessionStorage.setItem("passmate-analysis-batch", JSON.stringify(results));
      router.push("/absorb");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setAnalyzing(false);
      setProgress(null);
    }
  }

  return (
    <>
      {analyzing && <AnalyzingOverlay progress={progress} />}

      <div className="px-5">
        <PageHeader
          title="스캔"
          subtitle={`${cert.icon} ${cert.name} 학습 중`}
        />

        {error && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-start gap-2">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {!analyzing && <ImagePicker onImages={handleImages} />}

        <div className="mt-8 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
            이런 사진을 찍어보세요!
          </h3>
          <ul className="text-xs text-[var(--muted-foreground)] space-y-2">
            <li className="flex items-center gap-2"><BookOpenCheck size={13} /> 교재의 개념 설명 페이지</li>
            <li className="flex items-center gap-2"><HelpCircle size={13} /> 기출문제나 연습 문제</li>
            <li className="flex items-center gap-2"><BarChart2 size={13} /> 색상환, 도표, 그림</li>
            <li className="flex items-center gap-2"><NotebookPen size={13} /> 직접 정리한 노트</li>
          </ul>
        </div>
      </div>
    </>
  );
}
