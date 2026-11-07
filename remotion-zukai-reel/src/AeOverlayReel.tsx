import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// AI自動編集リール「周りのアニメーション」再現デモ（設計書: ae_reel_design_spec.md）
//   人物は対象外 → 実写はプレースホルダ。オーバーレイUIのモーション語彙を再現。
//   登場=Pop+Fade(0.25s)→常時フロート / タイプライタ / ✓Pop / バーWipe /
//   HUDドレイン / チェックリストstagger+ALL AIスタンプ / CTA矢印バウンス。
// ───────────────────────────────────────────────────────────────

const C = {
  white: "#FFFFFF",
  lime: "#9BE24C",
  yellow: "#FFD23D",
  red: "#FF4B3E",
  orange: "#F26419",
  greenPill: "#7FD44A",
  editor: "#1E1E1E",
  dark: "#0E1626",
  dark2: "#101A2C",
  ink: "#20283A",
  line: "#D8DEE8",
};
const FPS = 30;
export const AE_FRAMES = 1020; // 34s demo

// ── 共通 ──────────────────────────────────────────────
const useS = (delay: number, dur = 8, cfg: Parameters<typeof spring>[0]["config"] = { damping: 12, stiffness: 160, mass: 0.7 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};
// フロート（登場Pop + 常時微動）
const Float: React.FC<{ delay?: number; amp?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay = 0, amp = 6, style, children }) => {
  const f = useCurrentFrame();
  const s = useS(delay);
  const bob = Math.sin(((f - delay) / FPS) * 2 * Math.PI * 0.3) * amp;
  const rot = Math.sin(((f - delay) / FPS) * 2 * Math.PI * 0.22) * 1;
  return <div style={{ opacity: Math.min(1, s * 1.8), transform: `translateY(${(1 - s) * 24 + bob}px) scale(${s}) rotate(${rot}deg)`, transformOrigin: "center", ...style }}>{children}</div>;
};
const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useS(delay);
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};

// ── 実写プレースホルダ（人物は置いておく） ─────────────
const StageBG: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(170deg,#E9E4DB 0%,#DED7CC 48%,#CFC6B8 100%)" }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: 360, height: 620, borderRadius: "50% 50% 0 0", background: "rgba(90,100,120,0.18)" }} />
    </div>
    <div style={{ position: "absolute", bottom: 40, width: 1080, textAlign: "center", color: "rgba(60,70,90,0.5)", fontSize: 24, fontWeight: 700 }}>（実写トーク）</div>
  </AbsoluteFill>
);

// ── macOS信号機 ───────────────────────────────────────
const Dots: React.FC = () => (
  <div style={{ display: "flex", gap: 9 }}>
    {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c }} />)}
  </div>
);

// ── 閃光スターバッジ ──────────────────────────────────
const Burst: React.FC<{ label: string; delay: number; sub?: string }> = ({ label, delay, sub }) => {
  const f = useCurrentFrame();
  const pulse = 0.85 + 0.15 * Math.sin((f - delay) * 0.3);
  return (
    <Pop delay={delay} style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 78, height: 78 }}>
        <svg width="78" height="78" viewBox="0 0 78 78" style={{ transform: `scale(${pulse})` }}>
          <g fill={C.orange}>
            <circle cx="39" cy="39" r="30" />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * Math.PI) / 6; return <rect key={i} x="37" y="2" width="4" height="12" rx="2" transform={`rotate(${(i * 30)} 39 39)`} />;
            })}
          </g>
          <text x="39" y="46" textAnchor="middle" fontSize="26" fontWeight="900" fill="#fff" fontFamily={FONT}>✶</text>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>{label}</div>
        {sub && <div style={{ fontSize: 18, fontWeight: 700, color: "#7A8296" }}>{sub}</div>}
      </div>
    </Pop>
  );
};

