import { Stack } from "expo-router";

import { PairingProvider } from "@/src/features/pairing/usePairing";

export default function MeStackLayout() {
  return (
    <PairingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PairingProvider>
  );
}
