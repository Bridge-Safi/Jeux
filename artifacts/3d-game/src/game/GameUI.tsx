import { useState, useCallback } from "react";
import type { GamePhase } from "./useGameState";

interface GameUIProps {
  phase: GamePhase;
  score: number;
  checkpointNumber: number;
  nextCheckpointAt: number;
  playTime: number;
  onStart: () => void;
  onRestart: () => void;
  onChangeLane: (dir: 1 | -1) => void;
  onJump: () => void;
}

function TouchButton({
  label, icon, onClick, color, style
}: {
  label: string; icon: string; onClick: () => void; color: string; style?: React.CSSProperties;
}) {
  const [pressed, setPressed] = useState(false);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setPressed(true);
    onClick();
  }, [onClick]);

  const handleEnd = useCallback(() => {
    setPressed(false);
  }, []);

  return (
    <button
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      style={{
        width: 74,
        height: 74,
        borderRadius: 18,
        border: `2px solid ${color}`,
        background: pressed
          ? `${color}55`
          : `linear-gradient(145deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)`,
        color: "white",
        fontSize: 28,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        boxShadow: pressed ? `0 0 20px ${color}88` : `0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`,
        transform: pressed ? "scale(0.92)" : "scale(1)",
        transition: "all 0.08s ease",
        userSelect: "none",
        WebkitUserSelect: "none",
        backdropFilter: "blur(6px)",
        ...style,
      }}
    >
      <span style={{ lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 9, opacity: 0.7, letterSpacing: 0.5, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

function HUD({ score, checkpointNumber, playTime, nextCheckpointAt }: {
  score: number; checkpointNumber: number; playTime: number; nextCheckpointAt: number;
}) {
  const timeToNext = Math.max(0, Math.ceil(nextCheckpointAt - playTime));
  const progress = Math.min(1, (50 - timeToNext) / 50);
  const diamonds = Math.floor(score / 10);

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0,
      padding: "12px 14px 0",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
      pointerEvents: "none",
    }}>
      {/* Score diamants */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(10,20,60,0.85) 100%)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(100,180,255,0.3)",
        borderRadius: 16,
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 110,
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
      }}>
        <span style={{ fontSize: 26 }}>💎</span>
        <div>
          <div style={{ color: "#90caf9", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Diamants</div>
          <div style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1, textShadow: "0 0 12px #42a5f5" }}>{diamonds}</div>
        </div>
      </div>

      {/* Barre checkpoint centrale */}
      <div style={{
        flex: 1,
        maxWidth: 260,
        background: "linear-gradient(135deg, rgba(0,0,0,0.8), rgba(30,10,0,0.85))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,140,0,0.35)",
        borderRadius: 14,
        padding: "8px 14px",
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
      }}>
        <div style={{ color: "#ffa726", fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginBottom: 5 }}>
          🍽️ Prochain arrêt · {timeToNext}s
        </div>
        <div style={{
          height: 8,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 6,
          overflow: "hidden",
          border: "1px solid rgba(255,140,0,0.2)",
        }}>
          <div style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #ff6f00, #ffd54f)",
            borderRadius: 6,
            transition: "width 0.4s",
            boxShadow: "0 0 8px #ff8f00",
          }} />
        </div>
      </div>

      {/* Checkpoint + Score total */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,30,5,0.85))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(100,220,80,0.3)",
        borderRadius: 16,
        padding: "8px 14px",
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
      }}>
        <div style={{ color: "#a5d6a7", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Score</div>
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1.1, textShadow: "0 0 10px #66bb6a" }}>{score}</div>
        {checkpointNumber > 0 && (
          <div style={{ color: "#ffd54f", fontSize: 10, marginTop: 2 }}>🏁 ×{checkpointNumber}</div>
        )}
      </div>
    </div>
  );
}

