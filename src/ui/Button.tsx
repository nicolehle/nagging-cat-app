import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from "react-native";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Txt
          variant="label"
          style={[
            styles.label,
            variant === "ghost" ? styles.labelGhost : styles.labelSolid,
          ]}
        >
          {label}
        </Txt>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.space.xl,
    borderWidth: 1,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
  disabled: {
    opacity: 0.55,
  },

  label: {
    // Txt handles fontFamily + size; we just tweak color here
  },
  labelSolid: {
    color: tokens.colors.white,
  },
  labelGhost: {
    color: tokens.colors.anchor,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: tokens.colors.primary,
    borderColor: "transparent",
  },
  secondary: {
    backgroundColor: tokens.colors.secondary,
    borderColor: "transparent",
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: tokens.colors.borderStrong,
  },
});