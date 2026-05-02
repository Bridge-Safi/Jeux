import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Obstacle } from "../useGameState";

const LANE_X = [-2, 0, 2];

/* ─────────────────────────────────────────────────────────────
   TAJINE — plat marocain : base ronde + couvercle conique
   Terre cuite orange/rouge avec décor zellige
   ───────────────────────────────────────────────────────────── */
function Tajine({ x, z }: { x: number; z: number }) {
  const lidRef = useRef<THREE.Mesh>(null);
  const steamRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = Date.now() * 0.003;
    if (lidRef.current) {
      lidRef.current.position.y = 0.95 + Math.sin(t) * 0.02;
    }
    if (steamRef.current) {
      const mat = steamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.sin(t * 1.5) * 0.2;
      steamRef.current.position.y = 1.7 + Math.sin(t * 0.7) * 0.1;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Plateau de service en bois */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.12, 16]} />
        <meshBasicMaterial color="#5d3a1f" toneMapped={false} />
      </mesh>

      {/* Base ronde du tajine — terre cuite */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.85, 0.95, 0.4, 20]} />
        <meshBasicMaterial color="#c0392b" toneMapped={false} />
      </mesh>

      {/* Bord de la base (rim) */}
      <mesh position={[0, 0.58, 0]}>
        <torusGeometry args={[0.85, 0.06, 8, 20]} />
        <meshBasicMaterial color="#922b21" toneMapped={false} />
      </mesh>

      {/* Bandeau zellige peint (motif jaune) */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.951, 0.951, 0.1, 20]} />
        <meshBasicMaterial color="#f1c40f" toneMapped={false} />
      </mesh>

      {/* Couvercle conique (signature du tajine) */}
      <mesh ref={lidRef} position={[0, 0.95, 0]}>
        <coneGeometry args={[0.85, 0.95, 18]} />
        <meshBasicMaterial color="#e67e22" toneMapped={false} />
      </mesh>

      {/* Anneau de poignée au sommet */}
      <mesh position={[0, 1.5, 0]}>
        <torusGeometry args={[0.08, 0.025, 6, 12]} />
        <meshBasicMaterial color="#5d3a1f" toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.46, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
        <meshBasicMaterial color="#5d3a1f" toneMapped={false} />
      </mesh>

      {/* Vapeur qui s'échappe */}
      <mesh ref={steamRef} position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.45} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[0.1, 1.85, 0]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Halo doré sous le plateau (lueur appétissante) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial color="#f39c12" transparent opacity={0.18} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   COUSCOUS — grand plat creux jaune avec montagne de semoule
   Légumes colorés + viande au sommet
   ───────────────────────────────────────────────────────────── */
