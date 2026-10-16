import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from "remotion";
import { FONT, FONT_BLACK } from "./components/font";
import { SfxTrack } from "./components/sfx";

// ════════════════════════════════════════════════════════════════════
//  マイル図解リール v4 ＝ 分析4「設計図×ダッシュボード（緑×金）」のデザインシステムを基準に（社長選定）
//  references/reel-idea-catalog.md：G14〜G19／C1〜C4／D1・D2／B1〜B3。
//  地=濃緑#11271B＋極薄グリッド／金#EFD23C は数字・キーワードだけ／極細線枠＋四隅tick＋等幅注釈／
//  章番号2トーン／スペック表＋ノード／ダッシュボード／紙フォーム＋金スタンプ／フックは全面黄。
//  音声 public/mile-narration.wav（50.07s）。時刻は単語タイムスタンプ基準。
// ════════════════════════════════════════════════════════════════════

const F = (s: number) => Math.round(s * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BK = `${FONT_BLACK}, ${FONT}`;
const MONO = "DejaVu Sans Mono, Liberation Mono, monospace";
const C = {
  bg: "#11271B", bg2: "#18382A", grid: "rgba(150,200,160,0.07)",
  gold: "#EFD23C", white: "#F4F1E6", dim: "rgba(244,241,230,0.55)", hair: "rgba(214,232,210,0.32)",
  sage: "#5E8C6E", yellow: "#F2D21E", ink: "#141414", paper: "#F3EEE0", paperLine: "rgba(20,20,20,0.12)",
};
const Gd: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: C.gold }}>{children}</span>;
const ease = { ...clamp, easing: Easing.out(Easing.cubic) };

// ── 動きの基本 ──
const useIn = (at: number, dy = 40) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 18, stiffness: 180, mass: 0.7 } });
  return { on: f >= at, style: { opacity: interpolate(f - at, [0, 6], [0, 1], clamp), transform: `translateY(${(1 - s) * dy}px)` } as React.CSSProperties };
};
const pop = (f: number, at: number) => interpolate(f - at, [0, 2, 5], [0.3, 1.33, 1], clamp); // C1：数字だけ
const In: React.FC<{ at: number; style?: React.CSSProperties; dy?: number; children: React.ReactNode }> = ({ at, style, dy, children }) => {
  const p = useIn(at, dy);
  if (!p.on) return null;
  return <div style={{ position: "absolute", ...style, ...p.style }}>{children}</div>;
};
const Mono: React.FC<{ size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 22, color = C.dim, children, style }) => (
  <span style={{ fontFamily: MONO, fontSize: size, letterSpacing: 3, color, textTransform: "uppercase", ...style }}>{children}</span>
);

// ── 背景：濃緑＋極薄グリッド＋中央わずかに明るく（G17・E1）──
const GreenBG: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.bg2} 0%, ${C.bg} 70%)` }}>
    <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`, backgroundSize: "60px 60px", backgroundPosition: "0 10px" }} />
  </AbsoluteFill>
);

// ── 極細フレーム＋四隅tick＋注釈（G15）：線が描かれて出る ──
const Frame: React.FC<{ x: number; y: number; w: number; h: number; at: number; label?: string; right?: string; children?: React.ReactNode; fill?: string }> = ({ x, y, w, h, at, label, right, children, fill = "rgba(10,25,17,0.35)" }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const g = interpolate(f, [at, at + 12], [0, 1], ease);
  const o = interpolate(f, [at + 4, at + 12], [0, 1], clamp);
  const t = 18;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0, background: fill, opacity: o }} />
      <svg width={w + 20} height={h + 20} style={{ position: "absolute", left: -10, top: -10, overflow: "visible" }}>
        <rect x={10} y={10} width={w} height={h} fill="none" stroke={C.hair} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - g} />
        <g stroke={C.white} strokeWidth={3} opacity={o}>
          <path d={`M${10 - 6} ${10 + t} V${10 - 6} H${10 + t}`} fill="none" />
          <path d={`M${10 + w - t} ${10 - 6} H${10 + w + 6} V${10 + t}`} fill="none" />
          <path d={`M${10 - 6} ${10 + h - t} V${10 + h + 6} H${10 + t}`} fill="none" />
          <path d={`M${10 + w - t} ${10 + h + 6} H${10 + w + 6} V${10 + h - t}`} fill="none" />
        </g>
      </svg>
      {label ? <div style={{ position: "absolute", left: 4, top: -34, opacity: o }}><Mono size={20}>{label}</Mono></div> : null}
      {right ? <div style={{ position: "absolute", right: 4, top: -34, opacity: o }}><Mono size={20}>{right}</Mono></div> : null}
      <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>
    </div>
  );
};

