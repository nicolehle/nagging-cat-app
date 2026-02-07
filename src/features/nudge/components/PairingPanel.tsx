// src/features/nudge/components/PairingPanel.tsx
import { View, Text, TextInput, Pressable } from "react-native";

type Props = {
  pairId: string;
  pairLoading: boolean;
  inviteInput: string;
  setInviteInput: (v: string) => void;
  createPair: () => void;
  joinPair: () => void;
};

export function PairingPanel({
  pairId,
  pairLoading,
  inviteInput,
  setInviteInput,
  createPair,
  joinPair,
}: Props) {
  return (
    <View style={{ marginTop: 16, padding: 12, borderWidth: 1, borderRadius: 12, borderColor: "#eee" }}>
      <Text style={{ fontSize: 16, fontWeight: "600" }}>Pairing</Text>
      <Text style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
        Create a pair to get an invite code, or join with your partner’s code.
      </Text>

      <Pressable
        onPress={createPair}
        disabled={pairLoading}
        style={{
          marginTop: 10,
          padding: 12,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: "#ddd",
          opacity: pairLoading ? 0.6 : 1,
        }}
      >
        <Text style={{ textAlign: "center" }}>{pairLoading ? "Creating..." : "Create Pair 😼"}</Text>
      </Pressable>

      {!!pairId && (
        <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10, borderColor: "#eee" }}>
          <Text style={{ fontSize: 12, opacity: 0.7 }}>Connected Pair</Text>
          <Text style={{ fontFamily: "monospace" }}>{pairId}</Text>
          <Text style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
            Share the invite code shown after creation (or re-open Supabase to see it for now).
          </Text>
        </View>
      )}

      <Text style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>Join with invite code</Text>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
        <TextInput
          value={inviteInput}
          onChangeText={setInviteInput}
          placeholder="CAT-7421"
          autoCapitalize="characters"
          style={{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 10, borderColor: "#ddd" }}
        />
        <Pressable
          onPress={joinPair}
          disabled={pairLoading}
          style={{
            paddingHorizontal: 14,
            justifyContent: "center",
            borderWidth: 1,
            borderRadius: 10,
            borderColor: "#ddd",
            opacity: pairLoading ? 0.6 : 1,
          }}
        >
          <Text>Join</Text>
        </Pressable>
      </View>
    </View>
  );
}
