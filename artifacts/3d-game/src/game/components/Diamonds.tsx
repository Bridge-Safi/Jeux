import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Diamond } from "../useGameState";

const LANE_X = [-2, 0, 2];

function BlueDiamond({ x, z }: { x: number; z: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = Date.now() * 0.004;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.045;
      meshRef.current.position.y = 0.95 + Math.sin(t) * 0.14;
    }
    if (glowRef.current) {
      glowRef.current.position.y = 0.95 + Math.sin(t) * 0.14;
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.2 + Math.sin(t * 2) * 0.4;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Corps diamant */}
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial
          color="#64b5f6"
          metalness={0.9}
          roughness={0.05}
          emissive="#1565c0"
          emissiveIntensity={0.9}
        />
      </mesh>

      {/* Halo brillant */}
      <mesh ref={glowRef} position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.05, 8, 28]} />
        <meshStandardMaterial
          color="#90caf9"
          emissive="#1e88e5"
          emissiveIntensity={1.2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Lumière ponctuelle bleue */}
      <pointLight position={[0, 0.9, 0]} color="#2196f3" intensity={1.2} distance={5} />
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
