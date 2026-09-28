---
name: zukai-reel
description: >-
  Build or update an audio-synced Japanese explainer "図解リール" (vertical 1080x1920
  short video) in this Remotion project from the user's narration audio. Use this
  whenever the user wants a 図解 / 解説リール / Instagram Reel / TikTok / Shorts made from
  their アフレコ(narration), asks to sync diagrams/telops/numbers to their voice,
  wants a design doc (設計書/構成/絵コンテ) or an image brief (欲しい画像/イラスト指示) for a reel,
  or asks to add/adjust illustrations, animations, or 効果音 in the reel — even if they
  don't say "Remotion". The narration is the star; diagrams only reinforce it.
  Illustrations are produced by an EXTERNAL image AI (the user), never by this skill.
---

# 図解リール制作（zukai-reel）

このプロジェクト（`remotion-zukai-reel`）で、ユーザーのアフレコ音声から**音声に完全同期した縦型の図解リール**を作る／直すためのスキル。

## 中心思想（なぜこの作りか）
**音声（アフレコ）が主役で、図解はそれを補強する脇役**。だから「話している瞬間に、その語に必要な要素だけを出す」。要素は同時に出し切らず、話が進むにつれ**順番に完成**していく。これが「静止画を並べただけ」に見えない核心。

## デザイン指針（参考動画A準拠・確定）
ユーザーが「これがいい」と確定した見た目・演出。`src/components/kit2.tsx` が実装。
- **背景＝フラットな薄黄色 `#FBF6D8`。右上の丸い陽だまり（円）は無し**（ユーザーが明示的に不要と指定）。
- **フォント＝丸ゴシック（M PLUS Rounded 1c）**。見出しは極太・チャコール `#2E2C26`。
- **テロップ**：短く要点、キーワードに黄色マーカー蛍光（`Mark2`）、色替えは強調だけ（緑=良い/コーラル=注意）。原文の語を保つ。
- **テンポ＝速め・気持ちよく**。3秒以上の静止を作らない。要素は順次で"完成していく"。
- **効果音は必ず入れる**（`Sfx`/`SfxTrack`）。pop=出現 / whoosh=スライド・転換 / tick=カウント / ding=強調 / success=締め。テンポと一致させる。
- **図解の動きの語彙**（参考Aで特に良かった点）：
  - 要素が**スライドして移動**（左右/上下から入る、位置が動く）
  - **前の情報を薄くする**（説明が次へ進んだら過去要素を opacity↓ ＝ `Dim`）。今フォーカスすべき所を明るく保つ。
  - **段階的な出現**（一度に出さず、話に合わせて1つずつポップ）
- **イラスト演出の例**：数量やリスクが増える様子は**同じタグを重ねて積み上げる**（例 税・税・税）＝ `StackTags`。「増える/積み重なる」を視覚化。
- カード=白・角丸大・やわらか影・色ヘッダー帯。数字=大きく緑。割合=横ゲージ。キャラ=白い円の中の丸い人物。

## 絶対に守るルール（ユーザーが過去に強く嫌がった点）
- **ユーザーの文言（コピー）を勝手に変えない。** テロップはナレーションの言葉・数字をそのまま使う。言い換え・要約の"改変"はしない（要点として短く出す時も原文の語を保つ）。
- **一度に大きく作り変えない。** ユーザーが指定した1点だけを直す。頼まれていないのに全体を作り直さない。
- **イラストは外部AIが作る。** このスキルは「どんな画像が欲しいか」の指示書を出すだけ。画像を自分で生成したと偽らない。
- **テロップ・矢印・数字の制御スタイルは今のまま**保つ（作り込み済みの部品を使う）。
- **本番レンダー前に必ず数フレームを静止画で確認**（`npx remotion still <Comp> out/chk/fN.png --frame=N`）。崩れがないか目視してから通しレンダー。

## 入力
- ナレーション音声：`public/*.m4a`（例 `car-narration.m4a`）。噛み・言い直しはカット済みのクリーン版を使う（無ければ作る）。
- ユーザーが文字起こし／シーン割りをテキストで渡してくれることも多い。**その文言を最優先**で使う。

