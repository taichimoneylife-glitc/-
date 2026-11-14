import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { A2 } from "./kit2";
import { K } from "./zukaiKit";

// ════════════════════════════════════════════════════════════════════
//  「実際の画面を見せて、押す所を示す」部品（太一のノート版）
//  きっかけは参考④（マーケ博士）の締めだが、見た目は寄せすぎないよう太一の黄色ノートの文法に作り変えた：
//   ・画面はマスキングテープで貼った紙（少し傾く・やわらかい影）
//   ・暗くしない。押す所以外は紙の色で薄くして、押す所を赤ペンの丸がぐるっと囲む（手描きで描かれていく）
//   ・手のカーソルは使わず、手描きの矢印がスッと伸びて指す
//   ・札は付箋（テープつき・少し傾く）、うながしの言葉はマーカー線
// ════════════════════════════════════════════════════════════════════
const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INK = A2.ink, RED = A2.red, PAPER = A2.bg;

const Tape: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 150, rot = -4 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 44, background: "rgba(246,214,120,0.78)", transform: `rotate(${rot}deg)`, boxShadow: "0 2px 4px rgba(0,0,0,0.08)", backgroundImage: "repeating-linear-gradient(90deg, transparent 0 10px, rgba(255,255,255,0.18) 10px 12px)" }} />
);
// 付箋
export const Sticky: React.FC<{ children: React.ReactNode; rot?: number; c?: string; size?: number }> = ({ children, rot = -2, c = "#FFE58A", size = 40 }) => (
  <div style={{ position: "relative", display: "inline-block", background: c, padding: "18px 30px 14px", transform: `rotate(${rot}deg)`, boxShadow: "3px 6px 12px rgba(90,70,20,0.18)", ...K, fontSize: size, color: INK, whiteSpace: "nowrap" }}>
    <div style={{ position: "absolute", left: "50%", top: -18, width: 110, height: 34, marginLeft: -55, background: "rgba(255,255,255,0.6)", transform: "rotate(3deg)" }} />
    {children}
  </div>
);

