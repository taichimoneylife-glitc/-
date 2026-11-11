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
  | { type: "stamp"; from: number; to: number; props: { text: string } };

export type TalkPlan = {
  video: string; // public/ の中の動画ファイル名
  words: string; // public/ の中の words.json
  emph: Emph[]; // 字幕の強調
  inserts: Insert[]; // 図解の差し込み
  punches?: number[]; // 寄る秒（空なら、強調語と図解の頭で自動）
  sfx?: boolean; // 効果音を自動で入れるか（public/sfx の u02s・u03s・u05s を使う）
  grade?: boolean; // 映像を少し色補正するか
};
