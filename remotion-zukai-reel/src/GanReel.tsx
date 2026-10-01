import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, Img, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { BG2, A2, Mark2 } from "./components/kit2";
import { Float, CountUp, PopIn, Appear, DrawLine } from "./components/kit";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  がんのリアル編（がん保険①）図解リール — 品質ルール準拠版
//  音声 public/gan1-narration.m4a（86.3s/図解1〜6）に同期。
//  ゾーン：見出しy250-360／メイン視覚y380-1290／テロップ安全帯y1360（下すぎ禁止）。
//  常時モーション（ズーム＋Float＋順次出現）。要素は重ねない（長尺はフェーズ切替）。
// ══════════════════════════════════════════════════════════
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const GAN_FRAMES = 2589;
const BLUE = "#4A90D9", PINK = "#EC7FA0", RED = "#E8553B", ORANGE = "#EF7D4E";
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>;

const SlideTrans: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const inY = interpolate(f, [0, 8], [40, 0], clamp), inO = interpolate(f, [0, 8], [0, 1], clamp);
  const outY = interpolate(f, [dur - 12, dur], [0, -80], clamp), outO = interpolate(f, [dur - 12, dur], [1, 0], clamp);
  // 常時ゆっくりズーム（止めない）
  const z = interpolate(f, [0, dur], [1, 1.03], clamp);
  return <AbsoluteFill style={{ transform: `translateY(${inY + outY}px) scale(${z})`, transformOrigin: "50% 45%", opacity: Math.min(inO, outO) }}>{children}</AbsoluteFill>;
};
// フェーズ表示（長尺シーンで要素群を切り替え＝被り回避＋動き）
const Phase: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [a, a + 10], [0, 1], clamp), interpolate(f, [b - 10, b], [1, 0], clamp));
  if (o <= 0) return null;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
const Head: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 54 }) => (
  <PopIn delay={2} style={{ position: "absolute", left: 60, top: 258, width: 960, textAlign: "center" }}>
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: 900, color: A2.ink, letterSpacing: 1, lineHeight: 1.25 }}>{children}</div>
    <div style={{ width: 120, height: 10, borderRadius: 999, background: A2.green, margin: "12px auto 0" }} />
  </PopIn>
);
const Ill: React.FC<{ file: string; size: number; delay: number; left: number; top: number; amp?: number }> = ({ file, size, delay, left, top, amp = 8 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: size, height: size }}>
    <Float delay={delay} amp={amp}><Img src={staticFile(`gen/${file}.png`)} style={{ width: size, height: size, objectFit: "contain" }} /></Float>
  </PopIn>
);
// メイン域の中央ステートメント（中央寄せ・改行制御）
const Statement: React.FC<{ delay: number; top: number; children: React.ReactNode; size?: number; color?: string }> = ({ delay, top, children, size = 46, color = A2.ink }) => (
  <Appear delay={delay} style={{ position: "absolute", left: 80, top, width: 920, textAlign: "center" }}>
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: 900, lineHeight: 1.4, color }}>{children}</div>
  </Appear>
);

