"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled) router.replace("/onboarding");
    }, 5000);

    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((profile: { selectedCertId?: string } | null) => {
        if (cancelled) return;
        clearTimeout(timeout);
        if (profile?.selectedCertId) {
          router.replace("/scan");
        } else {
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        if (cancelled) return;
        clearTimeout(timeout);
        router.replace("/onboarding");
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={40} className="text-indigo-400 animate-spin" />
    </div>
  );
}
