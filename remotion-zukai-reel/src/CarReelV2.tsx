import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { BG2, A2, Head, Mark2, Card2, Row2, Gauge, Big, Tag, CharaCircle, ArrowDown } from "./components/kit2";
import { Float, SceneFade, CountUp, PopIn, Appear } from "./components/kit";
import { IllCar, IllUSA, IllGrowMoney, IllTrophy } from "./components/illus";

// ══════════════════════════════════════════════════════════
//  参考動画Aのデザイン言語で1から再構築（丸ゴシック／クリーム／
//  やわらかカード／マーカー蛍光／横ゲージ／丸いキャラ）
//  音声(car-narration.m4a 70.10s/30fps)に同期。構成は scene_plan.json 準拠。
// ══════════════════════════════════════════════════════════

const Check: React.FC<{ delay: number; style?: React.CSSProperties; color?: string; ch?: string }> = ({ delay, style, color = A2.green, ch = "✓" }) => (
  <PopIn delay={delay} style={style}>
    <div style={{ width: 58, height: 58, borderRadius: "50%", background: color, color: "#fff", fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(80,60,20,0.18)" }}>{ch}</div>
  </PopIn>
);

// S1 導入＋結論（0.0–7.1s）
const S1: React.FC = () => (
  <BG2>
    <Head delay={4} top={210} size={78}>500万円の車、<br />どう<Mark2 delay={20}>買う？</Mark2></Head>
    <Card2 delay={26} top={520} header="支払い方法">
      <Row2 label="現金一括" value="手元が減る" valueColor={A2.sub} />
      <Row2 label="銀行ローン" value="手元を残せる" valueColor={A2.green} highlight badge={<Check delay={112} style={{ position: "absolute", right: -14, top: -14 }} />} />
    </Card2>
    <Head delay={104} top={1080} size={74}>結論は <Mark2 delay={116}>“敢えてローン”</Mark2></Head>
    <Appear delay={140} style={{ position: "absolute", left: 60, top: 1230, width: 960, textAlign: "center" }}>
      <div style={{ fontSize: 34, fontWeight: 700, color: A2.sub }}>※手元資金を残したい家庭ほど</div>
    </Appear>
    <CharaCircle delay={150} size={220} col={A2.coral} style={{ position: "absolute", left: 70, top: 1420 }} />
  </BG2>
);

// S2 総支払の内訳（7.1–15.1s）
const S2: React.FC = () => (
  <BG2>
    <Head delay={4} top={210} size={70}>銀行ローンで買うと</Head>
    <PopIn delay={4} style={{ position: "absolute", left: 0, top: 360, width: 1080, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#fff", color: A2.sub, fontSize: 38, fontWeight: 800, padding: "10px 34px", borderRadius: 999, boxShadow: "0 8px 20px rgba(80,60,20,0.1)" }}>金利2% ・ 10年</div>
    </PopIn>
    <Card2 delay={40} top={520} header="総支払の内訳">
      <Row2 label="車両" value={<CountUp delay={85} to={500} suffix="万" />} />
      <Row2 label="利息" value={<CountUp delay={145} to={50} suffix="万" />} valueColor={A2.coral} />
      <div style={{ height: 3, background: A2.bar, margin: "6px 16px 12px" }} />
      <Row2 label="総支払" value={<Big delay={190} to={550} suffix="万" size={70} color={A2.green} dur={14} />} highlight />
    </Card2>
  </BG2>
);

// S3 利息は損？→元手の使い方→運用（15.1–24.1s）
const S3: React.FC = () => (
  <BG2>
    <Head delay={4} top={300} size={64}>利息50万は <span style={{ color: A2.coral }}>損？</span></Head>
    <Head delay={106} top={560} size={76}>いや、カギは<br />“元手500万”の<Mark2 delay={124}>使い方</Mark2></Head>
    <PopIn delay={186} style={{ position: "absolute", left: 150, top: 980, width: 300 }}>
      <div style={{ background: "#fff", border: `4px solid ${A2.ink}`, borderRadius: 20, padding: "22px 0", textAlign: "center", fontSize: 46, fontWeight: 800, boxShadow: "0 8px 20px rgba(80,60,20,0.1)" }}>元手500万</div>
    </PopIn>
    <ArrowDown delay={200} x={540} y={1010} len={90} color={A2.green} />
    <PopIn delay={214} style={{ position: "absolute", left: 630, top: 980, width: 300 }}>
      <div style={{ background: A2.green, borderRadius: 20, padding: "22px 0", textAlign: "center", fontSize: 48, fontWeight: 800, color: "#fff" }}>運用へ</div>
    </PopIn>
    <Float delay={220} amp={9} style={{ position: "absolute", left: 440, top: 1200, width: 200, display: "flex", justifyContent: "center" }}><IllGrowMoney size={200} /></Float>
  </BG2>
);

// S4 株か債券か→債券（24.1–33.1s）
const S4: React.FC = () => (
  <BG2>
    <Head delay={4} top={210} size={74}>何で増やす？</Head>
    <Card2 delay={6} top={520}>
      <Row2 label="株" value="値動きリスク" valueColor={A2.coral} badge={<Check delay={124} ch="△" color={A2.coral} style={{ position: "absolute", right: -14, top: -14 }} />} />
      <Row2 label="債券" value="安定・計画的" valueColor={A2.green} highlight badge={<Check delay={132} style={{ position: "absolute", right: -14, top: -14 }} />} />
    </Card2>
    <Head delay={150} top={980} size={72}>リスクを抑え <Mark2 delay={162}>債券</Mark2></Head>
  </BG2>
);

// S5 子育て世帯こそ計画的（33.1–47.1s）
const S5: React.FC = () => {
  const chip = (delay: number, icon: string, label: string, cx: number) => (
    <PopIn delay={delay} style={{ position: "absolute", left: cx - 150, top: 470, width: 300 }}>
      <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 10px 24px rgba(80,60,20,0.1)", padding: "20px 0", textAlign: "center" }}>
        <div style={{ fontSize: 54 }}>{icon}</div>
        <div style={{ fontSize: 34, fontWeight: 800, marginTop: 4 }}>{label}</div>
      </div>
    </PopIn>
  );
  return (
    <BG2>
      <Head delay={4} top={220} size={62}>子育て世帯こそ <Mark2 delay={16}>計画的に</Mark2></Head>
      {chip(4, "🎓", "教育資金", 230)}
      {chip(50, "🐖", "老後資金", 540)}
      {chip(96, "⭐", "特別費", 850)}
      <Head delay={184} top={760} size={56}>株は暴落 ／ 債券は<span style={{ color: A2.green }}>見通せる</span></Head>
      <Card2 delay={334} top={900} left={130} width={820}>
        <div style={{ textAlign: "center", fontSize: 56, fontWeight: 800 }}>債券 ＝ <span style={{ color: A2.green }}>約束された資産</span></div>
      </Card2>
      <CharaCircle delay={360} size={200} col={A2.green} style={{ position: "absolute", left: 740, top: 1300 }} />
      <CharaCircle delay={372} size={150} col={A2.coral} style={{ position: "absolute", left: 610, top: 1360 }} />
    </BG2>
  );
};

// S6 米国債5%（47.1–53.1s）＋横ゲージ
const S6: React.FC = () => (
  <BG2>
    <Head delay={4} top={230} size={70}>しかも今、米国債は</Head>
    <Float delay={6} amp={11} style={{ position: "absolute", left: 410, top: 410, width: 260, display: "flex", justifyContent: "center" }}><IllUSA size={260} /></Float>
    <div style={{ position: "absolute", left: 0, top: 720, width: 1080, textAlign: "center" }}>
      <PopIn delay={10}><span style={{ fontSize: 68, fontWeight: 800 }}>金利 </span><Big delay={12} to={5} suffix="%" size={180} color={A2.red} dur={26} /></PopIn>
    </div>
    <Gauge delay={20} pct={84} top={960} minLabel="0%" maxLabel="高水準！" color={A2.green} />
    <Appear delay={97} style={{ position: "absolute", left: 60, top: 1090, width: 960, textAlign: "center" }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: A2.sub }}>実際に、僕も約5%の債券を保有中</div>
    </Appear>
  </BG2>
);

// S7 10年後の資産（53.1–62.1s）
const S7: React.FC = () => (
  <BG2>
    <Head delay={4} top={210} size={70}>10年後、どうなる？</Head>
    <Card2 delay={30} top={440} header="10年後の資産">
      <Row2 label="債券で運用" value={<Big delay={64} to={810} prefix="約" suffix="万" size={72} color={A2.green} dur={24} />} />
      <Row2 label="車の総支払" value={<CountUp delay={124} to={550} suffix="万" />} valueColor={A2.sub} />
      <div style={{ height: 3, background: A2.bar, margin: "6px 16px 12px" }} />
      <Row2 label="差分" value={<Big delay={150} to={260} prefix="＋約" suffix="万" size={70} color={A2.coral} dur={20} />} highlight />
    </Card2>
    <Gauge delay={150} pct={100} top={1120} minLabel="車550万" maxLabel="運用810万" color={A2.green} dur={26} />
  </BG2>
);

// S8 まとめ（62.1–70.1s）
const S8: React.FC = () => (
  <BG2>
    <Card2 delay={4} top={420} left={110} width={860}>
      <div style={{ textAlign: "center", fontSize: 56, fontWeight: 800 }}>利息50万 <span style={{ color: A2.green, fontSize: 76 }}>＜</span> 運用益260万</div>
    </Card2>
    <Float delay={150} amp={9} style={{ position: "absolute", left: 415, top: 640, width: 250, display: "flex", justifyContent: "center" }}><IllTrophy size={250} /></Float>
    <Head delay={154} top={960} size={104}>トータルで <Mark2 delay={168}><span style={{ color: A2.red }}>得</span></Mark2></Head>
    <Appear delay={186} style={{ position: "absolute", left: 60, top: 1200, width: 960, textAlign: "center" }}>
      <div style={{ fontSize: 40, fontWeight: 700, color: A2.sub, lineHeight: 1.5 }}>現金一括が絶対正解じゃない。<br />子育て世帯こそ“計画的に”。</div>
    </Appear>
  </BG2>
);

const SCENES: { c: React.FC; from: number; dur: number }[] = [
  { c: S1, from: 0, dur: 212 },
  { c: S2, from: 212, dur: 240 },
  { c: S3, from: 452, dur: 270 },
  { c: S4, from: 722, dur: 270 },
  { c: S5, from: 992, dur: 420 },
  { c: S6, from: 1412, dur: 180 },
  { c: S7, from: 1592, dur: 270 },
  { c: S8, from: 1862, dur: 241 },
];

export const CAR_V2_FRAMES = 2103;

export const CarReelV2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg }}>
    <Audio src={staticFile("car-narration.m4a")} />
    {SCENES.map(({ c: C, from, dur }, i) => (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <SceneFade dur={dur}>
          <C />
        </SceneFade>
      </Sequence>
    ))}
  </AbsoluteFill>
);
