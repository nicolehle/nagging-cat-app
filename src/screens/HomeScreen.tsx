// src/screens/HomeScreen.tsx
import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCatCopy } from "@/src/features/nudge/catCopy";
import { NudgeCard } from "@/src/features/nudge/NudgeCard";
import { usePairing } from "@/src/features/nudge/hooks/usePairing";
import { useNudges } from "@/src/features/nudge/hooks/useNudges";
import { useNudgeTicker } from "@/src/features/nudge/hooks/useNudgeTicker";
import { PairingPanel } from "@/src/features/nudge/components/PairingPanel";

export default function HomeScreen() {
  const [title, setTitle] = useState("");

  const {
    pairId,
    deviceName,
    inviteInput,
    setInviteInput,
    pairLoading,
    createPair,
    joinPair,
  } = usePairing();

  const { nudges, sendNudge, markDone, escalate } = useNudges(pairId, deviceName);

  useNudgeTicker(pairId);

  const sorted = useMemo(() => nudges, [nudges]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "700" }}>😼 NagCat</Text>
        <Text style={{ marginTop: 6, opacity: 0.7 }}>Cat-style nudges for couples</Text>

        <PairingPanel
          pairId={pairId}
          pairLoading={pairLoading}
          inviteInput={inviteInput}
          setInviteInput={setInviteInput}
          createPair={createPair}
          joinPair={joinPair}
        />

        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Add a nudge… (Laundry)"
            style={{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 10, borderColor: "#ddd" }}
            returnKeyType="send"
            onSubmitEditing={() => {
              sendNudge(title);
              setTitle("");
            }}
          />
          <Pressable
            onPress={() => {
              sendNudge(title);
              setTitle("");
            }}
            style={{ paddingHorizontal: 14, justifyContent: "center", borderWidth: 1, borderRadius: 10, borderColor: "#ddd" }}
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
            const fakeTask: any = { title: item.title, escalation: { level: item.escalation_level } };

            const event = item.status === "done" ? "done" : (item.last_event as any) || "created";
            const actor = event === "manual_escalate" ? "sender" : "system";

            const copy = getCatCopy(fakeTask, event, { actor, level: item.escalation_level });

            const line = `${copy.emoji} ${copy.body}`;
            const isDone = item.status === "done";
            const isExpired = item.last_event === "expired";
            const isSender = !!deviceName && item.sender_device === deviceName;

            return (
              <NudgeCard pulseKey={`${item.last_event_at ?? item.created_at}-${item.escalation_level}`}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.title} {isDone ? "✅" : ""}
                </Text>

                <Text style={{ marginTop: 6, opacity: 0.85 }}>{line}</Text>

                {!isDone && !isExpired && (
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
              </NudgeCard>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
