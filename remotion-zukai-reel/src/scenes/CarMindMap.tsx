import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Car,
  Wallet,
  Landmark,
  Percent,
  CalendarClock,
  ReceiptText,
  CircleX,
  TrendingDown,
  HandCoins,
  FileText,
  TrendingUp,
  PiggyBank,
} from "lucide-react";
import { FONT } from "../components/font";
import { COLORS } from "../theme";

const CONN = "#9AA3B2";
const GOOD = "#12A150";
const CANVAS_H = 2460;
export const CAR_MINDMAP_FRAMES = 900; // 30秒・ゆっくり

// 線を描き足す（ゆっくり）
const draw = (f: number, start: number, dur: number) => {
  const x = Math.max(0, Math.min(1, (f - start) / dur));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};
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

// アイコン＋小ラベル（参考モデルの配置：アイコンの下に小さめラベル中央寄せ）
const Node: React.FC<{
  cx: number;
  cy: number;
  Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>;
  label: React.ReactNode;
  delay: number;
  iconColor?: string;
  badge?: "check" | "cross";
  iconSize?: number;
}> = ({ cx, cy, Icon, label, delay, iconColor = COLORS.ink, badge, iconSize = 96 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.8 }, durationInFrames: 26 });
  const W = 260;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - W / 2,
        top: cy,
        width: W,
        opacity: Math.min(1, s * 1.4),
        transform: `translateY(${(1 - s) * 24}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div style={{ position: "relative" }}>
        <Icon size={iconSize} color={iconColor} strokeWidth={2.1} />
        {badge && (
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -14,
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: badge === "check" ? GOOD : COLORS.accent,
              color: "#fff",
              fontSize: 26,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {badge === "check" ? "✓" : "×"}
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 30,
          fontWeight: 700,
          color: COLORS.ink,
          textAlign: "center",
          lineHeight: 1.25,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const CarMindMap: React.FC = () => {
  const f = useCurrentFrame();

  // カメラのパン（下へ伸びるのを追う）
  const pan = interpolate(f, [260, 780], [0, -(CANVAS_H - 1920)], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* パンするキャンバス */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: CANVAS_H, transform: `translateY(${pan}px)` }}>
        {/* タイトル（キャンバス内・スクロールで上に抜ける） */}
        <div
          style={{
            position: "absolute",
            top: 40,
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
        <svg width="1080" height={CANVAS_H} style={{ position: "absolute", top: 0, left: 0 }}>
          {/* root → bus → 2枝 */}
          <DrawPath d="M540 300 L540 360" s={draw(f, 20, 20)} />
          <DrawPath d="M300 360 L780 360" s={draw(f, 40, 22)} />
          <DrawPath d="M300 360 L300 430" s={draw(f, 60, 16)} />
          <DrawPath d="M780 360 L780 430" s={draw(f, 60, 16)} />
          {/* 現金一括の縦チェーン */}
          <DrawPath d="M300 620 L300 700" s={draw(f, 150, 18)} />
          <DrawPath d="M300 850 L300 930" s={draw(f, 235, 18)} />
          {/* ローンの縦チェーン */}
          <DrawPath d="M780 620 L780 700" s={draw(f, 190, 18)} />
          <DrawPath d="M780 850 L780 930" s={draw(f, 285, 18)} />
          <DrawPath d="M780 1080 L780 1160" s={draw(f, 360, 18)} />
          {/* ローン → 運用スパイン（センターへ） */}
          <DrawPath d="M780 1330 L780 1400 L540 1400 L540 1470" s={draw(f, 430, 30)} c={COLORS.accent} w={6} />
          <DrawPath d="M540 1690 L540 1770" s={draw(f, 540, 20)} c={COLORS.accent} w={6} />
          <DrawPath d="M540 1990 L540 2060" s={draw(f, 620, 20)} c={COLORS.accent} w={6} />
        </svg>

        {/* ROOT */}
        <Node cx={540} cy={150} Icon={Car} label="500万円の車" delay={0} iconColor={COLORS.accent} iconSize={120} />

        {/* 左：現金一括チェーン */}
        <Node cx={300} cy={430} Icon={Wallet} label="現金一括" delay={70} />
        <Node cx={300} cy={700} Icon={PiggyBank} label={<span style={{ color: GOOD }}>利子は0円</span>} delay={160} iconColor={GOOD} badge="check" iconSize={84} />
        <Node cx={300} cy={930} Icon={CircleX} label="手元の現金が0に" delay={245} iconColor={COLORS.accent} badge="cross" iconSize={84} />
        <Node cx={300} cy={1160} Icon={TrendingDown} label={<span style={{ color: COLORS.accent }}>運用の機会を失う</span>} delay={330} iconColor={COLORS.accent} badge="cross" iconSize={84} />

        {/* 右：銀行ローンチェーン */}
        <Node cx={780} cy={430} Icon={Landmark} label="銀行ローン" delay={100} />
        <Node cx={780} cy={700} Icon={Percent} label="金利2%・10年" delay={200} iconSize={80} />
        <Node cx={780} cy={930} Icon={CalendarClock} label="月々 約4.6万円" delay={295} iconSize={80} />
        <Node cx={780} cy={1160} Icon={ReceiptText} label={<span>利息 <span style={{ color: COLORS.accent }}>＋約52万</span></span>} delay={370} iconSize={80} />

        {/* 運用スパイン（センター） */}
        <Node cx={540} cy={1470} Icon={HandCoins} label={<span>浮いた<span style={{ color: COLORS.accent }}>500万</span>を運用</span>} delay={450} iconColor={COLORS.accent} iconSize={92} />
        <Node cx={540} cy={1770} Icon={FileText} label="債券 5.2%（例）" delay={545} iconSize={88} />
        <Node cx={540} cy={2060} Icon={TrendingUp} label={<span>10年で <span style={{ color: GOOD }}>約830万</span></span>} delay={625} iconColor={GOOD} iconSize={92} />

        {/* 結果ハイライト */}
        <ResultBox delay={710} />

        {/* 免責（キャンバス内・最後に見える） */}
        <div
          style={{
            position: "absolute",
            top: 2360,
            width: "100%",
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 22,
            color: "#9AA3B2",
          }}
        >
          ※数字は一例。投資にはリスクがあり元本・利回りは保証されません。
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ResultBox: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.8 }, durationInFrames: 26 });
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 360,
        top: 2110,
        width: 720,
        padding: "26px 20px",
        backgroundColor: "#FFF3F1",
        border: `6px solid ${COLORS.accent}`,
        borderRadius: 24,
        textAlign: "center",
        fontFamily: FONT,
        opacity: Math.min(1, s * 1.4),
        transform: `scale(${s})`,
        transformOrigin: "center",
      }}
    >
      <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.ink }}>
        運用益 <span style={{ color: GOOD }}>＋330万</span> − 利息 <span style={{ color: COLORS.accent }}>52万</span>
      </div>
      <div style={{ fontSize: 62, fontWeight: 700, color: COLORS.accent, marginTop: 6 }}>＝ ＋270万 お得</div>
    </div>
  );
};
