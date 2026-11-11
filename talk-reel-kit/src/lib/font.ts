import { staticFile, delayRender, continueRender } from "remotion";

// 日本語フォント（Noto Sans JP / Noto Serif JP・SIL Open Font License）を public/fonts から読む。
// レンダーの環境では Google Fonts の取得が失敗することがあるので、ファイルを同梱している。
export const FONT = "Noto Sans JP, sans-serif";
export const FONT_BLACK = "Noto Sans JP Black"; // 極太（見出し・字幕・数字）
export const FONT_SERIF = "Noto Serif JP Black"; // 明朝の極太（キーワードを赤の明朝で出す用）

const face = (family: string, weight: number, file: string) =>
  new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, { weight: String(weight), style: "normal", display: "swap" });

const faces = [
  face("Noto Sans JP", 400, "noto-sans-jp-japanese-400-normal.woff2"),
  face("Noto Sans JP", 700, "noto-sans-jp-japanese-700-normal.woff2"),
  face("Noto Sans JP", 400, "noto-sans-jp-latin-400-normal.woff2"),
  face("Noto Sans JP", 700, "noto-sans-jp-latin-700-normal.woff2"),
  face("Noto Sans JP Black", 900, "noto-sans-jp-japanese-900-normal.woff2"),
  face("Noto Sans JP Black", 900, "noto-sans-jp-latin-900-normal.woff2"),
  face("Noto Serif JP Black", 900, "noto-serif-jp-japanese-900-normal.woff2"),
  face("Noto Serif JP Black", 900, "noto-serif-jp-latin-900-normal.woff2"),
];

if (typeof document !== "undefined") {
  const handle = delayRender("load-fonts");
  Promise.all(faces.map((f) => f.load().then((loaded) => document.fonts.add(loaded))))
    .then(() => continueRender(handle))
    .catch((e) => {
      console.warn("font load failed", e);
      continueRender(handle);
    });
}

export const K = { fontFamily: FONT_BLACK, fontWeight: 900 as const };
export const SER = { fontFamily: FONT_SERIF, fontWeight: 900 as const };
