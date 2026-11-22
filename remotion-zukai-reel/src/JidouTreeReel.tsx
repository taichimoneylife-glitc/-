import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { K, B, SER, F } from "./components/marke";
import { GenSlot } from "./MileLifePlan";
import { SfxTrack } from "./components/sfx";
import { TapCard } from "./components/tapCard";
import { at } from "./components/flowKit";
import { enter } from "./components/motionLib";
import { JIDOU_MOUTH } from "./jidouMouth";

// ════════════════════════════════════════════════════════════════════
//  児童手当 v2：ツリー式（設計書 assets/jidou_blueprint.md）
//  1画面の地図が育つ：ハブ「わが家の児童手当」→ 4本の枝（？で予告 → 開く → 答えだけ残してたたむ）→ 最後に4つの答えの早見表 → スライドの表紙へ
//  地＝薄グレーの方眼（設計図ふう）／字幕＝今の言葉に箱が飛び移る／幕の切り替えは「物価」の1回だけ
// ════════════════════════════════════════════════════════════════════
const INK = "#2B2F3A", SUB = "#7C8291", LINE = "#9BA0AC", BG = "#ECEEF2";
const G = "#23A06B", O = "#EF7D57", BL = "#3C78C8", RED = "#E5483B", YEL = "#FFE15A", DARK = "#3A2521";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const p01 = (f: number, a: number, b: number, e = OUT) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
type PatT = Parameters<typeof enter>[2];
type TempoT = Parameters<typeof enter>[3];

