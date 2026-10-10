import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { NisaSozokuDesign } from "./NisaSozokuDesign";

// ═══════════════════════════════════════════════════════════════════
// NISA 亡くなったら｜図解パート本番（アフレコ nisa_narration.wav 99.1s に同期）
//   冒頭フック・締めトークは実写で別撮り（この回は図解パートVOのみ）。
//   図解は NisaSozokuDesign のページを時間配置＋いらすとや画像＋効果音。
//   画像は下帯（y≈1200〜1600）に配置し、図解(上)とテロップ枠を分離＝被り防止。
// ═══════════════════════════════════════════════════════════════════
const FPS = 30;
const s2f = (s: number) => Math.round(s * FPS);
export const NISA_FRAMES = s2f(99.2) + 10;

// 音声アンカー（whisper セグメント開始＝セクション切替）
const A = {
  flow: 0,
  p1: s2f(8.48),
  p2: s2f(29.88),
  g_loss: s2f(44.64),
  g_gain: s2f(66.62),
  matome: s2f(78.82),
  souzokuzei: s2f(88.76),
  end: NISA_FRAMES,
};

// 1ページ＝図解のみ（イラストは図解の中に埋め込み済み・下帯なし）を時間配置
export const NisaSozokuReel: React.FC<{ audio?: boolean; sfx?: boolean }> = ({ audio = true, sfx = true }) => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT, backgroundColor: "#FCFBF7" }}>
      <Sequence from={A.flow} durationInFrames={A.p1 - A.flow}><NisaSozokuDesign page={2} /></Sequence>
      <Sequence from={A.p1} durationInFrames={A.p2 - A.p1}><NisaSozokuDesign page={3} /></Sequence>
      <Sequence from={A.p2} durationInFrames={A.g_loss - A.p2}><NisaSozokuDesign page={4} /></Sequence>
      <Sequence from={A.g_loss} durationInFrames={A.g_gain - A.g_loss}><NisaSozokuDesign page={5} /></Sequence>
      <Sequence from={A.g_gain} durationInFrames={A.matome - A.g_gain}><NisaSozokuDesign page={6} /></Sequence>
      <Sequence from={A.matome} durationInFrames={A.end - A.matome}><NisaSozokuDesign page={7} /></Sequence>

      {audio ? <Audio src={staticFile("nisa_narration.wav")} /> : null}
      {sfx ? <SfxTrack cues={[
        { file: "user/u05", at: A.flow + 2, volume: 0.38 },
        { file: "user/u03", at: A.p1, volume: 0.4 },        // 注意点へ
        { file: "user/u03", at: A.p2, volume: 0.4 },        // ②へ
        { file: "user/u03", at: A.g_loss, volume: 0.4 },    // ③へ
        { file: "user/u04", at: s2f(62.6), volume: 0.44 },  // 81万 課税キメ
        { file: "user/u06", at: A.g_gain, volume: 0.38 },   // 益へ
        { file: "user/u04", at: s2f(71.4), volume: 0.4 },   // 500万非課税
        { file: "user/u10", at: A.matome, volume: 0.42 },   // まとめ帯
        { file: "user/u02s", at: A.souzokuzei, volume: 0.34 }, // ちなみに相続税
        { file: "finish", at: A.end - 50, volume: 0.4 },
      ]} /> : null}
    </AbsoluteFill>
  );
};
