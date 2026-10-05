import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, Img, useCurrentFrame, interpolate } from "remotion";
import { BG2, A2 } from "./components/kit2";
import { Float, PopIn, DrawLine, CountUp, Mark } from "./components/kit";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  がん保険②「備え方と落とし穴」図解リール
//  音声 public/gan2-narration.m4a（86.8s / 図解パートVO）に同期。GAN2_FRAMES=2610。
//  ビート表 gan2_beatmap.md。冒頭/締めは実写トーク（別録り・CapCut接続）。
//  テロップ帯なし＝文字は図に統合。効果音は SFX_GAIN つまみ＋ライブラリ音。
// ══════════════════════════════════════════════════════════
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const GAN2_FRAMES = 2610;
export const SFX_GAIN = 0.55; // ★効果音の音量つまみ（0=無音）
const INK = A2.ink, GREEN = A2.green, SUB = A2.sub, TRACK = A2.track, MK = A2.marker, RED = A2.red, CORAL = A2.coral;
const IMG = (f: string) => staticFile(`gen/${f}.png`);

const SlideTrans: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const inY = interpolate(f, [0, 8], [44, 0], clamp), inO = interpolate(f, [0, 8], [0, 1], clamp);
  const outY = interpolate(f, [dur - 12, dur], [0, -90], clamp), outO = interpolate(f, [dur - 12, dur], [1, 0], clamp);
  const z = interpolate(f, [0, dur], [1, 1.03], clamp);
  return <AbsoluteFill style={{ transform: `translateY(${inY + outY}px) scale(${z})`, transformOrigin: "50% 42%", opacity: Math.min(inO, outO) }}>{children}</AbsoluteFill>;
};
const Phase: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [a, a + 10], [0, 1], clamp), interpolate(f, [b - 10, b], [1, 0], clamp));
  if (o <= 0.001) return null;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>{children}</svg>
);
const Head: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 50 }) => (
  <PopIn delay={2} style={{ position: "absolute", left: 50, top: 250, width: 980, textAlign: "center" }}>
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: 900, color: INK, letterSpacing: 1, lineHeight: 1.26 }}>{children}</div>
    <div style={{ width: 120, height: 10, borderRadius: 999, background: GREEN, margin: "14px auto 0" }} />
  </PopIn>
);
const Ill: React.FC<{ file: string; size: number; delay: number; left: number; top: number; amp?: number }> = ({ file, size, delay, left, top, amp = 8 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: size, height: size }}>
    <Float delay={delay} amp={amp}><Img src={IMG(file)} style={{ width: size, height: size, objectFit: "contain" }} /></Float>
  </PopIn>
);
const Band: React.FC<{ delay: number; top: number; file?: string; bg?: string; border?: string; children: React.ReactNode; size?: number; isize?: number; color?: string }>
  = ({ delay, top, file, bg = MK, border, children, size = 42, isize = 130, color = INK }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 70, top, width: 940 }}>
    <Float delay={delay} amp={3}>
      <div style={{ fontFamily: FONT, background: bg, border: border ? `3px solid ${border}` : "none", borderRadius: 26, padding: "20px 26px", display: "flex", alignItems: "center", gap: 22, justifyContent: "center" }}>
        {file ? <Img src={IMG(file)} style={{ width: isize, height: isize, objectFit: "contain", flexShrink: 0 }} /> : null}
        <div style={{ fontSize: size, fontWeight: 900, color, lineHeight: 1.3, textAlign: "center" }}>{children}</div>
      </div>
    </Float>
  </PopIn>
);
const Label: React.FC<{ left: number; top: number; w: number; delay: number; title: string; sub?: string; color?: string; tsize?: number }>
  = ({ left, top, w, delay, title, sub, color = INK, tsize = 38 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: w, textAlign: "center", fontFamily: FONT }}>
    <div style={{ fontSize: tsize, fontWeight: 900, color }}>{title}</div>
    {sub ? <div style={{ fontSize: 27, fontWeight: 800, color: SUB, marginTop: 4 }}>{sub}</div> : null}
  </PopIn>
);

