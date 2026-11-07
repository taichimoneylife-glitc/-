import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT_ROUND } from "./components/font";

// ═══════════════════════════════════════════════════════════════════
// 紙工作スタイル「AさんBさんストーリー」デモ（参考③の再現・無音 約12s）
//   クラフト紙背景／ちぎり紙＋テープの見出し帯／ペープサート人形（棒つき・ゆらぎ）／
//   ギザギザ吹き出し／赤枠ラベル・紺ボックス／数字カウントアップ／紙吹雪／注釈。
//   本番はキャラを public/gen/mile_*.png に差し替え可。
// ═══════════════════════════════════════════════════════════════════

const F = FONT_ROUND;
const FPS = 30;
export const PAPER_FRAMES = 360;

const C = { paper1: "#E9DFC8", paper2: "#D6C6A6", card: "#F3EEE2", ink: "#2C3350", navy: "#243A66", red: "#D9452E", skin: "#F7D9B8", green: "#2FA36B" };

const useSp = (delay: number, dur = 9, cfg: Parameters<typeof spring>[0]["config"] = { damping: 12, stiffness: 150, mass: 0.8 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};

// ── クラフト紙の背景（ノイズ＋ビネット） ──
const Kraft: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 35%, ${C.paper1} 0%, ${C.paper2} 100%)` }} />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.5, mixBlendMode: "multiply" }}>
      <filter id="pap"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0.5 0" /></filter>
      <rect width="1080" height="1920" filter="url(#pap)" />
    </svg>
    <AbsoluteFill style={{ boxShadow: "inset 0 0 300px rgba(90,70,40,0.35)" }} />
  </AbsoluteFill>
);

// ── 紙吹雪の粒 ──
const Confetti: React.FC = () => {
  const f = useCurrentFrame();
  const cols = ["#D9452E", "#243A66", "#2FA36B", "#E6B422"];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.8 }}>
      {Array.from({ length: 70 }).map((_, i) => {
        const x = (i * 83) % 1080, y = ((i * 193) % 1920) + Math.sin((f + i * 20) / 30) * 4;
        const w = 6 + (i % 3) * 3;
        return <rect key={i} x={x} y={y} width={w} height={w * 0.5} rx={1} fill={cols[i % 4]} opacity={0.5} transform={`rotate(${(i * 37) % 180} ${x} ${y})`} />;
      })}
    </svg>
  );
};

// ── ちぎり紙＋マステ の見出し帯 ──
const TornStrip: React.FC<{ delay: number; until?: number; children: React.ReactNode; x: number; y: number; w?: number; rot?: number }> = ({ delay, until, children, x, y, w = 760, rot = -1.5 }) => {
  const f = useCurrentFrame(); const s = useSp(delay);
  if (f < delay - 2 || (until && f > until + 10)) return null;
  const out = until ? interpolate(f, [until, until + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: Math.min(1, s * 1.8) * out, transform: `translateX(${(1 - s) * -40}px) rotate(${rot}deg)` }}>
      <div style={{ position: "relative", background: C.card, padding: "18px 30px", boxShadow: "0 8px 18px rgba(60,45,25,0.28)", borderRadius: 2,
        clipPath: "polygon(0 6%, 4% 0, 12% 7%, 22% 1%, 34% 8%, 46% 2%, 58% 8%, 70% 1%, 82% 7%, 92% 1%, 100% 7%, 100% 92%, 94% 100%, 84% 93%, 72% 100%, 60% 93%, 48% 100%, 36% 93%, 24% 100%, 12% 93%, 3% 100%, 0 93%)" }}>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 44, color: C.ink, textAlign: "center", lineHeight: 1.25 }}>{children}</div>
      </div>
      {/* マステ */}
      <div style={{ position: "absolute", top: -14, left: 40, width: 120, height: 40, background: "rgba(150,150,150,0.38)", transform: "rotate(-6deg)", boxShadow: "0 2px 4px rgba(0,0,0,0.12)" }} />
      <div style={{ position: "absolute", top: -14, right: 40, width: 120, height: 40, background: "rgba(150,150,150,0.38)", transform: "rotate(5deg)", boxShadow: "0 2px 4px rgba(0,0,0,0.12)" }} />
    </div>
  );
};

// ── ペープサート人形（棒つき・ゆらぎ） ──
const Puppet: React.FC<{ delay: number; x: number; kind: "A" | "B"; mood: "happy" | "sad" }> = ({ delay, x, kind, mood }) => {
  const f = useCurrentFrame(); const s = useSp(delay, 10, { damping: 8, stiffness: 120 });
  const sway = Math.sin((f - delay) / 22) * 2.2;
  const hair = kind === "A" ? "#2A2622" : "#4A382A";
  const shirt = kind === "A" ? "#F2F2F2" : "#F2F2F2";
  return (
    <div style={{ position: "absolute", left: x, top: 980, transformOrigin: "50% 100%", opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 40}px) rotate(${sway}deg)` }}>
      {/* 棒 */}
      <div style={{ position: "absolute", left: 93, top: 300, width: 8, height: 430, background: "linear-gradient(90deg,#C9A36B,#E6C58E,#C9A36B)", borderRadius: 4 }} />
      {/* 白フチの切り抜き */}
      <div style={{ position: "relative", filter: "drop-shadow(0 10px 10px rgba(60,45,25,0.3))" }}>
        <svg width={200} height={340} viewBox="0 0 200 340">
          {/* 白フチ */}
          <g stroke="#fff" strokeWidth="14" strokeLinejoin="round" fill="#fff">
            <path d="M100 18 C150 18 158 70 150 110 L160 300 L40 300 L50 110 C42 70 50 18 100 18 Z" />
          </g>
          {/* 髪 */}
          <path d={kind === "A" ? "M62 70 C62 34 138 34 138 70 C138 52 62 52 62 70Z" : "M58 86 C58 32 142 32 142 90 C142 60 128 56 128 70 C128 54 72 54 72 70 C72 56 58 60 58 86Z"} fill={hair} />
          {/* 顔 */}
          <circle cx="100" cy="74" r="34" fill={C.skin} />
          <circle cx="88" cy="74" r="4" fill="#3A2E26" /><circle cx="112" cy="74" r="4" fill="#3A2E26" />
          {mood === "happy"
            ? <path d="M88 86 Q100 98 112 86" stroke="#B5584B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            : <path d="M88 92 Q100 84 112 92" stroke="#7E8A99" strokeWidth="3.5" fill="none" strokeLinecap="round" />}
          {/* 体 */}
          <path d="M66 112 C66 104 134 104 134 112 L150 296 L50 296 Z" fill={shirt} stroke="#DDD" strokeWidth="2" />
          {/* 小物 */}
          {kind === "A"
            ? <g><rect x="120" y="150" width="30" height="40" rx="4" fill="#F4C542" stroke="#B5884A" strokeWidth="2" /><rect x="120" y="150" width="30" height="12" fill="#FFF4C2" opacity="0.8" /></g>
            : <g><ellipse cx="78" cy="180" rx="26" ry="22" fill="#F7A8C4" stroke="#C76A90" strokeWidth="2" /><rect x="72" y="156" width="12" height="8" rx="2" fill="#E6B422" /></g>}
        </svg>
      </div>
    </div>
  );
};

