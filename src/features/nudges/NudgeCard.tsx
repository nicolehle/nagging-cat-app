import { CardVariant, NudgeCardModel } from "@/src/features/nudges/cardModel";
import { tokens } from "@/src/theme/tokens";
import { Card } from "@/src/ui/Card";
import { Txt } from "@/src/ui/Txt";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  variant: CardVariant;
  model: NudgeCardModel;

  // optional override; default: partner=left, me=right
  align?: "left" | "right";

  // Home actions (optional)
  onDone?: (id: string) => void;
  onEscalate?: (id: string) => void;
  onNudge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onRenew?: (id: string) => void;
};

const statusPill = {
  active: { label: null, color: tokens.colors.primary },
  escalated: { label: "Escalated!", color: tokens.colors.accent },
  done: { label: "Done", color: tokens.colors.loveAccent },
  expired: { label: "Expired", color: tokens.colors.neutralSoft },
  dismissed: { label: "Dismissed", color: tokens.colors.neutralSoft },
} as const;

export function NudgeCard({
  variant,
  model,
  align: alignProp,
  onDone,
  onEscalate,
  onNudge,
  onDismiss,
}: Props) {
  const status = model.status;
  const actionable = status === "active" || status === "escalated";

  const fromIsMe = model.from === "me";
  const align = alignProp ?? (fromIsMe ? "right" : "left");

  return (
    <View style={[styles.wrap, align === "right" ? styles.right : styles.left]}>
      <Card style={styles.card}>
        {/* Sender row */}
        <View style={styles.topRow}>
          <View style={[styles.pill, fromIsMe ? styles.mePill : styles.partnerPill]}>
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

            <View style={[styles.statusBadge, status === "expired" && styles.expiredBadge]}>
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

            {model.message ? (
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
                    {statusPill[status].label ??
                      (status === "active" ? "Active" : model.statusLabel)}
                  </Txt>
                </View>

                {status === "active" && fromIsMe ? (
                  <Txt variant="muted" style={styles.waiting}>
                    Waiting...
                  </Txt>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        {/* Home footer (Figma key elements) */}
        {variant === "home" ? (
          <View style={styles.homeFooter}>
            <View style={[styles.statusPill, { backgroundColor: `${statusPill[status].color}15` }]}>
              <Txt variant="label" style={{ color: statusPill[status].color }}>
                {status === "active" ? "Active" : statusPill[status].label ?? model.statusLabel}
              </Txt>
            </View>

            {/* Right-side actions */}
            {status === "expired" ? (
              <View style={styles.homeExpiredActions}>
                <Pressable onPress={() => onRenew?.(model.id)} hitSlop={10}>
                  <Txt variant="label" style={styles.actionText}>
                    Renew
                  </Txt>
                </Pressable>
                <Pressable onPress={() => onDismiss?.(model.id)} hitSlop={10}>
                  <Txt variant="label" style={styles.actionTextMuted}>
                    Dismiss
                  </Txt>
                </Pressable>
              </View>
            ) : actionable ? (
              fromIsMe ? (
                <Pressable onPress={() => onNudge?.(model.id)} hitSlop={10}>
                  <Txt variant="label" style={styles.actionText}>
                    Nudge
                  </Txt>
                </Pressable>
              ) : (
                <Pressable onPress={() => onDone?.(model.id)} hitSlop={10}>
                  <Txt variant="label" style={styles.actionText}>
                    Mark Done
                  </Txt>
                </Pressable>
              )
            ) : null}
          </View>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  // Alignment
  wrap: {},
  left: { marginRight: 14 },
  right: { marginLeft: 14 },

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

  homeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: tokens.space.lg,
  },
  actionText: {
    color: tokens.colors.primary,
  },
  homeExpiredActions: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  actionText: { color: tokens.colors.primary },
  actionTextMuted: { color: tokens.colors.anchor, opacity: 0.55 },
  });