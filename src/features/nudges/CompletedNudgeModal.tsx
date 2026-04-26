import { NudgeCardModel } from "@/src/features/nudges/cardModel";
import { appImages } from "@/src/theme/assets";
import { tokens } from "@/src/theme/tokens";
import { Button } from "@/src/ui/Button";
import { Card } from "@/src/ui/Card";
import { Chip } from "@/src/ui/Chip";
import { Txt } from "@/src/ui/Txt";
import { CheckCircle2, Clock3 } from "lucide-react-native";
import { Image, Modal, Pressable, StyleSheet, View } from "react-native";

type Props = {
  visible: boolean;
  model: NudgeCardModel | null;
  onClose: () => void;
};

export function CompletedNudgeModal({ visible, model, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.centerWrap}>
          <Card style={styles.modalCard}>
            <View style={styles.artWrap}>
              <Image source={appImages.done} style={styles.art} resizeMode="contain" />
              <View style={styles.successBadge}>
                <CheckCircle2 size={18} color={tokens.colors.success} strokeWidth={2.2} />
              </View>
            </View>

            <View style={styles.copy}>
              <Txt variant="h1" style={styles.title}>
                Nudge complete!
              </Txt>
              <Txt variant="meta" style={styles.subtitle}>
                Nice. That reminder can stop nagging now.
              </Txt>
            </View>

            {model ? (
              <Card variant="inner" style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                  <View style={styles.summaryEmoji}>
                    <Txt variant="h2">{model.emoji ?? "✓"}</Txt>
                  </View>
                  <View style={styles.summaryText}>
                    <Txt variant="bodyStrong">{model.title}</Txt>
                    {model.message ? (
                      <Txt variant="meta" numberOfLines={2}>
                        {model.message}
                      </Txt>
                    ) : null}
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Clock3 size={16} color={tokens.colors.textTertiary} strokeWidth={2} />
                    <Txt variant="caption">{model.statusLabel}</Txt>
                  </View>
                  <Chip label="Done" tone="success" />
                </View>
              </Card>
            ) : null}

            <Button label="Back to nudges" onPress={onClose} style={styles.cta} />
          </Card>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(22, 41, 39, 0.28)",
  },
  centerWrap: {
    width: "100%",
    maxWidth: 360,
  },
  modalCard: {
    padding: 22,
    gap: 18,
    borderRadius: 30,
  },
  artWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  art: {
    width: 170,
    height: 130,
  },
  successBadge: {
    position: "absolute",
    right: 58,
    bottom: 8,
    width: 34,
    height: 34,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.successBg,
    borderWidth: 1,
    borderColor: "#D3EFDF",
  },
  copy: {
    gap: 6,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  summaryCard: {
    padding: 16,
    gap: 14,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryEmoji: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cta: {
    alignSelf: "stretch",
  },
});
