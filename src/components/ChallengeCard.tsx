"use client";

import { CATEGORY_META, type ChallengeItem } from "@/lib/types";

export function ChallengeCard({
  challenge,
  onOpen,
}: {
  challenge: ChallengeItem;
  onOpen: (challenge: ChallengeItem) => void;
}) {
  const meta = CATEGORY_META[challenge.category];
  const showProgress = challenge.maxCompletions > 1;

  return (
    <button
      type="button"
      disabled={challenge.isMaxed}
      onClick={() => onOpen(challenge)}
      className={`glow-card w-full rounded-3xl border border-white/10 bg-chaos-card p-4 text-left transition active:scale-[0.98] ${
        challenge.isMaxed ? "opacity-50" : "hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/40">
            <span>{meta.emoji}</span>
            <span>{meta.label}</span>
          </div>
          <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
          <p className="mt-1 text-sm text-white/60">{challenge.description}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-chaos-green/20 px-2.5 py-1 text-sm font-black text-chaos-green">
            +{challenge.points}
          </span>
          {challenge.isMaxed ? (
            <span className="text-2xl" aria-label="Completed">
              ✅
            </span>
          ) : showProgress ? (
            <span className="text-xs text-white/40">
              {challenge.completedCount}/{challenge.maxCompletions}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
