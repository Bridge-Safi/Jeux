import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function StarryNight() {
  const count = 200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = 8 + Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 30;
  }
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="white" size={0.08} sizeAttenuation />
    </points>
  );
}

function Moon() {
  return (
    <group position={[12, 18, -40]}>
      <mesh>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshStandardMaterial color="#fffde7" emissive="#fff9c4" emissiveIntensity={0.3} roughness={0.9} />
      </mesh>
    </group>
  );
}

function SafiMinaret({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Base tower */}
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[2.2, 8, 2.2]} />
        <meshStandardMaterial color="#d4a96a" roughness={0.85} />
      </mesh>
      {/* Upper tower */}
      <mesh position={[0, 9.5, 0]} castShadow>
        <boxGeometry args={[1.8, 3, 1.8]} />
        <meshStandardMaterial color="#c9915e" roughness={0.8} />
      </mesh>
      {/* Battlements */}
      {[[-0.6, 0.6], [-0.6, -0.6], [0.6, 0.6], [0.6, -0.6]].map(([bx, bz], i) => (
        <mesh key={i} position={[bx, 11.6, bz]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.5]} />
          <meshStandardMaterial color="#bf8050" roughness={0.9} />
        </mesh>
      ))}
      {/* Crescent on top */}
      <mesh position={[0, 12.4, 0]}>
        <torusGeometry args={[0.45, 0.07, 8, 20, Math.PI * 1.5]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Green tile band */}
      <mesh position={[0, 8.2, 0]}>
        <boxGeometry args={[1.85, 0.4, 1.85]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.6} />
      </mesh>
      {/* Zellige arches */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
        <mesh key={i} position={[Math.sin(rot) * 1.1, 2.5, Math.cos(rot) * 1.1]} rotation={[0, -rot, 0]}>
          <torusGeometry args={[0.55, 0.09, 6, 14, Math.PI]} />
          <meshStandardMaterial color="#1a6bb0" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Palm({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 5, 7]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.95} />
      </mesh>
      {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * 0.8,
            5 + (i % 2) * 0.2,
            Math.sin(angle) * 0.8,
          ]}
          rotation={[0.5, angle, 0]}
        >
          <coneGeometry args={[0.3, 1.2, 5]} />
          <meshStandardMaterial color="#388e3c" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function Scene() {
  return (
    <>
      <StarryNight />
      <Moon />

      {/* Distant minarets */}
      <SafiMinaret x={-14} z={-35} />
      <SafiMinaret x={16} z={-55} />
      <SafiMinaret x={-20} z={-70} />

      {/* Palm trees along sides */}
      <Palm x={-8} z={-15} />
      <Palm x={9} z={-25} />
      <Palm x={-9} z={-42} />
      <Palm x={8} z={-55} />

      {/* Distant Safi cityscape boxes */}
      {[
        [-18, -80, 6, "#c9915e"],
        [20, -90, 9, "#d4a96a"],
        [-24, -110, 5, "#bf8050"],
        [22, -75, 7, "#c8955a"],
        [-16, -100, 8, "#d9b480"],
        [25, -120, 4, "#c9915e"],
      ].map(([x, z, h, color], i) => (
        <mesh key={i} position={[x as number, (h as number) / 2, z as number]}>
          <boxGeometry args={[5, h as number, 4]} />
          <meshStandardMaterial color={color as string} roughness={0.85} />
        </mesh>
      ))}

      {/* Ocean atmosphere - background */}
      <mesh position={[0, 5, -130]} rotation={[0, 0, 0]}>
        <planeGeometry args={[200, 40]} />
        <meshStandardMaterial color="#1a237e" roughness={1} side={THREE.FrontSide} />
      </mesh>

      {/* Sky backdrop */}
      <mesh position={[0, 20, -120]}>
        <planeGeometry args={[300, 80]} />
        <meshStandardMaterial color="#0a0a2e" side={THREE.BackSide} />
      </mesh>
    </>
  );
}
