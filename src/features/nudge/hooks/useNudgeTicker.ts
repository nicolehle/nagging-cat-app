// src/features/nudge/hooks/useNudgeTicker.ts
import { useEffect } from "react";
import { tickNudgesForPair } from "@/src/features/nudge/nudgeTick";

export function useNudgeTicker(pairId: string) {
  useEffect(() => {
    const p = pairId.trim();
    if (!p) return;

    tickNudgesForPair(p).then(() => {});

    const id = setInterval(() => {
      tickNudgesForPair(p).then(() => {});
    }, 30_000);

    return () => clearInterval(id);
  }, [pairId]);
}
