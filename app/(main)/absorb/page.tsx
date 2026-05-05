"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpen, Sparkles, Tag, Link2, Target,
  BookMarked, Camera, Gamepad2, Loader2, CheckCircle2
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { saveCard } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { getMasteryLabel } from "@/lib/spaced-repetition";
import { SPACED_REPETITION_INTERVALS } from "@/types";
import type { AnalysisResult, LearningCard } from "@/types";

interface SessionData {
  result: AnalysisResult;
  imageBase64: string;
}

export default function AbsorbPage() {
  const router = useRouter();
  const [data, setData] = useState<SessionData | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("passmate-analysis");
    if (!raw) { router.replace("/scan"); return; }
    try {
      setData(JSON.parse(raw) as SessionData);
    } catch {
      router.replace("/scan");
    }
  }, [router]);

  async function handleSave() {
    if (!data || saving || saved) return;
    setSaving(true);
    const now = Date.now();
    const card: LearningCard = {
      id: generateId(),
      certId: data.result.certId,
      imageBase64: data.imageBase64,
      analysis: data.result,
      masteryLevel: 0,
      nextReviewAt: now + SPACED_REPETITION_INTERVALS[0] * 60 * 1000,
      lastReviewedAt: now,
      createdAt: now,
      reviewCount: 0,
      correctCount: 0,
    };
    await saveCard(card);
    sessionStorage.removeItem("passmate-analysis");
    setSaved(true);
    setSaving(false);
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={36} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  const { result, imageBase64 } = data;

  return (
    <div className="px-5">
      <PageHeader title="AI 해설" subtitle="저장하면 퀴즈에서 다시 만날 수 있어요" backHref="/scan" />

      <div className="flex flex-col gap-4 pb-6">
        <div className="rounded-2xl overflow-hidden border border-[var(--border)] relative aspect-video bg-[var(--card)]">
          <Image src={imageBase64} alt="분석한 이미지" fill className="object-contain" />
        </div>

        {/* 핵심 원리 */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-indigo-400" />
            <h2 className="font-bold text-[var(--foreground)]">핵심 원리</h2>
          </div>
          <div className="text-sm text-[var(--foreground)] leading-relaxed prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.summary}</ReactMarkdown>
          </div>
        </div>

        {/* 암기 팁 */}
        <div className="bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-pink-400" />
            <h2 className="font-bold text-[var(--foreground)]">마법의 암기 팁</h2>
          </div>
          <div className="text-sm text-[var(--foreground)] leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.mnemonic}</ReactMarkdown>
          </div>
        </div>

        {/* 키워드 */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={18} className="text-emerald-400" />
            <h2 className="font-bold text-[var(--foreground)]">핵심 키워드</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((kw) => (
              <span key={kw} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium border border-indigo-500/30">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* 관련 개념 */}
        {result.relatedConcepts.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={18} className="text-sky-400" />
              <h2 className="font-bold text-[var(--foreground)]">함께 알아두면 좋은 개념</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.relatedConcepts.map((concept) => (
                <span key={concept} className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm border border-emerald-500/30">
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 예상 시험 문제 */}
        <div className="bg-[var(--card)] border border-amber-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-amber-400" />
            <h2 className="font-bold text-[var(--foreground)]">예상 시험 문제</h2>
          </div>
          <p className="text-sm text-[var(--foreground)] font-medium mb-3">{result.question}</p>
          <details className="cursor-pointer">
            <summary className="text-xs text-amber-400 font-semibold select-none">정답 보기 ▶</summary>
            <div className="mt-2 p-3 bg-amber-500/10 rounded-xl text-sm text-[var(--foreground)]">
              {result.answer}
            </div>
          </details>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3 pt-2">
          {!saved ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <BookMarked size={20} />}
              {saving ? "저장 중..." : "내 암기장에 저장하기"}
            </button>
          ) : (
            <div className="w-full py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">저장 완료! {getMasteryLabel(0)}으로 시작해요</span>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => { sessionStorage.removeItem("passmate-analysis"); router.push("/scan"); }}
              className="flex-1 py-3 rounded-2xl bg-[var(--secondary)] text-[var(--foreground)] font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Camera size={16} /> 다시 스캔
            </button>
            <button
              onClick={() => { sessionStorage.removeItem("passmate-analysis"); router.push("/play"); }}
              className="flex-1 py-3 rounded-2xl bg-pink-500/20 border border-pink-500/30 text-pink-300 font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Gamepad2 size={16} /> 퀴즈 풀기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
