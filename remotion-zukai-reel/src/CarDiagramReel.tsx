import React from "react";
import { Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { PunchPage, PunchData, Kicker, Big, Em, Chip, Mark, Circled } from "./components/punchPage";
import { ChartPage, ChartData } from "./components/chartPage";
import { GrowthLine, CountUp } from "./components/animArt";
import { FlatVolatile, FlatRise } from "./components/flatArt";
import { COLORS } from "./theme";

const TRANS = 22;
const GOLD = "#F6C544";
const GREEN = "#12A150";
const GRAY = "#6C7A93";
const INK = COLORS.ink;
const RED = COLORS.accent;

// 2択チップ（現金/ローン、株/債券 等）。sub・◯✕バッジ対応
const Choice: React.FC<{ label: string; sub?: string; tone?: "plain" | "navy" | "gray"; badge?: "ok" | "ng" }> = ({ label, sub, tone = "plain", badge }) => {
  const bg = tone === "navy" ? INK : "#fff";
  const col = tone === "navy" ? "#fff" : tone === "gray" ? GRAY : INK;
  const bd = tone === "navy" ? INK : tone === "gray" ? GRAY : INK;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", backgroundColor: bg, color: col, border: `4px solid ${bd}`, borderRadius: 16, padding: "16px 34px", fontSize: 54, fontWeight: 700, whiteSpace: "nowrap" }}>
        {label}
        {badge && <div style={{ position: "absolute", top: -16, right: -16, width: 42, height: 42, borderRadius: "50%", backgroundColor: badge === "ok" ? GREEN : RED, color: "#fff", fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff" }}>{badge === "ok" ? "✓" : "×"}</div>}
      </div>
      {sub && <div style={{ fontSize: 32, fontWeight: 700, color: col === "#fff" ? INK : col }}>{sub}</div>}
    </div>
  );
};
const Row: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 44 }) => (
  <div style={{ display: "flex", gap, alignItems: "flex-start", justifyContent: "center" }}>{children}</div>
);

// C4用のミニ折れ線カード（株＝乱高下 / 債券＝右肩上がり）
const MiniChart: React.FC<{ label: string; art: React.ReactNode; badge: "ok" | "ng"; accent: string }> = ({ label, art, badge, accent }) => (
  <div style={{ position: "relative", width: 300 }}>
    <div style={{ border: `4px solid ${accent}`, borderRadius: 18, backgroundColor: "#fff", overflow: "hidden" }}>
      <div style={{ backgroundColor: accent, color: "#fff", fontSize: 40, fontWeight: 700, textAlign: "center", padding: "10px 0" }}>{label}</div>
      <div style={{ padding: "18px" }}>{art}</div>
    </div>
    <div style={{ position: "absolute", top: -18, right: -18, width: 48, height: 48, borderRadius: "50%", backgroundColor: badge === "ok" ? GREEN : RED, color: "#fff", fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #fff" }}>{badge === "ok" ? "✓" : "×"}</div>
  </div>
);

// ══ 音声(car-narration.m4a / 70.10秒)同期・7ページ ══
// 開始秒: P1:0 / P2:7.05 / P3:21.05 / C4:28.05 / P5a:33.05 / P5b:47.05 / P6:53.05 / 終:70.10

const P1: PunchData = {
  soft: true, card: true, gap: 34,
  items: [
    { node: <Kicker>500万円の車、どう買う？</Kicker>, d: 6 },
    { node: <Row gap={40}><Choice label="現金一括" tone="gray" /><Choice label="銀行ローン" tone="navy" badge="ok" /></Row>, d: 22 },
    { node: <Big size={92}>結論は <Circled startFrame={86} padX={26}><Em size={124}>“ローン”</Em></Circled></Big>, d: 62 },
  ],
};

const P2: PunchData = {
  soft: true, card: true, gap: 30,
  items: [
    { node: <Kicker>銀行ローン ｜ 金利2% ・ 10年</Kicker>, d: 6 },
    { node: <Big size={66}>車両500万 <Em color={GRAY}>＋</Em> 利息50万</Big>, d: 22 },
    { node: <Big size={84}>総支払 <Circled startFrame={86} padX={22}><Em color={RED} size={128}><CountUp to={550} startFrame={58} dur={30} suffix="万" /></Em></Circled></Big>, d: 50 },
    { node: <Kicker>利息50万は“損”に見えるけど…</Kicker>, d: 110 },
  ],
};

const P3: PunchData = {
  soft: true, card: true, gap: 34,
  items: [
    { node: <Kicker>元手の500万円を “運用” へ</Kicker>, d: 6 },
    { node: <Big size={100}>何で増やす？</Big>, d: 22 },
    { node: <Row gap={50}><Choice label="株？" /><Choice label="債券？" /></Row>, d: 52 },
  ],
};

const C4: PunchData = {
  soft: true, card: true, gap: 30,
  items: [
    { node: <Big size={80}>リスクは取りたくない</Big>, d: 6 },
    { node: <Row gap={40}><MiniChart label="株" art={<FlatVolatile size={230} />} badge="ng" accent={GRAY} /><MiniChart label="債券" art={<FlatRise size={230} />} badge="ok" accent={INK} /></Row>, d: 22 },
    { node: <Big size={90}><Circled startFrame={80} padX={22}><Em>安定的に</Em></Circled>増やす</Big>, d: 62 },
  ],
};

const P5a: PunchData = {
  soft: true, card: true, gap: 28,
  items: [
    { node: <Big size={72}>子育て世帯こそ</Big>, d: 6 },
    { node: <Big size={124} color={RED}><Mark>“計画的”に</Mark></Big>, d: 18 },
    { node: <Row gap={44}><Choice label="株" sub="暴落のリスク" tone="gray" badge="ng" /><Choice label="債券" sub="約束された資産" badge="ok" /></Row>, d: 44 },
    { node: <Kicker>教育・老後・特別費に備える</Kicker>, d: 78 },
  ],
};

const P5b: PunchData = {
  soft: true, card: true, gap: 24,
  items: [
    { node: <Kicker>しかも今、米国債は</Kicker>, d: 6 },
    { node: <GrowthLine size={520} startFrame={20} badge="5%" flag={false} />, d: 14 },
    { node: <Big size={96}>金利 <Circled startFrame={80} padX={24}><Em color={GOLD} size={132}>約5%</Em></Circled></Big>, d: 58 },
    { node: <Chip size={44}>実際に僕も<Em color={GOLD}>5%超え</Em>を保有</Chip>, d: 92 },
  ],
};

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
      だからトータルで<Em>“得”</Em>
    </>
  ),
  speed: 1,
};

const SCENES: React.ReactNode[] = [
  <PunchPage data={P1} />,
  <PunchPage data={P2} />,
  <PunchPage data={P3} />,
  <PunchPage data={C4} />,
  <PunchPage data={P5a} />,
  <PunchPage data={P5b} />,
  <ChartPage data={P6} />,
];

// 各ページ尺（音声の各セリフ開始秒から逆算）
export const PAGE_DURATIONS: number[] = [234, 442, 232, 172, 442, 202, 511];
const durOf = (i: number) => PAGE_DURATIONS[i] ?? 405;

export const NARRATION_SRC: string | null = "car-narration.m4a";

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
