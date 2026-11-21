import React from "react";
import { COLORS, STROKE } from "../theme";

type IconProps = { size?: number };
const box = (s: number): React.CSSProperties => ({ width: s, height: s, overflow: "visible" });

// クルマ
export const CarIcon: React.FC<IconProps> = ({ size = 320 }) => (
  <svg viewBox="0 0 360 200" style={box(size)}>
    <path
      d="M30 140 L55 140 L80 85 C88 68 100 60 120 60 L235 60 C255 60 268 68 280 86 L305 132 L330 140 L330 155 L30 155 Z"
      fill={COLORS.white}
      stroke={COLORS.ink}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
    <path d="M110 78 L165 78 L165 108 L92 108 Z" fill={COLORS.grayLight} stroke={COLORS.ink} strokeWidth="4" />
    <path d="M180 78 L230 78 L258 108 L180 108 Z" fill={COLORS.grayLight} stroke={COLORS.ink} strokeWidth="4" />
    <circle cx="110" cy="155" r="28" fill={COLORS.white} stroke={COLORS.ink} strokeWidth={STROKE} />
    <circle cx="110" cy="155" r="8" fill={COLORS.ink} />
    <circle cx="265" cy="155" r="28" fill={COLORS.white} stroke={COLORS.ink} strokeWidth={STROKE} />
    <circle cx="265" cy="155" r="8" fill={COLORS.ink} />
  </svg>
);

// 銀行（ローンを借りる先）
export const BankIcon: React.FC<IconProps> = ({ size = 300 }) => (
  <svg viewBox="0 0 280 260" style={box(size)}>
    <path d="M30 90 L140 30 L250 90 Z" fill={COLORS.grayLight} stroke={COLORS.ink} strokeWidth={STROKE} strokeLinejoin="round" />
    <circle cx="140" cy="72" r="10" fill={COLORS.accent} />
    {[55, 105, 155, 205].map((x) => (
      <rect key={x} x={x} y="100" width="24" height="100" fill={COLORS.white} stroke={COLORS.ink} strokeWidth="5" />
    ))}
    <rect x="20" y="200" width="240" height="26" rx="6" fill={COLORS.white} stroke={COLORS.ink} strokeWidth={STROKE} />
    <rect x="34" y="90" width="212" height="14" fill={COLORS.white} stroke={COLORS.ink} strokeWidth="4" />
  </svg>
);

// 右向きの太い矢印
export const ArrowRight: React.FC<IconProps> = ({ size = 120 }) => (
  <svg viewBox="0 0 120 80" style={box(size)}>
    <path
      d="M10 40 L80 40 M62 18 L88 40 L62 62"
      fill="none"
      stroke={COLORS.ink}
      strokeWidth={STROKE + 4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 右肩上がりのグラフ（運用）
export const ChartUpIcon: React.FC<IconProps> = ({ size = 320 }) => (
  <svg viewBox="0 0 300 260" style={box(size)}>
    <line x1="40" y1="30" x2="40" y2="215" stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round" />
    <line x1="40" y1="215" x2="270" y2="215" stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round" />
    <polyline
      points="55,190 110,160 160,120 210,80 255,45"
      fill="none"
      stroke={COLORS.accent}
      strokeWidth={STROKE + 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M255 45 l-26 2 l14 22 Z" fill={COLORS.accent} />
    {[[110, 160], [160, 120], [210, 80]].map(([x, y]) => (
      <circle key={x} cx={x} cy={y} r="7" fill={COLORS.white} stroke={COLORS.accent} strokeWidth="5" />
    ))}
  </svg>
);

// 天秤（比較）
export const ScaleIcon: React.FC<IconProps> = ({ size = 320 }) => (
  <svg viewBox="0 0 320 260" style={box(size)}>
    <line x1="160" y1="40" x2="160" y2="210" stroke={COLORS.ink} strokeWidth={STROKE} strokeLinecap="round" />
    <line x1="60" y1="60" x2="260" y2="60" stroke={COLORS.ink} strokeWidth={STROKE} strokeLinecap="round" />
    <circle cx="160" cy="40" r="12" fill={COLORS.accent} />
    <path d="M60 60 L30 130 A45 30 0 0 0 90 130 Z" fill={COLORS.grayLight} stroke={COLORS.ink} strokeWidth="5" strokeLinejoin="round" />
    <path d="M260 60 L230 120 A45 30 0 0 0 290 120 Z" fill={COLORS.white} stroke={COLORS.accent} strokeWidth="6" strokeLinejoin="round" />
    <line x1="60" y1="60" x2="60" y2="70" stroke={COLORS.ink} strokeWidth="4" />
    <rect x="130" y="210" width="60" height="18" rx="6" fill={COLORS.ink} />
  </svg>
);

// 債券（証書）
export const BondIcon: React.FC<IconProps> = ({ size = 300 }) => (
  <svg viewBox="0 0 260 300" style={box(size)}>
    <rect x="30" y="20" width="200" height="260" rx="12" fill={COLORS.white} stroke={COLORS.ink} strokeWidth={STROKE} />
    <text x="130" y="80" fontSize="40" fill={COLORS.ink} textAnchor="middle" fontWeight="700">債券</text>
    <line x1="60" y1="110" x2="200" y2="110" stroke={COLORS.gray} strokeWidth="6" strokeLinecap="round" />
    <line x1="60" y1="138" x2="200" y2="138" stroke={COLORS.gray} strokeWidth="6" strokeLinecap="round" />
    <text x="130" y="215" fontSize="52" fill={COLORS.accent} textAnchor="middle" fontWeight="700">5.2%</text>
    <text x="130" y="252" fontSize="24" fill={COLORS.ink} textAnchor="middle" fontWeight="700">利回り（例）</text>
  </svg>
);
