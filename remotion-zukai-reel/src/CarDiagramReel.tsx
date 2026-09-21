import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { DiagramPage, DiagramData } from "./components/diagram";
import { COLORS } from "./theme";

const DUR = 240; // 8秒/ページ（線をゆっくり描くぶん長め）
const TRANS = 22;
const A: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: COLORS.accent }}>{children}</span>;

const PAGES: DiagramData[] = [
  {
    header: { title: "500万円の車、どう買う？", sub: "現金一括 vs 銀行ローン" },
    boxes: [
      { label: "現金一括", variant: "outline" },
      { label: "銀行ローン", variant: "red" },
    ],
    statement: (
      <>
        トータルで<A>得</A>なのは？
      </>
    ),
    pill: "答え → ローンを組んで運用",
  },
  {
    header: { title: "銀行ローンで買うと", sub: "金利2% ・ 10年" },
    boxes: [
      { label: "総支払 550万", variant: "outline" },
      { label: "利息 50万", variant: "red" },
    ],
    statement: (
      <>
        利息は<A>たった約50万</A>
      </>
    ),
    note: "※金利2%・10年で組んだ場合",
  },
  {
    header: { title: "浮いた500万円を“運用”へ", sub: "手元に残さない" },
    boxes: [
      { label: "株？", variant: "outline" },
      { label: "債券？", variant: "outline" },
    ],
    statement: (
      <>
        答えは<A>“債券”</A>（安全資産）
      </>
    ),
    pill: "利息50万を絶対に減らさない",
  },
  {
    header: { title: "なぜ株じゃなく“債券”？" },
    boxes: [
      { label: "株", sub: "暴落もある＝不確定", variant: "outline", badge: "cross" },
      { label: "債券", sub: "10年後を“確定”できる", variant: "outline", badge: "check" },
    ],
    statement: (
      <>
        <A>確実に</A>増やして残す
      </>
    ),
    note: "子育て世帯は教育・老後資金を計画的に",
  },
  {
    header: { title: "10年後、どうなる？" },
    boxes: [{ label: "債券で 約810万", variant: "navy" }],
    statement: (
      <>
        − 総支払 <A>約550万</A>
      </>
    ),
    number: <>＝ ＋約260万円</>,
    pill: "利息 約50万 ＜ 運用益 約260万",
  },
  {
    header: { title: "結論" },
    boxes: [
      { label: "現金一括", variant: "outline", badge: "cross" },
      { label: "ローン＋運用", variant: "red", badge: "check" },
    ],
    statement: (
      <>
        トータルで<A>“得”</A>
      </>
    ),
    pill: "本文にまとめ ／ 保存＆フォロー",
  },
];

export const CAR_DIAGRAM_FRAMES = PAGES.length * DUR - (PAGES.length - 1) * TRANS;

export const CarDiagramReel: React.FC = () => {
  const children: React.ReactNode[] = [];
  PAGES.forEach((p, i) => {
    if (i > 0) {
      children.push(
        <TransitionSeries.Transition
          key={`t${i}`}
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANS })}
        />
      );
    }
    children.push(
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={DUR}>
        <DiagramPage data={p} />
      </TransitionSeries.Sequence>
    );
  });
  return <TransitionSeries>{children}</TransitionSeries>;
};
