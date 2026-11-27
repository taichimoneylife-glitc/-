# トークリール自動編集キット（Claude Code ＋ Remotion）

自分が話している縦のトーク動画に、**語同期の字幕・寄り（ズーム）・図解・効果音**を自動で入れて仕上げるキットです。
話した所に字幕を自動で入れて、ところどころに図解を出すのがメインです。
画面の型（本人だけ／上下2分割／カード型／空の背景のフロー図／文字だけの締め）を2〜4秒ごとに切り替えて、飽きない動画にします。

Claude Code にこのフォルダを開いてもらい、「この動画をトークリールに編集して」と頼むのが基本の使い方です。
作り方は `.claude/skills/talk-reel/` に入っているので、Claude Code が自動で読みます。

## はじめに（1回だけ）
1. Node.js（18以上）と ffmpeg、Python 3 を入れる
2. このフォルダで `npm install`
3. 文字起こし用：`pip install faster-whisper`
4. お試し：`npx remotion studio` → 左の TalkReel を再生（BoardExample は図解の動きのおまけの見本）

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
| `src/examples/` | おまけ：図解の動きの見本（BoardExample＝ページ送り・スポット・引き出し線） |
| `scripts/` | 動画をそろえる（prep_video.sh）、文字起こし（transcribe.py） |
| `public/fonts/` | 日本語フォント（Noto Sans JP / Noto Serif JP・SIL OFL） |
| `public/sfx/` | 効果音（u01〜u10 と単発版 u02s / u03s / u05s / u10s）。使い分けは `.claude/skills/talk-reel/references/sfx.md` |
| `public/sample/` | お試し用のサンプル（人の形の仮の映像＋仮の文字起こし） |
| `.claude/skills/talk-reel/` | 作り方のルールとノウハウ（流れ・字幕・図解の動き・効果音・離脱対策） |

## 画面の型（plan.ts の segments）
| mode | 見せ方 | 字幕の位置 |
|---|---|---|
| （書かない所） | 本人だけ・ゆっくり寄り | 胸のあたり |
| split | 上半分に画面の録画・画像、下半分に本人 | 分かれ目のすぐ下 |
| card | 本人が角丸のカードに縮む。後ろはぼかした本人＋大きな影の文字が流れる | カードの中 |
| sky | 空のような背景に、文字が線でつながってカメラが下へ流れる（赤い手書きの下線） | 出さない（図の文字が字幕の代わり） |
| end | 文字だけの締め（グレー／黒） | 出さない |

## 図解の種類（plan.ts の inserts）
| type | 見せ方 | 置き場所 |
|---|---|---|
| title | 札＋見出し | 頭の上 |
| steps | 番号つきカードが1枚ずつ | 頭の上 |
| number | 大きな数字がカウントアップ | 頭の上 |
| flow | A → B → C の流れ | 頭の上 |
| check | チェックリストに✓が入る | 頭の上 |
| compare | 2つの数字を比べる（例：見直した／そのまま） | 全画面（白い紙の背景） |
| stamp | 斜めのハンコ | 顔の横 |
| bignum | 大きな緑の数字がカウントアップ | 本人の胸の前 |

## 注意
- 自分の動画・音声・文字起こし（talk.mp4 / words.json）は `.gitignore` 済み。リポジトリに入れない
- 効果音は `public/sfx/` の音だけを使う（ほかの音は足さない）。0秒ちょうどには鳴らさない
- 数字は必ず計算して確かめる。仮定の数字には「仮定の試算」と書く
