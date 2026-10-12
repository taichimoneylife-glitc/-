import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";

// ═══════════════════════════════════════════════════════════════════
// マイル｜飛行機フライスルー転換 試作（モーション検証・音声なし）
//   ①「マイルで飛行機に」→ 飛行機がこちらへ飛んでくる迫力
//   ② シュッと横にずれてシーン切替
//   ③「北海道、到着！」楽しむページ
//   ※検証用のSVG簡易飛行機＆簡易北海道。本番は mile_airplane.png 等に差し替え。
//   ※分離ルール：このファイル専用。他リールの部品は使わない／触らない。
// ═══════════════════════════════════════════════════════════════════

export const MILEFLY_FRAMES = 180; // 6.0s @30fps

const C = {
  cream: "#FCFBF7",
  ink: "#2E2C26",
  sky1: "#CDE8FA",
  sky2: "#EAF6FD",
  green: "#3DA35D",
  gold: "#E6B422",
  coral: "#E8795A",
  cloud: "#FFFFFF",
  line: "#9DB4C0",
};

const TOP_SAFE = 250;

// ───────── 簡易・前方からの飛行機SVG（こちらに向かってくる絵） ─────────
const Plane: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: "block" }}>
    {/* 主翼（手前に広がる・少し後退角） */}
    <path d="M100 118 L14 150 L20 128 L100 104 L180 128 L186 150 Z" fill="#E9EEF2" stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
    {/* 尾翼（水平） */}
    <path d="M100 70 L58 84 L62 74 L100 62 L138 74 L142 84 Z" fill="#E9EEF2" stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
    {/* 垂直尾翼 */}
    <path d="M100 44 L92 70 L108 70 Z" fill="#DCE4EA" stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
    {/* 胴体（手前＝ノーズが大きい縦カプセル） */}
    <ellipse cx="100" cy="116" rx="26" ry="62" fill="#FFFFFF" stroke={C.line} strokeWidth="2.5" />
    {/* コックピット窓 */}
    <ellipse cx="100" cy="150" rx="16" ry="18" fill="#2E4A5A" />
    <ellipse cx="100" cy="150" rx="16" ry="18" fill="none" stroke={C.line} strokeWidth="2" />
    {/* アクセントライン（ゴールド＝マイル感） */}
    <path d="M78 150 Q100 160 122 150" fill="none" stroke={C.gold} strokeWidth="4" strokeLinecap="round" />
    {/* エンジン2基 */}
    <ellipse cx="60" cy="132" rx="9" ry="16" fill="#D7DEE3" stroke={C.line} strokeWidth="2" />
    <ellipse cx="140" cy="132" rx="9" ry="16" fill="#D7DEE3" stroke={C.line} strokeWidth="2" />
  </svg>
);

// ───────── ふわっと浮く雲 ─────────
const Cloud: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o }}>
    <svg width={220 * s} height={90 * s} viewBox="0 0 220 90">
      <g fill={C.cloud}>
        <ellipse cx="70" cy="55" rx="55" ry="34" />
        <ellipse cx="120" cy="45" rx="48" ry="40" />
        <ellipse cx="160" cy="58" rx="45" ry="30" />
        <rect x="60" y="56" width="110" height="30" rx="15" />
      </g>
    </svg>
  </div>
);

// ───────── 札幌時計台（簡易シルエット） ─────────
const ClockTower: React.FC = () => (
  <svg width="200" height="260" viewBox="0 0 200 260">
    <rect x="34" y="120" width="132" height="120" rx="6" fill="#C96A4B" stroke={C.ink} strokeWidth="3" />
    <rect x="50" y="150" width="30" height="40" rx="4" fill="#FBEFD6" stroke={C.ink} strokeWidth="2" />
    <rect x="120" y="150" width="30" height="40" rx="4" fill="#FBEFD6" stroke={C.ink} strokeWidth="2" />
    <rect x="84" y="196" width="32" height="44" rx="4" fill="#8A4A33" stroke={C.ink} strokeWidth="2" />
    {/* 時計塔 */}
    <rect x="76" y="54" width="48" height="70" fill="#E7EDEA" stroke={C.ink} strokeWidth="3" />
    <circle cx="100" cy="86" r="16" fill="#FFFFFF" stroke={C.ink} strokeWidth="3" />
    <line x1="100" y1="86" x2="100" y2="76" stroke={C.ink} strokeWidth="2.5" />
    <line x1="100" y1="86" x2="108" y2="90" stroke={C.ink} strokeWidth="2.5" />
    {/* 屋根 */}
    <path d="M70 54 L100 24 L130 54 Z" fill="#B23A2E" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
    <rect x="96" y="12" width="8" height="16" fill="#B23A2E" />
  </svg>
);

