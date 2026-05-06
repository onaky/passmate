import { BottomNav } from "@/components/layout/bottom-nav";
import { UserBar } from "@/components/layout/user-bar";
import { NotificationPrompt } from "@/components/features/notifications/notification-prompt";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      <UserBar />
      {children}
      <BottomNav />
      <NotificationPrompt />
    </div>
  );
}
