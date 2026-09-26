import { Composition } from "remotion";
import { MoneyReel } from "./MoneyReel";
import { NisaReel } from "./NisaReel";
import { NisaMindMap } from "./scenes/NisaMindMap";
import { CarLoanReel, CAR_TOTAL_FRAMES } from "./CarLoanReel";
import { CarMindMap, CAR_MINDMAP_FRAMES } from "./scenes/CarMindMap";
import { SampleSlide, SAMPLE_FRAMES } from "./scenes/SampleSlide";
import { CarReel, CAR_REEL_FRAMES } from "./CarReel";
import { BoxTree, BOXTREE_FRAMES } from "./scenes/BoxTree";
import { CarDiagramReel, CAR_DIAGRAM_FRAMES } from "./CarDiagramReel";
import { Proto, PROTO_FRAMES } from "./Proto";
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

      {/* ── 別テーマの実例：新NISA解説（同じ部品で台本だけ差し替え） ── */}
      <Composition
        id="NisaReel"
        component={NisaReel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* ── 動線アニメの実例：マインドマップを線でつなぎながら順番に出す ── */}
      <Composition
        id="NisaMindMap"
        component={NisaMindMap}
        durationInFrames={210}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* ── 台本→図解の実例：ページ切替アニメ(スライド)つき「車 現金 vs ローン」 ── */}
      <Composition
        id="CarLoanReel"
        component={CarLoanReel}
        durationInFrames={CAR_TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* ── 本命：前提条件(固定ゾーン＋基準文字)＋塗り込みイラストのフラット図解リール ── */}
      <Composition
        id="CarReel"
        component={CarReel}
        durationInFrames={CAR_REEL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* ── 本命リール：台本を連結図解ページ×6でリール化 ── */}
      <Composition
        id="CarDiagramReel"
        component={CarDiagramReel}
        durationInFrames={CAR_DIAGRAM_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* ── パンチ型スタイル試作（米国債5% / 子育て計画的） ── */}
      <Composition
        id="Proto"
        component={Proto}
        durationInFrames={PROTO_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* ── 最終目的：箱を線でつないで1画面に組み上げる連結図解 ── */}
      <Composition
        id="BoxTree"
        component={BoxTree}
        durationInFrames={BOXTREE_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* ── 前提条件サンプル：固定ゾーン＋基準文字サイズ＋塗り込みイラスト ── */}
      <Composition
        id="SampleSlide"
        component={SampleSlide}
        durationInFrames={SAMPLE_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* ── 高密度・1枚積み上げ版：線でつなぎながら1画面で完成させる ── */}
      <Composition
        id="CarMindMap"
        component={CarMindMap}
        durationInFrames={CAR_MINDMAP_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
