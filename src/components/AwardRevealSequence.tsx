"use client";

import { useEffect, useState } from "react";
import { PartyStats } from "@/components/PartyStats";
import type { AwardRevealPayload } from "@/lib/types";

type ActiveAwardReveal = Extract<AwardRevealPayload, { active: true }>;
type RevealItem = { title: string; description?: string; subtitle: string; winnerName: string | null };

export function AwardRevealSequence({
  data,
  onFinished,
}: {
  data: ActiveAwardReveal;
  onFinished: () => void;
}) {
  const items: RevealItem[] = [
    ...data.voteResults.map((v) => ({
      title: v.title,
      description: v.description,
      subtitle: v.subtitle,
      winnerName: v.winnerName,
    })),
    ...data.finalAwards.map((a) => ({ title: `${a.emoji} ${a.title}`, subtitle: a.subtitle, winnerName: a.winnerName })),
  ];

  const [index, setIndex] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

  function handleCardDone() {
    setIndex((i) => {
      if (i < items.length - 1) return i + 1;
      setShowStats(true);
      return i;
    });
  }

  useEffect(() => {
    if (!showStats) return;
    const timeout = setTimeout(() => {
      setShowStats(false);
      setShowPhoto(true);
    }, 6000);
    return () => clearTimeout(timeout);
  }, [showStats]);

  useEffect(() => {
    if (!showPhoto) return;
    const timeout = setTimeout(onFinished, 7000);
    return () => clearTimeout(timeout);
  }, [showPhoto, onFinished]);

  if (showPhoto) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-16 text-center">
        <div className="text-3xl font-black uppercase tracking-widest text-chaos-yellow">
          🚨 One Final Mission
        </div>
        <div className="mt-4 text-5xl font-black text-white lg:text-7xl">
          GET EVERYONE INTO ONE GROUP PHOTO 📸
        </div>
        <div className="mt-4 text-2xl text-white/50">Yes. Literally everyone.</div>
      </div>
    );
  }

  if (showStats) {
    return <PartyStats stats={data.stats} heading="WHAT THE HELL HAPPENED? 💀" />;
  }

  const current = items[index];
  if (!current) return null;

  return <RevealCard key={index} item={current} onDone={handleCardDone} />;
}

type Phase = "question" | "3" | "2" | "1" | "winner";

function RevealCard({ item, onDone }: { item: RevealItem; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>(item.description ? "question" : "3");

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let t = 0;

    if (item.description) {
      t += 1400;
      timeouts.push(setTimeout(() => setPhase("3"), t));
    }
    t += 700;
    timeouts.push(setTimeout(() => setPhase("2"), t));
    t += 700;
    timeouts.push(setTimeout(() => setPhase("1"), t));
    t += 700;
    timeouts.push(setTimeout(() => setPhase("winner"), t));
    t += 3600;
    timeouts.push(setTimeout(onDone, t));

    return () => timeouts.forEach(clearTimeout);
    // Intentionally runs once per mounted card (key'd by index in the parent).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center px-16 text-center">
      {phase === "question" && (
        <>
          <div className="text-5xl font-black text-white lg:text-6xl">{item.title.toUpperCase()}</div>
          {item.description && <div className="mt-4 text-2xl text-white/50">{item.description}</div>}
        </>
      )}
      {(phase === "3" || phase === "2" || phase === "1") && (
        <div className="animate-pop-in text-9xl font-black text-chaos-cyan">{phase}...</div>
      )}
      {phase === "winner" && (
        <>
          <div className="animate-pop-in text-2xl font-black uppercase tracking-widest text-white/50 lg:text-3xl">
            {item.title}
          </div>
          <div className="mt-4 animate-pop-in text-7xl font-black text-white lg:text-8xl">
            {item.winnerName ? item.winnerName.toUpperCase() : "NOBODY?? 💀"}
          </div>
          <div className="mt-4 text-2xl text-white/60">{item.subtitle}</div>
        </>
      )}
    </div>
  );
}
