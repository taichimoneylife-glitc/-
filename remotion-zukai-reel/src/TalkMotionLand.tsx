import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT } from "./components/font";

// ═══════════════════════════════════════════════════════════════════
// トーク台本のモーショングラフィック（ランドスケープ 1920×1080・声に同期）
//   台本：銀行の100万円が30年で実質4割減かも → なぜ資産運用？ → 昔は投資なんて側
//         → 口座めんどくさい/積立は月1,000円から → 今はやってよかった → 置き場を考えて
//   断定回避：4割減は「年2%で計算した目安・かもしれません」と明記。
// ═══════════════════════════════════════════════════════════════════
const C = {
  bg: "#FCFBF7", ink: "#1F3A5F", sub: "#5B6B7F",
  orange: "#E8912D", red: "#E0483B", green: "#2E9E6B",
  blue: "#3B7DD8", gold: "#E0A72E", gray: "#AEB8C2", line: "#C9D2DD",
  greenBg: "#E4F3EC", redBg: "#FCE6E3", goldBg: "#FBF1D9", blueBg: "#E7F0FB",
};
const FPS = 30;
const s2f = (s: number) => Math.round(s * FPS);
const A = {
  shock: 0, bank: 0.96, m100: 1.82, y30: 2.46, yon: 3.72, kachi: 4.4, kamo: 5.34,
  naze: 5.86, kaisetsu: 8.8, shoujiki: 9.98, toushi: 11.82,
  kouza: 14.0, mendo: 15.5, tsumi: 17.18, sen: 19.1,
  demo: 20.42, yokatta: 22.06, imaichido: 23.46, okane: 23.92, kangaete: 24.9,
};
export const LAND_FRAMES = s2f(26.2) + 20; // ≈806
const PG = {
  s1: { from: 0, dur: s2f(A.naze) },
  s2: { from: s2f(A.naze), dur: s2f(A.kouza) - s2f(A.naze) },
  s3: { from: s2f(A.kouza), dur: s2f(A.demo) - s2f(A.kouza) },
  s4: { from: s2f(A.demo), dur: LAND_FRAMES - s2f(A.demo) },
};

// ───── モーション部品 ─────
const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode; damp?: number; y?: number }> = ({ delay, style, children, damp = 13, y = 26 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: damp, stiffness: 150, mass: 0.8 }, durationInFrames: 14 });
  return <div style={{ opacity: Math.min(1, s * 1.8), transform: `translateY(${(1 - s) * y}px) scale(${0.96 + s * 0.04})`, ...style }}>{children}</div>;
};
const usePulse = (amp = 0.05, spd = 7) => { const f = useCurrentFrame(); return 1 + (Math.sin(f / spd) * 0.5 + 0.5) * amp; };
const NumCount: React.FC<{ to: number; delay: number; dur?: number; fmt?: (n: number) => string; style?: React.CSSProperties }> = ({ to, delay, dur = 20, fmt, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const v = Math.round(to * (1 - Math.pow(1 - p, 3)));
  return <span style={style}>{fmt ? fmt(v) : v.toLocaleString()}</span>;
};
// マーカー下線（語の裏を左→右に引く）
const Mark: React.FC<{ delay: number; color?: string; children: React.ReactNode; dur?: number }> = ({ delay, color = C.gold, children, dur = 12 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ position: "absolute", left: -4, right: -4, bottom: 6, height: "34%", background: color, opacity: 0.32, transform: `scaleX(${p})`, transformOrigin: "left center", borderRadius: 4 }} />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};
const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, spd: number, col: string, sz: number, amp: number) => ({
    position: "absolute" as const, width: sz, height: sz, borderRadius: "50%", background: col,
    filter: "blur(120px)", left: x + Math.sin(f / spd) * amp, top: y + Math.cos(f / (spd * 1.2)) * amp, opacity: 0.5,
  });
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% -10%, #FFFDF8 0%, #FAF6EC 55%, #F1EBDD 100%)" }} />
      <div style={blob(180, 160, 60, "#F7E4C6", 620, 30)} />
      <div style={blob(1320, 620, 72, "#DCEBF8", 680, 36)} />
      <div style={blob(760, 760, 64, "#E7F3EC", 560, 30)} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(#1F3A5F14 1.5px, transparent 1.5px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(75% 70% at 50% 45%, #000 40%, transparent 100%)", WebkitMaskImage: "radial-gradient(75% 70% at 50% 45%, #000 40%, transparent 100%)", opacity: 0.5 }} />
    </>
  );
};
const Brand: React.FC = () => (
  <div style={{ position: "absolute", right: 48, bottom: 40, fontSize: 26, fontWeight: 900, color: C.gray, letterSpacing: 1 }}>@taichi__moneylife</div>
);
const useKen = (amp = 0.03, spd = 240) => { const f = useCurrentFrame(); return 1 + (f / spd) * amp; }; // 緩ズーム

