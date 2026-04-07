import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import {
  dismiss,
  escalate,
  fetchActiveNudges,
  markDone,
  renewExpiredNudge,
  sendNudge,
} from "@/src/features/nudges/api";
import { NudgeCard } from "@/src/features/nudges/NudgeCard";
import { SendNudgeModal } from "@/src/features/nudges/SendNudgeModal";
import type { NudgeCardModel } from "@/src/features/nudges/cardModel";
import { toHomeCardModel } from "@/src/features/nudges/cardModel";
import { getNudgeSession } from "@/src/features/nudges/session";
import { sortForHome } from "@/src/features/nudges/sort";
import { deriveStatus } from "@/src/features/nudges/status";
import type { Nudge } from "@/src/features/nudges/types";
import { formatTimeLeft, msFromNow } from "@/src/lib/time";
import { tokens } from "@/src/theme/tokens";
import { FloatingActionButton } from "@/src/ui/FloatingActionButton";
import { Screen } from "@/src/ui/Screen";
import { ScreenHeader } from "@/src/ui/ScreenHeader";
import { SectionHeader } from "@/src/ui/SectionHeader";
import { Txt } from "@/src/ui/Txt";

type Row =
  | { kind: "header"; title: string; count: number; id: string }
  | { kind: "nudge"; nudge: Nudge; id: string };

export default function Home() {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [sessionReady, setSessionReady] = useState(false);
  const [pairId, setPairId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("This device");
  const [modalOpen, setModalOpen] = useState(false);
  const [emoji, setEmoji] = useState("📣");
  const [nudgeTitle, setNudgeTitle] = useState("");
  const [nudgeMessage, setNudgeMessage] = useState("");

  const loadNudges = useCallback(async (showError = false) => {
    try {
      const session = await getNudgeSession();
      setPairId(session.pairId);
      setDeviceName(session.deviceName);
      setSessionReady(true);

      if (!session.pairId) {
        setNudges([]);
        return;
      }

      const nextNudges = await fetchActiveNudges(session.pairId, session.deviceName);
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
    }, [loadNudges])
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

  const rows = useMemo<Row[]>(() => {
    const active = visibleNudges.filter((nudge) => {
      const status = deriveStatus(nudge);
      return status === "active" || status === "escalated";
    });

    const expired = visibleNudges.filter((nudge) => deriveStatus(nudge) === "expired");
    const nextRows: Row[] = [];

    if (active.length) {
      nextRows.push({ kind: "header", title: "Active", count: active.length, id: "h-active" });
      nextRows.push(
        ...active.map(
          (nudge): Row => ({ kind: "nudge", nudge, id: nudge.id })
        )
      );
    }

    if (expired.length) {
      nextRows.push({ kind: "header", title: "Expired", count: expired.length, id: "h-expired" });
      nextRows.push(
        ...expired.map(
          (nudge): Row => ({ kind: "nudge", nudge, id: nudge.id })
        )
      );
    }

    return nextRows;
  }, [visibleNudges]);

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <ScreenHeader
            icon="📣"
            title="Active Nudges"
            subtitle="Expires in 24 hours"
            iconBg={tokens.colors.primary}
          />
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
                onDone={async (id) => {
                  try {
                    await markDone(id);
                    await loadNudges(true);
                  } catch (error) {
                    Alert.alert(
                      "Nudge error",
                      error instanceof Error
                        ? error.message
                        : "Could not mark this nudge done."
                    );
                  }
                }}
                onEscalate={async (id) => {
                  try {
                    await escalate(id, item.nudge.escalationLevel);
                    await loadNudges(true);
                  } catch (error) {
                    Alert.alert(
                      "Nudge error",
                      error instanceof Error ? error.message : "Could not escalate this nudge."
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
          <View style={styles.empty}>
            <Txt variant="h3">{sessionReady && !pairId ? "Connect to start" : "No nudges yet"}</Txt>
            <Txt variant="muted">
              {sessionReady && !pairId
                ? "This app needs a saved pair ID to load shared nudges from Supabase."
                : "Send one above and it'll show here."}
            </Txt>
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
        onSend={async () => {
          const title = nudgeTitle.trim();
          if (!title) return;

          try {
            await sendNudge({
              pairId: pairId ?? "",
              deviceName,
              title,
              emoji,
              message: nudgeMessage,
            });
            await loadNudges(true);
            setNudgeTitle("");
            setNudgeMessage("");
            setModalOpen(false);
          } catch (error) {
            Alert.alert(
              "Nudge error",
              error instanceof Error ? error.message : "Could not send this nudge."
            );
          }
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
