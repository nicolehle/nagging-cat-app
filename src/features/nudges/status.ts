import { Nudge } from "@/src/features/nudges/types";

export function deriveStatus(nudge: Nudge): Nudge["status"] {
  if (nudge.status === "done") return "done";
  if (Date.now() >= nudge.expiresAt) return "expired";
  return nudge.status; // active or escalated (while still within time)
}