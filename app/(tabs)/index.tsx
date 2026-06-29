import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";

import {
  dismiss,
  escalate,
  fetchActiveNudges,
  markDone,
  renewExpiredNudge,
  sendNudge,
} from "@/src/features/nudges/api";
import type { NudgeCardModel } from "@/src/features/nudges/cardModel";
import { toHomeCardModel } from "@/src/features/nudges/cardModel";
import { CompletedNudgeModal } from "@/src/features/nudges/CompletedNudgeModal";
import { getHomeStatusLabel } from "@/src/features/nudges/labels";
import { NudgeCard } from "@/src/features/nudges/NudgeCard";
import { QuickNudgePicker } from "@/src/features/nudges/QuickNudgePicker";
import { getNudgeSession } from "@/src/features/nudges/session";
import { sortForHome } from "@/src/features/nudges/sort";
import { deriveStatus } from "@/src/features/nudges/status";
import type { Nudge } from "@/src/features/nudges/types";
import { useQuickNudges } from "@/src/features/nudges/useQuickNudges";
import { appImages } from "@/src/theme/assets";
import { tokens } from "@/src/theme/tokens";
import { AppTopBar } from "@/src/ui/AppTopBar";
import { Button } from "@/src/ui/Button";
import { Card } from "@/src/ui/Card";
import { Screen } from "@/src/ui/Screen";
import { Txt } from "@/src/ui/Txt";

type Row =
  | { kind: "header"; title: string; count: number; id: string }
  | { kind: "nudge"; nudge: Nudge; id: string };

