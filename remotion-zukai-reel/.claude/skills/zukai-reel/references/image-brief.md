# 画像指示書の書き方（image-brief）

外部の画像生成AI（ユーザーが使う。Codex/OpenAI画像/Midjourney/Gemini等）向けに、**必要なイラストだけ**を指示する。図解・数字・矢印・比較・アイコン・テロップは図解側（Claude）で出すので、画像は「各シーンの主役イラスト」に絞る。

生成物は `assets/image_brief.md`。実際の例は `remotion-zukai-reel/assets/image_brief.md` を参照。

## 構成
1. **共通スタイル**（毎回プロンプト末尾に付ける）を最初に置く：
```
cute pop flat illustration, rounded soft shapes, thick clean outlines,
warm friendly palette (navy, red-orange, gold, cream/green accents),
minimal and modern, single centered subject, generous empty padding,
NO text, no letters, no numbers, transparent background, 1:1 square, high quality
```
2. **表**：`ファイル名` / `使う場所（何枚目）` / `主題プロンプト`。ファイル名はシーン準拠（例 `s4_usa.png`）。
3. **メモ**：透過PNG・正方形・被写体中央・余白多め・文字を入れない、を明記。アイコンや図形は画像不要と書く。

## コツ
- 1シーン1〜2枚に絞る（多すぎると画風が揃わない／手間が増える）。
- 主題は名詞句で短く、感情/トーンを一語添える（trustworthy, anxious, calm, premium, hopeful 等）。
- 人物は全身 or 上半身、余白多めだと配置しやすい。
- 生成後は `public/gen/<name>.png` に置いてもらい、`GenImg name="<name>"` で差し込む。

## 完全自動にしたい場合（任意）
`OPENAI_API_KEY` が環境にあれば `node scripts/gen-images.mjs`（このリポジトリ）で image_brief 相当のプロンプトから一括生成できる。無い場合はユーザー生成が前提。ChatGPT/Codexのログインは画像APIの代わりにならない点に注意。
