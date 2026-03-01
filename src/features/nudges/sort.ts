import { deriveStatus } from "@/src/features/nudges/status";
import { Nudge } from "@/src/features/nudges/types";

function rank(status: Nudge["status"]) {
  // lower = higher on screen
  if (status === "active") return 0;
  if (status === "escalated") return 1;
  if (status === "expired") return 2;
  return 3; // done (not usually shown on Home)
}

export function sortForHome(a: Nudge, b: Nudge) {
  const ra = rank(deriveStatus(a));
  const rb = rank(deriveStatus(b));
  if (ra !== rb) return ra - rb;

  // Within same group: newest first
  return b.createdAt - a.createdAt;
}