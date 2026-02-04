// nagcat/lib/catCopy.ts
import type { Task } from "./tasks";

export type CatMood = "sleepy" | "neutral" | "sideeye" | "judgy" | "spicy" | "victory" | "sad";

export type TaskEvent =
  | "created"
  | "manual_escalate"
  | "auto_escalate"
  | "acknowledged"
  | "expired"
  | "done";

export type CopyPayload = {
  mood: CatMood;
  emoji: string;
  title: string; // short
  body: string;  // can be longer
  // Optional: label text for UI buttons if you want
  ctaPrimary?: string;
  ctaSecondary?: string;
};

type Context = {
  actor: "sender" | "receiver" | "system";
  // escalation level AFTER the change (so you can vary tone)
  level?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Core: return cat copy for a given event + task.
 * Keep it deterministic and testable.
 */
export function getCatCopy(task: Task, event: TaskEvent, ctx: Context): CopyPayload {
  const titleBase = task.title?.trim() || "Task";
  const level = clamp(ctx.level ?? task.escalation.level ?? 0, 0, 99);

  // A few reusable phrases (keeps voice consistent)
  const cat = {
    nudge: "Just a tiny nudge.",
    serious: "Okay. Now I’m paying attention.",
    judgement: "I’m not mad. I’m just… disappointed.",
    spicy: "I’m escalating this emotionally.",
  };

  switch (event) {
    case "created":
      return {
        mood: "neutral",
        emoji: "🐾",
        title: "Task sent",
        body: `“${titleBase}” is live. The cat is watching.`,
      };

    case "acknowledged":
      return {
        mood: "sleepy",
        emoji: "😽",
        title: "Acknowledged",
        body: `Okay, noted. “${titleBase}” is on the radar.`,
      };

    case "manual_escalate": {
      // Sender pressed escalate
      if (level <= 1) {
        return {
          mood: "sideeye",
          emoji: "😼",
          title: "Escalated by sender",
          body: `${cat.nudge} “${titleBase}” got upgraded.`,
        };
      }
      if (level <= 3) {
        return {
          mood: "judgy",
          emoji: "😾",
          title: "Manual escalation",
          body: `Sender escalated. ${cat.serious} “${titleBase}”.`,
        };
      }
      return {
        mood: "spicy",
        emoji: "🔥",
        title: "Manual escalation: spicy mode",
        body: `Sender escalated again. ${cat.spicy} “${titleBase}”.`,
      };
    }

    case "auto_escalate": {
      // System escalated (timed)
      if (level <= 1) {
        return {
          mood: "neutral",
          emoji: "⏱️",
          title: "Reminder",
          body: `Time passed. “${titleBase}” is still pending.`,
        };
      }
      if (level <= 3) {
        return {
          mood: "sideeye",
          emoji: "👀",
          title: "Still waiting",
          body: `The clock escalated this. “${titleBase}” is not done yet.`,
        };
      }
      return {
        mood: "judgy",
        emoji: "😾",
        title: "Escalated by time",
        body: `Auto escalation triggered. ${cat.judgement} “${titleBase}”.`,
      };
    }

    case "expired":
      return {
        mood: "sad",
        emoji: "⌛",
        title: "Expired (24h)",
        body: `“${titleBase}” hit the 1-day limit. The cat demands a next step.`,
        ctaPrimary: "Renew (later)",
        ctaSecondary: "Close",
      };

    case "done":
      return {
        mood: "victory",
        emoji: "🏆",
        title: "Done",
        body: `“${titleBase}” completed. The cat purrs approvingly.`,
      };

    default:
      return {
        mood: "neutral",
        emoji: "🐾",
        title: "Update",
        body: `“${titleBase}” updated.`,
      };
  }
}
