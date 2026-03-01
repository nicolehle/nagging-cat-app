import { fontAssets } from "@/src/theme/fonts";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { Text } from "react-native";

export default function RootLayout() {
  const [loaded] = useFonts(fontAssets);

  if (!loaded) return <Text />;

  return <Stack screenOptions={{ headerShown: false }} />;
}