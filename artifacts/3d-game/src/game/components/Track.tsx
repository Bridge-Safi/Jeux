import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TRACK_LENGTH = 100;
const TRACK_SEGMENTS = 4;
const SEG_LENGTH = TRACK_LENGTH / TRACK_SEGMENTS;

interface TrackProps {
  speed: number;
}

/* ─────────────────────────────────────────────────────────────
   ASPHALTE HUMIDE — sol propre style NFS Heat
   ───────────────────────────────────────────────────────────── */
function WetAsphalt() {
  return (
    <>
      {/* Asphalte noir profond — la voie principale */}
      <mesh position={[0, -0.05, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 220]} />
        <meshBasicMaterial color="#0a0a14" toneMapped={false} />
      </mesh>

      {/* Sol latéral très sombre */}
      <mesh position={[0, -0.06, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 220]} />
        <meshBasicMaterial color="#040408" toneMapped={false} />
      </mesh>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   LIGNES DE VOIE — fines et lumineuses, façon F1 night race
   ───────────────────────────────────────────────────────────── */
function LaneLines({ zOffset }: { zOffset: number }) {
  return (
    <group>
      {/* 2 lignes cyan FINES entre les voies */}
      {[-1, 1].map((side, i) => (
        <group key={i}>
          {/* Ligne solide brillante */}
          <mesh position={[side, 0.005, zOffset + SEG_LENGTH / 2]}>
            <boxGeometry args={[0.08, 0.02, SEG_LENGTH]} />
            <meshBasicMaterial color="#00f0ff" toneMapped={false} />
          </mesh>
          {/* Halo subtil (1 seule couche fine) */}
          <mesh position={[side, 0.004, zOffset + SEG_LENGTH / 2]}>
            <planeGeometry args={[0.3, SEG_LENGTH]} />
            <meshBasicMaterial color="#00bcd4" transparent opacity={0.35} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Bordures externes magenta (à 3.5 = bord de chaussée) */}
      {[-3.5, 3.5].map((side, i) => (
        <group key={i}>
          <mesh position={[side, 0.005, zOffset + SEG_LENGTH / 2]}>
            <boxGeometry args={[0.1, 0.02, SEG_LENGTH]} />
            <meshBasicMaterial color="#ff1493" toneMapped={false} />
          </mesh>
          <mesh position={[side, 0.004, zOffset + SEG_LENGTH / 2]}>
            <planeGeometry args={[0.4, SEG_LENGTH]} />
            <meshBasicMaterial color="#ff1493" transparent opacity={0.35} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   POINTILLÉS BLANCS centraux — repère de vitesse subtil
   ───────────────────────────────────────────────────────────── */
function CenterDashes({ zOffset }: { zOffset: number }) {
  const dashCount = Math.floor(SEG_LENGTH / 6);
  return (
    <>
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={i} position={[0, 0.008, zOffset + i * 6 + 1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.18, 1.2]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   LAMPADAIRE SCI-FI — minimaliste, pas envahissant
   ───────────────────────────────────────────────────────────── */
function SciFiLamp({ x, z, color }: { x: number; z: number; color: string }) {
  const inward = x > 0 ? -0.6 : 0.6;
  return (
    <group position={[x, 0, z]}>
      {/* Mât */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 5, 6]} />
        <meshBasicMaterial color="#1a1a28" toneMapped={false} />
      </mesh>
      {/* Tête lumineuse */}
      <mesh position={[inward, 4.8, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Halo discret de la sphère (1 seule couche) */}
      <mesh position={[inward, 4.8, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* Reflet humide au sol — petit */}
      <mesh position={[inward, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   BÂTIMENTS LATÉRAUX — éloignés pour ne pas bloquer la vue
   ───────────────────────────────────────────────────────────── */
function SciFiBuilding({ side, z, h, accentCol }: {
  side: -1 | 1; z: number; h: number; accentCol: string;
}) {
  const x = side * 12; // ÉLOIGNÉ (était 9.5)
  return (
    <group position={[x, 0, z]}>
      {/* Corps principal sombre */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[3.5, h, 3.5]} />
        <meshBasicMaterial color="#0a0814" toneMapped={false} />
      </mesh>
      {/* Bandes verticales néon (3 fines) */}
      {[-1.2, 0, 1.2].map((bx, i) => (
        <mesh key={i} position={[bx, h / 2, side > 0 ? -1.8 : 1.8]}>
          <boxGeometry args={[0.06, h * 0.85, 0.02]} />
          <meshBasicMaterial color={accentCol} toneMapped={false} />
        </mesh>
      ))}
      {/* Balise rouge sommet */}
      <mesh position={[0, h + 0.4, 0]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshBasicMaterial color="#ff1744" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   ARCHE NÉON — DISCRÈTE, juste un cadre fin sans paroi
   ───────────────────────────────────────────────────────────── */
function NeonArch({ z, color }: { z: number; color: string }) {
  return (
    <group position={[0, 0, z]}>
      {/* Pied gauche fin */}
      <mesh position={[-4.2, 3.5, 0]}>
        <boxGeometry args={[0.25, 7, 0.25]} />
        <meshBasicMaterial color="#0a0a18" toneMapped={false} />
      </mesh>
      {/* Pied droit fin */}
      <mesh position={[4.2, 3.5, 0]}>
        <boxGeometry args={[0.25, 7, 0.25]} />
        <meshBasicMaterial color="#0a0a18" toneMapped={false} />
      </mesh>
      {/* Traverse haute fine */}
      <mesh position={[0, 7.1, 0]}>
        <boxGeometry args={[8.7, 0.3, 0.3]} />
        <meshBasicMaterial color="#0a0a18" toneMapped={false} />
      </mesh>
      {/* Bande néon horizontale en haut */}
      <mesh position={[0, 7.1, 0.16]}>
        <boxGeometry args={[8.5, 0.12, 0.04]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Bandes néon verticales (uniquement face avant) */}
      <mesh position={[-4.2, 3.5, 0.13]}>
        <boxGeometry args={[0.12, 7, 0.04]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[4.2, 3.5, 0.13]}>
        <boxGeometry args={[0.12, 7, 0.04]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROPS PAR SEGMENT — nettoyage drastique
   ───────────────────────────────────────────────────────────── */
function StreetProps({ zOffset, segIdx }: { zOffset: number; segIdx: number }) {
  const lampColor = segIdx % 2 === 0 ? "#ff1493" : "#00f0ff";
  const archColor = segIdx % 3 === 0 ? "#39ff14" : segIdx % 3 === 1 ? "#00f0ff" : "#ff1493";

  return (
    <>
      <LaneLines zOffset={zOffset} />
      <CenterDashes zOffset={zOffset} />

      {/* Lampadaires : 2 par segment seulement, alternés */}
      <SciFiLamp x={-4.2} z={zOffset + 8}  color={lampColor} />
      <SciFiLamp x={ 4.2} z={zOffset + 18} color={segIdx % 2 === 0 ? "#00f0ff" : "#ff1493"} />

      {/* Arche tous les 4 segments seulement */}
      {segIdx % 4 === 0 && <NeonArch z={zOffset + 14} color={archColor} />}

      {/* 2 bâtiments par segment, éloignés */}
      <SciFiBuilding side={-1} z={zOffset + 6}  h={9 + (segIdx % 3) * 3}  accentCol={lampColor} />
      <SciFiBuilding side={ 1} z={zOffset + 18} h={11 + (segIdx % 2) * 4} accentCol={segIdx % 2 === 0 ? "#00f0ff" : "#ff1493"} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   TRACK PRINCIPAL — défilement infini
   ───────────────────────────────────────────────────────────── */
export function Track({ speed }: TrackProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.z += speed * delta;
    if (groupRef.current.position.z >= SEG_LENGTH) {
      groupRef.current.position.z -= SEG_LENGTH;
    }
  });

  const segmentOffsets = useMemo(() => {
    const offs: number[] = [];
    for (let i = 0; i < TRACK_SEGMENTS; i++) {
      offs.push(-TRACK_LENGTH + i * SEG_LENGTH);
    }
    return offs;
  }, []);

  return (
    <>
      <WetAsphalt />
      <group ref={groupRef}>
        {segmentOffsets.map((offset, idx) => (
          <group key={offset}>
            <StreetProps zOffset={offset} segIdx={idx} />
          </group>
        ))}
      </group>
    </>
  );
}
