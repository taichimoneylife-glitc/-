import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

// 要素を「フェード＋少し下からスライド」で登場させる図解の定番アニメ。
export const FadeUp: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 40, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 28,
  });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * y}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ぽんっと弾んで出る（アイコンや吹き出し向け）。
export const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, mass: 0.8 },
    durationInFrames: 30,
  });
  return (
    <div
      style={{
        opacity: Math.min(1, p * 1.4),
        transform: `scale(${p})`,
        transformOrigin: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
