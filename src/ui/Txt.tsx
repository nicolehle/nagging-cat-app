import { fonts } from "@/src/theme/fonts";
import { tokens } from "@/src/theme/tokens";
import { StyleSheet, Text, TextProps } from "react-native";

type Variant = "h1" | "h2" | "h3" | "body" | "muted" | "label";

export function Txt({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  return <Text {...props} style={[styles.base, variants[variant], style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: tokens.colors.anchor,
    fontSize: tokens.typography.base,
    fontFamily: fonts.regular,
  },
});

const variants = StyleSheet.create({
  h1: { fontSize: 28, lineHeight: 36, fontFamily: fonts.extrabold },
  h2: { fontSize: 22, lineHeight: 30, fontFamily: fonts.bold },
  h3: { fontSize: 18, lineHeight: 26, fontFamily: fonts.semibold },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fonts.regular },
  muted: { fontSize: 14, lineHeight: 22, color: tokens.colors.neutralSoft, fontFamily: fonts.regular },
  label: { fontSize: 14, lineHeight: 20, fontFamily: fonts.semibold },
});