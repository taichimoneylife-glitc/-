# 図解部品カタログ（elements）

このプロジェクトで使える制御済みの図解部品。**推奨ベースは参考A準拠の `kit2.tsx`（クリーム＋丸ゴシック）**。白背景版は `kit.tsx`。

## kit2.tsx（参考A：クリーム＋丸ゴシック・推奨）
`import { ... } from "./components/kit2"`
- `BG2` … クリーム背景＋右上のやわらかい陽だまり（全シーンの土台）
- `Head({delay, top, size, children})` … 丸ゴシック極太の見出し（中央）
- `Mark2({delay, color, children})` … キーワードの黄色マーカー蛍光（左→右に引く）
- `Card2({delay, top, left, width, header, headColor, children})` … 白い角丸カード＋影、任意で色ヘッダー帯
- `Row2({label, value, highlight, valueColor, badge})` … カード内の行（値 or プレースホルダ棒、ハイライト可）＝比較表に使える
- `Gauge({delay, pct, top, minLabel, maxLabel, color, dur})` … 横ゲージバー（0→pct%、端ラベル、つまみ）
- `Big({delay, to, prefix, suffix, color, size, dur})` … 大きい数字カウントアップ
- `Tag({delay, text, color})` … 小さいタグ（要注意・税 など）
- `CharaCircle({delay, size, col})` … 白い円の中の丸いキャラ（ナレーター）
- `ArrowDown({delay, x, y, len, color})` … 下向き太矢印（描画アニメ）
- 配色 `A2`：bg #FBF3D0 / ink #2E2C26 / sub #8C8471 / green #2E9E6B / coral #EF7D57 / red #E8553B / marker #FCE07A

## kit.tsx（共通アニメ・白背景版）
`import { ... } from "./components/kit"`
- `WhiteBG` … 白(現在はクリーム)背景
- `Appear` / `PopIn` / `SlideIn` … 入場（フェード / ポップ / 左右スライド）
- `Float` … 常時ゆっくり浮遊＋登場
- `SceneFade({dur})` … シーンの入り／終わりをふわっと（軽い場面転換）
- `CountUp({delay,to,dur,prefix,suffix})` … 数字カウント
- `Mark({delay,type:'check'|'cross'|'tri'})` … ✓ / × / △ 丸バッジ
- `HeadChip` … 赤い縦線＋枠の見出しチップ
- `DrawLine` / `GrowBar` … 線の描画 / 縦棒グラフの伸び
- `Marker` / `Chara` … マーカー蛍光 / 丸キャラ（kit2版が新しい）

## illus.tsx（塗り込みイラスト・ベクター）
`import { ... } from "./components/illus"` … 外部画像が無い時の代替に。
`IllCar`(車) / `IllWalletBank`(財布+銀行) / `IllGrowMoney`(お金の木) / `IllFamily`(家族) / `IllUSA`(星条旗+上昇矢印) / `IllTrophy`(トロフィー)。size指定。

## genArt.tsx（外部AI画像の差し込み）
`import { GenImg } from "./components/genArt"` → `<GenImg name="s4_usa" size={360} />`
`public/gen/<name>.png` を表示。**PNGがまだ無い場合はプレースホルダを出す実装にしておく**（本番前に差し替え）。

## sfx.tsx（効果音）
`import { Sfx, SfxTrack } from "./components/sfx"`
- `<Sfx name="pop" at={104} volume={0.5} />` … ローカルフレームで鳴らす
- `<SfxTrack cues={[{name:'pop',at:104},{name:'tick',at:190}]} />`
- 音源：`public/sfx/{pop,whoosh,tick,ding,success}.wav`（`scripts/gen-sfx.mjs`で生成）

## 使い分けの目安
- **比較（株 vs 債券 / 現金 vs ローン）** → `Card2`＋`Row2`(highlight) or 左右カード＋`SlideIn`
- **数字（500万/5%/+260万）** → `Big`/`CountUp`（tick→ding）
- **割合・水準（金利5%/成長）** → `Gauge`
- **流れ（元手→運用）** → `ArrowDown`/`DrawLine`
- **カテゴリ（教育/老後/特別費）** → `Tag` or アイコン付き小カードを順次
- **主役の絵** → 外部画像`GenImg`（無ければ`illus.tsx`）
