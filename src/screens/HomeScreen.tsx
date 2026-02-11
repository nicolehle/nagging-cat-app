import { useMemo, useState } from "react";
import { Animated } from "react-native";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCatCopy } from "@/src/features/nudge/catCopy";
import { NudgeCard } from "@/src/features/nudge/NudgeCard";
import { usePairing } from "@/src/features/nudge/hooks/usePairing";
import { useNudges } from "@/src/features/nudge/hooks/useNudges";
import { useNudgeTicker } from "@/src/features/nudge/hooks/useNudgeTicker";
import { PairingPanel } from "@/src/features/nudge/components/PairingPanel";
import { Emote } from "@/src/components/emote/Emote";

const EMOTES = {
  hi: require("@/assets/images/emotes/nag-hi.png"),
  alert: require("@/assets/images/emotes/nag-alert.png"),
  sleep: require("@/assets/images/emotes/nag-sleep.png"),
  gift: require("@/assets/images/emotes/nag-gift.png"),
} as const;

export default function HomeScreen() {
  // Composer (modal) state
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  // const [draftNote, setDraftNote] = useState(""); // not used yet (optional)
  // const [draftEscalation, setDraftEscalation] = useState<"1d" | "3d" | "1w">("1d");

  // Pairing UI
  const [pairingOpen, setPairingOpen] = useState(false);

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

  const isPaired = !!pairId;

  const sorted = useMemo(() => {
    return [...(nudges ?? [])].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    );
  }, [nudges]);

  function openComposer() {
    if (!isPaired) {
      setPairingOpen(true);
      return;
    }
    setComposerOpen(true);
  }

  function closeComposer() {
    setComposerOpen(false);
    setDraftTitle("");
    // setDraftNote("");
    // setDraftEscalation("1d");
  }

  function onSend() {
    const title = draftTitle.trim();
    if (!title) return;

    // Keep your existing sendNudge API (currently just title)
    sendNudge(title);

    closeComposer();
  }

  // Split feed into sections
  // const sections = useMemo(
  //   () => [
  //     { key: "me", title: "From Me", data: fromMe },
  //     { key: "partner", title: "From Partner", data: fromPartner },
  //   ],
  //   [fromMe, fromPartner]
  // );

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>🐱 NagCat</Text>
        <Text style={styles.subtitle}>Cat-style nudges for couples</Text>
      </View>

      {/* Pair status bar (collapsed) */}
      <Pressable style={styles.pairBar} onPress={() => setPairingOpen((v) => !v)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pairTitle}>
            {isPaired ? "🧶 Connected" : "🔗 Not paired yet"}
          </Text>
          <Text style={styles.pairSub}>
            {isPaired ? `Pair ID: ${pairId}` : "Tap to create/join a pair"}
          </Text>
        </View>
        <Text style={styles.pairIcon}>{pairingOpen ? "▴" : "⚙️"}</Text>
      </Pressable>

      {/* Pairing panel (only visible when expanded) */}
      {pairingOpen && (
        <View style={styles.pairPanelWrap}>
          <PairingPanel
            pairId={pairId}
            pairLoading={pairLoading}
            inviteInput={inviteInput}
            setInviteInput={setInviteInput}
            createPair={createPair}
            joinPair={joinPair}
          />
        </View>
      )}

      {/* Feed */}
      <FlatList
        style={styles.list}
        data={sorted}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>😼</Text>
            <Text style={styles.emptyTitle}>
              The house is suspiciously quiet…
            </Text>
            <Text style={styles.emptyText}>
              Start the chaos.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={openComposer}>
              <Text style={styles.primaryBtnText}>＋ Nudge</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const isSender = !!deviceName && item.sender_device === deviceName;

          return (
            <View
              style={[
                styles.chatRow,
                isSender ? styles.rowRight : styles.rowLeft,
              ]}
            >
              <ChatBubble
                item={item}
                isSender={isSender}
                deviceName={deviceName}
                markDone={markDone}
                escalate={escalate}
              />
            </View>
          );
        }}
      />


      {/* FAB */}
      <Pressable style={styles.fab} onPress={openComposer}>
        <Text style={styles.fabText}>＋ Nudge 🐾</Text>
      </Pressable>

      {/* Composer Modal */}
      <Modal visible={composerOpen} transparent animationType="slide" onRequestClose={closeComposer}>
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

            {/* Optional note (not wired to DB yet) */}
            {/* <Text style={styles.label}>Optional note</Text>
            <TextInput
              value={draftNote}
              onChangeText={setDraftNote}
              placeholder="Before tonight please…"
              style={[styles.input, { height: 90 }]}
              multiline
            />

            <Text style={styles.label}>Escalation</Text>
            <View style={styles.pillsRow}>
              <Pill label="1 day" active={draftEscalation === "1d"} onPress={() => setDraftEscalation("1d")} />
              <Pill label="3 days" active={draftEscalation === "3d"} onPress={() => setDraftEscalation("3d")} />
              <Pill label="1 week" active={draftEscalation === "1w"} onPress={() => setDraftEscalation("1w")} />
            </View> */}

            <View style={styles.modalActions}>
              <Pressable style={styles.primaryBtn} onPress={closeComposer}>
                <Text style={styles.primaryBtnText}>Cancel</Text>
              </Pressable>
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

