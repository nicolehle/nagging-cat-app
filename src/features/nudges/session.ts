import AsyncStorage from "@react-native-async-storage/async-storage";

export const PAIR_ID_STORAGE_KEY = "nagcat_pair_id";
export const DEVICE_NAME_STORAGE_KEY = "nagcat_device_name";

export type NudgeSession = {
  pairId: string | null;
  deviceName: string;
};

export async function getNudgeSession(): Promise<NudgeSession> {
  const [rawPairId, rawDeviceName] = await Promise.all([
    AsyncStorage.getItem(PAIR_ID_STORAGE_KEY),
    AsyncStorage.getItem(DEVICE_NAME_STORAGE_KEY),
  ]);

  const pairId = rawPairId?.trim() || null;
  const deviceName = rawDeviceName?.trim() || "This device";

  return { pairId, deviceName };
}
