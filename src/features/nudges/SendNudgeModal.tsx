import { SendNudgeForm } from "@/src/features/nudges/SendNudgeForm";
import { tokens } from "@/src/theme/tokens";
import { Button } from "@/src/ui/Button";
import { Txt } from "@/src/ui/Txt";
import { X } from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

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
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.headerRow}>
              <View style={styles.titleWrap}>
                <View style={styles.kicker}>
                  <Txt variant="caption" style={styles.kickerText}>
                    New reminder
                  </Txt>
                </View>
                <Txt variant="h1">Create Nudge</Txt>
                <Txt variant="meta" style={styles.sub}>
                  Structured, light, and just mischievous enough.
                </Txt>
              </View>

              <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                <X size={18} color={tokens.colors.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>

            <SendNudgeForm
              emoji={emoji}
              title={title}
              message={message}
              onChangeEmoji={onChangeEmoji}
              onChangeTitle={onChangeTitle}
              onChangeMessage={onChangeMessage}
            />

            <View style={styles.btnRow}>
              <Button label="Cancel" variant="secondary" onPress={onClose} style={styles.button} />
              <Button
                label="Send Nudge"
                onPress={onSend}
                style={styles.button}
                disabled={!title.trim()}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(24, 44, 42, 0.22)",
  },
  sheet: {
    backgroundColor: tokens.colors.surface,
    borderTopLeftRadius: tokens.radius.xxl,
    borderTopRightRadius: tokens.radius.xxl,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    maxHeight: "88%",
    borderTopWidth: 1,
    borderColor: tokens.colors.border,
  },
  sheetContent: {
    paddingBottom: 4,
    gap: tokens.space.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleWrap: {
    flex: 1,
    gap: 6,
  },
  kicker: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: tokens.radius.pill,
    backgroundColor: "#E7F7FB",
    borderWidth: 1,
    borderColor: "#CFEAF1",
  },
  kickerText: {
    color: tokens.colors.accentPressed,
  },
  sub: {
    color: tokens.colors.textSecondary,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
  },
});