/* --------------------------- Reused row renderer --------------------------- */

function NudgeRow(props: any) {
  const { item, deviceName, markDone, escalate } = props;

  const fakeTask: any = { title: item.title, escalation: { level: item.escalation_level } };

  const event = item.status === "done" ? "done" : (item.last_event as any) || "created";
  const actor = event === "manual_escalate" ? "sender" : "system";

  const copy = getCatCopy(fakeTask, event, { actor, level: item.escalation_level });
  const line = `${copy.emoji} ${copy.body}`;

  const isDone = item.status === "done";
  const isExpired = item.last_event === "expired";
  const isSender = !!deviceName && item.sender_device === deviceName;

  return (
    <NudgeCard
      pulseKey={`${item.last_event_at ?? item.created_at}-${item.escalation_level}`}
      leftSlot={
        <Emote
          source={
            item.status === "done"
              ? EMOTES.gift
              : item.last_event === "manual_escalate" || item.last_event === "expired"
              ? EMOTES.alert
              : EMOTES.hi
          }
          anim={
            item.status === "done"
              ? "gift"
              : item.last_event === "manual_escalate" || item.last_event === "expired"
              ? "alert"
              : "hi"
          }
          triggerKey={`${item.last_event_at ?? item.created_at}-${item.escalation_level}`}
          size={46}
        />
      }
    >
      <Text style={{ fontSize: 16, fontWeight: "600" }}>
        {item.title} {isDone ? "✅" : ""}
      </Text>

      <Text style={{ marginTop: 6, opacity: 0.85 }}>{line}</Text>

      {!isDone && !isExpired && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <Pressable onPress={() => markDone(item.id)} style={styles.actionBtn}>
            <Text style={{ textAlign: "center" }}>Done</Text>
          </Pressable>

          {isSender && (
            <Pressable
              onPress={() => escalate(item.id, item.escalation_level)}
              style={styles.actionBtn}
            >
              <Text style={{ textAlign: "center" }}>Escalate 😼</Text>
            </Pressable>
          )}
        </View>
      )}
    </NudgeCard>
  );
}

function Pill(props: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.pill, props.active && styles.pillActive]}
    >
      <Text style={[styles.pillText, props.active && styles.pillTextActive]}>{props.label}</Text>
    </Pressable>
  );
}

function getEscalationStyle(level: number) {
  if (level >= 4) return styles.escalate4;
  if (level === 3) return styles.escalate3;
  if (level === 2) return styles.escalate2;
  if (level === 1) return styles.escalate1;
  return null;
}

