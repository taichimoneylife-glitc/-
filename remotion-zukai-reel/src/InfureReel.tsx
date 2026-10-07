import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";

// ═══════════════════════════════════════════════════════════════════
// インフレ／お金の置き場リール（太一さん・録音ナレ74.0sに全同期）
//   録音：日銀がわざと物価を上げている → 良い/悪いインフレ(ツリー分岐) →
//        2%グラフ(物価↑ vs 銀行ほぼ横ばい) → インフレ負け/価値目減り →
//        お金が増える場所(山場:毎月5万×30年) → 選択肢 → 置き場を確認。
//   断定回避：運用5%は「あくまで仮定・保証なし・元本割れの可能性」を※で明記。
//   図解の craft はこちら持ち（ベクター/アニメ/ポップ絵）。
// ═══════════════════════════════════════════════════════════════════
const C = {
  bg: "#FCFBF7", ink: "#1F3A5F", sub: "#5B6B7F",
  orange: "#E8912D", red: "#E0483B", green: "#2E9E6B",
  blue: "#3B7DD8", gold: "#E0A72E", gray: "#AEB8C2", line: "#C9D2DD",
  blueBg: "#E7F0FB", greenBg: "#E4F3EC", redBg: "#FCE6E3", goldBg: "#FBF1D9",
};

const FPS = 30;
const s2f = (s: number) => Math.round(s * FPS);
// 音声アンカー（whisper語タイム）→frame
const A = {
  s1a: 0, s1b: s2f(3.36), s1c: s2f(7.84),
  s2a: s2f(9.68), s2b: s2f(12.86),
  s3a: s2f(16.98), s3b: s2f(19.0), s3c: s2f(23.04), s3d: s2f(26.82), s3e: s2f(29.32),
  s4: s2f(32.94),
  s5a: s2f(35.32), s5b: s2f(40.68), s5c: s2f(47.02),
  s6a: s2f(49.3), s6b: s2f(53.12), s6c: s2f(57.08),
  s7a: s2f(60.48), s7b: s2f(63.52), s7c: s2f(65.48), s7d: s2f(70.76),
};
export const INFURE_FRAMES = s2f(74.0) + 22; // ≈2242

// ページ境界（シーン＝1画面が建って切替）
const PG = {
  p1: { from: A.s1a, dur: A.s2a - A.s1a },        // 0..290   日銀/目標/良いインフレ
  p2: { from: A.s2a, dur: A.s3a - A.s2a },        // 290..509 良い/悪いインフレ(ツリー)
  p3a: { from: A.s3a, dur: A.s3d - A.s3a },       // 509..805 2%グラフ(物価vs銀行)
  p3b: { from: A.s3d, dur: A.s4 - A.s3d },        // 805..988 インフレ負け/価値目減り
  p4: { from: A.s4, dur: A.s6a - A.s4 },          // 988..1479 置き場の差(山場)
  p5: { from: A.s6a, dur: A.s7a - A.s6a },        // 1479..1814 選択肢が広がる
  p6: { from: A.s7a, dur: INFURE_FRAMES - A.s7a },// 1814..end 締め・確認
};

// ── 効果音（必ず sfx-library.md の user/u* から。中音主役・高音キメ1回） ──
const SFX = [
  { file: "user/u05", at: A.s1a + 2, volume: 0.4 },
  { file: "user/u06", at: A.s1b + 2, volume: 0.34 },
  { file: "user/u02s", at: A.s1c + 2, volume: 0.4 },
  { file: "user/u03", at: A.s2a + 2, volume: 0.4 },     // ツリー出現
  { file: "user/u02s", at: A.s2a + 20, volume: 0.34 },  // 良いインフレ（ピッ）
  { file: "user/u02s", at: A.s2a + 40, volume: 0.34 },  // 給料↑（ピッ）
  { file: "user/u02s", at: A.s2a + 62, volume: 0.34 },  // 豊か（ピッ）
  { file: "user/u02s", at: A.s2b + 2, volume: 0.36 },   // 悪いインフレ（ピッ）
  { file: "user/u02s", at: A.s2b + 24, volume: 0.36 },  // 給料上がらない（ピッ）
  { file: "user/u04", at: A.s2b + 46, volume: 0.42 },   // 負担は増える一方（キメ・⚠）
  { file: "user/u03", at: A.s3a + 2, volume: 0.4 },     // 問い・グラフ転換
  { file: "user/u02s", at: A.s3b + 2, volume: 0.38 },   // 物価線1,020
  { file: "user/u02s", at: A.s3c + 2, volume: 0.38 },   // 銀行線1,004
  { file: "user/u04", at: A.s3d + 2, volume: 0.42 },    // インフレ負けキメ（高・1回）
  { file: "user/u02s", at: A.s3e + 2, volume: 0.32 },   // 価値目減り
  { file: "user/u07", at: A.s4 + 2, volume: 0.42 },     // 大転換「だから」
  { file: "user/u06", at: A.s5a + 2, volume: 0.34 },
  { file: "user/u08", at: A.s5a + 22, volume: 0.4 },    // 1,889万 着地
  { file: "user/u06", at: A.s5b + 2, volume: 0.34 },
  { file: "user/u09", at: A.s5b + 26, volume: 0.46 },   // 4,770万 特大キメ（山場）
  { file: "user/u04", at: A.s5b + 118, volume: 0.42 },  // 差2,188万 パンチ
  { file: "user/u10", at: A.s5c + 2, volume: 0.42 },    // 結論帯
  { file: "user/u02s", at: A.s6a + 2, volume: 0.36 },
  { file: "user/u02s", at: A.s6b + 2, volume: 0.36 },
  { file: "user/u10", at: A.s6c + 2, volume: 0.4 },     // 選択肢広がる帯
  { file: "user/u03", at: A.s7a + 2, volume: 0.4 },     // 締めへ転換
  { file: "user/u06", at: A.s7b + 2, volume: 0.32 },
  { file: "user/u06", at: A.s7c + 2, volume: 0.32 },
  { file: "user/u07", at: A.s7d + 2, volume: 0.44 },    // 締め問い
  { file: "finish", at: A.s7d + 58, volume: 0.4 },      // 低・締め余韻
];
const SFX_GAIN = 1.0;

