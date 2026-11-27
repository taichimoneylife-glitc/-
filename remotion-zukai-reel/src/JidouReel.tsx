import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { K, B, SER, M, F } from "./components/marke";
import { GenSlot } from "./MileLifePlan";
import { Stepper } from "./components/board";
import { TypeIn } from "./components/zukaiKit";
import { SfxTrack } from "./components/sfx";
import { TapCard } from "./components/tapCard";
import { camAt, CamKey, motionBlur, GrowPath, cardIn, at } from "./components/flowKit";
import { enter } from "./components/motionLib";
import { JIDOU_MOUTH } from "./jidouMouth";

// ════════════════════════════════════════════════════════════════════
//  児童手当（声 public/jidou-narration.wav 51.3秒・「わが家は〜」から。冒頭のあいさつは声に入っていない）台本：assets/script_jidou_teate.md
//  作り：更新型（KoshinReel）と同じ＝ノート1冊をカメラが追う／安全な枠／カラオケ字幕／口パク／回る枠は話している間だけ
//  色：児童手当・運用＝緑、0〜3歳の上乗せ・成長投資枠＝オレンジ、銀行＝青、物価・危ない所＝赤
// ════════════════════════════════════════════════════════════════════
const G = M.green, O = M.orange, INK = M.ink, RED = M.red, YEL = "#FFE15A";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const p01 = (f: number, a: number, b: number, e = OUT) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

// ── 部品 ──
const Head: React.FC<{ y: number; t: number; no: string; title: string; c?: string }> = ({ y, t, no, title, c = RED }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 70, top: y, display: "flex", alignItems: "center", gap: 18 }}>
      <span style={{ background: c, color: "#fff", borderRadius: 999, padding: "6px 26px", ...K, fontSize: 38, display: "inline-block", ...enter(f, F(t), "stamp", "kire") }}>{no}</span>
      <span style={{ ...K, fontSize: 62, color: INK }}>{f >= F(t) + 4 ? <TypeIn at={F(t) + 4} step={1.4}>{title}</TypeIn> : null}</span>
    </div>
  );
};
// マーカー：左から一気に引かれる
const Marker: React.FC<{ t: number; children: React.ReactNode; c?: string }> = ({ t, children, c = YEL }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t), F(t) + 7);
  return <span style={{ position: "relative", display: "inline-block" }}><span style={{ position: "absolute", left: -6, right: -6, bottom: 4, height: "42%", background: c, transformOrigin: "0 50%", transform: `scaleX(${p}) skewX(-8deg)`, borderRadius: 6, zIndex: 0 }} /><span style={{ position: "relative" }}>{children}</span></span>;
};
// 数字が回って止まる（桁ごとに少しずつ遅れて止まる）
const Roll: React.FC<{ t: number; text: string; dur?: number }> = ({ t, text, dur = 12 }) => {
  const f = useCurrentFrame();
  let d = 0;
  return <>{text.split("").map((ch, i) => {
    if (!/[0-9]/.test(ch)) return <span key={i}>{ch}</span>;
    const stop = F(t) + dur + d * 3; d++;
    const k = f - F(t);
    if (k < 0) return <span key={i} style={{ opacity: 0 }}>{ch}</span>;
    const shown = f >= stop ? ch : String((Number(ch) + 3 + Math.floor((stop - f) * 1.7) * 7) % 10);
    const land = f >= stop ? interpolate(f - stop, [0, 2, 5], [-10, 4, 0], clamp) : 0;
    return <span key={i} style={{ display: "inline-block", transform: `translateY(${land}px)`, filter: f < stop ? "blur(1.5px)" : undefined }}>{shown}</span>;
  })}</>;
};
// 光の輪（合体・ハンコの瞬間）
const Burst: React.FC<{ t: number; x: number; y: number; c?: string; r?: number; n?: number }> = ({ t, x, y, c = YEL, r = 170, n = 12 }) => {
  const f = useCurrentFrame();
  const k = f - F(t);
  if (k < 0 || k > 14) return null;
  const p = p01(f, F(t), F(t) + 12);
  return (
    <svg width={r * 3} height={r * 3} style={{ position: "absolute", left: x - r * 1.5, top: y - r * 1.5, overflow: "visible", pointerEvents: "none" }}>
      <circle cx={r * 1.5} cy={r * 1.5} r={r * (0.3 + 0.9 * p)} fill="none" stroke={c} strokeWidth={14 * (1 - p)} />
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2, r1 = r * (0.5 + 0.7 * p), r2 = r * (0.75 + 0.85 * p);
        return <line key={i} x1={r * 1.5 + Math.cos(a) * r1} y1={r * 1.5 + Math.sin(a) * r1} x2={r * 1.5 + Math.cos(a) * r2} y2={r * 1.5 + Math.sin(a) * r2} stroke={c} strokeWidth={10 * (1 - p)} strokeLinecap="round" />;
      })}
    </svg>
  );
};
const Img: React.FC<{ name: string; x: number; y: number; size: number; t: number; pat?: Parameters<typeof enter>[2]; tempo?: Parameters<typeof enter>[3]; style?: React.CSSProperties }> = ({ name, x, y, size, t, pat = "pop", tempo = "std", style }) => {
  const f = useCurrentFrame();
  const alive = /^(k[hn]|jt|nb)_(man|father|hospital|elderly|long|couple|umbrella|review|kid|parent|family|child|teen|shopping|crash|lump)/.test(name);
  const k = f - F(t) - 10;
  const br = alive && k > 0 ? Math.sin(k / 11) : 0; // 出ている間ずっと小さく呼吸
  return <div style={{ position: "absolute", left: x, top: y, ...enter(f, F(t), pat, tempo), ...style }}><div style={{ transform: `scale(${1 + 0.012 * br}, ${1 - 0.012 * br})`, transformOrigin: "50% 100%" }}><GenSlot name={name} size={size} /></div></div>;
};
const Chip: React.FC<{ c?: string; children: React.ReactNode; size?: number; bg?: string }> = ({ c = RED, children, size = 38, bg = "#fff" }) => (
  <span style={{ display: "inline-block", background: bg, border: `5px solid ${c}`, borderRadius: 16, padding: "8px 22px", ...K, fontSize: size, color: INK, boxShadow: `5px 5px 0 ${INK}`, whiteSpace: "nowrap" }}>{children}</span>
);
const Pos: React.FC<{ x: number; y: number; t: number; pat?: Parameters<typeof enter>[2]; tempo?: Parameters<typeof enter>[3]; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, t, pat = "pop", tempo = "std", children, style }) => {
  const f = useCurrentFrame();
  const e = enter(f, F(t), pat, tempo);
  const op = (e.opacity === undefined ? 1 : Number(e.opacity)) * (style?.opacity === undefined ? 1 : Number(style.opacity));
  return <div style={{ position: "absolute", left: x, top: y, ...e, ...style, opacity: op }}>{children}</div>;
};
const Stamp: React.FC<{ x: number; y: number; t: number; c?: string; size?: number; rot?: number; children: React.ReactNode }> = ({ x, y, t, c = RED, size = 54, rot = -6, children }) => (
  <Pos x={x} y={y} t={t} pat="stamp" tempo="kire"><span style={{ display: "inline-block", border: `8px solid ${c}`, color: c, background: "rgba(255,255,255,0.95)", borderRadius: 18, padding: "6px 28px", ...K, fontSize: size, transform: `rotate(${rot}deg)`, whiteSpace: "nowrap" }}>{children}</span></Pos>
);
const Note: React.FC<{ x: number; y: number; t: number; w?: number; children: React.ReactNode }> = ({ x, y, t, w = 900, children }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: x, top: y, width: w, ...B, fontSize: 24, color: M.sub, lineHeight: 1.4, ...cardIn(f, F(t)) }}>{children}</div>;
};

