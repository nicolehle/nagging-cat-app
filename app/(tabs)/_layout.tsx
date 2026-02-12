import { Tabs } from "expo-router";
import React from "react";
import { nagTheme } from "@/src/constants/theme";

export default function TabLayout() {
  const t = nagTheme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: t.colors.ink,
        tabBarInactiveTintColor: t.colors.inkFaint,

        tabBarStyle: {
          backgroundColor: t.colors.card,
          borderTopColor: t.colors.divider,
          borderTopWidth: 1,
        },

        tabBarLabelStyle: {
          fontFamily: t.fonts.bold,
          fontSize: 12,
       },
    }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
        }}
      />
    </Tabs>
  );
}
