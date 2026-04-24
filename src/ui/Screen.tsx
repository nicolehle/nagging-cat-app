import { tokens } from "@/src/theme/tokens";
import { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({
  children,
  style,
  keyboardAvoiding,
}: PropsWithChildren<{ style?: ViewStyle; keyboardAvoiding?: boolean }>) {
  const content = <SafeAreaView style={[styles.root, style]}>{children}</SafeAreaView>;

  if (!keyboardAvoiding) {
    return content;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: tokens.colors.background,
    padding: tokens.space.xl,
  },
});
