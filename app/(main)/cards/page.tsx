"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BookOpen, NotebookPen, Camera, Zap, ChevronUp, ChevronDown, BookMarked
} from "lucide-react";
import { getAllCards, deleteCard, getProfile, getDueCards } from "@/lib/client-db";
import { getMasteryLabel } from "@/lib/spaced-repetition";
import { xpToLevel, formatStudyTime } from "@/lib/utils";
import { getCertification, CERTIFICATIONS } from "@/lib/certifications";
import { PageHeader } from "@/components/layout/page-header";
import type { LearningCard, UserProfile } from "@/types";

export default function CardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<LearningCard[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedCertId, setSelectedCertId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const p = await getProfile();
      setProfile(p ?? null);
      const all = await getAllCards();
      const due = await getDueCards();
      setCards(all.sort((a, b) => b.createdAt - a.createdAt));
      setDueCount(due.length);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    await deleteCard(id);
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered =
    selectedCertId === "ALL"
      ? cards
      : cards.filter((c) => c.certId === selectedCertId);

  const masteredCount = filtered.filter((c) => c.masteryLevel >= 4).length;
  const { level, progress } = xpToLevel(profile?.xp ?? 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BookOpen size={40} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5">
      <PageHeader
        title="내 암기장"
        subtitle={`${cards.length}개의 학습 카드`}
      />

      {profile && (
        <div className="bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-[var(--muted-foreground)] mb-0.5">현재 레벨</div>
              <div className="text-2xl font-black text-indigo-400">Lv. {level}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--muted-foreground)] mb-0.5">총 XP</div>
              <div className="text-lg font-bold text-[var(--foreground)]">
                {profile.xp.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="text-right text-xs text-[var(--muted-foreground)] mt-1">
            다음 레벨까지 {100 - Math.round(progress * 100)} XP
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 text-center">
          <div className="text-xl font-black text-indigo-400">{cards.length}</div>
          <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">전체 카드</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 text-center">
          <div className="text-xl font-black text-emerald-400">{masteredCount}</div>
          <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">마스터</div>
        </div>
        <div className="bg-[var(--card)] border border-amber-500/30 rounded-xl p-3 text-center">
          <div className="text-xl font-black text-amber-400">{dueCount}</div>
          <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">복습 대기</div>
        </div>
      </div>

      {dueCount > 0 && (
        <button
          onClick={() => router.push("/play")}
          className="w-full py-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-sm mb-5 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Zap size={15} /> 복습 대기 {dueCount}개 — 지금 퀴즈 풀기
        </button>
      )}

      {cards.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          <button
            onClick={() => setSelectedCertId("ALL")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              selectedCertId === "ALL"
                ? "bg-indigo-500 text-white"
                : "bg-[var(--secondary)] text-[var(--secondary-foreground)]"
            }`}
          >
            전체
          </button>
          {CERTIFICATIONS.filter((cert) =>
            cards.some((c) => c.certId === cert.id)
          ).map((cert) => (
            <button
              key={cert.id}
              onClick={() => setSelectedCertId(cert.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCertId === cert.id
                  ? "bg-indigo-500 text-white"
                  : "bg-[var(--secondary)] text-[var(--secondary-foreground)]"
              }`}
            >
              {cert.icon} {cert.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <NotebookPen size={48} className="text-[var(--muted-foreground)]" />
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">
              아직 저장된 카드가 없어요
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              교재 사진을 찍고 AI 해설을 저장해보세요!
            </p>
          </div>
          <button
            onClick={() => router.push("/scan")}
            className="px-6 py-3 rounded-2xl bg-indigo-500 text-white font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Camera size={16} /> 첫 카드 만들기
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-6">
          {filtered.map((card) => {
            const cert = getCertification(card.certId);
            const expanded = expandedId === card.id;
            return (
              <div
                key={card.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full text-left p-4"
                  onClick={() => setExpandedId(expanded ? null : card.id)}
                >
                  <div className="flex items-start gap-3">
                    {card.imageBase64 && (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={card.imageBase64}
                          alt="카드 이미지"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">{cert.icon}</span>
                        <span className="text-xs text-[var(--muted-foreground)] truncate">
                          {cert.name}
                        </span>
                        <span className="ml-auto text-xs font-semibold text-indigo-400">
                          {getMasteryLabel(card.masteryLevel)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--foreground)] font-medium leading-snug line-clamp-2">
                        {card.analysis.question}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {card.analysis.keywords.slice(0, 3).map((kw) => (
                          <span
                            key={kw}
                            className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-[var(--muted-foreground)] ml-1">
                      {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
                    <div className="text-sm text-[var(--foreground)] leading-relaxed mb-3">
                      <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mb-1">
                        <BookMarked size={12} /> 핵심 요약
                      </div>
                      {card.analysis.summary}
                    </div>
                    <div className="text-sm text-indigo-300 leading-relaxed mb-3 bg-indigo-500/10 rounded-xl p-3">
                      {card.analysis.mnemonic}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-3">
                      <span>복습 {card.reviewCount}회 | 정답 {card.correctCount}회</span>
                      <span>
                        {new Date(card.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2"
                    >
                      카드 삭제
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
