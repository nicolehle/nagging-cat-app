// lib/taskPolicy.ts

export type QuietHours = { startHour: number; endHour: number }; // 0-23

export type TaskPolicy = {
  maxActiveHours: number; // default 24 (1 day)
  escalationScheduleMins: number[]; // minutes after cycle start for auto escalations
  quietHours?: QuietHours;
  enforceQuietHours?: boolean;
};

export type TaskStatus = "pending" | "acknowledged" | "expired" | "done";

export function defaultPolicy(): TaskPolicy {
  return {
    maxActiveHours: 24,
    escalationScheduleMins: [30, 60, 180, 480, 900, 1380], // +30m, +1h, +3h, +8h, +15h, +23h
    quietHours: { startHour: 21, endHour: 9 }, // 9pm–9am
    enforceQuietHours: true,
  };
}

export function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60_000);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3_600_000);
}

export function isWithinQuietHours(d: Date, quiet: QuietHours): boolean {
  const h = d.getHours();
  const { startHour, endHour } = quiet;

  if (startHour === endHour) return false;
  if (startHour < endHour) return h >= startHour && h < endHour; // uncommon
  return h >= startHour || h < endHour; // wraps midnight
}

export function nextWakingTime(d: Date, quiet: QuietHours): Date {
  const out = new Date(d);
  out.setMinutes(0, 0, 0);
  out.setHours(quiet.endHour);
  if (out.getTime() <= d.getTime()) out.setDate(out.getDate() + 1);
  return out;
}

export function computeExpiresAt(cycleStartedAt: Date, policy: TaskPolicy): Date {
  return addHours(cycleStartedAt, policy.maxActiveHours);
}

export function computeNextAutoEscalationAt(
  cycleStartedAt: Date,
  policy: TaskPolicy,
  stepIndex: number
): Date | null {
  const schedule = policy.escalationScheduleMins;
  if (stepIndex < 0) return addMinutes(cycleStartedAt, schedule[0]);
  if (stepIndex >= schedule.length) return null;
  return addMinutes(cycleStartedAt, schedule[stepIndex]);
}
