import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { F, clamp, ease, rise, pop, until } from "../lib/anim";
import { FONT, K } from "../lib/font";
import { T, shadow, track } from "./theme";

// ════════════════════════════════════════════════════════════
//  図解の部品（全部「at＝出る秒」「end＝消える秒」で動く）
//  型：1〜2秒ごとに画面のどこかが変わる／カード＝アイコン＋小見出し＋大きな数字
// ════════════════════════════════════════════════════════════

// 章の札＋大見出し（画面の上・y≈190）
export const Head: React.FC<{ at: number; end?: number; pill: string; title: React.ReactNode; c?: string; top?: number }> = ({ at, end = 999, pill, title, c = T.N, top = 190 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(end)) return null;
  const o = Math.min(interpolate(f - F(at), [0, 8], [0, 1], clamp), until(f, end));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: o, filter: o < 1 ? `blur(${(1 - o) * 8}px)` : undefined }}>
      <span style={{ display: "inline-block", background: `${c}1C`, border: `2.5px solid ${c}`, color: c, borderRadius: 999, padding: "3px 20px", ...K, fontSize: 24, letterSpacing: 1 }}>{pill}</span>
      <div style={{ ...K, fontSize: 64, color: T.ink, marginTop: 14, letterSpacing: 1 }}>{title}</div>
    </div>
  );
};

// 丸いアイコン（中に1文字。例 "¥" "%" "人" "↑"）
export const Dot: React.FC<{ c: string; g: string; s?: number }> = ({ c, g, s = 62 }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: `${c}1E`, border: `2.5px solid ${c}55`, color: c, ...K, fontSize: s * 0.46, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{g}</div>
);

// 役の丸バッジ（人物の絵の代わり。"A" "B" や短い名前）
export const Badge: React.FC<{ c: string; text: string; size?: number }> = ({ c, text, size = 90 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: c, color: "#fff", border: `${Math.max(3, size / 22)}px solid #fff`, boxShadow: `${shadow}, 0 0 0 ${size / 14}px ${c}33`, ...K, fontSize: size * (text.length > 1 ? 0.3 : 0.5), display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{text}</div>
);

// カード：アイコン＋小見出し＋大きな数字。hot＝大事な数字（色で光らせる）
export const Card: React.FC<{ at: number; x: number; y: number; w: number; h?: number; c: string; g?: string; label: string; children: React.ReactNode; big?: number; end?: number; hot?: boolean }> = ({ at, x, y, w, h = 136, c, g, label, children, big = 54, end = 999, hot }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(end)) return null;
  const r = rise(f, at);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", background: hot ? `linear-gradient(180deg, #fff, ${c}14)` : "#fff", borderRadius: 26, border: `3px solid ${hot ? c : `${c}40`}`, boxShadow: hot ? `${shadow}, 0 0 0 8px ${c}18` : shadow, display: "flex", alignItems: "center", gap: 18, padding: "0 24px", ...r, opacity: (r.opacity as number) * until(f, end) }}>
      {g ? <Dot c={c} g={g} /> : null}
      <div style={{ minWidth: 0 }}>
        <div style={{ ...K, fontSize: 22, color: T.sub, letterSpacing: 1, whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ ...K, fontSize: big, color: c, lineHeight: 1.08, whiteSpace: "nowrap" }}>{children}</div>
      </div>
    </div>
  );
};

// 小さな札（ピル）。solid＝塗りつぶし
export const Chip: React.FC<{ at: number; c: string; children: React.ReactNode; style?: React.CSSProperties; solid?: boolean; fs?: number; end?: number }> = ({ at, c, children, style, solid, fs = 30, end = 999 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(end)) return null;
  return <div style={{ position: "absolute", transform: `scale(${pop(f, at)})`, opacity: until(f, end), ...style }}><span style={{ display: "inline-block", whiteSpace: "nowrap", background: solid ? c : "#fff", color: solid ? "#fff" : c, border: `3px solid ${c}`, borderRadius: 999, padding: "6px 22px", ...K, fontSize: fs, boxShadow: shadow }}>{children}</span></div>;
};

