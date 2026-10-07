import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";

// ═══════════════════════════════════════════════════════════════════
// インフレ／お金の置き場リール（太一さん・録音ナレ74.0sに全同期）
//   録音：日銀がわざと物価を上げている → 良い/悪いインフレ → インフレ負け
//        → お金が増える場所に置く → 毎月5万×30年の差(山場) → 選択肢が広がる
//        → まずは置き場を確認（金利/利回り/何%で増えてる？）
//   断定回避：運用5%は「あくまで仮定・保証なし・元本割れの可能性」を※で明記。
//   図解の craft はこちら持ち（ベクター/アニメ）。ポップ絵は後で GenImg 枠に差替。
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
  p1: { from: A.s1a, dur: A.s2a - A.s1a },      // 0..290  日銀/目標/良いインフレ
  p2: { from: A.s2a, dur: A.s3a - A.s2a },      // 290..509 良い/悪いインフレ
  p3: { from: A.s3a, dur: A.s4 - A.s3a },       // 509..988 インフレ負け
  p4: { from: A.s4, dur: A.s6a - A.s4 },        // 988..1479 置き場の差(山場)
  p5: { from: A.s6a, dur: A.s7a - A.s6a },      // 1479..1814 選択肢が広がる
  p6: { from: A.s7a, dur: INFURE_FRAMES - A.s7a }, // 1814..end 締め・確認
};

