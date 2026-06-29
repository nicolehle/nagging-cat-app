import { QuickNudge } from "@/src/features/nudges/quickNudges";
import { tokens } from "@/src/theme/tokens";
import { Button } from "@/src/ui/Button";
import { Card } from "@/src/ui/Card";
import { Txt } from "@/src/ui/Txt";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type Props = {
  visible: boolean;
  quickNudges: QuickNudge[];
  sendingId: string | null;
  onClose: () => void;
  onManage: () => void;
  onSelect: (item: QuickNudge) => void;
};

export function QuickNudgePicker({
  visible,
  quickNudges,
  sendingId,
  onClose,
  onManage,
  onSelect,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Card style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleCopy}>
              <Txt variant="h2">Quick Nudge</Txt>
              <Txt variant="meta">Send a saved nudge in one tap.</Txt>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Txt variant="label" style={styles.closeText}>
                Close
              </Txt>
            </Pressable>
          </View>

          {quickNudges.length ? (
            <View style={styles.list}>
              {quickNudges.map((item) => (
                <Pressable
                  key={item.id}
                  disabled={Boolean(sendingId)}
                  onPress={() => onSelect(item)}
                  style={({ pressed }) => [
                    styles.quickRow,
                    pressed && !sendingId && styles.pressedRow,
                    sendingId === item.id && styles.activeRow,
                  ]}
                >
                  <View style={styles.emojiBubble}>
                    <Txt variant="h3">{item.emoji}</Txt>
                  </View>
                  <Txt variant="bodyStrong" style={styles.quickTitle}>
                    {item.title}
                  </Txt>
                  {sendingId === item.id ? (
                    <Txt variant="caption" style={styles.sendingText}>
                      Sending
                    </Txt>
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Txt variant="bodyStrong">No quick nudges yet</Txt>
              <Txt variant="meta" style={styles.emptyText}>
                Add a few recurring nudges in Settings.
              </Txt>
              <Button label="Open Settings" variant="secondary" onPress={onManage} />
            </View>
          )}
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(38, 50, 51, 0.28)",
  },
  sheet: {
    margin: 18,
    gap: 16,
    borderRadius: 26,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleCopy: {
    flex: 1,
    gap: 4,
  },
  closeText: {
    color: tokens.colors.primary,
  },
  list: {
    gap: 10,
  },
  quickRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  activeRow: {
    borderColor: "#BFE6EE",
    backgroundColor: "#E7F7FB",
  },
  pressedRow: {
    opacity: 0.9,
  },
  emojiBubble: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  quickTitle: {
    flex: 1,
  },
  sendingText: {
    color: tokens.colors.primary,
  },
  emptyState: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: "center",
  },
});

