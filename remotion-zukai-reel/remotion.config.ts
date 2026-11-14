import { Config } from "@remotion/cli/config";

// レンダリング設定
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// H.264 / MP4（SNS向け）
Config.setCodec("h264");
