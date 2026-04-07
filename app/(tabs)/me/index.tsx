import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { usePairing } from "@/src/features/pairing/usePairing";
import { tokens } from "@/src/theme/tokens";
import { Card } from "@/src/ui/Card";
import { Screen } from "@/src/ui/Screen";
import { ScreenHeader } from "@/src/ui/ScreenHeader";
import { Txt } from "@/src/ui/Txt";
import {
  Bell,
  ChevronRight,
  Heart,
  Moon,
  Sparkles,
  Zap,
} from "lucide-react-native";

import { SettingButton } from "@/src/ui/SettingButton";
import { SettingRow } from "@/src/ui/SettingRow";

export default function Me() {
  const [notifications, setNotifications] = useState(true);
  const [quietMode, setQuietMode] = useState(false);
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [useGiphy, setUseGiphy] = useState(false);
  const { pairing, loading, error } = usePairing();

  const partnerSummary = loading
    ? "Checking your pair..."
    : pairing?.status === "paired"
      ? "Connected with your partner"
      : pairing?.status === "pending"
        ? `Invite code: ${pairing.inviteCode ?? "Unavailable"}`
        : "Not connected yet";

  const partnerLabel = loading
    ? "Partner status"
    : pairing?.status === "paired"
      ? "Connected with"
      : pairing?.status === "pending"
        ? "Waiting for partner"
        : "Ready to pair";

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          icon="👤"
          title="Settings"
          subtitle="Customize your NagCat experience"
          iconBg={tokens.colors.accent}
        />

        <View style={styles.body}>
          <View>
            <Txt variant="label" style={styles.sectionLabel}>
              Partner Connection
            </Txt>

            <Card>
              <Pressable
                onPress={() => router.push("/(tabs)/me/partner")}
                style={({ pressed }) => [styles.partnerRow, pressed && styles.pressedRow]}
              >
                <View style={styles.partnerAvatar}>
                  <Txt variant="h2">💑</Txt>
                </View>

                <View style={{ flex: 1 }}>
                  <Txt variant="body" style={{ color: tokens.colors.anchor }}>
                    {partnerLabel}
                  </Txt>
                  <Txt variant="muted" style={{ opacity: 0.6, color: tokens.colors.anchor }}>
                    {partnerSummary}
                  </Txt>
                  {error ? (
                    <Txt variant="muted" style={styles.errorText}>
                      {error}
                    </Txt>
                  ) : null}
                </View>

                <ChevronRight size={20} color={"rgba(64,60,61,0.40)"} />
              </Pressable>
            </Card>
          </View>

          <View>
            <Txt variant="label" style={styles.sectionLabel}>
              Notifications
            </Txt>

            <Card style={styles.cardTight}>
              <SettingRow
                icon={<Bell size={20} color={tokens.colors.primary} />}
                label="Push Notifications"
                description="Get notified when you receive nudges"
                value={notifications}
                onChange={setNotifications}
              />
              <View style={styles.divider} />
              <SettingRow
                icon={<Moon size={20} color={tokens.colors.primary} />}
                label="Quiet Mode"
                description="Mute notifications from 10PM to 8AM"
                value={quietMode}
                onChange={setQuietMode}
              />
            </Card>
          </View>

          <View>
            <Txt variant="label" style={styles.sectionLabel}>
              Behavior
            </Txt>

            <Card style={styles.cardTight}>
              <SettingRow
                icon={<Zap size={20} color={tokens.colors.primary} />}
                label="Auto-Escalate"
                description="Escalate nudges after 6 hours"
                value={autoEscalate}
                onChange={setAutoEscalate}
              />
            </Card>
          </View>

          <View>
            <Txt variant="label" style={styles.sectionLabel}>
              Appearance
            </Txt>

            <Card style={styles.cardTight}>
              <SettingRow
                icon={<Sparkles size={20} color={tokens.colors.primary} />}
                label="GIPHY Stickers"
                description="Use fun GIF stickers instead of Lottie"
                value={useGiphy}
                onChange={setUseGiphy}
              />
            </Card>
          </View>

          <View>
            <Txt variant="label" style={styles.sectionLabel}>
              More
            </Txt>

            <Card style={styles.cardTight}>
              <SettingButton
                icon={<Heart size={20} color={tokens.colors.primary} />}
                label="Share NagCat"
                description="Spread the love"
                onPress={() => {}}
              />
            </Card>
          </View>

          <View style={styles.footer}>
            <Txt variant="muted" style={styles.footerText}>
              NagCat v1.0.0
            </Txt>
            <Txt variant="muted" style={styles.footerText}>
              Made with 💕 for couples who care
            </Txt>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  scroll: {
    paddingBottom: 24,
  },
  body: {
    paddingHorizontal: tokens.space.xl,
    gap: 16,
  },
  sectionLabel: {
    color: tokens.colors.anchor,
    opacity: 0.6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  cardTight: {
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(64,60,61,0.10)",
    marginHorizontal: 14,
    marginVertical: 10,
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 8,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.primary,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  footerText: {
    color: tokens.colors.anchor,
    opacity: 0.4,
  },
  errorText: {
    color: "#d4183d",
    opacity: 1,
    marginTop: 4,
  },
  pressedRow: {
    backgroundColor: "rgba(64,60,61,0.03)",
    borderRadius: tokens.radius.md,
  },
});
