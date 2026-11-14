import React from "react";
import { COLORS, STROKE } from "../theme";

// ── 新NISA解説用のアイコン ──
type IconProps = { size?: number };
const box = (s: number): React.CSSProperties => ({ width: s, height: s, overflow: "visible" });

// 無期限（∞）
export const InfinityIcon: React.FC<IconProps> = ({ size = 300 }) => (
  <svg viewBox="0 0 320 220" style={box(size)}>
    <path
      d="M95 110 C95 70 45 70 45 110 C45 150 95 150 115 110 C135 70 185 70 205 110 C225 150 275 150 275 110 C275 70 225 70 205 110 C185 150 135 150 115 110 Z"
      fill="none"
      stroke={COLORS.ink}
      strokeWidth={STROKE + 6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g transform="translate(160 185)">
      <rect x="-70" y="0" width="140" height="46" rx="23" fill={COLORS.accent} />
      <text x="0" y="32" fontSize="28" fill={COLORS.white} textAnchor="middle" fontWeight="700">
        税金0円
      </text>
    </g>
  </svg>
);

// 年間投資枠（つみたて120万 ＋ 成長240万）
export const AnnualFrameIcon: React.FC<IconProps> = ({ size = 360 }) => (
  <svg viewBox="0 0 380 240" style={box(size)}>
    {/* つみたて枠 120 */}
    <rect x="20" y="120" width="150" height="100" rx="12" fill={COLORS.grayLight} stroke={COLORS.ink} strokeWidth="5" />
    <text x="95" y="110" fontSize="26" fill={COLORS.ink} textAnchor="middle" fontWeight="700">つみたて</text>
    <text x="95" y="185" fontSize="40" fill={COLORS.ink} textAnchor="middle" fontWeight="700">120万</text>
    {/* 成長枠 240 */}
    <rect x="200" y="40" width="160" height="180" rx="12" fill={COLORS.white} stroke={COLORS.accent} strokeWidth="6" />
    <text x="280" y="32" fontSize="26" fill={COLORS.accent} textAnchor="middle" fontWeight="700">成長投資</text>
    <text x="280" y="150" fontSize="46" fill={COLORS.accent} textAnchor="middle" fontWeight="700">240万</text>
  </svg>
);

// 生涯投資枠（金庫に1,800万）
export const SafeIcon: React.FC<IconProps> = ({ size = 320 }) => (
  <svg viewBox="0 0 300 320" style={box(size)}>
    <rect x="30" y="20" width="240" height="200" rx="18" fill={COLORS.white} stroke={COLORS.ink} strokeWidth={STROKE} />
    <rect x="60" y="50" width="180" height="140" rx="10" fill={COLORS.grayLight} stroke={COLORS.ink} strokeWidth="4" />
    <circle cx="150" cy="120" r="34" fill={COLORS.white} stroke={COLORS.ink} strokeWidth="6" />
    <circle cx="150" cy="120" r="10" fill={COLORS.accent} />
    <line x1="150" y1="120" x2="150" y2="88" stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round" />
    <line x1="55" y1="220" x2="55" y2="248" stroke={COLORS.ink} strokeWidth={STROKE} strokeLinecap="round" />
    <line x1="245" y1="220" x2="245" y2="248" stroke={COLORS.ink} strokeWidth={STROKE} strokeLinecap="round" />
    <text x="150" y="298" fontSize="44" fill={COLORS.accent} textAnchor="middle" fontWeight="700">¥1,800万</text>
  </svg>
);

// 枠が復活（循環矢印）
export const RecycleIcon: React.FC<IconProps> = ({ size = 300 }) => (
  <svg viewBox="0 0 260 260" style={box(size)}>
    <path
      d="M60 95 A75 75 0 1 1 55 160"
      fill="none"
      stroke={COLORS.ink}
      strokeWidth={STROKE + 2}
      strokeLinecap="round"
    />
    <path d="M60 95 l-20 -30 l40 -2 Z" fill={COLORS.ink} />
    <text x="130" y="148" fontSize="40" fill={COLORS.accent} textAnchor="middle" fontWeight="700">翌年</text>
    <text x="130" y="188" fontSize="34" fill={COLORS.ink} textAnchor="middle" fontWeight="700">復活</text>
  </svg>
);