// ── 線の描画（D1）＋光点が走る（G19）──
const Line: React.FC<{ d: string; at: number; dur?: number; color?: string; w?: number; glint?: boolean }> = ({ d, at, dur = 15, color = C.hair, w = 3, glint }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const g = interpolate(f, [at, at + dur], [0, 1], ease);
  const gl = ((f - at) % 45) / 45;
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - g} />
      {glint && g >= 1 ? <path d={d} fill="none" stroke={C.gold} strokeWidth={w + 3} strokeLinecap="round" pathLength={1} strokeDasharray="0.06 1" strokeDashoffset={-gl} opacity={0.95} /> : null}
    </svg>
  );
};

// ── 線画アイコン（金/白の細線で統一）viewBox 100 ──
type IconN = "receipt" | "card" | "gift" | "coins" | "ticket" | "plane" | "house" | "cart" | "family" | "piggy" | "suitcase" | "phone";
const LineIcon: React.FC<{ n: IconN; size: number; color?: string }> = ({ n, size, color = C.gold }) => {
  const s = { fill: "none", stroke: color, strokeWidth: 4.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const P: Record<IconN, React.ReactNode> = {
    receipt: <g {...s}><path d="M26 12 H74 V86 L66 80 L58 86 L50 80 L42 86 L34 80 L26 86 Z" /><path d="M36 30 H64 M36 44 H64 M36 58 H54" /></g>,
    card: <g {...s}><rect x="12" y="24" width="76" height="52" rx="8" /><path d="M12 38 H88" /><rect x="22" y="52" width="16" height="12" rx="2" /></g>,
    gift: <g {...s}><rect x="18" y="42" width="64" height="44" rx="4" /><rect x="14" y="30" width="72" height="14" rx="3" /><path d="M50 30 V86" /><path d="M50 30 C40 12 26 20 34 28 C38 31 46 31 50 30 C54 31 62 31 66 28 C74 20 60 12 50 30" /></g>,
    coins: <g {...s}><ellipse cx="38" cy="74" rx="22" ry="7" /><path d="M16 74 V64 M60 74 V64" /><ellipse cx="38" cy="64" rx="22" ry="7" /><path d="M16 64 V54 M60 64 V54" /><ellipse cx="38" cy="54" rx="22" ry="7" /><circle cx="68" cy="44" r="20" /><path d="M63 54 V34 H70 Q77 34 77 40 Q77 46 70 46 H63" /></g>,
    ticket: <g {...s}><path d="M10 30 H90 V44 Q82 44 82 52 Q82 60 90 60 V74 H10 V60 Q18 60 18 52 Q18 44 10 44 Z" /><path d="M66 30 V74" strokeDasharray="4 6" /><path d="M28 52 L52 46 M34 58 L44 44" /></g>,
    plane: <g {...s} transform="rotate(40 50 50)"><path d="M50 8 C55 8 56 14 56 20 V40 L88 56 V64 L56 56 V76 L66 84 V90 L50 86 L34 90 V84 L44 76 V56 L12 64 V56 L44 40 V20 C44 14 45 8 50 8 Z" /></g>,
    house: <g {...s}><path d="M14 48 L50 18 L86 48" /><path d="M24 40 V84 H76 V40" /><path d="M42 84 V62 H58 V84" /></g>,
    cart: <g {...s}><path d="M8 20 H20 L30 66 H78 L88 34 H24" /><circle cx="36" cy="80" r="6" /><circle cx="72" cy="80" r="6" /></g>,
    family: <g {...s}><circle cx="30" cy="30" r="10" /><path d="M14 66 Q14 46 30 46 Q46 46 46 66" /><circle cx="70" cy="30" r="10" /><path d="M54 66 Q54 46 70 46 Q86 46 86 66" /><circle cx="40" cy="62" r="7" /><path d="M29 88 Q29 74 40 74 Q51 74 51 88" /><circle cx="62" cy="62" r="7" /><path d="M51 88 Q51 74 62 74 Q73 74 73 88" /></g>,
    piggy: <g {...s}><ellipse cx="48" cy="56" rx="32" ry="24" /><path d="M30 40 L26 26 L40 34" /><path d="M78 50 H86 V62 H78" /><path d="M32 78 V88 M60 78 V88" /><path d="M40 36 H56" /><circle cx="50" cy="16" r="7" /></g>,
    suitcase: <g {...s}><rect x="18" y="30" width="64" height="54" rx="8" /><path d="M38 30 V20 H62 V30" /><path d="M34 30 V84 M66 30 V84" /></g>,
    phone: <g {...s}><rect x="28" y="8" width="44" height="84" rx="8" /><path d="M42 18 H58" /><path d="M38 40 H62 Q66 40 66 44 V54 Q66 58 62 58 H48 L42 64 V58 H38 Q34 58 34 54 V44 Q34 40 38 40 Z" /></g>,
  };
  return <svg viewBox="0 0 100 100" width={size} height={size}>{P[n]}</svg>;
};

// ── 章番号（G16：0=中抜き／数字=金塗り）──
const Chapter: React.FC<{ n: number; at: number; lineA: string; lineB: React.ReactNode; bAt: number; tag: string }> = ({ n, at, lineA, lineB, bAt, tag }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = interpolate(f, [at, at + 8], [0.86, 1], ease);
  const o = interpolate(f, [at, at + 6], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 90, top: 470, opacity: o }}>
      <Mono size={24} color={C.gold}>■ {tag}</Mono>
      <div style={{ transform: `scale(${s})`, transformOrigin: "left center", marginTop: 6, fontFamily: BK, fontWeight: 900, fontSize: 330, lineHeight: 1, letterSpacing: -10 }}>
        <span style={{ color: "transparent", WebkitTextStroke: `5px ${C.white}` }}>0</span><span style={{ color: C.gold }}>{n}</span>
      </div>
      <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 64, color: C.white, marginTop: 6 }}>{lineA}</div>
      <In at={bAt} style={{ position: "relative" }}><div style={{ fontFamily: BK, fontWeight: 900, fontSize: 88, color: C.gold, lineHeight: 1.15 }}>{lineB}</div></In>
    </div>
  );
};

