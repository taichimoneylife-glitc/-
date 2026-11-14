// 文字起こし（scripts/transcribe.py が作る public/words.json の形）
export type Word = { w: string; s: number; e: number }; // 言葉・始まり秒・終わり秒
export type Words = { duration: number; words: Word[] };

// 字幕の強調：言葉の一部が当たったら色を変える
export type Emph = { match: string; color?: string; marker?: boolean };

// 図解の差し込み（from〜to 秒）。type ごとに props が決まっている（inserts.tsx）
export type Insert =
  | { type: "title"; from: number; to: number; props: { pill?: string; text: string } }
  | { type: "steps"; from: number; to: number; props: { title: string; items: string[]; gap?: number } }
  | { type: "number"; from: number; to: number; props: { label: string; value: number; unit?: string; note?: string } }
  | { type: "flow"; from: number; to: number; props: { items: string[]; gap?: number } }
  | { type: "check"; from: number; to: number; props: { title: string; items: string[]; gap?: number } }
  | { type: "compare"; from: number; to: number; props: { title: string; a: { name: string; value: number; unit?: string }; b: { name: string; value: number; unit?: string }; diffLabel?: string } }
  | { type: "stamp"; from: number; to: number; props: { text: string } }
  | { type: "bignum"; from: number; to: number; props: { value: number; pre?: string; unit?: string; color?: string } };

// 画面の型（from〜to 秒）。書いていない時間は「本人だけ（full）」
//  split＝上半分に画像/動画、下半分に本人／card＝本人がカードに縮み、後ろはぼかした本人＋大きな影の文字
//  sky＝空のような背景に文字のノードが線でつながる（テロップは出さない）／end＝文字だけの締め
export type Segment =
  | { mode: "full"; from: number; to: number; mono?: boolean }
  | { mode: "split"; from: number; to: number; top: { src: string; video?: boolean; fit?: "cover" | "contain" }; mono?: boolean }
  | { mode: "card"; from: number; to: number; echo?: string; mono?: boolean }
  | { mode: "sky"; from: number; to: number; nodes: { t: number; text: string; mark?: string }[] }
  | { mode: "end"; from: number; to: number; lines: { t: number; text: string }[]; dark?: boolean };

export type TalkPlan = {
  video: string; // public/ の中の動画ファイル名
  words: string; // public/ の中の words.json
  emph: Emph[]; // 字幕の強調
  inserts: Insert[]; // 図解の差し込み
  segments?: Segment[]; // 画面の型の切り替え（なければずっと本人だけ）
  capStyle?: "clean" | "box"; // clean＝短く白い字幕（参考⑧）／box＝今の言葉に色の箱
  punches?: number[]; // 寄る秒（空なら、強調語と図解の頭で自動）
  sfx?: boolean; // 効果音を自動で入れるか（public/sfx の u02s・u03s・u05s を使う）
  grade?: boolean; // 映像を少し色補正するか
};