// ── 効果音（必ず sfx-library.md の user/u* から。中音主役・高音キメ1回） ──
const SFX = [
  { file: "user/u05", at: A.s1a + 2, volume: 0.4 },
  { file: "user/u06", at: A.s1b + 2, volume: 0.34 },
  { file: "user/u02s", at: A.s1c + 2, volume: 0.4 },
  { file: "user/u03", at: A.s2a + 2, volume: 0.4 },
  { file: "user/u08", at: A.s2b + 4, volume: 0.4 },     // 悪いインフレ×（高・1回）
  { file: "user/u03", at: A.s3a + 2, volume: 0.4 },     // 問い・転換
  { file: "user/u02s", at: A.s3b + 2, volume: 0.38 },
  { file: "user/u02s", at: A.s3c + 2, volume: 0.38 },
  { file: "user/u04", at: A.s3d + 2, volume: 0.42 },    // インフレ負けキメ（高・1回）
  { file: "user/u02s", at: A.s3e + 2, volume: 0.32 },
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
// ポップ絵スロット：実画像(gen/*.png)が来たら src を差し替え。今は絵文字プレースホルダ。
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
const Head: React.FC<{ kicker: string; title: React.ReactNode; kc?: string }> = ({ kicker, title, kc = C.red }) => (
  <Pop delay={2} style={{ position: "absolute", top: 96, left: 0, width: 1080, textAlign: "center" }}>
    <div style={{ fontSize: 28, fontWeight: 900, color: kc, letterSpacing: 1 }}>{kicker}</div>
    <div style={{ fontSize: 48, fontWeight: 900, color: C.ink, marginTop: 8, lineHeight: 1.22 }}>{title}</div>
  </Pop>
);
const Note: React.FC<{ lines: string[]; top?: number }> = ({ lines, top = 1700 }) => (
  <Pop delay={30} style={{ position: "absolute", top, left: 90, width: 900, textAlign: "left" }}>
    {lines.map((n, i) => (<div key={i} style={{ fontSize: 19, fontWeight: 700, color: C.gray, marginBottom: 5, lineHeight: 1.35 }}>{n}</div>))}
  </Pop>
);

// ───────── P1：日銀がわざと物価を上げている ─────────
const P1: React.FC = () => {
  const risePulse = usePulse(0.06, 8);
  return (
    <AbsoluteFill>
      <Head kicker="まず前提の話" title={<>日本の物価は、<br /><span style={{ color: C.red }}>日銀が「わざと」</span>上げている</>} />
      {/* 日銀＋物価↑ */}
      <div style={{ position: "absolute", top: 300, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 44 }}>
        <Slot emoji="🏦" size={200} delay={4} bg={C.blueBg} ring={C.blue} />
        <svg width={150} height={200} style={{ overflow: "visible" }}>
          <Draw d="M30 150 L120 50" delay={20} color={C.red} w={10} />
          <Draw d="M120 50 L96 54 M120 50 L116 78" delay={30} color={C.red} w={10} />
        </svg>
        <div style={{ transform: `scale(${risePulse})` }}>
          <Slot emoji="🛒" size={190} delay={10} bg={C.goldBg} ring={C.gold} />
        </div>
      </div>
      {/* 目標 2% / ここ数年 2〜3% */}
      <Pop delay={A.s1b - PG.p1.from} style={{ position: "absolute", top: 560, left: 90, width: 900 }}>
        <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
          <div style={{ flex: 1, background: "#fff", border: `3px solid ${C.blue}`, borderRadius: 20, padding: "20px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.sub }}>日銀の目標</div>
            <div style={{ fontSize: 60, fontWeight: 900, color: C.blue }}>年+2<span style={{ fontSize: 40 }}>%</span></div>
          </div>
          <div style={{ flex: 1, background: "#fff", border: `3px solid ${C.orange}`, borderRadius: 20, padding: "20px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.sub }}>ここ数年</div>
            <div style={{ fontSize: 60, fontWeight: 900, color: C.orange }}>+2〜3<span style={{ fontSize: 40 }}>%</span></div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.orange }}>上昇中 ↑</div>
          </div>
        </div>
      </Pop>
      {/* 狙いは良いインフレ */}
      <Pop delay={A.s1c - PG.p1.from} style={{ position: "absolute", top: 820, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 999, padding: "14px 40px", display: "inline-block", boxShadow: `0 10px 24px ${C.green}44` }}>狙いは「良いインフレ」🌱</span>
      </Pop>
      <Note lines={["※インフレ＝物価が続けて上がること", "※日銀＝日本銀行（物価の番人）"]} top={1640} />
    </AbsoluteFill>
  );
};

// ───────── P2：良いインフレ vs 悪いインフレ ─────────
const P2: React.FC = () => {
  const badPulse = usePulse(0.05, 7);
  const good = [{ e: "🛒", t: "物価↑" }, { e: "💴", t: "給料↑" }, { e: "😊", t: "みんな豊か" }];
  return (
    <AbsoluteFill>
      <Head kicker="本当はこうなるはず" title={<><span style={{ color: C.green }}>良いインフレ</span>の理想</>} kc={C.green} />
      {/* 良い：循環3ステップ */}
      <div style={{ position: "absolute", top: 300, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
        {good.map((g, i) => (
          <React.Fragment key={i}>
            <Slot emoji={g.e} size={150} delay={6 + i * 10} bg={C.greenBg} ring={C.green} />
            {i < 2 && <Pop delay={14 + i * 10}><span style={{ fontSize: 40, color: C.green, fontWeight: 900 }}>→</span></Pop>}
          </React.Fragment>
        ))}
      </div>
      <Pop delay={10} style={{ position: "absolute", top: 470, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 72 }}>
          {good.map((g, i) => <div key={i} style={{ fontSize: 26, fontWeight: 900, color: C.green, width: 150 }}>{g.t}</div>)}
        </div>
      </Pop>
      {/* でも現実＝悪いインフレ */}
      <Pop delay={A.s2b - PG.p2.from} style={{ position: "absolute", top: 600, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: C.ink }}>でも<span style={{ color: C.red }}>現実は…</span></div>
      </Pop>
      <div style={{ position: "absolute", top: 680, left: 90, width: 900, transform: `scale(${badPulse})`, transformOrigin: "center" }}>
        <Pop delay={A.s2b - PG.p2.from + 6}>
          <div style={{ background: C.redBg, border: `4px solid ${C.red}`, borderRadius: 22, padding: "22px 20px", boxShadow: `0 10px 26px ${C.red}33` }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 30, alignItems: "center", marginBottom: 12 }}>
              <div style={{ textAlign: "center" }}><Slot emoji="💴" size={110} delay={A.s2b - PG.p2.from + 8} bg="#fff" ring={C.red} /><div style={{ fontSize: 24, fontWeight: 900, color: C.ink, marginTop: 4 }}>給料は横ばい</div></div>
              <div style={{ textAlign: "center" }}><Slot emoji="😣" size={110} delay={A.s2b - PG.p2.from + 14} bg="#fff" ring={C.red} /><div style={{ fontSize: 24, fontWeight: 900, color: C.ink, marginTop: 4 }}>負担は増える一方</div></div>
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: C.red }}>＝ 今は「悪いインフレ」</div>
          </div>
        </Pop>
      </div>
      <Note lines={["※景気や賃金の感じ方には個人差があります"]} top={1660} />
    </AbsoluteFill>
  );
};

// ───────── P3：2%上がるとどうなる？インフレ負け ─────────
const P3: React.FC = () => {
  const d = (g: number) => g - PG.p3.from;
  const valuePulse = usePulse(0.05, 7);
  return (
    <AbsoluteFill>
      <Head kicker="じゃあ2%上がると？" title={<>銀行に置いたお金は<br /><span style={{ color: C.red }}>「インフレ負け」</span></>} />
      {/* 左：モノの値段↑ / 右：銀行のお金 */}
      <div style={{ position: "absolute", top: 300, left: 60, width: 960, display: "flex", gap: 24 }}>
        {/* モノ */}
        <Pop delay={d(A.s3b)} style={{ flex: 1 }}>
          <div style={{ background: "#fff", border: `3px solid ${C.orange}`, borderRadius: 20, padding: "18px 12px", textAlign: "center" }}>
            <Slot emoji="🛒" size={100} delay={d(A.s3b) + 4} bg={C.goldBg} ring={C.orange} style={{ margin: "0 auto" }} />
            <div style={{ fontSize: 23, fontWeight: 900, color: C.sub, marginTop: 6 }}>モノの値段</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: C.ink }}>1,000円</div>
            <div style={{ fontSize: 30, color: C.orange, fontWeight: 900 }}>↓ 来年</div>
            <div style={{ fontSize: 46, fontWeight: 900, color: C.orange }}><NumCount to={1020} delay={d(A.s3b) + 10} fmt={(n) => n.toLocaleString() + "円"} /></div>
          </div>
        </Pop>
        {/* 銀行 */}
        <Pop delay={d(A.s3c)} style={{ flex: 1 }}>
          <div style={{ background: "#fff", border: `3px solid ${C.blue}`, borderRadius: 20, padding: "18px 12px", textAlign: "center" }}>
            <Slot emoji="🏦" size={100} delay={d(A.s3c) + 4} bg={C.blueBg} ring={C.blue} style={{ margin: "0 auto" }} />
            <div style={{ fontSize: 23, fontWeight: 900, color: C.sub, marginTop: 6 }}>銀行のお金</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: C.ink }}>1,000円</div>
            <div style={{ fontSize: 30, color: C.blue, fontWeight: 900 }}>↓ 1年</div>
            <div style={{ fontSize: 46, fontWeight: 900, color: C.blue }}><NumCount to={1004} delay={d(A.s3c) + 10} fmt={(n) => n.toLocaleString() + "円"} /></div>
          </div>
        </Pop>
      </div>
      {/* 買えない */}
      <Pop delay={d(A.s3c) + 20} style={{ position: "absolute", top: 760, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: C.ink, background: "#fff", border: `2px dashed ${C.red}`, borderRadius: 14, padding: "10px 22px" }}>1,020円のものは <span style={{ color: C.red }}>1,004円では買えない</span></span>
      </Pop>
      {/* インフレ負け */}
      <Pop delay={d(A.s3d)} style={{ position: "absolute", top: 860, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 18, padding: "14px 40px", display: "inline-block", boxShadow: `0 10px 26px ${C.red}44` }}>これが「インフレ負け」</span>
      </Pop>
      {/* 数は減らない / 価値が減る */}
      <div style={{ position: "absolute", top: 990, left: 90, width: 900, display: "flex", gap: 20 }}>
        <Pop delay={d(A.s3d) + 10} style={{ flex: 1 }}>
          <div style={{ background: C.greenBg, border: `3px solid ${C.green}`, borderRadius: 16, padding: "16px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.green }}>お金の「数」</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>減らない</div>
          </div>
        </Pop>
        <div style={{ flex: 1, transform: `scale(${valuePulse})`, transformOrigin: "center" }}>
          <Pop delay={d(A.s3e)}>
            <div style={{ background: C.redBg, border: `3px solid ${C.red}`, borderRadius: 16, padding: "16px 10px", textAlign: "center", boxShadow: `0 8px 20px ${C.red}33` }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.red }}>お金の「価値」</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>目減りする</div>
            </div>
          </Pop>
        </div>
      </div>
      <Note lines={["※金利・物価の数字はイメージの目安です", "※銀行金利は金融機関・時期で異なります"]} top={1660} />
    </AbsoluteFill>
  );
};

