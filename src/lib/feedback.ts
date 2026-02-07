// nagcat/lib/feedback.ts
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

function canHaptic() {
  return Platform.OS === "ios" || Platform.OS === "android";
}

export async function hapticLight() {
  if (!canHaptic()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

export async function hapticMedium() {
  if (!canHaptic()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {}
}

export async function hapticHeavy() {
  if (!canHaptic()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {}
}
