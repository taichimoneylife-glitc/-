import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../components/Layout";
import { FadeUp, Pop } from "../components/Anim";
import { SafeIcon } from "../components/nisaIcons";
import { COLORS } from "../theme";

const POINTS = [
  "① 非課税は「無期限」",
  "② 年間360万円まで",
  "③ 生涯1,800万円まで",
  "④ 売っても枠が復活",
];

export const NisaOutro: React.FC = () => {
  return (
    <Background>
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 40, padding: 70 }}
      >
        <Pop delay={2}>
          <SafeIcon size={240} />
        </Pop>

        <FadeUp delay={16}>
          <div style={{ fontSize: 54, fontWeight: 700, textAlign: "center" }}>
            まずは<span style={{ color: COLORS.accent }}>証券口座の開設</span>から
          </div>
        </FadeUp>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {POINTS.map((t, i) => (
            <FadeUp key={t} delay={26 + i * 6}>
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  backgroundColor: COLORS.white,
                  border: `3px solid ${COLORS.ink}`,
                  borderRadius: 12,
                  padding: "14px 30px",
                  width: 560,
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                {t}
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={54}>
          <div
            style={{
              backgroundColor: COLORS.accent,
              color: COLORS.white,
              fontSize: 42,
              fontWeight: 700,
              padding: "18px 48px",
              borderRadius: 60,
            }}
          >
            保存＆フォローで復習
          </div>
        </FadeUp>

        <FadeUp delay={62}>
          <div style={{ fontSize: 24, color: "#6C7A93" }}>
            ※本動画は情報提供です。投資判断はご自身の責任で。
          </div>
        </FadeUp>
      </AbsoluteFill>
    </Background>
  );
};
