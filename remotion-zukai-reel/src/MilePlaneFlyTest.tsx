import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";

// ═══════════════════════════════════════════════════════════════════
// マイル｜飛行機フライスルー転換 試作 v2（モーション検証・音声なし）
//   ①「マイルで飛行機に」→ 旅客機が衝突寸前まで迫る（残像ブラー＋ベイパー＋カメラ振動）
//   ② 突き抜け → ホワイトアウト
//   ③「北海道、到着！」ページがズームで立ち上がる（雪の丘・時計台・グルメ）
//   ※仮SVG。本番は mile_airplane.png / 北海道の生成画像に差し替え。
//   ※分離ルール：このファイル専用。他リールの部品は使わない／触らない。
// ═══════════════════════════════════════════════════════════════════

export const MILEFLY_FRAMES = 180; // 6.0s @30fps

const C = {
  cream: "#FCFBF7",
  ink: "#2E2C26",
  sky1: "#BFE3F7",
  sky2: "#E6F4FC",
  green: "#3DA35D",
  gold: "#E6B422",
  coral: "#E8795A",
  navy: "#20364A",
  line: "#AFC2CE",
  snow: "#FFFFFF",
  hill: "#EAF3F7",
};

const TOP_SAFE = 250;

// ───────── 旅客機（前方やや上ビュー・顔に見えない設計） ─────────
// コックピットは上端に小さく／下半分は綺麗なノーズコーン。横縞livery（笑顔曲線は使わない）。
const Plane: React.FC = () => (
  <svg width={360} height={390} viewBox="0 0 240 260" style={{ display: "block" }}>
    <defs>
      <linearGradient id="pl-body" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#C9D2D9" />
        <stop offset="0.42" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#BCC7CF" />
      </linearGradient>
      <linearGradient id="pl-wing" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#EDF1F4" />
        <stop offset="1" stopColor="#C2CCD3" />
      </linearGradient>
      <radialGradient id="pl-intake" cx="0.5" cy="0.38" r="0.65">
        <stop offset="0" stopColor="#52626F" />
        <stop offset="1" stopColor="#121C26" />
      </radialGradient>
    </defs>

    {/* 垂直尾翼（gold livery・上端） */}
    <path d="M120 30 L108 74 L132 74 Z" fill={C.gold} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" opacity="0.92" />
    {/* 水平尾翼 */}
    <path d="M120 70 L86 82 L92 73 L120 64 L148 73 L154 82 Z" fill="url(#pl-wing)" stroke={C.line} strokeWidth="2" strokeLinejoin="round" />

    {/* 主翼（後退角＋ウイングレット）＝胴体の中ほど */}
    <path d="M120 150 L28 176 Q14 178 12 168 L16 158 L120 128 Z" fill="url(#pl-wing)" stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
    <path d="M120 150 L212 176 Q226 178 228 168 L224 158 L120 128 Z" fill="url(#pl-wing)" stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 168 L8 150 L18 154 L20 166 Z" fill="#B4BFC8" stroke={C.line} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M228 168 L232 150 L222 154 L220 166 Z" fill="#B4BFC8" stroke={C.line} strokeWidth="1.5" strokeLinejoin="round" />

    {/* エンジン（翼の下・パイロンで接続） */}
    <rect x="68" y="150" width="6" height="18" fill="#C2CCD3" />
    <rect x="166" y="150" width="6" height="18" fill="#C2CCD3" />
    <g>
      <ellipse cx="71" cy="176" rx="14" ry="20" fill="#E3E9ED" stroke={C.line} strokeWidth="2" />
      <ellipse cx="71" cy="176" rx="9" ry="13" fill="url(#pl-intake)" />
      <circle cx="71" cy="174" r="2.6" fill="#9AA6AF" />
    </g>
    <g>
      <ellipse cx="169" cy="176" rx="14" ry="20" fill="#E3E9ED" stroke={C.line} strokeWidth="2" />
      <ellipse cx="169" cy="176" rx="9" ry="13" fill="url(#pl-intake)" />
      <circle cx="169" cy="174" r="2.6" fill="#9AA6AF" />
    </g>

    {/* 胴体（上＝細い／下＝ノーズコーンが手前で大きい） */}
    <path d="M120 74 C140 74 146 110 146 150 C146 196 138 236 120 236 C102 236 94 196 94 150 C94 110 100 74 120 74 Z"
      fill="url(#pl-body)" stroke={C.line} strokeWidth="2.5" />

    {/* コックピット窓（上端に小さく・前面ガラス） */}
    <path d="M110 96 Q120 90 130 96 L128 106 Q120 101 112 106 Z" fill={C.navy} />
    <line x1="120" y1="92" x2="120" y2="104" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.55" />

    {/* 横縞livery（ベルト＝笑顔にならない水平線） */}
    <path d="M97 128 Q120 122 143 128" fill="none" stroke={C.navy} strokeWidth="3" opacity="0.4" />
    <path d="M95 140 Q120 134 145 140" fill="none" stroke={C.gold} strokeWidth="3" opacity="0.5" />

    {/* ノーズコーンの光沢＆先端 */}
    <ellipse cx="112" cy="205" rx="11" ry="20" fill="#FFFFFF" opacity="0.55" />
    <ellipse cx="120" cy="232" rx="12" ry="8" fill="#AEB9C1" opacity="0.7" />
  </svg>
);

