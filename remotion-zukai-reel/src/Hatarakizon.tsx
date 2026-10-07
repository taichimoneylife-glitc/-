import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 「働き損」の谷グラフ（年収×手取り）＝締めの図解モック
//   130万で社保加入→手取りが一時的に減る谷→155万あたりで回復。
//   気にすべきゾーン＝130〜150万台を赤で強調。※数字は目安。
// ───────────────────────────────────────────────────────────────
const C = { bg: "#FCFBF7", ink: "#1F3A5F", orange: "#E8912D", red: "#E0483B", green: "#2E9E6B", gray: "#AEB8C2", line: "#C9D2DD", redBg: "#FCE6E3" };

export const HATARAKIZON_FRAMES = 560;

// 年収(万)→手取り(万) の目安カーブ
const DATA: [number, number][] = [
  [120, 118], [125, 123], [128, 125.5], [130, 127], [133, 118], [136, 114.5],
  [140, 115], [145, 118], [150, 122], [155, 127], [160, 129], [165, 133], [170, 137],
];
const XMIN = 118, XMAX = 172, YMIN = 110, YMAX = 132;
const PX0 = 120, PX1 = 960, PY0 = 760, PY1 = 150; // plot box (px, y inverted)
const fx = (v: number) => PX0 + (v - XMIN) / (XMAX - XMIN) * (PX1 - PX0);
const fy = (t: number) => PY0 + (t - YMIN) / (YMAX - YMIN) * (PY1 - PY0);
const pts = DATA.map(([x, y]) => [fx(x), fy(y)] as const);
const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
// 130〜155の谷ゾーン塗り
const zoneTop = fy(YMAX);
const zonePath = `M${fx(130)} ${PY0} L${fx(130)} ${zoneTop} L${fx(155)} ${zoneTop} L${fx(155)} ${PY0} Z`;

const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 12, stiffness: 150, mass: 0.7 }, durationInFrames: 12 });
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};

export const Hatarakizon: React.FC = () => {
  const f = useCurrentFrame();
  const drawP = interpolate(f, [30, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bottomIdx = 6; // 谷底 (140,115)
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      {/* 背景の奥行き */}
      <AbsoluteFill style={{ background: "radial-gradient(125% 80% at 50% -5%, #FFFDF8 0%, #FAF6EC 55%, #F1EBDD 100%)" }} />
      {/* 見出し */}
      <Pop delay={4} style={{ position: "absolute", top: 110, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.red }}>超えるなら、どこまで？</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: C.ink, marginTop: 6 }}>130万〜150万台は<span style={{ color: C.red }}>働き損</span>ゾーン</div>
      </Pop>
      <Pop delay={16} style={{ position: "absolute", top: 268, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: C.ink, background: "#fff", border: `2px solid ${C.orange}`, borderRadius: 999, padding: "7px 22px" }}>130万超で社保加入 → 手取りは年収の約15%ダウン</span>
      </Pop>

      <svg width={1080} height={900} style={{ position: "absolute", top: 330, left: 0 }}>
        {/* 谷ゾーン */}
        <path d={zonePath} fill={C.red} opacity={interpolate(f, [120, 140], [0, 0.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        {/* 軸 */}
        <line x1={PX0} y1={PY0} x2={PX1} y2={PY0} stroke={C.ink} strokeWidth={4} />
        <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke={C.ink} strokeWidth={4} />
        <text x={PX0 - 10} y={PY1 - 14} fontSize={24} fontWeight={900} fill={C.gray} textAnchor="start">手取り</text>
        <text x={PX1} y={PY0 + 44} fontSize={24} fontWeight={900} fill={C.gray} textAnchor="end">年収</text>
        {/* 130万時の手取りライン（基準・点線） */}
        <line x1={PX0} y1={fy(127)} x2={PX1} y2={fy(127)} stroke={C.gray} strokeWidth={3} strokeDasharray="8 8" opacity={interpolate(f, [130, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        {/* X目盛 */}
        {[120, 130, 140, 150, 160, 170].map((v) => (
          <g key={v}>
            <line x1={fx(v)} y1={PY0} x2={fx(v)} y2={PY0 + 10} stroke={C.ink} strokeWidth={3} />
            <text x={fx(v)} y={PY0 + 40} fontSize={24} fontWeight={900} fill={v === 130 || v === 155 ? C.red : C.ink} textAnchor="middle">{v}万</text>
          </g>
        ))}
        {/* カーブ（描き込み） */}
        <path d={pathD} fill="none" stroke={C.red} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawP} />
        {/* ピーク(130) */}
        {drawP > 0.3 && <circle cx={fx(130)} cy={fy(127)} r={10} fill="#fff" stroke={C.ink} strokeWidth={5} />}
        {/* 谷底(140) */}
        {drawP > 0.55 && <circle cx={pts[bottomIdx][0]} cy={pts[bottomIdx][1]} r={11} fill={C.red} stroke="#fff" strokeWidth={4} />}
        {/* 回復(155) */}
        {drawP > 0.95 && <circle cx={fx(155)} cy={fy(127)} r={10} fill={C.green} stroke="#fff" strokeWidth={4} />}
      </svg>

      {/* 吹き出し：谷底 */}
      <Pop delay={95} style={{ position: "absolute", top: 330 + pts[bottomIdx][1] + 24, left: pts[bottomIdx][0] - 110, width: 220, textAlign: "center" }}>
        <div style={{ background: C.red, color: "#fff", borderRadius: 12, padding: "8px 10px", fontSize: 26, fontWeight: 900 }}>140万→約115万</div>
      </Pop>
      {/* 吹き出し：回復 */}
      <Pop delay={120} style={{ position: "absolute", top: 330 + fy(127) - 92, left: fx(155) - 90, width: 200, textAlign: "center" }}>
        <div style={{ background: C.green, color: "#fff", borderRadius: 12, padding: "8px 10px", fontSize: 24, fontWeight: 900 }}>155万で<br />元に戻る</div>
      </Pop>

      {/* 下部まとめ */}
      <Pop delay={140} style={{ position: "absolute", top: 1180, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 40, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 16, padding: "14px 32px", display: "inline-block" }}>中途半端に超えるのが、一番もったいない</span>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.gray, marginTop: 16 }}>※手取りは目安（勤務先の社保・単身40歳未満など前提で試算）。自治体・条件で異なります</div>
      </Pop>
    </AbsoluteFill>
  );
};
