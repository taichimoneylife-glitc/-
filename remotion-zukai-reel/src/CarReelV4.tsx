import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, Img, useCurrentFrame, interpolate } from "remotion";
import { BG2, A2, Head, Mark2, Big, SAFE } from "./components/kit2";
import { SceneFade, Float, CountUp, PopIn, Appear, DrawLine } from "./components/kit";

// ══════════════════════════════════════════════════════════
//  本番V4：連結図解（線・矢印・箱・数字で組み上がる）＋透過イラストを部品として織り込む。
//  効果音なし／薄黄フラット背景／Noto Sans JP／音声(car-narration.m4a 70.10s/30fps)同期。
//  文言はユーザー原文のまま。イラストは public/gen/*.png（透過済み）。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 透過イラスト（部品として直接置く）
const Ill: React.FC<{ file: string; size: number; delay: number; left: number; top: number; amp?: number }> = ({ file, size, delay, left, top, amp = 7 }) => (
  <Float delay={delay} amp={amp} style={{ position: "absolute", left, top, width: size, height: size }}>
    <Img src={staticFile(`gen/${file}`)} style={{ width: size, height: size, objectFit: "contain" }} />
  </Float>
);

// 図解の箱（ノード）
const Box: React.FC<{ label: React.ReactNode; sub?: string; cx: number; top: number; w?: number; fill?: string; border?: string; delay: number; badge?: React.ReactNode; fs?: number }> = ({ label, sub, cx, top, w = 300, fill, border, delay, badge, fs = 42 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: cx - w / 2, top, width: w }}>
    <div style={{ position: "relative", background: fill ?? "#fff", color: fill ? "#fff" : A2.ink, border: `4px solid ${border ?? fill ?? A2.ink}`, borderRadius: 18, padding: "18px 8px", textAlign: "center", fontSize: fs, fontWeight: 800, boxShadow: "0 8px 20px rgba(80,60,20,0.1)", boxSizing: "border-box" }}>
      {label}
      {sub ? <div style={{ fontSize: 26, color: fill ? "#fff" : A2.sub, fontWeight: 700, marginTop: 4 }}>{sub}</div> : null}
      {badge}
    </div>
  </PopIn>
);

