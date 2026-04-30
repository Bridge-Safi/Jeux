import type { Profile } from "../lib/supabase";

interface SupabasePanelProps {
  profile: Profile | null;
  status: "connecting" | "ok" | "error" | "offline";
  phase: string;
}

export function SupabasePanel({ profile, status, phase }: SupabasePanelProps) {
  const statusColor =
    status === "ok" ? "#4caf50" :
    status === "connecting" ? "#ff9800" : "#f44336";

  const statusLabel =
    status === "ok" ? "● Connecté" :
    status === "connecting" ? "● Connexion…" :
    status === "offline" ? "● Hors-ligne" : "● Erreur";

  const isExpanded = phase === "start" || phase === "gameover" || phase === "checkpoint";

  if (!isExpanded) {
    return (
      <div style={{
        position: "absolute", top: 14, right: 14,
        display: "flex", alignItems: "center", gap: 6,
        background: "rgba(0,0,0,0.5)", borderRadius: 8,
        padding: "4px 10px", fontSize: 11,
        color: statusColor, fontWeight: 700,
        border: `1px solid ${statusColor}40`,
        pointerEvents: "none",
      }}>
        {statusLabel}
      </div>
    );
  }

  return (
    <div style={{
      position: "absolute", bottom: 16, right: 16,
      background: "rgba(10,20,40,0.92)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 14, padding: "12px 16px",
      maxWidth: 240, color: "white",
      fontFamily: "'Segoe UI', sans-serif",
      fontSize: 12, zIndex: 50,
      pointerEvents: "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 13 }}>🗄️</span>
        <span style={{ fontWeight: 700 }}>Supabase</span>
        <span style={{ marginLeft: "auto", color: statusColor, fontSize: 11, fontWeight: 700 }}>
          {statusLabel}
        </span>
      </div>

      {profile ? (
        <div style={{ lineHeight: 1.8, color: "#ccc" }}>
          <div>👤 <span style={{ color: "#90caf9" }}>{profile.username}</span></div>
          <div>💎 Total : <strong style={{ color: "#fff176" }}>{profile.diamonds_collected}</strong></div>
          <div>🐟 Sardines : <strong style={{ color: "#80cbc4" }}>{profile.sardines_points}</strong></div>
        </div>
      ) : (
        <div style={{ color: "#888" }}>
          {status === "connecting" ? "Chargement du profil…" : "Profil non disponible."}
        </div>
      )}
    </div>
  );
}
