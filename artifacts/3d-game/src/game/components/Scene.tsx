import { useMemo } from "react";
import * as THREE from "three";

function Stars() {
  const positions = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 600; i++) {
      const r = 120 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      pts.push(r * Math.sin(phi) * Math.cos(theta), 30 + r * Math.cos(phi), -60 + r * Math.sin(phi) * Math.sin(theta));
    }
    return new Float32Array(pts);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.35} color="#ffffff" sizeAttenuation transparent opacity={0.9} />
    </points>
  );
}

function Moon() {
  return (
    <group position={[25, 38, -90]}>
      <mesh>
        <sphereGeometry args={[4.2, 16, 16]} />
        <meshStandardMaterial color="#fff9e0" emissive="#fff5cc" emissiveIntensity={0.8} roughness={0.9} />
      </mesh>
      <pointLight color="#fff5cc" intensity={3} distance={500} />
    </group>
  );
}

function DistantBuilding({ x, z, w, h, dome, lit }: { x: number; z: number; w: number; h: number; dome: boolean; lit: boolean }) {
  const wallColor = lit ? "#c9993a" : "#3d2e15";
  const domeColor = "#0d2a5c";

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, w * 0.8]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} emissive={lit ? "#8B6914" : "#000"} emissiveIntensity={lit ? 0.25 : 0} />
      </mesh>
      {Array.from({ length: 4 }, (_, ci) => (
        <mesh key={ci} position={[-w / 2 + ci * (w / 3) + 0.3, h + 0.15, 0]}>
          <boxGeometry args={[0.28, 0.28, w * 0.82]} />
          <meshStandardMaterial color={lit ? "#b8860b" : "#2a1e08"} roughness={0.8} />
        </mesh>
      ))}
      {dome && (
        <group position={[0, h, 0]}>
          <mesh>
            <sphereGeometry args={[w * 0.3, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
            <meshStandardMaterial color={domeColor} roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[w * 0.28, w * 0.28, 0.22, 10]} />
            <meshStandardMaterial color="#8B6914" roughness={0.5} />
          </mesh>
        </group>
      )}
      {/* Fenêtres éclairées */}
      {lit && Array.from({ length: Math.floor(w / 1.5) }, (_, i) => (
        <mesh key={i} position={[-w / 2 + 0.6 + i * 1.2, h * 0.55, w * 0.41]}>
          <boxGeometry args={[0.3, 0.4, 0.05]} />
          <meshStandardMaterial color="#ffe082" emissive="#ff9800" emissiveIntensity={1.2} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function DistantMinaret({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 5.5, 0]}>
        <boxGeometry args={[1.6, 11, 1.6]} />
        <meshStandardMaterial color="#3d2e15" roughness={0.85} emissive="#5c3d0f" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 11.5, 0]}>
        <boxGeometry args={[1.3, 2, 1.3]} />
        <meshStandardMaterial color="#4a3518" roughness={0.8} />
      </mesh>
      {/* Dôme bleu nuit */}
      <group position={[0, 12.8, 0]}>
        <mesh>
          <sphereGeometry args={[0.7, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color="#0d2a5c" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.2, 10]} />
          <meshStandardMaterial color="#8B6914" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} emissive="#ffa000" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {/* Crenellations */}
      {[[-0.45, -0.45], [-0.45, 0.45], [0.45, -0.45], [0.45, 0.45]].map(([bx, bz], i) => (
        <mesh key={i} position={[bx as number, 12.2, bz as number]}>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          <meshStandardMaterial color="#4a3518" roughness={0.8} />
        </mesh>
      ))}
      {/* Bande zellige éclairée */}
      <mesh position={[0, 10.2, 0]}>
        <boxGeometry args={[1.35, 0.35, 1.35]} />
        <meshStandardMaterial color="#0d47a1" roughness={0.5} emissive="#1565c0" emissiveIntensity={0.3} />
      </mesh>
      {/* Lumière lanterne au sommet */}
      <pointLight position={[x, 14, z]} color="#ffa000" intensity={1.2} distance={20} />
    </group>
  );
}

export function Scene() {
  return (
    <>
      {/* Ciel nocturne dégradé */}
      <mesh position={[0, 20, -100]}>
        <planeGeometry args={[400, 120]} />
        <meshStandardMaterial color="#060d1f" side={THREE.FrontSide} roughness={1} />
      </mesh>
      <mesh position={[0, 5, -100]}>
        <planeGeometry args={[400, 25]} />
        <meshStandardMaterial color="#0a1628" side={THREE.FrontSide} roughness={1} />
      </mesh>
      {/* Horizon chaud (reflet lanternes) */}
      <mesh position={[0, 1, -100]}>
        <planeGeometry args={[400, 8]} />
        <meshStandardMaterial color="#1a0a00" side={THREE.FrontSide} roughness={1} />
      </mesh>

      {/* Sol au-delà de la route */}
      <mesh position={[0, -0.05, -50]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 200]} />
        <meshStandardMaterial color="#1a1208" roughness={1} />
      </mesh>

      <Stars />
      <Moon />

      {/* Minarets lointains */}
      <DistantMinaret x={-18} z={-55} />
      <DistantMinaret x={22} z={-65} />
      <DistantMinaret x={-30} z={-75} />
      <DistantMinaret x={35} z={-50} />

      {/* Bâtiments lointains */}
      <DistantBuilding x={-22} z={-70} w={5} h={7} dome lit />
      <DistantBuilding x={-14} z={-80} w={4} h={5.5} dome={false} lit={false} />
      <DistantBuilding x={-28} z={-65} w={6} h={6} dome={false} lit />
      <DistantBuilding x={18} z={-75} w={5} h={8} dome lit />
      <DistantBuilding x={25} z={-68} w={4} h={5} dome={false} lit />
      <DistantBuilding x={12} z={-85} w={3.5} h={6.5} dome lit />
      <DistantBuilding x={-6} z={-90} w={6} h={5} dome={false} lit />
      <DistantBuilding x={5} z={-78} w={3} h={7} dome={false} lit={false} />
      <DistantBuilding x={-18} z={-95} w={5} h={4.5} dome lit />
      <DistantBuilding x={30} z={-85} w={4} h={6} dome={false} lit />
    </>
  );
}
