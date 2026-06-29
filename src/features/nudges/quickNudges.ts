import AsyncStorage from "@react-native-async-storage/async-storage";

const QUICK_NUDGES_STORAGE_KEY = "nagcat.quickNudges.v1";

export type QuickNudge = {
  id: string;
  title: string;
  emoji: string;
  createdAt: number;
};

const DEFAULT_QUICK_NUDGES: QuickNudge[] = [
  { id: "default-drink-water", title: "Drink water", emoji: "💧", createdAt: 1 },
  { id: "default-take-meds", title: "Take meds", emoji: "💊", createdAt: 2 },
  { id: "default-stretch", title: "Stretch", emoji: "🧘", createdAt: 3 },
  { id: "default-walk", title: "Walk the cat", emoji: "🐱", createdAt: 4 },
  { id: "default-check-in", title: "Check in", emoji: "✨", createdAt: 5 },
];

function isQuickNudge(value: unknown): value is QuickNudge {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<QuickNudge>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.emoji === "string" &&
    typeof item.createdAt === "number"
  );
}

function normalizeQuickNudges(value: unknown) {
  if (!Array.isArray(value)) return DEFAULT_QUICK_NUDGES;

  return value
    .filter(isQuickNudge)
    .map((item) => ({
      ...item,
      title: item.title.trim(),
      emoji: item.emoji.trim() || "📣",
    }))
    .filter((item) => item.title.length > 0)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function loadQuickNudges() {
  const raw = await AsyncStorage.getItem(QUICK_NUDGES_STORAGE_KEY);
  if (!raw) return DEFAULT_QUICK_NUDGES;

  try {
    return normalizeQuickNudges(JSON.parse(raw));
  } catch {
    return DEFAULT_QUICK_NUDGES;
  }
}

export async function saveQuickNudges(items: QuickNudge[]) {
  await AsyncStorage.setItem(QUICK_NUDGES_STORAGE_KEY, JSON.stringify(items));
}

export function createQuickNudge(title: string, emoji = "📣"): QuickNudge {
  const now = Date.now();

  return {
    id: `quick-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    emoji: emoji.trim() || "📣",
    createdAt: now,
  };
}
