import React from "react";
import { AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  あなたの喋り動画(投資の三大原則)に、参考トークリールの編集を真似て適用。
//  素材：public/mytalk.mp4（編集前＝二重にならない）。17.8s / 535f。
//  編集言語：濃いカード／付箋／進捗バー／ファンアウト／黄ボックス字幕／キラッ／寄り。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const TALKREF_FRAMES = 535;
const O = "#F5822B", Y = "#FFD64A", G = "#38C06B", B = "#5B9BD5", INK = "#20242C", SUB = "#8C8574";
const OUT = "0 3px 0 rgba(0,0,0,0.55), 0 0 12px rgba(0,0,0,0.45)";
const useSp = (d: number, dur = 14, cfg: any = { damping: 13, stiffness: 150, mass: 0.7 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - d, fps, config: cfg, durationInFrames: dur });
};
const GEN: Record<string, string> = {}; // 本物イラストを置いたら登録（public/gen/）
const Slot: React.FC<{ k: string; emoji: string; size: number }> = ({ k, emoji, size }) => (
  GEN[k] ? <Img src={staticFile(`gen/${GEN[k]}`)} style={{ width: size, height: size, objectFit: "contain" }} /> : <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>{emoji}</span>
);
const Pop: React.FC<{ show: number; hide: number; delay?: number; bounce?: boolean; rot?: number; sc?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ show, hide, delay = 0, bounce, rot = 0, sc = 1, children, style }) => {
  const f = useCurrentFrame();
  const s = useSp(show + delay, bounce ? 24 : 14, bounce ? { damping: 9, stiffness: 110, mass: 1 } : { damping: 13, stiffness: 150, mass: 0.7 });
  if (f < show || f >= hide) return null;
  const out = interpolate(f, [hide - 7, hide], [1, 0], clamp);
  const bob = Math.sin((f - show) / 34 * Math.PI * 2) * 3;
  const drop = (1 - Math.min(1, s)) * (bounce ? -60 : 16);
  const wob = bounce ? Math.sin((f - show) / 40 * Math.PI * 2) * 1.2 : 0;
  return <div style={{ position: "absolute", opacity: Math.min(1, s * 1.8) * out, transform: `translateY(${drop + bob}px) rotate(${rot + wob}deg) scale(${sc * Math.min(1, s)})`, fontFamily: FONT, ...style }}>{children}</div>;
};

// ── カラオケ字幕：喋った語が順に光る（単語タイムスタンプ基準） ──
// chunk = [文字, 出現フレーム, 強調色?, box?]
type Chunk = [string, number, string?, boolean?];
const LINES: Chunk[][] = [
  [["投資で", 0], ["失敗", 16, O], ["したくないなら", 29]],
  [["これだけ", 47, undefined, true], ["は抑えて", 65]],
  [["投資の", 74], ["3大原則", 80, O]],
  [["長期", 97, Y], ["・積立", 106, Y], ["・分散", 127, Y]],
  [["この3つを", 144], ["分かりやすく", 172], ["解説します", 199]],
  [["この3つを", 214], ["守るだけで", 231]],
  [["投資はグッと", 248], ["安定します", 272, G]],
  [["特に", 294], ["資産の分散は", 302, O]],
  [["見落としがち", 332, undefined, true]],
  [["ぜひ", 362], ["意識してみて", 368]],
  [["参考になったら", 383], ["保存して", 421, O]],
  [["見返すと", 424], ["嬉しいです", 447]],
];
const Telop: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let li = 0; for (let i = 0; i < LINES.length; i++) if (f >= LINES[i][0][1]) li = i;
  const line = LINES[li];
  const start = line[0][1];
  const end = li + 1 < LINES.length ? LINES[li + 1][0][1] : TALKREF_FRAMES;
  const appear = spring({ frame: f - start, fps, config: { damping: 16, stiffness: 200, mass: 0.6 }, durationInFrames: 7 });
  if (f >= end) return null;
  return (
    <div style={{ position: "absolute", left: 44, right: 44, top: 1300, textAlign: "center", fontFamily: FONT, transform: `translateY(${(1 - Math.min(1, appear)) * 24}px)` }}>
      <div style={{ fontWeight: 900, fontSize: 80, lineHeight: 1.22, letterSpacing: 0.5 }}>
        {line.map((c, i) => {
          const [t, cf, col, box] = c;
          const lit = f >= cf;
          const pop = spring({ frame: f - cf, fps, config: { damping: 11, stiffness: 240, mass: 0.5 }, durationInFrames: 8 });
          const sc = lit ? 1 + 0.18 * (1 - Math.min(1, pop)) : 1; // 出た瞬間だけ少し大きく
          if (box) return (
            <span key={i} style={{ display: "inline-block", background: lit ? Y : "rgba(255,255,255,0.25)", color: lit ? INK : "rgba(255,255,255,0.5)", padding: "4px 18px", borderRadius: 12, margin: "0 4px", transform: `rotate(-2deg) scale(${sc})` }}>{t}</span>
          );
          return <span key={i} style={{ display: "inline-block", color: lit ? (col || "#fff") : "rgba(255,255,255,0.42)", textShadow: lit ? OUT : "none", transform: `scale(${sc})`, transition: "none" }}>{t}</span>;
        })}
      </div>
    </div>
  );
};

