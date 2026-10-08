import React from "react";
import { AbsoluteFill, OffthreadVideo, Audio, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SfxTrack } from "./components/sfx";
import { FONT, FONT_ROUND } from "./components/font";

// 白字＋濃い縁取り（8方向＋ソフトグロウ）＝参考リール級の可読テロップ
const STROKE = (px = 2, c = "rgba(0,0,0,0.55)") => {
  const o: string[] = [];
  for (let a = 0; a < 360; a += 45) o.push(`${Math.round(Math.cos((a * Math.PI) / 180) * px)}px ${Math.round(Math.sin((a * Math.PI) / 180) * px)}px 0 ${c}`);
  o.push("0 4px 16px rgba(0,0,0,0.45)");
  return o.join(", ");
};

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

// ── テロップ（発話どおり・正しい日本語に直す・キーワードはドカッと拡大＋色/黄マーカー・2行以内）──
// big=キーワード（サイズジャンプ）, c=色, mark=黄マーカー
type Run = { t: string; c?: string; big?: boolean; mark?: boolean };
// f = 発話した単語の頭フレーム（talk_transcript.json の word ts ×30fps）
const SEGS: { f: number; runs: Run[] }[] = [
  { f: s2f(0.0),  runs: [{ t: "衝撃", big: true, mark: true }, { t: "でした" }] },
  { f: s2f(0.96), runs: [{ t: "銀行の" }, { t: "100万円", big: true, c: P.mark }] },
  { f: s2f(2.46), runs: [{ t: "30年後" }, { t: "4割", big: true, c: P.mark }, { t: "減る" }] },
  { f: s2f(4.40), runs: [{ t: "価値が" }, { t: "減ってる", big: true, c: P.mark }, { t: "かも" }] },
  { f: s2f(5.86), runs: [{ t: "なぜ" }, { t: "資産運用", big: true, c: P.lime }, { t: "？" }] },
  { f: s2f(8.80), runs: [{ t: "わかりやすく" }, { t: "解説", big: true, c: P.lime }] },
  { f: s2f(9.98), runs: [{ t: "正直、僕も昔は" }] },
  { f: s2f(11.82),runs: [{ t: "「投資なんて」", big: true, c: P.mark }, { t: "側" }] },
  { f: s2f(14.0), runs: [{ t: "証券口座を作るのも" }] },
  { f: s2f(15.5), runs: [{ t: "正直" }, { t: "めんどくさい", big: true, mark: true }] },
  { f: s2f(17.18),runs: [{ t: "積立も最初は" }, { t: "怖くて", big: true, c: P.mark }] },
  { f: s2f(19.1), runs: [{ t: "月" }, { t: "1,000円", big: true, c: P.lime }, { t: "から" }] },
  { f: s2f(20.42),runs: [{ t: "でも今は" }, { t: "やってよかった", big: true, c: P.lime }] },
  { f: s2f(23.46),runs: [{ t: "今一度、" }, { t: "お金の置き場所", big: true, c: P.lime }] },
  { f: s2f(24.9), runs: [{ t: "考えてみて", big: true, c: P.white }] },
];

