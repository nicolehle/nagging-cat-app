import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { StyleSheet, View } from "react-native";

export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.wrap}>
      <Txt variant="h2">{title}</Txt>
      {typeof count === "number" ? (
        <View style={styles.badge}>
          <Txt variant="caption" style={styles.badgeText}>
            {count}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 10,
    paddingBottom: 8,
  },
  badge: {
    minWidth: 28,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: tokens.colors.textSecondary,
  },
});
