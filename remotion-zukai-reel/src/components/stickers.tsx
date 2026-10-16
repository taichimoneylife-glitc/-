import React from "react";
import { Img, staticFile, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

// ════════════════════════════════════════════════════════════════════
//  ステッカー図解キット（参考：方眼紙×シール図解 / mile_sticker_design_spec.md STEP8）
//  ・絵＝フラット＋紺の太い輪郭。白フチ（ダイカット）＋落ち影はラッパー側で付与。
//  ・生成画像(PNG)が来たら <Sticker img="mile_xxx"> で同じ白フチ処理のまま差し替え。
// ════════════════════════════════════════════════════════════════════

export const ST = {
  bg: "#F4ECCC",
  grid: "rgba(108,170,196,0.45)",
  navy: "#002E53",
  red: "#E8402F",
  badge: "#F83620",
  under: "#DF4031",
  gray: "#6E777B",
  gold: "#F2B53A",
  goldL: "#F9D36A",
  blue: "#3E86D6",
  green: "#3BAA5C",
  orange: "#F2A33A",
  skin: "#FCE0C8",
  hair: "#3A2A22",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const S = { stroke: ST.navy, strokeWidth: 7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// 白フチ（ダイカット）＋落ち影
export const DIECUT =
  "drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(3px 7px 6px rgba(40,30,10,0.30))";

// ステッカー着地：scale 0.55→1.06→1、回転±→0、0.23s（STEP5）
export const usePop = (delay: number, rot0 = 14) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 10, stiffness: 240, mass: 0.55 } });
  return {
    visible: f >= delay,
    style: {
      transform: `scale(${interpolate(s, [0, 1], [0.55, 1])}) rotate(${(1 - s) * rot0}deg)`,
      opacity: interpolate(f - delay, [0, 3], [0, 1], clamp),
    } as React.CSSProperties,
  };
};

