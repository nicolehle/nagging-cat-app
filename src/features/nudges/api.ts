import { supabase } from "@/src/lib/supabase";
import type { Nudge, NudgeStatus } from "@/src/features/nudges/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const ESCALATE_DELAYS_MINS = [120, 480, 1200] as const;
const DEFAULT_EMOJI = "📣";

type NudgeRow = {
  id: string;
  pair_id: string;
  title: string;
  status: string | null;
  escalation_level: number | null;
  created_at: string | null;
  expires_at: string | null;
  sender_device: string | null;
  last_event: string | null;
  last_event_at: string | null;
  done_at: string | null;
  emoji: string | null;
  message: string | null;
};

type SendNudgeInput = {
  pairId: string;
  deviceName: string;
  title: string;
  emoji: string;
  message: string;
};

function requirePairId(pairId: string | null): string {
  const value = pairId?.trim();
  if (!value) {
    throw new Error("Missing pair ID. Connect or restore your pair before using nudges.");
  }
  return value;
}

function addMinutes(date: Date, mins: number) {
  return new Date(date.getTime() + mins * 60_000);
}

function computeExpiresAt(now: Date) {
  return new Date(now.getTime() + DAY_MS);
}

function computeNextEscalateAt(now: Date, newLevel: number): Date | null {
  const delay = ESCALATE_DELAYS_MINS[newLevel];
  return delay == null ? null : addMinutes(now, delay);
}

function toMillis(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function deriveRowStatus(row: NudgeRow): NudgeStatus {
  if (row.status === "done") return "done";
  if (row.last_event === "dismissed") return "dismissed";

  const expiresAt = toMillis(row.expires_at, toMillis(row.created_at, Date.now()) + DAY_MS);
  if (Date.now() >= expiresAt || row.last_event === "expired") return "expired";

  if ((row.escalation_level ?? 0) > 0 || row.last_event === "manual_escalate" || row.last_event === "auto_escalate") {
    return "escalated";
  }

  return "active";
}

function mapRowToNudge(row: NudgeRow, deviceName: string): Nudge {
  const createdAt = toMillis(row.created_at, Date.now());
  const expiresAt = toMillis(row.expires_at, createdAt + DAY_MS);
  const senderDevice = row.sender_device?.trim();

  return {
    id: row.id,
    title: row.title,
    emoji: row.emoji?.trim() || DEFAULT_EMOJI,
    message: row.message?.trim() || "",
    createdAt,
    expiresAt,
    from: senderDevice && senderDevice === deviceName ? "me" : "partner",
    status: deriveRowStatus(row),
    escalationLevel: row.escalation_level ?? 0,
  };
}

async function fetchNudgesForPair(pairId: string, deviceName: string) {
  const { data, error } = await supabase
    .from("nudges")
    .select(
      "id,pair_id,title,status,escalation_level,created_at,expires_at,sender_device,last_event,last_event_at,done_at,emoji,message"
    )
    .eq("pair_id", pairId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as NudgeRow[]).map((row) => mapRowToNudge(row, deviceName));
}

export async function fetchActiveNudges(pairId: string | null, deviceName: string) {
  const resolvedPairId = requirePairId(pairId);
  const nudges = await fetchNudgesForPair(resolvedPairId, deviceName);
  return nudges.filter((nudge) => nudge.status !== "done" && nudge.status !== "dismissed");
}

export async function fetchHistoryNudges(pairId: string | null, deviceName: string) {
  const resolvedPairId = requirePairId(pairId);
  const nudges = await fetchNudgesForPair(resolvedPairId, deviceName);
  return nudges.filter(
    (nudge) =>
      nudge.status === "done" || nudge.status === "escalated" || nudge.status === "dismissed"
  );
}

export async function sendNudge(input: SendNudgeInput) {
  const pairId = requirePairId(input.pairId);
  const title = input.title.trim();
  if (!title) {
    throw new Error("Nudge title is required.");
  }

  const now = new Date();
  const nextEscalateAt = computeNextEscalateAt(now, 0);
  const { error } = await supabase.from("nudges").insert({
    pair_id: pairId,
    title,
    status: "pending",
    escalation_level: 0,
    sender_device: input.deviceName,
    last_event: "created",
    last_event_at: now.toISOString(),
    expires_at: computeExpiresAt(now).toISOString(),
    next_escalate_at: nextEscalateAt?.toISOString() ?? null,
    emoji: input.emoji.trim() || DEFAULT_EMOJI,
    message: input.message.trim(),
  });

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
      next_escalate_at: null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function escalate(id: string, currentLevel: number) {
  const now = new Date();
  const nextLevel = Math.min(currentLevel + 1, 10);
  const nextEscalateAt = computeNextEscalateAt(now, nextLevel);

  const { error } = await supabase
    .from("nudges")
    .update({
      escalation_level: nextLevel,
      last_event: "manual_escalate",
      last_event_at: now.toISOString(),
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
      last_event: "dismissed",
      last_event_at: nowIso,
      next_escalate_at: null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function renewExpiredNudge(id: string) {
  const now = new Date();
  const nextEscalateAt = computeNextEscalateAt(now, 0);

  const { error } = await supabase
    .from("nudges")
    .update({
      status: "pending",
      escalation_level: 0,
      last_event: "renewed",
      last_event_at: now.toISOString(),
      done_at: null,
      expires_at: computeExpiresAt(now).toISOString(),
      next_escalate_at: nextEscalateAt?.toISOString() ?? null,
    })
    .eq("id", id);

  if (error) throw error;
}