// 光が右回りに走る枠：枠が描かれる → 光の粒が枠の上を時計回りにぐるぐる回り続ける
const rrect = (x0: number, y0: number, x1: number, y1: number, r = 16) =>
  `M${x0 + r} ${y0} H${x1 - r} Q${x1} ${y0} ${x1} ${y0 + r} V${y1 - r} Q${x1} ${y1} ${x1 - r} ${y1} H${x0 + r} Q${x0} ${y1} ${x0} ${y1 - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`;
const GlowBox: React.FC<{ box: [number, number, number, number]; start: number; end: number; c?: string; w?: number; speed?: number }> = ({ box, start, end, c = RED, w = 7, speed = 0.022 }) => {
  const f = useCurrentFrame();
  if (f < start || f > end + 10) return null;
  const fade = 1 - p01(f, end, end + 10); // 話が次へ進んだら、光も枠もすっと消える
  const d = rrect(...box);
  const p = at([0, 0.06, 0.16, 0.3, 0.46, 0.62, 0.76, 0.87, 0.95, 1], f - start);
  const head = -(f - start) * speed; // 時計回りに進む
  const seg = (len: number, width: number, color: string, op: number, blur?: number) => (
    <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${len} ${1 - len}`} strokeDashoffset={head + len} opacity={op * p01(f, start + 6, start + 12)} style={blur ? { filter: `blur(${blur}px)` } : undefined} />
  );
  return (
    <g opacity={fade}>
      {/* 土台の枠（描かれていく） */}
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.85} />
      {/* 走る光：ぼんやりした尾 → 明るい芯 → 白い先頭 */}
      {seg(0.22, w * 4, c, 0.55, 8)}
      {seg(0.12, w * 1.6, "#FF9A8A", 0.95)}
      {seg(0.035, w * 1.2, "#fff", 1)}
    </g>
  );
};
const HeroCut: React.FC<{ t0: number; t1: number; bg?: string; children: React.ReactNode; sweep?: boolean }> = ({ t0, t1, bg = INK, children, sweep }) => {
  const f = useCurrentFrame();
  if (f < F(t0) || f > F(t1) + 6) return null;
  const k = f - F(t0);
  const inP = p01(f, F(t0), F(t0) + 4, Easing.out(Easing.cubic));
  const out = p01(f, F(t1), F(t1) + 6, Easing.in(Easing.cubic));
  const slam = at([1.7, 1.25, 0.96, 1.03, 1], k);
  if (sweep) {
    const x = interpolate(f, [F(t0), F(t1) + 6], [-1300, 1300], clamp);
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: x, top: 380, width: 1400, height: 420, background: `linear-gradient(90deg, ${G}00, ${G}EE 30%, ${G}EE 70%, ${G}00)`, transform: "skewY(-8deg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 80px ${G}` }}>{children}</div>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 1 - out }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 38%, ${bg}F0 0%, ${bg}FA 55%, #000 100%)`, opacity: inP }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.35 * inP }}>
        {Array.from({ length: 28 }).map((_, i) => { const a = (i / 28) * Math.PI * 2; const r0 = 420 + ((i * 53) % 90) + k * 10; return <line key={i} x1={540 + Math.cos(a) * r0} y1={720 + Math.sin(a) * r0} x2={540 + Math.cos(a) * (r0 + 500)} y2={720 + Math.sin(a) * (r0 + 500)} stroke="#fff" strokeWidth={6} />; })}
      </svg>
      <div style={{ position: "absolute", left: 40, width: 880, top: 300, height: 840, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${slam}) translateY(${-out * 60}px)`, filter: k < 3 ? `blur(${(3 - k) * 3}px)` : undefined }}>{children}</div>
    </div>
  );
};

// ── 共通：横長の帯（棒）が左から伸びる ──
const Bar: React.FC<{ x: number; y: number; w: number; h: number; t: number; dur?: number; c: string; children?: React.ReactNode; r?: number }> = ({ x, y, w, h, t, dur = 10, c, children, r = 12 }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t), F(t) + dur);
  if (p <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w * p, height: h, background: c, borderRadius: r, border: `5px solid ${INK}`, boxSizing: "border-box", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 28, color: "#fff", whiteSpace: "nowrap" }}>{p > 0.6 ? children : null}</div>;
};
// 縦の棒グラフ（下から伸びる）
const VBar: React.FC<{ x: number; base: number; w: number; h: number; t: number; dur?: number; c: string; hatch?: boolean }> = ({ x, base, w, h, t, dur = 14, c, hatch }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t), F(t) + dur, Easing.out(Easing.cubic));
  if (p <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: base - h * p, width: w, height: h * p, background: c, border: `6px solid ${INK}`, borderBottom: "none", borderRadius: "16px 16px 0 0", boxSizing: "border-box", backgroundImage: hatch ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 10px, transparent 10px 20px)" : undefined }} />;
};
const Cross: React.FC<{ x: number; y: number; t: number; s?: number; c?: string }> = ({ x, y, t, s = 120, c = RED }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t), F(t) + 8);
  if (p <= 0) return null;
  return (
    <svg width={s} height={s} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <path d={`M10 10 L${s - 10} ${s - 10}`} stroke={c} strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, p * 2)} />
      <path d={`M${s - 10} 10 L10 ${s - 10}`} stroke={c} strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, p * 2 - 1)} />
    </svg>
  );
};
const Ring: React.FC<{ x: number; y: number; t: number; s?: number; c?: string }> = ({ x, y, t, s = 120, c = G }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t), F(t) + 9);
  if (p <= 0) return null;
  return <svg width={s} height={s} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}><circle cx={s / 2} cy={s / 2} r={s / 2 - 10} fill="none" stroke={c} strokeWidth={18} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform={`rotate(-90 ${s / 2} ${s / 2})`} strokeLinecap="round" /></svg>;
};
// 小さな折れ線（短期＝途中でへこんで終わる／長期＝へこみながら右肩上がり）
const MiniLine: React.FC<{ x: number; y: number; w: number; h: number; t: number; dur: number; pts: number[]; c: string }> = ({ x, y, w, h, t, dur, pts, c }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t), F(t) + dur, Easing.inOut(Easing.cubic));
  const d = pts.map((v, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * w} ${h - v * h}`).join(" ");
  if (p <= 0) return null;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <line x1={0} y1={h} x2={w} y2={h} stroke={INK} strokeWidth={4} />
      <line x1={0} y1={0} x2={0} y2={h} stroke={INK} strokeWidth={4} />
      <path d={d} fill="none" stroke={c} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};
