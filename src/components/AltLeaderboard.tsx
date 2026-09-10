import type { DisplayStatePayload } from "@/lib/types";

const BOARDS: Array<{ key: keyof DisplayStatePayload["categoryLeaderboards"]; title: string; emoji: string }> = [
  { key: "social", title: "Social Butterflies", emoji: "🦋" },
  { key: "dance", title: "Dance Floor Menaces", emoji: "💃" },
  { key: "chaos", title: "Chaos Agents", emoji: "🔥" },
];

export function AltLeaderboard({
  categoryLeaderboards,
  cycleIndex,
}: {
  categoryLeaderboards: DisplayStatePayload["categoryLeaderboards"];
  cycleIndex: number;
}) {
  const board = BOARDS[cycleIndex % BOARDS.length];
  const rows = categoryLeaderboards[board.key];

  return (
    <div className="flex h-full flex-col items-center justify-center px-16">
      <h1 className="text-5xl font-black text-white lg:text-6xl">
        {board.emoji} {board.title}
      </h1>
      <div className="mt-10 w-full max-w-3xl space-y-4">
        {rows.length === 0 && <div className="text-center text-2xl text-white/40">No data yet.</div>}
        {rows.map((row, index) => (
          <div
            key={row.name + index}
            className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-8 py-5"
          >
            <span className="text-3xl font-bold text-white">{row.name}</span>
            <span className="text-3xl font-black text-chaos-cyan">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
