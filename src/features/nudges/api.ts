import { getCurrentLocalUserId } from "@/src/features/pairing/localUser";
import {
  deriveLifecycleStatus,
  FINAL_WARNING_LEVEL,
  getInitialNudgeSchedule,
  getNextEscalateAtForLevel,
  getNudgePolicyTimes,
} from "@/src/features/nudges/policy";
import { supabase } from "@/src/lib/supabase";
import type { Nudge, NudgeStatus } from "@/src/features/nudges/types";

const DEFAULT_EMOJI = "📣";

type NudgeRow = {
  id: string;
  pair_id: string;
  title: string;
  status: string | null;
  escalation_level: number | null;
  created_at: string | null;
  expires_at: string | null;
  from_user_id: string | null;
  to_user_id: string | null;
  last_event: string | null;
  last_event_at: string | null;
  done_at: string | null;
  emoji: string | null;
  message: string | null;
};

type PairRow = {
  id: string;
  user_a_id: string | null;
  user_b_id: string | null;
};

type SendNudgeInput = {
  pairId: string;
  title: string;
  emoji: string;
  message: string;
};

type BuildSendNudgePayloadInput = SendNudgeInput & {
  fromUserId: string;
  toUserId: string;
  now?: Date;
};

function requirePairId(pairId: string | null): string {
  const value = pairId?.trim();
  if (!value) {
    throw new Error("Missing pair ID. Connect or restore your pair before using nudges.");
  }
  return value;
}

function toMillis(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function deriveRowStatus(row: NudgeRow): NudgeStatus {
  const createdAt = toMillis(row.created_at, Date.now());
  const expiresAt = toMillis(
    row.expires_at,
    getNudgePolicyTimes(new Date(createdAt)).expiresAt.getTime()
  );

  return deriveLifecycleStatus({
    baseStatus: row.status,
    lastEvent: row.last_event,
    escalationLevel: row.escalation_level ?? 0,
    expiresAt,
  });
}

function deriveOwnership(row: NudgeRow, meId: string): Nudge["from"] {
  if (row.from_user_id && row.from_user_id === meId) {
    return "me";
  }

  if (row.to_user_id && row.to_user_id === meId) {
    return "partner";
  }

  return "partner";
}

function mapRowToNudge(row: NudgeRow, meId: string): Nudge {
  const createdAt = toMillis(row.created_at, Date.now());
  const expiresAt = toMillis(
    row.expires_at,
    getNudgePolicyTimes(new Date(createdAt)).expiresAt.getTime()
  );

  return {
    id: row.id,
    title: row.title,
    emoji: row.emoji?.trim() || DEFAULT_EMOJI,
    message: row.message?.trim() || "",
    createdAt,
    expiresAt,
    from: deriveOwnership(row, meId),
    status: deriveRowStatus(row),
    escalationLevel: row.escalation_level ?? 0,
  };
}

async function fetchNudgesForPair(pairId: string, meId: string) {
  const { data, error } = await supabase
    .from("nudges")
    .select(
      "id,pair_id,title,status,escalation_level,created_at,expires_at,from_user_id,to_user_id,last_event,last_event_at,done_at,emoji,message"
    )
    .eq("pair_id", pairId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as NudgeRow[]).map((row) => mapRowToNudge(row, meId));
}

export async function fetchActiveNudges(pairId: string | null) {
  const resolvedPairId = requirePairId(pairId);
  const meId = await getCurrentLocalUserId();
  const nudges = await fetchNudgesForPair(resolvedPairId, meId);
  return nudges.filter((nudge) => nudge.status !== "done" && nudge.status !== "dismissed");
}

export async function fetchHistoryNudges(pairId: string | null) {
  const resolvedPairId = requirePairId(pairId);
  const meId = await getCurrentLocalUserId();
  const nudges = await fetchNudgesForPair(resolvedPairId, meId);
  return nudges.filter(
    (nudge) =>
      nudge.status === "done" || nudge.status === "expired" || nudge.status === "dismissed"
  );
}

async function getPairParticipants(pairId: string) {
  const { data, error } = await supabase
    .from("pairs")
    .select("id,user_a_id,user_b_id")
    .eq("id", pairId)
    .maybeSingle();

  if (error) throw error;

  return (data as PairRow | null) ?? null;
}

export function buildSendNudgeInsertPayload(input: BuildSendNudgePayloadInput) {
  const now = input.now ?? new Date();
  const schedule = getInitialNudgeSchedule(now);

  return {
    pair_id: input.pairId,
    title: input.title.trim(),
    status: "pending",
    escalation_level: schedule.escalationLevel,
    from_user_id: input.fromUserId,
    to_user_id: input.toUserId,
    last_event: "created",
    last_event_at: now.toISOString(),
    remind_at: schedule.nextEscalateAt?.toISOString() ?? null,
    expires_at: schedule.expiresAt.toISOString(),
    next_escalate_at: schedule.nextEscalateAt?.toISOString() ?? null,
    emoji: input.emoji.trim() || DEFAULT_EMOJI,
    message: input.message.trim(),
  };
}

export async function sendNudge(input: SendNudgeInput) {
  const pairId = requirePairId(input.pairId);
  const title = input.title.trim();
  if (!title) {
    throw new Error("Nudge title is required.");
  }

  const meId = await getCurrentLocalUserId();
  const pair = await getPairParticipants(pairId);
  if (!pair) {
    throw new Error("Could not find your pair. Refresh and try again.");
  }

  const partnerId =
    pair.user_a_id === meId ? pair.user_b_id : pair.user_b_id === meId ? pair.user_a_id : null;
  if (!partnerId) {
    throw new Error("Connect with a partner before sending nudges.");
  }

  const { error } = await supabase.from("nudges").insert(
    buildSendNudgeInsertPayload({
      ...input,
      pairId,
      title,
      fromUserId: meId,
      toUserId: partnerId,
    })
  );

  if (error) throw error;
}

export async function markDone(id: string) {
  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("nudges")
    .update({
      status: "done",
      done_at: nowIso,
      last_event: "done",
      last_event_at: nowIso,
      remind_at: null,
      next_escalate_at: null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function escalate(id: string, currentLevel: number) {
  if (currentLevel >= FINAL_WARNING_LEVEL) {
    throw new Error("This nudge is already at the final warning level.");
  }

  const now = new Date();
  const nextLevel = Math.min(currentLevel + 1, FINAL_WARNING_LEVEL);
  const nextEscalateAt = getNextEscalateAtForLevel(nextLevel, now);

  const { error } = await supabase
    .from("nudges")
    .update({
      escalation_level: nextLevel,
      last_event: "manual_escalate",
      last_event_at: now.toISOString(),
      remind_at: nextEscalateAt?.toISOString() ?? null,
      next_escalate_at: nextEscalateAt?.toISOString() ?? null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function dismiss(id: string) {
  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("nudges")
    .update({
      status: "dismissed",
      last_event: "dismissed",
      last_event_at: nowIso,
      remind_at: null,
      next_escalate_at: null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function renewExpiredNudge(id: string) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const policyTimes = getNudgePolicyTimes(tomorrow);

  const { error } = await supabase
    .from("nudges")
    .update({
      status: "pending",
      escalation_level: 0,
      last_event: "renewed",
      last_event_at: now.toISOString(),
      done_at: null,
      remind_at: policyTimes.softReminderAt.toISOString(),
      expires_at: policyTimes.expiresAt.toISOString(),
      next_escalate_at: policyTimes.softReminderAt.toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}
