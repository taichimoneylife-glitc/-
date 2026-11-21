import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  トークリール自動編集 v2（実写＋オーバーレイ・高クオリティ版）
//  素材：public/mytalk.mp4（投資の三大原則・17.8s）
//  設計規則（talk-reel-pipeline.md）：明るい紙色＋濃い文字＋ライムアクセント／
//  字幕2行以内・顔口手に被せない／効果音は控えめ／視線の行き先を1つに。
//  改善点：映像を色補正、図解を作り込み（3原則の連結カード＋資産分散のノード図）、
//         常時ズーム＋節目フラッシュ、テロップに下スクリム＋強縁取り。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const TALK_FRAMES = 535; // 17.81s @30fps

// パレット（明るい紙色＋ライム）
const P = {
  paper: "#FBF7EC", ink: "#23201A", sub: "#8A8270",
  white: "#FFFFFF", orange: "#FF7A1A", green: "#2FB463",
  lime: "#9AD11E", limeDk: "#5E8A08", mark: "#FFE14D", card: "#FFFFFF",
};
const OUT = "0 3px 0 rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.4)";

// ── テロップ（発話どおり・キーワード色＋黄マーカー・2行以内）──
type Run = { t: string; c?: string; mark?: boolean };
const SEGS: { f: number; pre?: string; runs: Run[] }[] = [
  { f: 0, runs: [{ t: "投資で" }, { t: "失敗", c: P.orange }, { t: "したくないなら" }] },
  { f: 47, runs: [{ t: "これだけ", mark: true }, { t: "は抑えてほしい" }] },
  { f: 89, pre: "投資の", runs: [{ t: "3大原則", c: P.orange }] },
  { f: 119, runs: [{ t: "長期", c: P.green }, { t: "・" }, { t: "積立", c: P.green }, { t: "・" }, { t: "分散", c: P.green }] },
  { f: 172, runs: [{ t: "この3つを分かりやすく解説します" }] },
  { f: 231, runs: [{ t: "この3つを守るだけで" }] },
  { f: 264, runs: [{ t: "投資はグッと" }, { t: "安定", c: P.green }, { t: "します" }] },
  { f: 314, pre: "特に", runs: [{ t: "資産の分散", c: P.orange }, { t: "は" }] },
  { f: 356, runs: [{ t: "見落としがち", mark: true }] },
  { f: 383, runs: [{ t: "ぜひ意識してみてください" }] },
  { f: 439, runs: [{ t: "参考になったら" }, { t: "保存", c: P.orange }, { t: "して" }] },
  { f: 476, runs: [{ t: "見返してもらえると嬉しいです" }] },
];

const Telop: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = 0;
  for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i].f) idx = i;
  const seg = SEGS[idx];
  const end = idx + 1 < SEGS.length ? SEGS[idx + 1].f : TALK_FRAMES;
  if (f >= end) return null;
  const s = spring({ frame: f - seg.f, fps, config: { damping: 14, stiffness: 170, mass: 0.6 }, durationInFrames: 10 });
  const pop = 0.94 + 0.06 * Math.min(1, s * 1.6);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1360, textAlign: "center", transform: `scale(${pop})`, transformOrigin: "center", fontFamily: FONT }}>
      {seg.pre ? <div style={{ fontSize: 38, fontWeight: 800, color: "#F3ECD8", textShadow: OUT, marginBottom: 8 }}>{seg.pre}</div> : null}
      <div style={{ fontWeight: 900, fontSize: 72, lineHeight: 1.3, letterSpacing: 1 }}>
        {seg.runs.map((r, i) =>
          r.mark ? (
            <span key={i} style={{ position: "relative", display: "inline-block", color: P.ink }}>
              <span style={{ position: "absolute", left: -8, right: -8, top: "20%", bottom: "8%", background: P.mark, borderRadius: 12, zIndex: 0 }} />
              <span style={{ position: "relative", zIndex: 1 }}>{r.t}</span>
            </span>
          ) : (
            <span key={i} style={{ color: r.c || P.white, textShadow: OUT }}>{r.t}</span>
          )
        )}
      </div>
    </div>
  );
};

