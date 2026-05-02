import { useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { KeyboardControls, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "./useGameState";
import { SharkPlayer } from "./components/SharkPlayer";
import { Track } from "./components/Track";
import { Obstacles } from "./components/Obstacles";
import { Diamonds } from "./components/Diamonds";
import { Scene } from "./components/Scene";
import { GameUI } from "./GameUI";
import { CheckpointUI } from "./CheckpointUI";
import { LanguageSelector } from "../components/LanguageSelector";
import { useSupabaseSync } from "../hooks/useSupabaseSync";
import { useGamepad } from "../hooks/useGamepad";
import { useT } from "../lib/i18n";
import { useDarkMode } from "../hooks/useDarkMode";
import { useMusic } from "../hooks/useMusic";

enum Controls {
  left = "left",
  right = "right",
  jump = "jump",
}

const keyMap = [
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.jump, keys: ["Space", "ArrowUp", "KeyW"] },
];

function FollowCamera({ playerLane, playerY }: { playerLane: number; playerY: number }) {
  const { camera } = useThree();
  const LANE_X = [-2, 0, 2];
  const targetX = LANE_X[playerLane + 1];

  useFrame((_, delta) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 8);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3.8 + playerY * 0.5, delta * 8);
    camera.position.z = 7;
    camera.lookAt(camera.position.x, playerY + 0.5, -6);
  });

  return null;
}

function GameLoop({
  tick, changeLane, jump, phase,
}: {
  tick: (dt: number) => void;
  changeLane: (dir: 1 | -1) => void;
  jump: () => void;
  phase: string;
}) {
  const [, getState] = useKeyboardControls<Controls>();
  const prevLeft = useRef(false);
  const prevRight = useRef(false);
  const prevJump = useRef(false);

  useFrame((_, delta) => {
    const controls = getState();
    const dt = Math.min(delta, 0.05);

    if (phase === "playing") {
      tick(dt);

      if (controls.left && !prevLeft.current) changeLane(-1);
      if (controls.right && !prevRight.current) changeLane(1);
      if (controls.jump && !prevJump.current) jump();
    }

    prevLeft.current = controls.left;
    prevRight.current = controls.right;
    prevJump.current = controls.jump;
  });

  return null;
}

function CyberLighting() {
  return (
    <>
      {/* Ambiance nuit cyberpunk — bleu nuit */}
      <ambientLight intensity={0.4} color="#3a2a6a" />

      {/* Lumière magenta venant de la droite */}
      <directionalLight position={[8, 6, 4]} intensity={0.4} color="#ff1493" />

      {/* Lumière cyan venant de la gauche */}
      <directionalLight position={[-8, 6, 4]} intensity={0.4} color="#00bcd4" />

      {/* Lumière chaude orange au loin (horizon coucher de soleil) */}
      <directionalLight position={[0, 3, -30]} intensity={0.3} color="#ff6b00" />
    </>
  );
}

function GameScene({ state, tick, changeLane, jump }: ReturnType<typeof useGameState>) {
  const trackSpeed = state.phase === "playing" ? state.speed : 0;

  return (
    <>
      <FollowCamera playerLane={state.lane} playerY={state.playerY} />
      <GameLoop tick={tick} changeLane={changeLane} jump={jump} phase={state.phase} />

      <CyberLighting />

      {/* Brouillard cyberpunk dense — purple/magenta atmosphérique */}
      <fog attach="fog" args={["#1a0828", 25, 90]} />

      {/* Sol nuit très sombre */}
      <mesh position={[0, -0.12, -40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 200]} />
        <meshBasicMaterial color="#050410" toneMapped={false} />
      </mesh>

      <Scene />
      <Track speed={trackSpeed} />
      <Obstacles obstacles={state.phase !== "start" ? state.obstacles : []} />
      <Diamonds diamonds={state.phase !== "start" ? state.diamonds : []} />
      <SharkPlayer lane={state.lane} playerY={state.playerY} isJumping={state.isJumping} />
    </>
  );
}

export function Game() {
  const gameState = useGameState();
  const { state, startGame, resumeGame, changeLane, jump, tick } = gameState;
  const { t } = useT();
  const [dark] = useDarkMode();
  const { startIfEnabled: startMusic, stop: stopMusic } = useMusic();

  /* Démarre la musique orientale dès que la partie commence (ce clic
     est le user-gesture exigé par les navigateurs pour activer
     l'AudioContext). Coupe quand la partie se termine. */
  const handleStart = useCallback(() => {
    startMusic();
    startGame();
  }, [startMusic, startGame]);

  useEffect(() => {
    if (state.phase === "gameover") stopMusic();
  }, [state.phase, stopMusic]);

  useEffect(() => {
    return () => { stopMusic(); };
  }, [stopMusic]);

  const { profile, status } = useSupabaseSync(state.score, state.phase, state.playTime);

  /* Manette PS4/PS5 (Web Gamepad API). Inputs déclenchés en bord montant
     uniquement, et seulement quand la partie est en cours. */
  const { connected: gamepadConnected } = useGamepad({
    enabled: state.phase === "playing",
    onLeft: () => changeLane(-1),
    onRight: () => changeLane(1),
    onJump: jump,
  });

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      minHeight: "100dvh" as never,
      position: "relative",
      background: dark ? "#000" : "#0a0822",
      overflow: "hidden",
    }}>
      {/* Voile sombre global appliqué au-dessus du canvas 3D quand le
          mode sombre est activé. Sous les UIs (HUD, overlays) pour ne
          pas affecter leur lisibilité. */}
      {dark && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "rgba(0,0,0,0.45)",
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }} />
      )}
      <KeyboardControls map={keyMap}>
        <Canvas
          flat
          camera={{ fov: 68, near: 0.1, far: 200, position: [0, 3.8, 7] }}
          style={{ width: "100%", height: "100%" }}
          dpr={[1, 2]}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        >
          <GameScene state={state} tick={tick} changeLane={changeLane} jump={jump} startGame={startGame} resumeGame={resumeGame} />
        </Canvas>
      </KeyboardControls>

      {/* HUD + Contrôles tactiles */}
      <GameUI
        phase={state.phase}
        score={state.score}
        checkpointNumber={state.checkpointNumber}
        nextCheckpointAt={state.nextCheckpointAt}
        playTime={state.playTime}
        profile={profile}
        onStart={handleStart}
        onRestart={handleStart}
        onChangeLane={changeLane}
        onJump={jump}
      />

      {/* Overlay checkpoint */}
      {state.phase === "checkpoint" && (
        <CheckpointUI
          checkpointNumber={state.checkpointNumber}
          score={state.score}
          onResume={resumeGame}
        />
      )}

      {/* Sélecteur de langue (toujours visible, en haut à droite) */}
      <LanguageSelector position="topRight" />

      {/* Indicateur manette connectée (discret, en bas à droite) */}
      {gamepadConnected && (
        <div style={{
          position: "absolute", bottom: 12, right: 12, zIndex: 60,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(76,175,80,0.5)",
          color: "#a5d6a7",
          borderRadius: 20, padding: "6px 12px",
          fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
          boxShadow: "0 0 16px rgba(76,175,80,0.35)",
          pointerEvents: "none",
        }}>
          {t("gamepad.connected")}
        </div>
      )}

    </div>
  );
}
