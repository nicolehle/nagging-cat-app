import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePairing } from "@/src/features/nudge/hooks/usePairing";
import { PairingPanel } from "@/src/features/nudge/components/PairingPanel";
import { nagTheme } from "../constants/theme";

export default function OnboardingScreen() {
  const {
    pairId,
    inviteInput,
    setInviteInput,
    pairLoading,
    createPair,
    joinPair,
  } = usePairing();

  const t = nagTheme;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: t.colors.ink, fontFamily: t.fonts.bold }]}>🐱 Welcome to NagCat</Text>
        <Text style={styles.subtitle}>
          Stir drama. Blame the cat.
        </Text>

        <PairingPanel
          pairId={pairId}
          pairLoading={pairLoading}
          inviteInput={inviteInput}
          setInviteInput={setInviteInput}
          createPair={createPair}
          joinPair={joinPair}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FBF6EF" },
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: "900" },
  subtitle: { marginTop: 8, opacity: 0.7 },
});
