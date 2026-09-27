import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { WhiteBG, CC, Appear, PopIn, SlideIn, CountUp, Mark, HeadChip, Center, DrawLine, GrowBar, Float, SceneFade } from "./components/kit";
import { IllCar, IllWalletBank, IllGrowMoney, IllFamily, IllUSA, IllTrophy } from "./components/illus";

// ══════════════════════════════════════════════════════════
//  音声(car-narration.m4a / 70.10s / 30fps)に完全同期した全8シーン
//  設計: scene_plan.json / narration_alignment.json
//  原則: 白背景・1画面1メッセージ・話す瞬間に出す・数字はカウントアップ
// ══════════════════════════════════════════════════════════

// 比較カード
const Card: React.FC<{ label: string; sub?: string; cx: number; top: number; accent: string; w?: number }> = ({ label, sub, cx, top, accent, w = 384 }) => (
  <div style={{ position: "absolute", left: cx - w / 2, top, width: w }}>
    <div style={{ border: `4px solid ${accent}`, borderRadius: 22, background: "#fff", boxShadow: "0 10px 26px rgba(27,42,74,0.08)", padding: "30px 0" }}>
      <div style={{ textAlign: "center", fontSize: 56, fontWeight: 700, color: CC.ink }}>{label}</div>
      {sub ? <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700, color: CC.gray, marginTop: 8 }}>{sub}</div> : null}
    </div>
  </div>
);

// 小さめの折れ線（株=ギザギザ / 債券=なめらか上昇）
const MiniLine: React.FC<{ kind: "volatile" | "rise" }> = ({ kind }) => (
  <svg viewBox="0 0 300 150" style={{ width: 300, height: 150 }}>
    <line x1="16" y1="132" x2="290" y2="132" stroke={CC.line} strokeWidth="4" strokeLinecap="round" />
    {kind === "volatile" ? (
      <polyline points="24,96 60,54 96,112 132,40 168,120 204,64 240,116 280,78" fill="none" stroke={CC.red} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <polyline points="24,120 84,104 144,80 204,52 264,28" fill="none" stroke={CC.green} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

// 備えチップ（教育・老後・特別費）
const NeedChip: React.FC<{ delay: number; icon: string; label: string; cx: number; top: number }> = ({ delay, icon, label, cx, top }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: cx - 150, top, width: 300 }}>
    <div style={{ background: CC.chip, border: `3px solid ${CC.ink}`, borderRadius: 18, padding: "18px 0", textAlign: "center" }}>
      <div style={{ fontSize: 52 }}>{icon}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: CC.ink, marginTop: 4 }}>{label}</div>
    </div>
  </PopIn>
);

// ── S1 導入＋結論（0.0–7.1s） ──
const S1: React.FC = () => (
  <WhiteBG>
    <HeadChip delay={4} title="500万円の車、どう買う？" top={220} />
    <Float delay={12} amp={10} style={{ position: "absolute", left: 370, top: 410, width: 340, display: "flex", justifyContent: "center" }}><IllCar size={340} /></Float>
    <SlideIn delay={26} from="left"><Card label="現金一括" cx={310} top={720} accent={CC.gray} /></SlideIn>
    <SlideIn delay={34} from="right"><Card label="銀行ローン" cx={770} top={720} accent={CC.ink} /></SlideIn>
    <Mark delay={110} type="check" style={{ position: "absolute", left: 770 + 150, top: 698 }} />
    <PopIn delay={104} style={{ position: "absolute", left: 140, top: 1010, width: 800 }}>
      <div style={{ background: CC.ink, color: "#fff", borderRadius: 22, padding: "30px 0", textAlign: "center", fontSize: 60, fontWeight: 700 }}>
        結論は <span style={{ color: CC.gold }}>“敢えてローン”</span>
      </div>
    </PopIn>
    <Appear delay={140} style={{ position: "absolute", left: 40, top: 1190, width: 1000, textAlign: "center" }}>
      <div style={{ fontSize: 34, fontWeight: 700, color: CC.gray }}>※手元資金を残したい家庭ほど</div>
    </Appear>
  </WhiteBG>
);

