"use client";

import { useEffect, useState } from "react";

const COLORS = ["#ff3ea5", "#8b3dff", "#33e6ff", "#ffd23f", "#3dffa8"];
const PARTICLE_COUNT = 28;

type Particle = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotation: number;
};

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 0.25,
    duration: 1.1 + Math.random() * 0.6,
    color: COLORS[id % COLORS.length],
    rotation: Math.random() * 360,
  }));
}

/** Tasteful, short-lived confetti burst — not a permanent animation loop. */
export function Confetti({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<Particle[] | null>(null);

  useEffect(() => {
    if (trigger === 0) return;
    setParticles(makeParticles());
    const timeout = setTimeout(() => setParticles(null), 1900);
    return () => clearTimeout(timeout);
  }, [trigger]);

  if (!particles) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-10px] h-2.5 w-2.5 rounded-sm"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(540deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
