"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export function UserBar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data: { username?: string } | null) => {
        if (data?.username) setUsername(data.username);
      })
      .catch(() => null);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/auth");
  }

  if (!username) return null;

  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-0">
      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
        <User size={13} />
        <span className="font-medium">{username}</span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-rose-400 transition-colors py-1 px-2 rounded-lg"
      >
        <LogOut size={13} /> 로그아웃
      </button>
    </div>
  );
}
