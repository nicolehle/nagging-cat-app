import { useEffect, useRef } from "react";

import { supabase } from "@/src/lib/supabase";

const REALTIME_REFRESH_DELAY_MS = 150;

export function useNudgeRealtime(pairId: string | null, onChange: () => void | Promise<void>) {
  const onChangeRef = useRef(onChange);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!pairId) {
      return;
    }

    const scheduleRefresh = () => {
      if (timerRef.current) {
        return;
      }

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        void onChangeRef.current();
      }, REALTIME_REFRESH_DELAY_MS);
    };

    const channel = supabase
      .channel(`nudges:${pairId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "nudges", filter: `pair_id=eq.${pairId}` },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "nudges", filter: `pair_id=eq.${pairId}` },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      void supabase.removeChannel(channel);
    };
  }, [pairId]);
}