// 接近トランスフォーム（残像用に関数化）
const planeAt = (f: number) => {
  const ap = interpolate(f, [6, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const scale = interpolate(ap, [0, 1], [0.14, 5.6]);
  const y = interpolate(ap, [0, 1], [-150, 90]);
  return { ap, scale, y };
};

// ───────── ふわっと雲（ぼかし） ─────────
const Cloud: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o, filter: "blur(2px)" }}>
    <svg width={240 * s} height={100 * s} viewBox="0 0 240 100">
      <g fill="#FFFFFF">
        <ellipse cx="80" cy="62" rx="60" ry="36" />
        <ellipse cx="130" cy="50" rx="52" ry="44" />
        <ellipse cx="175" cy="64" rx="48" ry="32" />
        <rect x="68" y="60" width="120" height="34" rx="17" />
      </g>
    </svg>
  </div>
);

// ───────── 札幌時計台（影つき） ─────────
const ClockTower: React.FC = () => (
  <svg width="210" height="280" viewBox="0 0 210 280" style={{ filter: "drop-shadow(0 10px 14px rgba(40,50,60,0.18))" }}>
    <rect x="36" y="128" width="138" height="126" rx="7" fill="#C96A4B" stroke={C.ink} strokeWidth="3" />
    <rect x="36" y="128" width="138" height="20" rx="6" fill="#B85A3D" />
    <rect x="54" y="160" width="32" height="42" rx="5" fill="#FBEFD6" stroke={C.ink} strokeWidth="2" />
    <rect x="124" y="160" width="32" height="42" rx="5" fill="#FBEFD6" stroke={C.ink} strokeWidth="2" />
    <rect x="88" y="208" width="34" height="46" rx="5" fill="#8A4A33" stroke={C.ink} strokeWidth="2" />
    <rect x="80" y="58" width="50" height="72" fill="#EDF2EF" stroke={C.ink} strokeWidth="3" />
    <circle cx="105" cy="90" r="17" fill="#FFFFFF" stroke={C.ink} strokeWidth="3" />
    <line x1="105" y1="90" x2="105" y2="79" stroke={C.ink} strokeWidth="2.6" />
    <line x1="105" y1="90" x2="114" y2="94" stroke={C.ink} strokeWidth="2.6" />
    <path d="M74 58 L105 26 L136 58 Z" fill="#B23A2E" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
    <rect x="101" y="14" width="8" height="16" fill="#B23A2E" />
  </svg>
);

// ───────── 海鮮丼（影つき） ─────────
const FoodBowl: React.FC = () => (
  <svg width="200" height="190" viewBox="0 0 200 190" style={{ filter: "drop-shadow(0 10px 14px rgba(40,50,60,0.16))" }}>
    <path d="M74 40 q-10 -18 5 -32" fill="none" stroke="#C7D2D8" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
    <path d="M104 36 q-10 -18 5 -32" fill="none" stroke="#C7D2D8" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
    <path d="M134 42 q-10 -18 5 -32" fill="none" stroke="#C7D2D8" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
    <ellipse cx="100" cy="78" rx="62" ry="24" fill="#FBEFD6" stroke={C.ink} strokeWidth="3" />
    <circle cx="80" cy="72" r="10" fill={C.coral} />
    <circle cx="104" cy="68" r="9" fill="#E8A33D" />
    <circle cx="122" cy="74" r="8" fill={C.coral} />
    <circle cx="92" cy="80" r="6" fill="#E8A33D" />
    <path d="M32 80 Q100 164 168 80 Z" fill="#355C7D" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
    <path d="M44 92 Q100 150 156 92" fill="none" stroke="#4E7291" strokeWidth="4" opacity="0.6" />
    <ellipse cx="100" cy="150" rx="44" ry="11" fill="#2A4A66" />
  </svg>
);

