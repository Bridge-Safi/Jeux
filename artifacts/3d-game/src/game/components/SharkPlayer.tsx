import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const LANE_X = [-2, 0, 2];

interface SharkPlayerProps {
  lane: number;
  playerY: number;
  isJumping: boolean;
}

export function SharkPlayer({ lane, playerY, isJumping }: SharkPlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spriteRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const texture = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}shark-warrior.png`);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  // @ts-ignore
  texture.colorSpace = THREE.SRGBColorSpace ?? texture.colorSpace;

  const targetX = LANE_X[lane + 1];

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x, targetX, Math.min(1, delta * 12)
    );
    groupRef.current.position.y = playerY;

    if (spriteRef.current && !isJumping) {
      const t = Date.now() * 0.005;
      spriteRef.current.position.y = 1.55 + Math.sin(t * 2) * 0.05;
      spriteRef.current.rotation.z = Math.sin(t) * 0.04;
    } else if (spriteRef.current) {
      spriteRef.current.rotation.z = 0;
    }

    /* Aura cyan pulsante */
    if (auraRef.current) {
      const t = Date.now() * 0.004;
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(t * 2) * 0.1;
      auraRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
    }

    /* Anneau orbital sous le joueur */
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.05;
    }
  });

  const planeGeo = useMemo(() => new THREE.PlaneGeometry(2.2, 3.0), []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Aura cyan/magenta autour du shark */}
      <mesh ref={auraRef} position={[0, 1.55, -0.05]}>
        <planeGeometry args={[3.2, 4.0]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.55, -0.1]}>
        <planeGeometry args={[4.5, 5.5]} />
        <meshBasicMaterial color="#ff1493" transparent opacity={0.12} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Le Shark Warrior — image du personnage référence */}
      <mesh ref={spriteRef} position={[0, 1.55, 0]} geometry={planeGeo}>
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.1}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Anneau orbital cyan brillant au sol (sous le joueur) */}
      <mesh ref={ringRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.95, 6, 1]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.85} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Disque réflexion néon au sol */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 24]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* Halo magenta plus large */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 24]} />
        <meshBasicMaterial color="#ff1493" transparent opacity={0.2} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Speed lines / streaks derrière le shark (effet motion blur) */}
      <mesh position={[0, 1.0, 0.8]}>
        <planeGeometry args={[1.8, 0.06]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.5} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.6, 0.9]}>
        <planeGeometry args={[2.0, 0.05]} />
        <meshBasicMaterial color="#ff1493" transparent opacity={0.4} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.2, 0.8]}>
        <planeGeometry args={[1.5, 0.05]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Ombre douce sombre */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
