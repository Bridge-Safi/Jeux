import { supabase, isSupabaseConfigured, type Profile } from "./supabase";

const PLAYER_NAME_KEY = "safi_runner_player_name";

/* ── Limite physique anti-triche ────────────────────────────────
   Max atteignable : ~0.75 spawn/s × 70% collecte × clusters = ~0.8 💎/s
   On autorise 1.2 💎/s avec une marge généreuse de ×1.5 = 1.8 max
   Tout ce qui dépasse est écrêté silencieusement.
──────────────────────────────────────────────────────────────── */
const MAX_DIAMONDS_PER_SECOND = 1.8;

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

/**
 * Sauvegarde le score d'une session avec validation anti-triche.
 * @param diamondsSession  💎 collectés pendant la session
 * @param sardinesSession  🐟 sardines
 * @param playTimeSeconds  durée réelle de jeu en secondes
 */
export async function saveScore(
  diamondsSession: number,
  sardinesSession: number,
  playTimeSeconds: number,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  /* ── Validation : plafond physique ─────────────────────────── */
  const maxAllowed = Math.ceil(playTimeSeconds * MAX_DIAMONDS_PER_SECOND);
  const validatedDiamonds = Math.min(
    Math.max(0, Math.floor(diamondsSession)), // pas de négatif
    maxAllowed,
  );
  const validatedSardines = Math.max(0, Math.floor(sardinesSession));

  /* Refuse silencieusement si 0 pour éviter les écritures inutiles */
  if (validatedDiamonds === 0 && validatedSardines === 0) return;

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
        diamonds_collected: (existing?.diamonds_collected ?? 0) + validatedDiamonds,
        sardines_points: (existing?.sardines_points ?? 0) + validatedSardines,
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