// ── 下テロップ：白＋金の細いバーが話速で伸びる（A4）。原文の語のまま ──
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
  let i = -1;
  SUBS.forEach(([s], k) => { if (t >= s) i = k; });
  if (i < 0 || t > 50.04) return null;
  const [s, txt] = SUBS[i];
  const e = i + 1 < SUBS.length ? SUBS[i + 1][0] : 50.04;
  const prog = interpolate(t, [s, s + (e - s) * 0.85], [0, 100], clamp);
  const onYellow = t < 1.56;
  return (
    <div style={{ position: "absolute", left: 0, top: 1372, width: 1080, display: "flex", justifyContent: "center" }}>
      <span style={{ position: "relative", display: "inline-block", fontFamily: BK, fontWeight: 900, fontSize: 56, color: onYellow ? C.ink : C.white, textShadow: onYellow ? "none" : "0 3px 10px rgba(0,0,0,0.45)", whiteSpace: "nowrap" }}>
        {txt}
        <span style={{ position: "absolute", left: 0, bottom: -12, height: 7, width: `${prog}%`, background: onYellow ? C.ink : C.gold, borderRadius: 4 }} />
      </span>
    </div>
  );
};

// ── 範囲描画＋常時ドリフト（C4）──
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  const a = F(from), b = F(to);
  if (f < a || f >= b) return null;
  const drift = interpolate(f, [a, b], [1, 1.02]);
  return <AbsoluteFill style={{ transform: `scale(${drift})` }}>{children}</AbsoluteFill>;
};

