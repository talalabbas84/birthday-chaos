"use client";

import { useEffect, useRef, useState } from "react";
import { AchievementToast } from "@/components/AchievementToast";
import { AltLeaderboard } from "@/components/AltLeaderboard";
import { AwardRevealSequence } from "@/components/AwardRevealSequence";
import { DisplayLeaderboard } from "@/components/DisplayLeaderboard";
import { MilestoneBanner } from "@/components/MilestoneBanner";
import { PartyStats } from "@/components/PartyStats";
import { QrJoinCard } from "@/components/QrJoinCard";
import { RecentActivity } from "@/components/RecentActivity";
import type { AwardRevealPayload, DisplayStatePayload } from "@/lib/types";
import { useVisibleInterval } from "@/lib/use-visible-interval";

type ActiveAwardReveal = Extract<AwardRevealPayload, { active: true }>;
type ActivityItem = DisplayStatePayload["recentActivity"][number];

const SCREEN_ROTATE_MS = 7000;
const SCREENS = ["leaderboard", "activity", "stats", "alt"] as const;
const DISPLAY_POLL_MS = 3000;
const TOAST_DURATION_MS = 2800;

export function DisplayScreen({
  slug,
  qrDataUrl,
  joinUrl,
}: {
  slug: string;
  qrDataUrl: string;
  joinUrl: string;
}) {
  const [state, setState] = useState<DisplayStatePayload | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [screenIndex, setScreenIndex] = useState(0);
  const [altIndex, setAltIndex] = useState(0);
  const [milestone, setMilestone] = useState<DisplayStatePayload["recentMilestones"][number] | null>(null);
  const [awardData, setAwardData] = useState<ActiveAwardReveal | null>(null);
  const [toastQueue, setToastQueue] = useState<ActivityItem[]>([]);
  const [currentToast, setCurrentToast] = useState<ActivityItem | null>(null);
  const shownMilestones = useRef<Set<string>>(new Set());
  const revealRunning = useRef(false);
  const seenActivityIds = useRef<Set<string> | null>(null);

  useVisibleInterval(() => {
    fetch(`/api/party/${slug}/display-state`)
      .then((r) => {
        if (!r.ok) throw new Error("bad response");
        return r.json();
      })
      .then((data: DisplayStatePayload) => {
        setState(data);
        setReconnecting(false);
      })
      .catch(() => setReconnecting(true));
  }, DISPLAY_POLL_MS);

  useEffect(() => {
    if (!state) return;
    for (const m of state.recentMilestones) {
      const key = `${m.guestId}:${m.threshold}`;
      if (!shownMilestones.current.has(key)) {
        shownMilestones.current.add(key);
        setMilestone(m);
        const timeout = setTimeout(() => setMilestone(null), 5000);
        return () => clearTimeout(timeout);
      }
    }
  }, [state]);

  // Pop a toast for any completion that shows up since the last poll. On the
  // very first load, just record what's already there instead of popping a
  // toast for every item of pre-existing history.
  useEffect(() => {
    if (!state) return;
    if (seenActivityIds.current === null) {
      seenActivityIds.current = new Set(state.recentActivity.map((a) => a.id));
      return;
    }
    const fresh = state.recentActivity.filter((a) => !seenActivityIds.current!.has(a.id));
    if (fresh.length === 0) return;
    fresh.forEach((a) => seenActivityIds.current!.add(a.id));
    // recentActivity is newest-first; queue oldest-of-the-batch first so
    // toasts appear in the order they actually happened.
    setToastQueue((q) => [...q, ...[...fresh].reverse()]);
  }, [state]);

  useEffect(() => {
    if (currentToast || toastQueue.length === 0 || awardData) return;
    const [next, ...rest] = toastQueue;
    setCurrentToast(next);
    setToastQueue(rest);
    const timeout = setTimeout(() => setCurrentToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [currentToast, toastQueue, awardData]);

  useEffect(() => {
    if (!state) return;
    if (state.party.awardRevealActive && !revealRunning.current) {
      revealRunning.current = true;
      fetch(`/api/party/${slug}/award-reveal-data`)
        .then((r) => r.json())
        .then((data: AwardRevealPayload) => {
          if (data.active) setAwardData(data);
        })
        .catch(() => {
          revealRunning.current = false;
        });
    }
    if (!state.party.awardRevealActive) {
      revealRunning.current = false;
      setAwardData(null);
    }
  }, [state, slug]);

  useEffect(() => {
    if (awardData || milestone) return;
    const interval = setInterval(() => {
      setScreenIndex((i) => (i + 1) % SCREENS.length);
      setAltIndex((i) => i + 1);
    }, SCREEN_ROTATE_MS);
    return () => clearInterval(interval);
  }, [awardData, milestone]);

  if (!state) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-chaos-bg text-2xl text-white/40">
        Loading the chaos...
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-chaos-bg">
      <div className="absolute right-6 top-6 z-10">
        <QrJoinCard qrDataUrl={qrDataUrl} joinUrl={joinUrl} />
      </div>

      {reconnecting && (
        <div className="absolute left-6 top-6 z-10 rounded-full bg-white/10 px-4 py-2 text-sm text-white/60">
          Reconnecting...
        </div>
      )}

      {currentToast && <AchievementToast activity={currentToast} />}

      <div className="flex-1">
        {awardData ? (
          <AwardRevealSequence data={awardData} onFinished={() => setAwardData(null)} />
        ) : milestone ? (
          <MilestoneBanner milestone={milestone} />
        ) : SCREENS[screenIndex] === "leaderboard" ? (
          <DisplayLeaderboard leaderboard={state.leaderboard} stats={state.stats} />
        ) : SCREENS[screenIndex] === "activity" ? (
          <RecentActivity activity={state.recentActivity} />
        ) : SCREENS[screenIndex] === "stats" ? (
          <PartyStats stats={state.stats} />
        ) : (
          <AltLeaderboard categoryLeaderboards={state.categoryLeaderboards} cycleIndex={altIndex} />
        )}
      </div>
    </div>
  );
}
