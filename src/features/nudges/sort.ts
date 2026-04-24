import { deriveStatus } from "@/src/features/nudges/status";
import { Nudge } from "@/src/features/nudges/types";

function rank(status: Nudge["status"]) {
  // lower = higher on screen
  if (status === "active") return 0;
  if (status === "evening_reminder") return 1;
  if (status === "final_warning") return 2;
  if (status === "expired") return 3;
  return 4; // done/dismissed are not usually shown on Home
}

export function sortForHome(a: Nudge, b: Nudge) {
  const ra = rank(deriveStatus(a));
  const rb = rank(deriveStatus(b));
  if (ra !== rb) return ra - rb;

  // Within same group: newest first
  return b.createdAt - a.createdAt;
}
