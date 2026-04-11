import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
export type Db = NodePgDatabase<typeof schema>;
/**
 * Returns a Drizzle client when DATABASE_URL is set; otherwise null.
 * API routes can fall back to in-memory storage for local development.
 */
export declare function getDb(): Db | null;
export declare function closeDbPool(): Promise<void>;
export * from "./schema";
//# sourceMappingURL=index.d.ts.map