function TouchControls({ onChangeLane, onJump }: {
  onChangeLane: (dir: 1 | -1) => void; onJump: () => void;
}) {
  return (
    <div style={{
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      padding: "0 18px",
      pointerEvents: "auto",
    }}>
      {/* Flèche gauche */}
      <TouchButton
        icon="◀"
        label="GAUCHE"
        color="#42a5f5"
        onClick={() => onChangeLane(-1)}
      />

      {/* Bouton Sauter — centre */}
      <TouchButton
        icon="▲"
        label="SAUTER"
        color="#ffd740"
        onClick={onJump}
        style={{ width: 88, height: 88, borderRadius: 24, fontSize: 32 }}
      />

      {/* Flèche droite */}
      <TouchButton
        icon="▶"
        label="DROITE"
        color="#42a5f5"
        onClick={() => onChangeLane(1)}
      />
    </div>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "url(/assets/shark-warrior-night.jpeg)",
      backgroundSize: "cover",
      backgroundPosition: "center top",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingBottom: 36,
      pointerEvents: "auto",
    }}>
      {/* Overlay dégradé bas */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 40%, rgba(0,10,40,0.92) 75%, rgba(0,5,20,0.98) 100%)",
      }} />

      {/* Contenu bas */}
      <div style={{ position: "relative", textAlign: "center", width: "100%", padding: "0 24px" }}>

        {/* Titre */}
        <div style={{
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: 3,
          color: "#fff",
          textShadow: "0 0 40px #1565c0, 0 4px 24px rgba(0,0,0,0.9)",
          fontFamily: "'Segoe UI', 'Arial Black', sans-serif",
          lineHeight: 1,
          marginBottom: 4,
        }}>
          🦈 SAFI RUNNER
        </div>

        {/* Sous-titre */}
        <div style={{
          fontSize: 14,
          color: "#90caf9",
          marginBottom: 18,
          letterSpacing: 2,
          textShadow: "0 2px 8px #000",
          fontWeight: 600,
          textTransform: "uppercase",
        }}>
          Médina de Safi · Course Infinie 3D
        </div>

        {/* Badges infos */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
          {[
            { icon: "💎", text: "Collecte des diamants" },
            { icon: "🍽️", text: "Pauses toutes les 50s" },
            { icon: "🏆", text: "Score en ligne" },
          ].map((b, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 12,
              color: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}>
              <span>{b.icon}</span> {b.text}
            </div>
          ))}
        </div>

        {/* Contrôles info */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginBottom: 24,
          color: "#bbb",
          fontSize: 12,
        }}>
          <span>◀ ▶ Voies</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>↑ / Espace Sauter</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>Boutons tactiles ✓</span>
        </div>

        {/* Bouton JOUER */}
        <button
          onClick={onStart}
          style={{
            background: "linear-gradient(135deg, #1565c0 0%, #42a5f5 50%, #1565c0 100%)",
            backgroundSize: "200% auto",
            color: "#fff",
            border: "none",
            borderRadius: 50,
            padding: "18px 60px",
            fontSize: 22,
            fontWeight: 900,
            cursor: "pointer",
            letterSpacing: 3,
            textTransform: "uppercase",
            boxShadow: "0 0 30px #1565c088, 0 6px 24px rgba(0,0,0,0.6)",
            animation: "pulse 2s infinite",
            transition: "transform 0.1s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          ▶ JOUER
        </button>
      </div>
    </div>
  );
}

function GameOverScreen({ score, checkpointNumber, onRestart }: {
  score: number; checkpointNumber: number; onRestart: () => void;
}) {
  const diamonds = Math.floor(score / 10);
  const sardines = Math.floor(score / 50);

  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "url(/assets/shark-warrior-night.jpeg)",
      backgroundSize: "cover",
      backgroundPosition: "center top",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "auto",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(80,0,0,0.7) 0%, rgba(20,0,0,0.95) 100%)",
      }} />

      <div style={{ position: "relative", textAlign: "center", padding: "0 28px", width: "100%", maxWidth: 420 }}>
        {/* Titre */}
        <div style={{
          fontSize: 56,
          fontWeight: 900,
          color: "#ef5350",
          textShadow: "0 0 40px #b71c1c, 0 4px 16px rgba(0,0,0,0.9)",
          letterSpacing: 3,
          lineHeight: 1,
          marginBottom: 6,
        }}>
          GAME OVER
        </div>
        <div style={{ color: "#ff8a80", fontSize: 14, marginBottom: 28, opacity: 0.8 }}>
          Le Requin Guerrier s'est arrêté !
        </div>

        {/* Cartes stats */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28 }}>
          {[
            { icon: "💎", label: "Diamants", value: diamonds, color: "#42a5f5" },
            { icon: "🏆", label: "Score", value: score, color: "#ffd740" },
            { icon: "🍽️", label: "Pauses", value: checkpointNumber, color: "#66bb6a" },
            { icon: "🐟", label: "Sardines", value: sardines, color: "#80cbc4" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
              border: `1px solid ${stat.color}40`,
              borderRadius: 16,
              padding: "12px 10px",
              minWidth: 72,
              boxShadow: `0 4px 16px rgba(0,0,0,0.5)`,
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ color: stat.color, fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: "#aaa", fontSize: 9, marginTop: 3, letterSpacing: 0.5 }}>{stat.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Bouton rejouer */}
        <button
          onClick={onRestart}
          style={{
            background: "linear-gradient(135deg, #b71c1c 0%, #ef5350 50%, #b71c1c 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 50,
            padding: "18px 56px",
            fontSize: 20,
            fontWeight: 900,
            cursor: "pointer",
            letterSpacing: 3,
            textTransform: "uppercase",
            boxShadow: "0 0 28px #b71c1c88, 0 6px 24px rgba(0,0,0,0.6)",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          🔄 RECOMMENCER
        </button>
      </div>
    </div>
  );
}

export function GameUI({
  phase, score, checkpointNumber, nextCheckpointAt, playTime,
  onStart, onRestart, onChangeLane, onJump,
}: GameUIProps) {

  return (
    <div style={{
      position: "absolute", inset: 0,
      fontFamily: "'Segoe UI', 'Arial', sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 30px #1565c088, 0 6px 24px rgba(0,0,0,0.6); }
          50% { box-shadow: 0 0 50px #42a5f5cc, 0 8px 32px rgba(0,0,0,0.7); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {/* Écran de démarrage */}
      {phase === "start" && <StartScreen onStart={onStart} />}

      {/* Game Over */}
      {phase === "gameover" && (
        <GameOverScreen score={score} checkpointNumber={checkpointNumber} onRestart={onRestart} />
      )}

      {/* HUD en jeu */}
      {phase === "playing" && (
        <>
          <HUD score={score} checkpointNumber={checkpointNumber} playTime={playTime} nextCheckpointAt={nextCheckpointAt} />
          <TouchControls onChangeLane={onChangeLane} onJump={onJump} />
        </>
      )}
    </div>
  );
}
