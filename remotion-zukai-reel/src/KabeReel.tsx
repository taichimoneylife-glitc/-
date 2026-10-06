import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 年収の壁(2026)｜ページ送り型（パートごとに図解の"型"を変える）
//   投資三大原則/がんと同系統。1ページ=1画面完結、型を変えてポンポン切替（カメラは動かさない）。
//   数字=2026(出典kabe_source)。働き損は自前試算(128→126/130超→108/約150回復・目安)。
//   ①全体像=3分岐ツリー ②税金=Before→After ③社保=分かれ道 ④★働き損=手取りカーブ(谷)
//   ⑤扶養=段階バー ⑥社保メリット=上→下ポンポン ⑦締め=一言+CTA
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#FCFBF7", ink: "#1F3A5F", orange: "#E8912D", orangeBg: "#FBEBD4",
  red: "#E0483B", redBg: "#FCE6E3", green: "#2E9E6B", greenBg: "#E4F3EC",
  gray: "#AEB8C2", grayBg: "#EEF1F4", line: "#C9D2DD",
};
const CX = 540;
const FPS = 30;

// ページ割り（frame）
const P = {
  zentai: { from: 0, dur: 130 },   // ①全体像
  tax:    { from: 130, dur: 120 }, // ②税金178
  shaho:  { from: 250, dur: 165 }, // ③社会保険 分かれ道
  loss:   { from: 415, dur: 205 }, // ④★働き損 手取りカーブ
  fuyo:   { from: 620, dur: 105 }, // ⑤扶養 段階バー
  merit:  { from: 725, dur: 110 }, // ⑥社保メリット ポンポン
  end:    { from: 835, dur: 95 },  // ⑦締め
};
export const KABE_FRAMES = P.end.from + P.end.dur; // 930 = 31s

