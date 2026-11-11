import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, clamp, count, num, pop, rise } from "../lib/anim";
import { K } from "../lib/font";
import { T, shadow } from "../diagram/theme";
import { Chip, Stamp } from "../diagram/parts";
import type { Insert } from "./types";

// ════════════════════════════════════════════════════════════
//  トークの上にのせる図解（plan.ts の inserts に書くだけで出る）
//  ・上にのせる型（title / steps / number / flow / check）＝頭の上のすき間（y 140〜640）に置く。顔にかぶせない
//  ・全画面の型（compare）＝紙の背景で映像をかくす。数字の比較など「図で見せたい所」だけに使う
//  ・stamp＝山場のハンコ（顔の横）
//  目安：全画面の図解 1 ： 顔を見せる時間 2
// ════════════════════════════════════════════════════════════

// 出入り（上にのせる型）：下から出て、最後の0.25秒で消える
const Wrap: React.FC<{ from: number; to: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ from, to, children, style }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(to) - 8, F(to)], [1, 0], clamp);
  const r = rise(f, from);
  return <div style={{ position: "absolute", left: 0, right: 0, ...style, ...r, opacity: (r.opacity as number) * out }}>{children}</div>;
};
const card: React.CSSProperties = { background: "rgba(255,255,255,0.96)", borderRadius: 28, boxShadow: shadow };

const TitleIns: React.FC<{ from: number; to: number; pill?: string; text: string }> = ({ from, to, pill, text }) => (
  <Wrap from={from} to={to} style={{ top: 170, textAlign: "center" }}>
    {pill ? <div style={{ marginBottom: 12 }}><span style={{ background: T.red, color: "#fff", borderRadius: 999, padding: "6px 24px", ...K, fontSize: 30 }}>{pill}</span></div> : null}
    <span style={{ ...card, display: "inline-block", padding: "18px 40px", ...K, fontSize: 60, color: T.ink }}>{text}</span>
  </Wrap>
);

const StepsIns: React.FC<{ from: number; to: number; title: string; items: string[]; gap?: number }> = ({ from, to, title, items, gap = 0.6 }) => {
  const f = useCurrentFrame();
  return (
    <Wrap from={from} to={to} style={{ top: 150 }}>
      <div style={{ textAlign: "center" }}><span style={{ background: T.ink, color: "#fff", borderRadius: 999, padding: "10px 32px", ...K, fontSize: 40 }}>{title}</span></div>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 26 }}>
        {items.map((it, i) => { const at = from + 0.3 + i * gap; return f >= F(at) ? (
          <div key={i} style={{ ...card, width: Math.min(300, 920 / items.length - 18), padding: "18px 10px", textAlign: "center", transform: `scale(${pop(f, at)})` }}>
            <div style={{ margin: "0 auto 8px", width: 54, height: 54, borderRadius: "50%", background: T.N, color: "#fff", ...K, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
            <div style={{ ...K, fontSize: 38, color: T.ink, lineHeight: 1.2 }}>{it}</div>
          </div>) : <div key={i} style={{ width: Math.min(300, 920 / items.length - 18) }} />; })}
      </div>
    </Wrap>
  );
};

const NumberIns: React.FC<{ from: number; to: number; label: string; value: number; unit?: string; note?: string }> = ({ from, to, label, value, unit, note }) => {
  const f = useCurrentFrame();
  return (
    <Wrap from={from} to={to} style={{ top: 170, textAlign: "center" }}>
      <div style={{ ...card, display: "inline-block", padding: "20px 50px 24px" }}>
        <div style={{ ...K, fontSize: 30, color: T.sub }}>{label}</div>
        <div style={{ ...K, fontSize: 130, color: T.red, lineHeight: 1.05 }}>{num(count(f, from + 0.2, value, 0.6))}<span style={{ fontSize: 56 }}>{unit}</span></div>
        {note ? <div style={{ ...K, fontSize: 22, color: T.sub, marginTop: 4 }}>{note}</div> : null}
      </div>
    </Wrap>
  );
};

