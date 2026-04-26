import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, ScrollView, StyleSheet, View } from "react-native";

import { fetchActiveNudges, fetchHistoryNudges } from "@/src/features/nudges/api";
import type { NudgeCardModel } from "@/src/features/nudges/cardModel";
import { NudgeCard } from "@/src/features/nudges/NudgeCard";
import { getNudgeSession } from "@/src/features/nudges/session";
import type { Nudge } from "@/src/features/nudges/types";
import { AppTopBar } from "@/src/ui/AppTopBar";
import { Card } from "@/src/ui/Card";
import { Chip } from "@/src/ui/Chip";
import { Screen } from "@/src/ui/Screen";
import { Txt } from "@/src/ui/Txt";

type Filter = "active" | "all" | "completed" | "expired" | "dismissed";

const filters: { id: Filter; label: string; tone?: "success" | "alert" | "accent" }[] = [
  { id: "active", label: "Active", tone: "accent" },
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
  const params = useLocalSearchParams<{ filter?: string }>();
  const initialFilter = params.filter === "active" ? "active" : "all";
  const [activeFilter, setActiveFilter] = useState<Filter>(initialFilter);
  const [history, setHistory] = useState<Nudge[]>([]);
  const [pairId, setPairId] = useState<string | null>(null);
  const partnerName = "Partner";

  useEffect(() => {
    if (params.filter === "active") {
      setActiveFilter("active");
    }
  }, [params.filter]);

  const loadHistory = useCallback(async (showError = false) => {
    try {
      const session = await getNudgeSession();
      setPairId(session.pairId);

      if (!session.pairId) {
        setHistory([]);
        return;
      }

      const [activeNudges, historyNudges] = await Promise.all([
        fetchActiveNudges(session.pairId),
        fetchHistoryNudges(session.pairId),
      ]);

      const merged = [...activeNudges, ...historyNudges].reduce<Nudge[]>((acc, item) => {
        if (!acc.some((existing) => existing.id === item.id)) {
          acc.push(item);
        }
        return acc;
      }, []);

      setHistory(merged);
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
    if (activeFilter === "active") return history.filter((item) => item.status === "active" || item.status === "evening_reminder" || item.status === "final_warning");
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
            : item.status === "expired"
              ? "Expired"
              : "Active",
      escalationLevel: item.escalationLevel,
    }));
  }, [filtered, partnerName]);

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={models}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <AppTopBar logo />

            <View style={styles.titleWrap}>
              <Txt variant="h2">All nudges</Txt>
            </View>

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
        }
        renderItem={({ item }) => <NudgeCard variant="history" model={item} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Card style={styles.emptyCard}>
              <Txt variant="h2">{pairId ? "No nudges here yet" : "Connect to load nudges"}</Txt>
              <Txt variant="meta" style={styles.emptyText}>
                {pairId
                  ? "Try another filter or create a new nudge."
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
    paddingTop: 14,
    paddingHorizontal: 18,
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  headerContent: {
    gap: 16,
    paddingBottom: 6,
  },
  titleWrap: {
    gap: 4,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  separator: {
    height: 0,
  },
  emptyWrap: {
    paddingTop: 6,
  },
  emptyCard: {
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    textAlign: "center",
  },
});
