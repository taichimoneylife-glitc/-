import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 年収の壁(2026)｜ツリー固定＋枝ごと展開（太一さん指定の型）
//   上に「年収の壁→税金/社会保険/扶養」のツリーを固定表示し、
//   説明中の枝をハイライト→その下に詳細を出す。カメラは動かさない。
//   流れ：①全体像ツリー ②税金(怖くない) ③扶養(怖くない) ④★社会保険(山場)
//         ⑤とはいえメリット ⑥まとめ(壁リスト＋やること2つ)
//   数字=2026出典(kabe_facts)。働き損/保険料は自前試算・目安(前提明記)。
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#FCFBF7", ink: "#1F3A5F", orange: "#E8912D", orangeBg: "#FBEBD4",
  red: "#E0483B", redBg: "#FCE6E3", green: "#2E9E6B", greenBg: "#E4F3EC",
  gray: "#AEB8C2", grayBg: "#EEF1F4", line: "#C9D2DD",
};
const CX = 540;

// 音声(kabe_narration.wav 84.15s)にページ単位で同期（文字数比＋ポーズアンカー）
const P = {
  intro: { from: 0, dur: 316 },     // フック＋4つの壁
  tax:   { from: 316, dur: 257 },   // ①税金
  fuyo:  { from: 573, dur: 133 },   // ②扶養
  shaho: { from: 706, dur: 776 },   // ③社会保険（山場）
  merit: { from: 1482, dur: 386 },  // ④メリット
  matome:{ from: 1868, dur: 424 },  // ⑤まとめ＋⑥やること
  end:   { from: 2292, dur: 232 },  // 締め
};
export const KABE_FRAMES = P.end.from + P.end.dur; // 2524 = 84.1s

