import React from "react";
import { CC } from "./kit";

// ── 大きめの塗り込みイラスト（白背景リール用）──
const box = (w: number, h: number, s: number): React.CSSProperties => ({ width: s, height: (s * h) / w, overflow: "visible" });
const INK = CC.ink, RED = CC.red, GREEN = CC.green, GOLD = "#F6C544", SKY = "#EAF2FA", GRAY = CC.gray;

// 車
export const IllCar: React.FC<{ size?: number }> = ({ size = 420 }) => (
  <svg viewBox="0 0 520 320" style={box(520, 320, size)}>
    <ellipse cx="260" cy="292" rx="205" ry="22" fill="#000" opacity="0.06" />
    <path d="M40 246 L70 246 L100 156 C112 128 132 116 165 116 L330 116 C360 116 380 126 398 154 L436 228 L470 242 L470 260 C470 272 462 280 450 280 L60 280 C48 280 40 272 40 260 Z" fill={RED} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
    <path d="M150 146 L232 146 L232 196 L118 196 Z" fill={SKY} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
    <path d="M252 146 L322 146 L360 196 L252 196 Z" fill={SKY} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
    <line x1="242" y1="146" x2="242" y2="266" stroke={INK} strokeWidth="5" />
    <circle cx="452" cy="236" r="12" fill={GOLD} stroke={INK} strokeWidth="4" />
    <circle cx="150" cy="280" r="46" fill={INK} /><circle cx="150" cy="280" r="20" fill="#E3E5EA" />
    <circle cx="372" cy="280" r="46" fill={INK} /><circle cx="372" cy="280" r="20" fill="#E3E5EA" />
  </svg>
);

// 財布＋銀行（ローン概念）
export const IllWalletBank: React.FC<{ size?: number }> = ({ size = 360 }) => (
  <svg viewBox="0 0 460 320" style={box(460, 320, size)}>
    <ellipse cx="230" cy="298" rx="200" ry="18" fill="#000" opacity="0.06" />
    {/* 銀行 */}
    <path d="M250 120 L360 66 L470 120 Z" fill="#E3E5EA" stroke={INK} strokeWidth="8" strokeLinejoin="round" transform="translate(-20,0)" />
    <rect x="232" y="120" width="220" height="16" fill="#fff" stroke={INK} strokeWidth="7" />
    {[250, 300, 350, 400].map((x) => (<rect key={x} x={x} y="142" width="30" height="96" fill="#fff" stroke={INK} strokeWidth="6" />))}
    <rect x="228" y="238" width="228" height="26" rx="6" fill="#fff" stroke={INK} strokeWidth="8" />
    {/* 財布 */}
    <rect x="20" y="150" width="220" height="140" rx="22" fill={RED} stroke={INK} strokeWidth="9" />
    <rect x="20" y="196" width="220" height="94" rx="16" fill="#C6381F" stroke={INK} strokeWidth="9" />
    <rect x="150" y="222" width="96" height="46" rx="12" fill="#E3E5EA" stroke={INK} strokeWidth="8" />
    <circle cx="188" cy="245" r="12" fill={GOLD} stroke={INK} strokeWidth="6" />
  </svg>
);

// お金→育つ（運用）：鉢のお金の木
export const IllGrowMoney: React.FC<{ size?: number }> = ({ size = 320 }) => (
  <svg viewBox="0 0 300 320" style={box(300, 320, size)}>
    <ellipse cx="150" cy="300" rx="120" ry="16" fill="#000" opacity="0.06" />
    <path d="M150 250 L150 150" stroke={INK} strokeWidth="10" strokeLinecap="round" />
    <path d="M150 175 C110 160 96 130 100 100 C138 104 158 128 150 175 Z" fill={GREEN} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
    <path d="M150 160 C190 145 206 116 202 86 C164 90 144 116 150 160 Z" fill={GREEN} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
    {[[120, 96], [180, 84], [150, 70]].map(([x, y], i) => (<g key={i}><circle cx={x} cy={y} r="20" fill={GOLD} stroke={INK} strokeWidth="6" /><text x={x} y={y + 8} fontSize="22" fill={INK} textAnchor="middle" fontWeight="700">¥</text></g>))}
    <path d="M96 250 L204 250 L188 296 L112 296 Z" fill={RED} stroke={INK} strokeWidth="8" strokeLinejoin="round" />
    <rect x="88" y="236" width="124" height="24" rx="6" fill="#C6381F" stroke={INK} strokeWidth="8" />
  </svg>
);