const Badge: React.FC<{ delay: number; ch: string; color: string }> = ({ delay, ch, color }) => (
  <PopIn delay={delay} style={{ position: "absolute", right: -16, top: -16 }}>
    <div style={{ width: 56, height: 56, borderRadius: "50%", background: color, color: "#fff", fontSize: 32, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(80,60,20,0.2)" }}>{ch}</div>
  </PopIn>
);
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>
);
const op = (label: string, x: number, y: number, delay: number, color = A2.ink) => (
  <PopIn delay={delay} style={{ position: "absolute", left: x - 30, top: y, width: 60, textAlign: "center" }}>
    <div style={{ fontSize: 64, fontWeight: 800, color }}>{label}</div>
  </PopIn>
);

// S1 導入＋結論（0–7.1s）：車→[現金一括/銀行ローン]→結論 の連結図
const S1: React.FC = () => (
  <BG2>
    <Head delay={4} top={230} size={72}>500万円の車、どう<Mark2 delay={20}>買う？</Mark2></Head>
    <Ill file="s1_car.png" size={360} delay={12} left={360} top={360} />
    <Svg>
      <DrawLine d="M540 720 L540 800" delay={30} dur={8} color={A2.ink} w={6} />
      <DrawLine d="M300 800 L780 800" delay={38} dur={10} color={A2.ink} w={6} />
      <DrawLine d="M300 800 L300 860" delay={48} dur={6} color={A2.ink} w={6} />
      <DrawLine d="M780 800 L780 860" delay={48} dur={6} color={A2.ink} w={6} />
      <DrawLine d="M780 1010 L780 1100 L540 1100 L540 1180" delay={120} dur={16} color={A2.coral} w={7} />
    </Svg>
    <Box label="現金一括" cx={300} top={860} w={340} delay={52} border={A2.sub} />
    <Box label="銀行ローン" cx={780} top={860} w={340} delay={60} fill={A2.green} badge={<Badge delay={112} ch="✓" color={A2.green} />} />
    <Head delay={132} top={1210} size={72}>結論、<Mark2 delay={144}>あえてローン</Mark2></Head>
  </BG2>
);

// S2 総支払（7–15s）：車両500 ＋ 利息50 → 総支払550 の連結図＋財布
const S2: React.FC = () => (
  <BG2>
    <Head delay={4} top={230} size={64}>銀行ローンで買うと</Head>
    <PopIn delay={4} style={{ position: "absolute", left: 0, top: 350, width: 1080, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#fff", color: A2.sub, fontSize: 36, fontWeight: 800, padding: "9px 30px", borderRadius: 999, boxShadow: "0 8px 20px rgba(80,60,20,0.1)" }}>金利2% ・ 10年</div>
    </PopIn>
    <Ill file="s2_wallet.png" size={230} delay={14} left={430} top={470} />
    <Box label={<><span style={{ fontSize: 30, color: A2.sub, display: "block", fontWeight: 700 }}>車両</span><CountUp delay={85} to={500} suffix="万" /></>} cx={290} top={760} w={360} delay={80} fs={54} />
    {op("＋", 540, 790, 100, A2.ink)}
    <Box label={<><span style={{ fontSize: 30, color: A2.sub, display: "block", fontWeight: 700 }}>利息</span><CountUp delay={145} to={50} suffix="万" /></>} cx={790} top={760} w={360} delay={130} fs={54} border={A2.coral} />
    <Svg>
      <DrawLine d="M290 900 L290 970 L540 970" delay={170} dur={12} color={A2.ink} w={6} />
      <DrawLine d="M790 900 L790 970 L540 970" delay={170} dur={12} color={A2.ink} w={6} />
      <DrawLine d="M540 970 L540 1030" delay={184} dur={8} color={A2.green} w={7} />
    </Svg>
    <PopIn delay={190} style={{ position: "absolute", left: 130, top: 1040, width: 820 }}>
      <div style={{ background: A2.marker, borderRadius: 22, padding: "24px 0", textAlign: "center", fontSize: 44, fontWeight: 800 }}>総支払 <Big delay={192} to={550} suffix="万" size={72} color={A2.green} dur={14} /></div>
    </PopIn>
    <Head delay={244} top={1300} size={48}>利息50万は<span style={{ color: A2.coral }}>損？</span>…いや</Head>
  </BG2>
);

// S3 元手→運用（15–24s）：元手500万 →(矢印) 運用（お金の木）
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const dim = interpolate(f, [96, 112], [1, 0.3], clamp);
  return (
    <BG2>
      <div style={{ opacity: dim }}><Head delay={4} top={250} size={60}>問題は“元手”の使い方</Head></div>
      <Head delay={106} top={470} size={66}>元手の<Mark2 delay={120}>500万を運用に回す</Mark2></Head>
      <Box label="元手500万" cx={280} top={780} w={360} delay={150} fs={44} />
      <Svg>
        <DrawLine d="M470 850 L700 850" delay={180} dur={12} color={A2.green} w={9} />
        <DrawLine d="M678 832 L712 850 L678 868" delay={190} dur={6} color={A2.green} w={9} />
      </Svg>
      <Box label="運用へ" cx={800} top={780} w={280} delay={196} fill={A2.green} fs={46} />
      <Ill file="s5_growth.png" size={420} delay={210} left={330} top={1000} />
    </BG2>
  );
};

// S4 株か債券か→債券（24–33s）：運用→[株/債券]の連結比較（イラスト織り込み）
const S4: React.FC = () => (
  <BG2>
    <Head delay={4} top={230} size={66}>何で運用する？</Head>
    <Svg>
      <DrawLine d="M540 340 L540 400 M300 400 L780 400 M300 400 L300 460 M780 400 L780 460" delay={10} dur={16} color={A2.ink} w={6} />
    </Svg>
    <div style={{ position: "absolute", left: 90, top: 470, width: 420 }}>
      <PopIn delay={20}><div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ fontSize: 48, fontWeight: 800 }}>株</div>
        <Ill file="s3_stock.png" size={340} delay={26} left={40} top={60} />
        <div style={{ position: "absolute", right: 6, top: -6 }}><Badge delay={120} ch="△" color={A2.coral} /></div>
      </div></PopIn>
      <PopIn delay={30} style={{ position: "absolute", left: 90, top: 430, width: 240 }}><div style={{ textAlign: "center", fontSize: 34, fontWeight: 800, color: A2.coral }}>値動きリスク</div></PopIn>
    </div>
    <div style={{ position: "absolute", left: 570, top: 470, width: 420 }}>
      <PopIn delay={30}><div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ fontSize: 48, fontWeight: 800 }}>債券</div>
        <Ill file="s3_bond.png" size={340} delay={36} left={40} top={60} />
        <div style={{ position: "absolute", right: 6, top: -6 }}><Badge delay={130} ch="✓" color={A2.green} /></div>
      </div></PopIn>
      <PopIn delay={40} style={{ position: "absolute", left: 90, top: 430, width: 240 }}><div style={{ textAlign: "center", fontSize: 34, fontWeight: 800, color: A2.green }}>安定・計画的</div></PopIn>
    </div>
    <Svg><DrawLine d="M540 940 L540 1080" delay={150} dur={12} color={A2.green} w={7} /></Svg>
    <Head delay={160} top={1120} size={66}>リスクを抑え <Mark2 delay={172}>債券</Mark2></Head>
  </BG2>
);

