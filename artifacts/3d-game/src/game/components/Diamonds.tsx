import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Diamond } from "../useGameState";

const LANE_X = [-2, 0, 2];

function BlueDiamond({ x, z }: { x: number; z: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const t = Date.now() * 0.004;
    const y = 0.95 + Math.sin(t) * 0.14;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.045;
      meshRef.current.position.y = y;
    }
    if (ringRef.current) {
      ringRef.current.position.y = y;
    }
    /* Pulse couleur */
    if (matRef.current) {
      const v = 0.75 + Math.sin(t * 2) * 0.25;
      matRef.current.color.setRGB(0.39 * v, 0.71 * v, 0.96 * v);
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Corps diamant — meshBasicMaterial = toujours visible */}
      <mesh ref={meshRef} position={[0, 0.95, 0]}>
        <octahedronGeometry args={[0.34, 0]} />
        <meshBasicMaterial ref={matRef} color="#64b5f6" />
      </mesh>

      {/* Halo anneau */}
      <mesh ref={ringRef} position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.055, 6, 24]} />
        <meshBasicMaterial color="#90caf9" transparent opacity={0.7} />
      </mesh>

      {/* Éclat statique sous le diamant */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 12]} />
        <meshBasicMaterial color="#1e88e5" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export function Diamonds({ diamonds }: { diamonds: Diamond[] }) {
  return (
    <>
      {diamonds.map((d) => (
        <BlueDiamond key={d.id} x={LANE_X[d.lane + 1]} z={d.z} />
      ))}
    </>
  );
}
