import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Background } from "./Layout";
import { FONT } from "./font";
import { COLORS } from "../theme";
import { In } from "./diagram";

const GRAY = "#6C7A93";
const GREEN = "#12A150";
const GOLD = "#F6C544";

export type ChartData = {
  header: { title: string; sub?: string };
  // 左＝結果(高い棒／土台+差分)、右＝比較対象(低い棒)
  result: { base: number; delta: number; baseColor?: string; deltaColor?: string; topLabel: string; caption: string };
  compare: { value: number; color?: string; topLabel: string; caption: string };
  deltaCallout?: string; // 例: ＋約260万円
  pill?: React.ReactNode;
  footer?: React.ReactNode;
  offset?: number;
  speed?: number;
  fs?: { header?: number; pill?: number; foot?: number };
};

// 数値の伸びを見せる棒グラフページ（左：結果=土台+差分、右：比較対象）
export const ChartPage: React.FC<{ data: ChartData }> = ({ data }) => {
  const f = useCurrentFrame();
  const O = data.offset ?? 60;
  const F = data.fs ?? {};
  const k = data.speed ?? 1;
  const fk = f / k;
  const D = (nn: number) => Math.round(nn * k);

  const { base, delta } = data.result;
  const total = base + delta;
  const max = Math.max(total, data.compare.value);
  const H = 470; // 最大棒の高さ(px)
  const BASELINE = 1010; // 棒の下端
  const unit = H / max;

  // 伸びアニメ（下から）
  const g1 = interpolate(fk, [30, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); // 左・土台
  const g1d = interpolate(fk, [82, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); // 左・差分
  const g2 = interpolate(fk, [46, 94], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); // 右
  const dash = interpolate(fk, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const BAR_W = 236;
  const CXL = 336; // 左棒 中心
  const CXR = 744; // 右棒 中心
  const baseH = base * unit;
  const deltaH = delta * unit;
  const cmpH = data.compare.value * unit;

  const baseColor = data.result.baseColor ?? GREEN;
  const deltaColor = data.result.deltaColor ?? GOLD;
  const cmpColor = data.compare.color ?? GRAY;

  const bar = (cx: number, top: number, h: number, color: string, radiusTop: boolean): React.CSSProperties => ({
    position: "absolute",
    left: cx - BAR_W / 2,
    top,
    width: BAR_W,
    height: Math.max(0, h),
    backgroundColor: color,
    border: `4px solid ${COLORS.ink}`,
    borderBottom: "none",
    borderTopLeftRadius: radiusTop ? 12 : 0,
    borderTopRightRadius: radiusTop ? 12 : 0,
    boxSizing: "border-box",
  });

  const cmpTop = BASELINE - cmpH * g2;
  const leftBaseTop = BASELINE - baseH * g1;
  const leftDeltaH = deltaH * g1d;
  const leftDeltaTop = BASELINE - baseH - leftDeltaH;
  const compareLevelY = BASELINE - baseH; // 土台(=比較値と同額)の天面ライン

  return (
    <Background>
      <AbsoluteFill style={{ fontFamily: FONT, transform: `translateY(${O}px)` }}>
        {/* 見出し */}
        <In delay={D(4)} speed={k} style={{ left: 0, top: 170, width: 1080, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ border: `5px solid ${COLORS.ink}`, borderRadius: 18, backgroundColor: "#fff", padding: "22px 34px", display: "inline-flex", alignItems: "center", gap: 18, maxWidth: 1000, boxSizing: "border-box" }}>
            <div style={{ width: 11, height: 56, backgroundColor: COLORS.accent, borderRadius: 4, flexShrink: 0 }} />
            <div style={{ fontSize: F.header ?? 64, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2, whiteSpace: "nowrap" }}>{data.header.title}</div>
          </div>
          {data.header.sub ? <div style={{ textAlign: "center", fontSize: 36, fontWeight: 700, color: GRAY, marginTop: 12 }}>{data.header.sub}</div> : null}
        </In>

        {/* 基準線（床） */}
        <svg width="1080" height="1920" style={{ position: "absolute" }}>
          <line x1="150" y1={BASELINE} x2="930" y2={BASELINE} stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round" />
          {/* 比較レベルの点線（右の高さ＝左の土台の高さを結ぶ） */}
          {dash > 0.01 && (
            <line
              x1={CXL}
              y1={compareLevelY}
              x2={CXR + BAR_W / 2}
              y2={compareLevelY}
              stroke={COLORS.accent}
              strokeWidth="5"
              strokeDasharray="14 12"
              strokeDashoffset={(1 - dash) * 300}
              opacity={0.9}
            />
          )}
        </svg>

        {/* 左：土台 */}
        <div style={bar(CXL, leftBaseTop, baseH * g1, baseColor, false)} />
        {/* 左：差分（結果の増加分） */}
        <div style={bar(CXL, leftDeltaTop, leftDeltaH, deltaColor, true)} />
        {/* 右：比較対象 */}
        <div style={bar(CXR, cmpTop, cmpH * g2, cmpColor, true)} />

        {/* 差分ラベル（左棒の差分の横） */}
        {data.deltaCallout && g1d > 0.6 && (
          <In delay={D(120)} speed={k} style={{ left: CXL + BAR_W / 2 + 8, top: leftDeltaTop - 8, width: 300 }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: COLORS.accent, whiteSpace: "nowrap" }}>{data.deltaCallout}</div>
          </In>
        )}

        {/* 棒の上の値ラベル */}
        {g1 > 0.9 && (
          <In delay={D(78)} speed={k} style={{ left: CXL - 160, top: BASELINE - total * unit - 74, width: 320, textAlign: "center" }}>
            <div style={{ fontSize: 60, fontWeight: 700, color: COLORS.ink, whiteSpace: "nowrap" }}>{data.result.topLabel}</div>
          </In>
        )}
        {g2 > 0.9 && (
          <In delay={D(94)} speed={k} style={{ left: CXR - 160, top: cmpTop - 74, width: 320, textAlign: "center" }}>
            <div style={{ fontSize: 60, fontWeight: 700, color: cmpColor, whiteSpace: "nowrap" }}>{data.compare.topLabel}</div>
          </In>
        )}

        {/* 棒の下のキャプション */}
        <In delay={D(60)} speed={k} style={{ left: CXL - 200, top: BASELINE + 18, width: 400, textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: COLORS.ink, whiteSpace: "nowrap" }}>{data.result.caption}</div>
        </In>
        <In delay={D(70)} speed={k} style={{ left: CXR - 200, top: BASELINE + 18, width: 400, textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: GRAY, whiteSpace: "nowrap" }}>{data.compare.caption}</div>
        </In>

        {/* pill */}
        {data.pill && (
          <In delay={D(170)} speed={k} pop style={{ left: 130, top: 1160, width: 820 }}>
            <div style={{ backgroundColor: COLORS.ink, color: "#fff", borderRadius: 20, padding: "26px 0", textAlign: "center", fontSize: F.pill ?? 58, fontWeight: 700, lineHeight: 1.25 }}>{data.pill}</div>
          </In>
        )}
        {/* footer */}
        {data.footer && (
          <In delay={D(206)} speed={k} style={{ left: 40, top: 1360, width: 1000, textAlign: "center" }}>
            <div style={{ fontSize: F.foot ?? 54, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>{data.footer}</div>
          </In>
        )}
      </AbsoluteFill>
    </Background>
  );
};
