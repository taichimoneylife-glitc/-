import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// Instagram攻略リール「図解パート」再現（設計書: ig_diagram_design_spec.md）
//   薄グレー地の積み上げツリー：ハブ→3分岐(?予告)→各枝の詳細。
//   ノード=アイコン/サムネ枠+下ラベル、✕誤解崩し、ピンク本命、赤数字強調。
//   人物(実写トーク)は対象外。サムネは枠プレースホルダ。
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#EAEAEF",
  line: "#9BA0AC",
  label: "#3A3E48",
  ink: "#2E323C",
  pink: "#F24B7C",
  red: "#F0353B",
  warn: "#F2C230",
  thumb: "#C7CBD4",
  thumb2: "#B7BCC7",
};
const FPS = 30;
export const IG_FRAMES = 900; // 30s demo（3分岐×10s）
const CX = 540;

// ── アニメ ──
const useS = (delay: number, dur = 8, cfg: Parameters<typeof spring>[0]["config"] = { damping: 13, stiffness: 150, mass: 0.7 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};
const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useS(delay);
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
const Draw: React.FC<{ d: string; delay: number; dur?: number; w?: number }> = ({ d, delay, dur = 9, w = 3 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <path d={d} fill="none" stroke={C.line} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />;
};

// ── アイコン ──
const IGHub: React.FC<{ s?: number }> = ({ s = 92 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    <defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stopColor="#FEDA75" /><stop offset="0.35" stopColor="#FA7E1E" /><stop offset="0.6" stopColor="#D62976" /><stop offset="0.8" stopColor="#962FBF" /><stop offset="1" stopColor="#4F5BD5" />
    </linearGradient></defs>
    <rect x="3" y="3" width="42" height="42" rx="12" fill="url(#ig)" />
    <rect x="12" y="12" width="24" height="24" rx="8" fill="none" stroke="#fff" strokeWidth="3" />
    <circle cx="24" cy="24" r="6.5" fill="none" stroke="#fff" strokeWidth="3" />
    <circle cx="33" cy="15" r="2.4" fill="#fff" />
  </svg>
);
const Hourglass: React.FC<{ s?: number }> = ({ s = 70 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><g stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6h24M12 42h24" /><path d="M14 6c0 10 20 12 20 18s-20 8-20 18M34 6c0 10-20 12-20 18s20 8 20 18" /></g><path d="M18 14c2 4 10 4 12 0z" fill={C.ink} /></svg>
);
const Verified: React.FC<{ s?: number }> = ({ s = 70 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><path d="M24 3l5 4 6-1 2 6 5 4-3 6 1 6-6 2-3 5-6-2-6 2-3-5-6-2 1-6-3-6 5-4 2-6 6 1z" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" /><path d="M17 24l5 5 10-11" fill="none" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Gear: React.FC<{ s?: number }> = ({ s = 70 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><g stroke={C.ink} strokeWidth="2.6" fill="none"><circle cx="24" cy="24" r="7" />{Array.from({ length: 8 }).map((_, i) => <line key={i} x1="24" y1="4" x2="24" y2="11" transform={`rotate(${i * 45} 24 24)`} strokeLinecap="round" />)}</g><path d="M34 14a13 13 0 1 0 3 9" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round" /><path d="M33 9l2 6-6 1" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const SeriesIcon: React.FC<{ s?: number }> = ({ s = 60 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><rect x="14" y="8" width="24" height="30" rx="4" fill="#fff" stroke={C.ink} strokeWidth="2.4" /><rect x="10" y="12" width="24" height="30" rx="4" fill="#fff" stroke={C.ink} strokeWidth="2.4" /><path d="M18 22l9 5-9 5z" fill={C.ink} /><text x="22" y="20" fontSize="5" fontWeight="800" fill={C.ink} fontFamily={FONT}>SERIES</text></svg>
);

// ── ノード（アイコン＋下ラベル） ──
const Node: React.FC<{ x: number; y: number; delay: number; label: string; icon: React.ReactNode; faded?: boolean }> = ({ x, y, delay, label, icon, faded }) => (
  <Pop delay={delay} style={{ position: "absolute", left: x - 70, top: y, width: 140, textAlign: "center", opacity: faded ? 0.32 : 1 }}>
    <div style={{ height: 92, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
    <div style={{ fontSize: 27, fontWeight: 800, color: C.label, marginTop: 6, lineHeight: 1.15, whiteSpace: "pre-line" }}>{label}</div>
  </Pop>
);

// 「?」予告
const QMark: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: "absolute", left: x - 35, top: y + 6, width: 70, textAlign: "center", fontSize: 72, fontWeight: 900, color: "#AEB2BD" }}>?</div>
);

// リールサムネ枠（プレースホルダ）
const Thumb: React.FC<{ w?: number; c?: string }> = ({ w = 86, c = C.thumb }) => (
  <div style={{ width: w, height: w * 1.55, borderRadius: 8, background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={w * 0.3} height={w * 0.3} viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z" fill="#fff" opacity="0.85" /></svg>
  </div>
);
const ThumbRow: React.FC<{ x: number; y: number; delay: number; n?: number; faded?: boolean; label: string }> = ({ x, y, delay, n = 5, faded, label }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: faded ? 0.3 : 1 }}>
    <div style={{ fontSize: 28, fontWeight: 800, color: C.label, marginBottom: 10 }}>{label}</div>
    <div style={{ display: "flex", gap: 7 }}>
      {Array.from({ length: n }).map((_, i) => <Pop key={i} delay={delay + i * 3}><Thumb w={70} c={i % 2 ? C.thumb : C.thumb2} /></Pop>)}
    </div>
  </div>
);

// ⚠️ 白枠ボックス
const WarnBox: React.FC<{ x: number; y: number; delay: number; text: string }> = ({ x, y, delay, text }) => (
  <Pop delay={delay} style={{ position: "absolute", left: x, top: y }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="46" height="42" viewBox="0 0 46 42"><path d="M23 3L44 39H2z" fill={C.warn} stroke="#C99A12" strokeWidth="2" strokeLinejoin="round" /><rect x="21" y="16" width="4" height="13" rx="2" fill="#5A4502" /><circle cx="23" cy="34" r="2.4" fill="#5A4502" /></svg>
      <div style={{ background: "#fff", border: `2px solid ${C.label}`, borderRadius: 10, padding: "12px 20px", fontSize: 30, fontWeight: 800, color: C.label }}>{text}</div>
    </div>
  </Pop>
);

// ✕ スタンプ
const XMark: React.FC<{ delay: number; s?: number }> = ({ delay, s = 92 }) => {
  const sp = useS(delay, 7, { damping: 9, stiffness: 140, mass: 0.9 });
  const sc = interpolate(sp, [0, 1], [1.5, 1]);
  return (
    <div style={{ transform: `scale(${sc})`, opacity: Math.min(1, sp * 2) }}>
      <svg width={s} height={s} viewBox="0 0 48 48"><g stroke="#fff" strokeWidth="9" strokeLinecap="round" ><path d="M12 12L36 36M36 12L12 36" /></g><g stroke="#4A4E58" strokeWidth="3.5" strokeLinecap="round"><path d="M12 12L36 36M36 12L12 36" /></g></svg>
    </div>
  );
};

// ── ハブ＋3分岐ヘッダー（常時） ──
const Header: React.FC = () => {
  const f = useCurrentFrame();
  const hubY = 140, colY = 330, braceY = 250;
  return (
    <>
      <svg width={1080} height={520} style={{ position: "absolute", inset: 0 }}>
        <Draw d={`M${CX} ${hubY + 96} L${CX} ${braceY} M200 ${braceY} L880 ${braceY} M200 ${braceY} L200 ${colY - 6} M${CX} ${braceY} L${CX} ${colY - 6} M880 ${braceY} L880 ${colY - 6}`} delay={10} dur={12} />
      </svg>
      <Pop delay={4} style={{ position: "absolute", left: CX - 46, top: hubY }}><IGHub /></Pop>
      {/* col1 リール規制（最初から） */}
      <Node x={200} y={colY} delay={20} label={"リール規制"} icon={<Hourglass />} />
      {/* col2 新機能（branch2で? → 実ノード） */}
      {f < 300 ? <QMark x={CX} y={colY} /> : <Node x={CX} y={colY} delay={302} label={"新機能"} icon={<Verified />} />}
      {/* col3 アルゴリズムリセット（branch3で? → 実ノード） */}
      {f < 600 ? <QMark x={880} y={colY} /> : <Node x={880} y={colY} delay={602} label={"アルゴリズム\nリセット"} icon={<Gear />} />}
    </>
  );
};

// ── 枝1：リール規制の詳細 ──
const Branch1: React.FC = () => {
  const f = useCurrentFrame();
  const fade = Math.min(interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" }), interpolate(f, [270, 290], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Draw d="M200 430 L200 500" delay={8} />
        <Draw d="M200 640 L200 720" delay={60} />
        <Draw d="M200 870 L200 950" delay={120} />
      </svg>
      <Node x={200} y={500} delay={14} label={"トライアルリール"} icon={<Thumb w={64} />} />
      <WarnBox x={70} y={720} delay={66} text={"同じ動画の使い回し"} />
      {/* 警告ダイアログ + 50再生↓ */}
      <Pop delay={126} style={{ position: "absolute", left: 90, top: 960 }}>
        <div style={{ width: 320, borderRadius: 14, background: "#1E1F24", color: "#fff", padding: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>以前投稿したコンテンツと似ています</div>
          <div style={{ fontSize: 16, color: "#AEB3BD", lineHeight: 1.5 }}>このコンテンツは露出が制限される場合があります…</div>
        </div>
      </Pop>
      <Pop delay={150} style={{ position: "absolute", right: 110, top: 985 }}>
        <div style={{ textAlign: "center" }}>
          <svg width="130" height="90" viewBox="0 0 130 90">{[0, 1, 2, 3].map((i) => <rect key={i} x={i * 32} y={20 + i * 16} width="22" height={70 - i * 16} fill={C.label} />)}<path d="M0 10 L110 80" stroke={C.red} strokeWidth="5" /></svg>
          <div style={{ fontSize: 34, fontWeight: 900, color: C.red }}>50再生</div>
        </div>
      </Pop>
      {/* before→after + 1.1倍速 */}
      <div style={{ position: "absolute", left: 0, top: 1320, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
        <Pop delay={200}><Thumb w={120} /></Pop>
        <Pop delay={214}><svg width="56" height="40" viewBox="0 0 56 40"><path d="M2 20h40M38 8l14 12-14 12" fill="none" stroke={C.label} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg></Pop>
        <Pop delay={224}><Thumb w={120} /></Pop>
      </div>
      <Pop delay={236} style={{ position: "absolute", left: 0, top: 1560, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 48, fontWeight: 900, color: C.red }}>1.1倍速</span>
      </Pop>
    </AbsoluteFill>
  );
};

// ── 枝2：新機能 Series ──
const Branch2: React.FC = () => {
  const f = useCurrentFrame();
  const fade = Math.min(interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" }), interpolate(f, [270, 290], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const undim = interpolate(f, [120, 130], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Draw d="M540 430 L540 520" delay={8} />
        <Draw d="M540 650 L540 740" delay={40} />
        <Draw d="M300 980 L300 1120" delay={90} />
      </svg>
      <Node x={CX} y={520} delay={14} label={"Series"} icon={<SeriesIcon />} />
      <ThumbRow x={70} y={760} delay={56} label={"栄養学フォルダ"} />
      <div style={{ opacity: undim }}><ThumbRow x={600} y={760} delay={60} label={"運動フォルダ"} /></div>
      {/* ピンク本命ブロック（3ゾーン：サムネ列／中央コピー／縦書き） */}
      <Pop delay={96} style={{ position: "absolute", left: 110, top: 1120 }}>
        <div style={{ width: 500, height: 560, borderRadius: 16, background: "rgba(242,75,124,0.14)", border: `3px solid ${C.pink}`, display: "flex", alignItems: "center", padding: "0 26px", gap: 18 }}>
          {/* 左：PART1→2→3 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
            {[1, 2, 3].map((p, i) => (
              <React.Fragment key={p}>
                <div style={{ textAlign: "center" }}><Thumb w={58} c="#E98FB0" /><div style={{ fontSize: 16, fontWeight: 800, color: C.pink, marginTop: 2 }}>PART{p}</div></div>
                {i < 2 && <svg width="18" height="22" viewBox="0 0 18 22"><path d="M9 1v14M3 11l6 8 6-8" fill="none" stroke={C.pink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </React.Fragment>
            ))}
          </div>
          {/* 中央：白コピー */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1.3, textShadow: `2px 2px 0 ${C.pink},-2px 2px 0 ${C.pink},2px -2px 0 ${C.pink},-2px -2px 0 ${C.pink},0 4px 10px rgba(242,75,124,0.5)` }}>たくさん{"\n"}見て{"\n"}もらえる!</span>
          </div>
          {/* 右：縦書き */}
          <div style={{ writingMode: "vertical-rl", fontSize: 34, fontWeight: 900, color: C.pink, letterSpacing: 3 }}>順番に見る</div>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// ── 枝3：アルゴリズムリセット（✕誤解崩し） ──
const Branch3: React.FC = () => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const bars = [
    { t: "投稿後のキャプションを\n編集すると伸びなくなる", x: true },
    { t: "予約投稿をすると\n伸びなくなる", x: false },
    { t: "ビジネスアカウントは\n伸びずらい", x: true },
  ];
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><Draw d="M880 430 L880 560 L540 560 L540 640" delay={8} dur={12} /></svg>
      <div style={{ position: "absolute", left: 150, top: 660, width: 640, display: "flex", flexDirection: "column", gap: 26 }}>
        {bars.map((b, i) => {
          const d = 30 + i * 26;
          return (
            <div key={i} style={{ position: "relative" }}>
              <Pop delay={d}>
                <div style={{ background: b.x ? "#6E727C" : "#fff", border: b.x ? "none" : `3px solid ${C.pink}`, borderRadius: 12, padding: "22px 24px", minHeight: 80, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: b.x ? "#fff" : C.label, whiteSpace: "pre-line", lineHeight: 1.25 }}>{b.t}</span>
                </div>
              </Pop>
              {b.x && <div style={{ position: "absolute", left: "72%", top: "50%", transform: "translate(-50%,-50%)" }}><XMark delay={d + 10} s={80} /></div>}
            </div>
          );
        })}
      </div>
      {/* 使ってOK!! */}
      <Pop delay={130} style={{ position: "absolute", right: 70, top: 790 }}>
        <div style={{ writingMode: "vertical-rl", fontSize: 44, fontWeight: 900, color: C.red }}>使ってOK!!</div>
      </Pop>
    </AbsoluteFill>
  );
};

// ── 本体 ──
export const IgTreeReel: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
    <Header />
    <Sequence from={0} durationInFrames={300}><Branch1 /></Sequence>
    <Sequence from={300} durationInFrames={300}><Branch2 /></Sequence>
    <Sequence from={600} durationInFrames={300}><Branch3 /></Sequence>
  </AbsoluteFill>
);