// ── プロフィール紙 ──
const ProfileCard: React.FC<{ delay: number; x: number; name: string; line: string; lineColor?: string }> = ({ delay, x, name, line, lineColor }) => {
  const s = useSp(delay);
  return (
    <div style={{ position: "absolute", left: x, top: 720, width: 250, opacity: Math.min(1, s * 2), transform: `rotate(${x < 540 ? -2 : 2}deg) translateY(${(1 - s) * 20}px)` }}>
      <div style={{ background: "#FBF8F0", padding: "16px 18px", boxShadow: "0 8px 16px rgba(60,45,25,0.25)" }}>
        <div style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: C.red, letterSpacing: 2 }}>PROFILE</div>
        <div style={{ fontFamily: F, fontSize: 40, fontWeight: 800, color: C.ink }}>{name}</div>
        <div style={{ fontFamily: F, fontSize: 26, fontWeight: 700, color: lineColor ?? "#6A6456", marginTop: 4 }}>{line}</div>
      </div>
    </div>
  );
};

// ── ギザギザ吹き出し ──
const Burst: React.FC<{ delay: number; until?: number; x: number; y: number; children: React.ReactNode }> = ({ delay, until, x, y, children }) => {
  const f = useCurrentFrame(); const s = useSp(delay, 8, { damping: 9, stiffness: 200 });
  if (f < delay - 2 || (until && f > until + 10)) return null;
  const out = until ? interpolate(f, [until, until + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const pts = Array.from({ length: 20 }).map((_, i) => { const a = (i / 20) * Math.PI * 2; const r = i % 2 === 0 ? 150 : 120; return `${150 + Math.cos(a) * r},${120 + Math.sin(a) * r * 0.78}`; }).join(" ");
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, s * 2) * out, transform: `scale(${s})` }}>
      <svg width={300} height={240} viewBox="0 0 300 240" style={{ filter: "drop-shadow(0 6px 10px rgba(60,45,25,0.25))" }}>
        <polygon points={pts} fill="#FBF7EC" stroke={C.navy} strokeWidth="5" strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontWeight: 800, fontSize: 36, color: C.navy, textAlign: "center", lineHeight: 1.3 }}>{children}</div>
    </div>
  );
};

