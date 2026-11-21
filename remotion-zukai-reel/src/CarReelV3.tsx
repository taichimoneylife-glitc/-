import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, Img, useCurrentFrame, interpolate } from "remotion";
import { BG2, A2, Head, Mark2, Card2, Row2, Gauge, Big, SAFE } from "./components/kit2";
import { SceneFade, Float, CountUp, PopIn, Appear, SlideIn } from "./components/kit";
import { SfxTrack } from "./components/sfx";

// ══════════════════════════════════════════════════════════
//  本番V3：音声(car-narration.m4a 70.10s/30fps)に同期・参考A準拠。
//  画像は public/gen の生成イラスト。文言はユーザー原文のまま。
//  背景=薄黄フラット(丸なし) / フォント=Noto Sans JP / 効果音あり / セーフエリアいっぱい。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 生成画像を白い角丸/円に収めて薄黄背景に馴染ませる
const ImgCard: React.FC<{ file: string; size: number; delay: number; left: number; top: number; circle?: boolean; pad?: number }> = ({ file, size, delay, left, top, circle, pad = 20 }) => (
  <Float delay={delay} amp={7} style={{ position: "absolute", left, top }}>
    <div style={{ width: size, height: size, background: "#fff", borderRadius: circle ? "50%" : 30, boxShadow: "0 14px 34px rgba(80,60,20,0.13)", padding: pad, boxSizing: "border-box" }}>
      <Img src={staticFile(`gen/${file}`)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  </Float>
);

const Check: React.FC<{ delay: number; style?: React.CSSProperties; color?: string; ch?: string }> = ({ delay, style, color = A2.green, ch = "✓" }) => (
  <PopIn delay={delay} style={style}>
    <div style={{ width: 60, height: 60, borderRadius: "50%", background: color, color: "#fff", fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(80,60,20,0.2)" }}>{ch}</div>
  </PopIn>
);

// S1 導入＋結論（0–7.1s）／画像 car
const S1: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ name: "whoosh", at: 4, volume: 0.3 }, { name: "pop", at: 40, volume: 0.35 }, { name: "ding", at: 104, volume: 0.4 }]} />
    <Head delay={4} top={250} size={76}>500万円の車、<br />どう<Mark2 delay={20}>買う？</Mark2></Head>
    <ImgCard file="s1_car.webp" size={430} delay={12} left={325} top={470} />
    <Card2 delay={30} top={980} left={SAFE.x0} width={SAFE.x1 - SAFE.x0}>
      <Row2 label="現金一括" value="手元が減る" valueColor={A2.sub} />
      <Row2 label="銀行ローン" value="手元を残せる" valueColor={A2.green} highlight badge={<Check delay={112} style={{ position: "absolute", right: -14, top: -14 }} />} />
    </Card2>
    <Head delay={104} top={1310} size={70}>結論、<Mark2 delay={116}>あえてローン</Mark2></Head>
  </BG2>
);

// S2 総支払550（7–15s）／画像 wallet
const S2: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ name: "pop", at: 40, volume: 0.35 }, { name: "tick", at: 85, volume: 0.3 }, { name: "tick", at: 145, volume: 0.3 }, { name: "ding", at: 192, volume: 0.4 }]} />
    <Head delay={4} top={250} size={68}>銀行ローンで買うと</Head>
    <PopIn delay={4} style={{ position: "absolute", left: 0, top: 380, width: 1080, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#fff", color: A2.sub, fontSize: 38, fontWeight: 800, padding: "10px 34px", borderRadius: 999, boxShadow: "0 8px 20px rgba(80,60,20,0.1)" }}>金利2% ・ 10年</div>
    </PopIn>
    <ImgCard file="s2_wallet.webp" size={300} delay={14} left={390} top={520} />
    <Card2 delay={40} top={870} left={SAFE.x0} width={SAFE.x1 - SAFE.x0} header="総支払の内訳">
      <Row2 label="車両" value={<CountUp delay={85} to={500} suffix="万" />} />
      <Row2 label="利息" value={<CountUp delay={145} to={50} suffix="万" />} valueColor={A2.coral} />
      <div style={{ height: 3, background: A2.bar, margin: "6px 16px 12px" }} />
      <Row2 label="総支払" value={<Big delay={190} to={550} suffix="万" size={72} color={A2.green} dur={14} />} highlight />
    </Card2>
  </BG2>
);

// S3 利息損？→元手→運用（15–24s）／画像 growth(money tree)
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const dim = interpolate(f, [96, 112], [1, 0.32], clamp);
  return (
    <BG2>
      <SfxTrack cues={[{ name: "pop", at: 4, volume: 0.3 }, { name: "whoosh", at: 106, volume: 0.3 }, { name: "pop", at: 214, volume: 0.35 }]} />
      <div style={{ opacity: dim }}><Head delay={4} top={270} size={62}>利息50万は <span style={{ color: A2.coral }}>損？</span></Head></div>
      <Head delay={106} top={470} size={72}>いや、カギは<br />“元手500万”の<Mark2 delay={124}>使い方</Mark2></Head>
      <ImgCard file="s5_growth.webp" size={420} delay={214} left={330} top={760} />
      <Head delay={214} top={1240} size={64}>元手を<Mark2 delay={226} color="#BFE6C8">運用に回す</Mark2></Head>
    </BG2>
  );
};

