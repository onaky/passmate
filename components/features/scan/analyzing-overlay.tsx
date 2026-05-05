"use client";

import { useEffect, useState } from "react";

const TIPS = [
  "💡 에빙하우스 연구에 따르면, 20분 후 복습하면 기억 유지율이 2배 올라가요!",
  "🧠 암기할 때 '왜?'를 먼저 이해하면 오래 기억돼요.",
  "🎯 퀴즈를 풀면서 틀린 것만 집중 복습하는 게 가장 효율적이에요!",
  "⏰ 공부 25분 → 휴식 5분의 '포모도로 기법'을 활용해보세요.",
  "🌙 잠들기 전 복습이 기억을 장기 저장소로 옮겨주는 최고의 방법이에요.",
  "🎮 PassMate의 퀴즈 콤보를 10개 이상 달성하면 집중력이 극대화돼요!",
];

export function AnalyzingOverlay() {
  const [tipIndex, setTipIndex] = useState(0);
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 3000);
    const dotTimer = setInterval(() => {
      setDots((d) => (d % 3) + 1);
    }, 500);
    return () => {
      clearInterval(tipTimer);
      clearInterval(dotTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[var(--background)]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center px-6">
      {/* 로딩 애니메이션 */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          🤖
        </div>
      </div>

      {/* 분석 중 텍스트 */}
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
        AI 선생님이 분석 중{".".repeat(dots)}
      </h2>
      <p className="text-sm text-[var(--muted-foreground)] mb-10 text-center">
        사진에서 핵심 개념을 추출하고<br />
        특별한 암기법을 만들고 있어요
      </p>

      {/* 학습 팁 */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 w-full">
        <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          잠깐, 학습 꿀팁!
        </div>
        <p className="text-sm text-[var(--foreground)] leading-relaxed transition-all">
          {TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
}