// ── 赤枠ラベル ──
const RedLabel: React.FC<{ delay: number; x: number; y: number; rot?: number; children: React.ReactNode }> = ({ delay, x, y, rot = -3, children }) => {
  const s = useSp(delay, 7, { damping: 8, stiffness: 220 });
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, s * 2), transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [0.6, 1])})` }}>
      <div style={{ border: `4px solid ${C.red}`, color: C.red, background: "rgba(255,255,255,0.75)", borderRadius: 8, padding: "8px 18px", fontFamily: F, fontWeight: 800, fontSize: 40, whiteSpace: "nowrap" }}>{children}</div>
    </div>
  );
};

export const PaperCraftDemo: React.FC = () => {
  const f = useCurrentFrame();
  const money = Math.round(interpolate(f, [s2(7.4), s2(9.0)], [0, 120000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) / 1000) * 1000;
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Kraft />
      <Confetti />

      {/* 見出し（前半） */}
      <TornStrip delay={6} until={s2(6.5)} x={160} y={150}>同じ年収の、2つの家族</TornStrip>
      <Burst delay={s2(1.4)} until={s2(6.2)} x={390} y={430}>その差、<br />知ってる…？</Burst>

      {/* 人形＋プロフィール（中盤〜） */}
      <ProfileCard delay={s2(3.4)} x={120} name="Aさん" line="マイルを活用" lineColor={C.green} />
      <ProfileCard delay={s2(3.7)} x={700} name="Bさん" line="何もしない" />
      <Puppet delay={s2(3.5)} x={150} kind="A" mood="happy" />
      <Puppet delay={s2(3.8)} x={720} kind="B" mood="sad" />

      {/* 見出し（後半）＋ラベル */}
      <TornStrip delay={s2(6.6)} x={190} y={150} w={700}>違いは、たった1つ</TornStrip>
      <RedLabel delay={s2(7.0)} x={120} y={900} rot={-4}>旅行代 ¥0</RedLabel>
      <RedLabel delay={s2(7.4)} x={720} y={900} rot={3}>毎年 現金ばらい</RedLabel>

      {/* 数字カウントアップ（紺ボックス） */}
      <div style={{ position: "absolute", left: 0, top: 1480, width: 1080, textAlign: "center", opacity: interpolate(f, [s2(7.2), s2(7.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <div style={{ display: "inline-block", background: C.navy, color: "#fff", borderRadius: 12, padding: "14px 30px", boxShadow: "0 10px 22px rgba(36,58,102,0.4)", transform: "rotate(-1.5deg)" }}>
          <span style={{ fontFamily: F, fontWeight: 800, fontSize: 36 }}>浮いたお金 </span>
          <span style={{ fontFamily: F, fontWeight: 800, fontSize: 60, color: "#FFE07A" }}>約{money.toLocaleString()}円</span>
        </div>
      </div>

      {/* 注釈 */}
      <div style={{ position: "absolute", bottom: 150, left: 0, width: 1080, textAlign: "center", fontFamily: F, fontSize: 22, color: "#7A715B" }}>
        ※一例です。カードや条件により異なります
      </div>
    </AbsoluteFill>
  );
};

function s2(s: number) { return Math.round(s * FPS); }
