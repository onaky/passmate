"use client";

interface ProgressBarProps {
  completed: number;
  total: number;
  label?: string;
}

export function ProgressBar({ completed, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.min((completed / total) * 100, 100) : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1.5">
          <span>{label}</span>
          <span>{completed}/{total}</span>
        </div>
      )}
      <div className="h-3 bg-[var(--secondary)] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        >
          {/* 캐릭터 */}
          <div
            className="absolute -top-1 text-lg transition-all duration-500"
            style={{ marginLeft: `max(0px, calc(${pct}% - 20px))` }}
          >
            🚀
          </div>
        </div>
      </div>
    </div>
  );
}
