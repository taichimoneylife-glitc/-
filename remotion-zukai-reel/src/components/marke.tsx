import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, FONT_BLACK, FONT_SERIF } from "./font";

// ════════════════════════════════════════════════════════════════════
//  マーケ博士（参考④）の見た目を部品にしたもの
//   ・薄い灰色の方眼の紙＋ふわふわ浮く小さな立方体
//   ・札（ステッカー）＝白地・黒の太い枠・右下に黒いずらし影・左に色の帯
//   ・札は「斜めに投げ込まれて」くるっと戻って止まる
//   ・見出し＝小さいアイコン＋小見出し＋大見出し、その下に黒い小さな札
//   ・線は「伸びて」つながる。章が変わると背景の色ごと変わる
// ════════════════════════════════════════════════════════════════════
export const F = (t: number) => Math.round(t * 30);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const out = { ...clamp, easing: Easing.out(Easing.cubic) };
export const K = { fontFamily: FONT_BLACK, fontWeight: 900 as const };
export const B = { fontFamily: FONT, fontWeight: 700 as const };
export const SER = { fontFamily: FONT_SERIF, fontWeight: 900 as const };
export const M = {
  ink: "#16181F", paper: "#F1F2F6", grid: "rgba(90,100,140,0.10)", red: "#E8453C", blue: "#2F6BEA", yellow: "#FFC83D",
  green: "#22A56A", orange: "#F28A2E", purple: "#7B5CF0", gray: "#9AA0AE", sub: "#5B6070",
};
export const pop = (f: number, A: number) => interpolate(f - A, [0, 3, 7], [0.3, 1.15, 1], clamp);
export const yen = (v: number) => Math.round(v).toLocaleString("ja-JP");
export const cnt = (f: number, at: number, to: number, dur = 0.6, from = 0) => from + (to - from) * interpolate(f - F(at), [0, F(dur)], [0, 1], out);
export const R: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = M.red }) => <span style={{ color: c }}>{children}</span>;

// ── 背景：方眼の紙＋浮く立方体（色を変えると章の切り替え） ──
const CUBES: [number, number, string, number][] = [[70, 520, "#FFC83D", 1], [960, 700, "#2F6BEA", 0.7], [120, 1180, "#22A56A", 0.6], [980, 1080, "#FFC83D", 0.8], [900, 300, "#E8453C", 0.5], [60, 860, "#2F6BEA", 0.5]];
export const Cube: React.FC<{ x: number; y: number; c: string; s?: number }> = ({ x, y, c, s = 1 }) => {
  const f = useCurrentFrame();
  const w = 34 * s;
  return (
    <svg width={w * 2} height={w * 2} viewBox="0 0 40 40" style={{ position: "absolute", left: x, top: y + Math.sin(f / 22 + x) * 10, transform: `rotate(${Math.sin(f / 40 + y) * 10}deg)` }}>
      <path d="M20 4 L34 12 L20 20 L6 12 Z" fill={c} /><path d="M6 12 L20 20 L20 36 L6 28 Z" fill={c} opacity={0.75} /><path d="M34 12 L20 20 L20 36 L34 28 Z" fill={c} opacity={0.55} />
    </svg>
  );
};
export const GridBg: React.FC<{ color?: string; grid?: string; cubes?: boolean }> = ({ color = M.paper, grid = M.grid, cubes = true }) => (
  <AbsoluteFill style={{ background: color, backgroundImage: `linear-gradient(${grid} 2px, transparent 2px), linear-gradient(90deg, ${grid} 2px, transparent 2px)`, backgroundSize: "54px 54px" }}>
    {cubes ? CUBES.map(([x, y, c, s], i) => <Cube key={i} x={x} y={y} c={c} s={s} />) : null}
  </AbsoluteFill>
);