const Lbl: React.FC<{ x: number; y: number; t: number; size?: number; c?: string; pat?: Parameters<typeof enter>[2]; children: React.ReactNode; w?: number; center?: boolean }> = ({ x, y, t, size = 30, c = INK, pat = "pop", children, w, center }) => (
  <Pos x={x} y={y} t={t} pat={pat} tempo="kire"><div style={{ ...K, fontSize: size, color: c, lineHeight: 1.3, whiteSpace: "nowrap", width: w, textAlign: center ? "center" : undefined }}>{children}</div></Pos>
);

// ══ ① わが家は：児童手当 → NISA（成長投資枠に一括）（0〜5.1）══
const SA: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Head y={40} t={0.03} no="わが家" title="児童手当の使い道" c={G} />
    <Img name="jt_family_2y0y" x={50} y={150} size={330} t={0.05} pat="drop" tempo="bounce" />
    {/* 入金の通知 */}
    <Pos x={420} y={180} t={0.45} pat="whip" tempo="brake">
      <div style={{ width: 600, background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, boxShadow: `6px 6px 0 ${INK}`, padding: "14px 22px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 62, height: 62, borderRadius: 16, background: G, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>🔔</div>
        <div><div style={{ ...B, fontSize: 24, color: M.sub }}>お知らせ</div><div style={{ ...K, fontSize: 34, whiteSpace: "nowrap" }}>児童手当が入金されました</div></div>
      </div>
    </Pos>
    <svg width={1080} height={1200} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <GrowPath d="M710 300 L710 420" start={F(1.0)} kind="lineShort" color={INK} w={8} glow={false} />
      <path d="M690 400 L710 432 L730 400" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={p01(f, F(1.25), F(1.35))} />
    </svg>
    {/* NISA の箱：つみたて投資枠 ｜ 成長投資枠 */}
    <div style={{ position: "absolute", left: 420, top: 450, width: 580, ...enter(f, F(1.2), "pop", "bounce") }}>
      <div style={{ background: INK, color: "#fff", ...K, fontSize: 40, textAlign: "center", borderRadius: "18px 18px 0 0", padding: "6px 0" }}>NISA</div>
      <div style={{ display: "flex", border: `6px solid ${INK}`, borderTop: "none", borderRadius: "0 0 18px 18px", background: "#fff", height: 210 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 32, color: M.gray, borderRight: `4px dashed ${M.gray}`, opacity: f >= F(3.4) ? 0.45 : 1 }}>つみたて<br />投資枠</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...K, fontSize: 32, color: O, background: f >= F(3.4) ? "#FFF1E2" : undefined }}>成長<br />投資枠</div>
      </div>
    </div>
    <svg width={1080} height={1200} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <GlowBox box={[712, 506, 1000, 728]} start={F(3.4)} end={F(5.0)} c={O} />
    </svg>
    <Stamp x={760} y={400} t={1.42} size={64} rot={-10}>全額</Stamp>
    <Burst t={1.42} x={850} y={440} c={RED} r={160} />
    <Img name="jt_lump_sum_drop" x={60} y={520} size={360} t={2.75} pat="slideUp" tempo="brake" />
    {/* 成長投資枠にコインがまとめて落ちる */}
    {Array.from({ length: 9 }).map((_, i) => {
      const t0 = F(3.55) + i * 1.3;
      const k = f - t0;
      if (k < 0 || k > 16) return null;
      const y = 420 + Math.min(1, k / 9) ** 2 * 210;
      return <div key={i} style={{ position: "absolute", left: 790 + ((i * 47) % 140), top: y, opacity: k > 12 ? 1 - (k - 12) / 4 : 1 }}><GenSlot name="kn_coin" size={64} /></div>;
    })}
    <Stamp x={540} y={780} t={4.42} size={70} rot={-6} c={O}>一括投資</Stamp>
    <Burst t={4.42} x={700} y={830} c={O} r={190} />
  </>
);

// ══ ② 目的：大学資金の一部（5.1〜7.2）══
const SB: React.FC<{ f: number }> = ({ f }) => {
  const share = p01(f, F(6.35), F(6.35) + 14) * 0.3;
  const a = share * Math.PI * 2;
  const cx = 300, cy = 1500, r = 190;
  const x2 = cx + r * Math.sin(a), y2 = cy - r * Math.cos(a);
  return (
    <>
      <Pos x={70} y={1060} t={5.12} pat="stamp" tempo="kire"><span style={{ background: G, color: "#fff", borderRadius: 999, padding: "6px 26px", ...K, fontSize: 38 }}>目的</span></Pos>
      <Lbl x={230} y={1048} t={5.5} size={58} pat="wipe">子どもの <Marker t={6.28} c="#CFEFD9">大学資金</Marker> の <span style={{ color: O }}>一部</span></Lbl>
      <svg width={1080} height={1900} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <g style={{ ...enter(f, F(5.9), "pop", "bounce"), transformOrigin: `${cx}px ${cy}px` } as React.CSSProperties}>
          <circle cx={cx} cy={cy} r={r} fill="#E9F0F8" stroke={INK} strokeWidth={7} />
          {share > 0 ? <path d={`M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`} fill={O} stroke={INK} strokeWidth={7} strokeLinejoin="round" /> : null}
        </g>
      </svg>
      <Lbl x={cx - 120} y={cy + r + 20} t={6.0} size={32} w={240} center>大学資金</Lbl>
      <Lbl x={cx + 20} y={cy - r - 62} t={6.6} size={34} c={O}>↙ 児童手当</Lbl>
      <Img name="jt_family_univ_entrance" x={560} y={1220} size={420} t={6.2} pat="drop" tempo="bounce" />
    </>
  );
};

