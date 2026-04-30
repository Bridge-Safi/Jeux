import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export let supabase: SupabaseClient;

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl!, supabaseAnonKey!);
} else {
  console.warn("⚠️ Supabase non configuré — le jeu fonctionne en mode hors-ligne. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.");
  supabase = null as unknown as SupabaseClient;
}

export type Profile = {
  id: string;
  username: string;
  sardines_points: number;
  diamonds_collected: number;
  device_fingerprint?: string;
  hardware_prefix?: string;
  player_email?: string;
  created_at?: string;
  updated_at?: string;
};
