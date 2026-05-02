import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Obstacle } from "../useGameState";

const LANE_X = [-2, 0, 2];

/* ─────────────────────────────────────────────────────────────
   VOITURE SPORT FUTURISTE — style NFS Heat avec underglow néon
   ───────────────────────────────────────────────────────────── */
function FuturisticCar({ x, z, colorIdx }: { x: number; z: number; colorIdx: number }) {
  const palette = [
    { body: "#0a0a14", glow: "#ff1493", headlight: "#00f0ff" }, // noir/magenta
    { body: "#0a0a14", glow: "#00f0ff", headlight: "#ffeb3b" }, // noir/cyan
    { body: "#1a0a14", glow: "#39ff14", headlight: "#ffffff" }, // noir/lime
  ];
  const c = palette[colorIdx % palette.length];

  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      const t = Date.now() * 0.005;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t + colorIdx) * 0.25;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Carrosserie — capot bas et long */}
      <mesh position={[0, 0.45, 0.3]}>
        <boxGeometry args={[1.55, 0.55, 1.6]} />
        <meshBasicMaterial color={c.body} toneMapped={false} />
      </mesh>

      {/* Habitacle/cockpit plus haut */}
      <mesh position={[0, 0.85, -0.05]}>
        <boxGeometry args={[1.35, 0.45, 0.95]} />
        <meshBasicMaterial color="#050508" toneMapped={false} />
      </mesh>

      {/* Pare-brise teinté */}
      <mesh position={[0, 0.92, 0.3]} rotation={[-Math.PI / 7, 0, 0]}>
        <planeGeometry args={[1.25, 0.55]} />
        <meshBasicMaterial color="#1a2a4a" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Phares avant — bandes LED horizontales */}
      <mesh position={[-0.45, 0.45, 1.11]}>
        <boxGeometry args={[0.5, 0.08, 0.04]} />
        <meshBasicMaterial color={c.headlight} toneMapped={false} />
      </mesh>
      <mesh position={[0.45, 0.45, 1.11]}>
        <boxGeometry args={[0.5, 0.08, 0.04]} />
        <meshBasicMaterial color={c.headlight} toneMapped={false} />
      </mesh>
      {/* Halo des phares */}
      <mesh position={[-0.45, 0.45, 1.18]}>
        <planeGeometry args={[1.0, 0.4]} />
        <meshBasicMaterial color={c.headlight} transparent opacity={0.3} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[0.45, 0.45, 1.18]}>
        <planeGeometry args={[1.0, 0.4]} />
        <meshBasicMaterial color={c.headlight} transparent opacity={0.3} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Feux arrière néon */}
      <mesh position={[0, 0.55, -0.51]}>
        <boxGeometry args={[1.4, 0.06, 0.04]} />
        <meshBasicMaterial color="#ff1744" toneMapped={false} />
      </mesh>

      {/* Bandes néon latérales (haut de carrosserie) */}
      <mesh position={[-0.78, 0.45, 0.3]}>
        <boxGeometry args={[0.02, 0.08, 1.3]} />
        <meshBasicMaterial color={c.glow} toneMapped={false} />
      </mesh>
      <mesh position={[0.78, 0.45, 0.3]}>
        <boxGeometry args={[0.02, 0.08, 1.3]} />
        <meshBasicMaterial color={c.glow} toneMapped={false} />
      </mesh>

      {/* UNDERGLOW néon sous la voiture (signature NFS) */}
      <mesh ref={ref} position={[0, 0.05, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 2.4]} />
        <meshBasicMaterial color={c.glow} transparent opacity={0.6} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* Underglow extérieur plus large */}
      <mesh position={[0, 0.03, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 4.0]} />
        <meshBasicMaterial color={c.glow} transparent opacity={0.18} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Roues sportives basses */}
      <mesh position={[-0.7, 0.22, 0.7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.13, 12]} />
        <meshBasicMaterial color="#0a0a14" toneMapped={false} />
      </mesh>
      <mesh position={[0.7, 0.22, 0.7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.13, 12]} />
        <meshBasicMaterial color="#0a0a14" toneMapped={false} />
      </mesh>
      <mesh position={[-0.7, 0.22, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.13, 12]} />
        <meshBasicMaterial color="#0a0a14" toneMapped={false} />
      </mesh>
      <mesh position={[0.7, 0.22, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.13, 12]} />
        <meshBasicMaterial color="#0a0a14" toneMapped={false} />
      </mesh>

      {/* Jantes néon (centre des roues) */}
      <mesh position={[-0.78, 0.22, 0.7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
        <meshBasicMaterial color={c.glow} toneMapped={false} />
      </mesh>
      <mesh position={[0.78, 0.22, 0.7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
        <meshBasicMaterial color={c.glow} toneMapped={false} />
      </mesh>

      {/* Aileron arrière */}
      <mesh position={[0, 0.95, -0.55]}>
        <boxGeometry args={[1.5, 0.06, 0.25]} />
        <meshBasicMaterial color="#0a0a14" toneMapped={false} />
      </mesh>
      <mesh position={[-0.7, 0.85, -0.55]}>
        <boxGeometry args={[0.06, 0.2, 0.25]} />
        <meshBasicMaterial color="#0a0a14" toneMapped={false} />
      </mesh>
      <mesh position={[0.7, 0.85, -0.55]}>
        <boxGeometry args={[0.06, 0.2, 0.25]} />
        <meshBasicMaterial color="#0a0a14" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   BARRIÈRE LASER HOLO — pulse rouge animée
   ───────────────────────────────────────────────────────────── */
function LaserBarrier({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const t = Date.now() * 0.006;
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.7 + Math.sin(t) * 0.3;
    }
    if (ref2.current) {
      const mat = ref2.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(t + Math.PI) * 0.2;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Poteaux métalliques */}
      <mesh position={[-0.65, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1, 6]} />
        <meshBasicMaterial color="#1a1a28" toneMapped={false} />
      </mesh>
      <mesh position={[0.65, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1, 6]} />
        <meshBasicMaterial color="#1a1a28" toneMapped={false} />
      </mesh>
      {/* Capuchons rouges en haut */}
      <mesh position={[-0.65, 1.05, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#ff1744" toneMapped={false} />
      </mesh>
      <mesh position={[0.65, 1.05, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#ff1744" toneMapped={false} />
      </mesh>

      {/* Faisceaux lasers horizontaux (3 niveaux) */}
      <mesh ref={ref} position={[0, 0.85, 0]}>
        <boxGeometry args={[1.45, 0.05, 0.05]} />
        <meshBasicMaterial color="#ff1744" transparent opacity={1} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.45, 0.05, 0.05]} />
        <meshBasicMaterial color="#ff1744" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.45, 0.05, 0.05]} />
        <meshBasicMaterial color="#ff1744" toneMapped={false} />
      </mesh>

      {/* Halo glow rouge énorme */}
      <mesh ref={ref2} position={[0, 0.55, 0]}>
        <planeGeometry args={[1.8, 1.0]} />
        <meshBasicMaterial color="#ff1744" transparent opacity={0.45} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Halo plus large encore */}
      <mesh position={[0, 0.55, 0]}>
        <planeGeometry args={[3, 1.8]} />
        <meshBasicMaterial color="#ff1744" transparent opacity={0.12} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Reflet rouge au sol */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 1.4]} />
        <meshBasicMaterial color="#ff1744" transparent opacity={0.25} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Symbole STOP central */}
      <mesh position={[0, 0.55, 0.06]}>
        <circleGeometry args={[0.18, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Obstacles({ obstacles }: { obstacles: Obstacle[] }) {
  return (
    <>
      {obstacles.map((o, idx) => {
        const isCar = idx % 2 === 0;
        return isCar ? (
          <FuturisticCar key={o.id} x={LANE_X[o.lane + 1]} z={o.z} colorIdx={idx} />
        ) : (
          <LaserBarrier key={o.id} x={LANE_X[o.lane + 1]} z={o.z} />
        );
      })}
    </>
  );
}
