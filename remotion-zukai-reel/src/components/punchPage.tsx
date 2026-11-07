import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from "remotion";
import { Background } from "./Layout";
import { FONT } from "./font";
import { COLORS } from "../theme";

// ブランドマスコット（提供キャラ）。pose= point_r/point_l/surprise/shock/neutral
export type CharPose = "point_r" | "point_l" | "surprise" | "shock" | "neutral";
export const Character: React.FC<{ pose: CharPose; size?: number; flip?: boolean; delay?: number; speed?: number; style?: React.CSSProperties }> = ({ pose, size = 440, flip, delay = 10, speed = 1, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 13, mass: 0.8, stiffness: 140 }, durationInFrames: Math.round(26 * speed) });
  const y = (1 - s) * 40;
  return (
    <div style={{ position: "absolute", opacity: Math.min(1, s * 1.6), transform: `translateY(${y}px) scale(${0.9 + 0.1 * s})`, ...style }}>
      <Img src={staticFile(`char/${pose}.png`)} style={{ height: size, width: "auto", transform: flip ? "scaleX(-1)" : undefined, filter: "drop-shadow(0 10px 18px rgba(60,45,25,0.18))" }} />
    </div>
  );
};

// 温かいボケ背景（参考リールの“ぼかした室内”の質感を手続きで再現）
export const SoftBg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "linear-gradient(160deg,#FBF6EE 0%,#F3EADD 45%,#EFE4D6 100%)", fontFamily: FONT, overflow: "hidden" }}>
    {/* ボケ光 */}
    <div style={{ position: "absolute", top: -120, left: -80, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,#FFF6E2,rgba(255,246,226,0))", filter: "blur(20px)" }} />
    <div style={{ position: "absolute", top: 380, right: -140, width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle,#F7E7CE,rgba(247,231,206,0))", filter: "blur(24px)" }} />
    <div style={{ position: "absolute", bottom: -160, left: 120, width: 620, height: 620, borderRadius: "50%", background: "radial-gradient(circle,#EADFCB,rgba(234,223,203,0))", filter: "blur(28px)" }} />
    {children}
  </AbsoluteFill>
);

// 手書き風の赤丸ハイライト（数字・キーワードを囲む）。startFrameから描かれる
export const RedCircle: React.FC<{ w?: number; h?: number; startFrame?: number; color?: string; sw?: number }> = ({ w = 320, h = 150, startFrame = 0, color = COLORS.accent, sw = 8 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [startFrame, startFrame + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx = w / 2, cy = h / 2, rx = w / 2 - sw, ry = h / 2 - sw;
  // わずかに歪ませて手書き感
  const d = `M ${cx + rx} ${cy - 4}
    C ${cx + rx} ${cy - ry} ${cx + rx * 0.2} ${cy - ry} ${cx - 6} ${cy - ry}
    C ${cx - rx} ${cy - ry} ${cx - rx} ${cy + ry * 0.2} ${cx - rx} ${cy + 6}
    C ${cx - rx} ${cy + ry} ${cx - rx * 0.2} ${cy + ry} ${cx + 10} ${cy + ry}
    C ${cx + rx} ${cy + ry} ${cx + rx} ${cy - ry * 0.2} ${cx + rx} ${cy - 18}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "rotate(-2deg)", overflow: "visible", pointerEvents: "none" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

// 中身を赤丸で囲むラッパー
export const Circled: React.FC<{ children: React.ReactNode; startFrame?: number; padX?: number; padY?: number }> = ({ children, startFrame = 30, padX = 40, padY = 20 }) => (
  <span style={{ position: "relative", display: "inline-flex", padding: `${padY}px ${padX}px` }}>
    <span style={{ position: "absolute", inset: 0 }}>
      <RedCircle startFrame={startFrame} sw={9} />
    </span>
    {children}
  </span>
);

// 流し込み（in-flow）で弾いて出る要素。テンプレの固定スロットではなく、
// 中央スタックに“パンパン”と積み上げるためのリビール。
export const Rise: React.FC<{ delay: number; speed?: number; pop?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay, speed = 1, pop = true, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: pop ? { damping: 12, mass: 0.7, stiffness: 150 } : { damping: 200 }, durationInFrames: Math.round((pop ? 26 : 22) * speed) });
  const y = (1 - s) * (pop ? 30 : 22);
  return (
    <div style={{ opacity: Math.min(1, s * 1.7), transform: pop ? `translateY(${y}px) scale(${0.86 + 0.14 * s})` : `translateY(${y}px)`, transformOrigin: "center", ...style }}>
      {children}
    </div>
  );
};

export type PunchBeat = { node: React.ReactNode; d: number };
export type PunchData = {
  bg?: string;
  soft?: boolean; // 温かいボケ背景
  card?: boolean; // すりガラスの白カードで囲む
  offset?: number; // 縦位置微調整
  speed?: number;
  gap?: number;
  items: PunchBeat[];
  char?: { pose: CharPose; side?: "left" | "right"; size?: number; flip?: boolean; d?: number; dx?: number; dy?: number }; // マスコット
};

// 全画面・中央スタックのパンチ型ページ（キーワードを大きく、パンパンと出す）
export const PunchPage: React.FC<{ data: PunchData }> = ({ data }) => {
  const k = data.speed ?? 1;
  const gap = data.gap ?? 34;
  const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    data.soft ? <SoftBg>{children}</SoftBg> : <Background bg={data.bg}>{children}</Background>;

  const stack = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap,
        textAlign: "center",
        width: "100%",
      }}
    >
      {data.items.map((it, i) => (
        <Rise key={i} delay={Math.round(it.d * k)} speed={k} style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          {it.node}
        </Rise>
      ))}
    </div>
  );

  return (
    <Wrap>
      <AbsoluteFill
        style={{
          fontFamily: FONT,
          // IG安全ゾーンを避ける：上バー/下キャプション/アクションレール
          padding: `${200 + (data.offset ?? 0)}px 48px 380px`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {data.card ? (
          <div
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.9)",
              borderRadius: 48,
              padding: "70px 48px",
              boxShadow: "0 30px 70px rgba(60,45,25,0.16)",
              boxSizing: "border-box",
            }}
          >
            {stack}
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>{stack}</div>
        )}
      </AbsoluteFill>
      {data.char && (
        <Character
          pose={data.char.pose}
          size={data.char.size ?? 430}
          flip={data.char.flip}
          delay={data.char.d ?? 12}
          speed={k}
          style={{
            bottom: 430 + (data.char.dy ?? 0),
            [data.char.side ?? "right"]: 30 + (data.char.dx ?? 0),
          }}
        />
      )}
    </Wrap>
  );
};

// ── 文字ヘルパー（パンチ型で使う）──
export const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = COLORS.gray }) => (
  <div style={{ fontSize: 46, fontWeight: 700, color, letterSpacing: 2 }}>{children}</div>
);
export const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; lh?: number }> = ({ children, size = 88, color = COLORS.ink, lh = 1.14 }) => (
  <div style={{ fontSize: size, fontWeight: 700, color, lineHeight: lh }}>{children}</div>
);
export const Em: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = COLORS.accent, size }) => (
  <span style={{ color, fontSize: size }}>{children}</span>
);
export const Chip: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number }> = ({ children, bg = COLORS.ink, color = "#fff", size = 50 }) => (
  <div style={{ backgroundColor: bg, color, borderRadius: 18, padding: "20px 34px", fontSize: size, fontWeight: 700, lineHeight: 1.25, display: "inline-block" }}>{children}</div>
);
// 黄色マーカー下線（キーワード強調）
export const Mark: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "#FCE15F" }) => (
  <span style={{ background: `linear-gradient(transparent 58%, ${color} 58%)`, padding: "0 2px" }}>{children}</span>
);
