import { useCallback, useEffect, useState } from "react";

import {
  getCurrentLocalUserProfile,
  saveCurrentLocalUserName,
} from "@/src/features/pairing/localUser";
import { supabase } from "@/src/lib/supabase";

const AUTH_NOT_READY_MESSAGE = "Sign in before loading pairing.";

function isAuthNotReadyError(err: unknown) {
  return err instanceof Error && err.message === AUTH_NOT_READY_MESSAGE;
}

export function useProfileName() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    function applySession(userId: string | null) {
      setAuthUserId(userId);
      setAuthReady(true);

      if (!userId) {
        setName("");
        setLoading(false);
        setSaving(false);
        setError(null);
        setSuccess(null);
      }
    }

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;

        if (sessionError) {
          console.error("[profile] auth session check failed", sessionError);
          setError("Could not check sign-in status.");
        }

        applySession(data.session?.user?.id ?? null);
      })
      .catch((err) => {
        if (!active) return;

        console.error("[profile] auth session check failed", err);
        setError("Could not check sign-in status.");
        applySession(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      applySession(session?.user?.id ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!authReady || !authUserId) {
      setLoading(false);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await getCurrentLocalUserProfile();
      setName(profile.name);
      return profile;
    } catch (err) {
      if (isAuthNotReadyError(err)) {
        setError(null);
        return null;
      }

      setError(err instanceof Error ? err.message : "Could not load your profile name.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [authReady, authUserId]);

  useEffect(() => {
    if (!authReady || !authUserId) {
      return;
    }

    refresh();
  }, [authReady, authUserId, refresh]);

  const saveName = useCallback(async (nextName: string) => {
    if (!authReady || !authUserId) {
      setError(null);
      setSuccess(null);
      return null;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const profile = await saveCurrentLocalUserName(nextName);
      setName(profile.name);
      setSuccess("Name saved.");
      return profile;
    } catch (err) {
      if (isAuthNotReadyError(err)) {
        setError(null);
        return null;
      }

      setError(err instanceof Error ? err.message : "Could not save your name.");
      return null;
    } finally {
      setSaving(false);
    }
  }, [authReady, authUserId]);

  return {
    name,
    setName,
    loading,
    authReady,
    authUserId,
    saving,
    error,
    success,
    refresh,
    saveName,
  };
}
