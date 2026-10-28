import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { A2 } from "./kit2";
import { B } from "../MileLifePlan";

// 参考リール（マーケ博士）の動きを部品にしたもの
//  Camera：画面全体を1枚の大きな紙として、寄る・横に流れる（3〜8フレームの速い動き＋動きの間だけ少しぶれる）
//  Spot：画面を暗くして、注目の所だけ明るく残す（黄色の枠）
//  Callout：点 → 線が伸びる → 箱が「うっすら大きめ」から「くっきり」に縮んで止まる
//  SpeedLines：場面が変わる瞬間の集中線

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SNAP = Easing.bezier(0.7, 0, 0.18, 1); // 最初ためて、一気に動いて、ピタッと止まる

export type CamKey = { t: number; x: number; y: number; s: number; d?: number }; // x,y＝画面の中心に来る点（元の座標）, s＝倍率, d＝動く長さ（フレーム）
export const camAt = (f: number, keys: CamKey[]) => {
  let x = 540, y = 960, s = 1, v = 0;
  for (const k of keys) {
    const A = F(k.t), d = k.d ?? 8;
    if (f < A) break;
    const p = interpolate(f, [A, A + d], [0, 1], { ...clamp, easing: SNAP });
    const dp = interpolate(f, [A, A + d / 2, A + d], [0, 1, 0], clamp);
    v = Math.max(v, dp * (Math.abs(k.x - x) + Math.abs(k.y - y) + Math.abs(k.s - s) * 600));
    x += (k.x - x) * p; y += (k.y - y) * p; s += (k.s - s) * p;
  }
  return { x, y, s, blur: Math.min(7, v / 90) };
};
export const Camera: React.FC<{ keys: CamKey[]; children: React.ReactNode }> = ({ keys, children }) => {
  const f = useCurrentFrame();
  const c = camAt(f, keys);
  return (
    <AbsoluteFill style={{ transform: `translate(${540 - c.x * c.s}px, ${960 - c.y * c.s}px) scale(${c.s})`, transformOrigin: "0 0", filter: c.blur > 0.4 ? `blur(${c.blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

// 注目の所だけ明るく（rect＝[x, y, w, h]、元の座標）。Spotより後に置いたものは暗くならない
export const Spot: React.FC<{ at: number; until?: number; rect: [number, number, number, number]; r?: number; dim?: number; color?: string; frame?: boolean }> = ({ at, until = 9999, rect, r = 22, dim = 0.58, color = "#FFC93C", frame = true }) => {
  const f = useCurrentFrame();
  const A = F(at), Z = F(until);
  if (f < A || f >= Z + 5) return null;
  const p = interpolate(f, [A, A + 4], [0, 1], clamp) * (1 - interpolate(f, [Z, Z + 5], [0, 1], clamp));
  const [x, y, w, h] = rect;
  const pulse = 1 + 0.012 * Math.sin((f - A) / 5);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, boxShadow: `0 0 0 6000px rgba(28,28,44,${dim * p})`, pointerEvents: "none" }}>
      {frame ? <div style={{ position: "absolute", inset: -8, borderRadius: r + 6, border: `8px solid ${color}`, boxShadow: `0 0 26px ${color}AA`, opacity: p, transform: `scale(${interpolate(f - A, [0, 4], [1.08, 1], clamp) * pulse})` }} /> : null}
    </div>
  );
};

// うっすら大きめ → くっきり（参考リールの出方）
export const ghostIn = (f: number, A: number) => ({
  opacity: interpolate(f - A, [0, 2, 4], [0, 0.45, 1], clamp),
  transform: `scale(${interpolate(f - A, [0, 2, 4, 7], [1.12, 1.08, 0.97, 1], clamp)})`,
});

// 引き出し線つきの説明の箱
export const BOX: React.CSSProperties = { background: "#fff", border: `5px solid ${A2.ink}`, borderRadius: 20, boxShadow: `7px 8px 0 ${A2.ink}`, padding: "14px 30px", textAlign: "center", ...B, color: A2.ink, lineHeight: 1.3, whiteSpace: "nowrap" };
export const Callout: React.FC<{ at: number; from: [number, number]; to: [number, number]; children: React.ReactNode; size?: number; bg?: string; until?: number }> = ({ at, from, to, children, size = 40, bg = "#fff", until = 9999 }) => {
  const f = useCurrentFrame();
  const A = F(at), Z = F(until);
  if (f < A || f >= Z + 4) return null;
  const line = interpolate(f, [A + 1, A + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const o = 1 - interpolate(f, [Z, Z + 4], [0, 1], clamp);
  const [x0, y0] = from, [x1, y1] = to;
  const g = ghostIn(f, A + 4);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={x0} y1={y0} x2={x0 + (x1 - x0) * line} y2={y0 + (y1 - y0) * line} stroke={A2.ink} strokeWidth={5} strokeLinecap="round" />
        <circle cx={x0} cy={y0} r={11 * interpolate(f - A, [0, 3], [0, 1], clamp)} fill="#FFC93C" stroke={A2.ink} strokeWidth={4} />
      </svg>
      {f >= A + 4 ? (
        <div style={{ position: "absolute", left: x1, top: y1, transform: "translate(-50%, -50%)" }}>
          <div style={{ ...BOX, background: bg, fontSize: size, ...g }}>{children}</div>
        </div>
      ) : null}
    </div>
  );
};

// 場面が変わる瞬間の集中線
export const SpeedLines: React.FC<{ at: number; dur?: number; color?: string }> = ({ at, dur = 12, color = "rgba(46,44,38,0.28)" }) => {
  const f = useCurrentFrame();
  const A = F(at);
  if (f < A || f > A + dur) return null;
  const p = (f - A) / dur;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - p }}>
      {Array.from({ length: 44 }).map((_, i) => {
        const a = (i / 44) * Math.PI * 2 + (i % 3) * 0.03;
        const r0 = 560 - p * 200 + (i % 4) * 60, r1 = 1300;
        return <line key={i} x1={540 + Math.cos(a) * r0} y1={960 + Math.sin(a) * r0} x2={540 + Math.cos(a) * r1} y2={960 + Math.sin(a) * r1} stroke={color} strokeWidth={4 + (i % 3) * 3} strokeLinecap="round" />;
      })}
    </svg>
  );
};
