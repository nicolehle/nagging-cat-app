export type NudgeStatus = "active" | "done" | "escalated" | "expired";

export type Nudge = {
  id: string;
  title: string;
  emoji: string;       // ✅ NEW (required)
  message?: string;    // optional (history uses it more)
  createdAt: number;
  expiresAt: number;
  from: "me" | "partner";
  status: NudgeStatus;
  escalationLevel: number;
};