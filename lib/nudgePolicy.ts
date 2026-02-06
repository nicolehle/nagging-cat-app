// nagcat/lib/nudgePolicy.ts

export const NUDGE_MAX_HOURS = 24;

// Auto escalation schedule (minutes from "now" each time we schedule next tick)
export const ESCALATE_DELAYS_MINS = [30, 60, 180, 480, 900, 1380]; // 30m,1h,3h,8h,15h,23h

export function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * 60_000);
}

export function addHours(d: Date, hours: number) {
  return new Date(d.getTime() + hours * 3_600_000);
}

export function computeExpiresAt(now: Date) {
  return addHours(now, NUDGE_MAX_HOURS);
}

/**
 * Schedule next auto escalation based on the NEW escalation_level after update.
 * - escalation_level=0 => next in 30m
 * - level=1 => next in 60m
 * - level=2 => next in 180m
 * - if level beyond schedule => stop auto escalation (null)
 */
export function computeNextEscalateAt(now: Date, newLevel: number): Date | null {
  const idx = Math.max(0, newLevel); // tie schedule to level
  if (idx >= ESCALATE_DELAYS_MINS.length) return null;
  return addMinutes(now, ESCALATE_DELAYS_MINS[idx]);
}
