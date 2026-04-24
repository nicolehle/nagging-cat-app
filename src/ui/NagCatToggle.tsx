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
        {
          backgroundColor: value ? tokens.colors.primary : tokens.colors.surfaceSubtle,
          borderColor: value ? tokens.colors.primary : tokens.colors.border,
        },
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
    borderWidth: 1,
  },
  thumb: {
    position: "absolute",
    top: 3,
    width: 20,
    height: 20,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.white,
  },
});