// ── 小さな部品 ──
const Pos: React.FC<{ x: number; y: number; t: number; pat?: PatT; tempo?: TempoT; children: React.ReactNode; style?: React.CSSProperties; until?: number }> = ({ x, y, t, pat = "pop", tempo = "std", children, style, until }) => {
  const f = useCurrentFrame();
  if (until !== undefined && f > F(until) + 8) return null;
  const e = enter(f, F(t), pat, tempo);
  const fade = until !== undefined ? 1 - p01(f, F(until), F(until) + 8) : 1;
  const op = (e.opacity === undefined ? 1 : Number(e.opacity)) * fade * (style?.opacity === undefined ? 1 : Number(style.opacity));
  return <div style={{ position: "absolute", left: x, top: y, ...e, ...style, opacity: op }}>{children}</div>;
};
const Pic: React.FC<{ name: string; x: number; y: number; size: number; t: number; pat?: PatT; tempo?: TempoT; until?: number; breathe?: boolean }> = ({ name, x, y, size, t, pat = "pop", tempo = "bounce", until, breathe = true }) => {
  const f = useCurrentFrame();
  const k = f - F(t) - 10;
  const br = breathe && k > 0 ? Math.sin(k / 11) : 0;
  return <Pos x={x} y={y} t={t} pat={pat} tempo={tempo} until={until}><div style={{ transform: `scale(${1 + 0.014 * br}, ${1 - 0.014 * br})`, transformOrigin: "50% 100%" }}><GenSlot name={name} size={size} /></div></Pos>;
};
const Stamp: React.FC<{ x: number; y: number; t: number; c?: string; size?: number; rot?: number; until?: number; children: React.ReactNode }> = ({ x, y, t, c = RED, size = 54, rot = -6, until, children }) => (
  <Pos x={x} y={y} t={t} pat="stamp" tempo="kire" until={until}><span style={{ display: "inline-block", border: `7px solid ${c}`, color: c, background: "rgba(255,255,255,0.96)", borderRadius: 14, padding: "4px 24px", ...K, fontSize: size, transform: `rotate(${rot}deg)`, whiteSpace: "nowrap" }}>{children}</span></Pos>
);
const Txt: React.FC<{ x: number; y: number; t: number; size?: number; c?: string; w?: number; center?: boolean; pat?: PatT; until?: number; children: React.ReactNode }> = ({ x, y, t, size = 34, c = INK, w, center, pat = "pop", until, children }) => (
  <Pos x={x} y={y} t={t} pat={pat} tempo="kire" until={until}><div style={{ ...K, fontSize: size, color: c, lineHeight: 1.3, whiteSpace: "nowrap", width: w, textAlign: center ? "center" : undefined }}>{children}</div></Pos>
);
// 数字：3コマごとに段で上がって、言った瞬間に止まる
const Count: React.FC<{ t0: number; t1: number; to: number; dec?: number }> = ({ t0, t1, to, dec = 0 }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t0), F(t1), Easing.out(Easing.cubic));
  const stepF = Math.floor(f / 3) * 3;
  const v = f >= F(t1) ? to : to * p01(stepF, F(t0), F(t1), Easing.out(Easing.cubic));
  return <span style={{ display: "inline-block", transform: `translateY(${f >= F(t1) ? interpolate(f - F(t1), [0, 2, 5], [-8, 3, 0], clamp) : 0}px)`, opacity: p > 0 || f >= F(t0) ? 1 : 0 }}>{v.toFixed(dec)}</span>;
};
const Ring: React.FC<{ x: number; y: number; t: number; r?: number; c?: string }> = ({ x, y, t, r = 170, c = YEL }) => {
  const f = useCurrentFrame();
  const k = f - F(t);
  if (k < 0 || k > 14) return null;
  const p = p01(f, F(t), F(t) + 12);
  return <svg width={r * 3} height={r * 3} style={{ position: "absolute", left: x - r * 1.5, top: y - r * 1.5, overflow: "visible", pointerEvents: "none" }}><circle cx={r * 1.5} cy={r * 1.5} r={r * (0.3 + 0.9 * p)} fill="none" stroke={c} strokeWidth={14 * (1 - p)} /></svg>;
};
// 線（描かれていく）
const Ln: React.FC<{ d: string; t: number; dur?: number; c?: string; w?: number; dash?: boolean; op?: number }> = ({ d, t, dur = 8, c = LINE, w = 5, dash, op = 1 }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t), F(t) + dur);
  if (p <= 0) return null;
  return <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={dash ? "0.012 0.012" : 1} strokeDashoffset={dash ? 0 : 1 - p} opacity={op} style={dash ? { clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` } : undefined} />;
};
// 設計図ふうの枠（極細線＋四すみの印＋fig番号）
const Blueprint: React.FC<{ x: number; y: number; w: number; h: number; t: number; until: number; fig: string; c: string; dark?: number }> = ({ x, y, w, h, t, until, fig, c, dark = 0 }) => {
  const f = useCurrentFrame();
  if (f < F(t) || f > F(until) + 10) return null;
  const inP = p01(f, F(t), F(t) + 10);
  const out = p01(f, F(until), F(until) + 10, Easing.in(Easing.cubic));
  const tick = (cx: number, cy: number, sx: number, sy: number) => <path d={`M${cx + sx * 34} ${cy} L${cx} ${cy} L${cx} ${cy + sy * 34}`} stroke={c} strokeWidth={6} fill="none" strokeLinecap="round" />;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: inP * (1 - out), transform: `translateY(${(1 - inP) * 60 - out * 80}px)` }}>
      <div style={{ position: "absolute", inset: 0, background: dark ? `rgba(255,255,255,${0.06 * dark + 0.94 * (1 - dark)})` : "rgba(255,255,255,0.94)", border: `2px solid ${dark ? "rgba(255,255,255,0.25)" : "#C9CDD6"}`, borderRadius: 6 }} />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>{tick(0, 0, 1, 1)}{tick(w, 0, -1, 1)}{tick(0, h, 1, -1)}{tick(w, h, -1, -1)}</svg>
      <div style={{ position: "absolute", right: 18, top: 10, fontFamily: "monospace", fontSize: 22, color: dark ? "rgba(255,255,255,0.6)" : SUB, letterSpacing: 2 }}>{fig}</div>
    </div>
  );
};

// ══ ツリー：ハブ＋4本の枝 ══
type Br = { x: number; title: string; c: string; open: number; close: number; ans: string; img: string };
const BR: Br[] = [
  { x: 25, title: "どこに？", c: G, open: 2.6, close: 7.05, ans: "成長投資枠に一括", img: "jt_lump_sum_drop" },
  { x: 285, title: "いくら？", c: O, open: 7.05, close: 14.55, ans: "約415万円", img: "kn_coin_stack" },
  { x: 545, title: "なぜ運用？", c: BL, open: 14.55, close: 28.2, ans: "インフレに負けない", img: "jt_money_tree_big" },
  { x: 805, title: "注意点", c: RED, open: 28.2, close: 41.55, ans: "長く持つ＋債券", img: "jt_parent_shield_family" },
];
const NW = 250, NY = 200, PANEL_Y = 380;
const Tree: React.FC<{ f: number; dark: number }> = ({ f, dark }) => {
  const hubIn = enter(f, F(0.03), "drop", "bounce");
  return (
    <>
      <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <Ln d="M540 128 L540 162" t={0.45} dur={4} w={6} c={dark ? "#C9B9B4" : LINE} />
        <Ln d={`M${BR[0].x + NW / 2} 162 L${BR[3].x + NW / 2} 162`} t={0.55} dur={8} w={6} c={dark ? "#C9B9B4" : LINE} />
        {BR.map((b, i) => <Ln key={i} d={`M${b.x + NW / 2} 162 L${b.x + NW / 2} ${NY}`} t={0.75 + i * 0.08} dur={4} w={6} c={dark ? "#C9B9B4" : LINE} />)}
        {/* 開いている枝 → 下のパネルへ */}
        {BR.map((b, i) => (f >= F(b.open) && f < F(b.close) + 6 ? <Ln key={`p${i}`} d={`M${b.x + NW / 2} ${NY + 112} L${b.x + NW / 2} ${PANEL_Y - 6}`} t={b.open + 0.05} dur={5} w={8} c={b.c} op={1 - p01(f, F(b.close), F(b.close) + 6)} /> : null))}
      </svg>
      {/* ハブ */}
      <div style={{ position: "absolute", left: 270, top: 18, width: 540, height: 110, background: INK, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, boxShadow: "0 8px 18px rgba(30,35,50,0.25)", ...hubIn }}>
        <div style={{ width: 86, height: 86, borderRadius: "50%", background: "#fff", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}><GenSlot name="jt_family_2y0y" size={90} /></div>
        <span style={{ ...K, fontSize: 46, color: "#fff" }}>わが家の<span style={{ color: YEL }}>児童手当</span></span>
      </div>
      {BR.map((b, i) => <Node key={i} b={b} i={i} f={f} />)}
    </>
  );
};
const Node: React.FC<{ b: Br; i: number; f: number }> = ({ b, i, f }) => {
  const appear = enter(f, F(0.85 + i * 0.12), "pop", "bounce");
  const state = f < F(b.open) ? 0 : f < F(b.close) ? 1 : 2;
  const flip = state === 0 ? 0 : p01(f, F(b.open), F(b.open) + 8);
  const pulse = state === 1 ? 0.5 + 0.5 * Math.sin((f - F(b.open)) / 5) : 0;
  const doneP = p01(f, F(b.close), F(b.close) + 10);
  return (
    <div style={{ position: "absolute", left: b.x, top: NY, width: NW, ...appear }}>
      <div style={{ position: "relative", height: 112 + 62 * doneP, borderRadius: 18, background: state === 0 ? "#DADDE4" : "#fff", border: `${state === 1 ? 7 : 4}px solid ${state === 0 ? "#C3C7D0" : b.c}`, boxShadow: state === 1 ? `0 0 ${18 + 16 * pulse}px ${b.c}AA` : "0 4px 10px rgba(30,35,50,0.12)", transform: `perspective(700px) rotateY(${(state ? 1 - flip : 0) * 90}deg) scale(${state === 1 ? 1.04 : 1})`, overflow: "hidden", boxSizing: "border-box" }}>
        {state === 0 ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...SER, fontSize: 84, color: "#A7ACB8" }}>？</div>
        ) : (
          <>
            <div style={{ height: 104, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", background: b.c, color: "#fff", ...K, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
              <span style={{ ...K, fontSize: 36, color: INK }}>{b.title}</span>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 100, height: 64, background: b.c, color: "#fff", ...K, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", opacity: doneP, whiteSpace: "nowrap" }}>{b.ans}</div>
          </>
        )}
      </div>
    </div>
  );
};

// ══ ハブの登場（0〜2.7）══
const Intro: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Pic name="jt_family_2y0y" x={300} y={430} size={480} t={0.05} pat="slideUp" tempo="brake" until={2.4} />
    <Pic name="jt_parent_nisa_deposit" x={60} y={520} size={300} t={1.2} pat="slideL" tempo="brake" until={2.4} />
    <Stamp x={620} y={600} t={1.42} size={64} rot={-8} c={G} until={2.4}>全額NISA</Stamp>
    <Ring x={760} y={640} t={1.42} c={G} />
  </>
);

// ══ ① どこに？（2.6〜7.05）══
const B1: React.FC<{ f: number }> = ({ f }) => {
  const share = p01(f, F(6.6), F(6.6) + 14) * 0.28;
  const a = share * Math.PI * 2, cx = 800, cy = 905, r = 140;
  return (
    <>
      <Blueprint x={25} y={PANEL_Y} w={1030} h={830} t={2.6} until={7.05} fig="fig.01  どこに入れる？" c={G} />
      {/* 流れ：児童手当 → NISA（つみたて｜成長） */}
      <Pos x={70} y={450} t={2.75} pat="pop" tempo="bounce" until={7.05}>
        <div style={{ width: 230, height: 150, background: "#fff", border: `5px solid ${INK}`, borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 56 }}>✉️</span><span style={{ ...K, fontSize: 32 }}>児童手当</span>
        </div>
      </Pos>
      <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <Ln d="M310 525 L440 525" t={3.0} dur={5} c={INK} w={7} />
        <Ln d="M425 510 L445 525 L425 540" t={3.2} dur={3} c={INK} w={7} />
      </svg>
      <Pos x={460} y={430} t={3.1} pat="pop" tempo="bounce" until={7.05}>
        <div style={{ width: 560, border: `5px solid ${INK}`, borderRadius: 16, overflow: "hidden", background: "#fff" }}>
          <div style={{ background: INK, color: "#fff", ...K, fontSize: 34, textAlign: "center", padding: "4px 0" }}>NISA</div>
          <div style={{ display: "flex", height: 150 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 30, color: "#A7ACB8", borderRight: `4px dashed #C3C7D0` }}>つみたて投資枠</div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 30, color: G, background: f >= F(3.4) ? "#E3F5EC" : undefined, boxShadow: f >= F(3.4) ? `inset 0 0 0 6px ${G}` : undefined }}>成長投資枠</div>
          </div>
        </div>
      </Pos>
      {/* 一括でドサッ（コインが一度に落ちる） */}
      <Pic name="jt_lump_sum_drop" x={60} y={650} size={340} t={3.5} pat="slideUp" tempo="brake" until={7.05} />
      {Array.from({ length: 12 }).map((_, i) => {
        const k = f - (F(4.3) + (i % 4));
        if (k < 0 || k > 14 || f > F(7)) return null;
        return <div key={i} style={{ position: "absolute", left: 790 + ((i * 53) % 190), top: 440 + Math.min(1, k / 8) ** 2 * 150, opacity: k > 11 ? 1 - (k - 11) / 3 : 1 }}><GenSlot name="kn_coin" size={56} /></div>;
      })}
      {/* 取り消し線リビール：毎月コツコツ？ → まとめて一括 */}
      <Pos x={450} y={660} t={3.7} pat="wipe" tempo="std" until={5.0}>
        <div style={{ position: "relative", ...K, fontSize: 46, color: SUB }}>
          毎月コツコツ？
          <div style={{ position: "absolute", left: -8, top: "52%", height: 8, width: `${p01(f, F(4.25), F(4.25) + 5) * 108}%`, background: RED, borderRadius: 4 }} />
        </div>
      </Pos>
      <Stamp x={470} y={740} t={4.42} size={68} rot={-5} c={G} until={5.0}>まとめて一括！</Stamp>
      {/* 目的：大学資金のうち一部 */}
      <Txt x={440} y={655} t={5.12} size={42} until={7.05}>目的：子どもの <span style={{ color: G }}>大学資金</span></Txt>
      <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <g opacity={p01(f, F(5.7), F(5.9)) * (1 - p01(f, F(7.05), F(7.25)))}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#DADDE4" strokeWidth={70} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={G} strokeWidth={70} pathLength={1} strokeDasharray={`${share} ${1 - share}`} transform={`rotate(-90 ${cx} ${cy})`} />
        </g>
      </svg>
      <Txt x={cx - 90} y={cy - 26} t={6.1} size={40} w={180} center until={7.05}>大学資金</Txt>
      <Txt x={470} y={1085} t={6.92} size={34} c={G} until={7.05}>緑の<span style={{ fontSize: 46 }}>一部</span>＝児童手当の分</Txt>
    </>
  );
};

