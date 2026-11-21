import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { F, count, num } from "../lib/anim";
import { FONT, K, SER } from "../lib/font";
import { Board, Stepper, type Panel, type Stop } from "../diagram/board";
import { Callout, Spot } from "../diagram/cam";
import { T } from "../diagram/theme";
import { Card, Chip, Head } from "../diagram/parts";

// ════════════════════════════════════════════════════════════
//  「1枚の大きな地図」型のページ送りの見本（順番のある話＝STEP1〜3 に使う）
//  ・ページを変える時：縮む → 点線に沿って流れる → 戻る（約0.7秒）
//  ・最後に地図全体まで引いて、ここまでの全部を見せる
//  ・左下に進み具合（Stepper）。注目はスポット（Spot）と引き出し線（Callout）
// ════════════════════════════════════════════════════════════
const S1: React.FC = () => (
  <>
    <Head at={0.3} pill="STEP 1" title="まず、今を知る" c={T.red} />
    <Card at={1.0} x={140} y={450} w={800} h={170} c={T.ink} g="¥" label="毎月の固定費" big={80}>12<span style={{ fontSize: 40 }}>万円</span></Card>
    <Spot at={2.2} until={3.6} rect={[140, 450, 800, 170]} />
  </>
);
const S2: React.FC = () => {
  return (
    <>
      <Head at={4.2} pill="STEP 2" title="大きい順に見る" c={T.red} />
      {["住まい", "保険", "スマホ"].map((s, i) => <Chip key={s} at={4.8 + i * 0.4} c={T.ink} style={{ left: 0, right: 0, top: 460 + i * 130, textAlign: "center" }} fs={44}>{s}</Chip>)}
      <Callout at={6.4} from={[640, 620]} to={[780, 860]}>ここが<span style={{ ...SER, color: T.red }}>伸びしろ</span></Callout>
    </>
  );
};
const S3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Head at={8.2} pill="STEP 3" title="1つだけ変える" c={T.red} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", ...SER, fontSize: 150, color: T.red }}>{num(count(f, 8.8, 5000, 0.6))}<span style={{ ...K, fontSize: 60 }}>円/月</span></div>
    </>
  );
};
const IDS = ["s1", "s2", "s3"];
const PAGES: Record<string, React.FC> = { s1: S1, s2: S2, s3: S3 };
const PANELS: Panel[] = [{ id: "s1", col: 0, row: 0 }, { id: "s2", col: 1, row: 0 }, { id: "s3", col: 1, row: 1 }];
const STOPS: Stop[] = [{ id: "s1", trans: 0 }, { id: "s2", trans: 3.9, kind: "kick" }, { id: "s3", trans: 7.9, kind: "kick" }, { id: "__map", trans: 11.0, scale: 0.26 }];
export const BOARD_FRAMES = F(13.5);
export const BoardExample: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT, background: T.paper }}>
    <Board panels={PANELS} stops={STOPS} links={[["s1", "s2"], ["s2", "s3"]]} paper={{ background: T.paper, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${T.line} 62px 64px)` }}>
      {(id) => { const C = PAGES[id]; return <AbsoluteFill><C /></AbsoluteFill>; }}
    </Board>
    <Stepper labels={["今", "順番", "変える"]} steps={[0.3, 4.2, 8.2]} x={40} y={1180} />
  </AbsoluteFill>
);
