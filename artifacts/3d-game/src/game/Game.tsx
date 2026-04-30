import { useEffect, useRef } from "react";
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

enum Controls {
  left = "left",
  right = "right",
  jump = "jump",
}

const keyMap = [
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.jump, keys: ["Space"] },
];

function FollowCamera({ playerLane, playerY }: { playerLane: number; playerY: number }) {
  const { camera } = useThree();
  const LANE_X = [-2, 0, 2];
  const targetX = LANE_X[playerLane + 1];

  useFrame((_, delta) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 8);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 4 + playerY * 0.5, delta * 8);
    camera.position.z = 7;
    camera.lookAt(camera.position.x, playerY + 0.5, -6);
  });

  return null;
}

function GameLoop({
  tick,
  changeLane,
  jump,
  phase,
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

      if (controls.left && !prevLeft.current) {
        changeLane(-1);
        console.log("Lane: left");
      }
      if (controls.right && !prevRight.current) {
        changeLane(1);
        console.log("Lane: right");
      }
      if (controls.jump && !prevJump.current) {
        jump();
        console.log("Jump!");
      }
    }

    prevLeft.current = controls.left;
    prevRight.current = controls.right;
    prevJump.current = controls.jump;
  });

  return null;
}

function GameScene({
  state,
  tick,
  changeLane,
  jump,
}: ReturnType<typeof useGameState>) {
  return (
    <>
      <FollowCamera playerLane={state.lane} playerY={state.playerY} />
      <GameLoop tick={tick} changeLane={changeLane} jump={jump} phase={state.phase} />

      {/* Lighting — daytime sunny */}
      <ambientLight intensity={0.7} color="#fff8e1" />
      <directionalLight
        position={[10, 30, -10]}
        intensity={2.0}
        color="#fff5cc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={80}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-8, 10, 10]} intensity={0.5} color="#c8e6fa" />
      {/* Atmospheric haze */}
      <fog attach="fog" args={["#c8dff0", 40, 110]} />

      {/* Ground extend beyond track */}
      <mesh position={[0, -0.12, -40]} receiveShadow>
        <planeGeometry args={[60, 160]} />
        <meshStandardMaterial color="#c8d8a0" roughness={1} />
      </mesh>

      <Scene />
      <Track speed={state.phase === "playing" ? state.speed : 0} />
      <Obstacles obstacles={state.phase !== "start" ? state.obstacles : []} />
      <Diamonds diamonds={state.phase !== "start" ? state.diamonds : []} />
      <SharkPlayer lane={state.lane} playerY={state.playerY} isJumping={state.isJumping} />
    </>
  );
}

export function Game() {
  const gameState = useGameState();
  const { state, startGame, changeLane, jump, tick } = gameState;

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#87ceeb", overflow: "hidden" }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{ fov: 70, near: 0.1, far: 200, position: [0, 4, 7] }}
          style={{ width: "100%", height: "100%" }}
          gl={{ antialias: true }}
        >
          <GameScene state={state} tick={tick} changeLane={changeLane} jump={jump} startGame={startGame} />
        </Canvas>
      </KeyboardControls>

      <GameUI
        phase={state.phase}
        score={state.score}
        onStart={startGame}
        onRestart={startGame}
      />
    </div>
  );
}
