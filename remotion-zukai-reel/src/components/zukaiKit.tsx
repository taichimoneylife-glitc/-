import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT_BLACK, FONT_SERIF } from "./font";
import { B, GenSlot } from "../MileLifePlan";
import { ghostIn } from "./cam";

// 参考リール②（マーケ博士）の図の出し方を部品にしたもの。Marke2Repro で動作確認済み。
//  Lines（区切りで1行ずつ足す本文・声より0.5秒先）／R（赤の明朝キーワード）／StepHead（STEP札＋見出し）／At（時刻で出す：ghost・pop・fade）
//  AiIcon・Ripple（波紋）・Books・Laptop・Pill・Folder・Phone・Bag・Person・Arrow（伸びる矢印）・Cross（赤い×）・Count（カウントアップ）・Note（注意書き）
//  色は THEME で差し替えられる（太一リールでは A2 の色を渡す）

export const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
export const K = { fontFamily: FONT_BLACK, fontWeight: 900 as const };
export const SER = { fontFamily: FONT_SERIF, fontWeight: 900 as const };
export const THEME = { INK: "#22201C", RED: "#E8553B", PAPER: "#EDE8DD", GRAY: "#A8A196", FOLD: "#F2B544" };
const INK = THEME.INK, RED = THEME.RED, GRAY = THEME.GRAY, FOLD = THEME.FOLD;
export const LEAD = 0.5; // 文字は声より少し先に出す
export const pop = (f: number, at: number) => interpolate(f - at, [0, 3, 6], [0.3, 1.18, 1], clamp);