// ══ ③ いくら：1人245万 → わが家は 上の子18歳まで 約415万（7.2〜14.8）══
const X0 = 120, X1 = 960; // 1人の帯
const T0 = 260, T1 = 980; // わが家の帯（2026年10月 → 2043年3月）
const mo = (n: number) => (n / 198) * (T1 - T0);
const SC: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Head y={1360} t={7.1} no="金額" title="児童手当はいくら？" c={O} />
    <Lbl x={X0} y={1490} t={7.4} size={34}>1人（0歳から最後まで）</Lbl>
    {[[0, "0歳"], [3, "3歳"], [18, "18歳"]].map(([a, s]) => <Lbl key={s} x={X0 + ((a as number) / 18) * (X1 - X0) - 22} y={1550} t={7.6} size={28} c={M.sub}>{s}</Lbl>)}
    <Bar x={X0} y={1595} w={(X1 - X0) * (54 / 245)} h={92} t={7.7} c={O}>54万</Bar>
    <Bar x={X0 + (X1 - X0) * (54 / 245)} y={1595} w={(X1 - X0) * (191 / 245)} h={92} t={8.0} dur={12} c={G}>191万</Bar>
    <Lbl x={X0} y={1705} t={8.1} size={30} c={O}>1.5万円×36か月</Lbl>
    <Lbl x={X0 + 270} y={1705} t={8.35} size={30} c={G}>1万円×191か月（高校卒業まで）</Lbl>
    <Pos x={250} y={1760} t={8.8} pat="stamp" tempo="kire"><div style={{ ...K, fontSize: 50 }}>1人 だいたい <span style={{ ...SER, fontSize: 120, color: O }}><Roll t={8.8} text="245" /></span><span style={{ fontSize: 56 }}>万円</span></div></Pos>
    <svg width={1080} height={3000} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <GlowBox box={[230, 1765, 860, 1905]} start={F(8.9)} end={F(10.2)} c={O} />
    </svg>

    {/* わが家：今（2026年10月）からもらう分だけ */}
    <Pos x={70} y={2000} t={10.34} pat="stamp" tempo="kire"><span style={{ background: G, color: "#fff", borderRadius: 999, padding: "6px 26px", ...K, fontSize: 36 }}>我が家の場合</span></Pos>
    <Lbl x={360} y={2004} t={10.6} size={30} c={M.sub}>2026年10月から</Lbl>
    {/* 上の子 */}
    <Lbl x={70} y={2090} t={10.8} size={32}>上の子 <span style={{ color: M.sub, fontSize: 26 }}>（今2歳）</span></Lbl>
    <div style={{ position: "absolute", left: T0 - 100, top: 2140, width: 100, height: 70, background: "repeating-linear-gradient(45deg, #DDD6C4 0 8px, #EEE8D8 8px 16px)", border: `4px dashed ${M.gray}`, borderRight: "none", borderRadius: "12px 0 0 12px", boxSizing: "border-box", opacity: p01(f, F(10.9), F(11.2)) }} />
    <Bar x={T0} y={2140} w={mo(8)} h={70} t={11.0} dur={4} c={O} r={0} />
    <Bar x={T0 + mo(8)} y={2140} w={mo(190)} h={70} t={11.15} dur={12} c={G}>18歳まで</Bar>
    <Lbl x={T0} y={2220} t={11.6} size={32}><span style={{ color: O }}>12万</span> ＋ <span style={{ color: G }}>190万</span> ＝ 約<b style={{ fontSize: 42 }}>202万</b></Lbl>
    {/* 下の子 */}
    <Lbl x={70} y={2300} t={11.0} size={32}>下の子 <span style={{ color: M.sub, fontSize: 26 }}>（今0歳）</span></Lbl>
    <div style={{ position: "absolute", left: T0 - 26, top: 2350, width: 26, height: 70, background: "repeating-linear-gradient(45deg, #DDD6C4 0 8px, #EEE8D8 8px 16px)", border: `4px dashed ${M.gray}`, borderRight: "none", borderRadius: "12px 0 0 12px", boxSizing: "border-box", opacity: p01(f, F(11.1), F(11.4)) }} />
    <Bar x={T0} y={2350} w={mo(29)} h={70} t={11.2} dur={5} c={O} r={0} />
    <Bar x={T0 + mo(29)} y={2350} w={mo(169)} h={70} t={11.4} dur={12} c={G}>そのとき17歳</Bar>
    <Lbl x={T0} y={2430} t={12.0} size={32}><span style={{ color: O }}>43.5万</span> ＋ <span style={{ color: G }}>169万</span> ＝ 約<b style={{ fontSize: 42 }}>212.5万</b></Lbl>
    {/* 今の線 */}
    <div style={{ position: "absolute", left: T0 - 3, top: 2075, width: 6, height: 380, background: RED, borderRadius: 3, transformOrigin: "50% 0", transform: `scaleY(${p01(f, F(10.7), F(11.1))})` }} />
    <Lbl x={T0 + 520} y={2010} t={11.2} size={24} c={M.sub}>（もらい済みは入れない）</Lbl>
    <Pos x={T1 - 110} y={2068} t={11.72} pat="drop" tempo="bounce"><span style={{ display: "inline-block", background: "#fff", border: `4px solid ${INK}`, borderRadius: 10, padding: "0 10px", ...K, fontSize: 26 }}>18歳🎓</span></Pos>
    {/* 合計 */}
    <Pos x={150} y={2530} t={13.14} pat="stamp" tempo="kire"><div style={{ ...K, fontSize: 52 }}>合計 約<span style={{ ...SER, fontSize: 130, color: G }}><Roll t={13.6} text="415" /></span><span style={{ fontSize: 60 }}>万円</span></div></Pos>
    <Burst t={14.0} x={560} y={2620} c={G} r={230} />
    <Img name="kn_coin_stack" x={800} y={2500} size={200} t={13.8} pat="drop" tempo="bounce" />
  </>
);