// ── 共通アニメ（Sequence内でframeは0起点にリセットされる）──
const useSp = (delay: number, dur = 14, cfg: Parameters<typeof spring>[0]["config"] = { damping: 14, stiffness: 150, mass: 0.8 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};
const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useSp(delay, 12, { damping: 13, stiffness: 150, mass: 0.7 });
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
const Drop: React.FC<{ delay: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, dy = -36, style, children }) => {
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
// ページ共通の退場フェード（終盤でシュッと薄く）
const pageFade = (f: number, dur: number) => interpolate(f, [0, 8, dur - 10, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// 画面上部の固定見出し（各ページ共通・カメラは動かない）
const Header: React.FC<{ active: number }> = ({ active }) => {
  const labels = ["全体像", "税金", "社会保険", "働き損", "扶養", "メリット", "まとめ"];
  return (
    <div style={{ position: "absolute", top: 70, left: 0, width: 1080, textAlign: "center" }}>
      <span style={{ fontSize: 40, fontWeight: 900, color: C.ink, borderBottom: `6px solid ${C.orange}`, paddingBottom: 4 }}>年収の壁</span>
      <span style={{ fontSize: 22, fontWeight: 900, color: C.orange, marginLeft: 12 }}>2026・また変わった</span>
      <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 14 }}>
        {labels.map((l, i) => (
          <span key={i} style={{ fontSize: 15, fontWeight: 800, color: i === active ? "#fff" : C.gray, background: i === active ? C.orange : "transparent", border: `1.5px solid ${i === active ? C.orange : C.line}`, borderRadius: 999, padding: "3px 10px" }}>{l}</span>
        ))}
      </div>
    </div>
  );
};

// ───────────── ① 全体像：壁リスト（金額｜内容・ポンポン積み上げ）─────────────
// 参考リールの"積み上げリスト"の角度を採用。数字はうちの出典、色=種類、130万を★強調。
const WALLS = [
  { amt: "週20h〜", tag: "社保", desc: "会社の社保に加入", note: "51人以上の会社", c: C.red, bg: C.redBg },
  { amt: "110万", tag: "税金", desc: "住民税がかかる", note: "一番先にかかる", c: C.orange, bg: C.orangeBg },
  { amt: "130万", tag: "社保", desc: "社保の扶養を外れる", note: "★ここが一番キケン", c: C.red, bg: C.redBg, star: true },
  { amt: "136万", tag: "扶養", desc: "夫の控除（配偶者控除）", note: "169万まで特別控除は満額", c: C.ink, bg: "#EEF2F7" },
  { amt: "178万", tag: "税金", desc: "所得税がかかる", note: "去年160万→今年178万", c: C.orange, bg: C.orangeBg },
];
const PageZentai: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.zentai.dur) }}>
      <Header active={0} />
      <Drop delay={0} style={{ position: "absolute", top: 290, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: C.ink }}>年収の壁、<span style={{ color: C.orange }}>ぜんぶ見せます</span></div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
          {[{ t: "税金", c: C.orange }, { t: "社会保険", c: C.red }, { t: "扶養", c: C.ink }].map((x, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 22, fontWeight: 900, color: C.ink }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: x.c }} />{x.t}
            </span>
          ))}
        </div>
      </Drop>
      <div style={{ position: "absolute", top: 440, left: 70, width: 940 }}>
        {WALLS.map((w, i) => (
          <Drop key={i} delay={14 + i * 12} dy={-26} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, background: w.star ? w.bg : "#fff", border: `${w.star ? 5 : 3}px solid ${w.c}`, borderRadius: 18, padding: "16px 22px", boxShadow: "0 6px 16px rgba(31,58,95,0.08)" }}>
              <div style={{ minWidth: 190, textAlign: "center" }}>
                <div style={{ fontSize: w.star ? 60 : 50, fontWeight: 900, color: w.c, lineHeight: 1 }}>{w.amt}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 17, fontWeight: 900, color: "#fff", background: w.c, borderRadius: 6, padding: "2px 9px" }}>{w.tag}</span>
                  <span style={{ fontSize: w.star ? 34 : 30, fontWeight: 900, color: C.ink }}>{w.desc}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: w.star ? C.red : C.gray, marginTop: 4 }}>{w.note}</div>
              </div>
            </div>
          </Drop>
        ))}
      </div>
      <Drop delay={78} style={{ position: "absolute", top: 1300, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: C.ink, background: C.orangeBg, borderRadius: 12, padding: "12px 26px" }}>多いけど、大事なのは<span style={{ color: C.red }}>130万</span>だけ</span>
      </Drop>
    </AbsoluteFill>
  );
};

// ───────────── ② 税金178：Before→After（数字の変化）─────────────
const PageTax: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.tax.dur) }}>
      <Header active={1} />
      <Drop delay={0} style={{ position: "absolute", top: 320, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 46, fontWeight: 900, color: C.ink }}>① 税金の壁</span>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.gray, marginTop: 6 }}>所得税がかからないライン</div>
      </Drop>
      <div style={{ position: "absolute", top: 560, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 }}>
        <Pop delay={14} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.gray }}>今まで</div>
          <div style={{ position: "relative", fontSize: 88, fontWeight: 900, color: C.gray, lineHeight: 1 }}>103万
            <div style={{ position: "absolute", top: "48%", left: -8, right: -8, height: 8, background: C.red, transform: "rotate(-9deg)" }} />
          </div>
        </Pop>
        <Pop delay={28}><span style={{ fontSize: 60, fontWeight: 900, color: C.orange }}>→</span></Pop>
        <Pop delay={36} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.orange }}>2026年</div>
          <div style={{ fontSize: 120, fontWeight: 900, color: C.orange, lineHeight: 1 }}>178万</div>
        </Pop>
      </div>
      <Drop delay={54} style={{ position: "absolute", top: 940, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 40, fontWeight: 900, color: "#fff", background: C.orange, borderRadius: 14, padding: "14px 30px" }}>103万に抑える時代は、もう終わり</span>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.gray, marginTop: 16 }}>※住民税の非課税ラインは別（自治体差・約110万〜）</div>
      </Drop>
    </AbsoluteFill>
  );
};

