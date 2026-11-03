import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { A2 } from "./kit2";
import { K } from "./zukaiKit";

// ════════════════════════════════════════════════════════════════════
//  参考④（マーケ博士・Claudeの4つのモデル）の最後を部品にしたもの
//  実際の画面（プロフィールなど）を枠つきのカードで出す → 画面ぜんたいを暗くして、押す所だけ明るく＋赤い枠
//  → 指のカーソルが入ってきてタップ（波紋）→ 押す所から点線を下ろして札「プロフィールのURLから」→ 黄色い札で行動をうながす
// ════════════════════════════════════════════════════════════════════
const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INK = A2.ink, RED = A2.red;

// 指のカーソル（白い手袋）
export const Hand: React.FC<{ s?: number; press?: number }> = ({ s = 130, press = 0 }) => (
  <svg width={s} height={s * 1.2} viewBox="0 0 100 120" style={{ transform: `scale(${1 - 0.1 * press})`, transformOrigin: "30% 10%", filter: "drop-shadow(3px 4px 0 rgba(0,0,0,0.25))" }}>
    <path d="M30 8 a9 9 0 0 1 18 0 V52 h3 V40 a8 8 0 0 1 16 0 V56 h2 V46 a8 8 0 0 1 16 0 V60 h1 V54 a7 7 0 0 1 14 0 V84 c0 18 -12 30 -30 30 H52 c-12 0 -20 -6 -26 -16 L8 70 a8 8 0 0 1 12 -10 l10 10 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M48 52 V64 M67 56 V66 M85 60 V68" stroke={INK} strokeWidth={4} strokeLinecap="round" />
  </svg>
);

export type TapCardProps = {
  at: number;          // カードが出る秒
  until?: number;      // 消える秒
  src: string;         // public/ からの画像のパス
  iw: number; ih: number; // 画像の元の大きさ
  x: number; y: number; w: number; // カードの位置と幅
  hit: [number, number, number, number]; // 押す所（画像に対する割合 x, y, w, h）
  dimAt: number;       // 暗くする秒
  tapAt: number;       // タップする秒
  label?: React.ReactNode; labelAt?: number; // 押す所の下に出る白い札
  call?: React.ReactNode; callAt?: number;   // 黄色い札（行動をうながす）
  labelTop?: number;   // 白い札の上の位置（なければ押す所のすぐ下）
};
export const TapCard: React.FC<TapCardProps> = ({ at, until = 999, src, iw, ih, x, y, w, hit, dimAt, tapAt, label, labelAt = tapAt + 0.3, call, callAt = tapAt + 1, labelTop }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f >= F(until) + 8) return null;
  const h = w * (ih / iw);
  const inP = interpolate(f, [F(at), F(at) + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const outP = interpolate(f, [F(until), F(until) + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const dim = interpolate(f, [F(dimAt), F(dimAt) + 6], [0, 1], clamp) * (1 - outP);
  const hx = x + hit[0] * w, hy = y + hit[1] * h, hw = hit[2] * w, hh = hit[3] * h;
  // 指：右下から入ってきて、押す所でタップ
  const hIn = interpolate(f, [F(dimAt), F(tapAt)], [0, 1], { ...clamp, easing: OUT });
  const press = interpolate(f - F(tapAt), [0, 3, 7], [0, 1, 0], clamp);
  const tx = hx + hw * 0.62, ty = hy + hh * 0.5;
  const rip = f - F(tapAt);
  const lbP = interpolate(f, [F(labelAt), F(labelAt) + 8], [0, 1], { ...clamp, easing: OUT });
  const LT = labelTop ?? hy + hh + 50;
  const caP = interpolate(f - F(callAt), [0, 4, 7], [0, 1.12, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - outP }}>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 28, overflow: "hidden", background: "#fff", border: `6px solid ${INK}`, boxShadow: `10px 12px 0 ${INK}`, transform: `scale(${0.7 + 0.3 * inP}) translateY(${(1 - inP) * 120}px)`, opacity: Math.min(1, inP * 2) }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>
      {/* 押す所以外を暗く */}
      {dim > 0 ? <div style={{ position: "absolute", left: hx, top: hy, width: hw, height: hh, borderRadius: 14, boxShadow: `0 0 0 4000px rgba(30,32,44,${0.55 * dim})`, border: `5px solid ${RED}`, opacity: 1 }} /> : null}
      {/* 波紋 */}
      {rip > 0 && rip < 18 ? <div style={{ position: "absolute", left: tx - 50, top: ty - 50, width: 100, height: 100, borderRadius: "50%", border: `6px solid #F2B33D`, transform: `scale(${0.4 + rip / 9})`, opacity: 1 - rip / 18 }} /> : null}
      {f >= F(dimAt) ? <div style={{ position: "absolute", left: tx - 30 + (1 - hIn) * 260, top: ty - 6 + (1 - hIn) * 320, opacity: Math.min(1, hIn * 3) }}><Hand press={press} /></div> : null}
      {/* 押す所から点線を下ろして白い札 */}
      {label && lbP > 0 ? (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><line x1={hx + 40} y1={hy + hh} x2={hx + 40} y2={hy + hh + (LT - hy - hh) * lbP} stroke="#fff" strokeWidth={5} strokeDasharray="8 8" /><circle cx={hx + 40} cy={hy + hh} r={8} fill="#F2B33D" /></svg>
          <div style={{ position: "absolute", left: hx - 10, top: LT, opacity: lbP, transform: `translateY(${(1 - lbP) * 20}px)` }}>
            <span style={{ display: "inline-block", background: "#fff", border: `5px solid ${INK}`, borderRadius: 18, padding: "6px 26px", ...K, fontSize: 40, color: INK, boxShadow: `5px 6px 0 ${INK}`, whiteSpace: "nowrap" }}>{label}</span>
          </div>
        </>
      ) : null}
      {call && f >= F(callAt) ? (
        <div style={{ position: "absolute", left: hx - 10, top: LT + 90, transform: `scale(${caP})`, transformOrigin: "0 50%" }}>
          <span style={{ display: "inline-block", background: "#F2B33D", border: `5px solid ${INK}`, borderRadius: 18, padding: "8px 28px", ...K, fontSize: 46, color: INK, boxShadow: `5px 6px 0 ${INK}`, whiteSpace: "nowrap" }}>{call}</span>
        </div>
      ) : null}
    </div>
  );
};