export type TapCardProps = {
  at: number; until?: number;
  src: string; iw: number; ih: number;
  x: number; y: number; w: number;
  hit: [number, number, number, number]; // 押す所（画像に対する割合）
  dimAt: number;   // 赤丸を描き始める秒
  tapAt: number;   // 矢印が届く秒
  label?: React.ReactNode; labelAt?: number; labelTop?: number; labelLeft?: number;
  call?: React.ReactNode; callAt?: number;
  rot?: number;
};
export const TapCard: React.FC<TapCardProps> = ({ at, until = 999, src, iw, ih, x, y, w, hit, dimAt, tapAt, label, labelAt = tapAt + 0.3, labelTop, labelLeft, call, callAt = tapAt + 1, rot = -1.2 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f >= F(until) + 8) return null;
  const h = w * (ih / iw);
  const inP = interpolate(f, [F(at), F(at) + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.2)) });
  const outP = interpolate(f, [F(until), F(until) + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const fade = interpolate(f, [F(dimAt), F(dimAt) + 8], [0, 1], clamp);
  const ring = interpolate(f, [F(dimAt), F(dimAt) + 12], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const hx = x + hit[0] * w, hy = y + hit[1] * h, hw = hit[2] * w, hh = hit[3] * h;
  const cx = hx + hw / 2, cy = hy + hh / 2, rx = hw / 2 + 34, ry = hh / 2 + 26;
  // 手描きの楕円（少しゆがませて、終わりを重ねる）
  // なめらかな横長の楕円（少しだけ重ねて手で囲んだ感じ。ギザギザなし）
  const N = 160, pts: string[] = [];
  for (let i = 0; i <= N; i++) { const t = i / N; const a = -Math.PI * 0.95 + t * Math.PI * 2.12; const g = 1 + 0.035 * t; pts.push(`${(cx + Math.cos(a) * rx * g).toFixed(1)},${(cy + Math.sin(a) * ry * g).toFixed(1)}`); }
  const LT = labelTop ?? hy + hh + 70, LL = labelLeft ?? hx;
  // 矢印：付箋のほうから押す所へ（ゆるいカーブ）
  const ax0 = LL + 60, ay0 = LT - 6, ax1 = cx - rx * 0.3, ay1 = cy + ry * 0.95;
  const arP = interpolate(f, [F(tapAt) - 8, F(tapAt)], [0, 1], { ...clamp, easing: OUT });
  const mx = (ax0 + ax1) / 2 - 60, my = (ay0 + ay1) / 2 + 10;
  const len = 1.2 * Math.hypot(ax1 - ax0, ay1 - ay0);
  const ang = Math.atan2(ay1 - my, ax1 - mx);
  const lbP = interpolate(f, [F(labelAt), F(labelAt) + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const caW = interpolate(f, [F(callAt) + 4, F(callAt) + 14], [0, 1], { ...clamp, easing: OUT });
  const pulse = f >= F(tapAt) ? 1 + 0.03 * Math.sin((f - F(tapAt)) / 4) : 1;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - outP }}>
      {/* 貼られた紙 */}
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot * inP}deg) translateY(${(1 - inP) * 160}px) scale(${0.85 + 0.15 * inP})`, opacity: Math.min(1, inP * 2), transformOrigin: "50% 0%" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 14px 30px rgba(90,70,20,0.18), 0 2px 0 rgba(0,0,0,0.04)" }}>
          <Img src={staticFile(src)} style={{ width: "100%", height: "100%", display: "block" }} />
          {/* 押す所以外を紙の色で薄く */}
          {fade > 0 ? <div style={{ position: "absolute", left: hit[0] * w, top: hit[1] * h, width: hw, height: hh, borderRadius: 10, boxShadow: `0 0 0 3000px rgba(251,246,216,${0.62 * fade})` }} /> : null}
        </div>
        <Tape x={w / 2 - 75} y={-24} />
      </div>
      {/* 赤ペンの丸 */}
      {ring > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, transform: `scale(${pulse})`, transformOrigin: `${cx}px ${cy}px` }}>
          <polyline points={pts.join(" ")} fill="none" stroke={RED} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: `${1.1 * Math.PI * 2 * Math.sqrt((rx * rx + ry * ry) / 2) * ring} 9999` }} />
        </svg>
      ) : null}
      {/* 手描きの矢印 */}
      {label && arP > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={`M${ax0},${ay0} Q${mx},${my} ${ax1},${ay1}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" style={{ strokeDasharray: `${len * arP} 9999` }} />
          {arP > 0.9 ? <g transform={`translate(${ax1},${ay1}) rotate(${(ang * 180) / Math.PI})`}><polyline points="-26,-14 0,0 -26,14" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></g> : null}
        </svg>
      ) : null}
      {/* 付箋 */}
      {label && lbP > 0 ? <div style={{ position: "absolute", left: LL, top: LT, transform: `scale(${lbP})`, transformOrigin: "20% 0%" }}><Sticky rot={-2}>{label}</Sticky></div> : null}
      {/* うながしの言葉（マーカー線） */}
      {call && f >= F(callAt) ? (
        <div style={{ position: "absolute", left: LL, top: LT + 110, ...K, fontSize: 40, color: INK, whiteSpace: "nowrap", opacity: interpolate(f - F(callAt), [0, 5], [0, 1], clamp), transform: `translateY(${interpolate(f - F(callAt), [0, 8], [20, 0], { ...clamp, easing: OUT })}px)` }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            <span style={{ position: "absolute", left: -8, bottom: 2, height: 26, width: `calc(${caW * 100}% + 16px)`, background: "rgba(255,201,60,0.75)", borderRadius: 8 }} />
            <span style={{ position: "relative" }}>{call}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
};
