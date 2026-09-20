import { Composition } from "remotion";
import { MoneyReel } from "./MoneyReel";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./config";

// Remotion Studio / render はここに登録された Composition を読む。
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MoneyReel"
      component={MoneyReel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
