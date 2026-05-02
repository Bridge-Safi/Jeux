import { useMemo } from "react";
import * as THREE from "three";

/* Étoiles — points basiques toujours visibles */
function Stars() {
  const positions = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 500; i++) {
      const r = 100 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      pts.push(
        r * Math.sin(phi) * Math.cos(theta),
        20 + r * Math.cos(phi),
        -60 + r * Math.sin(phi) * Math.sin(theta)
      );
    }
    return new Float32Array(pts);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.4} color="#ffffff" sizeAttenuation transparent opacity={0.95} />
    </points>
  );
}

/* Lune — disque blanc lumineux */
function Moon() {
  return (
    <group position={[25, 38, -90]}>
      <mesh>
        <sphereGeometry args={[4.2, 12, 12]} />
        <meshBasicMaterial color="#fff9e0" />
      </mesh>
      {/* Halo lune */}
      <mesh>
        <sphereGeometry args={[5.5, 10, 10]} />
        <meshBasicMaterial color="#fffde7" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

/* Minaret lointain */
function DistantMinaret({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 5.5, 0]}>
        <boxGeometry args={[1.6, 11, 1.6]} />
        <meshBasicMaterial color="#3d2e15" />
      </mesh>
      <mesh position={[0, 11.5, 0]}>
        <boxGeometry args={[1.3, 2, 1.3]} />
        <meshBasicMaterial color="#4a3518" />
      </mesh>
      {/* Dôme bleu */}
      <mesh position={[0, 12.8, 0]}>
        <sphereGeometry args={[0.7, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshBasicMaterial color="#0d3a7c" />
      </mesh>
      {/* Bande zellige éclairée */}
      <mesh position={[0, 10.2, 0]}>
        <boxGeometry args={[1.35, 0.35, 1.35]} />
        <meshBasicMaterial color="#1565c0" />
      </mesh>
      {/* Croissant doré */}
      <mesh position={[0, 13.5, 0]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshBasicMaterial color="#ffd54f" />
      </mesh>
    </group>
  );
}

/* Bâtiment lointain */
function DistantBuilding({ x, z, w, h, dome, lit }: {
  x: number; z: number; w: number; h: number; dome: boolean; lit: boolean;
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, w * 0.8]} />
        <meshBasicMaterial color={lit ? "#5a3f15" : "#2a1e08"} />
      </mesh>
      {/* Fenêtres jaunes */}
      {lit && Array.from({ length: Math.floor(w / 1.5) }, (_, i) => (
        <mesh key={i} position={[-w / 2 + 0.6 + i * 1.2, h * 0.55, w * 0.41]}>
          <boxGeometry args={[0.3, 0.4, 0.05]} />
          <meshBasicMaterial color="#ffca28" />
        </mesh>
      ))}
      {dome && (
        <mesh position={[0, h, 0]}>
          <sphereGeometry args={[w * 0.3, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshBasicMaterial color="#0d3a7c" />
        </mesh>
      )}
    </group>
  );
}

export function Scene() {
  return (
    <>
      {/* Ciel nocturne — fond bleu nuit */}
      <mesh position={[0, 20, -100]}>
        <planeGeometry args={[400, 120]} />
        <meshBasicMaterial color="#060d1f" side={THREE.FrontSide} />
      </mesh>
      <mesh position={[0, 5, -100]}>
        <planeGeometry args={[400, 25]} />
        <meshBasicMaterial color="#0a1628" side={THREE.FrontSide} />
      </mesh>
      {/* Horizon chaud */}
      <mesh position={[0, 1, -100]}>
        <planeGeometry args={[400, 8]} />
        <meshBasicMaterial color="#1a0a00" side={THREE.FrontSide} />
      </mesh>

      {/* Sol au-delà de la route */}
      <mesh position={[0, -0.05, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 200]} />
        <meshBasicMaterial color="#1a1208" />
      </mesh>

      <Stars />
      <Moon />

      {/* Minarets lointains */}
      <DistantMinaret x={-18} z={-55} />
      <DistantMinaret x={22}  z={-65} />
      <DistantMinaret x={-30} z={-75} />
      <DistantMinaret x={35}  z={-50} />

      {/* Bâtiments lointains */}
      <DistantBuilding x={-22} z={-70} w={5} h={7}   dome lit />
      <DistantBuilding x={-14} z={-80} w={4} h={5.5} dome={false} lit={false} />
      <DistantBuilding x={-28} z={-65} w={6} h={6}   dome={false} lit />
      <DistantBuilding x={18}  z={-75} w={5} h={8}   dome lit />
      <DistantBuilding x={25}  z={-68} w={4} h={5}   dome={false} lit />
      <DistantBuilding x={12}  z={-85} w={3.5} h={6.5} dome lit />
      <DistantBuilding x={-6}  z={-90} w={6} h={5}   dome={false} lit />
      <DistantBuilding x={5}   z={-78} w={3} h={7}   dome={false} lit={false} />
      <DistantBuilding x={-18} z={-95} w={5} h={4.5} dome lit />
      <DistantBuilding x={30}  z={-85} w={4} h={6}   dome={false} lit />
    </>
  );
}
