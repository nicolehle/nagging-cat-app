import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Chip({ label, active, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        active ? styles.active : styles.inactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Txt
        variant="label"
        style={[styles.text, active ? styles.textActive : styles.textInactive]}
      >
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: tokens.radius.pill,
  },
  active: {
    backgroundColor: tokens.colors.primary, // #EB6B4D
  },
  inactive: {
    backgroundColor: "rgba(244,131,49,0.14)", // from Figma kit chip
  },
  pressed: { opacity: 0.9 },

  text: {},
  textActive: { color: tokens.colors.white },
  textInactive: { color: tokens.colors.anchor },
});