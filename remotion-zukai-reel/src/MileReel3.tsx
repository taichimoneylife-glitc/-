import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from "remotion";
import { A2 } from "./components/kit2";
import { FONT, FONT_BLACK } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { MICONS, MIconName } from "./components/mileIcons";

// ════════════════════════════════════════════════════════════════════
//  マイル図解リール v3 ＝ 太一ブランド（薄黄×緑）× リール分析ノートの“型”だけ取り込み
//  （references/reel-idea-catalog.md）。参考の見た目は写さない。方眼紙なし。
//  使った型：E3進行ピル／C3カードIN・C4常時ドリフト／D1線描画／番号付き手順表／
//  G2背景の幕（③の山場だけ濃緑）／B1・B3・C1特大数字カウント＋ポップ／D2チェックリスト／
//  G4取消線リビール／A4マーカーが話速で走る下テロップ。
//  音声 public/mile-narration.wav（図解パート 50.07s）。時刻は単語タイムスタンプ基準。
// ════════════════════════════════════════════════════════════════════

const F = (s: number) => Math.round(s * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BK = `${FONT_BLACK}, ${FONT}`;
const DARK = "#1F4D3A"; // 幕（濃い緑）
const G: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = A2.green }) => <span style={{ color: c }}>{children}</span>;

// 白フチ文字
const OText: React.FC<{ size: number; color?: string; sw?: number; children: React.ReactNode }> = ({ size, color = A2.ink, sw = 9, children }) => (
  <span style={{ position: "relative", display: "inline-block", fontFamily: BK, fontWeight: 900, fontSize: size, lineHeight: 1.2, whiteSpace: "nowrap" }}>
    <span style={{ position: "absolute", inset: 0, color: "#fff", WebkitTextStroke: `${sw}px #fff` }}>{children}</span>
    <span style={{ position: "relative", color }}>{children}</span>
  </span>
);

// C3：カードIN（下から0.35s・やわらかいスプリング、跳ねすぎない）
const useIn = (at: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 16, stiffness: 170, mass: 0.7 } });
  return { on: f >= at, style: { opacity: interpolate(f - at, [0, 5], [0, 1], clamp), transform: `translateY(${(1 - s) * 44}px) scale(${0.94 + 0.06 * s})` } as React.CSSProperties };
};
// C1：数字だけのポンッ（0.3→1.33→1、0.15s）
const popScale = (f: number, at: number) => interpolate(f - at, [0, 2, 5], [0.3, 1.33, 1], clamp);

const In: React.FC<{ at: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, style, children }) => {
  const p = useIn(at);
  if (!p.on) return null;
  return <div style={{ position: "absolute", ...style, ...p.style }}>{children}</div>;
};

// E3：進行ピル「01 / 04 名称」
const ProgressPill: React.FC<{ n: number; title: string; at: number; dark?: boolean }> = ({ n, title, at, dark }) => (
  <In at={at} style={{ left: 0, top: 250, width: 1080, display: "flex", justifyContent: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, background: dark ? "rgba(255,255,255,0.12)" : "#fff", border: dark ? "2px solid rgba(255,255,255,0.25)" : `2px solid ${A2.track}`, borderRadius: 999, padding: "10px 26px", boxShadow: dark ? "none" : "0 6px 16px rgba(80,60,20,0.08)" }}>
      <div style={{ width: 18, height: 18, borderRadius: 5, background: A2.green }} />
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, color: dark ? "rgba(255,255,255,0.7)" : A2.sub, letterSpacing: 1 }}>0{n} / 04</div>
      <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 32, color: dark ? "#fff" : A2.ink }}>{title}</div>
    </div>
  </In>
);

const Heading: React.FC<{ at: number; top?: number; size?: number; color?: string; children: React.ReactNode }> = ({ at, top = 335, size = 74, color = A2.ink, children }) => (
  <In at={at} style={{ left: 40, top, width: 1000, textAlign: "center" }}>
    <div style={{ fontFamily: BK, fontWeight: 900, fontSize: size, color, lineHeight: 1.25, letterSpacing: 1 }}>{children}</div>
  </In>
);