// ───────────── ③ 社会保険：分かれ道（二択フロー）─────────────
const PageShaho: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.shaho.dur) }}>
      <Header active={2} />
      <Drop delay={0} style={{ position: "absolute", top: 300, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: C.ink }}>② 社会保険の壁 <span style={{ color: C.red }}>（本命）</span></span>
        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 12 }}>
          <span style={{ position: "relative", fontSize: 34, fontWeight: 900, color: C.gray }}>106万の壁
            <div style={{ position: "absolute", top: "48%", left: -4, right: -4, height: 5, background: C.red, transform: "rotate(-8deg)" }} /></span>
          <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 999, padding: "5px 14px" }}>10月に撤廃</span>
        </div>
      </Drop>
      {/* 分かれ道：あなたの会社は？ */}
      <Pop delay={20} style={{ position: "absolute", top: 480, left: CX - 220, width: 440, textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.ink, borderRadius: 16, padding: "14px 10px" }}>あなたの会社は？</div>
      </Pop>
      <svg width={1080} height={700} style={{ position: "absolute", top: 560, left: 0 }}>
        <Draw d={`M${CX} 40 L${CX} 90 M270 90 L810 90 M270 90 L270 150 M810 90 L810 150`} delay={30} dur={14} color={C.ink} />
      </svg>
      {[
        { x: 270, head: "51人以上", sub: "（規模要件）", body: "週20時間以上で\n勤め先の社保に加入", c: C.red, tag: "時間で決まる" },
        { x: 810, head: "50人以下", sub: "（小さい会社）", body: "年収130万で\n夫の扶養を外れる", c: C.orange, tag: "130万で判断" },
      ].map((b, i) => (
        <Pop key={i} delay={46 + i * 10} style={{ position: "absolute", top: 720, left: b.x - 220, width: 440, textAlign: "center" }}>
          <div style={{ background: "#fff", border: `4px solid ${b.c}`, borderRadius: 20, padding: "22px 16px", boxShadow: "0 8px 18px rgba(31,58,95,0.10)" }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: b.c }}>{b.head}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.gray, marginBottom: 12 }}>{b.sub}</div>
            {b.body.split("\n").map((t, j) => <div key={j} style={{ fontSize: 28, fontWeight: 900, color: C.ink, lineHeight: 1.3 }}>{t}</div>)}
            <div style={{ marginTop: 12, display: "inline-block", fontSize: 22, fontWeight: 900, color: "#fff", background: b.c, borderRadius: 999, padding: "5px 16px" }}>{b.tag}</div>
          </div>
        </Pop>
      ))}
      <Drop delay={80} style={{ position: "absolute", top: 1130, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: C.ink, background: C.grayBg, borderRadius: 12, padding: "12px 24px" }}>“年収”より、まず<span style={{ color: C.red }}>会社の規模と働く時間</span></span>
      </Drop>
    </AbsoluteFill>
  );
};

