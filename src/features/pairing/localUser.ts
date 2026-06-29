import { supabase } from "@/src/lib/supabase";

type UserRow = {
  id: string;
  name: string | null;
};

function makeDefaultUserName(userId: string) {
  return `NagCat ${userId.slice(0, 4).toUpperCase()}`;
}

function isDuplicateRowError(error: { code?: string; message?: string }) {
  return error.code === "23505" || error.message?.toLowerCase().includes("duplicate");
}

async function getAuthenticatedUserId() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.user?.id) {
    throw new Error("Sign in before loading pairing.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user?.id) {
    throw new Error("Sign in before loading pairing.");
  }

  return user.id;
}

export async function getOrCreateLocalUserId() {
  return getAuthenticatedUserId();
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
    if (isDuplicateRowError(insertError)) {
      const { data: existing, error: existingError } = await supabase
        .from("users")
        .select("id,name")
        .eq("id", userId)
        .single();

      if (existingError) {
        throw existingError;
      }

      return existing as UserRow;
    }

    throw insertError;
  }

  return inserted as UserRow;
}

export async function getCurrentLocalUserId() {
  const userId = await getAuthenticatedUserId();
  await ensureLocalUserRecord(userId);
  return userId;
}

export async function getCurrentLocalUserProfile() {
  const userId = await getAuthenticatedUserId();
  const user = await ensureLocalUserRecord(userId);

  return {
    id: userId,
    name: user.name?.trim() || "",
  };
}

export async function saveCurrentLocalUserName(rawName: string) {
  const userId = await getAuthenticatedUserId();
  await ensureLocalUserRecord(userId);
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
