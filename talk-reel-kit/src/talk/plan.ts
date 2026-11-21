import type { TalkPlan } from "./types";

// ════════════════════════════════════════════════════════════
//  ★ 1本ごとに、ここだけ書きかえる ★
//  1) 動画を public/talk.mp4 に置く → python3 scripts/transcribe.py public/talk.mp4（public/words.json ができる）
//  2) video / words を自分のファイルに変える
//  3) words.json の秒を見ながら、segments（画面の型）・inserts（図解）・emph（強調する言葉）を書く
//     目安：画面の型は2〜4秒ごとに変える（同じ型が5秒以上続かないように）
//  いまはサンプル（public/sample/）を指している
// ════════════════════════════════════════════════════════════
export const PLAN: TalkPlan = {
  video: "sample/sample.mp4",
  words: "sample/sample_words.json",
  capStyle: "clean",
  emph: [
    { match: "固定費", color: "#FFB23D" },
    { match: "3つ", color: "#FFB23D" },
    { match: "分からない", color: "#FF6B6B" },
    { match: "年間", marker: true },
  ],
  segments: [
    { mode: "split", from: 0, to: 4.0, top: { src: "sample/screen.png" } }, // 上：画面／下：本人
    { mode: "card", from: 4.0, to: 7.9, echo: "分からない" }, // 強い一言はカード型
    // 7.9〜15.5 は書いていないので「本人だけ」
    { mode: "sky", from: 15.5, to: 21.5, nodes: [
      { t: 15.6, text: "やることは3つ" },
      { t: 16.9, text: "明細を見る" },
      { t: 18.3, text: "使ってない物を止める", mark: "止める" },
      { t: 19.9, text: "浮いたお金を積み立てる", mark: "積み立てる" },
    ] },
    { mode: "end", from: 24.7, to: 26.2, lines: [{ t: 24.7, text: "保存して\n今日やってみて" }] },
    { mode: "end", from: 26.2, to: 27.8, dark: true, lines: [{ t: 26.2, text: "コメントで\n「家計」と送ってね" }] },
  ],
  inserts: [
    { type: "steps", from: 8.0, to: 11.8, props: { title: "見直す3つ", items: ["スマホ", "保険", "サブスク"], gap: 0.8 } },
    { type: "bignum", from: 13.4, to: 15.4, props: { value: 60000, unit: "円" } },
    { type: "compare", from: 21.6, to: 24.6, props: { title: "10年でくらべると", a: { name: "見直した", value: 60, unit: "万円" }, b: { name: "そのまま", value: 0, unit: "万円" }, diffLabel: "浮いたお金" } },
  ],
  sfx: true,
};