// ───────────── ④ ★働き損：手取りカーブ（谷グラフ）＝山場 ─────────────
const PageLoss: React.FC = () => {
  const f = useCurrentFrame();
  // チャート座標
  const left = 170, right = 930, top = 760, bottom = 1300;
  const yMin = 120, yMax = 170;             // 年収(万)
  const tMin = 100, tMax = 132;             // 手取り(万)
  const X = (y: number) => left + (y - yMin) / (yMax - yMin) * (right - left);
  const Y = (t: number) => bottom - (t - tMin) / (tMax - tMin) * (bottom - top);
  // カーブの要点：120→118 / 128→126(ピーク) / 130超→108(崖) / 140→117 / 150→126(回復) / 170→140(頭打ち)
  const pts: [number, number][] = [[120, 118], [128, 126], [130, 108], [140, 117], [150, 126], [170, 140]];
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(" ");
  const lineP = interpolate(f, [18, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 損ゾーン(130〜150万)の帯
  const bandL = X(130), bandR = X(150), bandShow = interpolate(f, [60, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.loss.dur) }}>
      <Header active={3} />
      <Drop delay={0} style={{ position: "absolute", top: 290, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: C.red }}>★ ここからが本題</span>
        <div style={{ fontSize: 50, fontWeight: 900, color: C.ink, marginTop: 4 }}>一番“損”するのは、ここ</div>
      </Drop>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* 損ゾーン帯 */}
        <rect x={bandL} y={top - 10} width={bandR - bandL} height={bottom - top + 10} fill={C.redBg} opacity={bandShow * 0.9} />
        {/* 軸 */}
        <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={C.line} strokeWidth={3} />
        <line x1={left} y1={top - 10} x2={left} y2={bottom} stroke={C.line} strokeWidth={3} />
        {/* 曲線 */}
        <path d={path} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lineP} />
        {/* 軸ラベル */}
        <text x={right} y={bottom + 42} fill={C.gray} fontSize={26} fontWeight={800} textAnchor="end">年収 →</text>
        <text x={left - 16} y={top + 8} fill={C.gray} fontSize={26} fontWeight={800} textAnchor="end">手取り</text>
      </svg>
      {/* 要点マーカー（崖と谷と回復）*/}
      <Pop delay={62} style={{ position: "absolute", top: Y(126) - 76, left: X(128) - 100, width: 200, textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.green }}>年収128万</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.green, whiteSpace: "nowrap" }}>手取り126万</div>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.green, margin: "4px auto 0" }} />
      </Pop>
      <Pop delay={74} style={{ position: "absolute", top: Y(108) + 18, left: X(130) - 90, width: 180, textAlign: "center" }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.red, margin: "0 auto 4px" }} />
        <div style={{ fontSize: 22, fontWeight: 900, color: C.red }}>130万超</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: C.red }}>約108万</div>
      </Pop>
      <Pop delay={88} style={{ position: "absolute", top: Y(126) - 70, left: X(150) - 70, width: 150, textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.ink }}>約150万</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.ink }}>やっと回復</div>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.ink, margin: "4px auto 0" }} />
      </Pop>
      {/* 吹き出し：崖 */}
      <Pop delay={100} style={{ position: "absolute", top: 700, left: X(130) - 130, width: 290 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>年収+2万で、手取り −18万</div>
      </Pop>
      {/* 谷ゾーン注記 */}
      <Pop delay={112} style={{ position: "absolute", top: 1180, left: bandL, width: bandR - bandL, textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.red }}>働き損ゾーン</div>
      </Pop>
      <Drop delay={122} style={{ position: "absolute", top: 1420, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 40, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 14, padding: "14px 28px" }}>“中途半端”が、一番損</span>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.gray, marginTop: 14 }}>※勤め先の社保＝保険料 約15%で試算した目安（40歳未満）</div>
      </Drop>
    </AbsoluteFill>
  );
};

