import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Diamond } from "../useGameState";

const LANE_X = [-2, 0, 2];

/* Pièce d'or façon Subway Surfers — disque qui tourne sur axe Y avec scintillement */
function GoldCoin({ x, z }: { x: number; z: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const sparkRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const t = Date.now() * 0.005;
    const y = 1.0 + Math.sin(t) * 0.12;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.18;
      meshRef.current.position.y = y;
    }
    if (sparkRef.current) {
      sparkRef.current.rotation.z += 0.05;
      sparkRef.current.position.y = y;
    }
    if (matRef.current) {
      const v = 0.85 + Math.sin(t * 3) * 0.15;
      matRef.current.color.setRGB(1.0 * v, 0.85 * v, 0.15 * v);
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Pièce dorée brillante */}
      <mesh ref={meshRef} position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.08, 16]} />
        <meshBasicMaterial ref={matRef} color="#ffd700" toneMapped={false} />
      </mesh>

      {/* Contour cartoon noir épais */}
      <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.045, 6, 18]} />
        <meshBasicMaterial color="#5d3a00" />
      </mesh>

      {/* Étoile scintillement style Subway Surfers */}
      <mesh ref={sparkRef} position={[0, 1.0, 0]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.5, 0.6, 8, 1]} />
        <meshBasicMaterial color="#fff59d" transparent opacity={0.8} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Halo doré sous la pièce */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 12]} />
        <meshBasicMaterial color="#ffa000" transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Diamonds({ diamonds }: { diamonds: Diamond[] }) {
  return (
    <>
      {diamonds.map((d) => (
        <GoldCoin key={d.id} x={LANE_X[d.lane + 1]} z={d.z} />
      ))}
    </>
  );
}