const Telop: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = 0;
  for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i].f) idx = i;
  const seg = SEGS[idx];
  const end = idx + 1 < SEGS.length ? SEGS[idx + 1].f : TALKT_FRAMES;
  if (f < SEGS[0].f || f >= end) return null;
  const s = spring({ frame: f - seg.f, fps, config: { damping: 13, stiffness: 190, mass: 0.6 }, durationInFrames: 9 });
  const pop = 0.92 + 0.08 * Math.min(1, s * 1.7);
  const BASE = 58, BIG = 90;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1058, textAlign: "center", transform: `scale(${pop})`, transformOrigin: "center bottom", fontFamily: FONT_ROUND, fontWeight: 800 }}>
      <div style={{ lineHeight: 1.18, letterSpacing: 0.5, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "0 2px" }}>
        {seg.runs.map((r, i) =>
          r.mark ? (
            <span key={i} style={{ position: "relative", display: "inline-block", color: P.ink, fontSize: r.big ? BIG : BASE }}>
              <span style={{ position: "absolute", left: -4, right: -4, top: "26%", bottom: "6%", background: P.mark, borderRadius: 10, zIndex: 0, transform: "rotate(-1.5deg)" }} />
              <span style={{ position: "relative", zIndex: 1 }}>{r.t}</span>
            </span>
          ) : (
            <span key={i} style={{ color: r.c || P.white, fontSize: r.big ? BIG : BASE, textShadow: STROKE(r.big ? 3 : 2) }}>{r.t}</span>
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

// ゲームHUD風「価値ゲージ」：100%→60%にじわっと溶ける（参考リールのHPゲージ級）
const HookGauge: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const show = s2f(0.96);
  if (f < show || f >= HOOK_END) return null;
  const inS = spring({ frame: f - show, fps, config: { damping: 13, stiffness: 150, mass: 0.8 }, durationInFrames: 14 });
  const out = interpolate(f, [HOOK_END - 8, HOOK_END], [1, 0], clamp);
  const bob = Math.sin(((f - show) / fps) * 2 * Math.PI * 0.26) * 3;
  // 30年後にかけてゲージが溶ける
  const drainS = s2f(2.46), drainE = s2f(4.3);
  const pct = interpolate(f, [drainS, drainE], [100, 60], clamp);
  const val = Math.round(interpolate(f, [drainS, drainE], [100, 60], clamp));
  const trackW = 520;
  const badgeAt = s2f(4.2);
  const pulse = f >= badgeAt ? 1 + 0.06 * Math.sin(((f - badgeAt) / fps) * 2 * Math.PI * 1.6) : 0.0001;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", fontFamily: FONT_ROUND, fontWeight: 800, opacity: Math.min(1, inS * 1.5) * out, transform: `translateY(${(1 - Math.min(1, inS)) * 16 + bob}px) scale(${Math.min(1, inS)})` }}>
      <div style={{ position: "relative", width: 600, background: "rgba(28,26,22,0.94)", borderRadius: 30, padding: "22px 40px 26px", boxShadow: "0 16px 40px rgba(0,0,0,0.4)", border: "2px solid rgba(154,209,30,0.35)" }}>
        {/* 見出し行 */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 32, color: "#CFC9BC" }}>お金の価値</span>
          <span style={{ fontSize: 34, color: "#CFC9BC" }}>残り<span style={{ fontSize: 56, color: pct > 80 ? P.lime : P.red, margin: "0 4px" }}>{Math.round(pct)}</span>%</span>
        </div>
        {/* ゲージトラック */}
        <div style={{ width: trackW, height: 46, background: "#3A362E", borderRadius: 14, overflow: "hidden", position: "relative", margin: "0 auto" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pct > 80 ? `linear-gradient(90deg, ${P.lime}, #BFE64A)` : `linear-gradient(90deg, ${P.red}, #FF8A5C)`, transition: "none" }} />
          {/* 100%基準の破線 */}
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.25)" }} />
        </div>
        {/* 金額行 */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", marginTop: 14, gap: 8 }}>
          <span style={{ fontSize: 30, color: "#CFC9BC" }}>30年後 実質</span>
          <span style={{ fontSize: 72, color: P.mark, lineHeight: 1 }}>約{val}</span>
          <span style={{ fontSize: 40, color: "#fff" }}>万円</span>
        </div>
        {/* ▼4割 バッジ */}
        {f >= badgeAt && (
          <div style={{ position: "absolute", right: -18, top: -24, fontSize: 36, color: P.white, background: P.red, padding: "8px 20px", borderRadius: 999, transform: `rotate(7deg) scale(${pulse})`, boxShadow: "0 8px 18px rgba(224,72,59,0.5)", border: "2px solid #fff" }}>▼4割</div>
        )}
      </div>
    </div>
  );
};

const Panels: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {/* ── フック：銀行100万→30年で価値が溶ける「価値ゲージ」HUD（0〜5.9s）── */}
      <HookGauge />
      <Pop show={0} hide={HOOK_END} style={{ left: 0, right: 0, top: 58, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT_ROUND, fontWeight: 800, fontSize: 38, color: P.white, background: "rgba(35,32,26,0.92)", padding: "12px 28px", borderRadius: 999, boxShadow: "0 10px 26px rgba(0,0,0,0.35)", border: "2px solid rgba(255,255,255,0.12)" }}>
          💰 銀行に置いてるだけの<span style={{ color: P.mark }}>100万円</span>
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