function Couscous({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const t = Date.now() * 0.002;
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(t) * 0.1;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Plateau de service rond */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.12, 18]} />
        <meshBasicMaterial color="#3a2410" toneMapped={false} />
      </mesh>

      {/* Grand plat creux bleu de Fès */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[1.0, 0.7, 0.3, 20]} />
        <meshBasicMaterial color="#1565c0" toneMapped={false} />
      </mesh>
      {/* Bord blanc avec motif */}
      <mesh position={[0, 0.42, 0]}>
        <torusGeometry args={[1.0, 0.05, 8, 20]} />
        <meshBasicMaterial color="#ecf0f1" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <torusGeometry args={[0.97, 0.025, 8, 20]} />
        <meshBasicMaterial color="#1565c0" toneMapped={false} />
      </mesh>

      {/* Montagne de semoule jaune (cône arrondi) */}
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[0.85, 0.7, 16]} />
        <meshBasicMaterial color="#f9e79f" toneMapped={false} />
      </mesh>
      {/* Texture grain (petites bosses) */}
      <mesh position={[0.25, 0.55, 0.25]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#f7dc6f" toneMapped={false} />
      </mesh>
      <mesh position={[-0.25, 0.55, -0.2]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshBasicMaterial color="#f7dc6f" toneMapped={false} />
      </mesh>
      <mesh position={[-0.2, 0.55, 0.3]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#f7dc6f" toneMapped={false} />
      </mesh>

      {/* Légumes au sommet */}
      {/* Carotte orange */}
      <mesh position={[0.18, 1.05, 0]} rotation={[Math.PI / 6, 0, Math.PI / 8]}>
        <coneGeometry args={[0.1, 0.35, 8]} />
        <meshBasicMaterial color="#e67e22" toneMapped={false} />
      </mesh>
      {/* Courgette verte */}
      <mesh position={[-0.18, 1.05, 0.05]} rotation={[Math.PI / 5, 0, -Math.PI / 8]}>
        <cylinderGeometry args={[0.09, 0.09, 0.35, 10]} />
        <meshBasicMaterial color="#27ae60" toneMapped={false} />
      </mesh>
      {/* Tomate / piment rouge */}
      <mesh position={[0, 1.15, 0.18]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshBasicMaterial color="#c0392b" toneMapped={false} />
      </mesh>
      {/* Pois chiches dorés */}
      <mesh position={[0.05, 1.18, -0.1]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#d4ac6e" toneMapped={false} />
      </mesh>
      <mesh position={[-0.08, 1.2, -0.05]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#d4ac6e" toneMapped={false} />
      </mesh>
      {/* Persil vert */}
      <mesh position={[0.1, 1.3, 0.05]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#229954" toneMapped={false} />
      </mesh>

      {/* Halo doré */}
      <mesh ref={ref} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 2.6]} />
        <meshBasicMaterial color="#f1c40f" transparent opacity={0.3} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   BARBECUE DE SARDINES — grill métallique avec braises rouges
   Brochettes de sardines argentées + flammes + fumée
   ───────────────────────────────────────────────────────────── */
function BarbecueSardines({ x, z }: { x: number; z: number }) {
  const flameRef = useRef<THREE.Mesh>(null);
  const flame2Ref = useRef<THREE.Mesh>(null);
  const emberRef = useRef<THREE.Mesh>(null);
  const smokeRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = Date.now() * 0.008;
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(t) * 0.3;
      const mat = flameRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.75 + Math.sin(t * 1.3) * 0.2;
    }
    if (flame2Ref.current) {
      flame2Ref.current.scale.y = 1 + Math.sin(t + 1.5) * 0.4;
    }
    if (emberRef.current) {
      const mat = emberRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.7 + Math.sin(t * 2) * 0.25;
    }
    if (smokeRef.current) {
      const mat = smokeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(t * 0.5) * 0.1;
      smokeRef.current.position.y = 1.6 + ((t * 0.3) % 1) * 0.5;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* 4 pieds métalliques */}
      <mesh position={[-0.55, 0.3, -0.35]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
        <meshBasicMaterial color="#1a1a1a" toneMapped={false} />
      </mesh>
      <mesh position={[0.55, 0.3, -0.35]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
        <meshBasicMaterial color="#1a1a1a" toneMapped={false} />
      </mesh>
      <mesh position={[-0.55, 0.3, 0.35]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
        <meshBasicMaterial color="#1a1a1a" toneMapped={false} />
      </mesh>
      <mesh position={[0.55, 0.3, 0.35]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
        <meshBasicMaterial color="#1a1a1a" toneMapped={false} />
      </mesh>

      {/* Cuve du barbecue (rectangle creux) */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.4, 0.15, 0.85]} />
        <meshBasicMaterial color="#2c1810" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.45, 0.05, 0.9]} />
        <meshBasicMaterial color="#1a1a1a" toneMapped={false} />
      </mesh>

      {/* Lit de braises rougeoyantes */}
      <mesh ref={emberRef} position={[0, 0.74, 0]}>
        <boxGeometry args={[1.3, 0.04, 0.75]} />
        <meshBasicMaterial color="#ff4500" transparent opacity={0.85} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* Charbons noirs visibles */}
      <mesh position={[-0.4, 0.78, 0.1]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshBasicMaterial color="#2c1810" toneMapped={false} />
      </mesh>
      <mesh position={[0.3, 0.78, -0.15]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshBasicMaterial color="#1a0a05" toneMapped={false} />
      </mesh>
      <mesh position={[0.05, 0.78, 0.2]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#2c1810" toneMapped={false} />
      </mesh>

      {/* Grille métallique au-dessus */}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((zi) => (
        <mesh key={`bar-${zi}`} position={[0, 0.85, zi]}>
          <boxGeometry args={[1.35, 0.025, 0.025]} />
          <meshBasicMaterial color="#444" toneMapped={false} />
        </mesh>
      ))}

      {/* Brochettes de SARDINES (3 brochettes argentées) */}
      {[-0.35, 0, 0.35].map((zi, i) => (
        <group key={`skewer-${i}`} position={[0, 0.92, zi]}>
          {/* Brochette en bois */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, 1.3, 6]} />
            <meshBasicMaterial color="#a0826d" toneMapped={false} />
          </mesh>
          {/* 3 sardines par brochette (corps fuselé argenté) */}
          {[-0.4, 0, 0.4].map((xi, j) => (
            <group key={`sardine-${j}`} position={[xi, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.07, 0.28, 4, 8]} />
                <meshBasicMaterial color="#c0d6e0" toneMapped={false} />
              </mesh>
              {/* Reflet bleuté sur le dos */}
              <mesh position={[0, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.045, 0.25, 4, 8]} />
                <meshBasicMaterial color="#5499c7" toneMapped={false} />
              </mesh>
              {/* Petit œil noir */}
              <mesh position={[xi > 0 ? 0.18 : -0.18, 0.04, 0.04]}>
                <sphereGeometry args={[0.015, 6, 6]} />
                <meshBasicMaterial color="#000" toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Flammes orange qui dansent */}
      <mesh ref={flameRef} position={[-0.3, 1.0, 0]}>
        <coneGeometry args={[0.18, 0.45, 8]} />
        <meshBasicMaterial color="#ff6b00" transparent opacity={0.8} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={flame2Ref} position={[0.3, 1.0, 0]}>
        <coneGeometry args={[0.16, 0.4, 8]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.75} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* Flamme jaune centrale */}
      <mesh position={[0, 1.05, 0.1]}>
        <coneGeometry args={[0.13, 0.5, 8]} />
        <meshBasicMaterial color="#ffeb3b" transparent opacity={0.6} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Fumée qui monte */}
      <mesh ref={smokeRef} position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial color="#999" transparent opacity={0.3} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[0.15, 1.85, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#888" transparent opacity={0.2} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* Halo orange au sol (signature feu) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 2.0]} />
        <meshBasicMaterial color="#ff4500" transparent opacity={0.25} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Obstacles({ obstacles }: { obstacles: Obstacle[] }) {
  return (
    <>
      {obstacles.map((o, idx) => {
        const x = LANE_X[o.lane + 1];
        const kind = idx % 3;
        if (kind === 0) return <Tajine key={o.id} x={x} z={o.z} />;
        if (kind === 1) return <Couscous key={o.id} x={x} z={o.z} />;
        return <BarbecueSardines key={o.id} x={x} z={o.z} />;
      })}
    </>
  );
}