// ══ P1 三大治療（三角形・カード型／線は枠の手前で止める）0–209 ══
const TriCard: React.FC<{ delay: number; cx: number; cy: number; w?: number; file: string; isize: number; title: string; sub: string }>
  = ({ delay, cx, cy, w = 304, file, isize, title, sub }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: cx - w / 2, top: cy - (isize + 120) / 2, width: w }}>
    <Float delay={delay} amp={4}>
      <div style={{ fontFamily: FONT, background: "#fff", border: `3px solid ${TRACK}`, borderRadius: 24, padding: "14px 10px 16px", textAlign: "center", boxShadow: "0 12px 26px rgba(80,60,20,0.12)" }}>
        <Img src={IMG(file)} style={{ width: isize, height: isize, objectFit: "contain" }} />
        <div style={{ fontSize: 40, fontWeight: 900, color: INK, marginTop: 2 }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: SUB }}>{sub}</div>
      </div>
    </Float>
  </PopIn>
);
const P1: React.FC = () => (
  <BG2>
    <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.42 }, { file: "user/u02s", at: 40, volume: 0.36 }, { file: "user/u02s", at: 70, volume: 0.36 }, { file: "user/u02s", at: 100, volume: 0.36 }, { file: "up6", at: 125, volume: 0.4 }, { file: "swipe", at: 170, volume: 0.32 }]} />
    <Head>がんになったら、受ける治療は3つ</Head>
    {/* 中心ハブ→各カードの“手前”までの線（文字に被せない） */}
    <Svg>
      <DrawLine d="M540 724 L540 632" delay={30} dur={10} color={GREEN} w={7} />
      <DrawLine d="M470 796 L306 866" delay={55} dur={12} color={GREEN} w={7} />
      <DrawLine d="M610 796 L774 866" delay={85} dur={12} color={GREEN} w={7} />
    </Svg>
    <TriCard delay={38} cx={540} cy={492} isize={176} file="t_surgery" title="手術" sub="切って取り除く" />
    <TriCard delay={68} cx={252} cy={1004} isize={152} file="t_radiation" title="放射線" sub="狙い撃ち" />
    <TriCard delay={98} cx={828} cy={1004} isize={152} file="t_drug" title="薬物療法" sub="全身に効かせる" />
    {/* hub（最前面） */}
    <PopIn delay={18} style={{ position: "absolute", left: 360, top: 722, width: 360 }}>
      <Float delay={18} amp={3}><div style={{ fontFamily: FONT, background: GREEN, color: "#fff", fontSize: 38, fontWeight: 900, textAlign: "center", padding: "18px 10px", borderRadius: 999, boxShadow: "0 12px 26px rgba(46,158,107,0.3)" }}>がんの三大治療</div></Float>
    </PopIn>
    <Band delay={168} top={1300} file="g3_commute_hospital" isize={120} size={38}>今は“入院より通院”で<br />続けるのが主流</Band>
  </BG2>
);

