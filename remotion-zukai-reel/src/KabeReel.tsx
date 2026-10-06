import React from "react";
import { AbsoluteFill, Sequence, Audio, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 年収の壁(2026)｜ツリー固定＋枝ごと展開（太一さん指定の型）
//   ★ 実ナレーション(kabe_narration.wav 84.15s)を faster-whisper で
//     語単位に文字起こしし、各要素の出現を「声の位置」に合わせた版。
//   音声の中身＝図解5パートのみ（冒頭/締めトークは実写で別付け）：
//     ①税金 0.00s / ②扶養 10.14s / ③社会保険(山場) 16.50s /
//     ④メリット 50.94s / ⑤まとめ 63.18s（〜84.15s）
//   数字=2026出典(kabe_facts)。ことがある/目安/など＝ナレ通りの言い回し。
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#FCFBF7", ink: "#1F3A5F", orange: "#E8912D", orangeBg: "#FBEBD4",
  red: "#E0483B", redBg: "#FCE6E3", green: "#2E9E6B", greenBg: "#E4F3EC",
  gray: "#AEB8C2", grayBg: "#EEF1F4", line: "#C9D2DD",
};
const CX = 540;
const FPS = 30;
const s2f = (sec: number) => Math.round(sec * FPS);

// ── Instagramリール セーフゾーン ──
//   下キャプション帯：画面下 約420px(y≳1500)にアカウント名/キャプション/音源/シークバー
//   右いいね欄：右端 x≳940・縦 y≈950〜1680 に ♡💬📤🔖＋音源アイコン
//   ⇒ 重要要素は y≤1470 に収め、下段(y>950)は中央寄せ＆横幅を抑えて右端を避ける
const SAFE_BOTTOM = 1470;

// ── 音声アンカー（whisper語タイムスタンプ, 秒）→ ページ境界 ──
const A = {
  tax: 0.0,     // 「まず税金…」
  fuyo: 10.14,  // 「次に扶養…」
  shaho: 16.50, // 「そして問題が社会保険…」
  merit: 50.94, // 「とはいえメリットは大きく4つ…」
  matome: 63.18,// 「まとめると…」
  end: 84.15,   // 終端
};
const P = {
  tax:   { from: s2f(A.tax),    dur: s2f(A.fuyo)   - s2f(A.tax) },    // 0   .. 304
  fuyo:  { from: s2f(A.fuyo),   dur: s2f(A.shaho)  - s2f(A.fuyo) },   // 304 .. 495
  shaho: { from: s2f(A.shaho),  dur: s2f(A.merit)  - s2f(A.shaho) },  // 495 .. 1528
  merit: { from: s2f(A.merit),  dur: s2f(A.matome) - s2f(A.merit) },  // 1528.. 1895
  matome:{ from: s2f(A.matome), dur: s2f(A.end)    - s2f(A.matome) }, // 1895.. 2524
};
export const KABE_FRAMES = s2f(A.end); // 2524 = 84.15s

// 各ページ内の出現フレーム（ページ先頭=0起点）＝ 声の位置(秒)*30 - page.from
const d = (sec: number, page: keyof typeof P) => s2f(sec) - P[page].from;

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

