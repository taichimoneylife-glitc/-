import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { K, B, SER, M, F } from "./components/marke";
import { GenSlot } from "./MileLifePlan";
import { Stepper } from "./components/board";
import { TypeIn } from "./components/zukaiKit";
import { SfxTrack } from "./components/sfx";
import { camAt, CamKey, motionBlur, GrowPath, cardIn, at } from "./components/flowKit";
import { enter } from "./components/motionLib";
import { KOSHIN_MOUTH } from "./koshinMouth";

// ════════════════════════════════════════════════════════════════════
//  更新型保険（声 public/koshin-narration.wav 66.3秒・図解パートのみ。冒頭と締めは実写トーク）台本：assets/script_koshin_hoken.md
//  作り：子どもNISA（src/KodomoReel.tsx）と同じ＝ノート1冊をカメラが線で追う／安全な枠／カラオケ字幕（「/」で改行）／口パク／回る枠は話している間だけ
//  色：保険料・定期＝オレンジ、終身＝緑、危ない所＝赤
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
  return <div style={{ position: "absolute", left: x, top: y, ...enter(f, F(t), pat, tempo), ...style }}><GenSlot name={name} size={size} /></div>;
};
const Chip: React.FC<{ c?: string; children: React.ReactNode; size?: number; bg?: string }> = ({ c = RED, children, size = 38, bg = "#fff" }) => (
  <span style={{ display: "inline-block", background: bg, border: `5px solid ${c}`, borderRadius: 16, padding: "8px 22px", ...K, fontSize: size, color: INK, boxShadow: `5px 5px 0 ${INK}`, whiteSpace: "nowrap" }}>{children}</span>
);
const Pos: React.FC<{ x: number; y: number; t: number; pat?: Parameters<typeof enter>[2]; tempo?: Parameters<typeof enter>[3]; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, t, pat = "pop", tempo = "std", children, style }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: x, top: y, ...enter(f, F(t), pat, tempo), ...style }}>{children}</div>;
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
// ── 各章 ──
const AX = (age: number) => 280 + ((age - 30) * 720) / 70; // 年齢 → 横の位置（30歳〜100歳）

