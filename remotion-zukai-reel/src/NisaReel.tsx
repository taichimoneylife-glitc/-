import React from "react";
import { Series } from "remotion";
import { DURATIONS } from "./config";
import { NisaIntro } from "./scenes/NisaIntro";
import { NisaOutro } from "./scenes/NisaOutro";
import { TrapScene } from "./scenes/TrapScene";
import { Pop } from "./components/Anim";
import { Bubble } from "./components/Layout";
import {
  InfinityIcon,
  AnnualFrameIcon,
  SafeIcon,
  RecycleIcon,
} from "./components/nisaIcons";

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "relative" }}>{children}</div>
);

// ── 新NISAの4つのポイント ──
// 「TrapScene（バッジ→見出し→イラスト→キャプション）」をそのまま流用している。
// = 台本（テキスト）とイラストを差し替えるだけで別テーマの図解動画になる、という実例。
const POINTS = [
  {
    badge: "ポイント①",
    title: "非課税がずっと続く",
    caption: "保有期間は“無期限”（旧制度は5年・20年で終了）",
    illustration: (
      <Stage>
        <Pop delay={20}>
          <InfinityIcon size={320} />
        </Pop>
      </Stage>
    ),
  },
  {
    badge: "ポイント②",
    title: "年360万円まで投資できる",
    caption: "つみたて120万＋成長240万＝合計360万/年",
    illustration: (
      <Stage>
        <Pop delay={20}>
          <AnnualFrameIcon size={400} />
        </Pop>
        <Bubble
          text="併用OK"
          delay={34}
          style={{ position: "absolute", right: -30, top: -30 }}
        />
      </Stage>
    ),
  },
  {
    badge: "ポイント③",
    title: "生涯1,800万円が非課税",
    caption: "利益が出ても税金ゼロ（うち成長枠は最大1,200万）",
    illustration: (
      <Stage>
        <Pop delay={20}>
          <SafeIcon size={330} />
        </Pop>
      </Stage>
    ),
  },
  {
    badge: "ポイント④",
    title: "売っても枠が復活する",
    caption: "売却した分の非課税枠は“翌年”に戻って再利用できる",
    illustration: (
      <Stage>
        <Pop delay={20}>
          <RecycleIcon size={300} />
        </Pop>
      </Stage>
    ),
  },
];

export const NisaReel: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={DURATIONS.intro}>
        <NisaIntro />
      </Series.Sequence>

      {POINTS.map((p) => (
        <Series.Sequence key={p.badge} durationInFrames={DURATIONS.trap}>
          <TrapScene
            badge={p.badge}
            title={p.title}
            caption={p.caption}
            illustration={p.illustration}
          />
        </Series.Sequence>
      ))}

      <Series.Sequence durationInFrames={DURATIONS.outro}>
        <NisaOutro />
      </Series.Sequence>
    </Series>
  );
};
