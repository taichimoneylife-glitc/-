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
// ── マーカー強調（数字の下をいつものマーカーでスッと引く）──
const MarkNum: React.FC<{ delay: number; color?: string; dur?: number; children: React.ReactNode }> = ({ delay, color = C.orange, dur = 11, children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 8px" }}>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <span style={{ position: "absolute", left: 0, right: 0, bottom: 8, height: "32%", background: color, opacity: 0.34, transform: `scaleX(${p})`, transformOrigin: "left center", borderRadius: 6, zIndex: 0 }} />
    </span>
  );
};

// ── シーン切替（Beat）：山場など情報量が多い所を1枚に詰めず、パッと切り替える ──
const BeatInner: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6, dur - 8, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
const Beat: React.FC<{ from: number; dur: number; children: React.ReactNode }> = ({ from, dur, children }) => (
  <Sequence from={from} durationInFrames={dur}><BeatInner dur={dur}>{children}</BeatInner></Sequence>
);

const NumCircle: React.FC<{ delay: number; children: React.ReactNode; cw?: number; ch?: number; color?: string }> = ({ delay, children, cw = 250, ch = 118, color = C.orange }) => (
  <div style={{ position: "relative", display: "inline-block", padding: "2px 10px" }}>
    {children}
    <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}><CircleMark delay={delay} w={cw} h={ch} color={color} /></div>
  </div>
);
const PageTax: React.FC = () => {
  const f = useCurrentFrame();
  const cols = [
    { img: "kabe_wall_resident", t: "住民税", n: "119万", suf: "前後", delay: 0.70 },
    { img: "kabe_wall_income", t: "所得税", n: "178万", suf: "", delay: 2.90 },
  ];
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.tax.dur) }}>
      <TreeHeader active="tax" />
      <div style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center" }}>
        <Pop delay={d(0.2, "tax")} style={{ display: "inline-block" }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 999, padding: "8px 28px" }}>まずは税金の壁</span>
        </Pop>
        <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 20, alignItems: "flex-end" }}>
          {cols.map((c) => (
            <div key={c.t} style={{ width: 400 }}>
              <GenImg name={c.img} w={230} delay={d(c.delay, "tax")} style={{ margin: "0 auto", display: "block" }} />
              <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, marginTop: 4 }}>{c.t}</div>
              <div style={{ marginTop: 2 }}>
                <MarkNum delay={d(c.delay + 0.35, "tax")} color={C.orange}>
                  <span style={{ fontSize: 84, fontWeight: 900, color: C.orange, lineHeight: 1.05 }}>{c.n}</span>
                </MarkNum>
                {c.suf && <span style={{ fontSize: 30, fontWeight: 900, color: C.orange }}>{c.suf}</span>}
              </div>
            </div>
          ))}
        </div>
        {/* 「超えると税金がかかり始める」：4.52s ＋ブレース線 */}
        <Drop delay={d(4.52, "tax")} style={{ marginTop: 18 }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: C.ink }}>超えると、<Hi delay={d(4.9, "tax")} color={C.orange}>税金がかかり始める</Hi></span>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}><Brace delay={d(5.0, "tax")} w={420} color={C.orange} /></div>
        </Drop>
        {/* 「でも少し超えても→気にしなくてOK」：6.70s ＋コインが軽く */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 20 }}>
          <Drop delay={d(6.70, "tax")}>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.ink, lineHeight: 1.4 }}>でも、少し超えても<br />そんなにかからない</div>
          </Drop>
          <GenImg name="kabe_tax_light" w={150} delay={d(7.0, "tax")} />
        </div>
        <Drop delay={d(8.4, "tax")} style={{ marginTop: 14 }}>
          <span style={{ display: "inline-block", fontSize: 42, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 14, padding: "12px 32px" }}>ここまでは気にしなくてOK</span>
        </Drop>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.gray, marginTop: 30 }}>※住民税は自治体や家族構成などによって異なります</div>
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
      <div style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center" }}>
        <Pop delay={d(10.3, "fuyo")} style={{ display: "inline-block" }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 999, padding: "8px 28px" }}>次に、扶養の壁</span>
        </Pop>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.gray, marginTop: 10 }}>これは“夫の税金”が減る話</div>
        {/* 夫婦イラスト＋169万（丸囲み）：11.00s */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 10 }}>
          <GenImg name="kabe_wall_fuyo" w={300} delay={d(11.0, "fuyo")} />
          <Pop delay={d(11.0, "fuyo")}>
            <div style={{ background: C.greenBg, border: `5px solid ${C.green}`, borderRadius: 24, padding: "22px 30px" }}>
              <MarkNum delay={d(11.5, "fuyo")} color={C.green}>
                <span style={{ fontSize: 92, fontWeight: 900, color: C.ink, lineHeight: 1 }}>169万</span>
              </MarkNum>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.green }}>まで</div>
            </div>
          </Pop>
        </div>
        <Drop delay={d(12.6, "fuyo")} style={{ marginTop: 6 }}>
          <span style={{ fontSize: 44, fontWeight: 900, color: C.ink }}>夫の税金は<Hi delay={d(13.0, "fuyo")} color={C.green}>増えない</Hi></span>
        </Drop>
        {/* 超えても少しずつ：14.66s */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 24 }}>
          <GenImg name="kabe_husband_tax_same" w={210} delay={d(14.66, "fuyo")} />
          <Drop delay={d(14.66, "fuyo")}>
            <span style={{ fontSize: 34, fontWeight: 900, color: C.ink, background: C.grayBg, borderRadius: 14, padding: "14px 26px" }}>超えても、<br />少しずつ増えるだけ</span>
          </Drop>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.gray, marginTop: 30 }}>※夫の所得などによって控除額は異なります</div>
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
// 山場は情報量が多いので「1枚詰め込み」をやめ、ナレに合わせてシーンをパッと切替。
const ShahoStrike: React.FC = () => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [118, 128], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 900, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
      <Pop delay={46} style={{ position: "relative" }}>
        <span style={{ fontSize: 76, fontWeight: 900, color: C.gray }}>106万の壁</span>
        <div style={{ position: "absolute", top: "50%", left: -8, width: `${strike * 100}%`, height: 8, background: C.red, transform: "rotate(-7deg)", transformOrigin: "left center" }} />
      </Pop>
      <Pop delay={118}>
        <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 999, padding: "10px 24px" }}>この10月に撤廃</span>
      </Pop>
    </div>
  );
};
const PageShaho: React.FC = () => {
  const f = useCurrentFrame();
  const B = { A: 135, B: 153, C: 291, D: 213, E: 241 };
  const fr = { A: 0, B: 135, C: 288, D: 579, E: 792 };
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.shaho.dur) }}>
      <TreeHeader active="shaho" />
      {/* ── シーン①：106万の壁は撤廃（16.5〜21.0s）── */}
      <Beat from={fr.A} dur={B.A}>
        <Pop delay={10} style={{ position: "absolute", top: 640, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 999, padding: "10px 34px" }}>★ 本当に気をつける壁</span>
        </Pop>
        <ShahoStrike />
      </Beat>
      {/* ── シーン②：加入の条件（21.0〜26.1s）── */}
      <Beat from={fr.B} dur={B.B}>
        <Drop delay={0} style={{ position: "absolute", top: 620, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: C.ink }}>こんな働き方だと<span style={{ color: C.red }}>社保に加入</span></span>
        </Drop>
        <div style={{ position: "absolute", top: 760, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 36 }}>
          <Pop delay={24} style={{ textAlign: "center" }}>
            <GenImg name="kabe_company_building" w={180} delay={24} />
            <div style={{ fontSize: 40, fontWeight: 900, color: C.red, marginTop: 6 }}>51人以上</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.gray }}>の会社など</div>
          </Pop>
          <Pop delay={60}><span style={{ fontSize: 44, fontWeight: 900, color: C.ink }}>＋</span></Pop>
          <Pop delay={75} style={{ textAlign: "center" }}>
            <GenImg name="kabe_clock_20h" w={190} delay={75} />
            <div style={{ fontSize: 40, fontWeight: 900, color: C.red, marginTop: 6 }}>週20時間〜</div>
          </Pop>
        </div>
        <Drop delay={120} style={{ position: "absolute", top: 1110, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 14, padding: "12px 34px" }}>→ 社会保険に加入</span>
        </Drop>
      </Beat>
      {/* ── シーン③：130万で夫の扶養から外れる（26.1〜35.8s）── */}
      <Beat from={fr.C} dur={B.C}>
        <Pop delay={0} style={{ position: "absolute", top: 600, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 96, fontWeight: 900, color: C.red, lineHeight: 1 }}><MarkNum delay={10} color={C.red}>130万</MarkNum>の壁</span>
        </Pop>
        <Drop delay={62} style={{ position: "absolute", top: 740, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: C.ink, background: "#fff", border: `2px dashed ${C.red}`, borderRadius: 10, padding: "7px 18px" }}>税金の扶養とは別の“社会保険の扶養”</span>
        </Drop>
        <GenImg name="kabe_leave_fuyo" w={330} delay={164} style={{ position: "absolute", top: 820, left: 180 }} />
        <Drop delay={164} style={{ position: "absolute", top: 940, left: 520, width: 460, textAlign: "left" }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.ink }}>夫の扶養から</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: C.red, marginTop: 6 }}>外れることがある</div>
        </Drop>
      </Beat>
      {/* ── シーン④：外れると自分で払う（35.8〜42.9s）── */}
      <Beat from={fr.D} dur={B.D}>
        <Drop delay={0} style={{ position: "absolute", top: 600, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 30, fontWeight: 800, color: C.gray }}>今まで保険料はかからなかったけど…</span>
        </Drop>
        <GenImg name="kabe_nenkin_kokuho_paper" w={300} delay={12} style={{ position: "absolute", top: 700, left: 0, right: 0, margin: "0 auto" }} />
        <Drop delay={20} style={{ position: "absolute", top: 1070, left: 0, width: 1080, textAlign: "center" }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: C.ink, lineHeight: 1.35 }}>外れると<Hi delay={40} color={C.red}>国民年金・国保</Hi>を<br /><span style={{ color: C.red }}>自分で払う</span>ことに</div>
        </Drop>
      </Beat>
      {/* ── シーン⑤：手取りへの影響が大きい（42.9〜50.94s）── */}
      <Beat from={fr.E} dur={B.E}>
        <Drop delay={0} style={{ position: "absolute", top: 600, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: C.ink }}>ここが税金との大きな違い</span>
        </Drop>
        <div style={{ position: "absolute", top: 690, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 20 }}>
          <Pop delay={8} style={{ width: 300, background: C.orangeBg, borderRadius: 16, padding: "18px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.orange }}>税金</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: C.ink }}>少しずつ</div>
          </Pop>
          <Pop delay={20} style={{ width: 360, background: C.redBg, border: `3px solid ${C.red}`, borderRadius: 16, padding: "18px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.red }}>社会保険</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>保険料の負担が生まれる</div>
          </Pop>
        </div>
        <GenImg name="kabe_takehome_down" w={230} delay={55} style={{ position: "absolute", top: 870, left: 0, right: 0, margin: "0 auto" }} />
        <Drop delay={55} style={{ position: "absolute", top: 1110, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 46, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 16, padding: "14px 36px", display: "inline-block" }}>手取りへの影響が大きい</span>
          <div style={{ fontSize: 19, fontWeight: 700, color: C.gray, marginTop: 16 }}>※加入にはその他の要件があります。勤務先の社保に入れる場合もあります</div>
        </Drop>
      </Beat>
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
    { sec: 53.52, img: "kabe_merit_pension_up", t: "将来もらえる年金が増える", sub: "基礎年金＋厚生年金の2階建て" },
    { sec: 55.18, img: "kabe_merit_sick", t: "働けないとき、お金がもらえる", sub: "病気・ケガのとき＝傷病手当金" },
    { sec: 57.52, img: "kabe_merit_birth", t: "出産で休むときも手当がもらえる", sub: "出産手当金" },
    { sec: 60.06, img: "kabe_merit_family_guard", t: "万一のとき、家族の保障も手厚い", sub: "障害・遺族年金" },
  ];
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.merit.dur) }}>
      <Drop delay={d(50.94, "merit")} style={{ position: "absolute", top: 230, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: C.green }}>とはいえ…</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: C.ink, marginTop: 6 }}>社保に入るメリットは<span style={{ color: C.green }}>4つ</span></div>
      </Drop>
      <div style={{ position: "absolute", top: 410, left: 0, width: 1080 }}>
        {items.map((it, i) => (
          <Drop key={i} delay={d(it.sec, "merit")} dy={-24} style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, width: 820, background: C.greenBg, border: `4px solid ${C.green}`, borderRadius: 20, padding: "14px 24px" }}>
              <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GenImg name={it.img} w={120} delay={d(it.sec, "merit")} float={5} style={{ maxHeight: 120 }} />
                <span style={{ position: "absolute", left: -6, top: -6, width: 42, height: 42, borderRadius: "50%", background: C.green, color: "#fff", fontSize: 24, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 35, fontWeight: 900, color: C.ink, lineHeight: 1.15 }}>{it.t}</div>
                <div style={{ fontSize: 23, fontWeight: 800, color: C.green, marginTop: 4 }}>{it.sub}</div>
              </div>
            </div>
          </Drop>
        ))}
      </div>
      <Drop delay={d(61.5, "merit")} style={{ position: "absolute", top: 1130, left: 140, width: 800, textAlign: "center" }}>
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
              <div style={{ minWidth: 220, textAlign: "center", lineHeight: 1 }}>
                {w.star ? (
                  <MarkNum delay={d(w.sec + 0.5, "matome")} color={C.red}>
                    <span style={{ fontSize: 60, fontWeight: 900, color: w.c }}>{w.amt}</span>
                  </MarkNum>
                ) : (
                  <span style={{ fontSize: 52, fontWeight: 900, color: w.c }}>{w.amt}</span>
                )}
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", background: w.c, borderRadius: 7, padding: "3px 12px" }}>{w.tag}</span>
              <span style={{ fontSize: w.star ? 34 : 31, fontWeight: 900, color: C.ink, textAlign: "left" }}>{w.desc}</span>
            </div>
          </Drop>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1010, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
        <GenImg name="kabe_family_money_guard" w={150} delay={d(80.5, "matome")} />
        <Drop delay={d(80.20, "matome")}>
          <span style={{ fontSize: 36, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 14, padding: "14px 32px" }}>一番影響するのは、社会保険</span>
        </Drop>
      </div>
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
