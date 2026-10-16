import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { A2 } from "./components/kit2";
import { FONT, FONT_BLACK } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { GEN_AVAILABLE } from "./genManifest";
import { LifeChart, Equal } from "./MileLifeChart";
import { R } from "./mileTime";

// ════════════════════════════════════════════════════════════════════
//  マイル図解 v2（参考リールの「出し方」を取り入れた版。見た目はいつもの薄黄×緑×コーラル）
//  ・1ビート＝1つの主役（画面に置くものを絞る）
//  ・字幕＝単語ごとに出る。次の単語が薄く先に見えて、話した瞬間に濃くなる。キーワードは別スタイル
//  ・上に章チップ「01 / 04 …」
//  ・場面転換＝ぼかしアウト → ぼかしイン
//  ・タイピング、数字ロール、点線コネクタ＋流れる点、チェックチップ、行のカスケード
//  時刻はすべて新ナレ（mile_v2）の秒
// ════════════════════════════════════════════════════════════════════

const S = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const B = { fontFamily: FONT, fontWeight: 800 as const };
const K = { fontFamily: FONT_BLACK, fontWeight: 900 as const };
const pop = (f: number, at: number) => interpolate(f - at, [0, 3, 6], [0.3, 1.18, 1], clamp);
const GOLD = "#E9B82E";

// ── 背景：薄黄に、ゆっくり流れるやわらかい光の帯 ──
const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const p = (f % 600) / 600;
  return (
    <AbsoluteFill style={{ background: A2.bg }}>
      <AbsoluteFill style={{ background: `linear-gradient(118deg, rgba(255,255,255,0) ${18 + p * 10}%, rgba(255,255,255,0.55) ${32 + p * 10}%, rgba(255,255,255,0) ${46 + p * 10}%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(118deg, rgba(255,255,255,0) ${58 - p * 8}%, rgba(255,255,255,0.35) ${68 - p * 8}%, rgba(255,255,255,0) ${78 - p * 8}%)` }} />
    </AbsoluteFill>
  );
};

// ── 画像（背景直置き＋ドロップシャドウ）──
const Pic: React.FC<{ name: string; size: number; style?: React.CSSProperties }> = ({ name, size, style }) =>
  GEN_AVAILABLE.has(name) ? (
    <Img src={staticFile(`gen/${name}.png`)} style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 18px 22px rgba(80,60,20,0.18))", ...style }} />
  ) : (
    <div style={{ width: size, height: size, border: `3px dashed ${A2.bar}`, borderRadius: 20, ...style }} />
  );

// ── 場面：ぼかしイン → ぼかしアウト ──
const Scene: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const f = useCurrentFrame();
  const A = S(a), Bf = S(b);
  if (f < A || f >= Bf) return null;
  const i = interpolate(f, [A, A + 8], [1, 0], out);
  const o = interpolate(f, [Bf - 7, Bf], [0, 1], clamp);
  const k = Math.max(i, o);
  return <AbsoluteFill style={{ opacity: 1 - k, filter: `blur(${k * 14}px)`, transform: `scale(${1 + i * 0.04 - o * 0.04})` }}>{children}</AbsoluteFill>;
};

// ── 出現（下からふわっ）──
const Rise: React.FC<{ at: number; x: number; y: number; w?: number; center?: boolean; children: React.ReactNode }> = ({ at, x, y, w, center, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = S(at);
  if (f < A) return null;
  const s = spring({ frame: f - A, fps, config: { damping: 15, stiffness: 180, mass: 0.6 } });
  return <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: center ? "center" : undefined, opacity: interpolate(f - A, [0, 5], [0, 1], clamp), transform: `translateY(${(1 - s) * 40}px)` }}>{children}</div>;
};
const Pop: React.FC<{ at: number; x: number; y: number; w?: number; center?: boolean; origin?: string; children: React.ReactNode }> = ({ at, x, y, w, center, origin = "center", children }) => {
  const f = useCurrentFrame();
  const A = S(at);
  if (f < A) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: center ? "center" : undefined, transform: `scale(${pop(f, A)})`, transformOrigin: origin }}>{children}</div>;
};
const FadeOut: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const f = useCurrentFrame();
  return <div style={{ opacity: interpolate(f, [S(at), S(at) + 8], [1, 0], clamp) }}>{children}</div>;
};
const Bob: React.FC<{ children: React.ReactNode; amp?: number }> = ({ children, amp = 8 }) => {
  const f = useCurrentFrame();
  return <div style={{ transform: `translateY(${Math.sin(f / 10) * amp}px)` }}>{children}</div>;
};

