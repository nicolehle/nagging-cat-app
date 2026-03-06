// app/(tabs)/index.tsx
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { tokens } from "@/src/theme/tokens";
import { Screen } from "@/src/ui/Screen";
import { ScreenHeader } from "@/src/ui/ScreenHeader";
import { SectionHeader } from "@/src/ui/SectionHeader";
import { Txt } from "@/src/ui/Txt";

import { NudgeCard } from "@/src/features/nudges/NudgeCard";
import { SendNudgeModal } from "@/src/features/nudges/SendNudgeModal";
import type { NudgeCardModel } from "@/src/features/nudges/cardModel";
import { toHomeCardModel } from "@/src/features/nudges/cardModel";
import { sortForHome } from "@/src/features/nudges/sort";
import { deriveStatus } from "@/src/features/nudges/status";
import { Nudge } from "@/src/features/nudges/types";
import { formatTimeLeft, msFromNow } from "@/src/lib/time";
import { FloatingActionButton } from "@/src/ui/FloatingActionButton";

function makeMockNudges(): Nudge[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  return [
    {
    id: "1",
  emoji: "💧",
  title: "Drink water",
      createdAt: now - 25 * 60 * 1000,
      expiresAt: now - 25 * 60 * 1000 + day,
      from: "partner",
      status: "active",
      escalationLevel: 1,
    },
    {
      id: "2",
      emoji: "📣",
      title: "Stretch 5 min",
      createdAt: now - 2 * 60 * 60 * 1000,
      expiresAt: now - 2 * 60 * 60 * 1000 + day,
      from: "me",
      status: "active",
      escalationLevel: 0,
    },
    {
      id: "3",
      emoji: "📣",
      title: "Send the email",
      createdAt: now - 26 * 60 * 60 * 1000, // expired on purpose
      expiresAt: now - 26 * 60 * 60 * 1000 + day,
      from: "partner",
      status: "active",
      escalationLevel: 3,
    },
  ];
}

type Row =
  | { kind: "header"; title: string; count: number; id: string }
  | { kind: "nudge"; nudge: Nudge; id: string };

export default function Home() {
  const [nudges, setNudges] = useState<Nudge[]>(() => makeMockNudges());
  const [modalOpen, setModalOpen] = useState(false);
  const [emoji, setEmoji] = useState("📣");
  const [nudgeTitle, setNudgeTitle] = useState("");
  const [nudgeMessage, setNudgeMessage] = useState("");
  // tick so expiry updates on screen
  useEffect(() => {
    const t = setInterval(() => setNudges((prev) => [...prev]), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const visibleNudges = useMemo(() => {
    return nudges
      .filter((n) => n.status !== "done" && n.status !== "dismissed")
      .slice()
      .sort(sortForHome);
  }, [nudges]);

  const rows = useMemo<Row[]>(() => {
    const active = visibleNudges.filter((n) => {
      const s = deriveStatus(n);
      return s === "active" || s === "escalated";
    });

    const expired = visibleNudges.filter((n) => deriveStatus(n) === "expired");

    const out: Row[] = [];
    if (active.length) {
      out.push({ kind: "header", title: "Active", count: active.length, id: "h-active" });
      out.push(...active.map((n) => ({ kind: "nudge", nudge: n, id: n.id })));
    }
    if (expired.length) {
      out.push({ kind: "header", title: "Expired", count: expired.length, id: "h-expired" });
      out.push(...expired.map((n) => ({ kind: "nudge", nudge: n, id: n.id })));
    }
    return out;
  }, [visibleNudges]);

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <>
            <ScreenHeader
              icon="📣"
              title="Active Nudges"
              subtitle="Expires in 24 hours"
              iconBg={tokens.colors.primary}
            />
          </>
        }
        renderItem={({ item }) => {
          if (item.kind === "header") {
            return (
              <View style={styles.sectionWrap}>
                <SectionHeader title={item.title} count={item.count} />
              </View>
            );
          }

          const status = deriveStatus(item.nudge);
          const statusLabel =
            status === "active" || status === "escalated"
              ? formatTimeLeft(msFromNow(item.nudge.expiresAt))
              : status === "expired"
              ? "Expired"
              : "Done";

          const model: NudgeCardModel = toHomeCardModel(item.nudge, statusLabel);

          return (
            <View style={styles.cardWrap}>
              <NudgeCard
                variant="home"
                model={model}
                onDone={(id) =>
                  setNudges((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, status: "done" } : n))
                  )
                }
                onEscalate={(id) =>
                  setNudges((prev) =>
                    prev.map((n) =>
                      n.id === id
                        ? { ...n, escalationLevel: n.escalationLevel + 1, status: "escalated" }
                        : n
                    )
                  )
                }
                onDismiss={(id) =>
                  setNudges((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, status: "dismissed" } : n))
                  )
                }
                onRenew={(id) =>
                  setNudges((prev) =>
                    prev.map((n) => {
                      if (n.id !== id) return n;
                      const now = Date.now();
                      return {
                        ...n,
                        status: "active",
                        expiresAt: now + 24 * 60 * 60 * 1000,
                        escalationLevel: 0, // recommend reset; easy to change if you want
                      };
                    })
                  )
                }
                onNudge={() => {}}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Txt variant="h3">No nudges yet</Txt>
            <Txt variant="muted">Send one above and it’ll show here.</Txt>
          </View>
        }
      />

      <FloatingActionButton onPress={() => setModalOpen(true)} />

      <SendNudgeModal
        visible={modalOpen}
        emoji={emoji}
        title={nudgeTitle}
        message={nudgeMessage}
        onChangeEmoji={setEmoji}
        onChangeTitle={setNudgeTitle}
        onChangeMessage={setNudgeMessage}
        onClose={() => setModalOpen(false)}
        onSend={() => {
          const t = nudgeTitle.trim();
          const m = nudgeMessage.trim();
          if (!t) return; // title required, message optional

          const now = Date.now();
          setNudges((prev) => [
            {
              id: String(now),
              emoji,
              title: t,
              message: m,
              createdAt: now,
              expiresAt: now + 24 * 60 * 60 * 1000,
              from: "me",
              status: "active",
              escalationLevel: 0,
            },
            ...prev,
          ]);

          setNudgeTitle("");
          setNudgeMessage("");
          setModalOpen(false);
  }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  list: {
    paddingBottom: 24,
  },
  sectionWrap: {
    paddingHorizontal: 20,
  },
  cardWrap: {
    paddingHorizontal: 20,
  },
  empty: {
    marginTop: tokens.space.xl,
    alignItems: "center",
    gap: tokens.space.sm,
    paddingHorizontal: 20,
  },
});