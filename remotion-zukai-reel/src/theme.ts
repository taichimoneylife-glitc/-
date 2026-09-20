// ── 図解リールの配色（元動画を解析して抽出した3色＋グレー）──
// この色数を絞るのが「図解っぽさ」の最大のコツ。増やしすぎないこと。
export const COLORS = {
  bg: "#F4EFF2", // 淡いピンク/ラベンダーの背景
  ink: "#1B2A4A", // 線・文字のネイビー
  accent: "#E5432B", // 差し色の赤オレンジ
  gray: "#C9CDD6", // 塗りのグレー
  grayLight: "#E3E5EA", // 薄いグレー
  white: "#FFFFFF",
} as const;

// 線画の太さ（1080px幅を基準）
export const STROKE = 8;