// ── テロップ（下安全帯 y1360・中央寄せ・幅制御・被らない）──
type Cue = { f: number; runs: { t: string; c?: string; mark?: boolean }[] };
const CUES: Cue[] = [
  { f: 0, runs: [{ t: "がんは今や" }, { t: "2人に1人", mark: true }, { t: "の時代" }] },
  { f: 96, runs: [{ t: "生涯では男性", }, { t: "63%", c: BLUE }, { t: "・女性", }, { t: "50%", c: PINK }] },
  { f: 173, runs: [{ t: "見落としがちなのが…" }] },
  { f: 235, runs: [{ t: "50歳までは女性が", }, { t: "約2.4倍", c: RED }] },
  { f: 320, runs: [{ t: "女性こそ油断できません", mark: true }] },
  { f: 369, runs: [{ t: "医療は大きく進歩" }] },
  { f: 470, runs: [{ t: "5年生存率も", }, { t: "改善", c: A2.green }] },
  { f: 510, runs: [{ t: "長く生きられる人が増加", c: A2.green }] },
  { f: 584, runs: [{ t: "ただし、ここからが重要" }] },
  { f: 640, runs: [{ t: "がん治療は大きく変わった" }] },
  { f: 688, runs: [{ t: "入院は短く", c: BLUE }, { t: "、通院が主流に" }] },
  { f: 831, runs: [{ t: "乳がんのホルモン療法は" }] },
  { f: 905, runs: [{ t: "5〜10年", c: ORANGE }, { t: "続くことも" }] },
  { f: 975, runs: [{ t: "再発・転移すれば" }] },
  { f: 1040, runs: [{ t: "薬を変えて", c: ORANGE }, { t: "数年続く" }] },
  { f: 1186, runs: [{ t: "長い通院・薬への", }, { t: "備え", mark: true }, { t: "が重要" }] },
  { f: 1321, runs: [{ t: "「高額療養費があるから安心」" }] },
  { f: 1381, runs: [{ t: "確かに大事な制度。でも…" }] },
  { f: 1440, runs: [{ t: "通院が", }, { t: "年単位", c: ORANGE }, { t: "で続くと" }] },
  { f: 1492, runs: [{ t: "医療費以外で", }, { t: "年100万円", c: RED }, { t: "近く" }] },
  { f: 1620, runs: [{ t: "公的保険で" }] },
  { f: 1680, runs: [{ t: "全部はカバーされない", mark: true }] },
  { f: 1741, runs: [{ t: "先進医療や" }, { t: "自由診療", c: ORANGE }] },
  { f: 1840, runs: [{ t: "対象外の費用", c: RED }, { t: "もある" }] },
  { f: 1927, runs: [{ t: "一番怖いのが…" }] },
  { f: 1980, runs: [{ t: "収入の減少", c: RED }] },
  { f: 2017, runs: [{ t: "減った人は", }, { t: "約半数以上", c: RED }] },
  { f: 2110, runs: [{ t: "傷病手当金が出ても" }] },
  { f: 2160, runs: [{ t: "給料の", }, { t: "約3分の2", c: ORANGE }] },
  { f: 2227, runs: [{ t: "お金がかかる時期に…" }] },
  { f: 2333, runs: [{ t: "貯金を", }, { t: "切り崩し続ける", c: RED }] },
  { f: 2423, runs: [{ t: "治療費に、収入の減少" }] },
  { f: 2500, runs: [{ t: "怖いのは", }, { t: "長く続くこと", mark: true }] },
];
const Telop: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  let i = 0; for (let k = 0; k < CUES.length; k++) if (f >= CUES[k].f) i = k;
  const cue = CUES[i]; const end = i + 1 < CUES.length ? CUES[i + 1].f : GAN_FRAMES;
  const s = spring({ frame: f - cue.f, fps, config: { damping: 15, stiffness: 190, mass: 0.6 }, durationInFrames: 7 });
  if (f >= end) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1360, display: "flex", justifyContent: "center", transform: `translateY(${(1 - Math.min(1, s)) * 18}px)` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 56, lineHeight: 1.25, color: A2.ink, background: "rgba(255,255,255,0.82)", borderRadius: 18, padding: "14px 30px", maxWidth: 940, textAlign: "center", boxShadow: "0 8px 20px rgba(80,60,20,0.12)" }}>
        {cue.runs.map((r, k) => r.mark
          ? <span key={k} style={{ background: A2.marker, borderRadius: 8, padding: "2px 10px" }}>{r.t}</span>
          : <span key={k} style={{ color: r.c || A2.ink }}>{r.t}</span>)}
      </div>
    </div>
  );
};

