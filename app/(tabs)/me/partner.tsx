import { router } from "expo-router";
import { useState } from "react";
import { ChevronRight, LogOut } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { usePairing } from "@/src/features/pairing/usePairing";
import { tokens } from "@/src/theme/tokens";
import { Button } from "@/src/ui/Button";
import { Card } from "@/src/ui/Card";
import { Input } from "@/src/ui/Input";
import { Screen } from "@/src/ui/Screen";
import { ScreenHeader } from "@/src/ui/ScreenHeader";
import { SettingButton } from "@/src/ui/SettingButton";
import { Txt } from "@/src/ui/Txt";

export default function PartnerConnection() {
  const [inviteInput, setInviteInput] = useState("");
  const {
    pairing,
    loading,
    actionLoading,
    error,
    success,
    createInvite,
    joinByCode,
    disconnect,
    refresh,
  } = usePairing();

  const isPaired = pairing?.status === "paired";
  const isPending = pairing?.status === "pending";
  const pairCode = pairing?.inviteCode ?? (isPaired ? "Hidden" : "Not created");
  const statusTitle = loading
    ? "Loading pairing"
    : isPaired
      ? "Connected with your partner"
      : isPending
        ? "Waiting for your partner"
        : "Not paired yet";
  const statusBody = loading
    ? "Checking Supabase for your current pair."
    : isPaired
      ? "This pair is active and ready to keep sharing nudges."
      : isPending
        ? "Share your invite code or enter your partner's code below."
        : "Create an invite code or enter your partner's code to connect.";

  return (
    <Screen style={styles.screen}>
      <ScreenHeader
        icon="💑"
        title="Partner"
        subtitle="Connection details"
        iconBg={tokens.colors.secondary}
      />

      <View style={styles.body}>
        <Card>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Txt variant="h2">💑</Txt>
            </View>

            <View style={{ flex: 1 }}>
              <Txt variant="body" style={{ color: tokens.colors.anchor }}>
                {statusTitle}
              </Txt>
              <Txt variant="muted" style={{ opacity: 0.6, color: tokens.colors.anchor }}>
                {statusBody}
              </Txt>
            </View>

            <ChevronRight size={20} color={"rgba(64,60,61,0.40)"} />
          </View>

          <View style={styles.divider} />

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
            {pairing?.inviteCode
              ? "Share this code to connect your partner or reconnect later."
              : isPaired
                ? "Invite codes are hidden and invalidated once pairing is complete."
              : "Create a code to invite your partner."}
          </Txt>

          {error ? (
            <Txt variant="muted" style={styles.errorText}>
              {error}
            </Txt>
          ) : null}
          {success ? (
            <Txt variant="muted" style={styles.successText}>
              {success}
            </Txt>
          ) : null}
        </Card>

        <View style={{ height: 16 }} />

        <Card>
          <View style={styles.formWrap}>
            <Input
              label="Partner invite code"
              hint="Paste the code exactly as shared. Spaces are trimmed automatically."
              value={inviteInput}
              autoCapitalize="characters"
              autoCorrect={false}
              onChangeText={setInviteInput}
              placeholder="CAT-1234"
            />

            <View style={styles.buttonRow}>
              <Button
                label={pairing?.inviteCode ? "Show Code" : "Create Code"}
                onPress={() => {
                  createInvite().then(() => {});
                }}
                loading={actionLoading === "create"}
                variant="ghost"
                style={styles.halfButton}
              />
              <Button
                label="Join Pair"
                onPress={() => {
                  joinByCode(inviteInput).then((nextPairing) => {
                    if (nextPairing) {
                      setInviteInput("");
                    }
                  });
                }}
                loading={actionLoading === "join"}
                disabled={!inviteInput.trim()}
                style={styles.halfButton}
              />
            </View>

            <Button
              label="Refresh Pairing"
              onPress={() => {
                refresh().then(() => {});
              }}
              loading={loading && actionLoading == null}
              variant="secondary"
            />
          </View>
        </Card>

        <View style={{ height: 16 }} />

        {pairing?.status !== "unpaired" ? (
          <>
            <Card style={styles.cardTight}>
              <SettingButton
                icon={<LogOut size={20} color={"#d4183d"} />}
                label="Disconnect Partner"
                description="Remove only your side of this pair"
                destructive
                onPress={() => {
                  disconnect().then(() => {});
                }}
              />
            </Card>

            <View style={{ height: 16 }} />
          </>
        ) : null}

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
  formWrap: {
    gap: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  errorText: {
    marginTop: 10,
    color: "#d4183d",
    opacity: 1,
  },
  successText: {
    marginTop: 10,
    color: tokens.colors.primary,
    opacity: 1,
  },
  cardTight: { paddingVertical: 6 },
});
