"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Gamepad2, Star, PartyPopper, Frown, Target, RotateCcw,
  Camera, Trophy, Lightbulb, CheckCircle2, Loader2, SkipForward
} from "lucide-react";
import { getDueCards, saveCard, getProfile } from "@/lib/db";
import { calculateNextReview, calculateXP, getMasteryLabel } from "@/lib/spaced-repetition";
import { saveProfile } from "@/lib/db";
import { xpToLevel } from "@/lib/utils";
import { ParticleBurst } from "@/components/features/quiz/particle-burst";
import { ComboDisplay } from "@/components/features/quiz/combo-display";
import { ProgressBar } from "@/components/features/quiz/progress-bar";
import { PageHeader } from "@/components/layout/page-header";
import type { LearningCard, QuizAnswer } from "@/types";

type Phase = "loading" | "empty" | "question" | "answer" | "result";

export default function PlayPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [queue, setQueue] = useState<LearningCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<QuizAnswer | null>(null);
  const [burstActive, setBurstActive] = useState(false);
  const [burstType, setBurstType] = useState<"correct" | "wrong">("correct");
  const [certId, setCertId] = useState("COLORIST");
  const cardRef = useRef<HTMLDivElement>(null);

  const currentCard = queue[currentIndex];

  const loadCards = useCallback(async () => {
    setPhase("loading");
    const profile = await getProfile();
    if (profile) setCertId(profile.selectedCertId);

    const cards = await getDueCards(profile?.selectedCertId);
    if (cards.length === 0) {
      setPhase("empty");
      return;
    }
    setQueue(cards);
    setCurrentIndex(0);
    setCompleted(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalXP(0);
    setPhase("question");
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  async function handleAnswer(answer: QuizAnswer) {
    if (!currentCard || phase !== "answer") return;
    setLastAnswer(answer);

    const updates = calculateNextReview(currentCard, answer);
    const xp = calculateXP(answer, combo);

    const updatedCard: LearningCard = {
      ...currentCard,
      ...updates,
      lastReviewedAt: Date.now(),
    };
    await saveCard(updatedCard);

    const newCombo = answer === "correct" ? combo + 1 : 0;
    const newMaxCombo = Math.max(maxCombo, newCombo);
    const newXP = totalXP + xp;

    setCombo(newCombo);
    setMaxCombo(newMaxCombo);
    setTotalXP(newXP);

    setBurstType(answer === "correct" ? "correct" : "wrong");
    setBurstActive(true);
    setTimeout(() => setBurstActive(false), 100);

    if (answer === "incorrect" && cardRef.current) {
      cardRef.current.classList.add("shake");
      setTimeout(() => cardRef.current?.classList.remove("shake"), 500);
    }

    const profile = await getProfile();
    if (profile) {
      await saveProfile({ ...profile, xp: profile.xp + xp });
    }

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        setCompleted(nextIndex);
        setPhase("result");
      } else {
        setCurrentIndex(nextIndex);
        setCompleted(nextIndex);
        setLastAnswer(null);
        setPhase("question");
      }
    }, 600);
  }

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto mb-4 text-indigo-400 animate-spin" />
          <p className="text-[var(--muted-foreground)]">카드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="px-5">
        <PageHeader title="퀴즈" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
          <Star size={64} className="text-amber-400" />
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
              지금 당장 풀 카드가 없어요!
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              암기장에 저장된 카드가 없거나<br />
              모든 카드를 완료했어요. 잘 하셨어요!<br />
              사진을 더 스캔하거나 복습 시간을 기다려 주세요.
            </p>
          </div>
          <button
            onClick={() => router.push("/scan")}
            className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Camera size={18} /> 지금 스캔하러 가기
          </button>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const { level } = xpToLevel(totalXP);
    return (
      <div className="px-5">
        <PageHeader title="퀴즈 완료!" />
        <div className="flex flex-col items-center gap-6 py-8">
          <PartyPopper size={64} className="text-pink-400 level-up-anim" />

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-indigo-400">{completed}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">완료 카드</div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-pink-400">{maxCombo}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">최고 콤보</div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-amber-400">+{totalXP}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">획득 XP</div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-400">Lv.{level}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">현재 레벨</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={loadCards}
              className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> 계속 퀴즈 풀기
            </button>
            <button
              onClick={() => router.push("/scan")}
              className="w-full py-3 rounded-2xl bg-[var(--secondary)] text-[var(--foreground)] font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Camera size={16} /> 새 내용 스캔하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <>
      <ParticleBurst type={burstType} active={burstActive} />

      <div className="px-5">
        <PageHeader title="퀴즈" />

        <div className="relative mb-4">
          <ProgressBar
            completed={completed}
            total={queue.length}
            label="진행"
          />
        </div>

        <div className="min-h-[60px] flex justify-center items-center mb-4">
          <ComboDisplay combo={combo} />
        </div>

        <div
          ref={cardRef}
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden mb-5"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-xs font-semibold text-indigo-400">
              {getMasteryLabel(currentCard.masteryLevel)}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              복습 {currentCard.reviewCount}회
            </span>
          </div>

          {currentCard.imageBase64 && (
            <div className="relative aspect-video bg-[var(--secondary)] mx-4 mb-3 rounded-xl overflow-hidden">
              <Image
                src={currentCard.imageBase64}
                alt="학습 이미지"
                fill
                className="object-contain"
              />
            </div>
          )}

          <div className="px-4 pb-4">
            <p className="font-semibold text-[var(--foreground)] leading-relaxed mb-2">
              {currentCard.analysis.question}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentCard.analysis.keywords.slice(0, 3).map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {phase === "question" && (
          <button
            onClick={() => setPhase("answer")}
            className="w-full py-4 rounded-2xl bg-[var(--secondary)] text-[var(--foreground)] font-bold text-lg active:scale-95 transition-transform mb-4 flex items-center justify-center gap-2"
          >
            <Lightbulb size={20} /> 정답 / 해설 보기
          </button>
        )}

        {phase === "answer" && (
          <div className="flex flex-col gap-3 mb-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
                <CheckCircle2 size={13} /> 정답
              </div>
              <p className="text-sm text-[var(--foreground)] leading-relaxed mb-3">
                {currentCard.analysis.answer}
              </p>
              <div className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentCard.analysis.mnemonic}
                </ReactMarkdown>
              </div>
            </div>

            <p className="text-center text-sm text-[var(--muted-foreground)]">
              정답을 맞혔나요?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswer("incorrect")}
                className="py-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-base active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Frown size={18} /> 틀렸어요
              </button>
              <button
                onClick={() => handleAnswer("correct")}
                className="py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Target size={18} /> 맞혔어요!
              </button>
            </div>
            <button
              onClick={() => handleAnswer("skip")}
              className="py-2 text-sm text-[var(--muted-foreground)] flex items-center justify-center gap-1 underline underline-offset-2"
            >
              <SkipForward size={14} /> 나중에 다시 볼게요
            </button>
          </div>
        )}
      </div>
    </>
  );
}