// ── イラスト（透過PNG）：ポップイン＋ゆらぎフロート ──
const GenImg: React.FC<{ name: string; w: number; h?: number; delay?: number; float?: number; style?: React.CSSProperties }> = ({ name, w, h, delay = 0, float = 7, style }) => {
  const f = useCurrentFrame();
  const s = useSp(delay, 18, { damping: 12, stiffness: 120, mass: 0.9 });
  const fy = Math.sin((f - delay) / 24) * float;
  return <Img src={staticFile(`gen/${name}.png`)} style={{ width: w, height: h ?? "auto", objectFit: "contain", opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 22 + fy}px) scale(${0.9 + s * 0.1})`, ...style }} />;
};

// ── 手書き風の丸囲み（一筆書きの楕円を描き込む）──
const CircleMark: React.FC<{ delay: number; w?: number; h?: number; color?: string; sw?: number; rot?: number; dur?: number; style?: React.CSSProperties }> =
  ({ delay, w = 300, h = 150, color = C.red, sw = 7, rot = -4, dur = 15, style }) => {
    const f = useCurrentFrame();
    const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = w / 2, cy = h / 2, rx = w / 2 - sw, ry = h / 2 - sw;
    const d = `M ${cx + rx * 0.95} ${cy - ry * 0.22} C ${cx + rx * 1.05} ${cy - ry * 0.95}, ${cx - rx * 0.15} ${cy - ry * 1.12}, ${cx - rx * 0.8} ${cy - ry * 0.55} C ${cx - rx * 1.12} ${cy + ry * 0.2}, ${cx - rx * 0.35} ${cy + ry * 1.12}, ${cx + rx * 0.55} ${cy + ry * 0.85} C ${cx + rx * 1.1} ${cy + ry * 0.55}, ${cx + rx * 1.03} ${cy - ry * 0.25}, ${cx + rx * 0.82} ${cy - ry * 0.55}`;
    return (
      <svg width={w} height={h} style={{ transform: `rotate(${rot}deg)`, ...style }}>
        <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />
      </svg>
    );
  };

// ── ハイライト（インライン文字の背後をマーカーで引く）──
const Hi: React.FC<{ delay: number; color?: string; dur?: number; children: React.ReactNode }> = ({ delay, color = C.orange, dur = 12, children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ position: "absolute", left: -6, right: -6, bottom: 1, height: "44%", background: color, opacity: 0.3, transform: `scaleX(${p})`, transformOrigin: "left center", borderRadius: 4, zIndex: 0 }} />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};

// ── アンダーブレース（下に添える「ここ！」の括弧線）＋ラベル ──
const Brace: React.FC<{ delay: number; w: number; color?: string; dur?: number }> = ({ delay, w, color = C.ink, dur = 14 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const h = 26, mid = w / 2;
  const d = `M4 4 Q4 ${h - 6} ${mid - 14} ${h - 10} Q${mid} ${h - 6} ${mid} ${h} Q${mid} ${h - 6} ${mid + 14} ${h - 10} Q${w - 4} ${h - 6} ${w - 4} 4`;
  return (
    <svg width={w} height={h + 6}><path d={d} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} /></svg>
  );
};

// ── 描き込む矢印（エルボー＋先端）──
const ArrowDraw: React.FC<{ delay: number; d: string; head: [number, number, number]; color?: string; w?: number; dur?: number; vb: string; svgW: number; svgH: number; style?: React.CSSProperties }> =
  ({ delay, d, head, color = C.ink, w = 6, dur = 14, vb, svgW, svgH, style }) => {
    const f = useCurrentFrame();
    const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ha = interpolate(f, [delay + dur * 0.7, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const [hx, hy, rot] = head;
    return (
      <svg width={svgW} height={svgH} viewBox={vb} style={style}>
        <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />
        <path d={`M${hx - 16} ${hy - 11} L${hx} ${hy} L${hx - 16} ${hy + 11}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`rotate(${rot} ${hx} ${hy})`} opacity={ha} />
      </svg>
    );
  };
const pageFade = (f: number, dur: number) => interpolate(f, [0, 8, dur - 10, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
      const dim = active && active !== "all" && active !== b.key;
      return (
        <Pop key={b.key} delay={animate ? 24 + i * 8 : -100} style={{ position: "absolute", top: 340, left: BX[i] - 140, width: 280, textAlign: "center", opacity: dim ? 0.4 : 1 }}>
          <div style={{ background: active === b.key ? b.c + "14" : "#fff", border: `${active === b.key ? 5 : 3}px solid ${dim ? C.line : b.c}`, borderRadius: 18, padding: "16px 8px 14px", boxShadow: dim ? "none" : "0 6px 16px rgba(31,58,95,0.10)" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Wall s={46} color={dim ? C.gray : b.c} /></div>
            <div style={{ fontSize: 30, fontWeight: 900, color: dim ? C.gray : C.ink, marginTop: 2 }}>{b.t}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: dim ? C.gray : b.c }}>{b.s}</div>
          </div>
        </Pop>
      );
    })}
  </div>
);

