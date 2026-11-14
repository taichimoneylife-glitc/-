import React from "react";
import { AbsoluteFill } from "remotion";
import { Background, Badge, SectionHeader, CaptionBar } from "../components/Layout";

// ── 「罠①〜④」共通レイアウト ──
// バッジ → 見出し → イラスト → キャプション、の順にアニメで登場する。
// イラスト部分は scene ごとに差し替えたいので render prop で受け取る。
export const TrapScene: React.FC<{
  badge: string; // 例）罠①
  title: string; // 例）「なんとなく欲しい」で買う
  caption: string; // 下部のグレー帯コメント
  illustration: React.ReactNode; // 中央のイラスト（アイコン＋吹き出し）
}> = ({ badge, title, caption, illustration }) => {
  return (
    <Background>
      <AbsoluteFill style={{ padding: "110px 60px 90px", alignItems: "center" }}>
        <Badge label={badge} delay={8} />
        <div style={{ height: 30 }} />
        <SectionHeader title={title} delay={30} />

        {/* イラスト＋キャプションを中央にまとめて配置（キャプションはイラストの真下） */}
        <div
          style={{
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 56,
            position: "relative",
          }}
        >
          <div style={{ position: "relative" }}>{illustration}</div>
          <CaptionBar text={caption} delay={95} />
        </div>
      </AbsoluteFill>
    </Background>
  );
};