// ── STEPタブ（カード上辺の黄フォルダタブ） ──────────────
const StepTab: React.FC<{ n: number; label: string; delay: number }> = ({ n, label, delay }) => {
  const s = useS(delay, 7);
  return (
    <div style={{ opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * -14}px)`, display: "inline-flex", alignItems: "center", gap: 10, background: C.yellow, borderRadius: 999, padding: "8px 18px", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
      <span style={{ fontSize: 20, fontWeight: 900, color: C.ink }}>STEP {n}</span>
      <span style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{label}</span>
    </div>
  );
};

// ── ウィンドウカード枠 ────────────────────────────────
const Win: React.FC<{ delay: number; title?: React.ReactNode; dark?: boolean; glow?: boolean; w?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, title, dark, glow, w = 820, style, children }) => (
  <Float delay={delay} style={{ width: w, ...style }}>
    <div style={{ borderRadius: 18, overflow: "hidden", background: dark ? C.editor : "#F4F4F7", boxShadow: glow ? `0 0 0 3px ${C.lime}, 0 12px 34px rgba(0,0,0,0.3)` : "0 12px 34px rgba(0,0,0,0.28)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: dark ? "#2A2A2E" : "#E7E7EC" }}>
        <Dots />
        {title && <div style={{ fontSize: 20, fontWeight: 700, color: dark ? "#D6D6DA" : "#55596A" }}>{title}</div>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  </Float>
);

// ── タイプライタ ──────────────────────────────────────
const Type: React.FC<{ text: string; delay: number; cps?: number; color?: string }> = ({ text, delay, cps = 30, color = "#E8E8EC" }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor(((f - delay) / FPS) * cps));
  const shown = text.slice(0, n);
  const caret = f % 20 < 12 && n <= text.length;
  return <span style={{ fontSize: 26, fontWeight: 600, color, fontFamily: "monospace, " + FONT, lineHeight: 1.6 }}>{shown}{caret && <span style={{ color }}>|</span>}</span>;
};

// ── ✓ Pop ─────────────────────────────────────────────
const CheckPop: React.FC<{ delay: number; size?: number }> = ({ delay, size = 86 }) => (
  <Pop delay={delay} style={{ width: size, height: size }}>
    <div style={{ width: size, height: size, borderRadius: "50%", background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(123,212,74,0.5)" }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24"><path d="M4 13l5 5L20 6" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  </Pop>
);

// ── テロップ（白太字＋強調語の色） ─────────────────────
type Seg = { t: string; c?: string };
const Telop: React.FC<{ segs: Seg[]; delay?: number }> = ({ segs, delay = 0 }) => {
  const s = useS(delay, 10, { damping: 18 });
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1480, display: "flex", justifyContent: "center" }}>
      <div style={{ opacity: Math.min(1, s * 1.7), transform: `translateY(${(1 - s) * 12}px)`, textAlign: "center", lineHeight: 1.25 }}>
        {segs.map((sg, i) => (
          <span key={i} style={{ fontSize: sg.c ? 64 : 52, fontWeight: 900, color: sg.c ?? "#fff", textShadow: "2.5px 2.5px 0 #20283A,-2.5px 2.5px 0 #20283A,2.5px -2.5px 0 #20283A,-2.5px -2.5px 0 #20283A,0 0 2px #20283A,0 5px 14px rgba(0,0,0,0.4)" }}>{sg.t}</span>
        ))}
      </div>
    </div>
  );
};

// ── PiP（副素材） ─────────────────────────────────────
const Pip: React.FC<{ x: number; y: number; delay: number; tint?: string; label?: string }> = ({ x, y, delay, tint = "#2E3B2A", label }) => (
  <Float delay={delay} style={{ position: "absolute", left: x, top: y }}>
    <div style={{ width: 200, height: 270, borderRadius: 18, background: tint, border: "3px solid #fff", boxShadow: "0 10px 26px rgba(0,0,0,0.3)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,rgba(255,255,255,0.08),rgba(0,0,0,0.25))" }} />
      {label && <div style={{ position: "absolute", bottom: 14, left: 0, width: "100%", textAlign: "center", color: "#fff", fontWeight: 900, fontSize: 40 }}>{label}</div>}
    </div>
  </Float>
);

// ═══ シーン ════════════════════════════════════════════

// 1. フック：エディタ＋タイプライタ＋STEPタブ＋Opus5.5
const S1: React.FC = () => (
  <AbsoluteFill>
    <StageBG />
    <div style={{ position: "absolute", top: 150, left: 70 }}>
      <div style={{ marginLeft: 20, marginBottom: -14, position: "relative", zIndex: 2 }}><StepTab n={1} label="台本" delay={8} /></div>
      <Win delay={4} dark title={<span>台本.md&nbsp;&nbsp;<span style={{ color: C.orange }}>✶</span> Claude Code</span>} w={880}>
        <div style={{ minHeight: 150 }}>
          <Type text={"撮ったのに、編集が終わらない。\nだから、投稿が止まる。\n今これを解決するのが——\n全部AIに任せた動画編集。"} delay={18} />
        </div>
      </Win>
    </div>
    <div style={{ position: "absolute", top: 120, right: 60 }}><Burst label="Opus 5.5" delay={20} sub="AIが執筆" /></div>
    <Telop segs={[{ t: "撮っても" }, { t: "編集が終わらない", c: C.yellow }]} delay={10} />
  </AbsoluteFill>
);

// 2. 編集完了：⏱タイマ＋緑✓＋ライム枠
const S2: React.FC = () => (
  <AbsoluteFill>
    <StageBG />
    <div style={{ position: "absolute", top: 160, left: 90 }}>
      <Win delay={4} glow w={840} title={<span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>⏱ <b style={{ fontVariantNumeric: "tabular-nums" }}>4:00:00</b></span>}>
        <div style={{ position: "relative", height: 230, borderRadius: 12, background: "#11161F", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckPop delay={22} />
          <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, height: 10, borderRadius: 6, background: C.lime }} />
        </div>
      </Win>
    </div>
    <div style={{ position: "absolute", top: 120, left: 80 }}><Burst label="Opus 5.5" delay={10} /></div>
    <Telop segs={[{ t: "編集が" }, { t: "完了", c: C.yellow }, { t: "した" }]} delay={10} />
  </AbsoluteFill>
);

// 3. 15分＋AIが編集pill＋PiP
const S3: React.FC = () => (
  <AbsoluteFill>
    <StageBG />
    <Pip x={620} y={160} delay={6} label="9月" />
    <Pop delay={14} style={{ position: "absolute", top: 140, left: 110 }}>
      <div style={{ background: C.greenPill, borderRadius: 999, padding: "10px 22px", fontSize: 26, fontWeight: 900, color: "#17310A" }}>AIが編集</div>
    </Pop>
    <Pop delay={18} style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center" }}>
      <span style={{ fontSize: 180, fontWeight: 900, color: C.yellow, textShadow: "4px 4px 0 #20283A" }}>15</span>
      <span style={{ fontSize: 96, fontWeight: 900, color: C.yellow, textShadow: "4px 4px 0 #20283A" }}>分</span>
    </Pop>
    <Telop segs={[{ t: "たった" }, { t: "15分", c: C.yellow }, { t: "で完成" }]} delay={10} />
  </AbsoluteFill>
);

// 4. 方眼紙・手描き図（1分→1時間 ×15 棒人間）
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const draw = (d: number) => interpolate(f, [d, d + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <StageBG />
      <Float delay={4} style={{ position: "absolute", top: 150, left: 70, width: 940 }}>
        <div style={{ height: 620, borderRadius: 16, background: "#FCFCF8", boxShadow: "0 12px 30px rgba(0,0,0,0.22)", backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 47px,#E4E7EC 47px,#E4E7EC 48px),repeating-linear-gradient(90deg,transparent,transparent 47px,#E4E7EC 47px,#E4E7EC 48px)", position: "relative", padding: 28 }}>
          <Pop delay={8}><div style={{ display: "inline-block", background: C.yellow, borderRadius: 8, padding: "6px 16px", fontSize: 26, fontWeight: 900, color: C.ink }}>僕の場合</div></Pop>
          <svg width="884" height="520" viewBox="0 0 884 520" style={{ position: "absolute", left: 28, top: 90 }}>
            {/* 1分 → 1時間 */}
            <text x="120" y="70" textAnchor="middle" fontSize="40" fontWeight="900" fill={C.ink} fontFamily={FONT} opacity={draw(14)}>動画</text>
            <text x="120" y="130" textAnchor="middle" fontSize="64" fontWeight="900" fill={C.red} fontFamily={FONT} opacity={draw(18)}>1分</text>
            <path d="M200 115 L420 115" stroke={C.red} strokeWidth="5" fill="none" strokeLinecap="round" markerEnd="" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(24)} />
            <path d="M405 102 L425 115 L405 128" stroke={C.red} strokeWidth="5" fill="none" opacity={draw(28)} />
            <text x="560" y="70" textAnchor="middle" fontSize="40" fontWeight="900" fill={C.ink} fontFamily={FONT} opacity={draw(24)}>編集</text>
            <text x="560" y="130" textAnchor="middle" fontSize="64" fontWeight="900" fill={C.ink} fontFamily={FONT} opacity={draw(28)}>1時間</text>
            {/* ×15 */}
            <path d="M120 150 L120 220" stroke={C.ink} strokeWidth="4" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(34)} />
            <text x="165" y="195" fontSize="30" fontWeight="800" fill={C.ink} fontFamily={FONT} opacity={draw(36)}>×15</text>
            {/* 15分 → 棒人間 */}
            <text x="120" y="270" textAnchor="middle" fontSize="40" fontWeight="900" fill={C.ink} fontFamily={FONT} opacity={draw(40)}>動画</text>
            <text x="120" y="340" textAnchor="middle" fontSize="70" fontWeight="900" fill={C.red} fontFamily={FONT} opacity={draw(44)}>15分</text>
            <g opacity={draw(50)} stroke={C.ink} strokeWidth="5" fill="none" strokeLinecap="round">
              <circle cx="430" cy="300" r="22" /><path d="M430 322 L430 390 M430 340 L395 365 M430 340 L465 365 M430 390 L405 440 M430 390 L455 440" />
            </g>
            <text x="560" y="340" textAnchor="middle" fontSize="40" fontWeight="900" fill={C.ink} fontFamily={FONT} opacity={draw(52)}>ずっと編集</text>
          </svg>
        </div>
      </Float>
      <Telop segs={[{ t: "15分の動画を" }, { t: "人力なら", c: C.yellow }]} delay={10} />
    </AbsoluteFill>
  );
};

// 5. 24時間バー
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const grow = (d: number) => interpolate(f, [d, d + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const segs = [{ w: 0.62, c: C.red, label: "編集 15時間" }, { w: 0.12, c: "#B9C2D0", label: "休憩" }, { w: 0.1, c: "#CBD3DE", label: "ごはん" }, { w: 0.16, c: "#9AA6B6", label: "睡眠" }];
  let acc = 0;
  return (
    <AbsoluteFill>
      <StageBG />
      <Win delay={4} w={900} style={{ position: "absolute", top: 180, left: 90 }} title={<span><b>1日</b> = 24時間</span>}>
        <div style={{ position: "relative", height: 210 }}>
          <Pop delay={30} style={{ position: "absolute", right: 6, top: -4 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FDE3E0", border: `2px solid ${C.red}`, borderRadius: 999, padding: "6px 16px" }}>
              <span style={{ color: C.red, fontWeight: 900, fontSize: 24 }}>1日では無理</span><span style={{ color: C.red, fontWeight: 900, fontSize: 26 }}>✕</span>
            </div>
          </Pop>
          <div style={{ position: "absolute", top: 70, left: 0, right: 0, height: 56, display: "flex", borderRadius: 10, overflow: "hidden", border: `2px solid ${C.ink}` }}>
            {segs.map((sg, i) => { const d = 10 + i * 8; const el = (
              <div key={i} style={{ width: `${sg.w * 100 * grow(d)}%`, background: sg.c, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: i === 0 ? "#fff" : C.ink }}>{sg.label}</span>
              </div>); acc += sg.w; return el; })}
          </div>
          <div style={{ position: "absolute", top: 134, left: 0, right: 0, display: "flex", justifyContent: "space-between", color: "#8A93A3", fontSize: 20, fontWeight: 700 }}>
            {[0, 6, 12, 18, 24].map((h) => <span key={h}>{h}</span>)}
          </div>
        </div>
      </Win>
      <Telop segs={[{ t: "1日", c: C.yellow }, { t: "で終わるわけがなくて" }]} delay={10} />
    </AbsoluteFill>
  );
};

// 6. ゲームHUD
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const hp = interpolate(f, [10, 40], [0.8, 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const needle = interpolate(f, [16, 46], [-60, 70], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = f > 30 && f < 42 ? Math.sin(f * 3) * 6 : 0;
  return (
    <AbsoluteFill>
      <StageBG />
      {/* HP */}
      <Pop delay={6} style={{ position: "absolute", top: 150, left: 80 }}>
        <div style={{ width: 240 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.ink, marginBottom: 6 }}>HP</div>
          <div style={{ width: "100%", height: 34, borderRadius: 8, background: "#2A2F3A", border: "3px solid #fff", overflow: "hidden" }}>
            <div style={{ width: `${hp * 100}%`, height: "100%", background: C.red }} />
          </div>
        </div>
      </Pop>
      {/* ゲージ */}
      <Pop delay={12} style={{ position: "absolute", top: 150, right: 90 }}>
        <div style={{ textAlign: "center" }}>
          <svg width="200" height="120" viewBox="0 0 200 120">
            <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="#DDE3EC" strokeWidth="18" strokeLinecap="round" />
            <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke={C.red} strokeWidth="18" strokeLinecap="round" strokeDasharray="251" strokeDashoffset={251 * (1 - Math.max(0, (needle + 90) / 180))} />
            <line x1="100" y1="110" x2="100" y2="40" stroke={C.ink} strokeWidth="6" strokeLinecap="round" transform={`rotate(${needle} 100 110)`} />
            <circle cx="100" cy="110" r="9" fill={C.ink} />
          </svg>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.ink, marginTop: -8 }}>イライラ度</div>
        </div>
      </Pop>
      {/* 被ダメ */}
      <div style={{ position: "absolute", top: 460, left: 110, transform: `translateX(${shake}px)` }}>
        <Pop delay={30}><div style={{ width: 150, height: 150, borderRadius: 16, background: "radial-gradient(circle,#FF7A5A,#D93A24)", boxShadow: "0 0 40px rgba(255,80,50,0.6)" }} /></Pop>
      </div>
      <Telop segs={[{ t: "いつか" }, { t: "倒れて", c: C.red }, { t: "しまう" }]} delay={10} />
    </AbsoluteFill>
  );
};

// 7. ダークまとめ：チェックリスト＋ALL AIスタンプ
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    { ic: "📄", t: "台本", sub: "" },
    { ic: "✂️", t: "編集", sub: "テロップ・効果音・図解" },
    { ic: "💬", t: "キャプション", sub: "" },
    { ic: "🖼", t: "サムネ", sub: "" },
  ];
  const stampS = spring({ frame: f - 86, fps: FPS, config: { damping: 9, stiffness: 120, mass: 1.1 }, durationInFrames: 20 });
  const stampScale = interpolate(stampS, [0, 1], [1.6, 1]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg,${C.dark},${C.dark2})` }}>
      <Pop delay={6} style={{ position: "absolute", top: 150, left: 70 }}>
        <div style={{ fontSize: 44, fontWeight: 800, color: "#D7DEEA" }}>手間のかかる所も</div>
        <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.1 }}><span style={{ color: C.yellow }}>全部</span><span style={{ color: C.lime }}>AI</span><span style={{ color: "#fff" }}>任せ</span></div>
      </Pop>
      <Pip x={760} y={120} delay={10} tint="#223247" />
      <div style={{ position: "absolute", top: 560, left: 90, width: 760, display: "flex", flexDirection: "column", gap: 18 }}>
        {rows.map((r, i) => {
          const d = 24 + i * 12;
          return (
            <Pop key={i} delay={d}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, background: i < 3 ? "#17241A" : "#1A2331", border: `1px solid ${i < 3 ? "#2C4A2E" : "#2A3650"}`, borderRadius: 16, padding: "20px 22px" }}>
                <span style={{ fontSize: 34 }}>{r.ic}</span>
                <span style={{ fontSize: 36, fontWeight: 900, color: "#fff" }}>{r.t}</span>
                {r.sub && <span style={{ fontSize: 20, color: "#9FB0C6" }}>{r.sub}</span>}
                <div style={{ flex: 1 }} />
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.orange, borderRadius: 999, padding: "6px 14px", fontSize: 22, fontWeight: 900, color: "#fff" }}>✶ AI</div>
                {i < 3 ? <CheckPop delay={d + 6} size={48} /> : <div style={{ width: 48, height: 48, borderRadius: "50%", border: "4px solid #3A4660" }} />}
              </div>
            </Pop>
          );
        })}
      </div>
      {/* ALL AI スタンプ */}
      <div style={{ position: "absolute", top: 1150, right: 120, transform: `scale(${stampScale}) rotate(-8deg)`, opacity: Math.min(1, stampS * 2) }}>
        <div style={{ border: `5px solid ${C.orange}`, borderRadius: 14, padding: "10px 28px", color: C.orange, fontSize: 52, fontWeight: 900 }}>✶ ALL AI</div>
      </div>
      <Telop segs={[{ t: "全部", c: C.yellow }, { t: "AIに", c: C.lime }, { t: "任せられる" }]} delay={10} />
    </AbsoluteFill>
  );
};

