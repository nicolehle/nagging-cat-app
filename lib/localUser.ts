import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocalUser = {
  id: string;
  name: string;
};

const USER_KEY = "nagcat_user";

export async function getOrCreateLocalUser(): Promise<LocalUser> {
  const existing = await AsyncStorage.getItem(USER_KEY);
  if (existing) return JSON.parse(existing);

  const user: LocalUser = {
    id: crypto.randomUUID(),
    name: "Me",
  };

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}