// ── 共通アニメ（Sequence内でframeは0起点）──
const useSp = (delay: number, dur = 14, cfg: Parameters<typeof spring>[0]["config"] = { damping: 14, stiffness: 150, mass: 0.8 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};
const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useSp(delay, 12, { damping: 13, stiffness: 150, mass: 0.7 });
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
const Drop: React.FC<{ delay: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, dy = -30, style, children }) => {
  const s = useSp(delay, 16, { damping: 15 });
  return <div style={{ opacity: Math.min(1, s * 1.8), transform: `translateY(${(1 - s) * dy}px)`, ...style }}>{children}</div>;
};
const Draw: React.FC<{ d: string; delay: number; dur?: number; color?: string; w?: number }> = ({ d, delay, dur = 10, color = C.line, w = 4 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />;
};
const Wall: React.FC<{ s?: number; color?: string }> = ({ s = 56, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><rect x="5" y="10" width="38" height="30" rx="3" fill="none" stroke={color} strokeWidth="3" /><line x1="5" y1="20" x2="43" y2="20" stroke={color} strokeWidth="2.5" /><line x1="5" y1="30" x2="43" y2="30" stroke={color} strokeWidth="2.5" /><line x1="24" y1="10" x2="24" y2="20" stroke={color} strokeWidth="2.5" /><line x1="14" y1="20" x2="14" y2="30" stroke={color} strokeWidth="2.5" /><line x1="34" y1="20" x2="34" y2="30" stroke={color} strokeWidth="2.5" /><line x1="24" y1="30" x2="24" y2="40" stroke={color} strokeWidth="2.5" /></svg>
);
const pageFade = (f: number, dur: number) => interpolate(f, [0, 8, dur - 10, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ── 誤解回収（✕→○）行 ──
const Myth: React.FC<{ x: string; o: string; delay: number }> = ({ x, o, delay }) => (
  <Drop delay={delay} dy={-16} style={{ marginTop: 14 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", border: `2px solid ${C.gray}`, borderRadius: 10, padding: "8px 16px" }}>
        <span style={{ color: C.gray, fontWeight: 900, fontSize: 24 }}>✕</span>
        <span style={{ color: C.gray, fontWeight: 800, fontSize: 22, textDecoration: "line-through" }}>{x}</span>
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.greenBg, border: `2px solid ${C.green}`, borderRadius: 10, padding: "8px 16px" }}>
        <span style={{ color: C.green, fontWeight: 900, fontSize: 24 }}>○</span>
        <span style={{ color: C.ink, fontWeight: 900, fontSize: 23 }}>{o}</span>
      </div>
    </div>
  </Drop>
);

// ── 固定ツリー見出し（active枝をハイライト）──
const BR = [
  { key: "tax", t: "税金", s: "本人の税金", c: C.orange },
  { key: "shaho", t: "社会保険", s: "手取りに直結", c: C.red },
  { key: "fuyo", t: "扶養", s: "家族の税金", c: C.ink },
];
const BX = [250, 540, 830];
const TreeHeader: React.FC<{ active?: string; animate?: boolean }> = ({ active = "", animate = false }) => (
  <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 520 }}>
    <Drop delay={animate ? 0 : -100} style={{ position: "absolute", top: 70, left: 0, width: 1080, textAlign: "center" }}>
      <span style={{ fontSize: 48, fontWeight: 900, color: C.ink, borderBottom: `6px solid ${C.orange}`, paddingBottom: 4 }}>年収の壁</span>
      <div style={{ fontSize: 22, fontWeight: 900, color: C.orange, marginTop: 8 }}>2026年版・こう変わった</div>
    </Drop>
    <svg width={1080} height={520} style={{ position: "absolute", inset: 0 }}>
      <Draw d={`M${CX} 210 L${CX} 270 M250 270 L830 270 M250 270 L250 330 M540 270 L540 330 M830 270 L830 330`} delay={animate ? 10 : -100} dur={animate ? 16 : 1} color={C.orange} />
    </svg>
    {BR.map((b, i) => {
      const on = active === b.key || active === "all" || active === "";
      const dim = active && active !== "all" && active !== b.key;
      return (
        <Pop key={b.key} delay={animate ? 24 + i * 8 : -100} style={{ position: "absolute", top: 340, left: BX[i] - 140, width: 280, textAlign: "center", opacity: dim ? 0.4 : 1 }}>
          <div style={{ background: on && dim ? "#fff" : dim ? "#fff" : (active === b.key ? b.c + "14" : "#fff"), border: `${active === b.key ? 5 : 3}px solid ${dim ? C.line : b.c}`, borderRadius: 18, padding: "16px 8px 14px", boxShadow: dim ? "none" : "0 6px 16px rgba(31,58,95,0.10)" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Wall s={46} color={dim ? C.gray : b.c} /></div>
            <div style={{ fontSize: 30, fontWeight: 900, color: dim ? C.gray : C.ink, marginTop: 2 }}>{b.t}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: dim ? C.gray : b.c }}>{b.s}</div>
          </div>
        </Pop>
      );
    })}
  </div>
);

// ───────────── ① 全体像ツリー ─────────────
const PageIntro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.intro.dur) }}>
      <TreeHeader active="all" animate />
      <Drop delay={44} style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          {[{ n: "119・178万", c: C.orange }, { n: "130万・週20h", c: C.red }, { n: "136・169万", c: C.ink }].map((x, i) => (
            <span key={i} style={{ fontSize: 22, fontWeight: 900, color: "#fff", background: x.c, borderRadius: 999, padding: "6px 14px" }}>{x.n}</span>
          ))}
        </div>
      </Drop>
      <Drop delay={60} style={{ position: "absolute", top: 700, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 46, fontWeight: 900, color: C.ink, lineHeight: 1.4 }}>壁は色々あるけど、<br />本当に大事なのは<span style={{ color: C.red }}>130万だけ</span></div>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.gray, marginTop: 16 }}>1つずつ、仕分けていきましょう</div>
      </Drop>
    </AbsoluteFill>
  );
};

