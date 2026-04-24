import type { Nudge, NudgeStatus } from "@/src/features/nudges/types";

export const EVENING_REMINDER_LEVEL = 1;
export const FINAL_WARNING_LEVEL = 2;

export function getNudgePolicyTimes(now = new Date()) {
  const softReminderAt = new Date(now);
  softReminderAt.setHours(20, 0, 0, 0);

  const finalWarningAt = new Date(now);
  finalWarningAt.setHours(21, 30, 0, 0);

  const expiresAt = new Date(now);
  expiresAt.setHours(22, 0, 0, 0);

  if (now.getTime() >= expiresAt.getTime()) {
    softReminderAt.setDate(softReminderAt.getDate() + 1);
    finalWarningAt.setDate(finalWarningAt.getDate() + 1);
    expiresAt.setDate(expiresAt.getDate() + 1);
  }

  return { softReminderAt, finalWarningAt, expiresAt };
}

export function getNextEscalateAtForLevel(level: number, now = new Date()) {
  const policyTimes = getNudgePolicyTimes(now);
  const nowMs = now.getTime();

  if (level >= FINAL_WARNING_LEVEL) return null;
  if (level >= EVENING_REMINDER_LEVEL) {
    return nowMs < policyTimes.finalWarningAt.getTime() ? policyTimes.finalWarningAt : null;
  }

  if (nowMs < policyTimes.softReminderAt.getTime()) return policyTimes.softReminderAt;
  if (nowMs < policyTimes.finalWarningAt.getTime()) return policyTimes.finalWarningAt;
  return null;
}

export function getInitialNudgeSchedule(now = new Date()) {
  const policyTimes = getNudgePolicyTimes(now);
  const nowMs = now.getTime();
  const escalationLevel =
    nowMs >= policyTimes.finalWarningAt.getTime()
      ? FINAL_WARNING_LEVEL
      : nowMs >= policyTimes.softReminderAt.getTime()
        ? EVENING_REMINDER_LEVEL
        : 0;

  return {
    ...policyTimes,
    escalationLevel,
    nextEscalateAt: getNextEscalateAtForLevel(escalationLevel, now),
  };
}

function getPolicyTimesFromExpiry(expiresAtMs: number) {
  const softReminderAt = new Date(expiresAtMs);
  softReminderAt.setHours(20, 0, 0, 0);

  const finalWarningAt = new Date(expiresAtMs);
  finalWarningAt.setHours(21, 30, 0, 0);

  return {
    softReminderAt: softReminderAt.getTime(),
    finalWarningAt: finalWarningAt.getTime(),
  };
}

export function deriveLifecycleStatus(input: {
  baseStatus?: string | null;
  lastEvent?: string | null;
  escalationLevel: number;
  expiresAt: number;
  now?: number;
}): NudgeStatus {
  if (input.baseStatus === "done") return "done";
  if (input.baseStatus === "dismissed" || input.lastEvent === "dismissed") return "dismissed";
  if (input.baseStatus === "expired" || input.lastEvent === "expired") return "expired";

  const now = input.now ?? Date.now();
  if (now >= input.expiresAt) return "expired";

  const policyTimes = getPolicyTimesFromExpiry(input.expiresAt);
  if (input.escalationLevel >= FINAL_WARNING_LEVEL || now >= policyTimes.finalWarningAt) {
    return "final_warning";
  }

  if (
    input.baseStatus === "escalated" ||
    input.escalationLevel >= EVENING_REMINDER_LEVEL ||
    now >= policyTimes.softReminderAt
  ) {
    return "evening_reminder";
  }

  return "active";
}

export function deriveStatus(n: Nudge): NudgeStatus {
  return deriveLifecycleStatus({
    baseStatus: n.status,
    escalationLevel: n.escalationLevel,
    expiresAt: n.expiresAt,
  });
}
