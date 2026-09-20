# public/（素材置き場）

冒頭に実写クリップ（手元・お札・スーパー等）を差し込みたい場合は、
動画素材をこのフォルダに `intro.mp4` として置き、
`src/scenes/Intro.tsx` の `OffthreadVideo` のコメントを外してください。

画像・音声も同様にここへ置き、`staticFile("ファイル名")` で参照できます。
（例：BGMを `bgm.mp3` として置き、`<Audio src={staticFile("bgm.mp3")} />` を追加）
