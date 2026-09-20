import { Composition } from "remotion";
import { MoneyReel } from "./MoneyReel";
import { FPS, TOTAL_FRAMES } from "./config";

// Remotion Studio / render はここに登録された Composition を読む。
// 同じ中身を、用途に合わせて複数のサイズ／バリエーションで登録している。
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 縦型 9:16（リール / Shorts / TikTok）＝メイン */}
      <Composition
        id="MoneyReel"
        component={MoneyReel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ footageIntro: false }}
      />

      {/* 冒頭を実写クリップ（public/intro.mp4）に差し替えた版 */}
      <Composition
        id="MoneyReel-Footage"
        component={MoneyReel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ footageIntro: true }}
      />

      {/* 正方形 1:1（フィード投稿向け） */}
      <Composition
        id="MoneyReel-Square"
        component={MoneyReel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ footageIntro: false }}
      />

      {/* 横型 16:9（YouTube 等） */}
      <Composition
        id="MoneyReel-Wide"
        component={MoneyReel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ footageIntro: false }}
      />
    </>
  );
};
