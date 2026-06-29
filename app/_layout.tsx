import { getOrCreateAuthSession } from "@/src/lib/authSession";
import { fontAssets } from "@/src/theme/fonts";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native";

export default function RootLayout() {
  const [loaded] = useFonts(fontAssets);

  useEffect(() => {
    getOrCreateAuthSession().catch((error) => {
      console.error("[auth] root bootstrap failed", error);
    });
  }, []);

  if (!loaded) return <Text />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="create-nudge"
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