// ── タイピング（カーソル付き）──
const Typing: React.FC<{ at: number; text: string; cps?: number; style?: React.CSSProperties }> = ({ at, text, cps = 14, style }) => {
  const f = useCurrentFrame();
  const A = S(at);
  if (f < A) return null;
  const n = Math.min(text.length, Math.floor(((f - A) / 30) * cps) + 1);
  const done = n >= text.length;
  const blink = Math.floor((f - A) / 8) % 2 === 0;
  return (
    <span style={style}>
      {text.slice(0, n)}
      <span style={{ display: "inline-block", width: 5, height: "0.9em", marginLeft: 4, verticalAlign: "-0.08em", background: A2.green, opacity: done ? (blink ? 1 : 0) : 1 }} />
    </span>
  );
};

// ── チップ ──
const Chip: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number; check?: boolean }> = ({ children, bg = "#fff", color = A2.ink, size = 36, check }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.3, background: bg, color, ...B, fontSize: size, padding: `${size * 0.28}px ${size * 0.6}px`, borderRadius: 999, boxShadow: "0 6px 16px rgba(80,60,20,0.10)", whiteSpace: "nowrap" }}>
    {check ? <span style={{ color: A2.green }}>✓</span> : null}
    {children}
  </span>
);
const ChipRow: React.FC<{ y: number; items: [number, string][] }> = ({ y, items }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, display: "flex", justifyContent: "center", gap: 18 }}>
      {items.map(([at, t]) => {
        const A = S(at);
        const on = f >= A;
        return <span key={t} style={{ opacity: on ? 1 : 0.35, transform: `scale(${on ? pop(f, A) : 0.96})` }}><Chip check={on}>{t}</Chip></span>;
      })}
    </div>
  );
};

// ── 数字ロール ──
const Roll: React.FC<{ at: number; to: number; dur?: number; style?: React.CSSProperties }> = ({ at, to, dur = 12, style }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [S(at), S(at) + dur], [0, to], out));
  return <span style={style}>{n}</span>;
};

// ── 点線コネクタ＋流れる点 ──
const Connector: React.FC<{ x1: number; x2: number; y: number; at: number; color?: string }> = ({ x1, x2, y, at, color = A2.green }) => {
  const f = useCurrentFrame();
  const A = S(at);
  if (f < A) return null;
  const p = interpolate(f, [A, A + 10], [0, 1], out);
  const w = (x2 - x1) * p;
  const dots = [0, 1, 2].map((k) => ((f - A) / 40 + k / 3) % 1);
  return (
    <div style={{ position: "absolute", left: x1, top: y - 10, width: x2 - x1, height: 20 }}>
      <div style={{ position: "absolute", left: 0, top: 8, width: w, height: 0, borderTop: `5px dashed ${A2.bar}` }} />
      {p >= 1 ? dots.map((d, k) => <div key={k} style={{ position: "absolute", left: d * (x2 - x1) - 9, top: 1, width: 18, height: 18, borderRadius: "50%", background: color, opacity: Math.sin(d * Math.PI) }} />) : null}
    </div>
  );
};

