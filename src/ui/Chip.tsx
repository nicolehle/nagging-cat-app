import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

type Tone = "neutral" | "accent" | "success" | "alert";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  tone?: Tone;
};

export function Chip({ label, active, onPress, style, tone = "neutral" }: Props) {
  const toneStyle = toneMap[tone];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        active ? styles.active : styles.inactive,
        !active && toneStyle.container,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Txt
        variant="label"
        style={[
          active ? styles.textActive : styles.textInactive,
          !active && toneStyle.text,
        ]}
      >
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  active: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  inactive: {
    backgroundColor: tokens.colors.surfaceSubtle,
  },
  pressed: {
    opacity: 0.9,
  },
  textActive: {
    color: tokens.colors.white,
  },
  textInactive: {
    color: tokens.colors.textSecondary,
  },
});

const toneMap = {
  neutral: StyleSheet.create({
    container: {},
    text: {},
  }),
  accent: StyleSheet.create({
    container: {
      backgroundColor: "#E7F7FB",
      borderColor: "#CFEAF1",
    },
    text: {
      color: tokens.colors.accentPressed,
    },
  }),
  success: StyleSheet.create({
    container: {
      backgroundColor: tokens.colors.successBg,
      borderColor: "#D3EFDF",
    },
    text: {
      color: tokens.colors.success,
    },
  }),
  alert: StyleSheet.create({
    container: {
      backgroundColor: tokens.colors.alertBg,
      borderColor: "#F6D8D0",
    },
    text: {
      color: tokens.colors.alert,
    },
  }),
} satisfies Record<Tone, { container: object; text: object }>;
