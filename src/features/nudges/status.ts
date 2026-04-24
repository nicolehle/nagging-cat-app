import { deriveStatus as derivePolicyStatus } from "@/src/features/nudges/policy";
import { Nudge } from "@/src/features/nudges/types";

export function deriveStatus(n: Nudge): Nudge["status"] {
  return derivePolicyStatus(n);
}