// ── S2 総支払の積み上げ（7.1–15.1s） ──
const S2: React.FC = () => (
  <WhiteBG>
    <HeadChip delay={4} title="銀行ローンで買うと" top={250} />
    <Appear delay={4} style={{ position: "absolute", left: 0, top: 470, width: 1080, textAlign: "center" }}>
      <span style={{ fontSize: 40, fontWeight: 700, color: CC.gray, background: CC.chip, borderRadius: 999, padding: "8px 28px" }}>金利2% ・ 10年</span>
    </Appear>
    <Center top={640}><Appear delay={85}><div style={{ fontSize: 66, fontWeight: 700, color: CC.ink }}>車両 <CountUp delay={85} to={500} suffix="万" /></div></Appear></Center>
    <Center top={780}><Appear delay={145}><div style={{ fontSize: 66, fontWeight: 700, color: CC.red }}>＋ 利息 <CountUp delay={145} to={50} suffix="万" /></div></Appear></Center>
    <div style={{ position: "absolute", left: 300, top: 930, width: 480, height: 4, background: CC.line }} />
    <PopIn delay={186} style={{ position: "absolute", left: 120, top: 1000, width: 840 }}>
      <div style={{ background: CC.ink, color: "#fff", borderRadius: 22, padding: "34px 0", textAlign: "center", fontSize: 76, fontWeight: 700 }}>
        ＝ 総支払 <span style={{ color: CC.gold }}>約<CountUp delay={190} to={550} dur={12} suffix="万" /></span>
      </div>
    </PopIn>
  </WhiteBG>
);

// ── S3 利息は損？→元手の使い方（15.1–24.1s） ──
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const fade1 = interpolate(f, [96, 116], [1, 0.28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <WhiteBG>
      <div style={{ position: "absolute", left: 40, top: 470, width: 1000, textAlign: "center", opacity: fade1 }}>
        <Appear delay={4}><div style={{ fontSize: 64, fontWeight: 700, color: CC.ink }}>利息50万は <span style={{ color: CC.red }}>損？</span></div></Appear>
      </div>
      <Center top={680}><Appear delay={106}><div style={{ fontSize: 46, fontWeight: 700, color: CC.gray }}>いや、カギは</div></Appear></Center>
      <Center top={760}><PopIn delay={112}><div style={{ fontSize: 78, fontWeight: 700, color: CC.ink }}>“元手500万” の<span style={{ color: CC.red }}>使い方</span></div></PopIn></Center>
      {/* 元手500万 → 運用 */}
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <DrawLine d="M430 1075 L650 1075" delay={196} dur={14} color={CC.ink} w={8} />
        <DrawLine d="M628 1058 L662 1075 L628 1092" delay={205} dur={8} color={CC.ink} w={8} />
      </svg>
      <PopIn delay={184} style={{ position: "absolute", left: 150, top: 1030, width: 280 }}>
        <div style={{ border: `4px solid ${CC.ink}`, borderRadius: 16, padding: "20px 0", textAlign: "center", fontSize: 44, fontWeight: 700, color: CC.ink, background: "#fff" }}>元手500万</div>
      </PopIn>
      <PopIn delay={212} style={{ position: "absolute", left: 670, top: 1030, width: 260 }}>
        <div style={{ background: CC.green, borderRadius: 16, padding: "20px 0", textAlign: "center", fontSize: 46, fontWeight: 700, color: "#fff" }}>運用へ</div>
      </PopIn>
      <Float delay={218} amp={10} style={{ position: "absolute", left: 440, top: 1180, width: 200, display: "flex", justifyContent: "center" }}><IllGrowMoney size={200} /></Float>
    </WhiteBG>
  );
};

// ── S4 株か債券か→債券（24.1–33.1s） ──
const S4: React.FC = () => (
  <WhiteBG>
    <HeadChip delay={4} title="何で増やす？" top={250} />
    <SlideIn delay={6} from="left"><Card label="株 ？" cx={310} top={660} accent={CC.gray} /></SlideIn>
    <SlideIn delay={16} from="right"><Card label="債券 ？" cx={770} top={660} accent={CC.ink} /></SlideIn>
    <Mark delay={124} type="tri" style={{ position: "absolute", left: 310 + 150, top: 636 }} />
    <Mark delay={132} type="check" style={{ position: "absolute", left: 770 + 150, top: 636 }} />
    <PopIn delay={140} style={{ position: "absolute", left: 140, top: 1010, width: 800 }}>
      <div style={{ background: CC.ink, color: "#fff", borderRadius: 22, padding: "30px 0", textAlign: "center", fontSize: 62, fontWeight: 700 }}>
        リスクを抑え <span style={{ color: CC.gold }}>債券</span>
      </div>
    </PopIn>
  </WhiteBG>
);

