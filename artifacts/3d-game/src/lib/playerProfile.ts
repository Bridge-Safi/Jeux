import { supabase, isSupabaseConfigured, type Profile } from "./supabase";
import { getDeviceId, getHardwarePrefix } from "./deviceFingerprint";

const PLAYER_NAME_KEY = "safi_runner_player_name";
const MAX_DIAMONDS_PER_SECOND = 1.8;

/* ─── Programme Bridge Eats (engagement strict) ───────────────
   - 30 000 💎 cumulés
   - 3 jours distincts avec ≥ 1h de jeu chacun
   - 4ᵉ jour à partir du 1ᵉʳ jour personnel pour réclamer le menu
   ─────────────────────────────────────────────────────────────── */
export const DIAMONDS_PER_MENU      = 30_000;
export const REQUIRED_PLAY_DAYS     = 3;
export const REQUIRED_SECONDS_PER_DAY = 3_600;        // 1h
export const DAYS_BEFORE_CLAIM      = 4;              // J+0 = 1ᵉʳ jour ; réclame au J+3 calendaire

/* ─── Types ──────────────────────────────────────────────────── */
export type PlayDay = { date: string; playSeconds: number };

/* Raison de blocage exprimée comme clé i18n + paramètres,
   localisée par l'UI via t(). */
export type BlockerInfo =
  | { key: "blocker.diamonds"; n: number }
  | { key: "blocker.days" | "blocker.daysPlural"; n: number }
  | { key: "blocker.wait" | "blocker.waitPlural"; n: number };

export type MenuEligibility = {
  qualifyingDays: number;          // nb de jours avec ≥ 1h
  daysSinceFirstPlay: number;      // nb de jours calendaires depuis le 1ᵉʳ jour
  todaySecondsRemaining: number;   // temps restant à jouer aujourd'hui pour valider la journée
  diamondsCollected: number;
  menusEarned: number;
  menusClaimed: number;
  menusAvailable: number;
  eligible: boolean;               // peut réclamer un menu MAINTENANT
  blocker: BlockerInfo | null;     // raison du blocage (à afficher via t())
};

export function getPlayerName(): string {
  return localStorage.getItem(PLAYER_NAME_KEY) ?? "Joueur Anonyme";
}

/* ─── Auth ──────────────────────────────────────────────────── */
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
    if (error) return null;
    return data as Profile | null;
  } catch {
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

export async function ensureProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const userId = await getOrCreateAuthUser();
    if (!userId) return null;

    const byDevice = await findByDevice();
    if (byDevice) return byDevice;

    const { data: existing, error: fetchErr } = await supabase
      .from("profiles").select("*").eq("id", userId).maybeSingle();
    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.error("ensureProfile fetch:", fetchErr);
      return null;
    }
    if (existing) return existing as Profile;

    const deviceId = getDeviceId();
    const hwPrefix = getHardwarePrefix();
    const insertData: Record<string, unknown> = {
      id: userId,
      username: getPlayerName(),
      sardines_points: 0,
      diamonds_collected: 0,
    };
    try {
      const testCol = await supabase.from("profiles").select("device_fingerprint").limit(1);
      if (!testCol.error) {
        insertData.device_fingerprint = deviceId;
        insertData.hardware_prefix = hwPrefix;
      }
    } catch { /* colonnes absentes */ }

    const { data: created, error: insertErr } = await supabase
      .from("profiles").insert(insertData).select().single();
    if (insertErr) { console.error("ensureProfile insert:", insertErr); return null; }
    return created as Profile;
  } catch (err) {
    console.error("ensureProfile exception:", err);
    return null;
  }
}

/* ─── Helpers date ──────────────────────────────────────────── */
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISO + "T00:00:00");
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

/* ─── Sauvegarde du score (anti-triche) ─────────────────────── */
export async function saveScore(
  diamondsSession: number,
  sardinesSession: number,
  playTimeSeconds: number,
): Promise<void> {
  if (!isSupabaseConfigured) return;

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

  try {
    const { data: current } = await supabase
      .from("profiles").select("diamonds_collected, sardines_points").eq("id", targetId).single();
    const existing = current as Profile | null;

    const updates: Record<string, unknown> = {
      diamonds_collected: (existing?.diamonds_collected ?? 0) + validatedDiamonds,
      sardines_points:    (existing?.sardines_points ?? 0)    + validatedSardines,
      updated_at: new Date().toISOString(),
    };

    await supabase.from("profiles").update(updates).eq("id", targetId);
  } catch (err) {
    console.error("saveScore:", err);
  }
}

/* ─── Enregistre la session du jour (suivi engagement) ─────────
   Appelle la RPC Postgres `add_play_session` qui fait :
   - append/increment ATOMIQUE dans play_days (anti-race)
   - utilise CURRENT_DATE côté SERVEUR (anti triche horloge)
   - initialise first_play_date si absent
   - plafonne à 4h par session
   Échec silencieux si la fonction n'existe pas encore en base.
   ─────────────────────────────────────────────────────────────── */
export async function recordPlaySession(playTimeSeconds: number): Promise<void> {
  if (!isSupabaseConfigured || playTimeSeconds < 1) return;

  let targetId: string | null = null;
  const byDevice = await findByDevice();
  if (byDevice) targetId = byDevice.id;
  else targetId = await getCurrentUserId();
  if (!targetId) return;

  try {
    const { error } = await supabase.rpc("add_play_session", {
      p_id: targetId,
      p_seconds: Math.floor(playTimeSeconds),
    });
    /* 42883 = function does not exist, 42703 = column missing → on ignore */
    if (error && error.code !== "42883" && error.code !== "42703") {
      console.error("recordPlaySession rpc:", error);
    }
  } catch (err) {
    console.error("recordPlaySession:", err);
  }
}

