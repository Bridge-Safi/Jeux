import { useRef } from "react";
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
import { useSupabaseSync } from "../hooks/useSupabaseSync";

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

  const { profile, status } = useSupabaseSync(state.score, state.phase, state.playTime);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#0a0822", overflow: "hidden" }}>
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
        onStart={startGame}
        onRestart={startGame}
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

    </div>
  );
}
