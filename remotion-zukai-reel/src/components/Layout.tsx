import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../theme";
import { FONT } from "./font";
import { FadeUp, Pop } from "./Anim";

// 背景（全シーン共通）
export const Background: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily: FONT,
        color: COLORS.ink,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 赤い丸バッジ（「罠①」など）
export const Badge: React.FC<{ label: string; delay?: number }> = ({
  label,
  delay = 0,
}) => {
  return (
    <FadeUp delay={delay} style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          backgroundColor: COLORS.accent,
          color: COLORS.white,
          fontWeight: 700,
          fontSize: 44,
          padding: "10px 42px",
          borderRadius: 60,
          letterSpacing: 2,
        }}
      >
        {label}
      </div>
    </FadeUp>
  );
};

// 見出し（赤い縦線 ＋ ネイビーの枠囲み）＝元動画の型
export const SectionHeader: React.FC<{ title: string; delay?: number }> = ({
  title,
  delay = 0,
}) => {
  return (
    <FadeUp delay={delay} style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          border: `4px solid ${COLORS.ink}`,
          borderRadius: 18,
          padding: "24px 40px",
          backgroundColor: COLORS.white,
          maxWidth: 900,
        }}
      >
        <div
          style={{
            width: 10,
            height: 56,
            backgroundColor: COLORS.accent,
            borderRadius: 4,
            flexShrink: 0,
          }}
        />
        <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.25 }}>
          {title}
        </div>
      </div>
    </FadeUp>
  );
};

// 吹き出し（「なんとなく」など）
export const Bubble: React.FC<{
  text: string;
  delay?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, color = COLORS.ink, style }) => {
  return (
    <Pop delay={delay} style={style}>
      <div
        style={{
          position: "relative",
          border: `4px solid ${color}`,
          color,
          backgroundColor: COLORS.white,
          borderRadius: 40,
          padding: "18px 34px",
          fontSize: 40,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </Pop>
  );
};

// キャプション帯（グレーの下線コメント）
export const CaptionBar: React.FC<{ text: string; delay?: number }> = ({
  text,
  delay = 0,
}) => {
  return (
    <FadeUp delay={delay} style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          backgroundColor: "#6C7A93",
          color: COLORS.white,
          fontSize: 46,
          fontWeight: 700,
          padding: "24px 44px",
          borderRadius: 16,
          textAlign: "center",
          maxWidth: 940,
          lineHeight: 1.35,
        }}
      >
        {text}
      </div>
    </FadeUp>
  );
};

// 効果音的な赤い文字（「ポチッ」など）
export const AccentWord: React.FC<{
  text: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, style }) => {
  return (
    <Pop delay={delay} style={style}>
      <div
        style={{
          color: COLORS.accent,
          fontSize: 46,
          fontWeight: 700,
          transform: "rotate(-8deg)",
        }}
      >
        {text}
      </div>
    </Pop>
  );
};
