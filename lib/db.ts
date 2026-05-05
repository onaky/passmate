import { openDB, type IDBPDatabase } from "idb";
import type { LearningCard, UserProfile } from "@/types";

const DB_NAME = "passmate-db";
const DB_VERSION = 1;

type PassMateDB = {
  cards: {
    key: string;
    value: LearningCard;
    indexes: { "by-certId": string; "by-nextReview": number };
  };
  profile: {
    key: string;
    value: UserProfile;
  };
};

let dbPromise: Promise<IDBPDatabase<PassMateDB>> | null = null;

function getDB(): Promise<IDBPDatabase<PassMateDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in server environment"));
  }
  if (!dbPromise) {
    dbPromise = openDB<PassMateDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const cardStore = db.createObjectStore("cards", { keyPath: "id" });
        cardStore.createIndex("by-certId", "certId");
        cardStore.createIndex("by-nextReview", "nextReviewAt");

        db.createObjectStore("profile", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

// --- Cards ---

export async function saveCard(card: LearningCard): Promise<void> {
  const db = await getDB();
  await db.put("cards", card);
}

export async function getCard(id: string): Promise<LearningCard | undefined> {
  const db = await getDB();
  return db.get("cards", id);
}

export async function getAllCards(certId?: string): Promise<LearningCard[]> {
  const db = await getDB();
  if (certId) {
    return db.getAllFromIndex("cards", "by-certId", certId);
  }
  return db.getAll("cards");
}

export async function deleteCard(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("cards", id);
}

export async function getDueCards(
  certId?: string,
  limit = 20
): Promise<LearningCard[]> {
  const db = await getDB();
  const now = Date.now();
  const all = certId
    ? await db.getAllFromIndex("cards", "by-certId", certId)
    : await db.getAll("cards");

  return all
    .filter((c) => c.nextReviewAt <= now)
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt)
    .slice(0, limit);
}

// --- Profile ---

export async function getProfile(): Promise<UserProfile | undefined> {
  const db = await getDB();
  const all = await db.getAll("profile");
  return all[0];
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB();
  await db.put("profile", profile);
}
