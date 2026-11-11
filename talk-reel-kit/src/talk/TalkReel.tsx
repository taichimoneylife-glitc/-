import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { F, clamp } from "../lib/anim";
import { FONT } from "../lib/font";
import { SfxTrack } from "../lib/sfx";
import { Captions } from "./Captions";
import { InsertLayer, isFull } from "./inserts";
import type { TalkPlan, Words } from "./types";

// ════════════════════════════════════════════════════════════
//  トークリール本体（実写の上に：寄り → 下の影 → 図解 → 字幕 → 効果音）
//  中身は plan.ts に書く。文字起こしは public/words.json（scripts/transcribe.py）。
// ════════════════════════════════════════════════════════════
export type TalkProps = { plan: TalkPlan; data: Words };

// 寄る秒：plan.punches が無ければ、強調語が話された時と、図解の頭で自動
const punchTimes = (plan: TalkPlan, data: Words) => {
  if (plan.punches?.length) return plan.punches;
  const ts: number[] = plan.inserts.filter((x) => !isFull(x)).map((x) => x.from);
  data.words.forEach((w) => { if (plan.emph.some((e) => w.w.includes(e.match))) ts.push(w.s); });
  return ts.sort((a, b) => a - b).filter((t, i, a) => i === 0 || t - a[i - 1] > 1.2);
};

const Zoom: React.FC<{ punches: number[]; total: number; children: React.ReactNode }> = ({ punches, total, children }) => {
  const f = useCurrentFrame();
  const base = interpolate(f, [0, total], [1.03, 1.09], clamp); // ずっとゆっくり寄る
  let bump = 0;
  for (const p of punches) bump += 0.045 * Math.max(0, 1 - Math.abs(f - (F(p) + 5)) / 12); // 大事な所でグッと寄って戻る
  return <AbsoluteFill style={{ transform: `scale(${base + bump})`, transformOrigin: "50% 38%" }}>{children}</AbsoluteFill>;
};

export const TalkReel: React.FC<TalkProps> = ({ plan, data }) => {
  const total = F(data.duration);
  const punches = React.useMemo(() => punchTimes(plan, data), [plan, data]);
  const cues = plan.sfx === false ? [] : [
    ...plan.inserts.map((x) => ({ file: isFull(x) ? "whoosh.wav" : "pop.wav", at: F(x.from), volume: 0.22 })),
    ...punches.map((t) => ({ file: "tick.wav", at: F(t), volume: 0.12 })),
  ].filter((c) => c.at > 0);
  return (
    <AbsoluteFill style={{ background: "#111", fontFamily: FONT }}>
      <Zoom punches={punches} total={total}>
        <OffthreadVideo src={staticFile(plan.video)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: plan.grade === false ? undefined : "contrast(1.08) saturate(1.12) brightness(0.98)" }} />
      </Zoom>
      {/* 下の影：字幕を読みやすく */}
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 78%, rgba(0,0,0,0.1) 100%)" }} />
      <InsertLayer inserts={plan.inserts} />
      <Captions words={data.words} emph={plan.emph} />
      <SfxTrack cues={cues} />
    </AbsoluteFill>
  );
};
