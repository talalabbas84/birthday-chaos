import { ApiError } from "@/lib/api";
import { isHostAuthenticated } from "@/lib/host-auth";
import { getCurrentGuest, getPartyBySlug } from "@/lib/party";
import type { Guest, Party } from "@/db/schema";

export async function requireParty(slug: string): Promise<Party> {
  const party = await getPartyBySlug(slug);
  if (!party) {
    throw new ApiError(404, "Party not found", "This party doesn't exist.");
  }
  return party;
}

export async function requireGuest(slug: string): Promise<{ party: Party; guest: Guest }> {
  const party = await requireParty(slug);
  const guest = await getCurrentGuest(slug, party.id);
  if (!guest) {
    throw new ApiError(401, "Join first", "You need to join the party first.");
  }
  return { party, guest };
}

export async function requireHost(slug: string): Promise<Party> {
  const party = await requireParty(slug);
  if (!(await isHostAuthenticated(slug))) {
    throw new ApiError(401, "Host login required", "Enter the host passcode first.");
  }
  return party;
}
