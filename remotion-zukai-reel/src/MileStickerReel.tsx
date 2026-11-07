import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import { FONT_BLACK } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { ST, Sticker, Chara, usePop, Mood } from "./components/stickers";

// ════════════════════════════════════════════════════════════════════
//  マイル図解リール v2（方眼紙×ステッカー図解）＝ mile_sticker_design_spec.md に準拠
//  新録音 public/mile-narration.wav（図解パート 50.07s）。時刻はすべて音声の単語タイムスタンプ基準。
//  章替え＝ハードカット（全消し→見出しワイプから再ビルド）。着地後の要素は静止、動くのは新要素だけ。
// ════════════════════════════════════════════════════════════════════

const F = (s: number) => Math.round(s * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BK = FONT_BLACK + ", Noto Sans JP, sans-serif";

// ── 背景：クリーム方眼紙（54px間隔）＋ごく薄い周辺減光 ──
const GraphBG: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: ST.bg, backgroundImage: `linear-gradient(${ST.grid} 2px, transparent 2px), linear-gradient(90deg, ${ST.grid} 2px, transparent 2px)`, backgroundSize: "54px 54px", backgroundPosition: "-2px 12px" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.0) 55%, rgba(120,95,40,0.10) 100%)" }} />
  </AbsoluteFill>
);

// 白フチ文字（ストローク層＋塗り層の2枚重ね）
const OText: React.FC<{ size: number; color?: string; sw?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color = ST.navy, sw = 10, children, style }) => (
  <span style={{ position: "relative", display: "inline-block", fontFamily: BK, fontWeight: 900, fontSize: size, lineHeight: 1.15, letterSpacing: 1, whiteSpace: "nowrap", ...style }}>
    <span style={{ position: "absolute", inset: 0, color: "#fff", WebkitTextStroke: `${sw}px #fff`, textShadow: "0 5px 8px rgba(40,30,10,0.22)" }}>{children}</span>
    <span style={{ position: "relative", color }}>{children}</span>
  </span>
);

// 見出し：左→右ワイプ0.17s ＋ 赤下線が0.2sで描かれる（STEP5）
const Heading: React.FC<{ text: string; at: number; cx?: number; cy?: number; size?: number }> = ({ text, at, cx = 452, cy = 370, size = 92 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const wipe = interpolate(f, [at, at + 5], [100, 0], clamp);
  const ul = interpolate(f, [at + 4, at + 10], [0, 1], clamp);
  const w = text.length * size * 0.98;
  return (
    <div style={{ position: "absolute", left: cx - w / 2 - 20, top: cy - size * 0.62, width: w + 40, textAlign: "center" }}>
      <div style={{ clipPath: `inset(-20px ${wipe}% -20px -20px)` }}><OText size={size} sw={12}>{text}</OText></div>
      <svg width={w + 40} height="30" style={{ position: "absolute", left: 0, top: size * 1.12 }}>
        <path d={`M24 16 Q ${(w + 40) / 2} 8 ${w + 16} 15`} fill="none" stroke={ST.under} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ul} />
      </svg>
    </div>
  );
};

