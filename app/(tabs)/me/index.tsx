import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { FavoriteEmojiRow } from "@/src/features/nudges/FavoriteEmojiRow";
import { usePairing } from "@/src/features/pairing/usePairing";
import { useProfileName } from "@/src/features/pairing/useProfileName";
import { useQuickNudges } from "@/src/features/nudges/useQuickNudges";
import { tokens } from "@/src/theme/tokens";
import { Button } from "@/src/ui/Button";
import { Card } from "@/src/ui/Card";
import { Input } from "@/src/ui/Input";
import { Screen } from "@/src/ui/Screen";
import { ScreenHeader } from "@/src/ui/ScreenHeader";
import { Txt } from "@/src/ui/Txt";
import {
  Bell,
  ChevronRight,
  Heart,
  Moon,
  Trash2,
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
  const [newQuickNudgeTitle, setNewQuickNudgeTitle] = useState("");
  const [newQuickNudgeEmoji, setNewQuickNudgeEmoji] = useState("📣");
  const [quickNudgeError, setQuickNudgeError] = useState("");
  const { quickNudges, addQuickNudge, removeQuickNudge } = useQuickNudges();
  const { pairing, loading, error } = usePairing();
  const {
    name,
    setName,
    loading: profileLoading,
    authReady: profileAuthReady,
    authUserId: profileAuthUserId,
    saving: profileSaving,
    error: profileError,
    success: profileSuccess,
    saveName,
  } = useProfileName();

  const connectedName = pairing?.partnerName ?? "Partner";
  const canEditProfile = profileAuthReady && Boolean(profileAuthUserId);

  const partnerSummary = loading
    ? "Checking your pair..."
    : pairing?.isPaired
      ? `Connected with ${connectedName}`
      : pairing?.status === "pending"
        ? `Invite code: ${pairing.inviteCode ?? "Unavailable"}`
        : "Not connected yet";

  const partnerLabel = loading
    ? "Partner status"
    : pairing?.isPaired
      ? "Connected with"
      : pairing?.status === "pending"
        ? "Waiting for partner"
        : "Ready to pair";

  return (
    <Screen style={styles.screen} keyboardAvoiding>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <ScreenHeader
          icon="⚙️"
          title="Settings"
        />

        <View style={styles.body}>
          {/* <Card style={styles.heroCard}>
            <Txt variant="h2">Cute, but capable.</Txt>
            <Txt variant="meta">
              Tidy up your profile, pairing, and reminder preferences from one calm control panel.
            </Txt>
            <View style={styles.heroChips}>
              <Chip label={notifications ? "Notifications on" : "Notifications off"} active={notifications} />
              <Chip label={quietMode ? "Quiet mode" : "Always ready"} tone="accent" />
            </View>
          </Card> */}

          <View>
            <Txt variant="label" style={styles.sectionLabel}>
              Profile
            </Txt>

            <Card>
              <View style={styles.formWrap}>
                <Input
                  label="Your name"
                  hint="This is the name your paired person will see."
                  value={profileLoading ? "" : name}
                  onChangeText={setName}
                  placeholder="Enter your name or nickname"
                  editable={canEditProfile && !profileLoading && !profileSaving}
                />

                <Button
                  label="Save name"
                  onPress={() => {
                    saveName(name).then(() => {});
                  }}
                  loading={profileSaving}
                  disabled={!canEditProfile || profileLoading || !name.trim()}
                />

                {profileError ? (
                  <Txt variant="caption" style={styles.errorText}>
                    {profileError}
                  </Txt>
                ) : null}
                {profileSuccess ? (
                  <Txt variant="caption" style={styles.successText}>
                    {profileSuccess}
                  </Txt>
                ) : null}
              </View>
            </Card>
          </View>

          <View>
            <Txt variant="label" style={styles.sectionLabel}>
              Partner connection
            </Txt>

            <Card>
              <Pressable
                onPress={() => router.push("/(tabs)/me/partner")}
                style={({ pressed }) => [styles.partnerRow, pressed && styles.pressedRow]}
              >
                <View style={styles.partnerAvatar}>
                  <Txt variant="h2">🐱</Txt>
                </View>

                <View style={styles.partnerCopy}>
                  <Txt variant="bodyStrong">{partnerLabel}</Txt>
                  <Txt variant="meta">{partnerSummary}</Txt>
                  {error ? (
                    <Txt variant="caption" style={styles.errorText}>
                      {error}
                    </Txt>
                  ) : null}
                </View>

                <ChevronRight size={20} color={tokens.colors.textTertiary} />
              </Pressable>
            </Card>
          </View>

          <View>
            <Txt variant="label" style={styles.sectionLabel}>
              Quick Nudges
            </Txt>

            <Card style={styles.quickNudgeCard}>
              {quickNudges.length ? (
                <View style={styles.quickNudgeList}>
                  {quickNudges.map((item) => (
                    <View key={item.id} style={styles.quickNudgeRow}>
                      <View style={styles.quickNudgeEmoji}>
                        <Txt variant="h3">{item.emoji}</Txt>
                      </View>
                      <Txt variant="bodyStrong" style={styles.quickNudgeTitle}>
                        {item.title}
                      </Txt>
                      <Pressable onPress={() => removeQuickNudge(item.id)} hitSlop={10}>
                        <Trash2 size={18} color={tokens.colors.textTertiary} strokeWidth={2} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Txt variant="meta">No quick nudges yet.</Txt>
              )}

              <View style={styles.quickNudgeForm}>
                <FavoriteEmojiRow value={newQuickNudgeEmoji} onChange={setNewQuickNudgeEmoji} />
                <Input
                  label="Add quick nudge"
                  value={newQuickNudgeTitle}
                  onChangeText={(value) => {
                    setNewQuickNudgeTitle(value);
                    setQuickNudgeError("");
                  }}
                  placeholder="Drink water"
                />
                <Button
                  label="Add"
                  variant="secondary"
                  disabled={!newQuickNudgeTitle.trim()}
                  onPress={async () => {
                    const result = await addQuickNudge(newQuickNudgeTitle, newQuickNudgeEmoji);
                    if (result.ok) {
                      setNewQuickNudgeTitle("");
                      setNewQuickNudgeEmoji("📣");
                      setQuickNudgeError("");
                    } else {
                      setQuickNudgeError(result.error);
                    }
                  }}
                />
                {quickNudgeError ? (
                  <Txt variant="caption" style={styles.errorText}>
                    {quickNudgeError}
                  </Txt>
                ) : null}
              </View>
            </Card>
          </View>

          <View>
            <Txt variant="label" style={styles.sectionLabel}>
              Notifications
            </Txt>

            <Card style={styles.cardTight}>
              <SettingRow
                icon={<Bell size={20} color={tokens.colors.primary} strokeWidth={2} />}
                label="Push notifications"
                description="Get notified when you receive nudges."
                value={notifications}
                onChange={setNotifications}
              />
              <View style={styles.divider} />
              <SettingRow
                icon={<Moon size={20} color={tokens.colors.primary} strokeWidth={2} />}
                label="Quiet mode"
                description="Mute notifications from 10 PM to 8 AM."
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
                icon={<Zap size={20} color={tokens.colors.primary} strokeWidth={2} />}
                label="Auto-escalate"
                description="Use evening reminder checkpoints."
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
                icon={<Sparkles size={20} color={tokens.colors.primary} strokeWidth={2} />}
                label="GIPHY stickers"
                description="Use fun GIF stickers instead of Lottie."
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
                icon={<Heart size={20} color={tokens.colors.primary} strokeWidth={2} />}
                label="Share NagCat"
                description="Spread the love."
                onPress={() => {}}
              />
            </Card>
          </View>

          <View style={styles.footer}>
            <Txt variant="caption" style={styles.footerText}>
              NagCat v1.0.0
            </Txt>
            <Txt variant="caption" style={styles.footerText}>
              Made with care for couples who care
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
    gap: 18,
  },
  heroCard: {
    gap: 8,
  },
  heroChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  sectionLabel: {
    color: tokens.colors.textSecondary,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  cardTight: {
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginHorizontal: 16,
  },
  formWrap: {
    gap: 14,
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  partnerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F7FB",
    borderWidth: 1,
    borderColor: "#CFEAF1",
  },
  partnerCopy: {
    flex: 1,
    gap: 2,
  },
  quickNudgeCard: {
    gap: 16,
  },
  quickNudgeList: {
    gap: 10,
  },
  quickNudgeRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  quickNudgeEmoji: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  quickNudgeTitle: {
    flex: 1,
  },
  quickNudgeForm: {
    gap: 10,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  footerText: {
    color: tokens.colors.textTertiary,
  },
  errorText: {
    color: tokens.colors.alert,
    marginTop: 4,
  },
  successText: {
    color: tokens.colors.success,
    marginTop: 4,
  },
  pressedRow: {
    opacity: 0.9,
  },
});
