"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/types";
import { getProfile, saveProfile } from "@/lib/client-db";
import { generateId } from "@/lib/utils";

function createDefaultProfile(certId = "COLORIST"): UserProfile {
  return {
    id: generateId(),
    selectedCertId: certId,
    level: 1,
    xp: 0,
    totalStudySeconds: 0,
    streak: 0,
    lastStudiedAt: 0,
    createdAt: Date.now(),
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p ?? null);
      setLoading(false);
    });
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      const base = profile ?? createDefaultProfile();
      const updated = { ...base, ...updates };
      setProfile(updated);
      await saveProfile(updated);
    },
    [profile]
  );

  const initProfile = useCallback(async (certId: string) => {
    const newProfile = createDefaultProfile(certId);
    setProfile(newProfile);
    await saveProfile(newProfile);
    return newProfile;
  }, []);

  const addXP = useCallback(
    async (amount: number) => {
      if (!profile) return;
      await updateProfile({ xp: profile.xp + amount });
    },
    [profile, updateProfile]
  );

  return { profile, loading, updateProfile, initProfile, addXP };
}