// S4 株か債券か→債券（24–33s）／画像 stock vs bond
const S4: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ name: "whoosh", at: 6, volume: 0.3 }, { name: "whoosh", at: 16, volume: 0.3 }, { name: "ding", at: 132, volume: 0.4 }]} />
    <Head delay={4} top={250} size={70}>何で運用する？</Head>
    <SlideIn delay={6} from="left" style={{ position: "absolute", left: 70, top: 440, width: 440 }}>
      <div style={{ position: "relative", background: "#fff", borderRadius: 26, boxShadow: "0 12px 30px rgba(80,60,20,0.12)", padding: 18 }}>
        <div style={{ textAlign: "center", fontSize: 46, fontWeight: 800, marginBottom: 8 }}>株</div>
        <Img src={staticFile("gen/s3_stock.webp")} style={{ width: "100%", borderRadius: 14 }} />
        <div style={{ textAlign: "center", fontSize: 34, fontWeight: 800, color: A2.coral, marginTop: 6 }}>値動きリスク</div>
        <div style={{ position: "absolute", right: -12, top: -12 }}><PopIn delay={124}><div style={{ width: 60, height: 60, borderRadius: "50%", background: A2.coral, color: "#fff", fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>△</div></PopIn></div>
      </div>
    </SlideIn>
    <SlideIn delay={16} from="right" style={{ position: "absolute", left: 570, top: 440, width: 440 }}>
      <div style={{ position: "relative", background: "#fff", borderRadius: 26, boxShadow: "0 12px 30px rgba(80,60,20,0.12)", padding: 18 }}>
        <div style={{ textAlign: "center", fontSize: 46, fontWeight: 800, marginBottom: 8 }}>債券</div>
        <Img src={staticFile("gen/s3_bond.webp")} style={{ width: "100%", borderRadius: 14 }} />
        <div style={{ textAlign: "center", fontSize: 34, fontWeight: 800, color: A2.green, marginTop: 6 }}>安定・計画的</div>
        <div style={{ position: "absolute", right: -12, top: -12 }}><Check delay={132} /></div>
      </div>
    </SlideIn>
    <Head delay={150} top={1140} size={68}>リスクを抑え <Mark2 delay={162}>債券</Mark2></Head>
  </BG2>
);

// S5 子育て計画的（33–47s）／画像 family
const S5: React.FC = () => {
  const chip = (delay: number, icon: string, label: string, cx: number) => (
    <PopIn delay={delay} style={{ position: "absolute", left: cx - 152, top: 470, width: 304 }}>
      <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 10px 24px rgba(80,60,20,0.1)", padding: "20px 0", textAlign: "center" }}>
        <div style={{ fontSize: 56 }}>{icon}</div>
        <div style={{ fontSize: 34, fontWeight: 800, marginTop: 4 }}>{label}</div>
      </div>
    </PopIn>
  );
  return (
    <BG2>
      <SfxTrack cues={[{ name: "pop", at: 4, volume: 0.3 }, { name: "pop", at: 50, volume: 0.3 }, { name: "pop", at: 96, volume: 0.3 }, { name: "ding", at: 334, volume: 0.4 }]} />
      <Head delay={4} top={250} size={60}>子育て世帯こそ <Mark2 delay={16}>計画的に</Mark2></Head>
      {chip(4, "🎓", "教育資金", 230)}
      {chip(50, "🐖", "老後資金", 540)}
      {chip(96, "⭐", "特別費", 850)}
      <ImgCard file="s4_family.webp" size={420} delay={150} left={330} top={720} />
      <Card2 delay={334} top={1200} left={130} width={820}>
        <div style={{ textAlign: "center", fontSize: 52, fontWeight: 800 }}>債券＝<span style={{ color: A2.green }}>約束された資産</span></div>
      </Card2>
    </BG2>
  );
};

// S6 米国債5%（47–53s）／画像 usa
const S6: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ name: "pop", at: 6, volume: 0.35 }, { name: "tick", at: 12, volume: 0.3 }, { name: "whoosh", at: 22, volume: 0.3 }]} />
    <Head delay={4} top={250} size={66}>しかも今、米国債は</Head>
    <ImgCard file="s4_usa.webp" size={430} delay={6} left={325} top={430} />
    <div style={{ position: "absolute", left: 0, top: 940, width: 1080, textAlign: "center" }}>
      <PopIn delay={10}><span style={{ fontSize: 64, fontWeight: 800 }}>金利 </span><Big delay={12} to={5} suffix="%" size={150} color={A2.red} dur={22} /></PopIn>
    </div>
    <Gauge delay={20} pct={84} top={1160} minLabel="0%" maxLabel="高水準！" color={A2.green} />
    <Appear delay={80} style={{ position: "absolute", left: 60, top: 1300, width: 960, textAlign: "center" }}>
      <div style={{ fontSize: 38, fontWeight: 700, color: A2.sub }}>実際に、僕も5%超えの債券を保有中</div>
    </Appear>
  </BG2>
);

