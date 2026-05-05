import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, backHref, action }: PageHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-4 pt-12 pb-4">
      {backHref && (
        <Link
          href={backHref}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ChevronLeft size={26} />
        </Link>
      )}
      <div className="flex-1">
        <h1 className="text-xl font-bold text-[var(--foreground)]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
