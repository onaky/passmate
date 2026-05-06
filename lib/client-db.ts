// 기존 lib/db.ts(IndexedDB)를 서버 API 호출로 완전 대체
// 모든 페이지는 이 파일을 통해 데이터에 접근한다
import type { LearningCard, UserProfile } from "@/types";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// --- Cards ---

export async function saveCard(card: LearningCard): Promise<void> {
  await apiFetch("/api/cards", {
    method: "POST",
    body: JSON.stringify(card),
  });
}

export async function updateCard(card: LearningCard): Promise<void> {
  await apiFetch(`/api/cards/${card.id}`, {
    method: "PUT",
    body: JSON.stringify(card),
  });
}

export async function getAllCards(certId?: string): Promise<LearningCard[]> {
  const url = certId ? `/api/cards?certId=${certId}` : "/api/cards";
  return apiFetch<LearningCard[]>(url);
}

export async function getDueCards(certId?: string): Promise<LearningCard[]> {
  const url = certId ? `/api/cards/due?certId=${certId}` : "/api/cards/due";
  return apiFetch<LearningCard[]>(url);
}

export async function deleteCard(id: string): Promise<void> {
  await apiFetch(`/api/cards/${id}`, { method: "DELETE" });
}

// --- Profile ---

export async function getProfile(): Promise<UserProfile | undefined> {
  const data = await apiFetch<UserProfile | null>("/api/profile");
  return data ?? undefined;
}

export async function saveProfile(profile: Partial<UserProfile>): Promise<void> {
  await apiFetch("/api/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}
