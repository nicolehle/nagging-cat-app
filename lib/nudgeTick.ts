// nagcat/lib/nudgeTick.ts
import { supabase } from "@/lib/supabase";
import { computeNextEscalateAt } from "@/lib/nudgePolicy";

export type TickSummary = {
  ok: true;
  expired: number;
  escalated: number;
  checked: number;
} | {
  ok: false;
  reason: string;
};

/**
 * Tick logic:
 * - Expire: if now >= expires_at and still pending => last_event='expired', next_escalate_at=null
 * - Auto-escalate: if now >= next_escalate_at and still pending => escalation_level+1, last_event='auto_escalate', schedule next_escalate_at
 *
 * Safe to run often. Only acts on pending rows.
 */
export async function tickNudgesForPair(pairId: string, nowIso = new Date().toISOString()): Promise<TickSummary> {
  const p = pairId.trim();
  if (!p) return { ok: false, reason: "Missing pairId" };

  const now = new Date(nowIso);

  const { data, error } = await supabase
    .from("nudges")
    .select("id,status,escalation_level,expires_at,next_escalate_at")
    .eq("pair_id", p)
    .eq("status", "pending");

  if (error) return { ok: false, reason: error.message };

  const rows = (data ?? []) as Array<{
    id: string;
    status: "pending" | "done";
    escalation_level: number;
    expires_at: string | null;
    next_escalate_at: string | null;
  }>;

  let expired = 0;
  let escalated = 0;

  for (const r of rows) {
    // If missing timestamps (older rows), skip safely
    if (!r.expires_at) continue;

    const expiresAt = new Date(r.expires_at);

    // 1) Expire
    if (now >= expiresAt) {
      const { error: upErr } = await supabase
        .from("nudges")
        .update({
          last_event: "expired",
          last_event_at: nowIso,
          next_escalate_at: null,
        })
        .eq("id", r.id)
        .eq("status", "pending");

      if (!upErr) expired += 1;
      continue;
    }

    // 2) Auto escalate (only if next_escalate_at is set)
    if (!r.next_escalate_at) continue;

    const nextAt = new Date(r.next_escalate_at);
    if (now < nextAt) continue;

    const nextLevel = Math.min((r.escalation_level ?? 0) + 1, 10);
    const nextEscAt = computeNextEscalateAt(now, nextLevel);

    const { error: upErr } = await supabase
      .from("nudges")
      .update({
        escalation_level: nextLevel,
        last_event: "auto_escalate",
        last_event_at: nowIso,
        next_escalate_at: nextEscAt ? nextEscAt.toISOString() : null,
      })
      .eq("id", r.id)
      .eq("status", "pending");

    if (!upErr) escalated += 1;
  }

  return { ok: true, expired, escalated, checked: rows.length };
}
