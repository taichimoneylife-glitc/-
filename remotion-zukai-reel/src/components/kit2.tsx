import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { FONT } from "./font";
import { PopIn, Float, CountUp } from "./kit";

// ── 参考動画Aのデザインシステム（クリーム＋丸ゴシック＋やわらかカード）──
export const A2 = {
  bg: "#FBF3D0",
  ink: "#2E2C26",
  sub: "#8C8471",
  green: "#2E9E6B",
  greenHead: "#38A870",
  coral: "#EF7D57",
  red: "#E8553B",
  marker: "#FCE07A",
  bar: "#DCD8CC",
  track: "#EFE6C2",
  card: "#FFFFFF",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 背景：クリーム＋右上のやわらかい丸い陽だまり
export const BG2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: A2.bg, fontFamily: FONT, color: A2.ink }}>
    <div style={{ position: "absolute", width: 720, height: 720, right: -150, top: -180, borderRadius: "50%", background: "radial-gradient(circle, rgba(252,231,160,0.9) 0%, rgba(252,231,160,0) 70%)" }} />
    {children}
  </AbsoluteFill>
);

// 見出し（丸ゴシック極太・チャコール）。中央寄せ絶対配置。
export const Head: React.FC<{ delay: number; top: number; size?: number; children: React.ReactNode }> = ({ delay, top, size = 74, children }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [delay, delay + 12], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 60, top, width: 960, textAlign: "center", opacity: s, transform: `translateY(${(1 - s) * 24}px)`, fontSize: size, fontWeight: 800, lineHeight: 1.28, letterSpacing: 0.5 }}>{children}</div>
  );
};

// マーカー蛍光（左→右）
export const Mark2: React.FC<{ delay: number; color?: string; children: React.ReactNode }> = ({ delay, color = A2.marker, children }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [delay, delay + 9], [0, 100], clamp);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ position: "absolute", left: -8, right: `${100 - w}%`, bottom: "6%", top: "46%", background: color, borderRadius: 8, zIndex: 0 }} />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};

// やわらかカード（白・角丸・影／任意で色ヘッダー）
export const Card2: React.FC<{ delay: number; top: number; left?: number; width?: number; header?: string; headColor?: string; children: React.ReactNode }> = ({ delay, top, left = 80, width = 920, header, headColor = A2.green, children }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width }}>
    <div style={{ background: "#fff", borderRadius: 30, boxShadow: "0 16px 38px rgba(80,60,20,0.13)", overflow: "hidden" }}>
      {header ? <div style={{ background: headColor, color: "#fff", fontWeight: 800, fontSize: 40, padding: "22px 32px" }}>{header}</div> : null}
      <div style={{ padding: "22px 30px" }}>{children}</div>
    </div>
  </PopIn>
);

// カード内の行（ラベル＋値 or プレースホルダ棒、ハイライト可）
export const Row2: React.FC<{ label: string; value?: React.ReactNode; highlight?: boolean; valueColor?: string; badge?: React.ReactNode }> = ({ label, value, highlight, valueColor = A2.ink, badge }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 16px", borderRadius: 16, background: highlight ? A2.marker : "transparent", position: "relative", marginBottom: 6 }}>
    <div style={{ width: 250, fontSize: 38, fontWeight: 700, color: highlight ? A2.ink : A2.sub }}>{label}</div>
    {value !== undefined ? <div style={{ flex: 1, fontSize: 46, fontWeight: 800, color: valueColor }}>{value}</div> : <div style={{ flex: 1, height: 22, borderRadius: 11, background: A2.bar }} />}
    {badge}
  </div>
);

