import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Car,
  Wallet,
  Landmark,
  CalendarClock,
  HandCoins,
  FileText,
  TrendingUp,
  PiggyBank,
} from "lucide-react";
import { Background } from "../components/Layout";
import { FONT } from "../components/font";
import { COLORS } from "../theme";

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
        borderRadius: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        textAlign: "center",
        boxSizing: "border-box",
        padding: "10px 18px",
        color: COLORS.ink,
        fontWeight: 700,
      }}
    >
      {children}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: -18,
            right: -18,
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: badge === "check" ? GOOD : COLORS.accent,
            color: COLORS.white,
            fontSize: 26,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `3px solid ${COLORS.white}`,
          }}
        >
          {badge === "check" ? "✓" : "×"}
        </div>
      )}
    </div>
  );
};

export const CAR_MINDMAP_FRAMES = 320;

export const CarMindMap: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <Background>
      <div
        style={{
          position: "absolute",
          top: 60,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 50,
          fontWeight: 700,
          color: COLORS.ink,
        }}
      >
        車は<span style={{ color: COLORS.accent }}>現金 or ローン</span>？
      </div>

      {/* 接続線レイヤー */}
      <AbsoluteFill>
        <svg width="1080" height="1920" style={{ position: "absolute" }}>
          <DrawPath d="M540 260 L540 315" s={draw(f, 10, 10)} />
          <DrawPath d="M300 315 L790 315" s={draw(f, 20, 14)} />
          <DrawPath d="M300 315 L300 372" s={draw(f, 32, 8)} />
          <DrawPath d="M790 315 L790 360" s={draw(f, 32, 8)} />
          {/* 現金一括の枝 */}
          <DrawPath d="M300 476 L300 528" s={draw(f, 46, 8)} />
          <DrawPath d="M300 638 L300 700" s={draw(f, 62, 8)} />
          {/* ローンの枝 */}
          <DrawPath d="M790 500 L790 540" s={draw(f, 46, 8)} />
          <DrawPath d="M790 660 L790 720" s={draw(f, 66, 8)} />
          {/* ローン → 運用スパイン */}
          <DrawPath d="M790 812 L790 862 L540 862 L540 918" s={draw(f, 86, 16)} c={COLORS.accent} w={5} />
          <DrawPath d="M540 1022 L540 1088" s={draw(f, 104, 8)} c={COLORS.accent} w={5} />
          <DrawPath d="M540 1208 L540 1268" s={draw(f, 122, 8)} c={COLORS.accent} w={5} />
        </svg>
      </AbsoluteFill>

      {/* ROOT */}
      <Node cx={540} cy={200} w={380} h={116} delay={0} border={COLORS.accent} bg={COLORS.accent}>
        <Car color={COLORS.white} size={58} strokeWidth={2.2} />
        <div style={{ color: COLORS.white }}>
          <div style={{ fontSize: 44 }}>500万円の車</div>
          <div style={{ fontSize: 25, opacity: 0.92 }}>どう買うのが得？</div>
        </div>
      </Node>

      {/* 左：現金一括 */}
      <Node cx={300} cy={424} w={280} h={104} delay={16}>
        <Wallet color={COLORS.ink} size={46} strokeWidth={2.2} />
        <div>
          <div style={{ fontSize: 24, color: "#6C7A93" }}>選択A</div>
          <div style={{ fontSize: 38 }}>現金一括</div>
        </div>
      </Node>
      <Node cx={300} cy={583} w={270} h={100} delay={48} border={GOOD} badge="check">
        <div style={{ fontSize: 34 }}>利子は0円</div>
      </Node>
      <Node cx={300} cy={772} w={290} h={132} delay={64} border={COLORS.accent} badge="cross">
        <div>
          <div style={{ fontSize: 33, color: COLORS.accent }}>現金が一気に0</div>
          <div style={{ fontSize: 23, marginTop: 6 }}>運用のチャンスを失う</div>
        </div>
      </Node>

      {/* 右：銀行ローン */}
      <Node cx={790} cy={430} w={300} h={140} delay={22}>
        <Landmark color={COLORS.ink} size={50} strokeWidth={2.2} />
        <div>
          <div style={{ fontSize: 24, color: "#6C7A93" }}>選択B</div>
          <div style={{ fontSize: 36 }}>銀行ローン</div>
          <div style={{ fontSize: 25, color: COLORS.accent }}>金利2%・10年</div>
        </div>
      </Node>
      <Node cx={790} cy={598} w={330} h={124} delay={48} bg="#F7F4F6">
        <CalendarClock color={COLORS.ink} size={46} strokeWidth={2.2} />
        <div style={{ fontSize: 29, lineHeight: 1.5 }}>
          月々 <b>約46,000円</b>
          <br />
          利息 <b style={{ color: COLORS.accent }}>＋約52万</b>
        </div>
      </Node>
      <Node cx={790} cy={772} w={320} h={100} delay={66} border={COLORS.accent}>
        <HandCoins color={COLORS.accent} size={46} strokeWidth={2.2} />
        <div style={{ fontSize: 31 }}>
          浮いた<b style={{ color: COLORS.accent }}>500万</b>を運用
        </div>
      </Node>

      {/* 運用スパイン */}
      <Node cx={540} cy={972} w={360} h={110} delay={92} bg="#F7F4F6">
        <FileText color={COLORS.ink} size={48} strokeWidth={2.2} />
        <div style={{ fontSize: 32 }}>
          株より<b>債券</b>で堅実
          <div style={{ fontSize: 27, color: COLORS.accent }}>利回り5.2%（例）</div>
        </div>
      </Node>
      <Node cx={540} cy={1148} w={380} h={110} delay={108}>
        <TrendingUp color={GOOD} size={50} strokeWidth={2.4} />
        <div style={{ fontSize: 34 }}>
          10年で <b style={{ color: GOOD }}>約830万</b>に
        </div>
      </Node>

      {/* 結果ハイライト */}
      <Node cx={540} cy={1380} w={700} h={210} delay={124} border={COLORS.accent} bg="#FFF3F1">
        <PiggyBank color={COLORS.accent} size={92} strokeWidth={2.2} />
        <div>
          <div style={{ fontSize: 31, color: COLORS.ink }}>
            運用益 <b style={{ color: GOOD }}>＋330万</b> − 利息 <b style={{ color: COLORS.accent }}>52万</b>
          </div>
          <div style={{ fontSize: 58, color: COLORS.accent, marginTop: 6 }}>＝ ＋270万 お得</div>
        </div>
      </Node>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          top: 1600,
          width: "100%",
          textAlign: "center",
          opacity: draw(f, 150, 16),
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: COLORS.ink,
            color: COLORS.white,
            fontFamily: FONT,
            fontSize: 34,
            fontWeight: 700,
            padding: "18px 46px",
            borderRadius: 50,
          }}
        >
          保存して見返す
        </div>
      </div>

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