// 付箋カード（本家の撮影/ご飯/ジム風）
const Sticky: React.FC<{ show: number; hide: number; rot: number; sc: number; color: string; tape: string; emoji: string; k: string; label: string; no: number; x: number; w: number }> = ({ show, hide, rot, sc, color, tape, emoji, k, label, no, x, w }) => (
  <Pop show={show} hide={hide} bounce rot={rot} sc={sc} style={{ left: x, top: 320 }}>
    <div style={{ width: w, background: color, borderRadius: 18, padding: "30px 0 16px", textAlign: "center", boxShadow: "0 14px 30px rgba(80,60,20,0.26)", position: "relative" }}>
      <div style={{ position: "absolute", left: "50%", top: -16, transform: "translateX(-50%) rotate(-4deg)", width: 96, height: 30, background: tape, opacity: 0.9, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: 14, top: 12, width: 44, height: 44, borderRadius: "50%", background: "#fff", color: INK, fontWeight: 900, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>{no}</div>
      <div style={{ height: w * 0.42, display: "flex", alignItems: "center", justifyContent: "center" }}><Slot k={k} emoji={emoji} size={w * 0.42} /></div>
      <div style={{ fontSize: 44, fontWeight: 900, color: INK, marginTop: 2 }}>{label}</div>
    </div>
  </Pop>
);

const Figures: React.FC = () => {
  const f = useCurrentFrame();
  const pct = Math.round(interpolate(f, [95, 300], [0, 100], clamp));
  return (
    <>
      {/* hook：ピル */}
      <Pop show={0} hide={89} style={{ left: 0, right: 0, top: 180, display: "flex", justifyContent: "center" }}>
        <div style={{ background: INK, color: "#fff", fontSize: 40, fontWeight: 900, padding: "12px 30px", borderRadius: 999, boxShadow: "0 12px 26px rgba(0,0,0,0.3)" }}>💰 <span style={{ color: Y }}>失敗しない人</span>の共通点</div>
      </Pop>

      {/* 三大原則：進捗バー＋付箋3枚 */}
      <Pop show={89} hide={314} style={{ left: 60, right: 60, top: 180 }}>
        <div style={{ background: INK, borderRadius: 20, padding: "20px 26px", boxShadow: "0 12px 26px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ color: "#fff", fontSize: 32, fontWeight: 900 }}><span style={{ color: O }}>✴</span> 3大原則をマスター</span>
            <span style={{ color: G, fontSize: 36, fontWeight: 900 }}>{pct}%</span>
          </div>
          <div style={{ position: "relative", height: 10, background: "#3a352c", borderRadius: 6 }}>
            <div style={{ position: "absolute", height: 10, width: `${pct}%`, background: G, borderRadius: 6 }} />
            {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", left: `${i / 2 * 100}%`, top: -7, transform: "translateX(-50%)", width: 24, height: 24, borderRadius: "50%", background: pct >= i / 2 * 100 ? G : "#3a352c", border: "3px solid #15130f" }} />)}
          </div>
        </div>
      </Pop>
      <Sticky show={119} hide={314} rot={-6} sc={1.0} color="#BBD8F0" tape="#8fbfe6" emoji="⏳" k="long" label="長期" no={1} x={46} w={248} />
      <Sticky show={138} hide={314} rot={4} sc={1.1} color="#FBE7A8" tape="#f0cf6a" emoji="💰" k="tsumitate" label="積立" no={2} x={360} w={268} />
      <Sticky show={157} hide={314} rot={-3} sc={1.0} color="#C6E7C0" tape="#9ad090" emoji="🌐" k="bunsan" label="分散" no={3} x={700} w={248} />

      {/* 資産の分散：ファンアウト */}
      <Pop show={314} hide={439} style={{ left: 0, right: 0, top: 150, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", background: INK, color: "#fff", fontSize: 40, fontWeight: 900, padding: "10px 30px", borderRadius: 999 }}>資産の分散
          <div style={{ position: "absolute", right: -20, top: -22, background: O, color: "#fff", fontSize: 24, fontWeight: 900, padding: "5px 14px", borderRadius: 999, transform: "rotate(7deg)" }}>見落としがち</div>
        </div>
      </Pop>
      <Pop show={320} hide={439} style={{ left: 70, top: 300 }}>
        <div style={{ width: 150, height: 150, borderRadius: "50%", background: G, border: "6px solid #fff", boxShadow: "0 10px 24px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>💼</div>
        <div style={{ textAlign: "center", fontSize: 30, fontWeight: 900, color: "#fff", background: INK, borderRadius: 999, padding: "4px 0", marginTop: 6 }}>資産</div>
      </Pop>
      <svg width="1080" height="520" style={{ position: "absolute", left: 0, top: 0 }}>
        {[300, 420, 540].map((y, i) => <line key={i} x1="220" y1="375" x2="700" y2={y + 30} stroke={O} strokeWidth="5" strokeDasharray="9 9" opacity={interpolate(f, [330 + i * 6, 346 + i * 6], [0, 1], clamp)} />)}
      </svg>
      {[{ e: "📊", l: "株", y: 300 }, { e: "🏦", l: "債券", y: 410 }, { e: "💴", l: "現金", y: 520 }].map((c, i) => (
        <Pop key={c.l} show={330} hide={439} delay={i * 8} rot={i % 2 ? 3 : -3} style={{ left: 700, top: c.y }}>
          <div style={{ width: 220, background: "#fff", border: `4px solid ${O}`, borderRadius: 16, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 10px 22px rgba(0,0,0,0.2)" }}>
            <span style={{ fontSize: 44 }}>{c.e}</span><span style={{ fontSize: 40, fontWeight: 900, color: INK }}>{c.l}</span>
          </div>
        </Pop>
      ))}

      {/* CTA */}
      <Pop show={439} hide={TALKREF_FRAMES} bounce style={{ left: 0, right: 0, top: 300, textAlign: "center" }}>
        <div style={{ fontSize: 140 }}>🔖</div>
        <div style={{ display: "inline-block", background: INK, color: "#fff", fontSize: 52, fontWeight: 900, padding: "16px 40px", borderRadius: 18, marginTop: 6 }}>保存して<span style={{ color: Y }}>見返そう</span></div>
      </Pop>
    </>
  );
};

const Sparkle: React.FC = () => {
  const f = useCurrentFrame();
  const o = [264, 314].reduce((a, p) => Math.max(a, interpolate(f, [p - 4, p + 2, p + 16], [0, 0.75, 0], clamp)), 0);
  return <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", left: 360, top: 760, fontSize: 320, opacity: o, filter: "blur(1px)" }}>✨</div></AbsoluteFill>;
};
const flashes = [89, 314, 439];
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  let o = 0; for (const p of flashes) o = Math.max(o, interpolate(f, [p - 3, p, p + 7], [0, 0.5, 0], clamp));
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};
const useZoom = () => {
  const f = useCurrentFrame();
  const base = interpolate(f, [0, TALKREF_FRAMES], [1.035, 1.1], clamp);
  // フレーズの頭ごとに軽くプッシュイン（＝止まらない・本家の"寄り"）
  const punch = [80, 97, 144, 214, 272, 302, 332, 383, 439].reduce((a, p) => a + 0.028 * Math.max(0, 1 - Math.abs(f - (p + 5)) / 10), 0);
  return base + punch;
};

export const TalkRefStyle: React.FC = () => {
  const z = useZoom();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 40%" }}>
        <OffthreadVideo src={staticFile("mytalk.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.1) saturate(1.18) brightness(0.97)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.42) 100%)", pointerEvents: "none" }} />
      <Figures />
      <Telop />
      <Sparkle />
      <Flash />
      <SfxTrack cues={[
        { file: "pop", at: 0, volume: 0.3 }, { file: "swipe", at: 89, volume: 0.34 },
        { file: "up1", at: 119, volume: 0.34 }, { file: "up2", at: 138, volume: 0.34 }, { file: "up3", at: 157, volume: 0.34 },
        { file: "finish", at: 264, volume: 0.42 }, { file: "swipe", at: 314, volume: 0.34 },
        { file: "up4", at: 330, volume: 0.3 }, { file: "up6", at: 346, volume: 0.3 }, { file: "correct", at: 362, volume: 0.3 },
        { file: "swipe", at: 439, volume: 0.34 }, { file: "finish", at: 476, volume: 0.42 },
      ]} />
    </AbsoluteFill>
  );
};
