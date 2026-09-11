import type { DisplayStatePayload } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];
const BAR_GRADIENTS = [
  "from-chaos-pink to-chaos-purple",
  "from-chaos-purple to-chaos-cyan",
  "from-chaos-cyan to-chaos-green",
  "from-chaos-green to-chaos-yellow",
  "from-chaos-yellow to-chaos-pink",
];

export function DisplayLeaderboard({
  leaderboard,
  stats,
}: {
  leaderboard: DisplayStatePayload["leaderboard"];
  stats: DisplayStatePayload["stats"];
}) {
  const top = leaderboard.slice(0, 5);
  const maxPoints = top[0]?.points ?? 1;

  return (
    <div className="flex h-full flex-col items-center justify-center px-16 py-12">
      <h1 className="text-6xl font-black tracking-tight text-white lg:text-7xl">BIRTHDAY CHAOS 🔥</h1>

      <div className="mt-12 w-full max-w-4xl space-y-6">
        {top.map((row, index) => {
          // Keep even low scores visible as a small sliver rather than an
          // invisible hairline bar.
          const widthPct = Math.max(6, Math.round((row.points / maxPoints) * 100));
          return (
            <div key={row.id} className="flex items-center gap-5">
              <div className="w-14 shrink-0 text-center text-3xl font-black">
                {MEDALS[index] ?? <span className="text-white/40">{index + 1}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="truncate text-2xl font-bold text-white lg:text-3xl">{row.name}</span>
                  <span className="shrink-0 text-2xl font-black text-chaos-green lg:text-3xl">{row.points}</span>
                </div>
                <div className="h-5 w-full overflow-hidden rounded-full bg-white/10 lg:h-6">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${BAR_GRADIENTS[index % BAR_GRADIENTS.length]} transition-all duration-700 ease-out`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}

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
