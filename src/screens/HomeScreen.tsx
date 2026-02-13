import { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, Modal, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { usePairing } from "@/src/features/nudge/hooks/usePairing";
import { useNudges } from "@/src/features/nudge/hooks/useNudges";
import { useNudgeTicker } from "@/src/features/nudge/hooks/useNudgeTicker";
import { nagTheme } from "@/src/constants/theme";

import ChatBubble from "@/src/features/nudge/components/ChatBubble";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function dayLabel(date: Date) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round(
    (startToday.getTime() - startThat.getTime()) / 86400000
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function HomeScreen() {
  const { pairId, deviceName } = usePairing();
  const { nudges, sendNudge, markDone, escalate, renewNudge } = useNudges(pairId, deviceName);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const isPaired = !!pairId;
  const t = nagTheme;

  function openComposer() {
      if (!isPaired) return; // or open pairing gate if you want
      setComposerOpen(true);
    }

    function closeComposer() {
      setComposerOpen(false);
      setDraftTitle("");
    }

    function onSend() {
      const title = draftTitle.trim();
      if (!title) return;
      sendNudge(title);
      closeComposer();
    }  
  
  useNudgeTicker(pairId);

  const rows = useMemo(() => {
    const now = Date.now();

    const live = (nudges ?? [])
      .filter((n) => {
        const ts = new Date(
          n.last_event_at ?? n.created_at
        ).getTime();
        return now - ts <= ONE_DAY_MS;
      })
      .sort((a, b) => {
        const ta = new Date(
          a.last_event_at ?? a.created_at
        ).getTime();
        const tb = new Date(
          b.last_event_at ?? b.created_at
        ).getTime();
        return ta - tb; // oldest first
      });

    const result: any[] = [];
    let lastLabel: string | null = null;

    for (const n of live) {
      const d = new Date(n.last_event_at ?? n.created_at);
      const label = dayLabel(d);

      if (label !== lastLabel) {
        result.push({
          type: "divider",
          id: `div-${label}-${d.toDateString()}`,
          label,
        });
        lastLabel = label;
      }

      result.push({
        type: "nudge",
        id: n.id,
        item: n,
      });
    }

    return result;
  }, [nudges]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: t.colors.ink, fontFamily: t.fonts.bold }]}>🐾 Live Drama</Text>
          <Text style={styles.subtitle}>Only the last 24 hours</Text>
        </View>

        <Pressable style={styles.gearBtn} onPress={() => router.push("/pairing")}>
          <Text style={styles.gearText}>⚙️</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        data={rows}
        keyExtractor={(r) => r.id}
        inverted={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>😼</Text>
            <Text style={styles.emptyTitle}>
              The house is quiet…
            </Text>
            <Text style={styles.emptyText}>
              Start the chaos.
            </Text>
          </View>
        }
        renderItem={({ item: row }) => {
          if (row.type === "divider") {
            return (
              <View style={styles.dividerWrap}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>
                  {row.label}
                </Text>
                <View style={styles.dividerLine} />
              </View>
            );
          }

          const item = row.item;
          const isSender =
            !!deviceName &&
            item.sender_device === deviceName;

          return (
            <View style={ styles.messageRow }>
              <View style={[styles.bubbleWrap, isSender ? styles.wrapRight : styles.wrapLeft]}>
                <ChatBubble
                  item={item}
                  isSender={isSender}
                  deviceName={deviceName}
                  markDone={markDone}
                  escalate={escalate}
                  renewNudge={renewNudge}
                />
              </View>
            </View>
          );
        }}
      />
      <Pressable style={styles.fab} onPress={openComposer}>
        <Text style={styles.fabText}>＋ Nudge 🐾</Text>
      </Pressable>
      
      <Modal
        visible={composerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeComposer}
      >
        <Pressable style={styles.backdrop} onPress={closeComposer} />

        <View style={styles.modalCenterWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🐾 Send a Nudge</Text>

            <Text style={styles.label}>Nudge</Text>
            <TextInput
              value={draftTitle}
              onChangeText={setDraftTitle}
              placeholder="Laundry"
              style={styles.input}
              autoFocus
              returnKeyType="send"
              onSubmitEditing={onSend}
            />

            <View style={{ marginTop: 12 }}>
              <Pressable style={styles.primaryBtn} onPress={onSend}>
                <Text style={styles.primaryBtnText}>Send 🐾</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  gearBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
gearText: { fontSize: 18 },

  title: {
    fontSize: 24,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 4,
    opacity: 0.6,
  },

  list: {
    flex: 1,
    paddingHorizontal: 16,
  },

  chatRow: {
    width: "100%",   
    marginVertical: 6,
    flexDirection: "row",
  },

  messageRow: {
    width: "100%",
    paddingVertical: 6,
  },

  bubbleWrap: {
    width: "80%",     // ✅ fixed bubble width for all messages
  },

  wrapLeft: {
    alignSelf: "flex-start",
  },

  wrapRight: {
    alignSelf: "flex-end",
  },

  rowLeft: {
    justifyContent: "flex-start",
  },

  rowRight: {
    justifyContent: "flex-end",
  },

  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
    alignSelf: "center",
    opacity: 0.7,
  },

  dividerLine: {
    height: 1,
    width: 60,
    backgroundColor: "#e5e7eb",
  },

  dividerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6b7280",
  },

  empty: {
    marginTop: 40,
    alignItems: "center",
    gap: 8,
  },

  emptyEmoji: {
    fontSize: 28,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  emptyText: {
    opacity: 0.6,
  },
  fab: {
  position: "absolute",
  right: 16,
  bottom: 20,
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#ddd",
  backgroundColor: "#fff",
},
fabText: { fontWeight: "900" },

backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },

modalCenterWrap: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
},
modalCard: {
  width: "100%",
  maxWidth: 520,
  borderRadius: 18,
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#eee",
  padding: 16,
},
modalTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },

label: { fontSize: 12, opacity: 0.7, marginBottom: 6 },
input: {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 10,
  backgroundColor: "#fff",
  fontSize: 14,
},

primaryBtn: {
  paddingVertical: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#ddd",
  alignItems: "center",
  backgroundColor: "#f3f3f3",
},
primaryBtnText: { fontWeight: "900" },
});
