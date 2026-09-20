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
      <AbsoluteFill style={{ padding: "120px 60px", alignItems: "center" }}>
        <Badge label={badge} delay={2} />
        <div style={{ height: 34 }} />
        <SectionHeader title={title} delay={10} />

        {/* イラストエリア */}
        <div
          style={{
            flex: 1,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {illustration}
        </div>

        <CaptionBar text={caption} delay={40} />
      </AbsoluteFill>
    </Background>
  );
};