// ── アイコン（viewBox 200×200）──────────────────────────────────
const Plane = () => (
  <g transform="rotate(42 100 100)">
    <path d="M100 76 L20 118 L20 136 L100 112 L180 136 L180 118 Z" fill={ST.blue} {...S} />
    <rect x="48" y="112" width="16" height="24" rx="7" fill="#fff" {...S} strokeWidth={5} />
    <rect x="136" y="112" width="16" height="24" rx="7" fill="#fff" {...S} strokeWidth={5} />
    <path d="M100 146 L64 170 L64 182 L100 172 L136 182 L136 170 Z" fill={ST.blue} {...S} />
    <rect x="85" y="14" width="30" height="166" rx="15" fill="#fff" {...S} />
    <path d="M91 36 Q100 24 109 36 L109 48 L91 48 Z" fill={ST.navy} />
  </g>
);
const Receipt = () => (
  <g>
    <path d="M44 20 H148 V168 L135 158 L122 168 L109 158 L96 168 L83 158 L70 168 L57 158 L44 168 Z" fill="#fff" {...S} />
    <path d="M64 56 H128 M64 80 H128 M64 104 H108" stroke={ST.navy} strokeWidth={6} strokeLinecap="round" />
    <path d="M64 130 H128" stroke={ST.red} strokeWidth={9} strokeLinecap="round" />
    <circle cx="150" cy="150" r="32" fill={ST.gold} {...S} />
    <text x="150" y="163" textAnchor="middle" fontSize="38" fontWeight={900} fill={ST.navy} fontFamily="Noto Sans JP Black">¥</text>
  </g>
);
const Card = () => (
  <g transform="rotate(-10 100 100)">
    <rect x="18" y="50" width="164" height="104" rx="16" fill={ST.gold} {...S} />
    <rect x="21" y="72" width="158" height="20" fill={ST.navy} />
    <rect x="38" y="106" width="36" height="28" rx="6" fill="#FFF3C4" {...S} strokeWidth={5} />
    <path d="M118 128 H160" stroke={ST.navy} strokeWidth={6} strokeLinecap="round" />
  </g>
);
const Gift = () => (
  <g>
    <rect x="40" y="92" width="120" height="84" rx="8" fill={ST.red} {...S} />
    <rect x="30" y="68" width="140" height="30" rx="8" fill="#C93024" {...S} />
    <rect x="91" y="68" width="18" height="108" fill="#F6C744" stroke={ST.navy} strokeWidth={5} />
    <path d="M100 68 C80 30 50 44 66 64 C72 70 88 70 100 68 C112 70 128 70 134 64 C150 44 120 30 100 68 Z" fill="#F6C744" {...S} strokeWidth={6} />
    <path d="M30 34 L36 46 L48 50 L36 54 L30 66 L24 54 L12 50 L24 46 Z" fill="#F6C744" stroke={ST.navy} strokeWidth={4} strokeLinejoin="round" />
    <path d="M168 18 L172 27 L181 30 L172 33 L168 42 L164 33 L155 30 L164 27 Z" fill="#F6C744" stroke={ST.navy} strokeWidth={4} strokeLinejoin="round" />
  </g>
);
const Coins = () => (
  <g>
    {[154, 134, 114].map((y) => (
      <g key={y}>
        <path d={`M30 ${y} v16 a40 13 0 0 0 80 0 v-16`} fill={ST.gold} {...S} strokeWidth={6} />
        <ellipse cx="70" cy={y} rx="40" ry="13" fill={ST.goldL} {...S} strokeWidth={6} />
      </g>
    ))}
    <circle cx="134" cy="112" r="48" fill={ST.goldL} {...S} />
    <circle cx="134" cy="112" r="35" fill="none" stroke="#E0A42A" strokeWidth={5} />
    <text x="134" y="132" textAnchor="middle" fontSize="56" fontWeight={900} fill={ST.navy} fontFamily="Noto Sans JP Black">P</text>
  </g>
);
const Ticket = () => (
  <g transform="rotate(-8 100 100)">
    <path d="M14 58 Q14 46 26 46 H174 Q186 46 186 58 V74 H14 Z" fill={ST.blue} />
    <rect x="14" y="46" width="172" height="108" rx="12" fill="none" {...S} />
    <path d="M14 74 H186" stroke={ST.navy} strokeWidth={5} />
    <path d="M14 74 V142 Q14 154 26 154 H174 Q186 154 186 142 V74 Z" fill="#fff" />
    <rect x="14" y="46" width="172" height="108" rx="12" fill="none" {...S} />
    <path d="M136 80 V150" stroke={ST.navy} strokeWidth={4} strokeDasharray="6 7" />
    <g transform="translate(58 112) rotate(90) scale(0.3) translate(-100 -100)">
      <path d="M100 76 L20 118 L20 136 L100 112 L180 136 L180 118 Z" fill={ST.navy} />
      <path d="M100 146 L64 170 L64 182 L100 172 L136 182 L136 170 Z" fill={ST.navy} />
      <rect x="85" y="14" width="30" height="166" rx="15" fill={ST.navy} />
    </g>
    <path d="M90 100 H124 M90 120 H116" stroke={ST.navy} strokeWidth={6} strokeLinecap="round" />
    <path d="M150 98 V134 M160 98 V134 M168 98 V134" stroke={ST.navy} strokeWidth={4} />
    <text x="100" y="66" textAnchor="middle" fontSize="20" fontWeight={900} fill="#fff" fontFamily="Noto Sans JP Black" letterSpacing="3">MILES</text>
  </g>
);
const Person: React.FC<{ x: number; y: number; s: number; shirt: string; hair: string; long?: boolean }> = ({ x, y, s, shirt, hair, long }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-34 60 Q-34 22 0 22 Q34 22 34 60 Z" fill={shirt} {...S} />
    {long ? <path d="M-30 -2 Q-34 34 -18 40 L18 40 Q34 34 30 -2 Z" fill={hair} /> : null}
    <circle cx="0" cy="-4" r="28" fill={ST.skin} {...S} />
    <path d="M-29 -6 Q-28 -36 0 -36 Q28 -36 29 -6 Q20 -22 0 -22 Q-16 -22 -29 -6 Z" fill={hair} stroke={ST.navy} strokeWidth={5} strokeLinejoin="round" />
    <circle cx="-10" cy="-2" r="3.6" fill={ST.navy} />
    <circle cx="10" cy="-2" r="3.6" fill={ST.navy} />
    <path d="M-8 9 Q0 16 8 9" fill="none" stroke={ST.navy} strokeWidth={4} strokeLinecap="round" />
    <circle cx="-17" cy="6" r="4" fill="#F6B7A6" opacity={0.8} />
    <circle cx="17" cy="6" r="4" fill="#F6B7A6" opacity={0.8} />
  </g>
);
const Family = () => (
  <g>
    <Person x={46} y={86} s={1} shirt={ST.blue} hair={ST.hair} />
    <Person x={154} y={86} s={1} shirt={ST.red} hair="#6B4A36" long />
    <Person x={80} y={128} s={0.72} shirt={ST.green} hair={ST.hair} />
    <Person x={122} y={128} s={0.72} shirt={ST.orange} hair="#6B4A36" long />
  </g>
);
const House = () => (
  <g>
    <rect x="44" y="92" width="112" height="82" rx="6" fill="#FFF6DF" {...S} />
    <path d="M24 98 L100 34 L176 98 Z" fill={ST.red} {...S} />
    <rect x="86" y="120" width="30" height="54" rx="4" fill={ST.navy} />
    <rect x="124" y="112" width="24" height="24" rx="3" fill="#BFE2F7" {...S} strokeWidth={5} />
    <rect x="56" y="112" width="24" height="24" rx="3" fill="#BFE2F7" {...S} strokeWidth={5} />
    <rect x="132" y="44" width="16" height="30" fill="#C93024" {...S} strokeWidth={5} />
  </g>
);
const Cart = () => (
  <g>
    <rect x="70" y="52" width="26" height="40" rx="6" fill={ST.orange} {...S} strokeWidth={5} />
    <path d="M100 92 Q104 50 128 48 Q124 76 112 92 Z" fill={ST.green} {...S} strokeWidth={5} />
    <rect x="124" y="60" width="22" height="34" rx="4" fill="#fff" {...S} strokeWidth={5} />
    <path d="M18 50 H40 L58 136 H156 L172 78 H48" fill="none" {...S} />
    <path d="M48 78 H172 L156 136 H58 Z" fill="#BFE2F7" {...S} />
    <path d="M90 82 V132 M124 82 V132" stroke={ST.navy} strokeWidth={5} />
    <circle cx="74" cy="160" r="13" fill={ST.navy} />
    <circle cx="142" cy="160" r="13" fill={ST.navy} />
  </g>
);
const Calendar = () => (
  <g>
    <rect x="30" y="40" width="140" height="132" rx="14" fill="#fff" {...S} />
    <path d="M30 54 Q30 40 44 40 H156 Q170 40 170 54 V78 H30 Z" fill={ST.red} {...S} />
    <rect x="62" y="24" width="12" height="32" rx="6" fill={ST.navy} />
    <rect x="126" y="24" width="12" height="32" rx="6" fill={ST.navy} />
    <text x="96" y="150" textAnchor="middle" fontSize="70" fontWeight={900} fill={ST.navy} fontFamily="Noto Sans JP Black">6</text>
    <text x="138" y="150" textAnchor="middle" fontSize="26" fontWeight={900} fill={ST.navy} fontFamily="Noto Sans JP Black">ヶ月</text>
  </g>
);
const PhoneDM = () => (
  <g>
    <rect x="52" y="18" width="96" height="166" rx="18" fill={ST.navy} {...S} />
    <rect x="62" y="36" width="76" height="126" rx="8" fill="#fff" />
    <path d="M78 64 H130 Q138 64 138 72 V100 Q138 108 130 108 H96 L82 120 L84 108 H78 Q70 108 70 100 V72 Q70 64 78 64 Z" fill={ST.red} stroke={ST.navy} strokeWidth={4} strokeLinejoin="round" />
    <text x="104" y="96" textAnchor="middle" fontSize="28" fontWeight={900} fill="#fff" fontFamily="Noto Sans JP Black">DM</text>
    <path d="M76 132 H124 M76 146 H108" stroke={ST.navy} strokeWidth={5} strokeLinecap="round" />
  </g>
);
const Piggy = () => (
  <g>
    <circle cx="112" cy="30" r="20" fill={ST.goldL} {...S} strokeWidth={6} />
    <path d="M106 22 V38 M118 22 V38" stroke="#E0A42A" strokeWidth={4} />
    <path d="M58 76 L50 52 L80 66 Z" fill="#F08FA0" {...S} strokeWidth={6} />
    <ellipse cx="100" cy="112" rx="70" ry="54" fill="#F6A6B2" {...S} />
    <rect x="58" y="150" width="20" height="26" rx="6" fill="#F08FA0" {...S} strokeWidth={6} />
    <rect x="118" y="150" width="20" height="26" rx="6" fill="#F08FA0" {...S} strokeWidth={6} />
    <ellipse cx="164" cy="112" rx="16" ry="20" fill="#F08FA0" {...S} strokeWidth={6} />
    <circle cx="160" cy="106" r="3.5" fill={ST.navy} /><circle cx="168" cy="116" r="3.5" fill={ST.navy} />
    <circle cx="130" cy="92" r="5" fill={ST.navy} />
    <path d="M86 66 H122" stroke={ST.navy} strokeWidth={8} strokeLinecap="round" />
  </g>
);
const Suitcase = () => (
  <g>
    <path d="M78 46 V30 Q78 22 86 22 H114 Q122 22 122 30 V46" fill="none" {...S} />
    <rect x="36" y="46" width="128" height="122" rx="18" fill={ST.orange} {...S} />
    <path d="M70 46 V168 M130 46 V168" stroke={ST.navy} strokeWidth={6} />
    <circle cx="100" cy="88" r="16" fill={ST.blue} stroke={ST.navy} strokeWidth={4} />
    <rect x="86" y="118" width="30" height="20" rx="4" fill="#fff" stroke={ST.navy} strokeWidth={4} transform="rotate(-12 100 128)" />
    <circle cx="56" cy="178" r="9" fill={ST.navy} /><circle cx="144" cy="178" r="9" fill={ST.navy} />
  </g>
);

