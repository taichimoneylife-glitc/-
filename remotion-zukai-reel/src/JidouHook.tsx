import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
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
const SPLIT = 1080; // 上＝図解／下＝本人

const NODES: [string, string][] = [["どこに？", G], ["いくら？", O], ["なぜ運用？", BL], ["注意点", RED]];
const NX = (i: number) => 40 + i * 255, NW = 235, NYY = 620;

const Diagram: React.FC<{ f: number }> = ({ f }) => {
  const famShrink = p01(f, F(2.0), F(2.0) + 9, Easing.inOut(Easing.cubic)); // 家族の絵がハブのアイコンへ
  const hubP = pop(f, 2.0);
  const lineP = p01(f, F(3.54), F(3.54) + 8);
  const q = (i: number) => p01(f, F(4.02 + i * 0.12), F(4.12 + i * 0.12)) * (1 - p01(f, F(5.1), F(5.25)));
  const famX = interpolate(famShrink, [0, 1], [290, 222]), famY = interpolate(famShrink, [0, 1], [230, 305]), famS = interpolate(famShrink, [0, 1], [500, 92]);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: SPLIT, overflow: "hidden", background: "#FBF6D8", backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }}>
      <div style={{ position: "absolute", left: 92, top: 0, width: 4, height: SPLIT, background: "rgba(239,125,87,0.35)" }} />
      <div style={{ position: "absolute", left: 0, top: 110, width: 1080, height: SPLIT }}>
      {/* ハブ「わが家の児童手当」 */}
      <div style={{ position: "absolute", left: 210, top: 290, width: 660, height: 130, background: INK, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 120, boxSizing: "border-box", boxShadow: "0 8px 18px rgba(30,35,50,0.25)", transform: `scale(${hubP})` }}>
        <span style={{ ...K, fontSize: 58, color: "#fff", whiteSpace: "nowrap" }}>わが家<span style={{ opacity: p01(f, F(2.76), F(2.76) + 5) }}>の<span style={{ color: YEL }}>児童手当</span></span></span>
      </div>
      {/* 家族：はじめは大きく → ハブのアイコンに収まる */}
      <div style={{ position: "absolute", left: famX, top: famY, width: famS, height: famS, borderRadius: famShrink > 0.5 ? "50%" : 0, background: famShrink > 0.5 ? "#fff" : "transparent", overflow: famShrink > 0.5 ? "hidden" : "visible", transform: `scale(${pop(f, 0.0)})`, transformOrigin: "50% 100%", zIndex: 2 }}><GenSlot name="jt_family_2y0y" size={famS} /></div>
      {famShrink < 0.3 ? (
        <>
          <div style={{ position: "absolute", left: 150, top: 560, background: "#fff", border: `6px solid ${INK}`, borderRadius: 999, padding: "4px 26px", ...K, fontSize: 50, transform: `scale(${pop(f, 0.36)})`, opacity: 1 - famShrink * 3, zIndex: 3 }}>2歳</div>
          <div style={{ position: "absolute", left: 780, top: 520, background: "#fff", border: `6px solid ${INK}`, borderRadius: 999, padding: "4px 26px", ...K, fontSize: 50, transform: `scale(${pop(f, 1.12)})`, opacity: 1 - famShrink * 3, zIndex: 3 }}>0歳</div>
        </>
      ) : null}
      {/* 線 → ？が4つ */}
      <svg width={1080} height={SPLIT} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={`M540 420 L540 ${420 + 80 * lineP}`} stroke={LINE} strokeWidth={7} strokeLinecap="round" opacity={lineP > 0 ? 1 : 0} />
        <path d={`M${540 - (540 - NX(0) - NW / 2) * lineP} 500 L${540 + (NX(3) + NW / 2 - 540) * lineP} 500`} stroke={LINE} strokeWidth={7} strokeLinecap="round" opacity={lineP > 0.4 ? 1 : 0} />
        {NODES.map((_, i) => { const p = p01(f, F(3.75 + i * 0.06), F(3.9 + i * 0.06)); return p > 0 ? <path key={i} d={`M${NX(i) + NW / 2} 500 L${NX(i) + NW / 2} ${500 + 120 * p}`} stroke={LINE} strokeWidth={7} strokeLinecap="round" /> : null; })}
      </svg>
      {NODES.map(([title, c], i) => {
        const glow = f >= F(5.22) ? 0.5 + 0.5 * Math.sin((f - F(5.22)) / 4 + i) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: NX(i), top: NYY, width: NW, height: 150, borderRadius: 20, background: "#DADDE4", border: `4px solid ${f >= F(5.22) ? c : "#C3C7D0"}`, boxShadow: glow ? `0 0 ${10 + 14 * glow}px ${c}99` : "0 4px 10px rgba(30,35,50,0.12)", transform: `scale(${pop(f, 3.9 + i * 0.08)})`, boxSizing: "border-box" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...SER, fontSize: 104, color: "#A7ACB8", opacity: 1 - q(i) }}>？</div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 44, color: c, opacity: q(i), whiteSpace: "nowrap" }}>{title}</div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

// 下：話しているたいち（胸の文字が入らない範囲だけ）
const Talker: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: SPLIT, width: 1080, height: 1920 - SPLIT, overflow: "hidden", background: "#000" }}>
    <OffthreadVideo src={staticFile(SRC)} muted style={{ position: "absolute", left: -60, top: -260, width: 1200, height: 2133, filter: "blur(26px) brightness(0.8)" }} />
    {/* 引きで見せる（0.94倍・顔を真ん中に）：胸の文字（元の y1180〜）が入らない範囲だけ */}
    <OffthreadVideo src={staticFile(SRC)} muted style={{ position: "absolute", left: (1080 - 1080 * 0.94) / 2, top: (1920 - SPLIT) / 2 - 720 * 0.94, width: 1080 * 0.94, height: 1920 * 0.94 }} />
  </div>
);

// 字幕：上下の境目に、言った言葉
const PH: [number, string][] = [[0.0, "2歳と0歳の"], [1.52, "子どもがいる"], [2.0, "我が家が"], [2.76, "児童手当を"], [3.54, "どのように"], [4.02, "活用しているのか"], [5.22, "解説します"]];
const Cap: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  let i = -1;
  PH.forEach(([s0], k) => { if (t >= s0) i = k; });
  if (i < 0) return null;
  const k = f - F(PH[i][0]);
  const sc = interpolate(k, [0, 3, 6], [0.9, 1.04, 1], clamp);
  const key = /児童手当|解説/.test(PH[i][1]);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: SPLIT - 52, display: "flex", justifyContent: "center", zIndex: 5 }}>
      <div style={{ background: key ? G : "#fff", color: key ? "#fff" : INK, border: `5px solid ${INK}`, borderRadius: 18, padding: "6px 30px", ...K, fontSize: 56, boxShadow: `6px 6px 0 ${INK}`, transform: `scale(${sc})`, whiteSpace: "nowrap" }}>{PH[i][1]}</div>
    </div>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Diagram f={f} />
      <Talker />
      <Cap f={f} />
    </AbsoluteFill>
  );
};

const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const HOOK_CUES = [s("u05s", 2.0, 0.14), s("u03s", 3.54, 0.12), s("u02s", 3.9, 0.1), s("u02s", 4.06, 0.1), s("u02s", 4.22, 0.1)];

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
