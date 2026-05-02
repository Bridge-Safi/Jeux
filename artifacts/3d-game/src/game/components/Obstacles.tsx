import * as THREE from "three";
import type { Obstacle } from "../useGameState";

const LANE_X = [-2, 0, 2];

function WoodenCrate({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.5, z]}>
      {/* Corps caisse — brun visible */}
      <mesh castShadow>
        <boxGeometry args={[0.88, 0.88, 0.88]} />
        <meshBasicMaterial color="#8d6e63" />
      </mesh>
      {/* Planches avant */}
      {([0.22, -0.22] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y, 0.445]}>
          <boxGeometry args={[0.87, 0.09, 0.02]} />
          <meshBasicMaterial color="#6d4c41" />
        </mesh>
      ))}
      {/* Planches verticales */}
      {([0.24, -0.24] as number[]).map((bx, i) => (
        <mesh key={i} position={[bx, 0, 0.445]}>
          <boxGeometry args={[0.09, 0.87, 0.02]} />
          <meshBasicMaterial color="#6d4c41" />
        </mesh>
      ))}
      {/* Renforts dorés coins — bien visibles */}
      {([[-0.41, 0.41], [0.41, 0.41], [-0.41, -0.41], [0.41, -0.41]] as [number,number][]).map(([cx, cz], i) => (
        <mesh key={i} position={[cx, 0.3, cz]}>
          <boxGeometry args={[0.09, 0.24, 0.09]} />
          <meshBasicMaterial color="#ffd54f" />
        </mesh>
      ))}
      {/* X rouge avertissement */}
      <mesh position={[0, 0.1, 0.45]}>
        <boxGeometry args={[0.5, 0.08, 0.02]} />
        <meshBasicMaterial color="#ef5350" />
      </mesh>
      <mesh position={[0, 0.1, 0.45]} rotation={[0, 0, Math.PI / 2.5]}>
        <boxGeometry args={[0.5, 0.08, 0.02]} />
        <meshBasicMaterial color="#ef5350" />
      </mesh>
      <mesh position={[0, 0.1, 0.45]} rotation={[0, 0, -Math.PI / 2.5]}>
        <boxGeometry args={[0.5, 0.08, 0.02]} />
        <meshBasicMaterial color="#ef5350" />
      </mesh>
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