// S5 子育て計画的（33–47s）：家族→[教育/老後/特別費]の枝分かれ→約束された資産
const S5: React.FC = () => {
  const item = (delay: number, icon: string, label: string, cx: number) => (
    <PopIn delay={delay} style={{ position: "absolute", left: cx - 150, top: 700, width: 300 }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 20px rgba(80,60,20,0.1)", padding: "14px 0", textAlign: "center" }}>
        <div style={{ fontSize: 46 }}>{icon}</div>
        <div style={{ fontSize: 32, fontWeight: 800, marginTop: 2 }}>{label}</div>
      </div>
    </PopIn>
  );
  return (
    <BG2>
      <Head delay={4} top={210} size={56}>子育て世帯こそ <Mark2 delay={16}>計画的に</Mark2></Head>
      <Ill file="s4_family.png" size={300} delay={20} left={390} top={300} />
      <Svg>
        <DrawLine d="M540 580 L540 650 M230 650 L850 650 M230 650 L230 700 M540 650 L540 700 M850 650 L850 700" delay={40} dur={20} color={A2.ink} w={5} />
      </Svg>
      {item(60, "🎓", "教育資金", 230)}
      {item(80, "🐖", "老後資金", 540)}
      {item(100, "⭐", "特別費", 850)}
      {/* 株↔債券の比較図解（39–47s） */}
      <Box label="株" sub="暴落リスク" cx={300} top={1010} w={360} delay={210} border={A2.coral} badge={<Badge delay={240} ch="×" color={A2.coral} />} />
      <Box label="債券" sub="約束された資産" cx={780} top={1010} w={360} delay={250} fill={A2.green} badge={<Badge delay={280} ch="✓" color={A2.green} />} />
      <Svg><DrawLine d="M780 1170 L780 1230 L540 1230 L540 1290" delay={330} dur={14} color={A2.green} w={7} /></Svg>
      <Head delay={340} top={1310} size={54}>債券は<Mark2 delay={352}>計画的</Mark2></Head>
    </BG2>
  );
};

// S6 米国債5%（47–53s）：星条旗→(線)→金利5% ＋ゲージ
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const g = interpolate(f, [20, 50], [0, 84], clamp);
  return (
    <BG2>
      <Head delay={4} top={230} size={62}>しかも今、米国債は</Head>
      <Ill file="s4_usa.png" size={360} delay={6} left={100} top={400} />
      <Svg><DrawLine d="M470 620 L640 620" delay={30} dur={10} color={A2.green} w={8} /><DrawLine d="M620 604 L652 620 L620 636" delay={38} dur={5} color={A2.green} w={8} /></Svg>
      <div style={{ position: "absolute", left: 560, top: 520, width: 460, textAlign: "center" }}>
        <PopIn delay={20}><span style={{ fontSize: 56, fontWeight: 800 }}>金利</span><br /><Big delay={22} to={5} suffix="%" size={180} color={A2.red} dur={22} /></PopIn>
      </div>
      <div style={{ position: "absolute", left: 60, top: 900, width: 960 }}>
        <div style={{ height: 46, borderRadius: 999, background: A2.track }}>
          <div style={{ height: "100%", width: `${g}%`, background: A2.green, borderRadius: 999 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 28, fontWeight: 700, color: A2.sub }}><span>0%</span><span>高水準！</span></div>
      </div>
      <Appear delay={80} style={{ position: "absolute", left: 60, top: 1060, width: 960, textAlign: "center" }}>
        <div style={{ fontSize: 38, fontWeight: 700, color: A2.sub }}>実際に、僕も5%超えの債券を保有中</div>
      </Appear>
    </BG2>
  );
};

