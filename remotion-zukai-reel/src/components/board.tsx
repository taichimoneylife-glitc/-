import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { A2 } from "./kit2";
import { B } from "../MileLifePlan";

// マーケ博士②（2026-11 投稿）の「1枚の大きな地図」型の転換を部品にしたもの
//  ・全部のページ（パネル）を1枚の大きな紙の上に格子状に並べ、点線でつなぐ
//  ・ページを変えるとき：今のページが約0.45倍まで小さくなる（6f）→ 点線に沿って次のページへ流れる（8〜10f）→ 次のページが1倍に戻る（6f）＝約0.7秒
//  ・山場では地図全体まで引いて（約0.25倍）、これまでのページを全部見せる → 赤い枠で各ステップを光らせる
//  ・左下に「ステップの進み具合（1〜5の丸）」を固定。進むと丸が赤く塗られて線がのびる

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EZ = Easing.bezier(0.65, 0, 0.35, 1);

export const PW = 1080, PH = 1920; // 1ページ＝画面1枚分
export type Panel = { id: string; col: number; row: number }; // 地図の上の位置（列・行）
export const GAP_X = 260, GAP_Y = 300; // ページとページの間（点線が通る）
export const panelXY = (p: Panel) => [p.col * (PW + GAP_X), p.row * (PH + GAP_Y)] as const;

// t秒に、どのページを見ているか（順番に並べる）。trans＝そのページへ移り始める時刻
export type Stop = { id: string; trans: number } | { id: "__map"; trans: number; scale: number };

const camOf = (panels: Panel[], s: Stop) => {
  if (s.id === "__map") {
    const xs = panels.map((p) => panelXY(p)[0]), ys = panels.map((p) => panelXY(p)[1]);
    const cx = (Math.min(...xs) + Math.max(...xs) + PW) / 2, cy = (Math.min(...ys) + Math.max(...ys) + PH) / 2;
    return { x: cx, y: cy, s: (s as { scale: number }).scale };
  }
  const p = panels.find((q) => q.id === s.id)!;
  const [x, y] = panelXY(p);
  return { x: x + PW / 2, y: y + PH / 2, s: 1 };
};

// 1回のページ送り：縮む(0→6f) → 流れる(6→16f) → 戻る(16→22f)
export const boardCam = (f: number, panels: Panel[], stops: Stop[]) => {
  let cur = camOf(panels, stops[0]);
  for (let i = 1; i < stops.length; i++) {
    const A = F(stops[i].trans);
    if (f < A) break;
    const nxt = camOf(panels, stops[i]);
    const toMap = stops[i].id === "__map", fromMap = stops[i - 1].id === "__map";
    const out = interpolate(f - A, [0, 6], [0, 1], { ...clamp, easing: EZ });
    const move = interpolate(f - A, [4, 16], [0, 1], { ...clamp, easing: EZ });
    const back = interpolate(f - A, [16, 22], [0, 1], { ...clamp, easing: EZ });
    const low = toMap || fromMap ? Math.min(cur.s, nxt.s) : 0.45;
    const s = f - A < 6 ? cur.s + (low - cur.s) * out : low + (nxt.s - low) * back;
    cur = { x: cur.x + (nxt.x - cur.x) * move, y: cur.y + (nxt.y - cur.y) * move, s: f - A >= 22 ? nxt.s : s };
  }
  return cur;
};

export const Board: React.FC<{ panels: Panel[]; stops: Stop[]; links?: [string, string][]; children: (id: string) => React.ReactNode }> = ({ panels, stops, links = [], children }) => {
  const f = useCurrentFrame();
  const c = boardCam(f, panels, stops);
  const center = (id: string) => { const p = panels.find((q) => q.id === id)!; const [x, y] = panelXY(p); return [x + PW / 2, y + PH / 2]; };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${540 - c.x * c.s}px, ${960 - c.y * c.s}px) scale(${c.s})`, transformOrigin: "0 0" }}>
        {/* 点線のつながり */}
        <svg style={{ position: "absolute", left: -4000, top: -4000, overflow: "visible" }} width={1} height={1}>
          {links.map(([a, b]) => {
            const [x1, y1] = center(a), [x2, y2] = center(b);
            const mx = x1 === x2 ? x1 : (x1 + x2) / 2;
            return <path key={a + b} d={`M${x1 + 4000} ${y1 + 4000} L${mx + 4000} ${y1 + 4000} L${mx + 4000} ${y2 + 4000} L${x2 + 4000} ${y2 + 4000}`} fill="none" stroke="rgba(46,44,38,0.45)" strokeWidth={5} strokeDasharray="14 12" />;
          })}
        </svg>
        {panels.map((p) => {
          const [x, y] = panelXY(p);
          return <div key={p.id} style={{ position: "absolute", left: x, top: y, width: PW, height: PH, overflow: "hidden" }}>{children(p.id)}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// 左下のステップの進み具合（1〜5の丸＋下に短い名前）。step＝今いるステップ（0なら全部白）
export const Stepper: React.FC<{ labels: string[]; steps: number[]; x?: number; y?: number; color?: string }> = ({ labels, steps, x = 40, y = 1500, color = A2.coral }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  let cur = 0; steps.forEach((s, i) => { if (t >= s) cur = i + 1; });
  const W = 120;
  return (
    <div style={{ position: "absolute", left: x, top: y, background: "#fff", border: `4px solid ${A2.ink}`, borderRadius: 22, padding: "16px 22px 10px", boxShadow: "0 6px 14px rgba(80,60,20,0.12)" }}>
      <div style={{ position: "relative", display: "flex", gap: 0 }}>
        <div style={{ position: "absolute", left: W / 2, top: 26, width: W * (labels.length - 1), height: 5, background: "#D8D2C2" }} />
        <div style={{ position: "absolute", left: W / 2, top: 26, width: W * Math.max(0, cur - 1) * (cur > 0 ? interpolate(f - F(steps[cur - 1] ?? 0), [0, 8], [0.8, 1], clamp) : 0), height: 5, background: color }} />
        {labels.map((l, i) => {
          const on = i < cur;
          const k = on ? interpolate(f - F(steps[i]), [0, 3, 7], [0.6, 1.25, 1], clamp) : 1;
          return (
            <div key={l} style={{ width: W, textAlign: "center", position: "relative" }}>
              <div style={{ margin: "0 auto", width: 56, height: 56, borderRadius: "50%", background: on ? color : "#fff", border: `4px solid ${on ? color : "#B9B2A0"}`, color: on ? "#fff" : "#8C8471", ...B, fontSize: 28, lineHeight: "48px", boxSizing: "border-box", transform: `scale(${k})` }}>{i + 1}</div>
              <div style={{ ...B, fontSize: 22, color: A2.ink, marginTop: 6 }}>{l}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