type PillKind = "navy" | "red" | "gray";
const PILL_BG: Record<PillKind, string> = { navy: ST.navy, red: ST.red, gray: ST.gray };
// ピル：scale 0.7→1（0.13s）
const Pill: React.FC<{ text: React.ReactNode; at: number; cx: number; cy: number; kind?: PillKind; size?: number }> = ({ text, at, cx, cy, kind = "navy", size = 36 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = interpolate(f, [at, at + 4], [0.7, 1], clamp);
  const o = interpolate(f, [at, at + 2], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%,-50%) scale(${s})`, opacity: o }}>
      <div style={{ background: PILL_BG[kind], color: "#fff", fontFamily: BK, fontWeight: 900, fontSize: size, letterSpacing: 1, padding: `${size * 0.28}px ${size * 0.8}px`, borderRadius: 999, border: "5px solid #fff", boxShadow: "0 6px 10px rgba(40,30,10,0.28)", whiteSpace: "nowrap", lineHeight: 1.1 }}>{text}</div>
    </div>
  );
};

// 番号バッジ（小）：ステッカー左上
const StepBadge: React.FC<{ n: number; at: number; cx: number; cy: number }> = ({ n, at, cx, cy }) => {
  const p = usePop(at, 0);
  if (!p.visible) return null;
  return (
    <div style={{ position: "absolute", left: cx - 30, top: cy - 30, width: 60, height: 60, borderRadius: "50%", background: ST.badge, border: "5px solid #fff", boxShadow: "0 4px 8px rgba(40,30,10,0.28)", color: "#fff", fontFamily: BK, fontWeight: 900, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", ...p.style }}>{n}</div>
  );
};

// 矢印（直線）：0.13sで描画→先端三角
const Arrow: React.FC<{ at: number; x1: number; x2: number; y: number }> = ({ at, x1, x2, y }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const g = interpolate(f, [at, at + 4], [0, 1], clamp);
  const dir = Math.sign(x2 - x1);
  const xe = x1 + (x2 - x1) * g;
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      <line x1={x1} y1={y} x2={xe - dir * 14} y2={y} stroke={ST.navy} strokeWidth={11} strokeLinecap="round" />
      {g > 0.85 && <path d={`M${x2} ${y} L${x2 - dir * 30} ${y - 20} L${x2 - dir * 30} ${y + 20} Z`} fill={ST.navy} stroke={ST.navy} strokeWidth={4} strokeLinejoin="round" />}
    </svg>
  );
};
// 縦矢印
const ArrowV: React.FC<{ at: number; x: number; y1: number; y2: number }> = ({ at, x, y1, y2 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const g = interpolate(f, [at, at + 4], [0, 1], clamp);
  const ye = y1 + (y2 - y1) * g;
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      <line x1={x} y1={y1} x2={x} y2={ye - 14} stroke={ST.navy} strokeWidth={11} strokeLinecap="round" />
      {g > 0.85 && <path d={`M${x} ${y2} L${x - 20} ${y2 - 30} L${x + 20} ${y2 - 30} Z`} fill={ST.navy} stroke={ST.navy} strokeWidth={4} strokeLinejoin="round" />}
    </svg>
  );
};
// 曲線矢印（蛇行フローの折り返し）
const CurveArrow: React.FC<{ at: number; d: string; hx: number; hy: number; dir: 1 | -1 }> = ({ at, d, hx, hy, dir }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const g = interpolate(f, [at, at + 8], [0, 1], clamp);
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      <path d={d} fill="none" stroke={ST.navy} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - g} />
      {g > 0.92 && <path d={`M${hx} ${hy} L${hx - dir * 30} ${hy - 20} L${hx - dir * 30} ${hy + 20} Z`} fill={ST.navy} stroke={ST.navy} strokeWidth={4} strokeLinejoin="round" />}
    </svg>
  );
};

// スタンプ：scale 1.7→1（0.13s）でドン、−8°、赤の二重枠
const Stamp: React.FC<{ text: string; at: number; cx: number; cy: number; size?: number; rot?: number }> = ({ text, at, cx, cy, size = 52, rot = -8 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = interpolate(f, [at, at + 4], [1.7, 1], clamp);
  const o = interpolate(f, [at, at + 3], [0, 0.94], clamp);
  return (
    <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: o }}>
      <div style={{ border: `6px solid ${ST.red}`, padding: 6, borderRadius: 10, background: "rgba(255,250,235,0.55)" }}>
        <div style={{ border: `2.5px solid ${ST.red}`, borderRadius: 6, padding: `${size * 0.12}px ${size * 0.45}px`, color: ST.red, fontFamily: BK, fontWeight: 900, fontSize: size, letterSpacing: 3, whiteSpace: "nowrap", lineHeight: 1.1 }}>{text}</div>
      </div>
    </div>
  );
};

// 赤✕（2画を素早く）
const Cross: React.FC<{ at: number; cx: number; cy: number; r?: number }> = ({ at, cx, cy, r = 46 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const a = interpolate(f, [at, at + 3], [0, 1], clamp);
  const b = interpolate(f, [at + 2, at + 5], [0, 1], clamp);
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      <g stroke="#fff" strokeWidth={26} strokeLinecap="round">
        <line x1={cx - r} y1={cy - r} x2={cx - r + 2 * r * a} y2={cy - r + 2 * r * a} />
        {b > 0 && <line x1={cx + r} y1={cy - r} x2={cx + r - 2 * r * b} y2={cy - r + 2 * r * b} />}
      </g>
      <g stroke={ST.red} strokeWidth={16} strokeLinecap="round">
        <line x1={cx - r} y1={cy - r} x2={cx - r + 2 * r * a} y2={cy - r + 2 * r * a} />
        {b > 0 && <line x1={cx + r} y1={cy - r} x2={cx + r - 2 * r * b} y2={cy - r + 2 * r * b} />}
      </g>
    </svg>
  );
};

// 大きい数字（紺・白フチ＋赤下線）
const BigNum: React.FC<{ pre: string; num: string; at: number; cx: number; cy: number }> = ({ pre, num, at, cx, cy }) => {
  const p = usePop(at, 6);
  const f = useCurrentFrame();
  if (!p.visible) return null;
  const ul = interpolate(f, [at + 3, at + 9], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: cx - 260, top: cy - 110, width: 520, textAlign: "center", ...p.style }}>
      <OText size={44} sw={9}>{pre}</OText>
      <div><OText size={128} sw={14}>{num}</OText></div>
      <svg width="520" height="30" style={{ position: "absolute", left: 0, top: 205 }}>
        <path d="M70 15 Q260 6 450 14" fill="none" stroke={ST.under} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ul} />
      </svg>
    </div>
  );
};

// 下テロップ：語の塊でハードカット（STEP7）。原文の語のまま。
const SUBS: [number, string][] = [
  [0.0, "その方法が"], [0.86, "マイルの活用"], [1.56, "実は飛行機に"], [2.42, "乗らなくても"], [3.0, "普段の生活費から"], [4.08, "貯めることができます"],
  [5.12, "では、どうやって"], [5.92, "貯めるのか"], [6.58, "まず普段の生活費を"], [7.88, "クレカでまとめます"], [8.78, "そして入会キャンペーンの"], [10.0, "条件を達成すると"],
  [11.02, "通常の利用分に加えて"], [12.52, "まとまったポイントが"], [13.36, "もらえる"], [13.7, "そのポイントを"], [14.5, "マイルに交換して"], [15.44, "航空券を予約することで"],
  [16.96, "家族旅行の飛行機代を"], [18.4, "大きく抑えることができます"],
  [19.72, "ただキャンペーンには"], [20.72, "一定の利用条件があって"], [22.24, "例えば半年で100万円"], [23.76, "月にすると"], [24.4, "約17万円くらい"],
  [25.74, "家族の毎月の固定費を"], [27.06, "まとめたり"], [27.64, "大きな出費があれば"], [28.78, "むしろそれはチャンスです"], [30.02, "実は他にも"], [30.78, "効率よく利用条件を"],
  [32.16, "達成する方法が"], [33.34, "いくつもあるので"], [34.16, "気になる方はDMで"],
  [35.32, "そして僕が"], [36.02, "マイルをお勧めするのは"], [37.08, "単に飛行機代が"], [38.22, "お得になるから"], [38.86, "ではありません"],
  [39.52, "子供が小さい"], [40.38, "今だからこそできる"], [41.3, "家族との思い出や経験"], [42.64, "これを増やしてほしいからです"],
  [44.12, "教育資金や老後資金など"], [45.88, "将来への備えも大切ですが"], [47.66, "今しかできない経験も"], [49.02, "同じくらい大切です"],
];
const Subtitle: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  let cur = "";
  for (const [s, txt] of SUBS) if (t >= s) cur = txt;
  if (!cur || t > 50.0) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 1362, width: 1080, textAlign: "center" }}>
      <OText size={60} sw={12}>{cur}</OText>
    </div>
  );
};

// 章：範囲内だけ描画（ハードカット）
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < F(from) || f >= F(to)) return null;
  return <>{children}</>;
};
const CharaAt: React.FC<{ mood: Mood; at: number }> = ({ mood, at }) => <Chara mood={mood} cx={905} cy={360} size={168} delay={at} />;

// ── S1 マイルとは（0–5.12s）──
const S1: React.FC = () => (
  <Scene from={0} to={5.12}>
    <Heading text="マイルとは？" at={F(0.03)} />
    <CharaAt mood="smile" at={F(0.1)} />
    <Sticker icon="plane" cx={540} cy={575} size={250} delay={F(0.86)} />
    <Pill text="マイルの活用" at={F(1.0)} cx={540} cy={730} kind="red" size={40} />
    <Pill text="飛行機に乗らなくても" at={F(1.9)} cx={540} cy={820} kind="gray" />
    <Sticker icon="receipt" cx={290} cy={1010} size={200} delay={F(3.0)} />
    <Pill text="普段の生活費" at={F(3.3)} cx={290} cy={1135} />
    <Arrow at={F(3.7)} x1={410} x2={665} y={1010} />
    <Sticker icon="ticket" cx={790} cy={1010} size={200} delay={F(3.85)} />
    <Stamp text="貯められる" at={F(4.36)} cx={790} cy={1150} size={46} />
  </Scene>
);

// ── S2 貯まる仕組み（5.12–19.72s）＝蛇行フロー①→⑥ ──
const L = 290, R = 790, Y1 = 545, Y2 = 815, Y3 = 1085, SZ = 160;
const S2: React.FC = () => (
  <Scene from={5.12} to={19.72}>
    <Heading text="貯まる仕組み" at={F(5.14)} />
    <CharaAt mood="point" at={F(5.2)} />
    {/* 段1：①生活費 → ②クレカ */}
    <Sticker icon="receipt" cx={L} cy={Y1} size={SZ} delay={F(6.84)} />
    <StepBadge n={1} at={F(6.9)} cx={L - 78} cy={Y1 - 70} />
    <Pill text="普段の生活費" at={F(7.1)} cx={L} cy={Y1 + 108} size={32} />
    <Arrow at={F(7.6)} x1={L + 105} x2={R - 105} y={Y1} />
    <Sticker icon="card" cx={R} cy={Y1} size={SZ} delay={F(7.88)} />
    <StepBadge n={2} at={F(7.94)} cx={R - 78} cy={Y1 - 70} />
    <Pill text="クレカでまとめる" at={F(8.1)} cx={R} cy={Y1 + 108} size={32} />
    {/* 折り返し（右） */}
    <CurveArrow at={F(8.78)} d={`M${R + 100} ${Y1} C 1040 ${Y1}, 1040 ${Y2}, ${R + 106} ${Y2}`} hx={R + 92} hy={Y2} dir={-1} />
    {/* 段2：③入会キャンペーン → ④ポイント（右→左） */}
    <Sticker icon="gift" cx={R} cy={Y2} size={SZ} delay={F(9.08)} />
    <StepBadge n={3} at={F(9.14)} cx={R - 78} cy={Y2 - 70} />
    <Pill text="キャンペーン達成" at={F(10.32)} cx={R} cy={Y2 + 108} kind="red" size={32} />
    <Arrow at={F(12.4)} x1={R - 105} x2={L + 105} y={Y2} />
    <Sticker icon="coins" cx={L} cy={Y2} size={SZ} delay={F(12.94)} />
    <StepBadge n={4} at={F(13.0)} cx={L - 78} cy={Y2 - 70} />
    <Pill text="まとまったポイント" at={F(13.15)} cx={L} cy={Y2 + 108} size={32} />
    {/* 折り返し（左） */}
    <CurveArrow at={F(13.7)} d={`M${L - 100} ${Y2} C 40 ${Y2}, 40 ${Y3}, ${L - 106} ${Y3}`} hx={L - 92} hy={Y3} dir={1} />
    {/* 段3：⑤マイル → ⑥航空券 */}
    <Sticker icon="ticket" cx={L} cy={Y3} size={SZ} delay={F(14.5)} />
    <StepBadge n={5} at={F(14.56)} cx={L - 78} cy={Y3 - 70} />
    <Pill text="マイルに交換" at={F(14.9)} cx={L} cy={Y3 + 108} size={32} />
    <Arrow at={F(15.2)} x1={L + 105} x2={R - 105} y={Y3} />
    <Sticker icon="plane" cx={R} cy={Y3} size={SZ} delay={F(15.44)} />
    <StepBadge n={6} at={F(15.5)} cx={R - 78} cy={Y3 - 70} />
    <Pill text="航空券を予約" at={F(16.0)} cx={R} cy={Y3 + 108} size={32} />
    <Stamp text="飛行機代を大きく抑える" at={F(18.4)} cx={540} cy={1290} size={46} rot={-5} />
  </Scene>
);

// ── S3 ただし条件あり（19.72–35.32s）──
const S3: React.FC = () => (
  <Scene from={19.72} to={35.32}>
    <Heading text="ただし条件あり" at={F(19.74)} />
    <CharaAt mood="worry" at={F(19.8)} />
    <Sticker icon="calendar" cx={250} cy={600} size={210} delay={F(22.6)} />
    <BigNum pre="半年で" num="100万円" at={F(23.2)} cx={690} cy={600} />
    <ArrowV at={F(23.76)} x={690} y1={735} y2={800} />
    <Pill text={<>月にすると <span style={{ fontSize: 50 }}>約17万円</span></>} at={F(24.4)} cx={690} cy={850} size={36} />
    <Sticker icon="house" cx={290} cy={1010} size={180} delay={F(26.6)} />
    <Pill text="固定費をまとめる" at={F(26.9)} cx={290} cy={1125} size={32} />
    <Sticker icon="cart" cx={790} cy={1010} size={180} delay={F(27.94)} />
    <Pill text="大きな出費" at={F(28.2)} cx={790} cy={1125} size={32} kind="red" />
    <Stamp text="チャンス" at={F(29.46)} cx={905} cy={968} size={42} rot={-10} />
    <Pill text="他にも達成方法がいくつも" at={F(30.3)} cx={540} cy={1215} size={34} kind="gray" />
    <Sticker icon="phone" cx={330} cy={1300} size={110} delay={F(34.16)} rot0={8} />
    <Pill text="気になる方はDM" at={F(34.3)} cx={610} cy={1300} size={38} kind="red" />
  </Scene>
);

// ── S4 お得だけじゃない（35.32–50.07s）──
const S4: React.FC = () => (
  <Scene from={35.32} to={50.2}>
    <Heading text="お得だけじゃない" at={F(35.34)} size={86} />
    <CharaAt mood="smile" at={F(35.4)} />
    <Pill text="飛行機代がお得" at={F(37.54)} cx={540} cy={530} kind="gray" size={36} />
    <Cross at={F(38.86)} cx={318} cy={530} r={30} />
    <Sticker icon="family" cx={540} cy={725} size={250} delay={F(39.52)} />
    <Pill text="子供が小さい今だからこそ" at={F(40.38)} cx={540} cy={880} kind="red" size={36} />
    <Pill text="家族との思い出や経験" at={F(41.84)} cx={540} cy={960} size={36} />
    <Sticker icon="piggy" cx={280} cy={1100} size={170} delay={F(44.12)} />
    <Pill text="将来への備え" at={F(45.88)} cx={280} cy={1205} size={32} kind="gray" />
    <Sticker icon="suitcase" cx={800} cy={1100} size={170} delay={F(47.66)} />
    <Pill text="今しかできない経験" at={F(47.9)} cx={800} cy={1205} size={32} kind="red" />
    <div style={{ position: "absolute", left: 500, top: 1050 }}>{useCurrentFrame() >= F(48.6) ? <OText size={80} sw={10}>＝</OText> : null}</div>
    <Stamp text="同じくらい大切" at={F(49.02)} cx={540} cy={1290} size={46} rot={-5} />
  </Scene>
);

// 効果音：ステッカー着地＝u02s（中）／見出し＝u03s／スタンプ＝u04（高・各章1回）／✕＝u05s
const CUES: { file: string; at: number; volume: number }[] = [
  ...[0.03, 5.14, 19.74, 35.34].map((s) => ({ file: "user/u03s", at: F(s), volume: 0.34 })),
  ...[0.86, 3.0, 3.85, 6.84, 7.88, 9.08, 12.94, 14.5, 15.44, 22.6, 23.2, 26.6, 27.94, 34.16, 39.52, 44.12, 47.66].map((s) => ({ file: "user/u02s", at: F(s), volume: 0.36 })),
  ...[4.36, 18.4, 29.46, 49.02].map((s) => ({ file: "user/u04", at: F(s), volume: 0.36 })),
  { file: "user/u05s", at: F(38.86), volume: 0.34 },
];

export const MILE_STICKER_FRAMES = 1502;

export const MileStickerReel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: BK }}>
    <GraphBG />
    <Audio src={staticFile("mile-narration.wav")} />
    <SfxTrack cues={CUES} />
    <S1 />
    <S2 />
    <S3 />
    <S4 />
    <Subtitle />
  </AbsoluteFill>
);
