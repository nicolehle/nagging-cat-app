import { useCallback, useEffect, useState } from "react";

import {
  createInvitePair,
  disconnectCurrentUser,
  joinPairByInviteCode,
  refreshPairingState,
  type PairingState,
} from "@/src/features/pairing/service";

type PairingAction = "create" | "join" | "disconnect" | null;

export function usePairing() {
  const [pairing, setPairing] = useState<PairingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<PairingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextPairing = await refreshPairingState();
      setPairing(nextPairing);
      return nextPairing;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pairing.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createInvite = useCallback(async () => {
    setActionLoading("create");
    setError(null);
    setSuccess(null);

    try {
      const nextPairing = await createInvitePair();
      setPairing(nextPairing);
      setSuccess("Invite code ready to share.");
      return nextPairing;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create an invite code.");
      return null;
    } finally {
      setActionLoading(null);
    }
  }, []);

  const joinByCode = useCallback(async (inviteCode: string) => {
    setActionLoading("join");
    setError(null);
    setSuccess(null);

    try {
      await joinPairByInviteCode(inviteCode);
      const refreshed = await refreshPairingState();
      setPairing(refreshed);
      setSuccess("Partner connected.");
      return refreshed;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join that invite code.");
      return null;
    } finally {
      setActionLoading(null);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setActionLoading("disconnect");
    setError(null);
    setSuccess(null);

    try {
      const nextPairing = await disconnectCurrentUser();
      setPairing(nextPairing);
      setSuccess("Disconnected successfully.");
      return nextPairing;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not disconnect.");
      return null;
    } finally {
      setActionLoading(null);
    }
  }, []);

  return {
    pairing,
    loading,
    actionLoading,
    error,
    success,
    refresh,
    createInvite,
    joinByCode,
    disconnect,
  };
}
