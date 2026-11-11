import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { K } from "../lib/font";
import { clamp } from "../lib/anim";
import type { Emph, Word } from "./types";

// ════════════════════════════════════════════════════════════
//  語同期の字幕（カラオケ式）
//  ・言葉の区切り（句読点・0.35秒以上の間・14文字）で1枚にまとめる → 2行以内
//  ・今しゃべっている言葉に色の箱がつく／強調語は色・黄色マーカー
//  ・置き場所＝画面の下1/3（y≈1250）。顔・口元にかぶせない／インスタの下のUIを避ける
// ════════════════════════════════════════════════════════════
export type Chunk = { s: number; e: number; words: Word[] };
const PUNCT = /[。、！？!?,.]$/;
export const makeChunks = (words: Word[], maxChars = 14, gap = 0.35): Chunk[] => {
  const out: Chunk[] = []; let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur }); cur = []; };
  words.forEach((w, i) => {
    const len = cur.reduce((a, x) => a + x.w.length, 0);
    if (cur.length && (w.s - cur[cur.length - 1].e > gap || len + w.w.length > maxChars)) flush();
    cur.push(w);
    if (PUNCT.test(w.w) || i === words.length - 1) flush();
  });
  return out;
};
const clean = (s: string) => s.replace(/[。、]/g, "").replace(/[,.]$/, "");

export const Captions: React.FC<{ words: Word[]; emph: Emph[]; top?: number; size?: number; hi?: string }> = ({ words, emph, top = 1250, size = 66, hi = "#7B5CF0" }) => {
  const f = useCurrentFrame(); const t = f / 30;
  const chunks = React.useMemo(() => makeChunks(words), [words]);
  const c = chunks.find((x, i) => t >= x.s - 0.08 && t < (chunks[i + 1]?.s ?? x.e + 0.6) - 0.02 && t < x.e + 0.8);
  if (!c) return null;
  const fadeIn = interpolate(t, [c.s - 0.08, c.s + 0.04], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "4px 2px", opacity: fadeIn }}>
      {c.words.map((w, i) => {
        const txt = clean(w.w); if (!txt) return null;
        const on = t >= w.s - 0.05;
        const cur = on && (i === c.words.length - 1 || t < c.words[i + 1].s - 0.05);
        const em = emph.find((x) => txt.includes(x.match) || (x.match.includes(txt) && txt.length >= 2));
        const d = f - Math.round((w.s - 0.05) * 30);
        const base: React.CSSProperties = { ...K, fontSize: size, lineHeight: 1.28, padding: "0 10px", borderRadius: 14, display: "inline-block", transform: on ? `scale(${interpolate(d, [0, 3, 6], [0.86, 1.07, 1], clamp)})` : undefined, opacity: on ? 1 : 0.35 };
        if (em?.marker) return <span key={i} style={{ ...base, color: "#2E2C26", background: "linear-gradient(transparent 12%, #FCE07A 12%, #FCE07A 92%, transparent 92%)" }}>{txt}</span>;
        if (cur) return <span key={i} style={{ ...base, color: "#fff", background: em?.color ?? hi, boxShadow: "0 6px 16px rgba(0,0,0,0.25)" }}>{txt}</span>;
        return <span key={i} style={{ ...base, color: em?.color ?? "#fff", WebkitTextStroke: "10px rgba(20,18,30,0.92)", paintOrder: "stroke fill", textShadow: "0 4px 10px rgba(0,0,0,0.35)" }}>{txt}</span>;
      })}
    </div>
  );
};