// ── 文字 ──
export const R: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ ...SER, color: RED }}>{children}</span>;
export type Line = [number, React.ReactNode];
export const Lines: React.FC<{ x?: number; y: number; size?: number; lines: Line[]; center?: boolean; lh?: number; anim?: "ghost" | "wipe" | "type" }> = ({ x = 60, y, size = 58, lines, center, lh = 1.45, anim = "ghost" }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: center ? 0 : x, top: y, width: center ? 1080 : 1000, textAlign: center ? "center" : "left" }}>
      {lines.map(([t, node], i) => f >= F(t - LEAD) ? <div key={i} style={{ ...K, fontSize: size, color: INK, lineHeight: lh, whiteSpace: "nowrap", ...(anim === "wipe" ? wipeIn(f, F(t - LEAD)) : anim === "type" ? {} : ghostIn(f, F(t - LEAD))), transformOrigin: center ? "50% 50%" : "0 50%" }}>{anim === "type" ? <TypeIn at={F(t - LEAD)}>{node}</TypeIn> : node}</div> : <div key={i} style={{ fontSize: size, lineHeight: lh }}>&nbsp;</div>)}
    </div>
  );
};
// 1文字ずつ、下からぼかしが取れながら立ち上がる（字幕・本文用の上質な出し方）
//  TCtx：その文字が出始めたフレーム（R などの強調が、自分の出るタイミングを知るため）
export const TCtx = React.createContext<{ A: number; n: number }>({ A: -1, n: 0 });
const charStyle = (d: number): React.CSSProperties => {
  if (d <= 0) return { opacity: 0, display: "inline-block" };
  const p = interpolate(d, [0, 7], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const b = interpolate(d, [0, 5], [8, 0], clamp);
  return { display: "inline-block", opacity: interpolate(d, [0, 3], [0, 1], clamp), transform: `translateY(${(1 - p) * 0.42}em) scale(${0.82 + 0.18 * p})`, filter: b > 0.3 ? `blur(${b}px)` : undefined, whiteSpace: "pre" };
};
export const typeNode = (node: React.ReactNode, f: number, A: number, cnt: { i: number }, step: number): React.ReactNode => {
  if (typeof node === "string" || typeof node === "number") {
    return Array.from(String(node)).map((ch) => { const i = cnt.i++; return <span key={i} style={charStyle(f - A - i * step)}>{ch}</span>; });
  }
  if (Array.isArray(node)) return node.map((c, k) => <React.Fragment key={k}>{typeNode(c, f, A, cnt, step)}</React.Fragment>);
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    const start = cnt.i;
    const kids = typeNode(el.props.children, f, A, cnt, step);
    return <TCtx.Provider value={{ A: A + start * step, n: cnt.i - start }}>{React.cloneElement(el, {}, kids)}</TCtx.Provider>;
  }
  return node;
};
export const TypeIn: React.FC<{ at: number; step?: number; children: React.ReactNode }> = ({ at, step = 1, children }) => {
  const f = useCurrentFrame();
  return <TCtx.Provider value={{ A: at, n: 0 }}>{typeNode(children, f, at, { i: 0 }, step)}</TCtx.Provider>;
};
// 左から書き出すように出る（字幕・本文用）：9fで左→右に見えていき、少し下から上がる
export const wipeIn = (f: number, A: number): React.CSSProperties => {
  const p = interpolate(f - A, [0, 9], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.2, 1) });
  return { clipPath: `inset(-30% ${(1 - p) * 100}% -30% -4%)`, transform: `translateY(${(1 - p) * 16}px)`, opacity: interpolate(f - A, [0, 3], [0, 1], clamp) };
};
export const StepHead: React.FC<{ n: number; at: number; title: string; y?: number }> = ({ n, at, title, y = 400 }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return (
    <div style={{ position: "absolute", left: 60, top: y, display: "flex", alignItems: "center", gap: 22, ...ghostIn(f, F(at)), transformOrigin: "0 50%" }}>
      <span style={{ background: RED, color: "#fff", borderRadius: 999, padding: "6px 30px", ...K, fontSize: 36 }}>STEP {n}</span>
      <span style={{ ...K, fontSize: 60, color: INK }}>{title}</span>
    </div>
  );
};
// 出し方：ghost（ふわっと）／pop（ぽん）／fade／rise（下から）／drop（上から落ちて弾む）／slam（大きく叩きつけ＋揺れ）／wipe（左から）／spring（ばねで伸びる）
export type AtMode = "ghost" | "pop" | "fade" | "rise" | "drop" | "slam" | "wipe" | "spring" | "type";
export const enter = (mode: AtMode, f: number, A: number): React.CSSProperties => {
  const d = f - A;
  switch (mode) {
    case "pop": return { transform: `scale(${pop(f, A)})` };
    case "fade": return { opacity: interpolate(d, [0, 8], [0, 1], clamp) };
    case "rise": return { opacity: interpolate(d, [0, 5], [0, 1], clamp), transform: `translateY(${interpolate(d, [0, 9], [46, 0], out)}px)` };
    case "drop": return { opacity: interpolate(d, [0, 2], [0, 1], clamp), transform: `translateY(${interpolate(d, [0, 7, 10, 13], [-160, 10, -4, 0], { ...clamp, easing: Easing.out(Easing.quad) })}px)` };
    case "slam": {
      const k = interpolate(d, [0, 4, 7, 10], [2.4, 0.92, 1.04, 1], { ...clamp, easing: Easing.in(Easing.quad) });
      const sh = d >= 4 && d < 12 ? Math.sin(d * 2.7) * (12 - d) * 1.6 : 0;
      return { opacity: interpolate(d, [0, 2], [0, 1], clamp), transform: `translate(${sh}px, ${sh * 0.6}px) scale(${k})` };
    }
    case "wipe": return wipeIn(f, A);
    case "type": return {};
    case "spring": {
      const k = d <= 0 ? 0 : 1 - Math.exp(-d / 3.2) * Math.cos(d * 0.55);
      return { transform: `scale(${Math.max(0, k)})` };
    }
    default: return ghostIn(f, A);
  }
};
export const At: React.FC<{ at: number; until?: number; x: number; y: number; children: React.ReactNode; mode?: AtMode; origin?: string }> = ({ at, until = 999, x, y, children, mode = "ghost", origin = "50% 50%" }) => {
  const f = useCurrentFrame();
  const A = F(at), Z = F(until);
  if (f < A || f >= Z + 5) return null;
  const o = 1 - interpolate(f, [Z, Z + 5], [0, 1], clamp);
  const st = enter(mode, f, A);
  return <div style={{ position: "absolute", left: x, top: y, ...st, opacity: ((st as { opacity?: number }).opacity ?? 1) * o, transformOrigin: origin }}>{mode === "type" ? <TypeIn at={A}>{children}</TypeIn> : children}</div>;
};

