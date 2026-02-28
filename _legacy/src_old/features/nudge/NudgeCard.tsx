import React from "react";
import { Platform, StyleSheet, View, ViewProps } from "react-native";
import { nagTheme as t } from "@/src/constants/theme";

type Props = ViewProps & {
  leftSlot?: React.ReactNode;
  variant?: "partner" | "me";
};

export function NudgeCard({
  leftSlot,
  variant = "partner",
  children,
  style,
  ...rest
}: Props) {
  const isMe = variant === "me";


  const accent = isMe ? t.colors.primary : t.colors.secondary;

  return (
    <View
      style={[
        styles.card,
        isMe ? styles.meCard : styles.partnerCard,
        { borderLeftColor: accent },
        style,
      ]}
      {...rest}
    >
      <View style={styles.row}>
        {!!leftSlot && (
          <View style={styles.left}>
            <View style={styles.leftSlotBox}>{leftSlot}</View>
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: t.space?.lg ?? 16,
    borderWidth: 1,
    borderColor: t.colors?.border ?? "rgba(64,60,61,0.10)",
    borderRadius: t.radii?.xl ?? 22,
    backgroundColor: t.colors?.card ?? "#FFFCF7",
    marginBottom: t.space?.lg ?? 16,

    borderLeftWidth: 3,

    ...Platform.select({
      ios: {
        shadowColor: t.colors?.anchor ?? t.colors?.ink ?? "#403C3D",
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },

  partnerCard: { marginRight: 16 },
  meCard: { marginLeft: 16 },

  row: { flexDirection: "row", alignItems: "flex-start" },

  left: {
    marginRight: t.space?.md ?? 12,
    paddingTop: 2,
    width: 56,
    alignItems: "center",
  },

  leftSlotBox: {
    width: 48,
    height: 48,
    borderRadius: t.radii?.md ?? 14,
    backgroundColor: t.colors?.cardInner ?? "#FFF7EE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(64,60,61,0.08)",
  },

  content: { flex: 1, minWidth: 0 },
});