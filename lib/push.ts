import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { supabase } from "./supabase";


// Safe default: show alerts in foreground (optional)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type PushResult =
  | { ok: true; token: string }
  | { ok: false; reason: string };

function getEasProjectId(): string | undefined {
  // Works across common Expo/EAS config shapes
  return (
    (Constants as any)?.expoConfig?.extra?.eas?.projectId ||
    (Constants as any)?.easConfig?.projectId
  );
}

function isExpoGo(): boolean {
  // In Expo Go, appOwnership is typically "expo"
  return Constants.appOwnership === "expo";
}

/**
 * SAFE: This will NOT crash in Expo Go.
 * It will quietly return { ok:false } when push isn't available.
 */
export async function registerForPushAndSubscribeToPair(
  pairId: string,
  deviceLabel?: string
): Promise<PushResult> {
  const p = pairId.trim();
  if (!p) return { ok: false, reason: "Missing pairId" };

  if (!Device.isDevice) {
    return { ok: false, reason: "Push requires a physical device" };
  }
  
  if (Platform.OS === "web") {
    return { ok: false as const, reason: "Web push disabled (no VAPID)" };
  }

  // Expo Go cannot reliably do push tokens in modern Expo flow
  if (isExpoGo()) {
    return { ok: false, reason: "Running in Expo Go (push disabled)" };
  }

  const projectId = getEasProjectId();
  if (!projectId) {
    return { ok: false, reason: "Missing EAS projectId (dev build not installed yet)" };
  }

  // Permissions
  const perm = await Notifications.getPermissionsAsync();
  let status = perm.status;

  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }

  if (status !== "granted") {
    return { ok: false, reason: "Notification permission not granted" };
  }

  // Token (only when everything above is satisfied)
  const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenResp.data;

  // Save token to Supabase (safe for later; table must exist)
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      pair_id: p,
      expo_push_token: token,
      device_label: deviceLabel ?? Device.modelName ?? "device",
    },
    { onConflict: "pair_id,expo_push_token" }
  );

  if (error) return { ok: false, reason: error.message };

  return { ok: true, token };
}
