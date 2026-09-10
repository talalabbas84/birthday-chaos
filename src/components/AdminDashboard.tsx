"use client";

import { useState } from "react";
import { adminApi, ClientApiError } from "@/lib/client-api";
import type { AdminPartySummary } from "@/lib/types";

export function AdminDashboard({ initialParties }: { initialParties: AdminPartySummary[] }) {
  const [parties, setParties] = useState(initialParties);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function refresh() {
    adminApi.parties().then((res) => setParties(res.parties)).catch(() => {});
  }

  async function handleReset(party: AdminPartySummary) {
    const confirmed = window.confirm(
      `Wipe all guests, scores, completions and votes for "${party.name}"?\n\nChallenges and vote questions stay as-is. This can't be undone.`,
    );
    if (!confirmed) return;

    setBusyId(party.id);
    setMessage(null);
    try {
      await adminApi.resetTestData(party.id);
      setMessage(`Cleaned up "${party.name}" — 0 guests, ready for real people.`);
      refresh();
    } catch (e) {
      setMessage(e instanceof ClientApiError ? e.message : "That didn't work.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReseed(party: AdminPartySummary) {
    const confirmed = window.confirm(
      `Fully reset "${party.name}"?\n\nThis deletes EVERYTHING — guests, scores, and the challenge/vote-question catalog — and recreates it from the built-in seed data. This can't be undone.`,
    );
    if (!confirmed) return;

    setBusyId(party.id);
    setMessage(null);
    try {
      const res = await adminApi.reseed(party.id);
      setMessage(`Reseeded "${party.name}" from scratch (/party/${res.slug}).`);
      refresh();
    } catch (e) {
      setMessage(e instanceof ClientApiError ? e.message : "That didn't work.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-2xl font-black text-white">Admin — data cleanup</h1>
      <p className="mt-1 text-sm text-white/50">
        No passcode on this page — it&apos;s for you to reset test data between dry runs, then wipe it clean
        right before the party starts. Don&apos;t share this link.
      </p>

      {message && (
        <div className="mt-4 rounded-2xl border border-chaos-green/30 bg-chaos-green/10 px-4 py-3 text-sm text-white">
          {message}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {parties.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-chaos-card p-6 text-center text-white/40">
            No parties yet — run <code className="text-chaos-cyan">npm run db:seed</code>.
          </div>
        )}

        {parties.map((party) => (
          <div key={party.id} className="rounded-3xl border border-white/10 bg-chaos-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">{party.name}</div>
                <div className="text-xs text-white/40">
                  /party/{party.slug} · {party.status}
                  {party.votingOpen ? " · voting open" : ""}
                </div>
              </div>
              <div className="text-right text-sm text-white/60">
                <div>{party.guestCount} guests</div>
                <div>{party.completionCount} completions</div>
                <div>{party.totalPoints} pts total</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/40">
              <a className="underline" href={`/party/${party.slug}`}>
                Join
              </a>
              <a className="underline" href={`/party/${party.slug}/display`}>
                Display
              </a>
              <a className="underline" href={`/host/${party.slug}`}>
                Host
              </a>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === party.id}
                onClick={() => handleReset(party)}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Reset test data (keep challenges)
              </button>
              <button
                type="button"
                disabled={busyId === party.id}
                onClick={() => handleReseed(party)}
                className="rounded-xl bg-chaos-pink/20 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Full reseed (everything)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
