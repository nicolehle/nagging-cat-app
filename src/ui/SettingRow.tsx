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

      <View style={{ flex: 1 }}>
        <Txt variant="body" style={styles.label}>
          {label}
        </Txt>
        <Txt variant="muted" style={styles.desc}>
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
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
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