// ── 章チップ（上）──
const CHAPTERS: [number, number, string, string][] = [
  [0, 5.12, "マイルとは", A2.green],
  [5.12, 19.76, "貯め方", GOLD],
  [19.76, 35.34, "利用条件", A2.coral],
  [35.34, 39.56, "今の経験", A2.green],
];
const ChapterChip: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const i = CHAPTERS.findIndex(([a, b]) => t >= a && t < b);
  if (i < 0) {
    const fade = interpolate(f, [S(39.56), S(39.56) + 8], [1, 0], clamp);
    if (fade <= 0) return null;
  }
  const [a, , label, color] = CHAPTERS[i < 0 ? 3 : i];
  const k = interpolate(f, [S(a), S(a) + 8], [0, 1], out) * (i < 0 ? interpolate(f, [S(39.56), S(39.56) + 8], [1, 0], clamp) : 1);
  return (
    <div style={{ position: "absolute", left: 0, top: 262, width: 1080, display: "flex", justifyContent: "center", opacity: k, filter: `blur(${(1 - k) * 6}px)` }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "#fff", borderRadius: 999, padding: "10px 26px", boxShadow: "0 6px 16px rgba(80,60,20,0.10)", ...B, fontSize: 30, color: A2.ink }}>
        <span style={{ width: 16, height: 16, borderRadius: 5, background: color }} />
        <span style={{ color: A2.sub }}>0{(i < 0 ? 3 : i) + 1} / 04</span>
        {label}
      </span>
    </div>
  );
};

// ── 字幕：単語ごと（次の単語が薄く先出し）。*付きはキーワードスタイル ──
const WORDS: string[] = [
  "0.00 その|0.30 方法が|/0.86 *マイルの|1.26 *活用|/1.56 実は|1.98 飛行機に|2.44 乗らなくても|/3.02 普段の|3.46 *生活費から|/4.10 貯める|4.44 ことが|4.80 できます",
  "/5.12 では|5.44 どうやって|5.96 *貯めるのか|/6.60 まず|6.86 普段の|7.30 生活費を|/7.88 *クレカで|8.34 *まとめます|/8.78 そして|9.10 *入会|9.48 *キャンペーンの|/10.02 条件を|10.34 達成すると",
  "/11.04 通常の|11.66 利用分に|12.14 加えて|/12.54 *まとまった|12.96 *ポイントが|13.38 もらえる|/13.72 その|14.00 ポイントを|/14.54 *マイルに|14.92 *交換して|/15.46 航空券を|16.20 予約する|16.56 ことで",
  "/17.00 家族旅行の|17.72 飛行機代を|/18.44 *大きく|18.82 *抑える|19.12 ことが|19.42 できます|/19.76 ただ|/20.06 キャンペーンには|20.74 一定の|/21.22 *利用条件が|21.86 あって",
  "/22.24 例えば|/22.64 *半年で|23.24 *100万円|/23.78 月に|24.14 すると|/24.42 約|24.66 *17万円|25.50 くらい|/25.74 家族の|26.20 毎月の|/26.62 *固定費を|27.06 まとめたり",
  "/27.66 大きな|28.10 *出費が|28.44 あれば|/28.80 むしろ|29.20 それは|/29.48 *チャンス|29.92 です|/30.04 実は|30.30 他にも|/30.80 *効率よく|31.50 利用条件を|/32.20 達成する|32.64 方法が|/33.36 *いくつも|33.74 あるので|/34.16 気になる|34.60 方は|34.98 *DMで",
  "/35.34 そして|35.64 僕が|/36.04 マイルを|36.38 お勧め|36.68 するのは|/37.10 単に|37.56 飛行機代が|/38.24 お得に|38.60 なるから|/38.86 では|39.10 *ありません",
  "/39.56 子供が|40.06 小さい|/40.42 *今|40.58 だからこそ|41.02 できる|/41.32 家族との|41.86 *思い出や|42.26 *経験|/42.66 これを|43.08 増やして|43.46 ほしい|43.72 からです",
  "/44.14 *教育資金や|45.02 *老後資金など|/45.90 将来への|46.54 備えも|46.86 大切ですが|/47.66 *今しか|48.06 できない|48.42 *経験も|/49.04 *同じくらい|49.54 *大切です",
];
type W = { t: number; s: string; k: boolean };
const PHRASES: W[][] = (() => {
  const ps: W[][] = [];
  WORDS.join("|").split("|").forEach((tok) => {
    let x = tok.trim();
    const brk = x.startsWith("/");
    if (brk) x = x.slice(1);
    const [ts, ...rest] = x.split(" ");
    let s = rest.join(" ");
    const k = s.startsWith("*");
    if (k) s = s.slice(1);
    if (brk || ps.length === 0) ps.push([]);
    ps[ps.length - 1].push({ t: parseFloat(ts), s, k });
  });
  return ps;
})();
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  let pi = -1;
  PHRASES.forEach((p, i) => { if (t >= p[0].t - 0.12) pi = i; });
  if (pi < 0 || t > 50.0) return null;
  const p = PHRASES[pi];
  const enter = interpolate(t, [p[0].t - 0.12, p[0].t], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1330, display: "flex", justifyContent: "center", alignItems: "baseline", flexWrap: "wrap", columnGap: 10, transform: `translateY(${(1 - enter) * 14}px)` }}>
      {p.map((w, i) => {
        const pre = t >= w.t - 0.18;
        const on = t >= w.t;
        if (!pre) return null;
        const st: React.CSSProperties = w.k
          ? { ...K, fontSize: 68, color: on ? A2.green : "rgba(46,158,107,0.28)", letterSpacing: 1 }
          : { ...B, fontSize: 56, color: on ? A2.ink : "rgba(46,44,38,0.25)" };
        return <span key={i} style={{ ...st, textShadow: on ? "0 2px 0 rgba(255,255,255,0.8)" : undefined }}>{w.s}</span>;
      })}
    </div>
  );
};

