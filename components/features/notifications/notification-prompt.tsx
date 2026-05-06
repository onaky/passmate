"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { requestNotificationPermission, isNotificationSupported, scheduleReviewNotification, calcNotificationDelay } from "@/lib/notifications";
import { getDueCards } from "@/lib/db";

export function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (!isNotificationSupported()) return;
    const perm = Notification.permission;
    setPermission(perm);
    // 아직 결정 안 했으면 프롬프트 표시
    if (perm === "default") {
      // 1초 뒤 자연스럽게 표시
      const t = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(t);
    }
    // 이미 허용됐으면 알림 스케줄 유지
    if (perm === "granted") {
      schedulePending();
    }
  }, []);

  async function schedulePending() {
    const due = await getDueCards();
    if (due.length > 0) {
      await scheduleReviewNotification(due.length, calcNotificationDelay(due.length));
    }
  }

  async function handleAllow() {
    const result = await requestNotificationPermission();
    setPermission(result);
    setShow(false);
    if (result === "granted") {
      await schedulePending();
    }
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 bg-[var(--card)] border border-indigo-500/30 rounded-2xl p-4 shadow-xl shadow-black/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <Bell size={20} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[var(--foreground)] text-sm mb-1">
            복습 알림을 받으시겠어요?
          </p>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            잊을 만 할 때 퀴즈 알림을 보내드려요.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAllow}
              className="flex-1 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <Bell size={14} /> 알림 허용
            </button>
            <button
              onClick={() => setShow(false)}
              className="py-2 px-3 rounded-xl bg-[var(--secondary)] text-[var(--muted-foreground)] text-sm active:scale-95 transition-transform"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
