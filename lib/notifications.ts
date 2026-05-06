export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export async function scheduleReviewNotification(dueCount: number, delayMs: number): Promise<void> {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== "granted") return;

  const reg = await navigator.serviceWorker.ready;
  reg.active?.postMessage({
    type: "SCHEDULE_REVIEW_NOTIFICATION",
    dueCount,
    delayMs,
  });
}

// 복습 카드 수에 따라 알림 지연 시간 계산 (최소 5분, 최대 8시간)
export function calcNotificationDelay(dueCount: number): number {
  if (dueCount >= 5) return 5 * 60 * 1000;        // 5분 후
  if (dueCount >= 1) return 30 * 60 * 1000;       // 30분 후
  return 8 * 60 * 60 * 1000;                      // 8시간 후 (잊을 만 할 때)
}
