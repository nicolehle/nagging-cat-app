import { Tabs } from "expo-router";
import React from "react";
import { nagTheme } from "@/src/constants/theme";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { Home, History } from "lucide-react-native"; 

export default function TabLayout() {
  const t = nagTheme;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: t.colors.primary,
        tabBarInactiveTintColor: "#FFFFFF",

        tabBarStyle: {
          backgroundColor: t.colors.anchor, // warm charcoal bar like the mock
          borderTopColor: "rgba(255,255,255,0.08)",
          height: 72,
          paddingTop: 10,
          paddingBottom: 12,
        },

        tabBarLabelStyle: {
          fontFamily: t.fonts.semibold,
          textAlign: "center",
          fontSize: 11,
          marginTop: 4,
        },

       tabBarItemStyle: {
        justifyContent: "center",
        alignItems: "center",
      },
    }}
    >
     <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Home color={color} size={28} strokeWidth={1.5} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <History color={color} size={28} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}
