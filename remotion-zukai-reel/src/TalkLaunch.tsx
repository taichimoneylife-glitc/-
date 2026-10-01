import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  トークリール × ローンチフィルム風（投資の三大原則）
//  素材：public/mytalk.mp4（17.8s）。実写を主役に、Opus5.5ローンチフィルムの
//  デザイン言語（生成り＋コーラル／クローム／キネティックタイポ／データカード／
//  チェッカー）を被せる。字幕は発話どおり、2行以内、顔口手に被せない。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const TALKLAUNCH_FRAMES = 535;

const L = { cream: "#F0EAD9", ink: "#1A1712", coral: "#E4572E", coralDk: "#C6431E", blue: "#4A90D9", olive: "#7B8B4E", gold: "#E1A93A", gray: "#9A927F", card: "#FFFFFF" };
const OUT = "0 3px 0 rgba(0,0,0,0.55), 0 0 12px rgba(0,0,0,0.4)";
const useSp = (d: number, dur = 16, cfg: any = { damping: 13, stiffness: 150, mass: 0.7 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - d, fps, config: cfg, durationInFrames: dur });
};

// ── テロップ（launch風：黒強調ボックス＋コーラル）──
type Run = { t: string; c?: string; box?: boolean };
const SEGS: { f: number; pre?: string; runs: Run[] }[] = [
  { f: 0, runs: [{ t: "投資で" }, { t: "失敗", c: L.coral }, { t: "したくないなら" }] },
  { f: 47, runs: [{ t: "これだけ", box: true }, { t: "は抑えてほしい" }] },
  { f: 89, pre: "投資の", runs: [{ t: "3大原則", box: true }] },
  { f: 119, runs: [{ t: "長期", c: L.coral }, { t: "・" }, { t: "積立", c: L.coral }, { t: "・" }, { t: "分散", c: L.coral }] },
  { f: 172, runs: [{ t: "分かりやすく解説します" }] },
  { f: 231, runs: [{ t: "この3つを守るだけで" }] },
  { f: 264, runs: [{ t: "投資はグッと" }, { t: "安定", box: true }] },
  { f: 314, pre: "特に", runs: [{ t: "資産の分散", c: L.coral }, { t: "は" }] },
  { f: 356, runs: [{ t: "見落としがち", box: true }] },
  { f: 383, runs: [{ t: "ぜひ意識してみて" }] },
  { f: 439, runs: [{ t: "参考になったら" }, { t: "保存", c: L.coral }, { t: "して" }] },
  { f: 476, runs: [{ t: "見返してもらえると嬉しいです" }] },
];
const Telop: React.FC = () => {
  const f = useCurrentFrame();
  let idx = 0; for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i].f) idx = i;
  const seg = SEGS[idx]; const end = idx + 1 < SEGS.length ? SEGS[idx + 1].f : TALKLAUNCH_FRAMES;
  const s = useSp(seg.f, 10);
  if (f >= end) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1330, textAlign: "center", fontFamily: FONT, transform: `scale(${0.95 + 0.05 * Math.min(1, s)})` }}>
      {seg.pre ? <div style={{ fontSize: 36, fontWeight: 800, color: "#F3ECD8", textShadow: OUT, marginBottom: 10 }}>{seg.pre}</div> : null}
      <div style={{ fontWeight: 900, fontSize: 74, lineHeight: 1.28 }}>
        {seg.runs.map((r, i) => r.box ? (
          <span key={i} style={{ display: "inline-block", background: L.ink, color: "#fff", padding: "4px 20px", borderRadius: 14, transform: "rotate(-2deg)", margin: "0 4px", boxShadow: "0 10px 22px rgba(0,0,0,0.3)" }}>{r.t}</span>
        ) : (
          <span key={i} style={{ color: r.c || "#fff", textShadow: OUT }}>{r.t}</span>
        ))}
      </div>
    </div>
  );
};

// ── クローム（launch film風ヘッダー／フッター） ──
const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const page = f < 89 ? 1 : f < 172 ? 2 : f < 314 ? 3 : f < 439 ? 4 : 5;
  const dot = interpolate(f % 90, [0, 90], [150, 930], clamp);
  const sh = "0 2px 6px rgba(0,0,0,0.5)";
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.33) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 56, right: 56, top: 70, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 22, fontWeight: 800, letterSpacing: 3, color: "#fff", textShadow: sh }}>
        <span>投資の3大原則 — GUIDE</span><span>{String(page).padStart(2, "0")} / 05</span>
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 110, height: 2, background: "rgba(255,255,255,0.5)" }} />
      <div style={{ position: "absolute", left: dot, top: 105, width: 12, height: 12, borderRadius: "50%", background: L.coral }} />
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 64, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 20, fontWeight: 800, letterSpacing: 3, color: "#F0EAD9", textShadow: sh }}>
        <span>MONEY LIFE</span><span>SAVE &amp; REWATCH ↗</span>
      </div>
      {/* コーラルのチェッカー差し色 */}
      <div style={{ position: "absolute", left: 56, right: 56, top: 128, height: 10, backgroundImage: `repeating-linear-gradient(90deg, ${L.coral} 0 14px, transparent 14px 28px)`, opacity: 0.9 }} />
    </>
  );
};

