import React from "react";
import { COLORS } from "../theme";

// ── 「塗り＋線」フラットイラスト集（線だけのアイコンから格上げ）──
const INK = COLORS.ink;
const RED = COLORS.accent;
const GOLD = "#F6C544";
const SKY = "#EAF2FA";
const GREEN = "#12A150";

type P = { size?: number };
const wrap = (w: number, h: number, s: number): React.CSSProperties => ({
  width: s,
  height: (s * h) / w,
  overflow: "visible",
});

// 車
export const FlatCar: React.FC<P & { color?: string }> = ({ size = 560, color = RED }) => (
  <svg viewBox="0 0 520 320" style={wrap(520, 320, size)}>
    <ellipse cx="260" cy="292" rx="205" ry="24" fill="#000" opacity="0.08" />
    <path
      d="M40 246 L70 246 L100 156 C112 128 132 116 165 116 L330 116 C360 116 380 126 398 154 L436 228 L470 242 L470 260 C470 272 462 280 450 280 L60 280 C48 280 40 272 40 260 Z"
      fill={color}
      stroke={INK}
      strokeWidth="9"
      strokeLinejoin="round"
    />
    <path d="M150 146 L232 146 L232 196 L118 196 Z" fill={SKY} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
    <path d="M252 146 L322 146 L360 196 L252 196 Z" fill={SKY} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
    <line x1="242" y1="146" x2="242" y2="266" stroke={INK} strokeWidth="5" />
    <circle cx="452" cy="236" r="12" fill={GOLD} stroke={INK} strokeWidth="4" />
    <circle cx="150" cy="280" r="46" fill={INK} />
    <circle cx="150" cy="280" r="20" fill={COLORS.grayLight} />
    <circle cx="372" cy="280" r="46" fill={INK} />
    <circle cx="372" cy="280" r="20" fill={COLORS.grayLight} />
  </svg>
);

// コイン
export const FlatCoin: React.FC<P> = ({ size = 150 }) => (
  <svg viewBox="0 0 120 120" style={wrap(120, 120, size)}>
    <circle cx="60" cy="60" r="52" fill={GOLD} stroke={INK} strokeWidth="7" />
    <circle cx="60" cy="60" r="36" fill="none" stroke="#D9A916" strokeWidth="6" />
    <text x="60" y="80" fontSize="56" fill={INK} textAnchor="middle" fontWeight="700">¥</text>
  </svg>
);

// 財布（現金一括＝手元が空に）
export const FlatWallet: React.FC<P> = ({ size = 460 }) => (
  <svg viewBox="0 0 420 320" style={wrap(420, 320, size)}>
    <ellipse cx="210" cy="292" rx="170" ry="20" fill="#000" opacity="0.08" />
    <rect x="60" y="90" width="300" height="190" rx="26" fill={RED} stroke={INK} strokeWidth="9" />
    <rect x="60" y="150" width="300" height="130" rx="20" fill="#C6381F" stroke={INK} strokeWidth="9" />
    <rect x="250" y="190" width="130" height="60" rx="14" fill={COLORS.grayLight} stroke={INK} strokeWidth="8" />
    <circle cx="300" cy="220" r="14" fill={GOLD} stroke={INK} strokeWidth="6" />
  </svg>
);

// 銀行
export const FlatBank: React.FC<P> = ({ size = 460 }) => (
  <svg viewBox="0 0 400 340" style={wrap(400, 340, size)}>
    <ellipse cx="200" cy="312" rx="180" ry="18" fill="#000" opacity="0.08" />
    <path d="M40 120 L200 40 L360 120 Z" fill={COLORS.grayLight} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
    <circle cx="200" cy="96" r="14" fill={RED} stroke={INK} strokeWidth="5" />
    <rect x="30" y="120" width="340" height="22" fill="#fff" stroke={INK} strokeWidth="8" />
    {[70, 140, 210, 280].map((x) => (
      <rect key={x} x={x} y="150" width="42" height="120" fill="#fff" stroke={INK} strokeWidth="8" />
    ))}
    <rect x="24" y="270" width="352" height="34" rx="8" fill="#fff" stroke={INK} strokeWidth="9" />
  </svg>
);

