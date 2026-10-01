import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, Img, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { BG2, A2, Mark2, SAFE } from "./components/kit2";
import { Float, CountUp, PopIn, Appear, DrawLine } from "./components/kit";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  がんのリアル編（がん保険①）図解リール
//  音声 public/gan1-narration.m4a（86.3s/図解1〜6）に同期。薄黄フラット。
//  グラフはアニメ付き（棒がポンポン・矢印↗↘・カウントアップ）。イラスト17点。
// ══════════════════════════════════════════════════════════
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const GAN_FRAMES = 2589;
const W = SAFE.x1 - SAFE.x0;
const BLUE = "#4A90D9", PINK = "#EC7FA0", RED = "#E8553B", ORANGE = "#EF7D4E";
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>;

const SlideTrans: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const inY = interpolate(f, [0, 8], [48, 0], clamp), inO = interpolate(f, [0, 8], [0, 1], clamp);
  const outY = interpolate(f, [dur - 12, dur], [0, -100], clamp), outO = interpolate(f, [dur - 12, dur], [1, 0], clamp);
  return <AbsoluteFill style={{ transform: `translateY(${inY + outY}px)`, opacity: Math.min(inO, outO) }}>{children}</AbsoluteFill>;
};
const Head: React.FC<{ delay: number; children: React.ReactNode; size?: number }> = ({ delay, children, size = 54 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: SAFE.x0, top: 250, width: W, textAlign: "center" }}>
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: 900, color: A2.ink, letterSpacing: 1 }}>{children}</div>
    <div style={{ width: 120, height: 11, borderRadius: 999, background: A2.green, margin: "14px auto 0" }} />
  </PopIn>
);
const Ill: React.FC<{ file: string; size: number; delay: number; left: number; top: number; amp?: number }> = ({ file, size, delay, left, top, amp = 7 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: size, height: size }}>
    <Float delay={delay} amp={amp}><Img src={staticFile(`gen/${file}.png`)} style={{ width: size, height: size, objectFit: "contain" }} /></Float>
  </PopIn>
);
const Band: React.FC<{ delay: number; top: number; children: React.ReactNode; color?: string; size?: number }> = ({ delay, top, children, color = A2.marker, size = 42 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 90, top, width: 900 }}>
    <Float delay={delay} amp={3}><div style={{ fontFamily: FONT, background: color, borderRadius: 22, padding: "20px 22px", textAlign: "center", fontSize: size, fontWeight: 900, lineHeight: 1.35, color: A2.ink }}>{children}</div></Float>
  </PopIn>
);

