"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getProfile } from "@/lib/client-db";

export default function RootPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    getProfile()
      .then((profile) => {
        if (cancelled) return;
        if (profile?.selectedCertId) {
          router.replace("/scan");
        } else {
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/onboarding");
      });

    return () => { cancelled = true; };
  }, [mounted, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={40} className="text-indigo-400 animate-spin" />
    </div>
  );
}