## 生成物（成果物ファイルの規約）
既存の命名に合わせる：
- `transcript_with_timestamps.json` … 音声を意味単位(1〜3秒)に細分＋各単位で見せる要素
- `scene_plan.json` / `storyboard.md` … シーン設計（時間・メッセージ・テロップ・図解要素・アニメ・効果音・画像スロット）
- `captions.srt` … 要点テロップ（原文の語を保つ）
- `narration_alignment.json` … 音声区間↔表示要素↔出現フレーム
- `assets/image_brief.md` … 外部AI用の画像指示書（下記）
- `analysis/current_video_review.md` … 既存動画を直す時の課題メモ
- `out/final_video.mp4` … 完成動画

## 制作フロー
1. **音声解析・文字起こし**：Whisper系が無ければ、ユーザー提供のテキスト＋音声の区切りから `transcript_with_timestamps.json` を作る。fps=30 なので `frame = round(sec*30)`。
2. **ビート設計**：各発話を1〜3秒のビートに割り、各ビートで出す要素（テキスト/数字/アイコン/画像/図）と**出現秒**を決める。話す瞬間に一致させる（先出し・遅れ禁止）。→ `scene_plan.json` / `narration_alignment.json`。
3. **絵コンテ**：`storyboard.md` に人が読める形でまとめる（時間・テロップ・図解・画像・動き・効果音）。`captions.srt` も出す。
4. **画像指示書**：`assets/image_brief.md` に、必要なイラストを **ファイル名＋主題プロンプト＋共通スタイル** で列挙。詳しくは `references/image-brief.md`。ユーザーが外部AIで生成 → `public/gen/<name>.png`（透過PNG）へ。アイコン(教育/老後等)や図形は画像不要、図解側で出す。
5. **シーン実装**：`src/components/` の部品で組む。カタログは `references/elements.md`。新コンポジションは `src/<Name>.tsx` に作り `src/Root.tsx` に登録。既存の到達点：
   - `src/CarReelV2.tsx` … 参考A準拠（クリーム背景＋丸ゴシック＋やわらかカード＋横ゲージ＋マーカー＋丸キャラ）＝**推奨ベース**
   - `src/CarSyncReel.tsx` … 白背景コーポレート調
   画像は `src/components/genArt.tsx` の `GenImg` で差し込む（PNGがまだ無ければラベル付きプレースホルダ）。
6. **アニメ**：入場fade/pop、カウントアップ、棒/ゲージ伸び、マーカー、左右スライド、常時ふわっと(Float)、シーン間ソフト転換(SceneFade)。
7. **効果音（自動）**：`src/components/sfx.tsx` の `Sfx`/`SfxTrack` で、ビートに合わせて `public/sfx/*.wav` を鳴らす（pop=カード, whoosh=スライド/転換, tick=カウント, ding=強調, success=締め）。音源が無ければ `node .claude/skills/zukai-reel/scripts/gen-sfx.mjs` で合成スターターパックを生成（ネット不要）。本物素材に差し替え可。
8. **確認→レンダー**：静止画で数フレーム確認 → `npx remotion render <Comp> out/final_video.mp4`。SendUserFileで渡す。

## 依存関係（正直に）
- **イラスト**：この環境では画像生成不可。外部AI（ユーザー）が作る前提。完全自動化したい場合のみ `OPENAI_API_KEY` を環境に設定 → `node scripts/gen-images.mjs` で `image_brief` から自動生成できる（別ドア。ChatGPT/Codexのログインでは不可）。
- **効果音**：`public/sfx/` の音源が必要（上記スクリプトで用意）。
- **フォント**：丸ゴシックは `public/fonts/m-plus-rounded-1c-*.woff2` を同梱し `src/components/font.ts` で読込（レンダー環境はGoogle Fonts取得不可のためローカル同梱必須）。

## 直し（更新）の作法
既存リールを直す時は、**頼まれた1点だけ**を該当シーンで変更 → 静止画確認 → 再レンダー。文言は触らない。全面作り直しはユーザーが明示した時だけ。

詳細リファレンス：
- `references/elements.md` … 使える図解部品（カード/数字/比較/矢印/アイコン/ライン/吹き出し/ゲージ/マーカー/キャラ/効果音）
- `references/image-brief.md` … 画像指示書の書き方と共通スタイル
