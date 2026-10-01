# RefClone 画像指示書（Codexで生成 → public/gen/ に置く）

絵文字プレースホルダを本物イラストに差し替えて精度を上げる用。
生成したら `public/gen/<ファイル名>.png`（**背景透過PNG**推奨）に置き、
`src/RefClone.tsx` 冒頭の `GEN` に1行追加すると反映される。

## 共通スタイル
- フラットなミニイラスト、太めの輪郭、やわらかい彩度。
- 単体で成立する正方形構図。影は軽く。文字は入れない（ラベルは図解側で出す）。
- 色は自然でOK（緑黄に寄せる指定はしない）。

## 必要な画像（キー → ファイル名 → 主題プロンプト）
| キー | 推奨ファイル名 | 主題プロンプト（例） |
|---|---|---|
| satsuei | rc_satsuei.png | スマホ/カメラで撮影するアイコン。三脚＋カメラ、録画中の赤丸 |
| claude | rc_claude.png | AI編集を象徴するアイコン。オレンジの放射マーク＋きらめき |
| edit | rc_edit.png | 動画編集タイムライン。カラフルなトラック＋再生ヘッド |
| gohan | rc_gohan.png | ごはん茶碗＋箸、湯気。ほっこり |
| gym | rc_gym.png | ダンベル or 筋トレする人のミニフィギュア |
| kansei | rc_kansei.png | 完成した動画サムネ＋緑のチェック、きらめき |
| avatar | rc_avatar.png | 発信者本人のまる型アイコン（帽子の男性・上半身） |
| yt_thumb | rc_yt.png | YouTube編集画面のサムネ（タイムライン＋プレビュー） |
| promo | rc_promo.png | 「月20万円」収益カードのイラスト（グラフ上昇） |

## 反映方法
`src/RefClone.tsx` の:
```ts
const GEN: Record<string, string> = {
  satsuei: "rc_satsuei.png",
  gohan: "rc_gohan.png",
  gym: "rc_gym.png",
  kansei: "rc_kansei.png",
  claude: "rc_claude.png",
  edit: "rc_edit.png",
};
```
のコメントを外して置けばOK（置いてないキーは絵文字のまま）。
