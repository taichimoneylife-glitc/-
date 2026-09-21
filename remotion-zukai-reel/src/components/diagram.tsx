import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "./Layout";
import { FONT } from "./font";
import { COLORS } from "../theme";

const GRAY = "#6C7A93";

export const draw = (f: number, start: number, dur: number) => {
  const x = Math.max(0, Math.min(1, (f - start) / dur));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};
const DrawPath: React.FC<{ d: string; s: number; w?: number; c?: string }> = ({ d, s, w = 5, c = COLORS.ink }) => (
  <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - s} opacity={s > 0.001 ? 1 : 0} />
);

const In: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties; pop?: boolean }> = ({ delay, children, style, pop }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: pop ? { damping: 14, mass: 0.7 } : { damping: 200 }, durationInFrames: pop ? 24 : 22 });
  return (
    <div style={{ position: "absolute", opacity: Math.min(1, s * 1.4), transform: pop ? `scale(${s})` : `translateY(${(1 - s) * 18}px)`, transformOrigin: "center", ...style }}>
      {children}
    </div>
  );
};
const at = (cx: number, top: number, w: number): React.CSSProperties => ({ left: cx - w / 2, top, width: w });

type Box = { label: string; sub?: string; variant?: "outline" | "red" | "navy"; badge?: "check" | "cross" };

export type DiagramData = {
  header: { title: string; sub?: string };
  boxes?: Box[]; // 0, 1, or 2
  statement?: React.ReactNode; // 大きい結論
  number?: React.ReactNode; // 赤い大きい数字
  note?: string;
  pill?: string;
};

// 固定スロット座標
const HEADER_TOP = 170;
const BOX_TOP = 520;
const BOX_H = 118;
const CXL = 300;
const CXR = 780;
const CENTER = 540;
const STMT_TOP = 770;
const NUM_TOP = 936;
const NOTE_TOP = 1078;
const PILL_TOP = 1168;

const boxStyle = (v: Box["variant"]): React.CSSProperties => {
  if (v === "red") return { backgroundColor: COLORS.accent, color: "#fff", border: `4px solid ${COLORS.accent}` };
  if (v === "navy") return { backgroundColor: COLORS.ink, color: "#fff", border: `4px solid ${COLORS.ink}` };
  return { backgroundColor: "#fff", color: COLORS.ink, border: `4px solid ${COLORS.ink}` };
};

