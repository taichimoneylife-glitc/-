import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, Img } from "remotion";
import { K, F } from "./components/marke";
import { GenSlot } from "./MileLifePlan";
import { SfxTrack } from "./components/sfx";
import { JidouTreeReel, JIDOU_TREE_FRAMES } from "./JidouTreeReel";

// ════════════════════════════════════════════════════════════════════
//  児童手当：冒頭のトーク（6秒）を参考動画ふうに編集 → 図解（JidouTreeReel）へつなぐ
//  参考：ユーザー提供リール（トーク⇔はめ込み・上下2分割・後ろに巨大な薄い文字・UIカード＋右下に小さな本人・太い白文字）
//  元の動画は胸に白い文字が焼き付いている → 顔の範囲（y210〜1150）だけ切り出す／後ろは強くぼかして見えなくする
// ════════════════════════════════════════════════════════════════════
const SRC = "jidou-hook.mp4";
const HOOK_END = 5.97;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const p01 = (f: number, a: number, b: number, e = OUT) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const Y0 = 210, YH = 940; // 文字が入らない顔の範囲

// 元の動画の一部を、指定の枠に切り出して映す
const Crop: React.FC<{ x: number; y: number; w: number; h: number; sy?: number; sh?: number; r?: number; style?: React.CSSProperties }> = ({ x, y, w, h, sy = Y0, sh = YH, r = 0, style }) => {
  const s = h / sh; // 縦をぴったり合わせる
  const vw = 1080 * s;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", borderRadius: r, ...style }}>
      <OffthreadVideo src={staticFile(SRC)} muted style={{ position: "absolute", width: vw, height: 1920 * s, left: (w - vw) / 2, top: -sy * s }} />
    </div>
  );
};
const Blurred: React.FC<{ dim?: number }> = ({ dim = 0.42 }) => (
  <OffthreadVideo src={staticFile(SRC)} muted style={{ position: "absolute", left: -120, top: -200, width: 1320, height: 2346, objectFit: "cover", filter: `blur(34px) brightness(${dim})` }} />
);
// 参考の文字：太い白・影つき・言った瞬間にポン（大げさにしない）
const Cap: React.FC<{ t: number; until: number; y: number; size?: number; children: React.ReactNode; c?: string }> = ({ t, until, y, size = 82, children, c = "#fff" }) => {
  const f = useCurrentFrame();
  if (f < F(t) || f >= F(until)) return null;
  const k = f - F(t);
  const sc = interpolate(k, [0, 3, 6], [0.86, 1.04, 1], clamp);
  return <div style={{ position: "absolute", left: 40, width: 1000, top: y, textAlign: "center", ...K, fontSize: size, color: c, letterSpacing: 2, textShadow: "0 4px 18px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.6)", transform: `scale(${sc})`, opacity: Math.min(1, k / 2 + 0.3), whiteSpace: "nowrap" }}>{children}</div>;
};
// 切り替えの瞬間に少し大きい所から落ち着く（参考と同じく切り替えはカット）
const settle = (f: number, t: number) => 1 + 0.06 * (1 - p01(f, F(t), F(t) + 7));

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const L = t < 1.84 ? 1 : t < 2.76 ? 2 : t < 3.54 ? 3 : t < 5.22 ? 4 : 5;
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {/* ① はめ込み：ぼかした背景＋中央に顔のカード */}
      {L === 1 ? (
        <AbsoluteFill style={{ transform: `scale(${settle(f, 0)})` }}>
          <Blurred />
          <Crop x={90} y={300} w={900} h={900} sy={300} sh={850} r={36} style={{ boxShadow: "0 30px 60px rgba(0,0,0,0.5)", transform: `scale(${1 + 0.03 * p01(f, 0, F(1.84), Easing.linear)})` }} />
          <Cap t={0} until={1.52} y={1240}>2歳と0歳の</Cap>
          <Cap t={1.52} until={1.84} y={1240}>子どもがいる</Cap>
        </AbsoluteFill>
      ) : null}
      {/* ② 上下2分割：上＝わが家（ノートの紙）／下＝本人 */}
      {L === 2 ? (
        <AbsoluteFill style={{ transform: `scale(${settle(f, 1.84)})` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 960, background: "#FBF6D8", backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }}>
            <div style={{ position: "absolute", left: 300, top: 250, transform: `translateY(${(1 - p01(f, F(1.84), F(1.84) + 8)) * 80}px)` }}><GenSlot name="jt_family_2y0y" size={560} /></div>
            {[["2歳", 250, 520, 1.9], ["0歳", 760, 470, 2.0]].map(([s, x, y, tt]) => (
              <div key={s as string} style={{ position: "absolute", left: x as number, top: y as number, background: "#fff", border: "6px solid #2E2C26", borderRadius: 999, padding: "4px 26px", ...K, fontSize: 48, transform: `scale(${interpolate(f - F(tt as number), [0, 3, 6], [0, 1.1, 1], clamp)})` }}>{s}</div>
            ))}
          </div>
          <Crop x={0} y={960} w={1080} h={960} sy={Y0 - 10} sh={960} />
          <Cap t={2.0} until={2.76} y={900}>我が家が</Cap>
        </AbsoluteFill>
      ) : null}
      {/* ③ 後ろに巨大な薄い文字＋小さめの顔のカード */}
      {L === 3 ? (
        <AbsoluteFill style={{ transform: `scale(${settle(f, 2.76)})` }}>
          <Blurred dim={0.3} />
          <div style={{ position: "absolute", left: 0, top: 560, width: 1080, textAlign: "center", ...K, fontSize: 300, color: "rgba(255,255,255,0.13)", whiteSpace: "nowrap", transform: `translateX(${interpolate(f, [F(2.76), F(3.54)], [40, -40])}px)` }}>児童手当</div>
          <Crop x={240} y={420} w={600} h={600} r={30} style={{ boxShadow: "0 24px 50px rgba(0,0,0,0.55)" }} />
          <Cap t={2.76} until={3.54} y={1110} c="#FFE15A">児童手当を</Cap>
        </AbsoluteFill>
      ) : null}
      {/* ④ 中身の予告：ツリーのカード＋右下に小さな本人 */}
      {L === 4 ? (
        <AbsoluteFill style={{ transform: `scale(${settle(f, 3.54)})` }}>
          <Blurred dim={0.25} />
          <div style={{ position: "absolute", left: 55, top: 420, width: 970, borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.5)", transform: `scale(${1 + 0.04 * p01(f, F(3.54), F(5.22), Easing.linear)})` }}>
            <Img src={staticFile("gen/jt_tree_teaser.png")} style={{ width: "100%", display: "block" }} />
          </div>
          <Crop x={700} y={660} w={270} h={270} sy={330} sh={620} r={24} style={{ border: "5px solid #fff", boxShadow: "0 12px 30px rgba(0,0,0,0.5)", transform: `translateY(${(1 - p01(f, F(3.7), F(3.7) + 8)) * 60}px)`, opacity: p01(f, F(3.7), F(3.7) + 4) }} />
          <Cap t={3.54} until={4.02} y={1040}>どのように</Cap>
          <Cap t={4.02} until={5.22} y={1040}>活用しているのか</Cap>
        </AbsoluteFill>
      ) : null}
      {/* ⑤ 本人に戻って「解説します」→ 図解へ */}
      {L === 5 ? (
        <AbsoluteFill style={{ transform: `scale(${settle(f, 5.22)})` }}>
          <Blurred />
          <Crop x={40} y={260} w={1000} h={1000} sy={300} sh={850} r={36} style={{ boxShadow: "0 30px 60px rgba(0,0,0,0.5)", transform: `scale(${1 + 0.05 * p01(f, F(5.22), F(HOOK_END), Easing.linear)})` }} />
          <Cap t={5.22} until={6.2} y={1300}>解説します</Cap>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const HOOK_CUES = [s("u03s", 1.84, 0.12), s("u03s", 3.54, 0.12)];

export const JIDOU_FULL_FRAMES = F(HOOK_END) + JIDOU_TREE_FRAMES;
export const JidouFull: React.FC = () => (
  <AbsoluteFill style={{ background: "#FBF6D8" }}>
    <Sequence durationInFrames={F(HOOK_END)}>
      <Audio src={staticFile(SRC)} />
      <SfxTrack cues={HOOK_CUES} />
      <Hook />
    </Sequence>
    <Sequence from={F(HOOK_END)}>
      <JidouTreeReel />
    </Sequence>
  </AbsoluteFill>
);

export const JIDOU_HOOK_FRAMES = F(HOOK_END);
export const JidouHookOnly: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile(SRC)} />
    <SfxTrack cues={HOOK_CUES} />
    <Hook />
  </AbsoluteFill>
);
