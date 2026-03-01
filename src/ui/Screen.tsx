import { tokens } from "@/src/theme/tokens";
import { PropsWithChildren } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  return <SafeAreaView style={[styles.root, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.bgPaper,
    padding: tokens.space.xl,
  },
});