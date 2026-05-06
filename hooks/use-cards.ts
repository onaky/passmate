"use client";

import { useState, useEffect, useCallback } from "react";
import type { LearningCard, AnalysisResult } from "@/types";
import { getAllCards, saveCard, deleteCard, getDueCards } from "@/lib/client-db";
import { generateId } from "@/lib/utils";
import { SPACED_REPETITION_INTERVALS } from "@/types";

export function useCards(certId?: string) {
  const [cards, setCards] = useState<LearningCard[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const fetched = await getAllCards(certId);
    setCards(fetched.sort((a, b) => b.createdAt - a.createdAt));
    setLoading(false);
  }, [certId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCard = useCallback(
    async (analysis: AnalysisResult, imageBase64?: string) => {
      const now = Date.now();
      const card: LearningCard = {
        id: generateId(),
        certId: analysis.certId,
        imageBase64,
        analysis,
        masteryLevel: 0,
        nextReviewAt: now + SPACED_REPETITION_INTERVALS[0] * 60 * 1000,
        lastReviewedAt: now,
        createdAt: now,
        reviewCount: 0,
        correctCount: 0,
      };
      await saveCard(card);
      await refresh();
      return card;
    },
    [refresh]
  );

  const updateCard = useCallback(
    async (id: string, updates: Partial<LearningCard>) => {
      const existing = cards.find((c) => c.id === id);
      if (!existing) return;
      const updated = { ...existing, ...updates };
      await saveCard(updated);
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    },
    [cards]
  );

  const removeCard = useCallback(
    async (id: string) => {
      await deleteCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    },
    []
  );

  return { cards, loading, refresh, addCard, updateCard, removeCard };
}

export function useDueCards(certId?: string) {
  const [dueCards, setDueCards] = useState<LearningCard[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const fetched = await getDueCards(certId);
    setDueCards(fetched);
    setLoading(false);
  }, [certId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { dueCards, loading, refresh };
}
