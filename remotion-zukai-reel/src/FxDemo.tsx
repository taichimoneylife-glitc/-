import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { B, GenSlot } from "./MileLifePlan";
import { K, SER } from "./components/zukaiKit";
import { BounceText, PopOutPhone, ScriptPage, DropText, CutoutText, Receipt, CommentBox, SlotCount, PhotoGrid, Scribble, ReelUI, Checklist, INK, RED, BLUE, SUB } from "./components/fx";

// 参考⑤から選んだ演出の見本（黄色ノート版）。1場面＝1.6秒。中身はお金の図解での使い方の例
const D = 48;
const Paper: React.FC = () => <AbsoluteFill style={{ background: A2.bg, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }} />;
const Label: React.FC<{ n: string; t: string }> = ({ n, t }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1240, display: "flex", justifyContent: "center" }}>
    <div style={{ background: "#fff", borderRadius: 999, padding: "14px 40px", boxShadow: "0 6px 16px rgba(90,70,20,0.12)", ...K, fontSize: 40, color: INK }}><span style={{ color: RED, marginRight: 14 }}>{n}</span>{t}</div>
  </div>
);
const Center: React.FC<{ top?: number; children: React.ReactNode }> = ({ top = 520, children }) => <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>;

const S01: React.FC = () => (
  <>
    <Center top={430}><div style={{ ...K, fontSize: 56, color: SUB, marginBottom: 20 }}>アメックス使ってる人</div><BounceText text="損してます" size={150} at={4} /></Center>
    <div style={{ position: "absolute", left: 330, top: 820 }}><GenSlot name="taichi_surprise" size={420} /></div>
    <Label n="01" t="文字が弾む" />
  </>
);
const S02: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 90, top: 300, ...SER, fontSize: 64, color: INK }}>理由①</div>
    <div style={{ position: "absolute", left: 92, top: 390, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 26, color: SUB }}>00:00:0{Math.min(9, Math.floor(useCurrentFrame() / 5))}:12</div>
    <Center top={430}><PopOutPhone at={6} w={380}><div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}><GenSlot name="mile_plane" size={260} /><div style={{ ...K, fontSize: 44, color: INK }}>ANAマイル</div><div style={{ ...SER, fontSize: 64, color: BLUE }}>1万マイル</div></div></PopOutPhone></Center>
    <Label n="02" t="タイトル飛び出し" />
  </>
);
const S03: React.FC = () => (
  <>
    <Center top={380}><ScriptPage at={2} per={11} lines={["やることはこれだけ", "旅行するなら ANAマイル", "しないなら 年会費", "商品券には 使わない"]} /></Center>
    <Label n="03" t="台本ページ" />
  </>
);
const S04: React.FC = () => (
  <>
    <Center top={420}><div style={{ ...K, fontSize: 48, color: RED, marginBottom: 10 }}>商品券に替えると</div><DropText text="3,000円" at={4} size={170} out={40} /></Center>
    <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", ...B, fontSize: 40, color: SUB }}>1万ポイントが</div>
    <Label n="04" t="文字が上から落ちる" />
  </>
);
const S06: React.FC = () => (
  <>
    <Center top={460}><CutoutText text="家族旅行" img="mile_now_beach" at={2} size={220} /><div style={{ ...K, fontSize: 50, color: INK, marginTop: 30 }}>マイルで行ってます</div></Center>
    <Label n="06" t="切り抜き文字" />
  </>
);
const S07: React.FC = () => (
  <>
    <Center top={300}><Receipt at={2} title="1万ポイントの使い道" rows={[["商品券", "3,000円", true], ["Amazon", "5,000円", true], ["年会費", "10,000円"], ["ANAマイル", "10,000マイル"]]} total={["損した額", "−7,000円"]} /></Center>
    <Label n="07" t="レシートから文字が出る" />
  </>
);
const S10: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 340, top: 760 }}><GenSlot name="taichi_point_up" size={380} /></div>
    <div style={{ position: "absolute", left: 140, top: 430 }}><CommentBox at={2} text="マイル" reply="ANAマイルの貯め方、DMで送りますね" /></div>
    <Label n="10" t="コメント誘導" />
  </>
);
const S12: React.FC = () => (
  <>
    <Center top={420}><div style={{ background: INK, color: "#fff", borderRadius: 14, padding: "8px 30px", ...K, fontSize: 40, marginBottom: 30 }}>1万ポイントが</div><div style={{ display: "flex", alignItems: "flex-end" }}><SlotCount value="10,000" at={2} size={170} /><span style={{ ...B, fontSize: 56, color: INK, marginLeft: 10, marginBottom: 20 }}>マイル</span></div></Center>
    <Label n="12" t="カウントアップ" />
  </>
);
const S13: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", ...K, fontSize: 56, color: INK }}>マイルで行った家族旅行</div>
    <Center top={400}><PhotoGrid at={2} cols={4} cell={200} imgs={["mile_now_beach", "mile_now_hotel", "mile_now_snow", "mile_plane", "mile_now_dinner", "mile_now_photo", "mile_family_happy", "mile_suitcase", "mile_now_window", "mile_now_hug", "mile_now_grandma", "mile_now_shoulder"]} /></Center>
    <Label n="13" t="写真が並ぶ（おまけ）" />
  </>
);
const S15: React.FC = () => (
  <>
    <Center top={420}>
      <div style={{ width: 820, background: "#fff", border: `5px solid ${INK}`, borderRadius: 26, boxShadow: `6px 8px 0 ${INK}`, padding: "30px 40px", boxSizing: "border-box" }}>
        {([["商品券", "3,000円"], ["Amazon", "5,000円"], ["年会費", "10,000円"]] as const).map(([a, b]) => <div key={a} style={{ display: "flex", justifyContent: "space-between", height: 100, alignItems: "center", ...K, fontSize: 48, color: INK }}><span>{a}</span><span style={{ ...SER }}>{b}</span></div>)}
      </div>
    </Center>
    <Scribble at={8} cx={765} cy={720} rx={170} ry={62} note="ここが1円！" nx={130} ny={880} />
    <Label n="15" t="画面に書き込み" />
  </>
);
const S17: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 300, top: 520 }}><GenSlot name="taichi_thumbs_up" size={480} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", ...K, fontSize: 60, color: INK }}>保存して見返してね</div>
    <ReelUI at={2} pointSave={14} />
    <Label n="17" t="リール画面" />
  </>
);

const SCENES: [string, React.FC][] = [["文字が弾む", S01], ["タイトル飛び出し", S02], ["台本ページ", S03], ["文字が上から落ちる", S04], ["切り抜き文字", S06], ["レシート", S07], ["コメント誘導", S10], ["カウントアップ", S12], ["写真が並ぶ", S13], ["画面に書き込み", S15], ["リール画面", S17]];
export const FXDEMO_FRAMES = SCENES.length * D;
export const FxDemo: React.FC = () => {
  const f = useCurrentFrame();
  const cur = Math.min(SCENES.length - 1, Math.floor(f / D));
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Paper />
      {SCENES.map(([, C], i) => (
        <Sequence key={i} from={i * D} durationInFrames={D} layout="none">
          <AbsoluteFill style={{ opacity: interpolate(f - i * D, [0, 3], [0.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: "translateY(120px)" }}><C /></AbsoluteFill>
        </Sequence>
      ))}
      <div style={{ transform: "scale(0.58)", transformOrigin: "100% 0", position: "absolute", right: 28, top: 200, width: 420 }}>
        <Checklist title="この動画の演出" items={SCENES.map(([t]) => t)} cur={cur} x={0} y={0} w={420} />
      </div>
    </AbsoluteFill>
  );
};