export const ICONS = { plane: Plane, receipt: Receipt, card: Card, gift: Gift, coins: Coins, ticket: Ticket, family: Family, house: House, cart: Cart, calendar: Calendar, phone: PhoneDM, piggy: Piggy, suitcase: Suitcase };
export type IconName = keyof typeof ICONS;

// ステッカー本体（中心座標指定）。img を渡せば生成画像に差し替え（同じ白フチ）。
export const Sticker: React.FC<{ icon?: IconName; img?: string; cx: number; cy: number; size: number; delay: number; rot0?: number; tilt?: number }> = ({ icon, img, cx, cy, size, delay, rot0 = 14, tilt = 0 }) => {
  const p = usePop(delay, rot0);
  if (!p.visible) return null;
  const I = icon ? ICONS[icon] : null;
  return (
    <div style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, width: size, height: size, ...p.style }}>
      <div style={{ width: size, height: size, filter: DIECUT, transform: `rotate(${tilt}deg)` }}>
        {img ? (
          <Img src={staticFile(`gen/${img}.png`)} style={{ width: size, height: size, objectFit: "contain" }} />
        ) : I ? (
          <svg viewBox="0 0 200 200" width={size} height={size}><I /></svg>
        ) : null}
      </div>
    </div>
  );
};

// ── キャラ（太一ちびキャラの仮SVG・表情差し替え）。生成画像が来たら img で差し替え ──
export type Mood = "smile" | "point" | "worry" | "wave";
export const Chara: React.FC<{ mood: Mood; cx: number; cy: number; size: number; delay?: number; img?: string }> = ({ mood, cx, cy, size, delay = 0, img }) => {
  const f = useCurrentFrame();
  const p = usePop(delay, 10);
  if (!p.visible) return null;
  const bob = Math.sin((f - delay) / 12) * 2.5;
  const eyes =
    mood === "smile" || mood === "wave" ? (
      <g fill="none" stroke={ST.navy} strokeWidth={5} strokeLinecap="round"><path d="M78 98 Q86 90 94 98" /><path d="M106 98 Q114 90 122 98" /></g>
    ) : (
      <g fill={ST.navy}><ellipse cx="86" cy="98" rx="5.5" ry="7" /><ellipse cx="114" cy="98" rx="5.5" ry="7" /><circle cx="88" cy="95" r="2" fill="#fff" /><circle cx="116" cy="95" r="2" fill="#fff" /></g>
    );
  const brows = mood === "worry" ? <path d="M76 82 L94 88 M124 82 L106 88" stroke={ST.hair} strokeWidth={5} strokeLinecap="round" /> : <path d="M78 82 Q86 78 94 82 M106 82 Q114 78 122 82" stroke={ST.hair} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  const mouth =
    mood === "worry" ? <path d="M90 124 Q100 116 110 124" fill="none" stroke={ST.navy} strokeWidth={5} strokeLinecap="round" /> : <path d="M86 116 Q100 132 114 116 Z" fill="#C8443A" stroke={ST.navy} strokeWidth={4} strokeLinejoin="round" />;
  return (
    <div style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2 + bob, width: size, height: size * 1.1, ...p.style }}>
      <div style={{ filter: DIECUT }}>
        {img ? (
          <Img src={staticFile(`gen/${img}.png`)} style={{ width: size, height: size * 1.1, objectFit: "contain" }} />
        ) : (
          <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
            {/* 体（白シャツ） */}
            <path d="M44 220 Q44 156 100 152 Q156 156 156 220 Z" fill="#fff" {...S} />
            <path d="M88 152 L100 170 L112 152" fill="none" stroke={ST.navy} strokeWidth={5} strokeLinejoin="round" />
            {/* 手 */}
            {mood === "point" ? (
              <g><path d="M150 190 Q164 150 160 118" fill="none" stroke="#fff" strokeWidth={22} strokeLinecap="round" /><path d="M150 190 Q164 150 160 118" fill="none" {...S} strokeWidth={0} /><circle cx="160" cy="114" r="13" fill={ST.skin} {...S} strokeWidth={5} /><rect x="156" y="84" width="9" height="26" rx="4.5" fill={ST.skin} stroke={ST.navy} strokeWidth={4} /></g>
            ) : mood === "wave" ? (
              <g><circle cx="34" cy="128" r="15" fill={ST.skin} {...S} strokeWidth={5} /><circle cx="166" cy="128" r="15" fill={ST.skin} {...S} strokeWidth={5} /><path d="M20 112 L14 104 M48 112 L54 104 M152 112 L146 104 M180 112 L186 104" stroke={ST.navy} strokeWidth={4} strokeLinecap="round" /></g>
            ) : null}
            {/* 首・顔 */}
            <rect x="88" y="134" width="24" height="22" fill={ST.skin} stroke={ST.navy} strokeWidth={4} />
            <circle cx="100" cy="100" r="54" fill={ST.skin} {...S} />
            <path d="M46 100 C40 50 70 34 100 34 C132 34 162 50 154 100 C151 86 147 79 141 74 C128 83 112 81 104 70 C96 81 76 85 60 80 C54 86 50 92 46 100 Z" fill={ST.hair} stroke={ST.navy} strokeWidth={5} strokeLinejoin="round" />
            {brows}
            {eyes}
            {mouth}
            <circle cx="72" cy="114" r="8" fill="#F6B7A6" opacity={0.75} />
            <circle cx="128" cy="114" r="8" fill="#F6B7A6" opacity={0.75} />
            {mood === "worry" ? <path d="M150 64 Q156 74 150 80 Q144 74 150 64 Z" fill="#9ED3F0" stroke={ST.navy} strokeWidth={3} /> : null}
          </svg>
        )}
      </div>
    </div>
  );
};