// 正体と仕組み
const S0: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Head y={300} t={0.05} no="正体" title="その保険が…" />
    <Img name="kh_policy_envelope" x={70} y={430} size={300} t={0.1} pat="drop" tempo="bounce" />
    <Img name="kh_policy_doc" x={400} y={410} size={330} t={0.45} pat="slideUp" tempo="brake" />
    <Stamp x={470} y={560} t={0.72} size={70} rot={-10}>更新型</Stamp>
    <Burst t={0.72} x={600} y={610} c={RED} r={200} />
    <Pos x={760} y={470} t={1.3} pat="pop" tempo="bounce"><Chip c={O} size={36}>の保険</Chip></Pos>
    {/* 10年ごとの線 */}
    <svg width={1080} height={2000} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <GrowPath d="M110 960 L980 960" start={F(1.8)} kind="lineLong" color={INK} w={8} glow={false} />
      <GrowPath d="M540 1300 L540 1400" start={F(5.1)} kind="lineShort" color={INK} w={6} glow={false} />
    </svg>
    {[30, 40, 50, 60].map((a, i) => (
      <React.Fragment key={a}>
        <Pos x={110 + i * 260} y={975} t={2.26 + i * 0.16} pat="drop" tempo="bounce"><span style={{ ...SER, fontSize: 48 }}>{a}<span style={{ ...K, fontSize: 26 }}>歳</span></span></Pos>
        {i > 0 ? <Pos x={60 + i * 260} y={880} t={2.6 + i * 0.12} pat="stamp" tempo="kire"><span style={{ display: "inline-block", background: O, color: "#fff", borderRadius: 12, padding: "4px 14px", ...K, fontSize: 30 }}>更新</span></Pos> : null}
      </React.Fragment>
    ))}
    <Img name="kh_renewal_notice" x={330} y={1060} size={220} t={3.4} pat="whip" tempo="brake" />
    <Pos x={560} y={1110} t={4.0} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 42, lineHeight: 1.3 }}>その年の年齢で<br /><Marker t={4.6}>保険料を決め直し</Marker></span></Pos>
  </>
);
// 年をとるほどリスクも保険料も上がる
const S0b: React.FC<{ f: number }> = ({ f }) => {
  const bars = [[110, 70, 5.5], [430, 140, 6.3], [750, 240, 7.1]] as const;
  return (
    <>
      <Img name="kh_man_30" x={70} y={1460} size={260} t={5.5} pat="drop" tempo="bounce" />
      <Img name="kh_man_50" x={390} y={1440} size={270} t={6.3} pat="drop" tempo="bounce" />
      <Img name="kh_man_70" x={710} y={1430} size={270} t={7.1} pat="drop" tempo="bounce" />
      <svg width={1080} height={2400} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M120 1450 C400 1430 700 1380 980 1290" start={F(6.6)} kind="lineLong" color={RED} w={10} glow={false} />
      </svg>
      <Pos x={560} y={1250} t={7.4} pat="pop" tempo="bounce"><span style={{ ...K, fontSize: 36, color: RED }}>病気・亡くなるリスク ↑</span></Pos>
      {/* 保険料の棒 */}
      {bars.map(([x, h, t], i) => (
        <div key={i} style={{ position: "absolute", left: x + 40, top: 1990 - h * p01(f, F(8.8 + i * 0.25), F(8.8 + i * 0.25) + 8, Easing.out(Easing.back(1.6))), width: 140, height: h * p01(f, F(8.8 + i * 0.25), F(8.8 + i * 0.25) + 8, Easing.out(Easing.back(1.6))), background: O, border: `5px solid ${INK}`, borderRadius: 10, opacity: f >= F(8.8 + i * 0.25) ? 1 : 0 }} />
      ))}
      <div style={{ position: "absolute", left: 100, top: 1990, width: 880, height: 6, background: INK, opacity: f >= F(8.7) ? 1 : 0 }} />
      <Pos x={80} y={2010} t={9.3} pat="slideUp" tempo="brake"><span style={{ ...K, fontSize: 44 }}><Marker t={9.5} c="#FFD3A8">保険料も上がる</Marker></span></Pos>
    </>
  );
};

// デメリット3つ
const S1: React.FC<{ f: number }> = ({ f }) => (
  <>
    <svg width={1080} height={2600} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <GrowPath d="M540 2080 L540 2200" start={F(9.9)} kind="lineShort" color={INK} w={6} glow={false} />
    </svg>
    <Head y={2220} t={10.4} no="!" title="更新型のデメリット" />
    <Stamp x={740} y={2330} t={11.74} size={64}>3つ</Stamp>
    {["保険料が上がる", "保障が減る", "決まった年齢で終わる"].map((t, i) => (
      <Pos key={t} x={70} y={2450 + i * 96} t={12.2 + i * 0.12} pat="slideL" tempo="brake">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 14, ...K, fontSize: 40 }}><span style={{ width: 58, height: 58, borderRadius: "50%", background: RED, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", ...SER, fontSize: 36 }}>{i + 1}</span>{t}</span>
      </Pos>
    ))}
  </>
);

