import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";

// ═══════════════════════════════════════════════════════════════════
// トークリール・オーバーレイ編集（実写 talktest.mp4 の上・NISA相続の冒頭18.6s）
//   参考リール級の密度：ウィンドウカード／タイプライタ／閃光バッジ／ゲームHUD調／
//   手描き連結図＋✕スタンプ／ダークチェックリスト＋✓／縁取りキーワード字幕。
//   語タイムスタンプ(whisper)に同期。実写素材は .gitignore 済み。
// ═══════════════════════════════════════════════════════════════════

const FPS = 30;
export const TALKOV_FRAMES = 560;
const s2f = (s: number) => Math.round(s * FPS);

const C = {
  green: "#2FA36B", navy: "#20283A", red: "#E23B2E", yellow: "#FFC21E", lime: "#7FD44A",
  ink: "#20283A", line: "#D8DEE8", dark: "#0E1626", dark2: "#15213A",
};

const useS = (delay: number, dur = 8, cfg: Parameters<typeof spring>[0]["config"] = { damping: 12, stiffness: 160, mass: 0.7 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};
const Float: React.FC<{ delay?: number; amp?: number; style?: React.CSSProperties; until?: number; children: React.ReactNode }> = ({ delay = 0, amp = 6, style, until, children }) => {
  const f = useCurrentFrame(); const s = useS(delay);
  if (f < delay - 2 || (until && f > until + 12)) return null;
  const bob = Math.sin(((f - delay) / FPS) * 2 * Math.PI * 0.3) * amp;
  const out = until ? interpolate(f, [until, until + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return <div style={{ opacity: Math.min(1, s * 1.8) * out, transform: `translateY(${(1 - s) * 22 + bob}px) scale(${s})`, ...style }}>{children}</div>;
};
const Pop: React.FC<{ delay: number; until?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, until, style, children }) => {
  const f = useCurrentFrame(); const s = useS(delay);
  if (f < delay - 2 || (until && f > until + 12)) return null;
  const out = until ? interpolate(f, [until, until + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return <div style={{ opacity: Math.min(1, s * 2) * out, transform: `scale(${s})`, ...style }}>{children}</div>;
};
const Dots = () => <div style={{ display: "flex", gap: 8 }}>{["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />)}</div>;

const Win: React.FC<{ delay: number; until?: number; title?: React.ReactNode; dark?: boolean; glow?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, until, title, dark, glow, w = 720, style, children }) => (
  <Float delay={delay} until={until} style={{ width: w, position: "absolute", ...style }}>
    <div style={{ borderRadius: 18, overflow: "hidden", background: dark ? "#1C1C20" : "#F6F6F9", boxShadow: glow ? `0 0 0 3px ${glow}, 0 14px 34px rgba(0,0,0,0.33)` : "0 14px 34px rgba(0,0,0,0.3)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 15px", background: dark ? "#2A2A2E" : "#E7E7EC" }}>
        <Dots />{title && <div style={{ fontSize: 20, fontWeight: 700, color: dark ? "#D6D6DA" : "#55596A" }}>{title}</div>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  </Float>
);
const Type: React.FC<{ text: string; delay: number; cps?: number; color?: string }> = ({ text, delay, cps = 26, color = "#E8E8EC" }) => {
  const f = useCurrentFrame(); const n = Math.max(0, Math.floor(((f - delay) / FPS) * cps));
  const caret = f % 20 < 12 && n <= text.length;
  return <span style={{ fontSize: 30, fontWeight: 700, color, fontFamily: "monospace, " + FONT, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{text.slice(0, n)}{caret && "|"}</span>;
};
const CheckPop: React.FC<{ delay: number; size?: number }> = ({ delay, size = 52 }) => (
  <Pop delay={delay} style={{ width: size, height: size }}>
    <div style={{ width: size, height: size, borderRadius: "50%", background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 14px rgba(123,212,74,0.5)" }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24"><path d="M4 13l5 5L20 6" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  </Pop>
);
const Pip: React.FC<{ x: number; y: number; delay: number; until?: number }> = ({ x, y, delay, until }) => (
  <Float delay={delay} until={until} amp={5} style={{ position: "absolute", left: x, top: y }}>
    <div style={{ width: 230, height: 300, borderRadius: 20, overflow: "hidden", border: "4px solid #fff", boxShadow: "0 12px 30px rgba(0,0,0,0.35)" }}>
      <OffthreadVideo src={staticFile("talktest.mp4")} style={{ width: 460, height: 300, objectFit: "cover", transform: "translateX(-28%)" }} muted />
    </div>
  </Float>
);
// 閃光「？」バッジ
const QBurst: React.FC<{ delay: number; until?: number; style?: React.CSSProperties }> = ({ delay, until, style }) => {
  const f = useCurrentFrame(); const pulse = 0.88 + 0.12 * Math.sin((f - delay) * 0.3);
  return (
    <Pop delay={delay} until={until} style={{ position: "absolute", ...style }}>
      <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: `scale(${pulse})`, filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.3))" }}>
        <g fill={C.yellow}>{Array.from({ length: 12 }).map((_, i) => <rect key={i} x="71" y="4" width="8" height="20" rx="4" transform={`rotate(${i * 30} 75 75)`} />)}</g>
        <circle cx="75" cy="75" r="52" fill={C.yellow} />
        <text x="75" y="100" textAnchor="middle" fontSize="70" fontWeight="900" fill={C.navy} fontFamily={FONT}>？</text>
      </svg>
    </Pop>
  );
};

// 縁取りキーワード字幕（語同期の色スウィープ付き）
type Seg = { t: string; c?: string };
const Cap: React.FC<{ segs: Seg[]; from: number; to: number }> = ({ segs, from, to }) => {
  const f = useCurrentFrame();
  if (f < from - 7 || f > to + 16) return null;
  const s = spring({ frame: f - from, fps: FPS, config: { damping: 16 }, durationInFrames: 8 });
  const out = interpolate(f, [to + 6, to + 16], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outline = "3px 3px 0 #20283A,-3px 3px 0 #20283A,3px -3px 0 #20283A,-3px -3px 0 #20283A,0 0 3px #20283A,0 6px 16px rgba(0,0,0,0.45)";
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1440, textAlign: "center", opacity: Math.min(1, s * 1.7) * out, transform: `translateY(${(1 - s) * 14}px)` }}>
      {segs.map((sg, i) => <span key={i} style={{ fontFamily: FONT, fontSize: sg.c ? 70 : 54, fontWeight: 900, color: sg.c ?? "#fff", textShadow: outline, letterSpacing: 0.5 }}>{sg.t}</span>)}
    </div>
  );
};

// NISA口座ボックス
const AcctBox: React.FC<{ title: string; sub: string; tone: "ink" | "red" }> = ({ title, sub, tone }) => (
  <div style={{ background: "#fff", borderRadius: 16, border: `3px solid ${tone === "red" ? C.red : C.navy}`, padding: "14px 20px", textAlign: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}>
    <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: "#6A7486" }}>{sub}</div>
    <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 900, color: tone === "red" ? C.red : C.navy }}>{title}</div>
  </div>
);

export const TalkOverlayTest: React.FC = () => {
  const f = useCurrentFrame();
  const brOp = interpolate(f, [4, 16, 72, 88], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pf = s2f(12.45);
  const shake = f > pf && f < pf + 12 ? Math.sin(f * 2.3) * 7 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: FONT }}>
      <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
        <OffthreadVideo src={staticFile("talktest.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {/* わずかな上下グラデ（字幕とトップUIの可読性） */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.28) 0%,transparent 22%,transparent 62%,rgba(0,0,0,0.30) 100%)", pointerEvents: "none" }} />

      {/* トピックタブ（常時） */}
      <Pop delay={8} style={{ position: "absolute", top: 120, left: 54 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 999, padding: "12px 22px", boxShadow: "0 8px 20px rgba(0,0,0,0.22)" }}>
          <span style={{ width: 16, height: 16, borderRadius: 4, background: C.green }} />
          <span style={{ fontSize: 34, fontWeight: 900, color: C.navy }}>新NISA × 相続</span>
        </div>
      </Pop>

      {/* 冒頭 REC フレーム */}
      <AbsoluteFill style={{ opacity: brOp, pointerEvents: "none" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", width: 66, height: 66,
            left: i % 2 === 0 ? 46 : undefined, right: i % 2 === 1 ? 46 : undefined, top: i < 2 ? 260 : undefined, bottom: i >= 2 ? 520 : undefined,
            borderTop: i < 2 ? "6px solid #fff" : undefined, borderBottom: i >= 2 ? "6px solid #fff" : undefined, borderLeft: i % 2 === 0 ? "6px solid #fff" : undefined, borderRight: i % 2 === 1 ? "6px solid #fff" : undefined }} />
        ))}
        <div style={{ position: "absolute", top: 195, right: 52, color: "#fff", fontWeight: 900, fontSize: 26, display: "flex", gap: 10, alignItems: "center" }}><span style={{ width: 14, height: 14, borderRadius: "50%", background: C.red }} />REC・FHD</div>
      </AbsoluteFill>

      {/* A：もしもの時…（dark memoカード・タイプライタ） */}
      <Win delay={s2f(1.3)} until={s2f(3.2)} dark w={640} title="memo.txt" style={{ top: 300, left: 70 }}>
        <div style={{ minHeight: 96 }}><Type text={"もし、パートナーに\n万一のことがあったら…"} delay={s2f(1.5)} color="#E8E8EC" /></div>
      </Win>

      {/* B：資産はどうなる？（？バッジ＋Winカード） */}
      <QBurst delay={s2f(3.5)} until={s2f(8.9)} style={{ top: 250, right: 70 }} />
      <Win delay={s2f(3.6)} until={s2f(8.9)} glow={C.green} w={640} style={{ top: 340, left: 70 }} title="NISA口座">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, padding: "6px 0" }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: C.navy }}>遺された資産</span>
          <span style={{ fontSize: 44, color: "#9AA3B3" }}>→</span>
          <span style={{ fontSize: 72, fontWeight: 900, color: C.green }}>？</span>
        </div>
      </Win>

      {/* 間（5.4–9.4）：注意点の予告チェックリスト＋PiP */}
      <Pip x={760} y={250} delay={s2f(5.6)} until={s2f(9.2)} />
      <Win delay={s2f(5.7)} until={s2f(9.2)} dark w={600} style={{ top: 620, left: 70 }} title="この後 解説する注意点">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {["① 非課税のまま引き継げない", "② 同じ金融機関じゃないと", "③ 引き継ぐ“値段”に注意"].map((t, i) => (
            <Pop key={i} delay={s2f(5.9) + i * 8} until={s2f(9.2)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#20242B", borderRadius: 12, padding: "12px 16px", border: "1px solid #2E3952" }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", opacity: 0.9 }}>{t}</span>
                <div style={{ flex: 1 }} /><span style={{ fontSize: 26, color: C.yellow, fontWeight: 900 }}>?</span>
              </div>
            </Pop>
          ))}
        </div>
      </Win>

      {/* C：相続人（9.4–10.8） 丸マーク＋人物 */}
      <Pop delay={s2f(9.5)} until={s2f(12.2)} style={{ position: "absolute", top: 320, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "#fff", borderRadius: 999, padding: "12px 30px", fontSize: 54, fontWeight: 900, color: C.navy, boxShadow: "0 10px 24px rgba(0,0,0,0.2)", border: `4px solid ${C.green}` }}>相続人（配偶者・子）</span>
      </Pop>

      {/* D：山場 NISA口座は引き継げない ✕ */}
      <Float delay={pf} until={s2f(14.6)} amp={5} style={{ position: "absolute", top: 300, left: 0, width: 1080 }}>
        <div style={{ margin: "0 auto", width: 900, background: "rgba(255,255,255,0.96)", borderRadius: 24, border: `5px solid ${C.red}`, padding: "26px 28px", boxShadow: "0 18px 44px rgba(0,0,0,0.3)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <AcctBox sub="亡くなった人の" title="NISA口座" tone="ink" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 56, color: C.red, fontWeight: 900 }}>✕</span>
              <span style={{ fontSize: 40, color: "#9AA3B3" }}>→</span>
            </div>
            <AcctBox sub="相続人の" title="NISA口座" tone="red" />
          </div>
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 46, fontWeight: 900, color: C.red }}>そのままでは引き継げない</div>
          {/* スタンプ */}
          <Pop delay={pf + 8} style={{ position: "absolute", top: -28, right: 24, transform: "rotate(-10deg)" }}>
            <div style={{ border: `5px solid ${C.red}`, color: C.red, borderRadius: 12, padding: "6px 18px", fontSize: 34, fontWeight: 900, background: "rgba(255,255,255,0.9)" }}>要注意</div>
          </Pop>
        </div>
      </Float>

      {/* E：注意点を解説（ダークチェックリスト締め） */}
      <Win delay={s2f(14.9)} until={s2f(17.2)} dark w={760} style={{ top: 330, left: 60 }} title={<span style={{ color: C.yellow }}>この動画で解説する3つ</span>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {["① 非課税のまま引き継げない", "② 同じ金融機関じゃないと移せない", "③ 引き継ぐのは“亡くなった日の値段”"].map((t, i) => (
            <Pop key={i} delay={s2f(15.0) + i * 9} until={s2f(17.2)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#17241A", borderRadius: 14, padding: "16px 18px", border: "1px solid #2C4A2E" }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: "#fff" }}>{t}</span>
                <div style={{ flex: 1 }} /><CheckPop delay={s2f(15.0) + i * 9 + 5} size={42} />
              </div>
            </Pop>
          ))}
        </div>
      </Win>

      {/* 語同期・縁取りキーワード字幕 */}
      <Cap segs={[{ t: "もし、配偶者が" }, { t: "亡くなったら", c: C.red }]} from={s2f(1.39)} to={s2f(2.99)} />
      <Cap segs={[{ t: "新NISAの資産は、" }, { t: "どうなる？", c: C.yellow }]} from={s2f(3.41)} to={s2f(5.41)} />
      <Cap segs={[{ t: "実は、" }, { t: "相続人が", c: C.green }]} from={s2f(9.39)} to={s2f(10.79)} />
      <Cap segs={[{ t: "NISA口座を、" }, { t: "引き継げない", c: C.red }]} from={s2f(12.45)} to={s2f(14.43)} />
      <Cap segs={[{ t: "注意点", c: C.yellow }, { t: "もあるから解説します" }]} from={s2f(14.85)} to={s2f(16.55)} />

      <SfxTrack gain={1} cues={[
        { file: "user/u05", at: s2f(1.3), volume: 0.24 },
        { file: "user/u03", at: s2f(3.5), volume: 0.26 },
        { file: "user/u02s", at: s2f(5.8), volume: 0.2 },
        { file: "user/u02s", at: s2f(6.1), volume: 0.2 },
        { file: "user/u07", at: s2f(12.2), volume: 0.34 },
        { file: "user/u04", at: s2f(12.5), volume: 0.34 },
        { file: "user/u10", at: s2f(14.9), volume: 0.26 },
      ]} />
    </AbsoluteFill>
  );
};