function ChatBubble(props: any) {
  const { item, isSender, deviceName, markDone, escalate } = props;
  

  const fakeTask: any = { title: item.title, escalation: { level: item.escalation_level } };

  const event =
    item.status === "done"
      ? "done"
      : (item.last_event as any) || "created";

  const actor = event === "manual_escalate" ? "sender" : "system";

  const copy = getCatCopy(fakeTask, event, {
    actor,
    level: item.escalation_level,
  });

  const line = `${copy.emoji} ${copy.body}`;

  const isDone = item.status === "done";
  const isExpired = item.last_event === "expired";

  const level = Number(item.escalation_level ?? 0);
  const isManualEscalate = item.last_event === "manual_escalate";

  // Only apply escalation tint to RECEIVER bubbles
  const shouldTint = !isSender && level > 0 && !isDone;
  // level-4 glow only on receiver + not done
  const shouldGlow = !isSender && level >= 4 && !isDone;

  const pulse = useMemo(() => new Animated.Value(0), []);
  useMemo(() => {
    if (!shouldGlow) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 850, useNativeDriver: true }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [shouldGlow]);

  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] });
    return (
      <Animated.View
        style={[
          // keeps the bubble layout stable
          { transform: [{ scale: shouldGlow ? glowScale : 1 }] },
        ]}
      >
        {/* Glow layer behind bubble */}
        {shouldGlow && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glowHalo,
              { opacity: glowOpacity },
            ]}
          />
        )}
      <View
      style={[
        styles.chatBubble,
        isSender ? styles.bubbleRight : styles.bubbleLeft,
        shouldTint && getEscalationStyle(level),
        shouldGlow && styles.level4GlowBorder,
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {!isSender && (
            <Emote
              source={
                item.status === "done"
                  ? EMOTES.gift
                  : item.last_event === "manual_escalate" ||
                    item.last_event === "expired"
                  ? EMOTES.alert
                  : EMOTES.hi
              }
              anim={
                item.status === "done"
                  ? "gift"
                  : item.last_event === "manual_escalate" ||
                    item.last_event === "expired"
                  ? "alert"
                  : "hi"
              }
              triggerKey={`${item.last_event_at ?? item.created_at}-${item.escalation_level}`}
              size={36}
            />
          )}

          <Text style={{ fontSize: 16, fontWeight: "700" }}>
            {item.title} {isDone ? "✅" : ""}
          </Text>
        </View>

        <Text style={{ marginTop: 6, opacity: 0.9 }}>
          {line}
        </Text>

        {!isDone && !isExpired && (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            {!isSender && (
              <Pressable
                onPress={() => markDone(item.id)}
                style={styles.chatActionBtn}
              >
                <Text>Done</Text>
              </Pressable>
            )}

            {isSender && (
              <Pressable
                onPress={() =>
                  escalate(item.id, item.escalation_level)
                }
                style={styles.chatActionBtn}
              >
                <Text>Escalate 😼</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}


/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  brand: { fontSize: 26, fontWeight: "800" },
  subtitle: { marginTop: 6, opacity: 0.7 },

  pairBar: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pairTitle: { fontSize: 14, fontWeight: "700" },
  pairSub: { marginTop: 3, fontSize: 12, opacity: 0.65 },
  pairIcon: { fontSize: 18, opacity: 0.9 },

  pairPanelWrap: { paddingHorizontal: 16 },

  list: { flex: 1, paddingHorizontal: 16 },
  section: { paddingTop: 10, paddingBottom: 18 },
  sectionTitle: { fontSize: 13, fontWeight: "800", opacity: 0.7 },
  muted: { marginTop: 8, opacity: 0.55 },

  actionBtn: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ddd",
  },
    chatRow: {
    marginVertical: 6,
    flexDirection: "row",
  },

  rowLeft: {
    justifyContent: "flex-start",
  },

  rowRight: {
    justifyContent: "flex-end",
  },

  chatBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },

  bubbleLeft: {
    backgroundColor: "#fff",
    borderColor: "#eee",
  },

  bubbleRight: {
    backgroundColor: "#f3f3f3",
    borderColor: "#e6e6e6",
  },

  escalate1: {
    backgroundColor: "#fff7ed",   // very light warm
    borderColor: "#fed7aa",
  },

  escalate2: {
    backgroundColor: "#ffedd5",   // warmer
    borderColor: "#fdba74",
  },

  escalate3: {
    backgroundColor: "#ffe4e6",   // light pink tension
    borderColor: "#fda4af",
  },

  escalate4: {
    backgroundColor: "#fee2e2",   // stronger red hint
    borderColor: "#fb7185",
    borderWidth: 1.5,
  },

  glowHalo: {
  position: "absolute",
  left: -6,
  right: -6,
  top: -6,
  bottom: -6,
  borderRadius: 22,
  backgroundColor: "#fb7185", // matches level4 border vibe

  // iOS glow
  shadowColor: "#fb7185",
  shadowOpacity: 0.35,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 0 },

  // Android glow-ish
  elevation: 6,
  },

  level4GlowBorder: {
    borderWidth: 1.5,
  },

  chatActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
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
  fabText: { fontWeight: "800" },

  bubbleEscalated: {
    backgroundColor: "#fff4f4",
    borderColor: "#ffcaca",
    shadowColor: "#ff6b6b",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  empty: {
    marginTop: 22,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
    alignItems: "center",
    gap: 8,
  },
  emptyEmoji: { fontSize: 28 },
  emptyTitle: { fontSize: 16, fontWeight: "900" },
  emptyText: { fontSize: 13, opacity: 0.7, textAlign: "center" },

  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryBtnText: { fontWeight: "800" },

  // Modal
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
    gap: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", marginBottom: 4 },

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

  pillsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  pillActive: { backgroundColor: "#f3f3f3" },
  pillText: { fontWeight: "700", fontSize: 12, opacity: 0.8 },
  pillTextActive: { opacity: 1 },

  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 6 },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  secondaryBtnText: { fontWeight: "800" },
});