// ① 保険料が上がる（階段）
const STEPS: [number, string, string, number, string][] = [[30, "1", "kh_man_30", 15.56, ""], [40, "1.5", "kh_man_40", 17.56, "×1.5"], [50, "2.7", "kh_man_50", 19.2, "×1.8"], [60, "6.2", "kh_man_60", 20.82, "×2.3"]];
const BASE = 3720;
const S2: React.FC<{ f: number }> = ({ f }) => (
  <>
    <svg width={1080} height={3000} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <GrowPath d="M540 2760 L540 2880" start={F(12.9)} kind="lineShort" color={INK} w={6} glow={false} />
    </svg>
    <Head y={2900} t={13.3} no="1" title="更新の度に保険料が上がる" />
    <div style={{ position: "absolute", left: 60, top: BASE, width: 960, height: 6, background: INK, opacity: f >= F(15.4) ? 1 : 0 }} />
    {STEPS.map(([age, v, img, t, mul], i) => {
      const h = Number(v) * 62;
      const g = p01(f, F(t), F(t) + 9, Easing.out(Easing.back(1.5)));
      const x = 80 + i * 235;
      return (
        <React.Fragment key={age}>
          {f >= F(t) ? <div style={{ position: "absolute", left: x, top: BASE - h * g, width: 200, height: h * g, background: i === 3 ? RED : O, border: `5px solid ${INK}`, borderRadius: 12, boxShadow: `6px 6px 0 ${INK}` }} /> : null}
          <div style={{ position: "absolute", left: x - 30, top: BASE - h - 330, width: 260, ...enter(f, F(t) + 2, "drop", "bounce") }}><GenSlot name={img} size={250} /></div>
          <Pos x={x} y={BASE - h - 80} t={t + 0.15} pat="pop" tempo="bounce"><span style={{ display: "inline-block", width: 200, textAlign: "center", ...SER, fontSize: i === 3 ? 62 : 52, color: i === 3 ? RED : INK }}>{f >= F(t) + 4 ? <Roll t={t + 0.13} text={v} dur={8} /> : null}<span style={{ ...K, fontSize: 26 }}>万円</span></span></Pos>
          <Pos x={x + 40} y={BASE + 14} t={t} pat="pop" tempo="kire"><span style={{ ...K, fontSize: 36 }}>{age}歳</span></Pos>
          {mul ? <Pos x={x - 60} y={BASE - h - 140} t={t + 0.5} pat="stamp" tempo="kire"><span style={{ display: "inline-block", background: "#fff", border: `4px solid ${RED}`, color: RED, borderRadius: 12, padding: "2px 10px", ...K, fontSize: 28, transform: "rotate(-8deg)" }}>{mul}</span></Pos> : null}
        </React.Fragment>
      );
    })}
    <GlowBox box={[778, BASE - 6.2 * 62 - 90, 1000, BASE + 4]} start={F(21.7)} end={F(22.9)} />
    {/* 注意書き：階段のすぐ上に、読める大きさで（数字が出ている間ずっと） */}
    <Pos x={60} y={3010} t={15.7} pat="slideL" tempo="brake">
      <div style={{ width: 520, background: "#FFF6C8", border: `5px solid ${O}`, borderRadius: 16, padding: "12px 18px", boxShadow: `5px 5px 0 ${INK}`, ...K, fontSize: 28, lineHeight: 1.35 }}>
        <span style={{ color: RED }}>⚠ 計算の一例です</span><br />
        <span style={{ fontSize: 24 }}>倍率や金額は、年齢・性別・保障額・<br />保険会社・商品によって違います</span>
      </div>
    </Pos>
    {/* 父の実話 */}
    <Img name="kh_father_shock" x={60} y={3900} size={340} t={23.5} pat="slideL" tempo="brake" />
    <Pos x={420} y={3950} t={24.0} pat="pop" tempo="bounce"><Chip c={INK} size={36}>実は 僕の父も…</Chip></Pos>
    <Pos x={430} y={4060} t={27.2} pat="drop" tempo="bounce">
      <div style={{ background: "#fff", border: `7px solid ${RED}`, borderRadius: 22, boxShadow: `10px 10px 0 ${INK}`, padding: "14px 30px", textAlign: "center" }}>
        <div style={{ ...K, fontSize: 32, color: M.sub }}>父の毎月の保険料</div>
        <div style={{ ...SER, fontSize: 96, color: RED, lineHeight: 1.05 }}>{f >= F(27.25) ? <Roll t={27.25} text="8" dur={8} /> : null}<span style={{ ...K, fontSize: 44 }}>万円超え</span></div>
      </div>
    </Pos>
    <Burst t={27.5} x={660} y={4150} c={RED} r={260} n={16} />
    <Img name="kh_wallet_empty" x={830} y={3880} size={200} t={27.8} pat="drop" tempo="bounce" />
  </>
);

