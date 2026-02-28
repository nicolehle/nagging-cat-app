import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { getCatCopy } from "@/src/features/nudge/catCopy";
import { Emote } from "@/src/components/emote/Emote";
import { nagTheme as t } from "@/src/constants/theme";

const EMOTES = {
  hi: require("@/assets/images/emotes/nag-hi.png"),
  alert: require("@/assets/images/emotes/nag-alert.png"),
  sleep: require("@/assets/images/emotes/nag-sleep.png"),
  gift: require("@/assets/images/emotes/nag-gift.png"),
} as const;

type Props = {
  item: any;
  isSender: boolean;
  deviceName?: string | null;
  markDone: (id: string) => void;
  escalate: (id: string, level: number) => void;
  renewNudge: (id: string) => void;
};

export default function ChatBubble({
  item,
  isSender,
  deviceName,
  markDone,
  escalate,
  renewNudge,
}: Props) {
  const level = Number(item.escalation_level ?? 0);
  const isDone = item.status === "done";
  const isExpired = item.last_event === "expired";

  const fakeTask: any = {
    title: item.title,
    escalation: { level },
  };

  const event =
    item.status === "done" ? "done" : (item.last_event as any) || "created";

  const actor = event === "manual_escalate" ? "sender" : "system";

  const copy = getCatCopy(fakeTask, event, { actor, level });
  const line = `${copy.emoji} ${copy.body}`;

  return (
    <View
      style={[
        styles.wrap,
        { alignSelf: isSender ? "flex-end" : "flex-start" },
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSender ? styles.bubbleRight : styles.bubbleLeft,
        ]}
      >
        <View style={styles.headerRow}>
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
              triggerKey={`${item.last_event_at ?? item.created_at}-${level}`}
              size={36}
            />
          )}

          <Text style={styles.title}>
            {item.title} {isDone ? "✅" : ""}
          </Text>

          {!!item.created_at && (
            <Text style={styles.meta}>
              {/* keep your formatting elsewhere; this is just placeholder */}
            </Text>
          )}
        </View>

        <Text style={styles.bodyText}>{line}</Text>

        {!isDone && !isExpired && (
          <View style={styles.actionRow}>
            {!isSender && (
              <Pressable onPress={() => markDone(item.id)} style={styles.actionBtn}>
                <Text style={styles.actionText}>Done</Text>
              </Pressable>
            )}

            {isSender && (
              <Pressable onPress={() => escalate(item.id, level)} style={styles.actionBtn}>
                <Text style={styles.actionText}>Escalate 😼</Text>
              </Pressable>
            )}
          </View>
        )}

        {isExpired && isSender && (
          <View style={styles.actionRow}>
            <Pressable onPress={() => renewNudge(item.id)} style={styles.actionBtn}>
              <Text style={styles.actionText}>Renew 🔁</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },

  bubble: {
    width: "100%",
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.card,
  },

  // Indent like your Figma mock
  bubbleLeft: {
    marginRight: 16,
    borderLeftWidth: 3,
    borderLeftColor: t.colors.secondary,
  },

  bubbleRight: {
    marginLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: t.colors.primary,
    backgroundColor: t.colors.cardInner,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: t.fonts.semibold,
    color: t.colors.anchor,
  },

  meta: {
    fontSize: 12,
    fontFamily: t.fonts.regular,
    color: "rgba(64,60,61,0.45)",
  },

  bodyText: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: t.fonts.regular,
    color: "rgba(64,60,61,0.75)",
    lineHeight: 18,
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(64,60,61,0.12)",
    backgroundColor: "rgba(255,255,255,0.65)",
  },

  actionText: {
    fontFamily: t.fonts.semibold,
    color: t.colors.anchor,
  },
});