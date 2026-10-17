import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { FONT, FONT_BLACK } from "./font";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// キラッ：中心から放射状の線が広がって消える（決めの瞬間に重ねる）
export const Burst: React.FC<{ x: number; y: number; at: number; r?: number; color?: string; n?: number }> = ({ x, y, at, r = 120, color = "#E9B82E", n = 12 }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 14) return null;
  const p = interpolate(f - at, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (360 / n) * i + (i % 2) * 8;
        const len = (i % 2 ? 26 : 44) * (1 - p) + 6;
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: -3, width: len, height: 7, borderRadius: 4, background: color, opacity: 1 - p, transformOrigin: "0 50%", transform: `rotate(${a}deg) translateX(${r * (0.55 + 0.6 * p)}px)` }} />
        );
      })}
    </div>
  );
};

// 章プレート：色の丸がワイプで広がり、大きな文字が1字ずつぼかしから浮かぶ
export type PlateLine = { t: number; text: string; size?: number; color?: string; underline?: boolean };
export const Plate: React.FC<{ a: number; b: number; num: string; lines: PlateLine[]; bg?: string; ink?: string; ox?: number; oy?: number }> = ({ a, b, num, lines, bg = "#F6D64A", ink = "#2E2C26", ox = 540, oy = 960 }) => {
  const f = useCurrentFrame();
  if (f < a || f >= b) return null;
  const R = interpolate(f, [a, a + 9], [0, 2300], { ...clamp, easing: Easing.out(Easing.cubic) });
  const o = interpolate(f, [b - 8, b], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${R}px at ${ox}px ${oy}px)`, opacity: 1 - o, filter: `blur(${o * 12}px)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #FBE68A 0%, ${bg} 60%)` }} />
      <div style={{ position: "absolute", left: 80, top: 300, right: 80, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: 800, fontSize: 30, color: ink, opacity: 0.55, letterSpacing: 2 }}>
        <span>{num}</span>
        <span>MILE</span>
      </div>
      <div style={{ position: "absolute", left: 80, top: 345, width: 920, height: 3, background: ink, opacity: 0.25 }} />
      <div style={{ position: "absolute", left: 80, top: 640, right: 60 }}>
        {lines.map((ln, li) => (
          <div key={li}><div style={{ position: "relative", display: "inline-block", fontFamily: FONT_BLACK, fontWeight: 900, fontSize: ln.size ?? 150, lineHeight: 1.2, color: ln.color ?? ink, whiteSpace: "nowrap" }}>
            {Array.from(ln.text).map((ch, i) => {
              const s = ln.t + i * 2;
              const k = interpolate(f, [s, s + 7], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
              return <span key={i} style={{ display: "inline-block", opacity: k, filter: `blur(${(1 - k) * 14}px)`, transform: `translateY(${(1 - k) * 30}px) scale(${1.15 - 0.15 * k})` }}>{ch}</span>;
            })}
            {ln.underline ? (
              <div style={{ position: "absolute", left: 0, bottom: -8, height: 12, borderRadius: 6, background: ink, width: `${interpolate(f, [ln.t + ln.text.length * 2, ln.t + ln.text.length * 2 + 8], [0, 100], clamp)}%` }} />
            ) : null}
          </div></div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