// ───────────── ② 税金の枝（怖くない）─────────────
const PageTax: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.tax.dur) }}>
      <TreeHeader active="tax" />
      <div style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center" }}>
        <Pop delay={6} style={{ display: "inline-block" }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 999, padding: "6px 22px" }}>そんなに怖くない壁</span>
        </Pop>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, marginTop: 20 }}>
          <Pop delay={14} style={{ position: "relative" }}><span style={{ fontSize: 44, fontWeight: 900, color: C.gray }}>103万</span><div style={{ position: "absolute", top: "48%", left: -4, right: -4, height: 6, background: C.red, transform: "rotate(-9deg)" }} /></Pop>
          <Pop delay={22}><span style={{ fontSize: 30, color: C.gray }}>→</span></Pop>
          <Pop delay={28} style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800, color: C.gray }}>去年</div><span style={{ fontSize: 48, fontWeight: 900, color: C.gray }}>160万</span></Pop>
          <Pop delay={34}><span style={{ fontSize: 30, color: C.orange }}>→</span></Pop>
          <Pop delay={40} style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, color: C.orange }}>今年2026</div><span style={{ fontSize: 86, fontWeight: 900, color: C.orange, lineHeight: 1 }}>178万</span></Pop>
        </div>
        <Drop delay={52} style={{ marginTop: 18 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>超えても、超えた分に少しかかるだけ</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.ink, marginTop: 4 }}>年収<span style={{ color: C.orange }}>170万</span>でも所得税は<span style={{ color: C.orange }}>ほぼ0円</span></div>
        </Drop>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
          <Myth x="178万まで何もかからない" o="それは所得税だけ。住民税は119万円前後から" delay={64} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.gray, marginTop: 20 }}>※住民税は自治体や家族構成などによって異なります</div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────── ③ 扶養の枝（怖くない）─────────────
const PageFuyo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.fuyo.dur) }}>
      <TreeHeader active="fuyo" />
      <div style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center" }}>
        <Pop delay={6} style={{ display: "inline-block" }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 999, padding: "6px 22px" }}>これも怖くない壁</span>
        </Pop>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.gray, marginTop: 14 }}>これは“夫の税金”が減る話</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 16 }}>
          <Pop delay={16} style={{ textAlign: "center" }}><span style={{ fontSize: 68, fontWeight: 900, color: C.ink }}>136万</span><div style={{ fontSize: 22, fontWeight: 800, color: C.gray }}>配偶者控除は満額</div></Pop>
          <Pop delay={24}><span style={{ fontSize: 30, color: C.gray }}>→</span></Pop>
          <Pop delay={30} style={{ textAlign: "center" }}><span style={{ fontSize: 68, fontWeight: 900, color: C.ink }}>169万</span><div style={{ fontSize: 22, fontWeight: 800, color: C.gray }}>特別控除で満額</div></Pop>
        </div>
        <Drop delay={42} style={{ marginTop: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: C.ink, background: C.grayBg, borderRadius: 12, padding: "10px 22px" }}>超えても、夫の税金が少しずつ増えるだけ</span>
        </Drop>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <Myth x="税金の壁が上がったから130万も上がった" o="社保の130万は据え置き。別物です" delay={54} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.gray, marginTop: 20 }}>※夫の所得などによって控除額は異なります</div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────── ④ ★社会保険の枝（山場）─────────────
