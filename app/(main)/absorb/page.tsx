"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpen, Sparkles, Tag, Link2, Target,
  BookMarked, Camera, Gamepad2, Loader2, CheckCircle2,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { saveCard, getDueCards } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { getMasteryLabel } from "@/lib/spaced-repetition";
import { scheduleReviewNotification, calcNotificationDelay } from "@/lib/notifications";
import { SPACED_REPETITION_INTERVALS } from "@/types";
import type { AnalysisResult, LearningCard } from "@/types";

interface SessionItem {
  result: AnalysisResult;
  imageBase64: string;
}

function makeCard(item: SessionItem): LearningCard {
  const now = Date.now();
  return {
    id: generateId(),
    certId: item.result.certId,
    imageBase64: item.imageBase64,
    analysis: item.result,
    masteryLevel: 0,
    nextReviewAt: now + SPACED_REPETITION_INTERVALS[0] * 60 * 1000,
    lastReviewedAt: now,
    createdAt: now,
    reviewCount: 0,
    correctCount: 0,
  };
}

export default function AbsorbPage() {
  const router = useRouter();
  const [items, setItems] = useState<SessionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedSet, setSavedSet] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 다중 배치 우선 시도, 없으면 구 단일 키 시도 (하위 호환)
    const batchRaw = sessionStorage.getItem("passmate-analysis-batch");
    const singleRaw = sessionStorage.getItem("passmate-analysis");

    if (batchRaw) {
      try {
        setItems(JSON.parse(batchRaw) as SessionItem[]);
        return;
      } catch { /* fall through */ }
    }
    if (singleRaw) {
      try {
        setItems([JSON.parse(singleRaw) as SessionItem]);
        return;
      } catch { /* fall through */ }
    }
    router.replace("/scan");
  }, [router]);

  async function triggerNotification() {
    const due = await getDueCards();
    if (due.length > 0) {
      scheduleReviewNotification(due.length, calcNotificationDelay(due.length));
    }
  }

  async function handleSave() {
    if (saving || savedSet.has(currentIndex)) return;
    setSaving(true);
    await saveCard(makeCard(items[currentIndex]));
    setSavedSet((prev) => new Set([...prev, currentIndex]));
    setSaving(false);
    triggerNotification();
  }

  async function handleSaveAll() {
    if (saving) return;
    setSaving(true);
    const unsaved = items.filter((_, i) => !savedSet.has(i));
    await Promise.all(unsaved.map((item) => saveCard(makeCard(item))));
    setSavedSet(new Set(items.map((_, i) => i)));
    setSaving(false);
    triggerNotification();
  }

  function handleDone() {
    sessionStorage.removeItem("passmate-analysis-batch");
    sessionStorage.removeItem("passmate-analysis");
    router.push("/scan");
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={36} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  const item = items[currentIndex];
  const { result, imageBase64 } = item;
  const isSaved = savedSet.has(currentIndex);
  const allSaved = savedSet.size === items.length;

  return (
    <div className="px-5">
      <PageHeader title="AI 해설" subtitle="저장하면 퀴즈에서 다시 만날 수 있어요" backHref="/scan" />

      {/* 페이지 네비게이션 (다중일 때만) */}
      {items.length > 1 && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="p-2 rounded-xl bg-[var(--secondary)] disabled:opacity-30 active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} className="text-[var(--foreground)]" />
          </button>
          <div className="flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? "bg-indigo-400" : savedSet.has(i) ? "bg-emerald-500" : "bg-[var(--border)]"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentIndex((i) => Math.min(items.length - 1, i + 1))}
            disabled={currentIndex === items.length - 1}
            className="p-2 rounded-xl bg-[var(--secondary)] disabled:opacity-30 active:scale-95 transition-transform"
          >
            <ChevronRight size={20} className="text-[var(--foreground)]" />
          </button>
        </div>
      )}

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
          {/* 현재 카드 저장 */}
          {!isSaved ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <BookMarked size={20} />}
              {saving ? "저장 중..." : items.length > 1 ? `이 카드 저장 (${currentIndex + 1}/${items.length})` : "내 암기장에 저장하기"}
            </button>
          ) : (
            <div className="w-full py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">저장 완료! {getMasteryLabel(0)}으로 시작해요</span>
            </div>
          )}

          {/* 전체 저장 버튼 (다중이고 아직 안 저장된 것이 있을 때) */}
          {items.length > 1 && !allSaved && (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <BookMarked size={16} />}
              전체 {items.length}장 한번에 저장
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDone}
              className="flex-1 py-3 rounded-2xl bg-[var(--secondary)] text-[var(--foreground)] font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Camera size={16} /> 다시 스캔
            </button>
            <button
              onClick={() => { sessionStorage.removeItem("passmate-analysis-batch"); sessionStorage.removeItem("passmate-analysis"); router.push("/play"); }}
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