/* ─── Calcule l'éligibilité au menu gratuit ────────────────────
   Pure function : ne touche pas la base, marche sur le Profile passé.
   ─────────────────────────────────────────────────────────────── */
export function getMenuEligibility(profile: Profile | null): MenuEligibility {
  const diamondsCollected = profile?.diamonds_collected ?? 0;
  const menusClaimed      = profile?.menus_claimed ?? 0;
  const menusEarnedRaw    = Math.floor(diamondsCollected / DIAMONDS_PER_MENU);
  const menusAvailable    = Math.max(0, menusEarnedRaw - menusClaimed);

  const playDays: PlayDay[] = Array.isArray(profile?.play_days) ? profile!.play_days! : [];
  const qualifyingDays = playDays.filter((d) => d.playSeconds >= REQUIRED_SECONDS_PER_DAY).length;

  const today = todayISO();
  const todayEntry = playDays.find((d) => d.date === today);
  const todaySecondsRemaining = Math.max(
    0,
    REQUIRED_SECONDS_PER_DAY - (todayEntry?.playSeconds ?? 0)
  );

  const firstPlayDate = profile?.first_play_date ?? today;
  const daysSinceFirstPlay = daysBetween(firstPlayDate, today) + 1; // J1 = 1

  /* Conditions cumulatives pour réclamer */
  let eligible = true;
  let blocker: BlockerInfo | null = null;

  if (menusAvailable < 1) {
    eligible = false;
    const left = DIAMONDS_PER_MENU - (diamondsCollected % DIAMONDS_PER_MENU);
    blocker = { key: "blocker.diamonds", n: left };
  } else if (qualifyingDays < REQUIRED_PLAY_DAYS) {
    eligible = false;
    const missing = REQUIRED_PLAY_DAYS - qualifyingDays;
    blocker = { key: missing > 1 ? "blocker.daysPlural" : "blocker.days", n: missing };
  } else if (daysSinceFirstPlay < DAYS_BEFORE_CLAIM) {
    eligible = false;
    const wait = DAYS_BEFORE_CLAIM - daysSinceFirstPlay;
    blocker = { key: wait > 1 ? "blocker.waitPlural" : "blocker.wait", n: wait };
  }

  return {
    qualifyingDays,
    daysSinceFirstPlay,
    todaySecondsRemaining,
    diamondsCollected,
    menusEarned: menusEarnedRaw,
    menusClaimed,
    menusAvailable,
    eligible,
    blocker,
  };
}

/* ─── Enregistre le n° de tél Bridge (identifiant unique joueur) ─ */
export async function registerBridgePhone(rawPhone: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Hors-ligne" };

  /* Normalisation : on garde uniquement chiffres et +.
     Format MA accepté : +212XXXXXXXXX ou 0XXXXXXXXX.
     Codes d'erreur localisés par l'UI via t(). */
  const normalized = rawPhone.replace(/[^\d+]/g, "");
  if (normalized.length < 9 || normalized.length > 15) {
    return { success: false, error: "claim.phone.invalid" };
  }

  const byDevice = await findByDevice();
  const targetId = byDevice?.id ?? await getCurrentUserId();
  if (!targetId) return { success: false, error: "claim.error.generic" };

  try {
    /* Vérifier unicité du téléphone */
    const { data: exists } = await supabase
      .from("profiles").select("id").eq("bridge_phone", normalized).maybeSingle();
    if (exists && (exists as { id: string }).id !== targetId) {
      return { success: false, error: "claim.phone.taken" };
    }

    const { error } = await supabase
      .from("profiles").update({ bridge_phone: normalized }).eq("id", targetId);

    if (error) {
      if (error.code === "42703") return { success: true }; // colonne pas encore créée
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("registerBridgePhone:", err);
    return { success: false, error: "claim.error.generic" };
  }
}

/* ─── Réclame un menu (anti-double-claim, validation serveur) ────
   Appelle la RPC `claim_menu` qui :
   - re-vérifie les 3 conditions côté SERVEUR (avec CURRENT_DATE)
   - incrémente menus_claimed atomiquement
   - retourne TRUE si succès, FALSE si non éligible.
   Si la RPC n'existe pas encore (DB pas migrée), on accepte (fallback).
   ─────────────────────────────────────────────────────────────── */
export async function markMenuClaimed(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "claim.error.generic" };

  const byDevice = await findByDevice();
  const targetId = byDevice?.id ?? await getCurrentUserId();
  if (!targetId) return { success: false, error: "claim.error.generic" };

  try {
    const { data, error } = await supabase.rpc("claim_menu", { p_id: targetId });
    if (error) {
      /* 42883 = function not yet created → on accepte en fallback */
      if (error.code === "42883" || error.code === "42703") return { success: true };
      return { success: false, error: error.message };
    }
    if (data === false) {
      return { success: false, error: "claim.error.notMet" };
    }
    return { success: true };
  } catch (err) {
    console.error("markMenuClaimed:", err);
    return { success: false, error: "claim.error.generic" };
  }
}

export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const byDevice = await findByDevice();
  if (byDevice) return byDevice;
  const userId = await getCurrentUserId();
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from("profiles").select("*").eq("id", userId).single();
    if (error) return null;
    return data as Profile;
  } catch { return null; }
}
