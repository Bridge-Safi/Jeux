import { supabase, isSupabaseConfigured, type Profile } from "./supabase";
import { getDeviceId, getHardwarePrefix } from "./deviceFingerprint";

const PLAYER_NAME_KEY = "safi_runner_player_name";
const MAX_DIAMONDS_PER_SECOND = 1.8;

export function getPlayerName(): string {
  return localStorage.getItem(PLAYER_NAME_KEY) ?? "Joueur Anonyme";
}

async function getOrCreateAuthUser(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) return sessionData.session.user.id;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) { console.warn("signInAnonymously error:", error.message); return null; }
    return data.user?.id ?? null;
  } catch (err) {
    console.error("getOrCreateAuthUser:", err);
    return null;
  }
}

/** Tente de trouver un profil par empreinte d'appareil (colonnes optionnelles).
 *  Si les colonnes n'existent pas encore dans Supabase, retourne null silencieusement. */
async function findByDevice(): Promise<Profile | null> {
  try {
    const deviceId = getDeviceId();
    const hwPrefix = getHardwarePrefix();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`device_fingerprint.eq.${deviceId},hardware_prefix.eq.${hwPrefix}`)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) return null; // colonnes pas encore créées → fallback uid
    return data as Profile | null;
  } catch {
    return null;
  }
}

export async function ensureProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const userId = await getOrCreateAuthUser();
    if (!userId) return null;

    // 1. Recherche par empreinte d'appareil (si colonnes existent)
    const byDevice = await findByDevice();
    if (byDevice) return byDevice;

    // 2. Recherche par uid auth
    const { data: existing, error: fetchErr } = await supabase
      .from("profiles").select("*").eq("id", userId).maybeSingle();
    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.error("ensureProfile fetch:", fetchErr);
      return null;
    }
    if (existing) return existing as Profile;

    // 3. Créer nouveau profil
    const deviceId = getDeviceId();
    const hwPrefix = getHardwarePrefix();
    const insertData: Record<string, unknown> = {
      id: userId,
      username: getPlayerName(),
      sardines_points: 0,
      diamonds_collected: 0,
    };
    // Ajouter les colonnes device seulement si elles existent (test préalable)
    try {
      const testCol = await supabase.from("profiles").select("device_fingerprint").limit(1);
      if (!testCol.error) {
        insertData.device_fingerprint = deviceId;
        insertData.hardware_prefix = hwPrefix;
      }
    } catch { /* colonnes absentes, on ignore */ }

    const { data: created, error: insertErr } = await supabase
      .from("profiles").insert(insertData).select().single();
    if (insertErr) { console.error("ensureProfile insert:", insertErr); return null; }
    return created as Profile;
  } catch (err) {
    console.error("ensureProfile exception:", err);
    return null;
  }
}

async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.id ?? null;
  } catch { return null; }
}

/** Sauvegarde le score avec validation anti-triche côté client */
export async function saveScore(
  diamondsSession: number,
  sardinesSession: number,
  playTimeSeconds: number,
): Promise<void> {
  if (!isSupabaseConfigured) return;

  // Préférer l'id par empreinte d'appareil si disponible
  let targetId: string | null = null;
  const byDevice = await findByDevice();
  if (byDevice) {
    targetId = byDevice.id;
  } else {
    targetId = await getCurrentUserId();
  }
  if (!targetId) return;

  const maxAllowed = Math.ceil(playTimeSeconds * MAX_DIAMONDS_PER_SECOND);
  const validatedDiamonds = Math.min(Math.max(0, Math.floor(diamondsSession)), maxAllowed);
  const validatedSardines = Math.max(0, Math.floor(sardinesSession));
  if (validatedDiamonds === 0 && validatedSardines === 0) return;

  try {
    const { data: current } = await supabase
      .from("profiles").select("diamonds_collected, sardines_points").eq("id", targetId).single();
    const existing = current as Profile | null;
    await supabase.from("profiles").update({
      diamonds_collected: (existing?.diamonds_collected ?? 0) + validatedDiamonds,
      sardines_points: (existing?.sardines_points ?? 0) + validatedSardines,
      updated_at: new Date().toISOString(),
    }).eq("id", targetId);
  } catch (err) {
    console.error("saveScore:", err);
  }
}

/** Enregistre l'email pour la réclamation de menu. Un email = un seul compte. */
export async function registerEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Hors-ligne" };
  const byDevice = await findByDevice();
  const targetId = byDevice?.id ?? await getCurrentUserId();
  if (!targetId) return { success: false, error: "Profil introuvable" };

  try {
    // Vérifier unicité de l'email
    const { data: exists } = await supabase
      .from("profiles").select("id").eq("player_email", email.toLowerCase().trim()).maybeSingle();
    if (exists && (exists as { id: string }).id !== targetId) {
      return { success: false, error: "Un compte existe déjà avec cet email." };
    }
    const { error } = await supabase
      .from("profiles").update({ player_email: email.toLowerCase().trim() }).eq("id", targetId);
    if (error) {
      // Colonne peut-être absente → ignorer et considérer succès partiel
      if (error.code === "42703") return { success: true };
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("registerEmail:", err);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  // Chercher d'abord par appareil
  const byDevice = await findByDevice();
  if (byDevice) return byDevice;
  // Fallback uid
  const userId = await getCurrentUserId();
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from("profiles").select("*").eq("id", userId).single();
    if (error) return null;
    return data as Profile;
  } catch { return null; }
}