// ───────── 要素Pop（スプリング＋常時ふわっと） ─────────
const Pop: React.FC<{ at: number; children: React.ReactNode; left: number; top: number; floatAmp?: number }> = ({ at, children, left, top, floatAmp = 7 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 12, mass: 0.8 } });
  const scale = interpolate(s, [0, 1], [0.5, 1]);
  const float = Math.sin((frame - at) / 16) * floatAmp;
  return (
    <div style={{ position: "absolute", left, top, opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${float}px) scale(${scale})` }}>
      {children}
    </div>
  );
};

// ═══════════════════════════ ページ1：飛行機接近 ═══════════════════════════
const Page1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hs = spring({ frame: frame - 4, fps, config: { damping: 13 } });
  const headOut = interpolate(frame, [50, 62], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); // 機体が巨大化する前に見出しを消す

  const { ap, scale, y } = planeAt(frame);
  const bank = Math.sin(frame / 10) * 3.5;
  const planeOpacity = interpolate(frame, [4, 10], [0, 1], { extrapolateRight: "clamp" });
  const speed = interpolate(ap, [0.12, 1], [0, 1], { extrapolateLeft: "clamp" });

  // 残像ブラー（過去フレームの位置に薄く重ねる）
  const ghosts = [{ df: 3, o: 0.22 }, { df: 6, o: 0.12 }];

  const cl = frame * 7;

  const renderPlane = (gScale: number, gy: number, op: number) => (
    <div style={{ position: "absolute", left: 540, top: 720 + gy, transform: `translate(-50%, -50%) scale(${gScale}) rotate(${bank}deg)`, opacity: op, filter: "drop-shadow(0 22px 34px rgba(40,60,80,0.28))" }}>
      <Plane />
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.sky1} 0%, ${C.sky2} 44%, ${C.cream} 72%)` }} />

      {/* スピードライン */}
      <AbsoluteFill style={{ opacity: speed * 0.55 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          {Array.from({ length: 20 }).map((_, i) => {
            const ang = (i / 20) * Math.PI * 2;
            const cx = 540, cy = 720 + y;
            const r0 = 150 + (i % 4) * 26;
            return <line key={i} x1={cx + Math.cos(ang) * r0} y1={cy + Math.sin(ang) * r0} x2={cx + Math.cos(ang) * 1000} y2={cy + Math.sin(ang) * 1000} stroke="#FFFFFF" strokeWidth={5 + (i % 3)} strokeLinecap="round" opacity={0.85} />;
          })}
        </svg>
      </AbsoluteFill>

      {/* ベイパートレイル（翼端から上へ流れる） */}
      <AbsoluteFill style={{ opacity: speed * 0.5 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <path d={`M${540 - 120 * scale * 0.12} ${720 + y} C ${420} ${500}, ${380} ${280}, ${360} ${60}`} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity="0.5" />
          <path d={`M${540 + 120 * scale * 0.12} ${720 + y} C ${660} ${500}, ${700} ${280}, ${720} ${60}`} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity="0.5" />
        </svg>
      </AbsoluteFill>

      {/* 雲 */}
      <Cloud x={120 - (cl % 1400)} y={430} s={1.2} o={0.9} />
      <Cloud x={700 - (cl % 1700)} y={300} s={0.85} o={0.8} />
      <Cloud x={820 - ((cl * 1.3) % 1800)} y={560} s={1.4} o={0.85} />

      {/* 見出し */}
      <div style={{ position: "absolute", top: TOP_SAFE, left: 0, width: 1080, textAlign: "center", transform: `translateY(${interpolate(hs, [0, 1], [-30, 0])}px)`, opacity: hs * headOut }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 76, color: C.ink, letterSpacing: 1 }}>マイルで、飛行機に。</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.green, marginTop: 10 }}>貯めたマイルで、空へ。</div>
      </div>

      {/* 残像→本体 */}
      {ap > 0.3 && ghosts.map((g, i) => {
        const p = planeAt(frame - g.df);
        return <React.Fragment key={i}>{renderPlane(p.scale, p.y, planeOpacity * g.o)}</React.Fragment>;
      })}
      {renderPlane(scale, y, planeOpacity)}
    </AbsoluteFill>
  );
};

