import { SendNudgeForm } from "@/src/features/nudges/SendNudgeForm";
import { tokens } from "@/src/theme/tokens";
import { Button } from "@/src/ui/Button";
import { Txt } from "@/src/ui/Txt";
import { Modal, Pressable, StyleSheet, View } from "react-native";

export function SendNudgeModal({
  visible,
  emoji,
  title,
  message,
  onChangeEmoji,
  onChangeTitle,
  onChangeMessage,
  onClose,
  onSend,
}: {
  visible: boolean;
  emoji: string;
  title: string;
  message: string;
  onChangeEmoji: (v: string) => void;
  onChangeTitle: (v: string) => void;
  onChangeMessage: (v: string) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.headerRow}>
          <View>
            <Txt variant="h2">Send a Nudge</Txt>
            <Txt variant="muted" style={styles.sub}>
              Gentle reminder with love 💗
            </Txt>
          </View>

          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <Txt variant="h3">×</Txt>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <SendNudgeForm
          emoji={emoji}
          title={title}
          message={message}
          onChangeEmoji={onChangeEmoji}
          onChangeTitle={onChangeTitle}
          onChangeMessage={onChangeMessage}
        />

        <View style={styles.btnRow}>
          <Button label="Cancel" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
          <Button label="Send Nudge" onPress={onSend} style={{ flex: 1 }}  disabled={!title.trim()} />
        </View>

        <View style={{ height: 10 }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    backgroundColor: tokens.colors.cardSurface,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  sub: { marginTop: 2, opacity: 0.7 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.cardInner,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginVertical: 14,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
});