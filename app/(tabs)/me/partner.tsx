import { useFocusEffect } from "@react-navigation/native";
import { ChevronRight, LogOut } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { usePairing } from "@/src/features/pairing/usePairing";
import { tokens } from "@/src/theme/tokens";
import { AppTopBar } from "@/src/ui/AppTopBar";
import { Button } from "@/src/ui/Button";
import { Card } from "@/src/ui/Card";
import { Chip } from "@/src/ui/Chip";
import { Input } from "@/src/ui/Input";
import { Screen } from "@/src/ui/Screen";
import { SettingButton } from "@/src/ui/SettingButton";
import { Txt } from "@/src/ui/Txt";

export default function PartnerConnection() {
  const [inviteInput, setInviteInput] = useState("");
  const {
    pairing,
    loading,
    authReady,
    authUserId,
    actionLoading,
    error,
    success,
    refresh,
    createInvite,
    joinByCode,
    disconnect,
  } = usePairing();

  const isPaired = pairing?.isPaired ?? false;
  const isPending = pairing?.status === "pending";
  const canUsePairingActions = authReady && Boolean(authUserId);
  const connectedName = pairing?.partnerName ?? "Partner";
  const pairCode = pairing?.inviteCode ?? (isPaired ? "Hidden" : "Not created");
  const statusTitle = loading
    ? "Loading pairing"
    : isPaired
      ? `Connected with ${connectedName}`
      : isPending
        ? "Waiting for your partner"
        : "Not paired yet";
  const statusBody = loading
    ? "Checking Supabase for your current pair."
    : isPaired
      ? `${connectedName} is connected and ready to keep sharing nudges.`
      : isPending
        ? "Your invite is open. Share the code below or wait for them to join."
      : "Create a code to invite someone or join with a code they sent you.";

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <Screen style={styles.screen} keyboardAvoiding>
      <AppTopBar title="Pairing" centeredTitle showBack />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.body}>
          <Card style={styles.statusCard}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Txt variant="h2">🐱</Txt>
              </View>

              <View style={styles.statusCopy}>
                <Txt variant="bodyStrong">{statusTitle}</Txt>
                <Txt variant="meta">{statusBody}</Txt>
              </View>

              <ChevronRight size={20} color={tokens.colors.textTertiary} />
            </View>

            <View style={styles.statusChips}>
              <Chip
                label={isPaired ? "Connected" : isPending ? "Pending" : "Not paired"}
                tone={isPaired ? "success" : isPending ? "accent" : "neutral"}
              />
            </View>

            {error ? (
              <Txt variant="caption" style={styles.errorText}>
                {error}
              </Txt>
            ) : null}
            {success ? (
              <Txt variant="caption" style={styles.successText}>
                {success}
              </Txt>
            ) : null}
          </Card>

          {!isPaired ? (
            <>
              <Card>
                <View style={styles.formWrap}>
                  <View style={styles.formHeader}>
                    <Txt variant="h2">Create invite code</Txt>
                    <Txt variant="meta">
                      Share this with the person you want to pair with.
                    </Txt>
                  </View>

                  <View style={styles.codeBlock}>
                    <Txt variant="caption" style={styles.metaLabel}>
                      Current invite code
                    </Txt>
                    <View style={styles.codePill}>
                      <Txt variant="button" style={styles.codeText}>
                        {pairCode}
                      </Txt>
                    </View>
                  </View>

                  <Button
                    label={pairing?.inviteCode ? "Show code" : "Create code"}
                    onPress={() => {
                      createInvite().then(() => {});
                    }}
                    loading={actionLoading === "create"}
                    disabled={!canUsePairingActions}
                  />
                </View>
              </Card>

              <Card>
                <View style={styles.formWrap}>
                  <View style={styles.formHeader}>
                    <Txt variant="h2">Join with invite code</Txt>
                    <Txt variant="meta">
                      Enter the code someone shared with you to connect instantly.
                    </Txt>
                  </View>

                  <Input
                    label="Invite code"
                    hint="Spaces are trimmed automatically."
                    value={inviteInput}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    onChangeText={setInviteInput}
                    placeholder="CAT-1234"
                  />

                  <Button
                    label="Join pair"
                    onPress={() => {
                      joinByCode(inviteInput).then((nextPairing) => {
                        if (nextPairing) {
                          setInviteInput("");
                        }
                      });
                    }}
                    loading={actionLoading === "join"}
                    disabled={!canUsePairingActions || !inviteInput.trim()}
                  />
                </View>
              </Card>
            </>
          ) : null}

          {isPaired ? (
            <Card style={styles.cardTight}>
              <SettingButton
                icon={<LogOut size={20} color={tokens.colors.alert} strokeWidth={2} />}
                label="Disconnect"
                description={`Remove only your side of the connection with ${connectedName}.`}
                destructive
                onPress={() => {
                  disconnect().then(() => {});
                }}
              />
            </Card>
          ) : null}

          {/* <Card variant="inner" style={styles.backCard}>
            <SettingButton
              icon={<ChevronRight size={20} color={tokens.colors.primary} strokeWidth={2} />}
              label="Back"
              description="Return to settings."
              onPress={() => router.back()}
            />
          </Card> */}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 14,
    paddingHorizontal: 18,
   },
  scroll: { paddingBottom: 24 },
  body: {  gap: 18,
    paddingTop: 12, },
  statusCard: {
    gap: 12,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F7FB",
    borderWidth: 1,
    borderColor: "#CFEAF1",
  },
  statusCopy: {
    flex: 1,
    gap: 2,
  },
  statusChips: {
    flexDirection: "row",
  },
  formHeader: {
    gap: 4,
  },
  formWrap: {
    gap: 14,
  },
  codeBlock: {
    gap: 8,
  },
  metaLabel: { color: tokens.colors.textTertiary },
  codePill: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: tokens.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: "center",
  },
  codeText: {
    color: tokens.colors.textPrimary,
  },
  errorText: {
    color: tokens.colors.alert,
  },
  successText: {
    color: tokens.colors.success,
  },
  cardTight: { paddingVertical: 6 },
  backCard: {
    padding: 8,
  },
});