// ══ ② いくら？（7.05〜14.55）══
const X0 = 90, X1 = 990, T0 = 270, T1 = 990;
const mo = (n: number) => (n / 198) * (T1 - T0);
const Seg: React.FC<{ x: number; y: number; w: number; h: number; t: number; c: string; dur?: number; children?: React.ReactNode }> = ({ x, y, w, h, t, c, dur = 9, children }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t), F(t) + dur);
  if (p <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w * p, height: h, background: c, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 30, color: "#fff", overflow: "hidden", whiteSpace: "nowrap" }}>{p > 0.7 ? children : null}</div>;
};
const B2: React.FC<{ f: number }> = ({ f }) => {
  const one = 1 - p01(f, F(10.2), F(10.6)); // 1人分は小さくたたむ
  const suck = p01(f, F(13.0), F(13.4), Easing.in(Easing.cubic)); // 2本が合計へ吸い込まれる
  return (
    <>
      <Blueprint x={25} y={PANEL_Y} w={1030} h={830} t={7.05} until={14.55} fig="fig.02  いくら？" c={O} />
      {/* 1人分 */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 700, transform: `translateY(${(1 - one) * -40}px) scale(${0.7 + 0.3 * one})`, transformOrigin: "540px 420px", opacity: 0.35 + 0.65 * one }}>
        <Txt x={X0} y={420} t={7.3} size={36}>1人（0歳から最後まで）</Txt>
        {[[0, "0歳"], [3, "3歳"], [18, "18歳"]].map(([ag, s]) => <Txt key={s} x={X0 + ((ag as number) / 18) * (X1 - X0) - 20} y={480} t={7.5} size={28} c={SUB}>{s}</Txt>)}
        <Seg x={X0} y={525} w={(X1 - X0) * (54 / 245)} h={84} t={7.6} c={O}>54万</Seg>
        <Seg x={X0 + (X1 - X0) * (54 / 245)} y={525} w={(X1 - X0) * (191 / 245)} h={84} t={7.85} c={G} dur={12}>191万</Seg>
        <Txt x={X0} y={622} t={8.0} size={30} c={O}>1.5万円×36か月</Txt>
        <Txt x={X0 + 300} y={622} t={8.2} size={30} c={G}>1万円×191か月（高校卒業まで）</Txt>
      </div>
      {f < F(10.6) ? <Pos x={250} y={690} t={8.8} pat="stamp" tempo="kire"><div style={{ ...K, fontSize: 52, color: INK }}>＝ 1人 だいたい <span style={{ ...SER, fontSize: 130, color: O }}><Count t0={8.8} t1={9.3} to={245} /></span>万円</div></Pos> : null}
      <Ring x={560} y={780} t={9.3} c={O} r={220} />
      {/* わが家：2026年10月から */}
      {f >= F(10.3) ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1300, transform: `scale(${1 - 0.5 * suck})`, transformOrigin: "540px 1080px", opacity: 1 - suck }}>
          <Pos x={60} y={650} t={10.34} pat="stamp" tempo="kire"><span style={{ background: G, color: "#fff", borderRadius: 999, padding: "6px 26px", ...K, fontSize: 36 }}>我が家の場合</span></Pos>
          <Txt x={380} y={656} t={10.6} size={30} c={SUB}>2026年10月から（もらい済みは入れない）</Txt>
          <Txt x={60} y={740} t={10.8} size={32}>上の子</Txt>
          <div style={{ position: "absolute", left: T0 - 100, top: 735, width: 100, height: 64, background: "repeating-linear-gradient(45deg, #D5D8E0 0 8px, #E8EAEF 8px 16px)", opacity: 1 - p01(f, F(11.1), F(11.5)) * 0.6 }} />
          <Seg x={T0} y={735} w={mo(8)} h={64} t={11.0} c={O} dur={4} />
          <Seg x={T0 + mo(8)} y={735} w={mo(190)} h={64} t={11.15} c={G} dur={12}>→ 18歳</Seg>
          <Txt x={T0} y={808} t={11.6} size={34}><span style={{ color: O }}>12万</span> ＋ <span style={{ color: G }}>190万</span> ＝ 約<span style={{ fontSize: 46 }}>202万</span></Txt>
          <Txt x={60} y={900} t={11.0} size={32}>下の子</Txt>
          <div style={{ position: "absolute", left: T0 - 26, top: 895, width: 26, height: 64, background: "repeating-linear-gradient(45deg, #D5D8E0 0 8px, #E8EAEF 8px 16px)" }} />
          <Seg x={T0} y={895} w={mo(29)} h={64} t={11.2} c={O} dur={5} />
          <Seg x={T0 + mo(29)} y={895} w={mo(169)} h={64} t={11.4} c={G} dur={12}>→ そのとき17歳</Seg>
          <Txt x={T0} y={968} t={12.0} size={34}><span style={{ color: O }}>43.5万</span> ＋ <span style={{ color: G }}>169万</span> ＝ 約<span style={{ fontSize: 46 }}>212.5万</span></Txt>
          <div style={{ position: "absolute", left: T0 - 3, top: 715, width: 6, height: 260, background: RED, transformOrigin: "50% 0", transform: `scaleY(${p01(f, F(10.7), F(11.1))})` }} />
          <Txt x={T0 - 60} y={985 + 0} t={10.9} size={24} c={RED}>今</Txt>
        </div>
      ) : null}
      {f >= F(13.14) ? <Pos x={170} y={880} t={13.14} pat="stamp" tempo="kire"><div style={{ ...K, fontSize: 56, color: INK }}>合計 約<span style={{ ...SER, fontSize: 150, color: G }}><Count t0={13.3} t1={13.96} to={415} /></span>万円</div></Pos> : null}
      <Ring x={560} y={980} t={14.0} c={G} r={240} />
    </>
  );
};