// ── S5 子育て世帯こそ計画的（33.1–47.1s） ──
const S5: React.FC = () => (
  <WhiteBG>
    <HeadChip delay={4} title="子育て世帯こそ“計画的に”" top={230} size={54} />
    <NeedChip delay={4} icon="🎓" label="教育資金" cx={230} top={470} />
    <NeedChip delay={50} icon="🐖" label="老後資金" cx={540} top={470} />
    <NeedChip delay={96} icon="⭐" label="特別費" cx={850} top={470} />
    {/* 株 vs 債券 のミニ比較 */}
    <SlideIn delay={184} from="left" style={{ position: "absolute", left: 90, top: 760, width: 400 }}>
      <div style={{ border: `4px solid ${CC.red}`, borderRadius: 18, background: "#fff", padding: "16px 0 8px" }}>
        <div style={{ textAlign: "center", fontSize: 40, fontWeight: 700, color: CC.ink }}>株</div>
        <div style={{ display: "flex", justifyContent: "center" }}><MiniLine kind="volatile" /></div>
        <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700, color: CC.red }}>暴落リスク</div>
      </div>
    </SlideIn>
    <SlideIn delay={196} from="right" style={{ position: "absolute", left: 590, top: 760, width: 400 }}>
      <div style={{ border: `4px solid ${CC.green}`, borderRadius: 18, background: "#fff", padding: "16px 0 8px" }}>
        <div style={{ textAlign: "center", fontSize: 40, fontWeight: 700, color: CC.ink }}>債券</div>
        <div style={{ display: "flex", justifyContent: "center" }}><MiniLine kind="rise" /></div>
        <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700, color: CC.green }}>見通せる</div>
      </div>
    </SlideIn>
    <PopIn delay={334} style={{ position: "absolute", left: 130, top: 1120, width: 820 }}>
      <div style={{ background: CC.ink, color: "#fff", borderRadius: 22, padding: "28px 0", textAlign: "center", fontSize: 54, fontWeight: 700 }}>
        債券 ＝ <span style={{ color: CC.gold }}>約束された資産</span>
      </div>
    </PopIn>
    <Float delay={360} amp={7} style={{ position: "absolute", left: 380, top: 1300, width: 320, display: "flex", justifyContent: "center" }}><IllFamily size={320} /></Float>
  </WhiteBG>
);

// ── S6 米国債5%（47.1–53.1s） ──
const S6: React.FC = () => (
  <WhiteBG>
    <HeadChip delay={4} title="しかも今、米国債は" top={240} />
    <Float delay={6} amp={11} style={{ position: "absolute", left: 410, top: 420, width: 260, display: "flex", justifyContent: "center" }}><IllUSA size={260} /></Float>
    <Center top={690}>
      <PopIn delay={10}>
        <div style={{ fontSize: 70, fontWeight: 700, color: CC.ink }}>
          金利 <span style={{ fontSize: 190, color: CC.red, verticalAlign: "-28px" }}><CountUp delay={12} to={5} dur={26} suffix="%" /></span>
        </div>
      </PopIn>
    </Center>
    <PopIn delay={44} style={{ position: "absolute", left: 340, top: 1000, width: 400 }}>
      <div style={{ background: "#C79A17", color: "#fff", borderRadius: 999, padding: "14px 0", textAlign: "center", fontSize: 46, fontWeight: 700 }}>高水準</div>
    </PopIn>
    <Center top={1140}><Appear delay={97}><div style={{ fontSize: 38, fontWeight: 700, color: CC.gray }}>実際に、僕も約5%の債券を保有中</div></Appear></Center>
  </WhiteBG>
);

