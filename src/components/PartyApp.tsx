"use client";

import { useCallback, useEffect, useState } from "react";
import { ChallengeCard } from "@/components/ChallengeCard";
import { ChallengeCompleteSheet } from "@/components/ChallengeCompleteSheet";
import { JoinFlow } from "@/components/JoinFlow";
import { Leaderboard } from "@/components/Leaderboard";
import { LevelBadge } from "@/components/LevelBadge";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { PointsAnimation } from "@/components/PointsAnimation";
import { QuickVerificationCard } from "@/components/QuickVerificationCard";
import { VoteQuestionCard } from "@/components/VoteQuestionCard";
import { api } from "@/lib/client-api";
import { getLevel } from "@/lib/levels";
import {
  CATEGORY_META,
  type ChallengeItem,
  type CompleteChallengeResponse,
  type LeaderboardResponse,
  type LevelInfo,
  type PendingVerification,
  type VoteQuestionItem,
} from "@/lib/types";
import { useVisibleInterval } from "@/lib/use-visible-interval";
import type { DanceLevel } from "@/lib/dance-level";

type GuestState = { id: string; name: string; danceLevel: DanceLevel; points: number };
type Tab = "challenges" | "vote" | "leaderboard";

const CATEGORIES: ChallengeItem["category"][] = ["EASY", "SOCIAL", "DANCE", "TRY_SOMETHING_NEW", "CHAOS"];