const FlowIns: React.FC<{ from: number; to: number; items: string[]; gap?: number }> = ({ from, to, items, gap = 0.55 }) => {
  const f = useCurrentFrame();
  return (
    <Wrap from={from} to={to} style={{ top: 200 }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
        {items.map((it, i) => { const at = from + 0.2 + i * gap; const last = i === items.length - 1; return (
          <React.Fragment key={i}>
            {i > 0 ? <div style={{ ...K, fontSize: 50, color: T.ink, opacity: interpolate(f, [F(at) - 6, F(at)], [0, 1], clamp) }}>→</div> : null}
            <div style={{ ...card, padding: "18px 26px", ...K, fontSize: 40, color: last ? "#fff" : T.ink, background: last ? T.green : card.background, opacity: f >= F(at) ? 1 : 0, transform: `scale(${f >= F(at) ? pop(f, at) : 0.3})` }}>{it}</div>
          </React.Fragment>); })}
      </div>
    </Wrap>
  );
};

const CheckIns: React.FC<{ from: number; to: number; title: string; items: string[]; gap?: number }> = ({ from, to, title, items, gap = 0.7 }) => {
  const f = useCurrentFrame();
  return (
    <Wrap from={from} to={to} style={{ top: 150, display: "flex", justifyContent: "center" }}>
      <div style={{ ...card, background: "rgba(24,30,46,0.94)", padding: "22px 34px", minWidth: 620 }}>
        <div style={{ ...K, fontSize: 36, color: "#fff", marginBottom: 10 }}>{title}</div>
        {items.map((it, i) => { const at = from + 0.3 + i * gap; return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 0", opacity: f >= F(at) ? 1 : 0.25 }}>
            <span style={{ width: 46, height: 46, borderRadius: 10, background: f >= F(at) ? T.green : "transparent", border: "3px solid #fff", color: "#fff", ...K, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", transform: f >= F(at) ? `scale(${pop(f, at)})` : undefined }}>{f >= F(at) ? "✓" : ""}</span>
            <span style={{ ...K, fontSize: 38, color: "#fff" }}>{it}</span>
          </div>); })}
      </div>
    </Wrap>
  );
};

// 全画面：2つの数字を比べる（紙の背景で映像をかくす → 2枚のカード → 差のカッコ）
const CompareIns: React.FC<{ from: number; to: number; title: string; a: { name: string; value: number; unit?: string }; b: { name: string; value: number; unit?: string }; diffLabel?: string }> = ({ from, to, title, a, b, diffLabel = "差" }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [F(from), F(from) + 7], [0, 1], clamp), interpolate(f, [F(to) - 7, F(to)], [1, 0], clamp));
  const sc = interpolate(f, [F(from), F(from) + 9], [1.06, 1], clamp);
  const rows = [{ ...a, c: T.A, at: from + 0.5 }, { ...b, c: T.B, at: from + 1.3 }];
  const diff = Math.abs(a.value - b.value);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${sc})`, filter: o < 1 ? `blur(${(1 - o) * 8}px)` : undefined, background: T.paper, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${T.line} 62px 64px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", ...K, fontSize: 64, color: T.ink }}>{title}</div>
      {rows.map((r, i) => f >= F(r.at) ? (
        <div key={i} style={{ position: "absolute", left: 100, top: 420 + i * 220, width: 640, height: 180, boxSizing: "border-box", background: "#fff", borderRadius: 26, border: `3px solid ${r.c}55`, boxShadow: shadow, display: "flex", alignItems: "center", gap: 22, padding: "0 28px", ...rise(f, r.at) }}>
          <div><div style={{ ...K, fontSize: 26, color: T.sub }}>{r.name}</div><div style={{ ...K, fontSize: 84, color: r.c, lineHeight: 1 }}>{num(count(f, r.at, r.value, 0.6))}<span style={{ fontSize: 38 }}>{r.unit}</span></div></div>
        </div>) : null)}
      {f >= F(from + 2.1) ? <div style={{ position: "absolute", left: 770, top: 510, width: 46, height: 220, borderRight: `6px solid ${T.red}`, borderTop: `6px solid ${T.red}`, borderBottom: `6px solid ${T.red}`, borderRadius: "0 14px 14px 0", transformOrigin: "left center", transform: `scaleX(${interpolate(f, [F(from + 2.1), F(from + 2.4)], [0, 1], clamp)})` }} /> : null}
      {f >= F(from + 2.4) ? <div style={{ position: "absolute", left: 830, top: 560, width: 170, textAlign: "center", ...K, color: T.red, transform: `scale(${pop(f, from + 2.4)})` }}><div style={{ fontSize: 26 }}>{diffLabel}</div><div style={{ fontSize: 54, lineHeight: 1 }}>{num(count(f, from + 2.4, diff, 0.5))}</div><div style={{ fontSize: 26 }}>{a.unit ?? b.unit}</div></div> : null}
    </AbsoluteFill>
  );
};

// 本人の胸の前に大きな数字（緑の極太・光る・カウントアップ）
const BigNum: React.FC<{ from: number; to: number; value: number; pre?: string; unit?: string; color?: string }> = ({ from, to, value, pre = "", unit = "", color = "#3BE36B" }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [F(from), F(from) + 4], [0, 1], clamp), interpolate(f, [F(to) - 5, F(to)], [1, 0], clamp));
  const k = interpolate(f - F(from), [0, 4, 9], [1.35, 0.96, 1], clamp);
  return <div style={{ position: "absolute", left: 0, right: 0, top: 1010, textAlign: "center", opacity: o, transform: `scale(${k})`, ...K, fontSize: 190, color, lineHeight: 1, textShadow: `0 0 30px ${color}88, 0 8px 24px rgba(0,0,0,0.45)` }}>{pre}{num(count(f, from, value, 0.6))}<span style={{ fontSize: 90 }}>{unit}</span></div>;
};

export const InsertLayer: React.FC<{ inserts: Insert[] }> = ({ inserts }) => {
  const f = useCurrentFrame();
  return (
    <>
      {inserts.map((it, i) => {
        if (f < F(it.from) || f > F(it.to)) return null;
        const k = { from: it.from, to: it.to };
        switch (it.type) {
          case "title": return <TitleIns key={i} {...k} {...it.props} />;
          case "steps": return <StepsIns key={i} {...k} {...it.props} />;
          case "number": return <NumberIns key={i} {...k} {...it.props} />;
          case "flow": return <FlowIns key={i} {...k} {...it.props} />;
          case "check": return <CheckIns key={i} {...k} {...it.props} />;
          case "compare": return <CompareIns key={i} {...k} {...it.props} />;
          case "stamp": return <Stamp key={i} at={it.from} end={it.to} text={it.props.text} style={{ left: 560, top: 820 }} />;
          case "bignum": return <BigNum key={i} {...k} {...it.props} />;
        }
      })}
    </>
  );
};
export const isFull = (it: Insert) => it.type === "compare";
export { Chip };
