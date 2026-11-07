import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  トーク×図解リール（投資の三大原則）v2
//  参考動画の核：白いグリッド背景にパッと切り替わり、実写は角丸カードで下に入り、
//  図解（付箋カード・手書き下線・ノード）が白地の上に乗る。
//  冒頭/締めはフルスクリーン実写。中盤はSTAGE(白地＋インサート実写)。
//  字幕は発話どおり・2行以内・黄キーワード＋白縁取り。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const TALKLAUNCH_FRAMES = 535;
const Y = "#FFD64A", INK = "#2A2620", SUB = "#8C8574", CORAL = "#EF7D4E", GREEN = "#4CAF72", BLUE = "#5B9BD5", PAPER = "#F4F1E8";
const OUT = "0 3px 0 rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)";
const useSp = (d: number, dur = 16, cfg: any = { damping: 12, stiffness: 140, mass: 0.8 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - d, fps, config: cfg, durationInFrames: dur });
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 白いグリッド背景
const Grid: React.FC = () => (
  <AbsoluteFill style={{ background: PAPER }}>
    <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent 0 55px, rgba(0,0,0,0.05) 55px 56px), repeating-linear-gradient(90deg, transparent 0 55px, rgba(0,0,0,0.05) 55px 56px)` }} />
  </AbsoluteFill>
);

// 手書き風タイトル（黄下線ワイプ＋星）
const Title: React.FC<{ show: number; hide: number; pre?: string; key2: string }> = ({ show, hide, pre, key2 }) => {
  const f = useCurrentFrame();
  const s = useSp(show, 16);
  if (f < show || f >= hide) return null;
  const uw = interpolate(f, [show + 8, show + 24], [0, 100], clamp);
  const out = interpolate(f, [hide - 8, hide], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 300, textAlign: "center", fontFamily: FONT, opacity: Math.min(1, s * 1.6) * out, transform: `translateY(${(1 - Math.min(1, s)) * -20}px)` }}>
      <span style={{ fontSize: 56, fontWeight: 800, color: INK }}>{pre}</span>
      <span style={{ position: "relative", fontSize: 92, fontWeight: 900, color: INK, margin: "0 6px" }}>
        {key2}
        <span style={{ position: "absolute", left: 0, right: `${100 - uw}%`, bottom: 2, height: 14, background: Y, borderRadius: 8, zIndex: -1 }} />
      </span>
      <span style={{ fontSize: 54, color: Y, marginLeft: 6 }}>✦</span>
    </div>
  );
};

// 付箋カード（テープ＋絵文字＋ラベル）
const Sticky: React.FC<{ delay: number; hide: number; color: string; tape: string; emoji: string; label: string; no?: number; style?: React.CSSProperties }> = ({ delay, hide, color, tape, emoji, label, no, style }) => {
  const s = useSp(delay, 18, { damping: 10, stiffness: 120 });
  const f = useCurrentFrame();
  if (f < delay || f >= hide) return null;
  const rot = Math.sin((f - delay) / 40) * 1.5;
  return (
    <div style={{ position: "absolute", width: 220, transform: `rotate(${rot}deg) translateY(${(1 - Math.min(1, s)) * -30}px) scale(${Math.min(1, s)})`, opacity: Math.min(1, s * 1.6), fontFamily: FONT, ...style }}>
      <div style={{ background: color, borderRadius: 14, padding: "26px 0 16px", textAlign: "center", boxShadow: "0 10px 22px rgba(80,60,20,0.18)", position: "relative" }}>
        <div style={{ position: "absolute", left: "50%", top: -14, transform: "translateX(-50%) rotate(-4deg)", width: 90, height: 28, background: tape, opacity: 0.85, borderRadius: 3 }} />
        {no ? <div style={{ position: "absolute", left: 10, top: 10, width: 38, height: 38, borderRadius: "50%", background: "#fff", color: INK, fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{no}</div> : null}
        <div style={{ fontSize: 66, lineHeight: 1 }}>{emoji}</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: INK, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
};

// 点線コネクタ
const Dots: React.FC<{ x: number; y1: number; y2: number; show: number }> = ({ x, y1, y2, show }) => {
  const f = useCurrentFrame();
  if (f < show) return null;
  const h = interpolate(f, [show, show + 10], [0, y2 - y1], clamp);
  return <div style={{ position: "absolute", left: x, top: y1, width: 0, height: h, borderLeft: `4px dotted ${SUB}` }} />;
};

// ── テロップ（黄キーワード＋白縁取り） ──
type Run = { t: string; y?: boolean; box?: boolean };
const SEGS: { f: number; pre?: string; runs: Run[]; stage: boolean }[] = [
  { f: 0, stage: false, runs: [{ t: "投資で" }, { t: "失敗", y: true }, { t: "したくないなら" }] },
  { f: 47, stage: false, runs: [{ t: "これだけ", box: true }, { t: "は抑えて" }] },
  { f: 89, stage: true, pre: "", runs: [{ t: "投資の", }, { t: "3大原則", y: true }] },
  { f: 119, stage: true, runs: [{ t: "長期", y: true }, { t: "・積立・分散" }] },
  { f: 172, stage: true, runs: [{ t: "分かりやすく解説します" }] },
  { f: 231, stage: true, runs: [{ t: "守るだけで" }] },
  { f: 264, stage: true, runs: [{ t: "投資はグッと" }, { t: "安定", y: true }] },
  { f: 314, stage: true, runs: [{ t: "特に" }, { t: "資産の分散", y: true }] },
  { f: 356, stage: true, runs: [{ t: "見落としがち", box: true }] },
  { f: 383, stage: true, runs: [{ t: "ぜひ意識してみて" }] },
  { f: 439, stage: true, runs: [{ t: "参考になったら", }, { t: "保存", y: true }] },
  { f: 476, stage: true, runs: [{ t: "見返すと嬉しいです" }] },
];
const Telop: React.FC<{ stage: boolean }> = ({ stage }) => {
  const f = useCurrentFrame();
  let idx = 0; for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i].f) idx = i;
  const seg = SEGS[idx]; const end = idx + 1 < SEGS.length ? SEGS[idx + 1].f : TALKLAUNCH_FRAMES;
  const s = useSp(seg.f, 10);
  if (f >= end) return null;
  const top = stage ? 1430 : 1340;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top, textAlign: "center", fontFamily: FONT, transform: `scale(${0.95 + 0.05 * Math.min(1, s)})` }}>
      {seg.pre ? <div style={{ fontSize: 34, fontWeight: 800, color: "#fff", textShadow: OUT, marginBottom: 8 }}>{seg.pre}</div> : null}
      <div style={{ fontWeight: 900, fontSize: 72, lineHeight: 1.26 }}>
        {seg.runs.map((r, i) => r.box ? (
          <span key={i} style={{ display: "inline-block", background: INK, color: Y, padding: "4px 20px", borderRadius: 14, transform: "rotate(-2deg)", margin: "0 4px", boxShadow: "0 10px 22px rgba(0,0,0,0.3)" }}>{r.t}</span>
        ) : (
          <span key={i} style={{ color: r.y ? Y : "#fff", textShadow: OUT }}>{r.t}</span>
        ))}
      </div>
    </div>
  );
};

// 進捗バー風ヘッダー（本家の "Claude が編集中" を 投資用に）
const ProgressHead: React.FC<{ show: number; hide: number }> = ({ show, hide }) => {
  const f = useCurrentFrame();
  const s = useSp(show, 16);
  if (f < show || f >= hide) return null;
  const pct = Math.round(interpolate(f, [show, hide - 20], [0, 100], clamp));
  const out = interpolate(f, [hide - 8, hide], [1, 0], clamp);
  const nodes = 4; const fill = (pct / 100) * (nodes - 1);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 470, background: INK, borderRadius: 20, padding: "22px 28px", opacity: Math.min(1, s * 1.6) * out, transform: `scale(${Math.min(1, s)})`, fontFamily: FONT, boxShadow: "0 12px 26px rgba(0,0,0,0.25)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ color: "#fff", fontSize: 36, fontWeight: 900 }}><span style={{ color: CORAL }}>◉</span> 3原則を実践中..</span>
        <span style={{ color: GREEN, fontSize: 40, fontWeight: 900 }}>{pct}%</span>
      </div>
      <div style={{ position: "relative", height: 10, background: "#3a352c", borderRadius: 6 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: 10, width: `${pct}%`, background: GREEN, borderRadius: 6 }} />
        {Array.from({ length: nodes }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: `${(i / (nodes - 1)) * 100}%`, top: -7, transform: "translateX(-50%)", width: 24, height: 24, borderRadius: "50%", background: i <= fill ? GREEN : "#3a352c", border: "3px solid #1a1712" }} />
        ))}
      </div>
    </div>
  );
};

const flashes = [89, 314, 439];
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  let o = 0; for (const p of flashes) o = Math.max(o, interpolate(f, [p - 3, p, p + 7], [0, 0.6, 0], clamp));
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

export const TalkLaunch: React.FC = () => {
  const f = useCurrentFrame();
  // mode: full(0-89) → stage(89-535)
  const t = interpolate(f, [83, 99], [0, 1], clamp); // 0=full,1=stage
  const left = lerp(0, 95, t), top = lerp(0, 1030, t), width = lerp(1080, 890, t), height = lerp(1920, 790, t), radius = lerp(0, 34, t);
  const z = 1.04 + 0.03 * Math.max(0, 1 - Math.abs(f - 95) / 12) + interpolate(f, [99, TALKLAUNCH_FRAMES], [0, 0.05], clamp);
  const stage = f >= 89;
  // クローム用ページ
  const page = f < 89 ? 1 : f < 314 ? 2 : f < 439 ? 3 : 4;
  const dot = interpolate(f % 90, [0, 90], [150, 930], clamp);
  const sAsset = useSp(360);
  const sCta = useSp(439);
  const sCta2 = useSp(439, 18);
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Grid />
      {/* 実写（フル→角丸カード） */}
      <div style={{ position: "absolute", left, top, width, height, borderRadius: radius, overflow: "hidden", boxShadow: t > 0.3 ? "0 20px 46px rgba(60,45,20,0.28)" : "none" }}>
        <div style={{ width: "100%", height: "100%", transform: `scale(${z})`, transformOrigin: "50% 30%" }}>
          <OffthreadVideo src={staticFile("mytalk.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 14%", filter: "contrast(1.1) saturate(1.18) brightness(0.98)" }} />
        </div>
      </div>

      {/* クローム（白地のときだけ・控えめ） */}
      {stage && (
        <>
          <div style={{ position: "absolute", left: 56, right: 56, top: 150, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 22, fontWeight: 800, letterSpacing: 3, color: SUB }}>
            <span>投資の3大原則 — GUIDE</span><span>{String(page).padStart(2, "0")} / 04</span>
          </div>
          <div style={{ position: "absolute", left: 56, right: 56, top: 190, height: 2, background: "rgba(0,0,0,0.14)" }} />
          <div style={{ position: "absolute", left: dot, top: 185, width: 12, height: 12, borderRadius: "50%", background: CORAL }} />
        </>
      )}

      {/* ── STAGE 図解（白地の上） ── */}
      {/* 三大原則 */}
      <Title show={89} hide={314} pre="投資の" key2="3大原則" />
      <ProgressHead show={89} hide={314} />
      <Dots x={190} y1={700} y2={760} show={122} />
      <Dots x={470} y1={700} y2={760} show={141} />
      <Dots x={760} y1={700} y2={760} show={160} />
      {[{ d: 119, c: "#BBD8F0", tp: "#8Fbfe6", e: "⏳", l: "長期", n: 1, x: 80 }, { d: 138, c: "#FBE7A8", tp: "#f0cf6a", e: "💰", l: "積立", n: 2, x: 360 }, { d: 157, c: "#C6E7C0", tp: "#9ad090", e: "🌐", l: "分散", n: 3, x: 640 }].map((c) => (
        <Sticky key={c.l} delay={c.d} hide={314} color={c.c} tape={c.tp} emoji={c.e} label={c.l} no={c.n} style={{ left: c.x, top: 760 }} />
      ))}

      {/* 資産の分散 */}
      <Title show={314} hide={439} pre="見落としがちな" key2="資産の分散" />
      {[{ d: 320, c: "#BBD8F0", tp: "#8fbfe6", e: "📊", l: "株", x: 70 }, { d: 330, c: "#FBE7A8", tp: "#f0cf6a", e: "🏦", l: "債券", x: 300 }, { d: 340, c: "#C6E7C0", tp: "#9ad090", e: "💴", l: "現金", x: 530 }, { d: 350, c: "#F3C9B6", tp: "#e3a383", e: "🥇", l: "金", x: 760 }].map((c) => (
        <Sticky key={c.l} delay={c.d} hide={439} color={c.c} tape={c.tp} emoji={c.e} label={c.l} style={{ left: c.x, top: 560, width: 200 }} />
      ))}
      {f >= 314 && f < 439 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontFamily: FONT, fontSize: 40, fontWeight: 900, color: INK, opacity: Math.min(1, sAsset * 1.6) }}>
          <span style={{ background: Y, padding: "6px 18px", borderRadius: 10 }}>値動きの違う4つに分ける</span>
        </div>
      )}

      {/* CTA */}
      {f >= 439 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: FONT, opacity: Math.min(1, sCta * 1.6), transform: `scale(${Math.min(1, sCta2)})` }}>
          <div style={{ fontSize: 150 }}>🔖</div>
          <div style={{ display: "inline-block", background: INK, color: "#fff", fontSize: 54, fontWeight: 900, padding: "16px 40px", borderRadius: 18, marginTop: 10 }}>保存して<span style={{ color: Y }}>見返そう</span></div>
        </div>
      )}

      <Telop stage={stage} />
      <Flash />
      <SfxTrack cues={[
        { file: "up5", at: 0, volume: 0.3 }, { file: "swipe", at: 89, volume: 0.36 },
        { file: "up1", at: 119, volume: 0.34 }, { file: "up2", at: 138, volume: 0.34 }, { file: "up3", at: 157, volume: 0.34 },
        { file: "correct", at: 264, volume: 0.32 }, { file: "swipe", at: 314, volume: 0.34 },
        { file: "up4", at: 330, volume: 0.3 }, { file: "up6", at: 350, volume: 0.3 }, { file: "correct", at: 356, volume: 0.32 },
        { file: "swipe", at: 439, volume: 0.34 }, { file: "finish", at: 476, volume: 0.44 },
      ]} />
    </AbsoluteFill>
  );
};
