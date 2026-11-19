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
  const alive = /^k[hn]_(man|father|hospital|elderly|long|couple|umbrella|review|kid|parent|family|child|teen)/.test(name);
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
// ── 共通の小物 ──
const AX = (age: number) => 280 + ((age - 30) * 720) / 70; // 年齢 → 横の位置（30歳〜100歳）
// 同じ男性が年をとる（となりの年齢の絵と重ねて、その場で年をとって見える）
const MEN: [number, string][] = [[30, "kh_man_30"], [40, "kh_man_40"], [50, "kh_man_50"], [60, "kh_man_60"], [70, "kh_man_70"]];
const AgeMan: React.FC<{ age: number; size: number }> = ({ age, size }) => {
  const a = Math.max(30, Math.min(70, age));
  let i = 0; while (i + 1 < MEN.length - 1 && a >= MEN[i + 1][0]) i++;
  const k = Math.min(1, Math.max(0, (a - MEN[i][0]) / 10));
  const mix = k < 0.6 ? 0 : (k - 0.6) / 0.4; // 年齢の区切りの手前で一気に入れ替わる
  const f = useCurrentFrame();
  const br = Math.sin(f / 11);
  return (
    <div style={{ position: "relative", width: size, height: size, transform: `scale(${1 + 0.012 * br}, ${1 - 0.012 * br})`, transformOrigin: "50% 100%" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - mix }}><GenSlot name={MEN[i][1]} size={size} /></div>
      {i + 1 < MEN.length ? <div style={{ position: "absolute", inset: 0, opacity: mix }}><GenSlot name={MEN[i + 1][1]} size={size} /></div> : null}
    </div>
  );
};
// ぐるぐる回る「自動更新」の矢印
const Loop: React.FC<{ f: number; size?: number; c?: string }> = ({ f, size = 120, c = O }) => (
  <svg width={size} height={size} viewBox="-60 -60 120 120" style={{ transform: `rotate(${f * 6}deg)` }}>
    <path d="M0 -44 A44 44 0 1 1 -40 18" fill="none" stroke={c} strokeWidth={12} strokeLinecap="round" />
    <path d="M-58 6 L-40 28 L-20 8 Z" fill={c} />
  </svg>
);

// ── ① 正体：証券 → 中へ寄る → カレンダーがめくれる ──
const S0: React.FC<{ f: number }> = ({ f }) => {
  const flips = [3.55, 4.15, 4.75];
  let page = 0; flips.forEach((t) => { if (f >= F(t)) page++; });
  const ages = [30, 40, 50, 60];
  const lastFlip = page ? F(flips[page - 1]) : -99;
  const flipP = p01(f, lastFlip, lastFlip + 7, Easing.out(Easing.cubic));
  return (
    <>
      <Head y={300} t={0.05} no="正体" title="その保険が…" />
      <Img name="kh_policy_envelope" x={120} y={420} size={300} t={0.1} pat="drop" tempo="bounce" />
      <Img name="kh_policy_doc" x={420} y={400} size={330} t={0.45} pat="slideUp" tempo="brake" />
      <Stamp x={490} y={550} t={0.72} size={70} rot={-10}>更新型</Stamp>
      <Burst t={0.72} x={620} y={600} c={RED} r={200} />
      <Pos x={780} y={460} t={1.3} pat="pop" tempo="bounce"><Chip c={O} size={36}>の保険</Chip></Pos>
      {/* 証券の中身（カメラが寄る） */}
      <div style={{ position: "absolute", left: 120, top: 790, width: 840, background: "#FFFDF4", border: `6px solid ${INK}`, borderRadius: 20, boxShadow: `10px 10px 0 ${O}`, ...enter(f, F(1.6), "focus", "std") }}>
        <div style={{ background: "#E9F0F8", borderBottom: `4px solid ${INK}`, padding: "10px 24px", ...K, fontSize: 32, borderRadius: "14px 14px 0 0" }}>保険証券</div>
        {[["保険の種類", "定期保険"], ["保険期間", "10年（更新型）"], ["更新", "自動で更新"]].map(([k, v], i) => (
          <div key={k} style={{ display: "flex", padding: "12px 24px", borderTop: i ? `3px dashed ${M.gray}` : undefined, ...K, fontSize: 34 }}><span style={{ width: 230, color: M.sub, fontSize: 28 }}>{k}</span><span style={{ color: i ? RED : INK }}>{v}</span></div>
        ))}
      </div>
      <GlowBox box={[126, 912, 954, 980]} start={F(2.2)} end={F(3.2)} />
      {/* カレンダー：30 → 40 → 50 → 60歳 とめくれていく */}
      <div style={{ position: "absolute", left: 250, top: 1110, width: 360, height: 300, ...enter(f, F(3.1), "drop", "bounce") }}>
        <div style={{ position: "absolute", inset: 0, background: "#fff", border: `6px solid ${INK}`, borderRadius: 18, boxShadow: `8px 8px 0 ${INK}` }}>
          <div style={{ height: 70, background: RED, borderRadius: "12px 12px 0 0" }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", ...SER, fontSize: 130, transform: `perspective(700px) rotateX(${(1 - flipP) * -80}deg)`, transformOrigin: "50% 0%" }}>{ages[page]}<span style={{ ...K, fontSize: 44 }}>歳</span></div>
        {page > 0 ? <div key={page} style={{ position: "absolute", right: -70, top: -20, ...enter(f, lastFlip + 3, "stamp", "kire") }}><span style={{ display: "inline-block", border: `6px solid ${O}`, color: O, background: "#fff", borderRadius: 12, padding: "2px 14px", ...K, fontSize: 36, transform: "rotate(10deg)" }}>更新</span></div> : null}
      </div>
      <Pos x={680} y={1150} t={3.2} pat="pop" tempo="bounce"><Loop f={f} size={130} /></Pos>
      <Pos x={660} y={1290} t={3.4} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 34, lineHeight: 1.3 }}>その年の年齢で<br /><Marker t={4.66} c="#FFD3A8">保険料を決め直し</Marker></span></Pos>
    </>
  );
};