// ── S1a フック（全面黄）0–1.56 ──
const S1a: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= F(1.56)) return null;
  const z = interpolate(f, [0, F(1.56)], [1, 1.05]);
  return (
    <AbsoluteFill style={{ background: C.yellow, alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", transform: `scale(${z})`, marginTop: -120 }}>
        <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 80, color: C.ink }}>その方法が</div>
        <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 168, color: C.ink, lineHeight: 1.1, transform: `scale(${f >= F(0.86) ? pop(f, F(0.86)) : 0})` }}>マイルの<br />活用</div>
      </div>
    </AbsoluteFill>
  );
};

// ── S1b マイルとは（1.56–5.12）──
const S1b: React.FC = () => (
  <Scene from={1.56} to={5.12}>
    <In at={F(1.58)} style={{ left: 90, top: 300 }}><Mono color={C.gold}>fig.01  /  what is miles</Mono></In>
    <In at={F(1.6)} style={{ left: 90, top: 350, width: 900 }}><div style={{ fontFamily: BK, fontWeight: 900, fontSize: 76, color: C.white, lineHeight: 1.25 }}>飛行機に<br /><Gd>乗らなくても</Gd>貯まる</div></In>
    <Frame x={90} y={720} w={330} h={330} at={F(3.0)} label="input" right="01">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <LineIcon n="receipt" size={150} color={C.white} />
        <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 38, color: C.white, marginTop: 14 }}>普段の生活費</div>
      </div>
    </Frame>
    <Line d="M440 885 L640 885" at={F(3.5)} dur={10} color={C.white} w={3} glint />
    <Frame x={660} y={720} w={330} h={330} at={F(3.85)} label="output" right="02" fill="rgba(239,210,60,0.08)">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <LineIcon n="ticket" size={150} />
        <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 44, color: C.gold, marginTop: 14 }}>MILES</div>
      </div>
    </Frame>
    <In at={F(4.08)} style={{ left: 90, top: 1130, width: 900 }}><div style={{ fontFamily: BK, fontWeight: 900, fontSize: 50, color: C.white }}>生活費 → <Gd>マイルに変わる</Gd></div></In>
  </Scene>
);

