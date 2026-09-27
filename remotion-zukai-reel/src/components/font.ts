import { staticFile, delayRender, continueRender } from "remotion";

// 丸ゴシック（M PLUS Rounded 1c）をメインに、Noto Sans JP をフォールバックで同梱。
// レンダー環境では Google Fonts 取得が失敗するため、public/fonts の woff2 を @font-face で使う。
export const FONT = "M PLUS Rounded 1c, Noto Sans JP, sans-serif";
export const FONT_ROUND = "M PLUS Rounded 1c";

const face = (family: string, weight: number, file: string) =>
  new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, { weight: String(weight), style: "normal", display: "swap" });

const faces = [
  // 丸ゴシック（メイン）
  face("M PLUS Rounded 1c", 700, "m-plus-rounded-1c-japanese-700-normal.woff2"),
  face("M PLUS Rounded 1c", 800, "m-plus-rounded-1c-japanese-800-normal.woff2"),
  face("M PLUS Rounded 1c", 700, "m-plus-rounded-1c-latin-700-normal.woff2"),
  face("M PLUS Rounded 1c", 800, "m-plus-rounded-1c-latin-800-normal.woff2"),
  // Noto（フォールバック）
  face("Noto Sans JP", 400, "noto-sans-jp-japanese-400-normal.woff2"),
  face("Noto Sans JP", 700, "noto-sans-jp-japanese-700-normal.woff2"),
  face("Noto Sans JP", 400, "noto-sans-jp-latin-400-normal.woff2"),
  face("Noto Sans JP", 700, "noto-sans-jp-latin-700-normal.woff2"),
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
