import { tokens } from "@/src/theme/tokens";
import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewProps } from "react-native";

type Props = PropsWithChildren<
  ViewProps & {
    variant?: "surface" | "inner";
  }
>;

export function Card({ variant = "surface", style, children, ...props }: Props) {
  return (
    <View
      {...props}
      style={[
        styles.base,
        variant === "surface" ? styles.surface : styles.inner,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.xl,
    padding: tokens.space.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  surface: {
    backgroundColor: tokens.colors.cardSurface,
  },
  inner: {
    backgroundColor: tokens.colors.cardInner,
  },
});