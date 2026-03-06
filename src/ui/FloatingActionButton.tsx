import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { Pressable, StyleSheet } from "react-native";

export function FloatingActionButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.fab}>
      <Txt variant="h2" style={styles.plus}>
        +
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 18,
    bottom: 18, // normal tabs: keep it close to bottom
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: tokens.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  plus: {
    color: "#fff",
    lineHeight: 28,
  },
});