// ══ P2 お金のリスク4つ（縦スタック）209–518 / dur 309 ══
const Row: React.FC<{ delay: number; top: number; name: string; note: string; ills: string[]; danger?: boolean }> = ({ delay, top, name, note, ills, danger }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 60, top, width: 960 }}>
    <Float delay={delay} amp={3}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: danger ? "#FDE7E1" : "#fff", border: `3px solid ${danger ? RED : TRACK}`, borderRadius: 22, padding: "14px 24px", boxShadow: "0 8px 18px rgba(80,60,20,0.08)", fontFamily: FONT }}>
        <div style={{ width: 150, display: "flex", gap: 4, justifyContent: "center", flexShrink: 0 }}>
          {ills.map((f, i) => <Img key={i} src={IMG(f)} style={{ width: ills.length > 1 ? 56 : 100, height: ills.length > 1 ? 56 : 100, objectFit: "contain" }} />)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: danger ? RED : INK }}>{name}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: SUB, marginTop: 2 }}>{note}</div>
        </div>
      </div>
    </Float>
  </PopIn>
);
const P2: React.FC = () => (
  <BG2>
    <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.4 }, { file: "user/u02s", at: 24, volume: 0.36 }, { file: "user/u02s", at: 52, volume: 0.36 }, { file: "user/u02s", at: 80, volume: 0.36 }, { file: "user/u02s", at: 108, volume: 0.36 }, { file: "up6", at: 250, volume: 0.42 }]} />
    <Head>がん治療の、お金のリスクは4つ</Head>
    <Row delay={24} top={392} name="治療費" note="手術・入院・抗がん剤 など" ills={["ic_hospital", "ic_pill_iv"]} />
    <Row delay={52} top={544} name="治療費以外の出費" note="差額ベッド・ウィッグ・食事代…" ills={["c_cost_bed", "c_cost_wig", "c_cost_meal"]} />
    <Row delay={80} top={696} name="療養中の生活費" note="食費・住宅ローンは止まらない" ills={["c_life_loan"]} />
    <Row delay={108} top={848} name="収入の減少" note="働けない・時短で給料ダウン" ills={["g6_income_worry"]} danger />
    <Svg><DrawLine d="M540 1000 L540 1050" delay={150} dur={8} color={CORAL} w={8} /><DrawLine d="M522 1032 L540 1058 L558 1032" delay={158} dur={6} color={CORAL} w={8} /></Svg>
    <Band delay={250} top={1090} file="c_balance_break" isize={150} bg={MK} size={44} color={RED}>これが“同時に”のしかかる</Band>
    <PopIn delay={282} style={{ position: "absolute", left: 70, top: 1330, width: 940, textAlign: "center" }}><div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 900, color: INK }}>このリスク、がん保険でどう備える？</div></PopIn>
  </BG2>
);

// ══ P3 備え方＝2本柱（全体像）518–676 / dur 158 ══
const Pillar: React.FC<{ delay: number; left: number; header: string; file: string; line: string }> = ({ delay, left, header, file, line }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top: 470, width: 440 }}>
    <Float delay={delay} amp={3}>
      <div style={{ fontFamily: FONT, background: "#fff", border: `3px solid ${TRACK}`, borderRadius: 26, overflow: "hidden", boxShadow: "0 14px 32px rgba(80,60,20,0.12)" }}>
        <div style={{ background: GREEN, color: "#fff", fontSize: 34, fontWeight: 900, textAlign: "center", padding: "14px 6px" }}>{header}</div>
        <div style={{ padding: "20px 16px", textAlign: "center" }}>
          <Img src={IMG(file)} style={{ width: 240, height: 240, objectFit: "contain" }} />
          <div style={{ fontSize: 30, fontWeight: 800, color: INK, marginTop: 6, lineHeight: 1.35 }}>{line}</div>
        </div>
      </div>
    </Float>
  </PopIn>
);
const P3: React.FC = () => (
  <BG2>
    <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.4 }, { file: "user/u04", at: 22, volume: 0.42 }, { file: "user/u04", at: 50, volume: 0.42 }, { file: "up6", at: 110, volume: 0.42 }]} />
    <Head>がんの備え方は、保障の“2本柱”</Head>
    <Pillar delay={22} left={60} header="診断一時金" file="c_lumpsum_gift" line="なった時に、まとまったお金" />
    <Pillar delay={50} left={560} header="月額給付金" file="c_monthly" line="治療した月ごとに、毎月" />
    <Band delay={110} top={1120} bg={MK} size={44}>個人的には、両方あると安心です</Band>
  </BG2>
);

