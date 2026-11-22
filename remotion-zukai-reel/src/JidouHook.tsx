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
const SPLIT = 880; // 上＝図解／下＝本人（自然な大きさ）
const TOFF = 360;   // 下に映す元の動画の上端（元の y360 から）→ 焼き付いた文字（元の y1160〜1350）は画面の y1680〜＝暗いグラデで隠す

const NODES: [string, string][] = [["どこに？", G], ["いくら？", O], ["なぜ運用？", BL], ["注意点", RED]];
const NX = (i: number) => 40 + i * 255, NW = 235;

// 上：図解（言葉に合わせて組み上がる）
const Diagram: React.FC<{ f: number }> = ({ f }) => {
  const treeOn = f >= F(2.76);
  const hubP = pop(f, 2.76);
  const lineP = p01(f, F(3.54), F(3.54) + 8);
  const q = (i: number) => p01(f, F(4.02 + i * 0.12), F(4.12 + i * 0.12)) * (1 - p01(f, F(5.0), F(5.15)));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: SPLIT, overflow: "hidden", background: "#FBF6D8", backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }}>
      <div style={{ position: "absolute", left: 92, top: 0, width: 4, height: SPLIT, background: "rgba(239,125,87,0.35)" }} />
      {!treeOn ? (
        <>
          <div style={{ position: "absolute", left: 270, top: 170, transform: `scale(${pop(f, 0)})`, transformOrigin: "50% 100%" }}><GenSlot name="jt_family_2y0y" size={560} /></div>
          <div style={{ position: "absolute", left: 140, top: 520, background: "#fff", border: `7px solid ${INK}`, borderRadius: 999, padding: "6px 34px", ...K, fontSize: 64, transform: `scale(${pop(f, 0.36)})` }}>2歳</div>
          <div style={{ position: "absolute", left: 770, top: 470, background: "#fff", border: `7px solid ${INK}`, borderRadius: 999, padding: "6px 34px", ...K, fontSize: 64, transform: `scale(${pop(f, 1.12)})` }}>0歳</div>
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: 160, top: 250, width: 760, height: 150, background: INK, borderRadius: 26, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, boxShadow: "0 10px 22px rgba(30,35,50,0.25)", transform: `scale(${hubP})` }}>
            <div style={{ width: 112, height: 112, borderRadius: "50%", background: "#fff", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}><GenSlot name="jt_family_2y0y" size={118} /></div>
            <span style={{ ...K, fontSize: 66, color: "#fff", whiteSpace: "nowrap" }}>わが家の<span style={{ color: YEL }}>児童手当</span></span>
          </div>
          <svg width={1080} height={SPLIT} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {lineP > 0 ? <path d={`M540 400 L540 ${400 + 70 * lineP}`} stroke={LINE} strokeWidth={8} strokeLinecap="round" /> : null}
            {lineP > 0.4 ? <path d={`M${540 - (540 - NX(0) - NW / 2) * lineP} 470 L${540 + (NX(3) + NW / 2 - 540) * lineP} 470`} stroke={LINE} strokeWidth={8} strokeLinecap="round" /> : null}
            {NODES.map((_, i) => { const p = p01(f, F(3.75 + i * 0.06), F(3.9 + i * 0.06)); return p > 0 ? <path key={i} d={`M${NX(i) + NW / 2} 470 L${NX(i) + NW / 2} ${470 + 90 * p}`} stroke={LINE} strokeWidth={8} strokeLinecap="round" /> : null; })}
          </svg>
          {NODES.map(([title, c], i) => (
            <div key={i} style={{ position: "absolute", left: NX(i), top: 560, width: NW, height: 180, borderRadius: 22, background: "#DADDE4", border: `5px solid #C3C7D0`, boxShadow: "0 5px 12px rgba(30,35,50,0.14)", transform: `scale(${pop(f, 3.9 + i * 0.08)})`, boxSizing: "border-box" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...SER, fontSize: 120, color: "#A7ACB8", opacity: 1 - q(i) }}>？</div>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 46, color: c, opacity: q(i), whiteSpace: "nowrap" }}>{title}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// 下：話しているたいち（撮ったままの大きさ）。いちばん下は暗いグラデで焼き付いた文字を隠す
const Talker: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: SPLIT, width: 1080, height: 1920 - SPLIT, overflow: "hidden", background: "#111" }}>
    <OffthreadVideo src={staticFile(SRC)} muted style={{ position: "absolute", left: 0, top: -TOFF, width: 1080, height: 1920 }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 160, background: "linear-gradient(rgba(10,10,10,0.55), rgba(10,10,10,0))" }} />
    <div style={{ position: "absolute", left: 0, top: 1160 - TOFF - 80, width: 1080, height: 1920, background: "linear-gradient(rgba(14,14,14,0), rgba(14,14,14,1) 80px)" }} />
  </div>
);
// 全画面のたいち（参考の「本人ドン」）。胸の焼き付いた文字は、新しい字幕の板で上から隠す
const Full: React.FC<{ f: number; t: number; text: string; c?: string }> = ({ f, t, text, c = "#fff" }) => {
  const k = f - F(t);
  const sc = 1.03 + 0.03 * p01(f, F(t), F(t) + 25, Easing.linear) + 0.04 * (1 - p01(f, F(t), F(t) + 6));
  return (
    <AbsoluteFill style={{ background: "#111", overflow: "hidden" }}>
      <OffthreadVideo src={staticFile(SRC)} muted style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${sc})`, transformOrigin: "540px 760px" }} />
      <div style={{ position: "absolute", left: 30, width: 1020, top: 1150, height: 210, transform: `scale(${sc})`, transformOrigin: "540px -390px", display: "flex", alignItems: "center", justifyContent: "center", background: "#18181A", borderRadius: 26, boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}>
        <span style={{ ...K, fontSize: 92, color: c, letterSpacing: 3, transform: `scale(${interpolate(k, [0, 3, 6], [0.85, 1.05, 1], clamp)})`, whiteSpace: "nowrap" }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};

// 字幕：上下の境目（参考と同じく、太い白文字）
const PH: [number, string][] = [[0.0, "2歳と0歳の"], [1.52, "子どもがいる"], [2.76, "児童手当を"], [3.54, "どのように"], [4.02, "活用しているのか"]];
const Cap: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  let i = -1;
  PH.forEach(([s0], k) => { if (t >= s0) i = k; });
  if (i < 0) return null;
  const k = f - F(PH[i][0]);
  const sc = interpolate(k, [0, 3, 6], [0.88, 1.04, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: SPLIT + 26, textAlign: "center", ...K, fontSize: 72, color: PH[i][1] === "児童手当を" ? YEL : "#fff", letterSpacing: 3, textShadow: "0 4px 16px rgba(0,0,0,0.7), 0 0 3px rgba(0,0,0,0.8)", transform: `scale(${sc})`, whiteSpace: "nowrap", zIndex: 5 }}>{PH[i][1]}</div>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (t >= 1.84 && t < 2.76) return <Full f={f} t={1.84} text="我が家が" />;
  if (t >= 5.22) return <Full f={f} t={5.22} text="解説します" c={YEL} />;
  const cut = t >= 2.76 ? 2.76 : 0;
  const settle = 1 + 0.04 * (1 - p01(f, F(cut), F(cut) + 6));
  return (
    <AbsoluteFill style={{ background: "#111", transform: `scale(${settle})` }}>
      <Diagram f={f} />
      <Talker />
      <div style={{ position: "absolute", left: 0, top: SPLIT - 18, width: 1080, height: 18, background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.18))" }} />
      <Cap f={f} />
    </AbsoluteFill>
  );
};

const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const HOOK_CUES = [s("u03s", 1.84, 0.12), s("u05s", 2.76, 0.14), s("u02s", 3.9, 0.1), s("u02s", 4.06, 0.1), s("u03s", 5.22, 0.12)];

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
