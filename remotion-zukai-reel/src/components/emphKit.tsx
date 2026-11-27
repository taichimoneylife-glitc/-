import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { A2 } from "./kit2";
import { B, GenSlot } from "../MileLifePlan";
import { F, K, SER, Lines as LinesM, At, TCtx, TypeIn, R as RM } from "./zukaiKit";

// ════════════════════════════════════════════════════════════════════
//  強調・注意の部品集（教育資金×債券 BondReel2 で作った物を共通化 2026-11-27）
//  良い話＝光・ハンコ・放射線／悪い話＝ひび・かけら・赤い点滅・暗転・霧（TAICHI_REQUESTS.md）
// ════════════════════════════════════════════════════════════════════
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const OUTE = Easing.bezier(0.16, 1, 0.3, 1);
export const INK = A2.ink, RED = A2.red, SUB = A2.sub, STK = "#EF7D57", BND = "#2E9E6B", CASH = "#4A8FD6", YEL = "#F2C14E";

// マーカーつきの赤い強調（打ち込まれたあとに黄色い線が引かれる）
export const R: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const t = React.useContext(TCtx);
  if (t.A < 0) return <RM>{children}</RM>;
  const w = interpolate(f - (t.A + t.n + 2), [0, 8], [0, 100], { ...clamp, easing: OUTE });
  return <span style={{ position: "relative", display: "inline-block" }}><span style={{ position: "absolute", left: -4, bottom: "6%", height: "30%", width: `calc(${w}% + ${w > 0 ? 8 : 0}px)`, background: "rgba(255,201,60,0.55)", borderRadius: 6 }} /><span style={{ position: "relative" }}><RM>{children}</RM></span></span>;
};
export const Lines: React.FC<React.ComponentProps<typeof LinesM>> = (p) => <LinesM anim="type" {...p} />;
export const Img2: React.FC<{ n: string; s: number }> = ({ n, s }) => <GenSlot name={n} size={s} />;
export const Tag: React.FC<{ c: string; children: React.ReactNode; size?: number }> = ({ c, children, size = 30 }) => (
  <span style={{ display: "inline-block", background: c, color: "#fff", borderRadius: 999, padding: "4px 22px", ...K, fontSize: size, whiteSpace: "nowrap" }}>{children}</span>
);
export const Pill: React.FC<{ c: string; children: React.ReactNode; size?: number; fg?: string }> = ({ c, children, size = 30, fg = "#fff" }) => (
  <span style={{ display: "inline-block", background: c, color: fg, border: `4px solid ${INK}`, borderRadius: 999, padding: "4px 22px", ...K, fontSize: size, whiteSpace: "nowrap", boxShadow: `4px 5px 0 ${INK}` }}>{children}</span>
);
export const Stamp: React.FC<{ c?: string; size?: number; rot?: number; bg?: string; children: React.ReactNode }> = ({ c = RED, size = 56, rot = -4, bg = "#FFF6F2", children }) => (
  <span style={{ display: "inline-block", border: `7px solid ${c}`, borderRadius: 18, padding: "4px 34px", ...SER, fontSize: size, color: c, background: bg, transform: `rotate(${rot}deg)`, whiteSpace: "nowrap" }}>{children}</span>
);
export const Big: React.FC<{ bg?: string; fg?: string; size?: number; children: React.ReactNode }> = ({ bg = YEL, fg = INK, size = 58, children }) => (
  <span style={{ display: "inline-block", background: bg, border: `7px solid ${INK}`, borderRadius: 22, padding: "8px 36px", ...K, fontSize: size, color: fg, boxShadow: `7px 9px 0 ${INK}`, transform: "rotate(-3deg)", whiteSpace: "nowrap" }}>{children}</span>
);
export const Foot: React.FC<{ at: number; children: React.ReactNode; y?: number }> = ({ at, children, y = 1250 }) => (
  <At at={at} x={60} y={y} mode="rise"><div style={{ maxWidth: 940, display: "inline-block", background: "#FFF8E3", border: "2px solid #E8D9A8", borderRadius: 14, padding: "6px 16px", ...B, fontSize: 22, lineHeight: 1.45, color: SUB }}>{children}</div></At>
);
// 付箋の見出し（テープで貼られてペタッ）＋打ち込まれる題
export const Head: React.FC<{ at: number; tag: string; title: React.ReactNode; c?: string }> = ({ at, tag, title, c = RED }) => {
  const f = useCurrentFrame();
  const A = F(at);
  if (f < A) return null;
  const k = interpolate(f - A, [0, 6, 10], [1.5, 0.95, 1], clamp), o = interpolate(f - A, [0, 3], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 60, top: 270, display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", background: "#FFE58A", padding: "14px 24px 10px", transform: `rotate(-4deg) scale(${k})`, opacity: o, boxShadow: "3px 6px 12px rgba(90,70,20,0.2)", ...K, fontSize: 38, color: c, whiteSpace: "nowrap" }}>
        <div style={{ position: "absolute", left: "50%", top: -16, width: 90, height: 30, marginLeft: -45, background: "rgba(255,255,255,0.65)", transform: "rotate(4deg)" }} />
        {tag}
      </div>
      <span style={{ ...K, fontSize: 58, color: INK, display: "inline-block", whiteSpace: "nowrap" }}><TypeIn at={A + 8} step={1.5}>{title}</TypeIn></span>
    </div>
  );
};
// 箱が横からシュッと入る
export const swoop = (f: number, at: number, dir: 1 | -1): React.CSSProperties => {
  const d = f - F(at);
  if (d < 0) return { opacity: 0 };
  const p = interpolate(d, [0, 9], [0, 1], { ...clamp, easing: OUTE });
  return { transform: `translateX(${(1 - p) * 700 * dir}px) rotate(${(1 - p) * 6 * dir}deg)`, filter: p < 0.9 ? `blur(${(1 - p) * 8}px)` : undefined };
};
// 集中線
export const Burst: React.FC<{ at: number; dur?: number; r0?: number; cx?: number; cy?: number }> = ({ at, dur = 22, r0 = 330, cx = 540, cy = 860 }) => {
  const f = useCurrentFrame();
  const d = f - F(at);
  if (d < 0 || d > dur) return null;
  const o = interpolate(d, [0, 3, dur - 6, dur], [0, 1, 1, 0], clamp);
  const grow = interpolate(d, [0, 6], [0.6, 1], { ...clamp, easing: OUTE });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: o, pointerEvents: "none" }}>
      {Array.from({ length: 56 }).map((_, i) => {
        const a = (i / 56) * Math.PI * 2 + ((i * 37) % 7) * 0.01;
        const jit = ((i * 53 + d * 17) % 11) / 11;
        const r1 = (r0 + jit * 90) / grow, r2 = 1500, w = 0.006 + ((i * 29) % 5) * 0.003;
        const p = (r: number, aa: number) => `${cx + Math.cos(aa) * r},${cy + Math.sin(aa) * r}`;
        return <polygon key={i} points={`${p(r1, a)} ${p(r2, a - w)} ${p(r2, a + w)}`} fill={INK} opacity={0.16 + (i % 3) * 0.06} />;
      })}
    </svg>
  );
};
// 数字：段で上がって言った瞬間に止まる
export const Num: React.FC<{ at: number; from?: number; to: number; dur?: number }> = ({ at, from = 0, to, dur = 14 }) => {
  const f = useCurrentFrame();
  const step = Math.floor(f / 3) * 3;
  const v = Math.round(interpolate(step, [F(at), F(at) + dur], [from, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const land = interpolate(f - F(at) - dur, [0, 2, 5], [-10, 4, 0], clamp);
  return <span style={{ display: "inline-block", transform: `translateY(${f >= F(at) + dur ? land : 0}px)` }}>{v.toLocaleString("en-US")}</span>;
};

// ── 強調の動き（山場ごとに使い分ける・放射線ばかりにしない） ──
// ひび割れ：当たった所からガラスにひびが走る
export const Crack: React.FC<{ at: number; x: number; y: number; s?: number; until?: number }> = ({ at, x, y, s = 1, until = 999 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 6) return null;
  const p = interpolate(f - F(at), [0, 5], [0, 1], { ...clamp, easing: OUTE });
  const o = 1 - interpolate(f, [F(until), F(until) + 6], [0, 1], clamp);
  const P = ["M0 0 L60 -40 L95 -38 L150 -95", "M0 0 L-55 -30 L-80 -75 L-140 -90", "M0 0 L-40 50 L-95 70 L-120 130", "M0 0 L50 45 L70 110 L130 150", "M60 -40 L80 0 L130 10", "M-55 -30 L-100 0"];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: o, pointerEvents: "none" }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {P.map((d, i) => <path key={i} d={d} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />)}
        <circle r={10 * p} fill={INK} />
      </g>
    </svg>
  );
};
// 四すみのカギで寄る（画面の角から集まって止まる＋倍率）
export const Corners: React.FC<{ at: number; until?: number; x: number; y: number; w: number; h: number; c?: string; zoom?: string }> = ({ at, until = 999, x, y, w, h, c = RED, zoom }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 5) return null;
  const p = interpolate(f - F(at), [0, 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const o = 1 - interpolate(f, [F(until), F(until) + 5], [0, 1], clamp);
  const L = 54;
  const box = { x0: x + (0 - x) * (1 - p), y0: y + (300 - y) * (1 - p), x1: x + w + (1080 - x - w) * (1 - p), y1: y + h + (1500 - y - h) * (1 - p) };
  const k = (cx: number, cy: number, dx: number, dy: number) => <path d={`M${cx} ${cy + dy * L} L${cx} ${cy} L${cx + dx * L} ${cy}`} fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {k(box.x0, box.y0, 1, 1)}{k(box.x1, box.y0, -1, 1)}{k(box.x0, box.y1, 1, -1)}{k(box.x1, box.y1, -1, -1)}
      </svg>
      {zoom && p > 0.9 ? <div style={{ position: "absolute", left: box.x1 - 110, top: box.y1 + 10, background: c, color: "#fff", ...K, fontSize: 26, borderRadius: 8, padding: "0 10px" }}>{zoom}</div> : null}
    </div>
  );
};
// パタッと返る札（縦に回って止まる）
export const Flip: React.FC<{ at: number; x: number; y: number; children: React.ReactNode }> = ({ at, x, y, children }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const r = interpolate(f - F(at), [0, 6, 9, 12], [-95, 12, -5, 0], clamp);
  return <div style={{ position: "absolute", left: x, top: y, perspective: 900 }}><div style={{ transform: `rotateX(${r}deg)`, transformOrigin: "50% 0%" }}>{children}</div></div>;
};
// 数えるハンコ（1・2・3…と順に押される）
export const CountBadge: React.FC<{ at: number; x: number; y: number; n: number; until?: number }> = ({ at, x, y, n, until = 999 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 5) return null;
  const k = interpolate(f - F(at), [0, 3, 6], [2.2, 0.85, 1], clamp);
  const o = interpolate(f - F(at), [0, 2], [0, 1], clamp) * (1 - interpolate(f, [F(until), F(until) + 5], [0, 1], clamp));
  return <div style={{ position: "absolute", left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: "50%", background: RED, border: "4px solid #fff", boxShadow: `0 0 0 4px ${RED}`, color: "#fff", ...K, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k}) rotate(${(1 - Math.min(1, k)) * 40}deg)`, opacity: o }}>{n}</div>;
};
// 円グラフが埋まっていく（数字は段で増える）
export const Donut: React.FC<{ at: number; x: number; y: number; r: number; v: number; c: string; label: string }> = ({ at, x, y, r, v, c, label }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const fs = Math.floor(f / 3) * 3;
  const p = interpolate(fs, [F(at), F(at) + 18], [0, v], { ...clamp, easing: Easing.out(Easing.cubic) });
  const k = interpolate(f - F(at), [0, 4, 8], [0.4, 1.08, 1], clamp);
  const C = 2 * Math.PI * r;
  return (
    <div style={{ position: "absolute", left: x - r - 20, top: y - r - 20, width: 2 * r + 40, height: 2 * r + 40, transform: `scale(${k})` }}>
      <svg width={2 * r + 40} height={2 * r + 40}>
        <circle cx={r + 20} cy={r + 20} r={r} fill="#fff" stroke={RED} strokeWidth={34} />
        <circle cx={r + 20} cy={r + 20} r={r} fill="none" stroke={c} strokeWidth={34} strokeDasharray={`${C * p} ${C}`} transform={`rotate(-90 ${r + 20} ${r + 20})`} />
        <circle cx={r + 20} cy={r + 20} r={r + 19} fill="none" stroke={INK} strokeWidth={4} />
        <circle cx={r + 20} cy={r + 20} r={r - 19} fill="none" stroke={INK} strokeWidth={4} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...SER, fontSize: 44, color: c }}>{Math.round(p * 100)}<span style={{ ...K, fontSize: 22 }}>%</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 2 * r + 40, textAlign: "center", ...K, fontSize: 22, color: SUB, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
};

// ── ネガティブの動き（悪い話の所で使う・「良いこと」に見える光は使わない）──
// 危険の赤いランプ：画面のふちが赤く点滅＋⚠（「やばい」が目で分かる）
export const Alarm: React.FC<{ at: number; until: number; x?: number; y?: number }> = ({ at, until, x = 860, y = 400 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 6) return null;
  const o = interpolate(f - F(at), [0, 3], [0, 1], clamp) * (1 - interpolate(f, [F(until), F(until) + 6], [0, 1], clamp));
  const blink = 0.5 + 0.5 * Math.sin((f - F(at)) / 2.2);
  const k = interpolate(f - F(at), [0, 3, 6], [2, 0.9, 1], clamp);
  return (
    <>
      <div style={{ position: "absolute", left: -60, top: -60, width: 1200, height: 2040, background: `radial-gradient(ellipse at 50% 45%, rgba(232,40,30,0) ${52 - 6 * blink}%, rgba(232,40,30,${0.6 * o}) 100%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: x, top: y, width: 130, height: 120, transform: `scale(${k}) rotate(${Math.sin(f / 2) * 6}deg)`, opacity: o }}>
        <svg width={130} height={120}><path d="M65 6 L124 112 L6 112 Z" fill={blink > 0.5 ? RED : "#FF8A7A"} stroke={INK} strokeWidth={6} strokeLinejoin="round" /><text x={65} y={98} textAnchor="middle" fontSize={64} fontWeight={900} fill="#fff" fontFamily="Noto Sans JP">!</text></svg>
      </div>
    </>
  );
};
// 割れたかけらが落ちる
export const Shards: React.FC<{ at: number; x: number; y: number; c?: string }> = ({ at, x, y, c = INK }) => {
  const f = useCurrentFrame();
  const k = f - F(at);
  if (k < 0 || k > 30) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {[-8, -5, -2, 2, 5, 9, -3].map((vx, i) => { const vy = [-14, -18, -20, -17, -15, -11, -9][i]; const X = x + vx * k, Y = y + vy * k + 0.9 * k * k; return <polygon key={i} points={`${X},${Y} ${X + 18},${Y + 4} ${X + 6},${Y + 16}`} fill={i % 2 ? c : "#fff"} stroke={INK} strokeWidth={3} opacity={Math.max(0, 1 - k / 30)} transform={`rotate(${k * 22 * (i % 2 ? 1 : -1)} ${X} ${Y})`} />; })}
    </svg>
  );
};
// 暗転して重い一言を叩きつける（画面がずしっと沈む）
export const DarkSlam: React.FC<{ t0: number; t1: number; children: React.ReactNode }> = ({ t0, t1, children }) => {
  const f = useCurrentFrame();
  if (f < F(t0) || f > F(t1) + 6) return null;
  const k = f - F(t0);
  const inP = interpolate(k, [0, 4], [0, 1], clamp), out = interpolate(f, [F(t1), F(t1) + 6], [0, 1], clamp);
  const sc = interpolate(k, [0, 3, 6, 9, 12], [1.7, 0.92, 1.04, 0.99, 1], clamp);
  const drop = interpolate(k, [0, 3, 6], [-60, 8, 0], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 1 - out }}>
      <div style={{ position: "absolute", left: -400, top: -400, width: 1880, height: 2720, background: "radial-gradient(circle at 50% 45%, rgba(40,30,34,0.88) 0%, rgba(20,14,18,0.96) 70%)", opacity: inP }} />
      <div style={{ position: "absolute", left: 0, width: 1080, top: 560, height: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `translateY(${drop}px) scale(${sc})`, filter: k < 3 ? `blur(${(3 - k) * 3}px)` : undefined }}>{children}</div>
    </div>
  );
};
// 足りない分：赤い斜線が上から下りてくる
export const Gap: React.FC<{ at: number; x: number; y0: number; y1: number; w?: number; until?: number }> = ({ at, x, y0, y1, w = 70, until = 999 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 5) return null;
  const p = interpolate(f - F(at), [0, 8], [0, 1], { ...clamp, easing: OUTE });
  const o = 1 - interpolate(f, [F(until), F(until) + 5], [0, 1], clamp);
  return <div style={{ position: "absolute", left: x - w / 2, top: y0, width: w, height: (y1 - y0) * p, border: `5px solid ${RED}`, borderRadius: 10, backgroundImage: `repeating-linear-gradient(45deg, ${RED} 0 9px, transparent 9px 20px)`, opacity: 0.85 * o, boxSizing: "border-box" }} />;
};
// 先が見えない霧（灰色のもや＋ぼかし）
export const Fog: React.FC<{ at: number; x: number; y: number; w: number; h: number }> = ({ at, x, y, w, h }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const p = interpolate(f - F(at), [0, 12], [0, 1], { ...clamp, easing: OUTE });
  const drift = Math.sin((f - F(at)) / 12) * 10;
  return <div style={{ position: "absolute", left: x + drift, top: y, width: w * p, height: h, borderRadius: 40, background: "linear-gradient(90deg, rgba(140,132,120,0.15), rgba(140,132,120,0.55) 40%, rgba(140,132,120,0.7))", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 35%)", maskImage: "linear-gradient(90deg, transparent, #000 35%)" }} />;
};

