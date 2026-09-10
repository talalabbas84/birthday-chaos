import type { DisplayStatePayload } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export function DisplayLeaderboard({
  leaderboard,
  stats,
}: {
  leaderboard: DisplayStatePayload["leaderboard"];
  stats: DisplayStatePayload["stats"];
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-16 py-12">
      <h1 className="text-6xl font-black tracking-tight text-white lg:text-7xl">BIRTHDAY CHAOS 🔥</h1>

      <div className="mt-12 w-full max-w-4xl space-y-4">
        {leaderboard.slice(0, 5).map((row, index) => (
          <div
            key={row.id}
            className="flex items-center gap-6 rounded-3xl border border-white/10 bg-white/5 px-8 py-5"
          >
            <div className="w-16 shrink-0 text-center text-4xl font-black">
              {MEDALS[index] ?? <span className="text-white/40">{index + 1}</span>}
            </div>
            <div className="min-w-0 flex-1 truncate text-4xl font-bold text-white">{row.name}</div>
            <div className="shrink-0 text-4xl font-black text-chaos-green">{row.points}</div>
          </div>
        ))}

        {leaderboard.length === 0 && (
          <div className="text-center text-2xl text-white/40">Nobody&apos;s scored yet — go start something.</div>
        )}
      </div>

      <div className="mt-12 text-2xl font-semibold text-white/50">
        {stats.players} players · {stats.totalChallenges} challenges · {stats.danceChallenges} dances
      </div>
    </div>
  );
}
