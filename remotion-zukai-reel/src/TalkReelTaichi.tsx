import React from "react";
import { AbsoluteFill, OffthreadVideo, Audio, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  トークリール自動編集：資産運用トーク（実写＋オーバーレイ）
//  素材：public/talk_video.mp4（HDR→SDR変換済み・26.2s）＋ public/talk_narration.wav
//  設計規則（talk-reel-pipeline.md）：実写下敷き＋語同期テロップ（白極太＋黒縁取り・下寄り2行以内）
//   ＋上部ヘッドルームに図解パネル（明るい紙色＋ライムアクセント）＋寄りズーム＋控えめSFX。
//   顔・口・手・マイク・Insタ上部UIに文字を被せない。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = 30;
const s2f = (s: number) => Math.round(s * FPS);
export const TALKT_FRAMES = s2f(26.2); // 786

// パレット（明るい紙色＋ライム）
const P = {
  paper: "#FBF7EC", ink: "#23201A", sub: "#8A8270",
  white: "#FFFFFF", orange: "#FF7A1A", red: "#E0483B", green: "#2FB463",
  lime: "#9AD11E", limeDk: "#5E8A08", mark: "#FFE14D", card: "#FFFFFF",
};
const OUT = "0 3px 0 rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.5)";

// ── テロップ（発話どおり・正しい日本語に直す・キーワード色＋黄マーカー・2行以内）──
type Run = { t: string; c?: string; mark?: boolean };
// f = 発話した単語の頭フレーム（talk_transcript.json の word ts ×30fps）
const SEGS: { f: number; runs: Run[] }[] = [
  { f: s2f(0.0),  runs: [{ t: "衝撃", c: P.mark, mark: true }, { t: "でした" }] },
  { f: s2f(0.96), runs: [{ t: "銀行の" }, { t: "100万円", c: P.white }] },
  { f: s2f(2.46), runs: [{ t: "30年後には" }, { t: "4割", c: P.orange }] },
  { f: s2f(4.40), runs: [{ t: "価値が" }, { t: "減ってる", c: P.red }, { t: "かも" }] },
  { f: s2f(5.86), runs: [{ t: "なぜ" }, { t: "資産運用", c: P.lime }, { t: "なのか" }] },
  { f: s2f(8.80), runs: [{ t: "わかりやすく" }, { t: "解説", c: P.lime }, { t: "します" }] },
  { f: s2f(9.98), runs: [{ t: "正直、僕も昔は" }] },
  { f: s2f(11.82),runs: [{ t: "「投資なんて」", c: P.orange }, { t: "側でした" }] },
  { f: s2f(14.0), runs: [{ t: "証券口座を作るのも" }] },
  { f: s2f(15.5), runs: [{ t: "正直" }, { t: "めんどくさかった", mark: true }] },
  { f: s2f(17.18),runs: [{ t: "積立も最初は" }, { t: "怖くて", c: P.orange }] },
  { f: s2f(19.1), runs: [{ t: "月" }, { t: "1,000円", c: P.green }, { t: "から始めました" }] },
  { f: s2f(20.42),runs: [{ t: "でも今は" }, { t: "やってよかった", c: P.green }] },
  { f: s2f(23.46),runs: [{ t: "今一度、" }, { t: "お金の置き場所", c: P.lime }] },
  { f: s2f(24.9), runs: [{ t: "考えてみて", c: P.white }, { t: "ください" }] },
];

const Telop: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = 0;
  for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i].f) idx = i;
  const seg = SEGS[idx];
  const end = idx + 1 < SEGS.length ? SEGS[idx + 1].f : TALKT_FRAMES;
  if (f < SEGS[0].f || f >= end) return null;
  const s = spring({ frame: f - seg.f, fps, config: { damping: 14, stiffness: 180, mass: 0.6 }, durationInFrames: 9 });
  const pop = 0.95 + 0.05 * Math.min(1, s * 1.6);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1070, textAlign: "center", transform: `scale(${pop})`, transformOrigin: "center", fontFamily: FONT }}>
      <div style={{ fontWeight: 900, fontSize: 64, lineHeight: 1.28, letterSpacing: 1 }}>
        {seg.runs.map((r, i) =>
          r.mark ? (
            <span key={i} style={{ position: "relative", display: "inline-block", color: P.ink }}>
              <span style={{ position: "absolute", left: -6, right: -6, top: "22%", bottom: "8%", background: P.mark, borderRadius: 10, zIndex: 0 }} />
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
  return <div style={{ position: "absolute", opacity: Math.min(1, s * 1.6) * out, transform: `translateY(${(1 - Math.min(1, s)) * 16 + bob}px) scale(${Math.min(1, s)})`, transformOrigin: "center", fontFamily: FONT, ...style }}>{children}</div>;
};

const NumCount: React.FC<{ from: number; to: number; at: number; dur?: number; fmt?: (n: number) => string; style?: React.CSSProperties }> = ({ from, to, at, dur = 18, fmt, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], clamp);
  const v = from + (to - from) * p;
  const txt = fmt ? fmt(v) : String(Math.round(v));
  return <span style={style}>{txt}</span>;
};

// ── 上部ヘッドルームの図解（顔より上：y≈48〜560）──
const HOOK_END = s2f(5.86);
const SEG1_END = s2f(14.0);
const SEG2_END = s2f(20.42);

const Panels: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {/* ── フック：銀行100万→30年で実質4割減（0〜5.9s）── */}
      <Pop show={0} hide={HOOK_END} style={{ left: 0, right: 0, top: 54, display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: P.white, background: P.red, padding: "13px 30px", borderRadius: 999, boxShadow: "0 10px 24px rgba(0,0,0,0.3)" }}>
          ⚠ 銀行に置いてるだけだと…
        </div>
      </Pop>
      {/* 今 100万円 */}
      <Pop show={s2f(0.96)} hide={HOOK_END} style={{ left: 60, top: 196 }}>
        <div style={{ width: 300, background: P.card, borderRadius: 24, boxShadow: "0 12px 26px rgba(60,45,10,0.22)", padding: "16px 0 14px", textAlign: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: P.sub }}>今</div>
          <div style={{ fontSize: 66, fontWeight: 900, color: P.ink, lineHeight: 1.05 }}>100<span style={{ fontSize: 40 }}>万円</span></div>
        </div>
      </Pop>
      {/* 矢印＋30年後 */}
      <Pop show={s2f(2.46)} hide={HOOK_END} style={{ left: 392, top: 232 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: P.ink }}>30年後</div>
          <div style={{ fontSize: 70, fontWeight: 900, color: P.red, lineHeight: 0.7 }}>→</div>
        </div>
      </Pop>
      {/* 実質 約60万円＋▼40% */}
      <Pop show={s2f(4.40)} hide={HOOK_END} style={{ left: 620, top: 196 }}>
        <div style={{ position: "relative", width: 300, background: "#FDECEA", border: `4px solid ${P.red}`, borderRadius: 24, boxShadow: "0 12px 26px rgba(224,72,59,0.28)", padding: "16px 0 14px", textAlign: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: P.red }}>実質</div>
          <div style={{ fontSize: 60, fontWeight: 900, color: P.red, lineHeight: 1.05 }}>
            約<NumCount from={100} to={60} at={s2f(4.4)} dur={16} />万
          </div>
          <div style={{ position: "absolute", right: -16, top: -22, fontSize: 30, fontWeight: 900, color: P.white, background: P.red, padding: "6px 16px", borderRadius: 999, transform: "rotate(7deg)", boxShadow: "0 6px 14px rgba(0,0,0,0.25)" }}>▼4割</div>
        </div>
      </Pop>

      {/* ── 問い：なぜ資産運用なのか（5.9〜14s）── */}
      <Pop show={HOOK_END} hide={SEG1_END} style={{ left: 0, right: 0, top: 72, display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 46, fontWeight: 900, color: P.ink, background: P.lime, padding: "14px 36px", borderRadius: 999, boxShadow: "0 10px 24px rgba(60,45,10,0.22)" }}>
          そもそも、なぜ<span style={{ color: P.limeDk }}>資産運用</span>？
        </div>
      </Pop>
      {/* 共感：僕も投資なんて側でした */}
      <Pop show={s2f(11.82)} hide={SEG1_END} style={{ left: 0, right: 0, top: 200, display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: P.white, background: P.ink, padding: "14px 30px", borderRadius: 20, boxShadow: "0 10px 24px rgba(0,0,0,0.3)" }}>
          僕も昔は「投資なんて」側 🙅
        </div>
      </Pop>

      {/* ── 体験：めんどくさい→月1,000円から（14〜20.4s）── */}
      <Pop show={SEG1_END} hide={SEG2_END} style={{ left: 0, right: 0, top: 72, display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 42, fontWeight: 900, color: P.ink, background: P.mark, padding: "13px 32px", borderRadius: 999, boxShadow: "0 10px 24px rgba(60,45,10,0.2)" }}>
          最初はみんな、めんどくさい 😮‍💨
        </div>
      </Pop>
      {/* 月1,000円スタート・ステップチップ */}
      <Pop show={s2f(19.1)} hide={SEG2_END} style={{ left: 0, right: 0, top: 196, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 460, background: P.card, borderRadius: 24, boxShadow: "0 12px 26px rgba(60,45,10,0.22)", padding: "18px 0 16px", textAlign: "center", border: `4px solid ${P.green}` }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: P.sub }}>まずは小さく</div>
          <div style={{ fontSize: 60, fontWeight: 900, color: P.green, lineHeight: 1.1 }}>月1,000円<span style={{ fontSize: 36, color: P.ink }}>から</span></div>
        </div>
      </Pop>

      {/* ── 締め：お金の置き場所を見直そう（20.4s〜）── */}
      <Pop show={SEG2_END} hide={TALKT_FRAMES} style={{ left: 0, right: 0, top: 78, display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 46, fontWeight: 900, color: P.ink, background: P.lime, padding: "16px 36px", borderRadius: 999, boxShadow: "0 10px 24px rgba(60,45,10,0.24)" }}>
          💡 お金の<span style={{ color: P.limeDk }}>置き場所</span>、見直そう
        </div>
      </Pop>
      <Pop show={s2f(24.9)} hide={TALKT_FRAMES} style={{ left: 0, right: 0, top: 206, display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: P.white, background: P.orange, padding: "14px 32px", borderRadius: 999, boxShadow: "0 10px 24px rgba(0,0,0,0.25)" }}>🔖 保存して見返そう</div>
      </Pop>
    </>
  );
};