// ── 投げ込み（斜めに飛んできて、くるっと戻って止まる） ──
export const throwIn = (f: number, A: number, fps: number, from: "l" | "r" | "u" | "d" = "r", rot = 14): React.CSSProperties => {
  const s = spring({ frame: f - A, fps, config: { damping: 12, stiffness: 170, mass: 0.7 } });
  const d = 520 * (1 - s);
  const tx = from === "l" ? -d : from === "r" ? d : 0, ty = from === "u" ? -d : from === "d" ? d : 0;
  return { opacity: interpolate(f - A, [0, 3], [0, 1], clamp), transform: `translate(${tx}px, ${ty}px) rotate(${rot * (1 - s)}deg) scale(${0.85 + 0.15 * Math.min(1, s)})` };
};
// ── うっすら大きめ → くっきり（文字や小物） ──
export const ghost = (f: number, A: number): React.CSSProperties => ({
  opacity: interpolate(f - A, [0, 2, 4], [0, 0.5, 1], clamp),
  transform: `scale(${interpolate(f - A, [0, 2, 4, 7], [1.14, 1.08, 0.97, 1], clamp)})`,
});

// 出したり消したりの入れ物
export const In: React.FC<{ at: number; until?: number; x: number; y: number; mode?: "throw" | "ghost" | "pop" | "rise"; from?: "l" | "r" | "u" | "d"; rot?: number; w?: number; center?: boolean; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, until = 999, x, y, mode = "throw", from = "r", rot = 14, w, center, style, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const A = F(at), Z = F(until);
  if (f < A || f >= Z + 6) return null;
  const st = mode === "throw" ? throwIn(f, A, fps, from, rot) : mode === "pop" ? { transform: `scale(${pop(f, A)})`, opacity: interpolate(f - A, [0, 2], [0, 1], clamp) } : mode === "rise" ? { opacity: interpolate(f - A, [0, 5], [0, 1], clamp), transform: `translateY(${interpolate(f - A, [0, 9], [40, 0], out)}px)` } : ghost(f, A);
  const o = 1 - interpolate(f, [Z, Z + 6], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: center ? 0 : x, top: y, width: center ? 1080 : w, display: center ? "flex" : undefined, justifyContent: center ? "center" : undefined, opacity: o, ...style }}>
      <div style={{ ...st, opacity: (st.opacity as number ?? 1) * o, transformOrigin: "50% 50%" }}>{children}</div>
    </div>
  );
};

// ── 札（ステッカー） ──
export const Sticker: React.FC<{ strip?: string; w?: number | string; pad?: string; bg?: string; children: React.ReactNode; style?: React.CSSProperties; shadow?: number; dim?: boolean; glow?: string }> = ({ strip, w, pad = "12px 26px", bg = "#fff", children, style, shadow = 7, dim, glow }) => (
  <div style={{ position: "relative", width: w, background: dim ? "#E4E6EC" : bg, border: `5px solid ${dim ? M.gray : M.ink}`, borderRadius: 14, boxShadow: `${shadow}px ${shadow}px 0 ${dim ? M.gray : M.ink}${glow ? `, 0 0 0 10px ${glow}` : ""}`, padding: pad, paddingLeft: strip ? 34 : undefined, boxSizing: "border-box", color: dim ? M.gray : M.ink, ...style }}>
    {strip ? <div style={{ position: "absolute", left: 8, top: 8, bottom: 8, width: 10, borderRadius: 5, background: dim ? M.gray : strip }} /> : null}
    {children}
  </div>
);
// 黒い小さな札（見出しの下）
export const DarkPill: React.FC<{ children: React.ReactNode; icon?: string; size?: number }> = ({ children, icon = "📍", size = 30 }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10, background: M.ink, color: "#fff", borderRadius: 999, padding: "8px 26px", ...B, fontSize: size, whiteSpace: "nowrap" }}><span style={{ fontSize: size * 0.8 }}>{icon}</span>{children}</span>
);
// 色の小さな札
export const Tag: React.FC<{ c?: string; children: React.ReactNode; size?: number; dark?: boolean }> = ({ c = M.yellow, children, size = 28, dark }) => (
  <span style={{ display: "inline-block", background: c, color: dark ? "#fff" : M.ink, border: `4px solid ${M.ink}`, borderRadius: 999, padding: "4px 20px", ...K, fontSize: size, boxShadow: `4px 4px 0 ${M.ink}`, whiteSpace: "nowrap" }}>{children}</span>
);

