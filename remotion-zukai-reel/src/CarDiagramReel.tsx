import React from "react";
import { Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { DiagramPage, DiagramData } from "./components/diagram";
import { ComparePage, CompareData } from "./components/comparePage";
import { ChartPage, ChartData } from "./components/chartPage";
import { FlatVolatile, FlatRise, FlatCar, FlatBond, FlatWallet } from "./components/flatArt";
import { COLORS } from "./theme";

const TRANS = 22;
const GOLD = "#F6C544";
const GRAY = "#6C7A93";
const A: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: COLORS.accent }}>{children}</span>;
// 帯/結論の中で“キーワード”を大きく＆色替え
const K: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontSize: 96, color: GOLD, display: "inline-block", margin: "0 4px" }}>{children}</span>
);

// ══════════════════════════════════════════════════
//  音声(car-narration.m4a / 70.10秒)に完全同期した7ページ構成
//  文字起こし: public/car-narration.transcript.txt
// ══════════════════════════════════════════════════

// P1 [0.0-7.05] 現金一括かローンか → 結論ローン
const P1: DiagramData = {
  header: { title: "500万円の車、どう買う？" },
  boxes: [
    { label: "現金一括", variant: "outline" },
    { label: "銀行ローン", fill: COLORS.ink, badge: "check" },
  ],
  statement: (
    <>
      結論は<A>“ローン”</A>
    </>
  ),
  art: <FlatCar size={330} />,
  speed: 0.7,
};

// P2 [7.05-21.05] 金利2%10年・車両500+利息50=総支払550
const P2: DiagramData = {
  header: { title: "銀行ローンで買うと", sub: "金利2% ・ 10年" },
  boxes: [
    { label: "車両 500万", variant: "outline" },
    { label: "利息 50万", variant: "red" },
  ],
  statement: (
    <>
      総支払は<A>約550万</A>
    </>
  ),
  note: "利息の50万円は“損”に見えるけど…",
  art: <FlatWallet size={150} />,
  pos: { note: { dy: 54 } },
  speed: 1,
};

// P3 [21.05-28.05] 元手500万を運用へ・株か債券か
const P3: DiagramData = {
  header: { title: "元手の500万円を“運用”へ" },
  boxes: [
    { label: "株？", variant: "outline" },
    { label: "債券？", variant: "outline" },
  ],
  statement: <>何で増やす？</>,
  art: <FlatWallet size={230} />,
  speed: 0.7,
};

// C4 [28.05-33.05] リスク取りたくない → 安定の債券（5秒・短尺）
const C4: CompareData = {
  header: { title: "リスクは取りたくない" },
  left: { label: "株", art: <FlatVolatile size={360} />, badge: "cross", accent: GRAY },
  right: { label: "債券", art: <FlatRise size={360} />, badge: "check", accent: COLORS.ink },
  statement: (
    <>
      <A>安定的に</A>増やす
    </>
  ),
  speed: 0.5,
};

// P5a [33.05-47.05] 子育て世帯こそ計画的・株暴落 vs 債券は約束
const P5a: DiagramData = {
  header: { title: "子育て世帯こそ“計画的”に" },
  boxes: [
    { label: "株", sub: "暴落のリスク", variant: "outline", badge: "cross" },
    { label: "債券", sub: "約束された資産", variant: "outline", badge: "check" },
  ],
  statement: (
    <>
      将来を<A>計画的に</A>組める
    </>
  ),
  note: "教育資金・老後資金・特別費に備える",
  speed: 1,
};

// P5b [47.05-53.05] 米国債は金利約5%・僕も保有
const P5b: DiagramData = {
  header: { title: "しかも今、米国債は" },
  statement: (
    <>
      金利<K>約5%</K>
    </>
  ),
  art: <FlatBond size={280} />,
  fs: { stmt: 92 },
  speed: 0.7,
};

// P6 [53.05-70.10] 10年後どうなる？ 810万 vs 550万 → +260万
const P6: ChartData = {
  header: { title: "10年後、どうなる？" },
  result: { base: 550, delta: 260, topLabel: "約810万", caption: "債券で10年運用" },
  compare: { value: 550, topLabel: "550万", caption: "車の総支払い" },
  deltaCallout: "＋260万",
  pill: (
    <>
      利息50万 <span style={{ color: GOLD }}>＜</span> 運用益260万
    </>
  ),
  footer: (
    <>
      だからトータルで<A>“得”</A>
    </>
  ),
  speed: 1,
};

const SCENES: React.ReactNode[] = [
  <DiagramPage data={P1} />,
  <DiagramPage data={P2} />,
  <DiagramPage data={P3} />,
  <ComparePage data={C4} />,
  <DiagramPage data={P5a} />,
  <DiagramPage data={P5b} />,
  <ChartPage data={P6} />,
];

// ── 各ページの尺（フレーム）＝音声の各ページ開始秒から逆算 ──
//  開始秒: P1:0 / P2:7.05 / P3:21.05 / C4:28.05 / P5a:33.05 / P5b:47.05 / P6:53.05 / 終:70.10
export const PAGE_DURATIONS: number[] = [234, 442, 232, 172, 442, 202, 511];

const durOf = (i: number) => PAGE_DURATIONS[i] ?? 405;

// 音声トラック（重複カット済み・70.10秒）
export const NARRATION_SRC: string | null = "car-narration.m4a";

export const CAR_DIAGRAM_FRAMES =
  SCENES.reduce<number>((sum, _s, i) => sum + durOf(i), 0) - (SCENES.length - 1) * TRANS;

export const CarDiagramReel: React.FC = () => {
  const children: React.ReactNode[] = [];
  SCENES.forEach((scene, i) => {
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
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={durOf(i)}>
        {scene}
      </TransitionSeries.Sequence>
    );
  });
  return (
    <>
      {NARRATION_SRC ? <Audio src={staticFile(NARRATION_SRC)} /> : null}
      <TransitionSeries>{children}</TransitionSeries>
    </>
  );
};