export function PartyApp({
  slug,
  initialGuest,
  initialPartyStatus,
  initialVotingOpen,
}: {
  slug: string;
  initialGuest: GuestState | null;
  initialPartyStatus: string;
  initialVotingOpen: boolean;
}) {
  const [guest, setGuest] = useState<GuestState | null>(initialGuest);
  const [tab, setTab] = useState<Tab>("challenges");
  const [category, setCategory] = useState<ChallengeItem["category"]>("EASY");
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [openChallenge, setOpenChallenge] = useState<ChallengeItem | null>(null);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [pointsTrigger, setPointsTrigger] = useState(0);
  const [levelUp, setLevelUp] = useState<LevelInfo | null>(null);
  const [pending, setPending] = useState<PendingVerification[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse>({ top: [], me: null });
  const [voteQuestions, setVoteQuestions] = useState<VoteQuestionItem[]>([]);
  const [votingOpen, setVotingOpen] = useState(initialVotingOpen);
  const [voteSeen, setVoteSeen] = useState(false);
  const [partyStatus, setPartyStatus] = useState(initialPartyStatus);

  const loadChallenges = useCallback(() => {
    if (!guest) return;
    api.challenges(slug).then((res) => setChallenges(res.challenges)).catch(() => {});
  }, [guest, slug]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  useEffect(() => {
    if (!guest) return;
    api.verifications(slug).then((res) => setPending(res.pending)).catch(() => {});
  }, [guest, slug, pointsTrigger]);

  useEffect(() => {
    if (!guest) return;
    api.leaderboard(slug).then(setLeaderboard).catch(() => {});
  }, [guest, slug, pointsTrigger]);

  useVisibleInterval(() => {
    if (!guest) return;
    api
      .partyState(slug)
      .then((s) => {
        setVotingOpen(s.votingOpen);
        setPartyStatus(s.status);
      })
      .catch(() => {});
  }, 15000);

  useVisibleInterval(() => {
    if (!guest || tab !== "leaderboard") return;
    api.leaderboard(slug).then(setLeaderboard).catch(() => {});
  }, 9000);

  useEffect(() => {
    if (tab !== "vote" || !guest) return;
    setVoteSeen(true);
    api
      .voteQuestions(slug)
      .then((res) => {
        setVoteQuestions(res.questions);
        setVotingOpen(res.votingOpen);
      })
      .catch(() => {});
  }, [tab, guest, slug]);

  function handleCompleted(result: CompleteChallengeResponse) {
    setGuest((prev) => (prev ? { ...prev, points: result.totalPoints } : prev));
    setPointsDelta(result.pointsAwarded);
    setPointsTrigger((n) => n + 1);
    loadChallenges();
    if (result.levelUp) setLevelUp(result.levelUp);
  }

  async function handleSwitch() {
    await api.switchGuest(slug);
    window.location.reload();
  }

  if (!guest) {
    return <JoinFlow slug={slug} onEnter={(g) => setGuest(g)} />;
  }

  if (partyStatus === "ENDED") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-black text-white">That&apos;s a wrap 🎉</h1>
        <p className="mt-3 text-white/60">
          Thanks for the chaos, {guest.name}. Final score: {guest.points} points.
        </p>
      </div>
    );
  }

  const level = getLevel(guest.points);
  const filteredChallenges = challenges.filter((c) => c.category === category);

  return (
    <div className="min-h-screen pb-28">
      {levelUp && <LevelUpOverlay level={levelUp} onDone={() => setLevelUp(null)} />}
      {openChallenge && (
        <ChallengeCompleteSheet
          slug={slug}
          challenge={openChallenge}
          onClose={() => setOpenChallenge(null)}
          onCompleted={handleCompleted}
        />
      )}

      <header className="sticky top-0 z-20 border-b border-white/10 bg-chaos-bg/90 px-5 pb-4 pt-6 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-black text-white">{guest.name}</div>
            <div className="relative mt-1 inline-flex items-center gap-2">
              <span className="text-lg font-black text-chaos-green">{guest.points} points</span>
              <PointsAnimation amount={pointsDelta} triggerKey={pointsTrigger} />
            </div>
            {leaderboard.me && <div className="mt-0.5 text-xs text-white/40">Rank #{leaderboard.me.rank}</div>}
          </div>
          <LevelBadge level={level} size="md" />
        </div>
        {partyStatus === "PAUSED" && (
          <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-center text-sm text-white/70">
            The host paused the party for a sec — hang tight 🎉
          </div>
        )}
        <button type="button" onClick={handleSwitch} className="mt-3 text-xs text-white/30 underline">
          Not you? Switch guest
        </button>
      </header>

      <main className="px-5 pt-5">
        {tab === "challenges" && (
          <>
            {pending.length > 0 && (
              <div className="mb-4 space-y-3">
                {pending.map((p) => (
                  <QuickVerificationCard
                    key={p.id}
                    slug={slug}
                    verification={p}
                    onHandled={(id) => setPending((prev) => prev.filter((x) => x.id !== id))}
                  />
                ))}
              </div>
            )}

            <h2 className="mb-3 text-2xl font-black text-white">Pick something fun 👇</h2>
            <div className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1">
              {CATEGORIES.map((key) => {
                const meta = CATEGORY_META[key];
                const isActive = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      isActive ? "border-chaos-pink bg-chaos-pink/20 text-white" : "border-white/10 text-white/50"
                    }`}
                  >
                    {meta.emoji} {meta.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {filteredChallenges.map((c) => (
                <ChallengeCard key={c.id} challenge={c} onOpen={setOpenChallenge} />
              ))}
              {filteredChallenges.length === 0 && (
                <div className="py-10 text-center text-white/40">Nothing here yet — try another category.</div>
              )}
            </div>
          </>
        )}

        {tab === "vote" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Vote 👀</h2>
            {!votingOpen ? (
              <div className="rounded-3xl border border-white/10 bg-chaos-card p-6 text-center text-white/50">
                Voting isn&apos;t open yet — check back later 👀
              </div>
            ) : voteQuestions.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-chaos-card p-6 text-center text-white/50">
                Loading the terrible questions...
              </div>
            ) : (
              <>
                {voteQuestions.map((q) => (
                  <VoteQuestionCard key={q.id} slug={slug} question={q} onVoted={() => {}} />
                ))}
                {voteQuestions.every((q) => q.selectedGuestId) && (
                  <div className="rounded-3xl border border-chaos-green/30 bg-chaos-green/10 p-5 text-center">
                    <div className="text-lg font-black text-white">YOUR TERRIBLE OPINIONS HAVE BEEN RECORDED ✅</div>
                    <div className="mt-1 text-sm text-white/50">Results later 👀</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === "leaderboard" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Leaderboard</h2>
            <Leaderboard top={leaderboard.top} me={leaderboard.me} currentGuestId={guest.id} />
          </div>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-chaos-bg/95 px-6 py-3 backdrop-blur safe-bottom">
        <div className="mx-auto flex max-w-md justify-around">
          <NavButton label="Challenges" active={tab === "challenges"} onClick={() => setTab("challenges")} />
          <NavButton
            label="Vote 👀"
            active={tab === "vote"}
            onClick={() => setTab("vote")}
            badge={votingOpen && !voteSeen}
          />
          <NavButton label="Leaderboard" active={tab === "leaderboard"} onClick={() => setTab("leaderboard")} />
        </div>
      </nav>
    </div>
  );
}

function NavButton({
  label,
  active,
  onClick,
  badge,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-3 py-1.5 text-sm font-bold ${active ? "text-white" : "text-white/40"}`}
    >
      {label}
      {badge && (
        <span className="absolute -right-2 -top-1.5 rounded-full bg-chaos-pink px-1.5 py-0.5 text-[9px] text-white">
          NEW
        </span>
      )}
    </button>
  );
}
