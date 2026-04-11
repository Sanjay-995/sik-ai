import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@workspace/db";
import { scansTable } from "@workspace/db/schema";
import { memoryAppendScan, memoryListScans } from "../lib/scanMemoryStore";

const router: IRouter = Router();

const scanPayloadSchema = z.record(z.string(), z.unknown());

const postScanSchema = z.object({
  deviceId: z.string().min(8).max(128),
  scan: scanPayloadSchema,
});

router.get("/scans", async (req, res) => {
  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId : "";
  if (!deviceId || deviceId.length < 8) {
    res.status(400).json({ error: "deviceId_required" });
    return;
  }

  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(scansTable)
      .where(eq(scansTable.externalDeviceId, deviceId))
      .orderBy(desc(scansTable.createdAt))
      .limit(200);
    res.json({ scans: rows.map((r) => ({ id: r.id, createdAt: r.createdAt, scan: r.payload })) });
    return;
  }

  const scans = memoryListScans(deviceId).map((payload, i) => ({
    id: `mem_${i}`,
    createdAt: new Date().toISOString(),
    scan: payload,
  }));
  res.json({ scans, storage: "memory" });
});

router.post("/scans", async (req, res) => {
  const parsed = postScanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
    return;
  }

  const { deviceId, scan } = parsed.data;
  const db = getDb();

  if (db) {
    const [row] = await db
      .insert(scansTable)
      .values({ externalDeviceId: deviceId, payload: scan })
      .returning({ id: scansTable.id, createdAt: scansTable.createdAt });
    res.status(201).json({ id: row.id, createdAt: row.createdAt, storage: "postgres" });
    return;
  }

  memoryAppendScan(deviceId, scan);
  res.status(201).json({ id: `mem_${Date.now()}`, createdAt: new Date().toISOString(), storage: "memory" });
});

export default router;
