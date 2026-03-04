import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export function FavoriteEmojiRow({
  value,
  onChange,
  onPressMore,
}: {
  value: string;
  onChange: (emoji: string) => void;
  onPressMore?: () => void;
}) {
  const emojis = ["📣", "💧", "🧘", "🧠", "🧺", "🍳", "🧹", "💊", "🐱", "📦"];

  return (
    <View style={styles.wrap}>
      <Txt variant="label">Emoji</Txt>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {emojis.map((e) => {
            const selected = e === value;
            return (
              <Pressable
                key={e}
                onPress={() => onChange(e)}
                style={[
                  styles.pill,
                  selected ? styles.pillSelected : styles.pillIdle,
                ]}
              >
                <Txt variant="h3">{e}</Txt>
              </Pressable>
            );
          })}

          <Pressable onPress={onPressMore} style={[styles.pill, styles.morePill]}>
            <Txt variant="h3" style={{ color: tokens.colors.anchor }}>
              +
            </Txt>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: tokens.space.sm,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 4,
  },
  pill: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pillIdle: {
    backgroundColor: tokens.colors.cardInner,
    borderColor: tokens.colors.border,
  },
  pillSelected: {
    backgroundColor: "rgba(235, 107, 77, 0.14)", // tinted primary
    borderColor: "rgba(235, 107, 77, 0.25)",
  },
  morePill: {
    backgroundColor: tokens.colors.bgTexture,
    borderColor: tokens.colors.border,
  },
});