// ② 保障が減ることがある
const S3: React.FC<{ f: number }> = ({ f }) => {
  const cheap = p01(f, F(31.0), F(31.0) + 12, Easing.inOut(Easing.cubic));
  const cut = p01(f, F(32.9), F(32.9) + 10, Easing.out(Easing.back(1.4)));
  return (
    <>
      <svg width={1080} height={4800} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 4330 L540 4470" start={F(28.3)} kind="lineShort" color={INK} w={6} glow={false} />
      </svg>
      <Head y={4490} t={28.7} no="2" title="保障が減ることがある" />
      {/* 保険料の棒（安くする） */}
      <div style={{ position: "absolute", left: 120, top: 5040 - (300 - 130 * cheap), width: 170, height: 300 - 130 * cheap, background: O, border: `5px solid ${INK}`, borderRadius: 12, ...enter(f, F(30.4), "rubber", "bounce") }} />
      <Pos x={110} y={5060} t={30.4}><span style={{ ...K, fontSize: 34 }}>保険料</span></Pos>
      <Pos x={300} y={4800} t={31.1} pat="pop" tempo="bounce"><span style={{ ...K, fontSize: 40, color: O }}>安く ↓</span></Pos>
      {/* 保障の盾：大 → ハサミ → 小 */}
      <div style={{ position: "absolute", left: 560, top: 4680, ...enter(f, F(30.6), "pop", "bounce") }}>
        <div style={{ position: "relative", width: 360, height: 360 }}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${1 - 0.35 * cut})`, opacity: 1 - cut, transformOrigin: "50% 100%" }}><GenSlot name="kh_shield_big" size={360} /></div>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${0.4 + 0.25 * cut})`, opacity: cut, transformOrigin: "50% 100%" }}><GenSlot name="kh_shield_small" size={360} /></div>
        </div>
      </div>
      <Pos x={640} y={5060} t={30.6}><span style={{ ...K, fontSize: 34 }}>保障</span></Pos>
      <Img name="kh_scissors_cut" x={400} y={4640} size={220} t={32.5} pat="whip" tempo="brake" />
      <Pos x={780} y={4700} t={33.0} pat="stamp" tempo="kire"><span style={{ ...K, fontSize: 44, color: RED }}>減る ↓</span></Pos>
      {/* いざという時 */}
      <Img name="kh_hospital_bill" x={60} y={5150} size={330} t={34.3} pat="slideL" tempo="brake" />
      <Stamp x={420} y={5260} t={35.45} size={56}>保障が足りない！？</Stamp>
    </>
  );
};

