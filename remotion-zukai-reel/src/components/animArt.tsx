import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const INK = COLORS.ink;
const GREEN = "#12A150";
const GOLD = "#F6C544";
const RED = COLORS.accent;

// 星条旗（アメリカ＝米国債の文脈イラスト）
export const FlatUSA: React.FC<{ size?: number }> = ({ size = 260 }) => (
  <svg viewBox="0 0 300 210" style={{ width: size, height: (size * 210) / 300 }}>
    <ellipse cx="150" cy="198" rx="120" ry="10" fill="#000" opacity="0.08" />
    <g>
      <rect x="20" y="16" width="260" height="176" rx="10" fill="#fff" stroke={INK} strokeWidth="7" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} x="20" y={16 + i * (176 / 13)} width="260" height={176 / 13} fill={RED} />
      ))}
      <rect x="20" y="16" width="130" height={176 * (7 / 13)} fill="#1B2A6B" />
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 5 }).map((_, c) => (
          <circle key={`${r}-${c}`} cx={38 + c * 24} cy={34 + r * 22} r="4.5" fill="#fff" />
        ))
      )}
      <rect x="20" y="16" width="260" height="176" rx="10" fill="none" stroke={INK} strokeWidth="7" />
    </g>
  </svg>
);

// 家族（子育て世帯）
export const FlatFamily: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg viewBox="0 0 360 240" style={{ width: size, height: (size * 240) / 360 }}>
    <ellipse cx="180" cy="224" rx="150" ry="12" fill="#000" opacity="0.08" />
    {/* 親1 */}
    <g stroke={INK} strokeWidth="7" strokeLinejoin="round">
      <circle cx="96" cy="62" r="34" fill={COLORS.ink} />
      <path d="M46 214 L46 150 C46 116 70 100 96 100 C122 100 146 116 146 150 L146 214 Z" fill={COLORS.ink} />
    </g>
    {/* 親2 */}
    <g stroke={INK} strokeWidth="7" strokeLinejoin="round">
      <circle cx="264" cy="62" r="34" fill={RED} />
      <path d="M214 214 L214 150 C214 116 238 100 264 100 C290 100 314 116 314 150 L314 214 Z" fill={RED} />
    </g>
    {/* 子 */}
    <g stroke={INK} strokeWidth="6" strokeLinejoin="round">
      <circle cx="180" cy="120" r="26" fill={GOLD} />
      <path d="M144 216 L144 174 C144 148 160 138 180 138 C200 138 216 148 216 174 L216 216 Z" fill={GOLD} />
    </g>
  </svg>
);

// カレンダー（計画的）
export const FlatCalendar: React.FC<{ size?: number }> = ({ size = 240 }) => (
  <svg viewBox="0 0 260 250" style={{ width: size, height: (size * 250) / 260 }}>
    <ellipse cx="130" cy="236" rx="110" ry="10" fill="#000" opacity="0.08" />
    <rect x="24" y="40" width="212" height="190" rx="16" fill="#fff" stroke={INK} strokeWidth="7" />
    <rect x="24" y="40" width="212" height="52" rx="16" fill={COLORS.ink} />
    <rect x="66" y="22" width="20" height="44" rx="8" fill={INK} />
    <rect x="174" y="22" width="20" height="44" rx="8" fill={INK} />
    {Array.from({ length: 3 }).map((_, r) =>
      Array.from({ length: 4 }).map((_, c) => (
        <rect key={`${r}-${c}`} x={48 + c * 44} y={110 + r * 38} width="26" height="26" rx="5" fill={COLORS.grayLight} />
      ))
    )}
    {/* チェック */}
    <circle cx="180" cy="186" r="34" fill={GREEN} stroke={INK} strokeWidth="6" />
    <path d="M164 186 L176 198 L198 172" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 安定的に伸びるグラフ（債券＝なめらか右肩上がり＋数値バッジ）※自走アニメ
export const GrowthLine: React.FC<{ size?: number; startFrame?: number; badge?: string; flag?: boolean }> = ({ size = 560, startFrame = 0, badge = "5%", flag = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = 560;
  const H = 360;
  const p = interpolate(f, [startFrame, startFrame + 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pts = [
    [70, 300],
    [160, 276],
    [250, 236],
    [340, 176],
    [430, 108],
    [500, 62],
  ];
  const path = `M${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map((pt, i) => {
    const prev = pts[i];
    const cx = (prev[0] + pt[0]) / 2;
    return `C ${cx} ${prev[1]}, ${cx} ${pt[1]}, ${pt[0]} ${pt[1]}`;
  }).join(" ");
  const areaPath = `${path} L${pts[pts.length - 1][0]} 320 L${pts[0][0]} 320 Z`;
  const badgePop = spring({ frame: f - (startFrame + 40), fps, config: { damping: 12, mass: 0.8, stiffness: 140 } });
  const end = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: size, height: (size * H) / W, overflow: "visible" }}>
      {/* 軸 */}
      <line x1="52" y1="24" x2="52" y2="320" stroke={COLORS.gray} strokeWidth="5" strokeLinecap="round" />
      <line x1="52" y1="320" x2="540" y2="320" stroke={COLORS.gray} strokeWidth="5" strokeLinecap="round" />
      {/* 面 */}
      <path d={areaPath} fill={GREEN} opacity={0.14 * p} />
      {/* 線（描画アニメ） */}
      <path d={path} fill="none" stroke={GREEN} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {/* 端点 */}
      {p > 0.95 && <circle cx={end[0]} cy={end[1]} r="12" fill={GREEN} stroke="#fff" strokeWidth="4" />}
      {/* 数値バッジ */}
      {badgePop > 0.01 && (
        <g transform={`translate(${end[0] + 6} ${end[1] - 66}) scale(${badgePop})`} style={{ transformBox: "fill-box", transformOrigin: "left bottom" } as React.CSSProperties}>
          <rect x="0" y="0" width="118" height="64" rx="14" fill={RED} />
          <text x="59" y="46" fontSize="42" fontWeight="700" fill="#fff" textAnchor="middle">{badge}</text>
        </g>
      )}
      {/* 米国旗（任意） */}
      {flag && (
        <g transform="translate(60 20)">
          <rect x="0" y="0" width="70" height="46" rx="4" fill="#fff" stroke={INK} strokeWidth="4" />
          {[0, 2, 4, 6].map((i) => (
            <rect key={i} x="0" y={i * (46 / 7)} width="70" height={46 / 7} fill={RED} />
          ))}
          <rect x="0" y="0" width="34" height={46 * (4 / 7)} fill="#1B2A6B" />
        </g>
      )}
    </svg>
  );
};

// 数字カウントアップ
export const CountUp: React.FC<{ to: number; startFrame?: number; dur?: number; decimals?: number; prefix?: string; suffix?: string; style?: React.CSSProperties }> = ({ to, startFrame = 0, dur = 40, decimals = 0, prefix = "", suffix = "", style }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [startFrame, startFrame + dur], [0, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <span style={style}>{prefix}{v.toFixed(decimals)}{suffix}</span>;
};
