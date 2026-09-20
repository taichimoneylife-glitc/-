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
import { ChartUpIcon, BondIcon } from "../components/carIcons";
import { PersonThinking, PersonCheer } from "../components/people";

const CONN = "#9AA3B2";
const GOOD = "#12A150";

// 線を描き足すパス
const DrawPath: React.FC<{ d: string; s: number; w?: number; c?: string }> = ({
  d,
  s,
  w = 4,
  c = CONN,
}) => (
  <path
    d={d}
    fill="none"
    stroke={c}
    strokeWidth={w}
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray={1}
    strokeDashoffset={1 - s}
    opacity={s > 0.001 ? 1 : 0}
  />
);

const draw = (f: number, start: number, dur: number) => {
  const x = Math.max(0, Math.min(1, (f - start) / dur));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

// ノード（絶対配置＋ポップ）
const Node: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h: number;
  delay: number;
  children: React.ReactNode;
  border?: string;
  bg?: string;
  badge?: "check" | "cross" | null;
}> = ({ cx, cy, w, h, delay, children, border = COLORS.ink, bg = COLORS.white, badge = null }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 13, mass: 0.6 }, durationInFrames: 18 });
  return (
    <div
      style={{
        position: "absolute",
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        transform: `scale(${s})`,
        opacity: Math.min(1, s * 1.6),
        transformOrigin: "center",
        backgroundColor: bg,
        border: `4px solid ${border}`,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box",
        padding: 12,
        color: COLORS.ink,
        fontWeight: 700,
      }}
    >
      {children}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 46,
            height: 46,
            borderRadius: "50%",
            backgroundColor: badge === "check" ? GOOD : COLORS.accent,
            color: COLORS.white,
            fontSize: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {badge === "check" ? "○" : "×"}
        </div>
      )}
    </div>
  );
};

// アイコンをふわっと出す
const Fade: React.FC<{ delay: number; x: number; y: number; children: React.ReactNode }> = ({
  delay,
  x,
  y,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14 }, durationInFrames: 18 });
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: s, transform: `translateY(${(1 - s) * 20}px)` }}>
      {children}
    </div>
  );
};

export const CAR_MINDMAP_FRAMES = 320;