// 右肩上がりグラフ（運用）
export const FlatChartUp: React.FC<P> = ({ size = 480 }) => (
  <svg viewBox="0 0 420 320" style={wrap(420, 320, size)}>
    <line x1="60" y1="40" x2="60" y2="272" stroke={INK} strokeWidth="8" strokeLinecap="round" />
    <line x1="60" y1="272" x2="392" y2="272" stroke={INK} strokeWidth="8" strokeLinecap="round" />
    <rect x="96" y="210" width="52" height="62" fill={COLORS.grayLight} stroke={INK} strokeWidth="6" />
    <rect x="176" y="164" width="52" height="108" fill="#F3C0B6" stroke={INK} strokeWidth="6" />
    <rect x="256" y="112" width="52" height="160" fill={RED} stroke={INK} strokeWidth="6" />
    <polyline points="110,220 190,176 270,120 350,66" fill="none" stroke={GREEN} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M350 66 l-30 4 l16 24 Z" fill={GREEN} />
  </svg>
);

// 債券（証書）
export const FlatBond: React.FC<P> = ({ size = 380 }) => (
  <svg viewBox="0 0 300 360" style={wrap(300, 360, size)}>
    <ellipse cx="150" cy="338" rx="130" ry="16" fill="#000" opacity="0.08" />
    <rect x="34" y="26" width="232" height="300" rx="16" fill="#fff" stroke={INK} strokeWidth="9" />
    <rect x="34" y="26" width="232" height="70" rx="16" fill={INK} />
    <text x="150" y="74" fontSize="42" fill="#fff" textAnchor="middle" fontWeight="700">債券</text>
    <line x1="70" y1="130" x2="230" y2="130" stroke={COLORS.gray} strokeWidth="8" strokeLinecap="round" />
    <line x1="70" y1="162" x2="230" y2="162" stroke={COLORS.gray} strokeWidth="8" strokeLinecap="round" />
    <text x="150" y="250" fontSize="66" fill={RED} textAnchor="middle" fontWeight="700">5.2%</text>
    <text x="150" y="298" fontSize="26" fill={INK} textAnchor="middle" fontWeight="700">利回り（例）</text>
  </svg>
);

// 天秤（比較・結果）
export const FlatScale: React.FC<P> = ({ size = 460 }) => (
  <svg viewBox="0 0 420 320" style={wrap(420, 320, size)}>
    <ellipse cx="210" cy="300" rx="120" ry="16" fill="#000" opacity="0.08" />
    <rect x="196" y="70" width="28" height="210" rx="8" fill={INK} />
    <rect x="150" y="278" width="120" height="22" rx="10" fill={INK} />
    <circle cx="210" cy="66" r="16" fill={RED} stroke={INK} strokeWidth="5" />
    <line x1="80" y1="90" x2="340" y2="90" stroke={INK} strokeWidth="10" strokeLinecap="round" />
    <path d="M80 90 L44 170 A40 26 0 0 0 116 170 Z" fill={COLORS.grayLight} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
    <path d="M340 90 L304 156 A40 26 0 0 0 376 156 Z" fill="#F3C0B6" stroke={RED} strokeWidth="8" strokeLinejoin="round" />
    <line x1="80" y1="90" x2="80" y2="100" stroke={INK} strokeWidth="6" />
    <line x1="340" y1="90" x2="340" y2="100" stroke={INK} strokeWidth="6" />
  </svg>
);

