import type { LevelInfo } from "@/lib/types";

export function LevelBadge({
  level,
  size = "md",
}: {
  level: Pick<LevelInfo, "label" | "emoji">;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full bg-white/10 font-semibold text-white/90 ${sizeClasses}`}
    >
      <span>{level.emoji}</span>
      <span>{level.label}</span>
    </span>
  );
}
