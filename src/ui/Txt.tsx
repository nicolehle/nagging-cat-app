import { fonts } from "@/src/theme/fonts";
import { tokens } from "@/src/theme/tokens";
import { StyleSheet, Text, TextProps } from "react-native";

type Variant =
  | "hero"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "bodyStrong"
  | "muted"
  | "meta"
  | "caption"
  | "label"
  | "button";

export function Txt({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  return <Text {...props} style={[styles.base, variants[variant], style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: tokens.colors.textPrimary,
    fontSize: tokens.typography.base,
    fontFamily: fonts.bodyRegular,
  },
});

const variants = StyleSheet.create({
  hero: { fontSize: 34, lineHeight: 40, fontFamily: fonts.displayExtraBold },
  h1: { fontSize: 28, lineHeight: 34, fontFamily: fonts.displayBold },
  h2: { fontSize: 20, lineHeight: 26, fontFamily: fonts.displayBold },
  h3: { fontSize: 18, lineHeight: 24, fontFamily: fonts.displayBold },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fonts.bodyRegular },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontFamily: fonts.bodyMedium, fontWeight: "600" },
  muted: {
    fontSize: 14,
    lineHeight: 20,
    color: tokens.colors.textSecondary,
    fontFamily: fonts.bodyRegular,
  },
  meta: {
    fontSize: 14,
    lineHeight: 20,
    color: tokens.colors.textSecondary,
    fontFamily: fonts.bodyRegular,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    color: tokens.colors.textTertiary,
    fontFamily: fonts.bodyRegular,
  },
  label: { fontSize: 14, lineHeight: 20, fontFamily: fonts.bodyMedium, fontWeight: "600" },
  button: { fontSize: 16, lineHeight: 20, fontFamily: fonts.bodyMedium, fontWeight: "600" },
});