// ───────── P4：山場＝お金の置き場で差（毎月5万×30年） ─────────
const P4: React.FC = () => {
  const d = (g: number) => g - PG.p4.from;
  const f = useCurrentFrame();
  const diffPulse = usePulse(0.06, 7);
  // 棒の伸び
  const barBank = interpolate(f, [d(A.s5a) + 6, d(A.s5a) + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barInv = interpolate(f, [d(A.s5b) + 6, d(A.s5b) + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {/* 転換：だからお金が増える場所に */}
      <Pop delay={2} style={{ position: "absolute", top: 100, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.green }}>物価の上がり方より</div>
        <div style={{ fontSize: 46, fontWeight: 900, color: C.ink, marginTop: 6 }}><span style={{ color: C.green }}>お金が増える場所</span>に置く</div>
      </Pop>
      {/* 条件バッジ */}
      <Pop delay={d(A.s5a)} style={{ position: "absolute", top: 258, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: C.ink, background: "#fff", border: `3px solid ${C.orange}`, borderRadius: 999, padding: "10px 30px" }}>毎月 5万円 × 30年 なら</span>
      </Pop>
      {/* 2本の棒グラフ */}
      <div style={{ position: "absolute", top: 380, left: 90, width: 900, height: 620, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 90 }}>
        {/* 銀行 */}
        <div style={{ textAlign: "center", width: 300 }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: C.blue, marginBottom: 8 }}><NumCount to={1889} delay={d(A.s5a) + 6} fmt={(n) => "約" + n.toLocaleString() + "万"} /></div>
          <div style={{ height: 300 * 0.40, maxHeight: 220, width: 200, margin: "0 auto", background: C.blue, borderRadius: "14px 14px 0 0", transform: `scaleY(${barBank})`, transformOrigin: "bottom", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 10 }}>
            <Slot emoji="🏦" size={78} delay={d(A.s5a) + 10} bg="#fff" ring={C.blue} float={3} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.ink, marginTop: 8 }}>銀行のまま</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.sub }}>（元本1,800万）</div>
        </div>
        {/* 運用 */}
        <div style={{ textAlign: "center", width: 300 }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: C.green, marginBottom: 8 }}><NumCount to={4770} delay={d(A.s5b) + 6} fmt={(n) => "約" + n.toLocaleString() + "万"} /></div>
          <div style={{ height: 460, width: 200, margin: "0 auto", background: `linear-gradient(180deg, ${C.green}, #46B07E)`, borderRadius: "14px 14px 0 0", transform: `scaleY(${barInv})`, transformOrigin: "bottom", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 10, boxShadow: `0 10px 30px ${C.green}44` }}>
            <Slot emoji="📈" size={78} delay={d(A.s5b) + 12} bg="#fff" ring={C.green} float={3} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.ink, marginTop: 8 }}>年5%で運用できたら</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.sub }}>（あくまで仮定）</div>
        </div>
      </div>
      {/* 差2,188万 */}
      <div style={{ position: "absolute", top: 1030, left: 0, width: 1080, textAlign: "center", transform: `scale(${diffPulse})`, transformOrigin: "center" }}>
        <Pop delay={d(A.s5b) + 110} damp={9}>
          <span style={{ fontSize: 40, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 18, padding: "12px 30px", display: "inline-block", boxShadow: `0 10px 26px ${C.red}55` }}>差は <NumCount to={2188} delay={d(A.s5b) + 114} fmt={(n) => "約" + n.toLocaleString() + "万円"} /></span>
        </Pop>
      </div>
      {/* 結論帯 */}
      <Pop delay={d(A.s5c)} style={{ position: "absolute", top: 1150, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: C.ink, background: C.goldBg, border: `3px solid ${C.gold}`, borderRadius: 16, padding: "12px 30px", display: "inline-block" }}>お金の「置き場」を変えただけ</span>
      </Pop>
      <Note lines={["※年5%は あくまで仮定で、将来の利回りを保証するものではありません", "※投資にはリスクがあり、元本割れの可能性があります", "※複利の試算の目安。税・手数料は考慮していません"]} top={1300} />
    </AbsoluteFill>
  );
};