// ══ ③ なぜ運用？（14.55〜28.2）幕：物価の所だけ濃い色 ══
const BASE = 1100, PER = 0.55;
const VBar: React.FC<{ x: number; h: number; t: number; c: string; dur?: number; label: string; val: React.ReactNode; valT: number; hatch?: boolean; until?: number }> = ({ x, h, t, c, dur = 14, label, val, valT, hatch, until }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t), F(t) + dur, Easing.out(Easing.cubic));
  if (p <= 0 || (until !== undefined && f > F(until))) return null;
  return (
    <>
      <div style={{ position: "absolute", left: x, top: BASE - h * p, width: 190, height: h * p, background: c, borderRadius: "14px 14px 0 0", backgroundImage: hatch ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 10px, transparent 10px 20px)" : undefined }} />
      <div style={{ position: "absolute", left: x - 20, top: BASE + 10, width: 230, textAlign: "center", ...K, fontSize: 28, color: INK }}>{label}</div>
      {f >= F(valT) ? <div style={{ position: "absolute", left: x - 20, top: BASE - h * p - 62, width: 230, textAlign: "center", ...K, fontSize: 42, color: c === "#C3C7D0" ? SUB : c, ...enter(f, F(valT), "pop", "bounce") }}>{val}</div> : null}
    </>
  );
};
const B3: React.FC<{ f: number; dark: number }> = ({ f, dark }) => {
  const inDark = f >= F(18.4) && f < F(25.2);
  return (
    <>
      <Blueprint x={25} y={PANEL_Y} w={1030} h={830} t={14.55} until={28.2} fig="fig.03  なぜ運用？" c={BL} dark={dark} />
      {/* 思い込み：銀行なら安心？ */}
      <Pos x={70} y={420} t={14.8} pat="pop" tempo="bounce" until={18.4}>
        <div style={{ position: "relative", background: "#fff", border: `5px solid ${INK}`, borderRadius: 30, padding: "12px 30px", ...K, fontSize: 40 }}>銀行に置いておけば 安心？
          <div style={{ position: "absolute", left: 80, bottom: -26, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `26px solid ${INK}` }} />
        </div>
      </Pos>
      <Pic name="jt_money_sleep_bank" x={60} y={560} size={330} t={15.3} pat="drop" until={18.4} />
      {!inDark && f < F(25.2) ? (
        <>
          <VBar x={480} h={415 * PER} t={15.0} c="#C3C7D0" hatch label="もらう額" val="415万" valT={15.2} />
          <VBar x={750} h={430 * PER} t={15.6} dur={22} c={BL} label="銀行 0.4%" val={<>約<Count t0={15.6} t1={16.36} to={430} />万</>} valT={15.6} />
          <Stamp x={560} y={560} t={17.88} size={56} rot={-6} c={BL}>ほぼ横ばい</Stamp>
          <div style={{ position: "absolute", left: 440, top: BASE, width: 580, height: 6, background: INK }} />
        </>
      ) : null}
      {/* 幕：物価 */}
      {inDark ? (
        <>
          <Txt x={70} y={420} t={18.6} size={52} c="#fff">でも <span style={{ color: "#FF8A7A" }}>物価</span> は…</Txt>
          <Pic name="jt_price_tags_up" x={560} y={400} size={420} t={18.92} pat="drop" />
          <Pic name="jt_shopping_worry" x={60} y={520} size={360} t={19.2} pat="slideUp" tempo="brake" until={22.1} />
          {[["2023年", "3.2%", 19.9], ["2024年", "2.7%", 20.35], ["2025年", "3.2%", 20.8]].map(([y, v, t], i) => (
            <Pos key={y as string} x={440 + i * 0} y={830 + i * 0} t={t as number} pat="drop" tempo="bounce" until={22.1} style={{ left: 70 + i * 320, top: 900 }}>
              <div style={{ width: 290, background: "rgba(255,255,255,0.08)", border: "4px solid #FF8A7A", borderRadius: 16, textAlign: "center", padding: "6px 0" }}>
                <div style={{ ...K, fontSize: 30, color: "#F2D9D4" }}>{y}</div>
                <div style={{ ...SER, fontSize: 76, color: "#FF8A7A", lineHeight: 1.05 }}>{v}<span style={{ ...K, fontSize: 42 }}>↑</span></div>
              </div>
            </Pos>
          ))}
          <Txt x={70} y={1100} t={21.0} size={28} c="#E8D6D2" until={22.1}>※消費者物価指数（総合）の前年比</Txt>
          <Pic name="jt_money_shrink" x={60} y={620} size={560} t={22.24} pat="pop" breathe={false} />
          <Stamp x={180} y={930} t={22.76} size={76} rot={-4} c="#FF6B5B">インフレに負けてしまう</Stamp>
        </>
      ) : null}
      {/* 年5%：ダッシュボード → 3本の棒 */}
      {f >= F(25.2) ? (
        <>
          <Pos x={60} y={410} t={25.3} pat="slideUp" tempo="brake">
            <div style={{ width: 960, height: 250, background: "#1F2A3A", borderRadius: 20, padding: "16px 28px", boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
              <div style={{ ...K, fontSize: 28, color: "#9FB3CC" }}>上の子が18歳になるまで ／ <span style={{ color: "#7BE0A0" }}>年5%</span>で運用</div>
              <div style={{ ...SER, fontSize: 130, color: "#fff", lineHeight: 1.1 }}>約<Count t0={25.5} t1={27.1} to={650} /><span style={{ ...K, fontSize: 56 }}>万円</span> <span style={{ ...K, fontSize: 40, color: "#7BE0A0" }}>▲</span></div>
              <svg width={420} height={170} style={{ position: "absolute", right: 24, bottom: 18 }}>
                <path d={`M0 165 C 120 150, 230 120, 420 20 L420 170 L0 170 Z`} fill="rgba(123,224,160,0.25)" opacity={p01(f, F(25.5), F(27.1))} />
                <Ln d="M0 165 C 120 150, 230 120, 420 20" t={25.5} dur={48} c="#7BE0A0" w={7} />
              </svg>
            </div>
          </Pos>
          <VBar x={110} h={415 * PER} t={25.5} c="#C3C7D0" hatch label="もらう額" val="415万" valT={25.7} dur={8} />
          <VBar x={400} h={430 * PER} t={25.75} c={BL} label="銀行 0.4%" val="約430万" valT={25.95} dur={8} />
          <VBar x={690} h={650 * PER} t={26.0} c={G} label="年5%" val="約650万" valT={27.1} dur={33} />
          <div style={{ position: "absolute", left: 70, top: BASE, width: 940, height: 6, background: INK }} />
          <Pic name="jt_money_tree_big" x={880} y={700} size={170} t={27.15} />
          <Txt x={70} y={BASE + 56} t={27.6} size={28} c={SUB}>※年0.4%・年5%は計算のための仮定。運用は元本保証なし</Txt>
        </>
      ) : null}
    </>
  );
};

// ══ ④ 注意点（28.2〜41.55）══
const Fork: React.FC<{ f: number }> = ({ f }) => (
  <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <Ln d="M540 540 L540 570 L285 570 L285 600" t={29.9} dur={7} c={RED} w={6} />
    <Ln d="M540 570 L795 570 L795 600" t={33.92} dur={6} c={G} w={6} />
  </svg>
);
const Scale: React.FC<{ f: number }> = ({ f }) => {
  // 株が乗る → ガクッと傾く → 債券が乗る → 水平に戻る
  const stock = p01(f, F(38.3), F(38.3) + 6);
  const bond = p01(f, F(39.98), F(39.98) + 6);
  const tilt = stock * 22 * (1 - bond);
  const wob = f >= F(38.5) && f < F(39.98) ? Math.sin((f - F(38.5)) / 2.2) * 2.2 * Math.exp(-(f - F(38.5)) / 14) : f >= F(40.2) ? Math.sin((f - F(40.2)) / 2.2) * 3 * Math.exp(-(f - F(40.2)) / 10) : 0;
  const ang = tilt + wob;
  const cx = 730, cy = 640, L = 180;
  const lx = cx - L * Math.cos((ang * Math.PI) / 180), ly = cy + L * Math.sin((ang * Math.PI) / 180);
  const rx = cx + L * Math.cos((ang * Math.PI) / 180), ry = cy - L * Math.sin((ang * Math.PI) / 180);
  const op = p01(f, F(37.7), F(38.0));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: op }}>
      <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={`M${cx} ${cy} L${cx} 900 M${cx - 90} 900 L${cx + 90} 900`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <path d={`M${lx} ${ly} L${rx} ${ry}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={16} fill={YEL} stroke={INK} strokeWidth={6} />
        {[[lx, ly], [rx, ry]].map(([x, y], i) => <path key={i} d={`M${x} ${y} L${x - 70} ${y + 110} L${x + 70} ${y + 110} Z M${x - 90} ${y + 110} L${x + 90} ${y + 110}`} stroke={INK} strokeWidth={6} fill="none" strokeLinejoin="round" />)}
      </svg>
      {stock > 0 ? <div style={{ position: "absolute", left: lx - 75, top: ly + 110 - 150 + (1 - stock) * -200 }}><div style={{ width: 150, height: 140, display: "flex", flexDirection: "column", alignItems: "center" }}><GenSlot name="nb_stock_box" size={110} /><span style={{ ...K, fontSize: 30, color: O, marginTop: -6 }}>株</span></div></div> : null}
      {bond > 0 ? <div style={{ position: "absolute", left: rx - 75, top: ry + 110 - 150 + (1 - bond) * -200 }}><div style={{ width: 150, height: 140, display: "flex", flexDirection: "column", alignItems: "center" }}><GenSlot name="nb_bond_box" size={110} /><span style={{ ...K, fontSize: 30, color: G, marginTop: -6 }}>債券</span></div></div> : null}
    </div>
  );
};
const Mini: React.FC<{ x: number; y: number; w: number; h: number; t: number; dur: number; pts: number[]; c: string }> = ({ x, y, w, h, t, dur, pts, c }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <path d={`M0 0 L0 ${h} L${w} ${h}`} stroke={INK} strokeWidth={4} fill="none" />
    <Ln d={pts.map((v, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * w} ${h - v * h}`).join(" ")} t={t} dur={dur} c={c} w={9} />
  </svg>
);
const Mark: React.FC<{ x: number; y: number; t: number; ok?: boolean; s?: number }> = ({ x, y, t, ok, s = 130 }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t), F(t) + 9);
  if (p <= 0) return null;
  return (
    <svg width={s} height={s} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      {ok ? <circle cx={s / 2} cy={s / 2} r={s / 2 - 10} fill="none" stroke={G} strokeWidth={18} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform={`rotate(-90 ${s / 2} ${s / 2})`} strokeLinecap="round" />
        : <><path d={`M10 10 L${s - 10} ${s - 10}`} stroke={RED} strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, p * 2)} /><path d={`M${s - 10} 10 L10 ${s - 10}`} stroke={RED} strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, p * 2 - 1)} /></>}
    </svg>
  );
};
const B4: React.FC<{ f: number }> = ({ f }) => {
  const part2 = f >= F(37.5);
  return (
    <>
      <Blueprint x={25} y={PANEL_Y} w={1030} h={830} t={28.2} until={41.55} fig="fig.04  注意点" c={RED} />
      <Stamp x={230} y={420} t={28.46} size={58} rot={-3} c={INK} until={37.5}>あくまで わが家のケース</Stamp>
      {!part2 ? (
        <>
          <Fork f={f} />
          {/* 左：近いうちに使う */}
          <Pos x={55} y={600} t={29.9} pat="slideUp" tempo="brake"><div style={{ width: 460, height: 540, border: `5px solid ${RED}`, borderRadius: 20, background: "#fff" }} /></Pos>
          <Txt x={55} y={615} t={30.0} size={38} w={460} center>近いうちに使う</Txt>
          <Pic name="jt_parent_calendar_univ" x={150} y={665} size={260} t={30.3} />
          <Mini x={110} y={950} w={340} h={110} t={31.2} dur={20} pts={[0.6, 0.68, 0.45, 0.15, 0.08]} c={RED} />
          <Mark x={330} y={900} t={32.74} />
          <Stamp x={70} y={1080} t={32.9} size={42} rot={-4} c={RED}>運用はおすすめしません</Stamp>
          {/* 右：大学まで長い */}
          <Pos x={565} y={600} t={33.92} pat="slideUp" tempo="brake"><div style={{ width: 460, height: 540, border: `5px solid ${G}`, borderRadius: 20, background: "#fff" }} /></Pos>
          <Txt x={565} y={615} t={34.0} size={38} w={460} center>うちは 2歳と0歳</Txt>
          <Seg x={600} y={680} w={390} h={54} t={34.3} c={O} dur={14}>2歳 ──→ 18歳</Seg>
          <Seg x={600} y={745} w={390} h={54} t={34.7} c={O} dur={14}>0歳 ──→ 18歳</Seg>
          <Txt x={600} y={812} t={35.4} size={34} c={G}>大学まで 長く持てる</Txt>
          <Mini x={610} y={890} w={360} h={140} t={36.0} dur={22} pts={[0.1, 0.25, 0.16, 0.42, 0.3, 0.56, 0.46, 0.78, 0.92]} c={G} />
          <Mark x={850} y={860} t={36.76} ok />
          <Stamp x={640} y={1080} t={36.9} size={42} rot={4} c={G}>だから運用</Stamp>
        </>
      ) : (
        <>
          <Pic name="jt_crash_worry" x={50} y={430} size={380} t={37.6} pat="slideL" tempo="brake" until={40.8} />
          <Stamp x={60} y={960} t={38.78} size={52} rot={-5} c={RED} until={40.8}>株だけ＝リスクが高い</Stamp>
          <Scale f={f} />
          <Pic name="jt_parent_shield_family" x={50} y={480} size={420} t={40.9} pat="slideUp" tempo="brake" />
          <Stamp x={560} y={960} t={41.06} size={56} rot={-3} c={G}>リスクにも備える</Stamp>
        </>
      )}
    </>
  );
};

