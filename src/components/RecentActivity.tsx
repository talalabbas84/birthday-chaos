"use client";

import { useEffect, useState } from "react";
import type { DisplayStatePayload } from "@/lib/types";

const CYCLE_MS = 3500;

export function RecentActivity({ activity }: { activity: DisplayStatePayload["recentActivity"] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [activity.length]);

  useEffect(() => {
    if (activity.length <= 1) return;
    const interval = setInterval(() => setIndex((i) => (i + 1) % activity.length), CYCLE_MS);
    return () => clearInterval(interval);
  }, [activity.length]);

  if (activity.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-16 text-center">
        <div className="text-4xl font-black text-white/40">Waiting for the first move...</div>
      </div>
    );
  }

  const current = activity[index % activity.length];

  return (
    <div key={current.id} className="flex h-full animate-pop-in flex-col items-center justify-center px-16 text-center">
      <div className="text-6xl font-black text-white lg:text-8xl">
        {current.guestName.toUpperCase()} +{current.points} {current.categoryEmoji}
      </div>
      <div className="mt-6 text-3xl font-semibold text-white/60 lg:text-4xl">{current.challengeTitle}</div>
    </div>
  );
}
