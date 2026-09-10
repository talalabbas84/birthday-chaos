import type { PartyStatsPayload } from "@/lib/types";

export function PartyStats({ stats, heading = "WHAT IS HAPPENING? 💀" }: { stats: PartyStatsPayload; heading?: string }) {
  const tiles = [
    { label: "Players", value: stats.players },
    { label: "Challenges", value: stats.totalChallenges },
    { label: "Dance Challenges", value: stats.danceChallenges },
    { label: "Social Challenges", value: stats.socialChallenges },
    { label: "Try Something New", value: stats.trySomethingNewChallenges },
    { label: "Chaos Challenges", value: stats.chaosChallenges },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center px-16">
      <h1 className="text-5xl font-black text-white lg:text-6xl">{heading}</h1>
      <div className="mt-12 grid w-full max-w-5xl grid-cols-2 gap-6 lg:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-center">
            <div className="text-5xl font-black text-chaos-cyan lg:text-6xl">{tile.value}</div>
            <div className="mt-2 text-lg font-semibold text-white/50">{tile.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
