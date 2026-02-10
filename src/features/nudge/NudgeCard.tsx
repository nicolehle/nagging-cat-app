// src/features/nudge/NudgeCard.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View, ViewProps } from "react-native";
import { nagTheme as t } from "@/src/constants/theme";

type Props = ViewProps & {
  pulseKey: string;
  leftSlot?: React.ReactNode;
  variant?: "partner" | "me";
};


export function NudgeCard({
  pulseKey,
  leftSlot,
  variant = "partner",
  children,
  style,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scale.setValue(1);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.015, duration: 110, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
  }, [pulseKey, scale]);

  return (
    <Animated.View
      style={[
        styles.card,
        variant === "partner" ? styles.partnerCard : styles.meCard,
        style,
        { transform: [{ scale }] },
      ]}
      {...rest}
    >
      <View style={styles.row}>
        {!!leftSlot && <View style={styles.left}>{leftSlot}</View>}
        <View style={styles.content}>{children}</View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: t.space?.lg ?? 16,
    borderWidth: 1,
    borderRadius: t.radii?.xl ?? 22,
    backgroundColor: t.colors?.card ?? "#FFFCF7",
    marginBottom: t.space?.lg ?? 16,

    // cozy shadow
    ...Platform.select({
      ios: {
        shadowColor: t.colors?.ink ?? "#3B2A22",
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 3 },
      default: {},
    }),
  },

  // subtle separation: partner feels a *tiny* more outlined
  partnerCard: {
    borderColor: "rgba(122,79,58,0.18)", // cocoa-ish
  },
  meCard: {
    borderColor: "rgba(59,42,34,0.10)", // softer ink
    backgroundColor: t.colors?.cardInner ?? (t.colors?.card ?? "#FFFCF7"),
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  left: {
    marginRight: t.space?.md ?? 12,
    paddingTop: 2,
    // makes your emotes feel “embedded” instead of floating
    width: 56,
    alignItems: "center",
  },

  content: {
    flex: 1,
    minWidth: 0,
  },
});