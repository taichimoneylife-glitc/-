import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

// ── 効果音（public/sfx/*.mp3・効果音ラボ）をファイル名指定で鳴らす ──
// file = 拡張子なしのファイル名（例 "up3"）。音量は控えめ既定。
export const Sfx: React.FC<{ file: string; at: number; volume?: number }> = ({ file, at, volume = 0.22 }) => (
  <Sequence from={at} durationInFrames={130}>
    <Audio src={staticFile(`sfx/${file}.mp3`)} volume={volume} />
  </Sequence>
);

export const SfxTrack: React.FC<{ cues: { file: string; at: number; volume?: number }[] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <Sfx key={i} file={c.file} at={c.at} volume={c.volume} />
    ))}
  </>
);