// ── カラオケ風テロップ（行ごとに出現・キーワード強調）──
type Cue = { f: number; runs: { t: string; c?: string; mark?: boolean }[] };
const CUES: Cue[] = [
  { f: 0, runs: [{ t: "がんは今や" }, { t: "2人に1人", mark: true }, { t: "の時代" }] },
  { f: 96, runs: [{ t: "生涯では男性", }, { t: "63%", c: BLUE }, { t: "・女性", }, { t: "50%", c: PINK }] },
  { f: 173, runs: [{ t: "見落としがちなのが" }] },
  { f: 230, runs: [{ t: "50歳までなら女性は男性の" }, { t: "約2.4倍", c: RED }] },
  { f: 320, runs: [{ t: "現役世代は", }, { t: "女性こそ油断できません", mark: true }] },
  { f: 369, runs: [{ t: "一方で、医療は大きく進歩" }] },
  { f: 470, runs: [{ t: "5年生存率も" }, { t: "改善", c: A2.green }] },
  { f: 510, runs: [{ t: "以前より", }, { t: "長く生きられる人", c: A2.green }, { t: "が増えています" }] },
  { f: 584, runs: [{ t: "ただし、ここからが重要" }] },
  { f: 640, runs: [{ t: "がん治療は大きく変わっていて" }] },
  { f: 688, runs: [{ t: "今は", }, { t: "入院が短く", c: BLUE }] },
  { f: 740, runs: [{ t: "通院しながら", c: A2.green }, { t: "治療を続ける" }] },
  { f: 831, runs: [{ t: "乳がんのホルモン療法は" }] },
  { f: 905, runs: [{ t: "5〜10年", c: ORANGE }, { t: "など長期間続く" }] },
  { f: 975, runs: [{ t: "さらに再発・転移した場合" }] },
  { f: 1040, runs: [{ t: "薬を", }, { t: "変更しながら", c: ORANGE }] },
  { f: 1118, runs: [{ t: "数年にわたって治療が続く" }] },
  { f: 1186, runs: [{ t: "長く続く通院・薬物治療への", }, { t: "備え", mark: true }, { t: "も重要" }] },
  { f: 1321, runs: [{ t: "「高額療養費があるから大丈夫」" }] },
  { f: 1381, runs: [{ t: "確かに、大事な制度だけど" }] },
  { f: 1440, runs: [{ t: "通院が", }, { t: "年単位", c: ORANGE }, { t: "で続けば" }] },
  { f: 1492, runs: [{ t: "医療費以外で", }, { t: "年100万円近く", c: RED }, { t: "飛んでいく" }] },
  { f: 1620, runs: [{ t: "公的医療保険で" }] },
  { f: 1680, runs: [{ t: "すべてがカバーされるわけではない", mark: true }] },
  { f: 1741, runs: [{ t: "先進医療の技術料や" }] },
  { f: 1800, runs: [{ t: "自由診療", c: ORANGE }, { t: "など" }] },
  { f: 1840, runs: [{ t: "公的保険の", }, { t: "対象外の費用", c: RED }, { t: "も" }] },
  { f: 1927, runs: [{ t: "最後に、一番怖いのが" }] },
  { f: 1980, runs: [{ t: "収入の減少", c: RED }] },
  { f: 2017, runs: [{ t: "収入が減った人は", }, { t: "約半数以上", c: RED }] },
  { f: 2110, runs: [{ t: "傷病手当金が出ても" }] },
  { f: 2160, runs: [{ t: "もらえるのは給料の", }, { t: "約3分の2", c: ORANGE }] },
  { f: 2227, runs: [{ t: "教育資金や老後資金が要る時期に" }] },
  { f: 2333, runs: [{ t: "貯金を", }, { t: "切り崩しながら", c: RED }, { t: "治療を続ける" }] },
  { f: 2423, runs: [{ t: "治療費に、収入の減少" }] },
  { f: 2474, runs: [{ t: "本当に怖いのは" }] },
  { f: 2520, runs: [{ t: "この状態が長く続くこと", mark: true }] },
];
const Telop: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  let i = 0; for (let k = 0; k < CUES.length; k++) if (f >= CUES[k].f) i = k;
  const cue = CUES[i]; const end = i + 1 < CUES.length ? CUES[i + 1].f : GAN_FRAMES;
  const s = spring({ frame: f - cue.f, fps, config: { damping: 14, stiffness: 180, mass: 0.6 }, durationInFrames: 8 });
  if (f >= end) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1540, textAlign: "center", fontFamily: FONT, transform: `scale(${0.95 + 0.05 * Math.min(1, s)})` }}>
      <div style={{ fontWeight: 900, fontSize: 52, lineHeight: 1.3, display: "inline-block", background: "rgba(255,255,255,0.75)", borderRadius: 18, padding: "10px 24px" }}>
        {cue.runs.map((r, k) => r.mark
          ? <span key={k} style={{ background: A2.marker, borderRadius: 8, padding: "2px 8px", color: A2.ink }}>{r.t}</span>
          : <span key={k} style={{ color: r.c || A2.ink }}>{r.t}</span>)}
      </div>
    </div>
  );
};

