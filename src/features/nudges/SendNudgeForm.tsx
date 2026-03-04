import { FavoriteEmojiRow } from "@/src/features/nudges/FavoriteEmojiRow";
import { tokens } from "@/src/theme/tokens";
import { Input } from "@/src/ui/Input";
import { Txt } from "@/src/ui/Txt";
import { StyleSheet, View } from "react-native";

export function SendNudgeForm({
  emoji,
  title,
  message,
  onChangeEmoji,
  onChangeTitle,
  onChangeMessage,
}: {
  emoji: string;
  title: string;
  message: string;
  onChangeEmoji: (v: string) => void;
  onChangeTitle: (v: string) => void;
  onChangeMessage: (v: string) => void;
}) {
  const max = 200;

  return (
    <View style={styles.wrap}>
      <FavoriteEmojiRow value={emoji} onChange={onChangeEmoji} />

      <View style={{ height: tokens.space.md }} />

      <Input
        label="Title"
        value={title}
        onChangeText={onChangeTitle}
        placeholder="Laundry reminder"
      />

      <View style={{ height: tokens.space.md }} />

      <Txt variant="label">Your message</Txt>
      <Input
        value={message}
        onChangeText={(v) => onChangeMessage(v.slice(0, max))}
        placeholder="Hey babe, the hamper is getting pretty full..."
        multiline
        style={styles.messageBox}
      />

      <View style={styles.hintRow}>
        <Txt variant="muted" style={{ opacity: 0.6 }}>
          Keep it sweet and playful
        </Txt>
        <Txt variant="muted" style={{ opacity: 0.6 }}>
          {message.length}/{max}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: tokens.space.sm,
  },
  messageBox: {
    height: 110,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  hintRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});