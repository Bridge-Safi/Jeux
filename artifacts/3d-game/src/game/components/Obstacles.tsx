import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Obstacle } from "../useGameState";

const LANE_X = [-2, 0, 2];

/* ─────────────────────────────────────────────────────────────
   CHAMPIGNON GÉANT — obstacle principal
   Chapeau rouge à pois blancs, pied crème, spores dorées
   ───────────────────────────────────────────────────────────── */
function Champignon({ x, z }: { x: number; z: number }) {
  const capRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const spore1Ref = useRef<THREE.Mesh>(null);
  const spore2Ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = Date.now() * 0.002;
    if (capRef.current) {
      capRef.current.position.y = 1.1 + Math.sin(t * 1.2) * 0.04;
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(t * 0.8) * 0.06;
    }
    if (spore1Ref.current) {
      spore1Ref.current.position.y = 1.9 + Math.sin(t + 0.5) * 0.15;
      spore1Ref.current.position.x = x + Math.cos(t * 0.9) * 0.18;
      const mat = spore1Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(t * 1.5) * 0.3;
    }
    if (spore2Ref.current) {
      spore2Ref.current.position.y = 2.05 + Math.sin(t * 1.3 + 1.2) * 0.12;
      spore2Ref.current.position.x = x + Math.cos(t * 1.1 + 2) * 0.22;
      const mat = spore2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(t * 1.1) * 0.25;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Sol — cercle de mousse verte */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 20]} />
        <meshBasicMaterial color="#1e8449" transparent opacity={0.5} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Pied du champignon — cylindre crème */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.28, 0.38, 1.0, 14]} />
        <meshBasicMaterial color="#f0e6c8" toneMapped={false} />
      </mesh>

      {/* Anneau (voile partiel) sur le pied */}
      <mesh position={[0, 0.72, 0]}>
        <torusGeometry args={[0.32, 0.045, 8, 18]} />
        <meshBasicMaterial color="#d5c9a1" toneMapped={false} />
      </mesh>

      {/* Chapeau principal — demi-sphère rouge vif */}
      <mesh ref={capRef} position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.92, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#e74c3c" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Bord inférieur du chapeau (frange) */}
      <mesh position={[0, 1.1, 0]}>
        <torusGeometry args={[0.92, 0.06, 8, 22]} />
        <meshBasicMaterial color="#c0392b" toneMapped={false} />
      </mesh>

      {/* Pois blancs sur le chapeau — 7 spots */}
      <mesh position={[0, 1.92, 0]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshBasicMaterial color="#fdfefe" toneMapped={false} />
      </mesh>
      <mesh position={[0.5, 1.75, 0.4]}>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshBasicMaterial color="#fdfefe" toneMapped={false} />
      </mesh>
      <mesh position={[-0.52, 1.72, 0.32]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color="#fdfefe" toneMapped={false} />
      </mesh>
      <mesh position={[0.42, 1.73, -0.45]}>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshBasicMaterial color="#fdfefe" toneMapped={false} />
      </mesh>
      <mesh position={[-0.44, 1.70, -0.42]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color="#fdfefe" toneMapped={false} />
      </mesh>
      <mesh position={[0.08, 1.59, 0.82]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshBasicMaterial color="#fdfefe" toneMapped={false} />
      </mesh>
      <mesh position={[-0.1, 1.58, -0.84]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshBasicMaterial color="#fdfefe" toneMapped={false} />
      </mesh>

      {/* Spores flottantes dorées */}
      <mesh ref={spore1Ref} position={[x + 0.18, 1.9, z]}>
        <sphereGeometry args={[0.055, 7, 7]} />
        <meshBasicMaterial color="#f9e79f" transparent opacity={0.7} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={spore2Ref} position={[x - 0.22, 2.05, z]}>
        <sphereGeometry args={[0.045, 7, 7]} />
        <meshBasicMaterial color="#f7dc6f" transparent opacity={0.55} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[0.3, 1.65, 0.1]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshBasicMaterial color="#f9e79f" transparent opacity={0.4} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Halo violet magique au sol */}
      <mesh ref={glowRef} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial color="#9b59b6" transparent opacity={0.15} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Obstacles({ obstacles }: { obstacles: Obstacle[] }) {
  return (
    <>
      {obstacles.map((o) => {
        const x = LANE_X[o.lane + 1];
        return <Champignon key={o.id} x={x} z={o.z} />;
      })}
    </>
  );
}
