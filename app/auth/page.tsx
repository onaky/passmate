"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, User, Lock, Loader2, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다.");
        return;
      }

      // 로그인/회원가입 성공 → 온보딩 또는 메인으로
      router.replace(mode === "register" ? "/onboarding" : "/scan");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError(null);
    setUsername("");
    setPassword("");
  }

  return (
    <div className="min-h-screen flex flex-col px-5 py-12 max-w-md mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <GraduationCap size={56} className="text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">PassMate</h1>
        <p className="text-[var(--secondary-foreground)] text-base leading-relaxed">
          사진 한 장으로 이해하고<br />
          게임처럼 암기하는 AI 학습 파트너
        </p>
      </div>

      {/* 탭 */}
      <div className="flex bg-[var(--secondary)] rounded-2xl p-1 mb-8">
        <button
          onClick={() => { setMode("login"); setError(null); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === "login"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted-foreground)]"
          }`}
        >
          로그인
        </button>
        <button
          onClick={() => { setMode("register"); setError(null); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === "register"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted-foreground)]"
          }`}
        >
          회원가입
        </button>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 아이디 */}
        <div className="relative">
          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="아이디 (영문, 숫자, _)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* 비밀번호 */}
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type={showPw ? "text" : "password"}
            placeholder={mode === "register" ? "비밀번호 (6자 이상)" : "비밀번호"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full pl-11 pr-12 py-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* 에러 */}
        {error && (
          <p className="text-rose-400 text-sm px-1">{error}</p>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading || !username.trim() || !password}
          className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 mt-2"
        >
          {loading
            ? <Loader2 size={20} className="animate-spin" />
            : mode === "login"
              ? <><LogIn size={20} /> 로그인</>
              : <><UserPlus size={20} /> 회원가입</>
          }
        </button>
      </form>

      {/* 모드 전환 안내 */}
      <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
        {mode === "login" ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}
        {" "}
        <button onClick={switchMode} className="text-indigo-400 font-semibold underline underline-offset-2">
          {mode === "login" ? "회원가입" : "로그인"}
        </button>
      </p>
    </div>
  );
}