const PageShaho: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.shaho.dur) }}>
      <TreeHeader active="shaho" />
      <div style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center" }}>
        <Pop delay={6} style={{ display: "inline-block" }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 999, padding: "7px 26px" }}>★ 本当に怖い壁</span>
        </Pop>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 18 }}>
          <Pop delay={16} style={{ position: "relative" }}><span style={{ fontSize: 40, fontWeight: 900, color: C.gray }}>106万</span><div style={{ position: "absolute", top: "48%", left: -4, right: -4, height: 5, background: C.red, transform: "rotate(-9deg)" }} /></Pop>
          <Pop delay={22}><span style={{ fontSize: 24, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 999, padding: "5px 14px" }}>2026年10月 撤廃</span></Pop>
        </div>
        <Drop delay={30} style={{ marginTop: 10 }}><div style={{ fontSize: 28, fontWeight: 900, color: C.ink }}>51人以上の会社<span style={{ fontSize: 22, color: C.gray }}>などで</span> <span style={{ color: C.red }}>週20時間以上</span>で加入</div></Drop>
        <Pop delay={44} style={{ marginTop: 18 }}>
          <div style={{ display: "inline-block", background: C.redBg, border: `5px solid ${C.red}`, borderRadius: 20, padding: "18px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <span style={{ fontSize: 68, fontWeight: 900, color: C.red, lineHeight: 1 }}>130万</span>
              <div style={{ textAlign: "left" }}><div style={{ fontSize: 28, fontWeight: 900, color: C.ink }}>夫の扶養から</div><div style={{ fontSize: 28, fontWeight: 900, color: C.red }}>外れることがある</div></div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.ink, marginTop: 12, lineHeight: 1.35 }}>入れない場合は、国民年金や<br />国保を<span style={{ color: C.red }}>自分で払う</span>ことに</div>
          </div>
        </Pop>
        <Drop delay={62} style={{ marginTop: 16 }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>収入は増えても、保険料で</div>
          <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 12, padding: "10px 26px", display: "inline-block", marginTop: 6 }}>手取りが思ったほど増えない</span>
        </Drop>
        <div style={{ fontSize: 19, fontWeight: 700, color: C.gray, marginTop: 14, lineHeight: 1.5 }}>※社会保険の加入にはその他の要件があります。勤務先の社保に入れる人もいます</div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────── ⑤ とはいえ：メリット（ポンポン）─────────────
const PageMerit: React.FC = () => {
  const f = useCurrentFrame();
  const items = [
    { t: "将来もらえる年金が増える", sub: "基礎年金＋厚生年金の2階建て", i: "1" },
    { t: "働けないとき、お金がもらえる", sub: "病気・ケガのとき＝傷病手当金", i: "2" },
    { t: "出産で休むときも手当がもらえる", sub: "出産手当金", i: "3" },
    { t: "万一のとき、家族の保障も手厚い", sub: "障害・遺族年金", i: "4" },
  ];
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.merit.dur) }}>
      <Drop delay={0} style={{ position: "absolute", top: 260, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.green }}>とはいえ…</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: C.ink, marginTop: 4 }}>社保に入るメリットは<span style={{ color: C.green }}>4つ</span></div>
      </Drop>
      <div style={{ position: "absolute", top: 440, left: 0, width: 1080 }}>
        {items.map((it, i) => (
          <Drop key={i} delay={12 + i * 13} dy={-24} style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, width: 860, background: C.greenBg, border: `4px solid ${C.green}`, borderRadius: 18, padding: "16px 26px" }}>
              <span style={{ width: 56, height: 56, borderRadius: "50%", background: C.green, color: "#fff", fontSize: 30, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{it.i}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: C.ink, lineHeight: 1.15 }}>{it.t}</div>
                <div style={{ fontSize: 21, fontWeight: 800, color: C.green, marginTop: 3 }}>{it.sub}</div>
              </div>
            </div>
          </Drop>
        ))}
      </div>
      <Drop delay={78} style={{ position: "absolute", top: 1230, left: 90, width: 900, textAlign: "center" }}>
        <span style={{ fontSize: 27, fontWeight: 900, color: C.ink, background: C.orangeBg, borderRadius: 12, padding: "12px 24px" }}>国民健康保険には、原則こうした手当はない</span>
        <div style={{ fontSize: 19, fontWeight: 700, color: C.gray, marginTop: 14 }}>※各手当には支給要件があります</div>
      </Drop>
    </AbsoluteFill>
  );
};

