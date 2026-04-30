import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Diamond } from "../useGameState";

const LANE_X = [-2, 0, 2];

function BlueDiamond({ x, z }: { x: number; z: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.04;
      meshRef.current.position.y = 0.9 + Math.sin(Date.now() * 0.004) * 0.12;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color="#2196f3"
          metalness={0.8}
          roughness={0.1}
          emissive="#0d47a1"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Glow ring */}
      <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.04, 8, 24]} />
        <meshStandardMaterial color="#64b5f6" emissive="#1565c0" emissiveIntensity={0.6} transparent opacity={0.7} />
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
