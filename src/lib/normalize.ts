/**
 * Normalizes an external (unregistered) person's name for duplicate
 * detection: "Chris", "CHRIS", " chris " all collapse to "chris".
 */
export function normalizeExternalName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

export function cleanDisplayName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}
