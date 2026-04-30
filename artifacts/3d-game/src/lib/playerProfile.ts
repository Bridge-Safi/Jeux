import { supabase, type Profile } from "./supabase";

const PLAYER_ID_KEY = "safi_runner_player_id";
const PLAYER_NAME_KEY = "safi_runner_player_name";

function generateId(): string {
  return "player_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function getPlayerName(): string {
  return localStorage.getItem(PLAYER_NAME_KEY) ?? "Joueur Anonyme";
}

export async function ensureProfile(): Promise<Profile | null> {
  const id = getPlayerId();
  const username = getPlayerName();

  try {
    const { data: existing, error: fetchErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.error("Supabase ensureProfile fetch error:", fetchErr);
      return null;
    }

    if (existing) return existing as Profile;

    const { data: created, error: insertErr } = await supabase
      .from("profiles")
      .insert({ id, username, sardines_points: 0, diamonds_collected: 0 })
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

export async function addDiamonds(count: number): Promise<Profile | null> {
  const id = getPlayerId();
  try {
    const { data, error } = await supabase.rpc("increment_diamonds", {
      player_id: id,
      amount: count,
    });

    if (error) {
      console.warn("RPC increment_diamonds non disponible, tentative UPDATE direct:", error.message);
      return addDiamondsDirect(id, count);
    }

    return data as Profile;
  } catch (err) {
    console.error("addDiamonds exception:", err);
    return addDiamondsDirect(id, count);
  }
}

async function addDiamondsDirect(id: string, count: number): Promise<Profile | null> {
  try {
    const { data: current } = await supabase
      .from("profiles")
      .select("diamonds_collected")
      .eq("id", id)
      .single();

    const newCount = ((current as Profile)?.diamonds_collected ?? 0) + count;

    const { data, error } = await supabase
      .from("profiles")
      .update({ diamonds_collected: newCount, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase addDiamondsDirect error:", error);
      return null;
    }

    return data as Profile;
  } catch (err) {
    console.error("addDiamondsDirect exception:", err);
    return null;
  }
}

export async function saveScore(diamondsSession: number, sardinesSession: number): Promise<void> {
  const id = getPlayerId();
  try {
    const { data: current } = await supabase
      .from("profiles")
      .select("diamonds_collected, sardines_points")
      .eq("id", id)
      .single();

    const existing = current as Profile | null;

    await supabase
      .from("profiles")
      .update({
        diamonds_collected: (existing?.diamonds_collected ?? 0) + diamondsSession,
        sardines_points: (existing?.sardines_points ?? 0) + sardinesSession,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  } catch (err) {
    console.error("saveScore exception:", err);
  }
}

export async function getProfile(): Promise<Profile | null> {
  const id = getPlayerId();
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
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
