import { Nudge } from "@/src/features/nudges/types";

export function deriveStatus(n: Nudge): Nudge["status"] {
  if (n.status === "done") return "done";
  if (n.status === "dismissed") return "dismissed";

  if (Date.now() >= n.expiresAt) return "expired";

  return n.status; // active or escalated
}