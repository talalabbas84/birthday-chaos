// Shared shapes for API responses, used by both server route handlers and
// client components. Kept free of any server-only imports (db, node:crypto)
// so client components can safely `import type` from here.

export type LevelInfo = { threshold: number; label: string; emoji: string };

export type GuestSummary = { id: string; name: string };

export type ChallengeItem = {
  id: string;
  title: string;
  description: string;
  category: "EASY" | "SOCIAL" | "DANCE" | "TRY_SOMETHING_NEW" | "CHAOS";
  points: number;
  maxCompletions: number;
  requiresPerson: boolean;
  uniquePersonRequired: boolean;
  completedCount: number;
  isMaxed: boolean;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  points: number;
  level: string;
  levelEmoji: string;
  rank: number;
};

export type LeaderboardResponse = {
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
};

export type PendingVerification = {
  id: string;
  claimantName: string;
  challengeTitle: string;
  createdAt: string;
};

export type VoteQuestionItem = {
  id: string;
  title: string;
  description: string;
  selectedGuestId: string | null;
  selectedGuestName: string | null;
};

export type CompleteChallengeResponse = {
  pointsAwarded: number;
  totalPoints: number;
  levelUp: LevelInfo | null;
  challengeTitle: string;
  alreadySubmitted: boolean;
};

export type PartyStatsPayload = {
  players: number;
  totalChallenges: number;
  danceChallenges: number;
  socialChallenges: number;
  trySomethingNewChallenges: number;
  chaosChallenges: number;
  easyChallenges: number;
  totalPoints: number;
};

export type DisplayStatePayload = {
  party: { status: string; votingOpen: boolean; awardRevealActive: boolean };
  leaderboard: Array<{ id: string; name: string; points: number; level: string; levelEmoji: string }>;
  stats: PartyStatsPayload;
  recentActivity: Array<{
    id: string;
    guestName: string;
    challengeTitle: string;
    points: number;
    categoryEmoji: string;
    createdAt: string;
  }>;
  recentMilestones: Array<{
    guestId: string;
    name: string;
    threshold: number;
    label: string;
    emoji: string;
    at: string;
  }>;
  categoryLeaderboards: {
    social: Array<{ name: string; count: number }>;
    dance: Array<{ name: string; count: number }>;
    chaos: Array<{ name: string; count: number }>;
  };
};

export type AwardRevealPayload =
  | { active: false }
  | {
      active: true;
      voteResults: Array<{ id: string; title: string; description: string; winnerName: string | null; subtitle: string }>;
      finalAwards: Array<{ key: string; title: string; emoji: string; winnerName: string | null; subtitle: string }>;
      stats: PartyStatsPayload;
    };

export type ApiErrorPayload = { title: string; message: string };

export type AdminPartySummary = {
  id: string;
  slug: string;
  name: string;
  status: string;
  votingOpen: boolean;
  awardRevealActive: boolean;
  guestCount: number;
  completionCount: number;
  totalPoints: number;
};

export type HostGuestRow = {
  id: string;
  name: string;
  points: number;
  active: boolean;
  danceLevel: string;
};

export type HostStateResponse = {
  party: { name: string; status: string; votingOpen: boolean; awardRevealActive: boolean };
  guests: HostGuestRow[];
};

export const CATEGORY_META: Record<
  ChallengeItem["category"],
  { label: string; emoji: string }
> = {
  EASY: { label: "Easy", emoji: "🟢" },
  SOCIAL: { label: "Social", emoji: "🤝" },
  DANCE: { label: "Dance", emoji: "💃" },
  TRY_SOMETHING_NEW: { label: "Try Something New", emoji: "🪩" },
  CHAOS: { label: "Chaos", emoji: "🔥" },
};

export const CATEGORY_INTRO: Record<
  ChallengeItem["category"],
  { heading: string; subheading: string }
> = {
  EASY: { heading: "Something easy 🟢", subheading: "Low pressure, high reward." },
  SOCIAL: { heading: "Meet people 🤝", subheading: "Here are some ideas..." },
  DANCE: { heading: "Hit the floor 💃", subheading: "Here are some ideas..." },
  TRY_SOMETHING_NEW: {
    heading: "Try something new 🪩",
    subheading: "No experience required — everyone's welcome here.",
  },
  CHAOS: { heading: "Feeling dangerous? 🔥", subheading: "Here are some ideas..." },
};
