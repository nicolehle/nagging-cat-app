import { router } from "expo-router";
import { ChevronRight, LogOut } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { tokens } from "@/src/theme/tokens";
import { Card } from "@/src/ui/Card";
import { Screen } from "@/src/ui/Screen";
import { ScreenHeader } from "@/src/ui/ScreenHeader";
import { SettingButton } from "@/src/ui/SettingButton";
import { Txt } from "@/src/ui/Txt";

export default function PartnerConnection() {
  // UI-only placeholders for now
  const partnerName = "Alex";
  const partnerHandle = "@alex_loves_cats";
  const pairCode = "ABCD-1234";

  return (
    <Screen style={styles.screen}>
      <ScreenHeader
        icon="💑"
        title="Partner"
        subtitle="Connection details"
        iconBg={tokens.colors.secondary}
      />

      <View style={styles.body}>
        {/* Connected with card */}
        <Card>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Txt variant="h2">💑</Txt>
            </View>

            <View style={{ flex: 1 }}>
              <Txt variant="body" style={{ color: tokens.colors.anchor }}>
                Connected with
              </Txt>
              <Txt variant="muted" style={{ opacity: 0.6, color: tokens.colors.anchor }}>
                {partnerName} • {partnerHandle}
              </Txt>
            </View>

            <ChevronRight size={20} color={"rgba(64,60,61,0.40)"} />
          </View>

          <View style={styles.divider} />

          {/* Pair code */}
          <View style={styles.metaRow}>
            <Txt variant="muted" style={styles.metaLabel}>
              Pair Code
            </Txt>
            <View style={styles.codePill}>
              <Txt variant="label" style={{ color: tokens.colors.anchor }}>
                {pairCode}
              </Txt>
            </View>
          </View>

          <Txt variant="muted" style={styles.metaHint}>
            Share this code to reconnect on a new device.
          </Txt>
        </Card>

        <View style={{ height: 16 }} />

        {/* Disconnect */}
        <Card style={styles.cardTight}>
          <SettingButton
            icon={<LogOut size={20} color={"#d4183d"} />}
            label="Disconnect Partner"
            description="End the pairing"
            destructive
            onPress={() => {}}
          />
        </Card>

        <View style={{ height: 16 }} />

        {/* Back */}
        <SettingButton
          icon={<ChevronRight size={20} color={tokens.colors.primary} />}
          label="Back"
          description="Return to settings"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingTop: 0 },
  body: { paddingHorizontal: tokens.space.xl },

  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(64,60,61,0.10)",
    marginVertical: 12,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaLabel: { color: tokens.colors.anchor, opacity: 0.6 },

  codePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.cardInner,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  metaHint: {
    marginTop: 10,
    color: tokens.colors.anchor,
    opacity: 0.6,
  },

  cardTight: { paddingVertical: 6 },
});