// ══ ④ 銀行 vs 物価 vs 運用（14.8〜28.4）══
const BASE = 3620, PER = 0.72; // 1万円 → px
const VB: [number, string, number, string][] = [[150, "もらう額", 415, M.gray], [420, "銀行 0.4%", 430, "#7FA8D6"], [690, "年5%で運用", 650, G]];
const SD: React.FC<{ f: number }> = ({ f }) => {
  const lose = f >= F(22.5);
  return (
    <>
      <Head y={2760} t={14.6} no="比べる" title="上の子が18歳になるまで" c={INK} />
      <div style={{ position: "absolute", left: 110, top: BASE, width: 860, height: 6, background: INK, borderRadius: 3, opacity: p01(f, F(14.6), F(14.9)) }} />
      <VBar x={VB[0][0]} base={BASE} w={200} h={415 * PER} t={14.82} c={M.gray} hatch />
      <VBar x={VB[1][0]} base={BASE} w={200} h={430 * PER} t={15.3} dur={22} c="#7FA8D6" />
      <VBar x={VB[2][0]} base={BASE} w={200} h={650 * PER} t={25.4} dur={45} c={G} />
      {VB.map(([x, l, , c], i) => <Lbl key={l} x={x - 10} y={BASE + 16} t={[14.82, 15.3, 25.4][i]} size={28} w={220} center c={i === 0 ? M.sub : INK}>{l}</Lbl>)}
      <Lbl x={150} y={BASE - 415 * PER + 16} t={15.1} size={36} w={200} center>415万</Lbl>
      <Lbl x={420} y={BASE - 430 * PER + 14} t={16.36} size={40} w={200} center c="#fff">約<Roll t={16.6} text="430" />万</Lbl>
      <Stamp x={320} y={BASE - 430 * PER - 130} t={17.88} size={52} rot={-8} c="#3C6EA8">ほぼ横ばい</Stamp>
      {/* 眠るお金 → 縮むお金 */}
      <Img name="jt_money_sleep_bank" x={40} y={2850} size={230} t={16.0} pat="drop" tempo="bounce" style={{ opacity: lose ? 1 - p01(f, F(22.5), F(22.9)) : undefined }} />
      {lose ? <Img name="jt_money_shrink" x={20} y={2850} size={430} t={22.5} pat="pop" tempo="bounce" /> : null}
      {/* 物価の線（じわじわ上がる） */}
      <svg width={1080} height={4000} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <GrowPath d={`M120 ${BASE - 335} C 400 ${BASE - 345}, 650 ${BASE - 385}, 960 ${BASE - 435}`} start={F(22.24)} kind="lineLong" color={RED} w={10} glow={false} />
      </svg>
      <Lbl x={900} y={BASE - 480} t={22.5} size={36} c={RED}>物価↗</Lbl>
      <Cross x={460} y={BASE - 235} t={22.76} s={120} />
      <Stamp x={330} y={BASE - 105} t={22.8} size={50} rot={-4}>インフレに負け</Stamp>
      {/* 年5% */}
      <Img name="jt_money_tree_big" x={800} y={2830} size={230} t={26.3} pat="pop" tempo="bounce" />
      <Lbl x={680} y={BASE - 650 * PER + 16} t={27.1} size={46} w={220} center c="#fff">約<Roll t={27.2} text="650" />万</Lbl>
      <Note x={110} y={BASE + 70} t={25.6} w={880}>※年0.4%・年5%は計算のための仮定。毎月もらう分をそのまま入れた場合（税金は考えていません）。運用は元本保証がなく、増えるとは限りません。</Note>
    </>
  );
};
// 物価のパネル（横へすべる）
const SD2: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Head y={2760} t={18.4} no="物価" title="ここ数年で上がっている" c={RED} />
    <Img name="jt_shopping_worry" x={1080 + 40} y={2880} size={380} t={18.7} pat="slideUp" tempo="brake" />
    <Img name="jt_price_tags_up" x={1080 + 470} y={2900} size={340} t={19.2} pat="drop" tempo="bounce" />
    {[["2023年", "3.2%", 19.9], ["2024年", "2.7%", 20.35], ["2025年", "3.2%", 20.8]].map(([y, v, t], i) => (
      <Pos key={y as string} x={1080 + 60 + i * 300} y={3300} t={t as number} pat="drop" tempo="bounce">
        <div style={{ width: 270, background: "#fff", border: `5px solid ${RED}`, borderRadius: 18, boxShadow: `5px 5px 0 ${INK}`, textAlign: "center", padding: "8px 0" }}>
          <div style={{ ...K, fontSize: 30, color: M.sub }}>{y}</div>
          <div style={{ ...SER, fontSize: 72, color: RED, lineHeight: 1.05 }}>{v}<span style={{ ...K, fontSize: 40 }}>↑</span></div>
        </div>
      </Pos>
    ))}
    <Note x={1080 + 60} y={3480} t={21.0} w={880}>※消費者物価指数（総合）の前年比</Note>
  </>
);

// ══ ⑤ わが家のケース：近いうちに使う ✕ ／ 長く持てる ◯（28.4〜37.6）══
const SE: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Stamp x={230} y={3920} t={28.6} size={60} rot={-3} c={G}>あくまで わが家のケース</Stamp>
    {/* 左：近いうちに使う */}
    <Pos x={50} y={4150} t={29.9} pat="slideUp" tempo="brake">
      <div style={{ width: 470, height: 640, background: "#fff", border: `6px solid ${INK}`, borderTop: `20px solid ${RED}`, borderRadius: 22, boxShadow: `8px 8px 0 ${INK}` }} />
    </Pos>
    <Lbl x={80} y={4190} t={30.2} size={36}>近いうちに使う</Lbl>
    <Img name="jt_parent_calendar_univ" x={120} y={4250} size={300} t={30.3} pat="pop" tempo="bounce" />
    <MiniLine x={110} y={4570} w={340} h={130} t={31.2} dur={20} pts={[0.6, 0.66, 0.5, 0.2, 0.12]} c={RED} />
    <Lbl x={110} y={4712} t={31.8} size={30} c={RED}>使う時に下がっていたら…</Lbl>
    <Cross x={330} y={4470} t={32.74} s={130} />
    <Stamp x={70} y={4820} t={32.9} size={46} rot={-5}>運用はおすすめしません</Stamp>
    {/* 右：長く持てる */}
    <Pos x={560} y={4150} t={33.92} pat="slideUp" tempo="brake">
      <div style={{ width: 470, height: 640, background: "#fff", border: `6px solid ${INK}`, borderTop: `20px solid ${G}`, borderRadius: 22, boxShadow: `8px 8px 0 ${INK}` }} />
    </Pos>
    <Lbl x={590} y={4190} t={34.1} size={36}>うちは 2歳と0歳</Lbl>
    <Bar x={600} y={4270} w={390} h={56} t={34.3} dur={10} c={O}>2歳 → 18歳</Bar>
    <Bar x={600} y={4345} w={390} h={56} t={34.7} dur={10} c={O}>0歳 → 18歳</Bar>
    <Img name="nb_kid_toddler" x={590} y={4420} size={150} t={35.4} pat="pop" tempo="bounce" />
    <Img name="nb_kid_student" x={850} y={4410} size={160} t={35.8} pat="pop" tempo="bounce" />
    <Lbl x={750} y={4470} t={35.6} size={44} c={G}>→</Lbl>
    <MiniLine x={620} y={4590} w={350} h={130} t={36.0} dur={22} pts={[0.1, 0.25, 0.18, 0.4, 0.3, 0.55, 0.48, 0.75, 0.9]} c={G} />
    <Lbl x={620} y={4712} t={36.3} size={30} c={G}>大学まで長く持てる</Lbl>
    <Ring x={860} y={4560} t={36.8} s={130} />
    <Stamp x={640} y={4820} t={36.9} size={46} rot={4} c={G}>だから運用</Stamp>
  </>
);