// ───── S1：衝撃＝100万円が30年で実質4割減 ─────
const S1: React.FC = () => {
  const d = (g: number) => s2f(g) - PG.s1.from;
  const f = useCurrentFrame();
  const ken = useKen();
  // グラフ座標（右側）
  const GX0 = 1050, GX1 = 1760, GY0 = 760, GY1 = 300;
  const fyV = (v: number) => GY0 - (v - 50) / (108 - 50) * (GY0 - GY1);
  const draw = interpolate(f, [d(A.y30), d(A.y30) + 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x2 = GX0 + (GX1 - GX0) * draw;
  const y2 = fyV(100) + (fyV(55) - fyV(100)) * draw;
  const gap = interpolate(f, [d(A.kachi), d(A.kachi) + 16], [0, 0.16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kamoP = usePulse(0.05, 7);
  return (
    <AbsoluteFill style={{ transform: `scale(${ken})`, transformOrigin: "50% 45%" }}>
      {/* 左：メッセージ */}
      <Pop delay={d(A.shock)} style={{ position: "absolute", top: 150, left: 110, width: 820 }}>
        <span style={{ fontSize: 56, fontWeight: 900, color: C.red }}>衝撃でした。</span>
      </Pop>
      <Pop delay={d(A.bank)} style={{ position: "absolute", top: 260, left: 110, width: 860 }}>
        <div style={{ fontSize: 50, fontWeight: 900, color: C.ink, lineHeight: 1.3 }}>銀行に置いた</div>
      </Pop>
      <Pop delay={d(A.m100)} style={{ position: "absolute", top: 336, left: 110, width: 860 }}>
        <div style={{ fontSize: 120, fontWeight: 900, color: C.ink, lineHeight: 1 }}>100<span style={{ fontSize: 70 }}>万円</span></div>
      </Pop>
      <Pop delay={d(A.kachi)} style={{ position: "absolute", top: 520, left: 110, width: 860 }}>
        <div style={{ fontSize: 46, fontWeight: 900, color: C.ink, lineHeight: 1.35 }}>30年後には、価値が<br /><Mark delay={d(A.yon)} color={C.red}><span style={{ color: C.red, fontSize: 64 }}>約4割</span></Mark> 減っているかも</div>
      </Pop>
      <div style={{ position: "absolute", top: 760, left: 110, transform: `scale(${kamoP})`, transformOrigin: "left center" }}>
        <Pop delay={d(A.kamo)}>
          <span style={{ fontSize: 30, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 999, padding: "8px 26px" }}>＝ 持ってるだけで目減り</span>
        </Pop>
      </div>
      {/* 右：下降グラフ（実質価値） */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <line x1={GX0} y1={GY0} x2={GX1} y2={GY0} stroke={C.ink} strokeWidth={4} />
        <line x1={GX0} y1={GY0} x2={GX0} y2={GY1} stroke={C.ink} strokeWidth={4} />
        <text x={GX0} y={GY0 + 44} fontSize={28} fontWeight={900} fill={C.sub} textAnchor="middle">今</text>
        <text x={GX1} y={GY0 + 44} fontSize={28} fontWeight={900} fill={C.sub} textAnchor="middle">30年後</text>
        {/* 元の価値ライン（点線・水平） */}
        <line x1={GX0} y1={fyV(100)} x2={GX1} y2={fyV(100)} stroke={C.gray} strokeWidth={3} strokeDasharray="8 8" opacity={draw > 0.02 ? 0.7 : 0} />
        {/* 目減り帯 */}
        <rect x={GX1 - 10} y={fyV(100)} width={70} height={Math.max(0, y2 - fyV(100))} fill={C.red} opacity={gap} />
        <circle cx={GX0} cy={fyV(100)} r={11} fill="#fff" stroke={C.ink} strokeWidth={5} />
        <text x={GX0 - 16} y={fyV(100) - 18} fontSize={30} fontWeight={900} fill={C.ink} textAnchor="start">100万円</text>
        {/* 実質価値ライン（下降） */}
        <line x1={GX0} y1={fyV(100)} x2={x2} y2={y2} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
        {draw > 0.9 && <>
          <circle cx={GX1} cy={fyV(55)} r={12} fill={C.red} />
          <text x={GX1 - 6} y={fyV(55) + 54} fontSize={40} fontWeight={900} fill={C.red} textAnchor="end">実質 約<tspan>55</tspan>万円</text>
        </>}
        <text x={GX0 + 18} y={GY1 - 8} fontSize={26} fontWeight={900} fill={C.gray}>お金の"実質価値"</text>
      </svg>
      <div style={{ position: "absolute", bottom: 40, left: 110, fontSize: 22, fontWeight: 700, color: C.gray }}>※年2%の物価上昇で計算した目安。将来を保証するものではありません</div>
      <Brand />
    </AbsoluteFill>
  );
};

// ───── S2：なぜ資産運用？＋昔は投資なんて側 ─────
const S2: React.FC = () => {
  const d = (g: number) => s2f(g) - PG.s2.from;
  const ken = useKen();
  return (
    <AbsoluteFill style={{ transform: `scale(${ken})`, transformOrigin: "50% 45%" }}>
      <Pop delay={d(A.naze)} style={{ position: "absolute", top: 230, left: 0, width: 1920, textAlign: "center" }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: C.sub }}>なぜ、こんなに</div>
        <div style={{ fontSize: 110, fontWeight: 900, color: C.ink, marginTop: 8 }}>「<span style={{ color: C.green }}>資産運用</span>」<span style={{ fontSize: 70 }}>と言われる？</span></div>
      </Pop>
      <Pop delay={d(A.kaisetsu)} style={{ position: "absolute", top: 500, left: 0, width: 1920, textAlign: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.green, borderRadius: 999, padding: "10px 34px" }}>わかりやすく解説します</span>
      </Pop>
      {/* 共感：昔は投資なんて側 */}
      <Pop delay={d(A.shoujiki)} style={{ position: "absolute", top: 680, left: 0, width: 1920, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 20, background: "#fff", border: `3px solid ${C.line}`, borderRadius: 24, padding: "22px 40px", boxShadow: "0 10px 26px rgba(31,58,95,0.08)" }}>
          <span style={{ fontSize: 60 }}>🙅</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: C.sub }}>正直、僕も昔は</div>
            <div style={{ fontSize: 46, fontWeight: 900, color: C.ink }}>「<span style={{ color: C.red }}>投資なんて</span>」って側の人間でした</div>
          </div>
        </div>
      </Pop>
      <Brand />
    </AbsoluteFill>
  );
};

// ───── S3：口座めんどくさい → 積立は月1,000円から ─────
const S3: React.FC = () => {
  const d = (g: number) => s2f(g) - PG.s3.from;
  const ken = useKen();
  const senPulse = usePulse(0.06, 7);
  return (
    <AbsoluteFill style={{ transform: `scale(${ken})`, transformOrigin: "50% 45%" }}>
      <Pop delay={d(A.kouza)} style={{ position: "absolute", top: 170, left: 0, width: 1920, textAlign: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: C.sub }}>最初は、こんな感じ</div>
      </Pop>
      {/* 左：めんどくさい */}
      <Pop delay={d(A.mendo)} style={{ position: "absolute", top: 300, left: 150, width: 760 }}>
        <div style={{ background: "#fff", border: `3px solid ${C.gray}`, borderRadius: 26, padding: "40px 30px", textAlign: "center", boxShadow: "0 10px 26px rgba(31,58,95,0.08)" }}>
          <div style={{ fontSize: 92 }}>😩</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: C.ink, marginTop: 12 }}>証券口座を作るの、</div>
          <div style={{ fontSize: 50, fontWeight: 900, color: C.gray }}>正直めんどくさい</div>
        </div>
      </Pop>
      {/* 矢印 */}
      <Pop delay={d(A.tsumi)} style={{ position: "absolute", top: 470, left: 912, width: 96, textAlign: "center" }}>
        <span style={{ fontSize: 80, fontWeight: 900, color: C.green }}>→</span>
      </Pop>
      {/* 右：月1,000円から */}
      <Pop delay={d(A.tsumi)} style={{ position: "absolute", top: 300, left: 1010, width: 760 }}>
        <div style={{ background: C.greenBg, border: `4px solid ${C.green}`, borderRadius: 26, padding: "40px 30px", textAlign: "center", boxShadow: `0 10px 26px ${C.green}26` }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.green }}>でも、積立は</div>
          <div style={{ transform: `scale(${senPulse})`, transformOrigin: "center", margin: "6px 0" }}>
            <div style={{ fontSize: 92, fontWeight: 900, color: C.ink, lineHeight: 1 }}>月 <NumCount to={1000} delay={d(A.tsumi) + 8} dur={24} fmt={(n) => n.toLocaleString()} /><span style={{ fontSize: 54 }}>円</span></div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.green }}>から始めました</div>
        </div>
      </Pop>
      <Pop delay={d(A.sen) + 20} style={{ position: "absolute", top: 860, left: 0, width: 1920, textAlign: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: C.ink, background: C.goldBg, border: `3px solid ${C.gold}`, borderRadius: 16, padding: "12px 32px" }}>小さく始めれば、こわくない</span>
      </Pop>
      <Brand />
    </AbsoluteFill>
  );
};