// ── S2 スペック表（5.12–19.72）──
const STEPS: { at: number; tag: string; t: string; icon: IconN }[] = [
  { at: 6.84, tag: "01  daily spend", t: "毎月の生活費", icon: "receipt" },
  { at: 7.88, tag: "02  credit card", t: "クレカでまとめる", icon: "card" },
  { at: 9.08, tag: "03  campaign", t: "入会キャンペーン達成", icon: "gift" },
  { at: 12.52, tag: "04  points", t: "まとまったポイント", icon: "coins" },
  { at: 14.5, tag: "05  exchange", t: "マイルに交換", icon: "ticket" },
  { at: 15.44, tag: "06  award ticket", t: "航空券を予約", icon: "plane" },
];
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const Y0 = 470, ST = 128, X = 160, W = 840, H = 104;
  return (
    <Scene from={5.12} to={19.72}>
      <Frame x={90} y={290} w={480} h={120} at={F(5.14)} label="fig.02" right="v1.0">
        <div style={{ padding: "10px 22px" }}>
          <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 60, color: C.white, lineHeight: 1.05 }}>MILES</div>
          <Mono size={18}>how to earn · steps 6/6</Mono>
        </div>
      </Frame>
      <In at={F(5.4)} style={{ left: 600, top: 330 }}><div style={{ fontFamily: BK, fontWeight: 900, fontSize: 44, color: C.white, lineHeight: 1.2 }}>貯まる<Gd>仕組み</Gd></div></In>
      {/* 左のスパイン＋ノード */}
      {STEPS.map((st, i) => {
        const cy = Y0 + i * ST + H / 2;
        const lit = f >= F(st.at);
        return (
          <React.Fragment key={i}>
            {i > 0 ? <Line d={`M105 ${cy - ST + 10} L105 ${cy - 10}`} at={F(st.at) - 6} dur={8} color={C.hair} w={3} /> : null}
            {f >= F(st.at) - 2 ? (
              <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
                <circle cx={105} cy={cy} r={10} fill={lit ? C.gold : "none"} stroke={lit ? C.gold : C.hair} strokeWidth={3} />
                <line x1={115} y1={cy} x2={X} y2={cy} stroke={C.hair} strokeWidth={2} />
              </svg>
            ) : null}
          </React.Fragment>
        );
      })}
      {STEPS.map((st, i) => {
        const active = f >= F(st.at) && (i === STEPS.length - 1 || f < F(STEPS[i + 1].at));
        const last = i === STEPS.length - 1;
        return (
          <Frame key={i} x={X} y={Y0 + i * ST} w={W} h={H} at={F(st.at)} fill={active ? "rgba(239,210,60,0.07)" : "rgba(10,25,17,0.35)"}>
            <div style={{ display: "flex", alignItems: "center", height: "100%", padding: "0 22px", gap: 18 }}>
              <div style={{ flex: 1 }}>
                <Mono size={17} color={C.gold}>{st.tag}</Mono>
                <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 44, color: last ? C.gold : C.white, lineHeight: 1.1, marginTop: 2 }}>{st.t}</div>
              </div>
              <LineIcon n={st.icon} size={70} color={active ? C.gold : C.dim} />
            </div>
          </Frame>
        );
      })}
      <In at={F(16.96)} style={{ left: 160, top: Y0 + 6 * ST + 4 }}>
        <div style={{ background: C.gold, color: C.ink, fontFamily: BK, fontWeight: 900, fontSize: 34, padding: "8px 20px" }}>家族旅行の飛行機代を、大きく抑える</div>
      </In>
    </Scene>
  );
};

// ── S3a 章01（19.72–22.24）──
const S3a: React.FC = () => (
  <Scene from={19.72} to={22.24}>
    <Line d="M90 1230 L620 1230 L700 1160" at={F(19.8)} dur={14} color={C.hair} w={3} glint />
    <Chapter n={1} at={F(19.74)} tag="caution 01 / 02" lineA="ただし、キャンペーンには" lineB="利用条件がある" bAt={F(20.72)} />
  </Scene>
);

