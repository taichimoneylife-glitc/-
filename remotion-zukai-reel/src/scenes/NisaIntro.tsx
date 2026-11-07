import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../components/Layout";
import { FadeUp, Pop } from "../components/Anim";
import { CoinIcon } from "../components/icons";
import { COLORS } from "../theme";

export const NisaIntro: React.FC = () => {
  return (
    <Background>
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 56, padding: 80 }}
      >
        <FadeUp delay={4}>
          <div style={{ fontSize: 66, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
            新NISA、
            <br />
            結局なにがスゴい？
          </div>
        </FadeUp>

        <Pop delay={20}>
          <CoinIcon size={240} />
        </Pop>

        <FadeUp delay={36}>
          <div style={{ fontSize: 60, fontWeight: 700, textAlign: "center" }}>
            <span style={{ color: COLORS.accent }}>4つのポイント</span>で解説
          </div>
        </FadeUp>
      </AbsoluteFill>
    </Background>
  );
};
