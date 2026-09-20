# public/（素材置き場）

`staticFile("ファイル名")` でここのファイルを参照できます。

## intro.mp4（サンプル）

`intro.mp4` は実写合成版（Composition: `MoneyReel-Footage`）の**動作確認用サンプル**です。
手元の実写クリップ（手元・お札・店内など）に差し替えれば、そのまま反映されます。
テロップの文言・位置は `src/scenes/IntroFootage.tsx` で調整します。

## 音声を足したい場合

BGMやナレーションを付けるなら、音声ファイルをここに置いて `<Audio>` を追加します。

```tsx
import { Audio, staticFile } from "remotion";
<Audio src={staticFile("bgm.mp3")} volume={0.3} />
```
