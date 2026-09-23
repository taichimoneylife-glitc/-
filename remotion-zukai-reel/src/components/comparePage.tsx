import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "./Layout";
import { FONT } from "./font";
import { COLORS } from "../theme";
import { In, DrawPath, draw } from "./diagram";

const GRAY = "#6C7A93";
const GREEN = "#12A150";
const CXL = 290;
const CXR = 790;
const CENTER = 540;
const CARD_W = 460;
const CARD_TOP = 452;
const CARD_H = 388;

export type CompareSide = { label: string; art: React.ReactNode; badge: "check" | "cross"; accent: string };
export type CompareData = {
  header: { title: string; sub?: string };
  left: CompareSide;
  right: CompareSide;
  statement?: React.ReactNode;
  note?: string;
  footer?: string;
};

const Card: React.FC<{ side: CompareSide }> = ({ side }) => (
  <div style={{ position: "relative", width: CARD_W }}>
    <div style={{ border: `4px solid ${side.accent}`, borderRadius: 20, backgroundColor: "#fff", overflow: "hidden" }}>
      <div style={{ backgroundColor: side.accent, color: "#fff", fontSize: 46, fontWeight: 700, textAlign: "center", padding: "14px 0" }}>{side.label}</div>
      <div style={{ padding: "22px 22px 26px" }}>{side.art}</div>
    </div>
    {/* バッジは overflow に切られないよう外側に置く */}
    <div style={{ position: "absolute", top: -22, right: -22, width: 56, height: 56, borderRadius: "50%", backgroundColor: side.badge === "check" ? GREEN : COLORS.accent, color: "#fff", fontSize: 34, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #fff" }}>{side.badge === "check" ? "✓" : "×"}</div>
  </div>
);

// ビフォーアフター型（左右2カラム比較）ページ
export const ComparePage: React.FC<{ data: CompareData }> = ({ data }) => {
  const f = useCurrentFrame();
  const headBottom = data.header.sub ? 384 : 322;
  const cardBottom = CARD_TOP + CARD_H;
  return (
    <Background>
      <AbsoluteFill style={{ fontFamily: FONT }}>
        {/* 接続線 */}
        <svg width="1080" height="1920" style={{ position: "absolute" }}>
          <DrawPath d={`M${CENTER} ${headBottom} L${CENTER} 412`} s={draw(f, 26, 44)} />
          <DrawPath d={`M${CXL} 412 L${CXR} 412`} s={draw(f, 70, 40)} />
          <DrawPath d={`M${CXL} 412 L${CXL} ${CARD_TOP}`} s={draw(f, 100, 26)} />
          <DrawPath d={`M${CXR} 412 L${CXR} ${CARD_TOP}`} s={draw(f, 100, 26)} />
          {data.statement && (
            <>
              <DrawPath d={`M${CXL} ${cardBottom} L${CXL} 892 L${CENTER} 892`} s={draw(f, 150, 40)} c={COLORS.accent} w={6} />
              <DrawPath d={`M${CXR} ${cardBottom} L${CXR} 892 L${CENTER} 892`} s={draw(f, 150, 40)} c={COLORS.accent} w={6} />
              <DrawPath d={`M${CENTER} 892 L${CENTER} 936`} s={draw(f, 188, 22)} c={COLORS.accent} w={6} />
            </>
          )}
        </svg>

        {/* 見出し */}
        <In delay={6} style={{ left: 0, top: 170, width: 1080, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ border: `5px solid ${COLORS.ink}`, borderRadius: 18, backgroundColor: "#fff", padding: "22px 34px", display: "inline-flex", alignItems: "center", gap: 18, justifyContent: "center", maxWidth: 1000, boxSizing: "border-box" }}>
            <div style={{ width: 11, height: 56, backgroundColor: COLORS.accent, borderRadius: 4, flexShrink: 0 }} />
            <div style={{ fontSize: 64, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2, whiteSpace: "nowrap" }}>{data.header.title}</div>
          </div>
          {data.header.sub ? <div style={{ textAlign: "center", fontSize: 36, fontWeight: 700, color: GRAY, marginTop: 12 }}>{data.header.sub}</div> : null}
        </In>

        {/* 左右カード */}
        <In delay={104} pop style={{ left: CXL - CARD_W / 2, top: CARD_TOP, width: CARD_W }}>
          <Card side={data.left} />
        </In>
        <In delay={126} pop style={{ left: CXR - CARD_W / 2, top: CARD_TOP, width: CARD_W }}>
          <Card side={data.right} />
        </In>

        {/* 結論 */}
        {data.statement && (
          <In delay={198} style={{ left: 40, top: 968, width: 1000 }}>
            <div style={{ textAlign: "center", fontSize: 98, fontWeight: 700, color: COLORS.ink, lineHeight: 1.15 }}>{data.statement}</div>
          </In>
        )}
        {/* 注記 */}
        {data.note && (
          <In delay={256} style={{ left: 40, top: 1130, width: 1000 }}>
            <div style={{ textAlign: "center", fontSize: 34, fontWeight: 700, color: GRAY }}>{data.note}</div>
          </In>
        )}
        {/* 締めの一文 */}
        {data.footer && (
          <In delay={300} style={{ left: 40, top: 1240, width: 1000 }}>
            <div style={{ textAlign: "center", fontSize: 60, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>{data.footer}</div>
          </In>
        )}
      </AbsoluteFill>
    </Background>
  );
};
