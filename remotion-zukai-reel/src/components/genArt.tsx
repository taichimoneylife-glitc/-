import React from "react";
import { Img, staticFile } from "remotion";

// AI生成イラスト（public/gen/<name>.png）を図解の art スロットに差し込むためのヘルパー。
// 使い方: art: <GenImg name="p5b_bond" size={360} />
export const GenImg: React.FC<{ name: string; size: number }> = ({ name, size }) => (
  <Img
    src={staticFile(`gen/${name}.png`)}
    style={{ width: size, height: size, objectFit: "contain" }}
  />
);
