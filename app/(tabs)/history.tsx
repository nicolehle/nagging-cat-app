import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { fetchHistoryNudges } from "@/src/features/nudges/api";
import { NudgeCard } from "@/src/features/nudges/NudgeCard";
import type { NudgeCardModel } from "@/src/features/nudges/cardModel";
import { getNudgeSession } from "@/src/features/nudges/session";
import type { Nudge } from "@/src/features/nudges/types";
import { Card } from "@/src/ui/Card";
import { Chip } from "@/src/ui/Chip";
import { Screen } from "@/src/ui/Screen";
import { ScreenHeader } from "@/src/ui/ScreenHeader";
import { Txt } from "@/src/ui/Txt";

type Filter = "all" | "completed" | "expired" | "dismissed";

const filters: { id: Filter; label: string; tone?: "success" | "alert" }[] = [
  { id: "all", label: "All" },
  { id: "completed", label: "Done", tone: "success" },
  { id: "expired", label: "Expired", tone: "alert" },
  { id: "dismissed", label: "Dismissed" },
];

function formatTimeAgo(timestamp: number) {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.max(1, diffDays)}d ago`;
}

export default function History() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [history, setHistory] = useState<Nudge[]>([]);
  const [pairId, setPairId] = useState<string | null>(null);
  const partnerName = "Partner";

  const loadHistory = useCallback(async (showError = false) => {
    try {
      const session = await getNudgeSession();
      setPairId(session.pairId);

      if (!session.pairId) {
        setHistory([]);
        return;
      }

      const nextHistory = await fetchHistoryNudges(session.pairId);
      setHistory(nextHistory);
    } catch (error) {
      if (showError) {
        Alert.alert(
          "History error",
          error instanceof Error ? error.message : "Could not load nudge history."
        );
      }
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const filtered = useMemo(() => {
    if (activeFilter === "all") return history;
    if (activeFilter === "completed") return history.filter((item) => item.status === "done");
    if (activeFilter === "expired") return history.filter((item) => item.status === "expired");
    return history.filter((item) => item.status === "dismissed");
  }, [activeFilter, history]);

  const models = useMemo<NudgeCardModel[]>(() => {
    return filtered.map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      emoji: item.emoji,
      timeLabel: formatTimeAgo(item.createdAt),
      from: item.from,
      fromLabel: item.from === "me" ? "You" : partnerName,
      status: item.status,
      statusLabel:
        item.status === "done"
          ? "Done"
          : item.status === "dismissed"
            ? "Dismissed"
            : "Expired",
      escalationLevel: item.escalationLevel,
    }));
  }, [filtered, partnerName]);

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={models}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <>
            <ScreenHeader
              icon="🕘"
              title="History"
              subtitle="Completed, expired, and dismissed nudges in one tidy archive."
              eyebrow="Archive"
            />

            <View style={styles.headerStack}>
              <Card variant="inner" style={styles.summaryCard}>
                <Txt variant="bodyStrong">Scan past nudges fast</Txt>
                <Txt variant="meta">
                  Status chips stay subtle so the list feels readable instead of noisy.
                </Txt>
              </Card>

              <View style={styles.chipsWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipsRow}>
                    {filters.map((filter) => (
                      <Chip
                        key={filter.id}
                        label={filter.label}
                        active={activeFilter === filter.id}
                        onPress={() => setActiveFilter(filter.id)}
                        tone={filter.tone}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <NudgeCard variant="history" model={item} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Card style={styles.emptyCard}>
              <Txt variant="h2">{pairId ? "No history yet" : "Connect to load history"}</Txt>
              <Txt variant="meta" style={styles.emptyText}>
                {pairId
                  ? "Done, expired, and dismissed nudges will show up here."
                  : "This app needs a saved pair ID to load shared nudges from Supabase."}
              </Txt>
            </Card>
          </View>
        }
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
  headerStack: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  summaryCard: {
    gap: 4,
  },
  chipsWrap: {
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 8,
  },
  cardWrap: {
    paddingHorizontal: 20,
  },
  separator: {
    height: 12,
  },
  emptyWrap: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  emptyCard: {
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    textAlign: "center",
  },
});
