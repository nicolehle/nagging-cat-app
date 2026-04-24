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
  const color = destructive ? tokens.colors.alert : tokens.colors.textPrimary;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>{icon}</View>

      <View style={styles.copy}>
        <Txt variant="bodyStrong" style={[styles.label, { color }]}>
          {label}
        </Txt>
        <Txt variant="meta" style={styles.desc}>
          {description}
        </Txt>
      </View>

      <ChevronRight size={20} color={tokens.colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: tokens.radius.lg,
  },
  pressed: {
    backgroundColor: tokens.colors.surfaceSubtle,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: tokens.colors.textPrimary,
  },
  desc: {
    color: tokens.colors.textSecondary,
  },
});