// ══ 早見表（41.55〜44.3）→ スライドの表紙へ（44.3〜47.1）══
const Overview: React.FC<{ f: number }> = ({ f }) => {
  if (f < F(41.55) || f > F(44.6)) return null;
  const out = p01(f, F(44.1), F(44.5), Easing.in(Easing.cubic));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, transform: `scale(${1 - 0.25 * out})`, transformOrigin: "540px 700px" }}>
      <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {BR.map((b, i) => <Ln key={i} d={`M${b.x + NW / 2} ${NY + 174} L${b.x + NW / 2} 410`} t={41.6 + i * 0.1} dur={5} c={b.c} w={6} />)}
      </svg>
      {BR.map((b, i) => (
        <Pos key={i} x={b.x} y={410} t={41.7 + i * 0.12} pat="drop" tempo="bounce">
          <div style={{ width: NW, height: 520, background: "#fff", border: `5px solid ${b.c}`, borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "16px 0", boxSizing: "border-box", boxShadow: "0 6px 14px rgba(30,35,50,0.12)" }}>
            <GenSlot name={b.img} size={210} />
            <div style={{ ...K, fontSize: 32, color: b.c, textAlign: "center", lineHeight: 1.3, padding: "0 10px" }}>{[["成長投資枠に", "一括"], ["約415万円"], ["インフレに", "負けない"], ["長く持てる", "＋債券も"]][i].map((l, k) => <div key={k}>{l}</div>)}</div>
          </div>
        </Pos>
      ))}
      <Stamp x={250} y={960} t={42.4} size={60} rot={-4} c={INK}>これが わが家の答え</Stamp>
    </div>
  );
};
const Slides: React.FC<{ f: number }> = ({ f }) => {
  if (f < F(44.1) || f > F(47.4)) return null;
  const flip = p01(f, F(44.2), F(44.2) + 12, Easing.out(Easing.back(1.3)));
  const out = p01(f, F(47.0), F(47.0) + 8, Easing.in(Easing.cubic));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1300, transform: `translateY(${out * -1500}px)` }}>
      <Sequence from={F(44.1)} layout="none">
        <OffthreadVideo src={staticFile("cta_jidou/slides.mp4")} muted style={{ position: "absolute", left: 40, top: 380, width: 1000, height: 820, objectFit: "cover", borderRadius: 18, filter: "blur(3px) brightness(0.95)", opacity: p01(f, F(44.1), F(44.5)) }} />
      </Sequence>
      <div style={{ position: "absolute", left: 40, top: 380, width: 1000, height: 820, borderRadius: 18, background: "rgba(236,238,242,0.55)" }} />
      <div style={{ position: "absolute", left: 80, top: 450, width: 920, transform: `perspective(1600px) rotateY(${(1 - flip) * -80}deg) rotate(${-1.5 * flip}deg)`, opacity: flip > 0.02 ? 1 : 0, boxShadow: "0 24px 50px rgba(30,35,50,0.35)", border: "8px solid #fff", borderRadius: 14, overflow: "hidden" }}>
        <img src={staticFile("cta_jidou/cover.jpg")} style={{ width: "100%", display: "block" }} />
      </div>
      <Pic name="jt_parent_read_guide" x={60} y={900} size={280} t={45.0} />
      <Stamp x={360} y={1040} t={46.1} size={54} rot={-3} c={G}>スライドにまとめました</Stamp>
    </div>
  );
};

