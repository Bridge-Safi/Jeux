import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Obstacle } from "../useGameState";

const LANE_X = [-2, 0, 2];

/* Wagon de métro stylisé Subway Surfers — couleurs vives + cel-shading */
function TrainCar({ x, z, colorIdx }: { x: number; z: number; colorIdx: number }) {
  const palette = [
    { body: "#e53935", accent: "#fdd835", windows: "#26c6da" }, // rouge ONCF
    { body: "#1e88e5", accent: "#ffffff", windows: "#fff59d" }, // bleu métro
    { body: "#43a047", accent: "#fdd835", windows: "#bbdefb" }, // vert
  ];
  const c = palette[colorIdx % palette.length];

  return (
    <group position={[x, 0, z]}>
      {/* Corps du wagon */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.5, 1.4, 1.5]} />
        <meshBasicMaterial color={c.body} toneMapped={false} />
      </mesh>

      {/* Contour cartoon noir épais (haut) */}
      <mesh position={[0, 1.42, 0]}>
        <boxGeometry args={[1.55, 0.06, 1.55]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Bande accent jaune horizontale (signature Subway Surfers) */}
      <mesh position={[0, 0.9, 0.76]}>
        <boxGeometry args={[1.5, 0.18, 0.02]} />
        <meshBasicMaterial color={c.accent} toneMapped={false} />
      </mesh>

      {/* Fenêtres lumineuses */}
      <mesh position={[-0.4, 1.05, 0.76]}>
        <boxGeometry args={[0.45, 0.32, 0.04]} />
        <meshBasicMaterial color={c.windows} toneMapped={false} />
      </mesh>
      <mesh position={[0.4, 1.05, 0.76]}>
        <boxGeometry args={[0.45, 0.32, 0.04]} />
        <meshBasicMaterial color={c.windows} toneMapped={false} />
      </mesh>

      {/* Cadres fenêtres noirs */}
      <mesh position={[-0.4, 1.05, 0.78]}>
        <boxGeometry args={[0.5, 0.08, 0.02]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.4, 1.05, 0.78]}>
        <boxGeometry args={[0.5, 0.08, 0.02]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Phare avant */}
      <mesh position={[0, 0.6, 0.76]}>
        <boxGeometry args={[0.3, 0.16, 0.04]} />
        <meshBasicMaterial color="#fffde7" toneMapped={false} />
      </mesh>

      {/* Roues noires */}
      <mesh position={[-0.45, 0.15, 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 10]} />
        <meshBasicMaterial color="#212121" />
      </mesh>
      <mesh position={[0.45, 0.15, 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 10]} />
        <meshBasicMaterial color="#212121" />
      </mesh>
      <mesh position={[-0.45, 0.15, -0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 10]} />
        <meshBasicMaterial color="#212121" />
      </mesh>
      <mesh position={[0.45, 0.15, -0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 10]} />
        <meshBasicMaterial color="#212121" />
      </mesh>

      {/* Logo Bridge sur le côté */}
      <mesh position={[0, 0.5, 0.76]}>
        <circleGeometry args={[0.13, 12]} />
        <meshBasicMaterial color="#fff" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* Barrière métro — classique pour sauter par-dessus */
function MetroBarrier({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      const t = Date.now() * 0.003;
      ref.current.scale.y = 1 + Math.sin(t) * 0.05;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.4, 0.1, 0.4]} />
        <meshBasicMaterial color="#fdd835" toneMapped={false} />
      </mesh>
      {/* Poteaux */}
      <mesh position={[-0.55, 0.5, 0]}>
        <boxGeometry args={[0.12, 0.9, 0.12]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.55, 0.5, 0]}>
        <boxGeometry args={[0.12, 0.9, 0.12]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      {/* Panneau jaune+noir rayé */}
      <mesh ref={ref} position={[0, 0.85, 0]}>
        <boxGeometry args={[1.3, 0.5, 0.06]} />
        <meshBasicMaterial color="#fdd835" toneMapped={false} />
      </mesh>
      {/* Rayures noires diagonales */}
      {[-0.4, -0.1, 0.2, 0.5].map((rx, i) => (
        <mesh key={i} position={[rx, 0.85, 0.04]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.12, 0.7, 0.02]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {/* Symbole STOP rouge centré */}
      <mesh position={[0, 0.85, 0.06]}>
        <circleGeometry args={[0.18, 8]} />
        <meshBasicMaterial color="#e53935" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Obstacles({ obstacles }: { obstacles: Obstacle[] }) {
  return (
    <>
      {obstacles.map((o, idx) => {
        // Alterne wagons et barrières selon ID
        const isTrain = idx % 2 === 0;
        return isTrain ? (
          <TrainCar key={o.id} x={LANE_X[o.lane + 1]} z={o.z} colorIdx={idx} />
        ) : (
          <MetroBarrier key={o.id} x={LANE_X[o.lane + 1]} z={o.z} />
        );
      })}
    </>
  );
}