// ③ 決まった年齢で保障が終わる（設計書の帯）
const BANDS: [string, number, number][] = [["死亡保障", 80, 39.6], ["三大疾病", 80, 39.9], ["入院", 70, 40.2], ["介護", 70, 40.5]];
const SY = 5780, RH2 = 112;
const S4: React.FC<{ f: number }> = ({ f }) => {
  const end80 = F(41.82), end70 = F(43.36);
  return (
    <>
      <svg width={1080} height={5800} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 5480 L540 5600" start={F(36.6)} kind="lineShort" color={INK} w={6} glow={false} />
      </svg>
      <Head y={5620} t={37.0} no="3" title="決まった年齢で終わる" />
      {/* 年齢の目盛り */}
      {[30, 40, 50, 60, 70, 80, 90, 100].map((a, i) => (
        <Pos key={a} x={AX(a) - 22} y={SY + RH2 * 4 + 20} t={39.2 + i * 0.04} pat="pop" tempo="kire"><span style={{ ...K, fontSize: 28, color: a === 70 || a === 80 ? RED : M.sub }}>{a}</span></Pos>
      ))}
      <div style={{ position: "absolute", left: AX(30), top: SY + RH2 * 4 + 6, width: AX(100) - AX(30), height: 5, background: INK, opacity: f >= F(39.2) ? 1 : 0 }} />
      {BANDS.map(([label, endAge, t], i) => {
        const y = SY + i * RH2;
        const e = endAge === 80 ? end80 : end70;
        const w = p01(f, F(t), F(t) + 10);
        const gone = p01(f, e, e + 12, Easing.in(Easing.cubic)); // 終わる年齢より先が落ちていく
        return (
          <React.Fragment key={label}>
            <div style={{ position: "absolute", left: 60, top: y + 10, width: 200, height: 88, background: "#F6F1E2", border: `4px solid ${INK}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 32, ...enter(f, F(t), "slideL", "brake") }}>{label}</div>
            <div style={{ position: "absolute", left: AX(30), top: y + 18, width: (AX(endAge) - AX(30)) * Math.min(1, w * 1.4), height: 72, background: i < 2 ? O : "#F2A35E", border: `4px solid ${INK}`, borderRadius: "12px 0 0 12px", opacity: f >= F(t) ? 1 : 0 }} />
            {/* 終わる年齢より先（落ちて消える） */}
            {f >= F(t) ? <div style={{ position: "absolute", left: AX(endAge), top: y + 18 + gone * 140, width: (AX(100) - AX(endAge)) * Math.max(0, w * 1.4 - (AX(endAge) - AX(30)) / (AX(100) - AX(30)) * 1.4 + 0.4) / 1, maxWidth: AX(100) - AX(endAge), height: 72, background: "rgba(242,163,94,0.55)", border: `4px dashed ${INK}`, transform: `rotate(${gone * 14}deg)`, transformOrigin: "0 0", opacity: 1 - gone }} /> : null}
            {f >= e ? <div style={{ position: "absolute", left: AX(endAge) - 26, top: y + 20, ...K, fontSize: 60, color: RED, ...enter(f, e + 6, "stamp", "kire") }}>✕</div> : null}
            {f >= e ? <div style={{ position: "absolute", left: AX(endAge) + 34, top: y + 32, ...enter(f, e + 2, "pop", "bounce") }}><span style={{ display: "inline-block", background: RED, color: "#fff", borderRadius: 12, padding: "4px 14px", ...K, fontSize: 30 }}>{endAge}歳まで</span></div> : null}
          </React.Fragment>
        );
      })}
      <GlowBox box={[AX(30) - 8, SY + 8, AX(80) + 8, SY + RH2 * 2 - 2]} start={end80 - 4} end={F(43.2)} />
      <GlowBox box={[AX(30) - 8, SY + RH2 * 2 + 8, AX(70) + 8, SY + RH2 * 4 - 2]} start={end70 - 4} end={F(45.0)} />
      <svg width={1080} height={6600} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d={`M${AX(70)} ${SY - 20} L${AX(70)} ${SY + RH2 * 4 + 10}`} start={F(45.2)} kind="lineShort" color={RED} w={5} glow={false} />
        <GrowPath d={`M${AX(80)} ${SY - 20} L${AX(80)} ${SY + RH2 * 4 + 10}`} start={F(45.3)} kind="lineShort" color={RED} w={5} glow={false} />
      </svg>
      <Img name="kh_umbrella_gone" x={820} y={SY + RH2 * 4 + 70} size={240} t={45.6} pat="drop" tempo="bounce" />
      <Pos x={500} y={SY + RH2 * 4 + 130} t={46.0} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 40, color: RED }}>ここから先は<Marker t={46.4} c="#FFC9C2">保障なし</Marker></span></Pos>
      <Note x={60} y={SY + RH2 * 4 + 320} t={44.0} w={960}>※保障が終わる年齢は、保険会社・商品によって違います</Note>
      <Stamp x={300} y={5430} t={47.7} c={INK} size={52} rot={-3}>これが更新型保険の全体像</Stamp>
    </>
  );
};

// 僕の考え
const S5: React.FC<{ f: number }> = ({ f }) => {
  const band = p01(f, F(59.5), F(59.5) + 20, Easing.inOut(Easing.cubic));
  return (
    <>
      <svg width={1080} height={8000} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 6620 L540 6740" start={F(49.2)} kind="lineShort" color={INK} w={6} glow={false} />
      </svg>
      <Head y={6760} t={49.6} no="僕の考え" title="" c={G} />
      <Img name="kh_long_life" x={60} y={6880} size={330} t={49.7} pat="pop" tempo="bounce" />
      <Pos x={420} y={6930} t={50.0} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 56 }}>今は<br /><Marker t={50.3}>長生きの時代</Marker></span></Pos>
      {/* 70歳・80歳で終わる帯（ミニ） */}
      <div style={{ position: "absolute", left: 420, top: 7110, width: 560, ...enter(f, F(51.6), "slideUp", "brake") }}>
        <div style={{ height: 50, width: 360, background: O, border: `4px solid ${INK}`, borderRadius: 10, position: "relative" }}><span style={{ position: "absolute", right: -60, top: -8, ...K, fontSize: 50, color: RED }}>✕</span></div>
        <div style={{ height: 50, width: 300, background: "#F2A35E", border: `4px solid ${INK}`, borderRadius: 10, marginTop: 14, position: "relative" }}><span style={{ position: "absolute", right: -60, top: -8, ...K, fontSize: 50, color: RED }}>✕</span></div>
        <div style={{ ...K, fontSize: 30, color: RED, marginTop: 10 }}>70歳・80歳で 減る／なくなる</div>
      </div>
      <Stamp x={460} y={7330} t={55.5} size={46}>個人的には 良くない</Stamp>
      {/* 必要な保障を把握 → 終身 */}
      <svg width={1080} height={8000} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 7430 L540 7540" start={F(56.6)} kind="lineShort" color={INK} w={6} glow={false} />
      </svg>
      <Img name="kh_couple_checklist" x={50} y={7540} size={320} t={57.7} pat="slideL" tempo="brake" />
      <Pos x={400} y={7600} t={58.3} pat="pop" tempo="bounce"><Chip c={G} size={36}>必要な保障を把握</Chip></Pos>
      <Img name="kh_umbrella_family_young" x={720} y={7520} size={300} t={60.6} pat="drop" tempo="bounce" />
      {/* 一生涯続く終身の帯 */}
      <div style={{ position: "absolute", left: 60, top: 7900, width: 940 * band, height: 90, background: G, border: `5px solid ${INK}`, borderRadius: "14px 0 0 14px", clipPath: "polygon(0 0, calc(100% - 50px) 0, 100% 50%, calc(100% - 50px) 100%, 0 100%)", opacity: f >= F(59.5) ? 1 : 0, display: "flex", alignItems: "center", paddingLeft: 30, boxSizing: "border-box", ...K, fontSize: 40, color: "#fff", whiteSpace: "nowrap", overflow: "hidden" }}>終身タイプ　一生涯つづく</div>
      {/* 数年に一度の見直し */}
      {[0, 1, 2, 3].map((i) => (
        <Pos key={i} x={250 + i * 180} y={7840} t={62.7 + i * 0.25} pat="pop" tempo="bounce">
          <div style={{ width: 120, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto", borderRadius: "50%", background: "#fff", border: `6px solid ${G}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 36, color: G, transform: `rotate(${(f - F(62.7 + i * 0.25)) * 6}deg)` }}>↻</div>
          </div>
        </Pos>
      ))}
      <Pos x={300} y={8010} t={63.0} pat="slideUp" tempo="brake"><span style={{ ...K, fontSize: 38 }}>数年に一度 <Marker t={63.4}>見直し</Marker></span></Pos>
      <Img name="kh_review_meeting" x={40} y={8080} size={300} t={63.4} pat="slideL" tempo="brake" />
      <Stamp x={420} y={8120} t={63.8} c={G} size={64}>アップデート</Stamp>
      <Burst t={63.8} x={650} y={8180} c={G} r={240} n={16} />
    </>
  );
};

// ── 字幕（カラオケ式・「/」で改行）──
const SUBS: [number, string][] = [
  [0.0, "その保険が/*更新型の保険*"], [1.78, "例えば *10年ごと* に"], [3.12, "その年の年齢で/保険料が決め直されます"],
  [5.48, "年齢が上がるほど/病気や亡くなるリスクが高くなるので"], [8.8, "!保険料も上がる! 仕組みです"],
  [10.22, "この更新型の仕組みには/!3つのデメリット! があります"],
  [13.18, "1つ目/!更新の度に保険料が上がる!"], [15.22, "例えば/30歳で 月1万円の保険が"], [17.56, "40歳で *1.5万円*"], [19.2, "50歳で *2.7万円*"], [20.82, "60歳だと 約!6.2万円!"],
  [22.92, "実は 僕の父も/更新型の保険に入っていて"], [26.18, "毎月の保険料が/!8万円! を超えていました"],
  [28.6, "2つ目/!保障が減る! ことがある"], [30.42, "保険料を安く更新しようとすると/保障を減らすしかないので"], [34.26, "いざというときに/!保障が足りなくなる! 可能性があります"],
  [36.86, "3つ目/!決まった年齢で保障が終わる!"], [39.16, "例えば/いろいろな保障をつけていくと"], [41.24, "この保障は *80歳まで*"], [42.82, "この保障は *70歳まで* みたいに"],
  [45.16, "決まった年齢で 保障が終わる/ケースが多いです"], [47.62, "これが/*更新型保険の全体像*"],
  [49.56, "今は *長生きの時代*"], [51.14, "だからこそ 70歳や80歳で/保障が減ったり なくなったりするのは"], [55.18, "個人的には/!良くない! と思っています"],
  [56.96, "もちろん/必要な保障を把握した上で"], [59.42, "保険は/*一生涯続く終身タイプ* で持っておく"], [61.88, "その上で/数年に一度 見直して"], [63.78, "*アップデート* していく形が/いいかなと思います"],
];
const END = 66.2;
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
  const lv = KOSHIN_MOUTH.charCodeAt(Math.min(KOSHIN_MOUTH.length - 1, f)) - 48;
  const blink = f % 96 > 92 && lv === 0;
  const name = blink ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 3) % 4 ? "taichi_talk_open" : "taichi_talk_mid") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  return <div style={{ position: "absolute", left: 760, top: 1190 + Math.sin(f / 10) * 4, width: 200, height: 200 }}><GenSlot name={name} size={200} /></div>;
};