// ── 仕組み：年齢スライダー1本 ──
const S0b: React.FC<{ f: number }> = ({ f }) => {
  const k = p01(f, F(5.6), F(9.6), Easing.inOut(Easing.cubic));
  const age = 30 + 40 * k;
  const x0 = 140, x1 = 780;
  const kx = x0 + (x1 - x0) * k;
  const risk = k;
  const prem = f < F(8.8) ? 1 : Math.min(6.2, 1 + Math.floor((f - F(8.8)) / 3) * 0.6);
  return (
    <>
      <svg width={1080} height={2600} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 1460 L540 1540" start={F(5.0)} kind="lineShort" color={INK} w={6} glow={false} />
      </svg>
      {/* 男性：つまみの上で年をとる */}
      <div style={{ position: "absolute", left: kx - 160, top: 1500 + Math.abs(Math.sin(f / 4)) * -8, ...enter(f, F(5.5), "drop", "bounce") }}><AgeMan age={age} size={320} /></div>
      {/* スライダー */}
      <div style={{ position: "absolute", left: x0, top: 1850, width: x1 - x0, height: 16, background: "#E3DCC8", borderRadius: 8, opacity: f >= F(5.5) ? 1 : 0 }} />
      <div style={{ position: "absolute", left: x0, top: 1850, width: kx - x0, height: 16, background: O, borderRadius: 8 }} />
      {f >= F(5.5) ? <div style={{ position: "absolute", left: kx - 34, top: 1824, width: 68, height: 68, borderRadius: "50%", background: "#fff", border: `7px solid ${O}`, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }} /> : null}
      {[30, 40, 50, 60, 70].map((a, i) => <Pos key={a} x={x0 + (i * (x1 - x0)) / 4 - 26} y={1900} t={5.5 + i * 0.05} pat="pop" tempo="kire"><span style={{ ...K, fontSize: 30, color: age >= a ? INK : M.gray }}>{a}歳</span></Pos>)}
      {/* 右：リスクのメーターと保険料 */}
      <div style={{ position: "absolute", left: 870, top: 1560, width: 90, height: 280, border: `6px solid ${INK}`, borderRadius: 14, background: "#fff", overflow: "hidden", ...enter(f, F(6.4), "slideUp", "brake") }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${10 + 90 * risk}%`, background: `linear-gradient(${RED}, #F6A08F)` }} />
      </div>
      <Pos x={840} y={1500} t={6.5} pat="pop" tempo="bounce"><span style={{ ...K, fontSize: 28, color: RED }}>リスク</span></Pos>
      <Pos x={840} y={1950} t={8.8} pat="stamp" tempo="kire">
        <div style={{ background: "#fff", border: `5px solid ${O}`, borderRadius: 14, padding: "6px 14px", textAlign: "center", boxShadow: `5px 5px 0 ${INK}` }}>
          <div style={{ ...K, fontSize: 24, color: M.sub }}>保険料</div>
          <div style={{ ...SER, fontSize: 48, color: O }}>{prem.toFixed(1)}<span style={{ ...K, fontSize: 22 }}>万</span></div>
        </div>
      </Pos>
      <Pos x={80} y={1990} t={9.3} pat="slideUp" tempo="brake"><span style={{ ...K, fontSize: 44 }}><Marker t={9.5} c="#FFD3A8">年をとるほど 保険料も上がる</Marker></span></Pos>
    </>
  );
};

// ── デメリット3つ：カードがバラバラの角度で投げ込まれて並ぶ ──
const S1: React.FC<{ f: number }> = ({ f }) => {
  const cards: [string, number, number][] = [["保険料が\n上がる", -24, 11.9], ["保障が\n減る", 18, 12.05], ["決まった年齢で\n終わる", -12, 12.2]];
  return (
    <>
      <svg width={1080} height={2600} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 2080 L540 2200" start={F(9.9)} kind="lineShort" color={INK} w={6} glow={false} />
      </svg>
      <Head y={2220} t={10.4} no="!" title="更新型のデメリット" />
      <Stamp x={760} y={2300} t={11.74} size={64}>3つ</Stamp>
      {cards.map(([t, rot, s0], i) => {
        const p = at([0, 0.35, 0.68, 0.88, 0.97, 1.02, 1], (f - F(s0)) / 1.2);
        if (f < F(s0)) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 60 + i * 330, top: 2420, width: 300, height: 190, transform: `translate(${(1 - p) * (i - 1) * 300}px, ${(1 - p) * 500}px) rotate(${(1 - p) * rot * 3 + (1 - Math.min(1, p)) * 0}deg)`, background: "#fff", border: `6px solid ${RED}`, borderRadius: 20, boxShadow: `7px 7px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ ...SER, fontSize: 56, color: RED, lineHeight: 1 }}>{i + 1}</span>
            <span style={{ ...K, fontSize: 30, whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.2, marginTop: 6 }}>{t}</span>
          </div>
        );
      })}
    </>
  );
};

// ── ① 保険料が上がる：階段＋家計の余裕が減る → 父の8万円で枠を突き破る ──
const STEPS: [number, string, number, string][] = [[30, "1", 15.56, ""], [40, "1.5", 17.56, "×1.5"], [50, "2.7", 19.2, "×1.8"], [60, "6.2", 20.82, "×2.3"]];
const BASE = 3720, PX = 62, FRAME_TOP = BASE - 430;
const S2: React.FC<{ f: number }> = ({ f }) => {
  const dad = F(27.22);
  const crash = p01(f, dad, dad + 8, Easing.out(Easing.cubic));
  const dim = p01(f, F(22.9), F(23.4));
  const room = interpolate(f, [F(15.4), F(17.56), F(19.2), F(20.82), F(21.4), dad, dad + 6], [100, 100, 82, 60, 22, 22, 0], clamp);
  return (
    <>
      <svg width={1080} height={3000} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 2680 L540 2880" start={F(12.9)} kind="lineShort" color={INK} w={6} glow={false} />
      </svg>
      <Head y={2900} t={13.3} no="1" title="更新の度に保険料が上がる" />
      {/* 注意書き（数字が出ている間ずっと） */}
      <Pos x={60} y={3010} t={15.7} pat="slideL" tempo="brake" style={{ opacity: 1 - dim }}>
        <div style={{ width: 520, background: "#FFF6C8", border: `5px solid ${O}`, borderRadius: 16, padding: "12px 18px", boxShadow: `5px 5px 0 ${INK}`, ...K, fontSize: 28, lineHeight: 1.35 }}>
          <span style={{ color: RED }}>⚠ 計算の一例です</span><br />
          <span style={{ fontSize: 24 }}>倍率や金額は、年齢・性別・保障額・<br />保険会社・商品によって違います</span>
        </div>
      </Pos>
      {/* 家計の余裕メーター（棒が伸びるほど減る） */}
      <Pos x={620} y={3020} t={15.8} pat="slideL" tempo="brake">
        <div style={{ width: 380, ...K, fontSize: 26 }}>
          <div>家計の余裕</div>
          <div style={{ marginTop: 6, height: 38, border: `5px solid ${INK}`, borderRadius: 12, background: "#fff", overflow: "hidden" }}>
            <div style={{ width: `${room}%`, height: "100%", background: room > 50 ? G : room > 25 ? O : RED }} />
          </div>
        </div>
      </Pos>
      {/* グラフの枠（父の8万円で突き破られる） */}
      {f >= F(15.4) ? <div style={{ position: "absolute", left: 60, top: FRAME_TOP, width: 960, height: BASE - FRAME_TOP, border: `5px solid ${INK}`, borderBottom: "none", borderRadius: "16px 16px 0 0", opacity: 0.35 }} /> : null}
      <div style={{ position: "absolute", left: 60, top: BASE, width: 960, height: 6, background: INK, opacity: f >= F(15.4) ? 1 : 0 }} />
      {STEPS.map(([age, v, t, mul], i) => {
        const g = p01(f, F(t), F(t) + 9, Easing.out(Easing.back(1.5)));
        const extra = i === 3 ? 1.8 * crash : 0; // 6.2 → 8.0
        const h = (Number(v) + extra) * PX;
        const x = 80 + i * 235;
        return (
          <React.Fragment key={age}>
            {f >= F(t) ? <div style={{ position: "absolute", left: x, top: BASE - h * g, width: 200, height: h * g, background: i === 3 ? RED : O, border: `5px solid ${INK}`, borderRadius: 12, boxShadow: `6px 6px 0 ${INK}`, opacity: i < 3 ? 1 - 0.55 * dim : 1, zIndex: i === 3 ? 9 : undefined }} /> : null}
            <div style={{ position: "absolute", left: x - 30, top: BASE - Number(v) * PX - 330, width: 260, opacity: i < 3 ? 1 - dim : 1 - p01(f, F(23.0), F(23.4)), ...enter(f, F(t) + 2, "drop", "bounce") }}><AgeMan age={age} size={250} /></div>
            <Pos x={x} y={BASE - h - 80} t={t + 0.15} pat="pop" tempo="bounce" style={{ zIndex: i === 3 ? 9 : undefined }}><span style={{ display: "inline-block", width: 200, textAlign: "center", ...SER, fontSize: i === 3 ? 62 : 52, color: i === 3 ? RED : INK }}>{i === 3 && f >= dad ? "8" : f >= F(t) + 4 ? <Roll t={t + 0.13} text={v} dur={8} /> : null}<span style={{ ...K, fontSize: 26 }}>{i === 3 && f >= dad ? "万円超え" : "万円"}</span></span></Pos>
            <Pos x={x + 40} y={BASE + 14} t={t} pat="pop" tempo="kire"><span style={{ ...K, fontSize: 36 }}>{age}歳</span></Pos>
            {mul ? <Pos x={x - 60} y={BASE - Number(v) * PX - 140} t={t + 0.5} pat="stamp" tempo="kire" style={{ opacity: 1 - dim }}><span style={{ display: "inline-block", background: "#fff", border: `4px solid ${RED}`, color: RED, borderRadius: 12, padding: "2px 10px", ...K, fontSize: 28, transform: "rotate(-8deg)" }}>{mul}</span></Pos> : null}
          </React.Fragment>
        );
      })}
      <GlowBox box={[778, BASE - 6.2 * PX - 90, 1000, BASE + 4]} start={F(21.6)} end={F(22.8)} />
      {/* 父の実話（グラフの左に入ってくる） */}
      {/* 父の話の間は、まわりを少し暗くして、父の絵・札・60歳の棒だけ明るく */}
      {f >= F(23.0) && f < F(28.8) ? <div style={{ position: "absolute", left: -1200, top: 1600, width: 3480, height: 3200, background: "rgba(40,30,10,0.5)", opacity: interpolate(f, [F(23.0), F(23.0) + 8, F(28.4), F(28.4) + 8], [0, 1, 1, 0], clamp), zIndex: 8, pointerEvents: "none" }} /> : null}
      <Img name="kh_father_shock" x={50} y={3260} size={340} t={23.2} pat="slideL" tempo="brake" style={{ zIndex: 9 }} />
      <Pos x={60} y={3190} t={23.6} pat="pop" tempo="bounce" style={{ zIndex: 9 }}><Chip c={INK} size={36}>実は 僕の父も…</Chip></Pos>
      <Pos x={400} y={3330} t={25.4} pat="slideUp" tempo="brake" style={{ zIndex: 9 }}><span style={{ display: "inline-block", background: "#fff", borderRadius: 14, padding: "6px 14px", ...K, fontSize: 34, color: INK }}>更新型の保険で<br />毎月の保険料が…</span></Pos>
      {/* 枠を突き破る：ヒビと破片 */}
      {f >= dad ? (
        <svg width={1080} height={4000} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none", zIndex: 9 }}>
          {[[-60, -40], [-30, -70], [10, -80], [50, -50], [80, -20]].map(([dx, dy], i) => (
            <line key={i} x1={890} y1={FRAME_TOP} x2={890 + dx * crash} y2={FRAME_TOP + dy * crash} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const k = Math.max(0, f - dad);
            const vx = [-7, -4, -1, 3, 6, 9][i], vy = [-18, -22, -25, -21, -17, -13][i];
            return <rect key={i} x={860 + i * 12 + vx * k} y={FRAME_TOP + vy * k + 0.9 * k * k} width={22} height={10} fill={INK} opacity={Math.max(0, 1 - k / 24)} transform={`rotate(${k * 25 * (i % 2 ? 1 : -1)} ${870 + i * 12 + vx * k} ${FRAME_TOP + vy * k + 0.9 * k * k})`} />;
          })}
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: 0, top: 0, zIndex: 9 }}><Burst t={27.25} x={890} y={FRAME_TOP} c={RED} r={240} n={16} /></div>
    </>
  );
};

// ── ② 保障が減る：つながった2本の棒 → 横へすべって「足りない分」──
const S3: React.FC<{ f: number }> = ({ f }) => {
  const cheap = p01(f, F(31.0), F(31.0) + 12, Easing.inOut(Easing.cubic));
  const follow = p01(f, F(32.7), F(32.7) + 14, Easing.out(Easing.back(1.3)));
  const pH = 330 - 150 * cheap, cH = 330 - 170 * follow;
  const B0 = 5080;
  const need = p01(f, F(34.5), F(34.5) + 10), got = p01(f, F(34.9), F(34.9) + 10), gap = p01(f, F(35.4), F(35.4) + 8);
  return (
    <>
      <svg width={1080} height={4800} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 4330 L540 4470" start={F(28.3)} kind="lineShort" color={INK} w={6} glow={false} />
      </svg>
      <Head y={4490} t={28.7} no="2" title="保障が減ることがある" />
      {/* 2本の棒：保険料を下げると、鎖でつながった保障も下がる */}
      <div style={{ position: "absolute", left: 150, top: B0 - pH, width: 200, height: pH, background: O, border: `6px solid ${INK}`, borderRadius: 14, ...enter(f, F(30.4), "rubber", "bounce") }} />
      <div style={{ position: "absolute", left: 620, top: B0 - cH, width: 200, height: cH, background: G, border: `6px solid ${INK}`, borderRadius: 14, ...enter(f, F(30.6), "rubber", "bounce") }} />
      <div style={{ position: "absolute", left: 620 + 100 - 60, top: B0 - cH - 130, width: 120, ...enter(f, F(30.7), "pop", "bounce") }}><GenSlot name={follow > 0.5 ? "kh_shield_small" : "kh_shield_big"} size={120} /></div>
      {f >= F(30.6) ? (
        <svg width={1080} height={5200} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
          <path d={`M350 ${B0 - pH + 30} C460 ${B0 - pH - 40} 520 ${B0 - cH - 40} 620 ${B0 - cH + 30}`} fill="none" stroke={INK} strokeWidth={7} strokeDasharray="18 12" />
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: 160, top: B0 + 14, ...K, fontSize: 34, opacity: f >= F(30.4) ? 1 : 0 }}>保険料</div>
      <div style={{ position: "absolute", left: 660, top: B0 + 14, ...K, fontSize: 34, opacity: f >= F(30.6) ? 1 : 0 }}>保障</div>
      <Pos x={370} y={4700} t={31.0} pat="pop" tempo="bounce"><span style={{ ...K, fontSize: 40, color: O }}>安く ↓</span></Pos>
      <Img name="kh_scissors_cut" x={820} y={4640} size={200} t={32.5} pat="whip" tempo="brake" />
      <Pos x={840} y={4860} t={32.9} pat="stamp" tempo="kire"><span style={{ ...K, fontSize: 44, color: RED }}>減る ↓</span></Pos>
      {/* 横へすべって：いざという時の「必要な額」と「出る額」 */}
      <Img name="kh_hospital_bill" x={1160} y={4600} size={320} t={34.2} pat="pop" tempo="bounce" />
      <div style={{ position: "absolute", left: 1540, top: B0 - 420 * need, width: 190, height: 420 * need, border: `6px dashed ${INK}`, borderRadius: 14, background: "rgba(255,255,255,0.7)" }} />
      <div style={{ position: "absolute", left: 1780, top: B0 - 190 * got, width: 190, height: 190 * got, background: G, border: `6px solid ${INK}`, borderRadius: 14 }} />
      {gap > 0 ? <div style={{ position: "absolute", left: 1780, top: B0 - 420, width: 190, height: (420 - 190) * gap, border: `6px solid ${RED}`, borderRadius: 14, backgroundImage: `repeating-linear-gradient(45deg, ${RED} 0 10px, transparent 10px 22px)`, opacity: 0.9 }} /> : null}
      <div style={{ position: "absolute", left: 1530, top: B0 + 14, ...K, fontSize: 30, opacity: need, whiteSpace: "nowrap" }}>必要な額</div>
      <div style={{ position: "absolute", left: 1790, top: B0 + 14, ...K, fontSize: 30, opacity: got, whiteSpace: "nowrap" }}>出る額</div>
      <Stamp x={1300} y={4930} t={35.45} size={56}>足りない！</Stamp>
    </>
  );
};

// ── ③ 決まった年齢で終わる：保障の「橋」が崩れる ──
const BANDS: [string, number, number][] = [["死亡保障", 80, 39.6], ["三大疾病", 80, 39.9], ["入院", 70, 40.2], ["介護", 70, 40.5]];
const SY = 5880, RH2 = 112;
const S4: React.FC<{ f: number }> = ({ f }) => {
  const end80 = F(41.82), end70 = F(43.36);
  const walk = p01(f, F(39.2), F(45.6), Easing.linear);
  const age = 30 + 58 * walk;
  return (
    <>
      <svg width={1080} height={5800} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 5480 L540 5600" start={F(36.6)} kind="lineShort" color={INK} w={6} glow={false} />
      </svg>
      <Head y={5620} t={37.0} no="3" title="決まった年齢で終わる" />
      {[30, 40, 50, 60, 70, 80, 90, 100].map((a, i) => (
        <Pos key={a} x={AX(a) - 22} y={SY + RH2 * 4 + 20} t={39.2 + i * 0.04} pat="pop" tempo="kire"><span style={{ ...K, fontSize: 28, color: a === 70 || a === 80 ? RED : M.sub }}>{a}</span></Pos>
      ))}
      <div style={{ position: "absolute", left: AX(30), top: SY + RH2 * 4 + 6, width: AX(100) - AX(30), height: 5, background: INK, opacity: f >= F(39.2) ? 1 : 0 }} />
      {BANDS.map(([label, endAge, t], i) => {
        const y = SY + i * RH2;
        const e = endAge === 80 ? end80 : end70;
        const w = p01(f, F(t), F(t) + 10);
        const len = AX(100) - AX(endAge);
        return (
          <React.Fragment key={label}>
            <div style={{ position: "absolute", left: 60, top: y + 10, width: 200, height: 88, background: "#F6F1E2", border: `4px solid ${INK}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 32, ...enter(f, F(t), "slideL", "brake") }}>{label}</div>
            {/* 残る部分 */}
            <div style={{ position: "absolute", left: AX(30), top: y + 18, width: (AX(endAge) - AX(30)) * Math.min(1, w * 1.4), height: 72, background: i < 2 ? O : "#F2A35E", border: `4px solid ${INK}`, borderRadius: "12px 0 0 12px", opacity: f >= F(t) ? 1 : 0, backgroundImage: "repeating-linear-gradient(90deg, transparent 0 46px, rgba(0,0,0,0.12) 46px 50px)" }} />
            {/* 崩れる部分：4つの板に割れて、少しずつずれて落ちる */}
            {f >= F(t) ? [0, 1, 2, 3].map((k) => {
              const d = Math.max(0, f - e - k * 2);
              const fall = f >= e ? 0.9 * d * d : 0;
              return <div key={k} style={{ position: "absolute", left: AX(endAge) + (len / 4) * k, top: y + 18 + fall, width: (len / 4) * Math.min(1, Math.max(0, w * 1.4 - 0.4)), height: 72, background: i < 2 ? O : "#F2A35E", border: `4px solid ${INK}`, transform: `rotate(${f >= e ? d * (k % 2 ? 3 : -4) : 0}deg)`, opacity: f >= e ? Math.max(0, 1 - d / 18) : 0.85 }} />;
            }) : null}
            {f >= e ? <div style={{ position: "absolute", left: AX(endAge) - 26, top: y + 20, ...K, fontSize: 60, color: RED, ...enter(f, e + 6, "stamp", "kire") }}>✕</div> : null}
            {f >= e ? <div style={{ position: "absolute", left: AX(endAge) + 34, top: y + 32, ...enter(f, e + 8, "pop", "bounce") }}><span style={{ display: "inline-block", background: RED, color: "#fff", borderRadius: 12, padding: "4px 14px", ...K, fontSize: 30 }}>{endAge}歳まで</span></div> : null}
          </React.Fragment>
        );
      })}
      {/* 年齢の線の上を歩く男性 */}
      {f >= F(39.2) ? (() => {
        const cross = F(39.2) + (50 / 58) * (F(45.6) - F(39.2)); // 80歳に着く時
        const d = Math.max(0, f - cross);
        const ax = age > 80 ? AX(80) + d * 4 : AX(age);
        return <div style={{ position: "absolute", left: ax - 80, top: SY + 18 - 160 + (d > 0 ? 0.8 * d * d : Math.abs(Math.sin(f / 3)) * -8), transform: `rotate(${d * 6}deg)`, opacity: Math.max(0, 1 - d / 26), zIndex: 5 }}><AgeMan age={Math.min(age, 80)} size={150} />{d > 0 ? <span style={{ position: "absolute", left: 120, top: -10, ...K, fontSize: 56, color: RED }}>!?</span> : null}</div>;
      })() : null}
      <GlowBox box={[AX(30) - 8, SY + 8, AX(80) + 8, SY + RH2 * 2 - 2]} start={end80 - 4} end={F(43.2)} />
      <GlowBox box={[AX(30) - 8, SY + RH2 * 2 + 8, AX(70) + 8, SY + RH2 * 4 - 2]} start={end70 - 4} end={F(45.0)} />
      <Img name="kh_umbrella_gone" x={820} y={SY + RH2 * 4 + 70} size={240} t={45.6} pat="drop" tempo="bounce" />
      <Pos x={460} y={SY + RH2 * 4 + 130} t={46.0} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 40, color: RED }}>ここから先は<Marker t={46.4} c="#FFC9C2">保障なし</Marker></span></Pos>
      <Note x={60} y={SY + RH2 * 4 + 320} t={44.0} w={960}>※保障が終わる年齢は、保険会社・商品によって違います</Note>
    </>
  );
};

