import { FavoriteEmojiRow } from "@/src/features/nudges/FavoriteEmojiRow";
import { tokens } from "@/src/theme/tokens";
import { Button } from "@/src/ui/Button";
import { Card } from "@/src/ui/Card";
import { Input } from "@/src/ui/Input";
import { Txt } from "@/src/ui/Txt";
import { StyleSheet, View } from "react-native";

export function CreateNudgePanel({
  title,
  onChangeTitle,
  emoji,
  onChangeEmoji,
  onSend,
}: {
  title: string;
  onChangeTitle: (v: string) => void;
  emoji: string;
  onChangeEmoji: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Card>
        <Txt variant="h3">Send a nudge</Txt>

        <View style={{ height: tokens.space.md }} />

        <FavoriteEmojiRow
          value={emoji}
          onChange={onChangeEmoji}
          onPressMore={() => {
            // later: open emoji picker modal
          }}
        />

        <View style={{ height: tokens.space.md }} />

        <Input
          label="Message"
          value={title}
          onChangeText={onChangeTitle}
          placeholder="e.g. Take vitamins"
        />

        <View style={styles.row}>
          <Button label="Send" onPress={onSend} />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  row: {
    marginTop: tokens.space.md,
  },
});