// ── カメラ（中身の中心 cy を映す・章の切り替えはマーケ博士の「ため→加速→ピタ」）──
const ck = (t: number, x: number, cy: number, z = 1, p: CamKey["p"] = "scroll"): CamKey => ({ f: F(t), x, y: cy + 200 / z, z, p });
const CAM: CamKey[] = [
  { f: 0, x: 540, y: 760 + 200 / 1.12, z: 1.12 },
  ck(1.5, 540, 760, 1, "zoomOut"),
  ck(5.1, 540, 1650, 1, "marke"),
  ck(9.9, 540, 2480, 1, "marke"),
  ck(12.9, 540, 3330, 1, "marke"),
  ck(22.6, 540, 3960, 1, "slide"),
  ck(28.3, 540, 5000, 1, "marke"),
  ck(36.6, 540, 6000, 1, "marke"),
  ck(47.3, 540, 5980, 0.92, "zoomOut"),
  ck(49.2, 540, 7080, 1, "marke"),
  ck(56.6, 540, 7720, 1, "marke"),
  ck(62.4, 540, 7980, 1, "slide"),
];
const SHAKES = [0.75, 27.4, 35.5, 41.9, 43.4];
const PUNCH = [0.75, 21.0, 27.3, 41.85, 43.4, 63.8];
const shakeAt = (f: number) => {
  let x = 0, y = 0;
  for (const s of SHAKES) { const k = f - F(s); if (k >= 0 && k < 9) { const a = (9 - k) * 2.6; x += Math.sin(k * 2.9) * a; y += Math.cos(k * 3.7) * a * 0.6; } }
  return { x, y };
};