// ══ 図解1：年代別ペア棒（チャート左／イラスト右・被らせない）══
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const groups = [
    { g: "40", m: 1.1, w: 2.3 }, { g: "50", m: 2.7, w: 6.4 }, { g: "60", m: 7.4, w: 12.6 },
    { g: "70", m: 20.3, w: 21.3 }, { g: "80", m: 41.8, w: 33.2 }, { g: "生涯", m: 63.3, w: 50.8 },
  ];
  const baseY = 1120, maxH = 470, x0 = 95, gw = 102;
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, ...groups.map((_, i) => ({ file: "pop" as const, at: 40 + i * 16, volume: 0.26 })), { file: "up1", at: 190, volume: 0.34 }]} />
      <Head>がんは<Mark2 delay={16}>2人に1人</Mark2>の時代</Head>
      <PopIn delay={10} style={{ position: "absolute", left: 95, top: 400, fontFamily: FONT, fontSize: 24, fontWeight: 800, color: A2.sub }}>
        <span style={{ color: BLUE }}>■</span>男性 <span style={{ color: PINK }}>■</span>女性（年代別のがん罹患リスク）
      </PopIn>
      <Ill file="g1_woman_young" size={250} delay={200} left={760} top={430} amp={9} />
      <Svg><DrawLine d={`M${x0} ${baseY} L745 ${baseY}`} delay={20} dur={10} color={A2.ink} w={4} /></Svg>
      {groups.map((gr, i) => {
        const cx = x0 + 18 + i * gw, d = 40 + i * 16;
        const hm = interpolate(f, [d, d + 14], [0, (gr.m / 70) * maxH], clamp);
        const hw = interpolate(f, [d + 5, d + 19], [0, (gr.w / 70) * maxH], clamp);
        const last = gr.g === "生涯";
        return (
          <div key={gr.g}>
            <div style={{ position: "absolute", left: cx, top: baseY - hm, width: 30, height: hm, background: BLUE, borderRadius: "5px 5px 0 0" }} />
            <div style={{ position: "absolute", left: cx + 34, top: baseY - hw, width: 30, height: hw, background: PINK, borderRadius: "5px 5px 0 0" }} />
            <div style={{ position: "absolute", left: cx - 12, top: baseY + 8, width: 88, textAlign: "center", fontFamily: FONT, fontSize: 20, fontWeight: 800, color: A2.sub }}>{gr.g === "生涯" ? "生涯" : `〜${gr.g}`}</div>
            {last && f > d + 14 && <>
              <div style={{ position: "absolute", left: cx - 40, top: baseY - hm - 40, width: 110, textAlign: "center", fontFamily: FONT, fontSize: 30, fontWeight: 900, color: BLUE }}>63%</div>
              <div style={{ position: "absolute", left: cx + 10, top: baseY - hw - 40, width: 110, textAlign: "center", fontFamily: FONT, fontSize: 30, fontWeight: 900, color: PINK }}>50%</div>
            </>}
          </div>
        );
      })}
      {/* 2.4倍 吹き出し（〜50 群の上・被らせない） */}
      <PopIn delay={235} style={{ position: "absolute", left: 540, top: 720, width: 420 }}>
        <Float delay={235} amp={5}><div style={{ fontFamily: FONT, background: "#FBE7E2", border: `3px solid ${RED}`, borderRadius: 18, padding: "16px 18px", textAlign: "center", fontSize: 34, fontWeight: 900, color: RED }}>50歳までは<br />女性が約2.4倍</div></Float>
      </PopIn>
    </BG2>
  );
};

// ══ 図解2：生存率↗（チャート中央・イラスト右下）══
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const drawn = interpolate(f, [30, 90], [0, 1], clamp);
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "up6", at: 30, volume: 0.34 }, { file: "correct", at: 95, volume: 0.32 }]} />
      <Head>がんは“治る時代”へ</Head>
      <Svg>
        <DrawLine d="M180 1120 L760 560" delay={30} dur={46} color={A2.green} w={12} />
        {drawn > 0.92 && <path d="M730 540 L768 552 L748 588" fill="none" stroke={A2.green} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />}
      </Svg>
      <Appear delay={34} style={{ position: "absolute", left: 120, top: 1130, fontFamily: FONT, fontSize: 36, fontWeight: 900, color: A2.sub }}>以前</Appear>
      <PopIn delay={92} style={{ position: "absolute", left: 560, top: 470, fontFamily: FONT, fontSize: 44, fontWeight: 900, color: A2.green }}>今</PopIn>
      <Ill file="g2_recovered_smile" size={340} delay={100} left={640} top={880} amp={9} />
      <Statement delay={120} top={1200} size={40} color={A2.green}>長く生きられる人が増加</Statement>
    </BG2>
  );
};

