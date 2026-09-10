import "dotenv/config";
import { seedParty } from "./seed-party";

const SLUG = process.env.SEED_PARTY_SLUG ?? "virgo";
const NAME = process.env.SEED_PARTY_NAME ?? "Birthday Chaos";

async function main() {
  console.log(`Seeding party "${SLUG}" (deletes and recreates if it already exists)...`);
  const party = await seedParty(SLUG, NAME);
  console.log(
    `\nDone. Guests join at /party/${party.slug}, laptop display at /party/${party.slug}/display, host at /host/${party.slug}.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
