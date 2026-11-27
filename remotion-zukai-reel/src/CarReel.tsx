import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { Slide } from "./components/Slide";
import { Background, Bubble, AccentWord } from "./components/Layout";
import { FadeUp, Pop } from "./components/Anim";
import { FONT } from "./components/font";
import { COLORS, TYPE, ZONE } from "./theme";
import {
  FlatCar,
  FlatCoin,
  FlatWallet,
  FlatBank,
  FlatChartUp,
  FlatBond,
  FlatScale,
  FlatArrow,
} from "./components/flatArt";

const DUR = 210; // 7秒/ページ
const TRANS = 22;

// 数値パネル（基準サイズ）
const StatBox: React.FC<{ rows: [string, string][]; delay?: number }> = ({ rows, delay = 70 }) => (
  <FadeUp delay={delay}>
    <div
      style={{
        backgroundColor: COLORS.white,
        border: `4px solid ${COLORS.ink}`,
        borderRadius: 18,
        padding: "26px 44px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minWidth: 560,
      }}
    >
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 40 }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: "#6C7A93" }}>{k}</span>
          <span style={{ fontSize: 46, fontWeight: 700, color: COLORS.ink }}>{v}</span>
        </div>
      ))}
    </div>
  </FadeUp>
);

const Big: React.FC<{ children: React.ReactNode; color?: string; delay: number }> = ({
  children,
  color = COLORS.accent,
  delay,
}) => (
  <FadeUp delay={delay}>
    <div style={{ fontFamily: FONT, fontSize: TYPE.big, fontWeight: 700, color }}>{children}</div>
  </FadeUp>
);

// つかみ
const Intro: React.FC = () => (
  <Background>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 56, paddingBottom: 200 }}>
      <FadeUp delay={8}>
        <div style={{ fontFamily: FONT, fontSize: TYPE.h1, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
          車は<span style={{ color: COLORS.accent }}>現金</span>？
          <span style={{ color: COLORS.accent }}>ローン</span>？
        </div>
      </FadeUp>
      <Pop delay={44}>
        <FlatCar size={560} />
      </Pop>
      <FadeUp delay={92}>
        <div style={{ fontFamily: FONT, fontSize: TYPE.h2, fontWeight: 700, textAlign: "center" }}>
          どっちが得か、数字で解説
        </div>
      </FadeUp>
    </AbsoluteFill>
  </Background>
);

// まとめ
const Outro: React.FC = () => {
  const steps = ["① 低金利で“長く”借りる", "② 使う現金は運用へ", "③ 堅実に“債券”で増やす"];
  return (
    <Background>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 34, paddingBottom: 120 }}>
        <Pop delay={10}>
          <FlatScale size={360} />
        </Pop>
        <FadeUp delay={48}>
          <div style={{ fontFamily: FONT, fontSize: TYPE.h1, fontWeight: 700, textAlign: "center" }}>
            <span style={{ color: COLORS.accent }}>“良い借金”</span>を味方に
          </div>
        </FadeUp>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {steps.map((t, i) => (
            <FadeUp key={t} delay={78 + i * 20}>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: TYPE.h2,
                  fontWeight: 700,
                  backgroundColor: "#fff",
                  border: `3px solid ${COLORS.ink}`,
                  borderRadius: 14,
                  padding: "16px 34px",
                  width: 660,
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                {t}
              </div>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={150}>
          <div style={{ backgroundColor: COLORS.accent, color: "#fff", fontFamily: FONT, fontSize: TYPE.h2, fontWeight: 700, padding: "18px 50px", borderRadius: 60 }}>
            保存＆フォローで復習
          </div>
        </FadeUp>
      </AbsoluteFill>
    </Background>
  );
};

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>{children}</div>
);

const POINTS: { badge: string; title: string; caption: string; children: React.ReactNode }[] = [
  {
    badge: "よくある誤解",
    title: "「現金一括」がお得？",
    caption: "利子はゼロ。でも“いつも最適”とは限らない",
    children: (
      <div style={{ position: "relative" }}>
        <Pop delay={44}>
          <FlatWallet size={460} />
        </Pop>
        <Bubble text="利子0円" delay={72} style={{ position: "absolute", right: -90, top: -60 }} />
        <AccentWord text="でも…" delay={94} style={{ position: "absolute", left: -120, bottom: -40 }} />
      </div>
    ),
  },
  {
    badge: "前提",
    title: "500万円の車で考える",
    caption: "一括だと、手元の現金が一気にゼロに",
    children: (
      <>
        <div style={{ position: "relative" }}>
          <Pop delay={44}>
            <FlatCar size={520} />
          </Pop>
          <div style={{ position: "absolute", left: -30, top: -20 }}>
            <Pop delay={62}>
              <FlatCoin size={120} />
            </Pop>
          </div>
        </div>
        <Big delay={82}>¥500万</Big>
      </>
    ),
  },
  {
    badge: "STEP①",
    title: "あえて銀行ローンで買う",
    caption: "なるべく低金利で“長く”借りるのがコツ",
    children: (
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Pop delay={44}>
          <FlatBank size={380} />
        </Pop>
        <Bubble text="低金利で長く" color={COLORS.accent} delay={62} style={{ position: "absolute", right: -50, top: -20 }} />
        <StatBox
          delay={82}
          rows={[
            ["金利", "2 %"],
            ["期間", "10 年"],
            ["毎月", "約 4.6 万円"],
            ["利息の合計", "約 52 万円"],
          ]}
        />
      </div>
    ),
  },
  {
    badge: "STEP②",
    title: "浮いた500万を運用へ",
    caption: "一気に使わず、“時間”を味方につける",
    children: (
      <Row>
        <Pop delay={44}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <FlatCoin size={150} />
            <div style={{ fontFamily: FONT, fontSize: TYPE.h2, fontWeight: 700, color: COLORS.accent }}>500万</div>
          </div>
        </Pop>
        <Pop delay={66}>
          <FlatArrow size={150} />
        </Pop>
        <Pop delay={88}>
          <FlatChartUp size={440} />
        </Pop>
      </Row>
    ),
  },
  {
    badge: "STEP③",
    title: "株より「債券」で堅実に",
    caption: "値動きを抑えて“増やす”（利回りは一例）",
    children: (
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <Pop delay={44}>
          <FlatBond size={360} />
        </Pop>
        <Bubble text="元本重視" color={COLORS.accent} delay={64} style={{ position: "absolute", left: -180, top: -30 }} />
        <FadeUp delay={84}>
          <div style={{ fontFamily: FONT, fontSize: TYPE.h2, fontWeight: 700, color: COLORS.ink }}>
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
    children: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Pop delay={44}>
          <FlatScale size={380} />
        </Pop>
        <StatBox
          delay={78}
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

export const CAR_REEL_FRAMES = (POINTS.length + 2) * DUR - (POINTS.length + 1) * TRANS;

export const CarReel: React.FC = () => {
  const scenes: React.ReactNode[] = [
    <Intro key="intro" />,
    ...POINTS.map((p) => (
      <Slide key={p.badge} badge={p.badge} title={p.title} caption={p.caption}>
        {p.children}
      </Slide>
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
