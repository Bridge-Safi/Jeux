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
      groupRef.current.position.x, targetX, Math.min(1, delta * 14)
    );
    groupRef.current.position.y = playerY;

    if (spriteRef.current && !isJumping) {
      const t = Date.now() * 0.005;
      spriteRef.current.position.y = 1.55 + Math.sin(t * 2) * 0.05;
      spriteRef.current.rotation.z = Math.sin(t) * 0.04;
    } else if (spriteRef.current) {
      spriteRef.current.rotation.z = 0;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.05;
    }
  });

  const planeGeo = useMemo(() => new THREE.PlaneGeometry(2.0, 2.7), []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Le Shark Warrior — pas d'aura devant pour ne pas bloquer la vue */}
      <mesh ref={spriteRef} position={[0, 1.4, 0]} geometry={planeGeo}>
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.1}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Anneau orbital cyan AU SOL (sous le joueur) */}
      <mesh ref={ringRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 0.85, 6, 1]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.85} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Halo sol unique (pas empilé) */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 16]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.25} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Ombre nette sous le joueur */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}