// ── S3b ダッシュボード（22.24–25.6）：半年で100万円＝月約17万を積み上げ（G18・B1）──
const S3b: React.FC = () => {
  const f = useCurrentFrame();
  const heroAt = F(23.2);
  const n = Math.round(interpolate(f, [heroAt, heroAt + 12], [0, 100], ease));
  const vals = [17, 33, 50, 67, 83, 100];
  const bx = 150, by = 1150, bw = 92, gap = 46, maxH = 380;
  return (
    <Scene from={22.24} to={25.6}>
      <Frame x={90} y={300} w={900} h={940} at={F(22.26)} label="campaign · requirement" right="last 6 months">
        <div style={{ position: "absolute", right: 24, top: 20, background: C.gold, color: C.ink, fontFamily: MONO, fontSize: 18, padding: "4px 10px", letterSpacing: 2 }}>6 MONTHS</div>
        <div style={{ position: "absolute", left: 30, top: 24 }}><Mono size={20}>target</Mono></div>
      </Frame>
      {f >= heroAt ? (
        <div style={{ position: "absolute", left: 120, top: 370, fontFamily: BK, fontWeight: 900, color: C.gold, fontSize: 180, lineHeight: 1, letterSpacing: -4, transform: `scale(${f >= heroAt + 12 ? pop(f, heroAt + 12) : 1})`, transformOrigin: "left center" }}>
          {n}<span style={{ fontSize: 80 }}>万円</span>
        </div>
      ) : null}
      <In at={F(22.6)} style={{ left: 124, top: 560 }}><Mono size={22} color={C.white}>半年で  /  within 6 months</Mono></In>
      {/* 目盛り */}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {[0, 0.5, 1].map((k) => <line key={k} x1={bx - 20} x2={bx + 6 * (bw + gap)} y1={by - maxH * k} y2={by - maxH * k} stroke={C.hair} strokeWidth={1.5} strokeDasharray="6 8" opacity={f >= F(23.76) ? 1 : 0} />)}
      </svg>
      {vals.map((v, i) => {
        const at = F(23.76) + i * 6;
        if (f < at) return null;
        const h = interpolate(f, [at, at + 10], [0, (v / 100) * maxH], ease);
        const x = bx + i * (bw + gap);
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: x, top: by - h, width: bw, height: h, background: i === 5 ? C.gold : `linear-gradient(180deg, ${C.sage}, rgba(94,140,110,0.35))`, border: `2px solid ${i === 5 ? C.gold : "rgba(150,200,160,0.5)"}` }} />
            <div style={{ position: "absolute", left: x - 10, top: by - h - 40, width: bw + 20, textAlign: "center", fontFamily: MONO, fontSize: 24, color: C.gold, opacity: interpolate(f, [at + 6, at + 10], [0, 1], clamp) }}>{v}</div>
            <div style={{ position: "absolute", left: x - 10, top: by + 12, width: bw + 20, textAlign: "center" }}><Mono size={18}>m{i + 1}</Mono></div>
          </div>
        );
      })}
      <In at={F(24.4)} style={{ left: 120, top: 1260, width: 840 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, borderTop: `2px solid ${C.hair}`, paddingTop: 14 }}>
          <Mono size={20}>avg / month</Mono>
          <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 52, color: C.white }}>月 <Gd>約17万円</Gd></div>
        </div>
      </In>
    </Scene>
  );
};

