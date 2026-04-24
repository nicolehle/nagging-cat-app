import { useCallback, useEffect, useState } from "react";

import {
  getCurrentLocalUserProfile,
  saveCurrentLocalUserName,
} from "@/src/features/pairing/localUser";

export function useProfileName() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const profile = await getCurrentLocalUserProfile();
      setName(profile.name);
      return profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your profile name.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveName = useCallback(async (nextName: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const profile = await saveCurrentLocalUserName(nextName);
      setName(profile.name);
      setSuccess("Name saved.");
      return profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your name.");
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    name,
    setName,
    loading,
    saving,
    error,
    success,
    refresh,
    saveName,
  };
}
