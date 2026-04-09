import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "@/src/lib/supabase";

const LOCAL_USER_ID_STORAGE_KEY = "nagcat_local_user_id";

function randomHex(length: number) {
  let out = "";
  while (out.length < length) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out.slice(0, length);
}

function generateLocalUserId() {
  return `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-a${randomHex(3)}-${randomHex(12)}`;
}

function makeDefaultUserName(userId: string) {
  return `NagCat ${userId.slice(0, 4).toUpperCase()}`;
}

export async function getOrCreateLocalUserId() {
  const cached = (await AsyncStorage.getItem(LOCAL_USER_ID_STORAGE_KEY))?.trim();
  if (cached) return cached;

  const userId = generateLocalUserId();
  await AsyncStorage.setItem(LOCAL_USER_ID_STORAGE_KEY, userId);
  return userId;
}

export async function ensureLocalUserRecord(userId: string) {
  const { error } = await supabase.from("users").upsert(
    {
      id: userId,
      name: makeDefaultUserName(userId),
    },
    { onConflict: "id" }
  );

  if (error) {
    throw error;
  }
}

export async function getCurrentLocalUserId() {
  const userId = await getOrCreateLocalUserId();
  await ensureLocalUserRecord(userId);
  return userId;
}
