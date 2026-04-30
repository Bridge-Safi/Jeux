import { useState } from "react";
import type { Profile } from "../lib/supabase";

interface SupabasePanelProps {
  profile: Profile | null;
  status: "connecting" | "ok" | "error" | "offline";
  phase: string;
  onAddTestDiamonds: (count: number) => Promise<{ success: boolean; total?: number }>;
}

export function SupabasePanel({ profile, status, phase, onAddTestDiamonds }: SupabasePanelProps) {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const statusColor = status === "ok" ? "#4caf50" : status === "connecting" ? "#ff9800" : "#f44336";
  const statusLabel = status === "ok" ? "● Connecté" : status === "connecting" ? "● Connexion…" : status === "offline" ? "● Hors-ligne" : "● Erreur";

  const handleTest = async () => {
    setLoading(true);
    setTestResult(null);
    const result = await onAddTestDiamonds(1000);
    if (result.success) {
      setTestResult(`✅ +1000 💎 ajoutés ! Total Supabase : ${result.total ?? "?"} diamants`);
    } else {
      setTestResult("❌ Échec : vérifie la table 'profiles' dans Supabase et les RLS.");
    }
    setLoading(false);
  };

  const isVisible = phase === "start" || phase === "gameover" || phase === "checkpoint";

  if (!isVisible) {
    return (
      <div style={{
        position: "absolute",
        top: 14,
        right: 14,
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(0,0,0,0.5)",
        borderRadius: 8,
        padding: "4px 10px",
        fontSize: 11,
        color: statusColor,
        fontWeight: 700,
        border: `1px solid ${statusColor}40`,
        pointerEvents: "none",
      }}>
        {statusLabel}
        {profile && (
          <span style={{ color: "#90caf9", fontWeight: 400, marginLeft: 4 }}>
            | 💎 {profile.diamonds_collected} total
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: "absolute",
      bottom: 16,
      right: 16,
      background: "rgba(10,20,40,0.92)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: 14,
      padding: "14px 18px",
      maxWidth: 300,
      color: "white",
      fontFamily: "'Segoe UI', sans-serif",
      fontSize: 13,
      zIndex: 50,
      pointerEvents: "auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 14 }}>🗄️</span>
        <span style={{ fontWeight: 700, fontSize: 13 }}>Supabase</span>
        <span style={{ marginLeft: "auto", color: statusColor, fontSize: 12, fontWeight: 700 }}>
          {statusLabel}
        </span>
      </div>

      {profile ? (
        <div style={{ marginBottom: 10, lineHeight: 1.7, color: "#ccc", fontSize: 12 }}>
          <div>👤 <span style={{ color: "#90caf9" }}>{profile.username}</span></div>
          <div>💎 Diamants total : <strong style={{ color: "#fff176" }}>{profile.diamonds_collected}</strong></div>
          <div>🐟 Points sardines : <strong style={{ color: "#80cbc4" }}>{profile.sardines_points}</strong></div>
        </div>
      ) : (
        <div style={{ color: "#888", fontSize: 12, marginBottom: 10 }}>
          {status === "connecting" ? "Chargement du profil…" : "Profil non disponible."}
        </div>
      )}

      <button
        onClick={handleTest}
        disabled={loading}
        style={{
          width: "100%",
          background: loading ? "#333" : "linear-gradient(135deg, #1565c0, #42a5f5)",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "9px 14px",
          fontSize: 12,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: testResult ? 8 : 0,
        }}
      >
        {loading ? "Test en cours…" : "🧪 Test +1000 💎 (Supabase)"}
      </button>

      {testResult && (
        <div style={{
          background: testResult.startsWith("✅") ? "rgba(76,175,80,0.2)" : "rgba(244,67,54,0.2)",
          border: `1px solid ${testResult.startsWith("✅") ? "#4caf50" : "#f44336"}`,
          borderRadius: 6,
          padding: "7px 10px",
          fontSize: 11,
          lineHeight: 1.5,
          color: testResult.startsWith("✅") ? "#a5d6a7" : "#ef9a9a",
        }}>
          {testResult}
        </div>
      )}
    </div>
  );
}
