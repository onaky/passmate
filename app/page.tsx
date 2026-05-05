"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getProfile } from "@/lib/db";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    getProfile()
      .then((profile) => {
        if (profile?.selectedCertId) {
          router.replace("/scan");
        } else {
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        router.replace("/onboarding");
      });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={40} className="text-indigo-400 animate-spin" />
    </div>
  );
}