// 効果音（u01〜u10 のみ・最初の1秒には置かない）
const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  s("u04", 1.05, 0.22), s("u02s", 2.3, 0.14), s("u02s", 2.8, 0.14), s("u05s", 3.4, 0.18), s("u06", 4.6, 0.18),
  s("u03s", 5.1, 0.18), s("u02s", 5.5, 0.14), s("u02s", 6.3, 0.14), s("u02s", 7.1, 0.14), s("u05s", 8.8, 0.18),
  s("u03s", 9.9, 0.18), s("u02s", 10.4, 0.14), s("u04", 11.74, 0.26),
  s("u03s", 12.9, 0.18), s("u05s", 15.56, 0.18), s("u05s", 17.56, 0.18), s("u05s", 19.2, 0.18), s("u05", 20.82, 0.24),
  s("u07", 23.5, 0.2), s("u04", 27.25, 0.3), s("u09", 27.5, 0.22),
  s("u03s", 28.3, 0.18), s("u05s", 31.0, 0.18), s("u07", 32.5, 0.2), s("u04", 35.45, 0.28),
  s("u03s", 36.6, 0.18), s("u02s", 39.6, 0.12), s("u02s", 39.9, 0.12), s("u02s", 40.2, 0.12), s("u02s", 40.5, 0.12), s("u04", 41.9, 0.26), s("u04", 43.45, 0.26), s("u06", 46.0, 0.18),
  s("u10", 47.7, 0.2), s("u03s", 49.2, 0.18), s("u05s", 50.0, 0.18), s("u04", 55.5, 0.24),
  s("u03s", 56.6, 0.18), s("u06", 58.3, 0.18), s("u10", 59.5, 0.18), s("u02s", 62.7, 0.12), s("u02s", 62.95, 0.12), s("u02s", 63.2, 0.12), s("u02s", 63.45, 0.12), s("u09", 63.8, 0.24),
];

