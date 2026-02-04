import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase";
import { generateInviteCode } from "../../lib/inviteCode";
import { registerForPushAndSubscribeToPair } from "../../lib/push";
import { getCatCopy } from "@/lib/catCopy";
import { sendPushToPairExceptDevice } from "@/lib/push";

type NudgeRow = {
  id: string;
  title: string;
  status: "pending" | "done";
  escalation_level: number;
  created_at: string;
  sender_device: string | null;
};

const CAT_LINES = [
  "😽 pspsps… reminder time",
  "😼 I saw you remember it. Briefly.",
  "👀 Still observing.",
  "🐾 I’ll knock something off the table soon.",
  "💅 Anyway. The task remains.",
];

const PAIR_KEY = "nagcat_pair_id";
const DEVICE_KEY = "nagcat_device_name";

export default function HomeScreen() {
  const [pairId, setPairId] = useState("");
  const [title, setTitle] = useState("");
  const [nudges, setNudges] = useState<NudgeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteInput, setInviteInput] = useState("");
  const [pairLoading, setPairLoading] = useState(false);
  const [deviceName, setDeviceName] = useState("");

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

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(DEVICE_KEY);
      if (saved) setDeviceName(saved);
    })();
  }, []);

  async function load() {
    if (loading) return;

    const p = pairId.trim();
    if (!p) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("nudges")
      .select("id,title,status,escalation_level,created_at,sender_device")
      .eq("pair_id", p)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) return Alert.alert("Load error", error.message);
    setNudges((data ?? []) as NudgeRow[]);
  }

  useEffect(() => {
  const p = pairId.trim();
  if (!p) return;

  // Subscribe to ALL changes on nudges for this pair
  const channel = supabase
    .channel(`nudges:${p}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "nudges",
        filter: `pair_id=eq.${p}`,
      },
      () => {
        // simplest + reliable: re-fetch list
        load();
      }
    )
    .subscribe();

  // Cleanup on pair change/unmount
  return () => {
    supabase.removeChannel(channel);
  };
  // IMPORTANT: depend on pairId only (load is stable enough here)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [pairId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairId]);

  async function sendNudge() {
    const p = pairId.trim();
    const t = title.trim();
    if (!p) return Alert.alert("Pair ID missing", "Paste a pair_id first.");
    if (!t) return;

    const { error } = await supabase.from("nudges").insert({
      pair_id: p,
      title: t,
      status: "pending",
      escalation_level: 0,
      sender_device: deviceName || "Unknown device",
    });

    if (error) return Alert.alert("Create error", error.message);

    setTitle("");
    load();
  }

  async function markDone(id: string) {
    const { error } = await supabase
      .from("nudges")
      .update({ status: "done", done_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return Alert.alert("Update error", error.message);
    load();
  }

async function escalate(id: string, currentLevel: number) {
  const p = pairId.trim();
  if (!p) return;

  const next = Math.min(currentLevel + 1, 10);

  const row = nudges.find((n) => n.id === id);
  if (!row) return;

  // Only sender can escalate
  if (!deviceName || row.sender_device !== deviceName) return;

  const { error } = await supabase
    .from("nudges")
    .update({ escalation_level: next })
    .eq("id", id);

  if (error) return Alert.alert("Escalate error", error.message);

  // Build push copy for User B
  const fakeTask: any = { title: row.title, escalation: { level: next } };
  const payload = getCatCopy(fakeTask, "manual_escalate", {
    actor: "sender",
    level: next,
  });

  // Push to everyone else in the pair
  await sendPushToPairExceptDevice({
    pairId: p,
    exceptDeviceLabel: deviceName, // (Nicole phone / Partner phone)
    title: `${payload.emoji} ${payload.title}`,
    body: payload.body,
  });

  load();
}

  async function createPair() {
  setPairLoading(true);

  // Retry a few times in case invite_code collides with the unique index
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
      await AsyncStorage.setItem(DEVICE_KEY, "Nicole phone");
      setDeviceName("Nicole phone");
      // SAFE: won’t crash in Expo Go; just returns ok:false
      registerForPushAndSubscribeToPair(newPairId, "Nicole phone").then(() => {});
      setPairLoading(false);
      Alert.alert("Pair created!", `Invite code: ${data.invite_code}`);
      // Load nudges for this pair (will be empty at first)
      return;
    }

    // If collision, try again; otherwise fail
    if (error && !String(error.message).toLowerCase().includes("duplicate")) {
      setPairLoading(false);
      return Alert.alert("Create pair error", error.message);
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
    return Alert.alert("Join error", error.message);
  }

  if (!data) {
    setPairLoading(false);
    return Alert.alert("Not found", "No pair found with that invite code.");
  }

  setPairId(data.id as string);
  await AsyncStorage.setItem(DEVICE_KEY, "Partner phone");
  setDeviceName("Partner phone");
  registerForPushAndSubscribeToPair(data.id as string, "Partner phone").then(() => {});
  setInviteInput("");
  setPairLoading(false);
  Alert.alert("Joined!", `Connected with ${code}`);
}

  const sorted = useMemo(() => nudges, [nudges]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "700" }}>😼 NagCat</Text>
        <Text style={{ marginTop: 6, opacity: 0.7 }}>Cat-style nudges for couples</Text>

        {/* ✅ Pair ID section */}
        <View style={{ marginTop: 16, padding: 12, borderWidth: 1, borderRadius: 12, borderColor: "#eee" }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Pairing</Text>
          <Text style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
            Create a pair to get an invite code, or join with your partner’s code.
          </Text>

          {/* Create Pair */}
          <Pressable
            onPress={createPair}
            disabled={pairLoading}
            style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 10, borderColor: "#ddd", opacity: pairLoading ? 0.6 : 1 }}
          >
            <Text style={{ textAlign: "center" }}>{pairLoading ? "Creating..." : "Create Pair 😼"}</Text>
          </Pressable>

          {/* Show current pair */}
          {!!pairId && (
            <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10, borderColor: "#eee" }}>
              <Text style={{ fontSize: 12, opacity: 0.7 }}>Connected Pair</Text>
              <Text style={{ fontFamily: "monospace" }}>{pairId}</Text>
              <Text style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                Share the invite code shown after creation (or re-open Supabase to see it for now).
              </Text>
            </View>
          )}

          {/* Join Pair */}
          <Text style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>Join with invite code</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <TextInput
              value={inviteInput}
              onChangeText={setInviteInput}
              placeholder="CAT-7421"
              autoCapitalize="characters"
              style={{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 10, borderColor: "#ddd" }}
            />
            <Pressable
              onPress={joinPair}
              disabled={pairLoading}
              style={{ paddingHorizontal: 14, justifyContent: "center", borderWidth: 1, borderRadius: 10, borderColor: "#ddd", opacity: pairLoading ? 0.6 : 1 }}
            >
              <Text>Join</Text>
            </Pressable>
          </View>
        </View>


        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Add a nudge… (Laundry)"
            style={{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 10, borderColor: "#ddd" }}
            returnKeyType="send"
            onSubmitEditing={sendNudge}
          />
          <Pressable
            onPress={sendNudge}
            style={{
              paddingHorizontal: 14,
              justifyContent: "center",
              borderWidth: 1,
              borderRadius: 10,
              borderColor: "#ddd",
            }}
          >
            <Text>Send 🐾</Text>
          </Pressable>
        </View>

        <FlatList
          style={{ marginTop: 16 }}
          data={sorted}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={<Text style={{ opacity: 0.7 }}>No nudges yet.</Text>}
          renderItem={({ item }) => {
           const fakeTask: any = {
              title: item.title,
              escalation: { level: item.escalation_level },
            };

            const event =
              item.status === "done"
                ? "done"
                : item.escalation_level > 0
                  ? "manual_escalate"
                  : "created";

            const actor = item.escalation_level > 0 ? "sender" : "system";

            const copy = getCatCopy(fakeTask, event as any, {
              actor: actor as any,
              level: item.escalation_level,
            });

            const line = `${copy.emoji} ${copy.body}`;
            const isDone = item.status === "done";
            const isSender = !!deviceName && item.sender_device === deviceName;

            return (
              <View
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 12,
                  borderColor: "#eee",
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.title} {isDone ? "✅" : ""}
                </Text>

                <Text style={{ marginTop: 6, opacity: 0.85 }}>{line}</Text>

                {!isDone && (
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  <Pressable
                    onPress={() => markDone(item.id)}
                    style={{ flex: 1, padding: 10, borderWidth: 1, borderRadius: 10, borderColor: "#ddd" }}
                  >
                    <Text style={{ textAlign: "center" }}>Done</Text>
                  </Pressable>

                  {isSender && (
                    <Pressable
                      onPress={() => escalate(item.id, item.escalation_level)}
                      style={{ flex: 1, padding: 10, borderWidth: 1, borderRadius: 10, borderColor: "#ddd" }}
                    >
                      <Text style={{ textAlign: "center" }}>Escalate 😼</Text>
                    </Pressable>
                  )}
                </View>
                )}
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
