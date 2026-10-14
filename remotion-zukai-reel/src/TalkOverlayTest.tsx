import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { FONT_ROUND } from "./components/font";
import { SfxTrack } from "./components/sfx";

// ═══════════════════════════════════════════════════════════════════
// トークリール・オーバーレイ編集 v3（実写 talktest.mp4・NISA相続の冒頭18.6s）
//   丸ゴシック太字／本物っぽい証券アプリUI／スライドイン＋スナップ／ケンバーンズ＋
//   グレーディング／ダークチェックリスト＋✓／NISA口座✕図＋要注意スタンプ／
//   大きな縁取りキーワード字幕（語同期）。実写素材は .gitignore 済み。
// ═══════════════════════════════════════════════════════════════════

const F = FONT_ROUND;          // 丸ゴシック太字
const FPS = 30;
export const TALKOV_FRAMES = 560;
const s2f = (s: number) => Math.round(s * FPS);

const C = {
  green: "#18B36B", greenD: "#0E7A47", navy: "#1C2436", red: "#F0452E", yellow: "#FFC21E",
  lime: "#86E05A", ink: "#1C2436", dark: "#0C1322", dark2: "#141E33", chip: "#1A2435",
};

// スライドイン＋スプリング（dir: 'l'|'r'|'u'|'d'）
const Slide: React.FC<{ delay: number; until?: number; dir?: "l" | "r" | "u" | "d"; dist?: number; amp?: number; style?: React.CSSProperties; children: React.ReactNode }> =
  ({ delay, until, dir = "u", dist = 60, amp = 5, style, children }) => {
    const f = useCurrentFrame(); const { fps } = useVideoConfig();
    if (f < delay - 2 || (until && f > until + 12)) return null;
    const s = spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 180, mass: 0.7 }, durationInFrames: 9 });
    const out = until ? interpolate(f, [until, until + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
    const off = (1 - s) * dist;
    const tx = dir === "l" ? -off : dir === "r" ? off : 0;
    const ty = (dir === "u" ? off : dir === "d" ? -off : 0) + Math.sin(((f - delay) / FPS) * 2 * Math.PI * 0.28) * amp;
    return <div style={{ position: "absolute", opacity: Math.min(1, s * 1.9) * out, transform: `translate(${tx}px,${ty}px)`, ...style }}>{children}</div>;
};
const Pop: React.FC<{ delay: number; until?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, until, style, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (f < delay - 2 || (until && f > until + 12)) return null;
  const s = spring({ frame: f - delay, fps, config: { damping: 10, stiffness: 200, mass: 0.7 }, durationInFrames: 8 });
  const out = until ? interpolate(f, [until, until + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return <div style={{ position: "absolute", opacity: Math.min(1, s * 2) * out, transform: `scale(${s})`, ...style }}>{children}</div>;
};
const Dots = () => <div style={{ display: "flex", gap: 8 }}>{["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />)}</div>;

// ── 本物っぽい証券アプリ画面 ───────────────────────────
const SecApp: React.FC<{ frame: number }> = ({ frame }) => {
  // 評価額のカウントアップ＋グラフ描画
  const grow = interpolate(frame, [s2f(3.7), s2f(5.0)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const val = Math.round(5_000_000 * grow);
  const pts = [0, 18, 10, 34, 26, 48, 40, 68, 60, 86];
  const path = pts.map((y, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * 480},${110 - y}`).join(" ");
  const dashLen = 900;
  return (
    <div style={{ width: 520, borderRadius: 30, background: "#0B1020", padding: 18, boxShadow: "0 22px 50px rgba(0,0,0,0.45)", border: "1px solid #223" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px 14px" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.green }} />
        <span style={{ fontFamily: F, fontWeight: 800, fontSize: 26, color: "#fff" }}>証券口座</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: F, fontSize: 22, color: "#7E8AA0" }}>●●●</span>
      </div>
      <div style={{ background: "#121A2E", borderRadius: 20, padding: "18px 20px" }}>
        <div style={{ fontFamily: F, fontSize: 24, color: "#8C99B2", fontWeight: 700 }}>評価額</div>
        <div style={{ fontFamily: F, fontSize: 60, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>¥{val.toLocaleString()}</div>
        <div style={{ fontFamily: F, fontSize: 24, fontWeight: 800, color: C.lime }}>▲ +1,240,000 (+33%)</div>
        <svg width="480" height="120" viewBox="0 0 480 120" style={{ marginTop: 6 }}>
          <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.green} stopOpacity="0.4" /><stop offset="1" stopColor={C.green} stopOpacity="0" /></linearGradient></defs>
          <path d={`${path} L480,120 L0,120 Z`} fill="url(#sg)" opacity={grow} />
          <path d={path} fill="none" stroke={C.lime} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" pathLength={dashLen} strokeDasharray={dashLen} strokeDashoffset={dashLen * (1 - grow)} />
        </svg>
      </div>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {[["全世界株式", "¥3,200,000"], ["米国株式", "¥1,800,000"]].map(([a, b], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", background: "#121A2E", borderRadius: 14, padding: "12px 16px" }}>
            <span style={{ fontFamily: F, fontSize: 24, fontWeight: 700, color: "#D6DEEC" }}>{a}</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: F, fontSize: 24, fontWeight: 800, color: "#fff" }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── NISA口座ボックス ──────────────────────────────────
const AcctBox: React.FC<{ title: string; sub: string; tone: "ink" | "red" }> = ({ title, sub, tone }) => (
  <div style={{ background: "#fff", borderRadius: 18, border: `3px solid ${tone === "red" ? C.red : C.navy}`, padding: "12px 20px", textAlign: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}>
    <div style={{ fontFamily: F, fontSize: 23, fontWeight: 700, color: "#6A7486" }}>{sub}</div>
    <div style={{ fontFamily: F, fontSize: 40, fontWeight: 800, color: tone === "red" ? C.red : C.navy }}>{title}</div>
  </div>
);
const CheckPop: React.FC<{ delay: number; size?: number }> = ({ delay, size = 46 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 9, stiffness: 220 }, durationInFrames: 7 });
  return (
    <div style={{ width: size, height: size, transform: `scale(${Math.min(1.15, s * 1.15)})`, opacity: Math.min(1, s * 2) }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 14px rgba(134,224,90,0.5)" }}>
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24"><path d="M4 13l5 5L20 6" fill="none" stroke="#0B1020" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
};

// ── 大きな縁取りキーワード字幕（語同期・キメ語パンチ） ──
type Seg = { t: string; c?: string };
const Cap: React.FC<{ segs: Seg[]; from: number; to: number }> = ({ segs, from, to }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (f < from - 7 || f > to + 14) return null;
  const s = spring({ frame: f - from, fps, config: { damping: 14, stiffness: 200 }, durationInFrames: 7 });
  const out = interpolate(f, [to + 4, to + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kick = interpolate(f - from, [0, 4, 9], [0.86, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outline = "4px 4px 0 #14203A,-4px 4px 0 #14203A,4px -4px 0 #14203A,-4px -4px 0 #14203A,0 0 4px #14203A,0 8px 20px rgba(0,0,0,0.5)";
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 1420, textAlign: "center", opacity: Math.min(1, s * 1.8) * out, transform: `translateY(${(1 - s) * 16}px)` }}>
      {segs.map((sg, i) => (
        <span key={i} style={{ display: "inline-block", fontFamily: F, fontWeight: 800, fontSize: sg.c ? 86 : 58, color: sg.c ?? "#fff", textShadow: outline, letterSpacing: 0.5, transform: sg.c ? `scale(${kick})` : undefined, transformOrigin: "center bottom", lineHeight: 1.1 }}>{sg.t}</span>
      ))}
    </div>
  );
};

export const TalkOverlayTest: React.FC = () => {
  const f = useCurrentFrame();
  // ケンバーンズ（ゆっくりズーム）
  const kb = interpolate(f, [0, 560], [1.05, 1.12]);
  const pf = s2f(12.45);
  const shake = f > pf && f < pf + 12 ? Math.sin(f * 2.4) * 8 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: F }}>
      {/* 実写＋グレーディング＋ケンバーンズ */}
      <AbsoluteFill style={{ transform: `translateX(${shake}px) scale(${kb})`, transformOrigin: "50% 42%" }}>
        <OffthreadVideo src={staticFile("talktest.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.07) saturate(1.12) brightness(1.02)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(130% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.34) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.30) 0%,transparent 20%,transparent 60%,rgba(0,0,0,0.34) 100%)", pointerEvents: "none" }} />

      {/* トピックタブ（常時・丸ゴシック） */}
      <Pop delay={8} style={{ top: 118, left: 50 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 999, padding: "13px 24px", boxShadow: "0 10px 24px rgba(0,0,0,0.25)" }}>
          <span style={{ width: 18, height: 18, borderRadius: 5, background: C.green }} />
          <span style={{ fontFamily: F, fontSize: 36, fontWeight: 800, color: C.navy }}>新NISA × 相続</span>
        </div>
      </Pop>

      {/* A：もしもの時（左からスライド・dark memo） */}
      <Slide delay={s2f(1.3)} until={s2f(3.2)} dir="l" style={{ top: 300, left: 60, width: 620 }}>
        <div style={{ borderRadius: 20, overflow: "hidden", background: "#15192260", backdropFilter: "blur(6px)", boxShadow: "0 16px 40px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(255,255,255,0.08)" }}><Dots /><span style={{ fontFamily: F, fontSize: 20, color: "#CBD3E2", fontWeight: 700 }}>もしもの話</span></div>
          <div style={{ padding: "20px 22px", fontFamily: F, fontWeight: 800, fontSize: 38, color: "#fff", lineHeight: 1.4 }}>もし、パートナーに<br />万一のことが…</div>
        </div>
      </Slide>

      {/* B：証券アプリUI（右からスライド）＋？ */}
      <Slide delay={s2f(3.5)} until={s2f(9.0)} dir="r" dist={80} style={{ top: 250, left: 480 }}>
        <SecApp frame={f} />
      </Slide>
      {/* 資産→？（アプリカードの上に被せる＝相続が起きたら） */}
      <Pop delay={s2f(4.9)} until={s2f(9.0)} style={{ top: 250, left: 480 }}>
        <div style={{ width: 520, height: 540, borderRadius: 30, background: "rgba(8,10,20,0.64)", backdropFilter: "blur(2px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <span style={{ fontFamily: F, fontSize: 34, fontWeight: 800, color: "#fff" }}>相続が起きたら</span>
          <span style={{ fontFamily: F, fontSize: 170, fontWeight: 800, color: C.yellow, textShadow: "5px 5px 0 #14203A", lineHeight: 1 }}>？</span>
        </div>
      </Pop>

      {/* 間：注意点の予告チェックリスト（下からスライド・stagger） */}
      <Slide delay={s2f(9.2)} until={s2f(12.2)} dir="d" dist={40} style={{ top: 980, left: 60, width: 640 }}>
        <div style={{ borderRadius: 18, overflow: "hidden", background: "rgba(12,19,34,0.82)", boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}>
          <div style={{ padding: "12px 18px", fontFamily: F, fontWeight: 800, fontSize: 24, color: C.yellow }}>この後 解説する注意点</div>
          <div style={{ padding: "4px 14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {["① 非課税のまま引き継げない", "② 同じ金融機関じゃないと", "③ 引き継ぐ“値段”に注意"].map((t, i) => (
              <Pop key={i} delay={s2f(9.4) + i * 7} until={s2f(12.2)} style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.chip, borderRadius: 12, padding: "13px 16px" }}>
                  <span style={{ fontFamily: F, fontSize: 28, fontWeight: 800, color: "#fff" }}>{t}</span>
                  <div style={{ flex: 1 }} /><span style={{ fontSize: 26, color: C.yellow, fontWeight: 800 }}>?</span>
                </div>
              </Pop>
            ))}
          </div>
        </div>
      </Slide>

      {/* D：山場 NISA口座は引き継げない ✕（Popで強く） */}
      <Pop delay={pf} until={s2f(14.6)} style={{ top: 290, left: 90, width: 900 }}>
        <div style={{ width: 900, background: "rgba(255,255,255,0.97)", borderRadius: 26, border: `6px solid ${C.red}`, padding: "26px 28px", boxShadow: "0 20px 50px rgba(0,0,0,0.35)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <AcctBox sub="亡くなった人の" title="NISA口座" tone="ink" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 60, color: C.red, fontWeight: 900 }}>✕</span>
              <span style={{ fontSize: 40, color: "#9AA3B3" }}>→</span>
            </div>
            <AcctBox sub="相続人の" title="NISA口座" tone="red" />
          </div>
          <div style={{ textAlign: "center", marginTop: 14, fontFamily: F, fontSize: 50, fontWeight: 800, color: C.red }}>そのままでは引き継げない</div>
          <Pop delay={pf + 7} style={{ top: -34, left: 688, transform: "rotate(-10deg)" }}>
            <div style={{ border: `5px solid ${C.red}`, color: C.red, borderRadius: 12, padding: "6px 20px", fontFamily: F, fontSize: 38, fontWeight: 800, background: "rgba(255,255,255,0.94)", whiteSpace: "nowrap" }}>要注意</div>
          </Pop>
        </div>
      </Pop>

      {/* E：解説する3つ（ダークチェックリスト・下からstagger） */}
      <Slide delay={s2f(14.9)} until={s2f(17.3)} dir="d" dist={44} style={{ top: 320, left: 54, width: 780 }}>
        <div style={{ borderRadius: 20, overflow: "hidden", background: "rgba(10,16,30,0.9)", boxShadow: "0 18px 44px rgba(0,0,0,0.45)" }}>
          <div style={{ padding: "14px 20px", fontFamily: F, fontWeight: 800, fontSize: 30, color: C.yellow }}>この動画で解説する3つ</div>
          <div style={{ padding: "4px 16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            {["① 非課税のまま引き継げない", "② 同じ金融機関じゃないと移せない", "③ 引き継ぐのは“亡くなった日の値段”"].map((t, i) => (
              <Pop key={i} delay={s2f(15.0) + i * 8} until={s2f(17.3)}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#102A1C", borderRadius: 14, padding: "16px 18px", border: "1px solid #1E4A33" }}>
                  <span style={{ fontFamily: F, fontSize: 31, fontWeight: 800, color: "#fff" }}>{t}</span>
                  <div style={{ flex: 1 }} /><CheckPop delay={s2f(15.0) + i * 8 + 5} />
                </div>
              </Pop>
            ))}
          </div>
        </div>
      </Slide>

      {/* 語同期・大きな縁取りキーワード字幕 */}
      <Cap segs={[{ t: "もし、配偶者が" }, { t: "亡くなったら", c: C.red }]} from={s2f(1.39)} to={s2f(2.99)} />
      <Cap segs={[{ t: "新NISAの資産は、" }, { t: "どうなる？", c: C.yellow }]} from={s2f(3.41)} to={s2f(5.41)} />
      <Cap segs={[{ t: "実は、" }, { t: "相続人が", c: C.green }]} from={s2f(9.39)} to={s2f(10.79)} />
      <Cap segs={[{ t: "NISA口座を、" }, { t: "引き継げない", c: C.red }]} from={s2f(12.45)} to={s2f(14.43)} />
      <Cap segs={[{ t: "注意点", c: C.yellow }, { t: "もあるから解説します" }]} from={s2f(14.85)} to={s2f(16.55)} />

      <SfxTrack gain={1} cues={[
        { file: "user/u05", at: s2f(1.3), volume: 0.24 },
        { file: "user/u03", at: s2f(3.5), volume: 0.26 },
        { file: "user/u04", at: s2f(4.9), volume: 0.26 },
        { file: "user/u02s", at: s2f(9.3), volume: 0.2 },
        { file: "user/u07", at: s2f(12.2), volume: 0.34 },
        { file: "user/u04", at: s2f(12.5), volume: 0.34 },
        { file: "user/u10", at: s2f(14.9), volume: 0.26 },
      ]} />
    </AbsoluteFill>
  );
};
