import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Layout";
import { FadeUp, Pop } from "../components/Anim";
import { FONT } from "../components/font";
import { COLORS, TYPE, ZONE } from "../theme";

export const SAMPLE_FRAMES = 210;

// ── 格上げした「塗り＋線」フラットイラスト（線アイコンから一段アップ）──
const FlatCarScene: React.FC = () => (
  <svg viewBox="0 0 520 340" style={{ width: 620, height: 405, overflow: "visible" }}>
    {/* 影 */}
    <ellipse cx="260" cy="300" rx="210" ry="26" fill="#000" opacity="0.08" />
    {/* コイン（背景の小物） */}
    <g transform="translate(60 60)">
      <circle cx="0" cy="0" r="42" fill="#F6C544" stroke={COLORS.ink} strokeWidth="6" />
      <circle cx="0" cy="0" r="28" fill="none" stroke="#D9A916" strokeWidth="5" />
      <text x="0" y="15" fontSize="42" fill={COLORS.ink} textAnchor="middle" fontWeight="700">¥</text>
    </g>
    {/* 車体 */}
    <path
      d="M40 250 L70 250 L100 160 C112 132 132 120 165 120 L330 120 C360 120 380 130 398 158 L436 232 L470 246 L470 264 C470 276 462 284 450 284 L60 284 C48 284 40 276 40 264 Z"
      fill={COLORS.accent}
      stroke={COLORS.ink}
      strokeWidth="9"
      strokeLinejoin="round"
    />
    {/* 窓 */}
    <path d="M150 150 L232 150 L232 200 L118 200 Z" fill="#EAF2FA" stroke={COLORS.ink} strokeWidth="6" strokeLinejoin="round" />
    <path d="M252 150 L322 150 L360 200 L252 200 Z" fill="#EAF2FA" stroke={COLORS.ink} strokeWidth="6" strokeLinejoin="round" />
    {/* ドアライン */}
    <line x1="242" y1="150" x2="242" y2="270" stroke={COLORS.ink} strokeWidth="5" />
    {/* ヘッドライト */}
    <circle cx="452" cy="240" r="12" fill="#F6C544" stroke={COLORS.ink} strokeWidth="4" />
    {/* タイヤ */}
    <circle cx="150" cy="284" r="46" fill={COLORS.ink} />
    <circle cx="150" cy="284" r="20" fill={COLORS.grayLight} />
    <circle cx="372" cy="284" r="46" fill={COLORS.ink} />
    <circle cx="372" cy="284" r="20" fill={COLORS.grayLight} />
  </svg>
);

// ── 固定ゾーン・レイアウト（下ゾーンには文字を置かない）──
export const SampleSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const badgeS = spring({ frame: frame - 8, fps, config: { damping: 200 }, durationInFrames: 24 });

  return (
    <Background>
      <AbsoluteFill>
        {/* 上ゾーン：バッジ＋見出し */}
        <div style={{ position: "absolute", top: ZONE.headerTop, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <div style={{ opacity: badgeS, transform: `translateY(${(1 - badgeS) * 20}px)` }}>
            <div style={{ backgroundColor: COLORS.accent, color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: TYPE.badge, padding: "10px 44px", borderRadius: 60 }}>
              前提
            </div>
          </div>
          <FadeUp delay={26} style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, border: `4px solid ${COLORS.ink}`, borderRadius: 18, padding: "24px 44px", backgroundColor: "#fff", maxWidth: 940 }}>
              <div style={{ width: 10, height: 60, backgroundColor: COLORS.accent, borderRadius: 4 }} />
              <div style={{ fontFamily: FONT, fontSize: TYPE.h1, fontWeight: 700, color: COLORS.ink }}>500万円の車で考える</div>
            </div>
          </FadeUp>
        </div>

        {/* 主役ゾーン：大きいイラスト（中央） */}
        <div style={{ position: "absolute", top: ZONE.stageTop, left: 0, width: "100%", height: ZONE.stageBottom - ZONE.stageTop, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
          <Pop delay={40}>
            <FlatCarScene />
          </Pop>
          <FadeUp delay={78}>
            <div style={{ fontFamily: FONT, fontSize: TYPE.big, fontWeight: 700, color: COLORS.accent }}>¥500万</div>
          </FadeUp>
        </div>

        {/* キャプション：イラスト直下（中〜やや下。最下部には置かない） */}
        <div style={{ position: "absolute", top: ZONE.captionCenter, width: "100%", display: "flex", justifyContent: "center" }}>
          <FadeUp delay={110} style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ backgroundColor: "#6C7A93", color: "#fff", fontFamily: FONT, fontSize: TYPE.caption, fontWeight: 700, padding: "24px 44px", borderRadius: 16, maxWidth: 940, textAlign: "center" }}>
              一括で払うと、手元の現金は一気にゼロに
            </div>
          </FadeUp>
        </div>
        {/* 下ゾーン(1620〜1920)は文字なし＝余白 */}
      </AbsoluteFill>
    </Background>
  );
};