// 横ゲージバー（0→pct%まで伸びる・端にラベル・つまみ付き）＝参考A_9
export const Gauge: React.FC<{ delay: number; pct: number; top: number; left?: number; width?: number; color?: string; minLabel?: string; maxLabel?: string; dur?: number }> = ({ delay, pct, top, left = 60, width = 960, color = A2.green, minLabel, maxLabel, dur = 30 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, pct], clamp);
  return (
    <div style={{ position: "absolute", left, top, width }}>
      <div style={{ height: 46, borderRadius: 999, background: A2.track, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${p}%`, background: color, borderRadius: 999 }} />
        <div style={{ position: "absolute", left: `calc(${p}% - 19px)`, top: -5, width: 36, height: 36, borderRadius: "50%", background: "#fff", border: `5px solid ${color}`, boxSizing: "border-box" }} />
      </div>
      {(minLabel || maxLabel) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 28, fontWeight: 700, color: A2.sub }}>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
};

// 大きい数字（カウントアップ）
export const Big: React.FC<{ delay: number; to: number; suffix?: string; prefix?: string; color?: string; size?: number; dur?: number }> = ({ delay, to, suffix, prefix, color = A2.green, size = 150, dur = 24 }) => (
  <span style={{ fontSize: size, fontWeight: 800, color, letterSpacing: 1 }}>
    <CountUp delay={delay} to={to} dur={dur} prefix={prefix} suffix={suffix} />
  </span>
);

// タグ（要注意・税 など）
export const Tag: React.FC<{ delay: number; text: string; color?: string; style?: React.CSSProperties }> = ({ delay, text, color = A2.coral, style }) => (
  <PopIn delay={delay} style={style}>
    <div style={{ background: color, color: "#fff", fontWeight: 800, fontSize: 30, padding: "8px 22px", borderRadius: 14 }}>{text}</div>
  </PopIn>
);

// 丸いキャラ（白い円の中に人物）＝参考Aのキャラ枠
export const CharaCircle: React.FC<{ size?: number; col?: string; delay?: number; style?: React.CSSProperties }> = ({ size = 240, col = A2.green, delay = 0, style }) => {
  const skin = "#FCE0C4", hair = "#5B4436", ink = "#3E3A33";
  return (
    <Float delay={delay} amp={7} style={style}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: "#fff", boxShadow: "0 10px 26px rgba(80,60,20,0.12)", overflow: "hidden", position: "relative" }}>
        <svg viewBox="0 0 200 200" width={size} height={size} style={{ position: "absolute", left: 0, top: 8 }}>
          <path d="M36 208 C36 150 64 126 100 126 C136 126 164 150 164 208 Z" fill={col} stroke={ink} strokeWidth="5" strokeLinejoin="round" />
          <rect x="88" y="98" width="24" height="30" fill={skin} />
          <circle cx="100" cy="76" r="46" fill={skin} stroke={ink} strokeWidth="5" />
          <path d="M54 74 C54 34 84 26 100 26 C116 26 146 34 146 74 C146 58 134 48 100 48 C66 48 54 58 54 74 Z" fill={hair} />
          <circle cx="100" cy="24" r="13" fill={hair} />
          <circle cx="84" cy="78" r="5" fill={ink} />
          <circle cx="116" cy="78" r="5" fill={ink} />
          <path d="M89 92 Q100 101 111 92" fill="none" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="72" cy="90" r="7.5" fill="#F6B7A6" opacity="0.7" />
          <circle cx="128" cy="90" r="7.5" fill="#F6B7A6" opacity="0.7" />
        </svg>
      </div>
    </Float>
  );
};

// 下向き太矢印（描画アニメ）
export const ArrowDown: React.FC<{ delay: number; x: number; y: number; len?: number; color?: string }> = ({ delay, x, y, len = 90, color = A2.coral }) => {
  const f = useCurrentFrame();
  const g = interpolate(f, [delay, delay + 12], [0, 1], clamp);
  return (
    <svg width="120" height={len + 50} style={{ position: "absolute", left: x - 60, top: y }}>
      <line x1="60" y1="0" x2="60" y2={len * g} stroke={color} strokeWidth="12" strokeLinecap="round" />
      {g > 0.9 && <path d={`M40 ${len - 8} L60 ${len + 16} L80 ${len - 8}`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};