// ════════════════ 場面 ════════════════
const Title: React.FC<{ at: number; text: string; y?: number; size?: number }> = ({ at, text, y = 380, size = 66 }) => (
  <div style={{ position: "absolute", left: 0, top: y, width: 1080, textAlign: "center" }}>
    <Typing at={at} text={text} style={{ ...K, fontSize: size, color: A2.ink }} />
  </div>
);

// 01 マイルとは
const S1: React.FC = () => (
  <Scene a={0} b={1.56}>
    <Rise at={0.1} x={250} y={420} w={580}><Bob><Pic name="mile_plane" size={580} /></Bob></Rise>
    <div style={{ position: "absolute", left: 0, top: 1060, width: 1080, textAlign: "center" }}>
      <span style={{ display: "inline-block", background: "#fff", borderRadius: 24, padding: "18px 40px", boxShadow: "0 10px 26px rgba(80,60,20,0.12)" }}>
        <Typing at={0.86} text="マイルの活用" cps={12} style={{ ...K, fontSize: 64, color: A2.green }} />
      </span>
    </div>
  </Scene>
);
const S2: React.FC = () => (
  <Scene a={1.56} b={5.12}>
    <Rise at={3.02} x={60} y={500} w={340}><Pic name="mile_receipt" size={340} /></Rise>
    <Rise at={1.6} x={690} y={500} w={340}><Bob><Pic name="mile_plane" size={340} /></Bob></Rise>
    <FadeOut at={3.3}><Pop at={2.2} x={0} y={960} w={1080} center><Chip bg={A2.coral} color="#fff" size={44}>飛行機に乗らなくても</Chip></Pop></FadeOut>
    <Connector x1={400} x2={690} y={680} at={3.46} />
    <Pop at={3.46} x={60} y={860} w={340} center><Chip size={36}>生活費</Chip></Pop>
    <Pop at={4.1} x={395} y={590} w={300} center><Chip check size={36}>貯まる</Chip></Pop>
  </Scene>
);

