"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, BookOpen, Gamepad2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/scan", label: "스캔", Icon: Camera },
  { href: "/cards", label: "암기장", Icon: BookOpen },
  { href: "/play", label: "퀴즈", Icon: Gamepad2 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[var(--card)] border-t border-[var(--border)] flex z-50 pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-3 gap-0.5 transition-colors",
              active
                ? "text-indigo-400"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
