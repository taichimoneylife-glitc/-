import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { PunchPage, PunchData, Kicker, Big, Em, Chip, Mark, Circled } from "./components/punchPage";
import { GrowthLine } from "./components/animArt";
import { FlatPiggy } from "./components/flatArt";
import { COLORS } from "./theme";

const GOLD = "#F6C544";
const GREEN = "#12A150";
const GRAY = "#6C7A93";
const INK = COLORS.ink;
const RED = COLORS.accent;

const MiniChip: React.FC<{ head: string; sub: string; ok: boolean }> = ({ head, sub, ok }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <div style={{ position: "relative", backgroundColor: "#fff", border: `4px solid ${ok ? INK : GRAY}`, borderRadius: 16, padding: "14px 30px", fontSize: 52, fontWeight: 700, color: ok ? INK : GRAY }}>
      {head}
      <div style={{ position: "absolute", top: -16, right: -16, width: 40, height: 40, borderRadius: "50%", backgroundColor: ok ? GREEN : RED, color: "#fff", fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff" }}>{ok ? "✓" : "×"}</div>
    </div>
    <div style={{ fontSize: 32, fontWeight: 700, color: ok ? INK : GRAY }}>{sub}</div>
  </div>
);

// 米国債5%（リッチ・パンチ型）
const USBOND: PunchData = {
  soft: true,
  card: true,
  gap: 26,
  items: [
    { node: <Kicker>しかも今、米国債は</Kicker>, d: 6 },
    { node: <GrowthLine size={560} startFrame={22} badge="5%" flag />, d: 14 },
    { node: <Big size={104}>金利 <Circled startFrame={96} padX={30} padY={8}><Em color={GOLD} size={148}>約5%</Em></Circled></Big>, d: 78 },
    { node: <Chip size={46}>実際に僕も<Em color={GOLD}>5%超え</Em>を保有</Chip>, d: 104 },
  ],
};

// 子育て世帯こそ計画的（リッチ・人物なし）
const KOSODATE: PunchData = {
  soft: true,
  card: true,
  gap: 24,
  items: [
    { node: <Big size={72}>子育て世帯こそ</Big>, d: 6 },
    { node: <Big size={128} color={RED}><Mark>“計画的”に</Mark></Big>, d: 16 },
    { node: <FlatPiggy size={250} />, d: 30 },
    {
      node: (
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
          <MiniChip head="株" sub="暴落のリスク" ok={false} />
          <MiniChip head="債券" sub="約束された資産" ok />
        </div>
      ),
      d: 52,
    },
    { node: <Kicker>教育・老後・特別費に備える</Kicker>, d: 78 },
  ],
};

const DUR = 300;
const TRANS = 22;
export const PROTO_FRAMES = 2 * DUR - TRANS;

export const Proto: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={DUR}>
      <PunchPage data={USBOND} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: TRANS })} />
    <TransitionSeries.Sequence durationInFrames={DUR}>
      <PunchPage data={KOSODATE} />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
