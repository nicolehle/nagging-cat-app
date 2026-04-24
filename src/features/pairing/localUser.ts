import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "@/src/lib/supabase";

const LOCAL_USER_ID_STORAGE_KEY = "nagcat_local_user_id";

type UserRow = {
  id: string;
  name: string | null;
};

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
  const { data, error } = await supabase
    .from("users")
    .select("id,name")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data as UserRow;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("users")
    .insert({
      id: userId,
      name: makeDefaultUserName(userId),
    })
    .select("id,name")
    .single();

  if (insertError) {
    throw insertError;
  }

  return inserted as UserRow;
}

export async function getCurrentLocalUserId() {
  const userId = await getOrCreateLocalUserId();
  await ensureLocalUserRecord(userId);
  return userId;
}

export async function getCurrentLocalUserProfile() {
  const userId = await getOrCreateLocalUserId();
  const user = await ensureLocalUserRecord(userId);

  return {
    id: userId,
    name: user.name?.trim() || "",
  };
}

export async function saveCurrentLocalUserName(rawName: string) {
  const userId = await getOrCreateLocalUserId();
  const name = rawName.trim();

  const { data, error } = await supabase
    .from("users")
    .update({ name })
    .eq("id", userId)
    .select("id,name")
    .single();

  if (error) {
    throw error;
  }

  const user = data as UserRow;
  return {
    id: user.id,
    name: user.name?.trim() || "",
  };
}
