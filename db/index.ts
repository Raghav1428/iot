import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgres://raghav:raghav@localhost:5435/raghav";

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
