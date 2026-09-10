import "dotenv/config";
import { syncChallengeCatalog } from "./seed-party";

const SLUG = process.env.SEED_PARTY_SLUG ?? "virgo";

async function main() {
  console.log(`Syncing challenge catalog for party "${SLUG}" (adds anything new, never touches guests)...`);
  const result = await syncChallengeCatalog(SLUG);
  console.log(`Added ${result.addedChallenges} new challenge(s) and ${result.addedQuestions} new vote question(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
