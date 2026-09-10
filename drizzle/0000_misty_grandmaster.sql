CREATE TYPE "public"."challenge_category" AS ENUM('EASY', 'SOCIAL', 'DANCE', 'TRY_SOMETHING_NEW', 'CHAOS');--> statement-breakpoint
CREATE TYPE "public"."confirmation_status" AS ENUM('NOT_REQUIRED', 'UNVERIFIED', 'CONFIRMED', 'DISPUTED', 'SKIPPED');--> statement-breakpoint
CREATE TYPE "public"."dance_level" AS ENUM('SALSA_DANCER', 'DANCES_A_LITTLE', 'DOES_NOT_REALLY_DANCE');--> statement-breakpoint
CREATE TYPE "public"."party_status" AS ENUM('UPCOMING', 'LIVE', 'PAUSED', 'ENDED');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('NOT_REQUIRED', 'UNVERIFIED', 'CONFIRMED', 'DISPUTED');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "challenge_completion_people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"completion_id" uuid NOT NULL,
	"guest_id" uuid,
	"external_person_name" text,
	"normalized_external_name" text,
	"confirmation_status" "confirmation_status" DEFAULT 'NOT_REQUIRED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "challenge_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_id" uuid NOT NULL,
	"guest_id" uuid NOT NULL,
	"challenge_id" uuid NOT NULL,
	"request_id" text NOT NULL,
	"points_awarded" integer NOT NULL,
	"verification_status" "verification_status" DEFAULT 'NOT_REQUIRED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "challenge_category" NOT NULL,
	"points" integer NOT NULL,
	"max_completions" integer DEFAULT 1 NOT NULL,
	"requires_person" boolean DEFAULT false NOT NULL,
	"minimum_people" integer DEFAULT 1 NOT NULL,
	"unique_person_required" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_id" uuid NOT NULL,
	"name" text NOT NULL,
	"dance_level" "dance_level" NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"session_token_hash" text,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" "party_status" DEFAULT 'LIVE' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"voting_open" boolean DEFAULT false NOT NULL,
	"award_reveal_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vote_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"voter_guest_id" uuid NOT NULL,
	"selected_guest_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenge_completion_people" ADD CONSTRAINT "challenge_completion_people_completion_id_challenge_completions_id_fk" FOREIGN KEY ("completion_id") REFERENCES "public"."challenge_completions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenge_completion_people" ADD CONSTRAINT "challenge_completion_people_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenge_completions" ADD CONSTRAINT "challenge_completions_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenge_completions" ADD CONSTRAINT "challenge_completions_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenge_completions" ADD CONSTRAINT "challenge_completions_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenges" ADD CONSTRAINT "challenges_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guests" ADD CONSTRAINT "guests_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vote_questions" ADD CONSTRAINT "vote_questions_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_question_id_vote_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."vote_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_voter_guest_id_guests_id_fk" FOREIGN KEY ("voter_guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_selected_guest_id_guests_id_fk" FOREIGN KEY ("selected_guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completion_people_completion_idx" ON "challenge_completion_people" USING btree ("completion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completion_people_guest_idx" ON "challenge_completion_people" USING btree ("guest_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "completions_request_id_idx" ON "challenge_completions" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_party_created_idx" ON "challenge_completions" USING btree ("party_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_guest_challenge_idx" ON "challenge_completions" USING btree ("guest_id","challenge_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "challenges_party_idx" ON "challenges" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "guests_party_points_idx" ON "guests" USING btree ("party_id","points");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "guests_session_token_idx" ON "guests" USING btree ("session_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "parties_slug_idx" ON "parties" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "votes_question_voter_idx" ON "votes" USING btree ("question_id","voter_guest_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "votes_question_idx" ON "votes" USING btree ("question_id");