// 02 貯め方
const PILLS = ["食費", "光熱費", "通信費", "日用品"];
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const merge = S(8.3);
  const mg = interpolate(f, [merge, merge + 10], [0, 1], io);
  return (
    <Scene a={5.12} b={8.78}>
      <Title at={5.2} text="どうやって貯める？" />
      {PILLS.map((p, i) => {
        const at = 6.86 + i * 0.12;
        if (f < S(at)) return null;
        const x = 110 + [0, 40, 10, 50][i], y = 560 + i * 105;
        const dx = (780 - (x + 150)) * mg, dy = (720 - (y + 40)) * mg;
        const sl = interpolate(f - S(at), [0, 8], [-60, 0], out);
        return (
          <div key={p} style={{ position: "absolute", left: x + sl, top: y, transform: `translate(${dx}px, ${dy}px) scale(${1 - mg * 0.7})`, opacity: interpolate(f - S(at), [0, 5], [0, 1], clamp) * (1 - mg) }}>
            <Chip size={44}>{p}</Chip>
          </div>
        );
      })}
      {f >= S(7.88) ? (
        <div style={{ position: "absolute", left: 600, top: 560, transform: `translateX(${interpolate(f, [S(7.88), S(7.88) + 10], [240, 0], out)}px) rotate(${interpolate(f, [S(7.88), S(7.88) + 10], [18, -6], out)}deg) scale(${1 + 0.12 * Math.sin(mg * Math.PI)})` }}>
          <Pic name="mile_card" size={360} />
        </div>
      ) : null}
      <Pop at={8.4} x={0} y={1010} w={1080} center><Chip size={44}><span style={{ color: A2.green }}>1枚</span>にまとめる</Chip></Pop>
    </Scene>
  );
};
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const shake = f >= S(10.52) ? Math.sin((f - S(10.52)) / 1.6) * interpolate(f - S(10.52), [0, 4, 14], [0, 7, 0], clamp) : 0;
  return (
    <Scene a={8.78} b={11.04}>
      <Rise at={8.8} x={290} y={400} w={500}><div style={{ transform: `rotate(${shake}deg)` }}><Pic name="mile_gift" size={500} /></div></Rise>
      <ChipRow y={960} items={[[9.1, "入会"], [9.48, "キャンペーン"], [10.34, "条件達成"]]} />
    </Scene>
  );
};
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const g = interpolate(f, [S(11.66), S(11.66) + 10], [0, 0.22], out);
  const y = interpolate(f, [S(12.54), S(12.54) + 14], [0.22, 1], out);
  return (
    <Scene a={11.04} b={13.72}>
      <Title at={11.1} text="もらえるポイント" size={58} />
      {f >= S(12.96) ? <div style={{ position: "absolute", left: 340, top: 480, transform: `scale(${pop(f, S(12.96))})` }}><Pic name="mile_coins" size={400} /></div> : null}
      <div style={{ position: "absolute", left: 100, top: 930, width: 880, height: 64, borderRadius: 32, background: "#fff", boxShadow: "inset 0 2px 6px rgba(80,60,20,0.08)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: 64, width: 880 * g, background: A2.bar }} />
        {y > 0.22 ? <div style={{ position: "absolute", left: 880 * 0.22, top: 0, height: 64, width: 880 * (y - 0.22), background: GOLD }} /> : null}
      </div>
      {f >= S(11.66) ? <div style={{ position: "absolute", left: 100, top: 1010, ...B, fontSize: 30, color: A2.sub }}>通常の利用分</div> : null}
      {f >= S(12.54) ? <div style={{ position: "absolute", right: 100, top: 1010, ...B, fontSize: 34, color: A2.ink }}>＋ <span style={{ color: "#B98A0E" }}>まとまったポイント</span></div> : null}
    </Scene>
  );
};
const S6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene a={13.72} b={15.46}>
      <Rise at={13.75} x={70} y={520} w={300}><Pic name="mile_coins" size={300} /></Rise>
      <Connector x1={380} x2={700} y={680} at={14.0} color={GOLD} />
      {f >= S(14.54) ? <div style={{ position: "absolute", left: 710, top: 520, transform: `scale(${pop(f, S(14.54))})` }}><Bob><Pic name="mile_plane" size={300} /></Bob></div> : null}
      <Pop at={14.92} x={390} y={590} w={300} center><Chip check size={36}>交換</Chip></Pop>
      <Pop at={14.6} x={0} y={940} w={1080} center><span style={{ ...K, fontSize: 84, color: A2.green }}>マイル</span></Pop>
    </Scene>
  );
};
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const A = S(15.46);
  const sl = interpolate(f, [A, A + 12], [700, 0], out);
  return (
    <Scene a={15.46} b={17.0}>
      <div style={{ position: "absolute", left: 200, top: 460, transform: `translateX(${sl}px) rotate(${interpolate(f, [A, A + 12], [14, -4], out)}deg)` }}><Pic name="mile_ticket" size={680} /></div>
      <div style={{ position: "absolute", left: 0, top: 1030, width: 1080, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "#fff", borderRadius: 24, padding: "14px 34px", boxShadow: "0 10px 26px rgba(80,60,20,0.12)" }}>
          <Typing at={15.8} text="マイルで航空券を予約" cps={16} style={{ ...B, fontSize: 48, color: A2.ink }} />
        </span>
      </div>
    </Scene>
  );
};
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const full = interpolate(f, [S(17.72), S(17.72) + 10], [0, 880], out);
  const sh = interpolate(f, [S(18.44), S(18.44) + 12], [0, 1], io);
  return (
    <Scene a={17.0} b={19.76}>
      <Rise at={17.0} x={290} y={360} w={500}><Pic name="mile_family_happy" size={500} /></Rise>
      {f >= S(17.72) ? <div style={{ position: "absolute", left: 100, top: 900, ...B, fontSize: 34, color: A2.sub }}>家族の飛行機代</div> : null}
      <div style={{ position: "absolute", left: 100, top: 960, height: 72, width: full * (1 - sh * 0.66), borderRadius: 18, background: sh > 0.5 ? A2.green : A2.coral }} />
      {sh > 0 ? <div style={{ position: "absolute", left: 100 + 880 * 0.34 + 8, top: 960, height: 72, width: 880 * 0.66 - 8, borderRadius: 18, border: `4px dashed ${A2.coral}`, boxSizing: "border-box", opacity: sh * 0.8 }} /> : null}
      <Pop at={18.82} x={0} y={1080} w={1080} center><Chip bg={A2.coral} color="#fff" size={46}>大きく抑えられる</Chip></Pop>
    </Scene>
  );
};