// ── 僕の考え：2本の道で比べる ──
const LA = 7180, LB = 7360;
const S5: React.FC<{ f: number }> = ({ f }) => {
  const runA = p01(f, F(51.3), F(53.6), Easing.inOut(Easing.quad));
  const ageA = 30 + 50 * runA;
  const fallA = Math.max(0, f - F(53.7));
  const runB = p01(f, F(59.5), F(65.0), Easing.inOut(Easing.quad));
  const ageB = 30 + 70 * runB;
  const roadB = p01(f, F(59.5), F(60.3));
  return (
    <>
      <svg width={1080} height={8000} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 6620 L540 6740" start={F(49.2)} kind="lineShort" color={INK} w={6} glow={false} />
      </svg>
      <Head y={6760} t={49.6} no="僕の考え" title="" c={G} />
      <Img name="kh_long_life" x={60} y={6830} size={290} t={49.7} pat="pop" tempo="bounce" />
      <Pos x={400} y={6880} t={50.0} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 56 }}>今は <Marker t={50.3}>長生きの時代</Marker></span></Pos>
      {/* 道の左のラベル */}
      <Pos x={60} y={LA - 6} t={51.2} pat="slideL" tempo="brake"><span style={{ display: "inline-block", width: 200, textAlign: "center", background: O, color: "#fff", borderRadius: 14, padding: "10px 0", ...K, fontSize: 34 }}>更新型</span></Pos>
      <Pos x={60} y={LB - 6} t={59.4} pat="slideL" tempo="brake"><span style={{ display: "inline-block", width: 200, textAlign: "center", background: G, color: "#fff", borderRadius: 14, padding: "10px 0", ...K, fontSize: 34 }}>終身</span></Pos>
      {/* 道A：80歳で途切れる */}
      <div style={{ position: "absolute", left: AX(30), top: LA, width: (AX(80) - AX(30)) * p01(f, F(51.2), F(51.2) + 10), height: 56, background: "#F6C9A0", border: `4px solid ${INK}`, borderRadius: "12px 0 0 12px" }} />
      {f >= F(52.3) ? <div style={{ position: "absolute", left: AX(80) - 20, top: LA - 14, ...K, fontSize: 70, color: RED, ...enter(f, F(52.3), "stamp", "kire") }}>✕</div> : null}
      {f >= F(51.3) ? <div style={{ position: "absolute", left: AX(ageA) - 26, top: LA - 6 + 0.9 * fallA * fallA, width: 52, height: 52, borderRadius: "50%", background: O, border: `5px solid ${INK}`, opacity: Math.max(0, 1 - fallA / 20), transform: `rotate(${fallA * 14}deg)` }} /> : null}
      <Pos x={AX(80) + 60} y={LA - 4} t={52.6} pat="pop" tempo="bounce"><span style={{ ...K, fontSize: 30, color: RED }}>保障が なくなる</span></Pos>
      <Stamp x={600} y={LA - 100} t={55.5} size={46}>個人的には 良くない</Stamp>
      {/* 道B：100歳まで続く。見直しの休憩所を通るたびに光る */}
      <div style={{ position: "absolute", left: AX(30), top: LB, width: (AX(100) - AX(30) + 40) * roadB, height: 56, background: G, border: `4px solid ${INK}`, borderRadius: "12px 0 0 12px", clipPath: "polygon(0 0, calc(100% - 40px) 0, 100% 50%, calc(100% - 40px) 100%, 0 100%)" }} />
      {[40, 50, 60, 70, 80, 90].map((a, i) => {
        const pass = ageB >= a && f >= F(61.9);
        return (
          <div key={a} style={{ position: "absolute", left: AX(a) - 30, top: LB - 70, width: 60, textAlign: "center", opacity: f >= F(62.0) + i * 3 ? 1 : 0 }}>
            <div style={{ width: 54, height: 54, margin: "0 auto", borderRadius: "50%", background: pass ? YEL : "#fff", border: `5px solid ${G}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 30, color: G, boxShadow: pass ? `0 0 18px ${YEL}` : undefined, transform: pass ? `rotate(${(f % 30) * 12}deg)` : undefined }}>↻</div>
          </div>
        );
      })}
      {f >= F(59.5) ? <div style={{ position: "absolute", left: AX(ageB) - 26, top: LB + 2, width: 52, height: 52, borderRadius: "50%", background: "#fff", border: `6px solid ${G}`, boxShadow: `0 0 16px ${G}` }} /> : null}
      <Pos x={AX(100) - 40} y={LB + 70} t={60.3} pat="pop" tempo="bounce"><span style={{ ...K, fontSize: 30, color: G }}>一生涯</span></Pos>
      <Pos x={300} y={LB + 80} t={62.3} pat="slideUp" tempo="brake"><span style={{ ...K, fontSize: 36 }}>数年に一度 <Marker t={62.7}>見直し</Marker></span></Pos>
      {/* 下：把握 → 家族 → 相談 */}
      <Img name="kh_couple_checklist" x={40} y={7520} size={300} t={57.7} pat="slideL" tempo="brake" />
      <Pos x={330} y={7560} t={58.3} pat="pop" tempo="bounce"><Chip c={G} size={34}>必要な保障を把握</Chip></Pos>
      <Img name="kh_umbrella_family_young" x={720} y={7500} size={300} t={60.4} pat="drop" tempo="bounce" />
      <Img name="kh_review_meeting" x={360} y={7660} size={300} t={63.3} pat="slideUp" tempo="brake" />
      <Stamp x={560} y={7880} t={63.8} c={G} size={62}>アップデート</Stamp>
      <Burst t={63.8} x={760} y={7930} c={G} r={240} n={16} />
    </>
  );
};

// ── 見せ場カット：画面全体を1つの物が占める（暗転＋叩きつける数字／光が横切る）──
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
// 手前の小物：カメラより速く動く（ぼかし）＝奥行き
const PROPS: [number, number, string, number][] = [[10, 900, "kn_coin", 110], [960, 1700, "kh_renewal_notice", 140], [0, 2700, "kn_coin", 90], [980, 3500, "kn_coin", 120], [20, 4500, "kh_policy_doc", 130], [970, 5400, "kn_coin", 100], [10, 6300, "kh_hourglass", 120], [975, 7200, "kn_coin", 110], [15, 8000, "kh_renewal_notice", 130]];
const Foreground: React.FC<{ c: { x: number; y: number; z: number } }> = ({ c }) => {
  const P = 1.45;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {PROPS.map(([x, y, n, sz], i) => {
        const sy = 960 + (y - c.y) * c.z * P;
        if (sy < -300 || sy > 2200) return null;
        return <div key={i} style={{ position: "absolute", left: x - sz / 2, top: sy, opacity: 0.5, filter: "blur(5px)", transform: `rotate(${(i % 2 ? 1 : -1) * 18}deg)` }}><GenSlot name={n} size={sz} /></div>;
      })}
    </div>
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
  { f: 0, x: 540, y: 600 + 200 / 1.12, z: 1.12 },
  ck(1.55, 540, 930, 1.12, "zoomIn"),        // 証券の中へ寄る
  ck(3.0, 540, 1180, 1, "slide"),            // カレンダー
  ck(5.1, 540, 1780, 1, "marke"),            // 年齢スライダー
  ck(9.9, 540, 2420, 1, "marke"),            // デメリット3つ
  ck(12.9, 540, 3300, 1, "marke"),           // 保険料の階段
  ck(28.3, 540, 4900, 1, "marke"),           // 保障が減る
  ck(34.0, 1620, 4900, 1, "side"),           // 横へすべって「足りない分」
  ck(36.6, 540, 6060, 1, "marke"),           // 年齢で終わる（橋）
  ck(47.3, 540, 4300, 0.24, "zoomOut"),      // ノート全体＝全体像
  ck(49.2, 540, 7060, 1, "marke"),           // 僕の考え
  ck(56.6, 540, 7400, 1, "slide"),           // 2本の道＋下
];
const SHAKES = [0.75, 27.25, 35.5, 41.9, 43.4, 52.3];
const PUNCH = [0.75, 21.0, 27.25, 35.45, 41.85, 43.4, 52.3, 63.8];
const shakeAt = (f: number) => {
  let x = 0, y = 0;
  for (const s of SHAKES) { const k = f - F(s); if (k >= 0 && k < 9) { const a = (9 - k) * 2.6; x += Math.sin(k * 2.9) * a; y += Math.cos(k * 3.7) * a * 0.6; } }
  return { x, y };
};

// 効果音（u01〜u10 のみ・最初の1秒には置かない）
const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  s("u10", 21.6, 0.2), s("u04", 21.95, 0.3), s("u10", 27.3, 0.18), s("u04", 27.6, 0.32), s("u10", 45.7, 0.2), s("u04", 46.05, 0.3), s("u03s", 60.6, 0.22),
  s("u04", 1.05, 0.22), s("u03s", 1.55, 0.16), s("u06", 2.2, 0.16), s("u02s", 3.1, 0.14), s("u03", 3.55, 0.12), s("u03", 4.15, 0.12), s("u03", 4.75, 0.12),
  s("u03s", 5.1, 0.18), s("u05s", 6.4, 0.16), s("u05s", 8.8, 0.18),
  s("u03s", 9.9, 0.18), s("u04", 11.74, 0.26), s("u02s", 11.95, 0.14), s("u02s", 12.1, 0.14), s("u02s", 12.25, 0.14),
  s("u03s", 12.9, 0.18), s("u05s", 15.56, 0.18), s("u05s", 17.56, 0.18), s("u05s", 19.2, 0.18), s("u05", 20.82, 0.24),
  s("u07", 23.2, 0.2), s("u04", 27.25, 0.32), s("u09", 27.45, 0.24),
  s("u03s", 28.3, 0.18), s("u05s", 31.0, 0.16), s("u07", 32.5, 0.2), s("u03s", 34.0, 0.18), s("u02s", 34.5, 0.14), s("u02s", 34.9, 0.14), s("u04", 35.45, 0.28),
  s("u03s", 36.6, 0.18), s("u02s", 39.6, 0.12), s("u02s", 39.9, 0.12), s("u02s", 40.2, 0.12), s("u02s", 40.5, 0.12), s("u04", 41.9, 0.26), s("u04", 43.45, 0.26), s("u06", 46.0, 0.18),
  s("u10", 47.4, 0.2), s("u03s", 49.2, 0.18), s("u05s", 50.0, 0.18), s("u04", 52.3, 0.26), s("u04", 55.5, 0.24),
  s("u03s", 56.6, 0.18), s("u06", 58.3, 0.18), s("u10", 59.5, 0.18), s("u02s", 62.1, 0.12), s("u02s", 62.6, 0.12), s("u02s", 63.1, 0.12), s("u09", 63.8, 0.24),
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
        <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + punch}) rotate(${-Math.min(1.2, c.v / 260)}deg)`, transformOrigin: "540px 700px" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 9000, transform: `translate(${540 - c.x * c.z + sh.x + drift}px, ${960 - c.y * c.z + sh.y}px) scale(${c.z})`, transformOrigin: "0 0", filter: blur ? `blur(${blur}px)` : undefined }}>
            <div style={{ position: "absolute", left: -2000, top: -600, width: 5200, height: 10000, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} />
            <div style={{ position: "absolute", left: -2000, top: -600, width: 5200, height: 10000, backgroundImage: "radial-gradient(rgba(120,90,40,0.07) 1px, transparent 1.6px)", backgroundSize: "7px 7px" }} />
            <div style={{ position: "absolute", left: 60, top: -600, width: 4, height: 10000, background: "rgba(239,125,87,0.35)" }} />
            {f < F(14) || (f > F(47) && f < F(50)) ? <S0 f={f} /> : null}
            {(f > F(4.5) && f < F(16)) || (f > F(47) && f < F(50)) ? <S0b f={f} /> : null}
            {(f > F(9) && f < F(25)) || (f > F(47) && f < F(50)) ? <S1 f={f} /> : null}
            {(f > F(12) && f < F(38)) || (f > F(47) && f < F(50)) ? <S2 f={f} /> : null}
            {(f > F(27) && f < F(50)) ? <S3 f={f} /> : null}
            {f > F(35) && f < F(58) ? <S4 f={f} /> : null}
            {f > F(48) ? <S5 f={f} /> : null}
          </div>
          <Foreground c={c} />
        </div>
        {/* 画面の端を少し暗く */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 58%, rgba(70,50,15,0.16) 100%)", pointerEvents: "none" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, bottom: 0, background: `linear-gradient(${M.paper}00, ${M.paper} 50px)` }} />
      {/* 全体像：ノート全体まで引いた時の見出し（画面に直接） */}
      {f >= F(47.6) && f < F(49.4) ? <div style={{ position: "absolute", left: 0, width: 880, top: 520, display: "flex", justifyContent: "center", ...enter(f, F(47.65), "stamp", "kire"), opacity: 1 - p01(f, F(49.1), F(49.4)) }}><span style={{ display: "inline-block", background: "#fff", border: `8px solid ${INK}`, borderRadius: 20, padding: "14px 30px", ...K, fontSize: 56, boxShadow: `10px 10px 0 ${O}` }}>これが <span style={{ color: O }}>更新型保険</span> の全体像</span></div> : null}
      <HeroCut t0={21.95} t1={22.7}><div style={{ ...K, fontSize: 64, color: "#fff" }}>60歳で</div><div style={{ ...SER, fontSize: 230, color: "#FF6B5B", lineHeight: 1 }}>6.2<span style={{ ...K, fontSize: 90 }}>万円</span></div><div style={{ ...K, fontSize: 52, color: "#FFE15A" }}>毎月　30歳の約6倍</div></HeroCut>
      <HeroCut t0={27.6} t1={28.3}><div style={{ ...K, fontSize: 64, color: "#fff" }}>僕の父は 毎月</div><div style={{ ...SER, fontSize: 250, color: "#FF6B5B", lineHeight: 1 }}>8<span style={{ ...K, fontSize: 100 }}>万円超え</span></div></HeroCut>
      <HeroCut t0={46.05} t1={46.9} bg="#3A0F0B"><div style={{ ...K, fontSize: 64, color: "#fff" }}>ここから先は</div><div style={{ ...K, fontSize: 180, color: "#FF6B5B", lineHeight: 1.05 }}>保障なし</div></HeroCut>
      <HeroCut t0={60.6} t1={61.5} sweep><span style={{ ...K, fontSize: 100, color: "#fff", textShadow: "0 6px 20px rgba(0,0,0,0.3)" }}>一生涯つづく 終身</span></HeroCut>
      <Karaoke />
      <div style={{ position: "absolute", left: 0, top: 0, transform: "scale(0.55)", transformOrigin: "0 0" }}>
        <Stepper labels={["仕組み", "保険料", "保障", "年齢", "僕の考え"]} steps={[0, 13.18, 28.6, 36.86, 49.56]} x={73} y={2490} color={O} />
      </div>
      <Chara />
    </AbsoluteFill>
  );
};
