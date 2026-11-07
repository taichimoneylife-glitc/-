import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  第1関門「インプット誘惑」POC — ボクセル(マイクラ風)ランナー
//  ReactThreeFiber + @remotion/three。全部BoxGeometryの集合＝コードで3D。
//  発信者の道のりゲーム化の試作。8秒 / 30fps / 1080x1920。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const CORRIDOR_FRAMES = 240;
const SPEED = 0.16; // world units per frame（走る速さ）
const SEG = 4;      // 本棚の間隔
const SHELVES = 16; // 片側の本棚数

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const Box: React.FC<{ p: [number, number, number]; s: [number, number, number]; c: string; e?: string; ei?: number }> = ({ p, s, c, e, ei = 0 }) => (
  <mesh position={p}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} emissive={e || "#000"} emissiveIntensity={ei} />
  </mesh>
);

// 本棚1台（木枠＋色とりどりの本）
const Shelf: React.FC<{ x: number; z: number; seed: number; flip: number }> = ({ x, z, seed, flip }) => {
  const rnd = useMemo(() => mulberry32(seed), [seed]);
  const bookCols = ["#C0392B", "#2E86AB", "#27AE60", "#E1A93A", "#8E44AD", "#D35400", "#16A085", "#2C3E50"];
  const books = useMemo(() => {
    const arr: { y: number; h: number; w: number; c: string; ox: number }[] = [];
    for (let row = 0; row < 3; row++) {
      let cursor = -0.9;
      while (cursor < 0.9) {
        const w = 0.12 + rnd() * 0.1;
        const h = 0.5 + rnd() * 0.28;
        arr.push({ y: 0.6 + row * 1.0, h, w, c: bookCols[Math.floor(rnd() * bookCols.length)], ox: cursor + w / 2 });
        cursor += w + 0.02;
      }
    }
    return arr;
  }, [rnd]);
  return (
    <group position={[x, 0, z]}>
      {/* 木枠 */}
      <Box p={[0, 1.7, 0]} s={[0.3, 3.4, 2.2]} c="#5b3a22" />
      {[0.15, 1.15, 2.15, 3.15].map((y, i) => <Box key={i} p={[0.12 * flip, y, 0]} s={[0.34, 0.14, 2.2]} c="#6b4a2f" />)}
      {/* 本 */}
      {books.map((b, i) => (
        <Box key={i} p={[0.2 * flip, b.y + b.h / 2 - 0.1, b.ox]} s={[0.28, b.h, b.w]} c={b.c} />
      ))}
    </group>
  );
};

// ランナー（ボクセル人間・背中向き・脚振り）
const Runner: React.FC = () => {
  const f = useCurrentFrame();
  const swing = Math.sin(f * 0.5) * 0.5;
  const bob = Math.abs(Math.sin(f * 0.5)) * 0.12;
  return (
    <group position={[0, 0.0 + bob, 0]}>
      {/* 脚 */}
      <group position={[-0.28, 0.9, 0]} rotation={[swing, 0, 0]}><Box p={[0, -0.45, 0]} s={[0.34, 0.9, 0.34]} c="#2f4a8a" /></group>
      <group position={[0.28, 0.9, 0]} rotation={[-swing, 0, 0]}><Box p={[0, -0.45, 0]} s={[0.34, 0.9, 0.34]} c="#2f4a8a" /></group>
      {/* 胴 */}
      <Box p={[0, 1.55, 0]} s={[0.86, 0.95, 0.5]} c="#e7ded0" />
      {/* 腕 */}
      <group position={[-0.55, 1.8, 0]} rotation={[-swing, 0, 0]}><Box p={[0, -0.35, 0]} s={[0.22, 0.8, 0.22]} c="#e7ded0" /></group>
      <group position={[0.55, 1.8, 0]} rotation={[swing, 0, 0]}><Box p={[0, -0.35, 0]} s={[0.22, 0.8, 0.22]} c="#e7ded0" /></group>
      {/* 頭 */}
      <Box p={[0, 2.5, 0]} s={[0.72, 0.72, 0.72]} c="#f2c9a0" />
      <Box p={[0, 2.72, -0.02]} s={[0.78, 0.42, 0.76]} c="#3a2a1e" />
    </group>
  );
};

// 敵（誘惑モブ・暗い色）
const Enemy: React.FC<{ x: number; z: number; c: string }> = ({ x, z, c }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f * 0.3 + x) * 0.1;
  return (
    <group position={[x, 0.9 + bob, z]}>
      <Box p={[0, 0.5, 0]} s={[0.8, 1.0, 0.5]} c={c} />
      <Box p={[0, 1.35, 0]} s={[0.66, 0.66, 0.66]} c="#7a5c44" />
      <Box p={[-0.16, 1.4, 0.34]} s={[0.12, 0.12, 0.05]} c="#ff3b30" e="#ff3b30" ei={0.6} />
      <Box p={[0.16, 1.4, 0.34]} s={[0.12, 0.12, 0.05]} c="#ff3b30" e="#ff3b30" ei={0.6} />
    </group>
  );
};

