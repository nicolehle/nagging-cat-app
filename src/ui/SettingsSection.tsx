import { tokens } from "@/src/theme/tokens";
import { Card } from "@/src/ui/Card";
import { Txt } from "@/src/ui/Txt";
import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

export function SettingsSection({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.wrap}>
      <Txt variant="label" style={styles.title}>
        {title}
      </Txt>
      <Card style={styles.card}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: tokens.space.lg,
  },
  title: {
    opacity: 0.7,
    marginBottom: tokens.space.sm,
  },
  card: {
    paddingVertical: 8, // tighter like settings lists
  },
});