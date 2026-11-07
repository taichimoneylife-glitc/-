import React from "react";
import { AbsoluteFill, Loop, OffthreadVideo, staticFile } from "remotion";
import { FONT } from "../components/font";
import { FadeUp } from "../components/Anim";
import { COLORS } from "../theme";

// ── 実写クリップ＋テロップ のイントロ ──
// public/intro.mp4 を背景に流し、上に白文字を重ねる（元動画の前半と同じ作り）。
// 素材は public/intro.mp4 を差し替えるだけでOK。BGMを足すなら <Audio> を追加。
export const IntroFootage: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT, backgroundColor: COLORS.ink }}>
      {/* 背景：実写クリップ（3秒素材なのでループさせて尺に合わせる） */}
      <Loop durationInFrames={90}>
        <OffthreadVideo
          src={staticFile("intro.mp4")}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Loop>

      {/* 可読性を上げる薄い暗幕 */}
      <AbsoluteFill style={{ backgroundColor: "rgba(20,25,40,0.28)" }} />

      {/* テロップ */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
          padding: 80,
          textAlign: "center",
        }}
      >
        <FadeUp delay={6}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: COLORS.white,
              textShadow: "0 4px 18px rgba(0,0,0,0.55)",
            }}
          >
            お金が貯まらないのは
          </div>
        </FadeUp>

        <FadeUp delay={30}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              color: COLORS.white,
              lineHeight: 1.3,
              textShadow: "0 4px 18px rgba(0,0,0,0.55)",
            }}
          >
            たった
            <span style={{ color: "#FF7A5C" }}>4つの「罠」</span>
            <br />
            が原因だった
          </div>
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