// ══ 図解3（最長24.5s）：フェーズ切替で被り回避＋動き ══
const P3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "up3", at: 40, volume: 0.3 }, { file: "up4", at: 60, volume: 0.3 }, { file: "swipe", at: 250, volume: 0.3 }, { file: "up6", at: 290, volume: 0.32 }, { file: "pop", at: 520, volume: 0.3 }]} />
      <Head size={50}>治療は“長くて通院”</Head>
      {/* フェーズ1（0-250f）：入院↓通院↑＋通院イラスト */}
      <Phase a={0} b={255}>
        <div style={{ position: "absolute", left: 70, top: 420, width: 940, display: "flex", gap: 24 }}>
          <PopIn delay={40} style={{ flex: 1 }}><Float delay={40} amp={4}><div style={{ fontFamily: FONT, background: "#fff", border: `3px solid ${A2.track}`, borderRadius: 22, padding: "26px 0", textAlign: "center" }}><div style={{ fontSize: 42, fontWeight: 900 }}>入院</div><div style={{ fontSize: 48, fontWeight: 900, color: BLUE }}>短く ↓</div></div></Float></PopIn>
          <PopIn delay={60} style={{ flex: 1 }}><Float delay={60} amp={4}><div style={{ fontFamily: FONT, background: "#E4F6EC", border: `3px solid ${A2.green}`, borderRadius: 22, padding: "26px 0", textAlign: "center" }}><div style={{ fontSize: 42, fontWeight: 900 }}>通院</div><div style={{ fontSize: 48, fontWeight: 900, color: A2.green }}>主流に ↑</div></div></Float></PopIn>
        </div>
        <Ill file="g3_commute_hospital" size={360} delay={80} left={360} top={720} amp={8} />
      </Phase>
      {/* フェーズ2（255-520f）：ホルモン療法バー＋服薬イラスト */}
      <Phase a={255} b={525}>
        <Statement delay={270} top={430} size={38}>乳がんのホルモン療法は…</Statement>
        <div style={{ position: "absolute", left: 95, top: 560, width: 890, height: 48, borderRadius: 999, background: A2.track }} />
        <div style={{ position: "absolute", left: 95, top: 560, height: 48, borderRadius: 999, background: ORANGE, width: interpolate(f, [285, 340], [0, 890], clamp) }} />
        <div style={{ position: "absolute", left: 95, top: 622, fontFamily: FONT, fontSize: 26, fontWeight: 800, color: A2.sub }}>0年</div>
        <PopIn delay={345} style={{ position: "absolute", right: 95, top: 614, fontFamily: FONT, fontSize: 40, fontWeight: 900, color: ORANGE }}>5〜10年</PopIn>
        <Ill file="g3_pills_longterm" size={360} delay={300} left={360} top={720} amp={8} />
      </Phase>
      {/* フェーズ3（525-end）：再発・転移 */}
      <Phase a={525} b={737}>
        <Ill file="g3_relapse_change" size={360} delay={535} left={360} top={430} amp={8} />
        <Statement delay={560} top={900} size={44}>再発・転移なら<br /><span style={{ color: ORANGE }}>薬を変えて数年続く</span></Statement>
      </Phase>
    </BG2>
  );
};

// ══ 図解4：高額療養費＋年100万（イラスト左右・数字中央）══
const P4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "count", at: 150, volume: 0.3 }, { file: "up1", at: 180, volume: 0.36 }]} />
      <Head size={48}>高額療養費があっても、かかる</Head>
      <PopIn delay={30} style={{ position: "absolute", left: 90, top: 400, width: 900 }}>
        <Float delay={30} amp={3}><div style={{ fontFamily: FONT, background: "#E4F6EC", border: `3px solid ${A2.green}`, borderRadius: 20, padding: "18px 22px", textAlign: "center", fontSize: 34, fontWeight: 900 }}>大事な制度。でも“医療費以外”は対象外</div></Float>
      </PopIn>
      <Ill file="g4_woman_bills_worry" size={330} delay={45} left={70} top={560} amp={8} />
      <Ill file="g4_money_fly" size={320} delay={110} left={690} top={560} amp={9} />
      <PopIn delay={150} style={{ position: "absolute", left: 60, top: 980, width: 960, textAlign: "center", fontFamily: FONT }}>
        <Float delay={150} amp={4}><div style={{ fontSize: 40, fontWeight: 900, color: A2.ink }}>通院が年単位で続くと</div>
          <div style={{ fontSize: 72, fontWeight: 900, color: RED, marginTop: 6 }}>医療費以外で 年<CountUp delay={150} to={100} dur={26} />万円</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: A2.ink }}>近く飛んでいく覚悟も</div>
        </Float>
      </PopIn>
    </BG2>
  );
};