// 03 利用条件
const S9: React.FC = () => (
  <Scene a={19.76} b={23.78}>
    <Title at={19.8} text="キャンペーンの利用条件" size={60} />
    <Rise at={20.74} x={60} y={540} w={380}><Pic name="mile_calendar" size={380} /></Rise>
    <Rise at={22.24} x={470} y={560}><span style={{ ...B, fontSize: 40, color: A2.sub }}>例えば</span></Rise>
    <Rise at={22.64} x={470} y={620}><span style={{ ...K, fontSize: 70, color: A2.ink }}>半年で</span></Rise>
    <Pop at={23.24} x={460} y={700} origin="left center">
      <span style={{ whiteSpace: "nowrap" }}><Roll at={23.24} to={100} dur={10} style={{ ...K, fontSize: 190, color: A2.green, letterSpacing: -6 }} /><span style={{ ...K, fontSize: 80, color: A2.ink }}>万円</span></span>
    </Pop>
  </Scene>
);
const S10: React.FC = () => {
  const f = useCurrentFrame();
  const cut = S(23.9);
  return (
    <Scene a={23.78} b={25.74}>
      <Title at={23.8} text="月にすると…" size={58} />
      <div style={{ position: "absolute", left: 90, top: 560, width: 900, height: 120, borderRadius: 26, background: A2.green, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 60, color: "#fff", opacity: interpolate(f, [cut, cut + 6], [1, 0], clamp) }}>100万円</div>
        {[1, 2, 3, 4, 5].map((k) => <div key={k} style={{ position: "absolute", left: 150 * k - 4, top: 0, width: 8, height: 120, background: A2.bg, transform: `scaleY(${interpolate(f, [cut + k * 2, cut + k * 2 + 6], [0, 1], out)})` }} />)}
        {[0, 1, 2, 3, 4, 5].map((i) => (f >= S(24.66) + i * 2 ? <div key={i} style={{ position: "absolute", left: 150 * i, top: 0, width: 150, height: 120, display: "flex", alignItems: "center", justifyContent: "center", ...B, fontSize: 34, color: "#fff", transform: `scale(${pop(f, S(24.66) + i * 2)})` }}>約17万</div> : null))}
      </div>
      <Pop at={24.66} x={0} y={760} w={1080} center>
        <span style={{ whiteSpace: "nowrap" }}><span style={{ ...K, fontSize: 70, color: A2.ink }}>月 約</span><Roll at={24.66} to={17} dur={10} style={{ ...K, fontSize: 210, color: A2.coral }} /><span style={{ ...K, fontSize: 70, color: A2.ink }}>万円</span></span>
      </Pop>
    </Scene>
  );
};
const Row: React.FC<{ at: number; y: number; img: string; main: React.ReactNode; sub: string }> = ({ at, y, img, main, sub }) => {
  const f = useCurrentFrame();
  const A = S(at);
  if (f < A) return null;
  return (
    <div style={{ position: "absolute", left: 80, top: y, width: 920, display: "flex", alignItems: "center", gap: 30, opacity: interpolate(f - A, [0, 6], [0, 1], clamp), transform: `translateX(${interpolate(f - A, [0, 10], [-80, 0], out)}px)` }}>
      <Pic name={img} size={230} />
      <div>
        <div style={{ ...K, fontSize: 60, color: A2.ink }}>{main}</div>
        <div style={{ ...B, fontSize: 34, color: A2.sub, marginTop: 6 }}>{sub}</div>
      </div>
      {f >= A + 10 ? <span style={{ marginLeft: "auto", transform: `scale(${pop(f, A + 10)})` }}><Chip check size={34}>OK</Chip></span> : null}
    </div>
  );
};
const S11: React.FC = () => {
  const f = useCurrentFrame();
  const st = S(29.48);
  return (
    <Scene a={25.74} b={30.04}>
      <Rise at={25.74} x={0} y={380} w={1080} center><Chip size={34}>月 約17万円</Chip></Rise>
      <Row at={25.98} y={490} img="mile_house" main={<>毎月の<span style={{ color: A2.green }}>固定費</span></>} sub="をまとめる" />
      <Row at={27.66} y={760} img="mile_cart" main={<>大きな<span style={{ color: A2.green }}>出費</span></>} sub="があれば" />
      {f >= st ? (
        <div style={{ position: "absolute", left: 0, top: 1040, width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `rotate(-4deg) scale(${interpolate(f - st, [0, 4, 7], [1.8, 0.92, 1], clamp)})`, opacity: interpolate(f - st, [0, 3], [0, 1], clamp), background: A2.bg, border: `8px solid ${A2.coral}`, borderRadius: 26, padding: "8px 40px", ...K, fontSize: 84, color: A2.coral }}>むしろチャンス</div>
        </div>
      ) : null}
    </Scene>
  );
};
export const S12: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [32.2, 32.4, 32.6, 33.36, 33.5];
  return (
    <Scene a={30.04} b={34.16}>
      <Title at={30.8} text="効率よく達成する方法" size={60} />
      {rows.map((at, i) => {
        const A = S(at);
        if (f < A) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 110, top: 520 + i * 118, width: 860, height: 96, borderRadius: 26, background: "#fff", boxShadow: "0 8px 20px rgba(80,60,20,0.08)", display: "flex", alignItems: "center", gap: 24, padding: "0 30px", boxSizing: "border-box", opacity: interpolate(f - A, [0, 5], [0, 1], clamp), transform: `translateY(${interpolate(f - A, [0, 8], [30, 0], out)}px)` }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: A2.track, ...K, fontSize: 36, color: A2.green, textAlign: "center", lineHeight: "54px" }}>?</div>
            <div style={{ ...B, fontSize: 34, color: A2.ink }}>方法{["①", "②", "③", "④", "⑤"][i]}</div>
            <div style={{ flex: 1, height: 22, borderRadius: 11, background: A2.track, filter: "blur(2px)" }} />
          </div>
        );
      })}
    </Scene>
  );
};
export const S13: React.FC = () => {
  const f = useCurrentFrame();
  const A = S(34.16);
  return (
    <Scene a={34.16} b={35.34}>
      <div style={{ position: "absolute", left: 290, top: 400, transform: `translateY(${interpolate(f, [A, A + 10], [500, 0], out)}px)` }}><Pic name="mile_phone_dm" size={500} /></div>
      <Pop at={34.98} x={0} y={980} w={1080} center><Chip bg={A2.green} color="#fff" size={56}>DMで</Chip></Pop>
    </Scene>
  );
};

