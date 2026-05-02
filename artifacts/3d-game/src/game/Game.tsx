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
import { SupabasePanel } from "./SupabasePanel";
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

function PlayerLight({ lane, playerY }: { lane: number; playerY: number }) {
  const LANE_X = [-2, 0, 2];
  const x = LANE_X[lane + 1];
  return (
    <>
      {/* Spot blanc puissant sur le joueur */}
      <pointLight position={[x, playerY + 5, 1]} color="#ffffff" intensity={8} distance={14} />
      {/* Halo doré au sol sous le joueur */}
      <pointLight position={[x, playerY + 0.3, 0]} color="#ffd700" intensity={3} distance={6} />
    </>
  );
}

function NightLighting() {
  return (
    <>
      {/* Ambiance nuit — forte pour voir les détails */}
      <ambientLight intensity={0.55} color="#4a5a9e" />

      {/* Lune — lumière principale froide */}
      <directionalLight
        position={[30, 50, -30]}
        intensity={0.9}
        color="#d0e8ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={80}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      {/* Lumière de remplissage — reflet sol humide */}
      <directionalLight position={[-10, 8, 10]} intensity={0.25} color="#3a4a8a" />

      {/* Lumière derrière le joueur — donne de la profondeur */}
      <directionalLight position={[0, 5, 12]} intensity={0.3} color="#ff9040" />

      {/* Lanternes chaudes sur la route — 6 points pour couvrir tout le tunnel visible */}
      <pointLight position={[-3.85, 3.6,  0]} color="#ff8f00" intensity={3.0} distance={18} />
      <pointLight position={[ 3.85, 3.6,  0]} color="#ff8f00" intensity={3.0} distance={18} />
      <pointLight position={[-3.85, 3.6, -18]} color="#ff8f00" intensity={2.5} distance={18} />
      <pointLight position={[ 3.85, 3.6, -18]} color="#ff8f00" intensity={2.5} distance={18} />
      <pointLight position={[-3.85, 3.6, -36]} color="#ff8f00" intensity={2.5} distance={18} />
      <pointLight position={[ 3.85, 3.6, -36]} color="#ff8f00" intensity={2.5} distance={18} />

      {/* Halo bleu-blanc au sol devant le joueur */}
      <pointLight position={[0, 1.5, -4]} color="#90c8ff" intensity={1.2} distance={12} />
    </>
  );
}

function GameScene({ state, tick, changeLane, jump }: ReturnType<typeof useGameState>) {
  const trackSpeed = state.phase === "playing" ? state.speed : 0;

  return (
    <>
      <FollowCamera playerLane={state.lane} playerY={state.playerY} />
      <GameLoop tick={tick} changeLane={changeLane} jump={jump} phase={state.phase} />

      <NightLighting />
      <PlayerLight lane={state.lane} playerY={state.playerY} />

      {/* Brouillard nocturne — commence plus loin pour mieux voir la route */}
      <fog attach="fog" args={["#0a1228", 40, 120]} />

      {/* Sol nuit */}
      <mesh position={[0, -0.12, -40]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 200]} />
        <meshStandardMaterial color="#0a0d08" roughness={1} />
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
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#060d1f", overflow: "hidden" }}>
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
        totalDiamonds={profile?.diamonds_collected ?? 0}
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

      {/* Panneau Supabase */}
      <SupabasePanel
        profile={profile}
        status={status}
        phase={state.phase}
      />
    </div>
  );
}
