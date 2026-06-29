import { useCallback, useEffect, useState } from "react";

import {
  createQuickNudge,
  loadQuickNudges,
  QuickNudge,
  saveQuickNudges,
} from "@/src/features/nudges/quickNudges";

export function useQuickNudges() {
  const [quickNudges, setQuickNudges] = useState<QuickNudge[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setQuickNudges(await loadQuickNudges());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addQuickNudge = useCallback(async (title: string, emoji?: string) => {
    const trimmed = title.trim();
    if (!trimmed) return { ok: false, error: "Enter a quick nudge title." };

    const duplicate = quickNudges.some(
      (item) => item.title.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) return { ok: false, error: "That quick nudge already exists." };

    const next = [...quickNudges, createQuickNudge(trimmed, emoji)];
    setQuickNudges(next);
    await saveQuickNudges(next);
    return { ok: true, error: "" };
  }, [quickNudges]);

  const removeQuickNudge = useCallback(async (id: string) => {
    const next = quickNudges.filter((item) => item.id !== id);
    setQuickNudges(next);
    await saveQuickNudges(next);
  }, [quickNudges]);

  return {
    quickNudges,
    loading,
    reload,
    addQuickNudge,
    removeQuickNudge,
  };
}
