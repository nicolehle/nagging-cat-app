import { FavoriteEmojiRow } from "@/src/features/nudges/FavoriteEmojiRow";
import { tokens } from "@/src/theme/tokens";
import { Card } from "@/src/ui/Card";
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
      <Card variant="inner" style={styles.section}>
        <View style={styles.sectionHead}>
          <Txt variant="h2">Pick the vibe</Txt>
          <Txt variant="meta">A tiny mascot moment, then straight into the reminder.</Txt>
        </View>
        <FavoriteEmojiRow value={emoji} onChange={onChangeEmoji} />
      </Card>

      <Card variant="inner" style={styles.section}>
        <View style={styles.sectionHead}>
          <Txt variant="h2">Write the nudge</Txt>
          <Txt variant="meta">Keep it cheeky, clear, and easy to scan.</Txt>
        </View>

        <Input
          label="Title"
          value={title}
          onChangeText={onChangeTitle}
          placeholder="Laundry reminder"
        />

        <Input
          label="Message"
          value={message}
          onChangeText={(v) => onChangeMessage(v.slice(0, max))}
          placeholder="Quick little nudge so this one does not sneak away today."
          multiline
          style={styles.messageBox}
        />

        <View style={styles.hintRow}>
          <Txt variant="caption">Gentle mischief wins over guilt trips.</Txt>
          <Txt variant="caption">{message.length}/{max}</Txt>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: tokens.space.md,
  },
  section: {
    gap: tokens.space.md,
    padding: tokens.space.lg,
  },
  sectionHead: {
    gap: 4,
  },
  messageBox: {
    height: 118,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  hintRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
});
