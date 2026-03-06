import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export function SettingButton({
  icon,
  label,
  description,
  destructive,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  destructive?: boolean;
  onPress?: () => void;
}) {
  const color = destructive ? "#d4183d" : tokens.colors.primary;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>{icon}</View>

      <View style={{ flex: 1 }}>
        <Txt variant="body" style={[styles.label, destructive && { color }]}>
          {label}
        </Txt>
        <Txt variant="muted" style={styles.desc}>
          {description}
        </Txt>
      </View>

      <ChevronRight size={20} color={tokens.colors.anchor} opacity={0.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: tokens.radius.md,
  },
  pressed: {
    backgroundColor: "rgba(64,60,61,0.03)",
  },
  iconWrap: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: tokens.colors.anchor,
  },
  desc: {
    color: tokens.colors.anchor,
    opacity: 0.6,
  },
});