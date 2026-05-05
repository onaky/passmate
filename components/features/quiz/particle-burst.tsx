"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  rotation: number;
}

const CORRECT_EMOJIS = ["⭐", "✨", "🎉", "💫", "🌟", "💥"];
const WRONG_EMOJIS = ["💔", "😅", "🔥"];

interface ParticleBurstProps {
  type: "correct" | "wrong";
  active: boolean;
}

export function ParticleBurst({ type, active }: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;

    const emojis = type === "correct" ? CORRECT_EMOJIS : WRONG_EMOJIS;
    const count = type === "correct" ? 8 : 4;

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      y: 20 + Math.random() * 60,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      rotation: Math.random() * 360,
    }));

    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 900);
    return () => clearTimeout(timer);
  }, [active, type]);

  if (!particles.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-2xl particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