// ── 字幕：1文を全部出して、今の言葉に箱が飛び移る ──
type Tok = [number, string];
const PH: Tok[][] = [
  [[0.0, "わが家は"], [0.64, "児童手当を"], [0, "/"], [1.42, "*全額NISA*に"], [2.06, "入れています"]],
  [[2.7, "具体的には"], [3.4, "*成長投資枠*に"], [4.42, "*一括投資*"]],
  [[5.12, "目的は"], [5.72, "子どもの"], [6.28, "*大学資金*の"], [6.92, "一部"]],
  [[7.28, "児童手当は"], [8.02, "1人"], [8.42, "だいたい"], [0, "/"], [8.8, "*245万円*"], [9.72, "もらえて"]],
  [[10.34, "我が家の場合"], [0, "/"], [11.28, "上の子が"], [11.72, "18歳に"], [12.26, "なるまでだと"]],
  [[13.14, "合計"], [13.54, "*約415万円*"]],
  [[14.82, "これを"], [15.24, "銀行に"], [15.68, "置いておくと"]],
  [[16.36, "約430万円"], [17.88, "!ほぼ横ばい!"]],
  [[18.6, "でも"], [18.92, "物価は"], [19.38, "ここ数年"], [0, "/"], [19.9, "!2%から3%!"], [21.16, "くらいで"], [21.42, "上がってるので"]],
  [[22.24, "!インフレに!"], [22.76, "!負けてしまう!"]],
  [[23.52, "もし"], [23.88, "上の子が"], [24.44, "18歳に"], [24.92, "なるまで"]],
  [[25.38, "*年5%*で"], [26.36, "運用できたら"], [0, "/"], [27.1, "*約650万円*"]],
  [[28.46, "これは"], [28.76, "あくまで"], [29.2, "*わが家のケース*"]],
  [[29.9, "もし"], [30.24, "教育資金を"], [0, "/"], [31.06, "近いうちに"], [31.58, "使う予定が"], [32.16, "あるなら"]],
  [[32.74, "運用は"], [33.3, "!おすすめしません!"]],
  [[33.92, "うちは"], [34.3, "2歳と0歳で"], [0, "/"], [35.4, "大学まで"], [36.04, "*長く持てる*から"], [36.76, "運用していて"]],
  [[37.6, "!株だけ!だと"], [38.38, "本当に"], [0, "/"], [38.78, "!リスクが高い!ので"]],
  [[39.7, "*債券*も"], [40.26, "持って"], [0, "/"], [40.56, "リスクにも"], [41.06, "備えています"]],
  [[41.78, "0歳と2歳の"], [42.92, "子どもがいる"], [43.34, "僕が"]],
  [[43.92, "実際にしている"], [0, "/"], [44.8, "教育資金の"], [45.52, "貯め方を"]],
  [[46.1, "*スライド*に"], [46.52, "まとめました"]],
  [[47.16, "欲しい方は"], [47.92, "プロフの"], [48.28, "リンクから"], [0, "/"], [48.74, "*公式LINE*を"], [49.38, "追加して"]],
  [[50.0, "ここから"], [50.42, "受け取って"], [50.88, "ください"]],
];
const END = 51.3;
const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  let pi = -1;
  PH.forEach((p, k) => { if (t >= p[0][0]) pi = k; });
  if (pi < 0 || t > END) return null;
  const ph = PH[pi];
  const words = ph.filter(([, w]) => w !== "/");
  let cur = -1;
  words.forEach(([s], k) => { if (t >= s) cur = k; });
  const inS = interpolate(f - F(ph[0][0]), [0, 3, 6], [0.92, 1.03, 1], clamp);
  let wi = -1;
  return (
    <div style={{ position: "absolute", left: 40, width: 720, top: 1180, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: 20, padding: "12px 18px", boxShadow: "0 6px 16px rgba(30,35,50,0.18)", textAlign: "center", transform: `scale(${inS})`, lineHeight: 1.55 }}>
        {ph.map(([s, raw], j) => {
          if (raw === "/") return <br key={j} />;
          wi++;
          const color = raw.includes("*") ? G : raw.includes("!") ? RED : INK;
          const w = raw.replace(/[*!]/g, "");
          const on = wi === cur;
          const past = wi < cur;
          const k = f - F(s);
          const hop = on ? interpolate(k, [0, 2, 5], [0.8, 1.08, 1], clamp) : 1;
          return (
            <span key={j} style={{ display: "inline-block", margin: "0 3px", padding: "0 8px", borderRadius: 10, ...K, fontSize: 40, background: on ? color : "transparent", color: on ? "#fff" : past ? (color === INK ? INK : color) : "#B5B9C4", transform: `scale(${hop})`, whiteSpace: "nowrap" }}>{w}</span>
          );
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
  return <div style={{ position: "absolute", left: 770, top: 1185 + Math.sin(f / 10) * 4, width: 200, height: 200 }}><GenSlot name={name} size={200} /></div>;
};

// 効果音（u01〜u10 のみ・最初の1秒には置かない）
const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  s("u05s", 1.2, 0.14), s("u04", 1.42, 0.26),
  s("u03s", 2.6, 0.16), s("u02s", 3.1, 0.12), s("u05s", 3.5, 0.14), s("u06", 4.25, 0.14), s("u04", 4.42, 0.26), s("u05s", 5.7, 0.14), s("u07", 6.6, 0.14),
  s("u03s", 7.05, 0.16), s("u05s", 7.6, 0.12), s("u05s", 7.85, 0.12), s("u05", 8.8, 0.24), s("u03s", 10.3, 0.14), s("u05s", 11.0, 0.12), s("u05s", 11.4, 0.12), s("u02s", 13.0, 0.14), s("u05", 13.96, 0.24), s("u09", 14.0, 0.18),
  s("u03s", 14.55, 0.16), s("u05s", 14.8, 0.14), s("u05s", 15.6, 0.12), s("u04", 17.88, 0.24),
  s("u10", 18.4, 0.2), s("u05s", 18.92, 0.14), s("u02s", 19.9, 0.12), s("u02s", 20.35, 0.12), s("u02s", 20.8, 0.12), s("u07", 22.24, 0.18), s("u04", 22.76, 0.3),
  s("u03s", 25.2, 0.16), s("u06", 26.0, 0.14), s("u05", 27.1, 0.24), s("u05s", 27.3, 0.12), s("u05s", 27.45, 0.12), s("u09", 27.7, 0.2),
  s("u03s", 28.2, 0.16), s("u04", 28.46, 0.24), s("u05s", 29.9, 0.14), s("u07", 31.2, 0.16), s("u04", 32.8, 0.26), s("u05s", 33.92, 0.14), s("u06", 36.0, 0.14), s("u09", 36.8, 0.2),
  s("u03s", 37.5, 0.16), s("u07", 38.3, 0.2), s("u04", 38.78, 0.24), s("u05", 39.98, 0.2), s("u09", 40.9, 0.2),
  s("u03s", 41.55, 0.16), s("u05s", 41.7, 0.1), s("u05s", 41.82, 0.1), s("u05s", 41.94, 0.1), s("u05s", 42.06, 0.1), s("u04", 42.4, 0.24),
  s("u03s", 44.1, 0.16), s("u06", 44.2, 0.16), s("u04", 46.1, 0.24),
  s("u03s", 47.1, 0.16), s("u05s", 48.4, 0.18), s("u03s", 49.25, 0.16), s("u05s", 50.25, 0.18),
];
const PUNCH = [1.42, 4.42, 8.8, 13.96, 17.88, 22.76, 27.1, 32.8, 36.8, 39.98, 42.4];

const SAFE = 0.86, SAFE_X = 40, SAFE_Y = 120;
export const JIDOU_TREE_FRAMES = F(51.4);
export const JidouTreeReel: React.FC = () => {
  const f = useCurrentFrame();
  const dark = p01(f, F(18.4), F(18.4) + 10) * (1 - p01(f, F(25.1), F(25.1) + 10));
  const punch = PUNCH.reduce((a, t) => { const k = f - F(t); return k >= 0 && k < 12 ? a + at([0, 0.05, 0.06, 0.05, 0.035, 0.02, 0.012, 0.006, 0.003, 0], k) : a; }, 0);
  const drift = Math.sin(f / 60) * 5, driftY = Math.cos(f / 75) * 4;
  const zoomOut = p01(f, F(41.4), F(41.9)) * (1 - p01(f, F(44.0), F(44.4)));
  const bg = dark > 0 ? `rgb(${236 + (58 - 236) * dark}, ${238 + (37 - 238) * dark}, ${242 + (33 - 242) * dark})` : BG;
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <Audio src={staticFile("jidou-narration.wav")} />
      <SfxTrack cues={CUES} />
      {/* 方眼（設計図ふう） */}
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(rgba(120,130,150,${0.13 * (1 - dark)}) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(120,130,150,${0.13 * (1 - dark)}) 1.5px, transparent 1.5px)`, backgroundSize: "48px 48px", backgroundPosition: `${drift}px ${driftY}px` }} />
      <div style={{ position: "absolute", left: SAFE_X, top: SAFE_Y, width: 1080, height: 1920, transform: `scale(${SAFE})`, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", inset: 0, transform: `translate(${drift}px, ${driftY}px) scale(${1 + punch - 0.04 * zoomOut})`, transformOrigin: "540px 600px" }}>
          <Tree f={f} dark={dark} />
          {f < F(2.6) ? <Intro f={f} /> : null}
          {f >= F(2.6) && f < F(7.5) ? <B1 f={f} /> : null}
          {f >= F(7.05) && f < F(15) ? <B2 f={f} /> : null}
          {f >= F(14.55) && f < F(28.6) ? <B3 f={f} dark={dark} /> : null}
          {f >= F(28.2) && f < F(42) ? <B4 f={f} /> : null}
          <Overview f={f} />
          <Slides f={f} />
        </div>
      </div>
      <TapCard at={47.16} until={49.2} src="cta_jidou/profile.jpg" iw={1179} ih={872} x={90} y={380} w={900} hit={[0.02, 0.915, 0.5, 0.075]} dimAt={47.6} tapAt={48.4} label={<>プロフの<span style={{ color: RED }}>リンク</span>から</>} labelAt={48.0} />
      <TapCard at={49.25} src="cta_jidou/menu.jpg" iw={1179} ih={802} x={90} y={400} w={900} hit={[0.36, 0.83, 0.28, 0.1]} dimAt={49.6} tapAt={50.25} label={<><span style={{ color: "#06C755" }}>公式LINE</span>の<span style={{ color: RED }}>特典はこちら</span></>} labelAt={49.4} labelTop={1050} labelLeft={110} rot={1} />
      <Caption />
      <Chara />
    </AbsoluteFill>
  );
};
