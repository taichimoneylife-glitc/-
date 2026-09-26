import { staticFile, delayRender, continueRender } from "remotion";

// 日本語フォント（Noto Sans JP）をローカル同梱で読み込む。
// レンダー環境では Google Fonts (fonts.gstatic.com) の証明書が信頼されず
// オンライン取得が失敗するため、public/fonts に置いた woff2 を @font-face で使う。
export const FONT = "Noto Sans JP";

const face = (weight: number, file: string) => new FontFace(
  FONT,
  `url(${staticFile(`fonts/${file}`)}) format('woff2')`,
  { weight: String(weight), style: "normal", display: "swap" }
);

// 日本語＋ラテン（数字・英字）両方を登録。日本語サブセットに数字が無い場合の保険。
const faces = [
  face(400, "noto-sans-jp-japanese-400-normal.woff2"),
  face(700, "noto-sans-jp-japanese-700-normal.woff2"),
  face(400, "noto-sans-jp-latin-400-normal.woff2"),
  face(700, "noto-sans-jp-latin-700-normal.woff2"),
];

if (typeof document !== "undefined") {
  const handle = delayRender("load-noto-sans-jp");
  Promise.all(
    faces.map((f) => f.load().then((loaded) => document.fonts.add(loaded)))
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      // 失敗してもレンダーは止めない（システムフォントにフォールバック）。
      console.warn("font load failed", e);
      continueRender(handle);
    });
}