// 右向き矢印
export const FlatArrow: React.FC<P> = ({ size = 150 }) => (
  <svg viewBox="0 0 140 90" style={wrap(140, 90, size)}>
    <path d="M14 45 L96 45 M74 20 L104 45 L74 70" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// グッドボタン（サムズアップ）
export const FlatThumbUp: React.FC<P & { color?: string }> = ({ size = 200, color = RED }) => (
  <svg viewBox="0 0 220 224" style={wrap(220, 224, size)}>
    <ellipse cx="110" cy="208" rx="72" ry="12" fill="#000" opacity="0.08" />
    <circle cx="110" cy="104" r="86" fill={color} stroke={INK} strokeWidth="8" />
    {/* 手首 */}
    <rect x="56" y="106" width="36" height="58" rx="10" fill="#fff" stroke={INK} strokeWidth="7" />
    {/* 親指を立てた手 */}
    <path
      d="M92 158 L92 108 C92 100 96 94 103 84 L120 60 C124 54 133 55 137 61 C140 66 140 72 138 78 L131 104 L159 104 C170 104 177 113 173 124 L162 158 C160 166 152 170 144 170 L100 170 C95 170 92 165 92 158 Z"
      fill="#fff"
      stroke={INK}
      strokeWidth="7"
      strokeLinejoin="round"
    />
  </svg>
);

// 株＝乱高下（ギザギザ・不安）
export const FlatVolatile: React.FC<P & { color?: string }> = ({ size = 420, color = RED }) => (
  <svg viewBox="0 0 420 260" style={wrap(420, 260, size)}>
    <line x1="34" y1="228" x2="404" y2="228" stroke={COLORS.gray} strokeWidth="5" strokeLinecap="round" />
    <line x1="34" y1="18" x2="34" y2="228" stroke={COLORS.gray} strokeWidth="5" strokeLinecap="round" />
    <polyline points="46,150 92,86 132,176 178,66 222,206 268,104 312,214 360,128" fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M222 206 l-16 -26 l32 0 Z" fill={color} />
  </svg>
);

// 債券＝なめらか右肩上がり（安定）
export const FlatRise: React.FC<P & { color?: string }> = ({ size = 420, color = GREEN }) => (
  <svg viewBox="0 0 420 260" style={wrap(420, 260, size)}>
    <line x1="34" y1="228" x2="404" y2="228" stroke={COLORS.gray} strokeWidth="5" strokeLinecap="round" />
    <line x1="34" y1="18" x2="34" y2="228" stroke={COLORS.gray} strokeWidth="5" strokeLinecap="round" />
    <polyline points="48,204 116,182 184,150 250,108 316,66 378,36" fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M378 36 l-28 8 l14 22 Z" fill={color} />
  </svg>
);

// お金の束（かわいい顔つき）
export const FlatMoneyBundle: React.FC<P> = ({ size = 300 }) => (
  <svg viewBox="0 0 320 240" style={wrap(320, 240, size)}>
    <ellipse cx="160" cy="224" rx="130" ry="12" fill="#000" opacity="0.08" />
    {/* 束の側面 */}
    <rect x="46" y="120" width="228" height="96" rx="12" fill="#CDE9C6" stroke={INK} strokeWidth="7" />
    <line x1="46" y1="150" x2="274" y2="150" stroke={INK} strokeWidth="4" opacity="0.5" />
    <line x1="46" y1="182" x2="274" y2="182" stroke={INK} strokeWidth="4" opacity="0.5" />
    {/* 一番上の札 */}
    <rect x="60" y="70" width="200" height="86" rx="12" fill="#EAF6E4" stroke={INK} strokeWidth="7" />
    <circle cx="160" cy="113" r="26" fill="none" stroke={GREEN} strokeWidth="6" />
    <text x="160" y="127" fontSize="34" fill={GREEN} textAnchor="middle" fontWeight="700">¥</text>
    {/* 帯 */}
    <rect x="128" y="70" width="64" height="86" fill={RED} opacity="0.85" />
    {/* かわいい顔 */}
    <circle cx="96" cy="104" r="4.5" fill={INK} />
    <circle cx="224" cy="104" r="4.5" fill={INK} />
    <path d="M92 120 Q104 130 118 120" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    <path d="M202 120 Q214 130 228 120" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    <circle cx="86" cy="116" r="7" fill="#F6B9A9" opacity="0.7" />
    <circle cx="234" cy="116" r="7" fill="#F6B9A9" opacity="0.7" />
  </svg>
);

// 貯金箱（将来の備え）
export const FlatPiggy: React.FC<P> = ({ size = 320 }) => (
  <svg viewBox="0 0 340 280" style={wrap(340, 280, size)}>
    <ellipse cx="170" cy="256" rx="140" ry="14" fill="#000" opacity="0.08" />
    <ellipse cx="176" cy="150" rx="128" ry="100" fill={RED} stroke={INK} strokeWidth="8" />
    <path d="M300 120 q34 -6 32 26 q-2 22 -30 20 Z" fill={RED} stroke={INK} strokeWidth="8" strokeLinejoin="round" />
    <rect x="150" y="52" width="70" height="26" rx="8" fill="#C6381F" stroke={INK} strokeWidth="7" />
    <circle cx="300" cy="150" r="8" fill={INK} />
    <path d="M96 138 Q112 132 128 138" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    <circle cx="112" cy="120" r="10" fill="#F6B9A9" opacity="0.7" />
    {/* 脚 */}
    {[110, 170, 230].map((x) => (
      <rect key={x} x={x} y="232" width="30" height="26" rx="6" fill={RED} stroke={INK} strokeWidth="7" />
    ))}
    {/* コイン投入中 */}
    <circle cx="185" cy="30" r="20" fill={GOLD} stroke={INK} strokeWidth="6" />
    <text x="185" y="40" fontSize="22" fill={INK} textAnchor="middle" fontWeight="700">¥</text>
  </svg>
);

// 大きなチェックマーク（丸囲み）
export const FlatCheck: React.FC<P & { color?: string }> = ({ size = 200, color = GREEN }) => (
  <svg viewBox="0 0 200 200" style={wrap(200, 200, size)}>
    <circle cx="100" cy="100" r="86" fill={color} stroke={INK} strokeWidth="8" />
    <path d="M58 104 L88 134 L146 70" fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