// アイコンカード（白・大角丸・やわらか影）
const IconCard: React.FC<{ icon: MIconName; cx: number; cy: number; size: number; at: number; tint?: string }> = ({ icon, cx, cy, size, at, tint = "#fff" }) => {
  const f = useCurrentFrame();
  const p = useIn(at);
  if (!p.on) return null;
  const I = MICONS[icon];
  const bob = Math.sin((f - at) / 18) * 3; // C4：常時わずかに上下
  return (
    <div style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2 + bob, width: size, height: size, ...p.style }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.2, background: tint, boxShadow: "0 14px 30px rgba(80,60,20,0.13)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 200 200" width={size * 0.78} height={size * 0.78}><I /></svg>
      </div>
    </div>
  );
};

// D1：線の描画（0.5s ease-out）
const Draw: React.FC<{ d: string; at: number; dur?: number; color?: string; w?: number; head?: { x: number; y: number; dir: "down" | "right" } }> = ({ d, at, dur = 15, color = A2.green, w = 9, head }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const g = interpolate(f, [at, at + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - g} />
      {head && g > 0.95 ? (head.dir === "down"
        ? <path d={`M${head.x - 18} ${head.y - 20} L${head.x} ${head.y} L${head.x + 18} ${head.y - 20}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
        : <path d={`M${head.x - 20} ${head.y - 18} L${head.x} ${head.y} L${head.x - 20} ${head.y + 18}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />) : null}
    </svg>
  );
};

const Pill: React.FC<{ at: number; cx: number; cy: number; bg?: string; color?: string; size?: number; children: React.ReactNode }> = ({ at, cx, cy, bg = A2.green, color = "#fff", size = 38, children }) => {
  const p = useIn(at);
  if (!p.on) return null;
  return (
    <div style={{ position: "absolute", left: cx, top: cy, transform: "translate(-50%,-50%)" }}>
      <div style={{ ...p.style, background: bg, color, fontFamily: BK, fontWeight: 900, fontSize: size, padding: `${size * 0.3}px ${size * 0.75}px`, borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 8px 18px rgba(80,60,20,0.14)" }}>{children}</div>
    </div>
  );
};

// ── 下テロップ：語の塊＋話す速さでマーカーが左→右に走る（A4）。原文の語のまま ──
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
  return (
    <div style={{ position: "absolute", left: 0, top: 1360, width: 1080, display: "flex", justifyContent: "center" }}>
      <span style={{ position: "relative", display: "inline-block" }}>
        <span style={{ position: "absolute", left: -10, top: "52%", bottom: "4%", width: `calc(${prog}% + 20px)`, background: A2.marker, borderRadius: 10 }} />
        <span style={{ position: "relative" }}><OText size={58} sw={10}>{txt}</OText></span>
      </span>
    </div>
  );
};

// 章：範囲外は描画しない＋C3退場（0.25s上へ）＋C4常時ドリフト（ゆっくり拡大）
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  const a = F(from), b = F(to);
  if (f < a || f >= b) return null;
  const out = interpolate(f, [b - 8, b], [0, 1], clamp);
  const drift = interpolate(f, [a, b], [1, 1.025]);
  return <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 70}px) scale(${drift})` }}>{children}</AbsoluteFill>;
};

// ── S1 マイルとは（0–5.12s）──
const S1: React.FC = () => (
  <Scene from={0} to={5.12}>
    <ProgressPill n={1} title="マイルとは" at={F(0.02)} />
    <Heading at={F(0.86)}>マイル＝<G>貯まるポイント</G></Heading>
    <IconCard icon="plane" cx={540} cy={640} size={260} at={F(0.9)} />
    <Pill at={F(1.9)} cx={540} cy={830} bg="#fff" color={A2.sub} size={36}>飛行機に<G c={A2.ink}>乗らなくても</G></Pill>
    <IconCard icon="receipt" cx={280} cy={1060} size={200} at={F(3.0)} />
    <Draw d="M400 1060 L660 1060" at={F(3.6)} head={{ x: 660, y: 1060, dir: "right" }} />
    <IconCard icon="ticket" cx={800} cy={1060} size={200} at={F(3.85)} />
    <In at={F(3.1)} style={{ left: 130, top: 1180, width: 300, textAlign: "center", fontFamily: BK, fontWeight: 900, fontSize: 34, color: A2.ink }}>普段の生活費</In>
    <In at={F(4.08)} style={{ left: 650, top: 1180, width: 300, textAlign: "center", fontFamily: BK, fontWeight: 900, fontSize: 34, color: A2.green }}>マイルが貯まる</In>
  </Scene>
);

// ── S2 貯まる仕組み（5.12–19.72s）＝番号付き手順表が1行ずつ ──
const STEPS: { at: number; icon: MIconName; t: string; s: string }[] = [
  { at: 6.84, icon: "receipt", t: "毎月の生活費", s: "食費・光熱費・スマホ・保険" },
  { at: 7.88, icon: "card", t: "クレカでまとめる", s: "支払いを1枚に集約" },
  { at: 9.08, icon: "gift", t: "入会キャンペーン達成", s: "条件クリアで特典" },
  { at: 12.52, icon: "coins", t: "まとまったポイント", s: "通常の利用分に上乗せ" },
  { at: 14.5, icon: "ticket", t: "マイルに交換", s: "ポイント → マイル" },
  { at: 15.44, icon: "plane", t: "航空券を予約", s: "家族旅行の飛行機代を大きく抑える" },
];
const StepRow: React.FC<{ i: number; y: number; at: number; nextAt?: number; icon: MIconName; t: string; s: string; last: boolean }> = ({ i, y, at, nextAt, icon, t, s, last }) => {
  const f = useCurrentFrame();
  const p = useIn(at);
  if (!p.on) return null;
  const dim = nextAt !== undefined ? interpolate(f, [nextAt, nextAt + 8], [1, 0.55], clamp) : 1;
  const active = nextAt === undefined || f < nextAt;
  const I = MICONS[icon];
  const hi = last && f >= F(16.96);
  return (
    <div style={{ position: "absolute", left: 80, top: y, width: 920, opacity: dim, ...p.style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: hi ? A2.marker : "#fff", border: `4px solid ${active ? A2.green : "transparent"}`, borderRadius: 26, padding: "12px 20px 12px 24px", boxShadow: "0 10px 22px rgba(80,60,20,0.10)" }}>
        <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 52, color: A2.green, width: 74, letterSpacing: -1 }}>0{i + 1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 40, color: A2.ink, lineHeight: 1.15 }}>{t}</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 25, color: A2.sub, marginTop: 4 }}>{s}</div>
        </div>
        <div style={{ width: 96, height: 96, borderRadius: 22, background: A2.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg viewBox="0 0 200 200" width={82} height={82}><I /></svg>
        </div>
      </div>
    </div>
  );
};
const S2: React.FC = () => {
  const Y0 = 450, STEP = 148;
  return (
    <Scene from={5.12} to={19.72}>
      <ProgressPill n={2} title="貯まる仕組み" at={F(5.14)} />
      {/* 背後の“糸”：各行が来るたびに下へ伸びる */}
      {STEPS.slice(1).map((st, k) => (
        <Draw key={k} d={`M156 ${Y0 + k * STEP + 60} L156 ${Y0 + (k + 1) * STEP + 60}`} at={F(st.at) - 8} dur={10} w={8} />
      ))}
      {STEPS.map((st, i) => (
        <StepRow key={i} i={i} y={Y0 + i * STEP} at={F(st.at)} nextAt={i + 1 < STEPS.length ? F(STEPS[i + 1].at) : undefined} icon={st.icon} t={st.t} s={st.s} last={i === STEPS.length - 1} />
      ))}
      <Heading at={F(5.2)} top={335} size={62}>生活費 → <G>家族旅行</G> の流れ</Heading>
    </Scene>
  );
};

// ── S3 条件（19.72–35.32s）：前半は“幕”を濃緑に（G2）→後半は明るくチェックリスト（D2）──
const Curtain: React.FC<{ on: number; off: number }> = ({ on, off }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [on, on + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const b = interpolate(f, [off, off + 9], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  if (f < on || b >= 1) return null;
  return <AbsoluteFill style={{ background: DARK, clipPath: `inset(${(1 - a) * 100}% 0 0 0)`, transform: `translateY(${-b * 1920}px)` }} />;
};
const Hero: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const n = Math.round(interpolate(f, [at, at + 12], [0, 100], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const sc = popScale(f, at + 12);
  return (
    <div style={{ position: "absolute", left: 0, top: 560, width: 1080, textAlign: "center" }}>
      <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 44, color: "rgba(255,255,255,0.8)" }}>半年で</div>
      <div style={{ display: "inline-block", transform: `scale(${f >= at + 12 ? sc : 1})`, fontFamily: BK, fontWeight: 900, fontSize: 210, color: A2.marker, lineHeight: 1.05, letterSpacing: -4 }}>{n}<span style={{ fontSize: 110 }}>万円</span></div>
    </div>
  );
};
const Check: React.FC<{ at: number; y: number; icon: MIconName; children: React.ReactNode }> = ({ at, y, icon, children }) => {
  const f = useCurrentFrame();
  const p = useIn(at);
  if (!p.on) return null;
  const c = interpolate(f, [at + 6, at + 12], [0, 1], clamp);
  const I = MICONS[icon];
  return (
    <div style={{ position: "absolute", left: 80, top: y, width: 920, ...p.style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#fff", borderRadius: 24, padding: "14px 24px", boxShadow: "0 10px 22px rgba(80,60,20,0.10)" }}>
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
          <circle cx="32" cy="32" r="27" fill={c > 0 ? A2.green : "#fff"} stroke={c > 0 ? A2.green : A2.bar} strokeWidth={5} />
          <path d="M19 33 L28 42 L46 23" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - c} />
        </svg>
        <div style={{ flex: 1, fontFamily: BK, fontWeight: 900, fontSize: 40, color: c > 0.5 ? A2.ink : A2.sub, lineHeight: 1.25 }}>{children}</div>
        <div style={{ width: 88, height: 88, borderRadius: 20, background: A2.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg viewBox="0 0 200 200" width={76} height={76}><I /></svg>
        </div>
      </div>
    </div>
  );
};
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const darkPhase = f < F(25.55);
  return (
    <Scene from={19.72} to={35.32}>
      <Curtain on={F(19.74)} off={F(25.55)} />
      {darkPhase ? (
        <>
          <ProgressPill n={3} title="ただし条件あり" at={F(19.8)} dark />
          <Heading at={F(20.72)} color="#fff">キャンペーンには<G c={A2.marker}>利用条件</G></Heading>
          <Hero at={F(23.2)} />
          <Draw d="M540 880 L540 960" at={F(23.76)} color="#fff" w={10} head={{ x: 540, y: 960, dir: "down" }} />
          <Pill at={F(24.4)} cx={540} cy={1060} bg="#fff" color={A2.ink} size={44}>月にすると <span style={{ color: A2.green, fontSize: 62 }}>約17万円</span></Pill>
        </>
      ) : (
        <>
          <ProgressPill n={3} title="達成のコツ" at={F(25.56)} />
          <Heading at={F(25.6)} size={66}>普段の支払いで<G>達成できる</G></Heading>
          <Check at={F(25.74)} y={470} icon="house">家族の毎月の<G>固定費</G>をまとめる</Check>
          <Check at={F(27.64)} y={640} icon="cart">大きな出費は、むしろ<G c={A2.coral}>チャンス</G></Check>
          <Check at={F(30.02)} y={810} icon="gift">他にも<G>達成する方法</G>がいくつも</Check>
          <In at={F(34.16)} style={{ left: 0, top: 1040, width: 1080, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, background: A2.green, borderRadius: 999, padding: "16px 40px 16px 20px", boxShadow: "0 12px 26px rgba(46,158,107,0.3)", transform: `scale(${1 + 0.025 * Math.sin((f - F(34.16)) / 5)})` }}>
              <div style={{ width: 84, height: 84, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 200 200" width={70} height={70}>{React.createElement(MICONS.phone)}</svg>
              </div>
              <div style={{ fontFamily: BK, fontWeight: 900, fontSize: 48, color: "#fff" }}>気になる方はDMで</div>
            </div>
          </In>
        </>
      )}
    </Scene>
  );
};

// ── S4 おすすめする理由（35.32–50.07s）：取消線リビール（G4）→家族→将来＝今 ──
const Strike: React.FC<{ at: number; strikeAt: number }> = ({ at, strikeAt }) => {
  const f = useCurrentFrame();
  const p = useIn(at);
  if (!p.on) return null;
  const g = interpolate(f, [strikeAt, strikeAt + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const fade = interpolate(f, [strikeAt, strikeAt + 9], [1, 0.45], clamp);
  return (
    <div style={{ position: "absolute", left: 0, top: 440, width: 1080, display: "flex", justifyContent: "center", ...p.style }}>
      <div style={{ position: "relative", fontFamily: BK, fontWeight: 900, fontSize: 66, color: A2.ink, opacity: fade }}>
        飛行機代がお得
        <div style={{ position: "absolute", left: -10, top: "52%", height: 12, width: `calc(${g * 100}% + 20px)`, background: A2.coral, borderRadius: 6 }} />
      </div>
    </div>
  );
};
const S4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene from={35.32} to={50.2}>
      <ProgressPill n={4} title="おすすめする理由" at={F(35.34)} />
      <Heading at={F(35.6)} size={60}>僕がマイルをすすめるのは…</Heading>
      <Strike at={F(37.54)} strikeAt={F(38.86)} />
      <Pill at={F(39.0)} cx={800} cy={590} bg={A2.coral} size={34}>だけじゃない</Pill>
      <IconCard icon="family" cx={540} cy={745} size={240} at={F(39.52)} />
      <In at={F(40.38)} style={{ left: 0, top: 890, width: 1080, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: A2.marker, borderRadius: 16, padding: "10px 30px", fontFamily: BK, fontWeight: 900, fontSize: 46, color: A2.ink }}>子供が小さい今だからこそ</span>
      </In>
      <In at={F(41.3)} style={{ left: 0, top: 975, width: 1080, textAlign: "center", fontFamily: BK, fontWeight: 900, fontSize: 40, color: A2.ink }}>家族との<G>思い出や経験</G>を増やしてほしい</In>
      <IconCard icon="piggy" cx={290} cy={1130} size={150} at={F(44.12)} />
      <In at={F(45.88)} style={{ left: 140, top: 1215, width: 300, textAlign: "center", fontFamily: BK, fontWeight: 900, fontSize: 32, color: A2.sub }}>将来への備え</In>
      <IconCard icon="suitcase" cx={790} cy={1130} size={150} at={F(47.66)} />
      <In at={F(47.9)} style={{ left: 640, top: 1215, width: 300, textAlign: "center", fontFamily: BK, fontWeight: 900, fontSize: 32, color: A2.green }}>今しかできない経験</In>
      {f >= F(48.4) ? <div style={{ position: "absolute", left: 0, top: 1085, width: 1080, textAlign: "center", fontFamily: BK, fontWeight: 900, fontSize: 80, color: A2.ink, transform: `scale(${popScale(f, F(48.4))})` }}>＝</div> : null}
      <In at={F(49.02)} style={{ left: 0, top: 1272, width: 1080, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: A2.green, color: "#fff", borderRadius: 999, padding: "8px 34px", fontFamily: BK, fontWeight: 900, fontSize: 42 }}>同じくらい大切</span>
      </In>
    </Scene>
  );
};

// 効果音（中音主役・高音はキメ1回）
const CUES: { file: string; at: number; volume: number }[] = [
  ...[0.02, 5.14, 19.74, 25.55, 35.34].map((s) => ({ file: "user/u03s", at: F(s), volume: 0.32 })),
  ...[0.9, 3.0, 3.85, 6.84, 7.88, 9.08, 12.52, 14.5, 15.44, 39.52, 44.12, 47.66].map((s) => ({ file: "user/u02s", at: F(s), volume: 0.34 })),
  ...[25.74, 27.64, 30.02].map((s) => ({ file: "user/u05s", at: F(s) + 6, volume: 0.32 })),
  { file: "user/u04", at: F(23.2) + 12, volume: 0.36 },
  { file: "user/u05s", at: F(38.86), volume: 0.32 },
  { file: "user/u10", at: F(49.02), volume: 0.32 },
];

export const MILE3_FRAMES = 1502;

export const MileReel3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%, rgba(150,120,40,0.08) 100%)" }} />
    <Audio src={staticFile("mile-narration.wav")} />
    <SfxTrack cues={CUES} />
    <S1 />
    <S2 />
    <S3 />
    <S4 />
    <Subtitle />
  </AbsoluteFill>
);