// ── S7 10年後の比較グラフ（53.1–62.1s） ──
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const BASE = 1220, MAXV = 810, MAXH = 520, unit = MAXH / MAXV;
  const CXL = 360, CXR = 720, BW = 210;
  const bondBase = 550 * unit, bondDelta = 260 * unit, car = 550 * unit;
  const showBondLabel = f > 64 + 20;
  const showCarLabel = f > 124 + 18;
  const dash = interpolate(f, [150, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const compareY = BASE - bondBase; // 550ライン
  return (
    <WhiteBG>
      <HeadChip delay={4} title="10年後、どうなる？" top={230} />
      {/* 床 */}
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1="150" y1={BASE} x2="930" y2={BASE} stroke={CC.ink} strokeWidth="6" strokeLinecap="round" />
        {dash > 0.01 && <line x1={CXL} y1={compareY} x2={CXR + BW / 2} y2={compareY} stroke={CC.red} strokeWidth="5" strokeDasharray="14 12" strokeDashoffset={(1 - dash) * 300} opacity={0.9} />}
      </svg>
      {/* 左：運用（550土台＋260増加＝810） */}
      <GrowBar cx={CXL} baseline={BASE} height={bondBase} width={BW} color={CC.green} delay={64} radiusTop={false} />
      <div style={{ position: "absolute", left: CXL - BW / 2, top: BASE - bondBase - bondDelta * interpolate(f, [92, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), width: BW, height: bondDelta * interpolate(f, [92, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), background: CC.gold, border: `4px solid ${CC.ink}`, borderBottom: "none", borderTopLeftRadius: 12, borderTopRightRadius: 12, boxSizing: "border-box" }} />
      {/* 右：車 550 */}
      <GrowBar cx={CXR} baseline={BASE} height={car} width={BW} color={CC.gray} delay={124} />
      {/* ラベル */}
      {showBondLabel && <Appear delay={0} style={{ position: "absolute", left: CXL - 160, top: BASE - MAXH - 84, width: 320, textAlign: "center" }}><div style={{ fontSize: 58, fontWeight: 700, color: CC.ink }}>約810万</div></Appear>}
      {showCarLabel && <Appear delay={0} style={{ position: "absolute", left: CXR - 160, top: BASE - car - 84, width: 320, textAlign: "center" }}><div style={{ fontSize: 58, fontWeight: 700, color: CC.gray }}>550万</div></Appear>}
      {/* 差分 +260 */}
      {f > 150 && <Appear delay={0} style={{ position: "absolute", left: CXL + BW / 2 + 6, top: BASE - bondBase - bondDelta - 6, width: 320 }}><div style={{ fontSize: 52, fontWeight: 700, color: CC.red, whiteSpace: "nowrap" }}>＋<CountUp delay={150} to={260} dur={20} suffix="万" /></div></Appear>}
      {/* キャプション */}
      <div style={{ position: "absolute", left: CXL - 200, top: BASE + 18, width: 400, textAlign: "center", fontSize: 36, fontWeight: 700, color: CC.ink }}>債券で運用</div>
      <div style={{ position: "absolute", left: CXR - 200, top: BASE + 18, width: 400, textAlign: "center", fontSize: 36, fontWeight: 700, color: CC.gray }}>車の総支払</div>
    </WhiteBG>
  );
};

// ── S8 まとめ（62.1–70.1s） ──
const S8: React.FC = () => (
  <WhiteBG>
    <PopIn delay={4} style={{ position: "absolute", left: 90, top: 420, width: 900 }}>
      <div style={{ background: CC.ink, color: "#fff", borderRadius: 22, padding: "36px 0", textAlign: "center", fontSize: 62, fontWeight: 700 }}>
        利息50万 <span style={{ color: "#F6C544", fontSize: 84 }}>＜</span> 運用益260万
      </div>
    </PopIn>
    <Float delay={150} amp={9} style={{ position: "absolute", left: 415, top: 660, width: 250, display: "flex", justifyContent: "center" }}><IllTrophy size={250} /></Float>
    <PopIn delay={154} style={{ position: "absolute", left: 40, top: 980, width: 1000, textAlign: "center" }}>
      <div style={{ fontSize: 100, fontWeight: 700, color: CC.ink }}>トータルで <span style={{ color: CC.red }}>得</span></div>
    </PopIn>
    <Appear delay={186} style={{ position: "absolute", left: 60, top: 1200, width: 960, textAlign: "center" }}>
      <div style={{ fontSize: 40, fontWeight: 700, color: CC.gray, lineHeight: 1.5 }}>現金一括が絶対正解じゃない。<br />子育て世帯こそ“計画的に”。</div>
    </Appear>
  </WhiteBG>
);

// シーンの開始フレームと長さ（音声境界に一致）
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

export const CAR_SYNC_FRAMES = 2103; // 70.10s @30fps

export const CarSyncReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#fff" }}>
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
