---
name: talk-reel
description: 自分が話しているトーク動画（縦のリール）に、語同期の字幕・寄り（ズーム）・図解・効果音を自動で入れて仕上げる。図解だけの比較動画（Aさん vs Bさん）や、ページ送りの図解動画も作れる。「トークリールを編集して」「字幕を入れて」「図解を入れて」「比較動画を作って」と言われたら使う。
---

# トークリール自動編集（Remotion）

## まず読むもの
- `references/workflow.md` … 全体の流れ・設計表・確認チェックリスト（毎回）
- `references/captions.md` … 字幕のルール
- `references/diagram-motion.md` … 図解の動き（人気の図解リールの分析）
- `references/compare-format.md` … Aさん vs Bさんの比較動画の型（比較を作る時は必ず）
- `references/retention.md` … 2秒・8秒・15秒の離脱対策（冒頭を作る時は必ず）
- `references/talk-overlay-study.md` … 実写＋図解の編集の研究
- `references/sfx.md` … 効果音の一覧と使い分け（効果音を入れる時は必ず）

## 1本の作り方（トークリール）
1. 動画を受け取る → `bash scripts/prep_video.sh 元の動画.mov`（public/talk.mp4 ができる）
2. 文字起こし → `python3 scripts/transcribe.py public/talk.mp4`（public/words.json）。固有名詞・数字のまちがいは words.json の `w` を直す
3. 話を読んで **設計表** を作る（workflow.md の表）。どこで寄るか、どこに図解を出すか、どの言葉を強調するか
4. `src/talk/plan.ts` を書きかえる（video / words / emph / inserts）
5. 確認：`npx remotion still TalkReel out/check.png --frame=数字`（静止画で重なりを見る）
6. 書き出し：`npx remotion render TalkReel out/talk.mp4`
7. チェックリストで通しで確認 →「場所＋変更内容」で1つずつ直す

## 図解だけの動画
- 比較（Aさん vs Bさん）：`src/examples/CompareExample.tsx` をコピーして中身を変える
- 順番のある話（STEP1〜3）：`src/examples/BoardExample.tsx`（1枚の地図の上をカメラが移動する型）
- 部品：`src/diagram/parts.tsx`（Head / Card / Chip / Stamp / Door / Stripe / Donut / HBars / LineGrow / PlusMinus / CheckLine / Badge / Bounce）、`src/diagram/board.tsx`（Board / Stepper）、`src/diagram/cam.tsx`（Camera / Spot / Callout / SpeedLines）

## 守ること
- **声が主役**。図解は声を助けるだけ。図解に書いてあることを、そのまま字幕で二重に言わせない
- 置き場所：図解は頭の上（y 140〜640）、字幕は下1/3（y≈1250）。**顔・口元・手にかぶせない**。y 1400 より下と右はしはインスタのボタン・説明文で隠れるので何も置かない
- 効果音は **public/sfx/ の音（u01〜u10・単発版）だけ**を使う。合成音や別の音を作って足さない
- **0秒ちょうどに効果音を鳴らさない**。効果音は控えめ（声を消さない）
- 図解の背景は**白＋青いノート線**（theme.ts）。色は theme.ts の T から使う
- 数字は必ず計算して確かめる。仮定の数字には「仮定の試算」と小さく書く
- 静止画の確認は1枚ずつ順番に（同時にたくさん出すとメモリ不足で落ちる）
- 修正したら、直した所を静止画で見てから書き出す