// ───────────── ⑥ まとめ：壁リスト＋やること2つ ─────────────
const WALLS = [
  { amt: "週20h〜", tag: "社保", desc: "会社の社保に入る", c: C.red },
  { amt: "119万", tag: "税金", desc: "住民税がかかる目安", c: C.orange },
  { amt: "130万", tag: "社保", desc: "扶養を外れることも（★一番注意）", c: C.red, star: true },
  { amt: "136万", tag: "扶養", desc: "夫の控除（169万まで満額）", c: C.ink },
  { amt: "178万", tag: "税金", desc: "本人の所得税がかかる目安", c: C.orange },
];
const PageMatome: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.matome.dur) }}>
      <Drop delay={0} style={{ position: "absolute", top: 90, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: C.ink }}>まとめると、<span style={{ color: C.orange }}>こんな感じ</span></span>
      </Drop>
      <div style={{ position: "absolute", top: 210, left: 70, width: 940 }}>
        {WALLS.map((w, i) => (
          <Drop key={i} delay={10 + i * 9} dy={-22} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, background: w.star ? C.redBg : "#fff", border: `${w.star ? 5 : 3}px solid ${w.c}`, borderRadius: 16, padding: "13px 20px", boxShadow: "0 5px 14px rgba(31,58,95,0.07)" }}>
              <div style={{ minWidth: 175, textAlign: "center", fontSize: w.star ? 50 : 42, fontWeight: 900, color: w.c, lineHeight: 1 }}>{w.amt}</div>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", background: w.c, borderRadius: 6, padding: "2px 9px" }}>{w.tag}</span>
              <span style={{ fontSize: w.star ? 31 : 28, fontWeight: 900, color: C.ink }}>{w.desc}</span>
            </div>
          </Drop>
        ))}
      </div>
      <Drop delay={70} style={{ position: "absolute", top: 1070, left: 70, width: 940 }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", background: C.ink, borderRadius: 12, padding: "10px 0", textAlign: "center", marginBottom: 16 }}>やることは、2つだけ</div>
        {[
          { n: "1", t: "勤め先の社保の条件を確認", s: "週20時間・51人以上に当てはまる？" },
          { n: "2", t: "130万を超えるなら、どう超えるか", s: "少し超えるより、手取りがしっかり増えるまで" },
        ].map((x, i) => (
          <Drop key={i} delay={80 + i * 12} dy={-18} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.orangeBg, border: `3px solid ${C.orange}`, borderRadius: 14, padding: "14px 20px" }}>
              <span style={{ width: 48, height: 48, borderRadius: "50%", background: C.orange, color: "#fff", fontSize: 28, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{x.n}</span>
              <div style={{ textAlign: "left" }}><div style={{ fontSize: 28, fontWeight: 900, color: C.ink }}>{x.t}</div><div style={{ fontSize: 20, fontWeight: 800, color: C.gray }}>{x.s}</div></div>
            </div>
          </Drop>
        ))}
      </Drop>
    </AbsoluteFill>
  );
};

// ───────────── 締め（CTA）─────────────
const PageEnd: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.end.dur) }}>
      <Pop delay={6} style={{ position: "absolute", top: 440, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 40, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 16, padding: "16px 30px", display: "inline-block" }}>「壁を超えない」が正解じゃない</span>
      </Pop>
      <Drop delay={24} style={{ position: "absolute", top: 660, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: C.ink, lineHeight: 1.5 }}>世帯全体の<span style={{ color: C.orange }}>手取りと保障</span>で<br />働き方を決めよう</span>
      </Drop>
      <Drop delay={44} style={{ position: "absolute", top: 1020, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: "#fff", background: C.ink, borderRadius: 999, padding: "16px 42px" }}>気になる人は、プロフから相談を</span>
      </Drop>
    </AbsoluteFill>
  );
};

export const KabeReel: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
    <Audio src={staticFile("kabe_narration.wav")} />
    <Sequence from={P.intro.from} durationInFrames={P.intro.dur}><PageIntro /></Sequence>
    <Sequence from={P.tax.from} durationInFrames={P.tax.dur}><PageTax /></Sequence>
    <Sequence from={P.fuyo.from} durationInFrames={P.fuyo.dur}><PageFuyo /></Sequence>
    <Sequence from={P.shaho.from} durationInFrames={P.shaho.dur}><PageShaho /></Sequence>
    <Sequence from={P.merit.from} durationInFrames={P.merit.dur}><PageMerit /></Sequence>
    <Sequence from={P.matome.from} durationInFrames={P.matome.dur}><PageMatome /></Sequence>
    <Sequence from={P.end.from} durationInFrames={P.end.dur}><PageEnd /></Sequence>
  </AbsoluteFill>
);