// ── P1：年代別ペア棒（ポンポン出現）＋2人に1人＋2.4倍 ──
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const groups = [
    { g: "〜40", m: 1.1, w: 2.3 }, { g: "〜50", m: 2.7, w: 6.4 }, { g: "〜60", m: 7.4, w: 12.6 },
    { g: "〜70", m: 20.3, w: 21.3 }, { g: "〜80", m: 41.8, w: 33.2 }, { g: "生涯", m: 63.3, w: 50.8 },
  ];
  const baseY = 1180, maxH = 560, x0 = 90, gw = 150;
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, ...groups.map((_, i) => ({ file: "pop", at: 40 + i * 20, volume: 0.28 })), { file: "up1", at: 175, volume: 0.34 }]} />
      <Head delay={2}>がんは<Mark2 delay={16}>2人に1人</Mark2>の時代</Head>
      <Ill file="g1_two_of_two" size={330} delay={6} left={60} top={360} amp={6} />
      <Ill file="g1_woman_young" size={230} delay={200} left={800} top={430} amp={7} />
      {/* 軸 */}
      <Svg><DrawLine d={`M${x0} ${baseY} L1010 ${baseY}`} delay={20} dur={10} color={A2.ink} w={4} /></Svg>
      {groups.map((gr, i) => {
        const cx = x0 + 30 + i * gw, d = 40 + i * 20;
        const hm = interpolate(f, [d, d + 16], [0, (gr.m / 70) * maxH], clamp);
        const hw = interpolate(f, [d + 6, d + 22], [0, (gr.w / 70) * maxH], clamp);
        return (
          <div key={gr.g}>
            <div style={{ position: "absolute", left: cx, top: baseY - hm, width: 44, height: hm, background: BLUE, borderRadius: "6px 6px 0 0" }} />
            <div style={{ position: "absolute", left: cx + 50, top: baseY - hw, width: 44, height: hw, background: PINK, borderRadius: "6px 6px 0 0" }} />
            <div style={{ position: "absolute", left: cx - 10, top: baseY + 8, width: 110, textAlign: "center", fontFamily: FONT, fontSize: 24, fontWeight: 800, color: A2.sub }}>{gr.g}</div>
            {gr.g === "生涯" && f > d + 16 && <>
              <div style={{ position: "absolute", left: cx - 30, top: baseY - hm - 46, width: 110, textAlign: "center", fontFamily: FONT, fontSize: 34, fontWeight: 900, color: BLUE }}>63%</div>
              <div style={{ position: "absolute", left: cx + 24, top: baseY - hw - 46, width: 110, textAlign: "center", fontFamily: FONT, fontSize: 34, fontWeight: 900, color: PINK }}>50%</div>
            </>}
          </div>
        );
      })}
      <PopIn delay={6} style={{ position: "absolute", left: 90, top: 1130, width: 300 }}>
        <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: A2.sub }}>■男性 ■女性（年代別の累積がん罹患リスク）</div>
      </PopIn>
      <Band delay={200} top={1250} color="#FBE7E2" size={44}>50歳までは<span style={{ color: RED }}>女性が男性を上回る</span>／<span style={{ color: RED }}>約2.4倍</span></Band>
    </BG2>
  );
};

// ── P2：生存率↗ ──
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [30, 90], [0, 1], clamp);
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "up6", at: 30, volume: 0.34 }, { file: "correct", at: 95, volume: 0.32 }]} />
      <Head delay={2}>がんは“治る時代”へ</Head>
      <Ill file="g2_recovered_smile" size={360} delay={8} left={640} top={720} amp={8} />
      <Svg>
        <DrawLine d="M180 1050 L820 620" delay={30} dur={40} color={A2.green} w={10} />
        {p > 0.9 && <path d="M795 600 L828 612 L812 644" fill="none" stroke={A2.green} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />}
      </Svg>
      <div style={{ position: "absolute", left: 120, top: 1060, fontFamily: FONT, fontSize: 40, fontWeight: 900, color: A2.sub }}>以前</div>
      <PopIn delay={90} style={{ position: "absolute", left: 560, top: 520, fontFamily: FONT }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: A2.green }}>今</div>
      </PopIn>
      <Band delay={120} top={760} color="#E4F6EC" size={44}>5年生存率は<span style={{ color: A2.green }}>改善</span>。長く生きられる人が増加</Band>
    </BG2>
  );
};