// ───────────── ⑤ 扶養：横の段階バー ─────────────
const FuyoBar: React.FC<{ y: string; label: string; pct: number; c: string; delay: number }> = ({ y, label, pct, c, delay }) => {
  const w = useSp(delay, 16, { damping: 16 });
  return (
    <div style={{ marginBottom: 34 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 8 }}>
        <span style={{ fontSize: 42, fontWeight: 900, color: C.ink, width: 230 }}>{y}</span>
        <span style={{ fontSize: 30, fontWeight: 900, color: c }}>{label}</span>
      </div>
      <div style={{ height: 46, background: C.grayBg, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.max(6, pct * w)}%`, background: c, borderRadius: 999 }} />
      </div>
    </div>
  );
};
const PageFuyo: React.FC = () => {
  const f = useCurrentFrame();
  const steps = [
    { y: "〜136万", label: "控除 満額", pct: 100, c: C.green },
    { y: "〜169万", label: "特別控除で満額", pct: 100, c: C.green },
    { y: "207万〜", label: "控除ゼロ", pct: 0, c: C.gray },
  ];
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.fuyo.dur) }}>
      <Header active={4} />
      <Drop delay={0} style={{ position: "absolute", top: 320, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 46, fontWeight: 900, color: C.ink }}>③ 扶養の壁</span>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.gray, marginTop: 6 }}>これは“夫の税金”の話（夫の年収約1,095万以下が前提）</div>
      </Drop>
      <div style={{ position: "absolute", top: 560, left: 90, width: 900 }}>
        {steps.map((s, i) => (
          <FuyoBar key={i} {...s} delay={16 + i * 12} />
        ))}
      </div>
      <Drop delay={60} style={{ position: "absolute", top: 1180, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: C.ink, background: C.orangeBg, borderRadius: 12, padding: "12px 24px" }}>136万まではまず気にしなくてOK</span>
      </Drop>
    </AbsoluteFill>
  );
};

// ───────────── ⑥ 社保のメリット：上から下にポンポン ─────────────
const PageMerit: React.FC = () => {
  const f = useCurrentFrame();
  const items = [
    { t: "将来の年金が増える", icon: "↑", c: C.green },
    { t: "傷病手当金（病気で休んでも）", icon: "＋", c: C.green },
    { t: "出産手当金（産休中ももらえる）", icon: "＋", c: C.green },
  ];
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.merit.dur) }}>
      <Header active={5} />
      <Drop delay={0} style={{ position: "absolute", top: 330, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.green }}>でも、安心してください</div>
        <div style={{ fontSize: 46, fontWeight: 900, color: C.ink, marginTop: 6 }}>社保に<span style={{ color: C.green }}>入れば</span>…</div>
      </Drop>
      <div style={{ position: "absolute", top: 540, left: 0, width: 1080 }}>
        {items.map((it, i) => (
          <Drop key={i} delay={18 + i * 16} dy={-30} style={{ marginBottom: 26, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, width: 820, background: C.greenBg, border: `4px solid ${C.green}`, borderRadius: 20, padding: "22px 28px" }}>
              <span style={{ width: 62, height: 62, borderRadius: "50%", background: C.green, color: "#fff", fontSize: 38, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{it.icon}</span>
              <span style={{ fontSize: 34, fontWeight: 900, color: C.ink }}>{it.t}</span>
            </div>
          </Drop>
        ))}
      </div>
      <Drop delay={70} style={{ position: "absolute", top: 1240, left: 90, width: 900, textAlign: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: C.gray, lineHeight: 1.5 }}>※ 国保（自分で入る国民健康保険）には<br />傷病・出産手当金は基本なし。勤め先の社保だから、つく</span>
      </Drop>
    </AbsoluteFill>
  );
};

// ───────────── ⑦ 締め：一言＋CTA ─────────────
const PageEnd: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: pageFade(f, P.end.dur) }}>
      <Header active={6} />
      <Pop delay={6} style={{ position: "absolute", top: 480, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 16, padding: "16px 30px", display: "inline-block" }}>損が出るのは 130〜150万 だけ</div>
      </Pop>
      <Drop delay={24} style={{ position: "absolute", top: 700, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: C.ink, lineHeight: 1.5 }}>“壁”で縮こまるより、<br /><span style={{ color: C.orange }}>世帯の手取りと保障</span>で考えよう</span>
      </Drop>
      <Drop delay={48} style={{ position: "absolute", top: 1080, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: "#fff", background: C.ink, borderRadius: 999, padding: "16px 40px" }}>気になる人は、プロフから相談を</span>
      </Drop>
    </AbsoluteFill>
  );
};

export const KabeReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <Sequence from={P.zentai.from} durationInFrames={P.zentai.dur}><PageZentai /></Sequence>
      <Sequence from={P.tax.from} durationInFrames={P.tax.dur}><PageTax /></Sequence>
      <Sequence from={P.shaho.from} durationInFrames={P.shaho.dur}><PageShaho /></Sequence>
      <Sequence from={P.loss.from} durationInFrames={P.loss.dur}><PageLoss /></Sequence>
      <Sequence from={P.fuyo.from} durationInFrames={P.fuyo.dur}><PageFuyo /></Sequence>
      <Sequence from={P.merit.from} durationInFrames={P.merit.dur}><PageMerit /></Sequence>
      <Sequence from={P.end.from} durationInFrames={P.end.dur}><PageEnd /></Sequence>
    </AbsoluteFill>
  );
};
