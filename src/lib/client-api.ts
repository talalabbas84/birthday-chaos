import type {
  AdminPartySummary,
  ApiErrorPayload,
  ChallengeItem,
  CompleteChallengeResponse,
  GuestSummary,
  HostStateResponse,
  LeaderboardResponse,
  LevelInfo,
  PendingVerification,
  VoteQuestionItem,
} from "@/lib/types";
import type { DanceLevel } from "@/lib/dance-level";

export class ClientApiError extends Error {
  title: string;
  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.title = payload.title;
  }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ClientApiError(data ?? { title: "Something glitched", message: "Try again." });
  }
  return data as T;
}

export function newRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const api = {
  join: (slug: string, name: string, danceLevel: DanceLevel) =>
    request<{ guest: { id: string; name: string; danceLevel: DanceLevel; points: number }; level: LevelInfo }>(
      `/api/party/${slug}/join`,
      { method: "POST", body: JSON.stringify({ name, danceLevel }) },
    ),

  me: (slug: string) =>
    request<{
      guest: { id: string; name: string; danceLevel: DanceLevel; points: number } | null;
      level?: LevelInfo;
      party: { status: string; votingOpen?: boolean };
    }>(`/api/party/${slug}/me`),

  switchGuest: (slug: string) => request<{ ok: true }>(`/api/party/${slug}/switch`, { method: "POST" }),

  partyState: (slug: string) =>
    request<{ status: string; votingOpen: boolean; awardRevealActive: boolean }>(`/api/party/${slug}/state`),

  challenges: (slug: string) => request<{ challenges: ChallengeItem[] }>(`/api/party/${slug}/challenges`),

  completeChallenge: (
    slug: string,
    challengeId: string,
    requestId: string,
    people: Array<{ guestId?: string; externalName?: string }>,
  ) =>
    request<CompleteChallengeResponse>(`/api/party/${slug}/challenges/${challengeId}/complete`, {
      method: "POST",
      body: JSON.stringify({ requestId, people }),
    }),

  searchGuests: (slug: string, q: string) =>
    request<{ results: GuestSummary[] }>(`/api/party/${slug}/guests/search?q=${encodeURIComponent(q)}`),

  leaderboard: (slug: string) => request<LeaderboardResponse>(`/api/party/${slug}/leaderboard`),

  verifications: (slug: string) => request<{ pending: PendingVerification[] }>(`/api/party/${slug}/verifications`),

  respondVerification: (slug: string, id: string, action: "confirm" | "dispute" | "skip") =>
    request<{ ok: true }>(`/api/party/${slug}/verifications/${id}/respond`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  voteQuestions: (slug: string) =>
    request<{ questions: VoteQuestionItem[]; votingOpen: boolean }>(`/api/party/${slug}/vote-questions`),

  castVote: (slug: string, questionId: string, selectedGuestId: string) =>
    request<{ ok: true }>(`/api/party/${slug}/vote`, {
      method: "POST",
      body: JSON.stringify({ questionId, selectedGuestId }),
    }),
};

export const hostApi = {
  login: (slug: string, passcode: string) =>
    request<{ ok: true }>(`/api/host/${slug}/login`, { method: "POST", body: JSON.stringify({ passcode }) }),

  state: (slug: string) => request<HostStateResponse>(`/api/host/${slug}/state`),

  setPartyStatus: (slug: string, status: string) =>
    request<{ ok: true }>(`/api/host/${slug}/party`, { method: "PATCH", body: JSON.stringify({ status }) }),

  setVotingOpen: (slug: string, open: boolean) =>
    request<{ ok: true }>(`/api/host/${slug}/voting`, { method: "PATCH", body: JSON.stringify({ open }) }),

  setAwardReveal: (slug: string, active: boolean) =>
    request<{ ok: true }>(`/api/host/${slug}/award-reveal`, { method: "PATCH", body: JSON.stringify({ active }) }),

  updateGuest: (slug: string, guestId: string, patch: { active?: boolean; pointsDelta?: number }) =>
    request<{ ok: true }>(`/api/host/${slug}/guests/${guestId}`, { method: "PATCH", body: JSON.stringify(patch) }),

  resetGuestSession: (slug: string, guestId: string) =>
    request<{ ok: true }>(`/api/host/${slug}/guests/${guestId}/reset-session`, { method: "POST" }),
};

export const adminApi = {
  parties: () => request<{ parties: AdminPartySummary[] }>(`/api/admin/parties`),

  resetTestData: (partyId: string) =>
    request<{ ok: true }>(`/api/admin/parties/${partyId}/reset`, { method: "POST" }),

  reseed: (partyId: string) =>
    request<{ ok: true; slug: string }>(`/api/admin/parties/${partyId}/reseed`, { method: "POST" }),
};
