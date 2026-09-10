import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

neonConfig.webSocketConstructor = ws;

declare global {
  // eslint-disable-next-line no-var
  var __birthdayChaosPool: Pool | undefined;
}

// Reuse the pool across hot-reloads/warm serverless invocations instead of
// opening a fresh websocket pool on every import.
const pool = global.__birthdayChaosPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") {
  global.__birthdayChaosPool = pool;
}

export const db = drizzle(pool, { schema });