// ── 上部パネル（launch風データカード） ──
const Pop: React.FC<{ show: number; hide: number; delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ show, hide, delay = 0, children, style }) => {
  const f = useCurrentFrame();
  const s = useSp(show + delay, 16);
  if (f < show || f >= hide) return null;
  const out = interpolate(f, [hide - 8, hide], [1, 0], clamp);
  const bob = Math.sin((f - show) / 30 * Math.PI * 2 * 0.28) * 3;
  return <div style={{ position: "absolute", opacity: Math.min(1, s * 1.6) * out, transform: `translateY(${(1 - Math.min(1, s)) * 16 + bob}px) scale(${Math.min(1, s)})`, fontFamily: FONT, ...style }}>{children}</div>;
};
const Panels: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {/* Hook */}
      <Pop show={0} hide={89} style={{ left: 0, right: 0, top: 176, display: "flex", justifyContent: "center" }}>
        <div style={{ background: L.ink, color: "#fff", fontSize: 38, fontWeight: 900, padding: "12px 28px", borderRadius: 14, boxShadow: "0 10px 22px rgba(0,0,0,0.3)" }}>失敗しない人の<span style={{ color: L.coral }}>共通点</span></div>
      </Pop>
      {/* 3大原則 header + 3 cards */}
      <Pop show={89} hide={314} style={{ left: 0, right: 0, top: 172, display: "flex", justifyContent: "center" }}>
        <div style={{ background: L.coral, color: "#fff", fontSize: 40, fontWeight: 900, padding: "10px 30px", borderRadius: 999, boxShadow: "0 8px 18px rgba(0,0,0,0.25)" }}>📈 投資の3大原則</div>
      </Pop>
      {[{ d: 119, e: "⏳", t: "長期", n: 1, x: 60 }, { d: 138, e: "💰", t: "積立", n: 2, x: 404 }, { d: 157, e: "🌐", t: "分散", n: 3, x: 748 }].map((c) => (
        <Pop key={c.t} show={c.d} hide={314} style={{ left: c.x, top: 284 }}>
          <div style={{ width: 272, background: L.card, borderRadius: 22, boxShadow: "0 12px 24px rgba(0,0,0,0.28)", padding: "16px 0 14px", textAlign: "center", position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: 10, width: 42, height: 42, borderRadius: "50%", background: L.coral, color: "#fff", fontWeight: 900, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.n}</div>
            <div style={{ fontSize: 60, lineHeight: 1 }}>{c.e}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: L.ink, marginTop: 4 }}>{c.t}</div>
          </div>
        </Pop>
      ))}
      {/* 資産の分散 node */}
      <Pop show={314} hide={439} style={{ left: 0, right: 0, top: 172, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", background: L.ink, color: "#fff", fontSize: 40, fontWeight: 900, padding: "10px 30px", borderRadius: 999 }}>資産の分散
          <div style={{ position: "absolute", right: -18, top: -22, background: L.coral, color: "#fff", fontSize: 24, fontWeight: 900, padding: "5px 14px", borderRadius: 999, transform: "rotate(7deg)" }}>見落としがち</div>
        </div>
      </Pop>
      {[{ d: 6, e: "📊", t: "株", x: 150 }, { d: 10, e: "🏦", t: "債券", x: 340 }, { d: 14, e: "💴", t: "現金", x: 560 }, { d: 18, e: "🥇", t: "金", x: 760 }].map((c) => (
        <Pop key={c.t} show={314} hide={439} delay={c.d} style={{ left: c.x, top: 300 }}>
          <div style={{ width: 170, background: L.card, border: `4px solid ${L.coral}`, borderRadius: 18, padding: "10px 0 8px", textAlign: "center", boxShadow: "0 8px 18px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: 44, lineHeight: 1 }}>{c.e}</div><div style={{ fontSize: 34, fontWeight: 900, color: L.ink }}>{c.t}</div>
          </div>
        </Pop>
      ))}
      {/* CTA */}
      <Pop show={439} hide={TALKLAUNCH_FRAMES} style={{ left: 0, right: 0, top: 190, display: "flex", justifyContent: "center" }}>
        <div style={{ background: L.coral, color: "#fff", fontSize: 42, fontWeight: 900, padding: "14px 34px", borderRadius: 999, boxShadow: "0 10px 22px rgba(0,0,0,0.28)" }}>🔖 保存して見返そう</div>
      </Pop>
    </>
  );
};

const flashes = [89, 314, 439];
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  let o = 0; for (const p of flashes) o = Math.max(o, interpolate(f, [p - 4, p, p + 6], [0, 0.45, 0], clamp));
  return <AbsoluteFill style={{ background: L.cream, opacity: o, pointerEvents: "none" }} />;
};

const punches = [89, 264, 314, 439];
const useZoom = () => {
  const f = useCurrentFrame();
  const base = interpolate(f, [0, TALKLAUNCH_FRAMES], [1.03, 1.10], clamp);
  let b = 0; for (const p of punches) b += 0.03 * Math.max(0, 1 - Math.abs(f - (p + 6)) / 12);
  return base + b;
};

export const TalkLaunch: React.FC = () => {
  const z = useZoom();
  return (
    <AbsoluteFill style={{ background: L.ink }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 40%" }}>
        <OffthreadVideo src={staticFile("mytalk.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.12) saturate(1.22) brightness(0.95)" }} />
      </AbsoluteFill>
      <Chrome />
      <Panels />
      <Telop />
      <Flash />
      <SfxTrack cues={[
        { file: "up5", at: 0, volume: 0.3 }, { file: "pop", at: 89, volume: 0.34 },
        { file: "up1", at: 119, volume: 0.34 }, { file: "up2", at: 138, volume: 0.34 }, { file: "up3", at: 157, volume: 0.34 },
        { file: "correct", at: 264, volume: 0.34 }, { file: "swipe", at: 314, volume: 0.32 },
        { file: "up4", at: 332, volume: 0.3 }, { file: "correct", at: 356, volume: 0.32 },
        { file: "up2", at: 439, volume: 0.34 }, { file: "finish", at: 476, volume: 0.42 },
      ]} />
    </AbsoluteFill>
  );
};
