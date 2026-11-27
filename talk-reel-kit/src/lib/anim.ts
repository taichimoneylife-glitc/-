import React from "react";
import { Easing, interpolate } from "remotion";

// 動きの共通の道具（秒で書けるようにしてある。30fps 前提）
export const FPS = 30;
export const F = (t: number) => Math.round(t * FPS);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);

// 0→1 をなめらかに（at 秒から dur 秒かけて）
export const ease = (f: number, at: number, dur = 0.5) => interpolate(f - F(at), [0, F(dur)], [0, 1], { ...clamp, easing: OUT });
// 下から少し浮き上がって出る
export const rise = (f: number, at: number): React.CSSProperties => {
  const d = f - F(at);
  return {
    opacity: interpolate(d, [0, 6], [0, 1], clamp),
    transform: `translateY(${interpolate(d, [0, 10], [30, 0], { ...clamp, easing: OUT })}px) scale(${interpolate(d, [0, 10], [0.94, 1], { ...clamp, easing: OUT })})`,
  };
};
// ポンと出る（少し大きくなってから戻る）
export const pop = (f: number, at: number) => interpolate(f - F(at), [0, 4, 8], [0.3, 1.1, 1], clamp);
// 数字のカウントアップ
export const count = (f: number, at: number, to: number, dur = 0.5, from = 0) => from + (to - from) * ease(f, at, dur);
// t 秒で消える（0.2秒前からフェード）
export const until = (f: number, t: number) => interpolate(f, [F(t) - 6, F(t)], [1, 0], clamp);
// 3桁区切り
export const num = (v: number) => Math.round(v).toLocaleString("ja-JP");
