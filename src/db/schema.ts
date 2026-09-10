import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const partyStatusEnum = pgEnum("party_status", ["UPCOMING", "LIVE", "PAUSED", "ENDED"]);

export const danceLevelEnum = pgEnum("dance_level", [
  "SALSA_DANCER",
  "DANCES_A_LITTLE",
  "DOES_NOT_REALLY_DANCE",
]);

export const challengeCategoryEnum = pgEnum("challenge_category", [
  "EASY",
  "SOCIAL",
  "DANCE",
  "TRY_SOMETHING_NEW",
  "CHAOS",
]);

// Aggregate verification status stored on the completion itself.
export const verificationStatusEnum = pgEnum("verification_status", [
  "NOT_REQUIRED",
  "UNVERIFIED",
  "CONFIRMED",
  "DISPUTED",
]);

// Per-person confirmation status ("quick check" response).
export const confirmationStatusEnum = pgEnum("confirmation_status", [
  "NOT_REQUIRED",
  "UNVERIFIED",
  "CONFIRMED",
  "DISPUTED",
  "SKIPPED",
]);

export const parties = pgTable("parties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  status: partyStatusEnum("status").notNull().default("LIVE"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  votingOpen: boolean("voting_open").notNull().default(false),
  awardRevealActive: boolean("award_reveal_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex("parties_slug_idx").on(table.slug),
}));

export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  partyId: uuid("party_id").notNull().references(() => parties.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  danceLevel: danceLevelEnum("dance_level").notNull(),
  points: integer("points").notNull().default(0),
  sessionTokenHash: text("session_token_hash"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
}, (table) => ({
  partyPointsIdx: index("guests_party_points_idx").on(table.partyId, table.points),
  sessionTokenIdx: uniqueIndex("guests_session_token_idx").on(table.sessionTokenHash),
}));

export const challenges = pgTable("challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  partyId: uuid("party_id").notNull().references(() => parties.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: challengeCategoryEnum("category").notNull(),
  points: integer("points").notNull(),
  maxCompletions: integer("max_completions").notNull().default(1),
  requiresPerson: boolean("requires_person").notNull().default(false),
  minimumPeople: integer("minimum_people").notNull().default(1),
  uniquePersonRequired: boolean("unique_person_required").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => ({
  partyIdx: index("challenges_party_idx").on(table.partyId),
}));

export const challengeCompletions = pgTable("challenge_completions", {
  id: uuid("id").primaryKey().defaultRandom(),
  partyId: uuid("party_id").notNull().references(() => parties.id, { onDelete: "cascade" }),
  guestId: uuid("guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
  challengeId: uuid("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  requestId: text("request_id").notNull(),
  pointsAwarded: integer("points_awarded").notNull(),
  verificationStatus: verificationStatusEnum("verification_status").notNull().default("NOT_REQUIRED"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  requestIdIdx: uniqueIndex("completions_request_id_idx").on(table.requestId),
  partyCreatedIdx: index("completions_party_created_idx").on(table.partyId, table.createdAt),
  guestChallengeIdx: index("completions_guest_challenge_idx").on(table.guestId, table.challengeId),
}));

export const challengeCompletionPeople = pgTable("challenge_completion_people", {
  id: uuid("id").primaryKey().defaultRandom(),
  completionId: uuid("completion_id").notNull().references(() => challengeCompletions.id, { onDelete: "cascade" }),
  guestId: uuid("guest_id").references(() => guests.id, { onDelete: "cascade" }),
  externalPersonName: text("external_person_name"),
  normalizedExternalName: text("normalized_external_name"),
  confirmationStatus: confirmationStatusEnum("confirmation_status").notNull().default("NOT_REQUIRED"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  completionIdx: index("completion_people_completion_idx").on(table.completionId),
  guestIdx: index("completion_people_guest_idx").on(table.guestId),
}));

export const voteQuestions = pgTable("vote_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  partyId: uuid("party_id").notNull().references(() => parties.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  partyId: uuid("party_id").notNull().references(() => parties.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => voteQuestions.id, { onDelete: "cascade" }),
  voterGuestId: uuid("voter_guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
  selectedGuestId: uuid("selected_guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  questionVoterIdx: uniqueIndex("votes_question_voter_idx").on(table.questionId, table.voterGuestId),
  questionIdx: index("votes_question_idx").on(table.questionId),
}));

export const partyRelations = relations(parties, ({ many }) => ({
  guests: many(guests),
  challenges: many(challenges),
  voteQuestions: many(voteQuestions),
}));

export const guestRelations = relations(guests, ({ one, many }) => ({
  party: one(parties, { fields: [guests.partyId], references: [parties.id] }),
  completions: many(challengeCompletions),
}));

export const challengeRelations = relations(challenges, ({ one, many }) => ({
  party: one(parties, { fields: [challenges.partyId], references: [parties.id] }),
  completions: many(challengeCompletions),
}));

export const completionRelations = relations(challengeCompletions, ({ one, many }) => ({
  party: one(parties, { fields: [challengeCompletions.partyId], references: [parties.id] }),
  guest: one(guests, { fields: [challengeCompletions.guestId], references: [guests.id] }),
  challenge: one(challenges, { fields: [challengeCompletions.challengeId], references: [challenges.id] }),
  people: many(challengeCompletionPeople),
}));

export const completionPersonRelations = relations(challengeCompletionPeople, ({ one }) => ({
  completion: one(challengeCompletions, {
    fields: [challengeCompletionPeople.completionId],
    references: [challengeCompletions.id],
  }),
  guest: one(guests, { fields: [challengeCompletionPeople.guestId], references: [guests.id] }),
}));

export const voteQuestionRelations = relations(voteQuestions, ({ one, many }) => ({
  party: one(parties, { fields: [voteQuestions.partyId], references: [parties.id] }),
  votes: many(votes),
}));

export const voteRelations = relations(votes, ({ one }) => ({
  question: one(voteQuestions, { fields: [votes.questionId], references: [voteQuestions.id] }),
  voter: one(guests, { fields: [votes.voterGuestId], references: [guests.id] }),
  selected: one(guests, { fields: [votes.selectedGuestId], references: [guests.id] }),
}));

export type Party = typeof parties.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type ChallengeCompletion = typeof challengeCompletions.$inferSelect;
export type ChallengeCompletionPerson = typeof challengeCompletionPeople.$inferSelect;
export type VoteQuestion = typeof voteQuestions.$inferSelect;
export type Vote = typeof votes.$inferSelect;
