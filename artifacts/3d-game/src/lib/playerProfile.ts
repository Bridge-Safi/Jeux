import { supabase, isSupabaseConfigured, type Profile } from "./supabase";
import { getDeviceId, getHardwarePrefix } from "./deviceFingerprint";

const PLAYER_NAME_KEY = "safi_runner_player_name";

/* ── Limite physique anti-triche ────────────────────────────────
   Max atteignable : ~0.75 spawn/s × 70% collecte × clusters = ~0.8 💎/s
   On autorise 1.8 💎/s avec marge généreuse.
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

/**
 * Crée ou charge le profil du joueur.
 *
 * Logique anti-duplication par appareil :
 *  1. On génère l'empreinte de cet appareil (device_fingerprint).
 *  2. Si un profil avec cette empreinte existe déjà (même téléphone,
 *     même navigateur) → on le retourne directement.
 *  3. Sinon → on crée un nouveau profil lié à cet appareil.
 *
 * Résultat : impossible d'avoir 2 comptes différents sur le même téléphone.
 */
export async function ensureProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const userId = await getOrCreateAuthUser();
    if (!userId) return null;

    const deviceId      = getDeviceId();
    const hwPrefix      = getHardwarePrefix();
    const username      = getPlayerName();

    /* ── Cherche un profil lié à cet appareil (même si nouvelle session) ── */
    const { data: byDevice } = await supabase
      .from("profiles")
      .select("*")
      .or(`device_fingerprint.eq.${deviceId},hardware_prefix.eq.${hwPrefix}`)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (byDevice) {
      /* Même appareil → on retourne toujours ce profil (anti-duplication) */
      return byDevice as Profile;
    }

    /* ── Cherche un profil lié à l'auth uid actuel ────────────────────── */
    const { data: existing, error: fetchErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.error("Supabase ensureProfile fetch error:", fetchErr);
      return null;
    }

    if (existing) return existing as Profile;

    /* ── Nouveau joueur → créer le profil ────────────────────────────── */
    const { data: created, error: insertErr } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username,
        sardines_points: 0,
        diamonds_collected: 0,
        device_fingerprint: deviceId,
        hardware_prefix: hwPrefix,
      })
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
 * Sauvegarde le score de la session avec validation anti-triche.
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

  /* Trouver le profil par appareil en priorité (anti-duplication) */
  const deviceId = getDeviceId();
  const hwPrefix = getHardwarePrefix();

  let targetId: string | null = null;

  const { data: byDevice } = await supabase
    .from("profiles")
    .select("id")
    .or(`device_fingerprint.eq.${deviceId},hardware_prefix.eq.${hwPrefix}`)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (byDevice) {
    targetId = (byDevice as { id: string }).id;
  } else {
    targetId = await getCurrentUserId();
  }

  if (!targetId) return;

  /* ── Validation plafond physique ────────────────────────────── */
  const maxAllowed      = Math.ceil(playTimeSeconds * MAX_DIAMONDS_PER_SECOND);
  const validatedDiamonds = Math.min(Math.max(0, Math.floor(diamondsSession)), maxAllowed);
  const validatedSardines = Math.max(0, Math.floor(sardinesSession));

  if (validatedDiamonds === 0 && validatedSardines === 0) return;

  try {
    const { data: current } = await supabase
      .from("profiles")
      .select("diamonds_collected, sardines_points")
      .eq("id", targetId)
      .single();

    const existing = current as Profile | null;

    await supabase
      .from("profiles")
      .update({
        diamonds_collected: (existing?.diamonds_collected ?? 0) + validatedDiamonds,
        sardines_points:    (existing?.sardines_points    ?? 0) + validatedSardines,
        updated_at:         new Date().toISOString(),
      })
      .eq("id", targetId);
  } catch (err) {
    console.error("saveScore exception:", err);
  }
}

/**
 * Enregistre l'email du joueur sur son profil.
 * L'email est unique dans Supabase → impossible d'avoir 2 comptes avec le même email.
 */
export async function registerEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Hors-ligne" };

  const deviceId = getDeviceId();
  const hwPrefix = getHardwarePrefix();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .or(`device_fingerprint.eq.${deviceId},hardware_prefix.eq.${hwPrefix}`)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const targetId = (profile as { id: string } | null)?.id ?? await getCurrentUserId();
  if (!targetId) return { success: false, error: "Profil introuvable" };

  /* Vérifier que cet email n'est pas déjà utilisé */
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("player_email", email.toLowerCase().trim())
    .maybeSingle();

  if (existing && (existing as { id: string }).id !== targetId) {
    return { success: false, error: "Un compte existe déjà avec cet email." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ player_email: email.toLowerCase().trim() })
    .eq("id", targetId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

  const deviceId = getDeviceId();
  const hwPrefix = getHardwarePrefix();

  /* Chercher d'abord par empreinte d'appareil */
  const { data: byDevice } = await supabase
    .from("profiles")
    .select("*")
    .or(`device_fingerprint.eq.${deviceId},hardware_prefix.eq.${hwPrefix}`)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (byDevice) return byDevice as Profile;

  /* Fallback sur l'uid */
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data as Profile;
  } catch {
    return null;
  }
}