// ══ P4 なぜ2つ＝役割対比（山場）676–1084 / dur 408（一時金→月額→両方）══
const P4: React.FC = () => (
  <BG2>
    <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.42 }, { file: "user/u04", at: 14, volume: 0.44 }, { file: "user/u02s", at: 180, volume: 0.36 }, { file: "user/u02s", at: 205, volume: 0.36 }, { file: "up6", at: 366, volume: 0.44 }, { file: "correct", at: 380, volume: 0.42 }]} />
    <Head>なぜ2つ？ ——“役割”が違うから</Head>
    <Phase a={0} b={178}>
      <Ill file="c_lumpsum_gift" size={360} delay={14} left={360} top={430} />
      <Band delay={34} top={850} bg="#FFF2D6" size={44} color={INK}>診断一時金＝治療を始めるときの<br /><b style={{ color: CORAL }}>“まとまったお金の余裕”</b></Band>
      <Band delay={70} top={1050} bg="#fff" border={TRACK} size={36}>医療費にも、生活費にも使える</Band>
    </Phase>
    <Phase a={178} b={366}>
      <Ill file="c_monthly" size={380} delay={6} left={350} top={430} />
      <Band delay={24} top={850} bg="#E4F1FF" size={44} color={INK}>月額給付金＝治療が続くほど効く<br /><b style={{ color: "#2E7FD1" }}>“長期の支え”</b></Band>
      <Band delay={60} top={1050} bg="#fff" border={TRACK} size={36}>数年単位で続くリスクにも備えられる</Band>
    </Phase>
    <Phase a={366} b={408}>
      <Ill file="c_combine" size={360} delay={4} left={360} top={430} />
      <Band delay={16} top={930} bg={MK} size={46} color={INK}>だから、<b style={{ color: GREEN }}>両方</b>。<br />短期も長期も、すき間なくカバー</Band>
    </Phase>
  </BG2>
);

// ══ P5 公的保険の“外”にも備える 1084–1349 / dur 265 ══
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const selfW = interpolate(f, [40, 70], [0, 300], clamp);
  return (
    <BG2>
      <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.4 }, { file: "swipe", at: 38, volume: 0.33 }, { file: "user/u04", at: 70, volume: 0.44 }, { file: "count", at: 95, volume: 0.33 }, { file: "up6", at: 175, volume: 0.42 }]} />
      <Head>公的保険の“外”にも備えが要る</Head>
      {/* 費用バー */}
      <PopIn delay={20} style={{ position: "absolute", left: 70, top: 400, width: 940 }}>
        <div style={{ fontFamily: FONT }}>
          <div style={{ display: "flex", height: 92, borderRadius: 16, overflow: "hidden", border: `3px solid ${TRACK}` }}>
            <div style={{ width: 560, background: A2.green, color: "#fff", fontSize: 30, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>公的保険でカバー</div>
            <div style={{ width: selfW, background: RED, color: "#fff", fontSize: 28, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", whiteSpace: "nowrap" }}>全額自己負担</div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: SUB, marginTop: 10, textAlign: "right" }}>先進医療の技術料・自由診療 → 全額自己負担</div>
        </div>
      </PopIn>
      <Ill file="c_advanced" size={300} delay={60} left={80} top={620} />
      <Ill file="g4_money_fly" size={180} delay={95} left={420} top={700} amp={12} />
      <PopIn delay={80} style={{ position: "absolute", left: 600, top: 650, width: 420, textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: INK }}>例：重粒子線</div>
        <div style={{ fontSize: 110, fontWeight: 900, color: RED, lineHeight: 1 }}>約<CountUp delay={95} to={300} dur={22} />万</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: SUB, marginTop: 6 }}>高額療養費も“ここ”には使えない</div>
      </PopIn>
      <Band delay={175} top={1180} file="ic_shield" isize={120} bg={MK} size={44}>だから、“特約”で備えておく</Band>
    </BG2>
  );
};

