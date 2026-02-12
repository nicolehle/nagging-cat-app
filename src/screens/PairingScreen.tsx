import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PairingPanel } from "@/src/features/nudge/components/PairingPanel";
import { usePairing } from "@/src/features/nudge/hooks/usePairing";
import { nagTheme } from "@/src/constants/theme";

export default function PairingScreen() {
  const t = nagTheme;

  const {
    pairId,
    inviteInput,
    setInviteInput,
    pairLoading,
    createPair,
    joinPair,
  } = usePairing();

  return (
    <SafeAreaView edges={["top"]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: t.colors.ink, fontFamily: t.fonts.bold }]}>
          ⚙️ Pairing
        </Text>
        <Text style={[styles.sub, { color: t.colors.inkSoft, fontFamily: t.fonts.regular }]}>
          Manage your connection
        </Text>

        <View style={{ marginTop: 14 }}>
          <PairingPanel
            pairId={pairId}
            pairLoading={pairLoading}
            inviteInput={inviteInput}
            setInviteInput={setInviteInput}
            createPair={createPair}
            joinPair={joinPair}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16 },
  title: { fontSize: 22 },
  sub: { marginTop: 6, opacity: 0.9 },
});
