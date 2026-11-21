import React from "react";
import { at } from "./flowKit";

// ════════════════════════════════════════════════════════════════════
//  動き出しの引き出し（パターン × 速さの緩急）
//  ・パターン＝どう出るか（ポン・横から・落ちる・ワイプ…）
//  ・テンポ＝どんな速さで出るか（キレ・標準・タメ・ふわっ・連打）
//  使い方：<div style={enter(f, 開始コマ, "pop", "kire")}>…</div>
//  0〜1 の進み具合を「テンポ」で作り、それを「パターン」が見た目に変える。
//  数字の出どころ：標準＝参考⑫の実測（札42→105→100%・横すべりは後半の強いブレーキ）、
//                 タメ＝マーケ博士の章の切り替え（ため4〜5f→加速5〜6f→着地）
// ════════════════════════════════════════════════════════════════════

// テンポ：1コマごとの進み具合（1を超える所＝行き過ぎ、0未満＝逆に引く「ため」）
export const TEMPO = {
  kire: [0, 0.55, 1.12, 1.03, 1],                                   // キレ：2コマで行き過ぎ→すぐ止まる（4コマ）
  std: [0, 0.13, 0.42, 1.05, 1.02, 1.01, 1],                       // 標準：参考⑫の札（6コマ）
  tame: [0, -0.04, -0.09, -0.12, -0.1, 0.15, 0.55, 0.9, 1.04, 1.01, 1], // タメ：4コマ逆に引いて→一気に（10コマ）
  fuwa: [0, 0.05, 0.14, 0.27, 0.42, 0.57, 0.7, 0.8, 0.88, 0.94, 0.97, 0.99, 1], // ふわっ：ゆっくり出てゆっくり止まる（12コマ）
  brake: [0, 0.35, 0.62, 0.8, 0.9, 0.95, 0.98, 1],                // 急ブレーキ：いきなり速く出て、毎コマ約半分に（7コマ）
  bounce: [0, 0.3, 0.75, 1.18, 0.92, 1.06, 0.98, 1.01, 1],         // はずむ：行き過ぎ→戻り過ぎ→…（8コマ）
} as const;
export type Tempo = keyof typeof TEMPO;
export const TEMPO_NAME: Record<Tempo, string> = { kire: "キレ", std: "標準", tame: "タメ", fuwa: "ふわっ", brake: "急ブレーキ", bounce: "はずむ" };

// 1コマあたりの速さ（ブレの量に使う）
const vel = (t: number[], k: number) => Math.abs(at(t, k + 1) - at(t, k));

// パターン：p（0→1）を見た目にする。v＝その瞬間の速さ（0〜1くらい）
type Pat = (p: number, v: number) => React.CSSProperties;
const B = (v: number, k = 30) => (v > 0.05 ? `blur(${Math.min(14, v * k)}px)` : undefined);
export const PATTERN: Record<string, { name: string; fn: Pat }> = {
  pop: { name: "ポン（大きさ）", fn: (p) => ({ transform: `scale(${Math.max(0, p)})`, opacity: Math.min(1, Math.max(0, p) * 3) }) },
  slideL: { name: "左からすべる", fn: (p, v) => ({ transform: `translateX(${(1 - p) * -700}px)`, filter: B(v, 40), opacity: Math.min(1, p * 4 + 0.2) }) },
  slideUp: { name: "下から上がる", fn: (p, v) => ({ transform: `translateY(${(1 - p) * 500}px)`, filter: B(v, 40), opacity: Math.min(1, p * 4 + 0.2) }) },
  drop: { name: "上から落ちる", fn: (p, v) => ({ transform: `translateY(${(1 - p) * -600}px) scaleY(${1 + Math.min(0.25, v * 0.8)})`, opacity: Math.min(1, p * 4 + 0.2) }) },
  wipe: { name: "ワイプ（左→右）", fn: (p) => ({ clipPath: `inset(-20% ${Math.max(0, (1 - p) * 100)}% -20% -5%)` }) },
  focus: { name: "ピントが合う", fn: (p) => ({ transform: `scale(${1.35 - 0.35 * p})`, filter: p < 0.98 ? `blur(${(1 - Math.min(1, p)) * 16}px)` : undefined, opacity: Math.min(1, p * 1.5) }) },
  flip: { name: "パタン（めくれる）", fn: (p) => ({ transform: `perspective(900px) rotateX(${(1 - p) * 95}deg)`, transformOrigin: "50% 0%", opacity: p > 0.05 ? 1 : 0 }) },
  rubber: { name: "ゴム（縦にはずむ）", fn: (p) => ({ transform: `scale(${0.6 + 0.4 * Math.min(1, p) + (p > 1 ? (p - 1) * -2 : 0)}, ${0.2 + 0.8 * p + (p > 1 ? (p - 1) * 4 : 0)})`, transformOrigin: "50% 100%", opacity: Math.min(1, p * 3) }) },
  whip: { name: "シュッ（横にブレ）", fn: (p, v) => ({ transform: `translateX(${(1 - p) * 1100}px) skewX(${-Math.min(18, v * 50)}deg)`, filter: B(v, 60), opacity: p > 0.02 ? 1 : 0 }) },
  spin: { name: "回って止まる", fn: (p) => ({ transform: `rotate(${(1 - p) * -35}deg) scale(${0.3 + 0.7 * p})`, opacity: Math.min(1, p * 3) }) },
  maskUp: { name: "下から顔を出す", fn: (p) => ({ transform: `translateY(${(1 - p) * 110}%)`, clipPath: `inset(${-(1 - p) * 0}% 0 ${(1 - Math.min(1, p)) * 110}% 0)` }) },
  zoomIn: { name: "奥からズーン", fn: (p, v) => ({ transform: `scale(${3 - 2 * p})`, filter: B(v, 20), opacity: Math.min(1, p * 2) }) },
  stamp: { name: "ドン（ハンコ）", fn: (p) => ({ transform: `scale(${2.2 - 1.2 * p}) rotate(${-8 + (1 - p) * 10}deg)`, opacity: Math.min(1, p * 4) }) },
  swing: { name: "ぶら下がって揺れる", fn: (p) => ({ transform: `rotate(${(1 - p) * 70}deg)`, transformOrigin: "50% 0%", opacity: p > 0.05 ? 1 : 0 }) },
};
export type PatternId = keyof typeof PATTERN;

// 本体：開始コマ start から、パターン×テンポで出す
export const enter = (f: number, start: number, pattern: PatternId, tempo: Tempo = "std"): React.CSSProperties => {
  const k = f - start;
  if (k < 0) return { opacity: 0 };
  const t = TEMPO[tempo] as unknown as number[];
  return PATTERN[pattern].fn(at(t, k), vel(t, k));
};

// たくさん並んだ物を、順番にずらして出す（ずらし方も緩急）
//  even＝同じ間隔／accel＝だんだん速く（最初ゆっくり→後ろほど詰める）／decel＝だんだん遅く
export const stagger = (i: number, n: number, gap: number, mode: "even" | "accel" | "decel" = "even") => {
  if (mode === "even") return i * gap;
  const x = i / Math.max(1, n - 1);
  const total = gap * (n - 1);
  return Math.round(total * (mode === "accel" ? Math.sqrt(x) : x * x));
};
