import { tokens } from "@/src/theme/tokens";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const active = tokens.colors.primary; // #EB6B4D
  const inactive = "rgba(255,255,255,0.70)";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,

        tabBarLabelStyle: {
          fontFamily: "Nunito_600SemiBold",
          fontSize: 12,
          marginTop: 2,
        },

        tabBarStyle: {
          backgroundColor: tokens.colors.anchor, // dark
          borderTopWidth: 0,

          height: 64,
          paddingTop: 8,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Feather name="clock" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "Me",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}