// ── S3c 紙フォーム＋金スタンプ（25.6–35.32）D2 ──
const FormRow: React.FC<{ q: string; at: number; y: number; children: React.ReactNode }> = ({ q, at, y, children }) => {
  const f = useCurrentFrame();
  const p = useIn(at, 24);
  if (!p.on) return null;
  const c = interpolate(f, [at + 8, at + 16], [0, 1], ease);
  return (
    <div style={{ position: "absolute", left: 70, top: y, width: 800, ...p.style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, borderBottom: `2px solid ${C.paperLine}`, paddingBottom: 18 }}>
        <span style={{ fontFamily: MONO, fontSize: 26, color: "#8A7A3A", width: 54 }}>{q}</span>
        <div style={{ flex: 1, fontFamily: BK, fontWeight: 900, fontSize: 42, color: C.ink, lineHeight: 1.3 }}>{children}</div>
        <svg width="58" height="58" viewBox="0 0 58 58"><path d="M10 30 L24 44 L50 12" fill="none" stroke="#C9A21A" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - c} /></svg>
      </div>
    </div>
  );
};
const S3c: React.FC = () => {
  const f = useCurrentFrame();
  const p = useIn(F(25.6), 120);
  const stampAt = F(34.16);
  const ss = interpolate(f, [stampAt, stampAt + 4], [1.8, 1], clamp);
  const so = interpolate(f, [stampAt, stampAt + 3], [0, 0.95], clamp);
  return (
    <Scene from={25.6} to={35.32}>
      {p.on ? (
        <div style={{ position: "absolute", left: 70, top: 290, width: 940, height: 1020, background: C.paper, boxShadow: "0 30px 60px rgba(0,0,0,0.35)", ...p.style }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.paperLine} 1.5px, transparent 1.5px)`, backgroundSize: "100% 76px", backgroundPosition: "0 40px", opacity: 0.5 }} />
          <div style={{ position: "absolute", left: 70, top: 56 }}><Mono size={20} color="#8A7A3A">form 03 · checklist</Mono></div>
          <div style={{ position: "absolute", right: 60, top: 56 }}><Mono size={20} color="#8A7A3A">question</Mono></div>
          <div style={{ position: "absolute", left: 70, top: 100, fontFamily: BK, fontWeight: 900, fontSize: 76, color: C.ink }}>達成のコツ</div>
          <div style={{ position: "absolute", left: 72, top: 200, fontFamily: BK, fontWeight: 900, fontSize: 34, color: "#6B6455" }}>普段の支払いで、ムリなく届く</div>
          <FormRow q="Q1" at={F(25.74)} y={300}>家族の毎月の<span style={{ color: "#B8901A" }}>固定費</span>をまとめる</FormRow>
          <FormRow q="Q2" at={F(27.64)} y={430}>大きな出費は、むしろ<span style={{ color: "#B8901A" }}>チャンス</span></FormRow>
          <FormRow q="Q3" at={F(30.02)} y={560}>他にも、達成する方法がいくつも</FormRow>
          <div style={{ position: "absolute", left: 70, bottom: 60 }}><Mono size={18} color="#8A7A3A">※ 条件・特典はカードやキャンペーンにより異なります</Mono></div>
          {f >= stampAt ? (
            <div style={{ position: "absolute", left: 470, top: 740, transform: `rotate(-8deg) scale(${ss})`, opacity: so }}>
              <div style={{ border: "5px solid #C9A21A", padding: 6 }}>
                <div style={{ border: "2px solid #C9A21A", padding: "10px 26px", textAlign: "center" }}>
                  <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 30, color: "#B8901A" }}>気になる方は</div>
                  <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 64, color: "#B8901A", letterSpacing: 4 }}>DMで相談</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Scene>
  );
};

// ── S4a 章02（35.32–37.08）──
const S4a: React.FC = () => (
  <Scene from={35.32} to={37.08}>
    <Line d="M90 1230 L620 1230 L700 1160" at={F(35.4)} dur={14} color={C.hair} w={3} glint />
    <Chapter n={2} at={F(35.34)} tag="reason 02 / 02" lineA="僕がマイルを" lineB="すすめる理由" bAt={F(36.02)} />
  </Scene>
);

// ── S4b 理由（37.08–50.07）G4取消線→家族→将来＝今 ──
const S4b: React.FC = () => {
  const f = useCurrentFrame();
  const sAt = F(38.86);
  const g = interpolate(f, [sAt, sAt + 9], [0, 1], ease);
  const dim = interpolate(f, [F(44.12), F(44.12) + 10], [1, 0.4], clamp);
  return (
    <Scene from={37.08} to={50.2}>
      <In at={F(37.1)} style={{ left: 90, top: 290 }}><Mono color={C.gold}>fig.04  /  why miles</Mono></In>
      <div style={{ opacity: dim }}>
        <In at={F(37.54)} style={{ left: 90, top: 340 }}>
          <div style={{ position: "relative", fontFamily: BK, fontWeight: 900, fontSize: 70, color: f >= sAt ? C.dim : C.white }}>
            飛行機代がお得
            <div style={{ position: "absolute", left: -8, top: "54%", height: 9, width: `calc(${g * 100}% + 16px)`, background: C.gold }} />
          </div>
        </In>
        <In at={F(39.0)} style={{ left: 600, top: 360 }}><div style={{ fontFamily: BK, fontWeight: 900, fontSize: 52, color: C.gold }}>だけじゃない</div></In>
        <Frame x={90} y={500} w={360} h={330} at={F(39.52)} label="fig.05 family">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}><LineIcon n="family" size={220} color={C.white} /></div>
        </Frame>
        <In at={F(40.38)} style={{ left: 490, top: 540, width: 520 }}><div style={{ fontFamily: BK, fontWeight: 900, fontSize: 58, color: C.white, lineHeight: 1.25 }}>子供が小さい<br /><Gd>今</Gd>だからこそ</div></In>
        <In at={F(41.3)} style={{ left: 490, top: 720, width: 520 }}><div style={{ fontFamily: BK, fontWeight: 900, fontSize: 38, color: C.white, lineHeight: 1.35 }}>家族との<Gd>思い出や経験</Gd>を<br />増やしてほしい</div></In>
      </div>
      <Frame x={60} y={920} w={420} h={250} at={F(44.12)} label="future" right="a">
        <div style={{ display: "flex", alignItems: "center", gap: 18, height: "100%", padding: "0 24px" }}>
          <LineIcon n="piggy" size={110} color={C.white} />
          {f >= F(45.88) ? <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 40, color: C.white, lineHeight: 1.25 }}>将来への<br />備え</div> : null}
        </div>
      </Frame>
      {f >= F(48.4) ? <div style={{ position: "absolute", left: 495, top: 990, width: 90, textAlign: "center", fontFamily: BK, fontWeight: 900, fontSize: 90, color: C.gold, transform: `scale(${pop(f, F(48.4))})` }}>＝</div> : null}
      <Frame x={600} y={920} w={420} h={250} at={F(47.66)} label="now" right="b" fill="rgba(239,210,60,0.08)">
        <div style={{ display: "flex", alignItems: "center", gap: 18, height: "100%", padding: "0 24px" }}>
          <LineIcon n="suitcase" size={110} />
          <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 36, color: C.gold, lineHeight: 1.25, whiteSpace: "nowrap" }}>今しか<br />できない経験</div>
        </div>
      </Frame>
      <In at={F(49.02)} style={{ left: 90, top: 1215, width: 900 }}>
        <div style={{ background: C.gold, color: C.ink, fontFamily: BK, fontWeight: 900, fontSize: 52, padding: "12px 0", textAlign: "center" }}>同じくらい、大切。</div>
      </In>
    </Scene>
  );
};

const CUES: { file: string; at: number; volume: number }[] = [
  { file: "user/u04", at: F(0.86) + 2, volume: 0.34 },
  ...[1.56, 5.14, 19.74, 22.26, 25.6, 35.34, 37.1].map((s) => ({ file: "user/u03s", at: F(s), volume: 0.3 })),
  ...[3.0, 3.85, 6.84, 7.88, 9.08, 12.52, 14.5, 15.44, 39.52, 44.12, 47.66].map((s) => ({ file: "user/u02s", at: F(s), volume: 0.32 })),
  ...[25.74, 27.64, 30.02].map((s) => ({ file: "user/u05s", at: F(s) + 8, volume: 0.3 })),
  { file: "user/u06", at: F(23.2), volume: 0.26 },
  { file: "user/u04", at: F(23.2) + 12, volume: 0.34 },
  { file: "user/u05", at: F(34.16), volume: 0.34 },
  { file: "user/u10", at: F(49.02), volume: 0.3 },
];

export const MILE4_FRAMES = 1502;

export const MileReel4: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT }}>
    <GreenBG />
    <Audio src={staticFile("mile-narration.wav")} />
    <SfxTrack cues={CUES} />
    <S1b />
    <S2 />
    <S3a />
    <S3b />
    <S3c />
    <S4a />
    <S4b />
    <S1a />
    <Subtitle />
  </AbsoluteFill>
);
