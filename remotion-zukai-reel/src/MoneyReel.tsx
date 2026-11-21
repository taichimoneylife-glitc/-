import React from "react";
import { Series } from "remotion";
import { DURATIONS } from "./config";
import { Intro } from "./scenes/Intro";
import { IntroFootage } from "./scenes/IntroFootage";
import { Outro } from "./scenes/Outro";
import { TrapScene } from "./scenes/TrapScene";
import { Pop } from "./components/Anim";
import { Bubble, AccentWord } from "./components/Layout";
import {
  PhoneIcon,
  PriceTagIcon,
  CartIcon,
  SleepyFaceIcon,
} from "./components/icons";
import { COLORS } from "./theme";

// 中央イラストの共通ラッパ（相対配置の起点）
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "relative" }}>{children}</div>
);

// 「4つの罠」データ。ここを増減すれば本数を変えられる（config.ts の TRAP_COUNT も合わせる）。
const TRAPS = [
  {
    badge: "罠①",
    title: "「なんとなく欲しい」で買う",
    caption: "目的がないのに“ポチッ”としてしまう",
    illustration: (
      <Stage>
        <Pop delay={20}>
          <PhoneIcon size={300} />
        </Pop>
        <Bubble
          text="なんとなく"
          delay={30}
          style={{ position: "absolute", left: -170, top: 20 }}
        />
        <AccentWord
          text="ポチッ"
          delay={38}
          style={{ position: "absolute", right: -120, bottom: 90 }}
        />
      </Stage>
    ),
  },
  {
    badge: "罠②",
    title: "「安いから」で買う",
    caption: "元の値段と比べて“得した気”になるだけ",
    illustration: (
      <Stage>
        <Pop delay={20}>
          <PriceTagIcon size={380} />
        </Pop>
        <Bubble
          text="今だけ半額"
          color={COLORS.accent}
          delay={34}
          style={{ position: "absolute", right: -40, top: -40 }}
        />
      </Stage>
    ),
  },
  {
    badge: "罠③",
    title: "「ついでに」買う",
    caption: "気軽な買い物で予定外の出費が積み上がる",
    illustration: (
      <Stage>
        <Pop delay={20}>
          <CartIcon size={360} />
        </Pop>
        <Bubble
          text="ついでに…"
          delay={32}
          style={{ position: "absolute", left: -150, top: -10 }}
        />
      </Stage>
    ),
  },
  {
    badge: "罠④",
    title: "「ストレス発散」で買う",
    caption: "満たされるのは買った“その瞬間”だけ",
    illustration: (
      <Stage>
        <Pop delay={20}>
          <SleepyFaceIcon size={300} />
        </Pop>
        <AccentWord
          text="ポチッ"
          delay={34}
          style={{ position: "absolute", right: -110, top: -10 }}
        />
        <Bubble
          text="はぁ…"
          delay={42}
          style={{ position: "absolute", left: -120, bottom: 30 }}
        />
      </Stage>
    ),
  },
];

// ── リール本編：Intro → 罠①〜④ → Outro を時系列に並べる ──
// footageIntro=true で冒頭を実写クリップ（public/intro.mp4）＋テロップに切替。
export const MoneyReel: React.FC<{ footageIntro?: boolean }> = ({
  footageIntro = false,
}) => {
  return (
    <Series>
      <Series.Sequence durationInFrames={DURATIONS.intro}>
        {footageIntro ? <IntroFootage /> : <Intro />}
      </Series.Sequence>

      {TRAPS.map((t) => (
        <Series.Sequence key={t.badge} durationInFrames={DURATIONS.trap}>
          <TrapScene
            badge={t.badge}
            title={t.title}
            caption={t.caption}
            illustration={t.illustration}
          />
        </Series.Sequence>
      ))}

      <Series.Sequence durationInFrames={DURATIONS.outro}>
        <Outro />
      </Series.Sequence>
    </Series>
  );
};
