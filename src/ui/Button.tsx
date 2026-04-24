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
        pressed && !isDisabled && variantPressedStyles[variant],
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? tokens.colors.white : tokens.colors.textPrimary}
        />
      ) : (
        <Txt
          variant="button"
          style={[
            styles.label,
            variant === "primary" ? styles.labelPrimary : styles.labelSecondary,
            variant === "ghost" && styles.labelGhost,
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
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.space.xxl,
    paddingVertical: 14,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {},
  labelPrimary: {
    color: tokens.colors.white,
  },
  labelSecondary: {
    color: tokens.colors.textPrimary,
  },
  labelGhost: {
    color: tokens.colors.primary,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  secondary: {
    backgroundColor: tokens.colors.surfaceSubtle,
    borderColor: tokens.colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
});

const variantPressedStyles = StyleSheet.create({
  primary: {
    backgroundColor: tokens.colors.primaryPressed,
    borderColor: tokens.colors.primaryPressed,
  },
  secondary: {
    backgroundColor: "#E3F0EE",
  },
  ghost: {
    opacity: 0.75,
  },
});
