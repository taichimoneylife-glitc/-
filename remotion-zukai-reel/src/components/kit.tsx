import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT } from "./font";

// ── 白背景・音声同期リール用の共通キット ──
export const CC = {
  ink: "#1B2A4A",
  gray: "#6C7A93",
  green: "#12A150",
  red: "#E5432B",
  gold: "#C79A17",
  line: "#E2E6EE",
  chip: "#EEF1F6",
  white: "#FFFFFF",
};

export const WhiteBG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: CC.white, fontFamily: FONT, color: CC.ink }}>{children}</AbsoluteFill>
);

const useSpring01 = (delay: number, dur: number, cfg: Parameters<typeof spring>[0]["config"]) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};

// テキストが下からフワッと
export const Appear: React.FC<{ delay: number; y?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, y = 40, style, children }) => {
  const s = useSpring01(delay, 20, { damping: 200 });
  return <div style={{ opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * y}px)`, ...style }}>{children}</div>;
};

// 箱/バッジ/イラストがポップ（少し弾んで）
export const PopIn: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useSpring01(delay, 22, { damping: 12, stiffness: 130, mass: 0.9 });
  return <div style={{ opacity: Math.min(1, s * 1.8), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};

// 左右からスライドイン（比較用）
export const SlideIn: React.FC<{ delay: number; from: "left" | "right"; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, from, style, children }) => {
  const s = useSpring01(delay, 22, { damping: 18 });
  const dir = from === "left" ? -1 : 1;
  return <div style={{ opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 140 * dir}px)`, ...style }}>{children}</div>;
};

// 数字カウントアップ
export const CountUp: React.FC<{ delay: number; to: number; dur?: number; prefix?: string; suffix?: string; style?: React.CSSProperties }> = ({ delay, to, dur = 22, prefix = "", suffix = "", style }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [delay, delay + dur], [0, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <span style={style}>
      {prefix}
      {Math.round(v).toLocaleString()}
      {suffix}
    </span>
  );
};

// ✓ / × / △ の丸バッジ
export const Mark: React.FC<{ delay: number; type: "check" | "cross" | "tri"; size?: number; style?: React.CSSProperties }> = ({ delay, type, size = 64, style }) => {
  const bg = type === "check" ? CC.green : type === "cross" ? CC.red : CC.gold;
  const ch = type === "check" ? "✓" : type === "cross" ? "×" : "△";
  return (
    <PopIn delay={delay} style={style}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color: "#fff", fontSize: size * 0.56, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #fff", boxShadow: "0 4px 14px rgba(27,42,74,0.18)" }}>{ch}</div>
    </PopIn>
  );
};

// 見出しチップ（赤い縦線＋枠）
export const HeadChip: React.FC<{ delay: number; title: string; top?: number; size?: number }> = ({ delay, title, top = 210, size = 60 }) => (
  <Appear delay={delay} style={{ position: "absolute", left: 0, top, width: 1080, display: "flex", justifyContent: "center" }}>
    <div style={{ border: `5px solid ${CC.ink}`, borderRadius: 18, background: "#fff", padding: "20px 34px", display: "inline-flex", alignItems: "center", gap: 18, maxWidth: 1000, boxShadow: "0 6px 20px rgba(27,42,74,0.06)" }}>
      <div style={{ width: 11, height: 52, background: CC.red, borderRadius: 4, flexShrink: 0 }} />
      <div style={{ fontSize: size, fontWeight: 700, color: CC.ink, lineHeight: 1.2, whiteSpace: "nowrap" }}>{title}</div>
    </div>
  </Appear>
);

// 中央寄せの絶対配置ヘルパ
export const Center: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", left: 40, top, width: 1000, textAlign: "center", ...style }}>{children}</div>
);

// 線を引くアニメ（矢印・つなぎ）。dur内で描画。
export const DrawLine: React.FC<{ d: string; delay: number; dur?: number; color?: string; w?: number }> = ({ d, delay, dur = 18, color = CC.ink, w = 6 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />;
};

// 常時ゆっくり浮遊（出て止まる感をなくす）＋登場
export const Float: React.FC<{ delay?: number; amp?: number; speed?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay = 0, amp = 12, speed = 1, style, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 12, stiffness: 120, mass: 0.9 }, durationInFrames: 24 });
  const bob = Math.sin(((f - delay) / fps) * 2 * Math.PI * 0.3 * speed) * amp;
  return <div style={{ opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 28 + bob}px) scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};

// シーンの入り／終わりをふわっと（軽い場面転換）
export const SceneFade: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(
    interpolate(f, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(f, [dur - 9, dur - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  const rise = interpolate(f, [0, 10], [18, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${rise}px)` }}>{children}</AbsoluteFill>;
};

// 縦グラフの1本の棒（下から伸びる）
export const GrowBar: React.FC<{ cx: number; baseline: number; height: number; width: number; color: string; delay: number; dur?: number; radiusTop?: boolean }> = ({ cx, baseline, height, width, color, delay, dur = 26, radiusTop = true }) => {
  const f = useCurrentFrame();
  const g = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const h = height * g;
  return (
    <div style={{ position: "absolute", left: cx - width / 2, top: baseline - h, width, height: h, background: color, border: `4px solid ${CC.ink}`, borderBottom: "none", borderTopLeftRadius: radiusTop ? 12 : 0, borderTopRightRadius: radiusTop ? 12 : 0, boxSizing: "border-box" }} />
  );
};