// ハンコ（斜めにドン＋少し揺れる）
export const Stamp: React.FC<{ at: number; text: string; c?: string; style?: React.CSSProperties; fs?: number; end?: number }> = ({ at, text, c = T.red, style, fs = 54, end = 999 }) => {
  const f = useCurrentFrame(); const d = f - F(at);
  if (d < 0 || f > F(end)) return null;
  const k = interpolate(d, [0, 4, 7], [2.2, 0.92, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const sh = d >= 4 && d < 12 ? Math.sin(d * 2.6) * (12 - d) * 1.2 : 0;
  return <div style={{ position: "absolute", opacity: interpolate(d, [0, 2], [0, 1], clamp), transform: `translateX(${sh}px) rotate(-7deg) scale(${k})`, ...style }}><span style={{ display: "inline-block", border: `7px solid ${c}`, color: c, background: "rgba(255,255,255,0.94)", borderRadius: 16, padding: "4px 28px", ...K, fontSize: fs, whiteSpace: "nowrap" }}>{text}</span></div>;
};

// 章の扉（番号＋名前が出て、ぼかして消える）
export const Door: React.FC<{ at: number; end: number; no: string; name: string; c: string; children?: React.ReactNode }> = ({ at, end, no, name, c, children }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(end)) return null;
  const o = until(f, end);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, filter: o < 1 ? `blur(${(1 - o) * 10}px)` : undefined }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", ...rise(f, at) }}>
        <div style={{ display: "inline-flex", width: 140, height: 140, borderRadius: "50%", background: c, color: "#fff", ...K, fontSize: 80, alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 14px ${c}26` }}>{no}</div>
        <div style={{ ...K, fontSize: 110, color: c, marginTop: 14, letterSpacing: 4 }}>{name}</div>
        {children}
      </div>
    </div>
  );
};

// しま模様の進みバー（p＝0〜1）
export const Stripe: React.FC<{ x: number; y: number; w: number; h: number; p: number; c: string }> = ({ x, y, w, h, p, c }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: h / 2, background: track, overflow: "hidden", boxShadow: "inset 0 3px 6px rgba(30,50,90,0.10)" }}>
      <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: h / 2, background: `repeating-linear-gradient(-45deg, ${c} 0 18px, ${c}CC 18px 36px)`, backgroundPosition: `${f * 2}px 0` }} />
    </div>
  );
};

// ドーナツ（parts の割合で1つずつ色が入る）
export const Donut: React.FC<{ cx: number; cy: number; r?: number; w?: number; parts: { v: number; c: string; at: number; dur?: number }[]; children?: React.ReactNode }> = ({ cx, cy, r = 190, w = 70, parts, children }) => {
  const f = useCurrentFrame();
  const L = 2 * Math.PI * r; const total = parts.reduce((a, p) => a + p.v, 0);
  let acc = 0;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={track} strokeWidth={w} />
        {parts.map((p, i) => { const start = acc; acc += p.v; const k = (p.v / total) * ease(f, p.at, p.dur ?? 0.7); return k > 0 ? <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={p.c} strokeWidth={w + (i ? 8 : 0)} strokeDasharray={`${L * k} ${L}`} strokeDashoffset={-L * (start / total)} transform={`rotate(-90 ${cx} ${cy})`} /> : null; })}
      </svg>
      {children ? <div style={{ position: "absolute", left: cx - r, width: r * 2, top: cy - 70, textAlign: "center" }}>{children}</div> : null}
    </>
  );
};

// 横棒のシナリオ比較（棒が伸びて数字が増える）。line＝基準の点線（例：貯金だけの額）
export const HBars: React.FC<{ x?: number; y: number; w?: number; max: number; rows: { label: string; v: number; at: number; c: string; text?: string }[]; line?: { v: number; at: number; label: string; c: string } }> = ({ x = 260, y, w = 640, max, rows, line }) => {
  const f = useCurrentFrame();
  const XV = (v: number) => x + (w * v) / max;
  return (
    <>
      {rows.map((r, i) => { const yy = y + i * 150; const p = ease(f, r.at, 0.7); return f >= F(r.at) ? (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: 100, top: yy + 16, width: x - 110, ...K, fontSize: 34, color: T.ink, ...rise(f, r.at) }}>{r.label}</div>
          <div style={{ position: "absolute", left: x, top: yy, height: 84, width: (XV(r.v) - x) * p, borderRadius: 18, background: `linear-gradient(90deg, ${r.c}AA, ${r.c})`, boxShadow: shadow }} />
          <div style={{ position: "absolute", left: x + 18, top: yy + 16, ...K, fontSize: 40, color: "#fff", whiteSpace: "nowrap" }}>{r.text ?? Math.round(r.v * p).toLocaleString("ja-JP")}</div>
        </React.Fragment>) : null; })}
      {line && f >= F(line.at) ? <>
        <div style={{ position: "absolute", left: XV(line.v), top: y - 20, height: rows.length * 150 + 10, borderLeft: `5px dashed ${line.c}`, transformOrigin: "top", transform: `scaleY(${ease(f, line.at, 0.5)})` }} />
        <Chip at={line.at + 0.3} c={line.c} style={{ left: XV(line.v) - 110, top: y - 80 }} fs={26}>{line.label}</Chip>
      </> : null}
    </>
  );
};

// 折れ線（点線＝基準、太線＝伸びる線。先頭に丸＋今の値の札がついていく）
export const LineGrow: React.FC<{ box: { x: number; y: number; w: number; h: number }; max: number; n: number; base: (i: number) => number; val: (i: number) => number; at: number; dur?: number; baseAt?: number; c: string; fmt: (v: number) => string; xLabels?: [number, string][]; yStep?: number; yFmt?: (v: number) => string; head?: React.ReactNode }> = ({ box, max, n, base, val, at, dur = 3, baseAt, c, fmt, xLabels = [], yStep, yFmt = (v) => String(v), head }) => {
  const f = useCurrentFrame();
  const x0 = box.x + 90, x1 = box.x + box.w - 50, y0 = box.y + box.h - 90, y1 = box.y + 70;
  const X = (i: number) => x0 + ((x1 - x0) * i) / n; const Y = (v: number) => y0 - ((y0 - y1) * v) / max;
  const mB = n * interpolate(f, [F(baseAt ?? at - 1), F((baseAt ?? at - 1) + 0.8)], [0, 1], clamp);
  const mA = n * interpolate(f, [F(at), F(at + dur)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const step = Math.max(1, Math.round(n / 60));
  const pts = (m: number, fn: (i: number) => number) => { const a: string[] = []; for (let i = 0; i <= m; i += step) a.push(`${X(i)},${Y(fn(i))}`); return a; };
  const show = f >= F((baseAt ?? at - 1) - 0.4);
  const mi = Math.floor(mA / step) * step;
  return show ? (
    <>
      <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, background: "#fff", borderRadius: 30, boxShadow: shadow }} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {yStep ? Array.from({ length: Math.floor(max / yStep) }).map((_, k) => { const v = (k + 1) * yStep; return <g key={v}><line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke={track} strokeWidth={2} /><text x={x0 - 14} y={Y(v) + 8} textAnchor="end" fontSize={22} fill={T.sub} fontFamily={FONT} fontWeight={700}>{yFmt(v)}</text></g>; }) : null}
        <line x1={x0} x2={x1} y1={y0} y2={y0} stroke={T.ink} strokeWidth={4} />
        {xLabels.map(([i, s]) => <text key={i} x={X(i)} y={y0 + 40} textAnchor="middle" fontSize={24} fill={T.sub} fontFamily={FONT} fontWeight={700}>{s}</text>)}
        {mA > 0 ? <polygon points={[...pts(mi, val), ...pts(mi, base).reverse()].join(" ")} fill={`${T.gold}38`} /> : null}
        {mB > 0 ? <polyline points={pts(mB, base).join(" ")} fill="none" stroke={T.gray} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" /> : null}
        {mA > 0 ? <polyline points={pts(mA, val).join(" ")} fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
      {mA > 0 ? (
        <div style={{ position: "absolute", left: X(mi), top: Y(val(mi)), transform: "translate(-50%, -50%)" }}>
          {head ?? <div style={{ width: 34, height: 34, borderRadius: "50%", background: c, border: "6px solid #fff", boxShadow: shadow }} />}
          <div style={{ position: "absolute", left: "50%", bottom: 54, transform: "translateX(-50%)", whiteSpace: "nowrap", background: c, color: "#fff", borderRadius: 999, padding: "4px 16px", ...K, fontSize: 30 }}>{fmt(val(mi))}</div>
        </div>) : null}
    </>
  ) : null;
};

// ＋−の2列まとめ（役ごとのカード）
export const PlusMinus: React.FC<{ at: number; cols: { title: string; c: string; badge?: string; items: { plus: boolean; text: string; at: number }[] }[]; y?: number; h?: number }> = ({ at, cols, y = 400, h = 430 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {cols.map((col, i) => (
        <div key={i} style={{ position: "absolute", left: i === 0 ? 100 : 580, top: y, width: 400, height: h, background: "#fff", borderRadius: 30, border: `3px solid ${col.c}40`, boxShadow: shadow, ...rise(f, at + i * 0.2) }}>
          <div style={{ height: 120, borderRadius: "27px 27px 0 0", background: `${col.c}16`, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            {col.badge ? <Badge c={col.c} text={col.badge} size={78} /> : null}<span style={{ ...K, fontSize: 44, color: col.c }}>{col.title}</span>
          </div>
          {col.items.map((l, k) => f >= F(l.at) ? (
            <div key={k} style={{ position: "absolute", left: 28, right: 16, top: 160 + k * 120, display: "flex", alignItems: "center", gap: 14, ...rise(f, l.at) }}>
              <span style={{ width: 54, height: 54, borderRadius: "50%", background: l.plus ? T.green : T.red, color: "#fff", ...K, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{l.plus ? "＋" : "−"}</span>
              <span style={{ ...K, fontSize: 36, color: T.ink, whiteSpace: "nowrap" }}>{l.text}</span>
            </div>
          ) : null)}
        </div>
      ))}
    </>
  );
};

// 最後のチェック（枠が出て、少し後にチェックが入る）
export const CheckLine: React.FC<{ at: number; checkAt: number; y: number; children: React.ReactNode }> = ({ at, checkAt, y, children }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return (
    <div style={{ position: "absolute", left: 100, right: 100, top: y, background: "#fff", borderRadius: 26, border: `3px solid ${T.gold}`, boxShadow: `${shadow}, 0 0 0 8px ${T.gold}22`, padding: "22px 28px", display: "flex", alignItems: "center", gap: 20, ...rise(f, at) }}>
      <span style={{ width: 60, height: 60, borderRadius: 14, border: `5px solid ${T.ink}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 46, color: T.green, flex: "none", transform: f >= F(checkAt) ? `scale(${pop(f, checkAt)})` : undefined }}>{f >= F(checkAt) ? "✓" : ""}</span>
      <div style={{ ...K, fontSize: 36, color: T.ink, lineHeight: 1.35 }}>{children}</div>
    </div>
  );
};

// ポンと出て、ゆっくり上下する入れ物（絵や札をのせる）
export const Bounce: React.FC<{ at: number; end?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, end = 999, style, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (f < F(at) || f > F(end)) return null;
  const s = spring({ frame: f - F(at), fps, config: { damping: 11, stiffness: 170, mass: 0.7 } });
  return <div style={{ position: "absolute", transform: `translateY(${(1 - s) * 60 + Math.sin(f / 13) * 4}px) scale(${0.7 + 0.3 * s})`, opacity: Math.min(1, s * 2) * until(f, end), ...style }}>{children}</div>;
};
