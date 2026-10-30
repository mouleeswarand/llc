import "server-only";
import { createRealtime } from "@neon/realtime/server";
import { databaseName } from "./realtime-queries";

let instance: ReturnType<typeof createRealtime> | undefined;

/** Seals live queries with NEON_REALTIME_SECRET. Never expose the secret to the browser. */
export function getRealtime() {
  instance ??= createRealtime({ secret: process.env.NEON_REALTIME_SECRET!, db: databaseName() });
  return instance;
}