// ══ P6 落とし穴①診断一時金の条件（誤解崩し）1349–1718 / dur 369 ══
const Cond: React.FC<{ delay: number; top: number; q: string; ox: "check" | "cross" }> = ({ delay, top, q, ox }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 90, top, width: 900 }}>
    <Float delay={delay} amp={3}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#fff", border: `3px solid ${TRACK}`, borderRadius: 20, padding: "16px 26px", fontFamily: FONT }}>
        <div style={{ flexShrink: 0 }}><Mark delay={delay + 8} type={ox} size={54} /></div>
        <div style={{ fontSize: 36, fontWeight: 900, color: INK }}>{q}</div>
      </div>
    </Float>
  </PopIn>
);
const P6: React.FC = () => (
  <BG2>
    <SfxTrack gain={SFX_GAIN} cues={[{ file: "user/u04", at: 24, volume: 0.44 }, { file: "user/u03s", at: 110, volume: 0.4 }, { file: "user/u02s", at: 175, volume: 0.36 }, { file: "user/u02s", at: 210, volume: 0.36 }, { file: "user/u02s", at: 245, volume: 0.36 }, { file: "up6", at: 300, volume: 0.42 }]} />
    <Head>【落とし穴①】“入ってるのに”出ない</Head>
    <Phase a={0} b={150}>
      <Ill file="g2_relax_insurance" size={300} delay={10} left={120} top={450} />
      <PopIn delay={30} style={{ position: "absolute", left: 470, top: 470, width: 520 }}>
        <Float delay={30} amp={4}><div style={{ fontFamily: FONT, background: "#fff", border: `3px solid ${TRACK}`, borderRadius: 24, padding: "22px 24px", fontSize: 40, fontWeight: 900, color: INK }}>「入ってるから、<br />ウチは大丈夫」</div></Float>
      </PopIn>
      <PopIn delay={95} style={{ position: "absolute", left: 230, top: 880, width: 620 }}>
        <Float delay={95} amp={4}><div style={{ fontFamily: FONT, background: RED, color: "#fff", borderRadius: 22, padding: "20px 24px", fontSize: 46, fontWeight: 900, textAlign: "center", transform: "rotate(-3deg)" }}>…とは、限りません</div></Float>
      </PopIn>
    </Phase>
    <Phase a={150} b={369}>
      <PopIn delay={6} style={{ position: "absolute", left: 50, top: 410, width: 980, textAlign: "center" }}><div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 900, color: INK }}>同じ「診断一時金」でも…</div></PopIn>
      <Cond delay={24} top={500} q="上皮内がんは、対象？" ox="cross" />
      <Cond delay={60} top={640} q="受け取りは、1年に1回？" ox="check" />
      <Cond delay={96} top={780} q="2年に1回・入院が条件？" ox="cross" />
      <Band delay={150} top={960} bg={MK} size={44} color={RED}>条件は、商品でかなり違う</Band>
      <Band delay={185} top={1160} bg="#fff" border={GREEN} size={32} color={INK}>ちなみに、がん保険は基本“90日の免責期間”あり。<br />検討中なら、早めの加入を</Band>
    </Phase>
  </BG2>
);

// ══ P7 落とし穴②月額のカバー範囲（○×）1718–2077 / dur 359 ══
const OX: React.FC<{ delay: number; top: number; file: string; name: string; ox: "check" | "cross" }> = ({ delay, top, file, name, ox }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 90, top, width: 900 }}>
    <Float delay={delay} amp={3}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#fff", border: `3px solid ${TRACK}`, borderRadius: 20, padding: "12px 26px", fontFamily: FONT }}>
        <Img src={IMG(file)} style={{ width: 78, height: 78, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: 38, fontWeight: 900, color: INK }}>{name}</div>
        <Mark delay={delay + 8} type={ox} size={50} />
      </div>
    </Float>
  </PopIn>
);
const P7: React.FC = () => (
  <BG2>
    <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.4 }, { file: "user/u02s", at: 26, volume: 0.36 }, { file: "user/u02s", at: 54, volume: 0.36 }, { file: "user/u02s", at: 82, volume: 0.36 }, { file: "user/u02s", at: 110, volume: 0.36 }, { file: "user/u02s", at: 138, volume: 0.36 }, { file: "up6", at: 255, volume: 0.44 }]} />
    <Head>【落とし穴②】月額保障は<br />“カバー範囲”がバラバラ</Head>
    <OX delay={26} top={448} file="t_anticancer" name="抗がん剤" ox="check" />
    <OX delay={54} top={564} file="t_hormone" name="ホルモン療法" ox="cross" />
    <OX delay={82} top={680} file="t_radiation" name="放射線治療" ox="check" />
    <OX delay={110} top={796} file="ic_relapse" name="再発予防のホルモン剤" ox="cross" />
    <OX delay={138} top={912} file="ic_outpatient" name="通院" ox="cross" />
    <Band delay={200} top={1060} bg={MK} size={42} color={RED}>同じ“月額給付”でも、中身は別物</Band>
    <Band delay={255} top={1250} bg="#fff" border={RED} size={38} color={RED}>いくら出るかだけで選ぶのは危険</Band>
  </BG2>
);

