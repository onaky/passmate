import { BottomNav } from "@/components/layout/bottom-nav";
import { NotificationPrompt } from "@/components/features/notifications/notification-prompt";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav />
      <NotificationPrompt />
    </div>
  );
}