// ───────── P5：選択肢が広がる ─────────
const P5: React.FC = () => {
  const d = (g: number) => g - PG.p5.from;
  const cards = [
    { e: "🎓", t: "教育費", g: A.s6a }, { e: "👴", t: "老後", g: A.s6a },
    { e: "✈️", t: "旅行", g: A.s6b }, { e: "👨‍👩‍👧", t: "子ども", g: A.s6b },
  ];
  const widen = usePulse(0.05, 8);
  return (
    <AbsoluteFill>
      <Head kicker="この数千万円があれば" title={<>将来の<span style={{ color: C.green }}>選択肢</span>が広がる</>} kc={C.green} />
      <div style={{ position: "absolute", top: 320, left: 90, width: 900, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
        {cards.map((c, i) => (
          <Pop key={i} delay={d(c.g) + i % 2 * 8}>
            <div style={{ background: "#fff", border: `3px solid ${C.green}`, borderRadius: 24, padding: "26px 10px", textAlign: "center", boxShadow: "0 8px 20px rgba(31,58,95,0.08)" }}>
              <Slot emoji={c.e} size={120} delay={d(c.g) + i % 2 * 8 + 4} bg={C.greenBg} ring={C.green} style={{ margin: "0 auto" }} />
              <div style={{ fontSize: 34, fontWeight: 900, color: C.ink, marginTop: 10 }}>{c.t}</div>
            </div>
          </Pop>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1080, left: 0, width: 1080, textAlign: "center", transform: `scale(${widen})`, transformOrigin: "center" }}>
        <Pop delay={d(A.s6c)}>
          <span style={{ fontSize: 38, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 18, padding: "16px 36px", display: "inline-block", boxShadow: `0 10px 26px ${C.green}44` }}>置き場を変えるだけで、人生の選択肢が広がる</span>
        </Pop>
      </div>
      <Note lines={["※効果や必要額は家庭の状況によって異なります"]} top={1280} />
    </AbsoluteFill>
  );
};

// ───────── P6：締め＝お金の置き場を確認 ─────────
const P6: React.FC = () => {
  const d = (g: number) => g - PG.p6.from;
  const qPulse = usePulse(0.06, 7);
  const checks = [
    { n: "①", t: "銀行の金利は 何%？", e: "🏦", g: A.s7b, c: C.blue },
    { n: "②", t: "積立保険の利回りは 何%？", e: "📄", g: A.s7c, c: C.orange },
  ];
  return (
    <AbsoluteFill>
      <Head kicker="まずは、ここから" title={<>今ある<span style={{ color: C.gold }}>お金の置き場</span>を確認</>} kc={C.gold} />
      <div style={{ position: "absolute", top: 320, left: 90, width: 900 }}>
        {checks.map((c, i) => (
          <Pop key={i} delay={d(c.g)} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#fff", border: `3px solid ${c.c}`, borderRadius: 22, padding: "20px 24px", boxShadow: "0 8px 20px rgba(31,58,95,0.08)" }}>
              <div style={{ fontSize: 46, fontWeight: 900, color: c.c }}>{c.n}</div>
              <Slot emoji={c.e} size={100} delay={d(c.g) + 4} bg="#fff" ring={c.c} float={3} />
              <div style={{ fontSize: 34, fontWeight: 900, color: C.ink, textAlign: "left" }}>{c.t}</div>
            </div>
          </Pop>
        ))}
      </div>
      {/* 締め問い */}
      <div style={{ position: "absolute", top: 760, left: 0, width: 1080, textAlign: "center", transform: `scale(${qPulse})`, transformOrigin: "center" }}>
        <Pop delay={d(A.s7d)} damp={10}>
          <Slot emoji="🔍" size={130} delay={d(A.s7d) + 2} bg={C.goldBg} ring={C.gold} style={{ margin: "0 auto 16px" }} />
          <div style={{ fontSize: 40, fontWeight: 900, color: C.ink, lineHeight: 1.3 }}>あなたのお金は、今年</div>
          <div style={{ fontSize: 72, fontWeight: 900, color: C.red, marginTop: 4 }}>何%で増えてる？</div>
        </Pop>
      </div>
      <Note lines={["※利率・利回りは商品や時期によって異なります", "※特定商品の勧誘ではありません。制度・数字は目安です"]} top={1660} />
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
      <Sequence from={PG.p3.from} durationInFrames={PG.p3.dur}><P3 /></Sequence>
      <Sequence from={PG.p4.from} durationInFrames={PG.p4.dur}><P4 /></Sequence>
      <Sequence from={PG.p5.from} durationInFrames={PG.p5.dur}><P5 /></Sequence>
      <Sequence from={PG.p6.from} durationInFrames={PG.p6.dur}><P6 /></Sequence>
    </AbsoluteFill>
  );
};