const SAFE = 0.86, SAFE_X = 40, SAFE_Y = 120;
export const KOSHIN_REEL_FRAMES = F(66.4);
export const KoshinReel: React.FC = () => {
  const f = useCurrentFrame();
  const c = camAt(CAM, f);
  const sh = shakeAt(f);
  const punch = PUNCH.reduce((a, t) => { const k = f - F(t); return k >= 0 && k < 12 ? a + at([0, 0.06, 0.075, 0.06, 0.04, 0.025, 0.014, 0.007, 0.003, 0], k) : a; }, 0);
  const blur = motionBlur(c.v);
  const drift = Math.sin(f / 50) * 6;
  return (
    <AbsoluteFill style={{ background: M.paper, overflow: "hidden" }}>
      <Audio src={staticFile("koshin-narration.wav")} />
      <SfxTrack cues={CUES} />
      <div style={{ position: "absolute", left: SAFE_X, top: SAFE_Y, width: 1080, height: 1920, transform: `scale(${SAFE})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + punch})`, transformOrigin: "540px 700px" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 9000, transform: `translate(${540 - c.x * c.z + sh.x + drift}px, ${960 - c.y * c.z + sh.y}px) scale(${c.z})`, transformOrigin: "0 0", filter: blur ? `blur(${blur}px)` : undefined }}>
            <div style={{ position: "absolute", inset: -600, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} />
            <div style={{ position: "absolute", left: 60, top: -600, width: 4, height: 10000, background: "rgba(239,125,87,0.35)" }} />
            {f < F(14) ? <S0 f={f} /> : null}
            {f > F(4.5) && f < F(16) ? <S0b f={f} /> : null}
            {f > F(9) && f < F(25) ? <S1 f={f} /> : null}
            {f > F(12) && f < F(38) ? <S2 f={f} /> : null}
            {f > F(27) && f < F(50) ? <S3 f={f} /> : null}
            {f > F(35) && f < F(58) ? <S4 f={f} /> : null}
            {f > F(48) ? <S5 f={f} /> : null}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, bottom: 0, background: `linear-gradient(${M.paper}00, ${M.paper} 50px)` }} />
      <Karaoke />
      <div style={{ position: "absolute", left: 0, top: 0, transform: "scale(0.55)", transformOrigin: "0 0" }}>
        <Stepper labels={["仕組み", "保険料", "保障", "年齢", "僕の考え"]} steps={[0, 13.18, 28.6, 36.86, 49.56]} x={73} y={2490} color={O} />
      </div>
      <Chara />
    </AbsoluteFill>
  );
};
