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

// ── 画像（public/gen/*.png・いらすとや）フロート付き ──
const GenImg: React.FC<{ name: string; x: number; y: number; w: number; delay?: number; flip?: boolean }> = ({ name, x, y, w, delay = 0, flip }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 13, stiffness: 140, mass: 0.9 }, durationInFrames: 16 });
  const bob = Math.sin((f / fps) * 2 * Math.PI * 0.3) * 5;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - Math.min(1, s)) * 18 + bob}px) scale(${Math.min(1, s)}) ${flip ? "scaleX(-1)" : ""}` }}>
      <Img src={staticFile(`gen/${name}.png`)} style={{ width: "100%", display: "block" }} />
    </div>
  );
};

// セクションごとの画像レイヤー（下帯）
const ImgFlow: React.FC = () => (
  <>
    <GenImg name="nisa_phone_bank" x={70} y={1220} w={300} delay={2} />
    <GenImg name="nisa_documents" x={400} y={1240} w={280} delay={10} />
    <GenImg name="nisa_bank_counter" x={720} y={1210} w={300} delay={18} />
  </>
);
const ImgPoint1: React.FC = () => (
  <>
    <GenImg name="nisa_husband_passed" x={150} y={1240} w={240} delay={4} />
    <GenImg name="nisa_wife_stand" x={680} y={1230} w={300} delay={10} />
  </>
);
const ImgPoint2: React.FC = () => (
  <>
    <GenImg name="nisa_bank_building" x={150} y={1230} w={320} delay={4} />
    <GenImg name="nisa_open_account" x={640} y={1230} w={320} delay={10} />
  </>
);
const ImgLoss: React.FC = () => (
  <>
    <GenImg name="nisa_mascot_worry" x={120} y={1250} w={300} delay={4} />
    <GenImg name="nisa_coin_down" x={660} y={1250} w={320} delay={10} />
  </>
);
const ImgGain: React.FC = () => (
  <>
    <GenImg name="nisa_mascot_happy" x={120} y={1250} w={300} delay={4} />
    <GenImg name="nisa_coin_up" x={660} y={1250} w={320} delay={10} />
  </>
);
const ImgMatome: React.FC = () => (
  <>
    <GenImg name="nisa_tell_family" x={60} y={1500} w={300} delay={2} />
    <GenImg name="nisa_couple" x={390} y={1500} w={300} delay={8} />
    <GenImg name="nisa_think" x={720} y={1510} w={300} delay={14} />
  </>
);

// 1ページ＝図解(上)＋画像(下)をまとめて時間配置
const Page: React.FC<{ page: number; Imgs: React.FC }> = ({ page, Imgs }) => (
  <AbsoluteFill>
    <NisaSozokuDesign page={page} />
    <Imgs />
  </AbsoluteFill>
);

export const NisaSozokuReel: React.FC<{ audio?: boolean; sfx?: boolean }> = ({ audio = true, sfx = true }) => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT, backgroundColor: "#FCFBF7" }}>
      <Sequence from={A.flow} durationInFrames={A.p1 - A.flow}><Page page={2} Imgs={ImgFlow} /></Sequence>
      <Sequence from={A.p1} durationInFrames={A.p2 - A.p1}><Page page={3} Imgs={ImgPoint1} /></Sequence>
      <Sequence from={A.p2} durationInFrames={A.g_loss - A.p2}><Page page={4} Imgs={ImgPoint2} /></Sequence>
      <Sequence from={A.g_loss} durationInFrames={A.g_gain - A.g_loss}><Page page={5} Imgs={ImgLoss} /></Sequence>
      <Sequence from={A.g_gain} durationInFrames={A.matome - A.g_gain}><Page page={6} Imgs={ImgGain} /></Sequence>
      <Sequence from={A.matome} durationInFrames={A.end - A.matome}><Page page={7} Imgs={ImgMatome} /></Sequence>

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
