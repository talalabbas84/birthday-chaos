export type Level = {
  threshold: number;
  label: string;
  emoji: string;
};

// Ordered ascending. Points map to the highest threshold reached.
export const LEVELS: Level[] = [
  { threshold: 0, label: "Just Arrived", emoji: "🧍" },
  { threshold: 100, label: "Getting Involved", emoji: "👀" },
  { threshold: 250, label: "Social Butterfly", emoji: "🦋" },
  { threshold: 500, label: "Party Person", emoji: "💃" },
  { threshold: 750, label: "Salsa Menace", emoji: "🔥" },
  { threshold: 1000, label: "Public Nuisance", emoji: "🚨" },
  { threshold: 1500, label: "Absolute Menace", emoji: "💀" },
  { threshold: 2000, label: "Please Go Home", emoji: "👑" },
];

export function getLevel(points: number): Level {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (points >= level.threshold) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

/**
 * Returns the highest level threshold crossed by going from oldPoints to
 * newPoints, or null if no threshold was crossed. Used to trigger the
 * "LEVEL UP" celebration and public-display milestone banners.
 */
export function getCrossedLevel(oldPoints: number, newPoints: number): Level | null {
  if (newPoints <= oldPoints) return null;
  let crossed: Level | null = null;
  for (const level of LEVELS) {
    if (level.threshold > oldPoints && level.threshold <= newPoints) {
      crossed = level;
    }
  }
  return crossed;
}