// ── 図の部品 ──
export const AiIcon: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ width: s, height: s, borderRadius: s * 0.22, background: "#fff", boxShadow: "0 10px 26px rgba(60,40,20,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={s * 0.62} height={s * 0.62} viewBox="-50 -50 100 100">{Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * Math.PI * 2; const r = i % 2 ? 40 : 46; return <line key={i} x1={0} y1={0} x2={Math.cos(a) * r} y2={Math.sin(a) * r} stroke="#E0784F" strokeWidth={8} strokeLinecap="round" />; })}</svg>
  </div>
);
export const Ripple: React.FC<{ x: number; y: number; at: number; until: number; r?: number }> = ({ x, y, at, until, r = 520 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 8) return null;
  const o = interpolate(f, [F(at), F(at) + 8, F(until), F(until) + 8], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, opacity: o }}>
      {[0, 1, 2].map((k) => { const p = ((f / 30 + k / 3) % 1); return <div key={k} style={{ position: "absolute", inset: r * (1 - (0.35 + p * 0.65)), borderRadius: "50%", background: `rgba(232,85,59,${0.22 * (1 - p)})` }} />; })}
      <div style={{ position: "absolute", inset: r * 0.4, borderRadius: "50%", background: "rgba(232,85,59,0.16)" }} />
    </div>
  );
};
export const Books: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w }}>
    {["#2D3A57", "#3E6650", "#E9DFC6", "#8E3B32", "#4A4A4A", "#C9C1AE"].map((c, i) => (
      <div key={i} style={{ height: w * 0.12, margin: `0 ${(i % 2) * 10}px 4px ${((i + 1) % 2) * 10}px`, borderRadius: 8, background: c, boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.15)", transform: `rotate(${[-2, 1, -1, 2, -1, 1][i]}deg)` }} />
    ))}
  </div>
);
export const Laptop: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w }}>
    <div style={{ height: w * 0.6, background: "#1E2433", borderRadius: 14, border: "10px solid #3A3F4A", padding: 18, boxSizing: "border-box", display: "flex", gap: 14 }}>
      {[0, 1].map((k) => <div key={k} style={{ flex: 1, background: "#283044", borderRadius: 8, padding: 10 }}>{[70, 45, 80, 55, 65].map((wd, j) => <div key={j} style={{ width: `${wd}%`, height: 8, borderRadius: 4, background: j % 2 ? "#7C6BE0" : "#4C8BE0", margin: "8px 0", marginLeft: j % 2 ? 14 : 0 }} />)}</div>)}
    </div>
    <div style={{ height: 16, margin: "0 -26px", background: "#C9CCD3", borderRadius: "0 0 14px 14px" }} />
  </div>
);
export const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number; border?: string }> = ({ children, bg = "#fff", color = INK, size = 30, border = INK }) => (
  <span style={{ display: "inline-block", background: bg, color, border: `3px solid ${border}`, borderRadius: 999, padding: "4px 22px", ...B, fontSize: size, whiteSpace: "nowrap" }}>{children}</span>
);
export const Folder: React.FC<{ w: number; label: string }> = ({ w, label }) => (
  <div style={{ position: "relative", width: w, height: w * 0.48 }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: w * 0.42, height: w * 0.14, background: "#E8A93A", borderRadius: "10px 10px 0 0" }} />
    <div style={{ position: "absolute", left: 0, top: w * 0.1, width: w, height: w * 0.38, background: FOLD, borderRadius: "0 10px 10px 10px", boxShadow: "0 8px 16px rgba(120,80,20,0.18)", display: "flex", alignItems: "center", justifyContent: "center", ...B, fontSize: w * 0.085, color: INK }}>{label}</div>
  </div>
);
export const Phone: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, height: w * 2, borderRadius: w * 0.16, background: "#1C1C1C", padding: w * 0.05, boxSizing: "border-box" }}>
    <div style={{ width: "100%", height: "100%", borderRadius: w * 0.12, background: "linear-gradient(180deg,#F2C79B 0%,#C98A6A 45%,#5E7B8F 100%)", position: "relative" }}>
      <div style={{ position: "absolute", left: "50%", top: "45%", width: w * 0.2, height: w * 0.2, marginLeft: -w * 0.1, borderRadius: "50%", background: "rgba(255,255,255,0.8)" }} />
    </div>
  </div>
);
export const Bag: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ position: "relative", width: w, height: w * 1.15 }}>
    <div style={{ position: "absolute", left: w * 0.28, top: 0, width: w * 0.44, height: w * 0.36, border: `${w * 0.05}px solid #8C6A43`, borderBottom: "none", borderRadius: `${w * 0.22}px ${w * 0.22}px 0 0`, boxSizing: "border-box" }} />
    <div style={{ position: "absolute", left: 0, top: w * 0.25, width: w, height: w * 0.9, background: "linear-gradient(90deg,#C59B6A,#B8895A)", borderRadius: 8, boxShadow: "0 10px 18px rgba(80,50,20,0.2)" }} />
  </div>
);
export const Person: React.FC<{ s: number; happy?: boolean }> = ({ s, happy }) => <GenSlot name={happy ? "kabe_hook_happy" : "kabe_husband_salaryman"} size={s} />;
export const Arrow: React.FC<{ at: number; x1: number; y1: number; x2: number; y2: number; color?: string; dur?: number }> = ({ at, x1, y1, x2, y2, color = RED, dur = 6 }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const p = interpolate(f - F(at), [0, dur], [0, 1], out);
  const x = x1 + (x2 - x1) * p, y = y1 + (y2 - y1) * p, a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={color} strokeWidth={6} strokeLinecap="round" />
      {p > 0.7 ? <path d={`M${x} ${y} L${x - 22 * Math.cos(a - 0.5)} ${y - 22 * Math.sin(a - 0.5)} M${x} ${y} L${x - 22 * Math.cos(a + 0.5)} ${y - 22 * Math.sin(a + 0.5)}`} stroke={color} strokeWidth={6} strokeLinecap="round" fill="none" /> : null}
    </svg>
  );
};
export const Cross: React.FC<{ at: number; x: number; y: number; s: number }> = ({ at, x, y, s }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const a = interpolate(f - F(at), [0, 4], [0, 1], out), b = interpolate(f - F(at), [3, 7], [0, 1], out);
  return <svg width={s} height={s} style={{ position: "absolute", left: x, top: y }}><line x1={8} y1={8} x2={8 + (s - 16) * a} y2={8 + (s - 16) * a} stroke={RED} strokeWidth={10} strokeLinecap="round" />{b > 0 ? <line x1={s - 8} y1={8} x2={s - 8 - (s - 16) * b} y2={8 + (s - 16) * b} stroke={RED} strokeWidth={10} strokeLinecap="round" /> : null}</svg>;
};
export const Count: React.FC<{ at: number; from?: number; to: number; dur: number }> = ({ at, from = 0, to, dur }) => {
  const f = useCurrentFrame();
  return <>{Math.round(interpolate(f, [F(at), F(at) + dur], [from, to], out)).toLocaleString("en-US")}</>;
};
export const Note: React.FC<{ at: number; until?: number; y: number }> = ({ at, until = 999, y }) => <At at={at} until={until} x={60} y={y} mode="fade"><span style={{ ...B, fontSize: 26, color: GRAY }}>※成果には個人差があります</span></At>;