// ═══════════════════════════ ページ2：北海道 到着 ═══════════════════════════
const Page2: React.FC<{ base: number }> = ({ base }) => {
  const frame = useCurrentFrame();
  const snow = frame * 2;
  return (
    <AbsoluteFill style={{ backgroundColor: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.sky2} 0%, ${C.cream} 52%)` }} />
      {/* 太陽 */}
      <div style={{ position: "absolute", right: 120, top: 360, width: 160, height: 160, borderRadius: "50%", background: "#FFF1C2", filter: "blur(2px)", opacity: 0.9 }} />

      {/* 雪の丘（奥行き） */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <path d="M0 1240 Q320 1120 640 1220 T1080 1200 L1080 1920 L0 1920 Z" fill={C.hill} />
        <path d="M0 1360 Q380 1240 760 1340 T1080 1320 L1080 1920 L0 1920 Z" fill="#FFFFFF" stroke="#E4EEF2" strokeWidth="2" />
      </svg>

      {/* 雪 */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 30 }).map((_, i) => {
          const x = (i * 149 + ((snow * (0.5 + (i % 3) * 0.3)) % 1080)) % 1080;
          const yy = ((i * 211) + snow * (1 + (i % 4) * 0.2)) % 1920;
          return <circle key={i} cx={x} cy={yy} r={3 + (i % 3)} fill="#FFFFFF" opacity={0.9} />;
        })}
      </svg>

      {/* 見出し */}
      <div style={{ position: "absolute", top: TOP_SAFE, left: 0, width: 1080, textAlign: "center" }}>
        <Pop at={base + 2} left={0} top={0} floatAmp={0}>
          <div style={{ width: 1080, textAlign: "center" }}>
            <span style={{ display: "inline-block", background: C.green, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 30, padding: "8px 26px", borderRadius: 999, marginBottom: 14, boxShadow: "0 8px 16px rgba(61,163,93,0.3)" }}>✈ 到着！</span>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, color: C.ink }}>北海道、到着！</div>
          </div>
        </Pop>
        <Pop at={base + 12} left={0} top={210} floatAmp={0}>
          <div style={{ width: 1080, textAlign: "center" }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 42, color: C.coral }}>浮いたお金で、今を楽しむ。</div>
          </div>
        </Pop>
      </div>

      {/* 時計台（丘の上） */}
      <Pop at={base + 22} left={120} top={980}>
        <ClockTower />
      </Pop>
      {/* グルメ */}
      <Pop at={base + 34} left={700} top={1050}>
        <FoodBowl />
      </Pop>
      {/* 家族チップ（ダッシュ枠はやめ・本番は mile_A_* 画像） */}
      <Pop at={base + 46} left={340} top={1420} floatAmp={5}>
        <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 999, padding: "16px 34px", boxShadow: "0 12px 26px rgba(0,0,0,0.1)", fontFamily: FONT, fontWeight: 800, fontSize: 36, color: C.ink }}>
          家族で、今を楽しむ 👨‍👩‍👦
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// ═══════════════════════════ 本体（突き抜け→ホワイトアウト→ズーム立ち上げ） ═══════════════════════════
export const MilePlaneFlyTest: React.FC = () => {
  const frame = useCurrentFrame();

  // カメラ微振動（接近の迫力）
  const sh = frame > 58 && frame < 86 ? interpolate(frame, [58, 84], [0, 1], { extrapolateRight: "clamp" }) : 0;
  const camX = Math.sin(frame * 2.4) * sh * 16;
  const camY = Math.cos(frame * 1.9) * sh * 11;

  // 切替：ホワイトアウト→到着ページがズームで立ち上がる
  const flash = interpolate(frame, [80, 86, 95], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p1op = interpolate(frame, [85, 90], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p2op = interpolate(frame, [88, 98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p2scale = interpolate(frame, [88, 108], [1.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ backgroundColor: C.cream, fontFamily: FONT }}>
      <AbsoluteFill style={{ transform: `translate(${camX}px, ${camY}px)` }}>
        {frame < 92 && <AbsoluteFill style={{ opacity: p1op }}><Page1 /></AbsoluteFill>}
        {frame >= 86 && <AbsoluteFill style={{ opacity: p2op, transform: `scale(${p2scale})` }}><Page2 base={92} /></AbsoluteFill>}
      </AbsoluteFill>

      {/* ホワイトアウト */}
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", pointerEvents: "none", opacity: flash }} />

      {/* 効果音（中音主役・高音はキメ1回） */}
      <SfxTrack
        gain={1}
        cues={[
          { file: "user/u05", at: 4, volume: 0.36 },
          { file: "user/u07", at: 74, volume: 0.48 },   // 接近ロア＝大転換
          { file: "user/u04", at: 94, volume: 0.42 },   // 到着キメ
          { file: "user/u02s", at: 106, volume: 0.36 }, // 時計台
          { file: "user/u02s", at: 118, volume: 0.36 }, // グルメ
          { file: "user/u02s", at: 130, volume: 0.36 }, // 家族
        ]}
      />
    </AbsoluteFill>
  );
};
