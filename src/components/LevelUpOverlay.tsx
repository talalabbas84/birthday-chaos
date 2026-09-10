"use client";

import { useEffect } from "react";
import { Confetti } from "@/components/Confetti";
import type { LevelInfo } from "@/lib/types";

export function LevelUpOverlay({ level, onDone }: { level: LevelInfo; onDone: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onDone, 2800);
    return () => clearTimeout(timeout);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 text-center"
      onClick={onDone}
    >
      <Confetti trigger={level.threshold || 1} />
      <div className="animate-pop-in text-2xl font-bold uppercase tracking-widest text-chaos-yellow">
        Level Up 🎉
      </div>
      <div className="mt-3 text-white/70">You are now officially:</div>
      <div className="mt-2 animate-pop-in text-4xl font-black text-white">
        {level.emoji} {level.label.toUpperCase()}
      </div>
    </div>
  );
}
