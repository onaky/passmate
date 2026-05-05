"use client";

import { useEffect, useRef } from "react";

interface ComboDisplayProps {
  combo: number;
}

const COMBO_LABELS: Record<number, { label: string; color: string }> = {
  3: { label: "NICE! 🔥", color: "text-amber-400" },
  5: { label: "GREAT! ⚡", color: "text-yellow-300" },
  7: { label: "AMAZING! 💥", color: "text-orange-400" },
  10: { label: "UNSTOPPABLE! 🌟", color: "text-pink-400" },
};

export function ComboDisplay({ combo }: ComboDisplayProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || combo < 2) return;
    ref.current.classList.remove("combo-pop");
    void ref.current.offsetWidth; // reflow
    ref.current.classList.add("combo-pop");
  }, [combo]);

  if (combo < 2) return null;

  const milestone = Object.keys(COMBO_LABELS)
    .map(Number)
    .filter((k) => combo >= k)
    .pop();

  const { label = "", color = "text-indigo-400" } = milestone
    ? COMBO_LABELS[milestone]
    : {};

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <div className={`text-3xl font-black ${color}`}>
        {combo} COMBO
      </div>
      {label && (
        <div className={`text-sm font-bold ${color}`}>{label}</div>
      )}
    </div>
  );
}
