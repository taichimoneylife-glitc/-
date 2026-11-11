import type { TalkPlan } from "./types";

// ════════════════════════════════════════════════════════════
//  ★ 1本ごとに、ここだけ書きかえる ★
//  1) 動画を public/talk.mp4 に置く → python3 scripts/transcribe.py public/talk.mp4（public/words.json ができる）
//  2) video / words を自分のファイルに変える
//  3) emph（強調したい言葉）と inserts（図解を出す秒）を、words.json の秒を見ながら書く
//  いまはサンプル（public/sample/）を指している
// ════════════════════════════════════════════════════════════
export const PLAN: TalkPlan = {
  video: "sample/sample.mp4",
  words: "sample/sample_words.json",
  emph: [
    { match: "固定費", color: "#FF8A3D" },
    { match: "3つ", color: "#FF8A3D" },
    { match: "年間", marker: true },
    { match: "保存", color: "#5BD38A" },
  ],
  inserts: [
    { type: "title", from: 0.2, to: 2.6, props: { pill: "家計", text: "固定費の見直し" } },
    { type: "steps", from: 3.0, to: 7.4, props: { title: "見直す3つ", items: ["スマホ", "保険", "サブスク"], gap: 0.8 } },
    { type: "number", from: 7.6, to: 10.2, props: { label: "月5,000円 下がると 年間で", value: 60000, unit: "円" } },
    { type: "compare", from: 10.4, to: 14.2, props: { title: "10年でくらべると", a: { name: "見直した", value: 60, unit: "万円" }, b: { name: "そのまま", value: 0, unit: "万円" }, diffLabel: "浮いたお金" } },
    { type: "check", from: 14.4, to: 18.0, props: { title: "今日やること", items: ["明細を1つ見る", "使ってない物を止める"] } },
  ],
  sfx: true,
};
