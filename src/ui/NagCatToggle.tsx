import { tokens } from "@/src/theme/tokens";
import { Pressable, StyleSheet, View } from "react-native";

export function NagCatToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[
        styles.track,
        { backgroundColor: value ? tokens.colors.primary : "rgba(64, 60, 61, 0.20)" },
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View style={[styles.thumb, { left: value ? 24 : 4 }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: tokens.radius.pill,
    justifyContent: "center",
    position: "relative",
  },
  thumb: {
    position: "absolute",
    top: 4,
    width: 20,
    height: 20,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.white,
  },
});