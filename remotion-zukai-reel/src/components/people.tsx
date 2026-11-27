import React from "react";
import { COLORS } from "../theme";

// ── フラットな人物イラスト（自作SVG・ライセンスフリー） ──
// ※もっとリッチにしたい場合は、undraw(undraw.co / MIT) や いらすとや 等の
//   無料素材を public/ に置いて <Img> で差し込むこともできます。

const SKIN = "#F3C9A5";
const HAIR = COLORS.ink;

type P = { size?: number; shirt?: string };
const box = (s: number): React.CSSProperties => ({ width: s, height: s * 1.3, overflow: "visible" });

// 考えている人（手を顎に）
export const PersonThinking: React.FC<P> = ({ size = 180, shirt = COLORS.accent }) => (
  <svg viewBox="0 0 200 260" style={box(size)}>
    {/* body */}
    <path d="M40 260 v-40 a60 60 0 0 1 120 0 v40 Z" fill={shirt} />
    {/* neck */}
    <rect x="86" y="150" width="28" height="30" fill={SKIN} />
    {/* head */}
    <circle cx="100" cy="110" r="52" fill={SKIN} />
    {/* hair */}
    <path d="M50 104 a50 50 0 0 1 100 0 q-50 -34 -100 0 Z" fill={HAIR} />
    {/* eyes + mouth */}
    <circle cx="82" cy="112" r="5" fill={COLORS.ink} />
    <circle cx="118" cy="112" r="5" fill={COLORS.ink} />
    <path d="M88 134 q12 8 24 0" fill="none" stroke={COLORS.ink} strokeWidth="4" strokeLinecap="round" />
    {/* thinking hand */}
    <circle cx="126" cy="150" r="14" fill={SKIN} />
    {/* thought dots */}
    <circle cx="160" cy="70" r="6" fill={COLORS.ink} opacity="0.5" />
    <circle cx="176" cy="52" r="9" fill={COLORS.ink} opacity="0.5" />
  </svg>
);

// 喜ぶ人（バンザイ）
export const PersonCheer: React.FC<P> = ({ size = 180, shirt = "#2E7CF6" }) => (
  <svg viewBox="0 0 200 260" style={box(size)}>
    {/* arms up */}
    <path d="M55 200 L20 120" stroke={SKIN} strokeWidth="18" strokeLinecap="round" />
    <path d="M145 200 L180 120" stroke={SKIN} strokeWidth="18" strokeLinecap="round" />
    {/* body */}
    <path d="M45 260 v-46 a55 55 0 0 1 110 0 v46 Z" fill={shirt} />
    <rect x="86" y="150" width="28" height="30" fill={SKIN} />
    {/* head */}
    <circle cx="100" cy="110" r="52" fill={SKIN} />
    <path d="M50 104 a50 50 0 0 1 100 0 q-50 -34 -100 0 Z" fill={HAIR} />
    <path d="M76 108 q6 -8 14 0" fill="none" stroke={COLORS.ink} strokeWidth="4" strokeLinecap="round" />
    <path d="M110 108 q6 -8 14 0" fill="none" stroke={COLORS.ink} strokeWidth="4" strokeLinecap="round" />
    <path d="M84 130 q16 16 32 0" fill="none" stroke={COLORS.ink} strokeWidth="5" strokeLinecap="round" />
    {/* sparkles */}
    <text x="18" y="96" fontSize="26" fill={COLORS.accent}>✦</text>
    <text x="176" y="96" fontSize="26" fill={COLORS.accent}>✦</text>
  </svg>
);
