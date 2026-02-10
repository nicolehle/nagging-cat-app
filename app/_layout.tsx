import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { useAppFonts } from "@/src/constants/useAppFonts";

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return <View />; // prevents font flash
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}