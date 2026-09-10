"use client";

import { useEffect, useState } from "react";
import { hostApi, ClientApiError } from "@/lib/client-api";
import type { HostStateResponse } from "@/lib/types";

export function HostApp({ slug, initialAuthed }: { slug: string; initialAuthed: boolean }) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<HostStateResponse | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  function refresh() {
    hostApi
      .state(slug)
      .then(setState)
      .catch(() => {});
  }

  useEffect(() => {
    if (authed) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  async function login() {
    setError(null);
    try {
      await hostApi.login(slug, passcode);
      setAuthed(true);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Couldn't log in.");
    }
  }

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    try {
      await action();
      refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "That didn't work.");
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-chaos-card p-6">
          <h1 className="text-2xl font-black text-white">Host controls</h1>
          <p className="mt-1 text-sm text-white/50">Enter the passcode to manage the party.</p>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Passcode"
            className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-chaos-pink/60"
          />
          {error && <div className="mt-2 text-sm text-chaos-pink">{error}</div>}
          <button
            type="button"
            onClick={login}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-chaos-pink to-chaos-purple py-3 font-bold text-white"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    return <div className="flex min-h-screen items-center justify-center text-white/40">Loading...</div>;
  }

  const filteredGuests = state.guests.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-2xl font-black text-white">{state.party.name} — Host</h1>
      {error && <div className="mt-2 text-sm text-chaos-pink">{error}</div>}

      <Section title="Party">
        <div className="mb-3 text-sm text-white/50">
          Status: <span className="font-bold text-white">{state.party.status}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.party.status !== "LIVE" && (
            <ActionButton disabled={busy} onClick={() => run(() => hostApi.setPartyStatus(slug, "LIVE"))}>
              Resume party
            </ActionButton>
          )}
          {state.party.status === "LIVE" && (
            <ActionButton disabled={busy} onClick={() => run(() => hostApi.setPartyStatus(slug, "PAUSED"))}>
              Pause party
            </ActionButton>
          )}
          {state.party.status !== "ENDED" && (
            <ActionButton
              disabled={busy}
              danger
              onClick={() => run(() => hostApi.setPartyStatus(slug, "ENDED"))}
            >
              End party
            </ActionButton>
          )}
        </div>
      </Section>

      <Section title="Voting">
        <div className="mb-3 text-sm text-white/50">
          Voting is currently{" "}
          <span className="font-bold text-white">{state.party.votingOpen ? "OPEN" : "CLOSED"}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton disabled={busy || state.party.votingOpen} onClick={() => run(() => hostApi.setVotingOpen(slug, true))}>
            Open voting
          </ActionButton>
          <ActionButton disabled={busy || !state.party.votingOpen} onClick={() => run(() => hostApi.setVotingOpen(slug, false))}>
            Close voting
          </ActionButton>
        </div>
      </Section>

      <Section title="Award reveal">
        <div className="mb-3 text-sm text-white/50">
          Reveal is{" "}
          <span className="font-bold text-white">{state.party.awardRevealActive ? "RUNNING" : "off"}</span> — the
          laptop display handles the rest automatically.
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            disabled={busy || state.party.awardRevealActive}
            onClick={() => run(() => hostApi.setAwardReveal(slug, true))}
          >
            START AWARD REVEAL
          </ActionButton>
          {state.party.awardRevealActive && (
            <ActionButton disabled={busy} onClick={() => run(() => hostApi.setAwardReveal(slug, false))}>
              Stop reveal
            </ActionButton>
          )}
        </div>
      </Section>

      <Section title={`Emergency (${state.guests.length} guests)`}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guests..."
          className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
        />
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {filteredGuests.map((guest) => (
            <div key={guest.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div className={guest.active ? "font-semibold text-white" : "font-semibold text-white/30 line-through"}>
                  {guest.name}
                </div>
                <div className="text-sm font-bold text-chaos-green">{guest.points} pts</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <ActionButton
                  small
                  disabled={busy}
                  onClick={() => run(() => hostApi.updateGuest(slug, guest.id, { pointsDelta: -25 }))}
                >
                  -25
                </ActionButton>
                <ActionButton
                  small
                  disabled={busy}
                  onClick={() => run(() => hostApi.updateGuest(slug, guest.id, { pointsDelta: 25 }))}
                >
                  +25
                </ActionButton>
                <ActionButton
                  small
                  disabled={busy}
                  onClick={() => run(() => hostApi.updateGuest(slug, guest.id, { active: !guest.active }))}
                >
                  {guest.active ? "Deactivate" : "Reactivate"}
                </ActionButton>
                <ActionButton small disabled={busy} onClick={() => run(() => hostApi.resetGuestSession(slug, guest.id))}>
                  Reset session
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-chaos-card p-5">
      <h2 className="mb-3 text-lg font-bold text-white">{title}</h2>
      {children}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  danger,
  small,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-semibold text-white transition disabled:opacity-30 ${
        small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${danger ? "bg-chaos-pink/30" : "bg-white/10"}`}
    >
      {children}
    </button>
  );
}
