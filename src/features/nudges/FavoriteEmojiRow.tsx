import { useMemo, useState } from "react";
import { FAVORITE_EMOJIS } from "@/src/features/nudges/favoriteEmojis";
import { tokens } from "@/src/theme/tokens";
import { Txt } from "@/src/ui/Txt";
import { Pressable, StyleSheet, View } from "react-native";

const COLLAPSED_EMOJI_COUNT = 4;

function EmojiPill({
  emoji,
  selected,
  onPress,
}: {
  emoji: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        selected ? styles.pillSelected : styles.pillIdle,
      ]}
    >
      <Txt variant="h3">{emoji}</Txt>
    </Pressable>
  );
}

export function FavoriteEmojiRow({
  value,
  onChange,
  onPressMore,
}: {
  value: string;
  onChange: (emoji: string) => void;
  onPressMore?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapsedEmojis = useMemo(() => {
    const fallbackOptions = FAVORITE_EMOJIS.filter((emoji) => emoji !== value);
    return [value, ...fallbackOptions].slice(0, COLLAPSED_EMOJI_COUNT);
  }, [value]);
  const visibleEmojis = expanded ? FAVORITE_EMOJIS : collapsedEmojis;

  function handleSelect(emoji: string) {
    onChange(emoji);
    setExpanded(false);
  }

  return (
    <View style={styles.wrap}>
      <Txt variant="label">Emoji</Txt>

      <View style={[styles.row, expanded ? styles.expandedRow : styles.collapsedRow]}>
        {visibleEmojis.map((e) => {
          const selected = e === value;
          return (
            <EmojiPill
              key={e}
              emoji={e}
              selected={selected}
              onPress={() => handleSelect(e)}
            />
          );
        })}

        {expanded ? null : (
          <Pressable
            onPress={() => {
              onPressMore?.();
              setExpanded(true);
            }}
            style={[styles.pill, styles.morePill]}
          >
            <Txt variant="h3" style={styles.moreText}>
              +
            </Txt>
          </Pressable>
        )}
      </View>
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
  collapsedRow: {
    flexWrap: "nowrap",
  },
  expandedRow: {
    flexWrap: "wrap",
  },
  pill: {
    width: 46,
    height: 46,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pillIdle: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
  },
  pillSelected: {
    backgroundColor: "#E7F7FB",
    borderColor: "#BFE6EE",
  },
  morePill: {
    backgroundColor: tokens.colors.surfaceSubtle,
    borderColor: tokens.colors.border,
  },
  moreText: {
    color: tokens.colors.textSecondary,
  },
});