// ══ 図解5：対象外が積み重なる（イラスト上・スタック中）══
const P5: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "up3", at: 110, volume: 0.3 }, { file: "up4", at: 150, volume: 0.3 }, { file: "up1", at: 195, volume: 0.36 }]} />
    <Head size={50}>公的保険で“全部”は守れない</Head>
    <Ill file="g5_free_drug" size={300} delay={8} left={120} top={390} amp={8} />
    <Ill file="g5_coverage_gap" size={300} delay={90} left={660} top={390} amp={8} />
    <div style={{ position: "absolute", left: 100, right: 100, top: 760 }}>
      {[{ t: "先進医療の技術料", d: 110 }, { t: "自由診療・未承認薬", d: 150 }, { t: "＝公的保険の対象外", d: 195, hi: true }].map((r, i) => (
        <PopIn key={i} delay={r.d} style={{ marginBottom: 16 }}>
          <Float delay={r.d} amp={3}><div style={{ fontFamily: FONT, background: r.hi ? "#FBE7E2" : "#fff", border: `3px solid ${r.hi ? RED : ORANGE}`, borderRadius: 16, padding: "18px 0", fontSize: 40, fontWeight: 900, color: r.hi ? RED : A2.ink, textAlign: "center" }}>{r.t}</div></Float>
        </PopIn>
      ))}
    </div>
  </BG2>
);

// ══ 図解6（22s）：フェーズ切替 収入減→傷病手当→貯金↓→一撃 ══
const P6: React.FC = () => {
  const f = useCurrentFrame();
  const savArrow = interpolate(f, [430, 500], [0, 1], clamp);
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "up1", at: 90, volume: 0.34 }, { file: "pop", at: 210, volume: 0.3 }, { file: "up6", at: 430, volume: 0.32 }, { file: "finish", at: 560, volume: 0.42 }]} />
      <Head size={50}>一番怖いのは“収入の減少”</Head>
      {/* フェーズ1：収入減 約半数＋イラスト */}
      <Phase a={0} b={205}>
        <Ill file="g6_income_worry" size={330} delay={30} left={130} top={430} amp={8} />
        <PopIn delay={90} style={{ position: "absolute", left: 60, top: 820, width: 960, textAlign: "center", fontFamily: FONT }}>
          <Float delay={90} amp={4}><div style={{ fontSize: 40, fontWeight: 900 }}>収入が減った人</div><div style={{ fontSize: 96, fontWeight: 900, color: RED }}>約半数以上</div></Float>
        </PopIn>
      </Phase>
      {/* フェーズ2：傷病手当 2/3 */}
      <Phase a={205} b={425}>
        <Ill file="g6_sick_allowance" size={300} delay={215} left={390} top={400} amp={7} />
        <Statement delay={240} top={740} size={40}>傷病手当金は給料の<span style={{ color: ORANGE }}>約2/3</span></Statement>
        <div style={{ position: "absolute", left: 120, top: 820, width: 840, height: 40, borderRadius: 999, background: A2.track }} />
        <div style={{ position: "absolute", left: 120, top: 820, height: 40, borderRadius: 999, background: ORANGE, width: interpolate(f, [250, 285], [0, 840 * 2 / 3], clamp) }} />
      </Phase>
      {/* フェーズ3：貯金↓ */}
      <Phase a={425} b={640}>
        <Ill file="g6_savings_empty" size={320} delay={435} left={90} top={420} amp={7} />
        <Svg>
          <DrawLine d="M470 560 L980 840" delay={435} dur={44} color={RED} w={10} />
          {savArrow > 0.9 && <path d="M952 818 L986 844 L956 860" fill="none" stroke={RED} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />}
        </Svg>
        <PopIn delay={470} style={{ position: "absolute", left: 560, top: 880, fontFamily: FONT, fontSize: 40, fontWeight: 900, color: RED }}>終わりが見えない</PopIn>
        <PopIn delay={520} style={{ position: "absolute", left: 60, top: 980, width: 960 }}>
          <Float delay={520} amp={4}><div style={{ fontFamily: FONT, background: A2.ink, borderRadius: 24, padding: "26px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#fff" }}>治療費 ＋ 収入の減少</div>
            <div style={{ fontSize: 46, fontWeight: 900, color: "#fff", marginTop: 6 }}>怖いのは<span style={{ color: A2.marker }}>“長く続く”</span>こと</div>
          </div></Float>
        </PopIn>
      </Phase>
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
