import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Background } from "../components/Layout";
import { FadeUp, Pop } from "../components/Anim";
import { CartIcon } from "../components/icons";
import { COLORS } from "../theme";

const TRAPS = [
  "① なんとなく欲しい",
  "② 安いから",
  "③ ついでに",
  "④ ストレス発散",
];

// ── まとめ ＋ CTA ──
// アスペクト比に応じてレイアウトを変える（縦=1列 / 正方形・横=2列グリッド）。
export const Outro: React.FC = () => {
  const { width, height } = useVideoConfig();
  const landscape = width >= height; // 1:1 や 16:9

  return (
    <Background>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: landscape ? 34 : 50,
          padding: 70,
        }}
      >
        <Pop delay={2}>
          <CartIcon size={landscape ? 220 : 300} />
        </Pop>

        <FadeUp delay={16}>
          <div style={{ fontSize: 58, fontWeight: 700, textAlign: "center" }}>
            買う前に<span style={{ color: COLORS.accent }}>ひと呼吸</span>
          </div>
        </FadeUp>

        <div
          style={{
            display: "flex",
            flexDirection: landscape ? "row" : "column",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
            maxWidth: landscape ? 980 : "unset",
          }}
        >
          {TRAPS.map((t, i) => (
            <FadeUp key={t} delay={26 + i * 6}>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  backgroundColor: COLORS.white,
                  border: `3px solid ${COLORS.ink}`,
                  borderRadius: 12,
                  padding: "14px 30px",
                  width: landscape ? 440 : 520,
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                {t}
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={56}>
          <div
            style={{
              backgroundColor: COLORS.accent,
              color: COLORS.white,
              fontSize: 44,
              fontWeight: 700,
              padding: "20px 50px",
              borderRadius: 60,
            }}
          >
            保存して見返してね
          </div>
        </FadeUp>
      </AbsoluteFill>
    </Background>
  );
};
