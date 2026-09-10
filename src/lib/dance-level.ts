export const DANCE_LEVELS = ["SALSA_DANCER", "DANCES_A_LITTLE", "DOES_NOT_REALLY_DANCE"] as const;
export type DanceLevel = (typeof DANCE_LEVELS)[number];

export function isDanceLevel(value: unknown): value is DanceLevel {
  return typeof value === "string" && (DANCE_LEVELS as readonly string[]).includes(value);
}
