import { useCallback, useEffect, useState } from "react";

import {
  createInvitePair,
  disconnectCurrentUser,
  joinPairByInviteCode,
  refreshPairingState,
  type PairingState,
} from "@/src/features/pairing/service";
import { getOrCreateAuthSession } from "@/src/lib/authSession";
import { supabase } from "@/src/lib/supabase";

type PairingAction = "create" | "join" | "disconnect" | null;

export function usePairing() {
  const [pairing, setPairing] = useState<PairingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<PairingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getOrCreateAuthSession()
      .then((session) => {
        if (!active) return;

        const userId = session.user.id;
        setAuthUserId(userId);
        setAuthReady(true);
      })
      .catch((err) => {
        if (!active) return;

        console.error("[pairing] auth session check failed", err);
        setError("Could not check sign-in status.");
        setAuthUserId(null);
        setAuthReady(true);
        setPairing(null);
        setLoading(false);
        setSuccess(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      setAuthUserId(session?.user?.id ?? null);
      setAuthReady(true);

      if (!session?.user?.id) {
        setPairing(null);
        setLoading(false);
        setError(null);
        setSuccess(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const canRunPairingRequest = useCallback(() => {
    if (!authReady) {
      return false;
    }

    if (!authUserId) {
      setPairing(null);
      setLoading(false);
      setError(null);
      return false;
    }

    return true;
  }, [authReady, authUserId]);

  const refresh = useCallback(async () => {
    if (!canRunPairingRequest() || !authUserId) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const nextPairing = await refreshPairingState(authUserId);
      setPairing(nextPairing);
      return nextPairing;
    } catch (err) {
      console.error("[pairing] refresh hook failed", err);
      setError(err instanceof Error ? err.message : "Could not load pairing.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [authUserId, canRunPairingRequest]);

  useEffect(() => {
    if (!authReady || !authUserId) {
      return;
    }

    refresh();
  }, [authReady, authUserId, refresh]);

  const createInvite = useCallback(async () => {
    if (!canRunPairingRequest() || !authUserId) {
      return null;
    }

    setActionLoading("create");
    setError(null);
    setSuccess(null);

    try {
      const nextPairing = await createInvitePair(authUserId);
      setPairing(nextPairing);
      setSuccess(
        nextPairing?.inviteCode
          ? "Invite code ready to share."
          : "Pair row found, but invite code is still missing."
      );
      return nextPairing;
    } catch (err) {
      console.error("[pairing] create invite hook failed", err);
      setError(err instanceof Error ? err.message : "Could not create an invite code.");
      return null;
    } finally {
      setActionLoading(null);
    }
  }, [authUserId, canRunPairingRequest]);

  const joinByCode = useCallback(async (inviteCode: string) => {
    if (!canRunPairingRequest() || !authUserId) {
      return null;
    }

    setActionLoading("join");
    setError(null);
    setSuccess(null);

    try {
      const refreshed = await joinPairByInviteCode(authUserId, inviteCode);
      setPairing(refreshed);
      setSuccess("Partner connected.");
      return refreshed;
    } catch (err) {
      console.error("[pairing] join hook failed", err);
      setError(err instanceof Error ? err.message : "Could not join that invite code.");
      return null;
    } finally {
      setActionLoading(null);
    }
  }, [authUserId, canRunPairingRequest]);

  const disconnect = useCallback(async () => {
    if (!canRunPairingRequest() || !authUserId) {
      return null;
    }

    setActionLoading("disconnect");
    setError(null);
    setSuccess(null);

    try {
      const nextPairing = await disconnectCurrentUser(authUserId);
      setPairing(nextPairing);
      setSuccess("Disconnected successfully.");
      return nextPairing;
    } catch (err) {
      console.error("[pairing] disconnect hook failed", err);
      setError(err instanceof Error ? err.message : "Could not disconnect.");
      return null;
    } finally {
      setActionLoading(null);
    }
  }, [authUserId, canRunPairingRequest]);

  return {
    pairing,
    loading,
    authReady,
    authUserId,
    actionLoading,
    error,
    success,
    refresh,
    createInvite,
    joinByCode,
    disconnect,
  };
}
