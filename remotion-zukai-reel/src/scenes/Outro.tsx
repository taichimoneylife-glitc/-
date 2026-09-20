import React from "react";
import { AbsoluteFill } from "remotion";
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
export const Outro: React.FC = () => {
  return (
    <Background>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 50,
          padding: 80,
        }}
      >
        <Pop delay={2}>
          <CartIcon size={300} />
        </Pop>

        <FadeUp delay={16}>
          <div style={{ fontSize: 60, fontWeight: 700, textAlign: "center" }}>
            買う前に<span style={{ color: COLORS.accent }}>ひと呼吸</span>
          </div>
        </FadeUp>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {TRAPS.map((t, i) => (
            <FadeUp key={t} delay={26 + i * 6}>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  backgroundColor: COLORS.white,
                  border: `3px solid ${COLORS.ink}`,
                  borderRadius: 12,
                  padding: "14px 34px",
                  minWidth: 520,
                  textAlign: "center",
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
              fontSize: 46,
              fontWeight: 700,
              padding: "22px 54px",
              borderRadius: 60,
            }}
          >
            保存して見返してね 🔖
          </div>
        </FadeUp>
      </AbsoluteFill>
    </Background>
  );
};