// ───────────── ① 税金（0.00s〜）─────────────
// ナレ:「まず税金。住民税は119万円前後、所得税は178万円。これを超えると
//        税金がかかり始めます。でも少し超えてもそんなにかからないから、
//        ここまで気にしなくてOK」
const PageTax: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.tax.dur) }}>
      <TreeHeader active="tax" />
      <div style={{ position: "absolute", top: 580, left: 0, width: 1080, textAlign: "center" }}>
        <Pop delay={d(0.2, "tax")} style={{ display: "inline-block" }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 999, padding: "8px 28px" }}>まずは税金の壁</span>
        </Pop>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 40 }}>
          {/* 住民税119万前後：0.70s */}
          <Pop delay={d(0.70, "tax")} style={{ width: 380 }}>
            <div style={{ background: "#fff", border: `4px solid ${C.orange}`, borderRadius: 22, padding: "22px 10px 26px", boxShadow: "0 8px 20px rgba(31,58,95,0.10)" }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>住民税</div>
              <div style={{ fontSize: 86, fontWeight: 900, color: C.orange, lineHeight: 1.05 }}>119万<span style={{ fontSize: 34 }}>前後</span></div>
            </div>
          </Pop>
          {/* 所得税178万：2.90s */}
          <Pop delay={d(2.90, "tax")} style={{ width: 380 }}>
            <div style={{ background: "#fff", border: `4px solid ${C.orange}`, borderRadius: 22, padding: "22px 10px 26px", boxShadow: "0 8px 20px rgba(31,58,95,0.10)" }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>所得税</div>
              <div style={{ fontSize: 86, fontWeight: 900, color: C.orange, lineHeight: 1.05 }}>178万</div>
            </div>
          </Pop>
        </div>
        {/* 「超えると税金がかかり始める」：4.52s */}
        <Drop delay={d(4.52, "tax")} style={{ marginTop: 46 }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: C.ink }}>超えると、<span style={{ color: C.orange }}>税金がかかり始める</span></span>
        </Drop>
        {/* 「でも少し超えてもそんなに→ここまで気にしなくてOK」：6.70s */}
        <Drop delay={d(6.70, "tax")} style={{ marginTop: 34 }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: C.ink, lineHeight: 1.45 }}>でも、少し超えても<br />そんなにかからない</div>
          <span style={{ display: "inline-block", fontSize: 40, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 14, padding: "12px 30px", marginTop: 20 }}>ここまでは気にしなくてOK</span>
        </Drop>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.gray, marginTop: 44 }}>※住民税は自治体や家族構成などによって異なります</div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────── ② 扶養（10.14s〜）─────────────
