// lib/tasks.ts
import {
  TaskPolicy,
  TaskStatus,
  defaultPolicy,
  computeExpiresAt,
  computeNextAutoEscalationAt,
  isWithinQuietHours,
  nextWakingTime,
} from "./taskPolicy";

export type EscalationMeta = {
  level: number;        // total escalations (manual + auto)
  stepIndex: number;    // which auto schedule step we’re on
  lastManualAt?: string;
  lastAutoAt?: string;
  nextAutoAt?: string;
};

export type Task = {
  id: string;
  senderId: string;
  receiverId: string;
  title: string;
  note?: string;

  status: TaskStatus;

  createdAt: string;
  cycleStartedAt: string;
  expiresAt: string;

  policy: TaskPolicy; // snapshot for future flexibility

  escalation: EscalationMeta;

  history: Array<{
    at: string;
    type:
      | "created"
      | "acknowledged"
      | "manual_escalate"
      | "auto_escalate"
      | "expired"
      | "done";
    by?: string; // userId or "system"
    level?: number;
  }>;
};

export type TickResult = {
  task: Task;
  shouldNotify: boolean;
  notifyReason?: "auto_escalate" | "expired";
};

function iso(d: Date): string {
  return d.toISOString();
}
function nowDate(nowIso?: string): Date {
  return nowIso ? new Date(nowIso) : new Date();
}

function normalizeForQuietHours(d: Date, policy: TaskPolicy): Date {
  if (!policy.enforceQuietHours || !policy.quietHours) return d;
  if (!isWithinQuietHours(d, policy.quietHours)) return d;
  return nextWakingTime(d, policy.quietHours);
}

export function createTask(input: {
  id: string;
  senderId: string;
  receiverId: string;
  title: string;
  note?: string;
  nowIso?: string;
  policyOverride?: Partial<TaskPolicy>;
}): Task {
  const now = nowDate(input.nowIso);
  const base = defaultPolicy();
  const policy: TaskPolicy = { ...base, ...input.policyOverride };

  const cycleStartedAt = now;
  const expiresAt = computeExpiresAt(cycleStartedAt, policy);

  const firstAuto = computeNextAutoEscalationAt(cycleStartedAt, policy, 0);
  const nextAutoAt = firstAuto ? normalizeForQuietHours(firstAuto, policy) : null;

  return {
    id: input.id,
    senderId: input.senderId,
    receiverId: input.receiverId,
    title: input.title,
    note: input.note,
    status: "pending",
    createdAt: iso(now),
    cycleStartedAt: iso(cycleStartedAt),
    expiresAt: iso(expiresAt),
    policy,
    escalation: {
      level: 0,
      stepIndex: 0,
      nextAutoAt: nextAutoAt ? iso(nextAutoAt) : undefined,
    },
    history: [{ at: iso(now), type: "created", by: input.senderId }],
  };
}

/**
 * Sender-only manual escalation.
 * - Works until task expires/done.
 * - Does NOT cancel auto; it just makes the next auto come sooner (re-anchored from now).
 */
export function manualEscalate(task: Task, input: { byUserId: string; nowIso?: string }): Task {
  const now = nowDate(input.nowIso);

  if (input.byUserId !== task.senderId) return task;
  if (task.status === "done" || task.status === "expired") return task;

  const policy = task.policy;

  const newLevel = task.escalation.level + 1;
  const newStepIndex = Math.min(
    task.escalation.stepIndex + 1,
    policy.escalationScheduleMins.length
  );

  // Re-anchor next auto escalation from NOW using schedule[0]
  const nextAutoBase = computeNextAutoEscalationAt(now, policy, 0);
  const nextAutoAt = nextAutoBase ? normalizeForQuietHours(nextAutoBase, policy) : null;

  return {
    ...task,
    escalation: {
      ...task.escalation,
      level: newLevel,
      stepIndex: newStepIndex,
      lastManualAt: iso(now),
      nextAutoAt: nextAutoAt ? iso(nextAutoAt) : undefined,
    },
    history: [
      ...task.history,
      { at: iso(now), type: "manual_escalate", by: input.byUserId, level: newLevel },
    ],
  };
}

/**
 * Tick:
 * - If past expiresAt => expired (stops auto)
 * - Else if past nextAutoAt => auto escalate + schedule next
 */
export function tickTask(task: Task, input: { nowIso?: string }): TickResult {
  const now = nowDate(input.nowIso);

  if (task.status === "done" || task.status === "expired") {
    return { task, shouldNotify: false };
  }

  const expiresAt = new Date(task.expiresAt);
  if (now >= expiresAt) {
    const expiredTask: Task = {
      ...task,
      status: "expired",
      escalation: { ...task.escalation, nextAutoAt: undefined },
      history: [...task.history, { at: iso(now), type: "expired", by: "system" }],
    };
    return { task: expiredTask, shouldNotify: true, notifyReason: "expired" };
  }

  const nextAutoAtIso = task.escalation.nextAutoAt;
  if (!nextAutoAtIso) return { task, shouldNotify: false };

  const nextAutoAt = new Date(nextAutoAtIso);
  if (now < nextAutoAt) return { task, shouldNotify: false };

  const policy = task.policy;
  const cycleStartedAt = new Date(task.cycleStartedAt);

  const newLevel = task.escalation.level + 1;
  const newStepIndex = task.escalation.stepIndex + 1;

  const nextAutoBase = computeNextAutoEscalationAt(cycleStartedAt, policy, newStepIndex);
  const nextAutoNormalized = nextAutoBase ? normalizeForQuietHours(nextAutoBase, policy) : null;

  const escalatedTask: Task = {
    ...task,
    escalation: {
      ...task.escalation,
      level: newLevel,
      stepIndex: newStepIndex,
      lastAutoAt: iso(now),
      nextAutoAt: nextAutoNormalized ? iso(nextAutoNormalized) : undefined,
    },
    history: [
      ...task.history,
      { at: iso(now), type: "auto_escalate", by: "system", level: newLevel },
    ],
  };

  return { task: escalatedTask, shouldNotify: true, notifyReason: "auto_escalate" };
}

export function completeTask(task: Task, input: { byUserId: string; nowIso?: string }): Task {
  const now = nowDate(input.nowIso);

  // Usually receiver completes; allow sender too if you want
  if (input.byUserId !== task.receiverId && input.byUserId !== task.senderId) return task;
  if (task.status === "done") return task;

  return {
    ...task,
    status: "done",
    escalation: { ...task.escalation, nextAutoAt: undefined },
    history: [...task.history, { at: iso(now), type: "done", by: input.byUserId }],
  };
}
