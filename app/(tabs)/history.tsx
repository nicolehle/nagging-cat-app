// app/(tabs)/history.tsx
import { useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";

import { NudgeCard } from "@/src/features/nudges/NudgeCard";
import type { NudgeCardModel } from "@/src/features/nudges/cardModel";
import { tokens } from "@/src/theme/tokens";
import { Chip } from "@/src/ui/Chip";
import { Screen } from "@/src/ui/Screen";
import { ScreenHeader } from "@/src/ui/ScreenHeader";
import { Txt } from "@/src/ui/Txt";

type Filter = "all" | "completed" | "escalated" | "dismissed";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "escalated", label: "Escalated" },
  { id: "dismissed", label: "Dismissed" },
];

// Mock “history” dataset (UI-first)
// Later you will load from real nudges and map into the same model.
type HistoryItem = {
  id: string;
  createdAt: number;
  emoji: string;
  title: string;
  message: string; // can be ""
  from: "me" | "partner";
  timeLabel: string; // “8h ago”
  status: "done" | "escalated" | "dismissed"; // NOTE: no active/expired here
};

function makeMockHistory(): HistoryItem[] {
  const now = Date.now();
  const h = (n: number) => n * 60 * 60 * 1000;

  return [
    {
      id: "h1",
      createdAt: now - h(8),
      emoji: "✅",
      title: "Water the plants",
      message: "Thank you for watering the plants! They look so happy 🌿",
      from: "me",
      timeLabel: "8h ago",
      status: "done",
    },
    {
      id: "h2",
      createdAt: now - h(12),
      emoji: "🍳",
      title: "Morning coffee",
      message: "Made you coffee this morning ☕️",
      from: "partner",
      timeLabel: "12h ago",
      status: "done",
    },
    {
      id: "h3",
      createdAt: now - h(22),
      emoji: "📦",
      title: "Package pickup",
      message: "Your package is still waiting at the door...",
      from: "me",
      timeLabel: "22h ago",
      status: "escalated",
    },
    {
      id: "h4",
      createdAt: now - h(30),
      emoji: "🧺",
      title: "Laundry reminder",
      message: "",
      from: "partner",
      timeLabel: "1d ago",
      status: "dismissed",
    },
  ];
}

export default function History() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const partnerName = "Partner"; // later from profile/pairing

  const history = useMemo(() => makeMockHistory(), []);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return history;

    if (activeFilter === "completed") {
      return history.filter((x) => x.status === "done");
    }

    if (activeFilter === "escalated") {
      return history.filter((x) => x.status === "escalated");
    }

    if (activeFilter === "dismissed") {
      return history.filter((x) => x.status === "dismissed");
    }

    return history;
  }, [activeFilter, history]);

  const models = useMemo<NudgeCardModel[]>(() => {
    return filtered.map((x) => ({
      id: x.id,
      title: x.title,
      message: x.message, // optional display (NudgeCard already hides if empty)
      emoji: x.emoji,
      timeLabel: x.timeLabel,
      from: x.from,
      fromLabel: x.from === "me" ? "You" : partnerName,
      status: x.status,
      statusLabel:
        x.status === "done"
          ? "Done"
          : x.status === "dismissed"
          ? "Dismissed"
          : "Escalated!",
    }));
  }, [filtered, partnerName]);

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={models}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <>
            {/* Header */}
          <ScreenHeader
            icon="🕐"
            title="History"
            subtitle="Completed, escalated, and dismissed nudges"
            iconBg={tokens.colors.secondary}
          />

            {/* Chips */}
            <View style={styles.chipsWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipsRow}>
                  {filters.map((f) => (
                    <Chip
                      key={f.id}
                      label={f.label}
                      active={activeFilter === f.id}
                      onPress={() => setActiveFilter(f.id)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        }
        renderItem={({ item }) => 
          <View style={styles.cardWrap}>
            <NudgeCard variant="history" model={item} />
          </View>
      }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Txt variant="h3">No history yet</Txt>
            <Txt variant="muted">Complete, escalate, or dismiss a nudge to see it here 🐾</Txt>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipsWrap: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 8,
  },
  screen: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  list: {
    paddingBottom: 24,
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