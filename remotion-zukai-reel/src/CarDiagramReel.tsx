import React from "react";
import { Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { DiagramPage, DiagramData } from "./components/diagram";
import { ComparePage, CompareData } from "./components/comparePage";
import { FlatVolatile, FlatRise } from "./components/flatArt";
import { COLORS } from "./theme";

const DUR = 393; // 既定の1ページ尺。音声74.9秒 ÷ 6ページ ≒ 13.1秒/ページ（均等割りの下書き用）
const TRANS = 22;
const GOLD = "#F6C544";
const GRAY = "#6C7A93";
const A: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: COLORS.accent }}>{children}</span>;
// 帯の中で"キーワード"を大きく＆色替え（キリよく改行して使う）
const K: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontSize: 82, color: GOLD, display: "inline-block", marginTop: 6 }}>{children}</span>
);

// ── 通常ページ（連結図解） ──
const P1: DiagramData = {
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
  note: "※利息と運用益をトータルで比較",
  pill: "答え → ローンを組んで運用",
  footer: "選び方だけで数百万の差",
  speed: 0.6, // 尺が短い(7s)ので出現アニメを速める
};

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
  note: "※金利2%・10年で組んだ場合",
  pill: "利息は50万円",
  footer: "問題はここからの使い方",
};

const P3: DiagramData = {
  header: { title: "元手の500万円を“運用”へ", sub: "手元に残さない" },
  boxes: [
    { label: "株？", variant: "outline" },
    { label: "債券？", variant: "outline" },
  ],
  statement: (
    <>
      答えは<A>“債券”</A>
    </>
  ),
  note: "債券＝値動きの少ない“安全資産”",
  pill: (
    <>
      なぜ債券なのか
      <br />
      解説していきます
    </>
  ),
  speed: 0.6, // 尺が短い(7s)ので出現アニメを速める
};

// ── 4枚目：ビフォーアフター型（株 vs 債券 値動き比較） ──
const C4: CompareData = {
  header: { title: "なぜ株じゃなく“債券”？" },
  left: { label: "株", art: <FlatVolatile size={400} />, badge: "cross", accent: GRAY },
  right: { label: "債券", art: <FlatRise size={400} />, badge: "check", accent: COLORS.ink },
  statement: (
    <>
      <A>安定的に</A>増やす
    </>
  ),
  // 尺が5秒と短いので note/footer は省き、カード＋結論に絞る
  speed: 0.5,
};

// ── 5枚目：なぜ債券なのか（ライフプラン＋米国債） ──
const P5: DiagramData = {
  header: { title: "なぜ“債券”なのか", sub: "子育て世帯こそ計画的に" },
  boxes: [
    { label: "株", sub: "計画が狂う", variant: "outline", badge: "cross" },
    { label: "債券", sub: "約束された資産", variant: "outline", badge: "check" },
  ],
  statement: (
    <>
      将来を<A>計画的に</A>組める
    </>
  ),
  note: "教育・老後・車の買替など特別費に備える",
  pill: (
    <>
      米国債なら金利
      <br />
      <K>約5%</K>も魅力（※一例）
    </>
  ),
};

// ── 6枚目：結果の数字 ──
const P6: DiagramData = {
  header: { title: "10年後、どうなる？" },
  boxes: [{ label: "債券で 約810万", variant: "navy" }],
  statement: (
    <>
      − 総支払 <A>約550万</A>
    </>
  ),
  number: <>＝ ＋約260万円</>,
  note: "※満期にほぼ金額が確定する",
  pill: "利息50万 ＜ 運用益260万",
  footer: "利息を引いても大きく増える",
};

const SCENES: React.ReactNode[] = [
  <DiagramPage data={P1} />,
  <DiagramPage data={P2} />,
  <DiagramPage data={P3} />,
  <ComparePage data={C4} />,
  <DiagramPage data={P5} />,
  <DiagramPage data={P6} />,
];

// ── 各ページの尺（フレーム）──
// ナレーション音声に合わせてページごとに調整できるようにした。
// PAGE_DURATIONS を差し替えれば、そのページだけ長く/短くできる。
// null の要素は「均等割り」の既定値（DUR）を使う。
// ※ taichiさんの声に合わせて、下書きを見ながらこの数字を詰めていく。
// ▼ ナレーション音声（car-narration.m4a／重複カット済み70.10秒）の実測タイミングに確定。
//   文字起こし: public/car-narration.transcript.txt
//   各ページ開始秒 → P1:0.0 / P2:7.05 / P3:21.05 / C4:28.05 / P5:33.05 / P6:53.05 / 終:70.10
//   TransitionSeries の重なり(TRANS=22)を差し引いてフレーム尺を逆算した値。
export const PAGE_DURATIONS: (number | null)[] = [
  234, // P1 [0.0-7.05]   現金一括 vs ローン → 結論ローン
  442, // P2 [7.05-21.05] 金利2%10年・総支払550・問題はここから
  232, // P3 [21.05-28.05] 元手を運用へ・株か債券か
  172, // C4 [28.05-33.05] リスク取りたくない→安定の債券（5秒・短尺）
  622, // P5 [33.05-53.05] 子育て世帯こそ計画的・米国債5%
  511, // P6 [53.05-70.10] 10年後810万・トータルで得
];

const durOf = (i: number) => PAGE_DURATIONS[i] ?? DUR;

// 音声を鳴らすか（下書き確認用）。音声トラックを付けたMP4を書き出す。
export const NARRATION_SRC: string | null = "car-narration.m4a";

// 全体尺＝各ページ尺の合計 −（トランジションの重なり分）
export const CAR_DIAGRAM_FRAMES =
  SCENES.reduce((sum, _s, i) => sum + durOf(i), 0) - (SCENES.length - 1) * TRANS;

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
