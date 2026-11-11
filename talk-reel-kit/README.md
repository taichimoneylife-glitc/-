# トークリール自動編集キット（Claude Code ＋ Remotion）

自分が話している縦のトーク動画に、**語同期の字幕・寄り（ズーム）・図解・効果音**を自動で入れて仕上げるキットです。
図解だけの動画（**Aさん vs Bさんの比較**、STEP1〜3のページ送り）も作れます。

Claude Code にこのフォルダを開いてもらい、「この動画をトークリールに編集して」と頼むのが基本の使い方です。
作り方は `.claude/skills/talk-reel/` に入っているので、Claude Code が自動で読みます。

## はじめに（1回だけ）
1. Node.js（18以上）と ffmpeg、Python 3 を入れる
2. このフォルダで `npm install`
3. 文字起こし用：`pip install faster-whisper`
4. お試し：`npx remotion studio` → 左の TalkReel / CompareExample / BoardExample を再生

## 1本の作り方
```bash
bash scripts/prep_video.sh 撮った動画.mov          # public/talk.mp4 ができる（縦1080x1920・30fps）
python3 scripts/transcribe.py public/talk.mp4      # public/words.json ができる（言葉ごとの秒）
# src/talk/plan.ts を書きかえる（video: "talk.mp4", words: "words.json"、強調語、図解を出す秒）
npx remotion render TalkReel out/talk.mp4         # 書き出し
```
plan.ts は Claude Code に「words.json を読んで、設計表を作って plan.ts を書いて」と頼めば作ってくれます。

## 入っているもの
| 場所 | 中身 |
|---|---|
| `src/talk/` | トークリール本体（TalkReel）、字幕（Captions）、上にのせる図解（inserts）、**plan.ts＝1本ごとに書きかえる所** |
| `src/diagram/` | 図解の部品（カード・札・ハンコ・ドーナツ・棒・折れ線・±まとめ・ページ送り・スポット・引き出し線） |
| `src/examples/` | 見本：比較動画（CompareExample）、ページ送り（BoardExample） |
| `scripts/` | 動画をそろえる（prep_video.sh）、文字起こし（transcribe.py）、効果音を作る（gen-sfx.mjs） |
| `public/fonts/` | 日本語フォント（Noto Sans JP / Noto Serif JP・SIL OFL） |
| `public/sfx/` | 合成の効果音（pop / whoosh / tick / ding / success）。自分で用意した音を足してもOK |
| `public/sample/` | お試し用のサンプル（人の形の仮の映像＋仮の文字起こし） |
| `.claude/skills/talk-reel/` | 作り方のルールとノウハウ（流れ・字幕・図解の動き・比較動画の型・離脱対策） |

## 図解の種類（plan.ts の inserts）
| type | 見せ方 | 置き場所 |
|---|---|---|
| title | 札＋見出し | 頭の上 |
| steps | 番号つきカードが1枚ずつ | 頭の上 |
| number | 大きな数字がカウントアップ | 頭の上 |
| flow | A → B → C の流れ | 頭の上 |
| check | チェックリストに✓が入る | 頭の上 |
| compare | Aさん vs Bさんの数字の比較 | 全画面（紙の背景） |
| stamp | 斜めのハンコ | 顔の横 |

## 注意
- 自分の動画・音声・文字起こし（talk.mp4 / words.json）は `.gitignore` 済み。リポジトリに入れない
- ダウンロードした効果音は、配布してよいか利用規約を確認（`public/sfx/lab/` に置けば git に入らない）
- 数字は必ず計算して確かめる。仮定の数字には「仮定の試算」と書く
