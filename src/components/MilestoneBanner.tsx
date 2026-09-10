import type { DisplayStatePayload } from "@/lib/types";

export function MilestoneBanner({ milestone }: { milestone: DisplayStatePayload["recentMilestones"][number] }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-16 text-center">
      <div className="animate-pop-in text-4xl font-black uppercase tracking-widest text-chaos-yellow lg:text-5xl">
        🚨 {milestone.label} Achieved
      </div>
      <div className="mt-6 animate-pop-in text-7xl font-black text-white lg:text-8xl">
        {milestone.name.toUpperCase()}
      </div>
      <div className="mt-6 text-3xl font-semibold text-white/60">{milestone.threshold.toLocaleString()} POINTS</div>
    </div>
  );
}
