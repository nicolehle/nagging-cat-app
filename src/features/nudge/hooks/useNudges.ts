// src/features/nudge/hooks/useNudges.ts
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "@/src/lib/supabase";
import { computeExpiresAt, computeNextEscalateAt } from "@/src/features/nudge/nudgePolicy";
import { getCatCopy } from "@/src/features/nudge/catCopy";
import { sendPushToPairExceptDevice } from "@/src/lib/push";
import { hapticLight, hapticMedium } from "@/src/lib/feedback";

export type NudgeRow = {
  id: string;
  title: string;
  status: "pending" | "done";
  escalation_level: number;
  created_at: string;
  sender_device: string | null;
  last_event: string | null;
  last_event_at: string | null;
};

export function useNudges(pairId: string, deviceName: string) {
  const [nudges, setNudges] = useState<NudgeRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (loading) return;
    const p = pairId.trim();
    if (!p) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("nudges")
      .select("id,title,status,escalation_level,created_at,sender_device,last_event,last_event_at")
      .eq("pair_id", p)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      Alert.alert("Load error", error.message);
      return;
    }
    setNudges((data ?? []) as NudgeRow[]);
  }, [pairId, loading]);

  // initial load
  useEffect(() => {
    load();
  }, [load]);

  // realtime subscribe
  useEffect(() => {
    const p = pairId.trim();
    if (!p) return;

    const channel = supabase
      .channel(`nudges:${p}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "nudges", filter: `pair_id=eq.${p}` },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pairId, load]);

  const sendNudge = useCallback(
    async (title: string) => {
      const p = pairId.trim();
      const t = title.trim();
      if (!p) return Alert.alert("Pair ID missing", "Paste a pair_id first.");
      if (!t) return;

      const now = new Date();
      const expiresAt = computeExpiresAt(now);
      const nextEscAt = computeNextEscalateAt(now, 0);

      const { error } = await supabase.from("nudges").insert({
        pair_id: p,
        title: t,
        status: "pending",
        escalation_level: 0,
        sender_device: deviceName || "Unknown device",
        last_event: "created",
        last_event_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        next_escalate_at: nextEscAt ? nextEscAt.toISOString() : null,
      });

      if (error) return Alert.alert("Create error", error.message);
      load();
    },
    [pairId, deviceName, load]
  );

  const markDone = useCallback(
    async (id: string) => {
      hapticLight();
      const { error } = await supabase
        .from("nudges")
        .update({
          status: "done",
          done_at: new Date().toISOString(),
          last_event: "done",
          last_event_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) return Alert.alert("Update error", error.message);
      load();
    },
    [load]
  );

  const escalate = useCallback(
    async (id: string, currentLevel: number) => {
      hapticMedium();

      const p = pairId.trim();
      if (!p) return;

      const row = nudges.find((n) => n.id === id);
      if (!row) return;

      // sender-only rule
      if (!deviceName || row.sender_device !== deviceName) return;

      const next = Math.min(currentLevel + 1, 10);
      const nowIso = new Date().toISOString();

      const { error } = await supabase
        .from("nudges")
        .update({
          escalation_level: next,
          last_event: "manual_escalate",
          last_event_at: nowIso,
        })
        .eq("id", id);

      if (error) {
        Alert.alert("Escalate error", error.message);
        return;
      }

      const fakeTask: any = { title: row.title, escalation: { level: next } };
      const payload = getCatCopy(fakeTask, "manual_escalate", { actor: "sender", level: next });

      await sendPushToPairExceptDevice({
        pairId: p,
        exceptDeviceLabel: deviceName,
        title: `${payload.emoji} ${payload.title}`,
        body: payload.body,
      });

      load();
    },
    [pairId, nudges, deviceName, load]
  );

  return { nudges, loading, load, sendNudge, markDone, escalate };
}