export default function Home() {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [sessionReady, setSessionReady] = useState(false);
  const [pairId, setPairId] = useState<string | null>(null);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const [completedNudge, setCompletedNudge] = useState<NudgeCardModel | null>(null);
  const [quickPickerOpen, setQuickPickerOpen] = useState(false);
  const [sendingQuickId, setSendingQuickId] = useState<string | null>(null);
  const { quickNudges, reload: reloadQuickNudges } = useQuickNudges();

  const loadNudges = useCallback(async (showError = false) => {
    try {
      const session = await getNudgeSession();
      setPairId(session.pairId);
      setSessionReady(true);

      if (!session.pairId) {
        setNudges([]);
        return;
      }

      const nextNudges = await fetchActiveNudges(session.pairId);
      setNudges(nextNudges);
    } catch (error) {
      if (showError) {
        Alert.alert(
          "Nudge error",
          error instanceof Error ? error.message : "Something went wrong."
        );
      }
    }
  }, []);

  useEffect(() => {
    loadNudges();
  }, [loadNudges]);

  useFocusEffect(
    useCallback(() => {
      loadNudges();
      reloadQuickNudges();
    }, [loadNudges, reloadQuickNudges])
  );

  useEffect(() => {
    const timer = setInterval(() => setNudges((prev) => [...prev]), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const visibleNudges = useMemo(() => {
    return nudges
      .filter((nudge) => nudge.status !== "done" && nudge.status !== "dismissed")
      .slice()
      .sort(sortForHome);
  }, [nudges]);

  const activeNudges = useMemo(
    () =>
      visibleNudges.filter((nudge) => {
        const status = deriveStatus(nudge);
        return (
          status === "active" || status === "evening_reminder" || status === "final_warning"
        );
      }),
    [visibleNudges]
  );

  const rows = useMemo<Row[]>(() => {
    const expired = visibleNudges.filter((nudge) => deriveStatus(nudge) === "expired");
    const nextRows: Row[] = [];

    if (activeNudges.length) {
      nextRows.push({
        kind: "header",
        title: "Active nudges",
        count: activeNudges.length,
        id: "h-active",
      });
      nextRows.push(...activeNudges.map((nudge): Row => ({ kind: "nudge", nudge, id: nudge.id })));
    }

    if (expired.length) {
      nextRows.push({
        kind: "header",
        title: "Needs attention",
        count: expired.length,
        id: "h-expired",
      });
      nextRows.push(...expired.map((nudge): Row => ({ kind: "nudge", nudge, id: nudge.id })));
    }

    return nextRows;
  }, [activeNudges, visibleNudges]);

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <AppTopBar logo />

            <View style={styles.heroCard}>
              <View style={styles.heroCopy}>
                <Txt variant="hero" style={styles.heroTitle}>
                  Time for doing the chores, Mewo!
                </Txt>
              </View>

              <Image source={appImages.megaphone} style={styles.heroArt} contentFit="contain" />
            </View>

            <View style={styles.sectionHead}>
              <Txt variant="h2">Active nudges</Txt>
              <Pressable onPress={() => router.push("/(tabs)/history?filter=active")} hitSlop={10}>
                <Txt variant="label" style={styles.viewAll}>
                  View all
                </Txt>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if (item.kind === "header") {
            if (item.id === "h-active") {
              return null;
            }

            return (
              <View style={styles.secondarySectionHead}>
                <Txt variant="h2">{item.title}</Txt>
              </View>
            );
          }

          const status = deriveStatus(item.nudge);
          const statusLabel = getHomeStatusLabel(status);

          const model: NudgeCardModel = toHomeCardModel(item.nudge, statusLabel);

          return (
            <View style={styles.cardWrap}>
              <NudgeCard
                variant="home"
                model={model}
                onDone={async (id) => {
                  try {
                    await markDone(id);
                    setCompletedNudge({
                      ...model,
                      status: "done",
                      statusLabel: "Completed just now",
                    });
                    setCompletedModalOpen(true);
                    await loadNudges(true);
                  } catch (error) {
                    Alert.alert(
                      "Nudge error",
                      error instanceof Error ? error.message : "Could not mark this nudge done."
                    );
                  }
                }}
                onDismiss={async (id) => {
                  try {
                    await dismiss(id);
                    await loadNudges(true);
                  } catch (error) {
                    Alert.alert(
                      "Nudge error",
                      error instanceof Error ? error.message : "Could not dismiss this nudge."
                    );
                  }
                }}
                onRenew={async (id) => {
                  try {
                    await renewExpiredNudge(id);
                    await loadNudges(true);
                  } catch (error) {
                    Alert.alert(
                      "Nudge error",
                      error instanceof Error ? error.message : "Could not renew this nudge."
                    );
                  }
                }}
                onNudge={async (id) => {
                  try {
                    await escalate(id, item.nudge.escalationLevel);
                    await loadNudges(true);
                  } catch (error) {
                    Alert.alert(
                      "Nudge error",
                      error instanceof Error ? error.message : "Could not nudge right now."
                    );
                  }
                }}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Card style={styles.emptyCard}>
              <Txt variant="h2">{sessionReady && !pairId ? "Connect to start" : "No nudges yet"}</Txt>
              <Txt variant="meta" style={styles.emptyText}>
                {sessionReady && !pairId
                  ? "This app needs a saved pair ID to load shared nudges from Supabase."
                  : "Create a nudge and it will show up here as a tidy card."}
              </Txt>
            </Card>
          </View>
        }
      />

      <View style={styles.bottomCta}>
        <Button
          label="Quick Nudge"
          variant="secondary"
          onPress={() => setQuickPickerOpen(true)}
          style={styles.quickButton}
        />
        <Button
          label="Create Nudge"
          onPress={() => router.push("/create-nudge")}
          style={styles.createButton}
        />
      </View>

      <QuickNudgePicker
        visible={quickPickerOpen}
        quickNudges={quickNudges}
        sendingId={sendingQuickId}
        onClose={() => setQuickPickerOpen(false)}
        onManage={() => {
          setQuickPickerOpen(false);
          router.push("/(tabs)/me");
        }}
        onSelect={async (item) => {
          try {
            setSendingQuickId(item.id);
            await sendNudge({
              pairId: pairId ?? "",
              title: item.title,
              emoji: item.emoji,
              message: "",
            });
            setQuickPickerOpen(false);
            await loadNudges(true);
          } catch (error) {
            Alert.alert(
              "Quick Nudge error",
              error instanceof Error ? error.message : "Could not send this quick nudge."
            );
          } finally {
            setSendingQuickId(null);
          }
        }}
      />

      <CompletedNudgeModal
        visible={completedModalOpen}
        model={completedNudge}
        onClose={() => setCompletedModalOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
    paddingTop: 14,
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 130,
    gap: 12,
  },
  headerContent: {
    gap: 18,
    paddingBottom: 4,
  },
  heroCard: {
    minHeight: 150,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroCopy: {
    flex: 1,
    maxWidth: "70%",
    gap: 4,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 39,
  },
  heroText: {
    marginTop: 8,
    paddingRight: 8,
  },
  heroArt: {
    width: 150,
    height: 170,
    marginTop: 10,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  secondarySectionHead: {
    paddingTop: 6,
    paddingHorizontal: 2,
  },
  viewAll: {
    color: tokens.colors.primary,
  },
  cardWrap: {},
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
  bottomCta: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 22,
    flexDirection: "row",
    gap: 10,
  },
  quickButton: {
    minHeight: 58,
    borderRadius: 22,
    paddingHorizontal: 18,
  },
  createButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 22,
  },
});
