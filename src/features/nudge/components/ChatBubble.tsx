import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { getCatCopy } from "@/src/features/nudge/catCopy";
import { Emote } from "@/src/components/emote/Emote";

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
    item.status === "done"
      ? "done"
      : (item.last_event as any) || "created";

  const actor = event === "manual_escalate" ? "sender" : "system";

  const copy = getCatCopy(fakeTask, event, {
    actor,
    level,
  });

  const line = `${copy.emoji} ${copy.body}`;

  const shouldTint = !isSender && level > 0 && !isDone;
  const shouldGlow = !isSender && level >= 4 && !isDone;

  const pulse = useMemo(() => new Animated.Value(0), []);

  useMemo(() => {
    if (!shouldGlow) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [shouldGlow]);

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.015],
  });

  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.55],
  });

  function getEscalationStyle(level: number) {
    if (level >= 4) return styles.escalate4;
    if (level === 3) return styles.escalate3;
    if (level === 2) return styles.escalate2;
    if (level === 1) return styles.escalate1;
    return null;
  }

  return (
    <Animated.View
     style={[
      { width: "100%" }, // ✅ critical
      {
        alignSelf: isSender ? "flex-end" : "flex-start", // ✅ this fixes the spacing
        transform: [{ scale: shouldGlow ? glowScale : 1 }],
      },
    ]}
    >
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
        </View>

        <Text style={styles.bodyText}>{line}</Text>

        {!isDone && !isExpired && (
          <View style={styles.actionRow}>
            {!isSender && (
              <Pressable
                onPress={() => markDone(item.id)}
                style={styles.actionBtn}
              >
                <Text>Done</Text>
              </Pressable>
            )}

            {isSender && (
              <Pressable
                onPress={() => escalate(item.id, level)}
                style={styles.actionBtn}
              >
                <Text>Escalate 😼</Text>
              </Pressable>
            )}
          </View>
        )}
        {isExpired && isSender && (
          <View style={styles.actionRow}>
            <Pressable onPress={() => renewNudge(item.id)} style={styles.actionBtn}>
              <Text>Renew 🔁</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chatBubble: {
    width: "100%",
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

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  bodyText: {
    marginTop: 6,
    opacity: 0.9,
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  escalate1: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
  },

  escalate2: {
    backgroundColor: "#ffedd5",
    borderColor: "#fdba74",
  },

  escalate3: {
    backgroundColor: "#ffe4e6",
    borderColor: "#fda4af",
  },

  escalate4: {
    backgroundColor: "#fee2e2",
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
    backgroundColor: "#fb7185",
    shadowColor: "#fb7185",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