// ── アイコン（丸の中のSVG） ──
export type IconName = "house" | "yen" | "bank" | "pct" | "clock" | "lock" | "up" | "down" | "warn" | "check" | "doc" | "cal" | "snow" | "x";
const ICON: Record<IconName, React.ReactNode> = {
  house: <path d="M12 46 L50 14 L88 46 M22 40 V84 H78 V40 M42 84 V60 H58 V84" />,
  yen: <path d="M30 18 L50 46 L70 18 M50 46 V84 M32 52 H68 M32 66 H68" />,
  bank: <path d="M12 34 L50 12 L88 34 Z M20 40 V74 M40 40 V74 M60 40 V74 M80 40 V74 M10 84 H90" />,
  pct: <path d="M24 78 L76 22 M30 26 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 M70 74 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0" />,
  clock: <path d="M50 14 a36 36 0 1 0 0.1 0 M50 30 V52 L64 62" />,
  lock: <path d="M24 46 H76 V86 H24 Z M34 46 V34 a16 16 0 0 1 32 0 V46 M50 62 V72" />,
  up: <path d="M50 84 V18 M24 42 L50 16 L76 42" />,
  down: <path d="M50 16 V82 M24 58 L50 84 L76 58" />,
  warn: <path d="M50 12 L90 84 H10 Z M50 38 V60 M50 70 V72" />,
  check: <path d="M20 52 L42 74 L82 28" />,
  doc: <path d="M26 10 H62 L78 26 V90 H26 Z M62 10 V26 H78 M36 44 H68 M36 58 H68 M36 72 H56" />,
  cal: <path d="M14 22 H86 V86 H14 Z M14 40 H86 M32 12 V30 M68 12 V30" />,
  snow: <path d="M50 12 a38 38 0 1 0 0.1 0 M30 40 a6 6 0 1 0 0.1 0 M62 60 a8 8 0 1 0 0.1 0" />,
  x: <path d="M24 24 L76 76 M76 24 L24 76" />,
};
export const Icon: React.FC<{ n: IconName; s?: number; c?: string; bg?: string; ring?: boolean }> = ({ n, s = 70, c = M.blue, bg, ring = true }) => (
  <span style={{ display: "inline-flex", width: s, height: s, borderRadius: "50%", background: bg ?? `${c}1F`, border: ring ? `4px solid ${M.ink}` : undefined, alignItems: "center", justifyContent: "center", flex: "none", boxSizing: "border-box" }}>
    <svg width={s * 0.62} height={s * 0.62} viewBox="0 0 100 100" fill="none" stroke={c} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">{ICON[n]}</svg>
  </span>
);

// ── 伸びる線（点 → 点） ──
export const Link: React.FC<{ at: number; pts: [number, number][]; c?: string; w?: number; dur?: number; dash?: boolean; arrow?: boolean; until?: number }> = ({ at, pts, c = M.ink, w = 5, dur = 0.3, dash, arrow, until = 999 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 5) return null;
  const p = interpolate(f - F(at), [0, F(dur)], [0, 1], out);
  const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const L = segs.reduce((a, b) => a + b, 0);
  const d = "M" + pts.map((q) => q.join(" ")).join(" L");
  const last = pts[pts.length - 1], prev = pts[pts.length - 2];
  const ang = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
  const o = 1 - interpolate(f, [F(until), F(until) + 5], [0, 1], clamp);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: o }}>
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? "12 10" : `${L * p} ${L}`} opacity={dash ? p : 1} />
      {arrow && p > 0.95 ? <path d={`M${last[0] - 22 * Math.cos(ang - 0.5)} ${last[1] - 22 * Math.sin(ang - 0.5)} L${last[0]} ${last[1]} L${last[0] - 22 * Math.cos(ang + 0.5)} ${last[1] - 22 * Math.sin(ang + 0.5)}`} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </svg>
  );
};

// ── 波紋（注目の所から輪が広がる） ──
export const Ripple: React.FC<{ x: number; y: number; at: number; c?: string; n?: number }> = ({ x, y, at, c = M.red, n = 2 }) => {
  const f = useCurrentFrame();
  const d = f - F(at);
  if (d < 0 || d > 24) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => { const k = interpolate(d - i * 5, [0, 18], [0, 1], clamp); return k > 0 && k < 1 ? <circle key={i} cx={x} cy={y} r={40 + 160 * k} fill="none" stroke={c} strokeWidth={6 * (1 - k)} opacity={1 - k} /> : null; })}
    </svg>
  );
};

