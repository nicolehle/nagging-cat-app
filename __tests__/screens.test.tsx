import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import type { ReactElement } from "react";

import Home from "@/app/(tabs)";
import Settings from "@/app/(tabs)/me";
import CreateNudgeScreen from "@/app/create-nudge";
import { markDone, sendNudge } from "@/src/features/nudges/api";
import type { Nudge } from "@/src/features/nudges/types";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    push: (...args: unknown[]) => mockPush(...args),
  },
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock("@/src/features/nudges/api", () => ({
  dismiss: jest.fn(),
  escalate: jest.fn(),
  fetchActiveNudges: jest.fn(() => Promise.resolve([])),
  markDone: jest.fn(() => Promise.resolve()),
  renewExpiredNudge: jest.fn(),
  sendNudge: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/src/features/nudges/session", () => ({
  getNudgeSession: jest.fn(() => Promise.resolve({ pairId: "pair-1", deviceName: "Tester" })),
}));

jest.mock("@/src/features/nudges/useQuickNudges", () => ({
  useQuickNudges: jest.fn(() => ({
    quickNudges: [{ id: "quick-1", title: "Drink water", emoji: "💧", createdAt: 1 }],
    loading: false,
    reload: jest.fn(),
    addQuickNudge: jest.fn(() => Promise.resolve({ ok: true, error: "" })),
    removeQuickNudge: jest.fn(),
  })),
}));

jest.mock("@/src/features/pairing/usePairing", () => ({
  usePairing: jest.fn(() => ({
    pairing: { isPaired: true, partnerName: "Partner", status: "paired" },
    loading: false,
    error: "",
  })),
}));

jest.mock("@/src/features/pairing/useProfileName", () => ({
  useProfileName: jest.fn(() => ({
    name: "Tester",
    setName: jest.fn(),
    loading: false,
    saving: false,
    error: "",
    success: "",
    saveName: jest.fn(() => Promise.resolve()),
  })),
}));

describe("app screens", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function renderAndFlush(ui: ReactElement) {
    const view = render(ui);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    return view;
  }

  it("renders Home with header copy and nudge actions", async () => {
    const view = await renderAndFlush(<Home />);

    expect(await view.findByText("Time for doing the chores, Mewo!")).toBeTruthy();
    expect(view.getAllByText("Create Nudge").length).toBeGreaterThan(0);
    expect(view.getByText("Quick Nudge")).toBeTruthy();
  });

  it("opens the Quick Nudge picker and sends a selected quick nudge", async () => {
    const view = await renderAndFlush(<Home />);

    await act(async () => {
      fireEvent.press(await view.findByText("Quick Nudge"));
    });
    expect(view.getByText("Send a saved nudge in one tap.")).toBeTruthy();

    await act(async () => {
      fireEvent.press(view.getByText("Drink water"));
    });

    await waitFor(() => {
      expect(sendNudge).toHaveBeenCalledWith({
        pairId: "pair-1",
        title: "Drink water",
        emoji: "💧",
        message: "",
      });
    });
  });

  it("renders Create Nudge with the dedicated header and form", async () => {
    const view = await renderAndFlush(<CreateNudgeScreen />);

    expect(view.getAllByText("Create Nudge").length).toBeGreaterThan(0);
    expect(view.getByText("Pick the vibe")).toBeTruthy();
    expect(view.getByText("Write the nudge")).toBeTruthy();
  });

  it("renders Settings Quick Nudges management", async () => {
    const view = await renderAndFlush(<Settings />);

    expect(view.getByText("Quick Nudges")).toBeTruthy();
    expect(view.getByText("Drink water")).toBeTruthy();
    expect(view.getByPlaceholderText("Drink water")).toBeTruthy();
  });

  it("shows the completed modal after the mark-done flow succeeds", async () => {
    const { fetchActiveNudges } = jest.requireMock("@/src/features/nudges/api");
    const nudge: Nudge = {
      id: "nudge-1",
      title: "Take meds",
      emoji: "💊",
      message: "",
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000,
      from: "partner",
      status: "active",
      escalationLevel: 0,
    };
    fetchActiveNudges.mockResolvedValue([nudge]);

    const view = await renderAndFlush(<Home />);

    await act(async () => {
      fireEvent.press(await view.findByText("Mark Done"));
    });

    await waitFor(() => {
      expect(markDone).toHaveBeenCalledWith("nudge-1");
      expect(view.getByText("Nudge complete!")).toBeTruthy();
    });
  });

  it("keeps quick nudge failures visible without crashing", async () => {
    jest.mocked(sendNudge).mockRejectedValueOnce(new Error("No pair"));
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const view = await renderAndFlush(<Home />);
    await act(async () => {
      fireEvent.press(await view.findByText("Quick Nudge"));
    });
    await act(async () => {
      fireEvent.press(view.getByText("Drink water"));
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Quick Nudge error", "No pair");
    });

    alertSpy.mockRestore();
  });
});
