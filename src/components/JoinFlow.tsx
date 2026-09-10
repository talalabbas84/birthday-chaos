"use client";

import { useState } from "react";
import { api, ClientApiError } from "@/lib/client-api";
import type { LevelInfo } from "@/lib/types";
import type { DanceLevel } from "@/lib/dance-level";

const DANCE_OPTIONS: Array<{ value: DanceLevel; label: string; emoji: string }> = [
  { value: "SALSA_DANCER", label: "Salsa dancer", emoji: "💃" },
  { value: "DANCES_A_LITTLE", label: "I dance a little", emoji: "🕺" },
  { value: "DOES_NOT_REALLY_DANCE", label: "I don't really dance", emoji: "🪩" },
];

export function JoinFlow({
  slug,
  onEnter,
}: {
  slug: string;
  onEnter: (guest: { id: string; name: string; danceLevel: DanceLevel; points: number }, level: LevelInfo) => void;
}) {
  const [name, setName] = useState("");
  const [danceLevel, setDanceLevel] = useState<DanceLevel | null>(null);
  const [step, setStep] = useState<"form" | "welcome">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<{
    guest: { id: string; name: string; danceLevel: DanceLevel; points: number };
    level: LevelInfo;
  } | null>(null);

  const canSubmit = name.trim().length > 0 && danceLevel !== null && !submitting;

  async function submit() {
    if (!danceLevel) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.join(slug, name, danceLevel);
      setJoined(res);
      setStep("welcome");
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Couldn't join right now. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "welcome" && joined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-black text-white">Welcome, {joined.guest.name}.</h1>
        <div className="mt-3 text-2xl font-black text-chaos-green">{joined.guest.points} points</div>
        <div className="mt-1 text-white/60">
          {joined.level.emoji} {joined.level.label}
        </div>
        <p className="mx-auto mt-6 max-w-xs text-white/60">
          Everything is optional. Do as much or as little as you want. We&apos;re just trying to get everyone
          mingling 😂
        </p>
        <button
          type="button"
          onClick={() => onEnter(joined.guest, joined.level)}
          className="mt-8 rounded-2xl bg-gradient-to-r from-chaos-pink to-chaos-purple px-8 py-4 text-lg font-black text-white shadow-lg shadow-chaos-purple/30 active:scale-[0.98]"
        >
          ENTER THE CHAOS
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-3xl font-black leading-tight text-white">
          JOIN THE BIRTHDAY CHAOS 🔥
        </h1>
        <p className="mt-2 text-center text-white/60">Meet people. Dance. Cause harmless chaos.</p>

        <div className="mt-8">
          <label className="mb-2 block text-sm font-semibold text-white/80">What&apos;s your name?</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-lg text-white placeholder-white/30 outline-none focus:border-chaos-pink/60"
          />
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-white/80">How dancey are you?</label>
          <div className="space-y-2">
            {DANCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDanceLevel(option.value)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                  danceLevel === option.value
                    ? "border-chaos-pink bg-chaos-pink/15"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="font-semibold text-white">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="mt-4 text-center text-sm text-chaos-pink">{error}</div>}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-chaos-pink to-chaos-purple py-4 text-lg font-black text-white shadow-lg shadow-chaos-purple/30 transition active:scale-[0.98] disabled:opacity-40"
        >
          {submitting ? "Joining..." : "LET'S GO"}
        </button>
      </div>
    </div>
  );
}
