import { CardVariant, NudgeCardModel } from "@/src/features/nudges/cardModel";
import { tokens } from "@/src/theme/tokens";
import { Button } from "@/src/ui/Button";
import { Card } from "@/src/ui/Card";
import { Txt } from "@/src/ui/Txt";
import { StyleSheet, View } from "react-native";

type Props = {
  variant: CardVariant;
  model: NudgeCardModel;

  // Home actions (optional)
  onDone?: (id: string) => void;
  onEscalate?: (id: string) => void;
  onNudge?: (id: string) => void;
  onDismiss?: (id: string) => void;
};

const statusPill = {
  active: { label: null, color: tokens.colors.primary }, // label handled by model.statusLabel
  escalated: { label: "Escalated!", color: tokens.colors.accent },
  done: { label: "Done", color: tokens.colors.loveAccent },
  expired: { label: "Expired", color: tokens.colors.neutralSoft },
} as const;

export function NudgeCard({
  variant,
  model,
  onDone,
  onEscalate,
  onNudge,
  onDismiss,
}: Props) {
  const status = model.status;
  const actionable = status === "active" || status === "escalated";

  const fromIsMe = model.from === "me";

  return (
    <View style={styles.outer}>
      <Card style={styles.card}>
        {/* Sender row */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.pill,
              fromIsMe ? styles.mePill : styles.partnerPill,
            ]}
          >
            <Txt variant="label" style={styles.pillText}>
              {model.fromLabel}
            </Txt>
          </View>

          <View style={styles.rightTop}>
            {variant === "history" && model.timeLabel ? (
              <Txt variant="muted" style={styles.time}>
                {model.timeLabel}
              </Txt>
            ) : null}

            <View
              style={[
                styles.statusBadge,
                status === "expired" && styles.expiredBadge,
              ]}
            >
              <Txt variant="muted" style={styles.statusText}>
                {model.statusLabel}
              </Txt>
            </View>
          </View>
        </View>

        {/* Main content */}
        <View style={styles.mainRow}>
          {model.emoji ? (
            <View style={styles.emojiBox}>
              <Txt variant="h2">{model.emoji}</Txt>
            </View>
          ) : null}

          <View style={{ flex: 1 }}>
            <Txt
              variant="h3"
              style={[
                styles.title,
                (status === "expired" || status === "done") && styles.dimmed,
              ]}
            >
              {model.title}
            </Txt>

            {variant === "history" && model.message ? (
              <Txt variant="body" style={styles.message}>
                {model.message}
              </Txt>
            ) : null}

            {variant === "history" ? (
              <View style={styles.historyFooter}>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: `${statusPill[status].color}15` },
                  ]}
                >
                  <Txt variant="label" style={{ color: statusPill[status].color }}>
                    {statusPill[status].label ?? (status === "active" ? "Active" : model.statusLabel)}
                  </Txt>
                </View>

                {status === "active" && fromIsMe ? (
                  <Txt variant="muted" style={styles.waiting}>
                    Waiting...
                  </Txt>
                ) : null}
              </View>
            ) : (
              <Txt variant="muted">Escalation: {model.escalationLevel ?? 0}</Txt>
            )}
          </View>
        </View>

        {/* Actions for Home */}
        {variant === "home" ? (
          <View style={styles.actions}>
            {actionable ? (
              <>
                <Button label="Done" onPress={() => onDone?.(model.id)} style={styles.actionBtn} />
                <Button label="Nudge" variant="ghost" onPress={() => onNudge?.(model.id)} style={styles.actionBtn} />
                <Button label="Escalate" variant="secondary" onPress={() => onEscalate?.(model.id)} style={styles.actionBtn} />
              </>
            ) : (
              <Button label="Dismiss" variant="ghost" onPress={() => onDismiss?.(model.id)} style={styles.actionBtn} />
            )}
          </View>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {},
  card: { padding: tokens.space.lg },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: tokens.space.md,
  },
  pill: {
    paddingHorizontal: tokens.space.md,
    paddingVertical: 6,
    borderRadius: tokens.radius.pill,
  },
  mePill: { backgroundColor: tokens.colors.loveAccent },
  partnerPill: { backgroundColor: tokens.colors.accent },
  pillText: { color: tokens.colors.anchor },

  rightTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.space.sm,
  },
  time: { opacity: 0.55 },

  statusBadge: {
    paddingHorizontal: tokens.space.md,
    paddingVertical: 6,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.cardInner,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  expiredBadge: {
    backgroundColor: tokens.colors.bgTexture,
  },
  statusText: { color: tokens.colors.anchor },

  mainRow: {
    flexDirection: "row",
    gap: 12,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.cardInner,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { marginBottom: 6 },
  dimmed: { opacity: 0.65 },
  message: { opacity: 0.7, lineHeight: 22, marginBottom: 12 },

  historyFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tokens.radius.md,
  },
  waiting: { opacity: 0.4 },

  actions: {
    flexDirection: "row",
    gap: tokens.space.sm,
    marginTop: tokens.space.lg,
  },
  actionBtn: { flex: 1 },
});