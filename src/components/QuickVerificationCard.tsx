"use client";

import { useState } from "react";
import { api } from "@/lib/client-api";
import type { PendingVerification } from "@/lib/types";

export function QuickVerificationCard({
  slug,
  verification,
  onHandled,
}: {
  slug: string;
  verification: PendingVerification;
  onHandled: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function respond(action: "confirm" | "dispute" | "skip") {
    if (busy) return;
    setBusy(true);
    try {
      await api.respondVerification(slug, verification.id, action);
    } catch {
      // Non-critical — this card just disappears either way.
    } finally {
      onHandled(verification.id);
    }
  }

  return (
    <div className="glow-card rounded-2xl border border-white/10 bg-chaos-card p-4">
      <div className="text-sm font-semibold text-white/50">Quick check 👀</div>
      <p className="mt-1 text-white">
        <span className="font-bold">{verification.claimantName}</span> said you two did &ldquo;
        {verification.challengeTitle}&rdquo; earlier.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => respond("confirm")}
          className="flex-1 rounded-xl bg-chaos-green/20 py-2 font-semibold text-chaos-green disabled:opacity-40"
        >
          Yep 😂
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => respond("dispute")}
          className="flex-1 rounded-xl bg-white/10 py-2 font-semibold text-white/70 disabled:opacity-40"
        >
          Not quite
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => respond("skip")}
          className="rounded-xl px-3 py-2 text-sm text-white/40 disabled:opacity-40"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
