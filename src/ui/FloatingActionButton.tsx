import { tokens } from "@/src/theme/tokens";
import { Plus } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

export function FloatingActionButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
      <Plus size={24} color={tokens.colors.white} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#163330",
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  pressed: {
    backgroundColor: tokens.colors.primaryPressed,
  },
});
