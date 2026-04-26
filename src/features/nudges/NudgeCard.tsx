import { CardVariant, NudgeCardModel } from "@/src/features/nudges/cardModel";
import { tokens } from "@/src/theme/tokens";
import { Button } from "@/src/ui/Button";
import { Card } from "@/src/ui/Card";
import { Chip } from "@/src/ui/Chip";
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
  const actionable =
    status === "active" || status === "evening_reminder" || status === "final_warning";
  const canEscalate = escalationLevel < FINAL_WARNING_LEVEL;
  const statusStyle = statusStyles[status];
  const StatusIcon = statusStyle.Icon;

  return (
    <Card style={[styles.card, status === "expired" && styles.expiredCard]}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <View style={[styles.emojiWrap, fromIsMe ? styles.emojiWrapMine : styles.emojiWrapPartner]}>
            <Txt variant="h2">{model.emoji ?? "📌"}</Txt>
          </View>

          <View style={styles.titleCopy}>
            <Txt variant="bodyStrong" style={styles.title}>
              {model.title}
            </Txt>
            <Txt variant="caption" style={styles.fromText}>
              {fromIsMe ? "From you" : `From ${model.fromLabel}`}
            </Txt>
          </View>
        </View>

        <View style={styles.badgeWrap}>
          <Chip
            label={status === "active" ? model.statusLabel : statusStyle.label}
            tone={statusStyle.tone}
            style={styles.statusChip}
          />
        </View>
      </View>

      {model.message ? (
        <Txt variant="meta" style={styles.message} numberOfLines={variant === "home" ? 2 : 3}>
          {model.message}
        </Txt>
      ) : null}

      <View style={styles.bottomRow}>
        <View style={styles.timeRow}>
          <StatusIcon size={16} color={statusStyle.iconColor} strokeWidth={2} />
          <Txt variant="caption" style={styles.timeText}>
            {variant === "history" && model.timeLabel ? model.timeLabel : model.statusLabel}
          </Txt>
        </View>

        {variant === "history" ? null : status === "expired" ? (
          <View style={styles.actionRow}>
            <Button label="Renew" variant="secondary" onPress={() => onRenew?.(model.id)} />
            <Pressable onPress={() => onDismiss?.(model.id)} hitSlop={10}>
              <Txt variant="label" style={styles.linkText}>
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
                Final warning sent
              </Txt>
            )
          ) : (
            <Button label="Mark Done" onPress={() => onDone?.(model.id)} />
          )
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 14,
    borderRadius: 24,
  },
  expiredCard: {
    borderColor: "#E9D9D3",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  emojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  emojiWrapMine: {
    backgroundColor: "#E7F7FB",
    borderColor: "#CFEAF1",
  },
  emojiWrapPartner: {
    backgroundColor: tokens.colors.surfaceSubtle,
    borderColor: tokens.colors.border,
  },
  titleCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: tokens.colors.textPrimary,
  },
  fromText: {
    color: tokens.colors.textTertiary,
  },
  badgeWrap: {
    alignItems: "flex-end",
  },
  statusChip: {
    minHeight: 34,
  },
  message: {
    color: tokens.colors.textSecondary,
    marginTop: -2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  timeText: {
    color: tokens.colors.textTertiary,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  linkText: {
    color: tokens.colors.textSecondary,
  },
  helperText: {
    color: tokens.colors.textTertiary,
  },
});