// ───────── 共通モーション部品（motion-kit 準拠） ─────────
const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode; damp?: number }> = ({ delay, style, children, damp = 12 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: damp, stiffness: 155, mass: 0.7 }, durationInFrames: 12 });
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
const usePulse = (amp = 0.06, spd = 7) => { const f = useCurrentFrame(); return 1 + (Math.sin(f / spd) * 0.5 + 0.5) * amp; };
const Draw: React.FC<{ d: string; delay: number; dur?: number; color?: string; w?: number; dash?: string }> = ({ d, delay, dur = 12, color = C.orange, w = 5, dash }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ?? "1"} strokeDashoffset={dash ? undefined : 1 - p} pathLength={dash ? undefined : 1} opacity={p > 0.001 ? p : 0} />;
};
// 数字カウントアップ＋着地パンチ
const NumCount: React.FC<{ to: number; delay: number; dur?: number; style?: React.CSSProperties; fmt?: (n: number) => string }> = ({ to, delay, dur = 18, style, fmt }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const v = Math.round(to * (1 - Math.pow(1 - p, 3)));
  const punch = interpolate(f, [delay + dur - 4, delay + dur, delay + dur + 7], [1, 1.14, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <span style={{ display: "inline-block", transform: `scale(${punch})`, ...style }}>{fmt ? fmt(v) : v.toLocaleString()}</span>;
};
// 伸びる棒（物価ミニグラフ用）
const GrowBar: React.FC<{ h: number; delay: number; w?: number }> = ({ h, delay, w = 56 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ width: w, height: h * p, background: `linear-gradient(180deg, #F0A94B, ${C.orange})`, borderRadius: "8px 8px 0 0" }} />;
};
// ポップ絵スロット：実画像(gen/*.png)があれば使用、なければ絵文字。
const Slot: React.FC<{ emoji: string; size?: number; delay?: number; float?: number; bg?: string; ring?: string; img?: string; style?: React.CSSProperties }> = ({ emoji, size = 120, delay = 0, float = 5, bg = "#fff", ring = C.line, img, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 12, stiffness: 140, mass: 0.8 }, durationInFrames: 14 });
  const fy = Math.sin((f - delay) / 22) * float;
  const common: React.CSSProperties = { opacity: Math.min(1, s * 1.7), transform: `translateY(${(1 - s) * 16 + fy}px) scale(${0.9 + s * 0.1})`, ...style };
  if (img) return <Img src={staticFile(`gen/${img}.png`)} style={{ width: size, height: "auto", objectFit: "contain", ...common }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "28%", background: bg, border: `3px solid ${ring}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.56, boxShadow: "0 8px 20px rgba(31,58,95,0.10)", ...common }}>{emoji}</div>
  );
};
const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const b = (sx: number, sy: number, spd: number, col: string, size: number, amp: number) => ({
    position: "absolute" as const, width: size, height: size, borderRadius: "50%", background: col,
    filter: "blur(90px)", left: sx + Math.sin(f / spd) * amp, top: sy + Math.cos(f / (spd * 1.2)) * amp, opacity: 0.5,
  });
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(125% 80% at 50% -5%, #FFFDF8 0%, #FAF6EC 55%, #F1EBDD 100%)" }} />
      <div style={b(120, 240, 55, "#F7E4C6", 460, 24)} />
      <div style={b(640, 1180, 70, "#DCEBF8", 520, 30)} />
      <div style={b(420, 1620, 62, "#E7F3EC", 440, 26)} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(#1F3A5F18 1.4px, transparent 1.4px)", backgroundSize: "34px 34px", maskImage: "radial-gradient(70% 55% at 50% 42%, #000 40%, transparent 100%)", WebkitMaskImage: "radial-gradient(70% 55% at 50% 42%, #000 40%, transparent 100%)", opacity: 0.5 }} />
    </>
  );
};
const Head: React.FC<{ kicker: string; title: React.ReactNode; kc?: string }> = ({ kicker, title, kc = C.red }) => {
  const f = useCurrentFrame();
  const mk = interpolate(f, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Pop delay={2} style={{ position: "absolute", top: 90, left: 0, width: 1080, textAlign: "center" }}>
      <div style={{ display: "inline-block", fontSize: 30, fontWeight: 900, color: "#fff", background: kc, borderRadius: 999, padding: "6px 24px", letterSpacing: 1 }}>{kicker}</div>
      <div style={{ fontSize: 50, fontWeight: 900, color: C.ink, marginTop: 12, lineHeight: 1.22 }}>{title}</div>
      <div style={{ width: 120 * mk, height: 7, background: kc, borderRadius: 999, margin: "14px auto 0", opacity: 0.85 }} />
    </Pop>
  );
};
const Note: React.FC<{ lines: string[]; top?: number }> = ({ lines, top = 1660 }) => (
  <Pop delay={30} style={{ position: "absolute", top, left: 90, width: 900, textAlign: "left" }}>
    {lines.map((n, i) => (<div key={i} style={{ fontSize: 19, fontWeight: 700, color: C.gray, marginBottom: 5, lineHeight: 1.35 }}>{n}</div>))}
  </Pop>
);
// ツリーのノード（イラスト＋ラベル／任意でパルス）
const TreeNode: React.FC<{ cx: number; top: number; w?: number; delay: number; img?: string; emoji?: string; title: string; sub?: string; color: string; bg: string; pulse?: boolean; big?: boolean }> = ({ cx, top, w = 360, delay, img, emoji, title, sub, color, bg, pulse, big }) => {
  const p = usePulse(0.05, 7);
  const sz = big ? 108 : 92;
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top, width: w, transform: pulse ? `scale(${p})` : undefined, transformOrigin: "center" }}>
      <Pop delay={delay}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: bg, border: `3px solid ${color}`, borderRadius: 18, padding: "12px 16px", boxShadow: `0 8px 20px ${color}26` }}>
          <Slot emoji={emoji ?? "•"} img={img} size={sz} delay={delay + 3} float={3} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: big ? 32 : 28, fontWeight: 900, color: C.ink, lineHeight: 1.15 }}>{title}</div>
            {sub && <div style={{ fontSize: 20, fontWeight: 800, color, marginTop: 2 }}>{sub}</div>}
          </div>
        </div>
      </Pop>
    </div>
  );
};

// ツリーのノード（左上基準・高さ均一・任意でパルス/注意マーク）
const NodeBox: React.FC<{ cx: number; top: number; w: number; img: string; title: string; sub?: string; color: string; bg: string; delay: number; pulse?: boolean; pamp?: number; imgSize?: number; ts?: number; warn?: boolean }> = ({ cx, top, w, img, title, sub, color, bg, delay, pulse, pamp = 0.05, imgSize = 80, ts = 28, warn }) => {
  const pl = usePulse(pamp, 7);
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top, width: w, transform: pulse ? `scale(${pl})` : undefined, transformOrigin: "center" }}>
      <Pop delay={delay}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, background: bg, border: `3px solid ${color}`, borderRadius: 18, padding: "12px 16px", boxShadow: `0 8px 20px ${color}26` }}>
          <Slot emoji="•" img={img} size={imgSize} delay={delay + 3} float={3} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: ts, fontWeight: 900, color: C.ink, lineHeight: 1.15 }}>{title}</div>
            {sub && <div style={{ fontSize: 20, fontWeight: 800, color }}>{sub}</div>}
          </div>
          {warn && <Slot emoji="⚠" img="kabe_warn" size={88} delay={delay + 8} float={5} style={{ position: "absolute", top: -38, right: -14 }} />}
        </div>
      </Pop>
    </div>
  );
};

// ───────── P1：日銀がわざと物価を上げている ─────────
const P1: React.FC = () => {
  const risePulse = usePulse(0.07, 8);
  return (
    <AbsoluteFill>
      <Head kicker="まず前提の話" title={<>日本の物価は、<br /><span style={{ color: C.red }}>日銀が「わざと」</span>上げている</>} />
      {/* 日銀 → 物価↑ */}
      <div style={{ position: "absolute", top: 330, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 }}>
        <div style={{ textAlign: "center" }}>
          <Slot emoji="🏦" img="infure_bank" size={300} delay={4} bg={C.blueBg} ring={C.blue} />
          <div style={{ fontSize: 26, fontWeight: 900, color: C.blue, marginTop: 2 }}>日銀</div>
        </div>
        <svg width={130} height={210} style={{ overflow: "visible" }}>
          <Draw d="M18 170 L108 56" delay={18} color={C.red} w={11} />
          <Draw d="M108 56 L82 60 M108 56 L104 86" delay={28} color={C.red} w={11} />
        </svg>
        <div style={{ textAlign: "center", transform: `scale(${risePulse})` }}>
          <Slot emoji="🛒" img="infure_growth" size={300} delay={10} bg={C.goldBg} ring={C.gold} />
          <div style={{ fontSize: 26, fontWeight: 900, color: C.orange, marginTop: 2 }}>物価が上がる</div>
        </div>
      </div>
      {/* 目標 / ここ数年 */}
      <Pop delay={A.s1b - PG.p1.from} style={{ position: "absolute", top: 740, left: 90, width: 900 }}>
        <div style={{ display: "flex", gap: 22, justifyContent: "center" }}>
          <div style={{ flex: 1, background: "#fff", border: `3px solid ${C.blue}`, borderRadius: 22, padding: "22px 14px", textAlign: "center", boxShadow: "0 8px 20px rgba(31,58,95,0.08)" }}>
            <div style={{ fontSize: 27, fontWeight: 900, color: C.sub }}>日銀の目標</div>
            <div style={{ fontSize: 66, fontWeight: 900, color: C.blue }}>年+2<span style={{ fontSize: 42 }}>%</span></div>
          </div>
          <div style={{ flex: 1, background: "#fff", border: `3px solid ${C.orange}`, borderRadius: 22, padding: "22px 14px", textAlign: "center", boxShadow: "0 8px 20px rgba(31,58,95,0.08)" }}>
            <div style={{ fontSize: 27, fontWeight: 900, color: C.sub }}>ここ数年</div>
            <div style={{ fontSize: 66, fontWeight: 900, color: C.orange }}>+2〜3<span style={{ fontSize: 42 }}>%</span></div>
            <div style={{ fontSize: 23, fontWeight: 900, color: C.orange }}>上昇中 ↑</div>
          </div>
        </div>
      </Pop>
      {/* 物価はじわじわ上昇（ミニ棒グラフ） */}
      <Pop delay={A.s1b - PG.p1.from + 14} style={{ position: "absolute", top: 972, left: 90, width: 900 }}>
        <div style={{ background: "#fff", border: `3px solid ${C.gold}`, borderRadius: 22, padding: "16px 22px 20px", boxShadow: "0 8px 20px rgba(31,58,95,0.08)" }}>
          <div style={{ fontSize: 25, fontWeight: 900, color: C.ink, marginBottom: 10 }}>物価は<span style={{ color: C.orange }}>じわじわ上がり続けて</span>いる</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 20, height: 120 }}>
            {[48, 62, 76, 92, 110].map((h, i) => {
              const f2 = A.s1b - PG.p1.from + 20 + i * 4;
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <GrowBar h={h} delay={f2} />
                </div>
              );
            })}
            <div style={{ fontSize: 44, fontWeight: 900, color: C.orange, marginLeft: 6, alignSelf: "center" }}>↗</div>
          </div>
        </div>
      </Pop>
      {/* 狙いは良いインフレ */}
      <Pop delay={A.s1c - PG.p1.from} style={{ position: "absolute", top: 1216, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 38, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 999, padding: "16px 46px", display: "inline-block", boxShadow: `0 12px 28px ${C.green}44` }}>狙いは「良いインフレ」🌱</span>
      </Pop>
      <Note lines={["※インフレ＝物価が続けて上がること", "※日銀＝日本銀行（物価の番人）"]} top={1600} />
    </AbsoluteFill>
  );
};

// ───────── P2：良い/悪いインフレ（左右対称3段ツリー・順につなぐ） ─────────
const P2: React.FC = () => {
  const d = (g: number) => g - PG.p2.from;
  const XL = 290, XR = 790;
  return (
    <AbsoluteFill>
      <Head kicker="同じ物価↑でも2つに分かれる" title={<><span style={{ color: C.green }}>良い</span>インフレと<span style={{ color: C.red }}>悪い</span>インフレ</>} />
      {/* 連結線（ページ座標・4本の縦線はすべて同じ長さ62px／順にピッと描く） */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* 根→分岐 */}
        <Draw d="M540 380 L540 412" delay={d(A.s2a) + 8} color={C.gray} w={5} />
        <Draw d="M290 412 L790 412" delay={d(A.s2a) + 12} color={C.gray} w={5} />
        <Draw d="M290 412 L290 442" delay={d(A.s2a) + 16} color={C.green} w={6} />
        <Draw d="M790 412 L790 442" delay={d(A.s2b) - 2} color={C.red} w={6} />
        {/* 良い：ラベル→給料→豊か（同じ長さ） */}
        <Draw d="M290 502 L290 564" delay={d(A.s2a) + 34} color={C.green} w={6} />
        <Draw d="M290 668 L290 730" delay={d(A.s2a) + 56} color={C.green} w={6} />
        {/* 悪い：ラベル→給料→負担（同じ長さ） */}
        <Draw d="M790 502 L790 564" delay={d(A.s2b) + 18} color={C.red} w={6} />
        <Draw d="M790 668 L790 730" delay={d(A.s2b) + 40} color={C.red} w={6} />
      </svg>
      {/* 根：物価が上がる */}
      <NodeBox cx={540} top={256} w={430} delay={d(A.s2a)} img="infure_burger" title="物価が上がる" sub="↑" color={C.orange} bg="#fff" imgSize={98} ts={32} />
      {/* L1：良い / 悪い のラベルノード */}
      <div style={{ position: "absolute", top: 442, left: XL - 180, width: 360, textAlign: "center" }}>
        <Pop delay={d(A.s2a) + 20}><div style={{ fontSize: 28, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 16, padding: "12px 10px", boxShadow: `0 8px 20px ${C.green}33` }}>良いインフレ＝理想</div></Pop>
      </div>
      <div style={{ position: "absolute", top: 442, left: XR - 195, width: 390, textAlign: "center", transform: `scale(1.04)` }}>
        <Pop delay={d(A.s2b) + 2}><div style={{ fontSize: 30, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 16, padding: "13px 10px", boxShadow: `0 8px 22px ${C.red}44` }}>悪いインフレ＝現実</div></Pop>
      </div>
      {/* L2：給料 */}
      <NodeBox cx={XL} top={564} w={360} delay={d(A.s2a) + 40} img="infure_bill" title="給料も上がる" sub="↑" color={C.green} bg={C.greenBg} />
      <NodeBox cx={XR} top={564} w={390} delay={d(A.s2b) + 24} img="infure_bill" title="給料は上がらない" color={C.red} bg={C.redBg} imgSize={90} ts={30} pulse pamp={0.045} />
      {/* L3：豊か / 負担（悪い側を大きく・注意マーク＋パルス） */}
      <NodeBox cx={XL} top={730} w={360} delay={d(A.s2a) + 62} img="infure_kid" title="みんな豊か" sub="になるはず" color={C.green} bg={C.greenBg} />
      <NodeBox cx={XR} top={726} w={442} delay={d(A.s2b) + 46} img="infure_worry" title="負担は増える一方" color={C.red} bg={C.redBg} imgSize={96} ts={30} pulse pamp={0.08} warn />
      {/* 結論 */}
      <Pop delay={d(A.s2b) + 74} style={{ position: "absolute", top: 980, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 18, padding: "16px 44px", display: "inline-block", boxShadow: `0 12px 28px ${C.red}44` }}>＝ 今は「悪いインフレ」</span>
      </Pop>
      <Note lines={["※景気や賃金の感じ方には個人差があります"]} top={1640} />
    </AbsoluteFill>
  );
};

// ───────── P3a：2%上がるとどうなる？（物価 vs 銀行 グラフ） ─────────
// グラフ座標
const GX0 = 230, GX1 = 900, GY0 = 760, GY1 = 250; // 今年→来年 / 1,000→上
const gxNow = GX0 + 90, gxNext = GX1 - 60;
const fyV = (v: number) => GY0 - (v - 998) / (1024 - 998) * (GY0 - GY1);
const P3a: React.FC = () => {
  const d = (g: number) => g - PG.p3a.from;
  const f = useCurrentFrame();
  const price = interpolate(f, [d(A.s3b), d(A.s3b) + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bank = interpolate(f, [d(A.s3c), d(A.s3c) + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const priceY = fyV(1000) + (fyV(1020) - fyV(1000)) * price;
  const bankY = fyV(1000) + (fyV(1004) - fyV(1000)) * bank;
  const gapO = interpolate(f, [d(A.s3c) + 20, d(A.s3c) + 36], [0, 0.16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Head kicker="じゃあ 物価が+2% 上がると？" title={<>銀行に置いておくと、<br /><span style={{ color: C.red }}>インフレに追いつかない</span></>} />
      <svg width={1080} height={900} style={{ position: "absolute", top: 300, left: 0 }}>
        {/* 軸 */}
        <line x1={GX0} y1={GY0} x2={GX1} y2={GY0} stroke={C.ink} strokeWidth={4} />
        <line x1={GX0} y1={GY0} x2={GX0} y2={GY1} stroke={C.ink} strokeWidth={4} />
        <text x={gxNow} y={GY0 + 42} fontSize={26} fontWeight={900} fill={C.sub} textAnchor="middle">今年</text>
        <text x={gxNext} y={GY0 + 42} fontSize={26} fontWeight={900} fill={C.sub} textAnchor="middle">来年</text>
        {/* スタート点 1,000円（軸の左外に出して「今年」と被らないように） */}
        <circle cx={gxNow} cy={fyV(1000)} r={10} fill="#fff" stroke={C.ink} strokeWidth={5} />
        <text x={GX0 - 18} y={fyV(1000) + 8} fontSize={26} fontWeight={900} fill={C.ink} textAnchor="end">1,000円</text>
        {/* 差の帯 */}
        <rect x={gxNext - 8} y={priceY} width={70} height={Math.max(0, bankY - priceY)} fill={C.red} opacity={gapO} />
        {/* 物価ライン（オレンジ・急） */}
        <line x1={gxNow} y1={fyV(1000)} x2={gxNow + (gxNext - gxNow) * price} y2={priceY} stroke={C.orange} strokeWidth={9} strokeLinecap="round" />
        {price > 0.9 && <>
          <circle cx={gxNext} cy={fyV(1020)} r={11} fill={C.orange} />
          <text x={gxNext + 20} y={fyV(1020) + 2} fontSize={34} fontWeight={900} fill={C.orange} textAnchor="start">1,020円</text>
          <text x={gxNext + 20} y={fyV(1020) - 34} fontSize={24} fontWeight={900} fill={C.orange} textAnchor="start">物価 +2%</text>
        </>}
        {/* 銀行ライン（青・ほぼ横ばい） */}
        <line x1={gxNow} y1={fyV(1000)} x2={gxNow + (gxNext - gxNow) * bank} y2={bankY} stroke={C.blue} strokeWidth={9} strokeLinecap="round" />
        {bank > 0.9 && <>
          <circle cx={gxNext} cy={fyV(1004)} r={11} fill={C.blue} />
          <text x={gxNext + 20} y={fyV(1004) + 44} fontSize={34} fontWeight={900} fill={C.blue} textAnchor="start">1,004円</text>
          <text x={gxNext + 20} y={fyV(1004) + 78} fontSize={24} fontWeight={900} fill={C.blue} textAnchor="start">銀行 +0.4%</text>
        </>}
      </svg>
      {/* 下：まとめ一文 */}
      <Pop delay={d(A.s3c) + 30} style={{ position: "absolute", top: 1120, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: C.ink, background: "#fff", border: `2px dashed ${C.red}`, borderRadius: 16, padding: "14px 26px" }}>1,020円のものは、<span style={{ color: C.red }}>1,004円では買えない</span></span>
      </Pop>
      <Note lines={["※金利・物価の数字はイメージの目安です", "※銀行金利は金融機関・時期で異なります"]} top={1620} />
    </AbsoluteFill>
  );
};

// ───────── P3b：インフレ負け＝お金の価値が目減り ─────────
const P3b: React.FC = () => {
  const d = (g: number) => g - PG.p3b.from;
  const f = useCurrentFrame();
  const valPulse = usePulse(0.06, 7);
  // 価値（買えるモノ）がしぼむ：1.0→0.82で反復
  const shrink = 0.9 + Math.sin(f / 9) * 0.08;
  return (
    <AbsoluteFill>
      <Pop delay={d(A.s3d)} style={{ position: "absolute", top: 120, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 56, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 20, padding: "16px 50px", display: "inline-block", boxShadow: `0 12px 30px ${C.red}55` }}>これが「インフレ負け」</span>
      </Pop>
      <Pop delay={d(A.s3d) + 10} style={{ position: "absolute", top: 300, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: C.sub, background: "#fff", border: `2px solid ${C.line}`, borderRadius: 999, padding: "8px 26px" }}>同じ「1,000円」で、くらべると…</span>
      </Pop>
      <div style={{ position: "absolute", top: 390, left: 60, width: 960, display: "flex", gap: 26 }}>
        {/* 数は変わらない */}
        <Pop delay={d(A.s3e) - 8} style={{ flex: 1 }}>
          <div style={{ background: C.greenBg, border: `4px solid ${C.green}`, borderRadius: 26, padding: "28px 14px", textAlign: "center", height: 680, display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: `0 10px 26px ${C.green}26` }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.green }}>お金の「数」</div>
            <Slot emoji="💴" img="infure_bill" size={190} delay={d(A.s3e)} style={{ margin: "28px auto" }} />
            <div style={{ fontSize: 46, fontWeight: 900, color: C.ink }}>1,000円</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.sub }}>→ 来年も 1,000円</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.green, marginTop: 14 }}>✓ 減らない</div>
          </div>
        </Pop>
        {/* 価値は目減り（去年→今年 の買える量） */}
        <div style={{ flex: 1, transform: `scale(${valPulse})`, transformOrigin: "center" }}>
          <Pop delay={d(A.s3e) + 6}>
            <div style={{ background: C.redBg, border: `4px solid ${C.red}`, borderRadius: 26, padding: "28px 14px", textAlign: "center", height: 680, display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: `0 12px 30px ${C.red}33` }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: C.red }}>お金の「価値」</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "20px 0 10px" }}>
                <div style={{ textAlign: "center" }}>
                  <Slot emoji="🍔" img="infure_burger" size={132} delay={d(A.s3e) + 6} float={0} />
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.sub }}>去年</div>
                </div>
                <div style={{ fontSize: 40, fontWeight: 900, color: C.red }}>→</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ transform: `scale(${shrink})`, transformOrigin: "bottom center" }}>
                    <Slot emoji="🍔" img="infure_burger" size={132} delay={d(A.s3e) + 10} float={0} />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.red }}>今年</div>
                </div>
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, lineHeight: 1.25 }}>買える量が減る</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: C.red, marginTop: 10 }}>↓ 価値が目減り</div>
            </div>
          </Pop>
        </div>
      </div>
      <Note lines={["※お金の額面は変わらなくても、買える量（実質価値）は下がり得ます"]} top={1640} />
    </AbsoluteFill>
  );
};

// ───────── P4：山場＝お金の置き場で差（毎月5万×30年） ─────────
const P4: React.FC = () => {
  const d = (g: number) => g - PG.p4.from;
  const f = useCurrentFrame();
  const diffPulse = usePulse(0.07, 7);
  const barBank = interpolate(f, [d(A.s5a) + 6, d(A.s5a) + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barInv = interpolate(f, [d(A.s5b) + 6, d(A.s5b) + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Pop delay={2} style={{ position: "absolute", top: 100, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.green }}>物価の上がり方より</div>
        <div style={{ fontSize: 50, fontWeight: 900, color: C.ink, marginTop: 6 }}><span style={{ color: C.green }}>お金が増える場所</span>に置く</div>
      </Pop>
      <Pop delay={d(A.s5a)} style={{ position: "absolute", top: 262, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: C.ink, background: "#fff", border: `3px solid ${C.orange}`, borderRadius: 999, padding: "12px 34px" }}>毎月 5万円 × 30年 なら</span>
      </Pop>
      <div style={{ position: "absolute", top: 380, left: 90, width: 900, height: 640, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 90 }}>
        <div style={{ textAlign: "center", width: 300 }}>
          <div style={{ fontSize: 46, fontWeight: 900, color: C.blue, marginBottom: 8 }}><NumCount to={1889} delay={d(A.s5a) + 6} fmt={(n) => "約" + n.toLocaleString() + "万"} /></div>
          <div style={{ height: 230, width: 210, margin: "0 auto", background: C.blue, borderRadius: "16px 16px 0 0", transform: `scaleY(${barBank})`, transformOrigin: "bottom", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 12 }}>
            <Slot emoji="🏦" img="infure_bank2" size={108} delay={d(A.s5a) + 10} bg="#fff" ring={C.blue} float={3} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, marginTop: 8 }}>銀行のまま</div>
          <div style={{ fontSize: 21, fontWeight: 800, color: C.sub }}>（元本1,800万）</div>
        </div>
        <div style={{ textAlign: "center", width: 300 }}>
          <div style={{ fontSize: 56, fontWeight: 900, color: C.green, marginBottom: 8 }}><NumCount to={4770} delay={d(A.s5b) + 6} fmt={(n) => "約" + n.toLocaleString() + "万"} /></div>
          <div style={{ height: 470, width: 210, margin: "0 auto", background: `linear-gradient(180deg, ${C.green}, #46B07E)`, borderRadius: "16px 16px 0 0", transform: `scaleY(${barInv})`, transformOrigin: "bottom", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 12, boxShadow: `0 10px 30px ${C.green}44` }}>
            <Slot emoji="📈" img="infure_hand_up" size={118} delay={d(A.s5b) + 12} bg="#fff" ring={C.green} float={3} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, marginTop: 8 }}>年5%で運用できたら</div>
          <div style={{ fontSize: 21, fontWeight: 800, color: C.sub }}>（あくまで仮定）</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1040, left: 0, width: 1080, textAlign: "center", transform: `scale(${diffPulse})`, transformOrigin: "center" }}>
        <Pop delay={d(A.s5b) + 110} damp={9}>
          <span style={{ fontSize: 44, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 18, padding: "14px 34px", display: "inline-block", boxShadow: `0 10px 26px ${C.red}55` }}>差は <NumCount to={2188} delay={d(A.s5b) + 114} fmt={(n) => "約" + n.toLocaleString() + "万円"} /></span>
        </Pop>
      </div>
      <Pop delay={d(A.s5c)} style={{ position: "absolute", top: 1170, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 36, fontWeight: 900, color: C.ink, background: C.goldBg, border: `3px solid ${C.gold}`, borderRadius: 16, padding: "12px 32px", display: "inline-block" }}>お金の「置き場」を変えただけ</span>
      </Pop>
      <Note lines={["※年5%は あくまで仮定で、将来の利回りを保証するものではありません", "※投資にはリスクがあり、元本割れの可能性があります", "※複利の試算の目安。税・手数料は考慮していません"]} top={1320} />
    </AbsoluteFill>
  );
};

