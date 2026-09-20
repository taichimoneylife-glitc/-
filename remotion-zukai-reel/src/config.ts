// 動画全体の尺・シーン構成。ここを触れば長さや順番を調整できる。
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920; // 9:16 縦型（リール / Shorts / TikTok）

// 各シーンの長さ（フレーム数）
export const DURATIONS = {
  intro: 120, // 4s
  trap: 150, //  5s × 4本
  outro: 150, // 5s
} as const;

export const TRAP_COUNT = 4;

// コンポジション全体の総フレーム数
export const TOTAL_FRAMES =
  DURATIONS.intro + DURATIONS.trap * TRAP_COUNT + DURATIONS.outro;