// S7 10年後の資産（53–62s）／カード＋ゲージ
const S7: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ name: "pop", at: 30, volume: 0.35 }, { name: "tick", at: 64, volume: 0.3 }, { name: "tick", at: 124, volume: 0.3 }, { name: "ding", at: 150, volume: 0.4 }]} />
    <Head delay={4} top={250} size={68}>では10年後どうなる？</Head>
    <Card2 delay={30} top={480} left={SAFE.x0} width={SAFE.x1 - SAFE.x0} header="10年後の資産">
      <Row2 label="債券で運用" value={<Big delay={64} to={810} prefix="約" suffix="万" size={74} color={A2.green} dur={24} />} />
      <Row2 label="車の総支払" value={<CountUp delay={124} to={550} suffix="万" />} valueColor={A2.sub} />
      <div style={{ height: 3, background: A2.bar, margin: "6px 16px 12px" }} />
      <Row2 label="差分" value={<Big delay={150} to={260} prefix="＋約" suffix="万" size={72} color={A2.coral} dur={20} />} highlight />
    </Card2>
    <Gauge delay={150} pct={100} top={1240} minLabel="車550万" maxLabel="運用810万" color={A2.green} dur={26} />
  </BG2>
);

// S8 まとめ（62–70s）／画像 trophy
const S8: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ name: "pop", at: 4, volume: 0.35 }, { name: "success", at: 154, volume: 0.45 }]} />
    <Card2 delay={4} top={330} left={110} width={860}>
      <div style={{ textAlign: "center", fontSize: 54, fontWeight: 800 }}>利息50万 <span style={{ color: A2.green, fontSize: 74 }}>＜</span> 運用益260万</div>
    </Card2>
    <ImgCard file="s5_trophy.webp" size={360} delay={150} left={360} top={560} />
    <Head delay={154} top={1000} size={100}>トータルで <Mark2 delay={168}><span style={{ color: A2.red }}>得</span></Mark2></Head>
    <Appear delay={186} style={{ position: "absolute", left: 60, top: 1240, width: 960, textAlign: "center" }}>
      <div style={{ fontSize: 38, fontWeight: 700, color: A2.sub, lineHeight: 1.5 }}>現金一括が絶対正解じゃない。<br />長期で見ればトータルで得。</div>
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

export const CAR_V3_FRAMES = 2103;

export const CarReelV3: React.FC = () => (
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
