import { tokens } from "@/src/theme/tokens";
import { NagCatToggle } from "@/src/ui/NagCatToggle";
import { Txt } from "@/src/ui/Txt";
import React from "react";
import { StyleSheet, View } from "react-native";

export function SettingRow({
  icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>{icon}</View>

      <View style={styles.copy}>
        <Txt variant="bodyStrong" style={styles.label}>
          {label}
        </Txt>
        <Txt variant="meta" style={styles.desc}>
          {description}
        </Txt>
      </View>

      <NagCatToggle value={value} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
