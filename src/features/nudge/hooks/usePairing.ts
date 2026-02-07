// src/features/nudge/hooks/usePairing.ts
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { supabase } from "@/src/lib/supabase";
import { generateInviteCode } from "@/src/lib/inviteCode";
import { registerForPushAndSubscribeToPair } from "@/src/lib/push";

const PAIR_KEY = "nagcat_pair_id";
const DEVICE_KEY = "nagcat_device_name";

export function usePairing() {
  const [pairId, setPairId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [pairLoading, setPairLoading] = useState(false);

  // load saved pairId
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(PAIR_KEY);
      if (saved) setPairId(saved);
    })();
  }, []);

  // save pairId
  useEffect(() => {
    (async () => {
      const p = pairId.trim();
      if (p) await AsyncStorage.setItem(PAIR_KEY, p);
    })();
  }, [pairId]);

  // load device name
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(DEVICE_KEY);
      if (saved) setDeviceName(saved);
    })();
  }, []);

  async function createPair() {
    setPairLoading(true);

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateInviteCode();

      const { data, error } = await supabase
        .from("pairs")
        .insert({ invite_code: code })
        .select("id, invite_code")
        .single();

      if (!error && data) {
        const newPairId = data.id as string;
        setPairId(newPairId);

        // TODO: replace these hardcoded names later (settings screen)
        await AsyncStorage.setItem(DEVICE_KEY, "Nicole phone");
        setDeviceName("Nicole phone");

        registerForPushAndSubscribeToPair(newPairId, "Nicole phone").then(() => {});
        setPairLoading(false);
        Alert.alert("Pair created!", `Invite code: ${data.invite_code}`);
        return;
      }

      if (error && !String(error.message).toLowerCase().includes("duplicate")) {
        setPairLoading(false);
        Alert.alert("Create pair error", error.message);
        return;
      }
    }

    setPairLoading(false);
    Alert.alert("Try again", "Could not generate a unique invite code. Try again.");
  }

  async function joinPair() {
    const code = inviteInput.trim().toUpperCase();
    if (!code) return;

    setPairLoading(true);

    const { data, error } = await supabase
      .from("pairs")
      .select("id, invite_code")
      .eq("invite_code", code)
      .maybeSingle();

    if (error) {
      setPairLoading(false);
      Alert.alert("Join error", error.message);
      return;
    }

    if (!data) {
      setPairLoading(false);
      Alert.alert("Not found", "No pair found with that invite code.");
      return;
    }

    setPairId(data.id as string);

    // TODO: replace hardcoded names later
    await AsyncStorage.setItem(DEVICE_KEY, "Partner phone");
    setDeviceName("Partner phone");

    registerForPushAndSubscribeToPair(data.id as string, "Partner phone").then(() => {});
    setInviteInput("");
    setPairLoading(false);
    Alert.alert("Joined!", `Connected with ${code}`);
  }

  return {
    pairId,
    setPairId,
    deviceName,
    inviteInput,
    setInviteInput,
    pairLoading,
    createPair,
    joinPair,
  };
}
