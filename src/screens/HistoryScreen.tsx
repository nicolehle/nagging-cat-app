import { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePairing } from "@/src/features/nudge/hooks/usePairing";
import { useNudges } from "@/src/features/nudge/hooks/useNudges";
import { useNudgeTicker } from "@/src/features/nudge/hooks/useNudgeTicker";
import { nagTheme } from "@/src/constants/theme";

// Reuse your ChatBubble component by importing it if you moved it out,
// OR copy the same ChatBubble you already have into this file.
import ChatBubble from "@/src/features/nudge/components/ChatBubble"; // <- if you extracted it

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function HistoryScreen() {
  const [showExpired, setShowExpired] = useState(true);

  const { pairId, deviceName } = usePairing();
  const { nudges, markDone, escalate } = useNudges(pairId, deviceName);
  const t = nagTheme;

  useNudgeTicker(pairId);

  const history = useMemo(() => {
    const now = Date.now();
    const list = nudges ?? [];

    return [...list]
      .filter((n) => {
        const ts = new Date(n.last_event_at ?? n.created_at).getTime();
        const isOld = now - ts > ONE_DAY_MS;
        if (!isOld) return false;

        if (!showExpired && n.last_event === "expired") return false;
        return true;
      })
      .sort((a, b) => {
        const ta = new Date(a.last_event_at ?? a.created_at).getTime();
        const tb = new Date(b.last_event_at ?? b.created_at).getTime();
        return tb - ta;
      });
  }, [nudges, showExpired]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.colors.ink, fontFamily: t.fonts.bold }]}>📜 History</Text>
        <Text style={styles.sub}>Older than 24 hours</Text>

        <Pressable style={styles.toggle} onPress={() => setShowExpired((v) => !v)}>
          <Text style={styles.toggleText}>
            {showExpired ? "Hide expired" : "Show expired"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={history}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
        ListEmptyComponent={
          <Text style={{ opacity: 0.6, paddingTop: 12 }}>
            No history yet.
          </Text>
        }
        renderItem={({ item }) => {
          const isSender = !!deviceName && item.sender_device === deviceName;

          return (
            <View style={{ marginBottom: 12, alignItems: isSender ? "flex-end" : "flex-start" }}>
              <ChatBubble
                item={item}
                isSender={isSender}
                deviceName={deviceName}
                markDone={markDone}
                escalate={escalate}
              />
              <Text style={styles.meta}>
                {new Date(item.last_event_at ?? item.created_at).toLocaleString()}
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  title: { fontSize: 22, fontWeight: "900" },
  sub: { marginTop: 4, opacity: 0.65 },
  toggle: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  toggleText: { fontWeight: "800" },
  meta: { marginTop: 6, fontSize: 11, opacity: 0.5 },
});
