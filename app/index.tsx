// app/index.tsx
import { Redirect } from "expo-router";
import { usePairing } from "@/src/features/nudge/hooks/usePairing";

export default function Index() {
  const { pairId, isReady } = usePairing();
  
  if (!isReady) return null; // or splash
  // Not paired → go to onboarding
    return pairId
    ? <Redirect href="/(tabs)" />
    : <Redirect href="/onboarding" />;
}
