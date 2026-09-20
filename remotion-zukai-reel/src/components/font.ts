import { loadFont } from "@remotion/google-fonts/NotoSansJP";

// 日本語表示のために Noto Sans JP を読み込む（太字まで含む）。
const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
});

export const FONT = fontFamily;