// ── P3：入院↓通院↑＋ホルモン療法バー ──
const P3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "up3", at: 40, volume: 0.3 }, { file: "up4", at: 60, volume: 0.3 }, { file: "up6", at: 330, volume: 0.34 }, { file: "pop", at: 420, volume: 0.3 }]} />
      <Head delay={2} size={50}>治療は“長くて通院”</Head>
      {/* 入院↓ 通院↑ */}
      <div style={{ position: "absolute", left: 70, top: 360, width: 940, display: "flex", gap: 24 }}>
        <PopIn delay={40} style={{ flex: 1 }}><div style={{ fontFamily: FONT, background: "#fff", border: `3px solid ${A2.track}`, borderRadius: 20, padding: "20px 0", textAlign: "center" }}><div style={{ fontSize: 38, fontWeight: 900 }}>入院</div><div style={{ fontSize: 44, fontWeight: 900, color: BLUE }}>短く ↓</div></div></PopIn>
        <PopIn delay={60} style={{ flex: 1 }}><div style={{ fontFamily: FONT, background: "#E4F6EC", border: `3px solid ${A2.green}`, borderRadius: 20, padding: "20px 0", textAlign: "center" }}><div style={{ fontSize: 38, fontWeight: 900 }}>通院</div><div style={{ fontSize: 44, fontWeight: 900, color: A2.green }}>主流に ↑</div></div></PopIn>
      </div>
      <Ill file="g3_commute_hospital" size={300} delay={60} left={60} top={560} amp={6} />
      <Ill file="g3_pills_longterm" size={300} delay={300} left={720} top={560} amp={6} />
      {/* ホルモン療法バー 5→10年 */}
      <Appear delay={300} style={{ position: "absolute", left: 60, top: 960, width: 960, textAlign: "center", fontFamily: FONT, fontSize: 36, fontWeight: 900 }}>乳がんのホルモン療法は…</Appear>
      <div style={{ position: "absolute", left: 90, top: 1030, width: 900, height: 44, borderRadius: 999, background: A2.track }} />
      <div style={{ position: "absolute", left: 90, top: 1030, height: 44, borderRadius: 999, background: ORANGE, width: interpolate(f, [320, 370], [0, 900], clamp) }} />
      <div style={{ position: "absolute", left: 90, top: 1088, fontFamily: FONT, fontSize: 26, fontWeight: 800, color: A2.sub }}>0年</div>
      <div style={{ position: "absolute", right: 90, top: 1082, fontFamily: FONT, fontSize: 34, fontWeight: 900, color: ORANGE }}>5〜10年</div>
      <Ill file="g3_relapse_change" size={230} delay={400} left={60} top={1180} amp={6} />
      <Band delay={400} top={1240} color="#FBE7E2" size={40}>再発・転移で<span style={{ color: ORANGE }}>数年続く</span>ことも</Band>
    </BG2>
  );
};

// ── P4：高額療養費＋年100万 ──
const P4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "count", at: 150, volume: 0.3 }, { file: "up1", at: 210, volume: 0.34 }]} />
      <Head delay={2} size={48}>高額療養費があっても、かかる</Head>
      <PopIn delay={30} style={{ position: "absolute", left: 90, top: 400, width: 900 }}>
        <div style={{ fontFamily: FONT, background: "#E4F6EC", border: `3px solid ${A2.green}`, borderRadius: 20, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: A2.green, color: "#fff", fontSize: 36, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✓</div>
          <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.3 }}>確かに大事な制度。でも“医療費以外”は対象外</div>
        </div>
      </PopIn>
      <Ill file="g4_woman_bills_worry" size={320} delay={40} left={70} top={560} amp={6} />
      <Ill file="g4_money_fly" size={320} delay={130} left={690} top={560} amp={7} />
      <PopIn delay={150} style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: A2.ink }}>通院が年単位で続くと…</div>
      </PopIn>
      <PopIn delay={180} style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 64, fontWeight: 900, color: RED }}>医療費以外で 年<CountUp delay={180} to={100} dur={26} />万円</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: A2.ink }}>近く飛んでいく覚悟も</div>
      </PopIn>
      <Ill file="g4_extra_costs_set" size={300} delay={220} left={390} top={1220} amp={5} />
    </BG2>
  );
};

// ── P5：自由診療・対象外が積み重なる ──
const P5: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "up3", at: 120, volume: 0.3 }, { file: "up4", at: 150, volume: 0.3 }, { file: "up1", at: 200, volume: 0.34 }]} />
    <Head delay={2} size={50}>公的保険で“全部”は守れない</Head>
    <Ill file="g5_free_drug" size={330} delay={8} left={70} top={400} amp={6} />
    <Ill file="g5_coverage_gap" size={330} delay={120} left={690} top={400} amp={6} />
    <div style={{ position: "absolute", left: 90, right: 90, top: 820 }}>
      {[{ t: "先進医療の技術料", d: 120 }, { t: "自由診療・未承認薬", d: 160 }, { t: "…公的保険の対象外", d: 200 }].map((r, i) => (
        <PopIn key={i} delay={r.d} style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: FONT, background: i === 2 ? "#FBE7E2" : "#fff", border: `3px solid ${i === 2 ? RED : ORANGE}`, borderRadius: 16, padding: "16px 22px", fontSize: 38, fontWeight: 900, color: i === 2 ? RED : A2.ink, textAlign: "center" }}>{r.t}</div>
        </PopIn>
      ))}
    </div>
    <Band delay={230} top={1200} size={42}>保険の効かない治療＝<span style={{ color: RED }}>全額自己負担</span></Band>
  </BG2>
);

