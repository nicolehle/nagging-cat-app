import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@/src/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("@/src/features/pairing/localUser", () => ({
  getCurrentLocalUserId: jest.fn(() => Promise.resolve("me-1")),
}));

import { buildSendNudgeInsertPayload } from "@/src/features/nudges/api";
import { getDirectionLabel, getHomeStatusLabel } from "@/src/features/nudges/labels";
import {
  deriveLifecycleStatus,
  getInitialNudgeSchedule,
} from "@/src/features/nudges/policy";
import { createQuickNudge, loadQuickNudges, saveQuickNudges } from "@/src/features/nudges/quickNudges";

describe("nudge logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shapes the create nudge insert payload with trimmed values and policy dates", () => {
    const now = new Date("2026-06-09T12:00:00.000Z");

    const payload = buildSendNudgeInsertPayload({
      pairId: "pair-1",
      title: "  Drink water  ",
      emoji: " 💧 ",
      message: "  tiny sip  ",
      fromUserId: "me-1",
      toUserId: "partner-1",
      now,
    });

    expect(payload).toEqual(
      expect.objectContaining({
        pair_id: "pair-1",
        title: "Drink water",
        status: "pending",
        from_user_id: "me-1",
        to_user_id: "partner-1",
        last_event: "created",
        last_event_at: now.toISOString(),
        emoji: "💧",
        message: "tiny sip",
      })
    );
    expect(payload.expires_at).toEqual(expect.any(String));
    expect(payload.escalation_level).toEqual(expect.any(Number));
  });

  it("creates and persists quick nudges with their emoji", async () => {
    const item = createQuickNudge("  Stretch  ", "🧘");

    await saveQuickNudges([item]);
    const loaded = await loadQuickNudges();

    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toEqual(expect.objectContaining({ title: "Stretch", emoji: "🧘" }));
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it("loads editable default quick nudges on first use", async () => {
    await AsyncStorage.clear();

    const loaded = await loadQuickNudges();

    expect(loaded.map((item) => item.title)).toEqual([
      "Drink water",
      "Take meds",
      "Stretch",
      "Walk the cat",
      "Check in",
    ]);
  });

  it("supports quick nudge removal by saving the remaining list", async () => {
    const first = createQuickNudge("Drink water", "💧");
    const second = createQuickNudge("Take meds", "💊");

    await saveQuickNudges([first, second]);
    await saveQuickNudges([second]);

    expect((await loadQuickNudges()).map((item) => item.title)).toEqual(["Take meds"]);
  });

  it("returns stable card labels", () => {
    expect(getDirectionLabel("partner")).toBe("From Partner");
    expect(getDirectionLabel("me")).toBe("To Partner");
    expect(getHomeStatusLabel("active")).toBe("Due today");
    expect(getHomeStatusLabel("expired")).toBe("Expired");
  });

  it("derives nudge policy status from due-day thresholds", () => {
    const now = new Date("2026-06-09T12:00:00.000Z");
    const schedule = getInitialNudgeSchedule(now);

    expect(schedule.expiresAt.getHours()).toBe(22);
    expect(
      deriveLifecycleStatus({
        baseStatus: "pending",
        escalationLevel: 0,
        expiresAt: schedule.expiresAt.getTime(),
        now: schedule.expiresAt.getTime() + 1,
      })
    ).toBe("expired");
  });
});
