import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

// ── 効果音（public/sfx/*.wav）を指定フレームで鳴らす ──
// 使い方: <Sfx name="pop" at={104} />  ／ ページ内ローカルフレームで指定
// 音源は scripts/gen-sfx.mjs で生成（pop / whoosh / tick / ding / success）。
export type SfxName = "pop" | "whoosh" | "tick" | "ding" | "success";

export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({ name, at, volume = 0.5 }) => (
  <Sequence from={at} durationInFrames={40}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

// 複数まとめて置く: <SfxTrack cues={[{name:'pop',at:104},{name:'tick',at:190}]} />
export const SfxTrack: React.FC<{ cues: { name: SfxName; at: number; volume?: number }[] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <Sfx key={i} name={c.name} at={c.at} volume={c.volume} />
    ))}
  </>
);
