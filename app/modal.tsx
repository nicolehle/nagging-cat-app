// app/modal.tsx
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Modal</Text>

      <Pressable
        onPress={() => router.back()}
        style={{ marginTop: 12, padding: 12, borderWidth: 1, borderRadius: 10, borderColor: "#ddd" }}
      >
        <Text style={{ textAlign: "center" }}>Close</Text>
      </Pressable>
    </View>
  );
}