// 子育て世帯（家族）
export const IllFamily: React.FC<{ size?: number }> = ({ size = 360 }) => {
  const person = (x: number, s: number, col: string) => (
    <g transform={`translate(${x},0)`}>
      <circle cx="0" cy={120 - s * 60} r={22 * s} fill={SKY} stroke={INK} strokeWidth="7" />
      <path d={`M${-30 * s} 220 C${-30 * s} ${150 - s * 20} ${-18 * s} ${132 - s * 40} 0 ${132 - s * 40} C${18 * s} ${132 - s * 40} ${30 * s} ${150 - s * 20} ${30 * s} 220 Z`} fill={col} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 440 260" style={box(440, 260, size)}>
      <ellipse cx="220" cy="238" rx="180" ry="16" fill="#000" opacity="0.06" />
      <g transform="translate(90,20)">{person(0, 1.15, RED)}</g>
      <g transform="translate(350,20)">{person(0, 1.15, INK)}</g>
      <g transform="translate(190,70)">{person(0, 0.8, GOLD)}</g>
      <g transform="translate(260,70)">{person(0, 0.8, GREEN)}</g>
    </svg>
  );
};

// 米国債（星条旗＋上昇矢印＋5%）
export const IllUSA: React.FC<{ size?: number }> = ({ size = 360 }) => (
  <svg viewBox="0 0 380 300" style={box(380, 300, size)}>
    <ellipse cx="190" cy="286" rx="150" ry="14" fill="#000" opacity="0.06" />
    <line x1="70" y1="30" x2="70" y2="290" stroke={INK} strokeWidth="10" strokeLinecap="round" />
    <circle cx="70" cy="30" r="12" fill={GOLD} stroke={INK} strokeWidth="5" />
    {/* はためく旗 */}
    <path d="M80 44 C140 24 200 64 260 44 C320 24 340 54 340 54 L340 150 C340 150 320 122 260 142 C200 162 140 122 80 142 Z" fill="#fff" stroke={INK} strokeWidth="8" strokeLinejoin="round" />
    <rect x="80" y="44" width="96" height="52" fill="#1B3A8A" />
    {[54, 66, 78, 90].map((y) => (<line key={y} x1="180" y1={y} x2="336" y2={y - 2} stroke={RED} strokeWidth="7" />))}
    {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => (<circle key={`${r}-${c}`} cx={98 + c * 20} cy={54 + r * 13} r="2.6" fill="#fff" />)))}
    {/* 上昇矢印 */}
    <path d="M110 250 L180 210 L230 232 L320 176" fill="none" stroke={GREEN} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M320 176 l-30 2 l14 24 Z" fill={GREEN} />
  </svg>
);

// トロフィー（得・締め）
export const IllTrophy: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg viewBox="0 0 260 300" style={box(260, 300, size)}>
    <ellipse cx="130" cy="286" rx="110" ry="14" fill="#000" opacity="0.06" />
    <path d="M70 40 L190 40 L182 120 C178 160 154 182 130 182 C106 182 82 160 78 120 Z" fill={GOLD} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
    <path d="M70 56 C30 56 30 110 78 118" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
    <path d="M190 56 C230 56 230 110 182 118" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
    <rect x="116" y="182" width="28" height="40" fill={GOLD} stroke={INK} strokeWidth="8" />
    <rect x="84" y="222" width="92" height="26" rx="6" fill="#E3E5EA" stroke={INK} strokeWidth="8" />
    <rect x="70" y="248" width="120" height="30" rx="8" fill={INK} />
    <path d="M130 70 l10 22 24 2 -18 16 6 24 -22 -13 -22 13 6 -24 -18 -16 24 -2 Z" fill="#fff" opacity="0.9" />
  </svg>
);
