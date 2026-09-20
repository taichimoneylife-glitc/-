import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { Background, Bubble } from "./components/Layout";
import { FadeUp, Pop } from "./components/Anim";
import { TrapScene } from "./scenes/TrapScene";
import { FONT } from "./components/font";
import { COLORS } from "./theme";
import {
  CarIcon,
  BankIcon,
  ArrowRight,
  ChartUpIcon,
  ScaleIcon,
  BondIcon,
} from "./components/carIcons";

const DUR = 140; // 各シーンの長さ
const TRANS = 14; // 切替（プッ）の長さ

// 小さな数値パネル（金利・年数など）
const StatBox: React.FC<{ rows: [string, string][]; delay?: number }> = ({
  rows,
  delay = 30,
}) => (
  <FadeUp delay={delay}>
    <div
      style={{
        backgroundColor: COLORS.white,
        border: `4px solid ${COLORS.ink}`,
        borderRadius: 16,
        padding: "22px 34px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 420,
      }}
    >
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 30 }}>
          <span style={{ fontSize: 34, fontWeight: 700, color: "#6C7A93" }}>{k}</span>
          <span style={{ fontSize: 38, fontWeight: 700, color: COLORS.ink }}>{v}</span>
        </div>
      ))}
    </div>
  </FadeUp>
);

// つかみ
const Intro: React.FC = () => (
  <Background>
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 48, padding: 80 }}>
      <FadeUp delay={4}>
        <div style={{ fontSize: 64, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
          車は<span style={{ color: COLORS.accent }}>現金</span>？
          <span style={{ color: COLORS.accent }}>ローン</span>？
        </div>
      </FadeUp>
      <Pop delay={20}>
        <CarIcon size={360} />
      </Pop>
      <FadeUp delay={34}>
        <div style={{ fontSize: 52, fontWeight: 700, textAlign: "center" }}>
          どっちがお得か、解説します
        </div>
      </FadeUp>
    </AbsoluteFill>
  </Background>
);

// まとめ
const Outro: React.FC = () => {
  const recap = ["① 低金利で“長く”借りる", "② 使う予定の現金は運用へ", "③ 堅実に債券で増やす"];
  return (
    <Background>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 38, padding: 70 }}>
        <Pop delay={2}>
          <ScaleIcon size={230} />
        </Pop>
        <FadeUp delay={16}>
          <div style={{ fontSize: 54, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
            <span style={{ color: COLORS.accent }}>“良い借金”</span>を味方につける
          </div>
        </FadeUp>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {recap.map((t, i) => (
            <FadeUp key={t} delay={26 + i * 6}>
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  backgroundColor: COLORS.white,
                  border: `3px solid ${COLORS.ink}`,
                  borderRadius: 12,
                  padding: "14px 30px",
                  width: 620,
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                {t}
              </div>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={48}>
          <div
            style={{
              backgroundColor: COLORS.accent,
              color: COLORS.white,
              fontSize: 42,
              fontWeight: 700,
              padding: "18px 48px",
              borderRadius: 60,
            }}
          >
            保存＆フォローで復習
          </div>
        </FadeUp>
        <FadeUp delay={56}>
          <div style={{ fontSize: 23, color: "#6C7A93", textAlign: "center", lineHeight: 1.5 }}>
            ※数字は一例です。投資には価格変動・為替等のリスクがあり、
            <br />
            元本や利回りは保証されません。判断はご自身の責任で。
          </div>
        </FadeUp>
      </AbsoluteFill>
    </Background>
  );
};

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>{children}</div>
);

// 6つのポイント（TrapScene を流用）
const POINTS: {
  badge: string;
  title: string;
  caption: string;
  illustration: React.ReactNode;
}[] = [
  {
    badge: "よくある誤解",
    title: "「現金一括」がお得？",
    caption: "利子はゼロ。でも“いつも最適”とは限らない",
    illustration: (
      <div style={{ position: "relative" }}>
        <Pop delay={20}>
          <CarIcon size={340} />
        </Pop>
        <Bubble text="利子0円" delay={34} style={{ position: "absolute", right: -60, top: -50 }} />
      </div>
    ),
  },
  {
    badge: "前提",
    title: "500万円の車で考える",
    caption: "一括で払うと、手元の現金は一気にゼロに",
    illustration: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Pop delay={20}>
          <CarIcon size={360} />
        </Pop>
        <FadeUp delay={32}>
          <div style={{ fontSize: 64, fontWeight: 700, color: COLORS.accent }}>¥500万</div>
        </FadeUp>
      </div>
    ),
  },
  {
    badge: "STEP①",
    title: "あえて銀行ローンで買う",
    caption: "なるべく低金利で“長く”借りるのがコツ",
    illustration: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <Pop delay={18}>
          <BankIcon size={230} />
        </Pop>
        <StatBox
          delay={30}
          rows={[
            ["金利", "2 %"],
            ["期間", "10 年"],
            ["毎月", "約 46,000 円"],
            ["利息の合計", "約 52 万円"],
          ]}
        />
      </div>
    ),
  },
  {
    badge: "STEP②",
    title: "浮いた500万円を運用へ",
    caption: "一気に使わず、“時間”を味方につける",
    illustration: (
      <Row>
        <Pop delay={20}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <CarIcon size={180} />
            <div style={{ fontSize: 34, fontWeight: 700, color: COLORS.accent }}>¥500万</div>
          </div>
        </Pop>
        <Pop delay={30}>
          <ArrowRight size={110} />
        </Pop>
        <Pop delay={38}>
          <ChartUpIcon size={240} />
        </Pop>
      </Row>
    ),
  },
  {
    badge: "STEP③",
    title: "株より「債券」で堅実に",
    caption: "値動きを抑えて“増やす”（利回りは一例）",
    illustration: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Pop delay={20}>
          <BondIcon size={280} />
        </Pop>
        <FadeUp delay={34}>
          <div style={{ fontSize: 40, fontWeight: 700, color: COLORS.ink }}>
            10年で <span style={{ color: COLORS.accent }}>約830万</span> に
          </div>
        </FadeUp>
      </div>
    ),
  },
  {
    badge: "結果",
    title: "トータル約270万円お得",
    caption: "同じ車でも“手残り”がこれだけ変わる",
    illustration: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <Pop delay={16}>
          <ScaleIcon size={240} />
        </Pop>
        <StatBox
          delay={30}
          rows={[
            ["運用の利益", "＋約330万"],
            ["ローン利息", "－約52万"],
            ["差し引き", "＋約270万"],
          ]}
        />
      </div>
    ),
  },
];

export const CAR_TOTAL_FRAMES = (POINTS.length + 2) * DUR - (POINTS.length + 1) * TRANS;

export const CarLoanReel: React.FC = () => {
  const scenes: React.ReactNode[] = [
    <Intro key="intro" />,
    ...POINTS.map((p) => (
      <TrapScene
        key={p.badge}
        badge={p.badge}
        title={p.title}
        caption={p.caption}
        illustration={p.illustration}
      />
    )),
    <Outro key="outro" />,
  ];

  const children: React.ReactNode[] = [];
  scenes.forEach((s, i) => {
    if (i > 0) {
      children.push(
        <TransitionSeries.Transition
          key={`t${i}`}
          presentation={slide({ direction: i % 2 === 0 ? "from-left" : "from-right" })}
          timing={linearTiming({ durationInFrames: TRANS })}
        />
      );
    }
    children.push(
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={DUR}>
        {s}
      </TransitionSeries.Sequence>
    );
  });

  return <TransitionSeries>{children}</TransitionSeries>;
};
