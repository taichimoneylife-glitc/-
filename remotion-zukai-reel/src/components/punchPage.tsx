import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "./Layout";
import { FONT } from "./font";
import { COLORS } from "../theme";

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
  offset?: number; // 縦位置微調整
  speed?: number;
  gap?: number;
  items: PunchBeat[];
};

// 全画面・中央スタックのパンチ型ページ（キーワードを大きく、パンパンと出す）
export const PunchPage: React.FC<{ data: PunchData }> = ({ data }) => {
  const k = data.speed ?? 1;
  const gap = data.gap ?? 34;
  return (
    <Background bg={data.bg}>
      <AbsoluteFill
        style={{
          fontFamily: FONT,
          // IG安全ゾーンを避ける：上バー/下キャプション/アクションレール
          padding: `${230 + (data.offset ?? 0)}px 70px 470px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap,
          textAlign: "center",
        }}
      >
        {data.items.map((it, i) => (
          <Rise key={i} delay={Math.round(it.d * k)} speed={k} style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            {it.node}
          </Rise>
        ))}
      </AbsoluteFill>
    </Background>
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