// ══ ⑥ 株だけじゃない：債券も持って備える（37.6〜41.8）══
const SF: React.FC<{ f: number }> = ({ f }) => {
  const shake = f >= F(38.3) && f < F(39.7) ? Math.sin(f * 1.9) * 7 : 0;
  return (
    <>
      <Img name="jt_crash_worry" x={40} y={4780} size={340} t={37.6} pat="slideL" tempo="brake" />
      <Pos x={400} y={4800} t={37.9} pat="pop" tempo="bounce"><div style={{ transform: `translateX(${shake}px)` }}><Chip c={RED} size={40}>株だけ</Chip></div></Pos>
      <Stamp x={390} y={4885} t={38.66} size={52} rot={-6}>リスクが高い</Stamp>
      <Img name="r2_balance_scale" x={610} y={4990} size={390} t={39.6} pat="drop" tempo="bounce" />
      <Pos x={650} y={5370} t={39.7} pat="pop" tempo="bounce"><Chip c={O} size={36}>株</Chip></Pos>
      <Pos x={850} y={5370} t={39.98} pat="pop" tempo="bounce"><Chip c={G} size={36}>債券</Chip></Pos>
      <Img name="jt_parent_shield_family" x={60} y={5170} size={420} t={40.9} pat="slideUp" tempo="brake" />
      <Lbl x={500} y={5500} t={41.06} size={50}><Marker t={41.1} c="#CFEFD9">リスクにも備える</Marker></Lbl>
    </>
  );
};

// ══ 締め：スライドにまとめました（41.6〜47.1）══
const Guide: React.FC<{ f: number }> = ({ f }) => {
  if (f < F(41.6) || f > F(47.4)) return null;
  const inP = p01(f, F(41.6), F(41.6) + 12);
  const outP = p01(f, F(47.0), F(47.0) + 8, Easing.in(Easing.cubic));
  const flip = p01(f, F(42.2), F(42.2) + 12, Easing.out(Easing.back(1.3)));
  return (
    <AbsoluteFill style={{ background: M.paper, clipPath: `circle(${inP * 1500}px at 540 700)`, transform: `translateY(${outP * -1900}px)` }}>
      <Sequence from={F(41.6)} layout="none">
        <OffthreadVideo src={staticFile("cta_jidou/slides.mp4")} muted style={{ position: "absolute", left: -60, top: -40, width: 1200, height: 1380, objectFit: "cover", filter: "blur(5px) brightness(0.9)", transform: `scale(${1.05 + 0.04 * p01(f, F(41.6), F(47.0), Easing.linear)})` }} />
      </Sequence>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(251,246,216,0.35), rgba(251,246,216,0.55) 60%, rgba(251,246,216,0.95) 70%)" }} />
      <div style={{ position: "absolute", left: 0, width: 1080, top: 190, textAlign: "center", ...K, fontSize: 56 }}><span style={{ background: "rgba(255,255,255,0.92)", padding: "6px 22px", borderRadius: 14 }}>教育資金の<Marker t={44.9}>貯め方</Marker>を</span></div>
      <div style={{ position: "absolute", left: 60, top: 330, width: 960, transform: `perspective(1600px) rotateY(${(1 - flip) * -75}deg) rotate(${-2 * flip}deg) scale(${0.85 + 0.15 * flip})`, opacity: flip > 0.02 ? 1 : 0, boxShadow: "0 24px 50px rgba(60,45,10,0.35)", border: "8px solid #fff", borderRadius: 18, overflow: "hidden" }}>
        <img src={staticFile("cta_jidou/cover.jpg")} style={{ width: "100%", display: "block" }} />
      </div>
      <div style={{ position: "absolute", left: 470, top: 280, ...enter(f, F(46.1), "stamp", "kire") }}><span style={{ display: "inline-block", whiteSpace: "nowrap", background: YEL, ...K, fontSize: 42, padding: "10px 24px", transform: "rotate(6deg)", boxShadow: "4px 6px 10px rgba(0,0,0,0.15)" }}>スライドにまとめました！</span></div>
      <div style={{ position: "absolute", left: 80, top: 880, ...enter(f, F(43.3), "slideUp", "brake") }}><GenSlot name="jt_parent_read_guide" size={330} /></div>
      <div style={{ position: "absolute", left: 440, top: 930, ...enter(f, F(42.9), "drop", "bounce") }}><span style={{ display: "inline-block", background: "#fff", border: `5px solid ${G}`, borderRadius: 16, padding: "10px 20px", boxShadow: `5px 5px 0 ${INK}`, ...K, fontSize: 36 }}>0歳・2歳の <span style={{ color: G }}>わが家の実例</span></span></div>
    </AbsoluteFill>
  );
};