// ── パネル出現ヘルパ（スプリング＋常時ドリフト＋退場フェード）──
const Pop: React.FC<{ show: number; hide: number; delay?: number; drift?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ show, hide, delay = 0, drift = 4, children, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < show || f >= hide) return null;
  const s = spring({ frame: f - show - delay, fps, config: { damping: 12, stiffness: 130, mass: 0.9 }, durationInFrames: 16 });
  const out = interpolate(f, [hide - 8, hide], [1, 0], clamp);
  const bob = Math.sin(((f - show) / fps) * 2 * Math.PI * 0.28) * drift;
  return <div style={{ position: "absolute", opacity: Math.min(1, s * 1.6) * out, transform: `translateY(${(1 - Math.min(1, s)) * 18 + bob}px) scale(${Math.min(1, s)})`, transformOrigin: "center", fontFamily: FONT, ...style }}>{children}</div>;
};

const IconChip: React.FC<{ emoji: string; label: string; no: number }> = ({ emoji, label, no }) => (
  <div style={{ width: 268, background: P.card, borderRadius: 24, boxShadow: "0 12px 26px rgba(60,45,10,0.22)", padding: "18px 0 16px", textAlign: "center", position: "relative" }}>
    <div style={{ position: "absolute", left: 14, top: 12, width: 44, height: 44, borderRadius: "50%", background: P.lime, color: P.ink, fontWeight: 900, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{no}</div>
    <div style={{ fontSize: 68, lineHeight: 1 }}>{emoji}</div>
    <div style={{ fontSize: 42, fontWeight: 900, color: P.ink, marginTop: 6 }}>{label}</div>
  </div>
);

const Panels: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {/* Hook：上ピル */}
      <Pop show={0} hide={89} style={{ left: 0, right: 0, top: 96, display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: P.white, background: P.ink, padding: "14px 30px", borderRadius: 999, boxShadow: "0 10px 24px rgba(0,0,0,0.3)" }}>
          <span style={{ color: P.lime }}>投資で失敗しない人</span>がやってること
        </div>
      </Pop>

      {/* 三大原則：ヘッダーリボン＋連結カード3枚 */}
      <Pop show={89} hide={314} style={{ left: 0, right: 0, top: 64, display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: P.ink, background: P.lime, padding: "12px 34px", borderRadius: 999, boxShadow: "0 8px 20px rgba(60,45,10,0.2)" }}>📈 投資の3大原則</div>
      </Pop>
      {/* つなぎ線 */}
      <svg width="1080" height="400" style={{ position: "absolute", left: 0, top: 0 }}>
        {f >= 138 && f < 314 && <line x1="278" y1="330" x2="402" y2="330" stroke={P.limeDk} strokeWidth="7" strokeLinecap="round" opacity={interpolate(f, [138, 150], [0, 1], clamp)} />}
        {f >= 176 && f < 314 && <line x1="678" y1="330" x2="802" y2="330" stroke={P.limeDk} strokeWidth="7" strokeLinecap="round" opacity={interpolate(f, [176, 188], [0, 1], clamp)} />}
      </svg>
      {[
        { d: 119, emoji: "⏳", label: "長期", no: 1, x: 22 },
        { d: 138, emoji: "💰", label: "積立", no: 2, x: 406 },
        { d: 157, emoji: "🌐", label: "分散", no: 3, x: 790 },
      ].map((c) => (
        <Pop key={c.label} show={c.d} hide={314} style={{ left: c.x, top: 196 }}>
          <IconChip emoji={c.emoji} label={c.label} no={c.no} />
        </Pop>
      ))}

      {/* 資産の分散：ノード図（資産→株/債券/現金/金）＋要注意スタンプ */}
      <Pop show={314} hide={439} style={{ left: 0, right: 0, top: 60, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", fontSize: 42, fontWeight: 900, color: P.ink, background: P.mark, padding: "12px 34px", borderRadius: 999, boxShadow: "0 8px 20px rgba(60,45,10,0.2)" }}>
          資産の分散
          <div style={{ position: "absolute", right: -22, top: -24, fontSize: 26, fontWeight: 900, color: P.white, background: P.orange, padding: "6px 14px", borderRadius: 999, transform: "rotate(7deg)" }}>見落としがち</div>
        </div>
      </Pop>
      <Pop show={330} hide={439} style={{ left: 0, right: 0, top: 168, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 200, background: P.ink, color: P.white, fontSize: 40, fontWeight: 900, textAlign: "center", padding: "14px 0", borderRadius: 18 }}>資産</div>
      </Pop>
      <svg width="1080" height="400" style={{ position: "absolute", left: 0, top: 0 }}>
        {f >= 344 && f < 439 && [270, 430, 650, 810].map((x, i) => (
          <line key={i} x1="540" y1="250" x2={x + 20} y2="300" stroke={P.limeDk} strokeWidth="6" strokeLinecap="round" opacity={interpolate(f, [344 + i * 4, 356 + i * 4], [0, 1], clamp)} />
        ))}
      </svg>
      {[
        { d: 348, emoji: "📊", label: "株", x: 210 },
        { d: 352, emoji: "🏦", label: "債券", x: 370 },
        { d: 356, emoji: "💴", label: "現金", x: 590 },
        { d: 360, emoji: "🥇", label: "金", x: 750 },
      ].map((c) => (
        <Pop key={c.label} show={c.d} hide={439} style={{ left: c.x, top: 296 }}>
          <div style={{ width: 150, background: P.card, border: `4px solid ${P.lime}`, borderRadius: 18, padding: "10px 0 8px", textAlign: "center", boxShadow: "0 8px 18px rgba(60,45,10,0.2)" }}>
            <div style={{ fontSize: 44, lineHeight: 1 }}>{c.emoji}</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: P.ink }}>{c.label}</div>
          </div>
        </Pop>
      ))}

      {/* CTA */}
      <Pop show={439} hide={TALK_FRAMES} style={{ left: 0, right: 0, top: 110, display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: P.ink, background: P.lime, padding: "16px 36px", borderRadius: 999, boxShadow: "0 10px 24px rgba(60,45,10,0.24)" }}>🔖 保存して見返そう</div>
      </Pop>
    </>
  );
};

