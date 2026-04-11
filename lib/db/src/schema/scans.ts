import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Raw scan JSON from the app; `external_device_id` is a client UUID until auth ships */
export const scansTable = pgTable("scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalDeviceId: text("external_device_id").notNull(),
  payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
