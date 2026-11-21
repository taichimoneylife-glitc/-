import React from "react";
import { AbsoluteFill } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { HeadStyle, HeadKind, NisaBondReel } from "./NisaBondReel";
// 「理由n」のデザイン比較用（NisaBondReel の冒頭を、見出しの形だけ変えて並べる）
export const HeadPreview: React.FC<{ kind: HeadKind }> = ({ kind }) => (
  <HeadStyle.Provider value={kind}><AbsoluteFill style={{ background: A2.bg, fontFamily: FONT }}><NisaBondReel /></AbsoluteFill></HeadStyle.Provider>
);
