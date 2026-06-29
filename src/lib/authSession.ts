import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";

let authBootstrapPromise: Promise<Session> | null = null;
let authBootstrapError: unknown = null;

async function resolveAuthSession() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("[auth] getSession failed", sessionError);
    throw sessionError;
  }

  if (sessionData.session?.user?.id) {
    console.log("[auth] restored session", { userId: sessionData.session.user.id });
    return sessionData.session;
  }

  console.log("[auth] no session found, signing in anonymously");

  const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();

  if (signInError) {
    console.error("[auth] anonymous sign-in failed", signInError);
    throw signInError;
  }

  if (!signInData.session?.user?.id) {
    throw new Error("Anonymous sign-in did not return a session.");
  }

  console.log("[auth] anonymous session ready", { userId: signInData.session.user.id });
  return signInData.session;
}

export async function getOrCreateAuthSession() {
  if (authBootstrapError) {
    throw authBootstrapError;
  }

  if (!authBootstrapPromise) {
    authBootstrapPromise = resolveAuthSession()
      .catch((error) => {
        authBootstrapError = error;
        throw error;
      })
      .finally(() => {
        authBootstrapPromise = null;
      });
  }

  return authBootstrapPromise;
}
