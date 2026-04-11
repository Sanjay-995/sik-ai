/** In-memory scan queue when PostgreSQL is not configured (dev / CI). */

const byDevice = new Map<string, Record<string, unknown>[]>();

export function memoryListScans(deviceId: string): Record<string, unknown>[] {
  const list = byDevice.get(deviceId) ?? [];
  return [...list].reverse();
}

export function memoryAppendScan(deviceId: string, payload: Record<string, unknown>): void {
  const list = byDevice.get(deviceId) ?? [];
  list.push(payload);
  byDevice.set(deviceId, list);
}
