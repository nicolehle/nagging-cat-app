import { deriveStatus } from "@/src/features/nudges/status";
import { Nudge } from "@/src/features/nudges/types";

export type CardVariant = "home" | "history";
export type CardStatus = "active" | "done" | "escalated" | "expired";

export type NudgeCardModel = {
  id: string;
  title: string;
  message?: string; // used in history
  emoji?: string;   // optional (history uses it a lot)
  timeLabel?: string; // e.g. "8h ago" (history)
  fromLabel: string; // "Me" / "Partner"
  from: "me" | "partner";

  status: CardStatus;
  statusLabel: string; // "2h left" / "Done" / "Expired" / "Escalated!"
  escalationLevel?: number; // optional display
};

export function toHomeCardModel(n: Nudge, statusLabel: string): NudgeCardModel {
  const status = deriveStatus(n);
  return {
    id: n.id,
    title: n.title,
    emoji: n.emoji,          // ✅ NEW
    message: n.message,      // optional
    from: n.from,
    fromLabel: n.from === "me" ? "Me" : "Partner",
    status,
    statusLabel,
    escalationLevel: n.escalationLevel,
  };
}