// ── 節目の白フラッシュ転換 ──
const flashes = [HOOK_END, SEG1_END, SEG2_END];
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  let o = 0;
  for (const p of flashes) o = Math.max(o, interpolate(f, [p - 4, p, p + 6], [0, 0.42, 0], clamp));
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

// ── 寄りズーム（常時＋キーワードでプッシュイン）──
const punches = [s2f(2.46), HOOK_END, s2f(19.1), SEG2_END];
const useZoom = () => {
  const f = useCurrentFrame();
  const base = interpolate(f, [0, TALKT_FRAMES], [1.04, 1.12], clamp);
  let bump = 0;
  for (const p of punches) bump += 0.028 * Math.max(0, 1 - Math.abs(f - (p + 6)) / 12);
  return base + bump;
};

export const TalkReelTaichi: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const z = useZoom();
  return (
    <AbsoluteFill style={{ backgroundColor: P.paper }}>
      {/* 実写（SDR変換済み）：軽い色補正＋寄りズーム */}
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 42%" }}>
        <OffthreadVideo src={staticFile("talk_video.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.08) saturate(1.12) brightness(0.99)" }} />
      </AbsoluteFill>
      {/* 下スクリム（テロップの可読性） */}
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 54%, rgba(0,0,0,0.40) 100%)", pointerEvents: "none" }} />
      <Panels />
      <Telop />
      <Flash />
      {audio ? <Audio src={staticFile("talk_narration.wav")} /> : null}
      <SfxTrack cues={[
        { file: "user/u05", at: 0, volume: 0.38 },               // 衝撃（指止め）
        { file: "user/u04", at: s2f(2.46), volume: 0.4 },        // 4割減 キメ
        { file: "user/u03", at: s2f(5.86), volume: 0.4 },        // 問いへ転換
        { file: "user/u06", at: s2f(11.82), volume: 0.34 },      // 共感ポン
        { file: "user/u03", at: s2f(14.0), volume: 0.36 },       // 体験へ転換
        { file: "user/u06", at: s2f(19.1), volume: 0.4 },        // 月1,000円 着地
        { file: "user/u07", at: s2f(20.42), volume: 0.42 },      // でも今は（大転換）
        { file: "user/u10", at: s2f(23.46), volume: 0.4 },       // 置き場所 帯
        { file: "finish", at: s2f(25.4), volume: 0.4 },          // 締め余韻
      ]} />
    </AbsoluteFill>
  );
};
