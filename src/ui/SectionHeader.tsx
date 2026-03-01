import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { StyleSheet, View } from "react-native";

export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.wrap}>
      <Txt variant="h3">{title}</Txt>
      {typeof count === "number" ? (
        <View style={styles.badge}>
          <Txt variant="label" style={styles.badgeText}>
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
    paddingTop: 6,
    paddingBottom: 6,
  },
  badge: {
    minWidth: 26,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.cardInner,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: tokens.colors.anchor,
  },
});