import type { GamePhase } from "./useGameState";

interface GameUIProps {
  phase: GamePhase;
  score: number;
  onStart: () => void;
  onRestart: () => void;
}

export function GameUI({ phase, score, onStart, onRestart }: GameUIProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* HUD */}
      {phase === "playing" && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              borderRadius: 12,
              padding: "8px 28px",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 2,
              textShadow: "0 2px 8px #000a",
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            💎 {score}
          </div>
        </div>
      )}

      {/* Controls hint */}
      {phase === "playing" && (
        <div
          style={{
            position: "absolute",
            bottom: 18,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.45)",
              color: "rgba(255,255,255,0.7)",
              borderRadius: 8,
              padding: "5px 18px",
              fontSize: 13,
            }}
          >
            ← → Changer de voie &nbsp;|&nbsp; Espace Sauter
          </div>
        </div>
      )}

      {/* Start screen */}
      {phase === "start" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(5, 10, 40, 0.82)",
            pointerEvents: "auto",
          }}
        >
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: 3, textShadow: "0 4px 24px #1565c0" }}>
              🦈 Safi Runner
            </div>
            <div style={{ fontSize: 18, color: "#90caf9", marginTop: 8, marginBottom: 32 }}>
              Médina de Safi — Course infinie 3D
            </div>
            <div style={{ marginBottom: 32, color: "#e0e0e0", fontSize: 15, lineHeight: 1.8 }}>
              <span>← → Changer de voie</span>
              <span style={{ margin: "0 18px" }}>|</span>
              <span>Espace Sauter</span>
            </div>
            <button
              onClick={onStart}
              style={{
                background: "linear-gradient(135deg, #1565c0, #2196f3)",
                color: "#fff",
                border: "none",
                borderRadius: 40,
                padding: "16px 56px",
                fontSize: 22,
                fontWeight: 800,
                cursor: "pointer",
                letterSpacing: 2,
                boxShadow: "0 4px 24px #1565c080",
                transition: "transform 0.1s",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              JOUER
            </button>
          </div>
        </div>
      )}

      {/* Game Over screen */}
      {phase === "gameover" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(40, 0, 0, 0.82)",
            pointerEvents: "auto",
          }}
        >
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 58, fontWeight: 900, color: "#ef5350", textShadow: "0 4px 24px #b71c1c" }}>
              GAME OVER
            </div>
            <div style={{ fontSize: 28, margin: "18px 0 32px", color: "#fff176", fontWeight: 700 }}>
              Score final : {score} 💎
            </div>
            <button
              onClick={onRestart}
              style={{
                background: "linear-gradient(135deg, #b71c1c, #ef5350)",
                color: "#fff",
                border: "none",
                borderRadius: 40,
                padding: "16px 56px",
                fontSize: 22,
                fontWeight: 800,
                cursor: "pointer",
                letterSpacing: 2,
                boxShadow: "0 4px 24px #ef535080",
                transition: "transform 0.1s",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              RECOMMENCER
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
