import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../components/Layout";
import { FadeUp, Pop } from "../components/Anim";
import { CoinIcon } from "../components/icons";
import { COLORS } from "../theme";

// ── 冒頭のつかみ ──
// 実写クリップ（手・お札・スーパー等）を使いたい場合は、素材を public/intro.mp4 に置き、
// 下の OffthreadVideo のコメントを外す。ここでは全編イラストで完結させている。
export const Intro: React.FC = () => {
  return (
    <Background>
      {/*
      import { OffthreadVideo, staticFile } from "remotion";
      <OffthreadVideo src={staticFile("intro.mp4")} muted style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
      */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 60,
          padding: 80,
        }}
      >
        <FadeUp delay={4}>
          <div style={{ fontSize: 66, fontWeight: 700, textAlign: "center" }}>
            お金が貯まらないのは
          </div>
        </FadeUp>

        <Pop delay={18}>
          <CoinIcon size={260} />
        </Pop>

        <FadeUp delay={34}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            たった<span style={{ color: COLORS.accent }}>4つの「罠」</span>
            <br />
            が原因だった
          </div>
        </FadeUp>
      </AbsoluteFill>
    </Background>
  );
};
