import React from "react";
import { AbsoluteFill } from "remotion";
import { Background, Badge, SectionHeader, CaptionBar } from "./Layout";
import { ZONE } from "../theme";

// ── 全ページ共通の固定ゾーン・レイアウト ──
// 上=バッジ＋見出し / 中央=イラスト主役 / その下=キャプション / 最下部は文字なし。
export const Slide: React.FC<{
  badge?: string;
  title: string;
  caption?: string;
  children: React.ReactNode; // 主役イラスト（アイコン＋吹き出し等）
}> = ({ badge, title, caption, children }) => {
  return (
    <Background>
      <AbsoluteFill>
        {/* 上ゾーン */}
        <div
          style={{
            position: "absolute",
            top: ZONE.headerTop,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 30,
          }}
        >
          {badge ? <Badge label={badge} delay={8} /> : null}
          <SectionHeader title={title} delay={26} />
        </div>

        {/* 主役ゾーン（中央） */}
        <div
          style={{
            position: "absolute",
            top: ZONE.stageTop,
            left: 0,
            width: "100%",
            height: ZONE.stageBottom - ZONE.stageTop,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 44,
          }}
        >
          {children}
        </div>

        {/* キャプション（イラスト直下・中〜やや下） */}
        {caption ? (
          <div
            style={{
              position: "absolute",
              top: ZONE.captionCenter,
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CaptionBar text={caption} delay={108} />
          </div>
        ) : null}
        {/* 最下部(safeBottom〜1920)は文字なし＝余白 */}
      </AbsoluteFill>
    </Background>
  );
};
