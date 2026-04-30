import type { GamePhase } from "./useGameState";

interface GameUIProps {
  phase: GamePhase;
  score: number;
  checkpointNumber: number;
  nextCheckpointAt: number;
  playTime: number;
  onStart: () => void;
  onRestart: () => void;
}

export function GameUI({ phase, score, checkpointNumber, nextCheckpointAt, playTime, onStart, onRestart }: GameUIProps) {
  const timeToNext = Math.max(0, Math.ceil(nextCheckpointAt - playTime));
  const progress = playTime > 0 ? Math.min(1, (playTime - (checkpointNumber > 0 ? nextCheckpointAt - 50 : 0)) / 50) : 0;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Score + Timer ── */}
      {phase === "playing" && (
        <div style={{ position: "absolute", top: 14, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12, pointerEvents: "none" }}>
          {/* Score */}
          <div style={{
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            borderRadius: 12,
            padding: "8px 22px",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 1,
            textShadow: "0 2px 8px #000a",
            border: "2px solid rgba(255,255,255,0.15)",
          }}>
            💎 {score}
          </div>

          {/* Prochain arrêt */}
          <div style={{
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            borderRadius: 12,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            border: "2px solid rgba(255,165,0,0.4)",
            minWidth: 130,
            textAlign: "center",
          }}>
            <div style={{ color: "#ffd700", fontSize: 11, marginBottom: 3 }}>
              🍽️ Prochain arrêt dans {timeToNext}s
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, ((50 - timeToNext) / 50) * 100)}%`,
                background: "linear-gradient(90deg, #ffd700, #ff7043)",
                borderRadius: 4,
                transition: "width 0.5s",
              }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Contrôles ── */}
      {phase === "playing" && (
        <div style={{
          position: "absolute", bottom: 16, left: 0, right: 0,
          display: "flex", justifyContent: "center", pointerEvents: "none",
        }}>
          <div style={{
            background: "rgba(0,0,0,0.45)",
            color: "rgba(255,255,255,0.75)",
            borderRadius: 8,
            padding: "5px 18px",
            fontSize: 13,
          }}>
            ← → Changer de voie &nbsp;|&nbsp; Espace Sauter
          </div>
        </div>
      )}

      {/* ── Écran de démarrage ── */}
      {phase === "start" && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(5,10,40,0.82)", pointerEvents: "auto",
        }}>
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: 3, textShadow: "0 4px 24px #1565c0" }}>
              🦈 Safi Runner
            </div>
            <div style={{ fontSize: 17, color: "#90caf9", marginTop: 6, marginBottom: 8 }}>
              Médina de Safi — Course infinie 3D
            </div>
            <div style={{
              background: "rgba(255,165,0,0.15)",
              border: "1px solid rgba(255,165,0,0.4)",
              borderRadius: 10,
              padding: "10px 20px",
              fontSize: 14,
              color: "#ffd580",
              marginBottom: 26,
              lineHeight: 1.7,
            }}>
              🍽️ Toutes les 50 secondes, le requin s'arrête dans un snack ou restaurant<br />
              pour un quiz, un formulaire, une pub ou un questionnaire !
            </div>
            <div style={{ marginBottom: 28, color: "#e0e0e0", fontSize: 14 }}>
              ← → Changer de voie &nbsp;|&nbsp; Espace Sauter
            </div>
            <button
              onClick={onStart}
              style={{
                background: "linear-gradient(135deg, #1565c0, #2196f3)",
                color: "#fff", border: "none", borderRadius: 40,
                padding: "16px 52px", fontSize: 22, fontWeight: 800,
                cursor: "pointer", letterSpacing: 2,
                boxShadow: "0 4px 24px #1565c080",
              }}
            >
              JOUER
            </button>
          </div>
        </div>
      )}

      {/* ── Game Over ── */}
      {phase === "gameover" && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(40,0,0,0.82)", pointerEvents: "auto",
        }}>
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 58, fontWeight: 900, color: "#ef5350", textShadow: "0 4px 24px #b71c1c" }}>
              GAME OVER
            </div>
            <div style={{ fontSize: 26, margin: "14px 0 8px", color: "#fff176", fontWeight: 700 }}>
              Score final : {score} 💎
            </div>
            <div style={{ fontSize: 15, color: "#ffccbc", marginBottom: 28 }}>
              Checkpoints complétés : {checkpointNumber} 🛑
            </div>
            <button
              onClick={onRestart}
              style={{
                background: "linear-gradient(135deg, #b71c1c, #ef5350)",
                color: "#fff", border: "none", borderRadius: 40,
                padding: "16px 52px", fontSize: 22, fontWeight: 800,
                cursor: "pointer", letterSpacing: 2,
                boxShadow: "0 4px 24px #ef535080",
              }}
            >
              RECOMMENCER
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
