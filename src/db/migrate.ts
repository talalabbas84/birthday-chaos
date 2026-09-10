import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

/**
 * Applies any pending SQL migrations in ./drizzle to DATABASE_URL. Runs
 * automatically as part of `npm run build` (see package.json) so every
 * Vercel deployment brings the schema up to date before the app starts —
 * no manual `db:push` step against production required. Never touches
 * data/seeding, only table structure.
 */
async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("Applying database migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations up to date.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
