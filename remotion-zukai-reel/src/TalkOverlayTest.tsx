import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";

// ═══════════════════════════════════════════════════════════════════
// トークリール・オーバーレイ編集 テスト（実写 talktest.mp4 の上に重ねる）
//   ・語同期カラオケ字幕（whisperのタイムスタンプ／表記は正しい台本で）
//   ・要点カード（資産は？／NISA口座は引き継げない✕／注意点）＋効果音
//   目的＝「この映像・編集・アニメのクオリティ出せるか」の検証。
// ═══════════════════════════════════════════════════════════════════

export const TALKOV_FRAMES = 560; // 18.6s @30fps

const C = {
  ink: "#20242B",
  accent: "#2FA36B",   // NISAグリーン
  red: "#E23B2E",
  gold: "#E6B422",
  plate: "rgba(18,22,28,0.58)",
};
const s2f = (s: number) => Math.round(s * 30);

// ───────── カラオケ字幕（白ベース＋アクセントが左から流れる） ─────────
const Caption: React.FC<{ text: string; from: number; to: number; accent?: string }> = ({ text, from, to, accent = C.accent }) => {
  const f = useCurrentFrame();
  if (f < from - 7 || f > to + 20) return null;
  const inOp = interpolate(f, [from - 7, from], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outOp = interpolate(f, [to + 10, to + 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const op = Math.min(inOp, outOp);
  const prog = interpolate(f, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = interpolate(inOp, [0, 1], [18, 0]);
  const pad = "14px 28px";
  const base: React.CSSProperties = { margin: 0, padding: pad, fontFamily: FONT, fontWeight: 800, fontSize: 56, lineHeight: 1.25, whiteSpace: "nowrap", letterSpacing: 0.5 };
  return (
    <div style={{ position: "absolute", bottom: 430, left: 0, width: 1080, textAlign: "center", opacity: op, transform: `translateY(${rise}px)` }}>
      <div style={{ position: "relative", display: "inline-block", background: C.plate, borderRadius: 18, backdropFilter: "blur(2px)" }}>
        <span style={{ ...base, color: "#FFFFFF", display: "block", textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}>{text}</span>
        <span style={{ ...base, color: accent, position: "absolute", left: 0, top: 0, display: "block", clipPath: `inset(0 ${100 - prog * 100}% 0 0)`, textShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>{text}</span>
      </div>
    </div>
  );
};

// ───────── ポップ（スプリング＋常時ふわっと） ─────────
const Pop: React.FC<{ at: number; until?: number; children: React.ReactNode; style?: React.CSSProperties; float?: number }> = ({ at, until, children, style, float = 6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at - 2 || (until && frame > until + 12)) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12, mass: 0.7 } });
  const outOp = until ? interpolate(frame, [until, until + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const fl = Math.sin((frame - at) / 16) * float;
  return (
    <div style={{ position: "absolute", opacity: Math.min(s, outOp), transform: `translateY(${fl}px) scale(${interpolate(s, [0, 1], [0.6, 1])})`, ...style }}>
      {children}
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF", borderRadius: 22, padding: "20px 28px", boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
  fontFamily: FONT, fontWeight: 800, color: C.ink, display: "flex", alignItems: "center", gap: 16,
};

export const TalkOverlayTest: React.FC = () => {
  const frame = useCurrentFrame();

  // コーナーブラケット（撮影/編集中の雰囲気・冒頭だけ）
  const brOp = interpolate(frame, [4, 16, 70, 86], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // P4 パンチの軽い振動
  const pf = s2f(12.45);
  const shake = frame > pf && frame < pf + 10 ? Math.sin(frame * 2.2) * 6 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: FONT }}>
      {/* 実写（縦1080×1920・そのまま） */}
      <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
        <OffthreadVideo src={staticFile("talktest.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      {/* トップのトピックピル（常時） */}
      <Pop at={8} style={{ top: 150, left: 60 }} float={0}>
        <div style={{ ...cardStyle, padding: "12px 22px", borderRadius: 999, gap: 10 }}>
          <span style={{ width: 16, height: 16, borderRadius: 4, background: C.accent, display: "inline-block" }} />
          <span style={{ fontSize: 34 }}>新NISA × 相続</span>
        </div>
      </Pop>

      {/* コーナーブラケット */}
      <AbsoluteFill style={{ opacity: brOp }}>
        {[[60, 120], [60, null], [null, 120], [null, null]].map((p, i) => (
          <div key={i} style={{ position: "absolute", width: 70, height: 70,
            left: i % 2 === 0 ? 48 : undefined, right: i % 2 === 1 ? 48 : undefined,
            top: i < 2 ? 300 : undefined, bottom: i >= 2 ? 560 : undefined,
            borderTop: i < 2 ? "6px solid #fff" : undefined, borderBottom: i >= 2 ? "6px solid #fff" : undefined,
            borderLeft: i % 2 === 0 ? "6px solid #fff" : undefined, borderRight: i % 2 === 1 ? "6px solid #fff" : undefined,
            borderRadius: 6 }} />
        ))}
        <div style={{ position: "absolute", top: 230, left: 52, fontFamily: FONT, fontWeight: 800, color: "#fff", fontSize: 28 }}>● REC</div>
      </AbsoluteFill>

      {/* P2 問いかけカード「資産はどうなる？」 */}
      <Pop at={s2f(3.6)} until={s2f(8.6)} style={{ top: 330, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
        <div style={{ ...cardStyle, flexDirection: "column", alignItems: "center", gap: 6, padding: "22px 40px" }}>
          <div style={{ fontSize: 40 }}>遺された家族のNISA資産は…</div>
          <div style={{ fontSize: 86, color: C.accent }}>どうなる？</div>
        </div>
      </Pop>

      {/* P4 パンチ：NISA口座は引き継げない ✕ */}
      <Pop at={pf} until={s2f(14.6)} style={{ top: 300, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
        <div style={{ ...cardStyle, flexDirection: "column", alignItems: "center", gap: 14, padding: "26px 44px", border: `4px solid ${C.red}` }}>
          <div style={{ fontSize: 40, color: C.ink }}>相続人のNISA口座へ</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontSize: 60, color: C.red }}>✕</span>
            <span style={{ fontSize: 60, color: C.red }}>引き継げない</span>
          </div>
        </div>
      </Pop>

      {/* P5 注意点チップ */}
      <Pop at={s2f(14.9)} until={s2f(17.0)} style={{ top: 360, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
        <div style={{ ...cardStyle, borderRadius: 999, padding: "16px 34px", gap: 12 }}>
          <span style={{ fontSize: 40 }}>⚠</span>
          <span style={{ fontSize: 44, color: C.gold }}>注意点を解説</span>
        </div>
      </Pop>

      {/* 語同期カラオケ字幕（正しい表記） */}
      <Caption text="もし、配偶者が亡くなったら" from={s2f(1.39)} to={s2f(2.99)} />
      <Caption text="新NISAの資産は、どうなる？" from={s2f(3.41)} to={s2f(5.41)} />
      <Caption text="実は、相続人が" from={s2f(9.39)} to={s2f(10.79)} />
      <Caption text="NISA口座を、引き継げない" from={s2f(12.45)} to={s2f(14.43)} accent={C.red} />
      <Caption text="注意点もあるから、解説します" from={s2f(14.85)} to={s2f(16.55)} />

      {/* 効果音（控えめ・声は映像から） */}
      <SfxTrack gain={1} cues={[
        { file: "user/u05", at: s2f(1.3), volume: 0.26 },
        { file: "user/u03", at: s2f(3.5), volume: 0.26 },   // 問いかけカード
        { file: "user/u07", at: s2f(12.3), volume: 0.34 },  // パンチ前の転換
        { file: "user/u04", at: s2f(12.5), volume: 0.34 },  // ✕ キメ
        { file: "user/u10", at: s2f(14.9), volume: 0.28 },  // 注意点
      ]} />
    </AbsoluteFill>
  );
};
