import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Plain HTTP driver: one fetch per query, no persistent connection to keep
// alive. This is the driver Neon recommends for serverless functions —
// the WebSocket Pool driver doesn't reliably survive Vercel's freeze/thaw
// lifecycle or Neon's scale-to-zero cold starts, which surfaces as
// "Connection terminated unexpectedly" in production.
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
