# このフォルダについて
縦のリール（1080x1920・30fps）を Remotion で作るキット。トーク動画の自動編集と、図解の動画。
作業を始める前に `.claude/skills/talk-reel/SKILL.md` を読み、そこに書いてある references を必要に応じて読む。

- 返事はやさしい日本語で、短く
- 型チェック：`npx tsc --noEmit -p .`
- 静止画の確認：`npx remotion still <名前> out/x.png --frame=数字 --scale=0.4`（1枚ずつ順番に）
- 書き出し：`npx remotion render <名前> out/x.mp4`
- 1本ごとに書きかえるのは `src/talk/plan.ts`。部品の変更は全部の動画に効くので慎重に
