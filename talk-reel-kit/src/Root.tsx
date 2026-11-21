import React from "react";
import { Composition, staticFile } from "remotion";
import "./lib/font";
import { TalkReel, type TalkProps } from "./talk/TalkReel";
import { PLAN } from "./talk/plan";
import type { Words } from "./talk/types";
import { BoardExample, BOARD_FRAMES } from "./examples/BoardExample";

const FPS = 30;
const EMPTY: Words = { duration: 5, words: [] };

export const RemotionRoot: React.FC = () => (
  <>
    {/* トークリール：長さは words.json の duration から自動 */}
    <Composition
      id="TalkReel"
      component={TalkReel}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={150}
      defaultProps={{ plan: PLAN, data: EMPTY } as TalkProps}
      calculateMetadata={async ({ props }) => {
        const data: Words = await fetch(staticFile(props.plan.words)).then((r) => r.json());
        return { durationInFrames: Math.max(30, Math.ceil(data.duration * FPS)), props: { ...props, data } };
      }}
    />
    {/* おまけ：図解だけの見本（ページ送り・スポット・引き出し線の動き） */}
    <Composition id="BoardExample" component={BoardExample} fps={FPS} width={1080} height={1920} durationInFrames={BOARD_FRAMES} />
  </>
);