// S7 10年後（53–62s）：債券810 と 車550 を並べ、差分+260を連結
const S7: React.FC = () => (
  <BG2>
    <Head delay={4} top={230} size={64}>では10年後どうなる？</Head>
    <Box label={<><span style={{ fontSize: 30, color: A2.sub, display: "block", fontWeight: 700 }}>債券で運用</span><Big delay={40} to={810} prefix="約" suffix="万" size={60} color={A2.green} dur={22} /></>} cx={290} top={450} w={400} delay={30} fs={40} border={A2.green} />
    <Box label={<><span style={{ fontSize: 30, color: A2.sub, display: "block", fontWeight: 700 }}>車の総支払</span><CountUp delay={70} to={550} suffix="万" /></>} cx={790} top={450} w={400} delay={60} fs={54} border={A2.sub} />
    <Ill file="s5_growth.png" size={300} delay={40} left={390} top={620} />
    <Svg>
      <DrawLine d="M290 620 L290 980 L540 980" delay={120} dur={14} color={A2.coral} w={6} />
      <DrawLine d="M790 620 L790 980 L540 980" delay={120} dur={14} color={A2.coral} w={6} />
      <DrawLine d="M540 980 L540 1040" delay={140} dur={8} color={A2.coral} w={7} />
    </Svg>
    <PopIn delay={150} style={{ position: "absolute", left: 150, top: 1050, width: 780 }}>
      <div style={{ background: A2.marker, borderRadius: 22, padding: "24px 0", textAlign: "center", fontSize: 46, fontWeight: 800 }}>差分 <Big delay={152} to={260} prefix="＋約" suffix="万" size={72} color={A2.coral} dur={20} /></div>
    </PopIn>
  </BG2>
);

// S8 まとめ（62–70s）：利息50万 ＜ 運用益260万 → トータルで得（トロフィー）
const S8: React.FC = () => (
  <BG2>
    <Head delay={4} top={330} size={56}>利息を払っても</Head>
    <Box label="利息 50万" cx={280} top={470} w={340} delay={10} fs={46} border={A2.sub} />
    {op("＜", 540, 500, 30, A2.green)}
    <Box label="運用益 260万" cx={800} top={470} w={380} delay={40} fs={46} fill={A2.green} />
    <Svg><DrawLine d="M540 640 L540 720" delay={120} dur={10} color={A2.green} w={7} /></Svg>
    <Ill file="s5_trophy.png" size={300} delay={130} left={390} top={740} />
    <Head delay={150} top={1080} size={96}>トータルで <Mark2 delay={164}><span style={{ color: A2.red }}>得</span></Mark2></Head>
    <Appear delay={186} style={{ position: "absolute", left: 60, top: 1260, width: 960, textAlign: "center" }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: A2.sub }}>長期で見れば、現金一括が絶対正解じゃない。</div>
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

export const CAR_V4_FRAMES = 2103;

export const CarReelV4: React.FC = () => (
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
