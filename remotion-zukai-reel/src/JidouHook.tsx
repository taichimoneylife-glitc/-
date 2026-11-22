import React from "react";
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { K, SER, F } from "./components/marke";
import { GenSlot } from "./MileLifePlan";
import { SfxTrack } from "./components/sfx";
import { JidouTreeReel, JIDOU_TREE_FRAMES } from "./JidouTreeReel";

// ════════════════════════════════════════════════════════════════════
//  児童手当：冒頭のトーク（6秒）＝ 下に話しているたいち／上に図解（話す言葉に合わせて図解が組み上がる）
//  上の図解は本編（JidouTreeReel）の最初の形「わが家の児童手当 → ？が4つ」まで作って、そのまま本編へつながる
//  元の動画は胸に白い文字が焼き付いている → 顔の範囲（y150〜1110）だけを下半分に映す
//  色：iPhoneのHDRを普通の色に変換した public/jidou-hook.mp4 を使う
// ════════════════════════════════════════════════════════════════════
const SRC = "jidou-hook.mp4";
const HOOK_END = 5.97;
const INK = "#2B2F3A", G = "#23A06B", O = "#EF7D57", BL = "#3C78C8", RED = "#E5483B", YEL = "#FFE15A", LINE = "#A89C7A";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const p01 = (f: number, a: number, b: number, e = OUT) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const pop = (f: number, t: number) => interpolate(f - F(t), [0, 3, 6], [0, 1.1, 1], clamp);
// ── 参考の冒頭と同じ作り ──
//  本人の動画が画面全体に流れる（顔が画面の下半分に来るよう下へずらす）→ 上の約4割に「中身の予告」の画面が重なり、下へグラデで溶ける
//  境目にアイコン2つ＋太い白のタイトル（ずっと同じ）＋その下に小さめの白い字幕（言葉ごとに変わる）
//  焼き付いた文字（元の y1160〜1350）は、下へずらした分 画面の y1690〜 に来る → いちばん下の暗いグラデで隠す
const SHIFT = 530;
const PREV: [number, string, number][] = [[0, "gen/jt_preview_9_9.png", -250], [2.76, "gen/jt_preview_27_95.png", -40], [4.02, "gen/jt_preview_43_4.png", -20]];
const PH: [number, string][] = [[0.0, "2歳と0歳の"], [1.52, "子どもがいる"], [2.0, "我が家が"], [2.76, "児童手当を"], [3.54, "どのように"], [4.02, "活用しているのか"], [5.22, "解説します"]];

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  let pi = 0; PREV.forEach(([s0], k) => { if (t >= s0) pi = k; });
  const [p0, img, oy] = PREV[pi];
  const kb = 1.02 + 0.06 * p01(f, F(p0), F(p0) + 60, Easing.linear); // 画面がゆっくり寄る（参考と同じ）
  const swap = 1 - p01(f, F(p0), F(p0) + 5);
  let ci = -1; PH.forEach(([s0], k) => { if (t >= s0) ci = k; });
  const ck = ci >= 0 ? f - F(PH[ci][0]) : 0;
  return (
    <AbsoluteFill style={{ background: "#121212", overflow: "hidden" }}>
      {/* 本人（撮ったままの大きさ・色） */}
      <OffthreadVideo src={staticFile(SRC)} muted style={{ position: "absolute", left: 0, top: SHIFT, width: 1080, height: 1920 }} />
      {/* いちばん下：暗いグラデ（焼き付いた文字を隠す） */}
      <div style={{ position: "absolute", left: 0, top: 1600, width: 1080, height: 320, background: "linear-gradient(rgba(18,18,18,0), rgba(18,18,18,1) 80px)" }} />
      {/* 上：中身の予告（図解の本編の画面） */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1000, overflow: "hidden", background: "#FBF6D8" }}>
        <div style={{ position: "absolute", left: 0, top: 90 + oy, width: 1080, height: 1080, transform: `scale(${kb})`, transformOrigin: "50% 40%", filter: swap > 0 ? `blur(${swap * 6}px)` : undefined }}>
          <Img src={staticFile(img)} style={{ width: 1080, height: 1080 }} />
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 140, background: "linear-gradient(rgba(18,18,18,0.75), rgba(18,18,18,0))" }} />
        <div style={{ position: "absolute", left: 0, top: 560, width: 1080, height: 440, background: "linear-gradient(rgba(18,18,18,0), rgba(18,18,18,0.92) 62%, rgba(18,18,18,0.97))" }} />
      </div>
      {/* 境目のなじませ：暗い帯 → 本人へ */}
      <div style={{ position: "absolute", left: 0, top: 1000, width: 1080, height: 160, background: "linear-gradient(rgba(18,18,18,0.97), rgba(18,18,18,0))" }} />
      {/* アイコン2つ */}
      <div style={{ position: "absolute", left: 0, width: 1080, top: 620, display: "flex", justifyContent: "center", gap: 30 }}>
        <div style={{ width: 150, height: 150, borderRadius: 34, background: O, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(0,0,0,0.35)", ...K, fontSize: 40, color: "#fff", lineHeight: 1.05, textAlign: "center" }}>児童<br />手当</div>
        <div style={{ width: 150, height: 150, borderRadius: 34, background: "#C8F03C", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(0,0,0,0.35)", ...K, fontSize: 44, color: INK }}>NISA</div>
      </div>
      {/* タイトル（ずっと同じ） */}
      <div style={{ position: "absolute", left: 0, width: 1080, top: 800, textAlign: "center", ...K, fontSize: 78, color: "#fff", lineHeight: 1.12, letterSpacing: 2, textShadow: "0 4px 14px rgba(0,0,0,0.5)" }}>
        <div>児童手当 ＋ NISA：</div>
        <div>わが家の使い道</div>
      </div>
      {/* 字幕（言葉ごと） */}
      {ci >= 0 ? <div style={{ position: "absolute", left: 0, width: 1080, top: 1000, textAlign: "center", ...K, fontSize: 50, color: "#fff", letterSpacing: 3, textShadow: "0 3px 10px rgba(0,0,0,0.6)", opacity: Math.min(1, ck / 2 + 0.4) }}>{PH[ci][1]}</div> : null}
    </AbsoluteFill>
  );
};

const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const HOOK_CUES = [s("u03s", 2.76, 0.1), s("u03s", 4.02, 0.1)];

export const JIDOU_HOOK_FRAMES = F(HOOK_END);
export const JidouHookOnly: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile(SRC)} />
    <SfxTrack cues={HOOK_CUES} />
    <Hook />
  </AbsoluteFill>
);
export const JIDOU_FULL_FRAMES = F(HOOK_END) + JIDOU_TREE_FRAMES;
export const JidouFull: React.FC = () => (
  <AbsoluteFill style={{ background: "#FBF6D8" }}>
    <Sequence durationInFrames={F(HOOK_END)}><JidouHookOnly /></Sequence>
    <Sequence from={F(HOOK_END)}><JidouTreeReel /></Sequence>
  </AbsoluteFill>
);
