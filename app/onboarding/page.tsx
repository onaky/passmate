"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Check, ArrowRight, Loader2 } from "lucide-react";
import { CERTIFICATIONS } from "@/lib/certifications";
import { saveProfile } from "@/lib/client-db";
import { generateId } from "@/lib/utils";
import type { UserProfile } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!selectedId) return;
    setLoading(true);

    const profile: UserProfile = {
      id: generateId(),
      selectedCertId: selectedId,
      level: 1,
      xp: 0,
      totalStudySeconds: 0,
      streak: 0,
      lastStudiedAt: 0,
      createdAt: Date.now(),
    };

    await saveProfile(profile);
    router.push("/scan");
  }

  return (
    <div className="min-h-screen flex flex-col px-5 py-12">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <GraduationCap size={56} className="text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">PassMate</h1>
        <p className="text-[var(--secondary-foreground)] text-base leading-relaxed">
          사진 한 장으로 이해하고<br />
          게임처럼 암기하는 AI 학습 파트너
        </p>
      </div>

      <div className="flex-1">
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
          준비 중인 자격증 선택
        </h2>
        <div className="flex flex-col gap-3">
          {CERTIFICATIONS.map((cert) => {
            const selected = selectedId === cert.id;
            return (
              <button
                key={cert.id}
                onClick={() => setSelectedId(cert.id)}
                className={`
                  w-full text-left p-4 rounded-2xl border-2 transition-all
                  ${selected ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--border)] bg-[var(--card)] hover:border-indigo-500/50"}
                `}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{cert.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--foreground)]">{cert.name}</div>
                    <div className="text-sm text-[var(--muted-foreground)] mt-0.5">{cert.description}</div>
                  </div>
                  {selected && <Check size={20} className="text-indigo-400 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleStart}
          disabled={!selectedId || loading}
          className={`
            w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2
            ${selectedId && !loading
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 active:scale-95"
              : "bg-[var(--secondary)] text-[var(--muted-foreground)] cursor-not-allowed"}
          `}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
          {loading ? "시작 중..." : "학습 시작하기"}
        </button>
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-3">
          선택은 나중에 설정에서 변경할 수 있습니다
        </p>
      </div>
    </div>
  );
}
