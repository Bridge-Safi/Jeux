import { supabase, isSupabaseConfigured, type Profile } from "./supabase";

const PLAYER_NAME_KEY = "safi_runner_player_name";

export function getPlayerName(): string {
  return localStorage.getItem(PLAYER_NAME_KEY) ?? "Joueur Anonyme";
}

async function getOrCreateAuthUser(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      return sessionData.session.user.id;
    }

    const { data: signInData, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn("signInAnonymously error:", error.message);
      return null;
    }
    return signInData.user?.id ?? null;
  } catch (err) {
    console.error("getOrCreateAuthUser exception:", err);
    return null;
  }
}

export async function ensureProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const userId = await getOrCreateAuthUser();
    if (!userId) return null;

    const username = getPlayerName();

    const { data: existing, error: fetchErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.error("Supabase ensureProfile fetch error:", fetchErr);
      return null;
    }

    if (existing) return existing as Profile;

    const { data: created, error: insertErr } = await supabase
      .from("profiles")
      .insert({ id: userId, username, sardines_points: 0, diamonds_collected: 0 })
      .select()
      .single();

    if (insertErr) {
      console.error("Supabase ensureProfile insert error:", insertErr);
      return null;
    }

    console.log("✅ Profil créé dans Supabase:", created);
    return created as Profile;
  } catch (err) {
    console.error("Supabase ensureProfile exception:", err);
    return null;
  }
}

async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function addDiamonds(count: number): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const { data: current } = await supabase
      .from("profiles")
      .select("diamonds_collected")
      .eq("id", userId)
      .single();

    const newCount = ((current as Profile)?.diamonds_collected ?? 0) + count;

    const { data, error } = await supabase
      .from("profiles")
      .update({ diamonds_collected: newCount, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Supabase addDiamonds error:", error);
      return null;
    }

    return data as Profile;
  } catch (err) {
    console.error("addDiamonds exception:", err);
    return null;
  }
}

export async function saveScore(diamondsSession: number, sardinesSession: number): Promise<void> {
  if (!isSupabaseConfigured) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    const { data: current } = await supabase
      .from("profiles")
      .select("diamonds_collected, sardines_points")
      .eq("id", userId)
      .single();

    const existing = current as Profile | null;

    await supabase
      .from("profiles")
      .update({
        diamonds_collected: (existing?.diamonds_collected ?? 0) + diamondsSession,
        sardines_points: (existing?.sardines_points ?? 0) + sardinesSession,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  } catch (err) {
    console.error("saveScore exception:", err);
  }
}

export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("getProfile error:", error);
      return null;
    }
    return data as Profile;
  } catch (err) {
    console.error("getProfile exception:", err);
    return null;
  }
}
