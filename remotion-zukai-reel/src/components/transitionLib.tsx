import React from "react";
import { AbsoluteFill } from "remotion";
import { at } from "./flowKit";

// ════════════════════════════════════════════════════════════════════
//  画面の切り替えの引き出し（「エグい」と言われる切り替え 12種）
//  <Trans kind="zoomThrough" f={今のコマ} start={切り替え開始コマ} A={前の画面} B={次の画面} origin={[x,y]} />
//  ・origin＝どこから切り替わるか（タップした札・数字の位置）。そこへ吸い込まれる／そこから開く
//  ・速さ：急ブレーキ（毎コマ約半分）を基本に、種類ごとに長さを変える（10〜16コマ）
// ════════════════════════════════════════════════════════════════════
const ease = {
  // 急ブレーキ（出だしが一番速い）
  brake: [0, 0.32, 0.56, 0.73, 0.84, 0.91, 0.95, 0.975, 0.99, 1],
  // ため→一気→着地（マーケ博士の章の切り替え）
  tame: [0, -0.02, -0.05, -0.06, 0.08, 0.3, 0.6, 0.84, 0.95, 0.99, 1],
  // ゆっくり始めて一気に（吸い込み・回転ズームの前半）
  accel: [0, 0.01, 0.04, 0.09, 0.17, 0.29, 0.46, 0.68, 0.9, 1],
  // 前半で一気・後半ゆっくり（開く系）
  open: [0, 0.18, 0.4, 0.6, 0.75, 0.86, 0.93, 0.97, 0.99, 1],
};
const P = (k: number, a: number[]) => at(a, k);
const V = (k: number, a: number[]) => Math.abs(at(a, k + 1) - at(a, k));

export type TransKind = "zoomThrough" | "whipRGB" | "iris" | "slices" | "pageFlip" | "spinZoom" | "pushParallax" | "flashStamp" | "cardSwap" | "inkWipe" | "glitch" | "splitOpen";
export const TRANS_NAME: Record<TransKind, string> = {
  zoomThrough: "吸い込まれる（数字の中へ飛び込む）",
  whipRGB: "シュッ＋色ずれ",
  iris: "丸く開く（押した所から）",
  slices: "短冊（交互にすべり込む）",
  pageFlip: "ノートをめくる",
  spinZoom: "回転ズーム",
  pushParallax: "押し上げ（奥と手前で速さが違う）",
  flashStamp: "白フラッシュ＋ドン",
  cardSwap: "カードになって入れ替わる",
  inkWipe: "筆でぬりつぶす",
  glitch: "グリッチ（4コマだけ乱れる）",
  splitOpen: "画面が割れて開く",
};
export const TRANS_LEN: Record<TransKind, number> = { zoomThrough: 16, whipRGB: 10, iris: 12, slices: 14, pageFlip: 14, spinZoom: 14, pushParallax: 14, flashStamp: 10, cardSwap: 18, inkWipe: 12, glitch: 6, splitOpen: 12 };

const Layer: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => <AbsoluteFill style={{ overflow: "hidden", ...style }}>{children}</AbsoluteFill>;

