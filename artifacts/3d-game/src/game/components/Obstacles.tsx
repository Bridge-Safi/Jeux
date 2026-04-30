import * as THREE from "three";
import type { Obstacle } from "../useGameState";

const LANE_X = [-2, 0, 2];

function WoodenCrate({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.5, z]}>
      {/* Corps de la caisse */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.88, 0.88, 0.88]} />
        <meshStandardMaterial color="#5d3a1a" roughness={0.92} />
      </mesh>
      {/* Planches horizontales */}
      {[0.22, -0.22].map((y, i) => (
        [0.44, -0.44].map((z2, j) => (
          <mesh key={`${i}-${j}`} position={[0, y, z2]}>
            <boxGeometry args={[0.87, 0.09, 0.02]} />
            <meshStandardMaterial color="#4a2c12" roughness={0.95} />
          </mesh>
        ))
      ))}
      {/* Planches verticales avant */}
      {[0.24, -0.24].map((bx, i) => (
        <mesh key={i} position={[bx, 0, 0.44]}>
          <boxGeometry args={[0.09, 0.87, 0.02]} />
          <meshStandardMaterial color="#4a2c12" roughness={0.95} />
        </mesh>
      ))}
      {/* Renforts métalliques dorés aux coins */}
      {[[-0.41, 0.41], [0.41, 0.41], [-0.41, -0.41], [0.41, -0.41]].map(([cx, cz], i) => (
        <mesh key={i} position={[cx as number, 0.3, cz as number]}>
          <boxGeometry args={[0.08, 0.22, 0.08]} />
          <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
      {/* Clous */}
      {[
        [0.24, 0.22, 0.45], [-0.24, 0.22, 0.45],
        [0.24, -0.22, 0.45], [-0.24, -0.22, 0.45],
      ].map(([cx, cy, cz], i) => (
        <mesh key={i} position={[cx as number, cy as number, cz as number]}>
          <boxGeometry args={[0.045, 0.045, 0.02]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Lumière rouge d'avertissement */}
      <pointLight position={[0, 0.6, 0]} color="#ff1744" intensity={0.6} distance={4} />
    </group>
  );
}

export function Obstacles({ obstacles }: { obstacles: Obstacle[] }) {
  return (
    <>
      {obstacles.map((o) => (
        <WoodenCrate key={o.id} x={LANE_X[o.lane + 1]} z={o.z} />
      ))}
    </>
  );
}
