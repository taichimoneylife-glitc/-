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
  pill?: React.ReactNode; // 紺の帯（キリよく改行＋キーワードを大きく／色替えできる）
  footer?: React.ReactNode; // 帯の下の締めの一文
  art?: React.ReactNode; // イラスト（結論の下・グッドボタン等）
};

// 固定スロット座標
const HEADER_TOP = 170;
const BOX_TOP = 520;
const BOX_H = 118;
const CXL = 300;
const CXR = 780;
const CENTER = 540;
const STMT_TOP = 760;
const NUM_TOP = 930;
const NOTE_TOP = 1070;
const PILL_TOP = 1160;
const FOOT_TOP = 1360;
const ART_TOP = 940;

const boxStyle = (v: Box["variant"]): React.CSSProperties => {
  if (v === "red") return { backgroundColor: COLORS.accent, color: "#fff", border: `4px solid ${COLORS.accent}` };
  if (v === "navy") return { backgroundColor: COLORS.ink, color: "#fff", border: `4px solid ${COLORS.ink}` };
  return { backgroundColor: "#fff", color: COLORS.ink, border: `4px solid ${COLORS.ink}` };
};

const BoxView: React.FC<{ b: Box; cx: number; w: number }> = ({ b, cx, w }) => (
  <div style={{ position: "relative" }}>
    <div style={{ borderRadius: 16, padding: "22px 14px", textAlign: "center", fontSize: 50, fontWeight: 700, whiteSpace: "nowrap", ...boxStyle(b.variant) }}>{b.label}</div>
    {b.badge ? (
      <div style={{ position: "absolute", top: -18, right: -18, width: 44, height: 44, borderRadius: "50%", backgroundColor: b.badge === "check" ? "#12A150" : COLORS.accent, color: "#fff", fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff" }}>{b.badge === "check" ? "✓" : "×"}</div>
    ) : null}
    {b.sub ? <div style={{ textAlign: "center", fontSize: 34, fontWeight: 700, color: GRAY, marginTop: 12, width: w }}>{b.sub}</div> : null}
  </div>
);

// 連結図解ページ（1画面に線でつないで組み上げ）
export const DiagramPage: React.FC<{ data: DiagramData }> = ({ data }) => {
  const f = useCurrentFrame();
  const n = data.boxes?.length ?? 0;
  const twoBox = n >= 2;
  const oneBox = n === 1;
  const hasSub = data.boxes?.some((b) => b.sub) ?? false; // 箱にサブ文があると、横向き結線がサブ文字に重なるため経路を変える

  return (
    <Background>
      <AbsoluteFill style={{ fontFamily: FONT }}>
        {/* 接続線 */}
        <svg width="1080" height="1920" style={{ position: "absolute" }}>
          {n > 0 && (
            <>
              {twoBox ? (
                <>
                  <DrawPath d={`M${CENTER} 356 L${CENTER} 470`} s={draw(f, 22, 30)} />
                  <DrawPath d={`M${CXL} 470 L${CXR} 470`} s={draw(f, 48, 28)} />
                  <DrawPath d={`M${CXL} 470 L${CXL} ${BOX_TOP}`} s={draw(f, 70, 18)} />
                  <DrawPath d={`M${CXR} 470 L${CXR} ${BOX_TOP}`} s={draw(f, 70, 18)} />
                  {data.statement &&
                    (hasSub ? (
                      // サブ文があるときは、2つのサブ文の"間"（中央の空き）を通す1本だけ。文字と被らないよう手前で止める
                      <DrawPath d={`M${CENTER} 702 L${CENTER} ${STMT_TOP - 32}`} s={draw(f, 108, 22)} c={COLORS.accent} w={6} />
                    ) : (
                      <>
                        <DrawPath d={`M${CXL} ${BOX_TOP + BOX_H} L${CXL} 690 L${CENTER} 690`} s={draw(f, 104, 30)} c={COLORS.accent} w={6} />
                        <DrawPath d={`M${CXR} ${BOX_TOP + BOX_H} L${CXR} 690 L${CENTER} 690`} s={draw(f, 104, 30)} c={COLORS.accent} w={6} />
                        <DrawPath d={`M${CENTER} 690 L${CENTER} ${STMT_TOP - 32}`} s={draw(f, 130, 18)} c={COLORS.accent} w={6} />
                      </>
                    ))}
                </>
              ) : (
                <>
                  <DrawPath d={`M${CENTER} 356 L${CENTER} ${BOX_TOP}`} s={draw(f, 22, 34)} />
                  {data.statement && <DrawPath d={`M${CENTER} ${BOX_TOP + BOX_H} L${CENTER} ${STMT_TOP - 32}`} s={draw(f, 100, 30)} c={COLORS.accent} w={6} />}
                </>
              )}
            </>
          )}
          {data.footer && data.pill && <DrawPath d={`M${CENTER} ${PILL_TOP + 132} L${CENTER} ${FOOT_TOP - 30}`} s={draw(f, 214, 16)} />}
        </svg>

        {/* 枠見出し */}
        <In delay={4} style={{ left: 0, top: HEADER_TOP, width: 1080, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ border: `5px solid ${COLORS.ink}`, borderRadius: 18, backgroundColor: "#fff", padding: "22px 34px", display: "inline-flex", alignItems: "center", gap: 18, justifyContent: "center", maxWidth: 1000, boxSizing: "border-box" }}>
            <div style={{ width: 11, height: 56, backgroundColor: COLORS.accent, borderRadius: 4, flexShrink: 0 }} />
            <div style={{ fontSize: 64, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2, whiteSpace: "nowrap" }}>{data.header.title}</div>
          </div>
          {data.header.sub ? <div style={{ textAlign: "center", fontSize: 36, fontWeight: 700, color: GRAY, marginTop: 12 }}>{data.header.sub}</div> : null}
        </In>

        {/* 箱 */}
        {oneBox && (
          <In delay={72} pop style={at(CENTER, BOX_TOP, 500)}>
            <BoxView b={data.boxes![0]} cx={CENTER} w={500} />
          </In>
        )}
        {twoBox && (
          <>
            <In delay={72} pop style={at(CXL, BOX_TOP, 360)}>
              <BoxView b={data.boxes![0]} cx={CXL} w={360} />
            </In>
            <In delay={88} pop style={at(CXR, BOX_TOP, 360)}>
              <BoxView b={data.boxes![1]} cx={CXR} w={360} />
            </In>
          </>
        )}

        {/* 結論の大テキスト */}
        {data.statement && (
          <In delay={132} style={at(CENTER, STMT_TOP, 1000)}>
            <div style={{ textAlign: "center", fontSize: 98, fontWeight: 700, color: COLORS.ink, lineHeight: 1.15 }}>{data.statement}</div>
          </In>
        )}
        {/* イラスト（結論の下・グッドボタン等） */}
        {data.art && (
          <In delay={160} pop style={{ left: 0, top: ART_TOP, width: 1080, display: "flex", justifyContent: "center" }}>
            {data.art}
          </In>
        )}
        {/* 赤い大きい数字 */}
        {data.number && (
          <In delay={162} style={at(CENTER, NUM_TOP, 1000)}>
            <div style={{ textAlign: "center", fontSize: 100, fontWeight: 700, color: COLORS.accent, lineHeight: 1.1 }}>{data.number}</div>
          </In>
        )}
        {/* 注記 */}
        {data.note && (
          <In delay={182} style={at(CENTER, NOTE_TOP, 1000)}>
            <div style={{ textAlign: "center", fontSize: 34, fontWeight: 700, color: GRAY }}>{data.note}</div>
          </In>
        )}
        {/* 下のpill */}
        {data.pill && (
          <In delay={200} pop style={at(CENTER, PILL_TOP, 920)}>
            <div style={{ backgroundColor: COLORS.ink, color: "#fff", borderRadius: 20, padding: "30px 0", textAlign: "center", fontSize: 66, fontWeight: 700, lineHeight: 1.25 }}>{data.pill}</div>
          </In>
        )}
        {/* 締めの一文（帯の下） */}
        {data.footer && (
          <In delay={222} style={at(CENTER, FOOT_TOP, 1000)}>
            <div style={{ textAlign: "center", fontSize: 60, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>{data.footer}</div>
          </In>
        )}
      </AbsoluteFill>
    </Background>
  );
};