// ───────── P5：選択肢が広がる（放射ツリー＝中心から線で分岐） ─────────
const P5: React.FC = () => {
  const d = (g: number) => g - PG.p5.from;
  const cpulse = usePulse(0.06, 8);
  const CX = 540, CY = 660; // 中心
  const nodes = [
    { x: 268, y: 408, t: "教育費", img: "infure_grad", g: A.s6a, k: 10 },
    { x: 812, y: 408, t: "老後", img: "infure_senior", g: A.s6a, k: 24 },
    { x: 268, y: 858, t: "旅行", img: "infure_travel", g: A.s6b, k: 6 },
    { x: 812, y: 858, t: "子ども", img: "infure_family", g: A.s6b, k: 18 },
  ];
  return (
    <AbsoluteFill>
      <Head kicker="この数千万円があれば" title={<>将来の<span style={{ color: C.green }}>選択肢</span>が、ぐっと広がる</>} kc={C.green} />
      {/* 中心→各ノードへ線を引く */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {nodes.map((n, i) => (
          <Draw key={i} d={`M${CX} ${CY} L${n.x} ${n.y}`} delay={d(n.g) + n.k - 4} dur={10} color={C.green} w={6} />
        ))}
      </svg>
      {/* 4分岐ノード */}
      {nodes.map((n, i) => (
        <div key={i} style={{ position: "absolute", left: n.x - 112, top: n.y - 112, width: 224, textAlign: "center" }}>
          <Pop delay={d(n.g) + n.k}>
            <div style={{ width: 200, height: 200, margin: "0 auto", background: "#fff", border: `4px solid ${C.green}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(31,58,95,0.12)" }}>
              <Slot emoji="⭐" img={n.img} size={132} delay={d(n.g) + n.k + 3} float={3} />
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.ink, marginTop: 8 }}>{n.t}</div>
          </Pop>
        </div>
      ))}
      {/* 中心ノード */}
      <div style={{ position: "absolute", left: CX - 150, top: CY - 150, width: 300, textAlign: "center", transform: `scale(${cpulse})`, transformOrigin: "center" }}>
        <Pop delay={d(A.s6a)} damp={10}>
          <div style={{ width: 300, height: 300, margin: "0 auto", background: `radial-gradient(circle at 50% 35%, #46B07E, ${C.green})`, border: "5px solid #fff", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 16px 40px ${C.green}66` }}>
            <Slot emoji="💰" img="infure_hand_up" size={120} delay={d(A.s6a) + 3} float={4} />
            <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", marginTop: 2 }}>増えたお金</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#EAF7F0" }}>（数千万円）</div>
          </div>
        </Pop>
      </div>
      {/* 結論帯 */}
      <div style={{ position: "absolute", top: 1230, left: 0, width: 1080, textAlign: "center" }}>
        <Pop delay={d(A.s6c)}>
          <span style={{ fontSize: 40, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 18, padding: "18px 40px", display: "inline-block", boxShadow: `0 10px 26px ${C.green}44` }}>置き場を変えるだけで、人生の選択肢が広がる</span>
        </Pop>
      </div>
      <Note lines={["※効果や必要額は家庭の状況によって異なります"]} top={1400} />
    </AbsoluteFill>
  );
};

// ───────── P6：締め＝お金の置き場を確認 ─────────
const P6: React.FC = () => {
  const d = (g: number) => g - PG.p6.from;
  const qPulse = usePulse(0.07, 7);
  const examples = ["積立保険", "学資保険", "変額保険", "個人年金", "確定拠出年金"];
  return (
    <AbsoluteFill>
      <Head kicker="まずは、ここから" title={<>今ある<span style={{ color: C.gold }}>お金の置き場</span>を確認</>} kc={C.gold} />
      {/* ① 銀行のお金 */}
      <Pop delay={d(A.s7b)} style={{ position: "absolute", top: 296, left: 80, width: 920 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#fff", border: `3px solid ${C.blue}`, borderRadius: 24, padding: "20px 26px", boxShadow: "0 8px 20px rgba(31,58,95,0.08)" }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: C.blue }}>①</div>
          <Slot emoji="🏦" img="infure_bank2" size={118} delay={d(A.s7b) + 4} float={3} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.blue }}>銀行のお金</div>
            <div style={{ fontSize: 38, fontWeight: 900, color: C.ink }}>金利は 何%？</div>
          </div>
        </div>
      </Pop>
      {/* ② 銀行以外のお金 ＋ 例チップ */}
      <Pop delay={d(A.s7c)} style={{ position: "absolute", top: 492, left: 80, width: 920 }}>
        <div style={{ background: "#fff", border: `3px solid ${C.orange}`, borderRadius: 24, padding: "20px 26px", boxShadow: "0 8px 20px rgba(31,58,95,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: C.orange }}>②</div>
            <Slot emoji="🐖" img="infure_insurance" size={118} delay={d(A.s7c) + 4} float={3} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.orange }}>銀行以外に置いてあるお金</div>
              <div style={{ fontSize: 38, fontWeight: 900, color: C.ink }}>利回りは 何%？</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 16 }}>
            {examples.map((e, i) => (
              <Pop key={i} delay={d(A.s7c) + 10 + i * 4}>
                <span style={{ fontSize: 24, fontWeight: 900, color: C.orange, background: C.goldBg, border: `2px solid ${C.gold}`, borderRadius: 999, padding: "8px 18px" }}>{e}</span>
              </Pop>
            ))}
            <Pop delay={d(A.s7c) + 10 + examples.length * 4}>
              <span style={{ fontSize: 24, fontWeight: 900, color: C.sub, padding: "8px 6px" }}>など</span>
            </Pop>
          </div>
        </div>
      </Pop>
      {/* 締め問い */}
      <div style={{ position: "absolute", top: 900, left: 0, width: 1080, textAlign: "center", transform: `scale(${qPulse})`, transformOrigin: "center" }}>
        <Pop delay={d(A.s7d)} damp={10}>
          <Slot emoji="📱" img="infure_phone" size={176} delay={d(A.s7d) + 2} style={{ margin: "0 auto 16px" }} />
          <div style={{ fontSize: 42, fontWeight: 900, color: C.ink, lineHeight: 1.3 }}>あなたのお金は、今年</div>
          <div style={{ fontSize: 80, fontWeight: 900, color: C.red, marginTop: 6 }}>何%で増えてる？</div>
        </Pop>
      </div>
      <Note lines={["※利率・利回りは商品や時期によって異なります", "※特定商品の勧誘ではありません。制度・数字は目安です"]} top={1640} />
    </AbsoluteFill>
  );
};

export const InfureReel: React.FC<{ audio?: "full" | "voice" | "sfx" }> = ({ audio = "full" }) => {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <Bg />
      {audio !== "sfx" && <Audio src={staticFile("infure_narration.wav")} />}
      {audio !== "voice" && <SfxTrack cues={SFX} gain={SFX_GAIN} />}
      <Sequence from={PG.p1.from} durationInFrames={PG.p1.dur}><P1 /></Sequence>
      <Sequence from={PG.p2.from} durationInFrames={PG.p2.dur}><P2 /></Sequence>
      <Sequence from={PG.p3a.from} durationInFrames={PG.p3a.dur}><P3a /></Sequence>
      <Sequence from={PG.p3b.from} durationInFrames={PG.p3b.dur}><P3b /></Sequence>
      <Sequence from={PG.p4.from} durationInFrames={PG.p4.dur}><P4 /></Sequence>
      <Sequence from={PG.p5.from} durationInFrames={PG.p5.dur}><P5 /></Sequence>
      <Sequence from={PG.p6.from} durationInFrames={PG.p6.dur}><P6 /></Sequence>
    </AbsoluteFill>
  );
};