// ナレ:「次に扶養。妻の収入が169万円までなら夫の税金は増えません。
//        超えても少しずつ増えるだけ」
const PageFuyo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.fuyo.dur) }}>
      <TreeHeader active="fuyo" />
      <div style={{ position: "absolute", top: 600, left: 0, width: 1080, textAlign: "center" }}>
        <Pop delay={d(10.3, "fuyo")} style={{ display: "inline-block" }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 999, padding: "8px 28px" }}>次に、扶養の壁</span>
        </Pop>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.gray, marginTop: 18 }}>これは“夫の税金”の話</div>
        {/* 169万まで夫の税金は増えない：11.00s */}
        <Pop delay={d(11.0, "fuyo")} style={{ marginTop: 40 }}>
          <div style={{ display: "inline-block", background: C.greenBg, border: `5px solid ${C.green}`, borderRadius: 24, padding: "28px 40px" }}>
            <div style={{ fontSize: 100, fontWeight: 900, color: C.ink, lineHeight: 1 }}>169万<span style={{ fontSize: 40 }}>まで</span></div>
            <div style={{ fontSize: 40, fontWeight: 900, color: C.green, marginTop: 10 }}>夫の税金は増えない</div>
          </div>
        </Pop>
        {/* 超えても少しずつ：14.66s */}
        <Drop delay={d(14.66, "fuyo")} style={{ marginTop: 44 }}>
          <span style={{ fontSize: 38, fontWeight: 900, color: C.ink, background: C.grayBg, borderRadius: 14, padding: "14px 30px" }}>超えても、少しずつ増えるだけ</span>
        </Drop>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.gray, marginTop: 44 }}>※夫の所得などによって控除額は異なります</div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────── ③ ★社会保険（山場, 16.50s〜）─────────────
// ナレ:「そして問題が社会保険。いわゆる106万円の壁は、この10月になくなりました。
//        これからは51人以上の会社などで週20時間以上働くと社会保険に加入。
//        もう一つが130万円の壁。ここで出てくる扶養は、さっきの税金とは別の
//        社会保険の扶養。130万円を超えると夫の社会保険の扶養から外れることが
//        あります。今までは夫の扶養で保険料はかかりませんでしたが、外れると
//        国民年金や国民健康保険を自分で払うことに。ここが税金との大きな違い。
//        税金は少しずつだけど、社会保険は新しい保険料の負担が生まれるので
//        手取りへの影響が大きいです」
const PageShaho: React.FC = () => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [d(20.44, "shaho"), d(20.44, "shaho") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.shaho.dur) }}>
      <TreeHeader active="shaho" />
      {/* badge */}
      <Pop delay={d(16.9, "shaho")} style={{ position: "absolute", top: 540, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 36, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 999, padding: "8px 30px" }}>★ 本当に気をつける壁</span>
      </Pop>
      {/* 106万の壁 → なくなった：18.04s / strike 20.44s */}
      <div style={{ position: "absolute", top: 624, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
        <Pop delay={d(18.04, "shaho")} style={{ position: "relative" }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: C.gray }}>106万の壁</span>
          <div style={{ position: "absolute", top: "50%", left: -6, width: `${strike * 100}%`, height: 6, background: C.red, transform: "rotate(-8deg)", transformOrigin: "left center" }} />
        </Pop>
        <Pop delay={d(20.44, "shaho")}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 999, padding: "8px 20px" }}>この10月に撤廃</span>
        </Pop>
      </div>
      {/* 51人以上・週20h → 加入：20.96s */}
      <Drop delay={d(20.96, "shaho")} style={{ position: "absolute", top: 712, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: C.ink }}>
          <span style={{ color: C.red }}>51人以上</span>の会社<span style={{ fontSize: 24, color: C.gray }}>など</span>で
          <span style={{ color: C.red }}> 週20時間以上</span> → 社保に加入
        </div>
      </Drop>
      {/* 130万の壁カード：26.10s（「税金とは別」28.16s）※y786〜970=いいね欄より上 */}
      <Pop delay={d(26.10, "shaho")} style={{ position: "absolute", top: 786, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: C.redBg, border: `6px solid ${C.red}`, borderRadius: 22, padding: "16px 34px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <span style={{ fontSize: 84, fontWeight: 900, color: C.red, lineHeight: 1 }}>130万</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: C.ink }}>夫の社会保険の扶養から</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: C.red }}>外れることがある</div>
            </div>
          </div>
          <Drop delay={d(28.16, "shaho")} style={{ marginTop: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: C.ink, background: "#fff", border: `2px dashed ${C.red}`, borderRadius: 10, padding: "6px 16px" }}>税金の扶養とは別の“社会保険の扶養”</span>
          </Drop>
        </div>
      </Pop>
      {/* 外れると自分で払う：35.82s（下段＝中央寄せの素テキストで右いいね欄を避ける） */}
      <Drop delay={d(35.82, "shaho")} style={{ position: "absolute", top: 1030, left: 140, width: 800, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.gray }}>今まで保険料はかからなかったけど…</div>
        <div style={{ fontSize: 38, fontWeight: 900, color: C.ink, marginTop: 8, lineHeight: 1.35 }}>外れると、<span style={{ color: C.red }}>国民年金・国保</span>を<br /><span style={{ color: C.red }}>自分で払う</span>ことに</div>
      </Drop>
      {/* 税金との違い＝保険料負担で手取り影響大：42.92s / 44.72s */}
      <Drop delay={d(42.92, "shaho")} style={{ position: "absolute", top: 1210, left: 160, width: 760, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.ink }}>ここが税金との大きな違い</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 12, alignItems: "stretch" }}>
          <div style={{ flex: 1, background: C.orangeBg, borderRadius: 14, padding: "12px 8px" }}><div style={{ fontSize: 22, fontWeight: 900, color: C.orange }}>税金</div><div style={{ fontSize: 24, fontWeight: 900, color: C.ink }}>少しずつ</div></div>
          <div style={{ flex: 1.3, background: C.redBg, border: `3px solid ${C.red}`, borderRadius: 14, padding: "12px 8px" }}><div style={{ fontSize: 22, fontWeight: 900, color: C.red }}>社会保険</div><div style={{ fontSize: 24, fontWeight: 900, color: C.ink }}>保険料の負担が生まれる</div></div>
        </div>
      </Drop>
      <Drop delay={d(44.72, "shaho")} style={{ position: "absolute", top: 1370, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 38, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 14, padding: "12px 30px", display: "inline-block" }}>手取りへの影響が大きい</span>
        <div style={{ fontSize: 19, fontWeight: 700, color: C.gray, marginTop: 14 }}>※加入にはその他の要件があります。勤務先の社保に入れる場合もあります</div>
      </Drop>
    </AbsoluteFill>
  );
};