const World: React.FC = () => {
  const f = useCurrentFrame();
  const off = (f * SPEED) % SEG;
  const shelves = useMemo(() => Array.from({ length: SHELVES }, (_, i) => i), []);
  return (
    <>
      <ambientLight intensity={0.95} color="#ffe9cc" />
      <hemisphereLight args={["#ffe6bf", "#3a2414", 0.7]} />
      <directionalLight position={[4, 12, 6]} intensity={1.0} color="#fff2d8" />
      <pointLight position={[0, 4.5, 4]} intensity={26} distance={20} color="#ffd79a" />
      <pointLight position={[0, 4, -8]} intensity={30} distance={24} color="#ffc98a" />
      <fog attach="fog" args={["#3a2414", 16, 46]} />

      {/* 床：赤絨毯＋両脇の木床 */}
      <Box p={[0, -0.1, -22]} s={[3.0, 0.2, 70]} c="#7a1f1f" />
      <Box p={[-3.6, -0.15, -22]} s={[4.2, 0.2, 70]} c="#b98f52" />
      <Box p={[3.6, -0.15, -22]} s={[4.2, 0.2, 70]} c="#b98f52" />

      {/* 本棚（両側・z方向に流れて手前で消え、奥へ再配置） */}
      {shelves.map((i) => {
        const z = -i * SEG + off + 4;
        return (
          <group key={i}>
            <Shelf x={-3.4} z={z} seed={100 + i} flip={1} />
            <Shelf x={3.4} z={z} seed={500 + i} flip={-1} />
            {/* ランタン（光る箱） */}
            <Box p={[-2.2, 2.7, z]} s={[0.18, 0.3, 0.18]} c="#ffcf7a" e="#ffcf7a" ei={1.4} />
            <Box p={[2.2, 2.7, z]} s={[0.18, 0.3, 0.18]} c="#ffcf7a" e="#ffcf7a" ei={1.4} />
          </group>
        );
      })}

      <Runner />
      {/* 誘惑モブ：手前に流れてくる */}
      <Enemy x={-1.4} z={((f * SPEED) % 24) - 18} c="#3b2a52" />
      <Enemy x={1.5} z={((f * SPEED + 12) % 24) - 18} c="#25324a" />
    </>
  );
};

// ── ゲームUIバナー（上・木製プレート風） ──
const Banner: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 6, fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 20 });
  return (
    <div style={{ position: "absolute", top: 130, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `translateY(${(1 - s) * -60}px)`, opacity: Math.min(1, s * 1.5), fontFamily: FONT }}>
      <div style={{ position: "relative", background: "linear-gradient(#8a5a2b,#5e3a17)", border: "6px solid #d7a860", borderRadius: 22, padding: "16px 54px", boxShadow: "0 12px 30px rgba(0,0,0,0.45)", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 6, border: "3px solid rgba(255,235,190,0.5)", borderRadius: 14, pointerEvents: "none" }} />
        <div style={{ fontSize: 60, fontWeight: 900, color: "#fff5df", textShadow: "0 3px 0 #3a2410, 0 0 14px rgba(0,0,0,0.4)", letterSpacing: 2 }}>インプット誘惑</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#ffd98a", marginTop: 2, letterSpacing: 6 }}>第 1 関門</div>
      </div>
    </div>
  );
};

// ── 敵の吹き出し ──
const Bubble: React.FC<{ show: number; hide: number; text: string; left: number; top: number }> = ({ show, hide, text, left, top }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < show || f >= hide) return null;
  const s = spring({ frame: f - show, fps, config: { damping: 11, stiffness: 140 }, durationInFrames: 12 });
  const out = interpolate(f, [hide - 8, hide], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left, top, transform: `scale(${Math.min(1, s)})`, opacity: Math.min(1, s * 1.6) * out, fontFamily: FONT }}>
      <div style={{ position: "relative", background: "#fff", borderRadius: 20, padding: "18px 26px", fontSize: 40, fontWeight: 900, color: "#2a2018", boxShadow: "0 10px 24px rgba(0,0,0,0.35)", maxWidth: 460, lineHeight: 1.3, whiteSpace: "pre-line" }}>
        {text}
        <div style={{ position: "absolute", bottom: -14, left: 40, width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: "16px solid #fff" }} />
      </div>
    </div>
  );
};

export const CorridorRunner: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#1c110b" }}>
      <ThreeCanvas
        width={width}
        height={height}
        linear
        camera={{ fov: 62, position: [0, 3.7, 7.0], near: 0.1, far: 60 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: true }}
        onCreated={({ camera }) => camera.lookAt(new THREE.Vector3(0, 0.9, -12))}
      >
        <World />
      </ThreeCanvas>
      {/* ビネット */}
      <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />
      <Banner />
      <Bubble show={70} hide={150} text={"もっと知識を\nつけてから"} left={90} top={980} />
      <Bubble show={160} hide={236} text={"半年は学んでから!!"} left={430} top={1000} />
    </AbsoluteFill>
  );
};
