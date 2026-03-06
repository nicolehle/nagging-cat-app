import { tokens } from "@/src/theme/tokens";
import { Button } from "@/src/ui/Button";
import { Card } from "@/src/ui/Card";
import { Screen } from "@/src/ui/Screen";
import { SettingsRow } from "@/src/ui/SettingsRow";
import { SettingsSection } from "@/src/ui/SettingsSection";
import { Txt } from "@/src/ui/Txt";
import { StyleSheet, View } from "react-native";

export default function Me() {
  return (
    <Screen>
      <View style={styles.header}>
        <Txt variant="h1">Me</Txt>
        <Txt variant="muted" style={{ opacity: 0.7 }}>
          Partner, notifications, and vibe
        </Txt>
      </View>

      {/* Partner Connection */}
      <SettingsSection title="Partner Connection">
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Txt variant="h2">😺</Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="h2">Nicole</Txt>
            <Txt variant="muted" style={{ opacity: 0.7 }}>
              Paired with Partner
            </Txt>
          </View>
        </View>

        <View style={{ height: tokens.space.md }} />

        <View style={styles.profileBtns}>
          <Button label="Invite" variant="ghost" style={{ flex: 1 }} onPress={() => {}} />
          <Button label="Manage" style={{ flex: 1 }} onPress={() => {}} />
        </View>

        <View style={styles.divider} />
        <SettingsRow icon="🔗" title="Pair status" subtitle="Connected" rightText="Online" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="📎" title="Invite link" subtitle="Share with partner" onPress={() => {}} />
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications">
        <SettingsRow icon="🔔" title="Push notifications" subtitle="On this device" rightText="On" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="⏰" title="Quiet hours" subtitle="Do not disturb schedule" rightText="Off" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="📦" title="Bundled nudges" subtitle="“3 nudges pending”" rightText="On" onPress={() => {}} />
      </SettingsSection>

      {/* Behavior */}
      <SettingsSection title="Behavior">
        <SettingsRow icon="🐾" title="Nudge tone" subtitle="How sassy is the cat?" rightText="Sweet" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="📈" title="Escalation style" subtitle="When nudges get stronger" rightText="Gentle" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="🎭" title="Reactions" subtitle="Stickers & micro-reactions" rightText="On" onPress={() => {}} />
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection title="Appearance">
        <SettingsRow icon="🎨" title="Theme" subtitle="Warm Sunset Mischief" rightText="Light" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="🔤" title="Font" subtitle="Nunito" rightText="Default" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="✨" title="Card style" subtitle="Paper / texture" rightText="On" onPress={() => {}} />
      </SettingsSection>

      {/* Optional: A tiny “More later” placeholder */}
      <Card style={{ padding: tokens.space.lg }}>
        <Txt variant="muted" style={{ opacity: 0.7 }}>
          More settings (privacy, help, about) will live in “More” later.
        </Txt>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: tokens.space.lg,
  },
  profileRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.bgTexture,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBtns: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginHorizontal: 14,
  },
});