// ───────── 湯気の立つグルメ（簡易・海鮮丼風） ─────────
const FoodBowl: React.FC = () => (
  <svg width="180" height="170" viewBox="0 0 180 170">
    {/* 湯気 */}
    <path d="M70 34 q-10 -16 4 -28" fill="none" stroke={C.line} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
    <path d="M100 30 q-10 -16 4 -28" fill="none" stroke={C.line} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
    <path d="M128 36 q-10 -16 4 -28" fill="none" stroke={C.line} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
    {/* 具（カニ身・いくら風） */}
    <ellipse cx="90" cy="70" rx="58" ry="22" fill="#FBEFD6" stroke={C.ink} strokeWidth="3" />
    <circle cx="72" cy="64" r="9" fill={C.coral} />
    <circle cx="96" cy="60" r="8" fill="#E8A33D" />
    <circle cx="112" cy="66" r="7" fill={C.coral} />
    {/* 器 */}
    <path d="M28 72 Q90 150 152 72 Z" fill="#355C7D" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
    <ellipse cx="90" cy="134" rx="40" ry="10" fill="#2A4A66" />
  </svg>
);

// ───────── 到着ページの要素Pop ─────────
const Pop: React.FC<{ at: number; children: React.ReactNode; left: number; top: number; floatAmp?: number }> = ({ at, children, left, top, floatAmp = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 11, mass: 0.7 } });
  const scale = interpolate(s, [0, 1], [0.4, 1]);
  const float = Math.sin((frame - at) / 14) * floatAmp;
  return (
    <div style={{ position: "absolute", left, top, opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${float}px) scale(${scale})` }}>
      {children}
    </div>
  );
};

// ═══════════════════════════ ページ1：飛行機 ═══════════════════════════
const Page1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 見出し登場
  const hs = spring({ frame: frame - 4, fps, config: { damping: 13 } });

  // 飛行機の接近（加速）：遠く小さく → ぐんぐん手前へ
  const ap = interpolate(frame, [6, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const planeScale = interpolate(ap, [0, 1], [0.16, 6.4]); // ぶつかりそうなくらい巨大化
  const planeY = interpolate(ap, [0, 1], [-120, 95]); // 奥（上）から手前（衝突寸前の位置）へ
  const bank = Math.sin(frame / 9) * 4; // 軽い揺れ
  const shake = ap > 0.74 ? Math.sin(frame * 2.1) * (ap - 0.74) * 120 : 0; // 直前の迫力ブレ（強め）
  const planeOpacity = interpolate(frame, [4, 10], [0, 1], { extrapolateRight: "clamp" });

  // スピードライン（接近で強まる）
  const speed = interpolate(ap, [0.1, 1], [0, 1], { extrapolateLeft: "clamp" });

  // 雲の流れ（下へ・外へ＝向かってくる疑似パララックス）
  const cl = frame * 6;

  return (
    <AbsoluteFill style={{ backgroundColor: C.cream, overflow: "hidden" }}>
      {/* 空グラデ（上） */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.sky1} 0%, ${C.sky2} 42%, ${C.cream} 70%)` }} />

      {/* スピードライン（放射） */}
      <AbsoluteFill style={{ opacity: speed * 0.5 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          {Array.from({ length: 16 }).map((_, i) => {
            const ang = (i / 16) * Math.PI * 2;
            const cx = 540, cy = 720 + planeY;
            const r0 = 120 + (i % 3) * 30;
            const r1 = 900;
            return (
              <line key={i}
                x1={cx + Math.cos(ang) * r0} y1={cy + Math.sin(ang) * r0}
                x2={cx + Math.cos(ang) * r1} y2={cy + Math.sin(ang) * r1}
                stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* 流れる雲 */}
      <Cloud x={120 - (cl % 1400)} y={430} s={1.1} o={0.95} />
      <Cloud x={640 - (cl % 1600)} y={300} s={0.8} o={0.85} />
      <Cloud x={820 - ((cl * 1.3) % 1700)} y={560} s={1.3} o={0.9} />

      {/* 見出し */}
      <div style={{ position: "absolute", top: TOP_SAFE, left: 0, width: 1080, textAlign: "center",
        transform: `translateY(${interpolate(hs, [0, 1], [-30, 0])}px)`, opacity: hs }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 76, color: C.ink, letterSpacing: 1 }}>マイルで、飛行機に。</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.green, marginTop: 10 }}>貯めたマイルで、空へ。</div>
      </div>

      {/* 飛行機 */}
      <div style={{ position: "absolute", left: 540 + shake, top: 720 + planeY,
        transform: `translate(-50%, -50%) scale(${planeScale}) rotate(${bank}deg)`, opacity: planeOpacity,
        filter: "drop-shadow(0 18px 30px rgba(40,60,80,0.25))" }}>
        <Plane size={300} />
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════ ページ2：北海道到着 ═══════════════════════════
const Page2: React.FC<{ base: number }> = ({ base }) => {
  // base = このページの開始フレーム（Pop の at はローカル bas準拠にするため、
  //        ここでは frame をそのまま使い、at に base+n を渡す）
  const frame = useCurrentFrame();
  const snow = frame * 2;

  return (
    <AbsoluteFill style={{ backgroundColor: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.sky2} 0%, ${C.cream} 46%)` }} />

      {/* 雪 */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 26 }).map((_, i) => {
          const x = (i * 157 + ((snow * (0.5 + (i % 3) * 0.3)) % 1080)) % 1080;
          const y = ((i * 237) + snow * (1 + (i % 4) * 0.2)) % 1920;
          return <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill="#FFFFFF" opacity={0.85} />;
        })}
      </svg>

      {/* 見出し */}
      <div style={{ position: "absolute", top: TOP_SAFE, left: 0, width: 1080, textAlign: "center" }}>
        <Pop at={base + 2} left={0} top={0} floatAmp={0}>
          <div style={{ width: 1080, textAlign: "center" }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 88, color: C.ink }}>北海道、到着！</div>
          </div>
        </Pop>
        <Pop at={base + 12} left={0} top={118} floatAmp={0}>
          <div style={{ width: 1080, textAlign: "center" }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.coral }}>浮いたお金で、今を楽しむ。</div>
          </div>
        </Pop>
      </div>

      {/* 時計台 */}
      <Pop at={base + 20} left={150} top={720}>
        <ClockTower />
      </Pop>
      {/* グルメ */}
      <Pop at={base + 32} left={660} top={820}>
        <FoodBowl />
      </Pop>
      {/* 家族プレースホルダ（本番 mile_A_* 画像に差し替え） */}
      <Pop at={base + 44} left={340} top={1180}>
        <div style={{ width: 400, height: 300, borderRadius: 28, background: "#FFFFFF", border: `3px dashed ${C.green}`,
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 30px rgba(0,0,0,0.08)" }}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.green, textAlign: "center", lineHeight: 1.5 }}>
            家族で旅行を楽しむ<br />（画像差し替え予定）
          </div>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// ═══════════════════════════ 本体（スライド転換） ═══════════════════════════
export const MilePlaneFlyTest: React.FC = () => {
  const frame = useCurrentFrame();

  // 転換：飛行機が画面いっぱい（衝突寸前・f≈84）になった瞬間、シュッと横スライド
  const slide = interpolate(frame, [84, 95], [0, 1080], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

  return (
    <AbsoluteFill style={{ backgroundColor: C.cream, fontFamily: FONT }}>
      {/* 2ページを横並びにして、コンテナごと左へスライド */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 2160, height: 1920, transform: `translateX(${-slide}px)` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
          <Page1 />
        </div>
        <div style={{ position: "absolute", left: 1080, top: 0, width: 1080, height: 1920 }}>
          <Page2 base={90} />
        </div>
      </div>

      {/* 衝突寸前のフラッシュ（抜けの演出） */}
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", pointerEvents: "none",
        opacity: interpolate(frame, [82, 86, 93], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />

      {/* 効果音（中音主役・高音はキメ1回） */}
      <SfxTrack
        gain={1}
        cues={[
          { file: "user/u05", at: 4, volume: 0.36 },   // 飛行機 出現
          { file: "user/u07", at: 76, volume: 0.48 },  // 接近ピーク＝大転換（衝突寸前）
          { file: "user/u04", at: 94, volume: 0.42 },  // 到着キメ（高音1回）
          { file: "user/u02s", at: 104, volume: 0.36 }, // 時計台
          { file: "user/u02s", at: 116, volume: 0.36 }, // グルメ
          { file: "user/u02s", at: 128, volume: 0.36 }, // 家族
        ]}
      />
    </AbsoluteFill>
  );
};
