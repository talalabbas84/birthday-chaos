"use client";

import type { LeaderboardEntry } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({
  top,
  me,
  currentGuestId,
}: {
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
  currentGuestId: string | null;
}) {
  const meInTop = me ? top.some((row) => row.id === me.id) : false;

  return (
    <div className="space-y-3">
      {top.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-chaos-card p-6 text-center text-white/50">
          No points on the board yet — go start some chaos.
        </div>
      )}

      {top.map((row, index) => {
        const isMe = row.id === currentGuestId;
        return (
          <div
            key={row.id}
            className={`flex items-center gap-3 rounded-2xl border p-3.5 ${
              isMe
                ? "border-chaos-pink/50 bg-chaos-pink/10"
                : "border-white/10 bg-chaos-card"
            }`}
          >
            <div className="w-9 shrink-0 text-center text-xl font-black">
              {MEDALS[index] ?? <span className="text-white/40">{index + 1}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold text-white">
                {row.name}
                {isMe && <span className="ml-2 text-xs font-normal text-chaos-pink">(you)</span>}
              </div>
              <div className="text-xs text-white/40">
                {row.levelEmoji} {row.level}
              </div>
            </div>
            <div className="shrink-0 text-lg font-black text-chaos-green">{row.points}</div>
          </div>
        );
      })}

      {me && !meInTop && (
        <>
          <div className="py-1 text-center text-xs text-white/30">···</div>
          <div className="flex items-center gap-3 rounded-2xl border border-chaos-pink/50 bg-chaos-pink/10 p-3.5">
            <div className="w-9 shrink-0 text-center text-sm font-black text-white/60">#{me.rank}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold text-white">
                {me.name} <span className="ml-1 text-xs font-normal text-chaos-pink">(you)</span>
              </div>
              <div className="text-xs text-white/40">
                {me.levelEmoji} {me.level}
              </div>
            </div>
            <div className="shrink-0 text-lg font-black text-chaos-green">{me.points}</div>
          </div>
        </>
      )}
    </div>
  );
}