// 8. CTA：HOW TOカード＋プロフリンク矢印
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const arrow = Math.sin(f * 0.25) * 10;
  return (
    <AbsoluteFill>
      <StageBG />
      <Win delay={4} w={880} style={{ position: "absolute", top: 160, left: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Burst label="Opus 5.5" delay={8} />
          <span style={{ fontSize: 40, color: "#8A93A3" }}>→</span>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: "#5A4BD6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 22 }}>Ae</div>
          <div style={{ marginLeft: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#9AA3B3", letterSpacing: 4 }}>HOW TO</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: C.ink }}>AI自動編集の手順</div>
            <div style={{ marginTop: 6, display: "inline-block", background: C.greenPill, borderRadius: 999, padding: "4px 14px", fontSize: 20, fontWeight: 900, color: "#17310A" }}>撮って渡すだけ</div>
          </div>
        </div>
      </Win>
      {/* CTA */}
      <div style={{ position: "absolute", bottom: 230, left: 90, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ transform: `translateY(${arrow}px)`, fontSize: 56 }}>👇</div>
        <Pop delay={20}><div style={{ background: "rgba(20,25,35,0.8)", borderRadius: 999, padding: "14px 24px", fontSize: 30, fontWeight: 900, color: "#fff" }}>🔗 プロフィールのリンク</div></Pop>
      </div>
      <Telop segs={[{ t: "やり方は" }, { t: "プロフ", c: C.yellow }, { t: "に置いてます" }]} delay={10} />
    </AbsoluteFill>
  );
};

// ── 本体 ───────────────────────────────────────────────
const SC: { c: React.FC; d: number }[] = [
  { c: S1, d: 120 }, { c: S2, d: 120 }, { c: S3, d: 120 }, { c: S4, d: 150 },
  { c: S5, d: 120 }, { c: S6, d: 120 }, { c: S7, d: 150 }, { c: S8, d: 120 },
];
export const AeOverlayReel: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "#DED7CC", fontFamily: FONT }}>
      {SC.map((s, i) => { const el = <Sequence key={i} from={from} durationInFrames={s.d}><s.c /></Sequence>; from += s.d; return el; })}
    </AbsoluteFill>
  );
};