// ── P6：収入減＋傷病手当2/3＋貯金↓＋一撃 ──
const P6: React.FC = () => {
  const f = useCurrentFrame();
  const sav = interpolate(f, [360, 470], [0, 1], clamp);
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "pop", at: 90, volume: 0.3 }, { file: "count", at: 240, volume: 0.3 }, { file: "up6", at: 360, volume: 0.3 }, { file: "finish", at: 560, volume: 0.42 }]} />
      <Head delay={2} size={50}>一番怖いのは“収入の減少”</Head>
      <Ill file="g6_income_worry" size={260} delay={8} left={60} top={360} amp={6} />
      <PopIn delay={90} style={{ position: "absolute", left: 420, top: 380, width: 560, textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 40, fontWeight: 900 }}>収入が減った人</div>
        <div style={{ fontSize: 80, fontWeight: 900, color: RED }}>約半数以上</div>
      </PopIn>
      {/* 傷病手当 2/3 ゲージ */}
      <Ill file="g6_sick_allowance" size={230} delay={240} left={60} top={660} amp={6} />
      <Appear delay={240} style={{ position: "absolute", left: 320, top: 680, width: 660, fontFamily: FONT, fontSize: 34, fontWeight: 900 }}>傷病手当金＝給料の<span style={{ color: ORANGE }}>約2/3</span></Appear>
      <div style={{ position: "absolute", left: 320, top: 740, width: 640, height: 34, borderRadius: 999, background: A2.track }} />
      <div style={{ position: "absolute", left: 320, top: 740, height: 34, borderRadius: 999, background: ORANGE, width: interpolate(f, [250, 280], [0, 640 * 2 / 3], clamp) }} />
      {/* 貯金↓ */}
      <Ill file="g6_savings_empty" size={300} delay={360} left={60} top={880} amp={6} />
      <Svg>
        <DrawLine d="M430 980 L980 1180" delay={360} dur={40} color={RED} w={9} />
        {sav > 0.9 && <path d="M955 1158 L988 1184 L958 1198" fill="none" stroke={RED} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />}
      </Svg>
      <div style={{ position: "absolute", left: 430, top: 940, fontFamily: FONT, fontSize: 30, fontWeight: 900, color: A2.sub }}>貯金</div>
      <div style={{ position: "absolute", left: 760, top: 1120, fontFamily: FONT, fontSize: 30, fontWeight: 900, color: RED }}>終わりが見えない</div>
      {/* 一撃 */}
      <PopIn delay={500} style={{ position: "absolute", left: 60, top: 1250, width: 960 }}>
        <Float delay={500} amp={4}><div style={{ fontFamily: FONT, background: A2.ink, borderRadius: 24, padding: "28px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: "#fff" }}>治療費 ＋ 収入の減少</div>
          <div style={{ fontSize: 46, fontWeight: 900, color: "#fff", marginTop: 8 }}>怖いのは<span style={{ color: A2.marker }}>“長く続く”</span>こと</div>
        </div></Float>
      </PopIn>
    </BG2>
  );
};

const SCENES: { c: React.FC; from: number; dur: number }[] = [
  { c: P1, from: 0, dur: 369 }, { c: P2, from: 369, dur: 215 }, { c: P3, from: 584, dur: 737 },
  { c: P4, from: 1321, dur: 299 }, { c: P5, from: 1620, dur: 307 }, { c: P6, from: 1927, dur: 662 },
];
export const GanReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg }}>
    <Audio src={staticFile("gan1-narration.m4a")} />
    {SCENES.map(({ c: C, from, dur }, i) => (
      <Sequence key={i} from={from} durationInFrames={dur}><SlideTrans dur={dur}><C /></SlideTrans></Sequence>
    ))}
    <Telop />
  </AbsoluteFill>
);