export const Trans: React.FC<{ kind: TransKind; f: number; start: number; A: React.ReactNode; B: React.ReactNode; origin?: [number, number] }> = ({ kind, f, start, A, B, origin = [540, 960] }) => {
  const k = f - start;
  const L = TRANS_LEN[kind];
  if (k < 0) return <Layer>{A}</Layer>;
  if (k >= L + 2) return <Layer>{B}</Layer>;
  const [ox, oy] = origin;
  switch (kind) {
    case "zoomThrough": {
      // 前半8コマ：Aが origin に向かって拡大（だんだん速く）→ 後半：Bが小さい所から origin を中心に開く
      const a = P(k, ease.accel), b = P(k - 8, ease.brake);
      return <>
        {k < 10 ? <Layer style={{ transform: `scale(${1 + a * 7})`, transformOrigin: `${ox}px ${oy}px`, filter: `blur(${a * 10}px)`, opacity: 1 - Math.max(0, (k - 7) / 3) }}>{A}</Layer> : null}
        {k >= 8 ? <Layer style={{ transform: `scale(${0.35 + 0.65 * b})`, transformOrigin: `${ox}px ${oy}px`, filter: b < 0.95 ? `blur(${(1 - b) * 12}px)` : undefined, opacity: Math.min(1, (k - 8) / 2), borderRadius: (1 - b) * 80 }}>{B}</Layer> : null}
      </>;
    }
    case "whipRGB": {
      const p = P(k, ease.brake), v = V(k, ease.brake);
      const rgb = v > 0.02 ? `drop-shadow(${v * 120}px 0 0 rgba(255,40,40,0.55)) drop-shadow(${-v * 120}px 0 0 rgba(0,220,255,0.55)) blur(${v * 40}px)` : undefined;
      return <>
        <Layer style={{ transform: `translateX(${-p * 1080}px)`, filter: rgb }}>{A}</Layer>
        <Layer style={{ transform: `translateX(${(1 - p) * 1080}px)`, filter: rgb }}>{B}</Layer>
      </>;
    }
    case "iris": {
      const p = P(k, ease.open);
      return <>
        <Layer style={{ transform: `scale(${1 + p * 0.08})`, filter: `brightness(${1 - p * 0.3})` }}>{A}</Layer>
        <Layer style={{ clipPath: `circle(${p * 2300}px at ${ox}px ${oy}px)` }}>{B}</Layer>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><circle cx={ox} cy={oy} r={p * 2300} fill="none" stroke="#2E2C26" strokeWidth={12 * (1 - p)} /></svg>
      </>;
    }
    case "slices": {
      const N = 6;
      return <>
        <Layer>{A}</Layer>
        {Array.from({ length: N }).map((_, i) => {
          const p = P(k - i * 1.4, ease.brake);
          const dir = i % 2 ? 1 : -1;
          return <Layer key={i} style={{ clipPath: `inset(${(i * 100) / N}% 0 ${100 - ((i + 1) * 100) / N}% 0)`, transform: `translateX(${dir * (1 - p) * 1150}px)`, filter: p < 0.9 ? `blur(${(1 - p) * 8}px)` : undefined }}>{B}</Layer>;
        })}
      </>;
    }
    case "pageFlip": {
      const p = P(k, ease.tame);
      return <>
        <Layer>{B}</Layer>
        <Layer style={{ background: `rgba(0,0,0,${0.35 * (1 - Math.abs(p - 0.5) * 2)})` }}>{null}</Layer>
        {p < 0.98 ? <Layer style={{ transform: `perspective(2200px) rotateY(${-p * 100}deg)`, transformOrigin: "0% 50%", boxShadow: `${-40 * p}px 0 60px rgba(0,0,0,${0.35 * p})` }}>{A}</Layer> : null}
      </>;
    }
    case "spinZoom": {
      const a = P(k, ease.accel), b = P(k - 7, ease.brake);
      return <>
        {k < 9 ? <Layer style={{ transform: `rotate(${a * 40}deg) scale(${1 + a * 2.5})`, transformOrigin: `${ox}px ${oy}px`, filter: `blur(${a * 14}px)` }}>{A}</Layer> : null}
        {k >= 7 ? <Layer style={{ transform: `rotate(${(1 - b) * -40}deg) scale(${0.4 + 0.6 * b})`, filter: b < 0.95 ? `blur(${(1 - b) * 14}px)` : undefined, opacity: Math.min(1, (k - 7) / 2) }}>{B}</Layer> : null}
      </>;
    }
    case "pushParallax": {
      const p = P(k, ease.tame), p2 = P(k - 2, ease.tame);
      return <>
        <Layer style={{ transform: `translateY(${-p * 1920}px)`, filter: V(k, ease.tame) > 0.05 ? `blur(${V(k, ease.tame) * 30}px)` : undefined }}>{A}</Layer>
        <Layer style={{ transform: `translateY(${(1 - p) * 1920}px)`, background: "#FBF6D8" }}><div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - p2) * 400}px)` }}>{B}</div></Layer>
      </>;
    }
    case "flashStamp": {
      const s = at([1.35, 1.12, 1.03, 0.99, 1], k - 2);
      const sh = k >= 2 && k < 9 ? Math.sin(k * 2.7) * (9 - k) * 3 : 0;
      return <>
        {k < 2 ? <Layer>{A}</Layer> : <Layer style={{ transform: `translate(${sh}px, ${-sh * 0.6}px) scale(${s})` }}>{B}</Layer>}
        <Layer style={{ background: "#fff", opacity: at([0.9, 1, 0.6, 0.25, 0], k), pointerEvents: "none" }}>{null}</Layer>
      </>;
    }
    case "cardSwap": {
      const a = P(k, ease.brake), b = P(k - 6, ease.brake);
      return <>
        <Layer style={{ background: "#2E2C26" }}>{null}</Layer>
        <Layer style={{ transform: `translateX(${-a * 760}px) scale(${1 - a * 0.55}) rotate(${-a * 8}deg)`, borderRadius: a * 60, boxShadow: `0 30px 80px rgba(0,0,0,${0.5 * a})` }}>{A}</Layer>
        {k >= 4 ? <Layer style={{ transform: `translateX(${(1 - b) * 760}px) scale(${0.45 + 0.55 * b}) rotate(${(1 - b) * 8}deg)`, borderRadius: (1 - b) * 60, boxShadow: `0 30px 80px rgba(0,0,0,${0.5 * (1 - b)})` }}>{B}</Layer> : null}
      </>;
    }
    case "inkWipe": {
      // 斜めの筆の帯がギザギザの端でぬりつぶしていく
      const p = P(k, ease.open);
      const x = -400 + p * 2200;
      const pts: string[] = [];
      for (let i = 0; i <= 20; i++) { const y = (i / 20) * 1920; const j = Math.sin(i * 2.3) * 40 + Math.sin(i * 5.1) * 20; pts.push(`${x - y * 0.35 + j}px ${y}px`); }
      return <>
        <Layer>{A}</Layer>
        <Layer style={{ clipPath: `polygon(-500px 0, ${pts.join(", ")}, -500px 1920px)` }}>{B}</Layer>
      </>;
    }
    case "glitch": {
      // 4コマだけ：横の帯がずれる＋色ずれ → B
      const strips = 8;
      const src = k < 3 ? A : B;
      const amt = [40, 120, 80, 50, 20, 0][Math.min(5, k)];
      return <>
        {Array.from({ length: strips }).map((_, i) => {
          const dx = ((i * 73 + k * 37) % 7 - 3) * amt / 3;
          return <Layer key={i} style={{ clipPath: `inset(${(i * 100) / strips}% 0 ${100 - ((i + 1) * 100) / strips}% 0)`, transform: `translateX(${dx}px)`, filter: amt ? `drop-shadow(${amt / 6}px 0 0 rgba(255,0,60,0.7)) drop-shadow(${-amt / 6}px 0 0 rgba(0,255,220,0.7))` : undefined }}>{src}</Layer>;
        })}
      </>;
    }
    case "splitOpen": {
      // Aが真ん中から上下に割れて開き、奥からBがせり出す
      const p = P(k, ease.brake);
      return <>
        <Layer style={{ transform: `scale(${0.85 + 0.15 * p})`, filter: p < 0.9 ? `blur(${(1 - p) * 6}px)` : undefined }}>{B}</Layer>
        <Layer style={{ clipPath: "inset(0 0 50% 0)", transform: `translateY(${-p * 1000}px)` }}>{A}</Layer>
        <Layer style={{ clipPath: "inset(50% 0 0 0)", transform: `translateY(${p * 1000}px)` }}>{A}</Layer>
      </>;
    }
  }
};
