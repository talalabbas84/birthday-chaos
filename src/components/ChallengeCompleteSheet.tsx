"use client";

import { useRef, useState } from "react";
import { PersonSelector, type SelectedPerson } from "@/components/PersonSelector";
import { api, ClientApiError, newRequestId } from "@/lib/client-api";
import { CATEGORY_META, type ChallengeItem, type CompleteChallengeResponse } from "@/lib/types";

export function ChallengeCompleteSheet({
  slug,
  challenge,
  onClose,
  onCompleted,
}: {
  slug: string;
  challenge: ChallengeItem;
  onClose: () => void;
  onCompleted: (result: CompleteChallengeResponse) => void;
}) {
  // Stable across retries within this sheet's lifetime so a flaky network
  // retry never double-awards points.
  const requestId = useRef(newRequestId()).current;
  const [people, setPeople] = useState<SelectedPerson[]>([]);
  const [status, setStatus] = useState<"form" | "submitting" | "success" | "error">("form");
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [result, setResult] = useState<CompleteChallengeResponse | null>(null);

  const canSubmit = !challenge.requiresPerson || people.length > 0;
  const meta = CATEGORY_META[challenge.category];

  async function submit() {
    setStatus("submitting");
    try {
      const payload = people.map((p) =>
        "guestId" in p ? { guestId: p.guestId } : { externalName: p.externalName },
      );
      const res = await api.completeChallenge(slug, challenge.id, requestId, payload);
      setResult(res);
      setStatus("success");
      onCompleted(res);
    } catch (e) {
      const err =
        e instanceof ClientApiError
          ? e
          : new ClientApiError({ title: "Something glitched", message: "Try that again." });
      setError({ title: err.title, message: err.message });
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg animate-pop-in rounded-t-3xl border-t border-white/10 bg-chaos-card p-6 safe-bottom sm:rounded-3xl sm:border"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "success" && result ? (
          <SuccessView result={result} onClose={onClose} />
        ) : status === "error" && error ? (
          <ErrorView
            title={error.title}
            message={error.message}
            onClose={onClose}
            onRetry={() => setStatus("form")}
          />
        ) : (
          <>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">
              {meta.emoji} {meta.label}
            </div>
            <h2 className="text-2xl font-black text-white">{challenge.title}</h2>
            <p className="mt-1 text-white/60">{challenge.description}</p>
            <div className="mt-3 inline-block rounded-full bg-chaos-green/20 px-3 py-1 text-sm font-black text-chaos-green">
              +{challenge.points} points
            </div>

            {challenge.requiresPerson && (
              <div className="mt-5">
                <div className="mb-2 text-sm font-semibold text-white/80">Who was it with?</div>
                <PersonSelector slug={slug} selected={people} onChange={setPeople} multiple maxSelections={2} />
              </div>
            )}

            <button
              type="button"
              disabled={!canSubmit || status === "submitting"}
              onClick={submit}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-chaos-pink to-chaos-purple py-4 text-lg font-black text-white shadow-lg shadow-chaos-purple/30 transition active:scale-[0.98] disabled:opacity-40"
            >
              {status === "submitting" ? "Locking it in..." : `COMPLETE +${challenge.points}`}
            </button>
            <button type="button" onClick={onClose} className="mt-3 w-full py-2 text-sm text-white/40">
              Never mind
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SuccessView({
  result,
  onClose,
}: {
  result: CompleteChallengeResponse;
  onClose: () => void;
}) {
  return (
    <div className="py-4 text-center">
      <div className="animate-pop-in text-5xl font-black text-chaos-green">+{result.pointsAwarded} 🎉</div>
      <div className="mt-2 text-lg text-white/80">{result.totalPoints} total points</div>
      <p className="mt-4 text-white/60">Nice. Go bother someone else now 😂</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full rounded-2xl bg-white/10 py-3 font-semibold text-white"
      >
        Back to chaos
      </button>
    </div>
  );
}

function ErrorView({
  title,
  message,
  onClose,
  onRetry,
}: {
  title: string;
  message: string;
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="py-4 text-center">
      <div className="text-3xl font-black text-white">{title}</div>
      <p className="mt-3 text-white/60">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 w-full rounded-2xl bg-white/10 py-3 font-semibold text-white"
      >
        Try again
      </button>
      <button type="button" onClick={onClose} className="mt-2 w-full py-2 text-sm text-white/40">
        Close
      </button>
    </div>
  );
}
