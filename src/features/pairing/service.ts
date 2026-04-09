import AsyncStorage from "@react-native-async-storage/async-storage";

import { getCurrentLocalUserId } from "@/src/features/pairing/localUser";
import { generateInviteCode } from "@/src/lib/inviteCode";
import { supabase } from "@/src/lib/supabase";
import { PAIR_ID_STORAGE_KEY } from "@/src/features/nudges/session";

type PairRow = {
  id: string;
  invite_code: string | null;
  user_a_id: string | null;
  user_b_id: string | null;
};

export type PairingState = {
  status: "unpaired" | "pending" | "paired";
  pairId: string | null;
  inviteCode: string | null;
  meId: string;
  partnerUserId: string | null;
};

const PAIR_SELECT = "id,invite_code,user_a_id,user_b_id";

function logPairing(message: string, extra?: Record<string, unknown>) {
  console.log(`[pairing] ${message}`, extra ?? {});
}

function logPairingError(message: string, error: unknown, extra?: Record<string, unknown>) {
  console.error(`[pairing] ${message}`, {
    ...extra,
    error: error instanceof Error ? error.message : String(error),
  });
}

function isNonEmptyInviteCode(inviteCode: string | null | undefined): inviteCode is string {
  return Boolean(inviteCode?.trim());
}

async function getCurrentUserId() {
  return getCurrentLocalUserId();
}

async function cachePairId(pairId: string | null) {
  if (pairId) {
    await AsyncStorage.setItem(PAIR_ID_STORAGE_KEY, pairId);
    return;
  }

  await AsyncStorage.removeItem(PAIR_ID_STORAGE_KEY);
}

async function findPairsForUser(userId: string) {
  const { data, error } = await supabase
    .from("pairs")
    .select(PAIR_SELECT)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

  if (error) throw error;

  return (data ?? []) as PairRow[];
}

function toPairingState(row: PairRow | null, meId: string): PairingState {
  if (!row) {
    return {
      status: "unpaired",
      pairId: null,
      inviteCode: null,
      meId,
      partnerUserId: null,
    };
  }

  const partnerUserId = row.user_a_id === meId ? row.user_b_id : row.user_a_id;

  return {
    status: partnerUserId ? "paired" : "pending",
    pairId: row.id,
    inviteCode: partnerUserId ? null : row.invite_code?.trim() || null,
    meId,
    partnerUserId,
  };
}

async function getCurrentPairRow(userId: string) {
  const rows = await findPairsForUser(userId);

  if (rows.length > 1) {
    throw new Error("Multiple pair rows found for this user. Check the pairs table constraints.");
  }

  return rows[0] ?? null;
}

async function updatePairInviteCode(pairId: string, inviteCode: string) {
  const { data, error } = await supabase
    .from("pairs")
    .update({ invite_code: inviteCode })
    .eq("id", pairId)
    .select(PAIR_SELECT)
    .single();

  if (error) throw error;
  return data as PairRow;
}

async function ensureInviteCode(pair: PairRow) {
  if (isNonEmptyInviteCode(pair.invite_code)) {
    return pair;
  }

  logPairing("existing pair row missing invite code, generating one", { pairId: pair.id });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inviteCode = generateInviteCode().trim().toUpperCase();
    if (!inviteCode) continue;

    try {
      return await updatePairInviteCode(pair.id, inviteCode);
    } catch (error) {
      const message = String((error as { message?: string } | null)?.message ?? "").toLowerCase();
      if (!message.includes("duplicate")) {
        throw error;
      }
    }
  }

  throw new Error("Could not generate a unique invite code for the existing pair.");
}

async function clearUserSlot(pair: PairRow, userId: string) {
  const update: Partial<PairRow> = {
    invite_code: null,
  };

  if (pair.user_a_id === userId) {
    update.user_a_id = null;
  }

  if (pair.user_b_id === userId) {
    update.user_b_id = null;
  }

  if (!("user_a_id" in update) && !("user_b_id" in update)) {
    return;
  }

  const { error } = await supabase.from("pairs").update(update).eq("id", pair.id);
  if (error) throw error;
}