// ── 斜めのスタンプ（ドン＋ゆれ） ──
export const Stamp: React.FC<{ at: number; x: number; y: number; text: string; c?: string; size?: number; rot?: number; until?: number }> = ({ at, x, y, text, c = M.red, size = 56, rot = -8, until = 999 }) => {
  const f = useCurrentFrame(); const d = f - F(at);
  if (d < 0 || f > F(until)) return null;
  const k = interpolate(d, [0, 4, 7], [2.1, 0.92, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const sh = d >= 4 && d < 12 ? Math.sin(d * 2.6) * (12 - d) * 1.2 : 0;
  return <div style={{ position: "absolute", left: x, top: y, opacity: interpolate(d, [0, 2], [0, 1], clamp), transform: `translateX(${sh}px) rotate(${rot}deg) scale(${k})` }}><span style={{ display: "inline-block", border: `7px solid ${c}`, color: c, background: "rgba(255,255,255,0.95)", borderRadius: 14, padding: "4px 26px", ...K, fontSize: size, whiteSpace: "nowrap" }}>{text}</span></div>;
};

// ── 画面ゆれ ──
export const shake = (f: number, at: number, power = 14, dur = 12) => {
  const k = interpolate(f - F(at), [0, dur], [1, 0], clamp);
  if (f < F(at) || k <= 0) return "";
  return `translate(${Math.sin((f - F(at)) * 2.7) * power * k}px, ${Math.cos((f - F(at)) * 3.3) * power * 0.6 * k}px)`;
};

// ════════════════════════════════════════════════════════════════════
//  最新のマーケ博士（参考⑨・2026-11）の部品
//   ・背景＝ほぼ白の薄い紫＋うすい方眼＋灰色の小さな形（△○＋）
//   ・上の真ん中に黒い札「アイコン｜01｜章の名前」だけ（大見出しは出さない）
//   ・真ん中に大きな主役を1つ。下へ「線＋黄色い点」でつながる札
//   ・山場＝黄色い放射線（くるくる回る）＋輪が広がる
//   ・注目＝丸い輪で囲む（広がってから止まる）
// ════════════════════════════════════════════════════════════════════
const SHAPES: [number, number, "tri" | "cir" | "plus", number][] = [
  [80, 420, "tri", 0], [960, 380, "cir", 1], [140, 980, "plus", 2], [930, 900, "tri", 3], [70, 1320, "cir", 4], [990, 1250, "plus", 5],
  [500, 300, "plus", 6], [260, 640, "cir", 7], [820, 640, "tri", 8], [600, 1180, "cir", 9], [330, 1500, "tri", 10], [1000, 1600, "cir", 11],
];
export const Paper2: React.FC<{ color?: string; grid?: string; shape?: string }> = ({ color = "#F3F3FA", grid = "rgba(110,115,170,0.08)", shape = "rgba(120,125,160,0.35)" }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: color, backgroundImage: `linear-gradient(${grid} 2px, transparent 2px), linear-gradient(90deg, ${grid} 2px, transparent 2px)`, backgroundSize: "60px 60px" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {SHAPES.map(([x, y, k, i]) => {
          const dy = Math.sin(f / 30 + i) * 6;
          return <g key={i} transform={`translate(${x} ${y + dy}) rotate(${(f / 3 + i * 40) % 360 * (k === "tri" ? 0.2 : 0)})`} stroke={shape} strokeWidth={3} fill="none">
            {k === "tri" ? <path d="M0 -10 L9 7 L-9 7 Z" /> : k === "cir" ? <circle r={8} /> : <path d="M-9 0 H9 M0 -9 V9" />}
          </g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};
// 上の真ん中の黒い札（例：🔍｜01｜参考サムネを分析）
export const SectionPill: React.FC<{ at: number; no?: string; icon?: string; children: React.ReactNode; y?: number; until?: number }> = ({ at, no, icon = "◎", children, y = 300, until = 999 }) => (
  <In at={at} until={until} x={0} y={y} center mode="pop">
    <span style={{ display: "inline-flex", alignItems: "center", gap: 14, background: M.ink, color: "#fff", borderRadius: 999, padding: "10px 30px", ...B, fontSize: 34, boxShadow: "0 6px 0 rgba(22,24,31,0.25)", whiteSpace: "nowrap" }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      {no ? <span style={{ ...K, fontSize: 30, opacity: 0.9 }}>{no}</span> : null}
      {no ? <span style={{ width: 2, height: 30, background: "rgba(255,255,255,0.5)" }} /> : null}
      <span>{children}</span>
    </span>
  </In>
);
// 山場の放射線（黄色の帯が回る）
export const Burst: React.FC<{ at: number; until?: number; c?: string; cx?: number; cy?: number }> = ({ at, until = 999, c = "rgba(255,200,61,0.42)", cx = 540, cy = 760 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 8) return null;
  const o = interpolate(f - F(at), [0, 6], [0, 1], clamp) * (1 - interpolate(f, [F(until), F(until) + 8], [0, 1], clamp));
  const rot = (f - F(at)) * 0.6;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
      <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
        {Array.from({ length: 16 }).map((_, i) => <path key={i} d="M0 0 L-120 -2200 L120 -2200 Z" fill={c} transform={`rotate(${i * 22.5})`} />)}
      </g>
    </svg>
  );
};
// 注目の丸い輪（大きく広がってから止まる）
export const Ring: React.FC<{ at: number; x: number; y: number; r: number; c?: string; until?: number; w?: number }> = ({ at, x, y, r, c = M.red, until = 999, w = 8 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 5) return null;
  const k = interpolate(f - F(at), [0, 5, 9], [1.8, 0.95, 1], clamp);
  const o = interpolate(f - F(at), [0, 3], [0, 1], clamp) * (1 - interpolate(f, [F(until), F(until) + 5], [0, 1], clamp));
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${w}px solid ${c}`, transform: `scale(${k})`, opacity: o }} />;
};
// 主役から下へ「線＋黄色い点」でつながる札
export const Chain: React.FC<{ at: number; x: number; y0: number; y1: number; children: React.ReactNode; until?: number }> = ({ at, x, y0, y1, children, until = 999 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 6) return null;
  const p = interpolate(f - F(at), [0, 6], [0, 1], out);
  const o = 1 - interpolate(f, [F(until), F(until) + 6], [0, 1], clamp);
  return (
    <div style={{ opacity: o }}>
      <div style={{ position: "absolute", left: x - 2, top: y0, width: 5, height: (y1 - y0) * p, background: M.ink }} />
      {p > 0.95 ? <div style={{ position: "absolute", left: x - 10, top: y1 - 10, width: 20, height: 20, borderRadius: "50%", background: M.yellow, border: `4px solid ${M.ink}` }} /> : null}
      {p > 0.6 ? <div style={{ position: "absolute", left: 0, width: 1080, top: y1 + 8, display: "flex", justifyContent: "center", transform: `scale(${pop(f, F(at) + 4)})` }}>{children}</div> : null}
    </div>
  );
};
// 青い札（チャットの吹き出しのような）／白い札
export const Pill2: React.FC<{ c?: string; children: React.ReactNode; size?: number; icon?: string }> = ({ c = M.blue, children, size = 36, icon }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 12, background: c, color: c === "#fff" ? M.ink : "#fff", border: `4px solid ${M.ink}`, borderRadius: 14, padding: "10px 28px", ...K, fontSize: size, boxShadow: `5px 5px 0 ${M.ink}`, whiteSpace: "nowrap" }}>{icon ? <span style={{ fontSize: size * 0.8 }}>{icon}</span> : null}{children}</span>
);
// 灰色に沈める（山場の一言の前）
export const Dim: React.FC<{ at: number; until?: number; o?: number }> = ({ at, until = 999, o = 0.55 }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [F(at), F(at) + 5], [0, 1], clamp) * (1 - interpolate(f, [F(until), F(until) + 5], [0, 1], clamp));
  return k > 0 ? <AbsoluteFill style={{ background: `rgba(120,122,135,${o * k})` }} /> : null;
};
