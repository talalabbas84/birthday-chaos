import type { DisplayStatePayload } from "@/lib/types";

export function AchievementToast({ activity }: { activity: DisplayStatePayload["recentActivity"][number] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-8 z-40 flex justify-center px-6">
      <div
        key={activity.id}
        className="animate-pop-in rounded-3xl border border-white/10 bg-chaos-card/95 px-8 py-5 text-center shadow-2xl shadow-chaos-purple/30 backdrop-blur lg:px-12 lg:py-7"
      >
        <div className="text-2xl font-black text-white lg:text-4xl">
          {activity.categoryEmoji} {activity.guestName.toUpperCase()}{" "}
          <span className="text-chaos-green">+{activity.points}</span>
        </div>
        <div className="mt-1 text-base text-white/60 lg:text-xl">{activity.challengeTitle}</div>
      </div>
    </div>
  );
}
