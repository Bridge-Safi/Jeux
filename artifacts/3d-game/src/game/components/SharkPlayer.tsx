import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LANE_X = [-2, 0, 2];

interface SharkPlayerProps {
  lane: number;
  playerY: number;
  isJumping: boolean;
}

export function SharkPlayer({ lane, playerY, isJumping }: SharkPlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const legLRef = useRef<THREE.Mesh>(null);
  const legRRef = useRef<THREE.Mesh>(null);

  const targetX = LANE_X[lane + 1];

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      Math.min(1, delta * 12)
    );

    groupRef.current.position.y = playerY;

    const t = Date.now() * 0.006;
    if (!isJumping) {
      if (legLRef.current) legLRef.current.rotation.x = Math.sin(t) * 0.5;
      if (legRRef.current) legRRef.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.z = isJumping ? 0.15 : Math.sin(t * 0.5) * 0.02;
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 1.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group position={[0, 0.9, 0]}>
        {/* Main body */}
        <mesh ref={bodyRef} position={[0, 0, 0]}>
          <capsuleGeometry args={[0.28, 0.7, 6, 12]} />
          <meshStandardMaterial color="#5588cc" />
        </mesh>

        {/* Belly */}
        <mesh position={[0, -0.1, 0.22]}>
          <capsuleGeometry args={[0.20, 0.45, 4, 8]} />
          <meshStandardMaterial color="#eef5ff" />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.5, 0.0]}>
          <sphereGeometry args={[0.3, 10, 10]} />
          <meshStandardMaterial color="#5588cc" />
        </mesh>

        {/* Snout */}
        <mesh position={[0, 0.34, 0.28]} rotation={[0.5, 0, 0]}>
          <coneGeometry args={[0.18, 0.28, 8]} />
          <meshStandardMaterial color="#5588cc" />
        </mesh>

        {/* Eyes */}
        <mesh position={[0.13, 0.6, 0.22]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[-0.13, 0.6, 0.22]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0.14, 0.6, 0.27]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[-0.14, 0.6, 0.27]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        {/* Dorsal fin */}
        <mesh position={[0, 0.28, -0.15]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.1, 0.35, 4]} />
          <meshStandardMaterial color="#4477bb" />
        </mesh>

        {/* Red hair tufts */}
        <mesh position={[0.05, 0.85, 0.1]}>
          <sphereGeometry args={[0.11, 8, 8]} />
          <meshStandardMaterial color="#cc3311" />
        </mesh>
        <mesh position={[-0.08, 0.88, 0.05]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#dd4422" />
        </mesh>
        <mesh position={[0.01, 0.92, 0.05]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#cc2200" />
        </mesh>

        {/* Tail */}
        <mesh ref={tailRef} position={[0, -0.05, -0.45]}>
          <coneGeometry args={[0.18, 0.45, 4]} />
          <meshStandardMaterial color="#4477bb" />
        </mesh>
        <mesh position={[0.2, -0.05, -0.5]} rotation={[0, 0, -0.8]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#4477bb" />
        </mesh>
        <mesh position={[-0.2, -0.05, -0.5]} rotation={[0, 0, 0.8]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#4477bb" />
        </mesh>

        {/* Pectoral fins */}
        <mesh position={[0.35, 0.1, 0.1]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.1, 0.28, 5]} />
          <meshStandardMaterial color="#4477bb" />
        </mesh>
        <mesh position={[-0.35, 0.1, 0.1]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.1, 0.28, 5]} />
          <meshStandardMaterial color="#4477bb" />
        </mesh>

        {/* Legs */}
        <mesh ref={legLRef} position={[0.15, -0.55, 0.05]}>
          <capsuleGeometry args={[0.09, 0.28, 4, 8]} />
          <meshStandardMaterial color="#5588cc" />
        </mesh>
        <mesh ref={legRRef} position={[-0.15, -0.55, 0.05]}>
          <capsuleGeometry args={[0.09, 0.28, 4, 8]} />
          <meshStandardMaterial color="#5588cc" />
        </mesh>

        {/* Shoes */}
        <mesh position={[0.15, -0.76, 0.1]}>
          <boxGeometry args={[0.18, 0.1, 0.25]} />
          <meshStandardMaterial color="#cc4400" />
        </mesh>
        <mesh position={[-0.15, -0.76, 0.1]}>
          <boxGeometry args={[0.18, 0.1, 0.25]} />
          <meshStandardMaterial color="#cc4400" />
        </mesh>
      </group>
    </group>
  );
}
