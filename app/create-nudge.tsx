import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

import { sendNudge } from "@/src/features/nudges/api";
import { notifyNudgesChanged } from "@/src/features/nudges/events";
import { SendNudgeForm } from "@/src/features/nudges/SendNudgeForm";
import { getNudgeSession } from "@/src/features/nudges/session";
import { appImages } from "@/src/theme/assets";
import { AppTopBar } from "@/src/ui/AppTopBar";
import { Button } from "@/src/ui/Button";
import { Card } from "@/src/ui/Card";
import { Screen } from "@/src/ui/Screen";
import { Txt } from "@/src/ui/Txt";

export default function CreateNudgeScreen() {
  const [pairId, setPairId] = useState<string | null>(null);
  const [emoji, setEmoji] = useState("📣");
  const [nudgeTitle, setNudgeTitle] = useState("");
  const [nudgeMessage, setNudgeMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getNudgeSession()
      .then((session) => setPairId(session.pairId))
      .catch(() => setPairId(null));
  }, []);

  return (
    <Screen style={styles.screen} keyboardAvoiding>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <AppTopBar title="Create Nudge" centeredTitle showBack />

        <View style={styles.body}>
          <View style={styles.heroWrap}>
            <Card variant="inner" style={styles.helperCard}>
              <Txt variant="bodyStrong">A little push, not a lecture.</Txt>
              <Txt variant="meta">
                Keep it warm, clear, and short enough to read at a glance.
              </Txt>
            </Card>

            <Image source={appImages.homeHelper} style={styles.heroImage} contentFit="contain" />
          </View>

          <View style={styles.formBlock}>
            <SendNudgeForm
              emoji={emoji}
              title={nudgeTitle}
              message={nudgeMessage}
              onChangeEmoji={setEmoji}
              onChangeTitle={setNudgeTitle}
              onChangeMessage={setNudgeMessage}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          label="Create Nudge"
          loading={sending}
          disabled={!nudgeTitle.trim()}
          onPress={async () => {
            const title = nudgeTitle.trim();
            if (!title) return;

            try {
              setSending(true);
              await sendNudge({
                pairId: pairId ?? "",
                title,
                emoji,
                message: nudgeMessage,
              });
              notifyNudgesChanged();
              router.back();
            } catch (error) {
              Alert.alert(
                "Nudge error",
                error instanceof Error ? error.message : "Could not send this nudge."
              );
            } finally {
              setSending(false);
            }
          }}
          style={styles.cta}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 14,
    paddingHorizontal: 18,
  },
  scroll: {
    paddingBottom: 120,
  },
  body: {
    gap: 18,
    paddingTop: 12,
  },
  heroWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
  },
  helperCard: {
    flex: 1,
    gap: 6,
    minHeight: 120,
    justifyContent: "center",
  },
  heroImage: {
    width: 136,
    height: 156,
  },
  formBlock: {
    gap: 14,
  },
  bottomBar: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 26,
  },
  cta: {
    minHeight: 58,
    borderRadius: 22,
  },
});