export async function refreshPairingState() {
  try {
    const meId = await getCurrentUserId();
    const pair = await getCurrentPairRow(meId);
    await cachePairId(pair?.id ?? null);
    logPairing("pairing state refreshed", {
      meId,
      pairId: pair?.id ?? null,
      hasInviteCode: isNonEmptyInviteCode(pair?.invite_code),
    });
    return toPairingState(pair, meId);
  } catch (error) {
    logPairingError("failed to refresh pairing state", error);
    throw error;
  }
}

export async function createInvitePair() {
  try {
    const meId = await getCurrentUserId();
    const existingPair = await getCurrentPairRow(meId);

    if (existingPair) {
      logPairing("reusing existing pair row for create code", {
        meId,
        pairId: existingPair.id,
      });
      const pairWithCode = await ensureInviteCode(existingPair);
      await cachePairId(pairWithCode.id);
      return await refreshPairingState();
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const inviteCode = generateInviteCode().trim().toUpperCase();
      if (!inviteCode) continue;

      const { data, error } = await supabase
        .from("pairs")
        .insert({
          invite_code: inviteCode,
          user_a_id: meId,
          user_b_id: null,
        })
        .select(PAIR_SELECT)
        .single();

      if (!error && data) {
        const pair = data as PairRow;
        logPairing("created new pair row for invite code", {
          meId,
          pairId: pair.id,
          inviteCode: pair.invite_code,
        });
        await cachePairId(pair.id);
        return await refreshPairingState();
      }

      const message = String(error?.message ?? "").toLowerCase();
      if (!message.includes("duplicate")) {
        throw error;
      }
    }

    throw new Error("Could not create a unique invite code. Please try again.");
  } catch (error) {
    logPairingError("failed to create or reuse invite code", error);
    throw error;
  }
}

export async function joinPairByInviteCode(rawInviteCode: string) {
  const inviteCode = rawInviteCode.trim().toUpperCase();
  if (!inviteCode) {
    throw new Error("Enter an invite code first.");
  }

  const meId = await getCurrentUserId();
  const currentPair = await getCurrentPairRow(meId);
  const currentPartnerId =
    currentPair?.user_a_id === meId ? currentPair.user_b_id : currentPair?.user_a_id;

  if (currentPartnerId) {
    throw new Error("You are already paired. Disconnect before joining another invite code.");
  }

  const { data, error } = await supabase
    .from("pairs")
    .select(PAIR_SELECT)
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (error) throw error;

  const targetPair = data as PairRow | null;
  if (!targetPair) {
    throw new Error("No pair was found for that invite code.");
  }

  if (targetPair.user_a_id === meId || targetPair.user_b_id === meId) {
    throw new Error("You can’t pair with your own invite code.");
  }

  if (targetPair.user_a_id && targetPair.user_b_id) {
    throw new Error("That invite code is already connected to two users.");
  }

  if (currentPair) {
    await clearUserSlot(currentPair, meId);
  }

  const update =
    targetPair.user_a_id == null
      ? { user_a_id: meId, invite_code: null }
      : { user_b_id: meId, invite_code: null };

  const { data: updatedPair, error: updateError } = await supabase
    .from("pairs")
    .update(update)
    .eq("id", targetPair.id)
    .select(PAIR_SELECT)
    .single();

  if (updateError) throw updateError;

  const pair = updatedPair as PairRow;
  await cachePairId(pair.id);
  return refreshPairingState();
}

export async function disconnectCurrentUser() {
  const meId = await getCurrentUserId();
  const pair = await getCurrentPairRow(meId);

  if (!pair) {
    await cachePairId(null);
    return toPairingState(null, meId);
  }

  await clearUserSlot(pair, meId);
  await cachePairId(null);

  return refreshPairingState();
}