// ───── S4：今はやってよかった → お金の置き場を考えて ─────
const S4: React.FC = () => {
  const d = (g: number) => s2f(g) - PG.s4.from;
  const ken = useKen();
  const ctaPulse = usePulse(0.05, 7);
  const f = useCurrentFrame();
  const up = interpolate(f, [d(A.demo) + 6, d(A.demo) + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `scale(${ken})`, transformOrigin: "50% 45%" }}>
      {/* 上昇矢印 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d={`M300 760 L${300 + 520 * up} ${760 - 300 * up}`} stroke={C.green} strokeWidth={12} strokeLinecap="round" opacity={0.9} />
        {up > 0.9 && <path d="M820 460 L790 474 M820 460 L806 492" stroke={C.green} strokeWidth={12} strokeLinecap="round" />}
      </svg>
      <Pop delay={d(A.demo)} style={{ position: "absolute", top: 210, left: 0, width: 1920, textAlign: "center" }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: C.sub }}>でも今は</div>
        <div style={{ fontSize: 96, fontWeight: 900, color: C.green, marginTop: 6 }}>本当に、やってよかった</div>
      </Pop>
      {/* CTA */}
      <div style={{ position: "absolute", top: 560, left: 0, width: 1920, textAlign: "center", transform: `scale(${ctaPulse})`, transformOrigin: "center" }}>
        <Pop delay={d(A.imaichido)} damp={11}>
          <div style={{ fontSize: 48, fontWeight: 900, color: C.ink }}>今一度、</div>
          <div style={{ fontSize: 100, fontWeight: 900, color: C.ink, marginTop: 6 }}><Mark delay={d(A.okane)} color={C.gold}>「お金の置き場」</Mark></div>
          <div style={{ fontSize: 60, fontWeight: 900, color: C.ink, marginTop: 10 }}>考えてみてください</div>
        </Pop>
      </div>
      <Brand />
    </AbsoluteFill>
  );
};

export const TalkMotionLand: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <Bg />
      <Audio src={staticFile("talk_narration.wav")} />
      <Sequence from={PG.s1.from} durationInFrames={PG.s1.dur}><S1 /></Sequence>
      <Sequence from={PG.s2.from} durationInFrames={PG.s2.dur}><S2 /></Sequence>
      <Sequence from={PG.s3.from} durationInFrames={PG.s3.dur}><S3 /></Sequence>
      <Sequence from={PG.s4.from} durationInFrames={PG.s4.dur}><S4 /></Sequence>
    </AbsoluteFill>
  );
};
