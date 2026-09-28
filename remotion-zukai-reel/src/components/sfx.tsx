import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

// ── 効果音（public/sfx/*.mp3・効果音ラボ）を指定フレームで鳴らす ──
export type SfxName = "pop" | "swipe" | "correct" | "finish" | "count";

export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({ name, at, volume = 0.5 }) => (
  <Sequence from={at} durationInFrames={90}>
    <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
  </Sequence>
);

export const SfxTrack: React.FC<{ cues: { name: SfxName; at: number; volume?: number }[] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <Sfx key={i} name={c.name} at={c.at} volume={c.volume} />
    ))}
  </>
);