// ───────────── ④ メリット（50.94s〜）─────────────
// ナレ:「とはいえ社会保険に入るメリットは大きく4つ。将来もらえる年金が増える。
//        病気やケガで働けないときに保証がある。出産で休むときにも手当がもらえる。
//        障害や万が一のときも家族への保証が手厚くなる」
const PageMerit: React.FC = () => {
  const f = useCurrentFrame();
  const items = [
    { sec: 53.52, t: "将来もらえる年金が増える", sub: "基礎年金＋厚生年金の2階建て" },
    { sec: 55.18, t: "働けないとき、お金がもらえる", sub: "病気・ケガのとき＝傷病手当金" },
    { sec: 57.52, t: "出産で休むときも手当がもらえる", sub: "出産手当金" },
    { sec: 60.06, t: "万一のとき、家族の保障も手厚い", sub: "障害・遺族年金" },
  ];
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.merit.dur) }}>
      <Drop delay={d(50.94, "merit")} style={{ position: "absolute", top: 300, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: C.green }}>とはいえ…</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: C.ink, marginTop: 6 }}>社保に入るメリットは<span style={{ color: C.green }}>4つ</span></div>
      </Drop>
      <div style={{ position: "absolute", top: 500, left: 0, width: 1080 }}>
        {items.map((it, i) => (
          <Drop key={i} delay={d(it.sec, "merit")} dy={-24} style={{ marginBottom: 26, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, width: 800, background: C.greenBg, border: `4px solid ${C.green}`, borderRadius: 18, padding: "20px 28px" }}>
              <span style={{ width: 62, height: 62, borderRadius: "50%", background: C.green, color: "#fff", fontSize: 34, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: C.ink, lineHeight: 1.15 }}>{it.t}</div>
                <div style={{ fontSize: 23, fontWeight: 800, color: C.green, marginTop: 4 }}>{it.sub}</div>
              </div>
            </div>
          </Drop>
        ))}
      </div>
      <Drop delay={d(61.5, "merit")} style={{ position: "absolute", top: 1180, left: 140, width: 800, textAlign: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: C.ink, background: C.orangeBg, borderRadius: 12, padding: "12px 24px" }}>国民健康保険には、原則こうした手当はない</span>
        <div style={{ fontSize: 19, fontWeight: 700, color: C.gray, marginTop: 14 }}>※各手当には支給要件があります</div>
      </Drop>
    </AbsoluteFill>
  );
};