// ══ P8 まとめ＝入院→通院へ 2077–2358 / dur 281 ══
const P8: React.FC = () => (
  <BG2>
    <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.4 }, { file: "swipe", at: 40, volume: 0.34 }, { file: "user/u02s", at: 120, volume: 0.36 }, { file: "user/u02s", at: 150, volume: 0.36 }, { file: "user/u02s", at: 180, volume: 0.36 }]} />
    <Head>がん治療は「入院中心」から「通院」へ</Head>
    <PopIn delay={16} style={{ position: "absolute", left: 60, top: 430, width: 300 }}>
      <Float delay={16} amp={3}><div style={{ fontFamily: FONT, background: "#fff", border: `3px solid ${TRACK}`, borderRadius: 24, padding: "26px 10px", textAlign: "center", fontSize: 40, fontWeight: 900, color: SUB }}>昔<br />入院中心</div></Float>
    </PopIn>
    <Svg><DrawLine d="M380 530 L700 530" delay={40} dur={12} color={GREEN} w={9} /><DrawLine d="M672 512 L704 530 L672 548" delay={52} dur={8} color={GREEN} w={9} /></Svg>
    <Ill file="g3_commute_hospital" size={280} delay={60} left={700} top={400} />
    <PopIn delay={70} style={{ position: "absolute", left: 700, top: 690, width: 300, textAlign: "center" }}><div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 900, color: GREEN }}>今<br />通院で長期</div></PopIn>
    <PopIn delay={108} style={{ position: "absolute", left: 60, top: 840, width: 960, textAlign: "center" }}><div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 900, color: INK }}>だから、見るのは“金額”だけじゃない</div></PopIn>
    <Band delay={150} top={940} bg="#fff" border={TRACK} size={36}>繰り返し出る？／抗がん剤・ホルモンまで対象？<br />通院に対応してる？</Band>
    <Band delay={200} top={1240} bg={MK} size={44}>大事なのは“今の治療に合ってるか”</Band>
  </BG2>
);

// ══ P9 見直し（体験＋確認）2358–2610 / dur 252 ══
const P9: React.FC = () => (
  <BG2>
    <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.4 }, { file: "user/u03s", at: 40, volume: 0.4 }, { file: "user/u04", at: 150, volume: 0.44 }, { file: "finish", at: 210, volume: 0.46 }]} />
    <Head>“見直し”で、今に合わせる</Head>
    <Ill file="c_review" size={340} delay={16} left={80} top={420} />
    <PopIn delay={44} style={{ position: "absolute", left: 470, top: 470, width: 540 }}>
      <Float delay={44} amp={4}><div style={{ fontFamily: FONT, background: "#fff", border: `3px solid ${TRACK}`, borderRadius: 24, padding: "22px 24px", fontSize: 36, fontWeight: 900, color: INK }}>プロの僕でも<br />「なんでこの保険…？」<br />と思うこと、結構あります</div></Float>
    </PopIn>
    <Ill file="g2_recovered_smile" size={200} delay={150} left={110} top={860} />
    <Band delay={150} top={1140} bg={MK} size={46}>今の治療に合ってるか、<br />一度“確認”を</Band>
  </BG2>
);

const SCENES = [
  { c: P1, from: 0, dur: 209 }, { c: P2, from: 209, dur: 309 }, { c: P3, from: 518, dur: 158 },
  { c: P4, from: 676, dur: 408 }, { c: P5, from: 1084, dur: 265 }, { c: P6, from: 1349, dur: 369 },
  { c: P7, from: 1718, dur: 359 }, { c: P8, from: 2077, dur: 281 }, { c: P9, from: 2358, dur: 252 },
];
export const GanReel2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg }}>
    <Audio src={staticFile("gan2-narration.m4a")} />
    {SCENES.map(({ c: C, from, dur }, i) => (
      <Sequence key={i} from={from} durationInFrames={dur}><SlideTrans dur={dur}><C /></SlideTrans></Sequence>
    ))}
  </AbsoluteFill>
);
