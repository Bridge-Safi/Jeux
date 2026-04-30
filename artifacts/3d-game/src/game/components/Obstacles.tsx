import * as THREE from "three";
import type { Obstacle } from "../useGameState";

const LANE_X = [-2, 0, 2];

interface ObstaclesProps {
  obstacles: Obstacle[];
}

function WoodenCrate({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.5, z]}>
      {/* Main crate body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.85, 0.85]} />
        <meshStandardMaterial color="#8B6914" roughness={0.9} />
      </mesh>
      {/* Horizontal planks */}
      <mesh position={[0, 0.22, 0.43]}>
        <boxGeometry args={[0.84, 0.08, 0.02]} />
        <meshStandardMaterial color="#6B4F10" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.22, 0.43]}>
        <boxGeometry args={[0.84, 0.08, 0.02]} />
        <meshStandardMaterial color="#6B4F10" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.22, -0.43]}>
        <boxGeometry args={[0.84, 0.08, 0.02]} />
        <meshStandardMaterial color="#6B4F10" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.22, -0.43]}>
        <boxGeometry args={[0.84, 0.08, 0.02]} />
        <meshStandardMaterial color="#6B4F10" roughness={0.95} />
      </mesh>
      {/* Vertical planks front */}
      <mesh position={[0.22, 0, 0.43]}>
        <boxGeometry args={[0.08, 0.84, 0.02]} />
        <meshStandardMaterial color="#6B4F10" roughness={0.95} />
      </mesh>
      <mesh position={[-0.22, 0, 0.43]}>
        <boxGeometry args={[0.08, 0.84, 0.02]} />
        <meshStandardMaterial color="#6B4F10" roughness={0.95} />
      </mesh>
      {/* Nails */}
      <mesh position={[0.22, 0.22, 0.44]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
      <mesh position={[-0.22, 0.22, 0.44]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
    </group>
  );
}

export function Obstacles({ obstacles }: ObstaclesProps) {
  return (
    <>
      {obstacles.map((o) => (
        <WoodenCrate key={o.id} x={LANE_X[o.lane + 1]} z={o.z} />
      ))}
    </>
  );
}