// ── 字幕（カラオケ式・「/」で改行）──
const SUBS: [number, string][] = [
  [0.0, "わが家は 児童手当を/*全額NISA* に入れています"], [2.7, "具体的には/*成長投資枠* に *一括投資*"], [5.12, "目的は/子どもの *大学資金の一部*"],
  [7.28, "児童手当は/1人だいたい *245万円* もらえて"], [10.34, "我が家の場合/上の子が18歳になるまでだと"], [13.14, "合計 約*415万円*"],
  [14.82, "これを 銀行に置いておくと"], [16.36, "約430万円"], [17.88, "!ほぼ横ばい!"],
  [18.6, "でも物価は ここ数年/!2%から3%くらい! で上がっているので"], [22.24, "!インフレに負けてしまう!"],
  [23.52, "もし 上の子が18歳になるまで"], [25.38, "*年5%* で運用できたら"], [27.1, "約*650万円*"],
  [28.46, "これはあくまで/*わが家のケース*"], [29.9, "もし教育資金を/近いうちに使う予定があるなら"], [32.74, "運用は !おすすめしません!"],
  [33.92, "うちは 2歳と0歳で"], [35.4, "大学まで *長く持てる* から/運用していて"],
  [37.6, "株だけだと/!本当にリスクが高い! ので"], [39.7, "*債券* も持って/リスクにも備えています"],
  [41.78, "0歳と2歳の子どもがいる僕が"], [43.92, "実際にしている/教育資金の貯め方を"], [46.1, "*スライド* にまとめました"],
  [47.16, "欲しい方は プロフのリンクから/*公式LINE* を追加して"], [50.0, "ここから受け取ってください"],
];
const END = 51.3;

const Karaoke: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  let i = -1;
  SUBS.forEach(([s0], k) => { if (t >= s0) i = k; });
  if (i < 0 || t > END) return null;
  const [s0, raw] = SUBS[i];
  const e = i + 1 < SUBS.length ? SUBS[i + 1][0] : END;
  const parts: { ch: string; c: string | null }[] = [];
  let mode: string | null = null;
  for (const ch of raw) {
    if (ch === "*" || ch === "!") { mode = mode ? null : ch; continue; }
    parts.push({ ch, c: mode === "*" ? G : mode === "!" ? RED : null });
  }
  const n = parts.filter((p) => p.ch !== " " && p.ch !== "/").length;
  const longest = Math.max(...raw.replace(/[*!]/g, "").split("/").map((l) => l.length));
  const size = Math.min(42, Math.floor(650 / longest));
  const spoken = interpolate(t, [s0, s0 + (e - s0) * 0.92], [0, n], clamp);
  const inS = interpolate(f - F(s0), [0, 2, 5], [0.9, 1.04, 1], clamp);
  let idx = 0;
  return (
    <div style={{ position: "absolute", left: 40, width: 720, top: 1185, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(255,255,255,0.94)", border: `5px solid ${INK}`, borderRadius: 22, padding: "12px 26px", boxShadow: `6px 6px 0 ${INK}`, maxWidth: 700, textAlign: "center", whiteSpace: "nowrap", transform: `scale(${inS})`, ...K, fontSize: size, lineHeight: 1.32 }}>
        {parts.map((p, j) => {
          if (p.ch === "/") return <br key={j} />;
          if (p.ch === " ") return <span key={j}> </span>;
          const on = idx++ < spoken;
          return <span key={j} style={{ color: on ? (p.c ?? INK) : "#C9C2B0", background: on && p.c ? (p.c === G ? "rgba(255,225,90,0.55)" : "rgba(255,190,180,0.6)") : undefined }}>{p.ch}</span>;
        })}
      </div>
    </div>
  );
};

const Chara: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= F(END)) return null;
  const lv = JIDOU_MOUTH.charCodeAt(Math.min(JIDOU_MOUTH.length - 1, f)) - 48;
  const blink = f % 96 > 92 && lv === 0;
  const name = blink ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 3) % 4 ? "taichi_talk_open" : "taichi_talk_mid") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  return <div style={{ position: "absolute", left: 760, top: 1190 + Math.sin(f / 10) * 4, width: 200, height: 200 }}><GenSlot name={name} size={200} /></div>;
};

// ── カメラ（中身の中心 cy を映す）──
const ck = (t: number, x: number, cy: number, z = 1, p: CamKey["p"] = "scroll"): CamKey => ({ f: F(t), x, y: cy + 200 / z, z, p });
const CAM: CamKey[] = [
  { f: 0, x: 540, y: 560 + 200 / 1.06, z: 1.06 },
  ck(0.9, 540, 640, 1, "slide"),             // わが家 → NISA
  ck(4.95, 540, 1330, 1, "marke"),           // 目的
  ck(6.9, 540, 2490, 1, "marke"),            // 1人245万
  ck(10.0, 540, 3010, 1, "slide"),           // わが家 415万
  ck(14.4, 540, 3780, 1, "marke"),           // 銀行
  ck(18.3, 1620, 3780, 1, "side"),           // 物価のパネル
  ck(21.9, 540, 3780, 1, "side"),            // 戻って インフレに負け
  ck(28.05, 540, 4970, 1, "marke"),          // わが家のケース
  ck(37.2, 540, 5890, 1, "marke"),           // 株だけ → 債券
];
const SHAKES = [1.42, 4.42, 22.8, 32.8];
const PUNCH = [1.42, 4.42, 8.8, 13.6, 22.8, 32.8, 36.8];
const shakeAt = (f: number) => {
  let x = 0, y = 0;
  for (const s of SHAKES) { const k = f - F(s); if (k >= 0 && k < 9) { const a = (9 - k) * 2.6; x += Math.sin(k * 2.9) * a; y += Math.cos(k * 3.7) * a * 0.6; } }
  return { x, y };
};

