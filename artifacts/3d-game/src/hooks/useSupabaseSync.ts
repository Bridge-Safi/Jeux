import { useState, useEffect, useRef } from "react";
import { isSupabaseConfigured } from "../lib/supabase";
import { ensureProfile, saveScore, getProfile, recordPlaySession } from "../lib/playerProfile";
import type { Profile } from "../lib/supabase";

const AUTOSAVE_INTERVAL = 10_000; // rafraîchit le profil toutes les 10s

export function useSupabaseSync(score: number, phase: string, playTime: number) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<"connecting" | "ok" | "error" | "offline">(
    isSupabaseConfigured ? "connecting" : "offline",
  );

  const lastSyncedScore = useRef(0);
  const initialized = useRef(false);
  const lastScore = useRef(score);
  const lastPlayTime = useRef(playTime);

  /* Initialisation du profil au démarrage */
  useEffect(() => {
    if (!isSupabaseConfigured || initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const p = await ensureProfile();
        if (p) {
          setProfile(p);
          setStatus("ok");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("offline");
      }
    })();
  }, []);

  /* Suivi score + playTime en temps réel (sans re-render) */
  useEffect(() => { lastScore.current = score; }, [score]);
  useEffect(() => { lastPlayTime.current = playTime; }, [playTime]);

  /* Auto-refresh du profil toutes les 10s pendant le jeu */
  useEffect(() => {
    if (!isSupabaseConfigured || (phase !== "playing" && phase !== "checkpoint")) return;

    const interval = setInterval(async () => {
      if (lastScore.current === lastSyncedScore.current) return;
      lastSyncedScore.current = lastScore.current;

      try {
        const updated = await getProfile();
        if (updated) {
          setProfile(updated);
          setStatus("ok");
        }
      } catch {
        setStatus("offline");
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [phase]);

  /* Sauvegarde à la fin de la partie avec validation anti-triche */
  useEffect(() => {
    if (!isSupabaseConfigured || phase !== "gameover") return;

    (async () => {
      const diamondsToSave = Math.floor(lastScore.current / 10);
      const sardines = Math.floor(lastScore.current / 50);
      const sessionTime = lastPlayTime.current; // secondes réelles jouées

      /* saveScore valide côté client avant d'écrire dans Supabase */
      await saveScore(diamondsToSave, sardines, sessionTime);

      /* Enregistre le temps de jeu de la session pour le programme d'engagement Bridge */
      await recordPlaySession(sessionTime);

      const updated = await getProfile();
      if (updated) setProfile(updated);
    })();
  }, [phase]);

  return { profile, status };
}