// ── 節目の白フラッシュ転換 ──
const flashes = [89, 314, 439];
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  let o = 0;
  for (const p of flashes) o = Math.max(o, interpolate(f, [p - 4, p, p + 6], [0, 0.5, 0], clamp));
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

// ── 寄りズーム（常時＋キーワードでプッシュイン）──
const punches = [89, 264, 314, 356, 439];
const useZoom = () => {
  const f = useCurrentFrame();
  const base = interpolate(f, [0, TALK_FRAMES], [1.03, 1.10], clamp);
  let bump = 0;
  for (const p of punches) bump += 0.03 * Math.max(0, 1 - Math.abs(f - (p + 6)) / 12);
  return base + bump;
};

export const TalkReel: React.FC = () => {
  const z = useZoom();
  return (
    <AbsoluteFill style={{ backgroundColor: P.paper }}>
      {/* 実写：色補正＋寄りズーム */}
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 40%" }}>
        <OffthreadVideo src={staticFile("mytalk.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.12) saturate(1.2) brightness(0.96)" }} />
      </AbsoluteFill>
      {/* 下スクリム（テロップの可読性） */}
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 58%, rgba(0,0,0,0.42) 100%)", pointerEvents: "none" }} />
      <Panels />
      <Telop />
      <Flash />
      <SfxTrack cues={[
        { file: "up5", at: 0, volume: 0.3 },
        { file: "pop", at: 89, volume: 0.34 },
        { file: "up1", at: 119, volume: 0.34 },
        { file: "up2", at: 138, volume: 0.34 },
        { file: "up3", at: 157, volume: 0.34 },
        { file: "correct", at: 264, volume: 0.34 },
        { file: "swipe", at: 314, volume: 0.32 },
        { file: "up4", at: 348, volume: 0.3 },
        { file: "correct", at: 356, volume: 0.32 },
        { file: "up2", at: 439, volume: 0.34 },
        { file: "finish", at: 476, volume: 0.42 },
      ]} />
    </AbsoluteFill>
  );
};
