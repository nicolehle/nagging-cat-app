import { CardVariant, NudgeCardModel } from "@/src/features/nudges/cardModel";
import { tokens } from "@/src/theme/tokens";
import { Card } from "@/src/ui/Card";
import { Chip } from "@/src/ui/Chip";
import { Button } from "@/src/ui/Button";
import { Txt } from "@/src/ui/Txt";
import { AlertCircle, CheckCircle2, Clock3, Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  variant: CardVariant;
  model: NudgeCardModel;
  align?: "left" | "right";
  onDone?: (id: string) => void;
  onEscalate?: (id: string) => void;
  onNudge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onRenew?: (id: string) => void;
};

const FINAL_WARNING_LEVEL = 2;

const statusStyles = {
  active: {
    label: "Active",
    tone: "neutral" as const,
    iconColor: tokens.colors.primary,
    Icon: Clock3,
  },
  evening_reminder: {
    label: "Evening reminder",
    tone: "accent" as const,
    iconColor: tokens.colors.accentPressed,
    Icon: Sparkles,
  },
  final_warning: {
    label: "Final warning",
    tone: "alert" as const,
    iconColor: tokens.colors.alert,
    Icon: AlertCircle,
  },
  done: {
    label: "Done",
    tone: "success" as const,
    iconColor: tokens.colors.success,
    Icon: CheckCircle2,
  },
  expired: {
    label: "Expired",
    tone: "alert" as const,
    iconColor: tokens.colors.alert,
    Icon: AlertCircle,
  },
  dismissed: {
    label: "Dismissed",
    tone: "neutral" as const,
    iconColor: tokens.colors.textTertiary,
    Icon: Clock3,
  },
};

export function NudgeCard({
  variant,
  model,
  onDone,
  onNudge,
  onDismiss,
  onRenew,
}: Props) {
  const status = model.status;
  const fromIsMe = model.from === "me";
  const escalationLevel = Math.min(model.escalationLevel ?? 0, FINAL_WARNING_LEVEL);
  const lifecycleLabel =
    status === "evening_reminder"
      ? "Evening checkpoint"
      : status === "final_warning"
        ? "Final warning checkpoint"
        : null;
  const actionable =
    status === "active" || status === "evening_reminder" || status === "final_warning";
  const canEscalate = escalationLevel < FINAL_WARNING_LEVEL;
  const statusStyle = statusStyles[status];
  const StatusIcon = statusStyle.Icon;

  return (
    <Card style={[styles.card, status === "expired" && styles.expiredCard]}>
      <View style={styles.topRow}>
        <View style={styles.identityRow}>
          <View style={[styles.senderPill, fromIsMe ? styles.senderMe : styles.senderPartner]}>
            <Txt variant="caption" style={styles.senderText}>
              {model.fromLabel}
            </Txt>
          </View>
          {model.timeLabel ? (
            <Txt variant="caption" style={styles.time}>
              {model.timeLabel}
            </Txt>
          ) : null}
        </View>

        <View style={styles.stateRow}>
          <StatusIcon size={16} color={statusStyle.iconColor} strokeWidth={2} />
          <Chip
            label={status === "active" ? model.statusLabel : statusStyle.label}
            tone={statusStyle.tone}
            style={styles.statusChip}
          />
        </View>
      </View>

      <View style={styles.contentRow}>
        {model.emoji ? (
          <View style={styles.emojiBox}>
            <Txt variant="h2">{model.emoji}</Txt>
          </View>
        ) : null}

        <View style={styles.copy}>
          <Txt variant="h2" style={[styles.title, !actionable && styles.dimmed]}>
            {model.title}
          </Txt>

          {model.message ? (
            <Txt variant="body" style={styles.message}>
              {model.message}
            </Txt>
          ) : null}

          {lifecycleLabel ? (
            <Txt variant="caption" style={styles.lifecycleText}>
              {lifecycleLabel}
            </Txt>
          ) : null}

          {variant === "history" && status === "active" && fromIsMe ? (
            <Txt variant="caption" style={styles.helperText}>
              Waiting for a response
            </Txt>
          ) : null}
        </View>
      </View>

      {variant === "home" ? (
        <View style={styles.footer}>
          <View style={styles.metaBlock}>
            <Txt variant="caption" style={styles.metaLabel}>
              Status
            </Txt>
            <Txt variant="meta" style={styles.metaValue}>
              {model.statusLabel}
            </Txt>
          </View>

          {status === "expired" ? (
            <View style={styles.actionRow}>
              <Button label="Renew" variant="secondary" onPress={() => onRenew?.(model.id)} />
              <Pressable onPress={() => onDismiss?.(model.id)} hitSlop={10}>
                <Txt variant="label" style={styles.dismissText}>
                  Dismiss
                </Txt>
              </Pressable>
            </View>
          ) : actionable ? (
            fromIsMe ? (
              canEscalate ? (
                <Button label="Nudge again" variant="secondary" onPress={() => onNudge?.(model.id)} />
              ) : (
                <Txt variant="caption" style={styles.helperText}>
                  Final warning already sent
                </Txt>
              )
            ) : (
              <Button label="Mark done" onPress={() => onDone?.(model.id)} />
            )
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.space.lg,
    padding: tokens.space.lg,
  },
  expiredCard: {
    borderColor: "#E9D9D3",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: tokens.space.sm,
  },
  identityRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  senderPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
  },
  senderMe: {
    backgroundColor: "#E7F7FB",
    borderColor: "#CFEAF1",
  },
  senderPartner: {
    backgroundColor: tokens.colors.surfaceSubtle,
    borderColor: tokens.colors.border,
  },
  senderText: {
    color: tokens.colors.textSecondary,
  },
  time: {
    color: tokens.colors.textTertiary,
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusChip: {
    paddingVertical: 6,
  },
  contentRow: {
    flexDirection: "row",
    gap: 14,
  },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: tokens.colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  title: {
    marginBottom: 2,
  },
  dimmed: {
    opacity: 0.78,
  },
  message: {
    color: tokens.colors.textSecondary,
  },
  lifecycleText: {
    color: tokens.colors.textTertiary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 4,
  },
  metaBlock: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    color: tokens.colors.textTertiary,
  },
  metaValue: {
    color: tokens.colors.textSecondary,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  dismissText: {
    color: tokens.colors.textSecondary,
  },
  helperText: {
    color: tokens.colors.textTertiary,
  },
});
