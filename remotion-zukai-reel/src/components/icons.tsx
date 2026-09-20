import React from "react";
import { COLORS, STROKE } from "../theme";

// ── フラットな線画アイコン集 ──
// どれもネイビーの線＋一部を赤/グレーで塗る、図解リールの定番スタイル。

type IconProps = { size?: number };

const svgBase = (size: number): React.CSSProperties => ({
  width: size,
  height: size,
  overflow: "visible",
});

// スマホ（カートに入れる画面）
export const PhoneIcon: React.FC<IconProps> = ({ size = 300 }) => (
  <svg viewBox="0 0 200 340" style={svgBase(size)}>
    <rect
      x="30"
      y="10"
      width="140"
      height="320"
      rx="24"
      fill={COLORS.white}
      stroke={COLORS.ink}
      strokeWidth={STROKE}
    />
    <line
      x1="80"
      y1="34"
      x2="120"
      y2="34"
      stroke={COLORS.ink}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
    {/* 商品画像枠 */}
    <rect x="58" y="70" width="84" height="84" rx="8" fill={COLORS.grayLight} />
    <path
      d="M84 96 l-12 10 v34 h56 v-34 l-12 -10 -8 8 h-16 z"
      fill={COLORS.gray}
      stroke={COLORS.ink}
      strokeWidth="4"
      strokeLinejoin="round"
    />
    {/* テキスト行 */}
    <line x1="58" y1="176" x2="142" y2="176" stroke={COLORS.gray} strokeWidth="8" strokeLinecap="round" />
    <line x1="58" y1="198" x2="116" y2="198" stroke={COLORS.gray} strokeWidth="8" strokeLinecap="round" />
    {/* カートへボタン */}
    <rect x="58" y="228" width="84" height="40" rx="20" fill={COLORS.accent} />
    <text x="100" y="255" fontSize="20" fill={COLORS.white} textAnchor="middle" fontWeight="700">
      カートへ
    </text>
  </svg>
);

// 値札（¥3,000 → ¥1,500）
export const PriceTagIcon: React.FC<IconProps> = ({ size = 320 }) => (
  <svg viewBox="0 0 360 260" style={svgBase(size)}>
    <path
      d="M40 40 L210 40 L330 130 L210 220 L40 220 Z"
      fill={COLORS.white}
      stroke={COLORS.ink}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
    <circle cx="80" cy="130" r="16" fill="none" stroke={COLORS.ink} strokeWidth={STROKE} />
    {/* 元値（取り消し線） */}
    <text x="130" y="118" fontSize="46" fill={COLORS.ink} fontWeight="700">
      ¥3,000
    </text>
    <line x1="126" y1="103" x2="300" y2="103" stroke={COLORS.accent} strokeWidth="7" strokeLinecap="round" />
    {/* セール価格 */}
    <text x="130" y="185" fontSize="58" fill={COLORS.accent} fontWeight="700">
      ¥1,500
    </text>
  </svg>
);

// 買い物カゴ / カート
export const CartIcon: React.FC<IconProps> = ({ size = 320 }) => (
  <svg viewBox="0 0 320 300" style={svgBase(size)}>
    {/* カゴの中身 */}
    <rect x="120" y="60" width="46" height="70" rx="6" fill={COLORS.grayLight} stroke={COLORS.ink} strokeWidth="4" />
    <rect x="170" y="40" width="40" height="90" rx="6" fill={COLORS.gray} stroke={COLORS.ink} strokeWidth="4" />
    <circle cx="235" cy="95" r="22" fill={COLORS.grayLight} stroke={COLORS.ink} strokeWidth="4" />
    {/* カート本体 */}
    <path
      d="M40 70 L80 70 L110 190 L250 190 L280 100 L95 100"
      fill="none"
      stroke={COLORS.ink}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="100" y1="150" x2="270" y2="150" stroke={COLORS.ink} strokeWidth="4" />
    <line x1="140" y1="100" x2="150" y2="190" stroke={COLORS.ink} strokeWidth="4" />
    <line x1="190" y1="100" x2="195" y2="190" stroke={COLORS.ink} strokeWidth="4" />
    <line x1="240" y1="100" x2="240" y2="190" stroke={COLORS.ink} strokeWidth="4" />
    <circle cx="130" cy="235" r="20" fill={COLORS.white} stroke={COLORS.ink} strokeWidth={STROKE} />
    <circle cx="230" cy="235" r="20" fill={COLORS.white} stroke={COLORS.ink} strokeWidth={STROKE} />
  </svg>
);

// 疲れた顔（ストレス）＋ 月
export const SleepyFaceIcon: React.FC<IconProps> = ({ size = 280 }) => (
  <svg viewBox="0 0 280 260" style={svgBase(size)}>
    {/* 月 */}
    <path
      d="M70 40 a34 34 0 1 0 30 52 a26 26 0 1 1 -30 -52 Z"
      fill={COLORS.gray}
      stroke={COLORS.ink}
      strokeWidth="4"
    />
    <text x="150" y="55" fontSize="40" fill={COLORS.ink}>+</text>
    <text x="40" y="130" fontSize="40" fill={COLORS.ink}>+</text>
    {/* 顔 */}
    <circle cx="150" cy="170" r="66" fill={COLORS.white} stroke={COLORS.ink} strokeWidth={STROKE} />
    <path d="M120 140 q30 -18 40 6" fill={COLORS.ink} />
    <path d="M112 168 q10 8 20 0" fill="none" stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M168 168 q10 8 20 0" fill="none" stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M138 200 q12 -8 24 0" fill="none" stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round" />
    {/* 汗 */}
    <path d="M205 150 q10 16 0 24 q-10 -8 0 -24 Z" fill={COLORS.grayLight} stroke={COLORS.ink} strokeWidth="3" />
  </svg>
);

// コイン（お金）
export const CoinIcon: React.FC<IconProps> = ({ size = 260 }) => (
  <svg viewBox="0 0 260 260" style={svgBase(size)}>
    <circle cx="130" cy="130" r="96" fill={COLORS.white} stroke={COLORS.ink} strokeWidth={STROKE} />
    <circle cx="130" cy="130" r="72" fill="none" stroke={COLORS.gray} strokeWidth="6" />
    <text
      x="130"
      y="165"
      fontSize="110"
      fill={COLORS.accent}
      textAnchor="middle"
      fontWeight="700"
    >
      ¥
    </text>
  </svg>
);