// 04 今の経験
const S14: React.FC = () => {
  const f = useCurrentFrame();
  const st = S(38.86);
  const g = interpolate(f, [st, st + 9], [0, 1], out);
  return (
    <Scene a={35.34} b={39.56}>
      <Rise at={35.64} x={250} y={400} w={580}><Bob><Pic name="mile_plane" size={580} /></Bob></Rise>
      {f >= S(37.56) ? (
        <div style={{ position: "absolute", left: 0, top: 1000, width: 1080, textAlign: "center" }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            <Typing at={37.56} text="飛行機代がお得" cps={14} style={{ ...K, fontSize: 76, color: f >= st ? A2.sub : A2.ink }} />
            <span style={{ position: "absolute", left: -10, top: "50%", height: 12, width: `calc(${g * 100}% + 20px)`, background: A2.coral, borderRadius: 6 }} />
          </span>
        </div>
      ) : null}
      <Pop at={39.1} x={0} y={1110} w={1080} center><Chip bg={A2.coral} color="#fff" size={48}>だけじゃない</Chip></Pop>
    </Scene>
  );
};

const CUES: { file: string; at: number; volume: number }[] = [
  ...[0.1, 0.86, 2.2, 3.02, 3.46, 4.1].map((t) => ({ file: "user/u02s", at: S(t), volume: 0.24 })),
  { file: "user/u03s", at: S(5.12), volume: 0.28 },
  ...PILLS.map((_, i) => ({ file: "user/u02s", at: S(6.86 + i * 0.12), volume: 0.16 })),
  { file: "user/u05s", at: S(8.3), volume: 0.28 },
  { file: "user/u03s", at: S(8.78), volume: 0.24 },
  ...[9.1, 9.48, 10.34].map((t) => ({ file: "user/u02s", at: S(t), volume: 0.24 })),
  { file: "user/u03s", at: S(11.04), volume: 0.24 },
  { file: "user/u05", at: S(12.54), volume: 0.26 },
  { file: "user/u05s", at: S(14.92), volume: 0.28 },
  { file: "user/u03s", at: S(15.46), volume: 0.26 },
  { file: "user/u05", at: S(18.44), volume: 0.28 },
  { file: "user/u03", at: S(19.76), volume: 0.28 },
  { file: "user/u02s", at: S(23.24), volume: 0.3 },
  { file: "user/u05s", at: S(24.66), volume: 0.28 },
  ...[25.98, 27.66].map((t) => ({ file: "user/u02s", at: S(t), volume: 0.24 })),
  { file: "user/u05", at: S(29.48), volume: 0.34 },
  { file: "user/u03", at: S(30.04), volume: 0.28 },
  ...[32.2, 32.4, 32.6, 33.36, 33.5].map((t) => ({ file: "user/u02s", at: S(t), volume: 0.18 })),
  { file: "user/u05s", at: S(34.98), volume: 0.28 },
  { file: "user/u03", at: S(35.34), volume: 0.28 },
  { file: "user/u05s", at: S(38.86), volume: 0.3 },
  { file: "user/u03", at: S(39.56), volume: 0.28 },
  ...Array.from({ length: 9 }).map((_, i) => ({ file: "user/u02s", at: S(R(41.5)) + i * 4, volume: 0.16 })),
  { file: "user/u05s", at: S(44.14), volume: 0.26 },
  { file: "user/u03s", at: S(45.9), volume: 0.24 },
  { file: "user/u03", at: S(47.66), volume: 0.28 },
  { file: "user/u05s", at: S(48.5), volume: 0.28 },
  { file: "user/u10", at: S(49.04), volume: 0.3 },
];

export const MILE_V2_FRAMES = S(50.1) + 20;
export const MileV2: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT }}>
    <Bg />
    <Audio src={staticFile("mile-narration.wav")} />
    <SfxTrack cues={CUES} />
    <S1 /><S2 /><S3 /><S4 /><S5 /><S6 /><S7 /><S8 />
    <S9 /><S10 /><S11 /><S12 /><S13 /><S14 />
    {/* ④ ライフプランのグラフ（既存）を新ナレの位置に置く */}
    <Sequence from={Math.round(R(35.32) * 30)}><LifeChart /><Equal /></Sequence>
    <ChapterChip />
    <Captions />
  </AbsoluteFill>
);
