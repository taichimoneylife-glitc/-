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
export const DrawPath: React.FC<{ d: string; s: number; w?: number; c?: string }> = ({ d, s, w = 5, c = COLORS.ink }) => (
  <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - s} opacity={s > 0.001 ? 1 : 0} />
);

export const In: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties; pop?: boolean; speed?: number }> = ({ delay, children, style, pop, speed = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // pop=箱/帳/イラスト（少し沈んでから弾んで出る）／通常=テキスト（下からフワッと）。speedで出現時間もスケール
  const s = spring({ frame: frame - delay, fps, config: pop ? { damping: 11, mass: 0.9, stiffness: 130 } : { damping: 200 }, durationInFrames: Math.round((pop ? 34 : 30) * speed) });
  const py = (1 - s) * (pop ? 26 : 34);
  return (
    <div style={{ position: "absolute", opacity: Math.min(1, s * 1.6), transform: pop ? `translateY(${py}px) scale(${s})` : `translateY(${py}px)`, transformOrigin: "center", ...style }}>
      {children}
    </div>
  );
};
const at = (cx: number, top: number, w: number): React.CSSProperties => ({ left: cx - w / 2, top, width: w });

type Box = { label: string; sub?: string; variant?: "outline" | "red" | "navy"; fill?: string; outline?: boolean; badge?: "check" | "cross" };

export type Extra = { text: React.ReactNode; x: number; y: number; size: number; color?: string };

export type DiagramData = {
  header: { title: string; sub?: string };
  boxes?: Box[]; // 0, 1, or 2
  statement?: React.ReactNode; // 大きい結論
  number?: React.ReactNode; // 赤い大きい数字
  note?: string;
  pill?: React.ReactNode; // 紺の帯（キリよく改行＋キーワードを大きく／色替えできる）
  footer?: React.ReactNode; // 帯の下の締めの一文
  art?: React.ReactNode; // イラスト（結論の下・グッドボタン等）
  extras?: Extra[]; // 自由テキスト（好きな位置）
  offset?: number; // 全体の縦位置（既定60）。ビルダーの微調整と対応
  speed?: number; // 出現速度（既定1・大きいほどゆっくり）
  fs?: { header?: number; box?: number; stmt?: number; num?: number; note?: number; pill?: number; foot?: number }; // 文字サイズ上書き
  pos?: { [k: string]: { dx?: number; dy?: number } }; // 要素ごとの位置ずらし（header/box0/box1/stmt/num/note/pill/foot/art）
};

// 自由テキストのレイヤー（縦位置offsetに影響されず、キャンバス絶対座標に置く）
export const ExtrasLayer: React.FC<{ extras?: Extra[]; speed?: number }> = ({ extras, speed = 1 }) => (
  <AbsoluteFill style={{ fontFamily: FONT }}>
    {(extras ?? []).map((e, i) => (
      <In key={i} delay={Math.round(250 * speed)} speed={speed} style={{ left: e.x, top: e.y, transform: "translate(-50%,-50%)", maxWidth: 1000, textAlign: "center", fontSize: e.size, fontWeight: 700, color: e.color ?? COLORS.ink, lineHeight: 1.2, whiteSpace: "pre-wrap" }}>
        {e.text}
      </In>
    ))}
  </AbsoluteFill>
);

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

const boxStyle = (b: Box): React.CSSProperties => {
  // 新方式：fill(色)＋outline(枠/塗り)。未指定なら旧variantにフォールバック
  if (b.fill) {
    return b.outline
      ? { backgroundColor: "#fff", color: b.fill, border: `4px solid ${b.fill}` }
      : { backgroundColor: b.fill, color: "#fff", border: `4px solid ${b.fill}` };
  }
  if (b.variant === "red") return { backgroundColor: COLORS.accent, color: "#fff", border: `4px solid ${COLORS.accent}` };
  if (b.variant === "navy") return { backgroundColor: COLORS.ink, color: "#fff", border: `4px solid ${COLORS.ink}` };
  return { backgroundColor: "#fff", color: COLORS.ink, border: `4px solid ${COLORS.ink}` };
};

const BoxView: React.FC<{ b: Box; cx: number; w: number; labelSize?: number }> = ({ b, cx, w, labelSize }) => (
  <div style={{ position: "relative" }}>
    <div style={{ borderRadius: 16, padding: "22px 14px", textAlign: "center", fontSize: labelSize ?? 50, fontWeight: 700, whiteSpace: "nowrap", ...boxStyle(b) }}>{b.label}</div>
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
  const headBottom = data.header.sub ? 384 : 322; // 見出しサブがある時は、幹線をサブ文字より下から始めて被らないように
  const O = data.offset ?? 60; // 全体の縦位置（ビルダー対応）
  const F = data.fs ?? {}; // 文字サイズ上書き
  const k = data.speed ?? 1; // 出現速度（大きいほどゆっくり）
  const fk = f / k; // 線の描画をkでスローに（draw(f/k,start,dur)＝start*k,dur*kと等価）
  const D = (nn: number) => Math.round(nn * k); // 出現delayをスケール
  const PS = data.pos ?? {}; // 要素ごとの位置ずらし
  const atP = (cx: number, top: number, w: number, key: string): React.CSSProperties => ({ left: cx - w / 2 + (PS[key]?.dx ?? 0), top: top + (PS[key]?.dy ?? 0), width: w });

  return (
    <Background>
      {/* Instagramの上部バーを避けて全体を少し下げる */}
      <AbsoluteFill style={{ fontFamily: FONT, transform: `translateY(${O}px)` }}>
        {/* 接続線 */}
        <svg width="1080" height="1920" style={{ position: "absolute" }}>
          {n > 0 && (
            <>
              {twoBox ? (
                <>
                  <DrawPath d={`M${CENTER} ${headBottom} L${CENTER} 470`} s={draw(fk, 26, 44)} />
                  <DrawPath d={`M${CXL} 470 L${CXR} 470`} s={draw(fk, 70, 40)} />
                  <DrawPath d={`M${CXL} 470 L${CXL} ${BOX_TOP}`} s={draw(fk, 100, 26)} />
                  <DrawPath d={`M${CXR} 470 L${CXR} ${BOX_TOP}`} s={draw(fk, 100, 26)} />
                  {data.statement &&
                    (hasSub ? (
                      // サブ文があるときは、2つのサブ文の"間"（中央の空き）を通す1本だけ。文字と被らないよう手前で止める
                      <DrawPath d={`M${CENTER} 702 L${CENTER} ${STMT_TOP - 32}`} s={draw(fk, 150, 32)} c={COLORS.accent} w={6} />
                    ) : (
                      <>
                        <DrawPath d={`M${CXL} ${BOX_TOP + BOX_H} L${CXL} 690 L${CENTER} 690`} s={draw(fk, 146, 42)} c={COLORS.accent} w={6} />
                        <DrawPath d={`M${CXR} ${BOX_TOP + BOX_H} L${CXR} 690 L${CENTER} 690`} s={draw(fk, 146, 42)} c={COLORS.accent} w={6} />
                        <DrawPath d={`M${CENTER} 690 L${CENTER} ${STMT_TOP - 32}`} s={draw(fk, 184, 26)} c={COLORS.accent} w={6} />
                      </>
                    ))}
                </>
              ) : (
                <>
                  <DrawPath d={`M${CENTER} ${headBottom} L${CENTER} ${BOX_TOP}`} s={draw(fk, 26, 48)} />
                  {data.statement && <DrawPath d={`M${CENTER} ${BOX_TOP + BOX_H} L${CENTER} ${STMT_TOP - 32}`} s={draw(fk, 150, 42)} c={COLORS.accent} w={6} />}
                </>
              )}
            </>
          )}
          {data.footer && data.pill && <DrawPath d={`M${CENTER} ${PILL_TOP + 132} L${CENTER} ${FOOT_TOP - 30}`} s={draw(fk, 300, 24)} />}
        </svg>

        {/* 枠見出し */}
        <In delay={D(4)} speed={k} style={{ left: PS.header?.dx ?? 0, top: HEADER_TOP + (PS.header?.dy ?? 0), width: 1080, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ border: `5px solid ${COLORS.ink}`, borderRadius: 18, backgroundColor: "#fff", padding: "22px 34px", display: "inline-flex", alignItems: "center", gap: 18, justifyContent: "center", maxWidth: 1000, boxSizing: "border-box" }}>
            <div style={{ width: 11, height: 56, backgroundColor: COLORS.accent, borderRadius: 4, flexShrink: 0 }} />
            <div style={{ fontSize: F.header ?? 64, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2, whiteSpace: "nowrap" }}>{data.header.title}</div>
          </div>
          {data.header.sub ? <div style={{ textAlign: "center", fontSize: 36, fontWeight: 700, color: GRAY, marginTop: 12 }}>{data.header.sub}</div> : null}
        </In>

        {/* 箱 */}
        {oneBox && (
          <In delay={D(104)} speed={k} pop style={atP(CENTER, BOX_TOP, 500, "box0")}>
            <BoxView b={data.boxes![0]} cx={CENTER} w={500} labelSize={F.box} />
          </In>
        )}
        {twoBox && (
          <>
            <In delay={D(104)} speed={k} pop style={atP(CXL, BOX_TOP, 360, "box0")}>
              <BoxView b={data.boxes![0]} cx={CXL} w={360} labelSize={F.box} />
            </In>
            <In delay={D(126)} speed={k} pop style={atP(CXR, BOX_TOP, 360, "box1")}>
              <BoxView b={data.boxes![1]} cx={CXR} w={360} labelSize={F.box} />
            </In>
          </>
        )}

        {/* 結論の大テキスト */}
        {data.statement && (
          <In delay={D(190)} speed={k} style={atP(CENTER, STMT_TOP, 1000, "stmt")}>
            <div style={{ textAlign: "center", fontSize: F.stmt ?? 84, fontWeight: 700, color: COLORS.ink, lineHeight: 1.15 }}>{data.statement}</div>
          </In>
        )}
        {/* イラスト（結論の下・グッドボタン等） */}
        {data.art && (
          <In delay={D(214)} speed={k} pop style={{ left: PS.art?.dx ?? 0, top: ART_TOP + (PS.art?.dy ?? 0), width: 1080, display: "flex", justifyContent: "center" }}>
            {data.art}
          </In>
        )}
        {/* 赤い大きい数字 */}
        {data.number && (
          <In delay={D(228)} speed={k} style={atP(CENTER, NUM_TOP, 1000, "num")}>
            <div style={{ textAlign: "center", fontSize: F.num ?? 100, fontWeight: 700, color: COLORS.accent, lineHeight: 1.1 }}>{data.number}</div>
          </In>
        )}
        {/* 注記 */}
        {data.note && (
          <In delay={D(256)} speed={k} style={atP(CENTER, NOTE_TOP, 1000, "note")}>
            <div style={{ textAlign: "center", fontSize: F.note ?? 34, fontWeight: 700, color: GRAY }}>{data.note}</div>
          </In>
        )}
        {/* 下のpill */}
        {data.pill && (
          <In delay={D(288)} speed={k} pop style={atP(CENTER, PILL_TOP, 820, "pill")}>
            <div style={{ backgroundColor: COLORS.ink, color: "#fff", borderRadius: 20, padding: "28px 0", textAlign: "center", fontSize: F.pill ?? 60, fontWeight: 700, lineHeight: 1.25 }}>{data.pill}</div>
          </In>
        )}
        {/* 締めの一文（帯の下） */}
        {data.footer && (
          <In delay={D(322)} speed={k} style={atP(CENTER, FOOT_TOP, 1000, "foot")}>
            <div style={{ textAlign: "center", fontSize: F.foot ?? 54, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>{data.footer}</div>
          </In>
        )}
      </AbsoluteFill>
      {/* 自由テキスト（縦位置offsetの影響を受けない別レイヤー） */}
      <ExtrasLayer extras={data.extras} speed={k} />
    </Background>
  );
};
