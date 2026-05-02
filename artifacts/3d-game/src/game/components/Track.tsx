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
   ASPHALTE HUMIDE — sol sombre avec reflets néon
   ───────────────────────────────────────────────────────────── */
function WetAsphalt() {
  return (
    <>
      {/* Asphalte principal très sombre */}
      <mesh position={[0, -0.05, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 220]} />
        <meshBasicMaterial color="#080812" toneMapped={false} />
      </mesh>

      {/* Bandeau de reflet humide central — style mouillé après pluie */}
      <mesh position={[0, -0.045, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 220]} />
        <meshBasicMaterial color="#1a1a2e" transparent opacity={0.6} toneMapped={false} />
      </mesh>

      {/* Trottoirs latéraux gris foncé */}
      <mesh position={[-7.5, -0.04, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 220]} />
        <meshBasicMaterial color="#0a0a14" toneMapped={false} />
      </mesh>
      <mesh position={[7.5, -0.04, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 220]} />
        <meshBasicMaterial color="#0a0a14" toneMapped={false} />
      </mesh>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   NEON LANE STRIPS — bandes lumineuses entre les voies
   ───────────────────────────────────────────────────────────── */
function NeonStrips({ zOffset }: { zOffset: number }) {
  return (
    <group>
      {/* 2 lignes cyan brillantes entre les voies */}
      {[-1, 1].map((side, i) => (
        <group key={i}>
          <mesh position={[side, 0.005, zOffset + SEG_LENGTH / 2]}>
            <boxGeometry args={[0.18, 0.02, SEG_LENGTH]} />
            <meshBasicMaterial color="#00f0ff" toneMapped={false} />
          </mesh>
          {/* Halo glow autour */}
          <mesh position={[side, 0.003, zOffset + SEG_LENGTH / 2]}>
            <planeGeometry args={[0.7, SEG_LENGTH]} />
            <meshBasicMaterial color="#00bcd4" transparent opacity={0.45} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <mesh position={[side, 0.002, zOffset + SEG_LENGTH / 2]}>
            <planeGeometry args={[1.6, SEG_LENGTH]} />
            <meshBasicMaterial color="#00bcd4" transparent opacity={0.18} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Bordures externes magenta */}
      {[-3.5, 3.5].map((side, i) => (
        <group key={i}>
          <mesh position={[side, 0.005, zOffset + SEG_LENGTH / 2]}>
            <boxGeometry args={[0.22, 0.02, SEG_LENGTH]} />
            <meshBasicMaterial color="#ff1493" toneMapped={false} />
          </mesh>
          <mesh position={[side, 0.003, zOffset + SEG_LENGTH / 2]}>
            <planeGeometry args={[0.9, SEG_LENGTH]} />
            <meshBasicMaterial color="#e91e63" transparent opacity={0.5} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <mesh position={[side, 0.002, zOffset + SEG_LENGTH / 2]}>
            <planeGeometry args={[2.0, SEG_LENGTH]} />
            <meshBasicMaterial color="#ff1493" transparent opacity={0.15} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   LAMPADAIRE SCI-FI — pylône avec sphère lumineuse
   ───────────────────────────────────────────────────────────── */
function SciFiLamp({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 0, z]}>
      {/* Mât métallique noir */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 6, 6]} />
        <meshBasicMaterial color="#1a1a28" toneMapped={false} />
      </mesh>
      {/* Bras horizontal au sommet */}
      <mesh position={[x > 0 ? -0.5 : 0.5, 6, 0]}>
        <boxGeometry args={[1, 0.1, 0.1]} />
        <meshBasicMaterial color="#1a1a28" toneMapped={false} />
      </mesh>
      {/* Sphère lumineuse centrale */}
      <mesh position={[x > 0 ? -1 : 1, 5.7, 0]}>
        <sphereGeometry args={[0.25, 10, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Halo additif autour de la sphère */}
      <mesh position={[x > 0 ? -1 : 1, 5.7, 0]}>
        <sphereGeometry args={[0.55, 10, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[x > 0 ? -1 : 1, 5.7, 0]}>
        <sphereGeometry args={[1.0, 10, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* Cône de lumière vers le sol */}
      <mesh position={[x > 0 ? -1 : 1, 3, 0]}>
        <coneGeometry args={[1.8, 5.5, 8, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Reflet humide au sol */}
      <mesh position={[x > 0 ? -1 : 1, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANNEAU HOLO LATÉRAL — billboard publicitaire animé
   ───────────────────────────────────────────────────────────── */
function HoloBoard({ side, z, label, color }: { side: -1 | 1; z: number; label: string; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      const t = Date.now() * 0.002;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.45 + Math.sin(t + z) * 0.15;
    }
  });
  return (
    <group position={[side * 6, 4, z]} rotation={[0, side > 0 ? -0.4 : 0.4, 0]}>
      {/* Cadre métallique */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.2, 1.8, 0.1]} />
        <meshBasicMaterial color="#0a0a18" toneMapped={false} />
      </mesh>
      {/* Écran néon */}
      <mesh ref={ref}>
        <planeGeometry args={[3, 1.6]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Reflet glow */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[4.5, 2.5]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Texte décoratif blanc */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.4, 0.4]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Petits points décoratifs */}
      <mesh position={[-1.3, -0.6, 0.06]}>
        <circleGeometry args={[0.08, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.3, -0.6, 0.06]}>
        <circleGeometry args={[0.08, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   BARRIÈRE DE SÉCURITÉ NÉON — guard rail futuriste
   ───────────────────────────────────────────────────────────── */
function NeonRail({ side, zOffset }: { side: -1 | 1; zOffset: number }) {
  return (
    <group position={[side * 4.6, 0, zOffset]}>
      {/* Rail bas */}
      <mesh position={[0, 0.4, SEG_LENGTH / 2]}>
        <boxGeometry args={[0.15, 0.15, SEG_LENGTH]} />
        <meshBasicMaterial color="#00f0ff" toneMapped={false} />
      </mesh>
      {/* Rail haut */}
      <mesh position={[0, 1.2, SEG_LENGTH / 2]}>
        <boxGeometry args={[0.15, 0.15, SEG_LENGTH]} />
        <meshBasicMaterial color="#ff1493" toneMapped={false} />
      </mesh>
      {/* Halo glow vertical */}
      <mesh position={[0, 0.8, SEG_LENGTH / 2]}>
        <planeGeometry args={[0.6, SEG_LENGTH]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.15} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* Poteaux verticaux */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[0, 0.8, i * (SEG_LENGTH / 4) + 3]}>
          <boxGeometry args={[0.12, 1.4, 0.12]} />
          <meshBasicMaterial color="#1a1a28" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   CHEVRONS LUMINEUX ANIMÉS sur la chaussée centrale
   ───────────────────────────────────────────────────────────── */
function GlowingChevrons({ zOffset }: { zOffset: number }) {
  const dashCount = Math.floor(SEG_LENGTH / 5);
  return (
    <>
      {Array.from({ length: dashCount }, (_, i) => (
        <group key={i} position={[0, 0.01, zOffset + i * 5 + 1]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.6, 1.4]} />
            <meshBasicMaterial color="#ffeb3b" toneMapped={false} />
          </mesh>
          {/* Glow halo additif */}
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.4, 2.2]} />
            <meshBasicMaterial color="#ffeb3b" transparent opacity={0.35} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   BÂTIMENTS LATÉRAUX SCI-FI — passage rapide
   ───────────────────────────────────────────────────────────── */
function SciFiBuilding({ side, z, h, color, accentCol }: {
  side: -1 | 1; z: number; h: number; color: string; accentCol: string;
}) {
  const x = side * 9.5;
  return (
    <group position={[x, 0, z]}>
      {/* Corps principal */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[4, h, 4]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Bandes verticales néon */}
      {[-1.5, 0, 1.5].map((bx, i) => (
        <mesh key={i} position={[bx, h / 2, side > 0 ? -2.05 : 2.05]}>
          <boxGeometry args={[0.08, h * 0.85, 0.02]} />
          <meshBasicMaterial color={accentCol} toneMapped={false} />
        </mesh>
      ))}
      {/* Bandeau lumineux horizontal en bas */}
      <mesh position={[0, 0.4, side > 0 ? -2.05 : 2.05]}>
        <boxGeometry args={[3.8, 0.15, 0.02]} />
        <meshBasicMaterial color={accentCol} toneMapped={false} />
      </mesh>
      {/* Halo global de la façade */}
      <mesh position={[0, h / 2, side > 0 ? -2.1 : 2.1]}>
        <planeGeometry args={[5, h * 1.05]} />
        <meshBasicMaterial color={accentCol} transparent opacity={0.1} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Toit avec antenne */}
      <mesh position={[0, h + 0.4, 0]}>
        <boxGeometry args={[3.5, 0.4, 3.5]} />
        <meshBasicMaterial color="#0a0a14" toneMapped={false} />
      </mesh>
      <mesh position={[0, h + 1.5, 0]}>
        <boxGeometry args={[0.06, 2, 0.06]} />
        <meshBasicMaterial color="#1a1a28" toneMapped={false} />
      </mesh>
      <mesh position={[0, h + 2.5, 0]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshBasicMaterial color="#ff1744" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   ARCHE NÉON — porte sci-fi qui enjambe la route
   ───────────────────────────────────────────────────────────── */
function NeonArch({ z, color }: { z: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      const t = Date.now() * 0.004;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.7 + Math.sin(t) * 0.25;
    }
  });

  return (
    <group position={[0, 0, z]}>
      {/* Pied gauche */}
      <mesh position={[-4, 4, 0]}>
        <boxGeometry args={[0.5, 8, 0.5]} />
        <meshBasicMaterial color="#0a0a18" toneMapped={false} />
      </mesh>
      {/* Pied droit */}
      <mesh position={[4, 4, 0]}>
        <boxGeometry args={[0.5, 8, 0.5]} />
        <meshBasicMaterial color="#0a0a18" toneMapped={false} />
      </mesh>
      {/* Traverse haute */}
      <mesh position={[0, 8.2, 0]}>
        <boxGeometry args={[8.5, 0.6, 0.6]} />
        <meshBasicMaterial color="#0a0a18" toneMapped={false} />
      </mesh>
      {/* Néon strip horizontal */}
      <mesh ref={ref} position={[0, 8.2, 0.32]}>
        <boxGeometry args={[8.4, 0.18, 0.05]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      {/* Néon vertical gauche */}
      <mesh position={[-4, 4, 0.27]}>
        <boxGeometry args={[0.18, 7.8, 0.05]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Néon vertical droit */}
      <mesh position={[4, 4, 0.27]}>
        <boxGeometry args={[0.18, 7.8, 0.05]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Halo arc */}
      <mesh position={[0, 8.2, 0.5]}>
        <planeGeometry args={[10, 1.2]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Logo central style holo */}
      <mesh position={[0, 8.2, 0.4]}>
        <circleGeometry args={[0.6, 6]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROPS PAR SEGMENT
   ───────────────────────────────────────────────────────────── */
function StreetProps({ zOffset, segIdx }: { zOffset: number; segIdx: number }) {
  const lampColor = segIdx % 2 === 0 ? "#ff1493" : "#00f0ff";
  const accent2 = segIdx % 2 === 0 ? "#00f0ff" : "#ff1493";
  const archColor = segIdx % 3 === 0 ? "#39ff14" : segIdx % 3 === 1 ? "#00f0ff" : "#ff1493";

  return (
    <>
      <NeonStrips zOffset={zOffset} />
      <GlowingChevrons zOffset={zOffset} />
      <NeonRail side={-1} zOffset={zOffset} />
      <NeonRail side={ 1} zOffset={zOffset} />

      {/* Lampadaires sci-fi alternés */}
      <SciFiLamp x={-4.5} z={zOffset + 6}  color={lampColor} />
      <SciFiLamp x={ 4.5} z={zOffset + 12} color={accent2} />
      <SciFiLamp x={-4.5} z={zOffset + 18} color={accent2} />
      <SciFiLamp x={ 4.5} z={zOffset + 24} color={lampColor} />

      {/* Arche sci-fi tous les 2 segments */}
      {segIdx % 2 === 0 && <NeonArch z={zOffset + 14} color={archColor} />}

      {/* Bâtiments latéraux */}
      <SciFiBuilding side={-1} z={zOffset + 8}  h={9 + (segIdx % 3) * 3} color="#0a0814" accentCol={lampColor} />
      <SciFiBuilding side={ 1} z={zOffset + 14} h={11 + (segIdx % 2) * 4} color="#0a0a18" accentCol={accent2} />
      <SciFiBuilding side={-1} z={zOffset + 20} h={8 + (segIdx % 4) * 2} color="#080812" accentCol={accent2} />
      <SciFiBuilding side={ 1} z={zOffset + 5}  h={13 + (segIdx % 2) * 2} color="#0a0814" accentCol={lampColor} />

      {/* Holo-boards */}
      <HoloBoard side={-1} z={zOffset + 11} label="SAFI" color={lampColor} />
      <HoloBoard side={ 1} z={zOffset + 22} label="BRIDGE" color={accent2} />
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
