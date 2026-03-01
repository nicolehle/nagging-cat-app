// app/(tabs)/history.tsx
import { useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";

import { tokens } from "@/src/theme/tokens";
import { Chip } from "@/src/ui/Chip";
import { Screen } from "@/src/ui/Screen";
import { Txt } from "@/src/ui/Txt";

import { NudgeCard } from "@/src/features/nudges/NudgeCard";
import type { NudgeCardModel } from "@/src/features/nudges/cardModel";

type Filter = "all" | "today" | "yesterday" | "completed" | "escalated";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "completed", label: "Completed" },
  { id: "escalated", label: "Escalated" },
];

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function isToday(ts: number) {
  const now = Date.now();
  return startOfDay(ts) === startOfDay(now);
}

function isYesterday(ts: number) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  return startOfDay(ts) === startOfDay(now - oneDay);
}

// Mock “history” dataset (UI-first)
// Later you will load from DB and map into the same model.
type HistoryItem = {
  id: string;
  createdAt: number;
  emoji: string;
  title: string;
  message: string;
  from: "me" | "partner";
  timeLabel: string; // “8h ago”
  status: "active" | "done" | "escalated" | "expired";
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
      createdAt: now - h(14),
      emoji: "🐱",
      title: "Feed the cat",
      message: "Mr. Whiskers says thank you 😸",
      from: "me",
      timeLabel: "14h ago",
      status: "done",
    },
    {
      id: "h4",
      createdAt: now - h(18),
      emoji: "🚗",
      title: "Car wash",
      message: "The car is all clean and shiny now!",
      from: "partner",
      timeLabel: "18h ago",
      status: "done",
    },
    {
      id: "h5",
      createdAt: now - h(22),
      emoji: "📦",
      title: "Package pickup",
      message: "Your package is still waiting at the door...",
      from: "me",
      timeLabel: "22h ago",
      status: "escalated",
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

    if (activeFilter === "today") {
      return history.filter((x) => isToday(x.createdAt));
    }

    if (activeFilter === "yesterday") {
      return history.filter((x) => isYesterday(x.createdAt));
    }

    return history;
  }, [activeFilter, history]);

  const models = useMemo<NudgeCardModel[]>(() => {
    return filtered.map((x) => ({
      id: x.id,
      title: x.title,
      message: x.message,
      emoji: x.emoji,
      timeLabel: x.timeLabel,
      from: x.from,
      fromLabel: x.from === "me" ? "You" : partnerName,
      status: x.status,
      statusLabel:
        x.status === "done"
          ? "Done"
          : x.status === "expired"
          ? "Expired"
          : x.status === "escalated"
          ? "Escalated!"
          : "Active",
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
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <View style={styles.headerIcon}>
                  <Txt variant="h3">🕐</Txt>
                </View>
                <Txt variant="h1">History</Txt>
              </View>

              <Txt variant="muted" style={styles.subtitle}>
                Past nudges and completed tasks
              </Txt>
            </View>

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
        renderItem={({ item }) => (
          <NudgeCard
            variant="history"
            model={item}
            // no actions in history
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Txt variant="h3">No history yet</Txt>
            <Txt variant="muted">Once you send nudges, they’ll show up here.</Txt>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Let History control its own padding like Figma (header spacing differs from Home)
  screen: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },

  header: {
    paddingHorizontal: 20, // px-5
    paddingTop: 24, // pt-6
    paddingBottom: 16, // pb-4
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.secondary, // #FFA56A
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    opacity: 0.6,
  },

  chipsWrap: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 8,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  empty: {
    marginTop: tokens.space.xl,
    alignItems: "center",
    gap: tokens.space.sm,
  },
});