// ───────────── ⑤ まとめ（63.18s〜）─────────────
// ナレ:「まとめると、51人以上の会社などで週20時間以上働くと社会保険に加入。
//        119万円前後で住民税がかかり始める目安。130万円を超えると夫の社会保険の
//        扶養から外れることがある。169万円までは条件を満たせば夫の控除は満額。
//        178万円を超えると本人の所得税がかかり始める目安」
const ROWS = [
  { sec: 63.96, amt: "週20h〜", tag: "社保", desc: "51人以上の会社などで加入", c: C.red },
  { sec: 68.86, amt: "119万", tag: "税金", desc: "住民税がかかり始める目安", c: C.orange },
  { sec: 72.24, amt: "130万", tag: "社保", desc: "夫の扶養から外れることがある", c: C.red, star: true },
  { sec: 76.26, amt: "169万", tag: "扶養", desc: "条件を満たせば夫の控除は満額", c: C.ink },
  { sec: 80.20, amt: "178万", tag: "税金", desc: "本人の所得税がかかり始める目安", c: C.orange },
];
const PageMatome: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.matome.dur) }}>
      <Drop delay={d(63.18, "matome")} style={{ position: "absolute", top: 160, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 52, fontWeight: 900, color: C.ink }}>まとめると、<span style={{ color: C.orange }}>この5つ</span></span>
      </Drop>
      <div style={{ position: "absolute", top: 340, left: 60, width: 960 }}>
        {ROWS.map((w, i) => (
          <Drop key={i} delay={d(w.sec, "matome")} dy={-22} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, background: w.star ? C.redBg : "#fff", border: `${w.star ? 6 : 3}px solid ${w.c}`, borderRadius: 18, padding: "18px 26px", boxShadow: "0 5px 14px rgba(31,58,95,0.07)" }}>
              <div style={{ minWidth: 220, textAlign: "center", fontSize: w.star ? 60 : 52, fontWeight: 900, color: w.c, lineHeight: 1 }}>{w.amt}</div>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", background: w.c, borderRadius: 7, padding: "3px 12px" }}>{w.tag}</span>
              <span style={{ fontSize: w.star ? 34 : 31, fontWeight: 900, color: C.ink, textAlign: "left" }}>{w.desc}</span>
            </div>
          </Drop>
        ))}
      </div>
      <Drop delay={d(80.20, "matome")} style={{ position: "absolute", top: 1040, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 14, padding: "14px 34px" }}>一番影響するのは、社会保険</span>
      </Drop>
    </AbsoluteFill>
  );
};

export const KabeReel: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
    <Audio src={staticFile("kabe_narration.wav")} />
    <Sequence from={P.tax.from} durationInFrames={P.tax.dur}><PageTax /></Sequence>
    <Sequence from={P.fuyo.from} durationInFrames={P.fuyo.dur}><PageFuyo /></Sequence>
    <Sequence from={P.shaho.from} durationInFrames={P.shaho.dur}><PageShaho /></Sequence>
    <Sequence from={P.merit.from} durationInFrames={P.merit.dur}><PageMerit /></Sequence>
    <Sequence from={P.matome.from} durationInFrames={P.matome.dur}><PageMatome /></Sequence>
  </AbsoluteFill>
);
