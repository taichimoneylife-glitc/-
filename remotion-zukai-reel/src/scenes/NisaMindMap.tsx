import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Layout";
import { FONT } from "../components/font";
import { COLORS } from "../theme";

// 接続線の色（参考動画のような細いグレー）
const CONN = "#9AA3B2";

// ── 線を「描き足す」アニメ用のパス ──
// pathLength=1 に正規化して、strokeDashoffset を 1→0 に動かすと線が伸びていく。
const DrawPath: React.FC<{ d: string; p: number; w?: number }> = ({
  d,
  p,
  w = 4,
}) => (
  <path
    d={d}
    fill="none"
    stroke={CONN}
    strokeWidth={w}
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray={1}
    strokeDashoffset={1 - p}
    opacity={p > 0.001 ? 1 : 0}
  />
);

// 0→1 の線引き進捗（イーズイン・アウト）
const draw = (f: number, start: number, dur: number) => {
  const x = Math.max(0, Math.min(1, (f - start) / dur));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

// 番号ノード（ポンッと弾んで出る）＋末端の“ピッ”ドット
const Node: React.FC<{
  cx: number;
  top: number;
  delay: number;
  num: string;
  label: string;
}> = ({ cx, top, delay, num, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.6 },
    durationInFrames: 20,
  });
  const w = 214;
  const h = 210;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - w / 2,
        top,
        width: w,
        height: h,
        opacity: Math.min(1, s * 1.5),
        transform: `scale(${s})`,
        transformOrigin: "top center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        backgroundColor: COLORS.white,
        border: `4px solid ${COLORS.ink}`,
        borderRadius: 18,
        boxSizing: "border-box",
        padding: 12,
      }}
    >
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: "50%",
          backgroundColor: COLORS.accent,
          color: COLORS.white,
          fontSize: 44,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {num}
      </div>
      <div
        style={{
          fontSize: 38,
          fontWeight: 700,
          color: COLORS.ink,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// 中心（親）ノード
const Root: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 13, mass: 0.6 },
    durationInFrames: 20,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 170,
        top: 245,
        width: 340,
        height: 116,
        transform: `scale(${s})`,
        opacity: Math.min(1, s * 1.5),
        transformOrigin: "center",
        backgroundColor: COLORS.accent,
        borderRadius: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.white,
        fontSize: 58,
        fontWeight: 700,
        boxShadow: "0 10px 24px rgba(229,67,43,0.25)",
      }}
    >
      新NISA
    </div>
  );
};

// 子ノードの定義（x中心を等間隔に配置）
const CHILDREN = [
  { cx: 180, num: "①", label: "無期限" },
  { cx: 420, num: "②", label: "年360万" },
  { cx: 660, num: "③", label: "1,800万" },
  { cx: 900, num: "④", label: "枠復活" },
];

// タイミング
const BUS_Y = 600; // 横方向の“バス”ライン
const NODE_TOP = 700;
const START = 46; // 子ノードの開始フレーム
const STEP = 18; // 子ノードごとのずらし

export const NisaMindMap: React.FC = () => {
  const frame = useCurrentFrame();

  // 幹（root下→バス）と 横バス の描画進捗
  const trunkP = draw(frame, 12, 12);
  const busP = draw(frame, 26, 16);

  const lastChild = START + (CHILDREN.length - 1) * STEP;

  // まとめキャプションの出現
  const capS = draw(frame, lastChild + 26, 18);

  return (
    <Background>
      {/* タイトル */}
      <div
        style={{
          position: "absolute",
          top: 96,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 52,
          fontWeight: 700,
          color: COLORS.ink,
        }}
      >
        新NISAの<span style={{ color: COLORS.accent }}>全体像</span>
      </div>

      {/* 接続線（動線）レイヤー */}
      <AbsoluteFill>
        <svg width="1080" height="1920" style={{ position: "absolute" }}>
          {/* 幹：root下(540,361)→バス(540,600) */}
          <DrawPath d={`M540 361 L540 ${BUS_Y}`} p={trunkP} />
          {/* 横バス：180→900 */}
          <DrawPath d={`M180 ${BUS_Y} L900 ${BUS_Y}`} p={busP} />
          {/* 各子への“落とし線”＋末端ドット */}
          {CHILDREN.map((c, i) => {
            const p = draw(frame, START + i * STEP, 10);
            return (
              <g key={c.cx}>
                <DrawPath d={`M${c.cx} ${BUS_Y} L${c.cx} ${NODE_TOP}`} p={p} />
                <circle
                  cx={c.cx}
                  cy={BUS_Y}
                  r={7 * Math.min(1, p * 2)}
                  fill={COLORS.accent}
                />
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* ノード */}
      <Root delay={0} />
      {CHILDREN.map((c, i) => (
        <Node
          key={c.cx}
          cx={c.cx}
          top={NODE_TOP}
          delay={START + i * STEP + 6}
          num={c.num}
          label={c.label}
        />
      ))}

      {/* まとめキャプション */}
      <div
        style={{
          position: "absolute",
          top: 1080,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          opacity: capS,
          transform: `translateY(${(1 - capS) * 30}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: COLORS.ink,
            color: COLORS.white,
            fontSize: 44,
            fontWeight: 700,
            padding: "22px 46px",
            borderRadius: 16,
          }}
        >
          まずはこの<span style={{ color: "#FFC7BD" }}>4つ</span>を押さえる
        </div>
      </div>
    </Background>
  );
};