const BoxView: React.FC<{ b: Box; cx: number; w: number }> = ({ b, cx, w }) => (
  <div style={{ position: "relative" }}>
    <div style={{ borderRadius: 16, padding: "22px 14px", textAlign: "center", fontSize: 40, fontWeight: 700, whiteSpace: "nowrap", ...boxStyle(b.variant) }}>{b.label}</div>
    {b.badge ? (
      <div style={{ position: "absolute", top: -18, right: -18, width: 44, height: 44, borderRadius: "50%", backgroundColor: b.badge === "check" ? "#12A150" : COLORS.accent, color: "#fff", fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff" }}>{b.badge === "check" ? "✓" : "×"}</div>
    ) : null}
    {b.sub ? <div style={{ textAlign: "center", fontSize: 28, fontWeight: 700, color: GRAY, marginTop: 12, width: w }}>{b.sub}</div> : null}
  </div>
);

// 連結図解ページ（1画面に線でつないで組み上げ）
export const DiagramPage: React.FC<{ data: DiagramData }> = ({ data }) => {
  const f = useCurrentFrame();
  const n = data.boxes?.length ?? 0;
  const twoBox = n >= 2;
  const oneBox = n === 1;

  return (
    <Background>
      <AbsoluteFill style={{ fontFamily: FONT }}>
        {/* 接続線 */}
        <svg width="1080" height="1920" style={{ position: "absolute" }}>
          {n > 0 && (
            <>
              {twoBox ? (
                <>
                  <DrawPath d={`M${CENTER} 356 L${CENTER} 470`} s={draw(f, 20, 14)} />
                  <DrawPath d={`M${CXL} 470 L${CXR} 470`} s={draw(f, 34, 14)} />
                  <DrawPath d={`M${CXL} 470 L${CXL} ${BOX_TOP}`} s={draw(f, 48, 10)} />
                  <DrawPath d={`M${CXR} 470 L${CXR} ${BOX_TOP}`} s={draw(f, 48, 10)} />
                  {data.statement && (
                    <>
                      <DrawPath d={`M${CXL} ${BOX_TOP + BOX_H} L${CXL} 690 L${CENTER} 690`} s={draw(f, 74, 16)} c={COLORS.accent} w={6} />
                      <DrawPath d={`M${CXR} ${BOX_TOP + BOX_H} L${CXR} 690 L${CENTER} 690`} s={draw(f, 74, 16)} c={COLORS.accent} w={6} />
                      <DrawPath d={`M${CENTER} 690 L${CENTER} ${STMT_TOP - 8}`} s={draw(f, 92, 10)} c={COLORS.accent} w={6} />
                    </>
                  )}
                </>
              ) : (
                <>
                  <DrawPath d={`M${CENTER} 356 L${CENTER} ${BOX_TOP}`} s={draw(f, 20, 16)} />
                  {data.statement && <DrawPath d={`M${CENTER} ${BOX_TOP + BOX_H} L${CENTER} ${STMT_TOP - 8}`} s={draw(f, 80, 14)} c={COLORS.accent} w={6} />}
                </>
              )}
            </>
          )}
        </svg>

        {/* 枠見出し */}
        <In delay={4} style={at(CENTER, HEADER_TOP, 740)}>
          <div style={{ border: `5px solid ${COLORS.ink}`, borderRadius: 18, backgroundColor: "#fff", padding: "24px 26px", display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
            <div style={{ width: 11, height: 56, backgroundColor: COLORS.accent, borderRadius: 4, flexShrink: 0 }} />
            <div style={{ fontSize: 52, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>{data.header.title}</div>
          </div>
          {data.header.sub ? <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700, color: GRAY, marginTop: 12 }}>{data.header.sub}</div> : null}
        </In>

        {/* 箱 */}
        {oneBox && (
          <In delay={46} pop style={at(CENTER, BOX_TOP, 500)}>
            <BoxView b={data.boxes![0]} cx={CENTER} w={500} />
          </In>
        )}
        {twoBox && (
          <>
            <In delay={46} pop style={at(CXL, BOX_TOP, 360)}>
              <BoxView b={data.boxes![0]} cx={CXL} w={360} />
            </In>
            <In delay={58} pop style={at(CXR, BOX_TOP, 360)}>
              <BoxView b={data.boxes![1]} cx={CXR} w={360} />
            </In>
          </>
        )}

        {/* 結論の大テキスト */}
        {data.statement && (
          <In delay={98} style={at(CENTER, STMT_TOP, 980)}>
            <div style={{ textAlign: "center", fontSize: 74, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>{data.statement}</div>
          </In>
        )}
        {/* 赤い大きい数字 */}
        {data.number && (
          <In delay={126} style={at(CENTER, NUM_TOP, 980)}>
            <div style={{ textAlign: "center", fontSize: 96, fontWeight: 700, color: COLORS.accent, lineHeight: 1.1 }}>{data.number}</div>
          </In>
        )}
        {/* 注記 */}
        {data.note && (
          <In delay={146} style={at(CENTER, NOTE_TOP, 980)}>
            <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700, color: GRAY }}>{data.note}</div>
          </In>
        )}
        {/* 下のpill */}
        {data.pill && (
          <In delay={168} pop style={at(CENTER, PILL_TOP, 840)}>
            <div style={{ backgroundColor: COLORS.ink, color: "#fff", borderRadius: 20, padding: "24px 0", textAlign: "center", fontSize: 46, fontWeight: 700 }}>{data.pill}</div>
          </In>
        )}
      </AbsoluteFill>
    </Background>
  );
};
