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

  /* Charge l'image Shark Warrior — exactement le personnage de référence */
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

    /* Mini balancement pendant la course */
    if (spriteRef.current && !isJumping) {
      const t = Date.now() * 0.005;
      spriteRef.current.position.y = 1.55 + Math.sin(t * 2) * 0.05;
      spriteRef.current.rotation.z = Math.sin(t) * 0.04;
    } else if (spriteRef.current) {
      spriteRef.current.rotation.z = 0;
    }
  });

  /* Géométrie billboard — toujours face caméra */
  const planeGeo = useMemo(() => new THREE.PlaneGeometry(2.2, 3.0), []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
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

      {/* Halo doré au sol sous lui */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.85, 24]} />
        <meshBasicMaterial color="#ffd54f" transparent opacity={0.5} />
      </mesh>

      {/* Ombre douce */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
