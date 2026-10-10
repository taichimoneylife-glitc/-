import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { NisaSozokuDesign } from "./NisaSozokuDesign";

// ═══════════════════════════════════════════════════════════════════
// NISA 亡くなったら｜図解パート本番（アフレコ nisa_narration.wav 99.1s に同期）
//   冒頭フック・締めトークは実写で別撮り（この回は図解パートVOのみ）。
//   図解は NisaSozokuDesign のページを時間配置＋いらすとや画像＋効果音。
//   画像は下帯（y≈1200〜1600）に配置し、図解(上)とテロップ枠を分離＝被り防止。
// ═══════════════════════════════════════════════════════════════════
const FPS = 30;
const s2f = (s: number) => Math.round(s * FPS);
export const NISA_FRAMES = s2f(99.2) + 10;

// 音声アンカー（whisper セグメント開始＝セクション切替）
const A = {
  flow: 0,
  p1: s2f(8.48),
  p2: s2f(29.88),
  g_loss: s2f(44.64),
  g_gain: s2f(66.62),
  matome: s2f(78.82),
  souzokuzei: s2f(88.76),
  end: NISA_FRAMES,
};

// 1ページ＝図解のみ（イラストは図解の中に埋め込み済み・下帯なし）を時間配置
export const NisaSozokuReel: React.FC<{ audio?: boolean; sfx?: boolean }> = ({ audio = true, sfx = true }) => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT, backgroundColor: "#FCFBF7" }}>
      <Sequence from={A.flow} durationInFrames={A.p1 - A.flow}><NisaSozokuDesign page={2} /></Sequence>
      <Sequence from={A.p1} durationInFrames={A.p2 - A.p1}><NisaSozokuDesign page={3} /></Sequence>
      <Sequence from={A.p2} durationInFrames={A.g_loss - A.p2}><NisaSozokuDesign page={4} /></Sequence>
      <Sequence from={A.g_loss} durationInFrames={A.g_gain - A.g_loss}><NisaSozokuDesign page={5} /></Sequence>
      <Sequence from={A.g_gain} durationInFrames={A.matome - A.g_gain}><NisaSozokuDesign page={6} /></Sequence>
      <Sequence from={A.matome} durationInFrames={A.end - A.matome}><NisaSozokuDesign page={7} /></Sequence>

      {audio ? <Audio src={staticFile("nisa_narration.wav")} /> : null}
      {sfx ? <SfxTrack cues={[
        // ── 方針：各セクション頭に大転換u07(中)＋要素ごとに単発ポッu02s(中)。線/矢印=u03(中)。
        //        山場のキメだけ高音u04(各シーン1回)、帯=u10、締め=finish。中音主役でキンキンを回避。
        // 【流れ】
        { file: "user/u05", at: A.flow + 2, volume: 0.40 },    // 開幕
        { file: "user/u02s", at: A.flow + 20, volume: 0.40 },  // ①連絡
        { file: "user/u02s", at: A.flow + 74, volume: 0.38 },  // ②決める
        { file: "user/u02s", at: A.flow + 120, volume: 0.38 }, // ③書類
        { file: "user/u02s", at: A.flow + 169, volume: 0.38 }, // ④手続き
        { file: "user/u10", at: A.flow + 205, volume: 0.40 },  // ⛔帯
        // 【注意点①】
        { file: "user/u07", at: A.p1, volume: 0.44 },          // 大転換
        { file: "user/u05", at: A.p1 + 4, volume: 0.38 },
        { file: "user/u02s", at: A.p1 + 76, volume: 0.40 },    // 左NISA
        { file: "user/u02s", at: A.p1 + 95, volume: 0.38 },    // 右NISA
        { file: "user/u04", at: A.p1 + 135, volume: 0.42 },    // ✕継げない（キメ）
        { file: "user/u03", at: A.p1 + 184, volume: 0.36 },    // ↓描く
        { file: "user/u03", at: A.p1 + 268, volume: 0.36 },    // →移管描く
        { file: "user/u02s", at: A.p1 + 272, volume: 0.36 },   // 右課税
        { file: "user/u05", at: A.p1 + 466, volume: 0.40 },    // 受取→売却→買い直し 導入
        { file: "user/u02s", at: A.p1 + 520, volume: 0.40 },   // 受け取る
        { file: "user/u02s", at: A.p1 + 552, volume: 0.38 },   // 売却
        { file: "user/u02s", at: A.p1 + 584, volume: 0.40 },   // 買い直す
        // 【注意点②】
        { file: "user/u07", at: A.p2, volume: 0.44 },          // 大転換
        { file: "user/u05", at: A.p2 + 4, volume: 0.38 },
        { file: "user/u02s", at: A.p2 + 70, volume: 0.40 },    // 〇〇証券(亡)
        { file: "user/u03", at: A.p2 + 86, volume: 0.34 },     // →
        { file: "user/u02s", at: A.p2 + 96, volume: 0.38 },    // 〇〇証券(相)
        { file: "user/u02s", at: A.p2 + 116, volume: 0.38 },   // ○移せる
        { file: "user/u02s", at: A.p2 + 140, volume: 0.36 },   // 〇〇証券(亡)
        { file: "user/u02s", at: A.p2 + 150, volume: 0.36 },   // △△証券(相)
        { file: "user/u04", at: A.p2 + 182, volume: 0.42 },    // ✕移せない（キメ）
        { file: "user/u05", at: A.p2 + 258, volume: 0.40 },    // 開設カード
        { file: "user/u05", at: A.p2 + 384, volume: 0.42 },    // 今のうちに＋丸
        // 【③損グラフ】
        { file: "user/u07", at: A.g_loss, volume: 0.44 },      // 大転換
        { file: "user/u05", at: A.g_loss + 4, volume: 0.38 },
        { file: "user/u02s", at: A.g_loss + 200, volume: 0.40 }, // 積立1000万
        { file: "user/u03", at: A.g_loss + 300, volume: 0.38 },  // 線が下がる
        { file: "user/u02s", at: A.g_loss + 352, volume: 0.40 }, // 取得価格600万
        { file: "user/u03", at: A.g_loss + 458, volume: 0.38 },  // 線が回復
        { file: "user/u02s", at: A.g_loss + 506, volume: 0.40 }, // 回復1000万
        { file: "user/u06", at: A.g_loss + 524, volume: 0.34 },  // ＋400矢印
        { file: "user/u04", at: A.g_loss + 544, volume: 0.46 },  // 約81万（山場キメ）
        { file: "user/u10", at: A.g_loss + 578, volume: 0.40 },  // 説明帯
        // 【③益グラフ】
        { file: "user/u07", at: A.g_gain, volume: 0.42 },      // 転換
        { file: "user/u05", at: A.g_gain + 4, volume: 0.38 },
        { file: "user/u02s", at: A.g_gain + 90, volume: 0.40 }, // 元本500万
        { file: "user/u03", at: A.g_gain + 100, volume: 0.36 }, // 線が上がる
        { file: "user/u02s", at: A.g_gain + 128, volume: 0.40 }, // 新取得1000万
        { file: "user/u06", at: A.g_gain + 142, volume: 0.34 }, // ＋500矢印
        { file: "user/u04", at: A.g_gain + 160, volume: 0.44 }, // 500万非課税（キメ）
        { file: "user/u10", at: A.g_gain + 184, volume: 0.40 }, // 説明帯
        // 【まとめ】
        { file: "user/u07", at: A.matome, volume: 0.44 },      // 大転換
        { file: "user/u05", at: A.matome + 4, volume: 0.38 },
        { file: "user/u02s", at: A.matome + 59, volume: 0.40 },  // ①
        { file: "user/u02s", at: A.matome + 142, volume: 0.38 }, // ②
        { file: "user/u02s", at: A.matome + 200, volume: 0.38 }, // ③
        { file: "user/u03", at: A.souzokuzei, volume: 0.40 },    // ちなみに相続税（枠出現）
        { file: "user/u02s", at: A.matome + 396, volume: 0.36 }, // 3,000万
        { file: "user/u02s", at: A.matome + 432, volume: 0.36 }, // ＋600万
        { file: "user/u02s", at: A.matome + 458, volume: 0.36 }, // ×法定相続人
        { file: "user/u06", at: A.matome + 506, volume: 0.38 },  // ＝基礎控除
        { file: "user/u04", at: A.matome + 548, volume: 0.42 },  // かからない（キメ）
        { file: "finish", at: A.end - 50, volume: 0.44 },        // 締め
      ]} /> : null}
    </AbsoluteFill>
  );
};