// 効果音（u01〜u10 のみ・最初の1秒には置かない）
const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  s("u04", 1.42, 0.26), s("u05s", 1.25, 0.14), s("u03s", 2.75, 0.16), s("u02s", 3.6, 0.12), s("u02s", 3.85, 0.12), s("u02s", 4.1, 0.12), s("u04", 4.42, 0.26),
  s("u03s", 4.95, 0.18), s("u05s", 6.3, 0.16), s("u07", 6.9, 0.16),
  s("u03s", 6.9, 0.18), s("u05s", 7.7, 0.14), s("u05s", 8.0, 0.14), s("u05", 8.8, 0.24),
  s("u03s", 10.0, 0.16), s("u05s", 11.0, 0.14), s("u05s", 11.4, 0.14), s("u06", 11.72, 0.16), s("u05", 13.6, 0.24), s("u09", 14.0, 0.2),
  s("u03s", 14.4, 0.18), s("u05s", 16.0, 0.16), s("u04", 17.88, 0.24),
  s("u03s", 18.3, 0.18), s("u02s", 19.9, 0.12), s("u02s", 20.35, 0.12), s("u02s", 20.8, 0.12),
  s("u03s", 21.9, 0.18), s("u10", 22.3, 0.18), s("u04", 22.8, 0.3),
  s("u05s", 25.4, 0.16), s("u06", 26.3, 0.16), s("u10", 26.95, 0.2), s("u04", 27.15, 0.3),
  s("u03s", 28.05, 0.18), s("u04", 28.6, 0.24), s("u07", 31.2, 0.18), s("u04", 32.8, 0.28),
  s("u05s", 34.3, 0.14), s("u05s", 34.7, 0.14), s("u06", 36.0, 0.14), s("u09", 36.8, 0.22),
  s("u03s", 37.2, 0.18), s("u07", 38.3, 0.2), s("u04", 38.66, 0.24), s("u06", 39.6, 0.16), s("u09", 40.9, 0.2),
  s("u03s", 41.6, 0.18), s("u06", 42.2, 0.18), s("u05s", 43.3, 0.14), s("u04", 46.1, 0.24),
  s("u03s", 47.1, 0.16), s("u05s", 48.4, 0.18), s("u03s", 49.25, 0.16), s("u05s", 50.25, 0.18),
];

const SAFE = 0.86, SAFE_X = 40, SAFE_Y = 120;
export const JIDOU_REEL_FRAMES = F(51.4);
export const JidouReel: React.FC = () => {
  const f = useCurrentFrame();
  const c = camAt(CAM, f);
  const sh = shakeAt(f);
  const punch = PUNCH.reduce((a, t) => { const k = f - F(t); return k >= 0 && k < 12 ? a + at([0, 0.06, 0.075, 0.06, 0.04, 0.025, 0.014, 0.007, 0.003, 0], k) : a; }, 0);
  const blur = motionBlur(c.v);
  const drift = Math.sin(f / 50) * 6;
  return (
    <AbsoluteFill style={{ background: M.paper, overflow: "hidden" }}>
      <Audio src={staticFile("jidou-narration.wav")} />
      <SfxTrack cues={CUES} />
      <div style={{ position: "absolute", left: SAFE_X, top: SAFE_Y, width: 1080, height: 1920, transform: `scale(${SAFE})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + punch}) rotate(${-Math.min(1.2, c.v / 260)}deg)`, transformOrigin: "540px 700px" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 7000, transform: `translate(${540 - c.x * c.z + sh.x + drift}px, ${960 - c.y * c.z + sh.y}px) scale(${c.z})`, transformOrigin: "0 0", filter: blur ? `blur(${blur}px)` : undefined }}>
            <div style={{ position: "absolute", left: -2000, top: -600, width: 5200, height: 8000, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} />
            <div style={{ position: "absolute", left: -2000, top: -600, width: 5200, height: 8000, backgroundImage: "radial-gradient(rgba(120,90,40,0.07) 1px, transparent 1.6px)", backgroundSize: "7px 7px" }} />
            <div style={{ position: "absolute", left: 60, top: -600, width: 4, height: 8000, background: "rgba(239,125,87,0.35)" }} />
            {f < F(7.5) ? <SA f={f} /> : null}
            {f > F(4.5) && f < F(10.5) ? <SB f={f} /> : null}
            {f > F(6.5) && f < F(18) ? <div style={{ position: "absolute", left: 0, top: 450, width: 1080 }}><SC f={f} /></div> : null}
            {f > F(14) && f < F(29) ? <div style={{ position: "absolute", left: 0, top: 450, width: 1080 }}><SD f={f} /></div> : null}
            {f > F(18) && f < F(22.6) ? <div style={{ position: "absolute", left: 0, top: 450, width: 1080 }}><SD2 f={f} /></div> : null}
            {f > F(27.8) && f < F(38) ? <div style={{ position: "absolute", left: 0, top: 450, width: 1080 }}><SE f={f} /></div> : null}
            {f > F(37) ? <div style={{ position: "absolute", left: 0, top: 450, width: 1080 }}><SF f={f} /></div> : null}
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 58%, rgba(70,50,15,0.16) 100%)", pointerEvents: "none" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, bottom: 0, background: `linear-gradient(${M.paper}00, ${M.paper} 50px)` }} />
      <HeroCut t0={27.15} t1={28.4}><div style={{ ...K, fontSize: 62, color: "#fff" }}>年5%で運用できたら</div><div style={{ ...SER, fontSize: 200, color: "#7BE0A0", lineHeight: 1 }}><span style={{ ...K, fontSize: 90 }}>約</span>650<span style={{ ...K, fontSize: 90 }}>万円</span></div><div style={{ marginTop: 44, background: "rgba(255,255,255,0.95)", borderRadius: 18, padding: "14px 26px", textAlign: "center" }}><div style={{ ...K, fontSize: 36, color: RED }}>※年5%は計算のための仮定です</div><div style={{ ...K, fontSize: 28, color: INK, marginTop: 4 }}>運用は元本保証がなく、増えるとは限りません</div></div></HeroCut>
      <HeroCut t0={36.6} t1={37.5} sweep><span style={{ ...K, fontSize: 84, color: "#fff", textShadow: "0 6px 20px rgba(0,0,0,0.3)" }}>長く持てるから 運用</span></HeroCut>
      <Guide f={f} />
      <TapCard at={47.16} until={49.2} src="cta_jidou/profile.jpg" iw={1179} ih={872} x={90} y={380} w={900} hit={[0.02, 0.915, 0.5, 0.075]} dimAt={47.6} tapAt={48.4} label={<>プロフの<span style={{ color: RED }}>リンク</span>から</>} labelAt={48.0} />
      <TapCard at={49.25} src="cta_jidou/menu.jpg" iw={1179} ih={802} x={90} y={400} w={900} hit={[0.36, 0.83, 0.28, 0.1]} dimAt={49.6} tapAt={50.25} label={<><span style={{ color: "#06C755" }}>公式LINE</span>の<span style={{ color: RED }}>特典はこちら</span></>} labelAt={49.4} labelTop={1050} labelLeft={110} rot={1} />
      <Karaoke />
      <div style={{ position: "absolute", left: 0, top: 0, transform: "scale(0.55)", transformOrigin: "0 0" }}>
        <Stepper labels={["わが家", "いくら", "銀行と運用", "注意点", "受け取り"]} steps={[0, 7.28, 14.82, 28.46, 41.78]} x={73} y={2490} color={G} />
      </div>
      <Chara />
    </AbsoluteFill>
  );
};
