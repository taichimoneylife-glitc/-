import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

// 効果音をファイル名で鳴らす。file＝public/sfx/ からのパス（拡張子つき）。例 "pop.wav" / "lab/up3.mp3"
// ルール：0秒ちょうどには鳴らさない（動画の頭の「ポン」は不自然）。声が主役なので音量は控えめ。
export const Sfx: React.FC<{ file: string; at: number; volume?: number }> = ({ file, at, volume = 0.2 }) => (
  <Sequence from={Math.max(1, at)} durationInFrames={120}>
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

// gain＝全部の効果音の音量をまとめて上下させるつまみ（1=そのまま, 0=無音）
export const SfxTrack: React.FC<{ cues: { file: string; at: number; volume?: number }[]; gain?: number }> = ({ cues, gain = 1 }) => (
  <>
    {cues.map((c, i) => (
      <Sfx key={i} file={c.file} at={c.at} volume={(c.volume ?? 0.2) * gain} />
    ))}
  </>
);
