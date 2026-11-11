import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SegmentView, capTop, segAt } from "./segments";
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

// 寄り：ずっとゆっくり寄る＋大事な所でグッと寄って戻る（倍率だけを返す）
const zoomAt = (f: number, punches: number[], total: number) => {
  const base = interpolate(f, [0, total], [1.03, 1.09], clamp);
  let bump = 0;
  for (const p of punches) bump += 0.045 * Math.max(0, 1 - Math.abs(f - (F(p) + 5)) / 12);
  return base + bump;
};

export const TalkReel: React.FC<TalkProps> = ({ plan, data }) => {
  const total = F(data.duration);
  const punches = React.useMemo(() => punchTimes(plan, data), [plan, data]);
  const cues = plan.sfx === false ? [] : [
    ...plan.inserts.map((x) => ({ file: isFull(x) ? "u03s.mp3" : "u02s.mp3", at: F(x.from), volume: 0.3 })), // 図解の出現＝ポン、全画面への切り替え＝転換の音
    ...punches.map((t) => ({ file: "u05s.mp3", at: F(t), volume: 0.16 })), // 寄る所＝軽く
    ...(plan.segments ?? []).map((s) => ({ file: "u03s.mp3", at: F(s.from), volume: 0.22 })), // 画面の型が変わる所
  ].filter((c) => c.at > 0);
  const f = useCurrentFrame();
  const seg = segAt(plan.segments, f / 30);
  const t = f / 30;
  const on = (type: string) => plan.inserts.some((x) => x.type === type && t >= x.from && t <= x.to);
  const light = on("compare"); // 白い紙の図解の上では、字幕を濃い色に
  const top0 = capTop(seg);
  const top = top0 === null ? null : top0 + (on("bignum") ? 110 : 0); // 大きな数字が出ている間は字幕を少し下へ
  return (
    <AbsoluteFill style={{ background: "#111", fontFamily: FONT }}>
      <SegmentView seg={seg} video={plan.video} zoom={zoomAt(f, punches, total)} gradeOn={plan.grade !== false} />
      {/* 下の影：字幕を読みやすく（本人だけの時） */}
      {!seg || seg.mode === "full" ? <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.34) 72%, rgba(0,0,0,0.1) 100%)" }} /> : null}
      <InsertLayer inserts={plan.inserts} />
      {top !== null ? <Captions words={data.words} emph={plan.emph} top={top} look={plan.capStyle ?? "clean"} light={light} /> : null}
      <SfxTrack cues={cues} />
    </AbsoluteFill>
  );
};