export const CarMindMap: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <Background>
      {/* タイトル */}
      <div
        style={{
          position: "absolute",
          top: 44,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 46,
          fontWeight: 700,
          color: COLORS.ink,
        }}
      >
        車は<span style={{ color: COLORS.accent }}>現金 or ローン</span>？
      </div>

      {/* 接続線レイヤー */}
      <AbsoluteFill>
        <svg width="1080" height="1920" style={{ position: "absolute" }}>
          {/* root → bus → L0 / R0 */}
          <DrawPath d="M540 250 L540 305" s={draw(f, 10, 10)} />
          <DrawPath d="M300 305 L790 305" s={draw(f, 20, 14)} />
          <DrawPath d="M300 305 L300 360" s={draw(f, 32, 8)} />
          <DrawPath d="M790 305 L790 344" s={draw(f, 32, 8)} />
          {/* 現金一括の枝 */}
          <DrawPath d="M300 470 L300 520" s={draw(f, 46, 8)} />
          <DrawPath d="M300 630 L300 690" s={draw(f, 62, 8)} />
          {/* ローンの枝 */}
          <DrawPath d="M790 488 L790 520" s={draw(f, 46, 8)} />
          <DrawPath d="M790 640 L790 700" s={draw(f, 66, 8)} />
          {/* ローン → 運用スパイン（センターへ） */}
          <DrawPath d="M790 800 L790 850 L540 850 L540 905" s={draw(f, 86, 16)} c={COLORS.accent} w={5} />
          <DrawPath d="M540 1010 L540 1075" s={draw(f, 104, 8)} c={COLORS.accent} w={5} />
          <DrawPath d="M540 1195 L540 1255" s={draw(f, 122, 8)} c={COLORS.accent} w={5} />
        </svg>
      </AbsoluteFill>

      {/* 人物 */}
      <Fade delay={6} x={70} y={70}>
        <PersonThinking size={150} />
      </Fade>
      <Fade delay={132} x={880} y={1290}>
        <PersonCheer size={170} />
      </Fade>

      {/* 図解アイコン（余白に配置） */}
      <Fade delay={96} x={120} y={905}>
        <BondIcon size={120} />
      </Fade>
      <Fade delay={112} x={760} y={1075}>
        <ChartUpIcon size={140} />
      </Fade>

      {/* ROOT */}
      <Node cx={540} cy={190} w={360} h={116} delay={0} border={COLORS.accent} bg={COLORS.accent}>
        <div style={{ color: COLORS.white }}>
          <div style={{ fontSize: 46 }}>500万円の車</div>
          <div style={{ fontSize: 26, opacity: 0.9 }}>どう買うのが得？</div>
        </div>
      </Node>

      {/* 左：現金一括 */}
      <Node cx={300} cy={420} w={260} h={110} delay={16} border={COLORS.ink}>
        <div>
          <div style={{ fontSize: 26, color: "#6C7A93" }}>選択A</div>
          <div style={{ fontSize: 40 }}>現金一括</div>
        </div>
      </Node>
      <Node cx={300} cy={575} w={260} h={100} delay={48} border={GOOD} badge="check">
        <div style={{ fontSize: 34 }}>利子は0円</div>
      </Node>
      <Node cx={300} cy={760} w={280} h={130} delay={64} border={COLORS.accent} badge="cross">
        <div>
          <div style={{ fontSize: 34, color: COLORS.accent }}>現金が一気に0</div>
          <div style={{ fontSize: 24, marginTop: 6 }}>運用のチャンスを失う</div>
        </div>
      </Node>

      {/* 右：銀行ローン */}
      <Node cx={790} cy={416} w={300} h={144} delay={22} border={COLORS.ink}>
        <div>
          <div style={{ fontSize: 26, color: "#6C7A93" }}>選択B</div>
          <div style={{ fontSize: 38 }}>銀行ローン</div>
          <div style={{ fontSize: 26, color: COLORS.accent }}>金利2%・10年</div>
        </div>
      </Node>
      <Node cx={790} cy={575} w={320} h={130} delay={48} border={COLORS.ink} bg="#F7F4F6">
        <div style={{ fontSize: 30, lineHeight: 1.5 }}>
          月々 <b style={{ color: COLORS.ink }}>約46,000円</b>
          <br />
          利息 <b style={{ color: COLORS.accent }}>＋約52万</b>
        </div>
      </Node>
      <Node cx={790} cy={755} w={300} h={100} delay={66} border={COLORS.accent}>
        <div style={{ fontSize: 32 }}>
          浮いた<b style={{ color: COLORS.accent }}>500万</b>を運用
        </div>
      </Node>

      {/* 運用スパイン（センター） */}
      <Node cx={540} cy={960} w={340} h={110} delay={92} border={COLORS.ink} bg="#F7F4F6">
        <div style={{ fontSize: 34 }}>
          株より<b>債券</b>で堅実
          <div style={{ fontSize: 28, color: COLORS.accent }}>利回り5.2%（例）</div>
        </div>
      </Node>
      <Node cx={540} cy={1135} w={360} h={110} delay={108} border={COLORS.ink}>
        <div style={{ fontSize: 34 }}>
          10年で <b style={{ color: GOOD }}>約830万</b>に
        </div>
      </Node>

      {/* 結果ハイライト（ピンク枠） */}
      <Node cx={540} cy={1360} w={680} h={200} delay={124} border={COLORS.accent} bg="#FFF3F1">
        <div>
          <div style={{ fontSize: 32, color: COLORS.ink }}>
            運用益 <b style={{ color: GOOD }}>＋330万</b> − 利息 <b style={{ color: COLORS.accent }}>52万</b>
          </div>
          <div style={{ fontSize: 60, color: COLORS.accent, marginTop: 8 }}>＝ ＋270万 お得</div>
        </div>
      </Node>

      {/* CTA */}
      <Fade delay={150} x={340} y={1560}>
        <div
          style={{
            width: 400,
            textAlign: "center",
            backgroundColor: COLORS.ink,
            color: COLORS.white,
            fontFamily: FONT,
            fontSize: 34,
            fontWeight: 700,
            padding: "18px 0",
            borderRadius: 50,
          }}
        >
          保存して見返す 🔖
        </div>
      </Fade>

      {/* 免責 */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 20,
          color: "#9AA3B2",
        }}
      >
        ※数字は一例。投資にはリスクがあり元本・利回りは保証されません。
      </div>
    </Background>
  );
};
