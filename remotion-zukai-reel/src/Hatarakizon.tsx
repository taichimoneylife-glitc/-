import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 締めシーン②：注意ゾーンの概念グラフ（年収×手取りのイメージ）
//   断定しない：固定数字・「○万で戻る」は出さない。130〜150万台を
//   「手取りが伸びにくいことがある 注意ゾーン」として色帯＋⚠で見せる。
//   ※あくまで概念図・イメージ図。
// ───────────────────────────────────────────────────────────────
const C = { bg: "#FCFBF7", ink: "#1F3A5F", orange: "#E8912D", red: "#E0483B", green: "#2E9E6B", gray: "#AEB8C2", line: "#C9D2DD", redBg: "#FCE6E3" };

export const HATARAKIZON_FRAMES = 560;

// 概念カーブ：右肩上がり → 130万付近から伸びが鈍る（なだらかな踊り場/浅い谷）→ その先また伸びる
const DATA: [number, number][] = [
  [118, 116], [124, 122], [130, 127], [135, 125], [140, 125.5], [145, 127], [150, 129], [155, 132.5], [162, 138], [170, 146],
];
const XMIN = 116, XMAX = 172, YMIN = 112, YMAX = 134;
const PX0 = 130, PX1 = 950, PY0 = 740, PY1 = 150;
const fx = (v: number) => PX0 + (v - XMIN) / (XMAX - XMIN) * (PX1 - PX0);
const fy = (t: number) => PY0 + (t - YMIN) / (YMAX - YMIN) * (PY1 - PY0);
const pts = DATA.map(([x, y]) => [fx(x), fy(y)] as const);
const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
const Z0 = 130, Z1 = 152; // 注意ゾーン
const zonePath = `M${fx(Z0)} ${PY0} L${fx(Z0)} ${fy(YMAX)} L${fx(Z1)} ${fy(YMAX)} L${fx(Z1)} ${PY0} Z`;

const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 12, stiffness: 150, mass: 0.7 }, durationInFrames: 12 });
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};

export const Hatarakizon: React.FC = () => {
  const f = useCurrentFrame();
  const drawP = interpolate(f, [34, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(125% 80% at 50% -5%, #FFFDF8 0%, #FAF6EC 55%, #F1EBDD 100%)" }} />
      {/* 見出し */}
      <Pop delay={4} style={{ position: "absolute", top: 120, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.red }}>⚠ 超えるなら、どこまで？</div>
        <div style={{ fontSize: 50, fontWeight: 900, color: C.ink, marginTop: 6 }}>130〜150万台は<span style={{ color: C.red }}>注意ゾーン</span></div>
      </Pop>
      <Pop delay={16} style={{ position: "absolute", top: 272, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: C.ink, background: "#fff", border: `2px solid ${C.orange}`, borderRadius: 999, padding: "7px 22px" }}>収入は増えても、手取りがあまり増えないことも</span>
      </Pop>

      <svg width={1080} height={820} style={{ position: "absolute", top: 340, left: 0 }}>
        {/* 注意ゾーン帯 */}
        <path d={zonePath} fill={C.red} opacity={interpolate(f, [120, 140], [0, 0.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        {/* 軸 */}
        <line x1={PX0} y1={PY0} x2={PX1} y2={PY0} stroke={C.ink} strokeWidth={4} />
        <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.ink} strokeWidth={4} />
        <text x={PX0 - 14} y={PY1 - 14} fontSize={24} fontWeight={900} fill={C.gray} textAnchor="start">手取り</text>
        <text x={PX1 + 6} y={PY0 + 44} fontSize={24} fontWeight={900} fill={C.gray} textAnchor="end">年収</text>
        {/* 概念図なので数値目盛りは“目安”レベルで薄く（130だけ強調） */}
        {[120, 130, 140, 150, 160].map((v) => (
          <g key={v}>
            <line x1={fx(v)} y1={PY0} x2={fx(v)} y2={PY0 + 10} stroke={C.ink} strokeWidth={3} />
            <text x={fx(v)} y={PY0 + 40} fontSize={23} fontWeight={900} fill={v === 130 ? C.red : C.gray} textAnchor="middle">{v}万</text>
          </g>
        ))}
        {/* カーブ（描き込み） */}
        <path d={pathD} fill="none" stroke={C.red} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawP} />
        {/* 130万ポイント（踊り場の入口） */}
        {drawP > 0.35 && <circle cx={fx(130)} cy={fy(127)} r={10} fill="#fff" stroke={C.red} strokeWidth={5} />}
        {/* 伸びが鈍る＝横向き矢印イメージ（ゾーン内） */}
        {drawP > 0.7 && <path d={`M${fx(133)} ${fy(123)} L${fx(149)} ${fy(123)}`} stroke={C.red} strokeWidth={5} strokeDasharray="7 7" opacity={0.7} />}
      </svg>

      {/* ゾーンのラベル（必ず損ではなく“伸びにくいことがある”） */}
      <Pop delay={110} style={{ position: "absolute", top: 340 + fy(YMAX) - 70, left: fx(Z0) - 30, width: 420, textAlign: "center" }}>
        <div style={{ background: C.red, color: "#fff", borderRadius: 12, padding: "8px 12px", fontSize: 22, fontWeight: 900, lineHeight: 1.3 }}>⚠ 手取りが伸びにくい<br />ことがある注意ゾーン</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: C.red, marginTop: 6 }}>130〜150万円台の目安</div>
      </Pop>

      {/* 下部まとめ＋注釈 */}
      <Pop delay={140} style={{ position: "absolute", top: 1150, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 38, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 16, padding: "14px 30px", display: "inline-block" }}>超えるなら、どこまで働くかを考える</span>
      </Pop>
      <Pop delay={160} style={{ position: "absolute", top: 1270, left: 80, width: 920, textAlign: "left" }}>
        {["※手取り額は目安（概念図です）", "※自治体・年齢・扶養人数・勤務先などで異なります", "※勤務先の社保か、国民年金＋国保かで負担は変わります", "※一律に「○万円で元に戻る」とは言えません"].map((n, i) => (
          <div key={i} style={{ fontSize: 19, fontWeight: 700, color: C.gray, marginBottom: 6, lineHeight: 1.35 }}>{n}</div>
        ))}
      </Pop>
    </AbsoluteFill>
  );
};
