import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, Img, useCurrentFrame, interpolate } from "remotion";
import { BG2, A2, Mark2 } from "./components/kit2";
import { Float, CountUp, PopIn, DrawLine } from "./components/kit";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  がん保険①「がんのリアル編」図解リール — 全面作り直し版
//  音声 public/gan1-narration.m4a（86.3s/図解1〜6）に同期。GAN_FRAMES=2589。
//  ★テロップ帯は廃止（文字は図の中に統合）＝投資/車リールと同じ作り。重なりゼロ・フルフレーム。
//  効果音は SFX_GAIN(一括つまみ)＋ライブラリ音(低〜中・まんべんなく・高音は各シーン1回)。
// ══════════════════════════════════════════════════════════
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const GAN_FRAMES = 2589;
export const SFX_GAIN = 0.55; // ★効果音の音量つまみ（0=無音）
const BLUE = "#4A90D9", PINK = "#EC7FA0", RED = "#E8553B", ORANGE = "#EF7D4E";
const INK = A2.ink, GREEN = A2.green, SUB = A2.sub, TRACK = A2.track, MK = A2.marker;

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
  if (o <= 0) return null;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
const Head: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 52 }) => (
  <PopIn delay={2} style={{ position: "absolute", left: 50, top: 258, width: 980, textAlign: "center" }}>
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: 900, color: INK, letterSpacing: 1, lineHeight: 1.28 }}>{children}</div>
    <div style={{ width: 128, height: 11, borderRadius: 999, background: GREEN, margin: "16px auto 0" }} />
  </PopIn>
);
const Ill: React.FC<{ file: string; size: number; delay: number; left: number; top: number; amp?: number }> = ({ file, size, delay, left, top, amp = 8 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: size, height: size }}>
    <Float delay={delay} amp={amp}><Img src={staticFile(`gen/${file}.png`)} style={{ width: size, height: size, objectFit: "contain" }} /></Float>
  </PopIn>
);
const Card: React.FC<{ delay: number; top: number; left?: number; width?: number; header?: React.ReactNode; headColor?: string; pad?: string; children: React.ReactNode }> = ({ delay, top, left = 70, width = 940, header, headColor = GREEN, pad = "26px 28px", children }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width }}>
    <Float delay={delay} amp={3}>
      <div style={{ background: "#fff", borderRadius: 30, boxShadow: "0 18px 40px rgba(80,60,20,0.14)", overflow: "hidden", fontFamily: FONT }}>
        {header ? <div style={{ background: headColor, color: "#fff", fontWeight: 900, fontSize: 34, padding: "16px 28px", textAlign: "center" }}>{header}</div> : null}
        <div style={{ padding: pad }}>{children}</div>
      </div>
    </Float>
  </PopIn>
);
// 下部まとめ帯（イラスト＋テキスト／テキストのみ）
// ★E3：枠内で左右に寄せない。イラスト+文字をひとかたまりにして中央配置・文字も中央寄せ。
const Band: React.FC<{ delay: number; top: number; file?: string; bg?: string; border?: string; children: React.ReactNode; size?: number; isize?: number; flip?: boolean; color?: string }>
  = ({ delay, top, file, bg = MK, border, children, size = 44, isize = 150, color = INK }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 70, top, width: 940 }}>
    <Float delay={delay} amp={3}>
      <div style={{ fontFamily: FONT, background: bg, border: border ? `3px solid ${border}` : "none", borderRadius: 26, padding: file ? "22px 26px" : "26px 26px", display: "flex", alignItems: "center", gap: 24, justifyContent: "center" }}>
        {file ? <Img src={staticFile(`gen/${file}.png`)} style={{ width: isize, height: isize, objectFit: "contain", flexShrink: 0 }} /> : null}
        <div style={{ fontSize: size, fontWeight: 900, color, lineHeight: 1.3, textAlign: "center" }}>{children}</div>
      </div>
    </Float>
  </PopIn>
);
const Donut: React.FC<{ delay: number; pct: number; size?: number; color?: string; big: React.ReactNode; small?: React.ReactNode }> = ({ delay, pct, size = 440, color = RED, big, small }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 34], [0, pct], clamp);
  const sw = 52, r = size / 2 - sw / 2, c = 2 * Math.PI * r, cx = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, fontFamily: FONT }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cx} r={r} stroke={TRACK} strokeWidth={sw} fill="none" />
        <circle cx={cx} cy={cx} r={r} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} transform={`rotate(-90 ${cx} ${cx})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 96, fontWeight: 900, color }}>{big}</div>
        {small ? <div style={{ fontSize: 34, fontWeight: 900, color: SUB, marginTop: -8 }}>{small}</div> : null}
      </div>
    </div>
  );
};

// ══ 図解1（0–12.3s）：2人に1人・女性は若くから ══
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const groups = [
    { g: "〜40", m: 1.1, w: 2.3 }, { g: "〜50", m: 2.7, w: 6.4 }, { g: "〜60", m: 7.4, w: 12.6 },
    { g: "〜70", m: 20.3, w: 21.3 }, { g: "〜80", m: 41.8, w: 33.2 }, { g: "生涯", m: 63.3, w: 50.8 },
  ];
  const H = 330, baseY = H, x0 = 36, gw = (880 - 72) / 6;
  return (
    <BG2>
      <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.42 }, { file: "user/u02s", at: 60, volume: 0.36 }, { file: "user/u02s", at: 110, volume: 0.36 }, { file: "user/u04", at: 185, volume: 0.42 }, { file: "user/u10", at: 230, volume: 0.4 }]} />
      <Head size={52}>がんは<Mark2 delay={16}>2人に1人</Mark2>。<br />しかも女性は若くから</Head>
      <Card delay={10} top={448} header="年代別のがん罹患リスク（男性/女性）">
        <div style={{ position: "relative", height: H + 56 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: baseY, height: 3, background: TRACK }} />
          {groups.map((gr, i) => {
            const cx = x0 + i * gw, d = 44 + i * 13;
            const hm = interpolate(f, [d, d + 14], [0, (gr.m / 70) * H], clamp);
            const hw = interpolate(f, [d + 5, d + 19], [0, (gr.w / 70) * H], clamp);
            const femaleUp = gr.w > gr.m, last = gr.g === "生涯";
            return (
              <div key={gr.g}>
                {femaleUp && f > d && <div style={{ position: "absolute", left: cx - 12, top: 0, width: 112, height: baseY, background: "rgba(236,127,160,0.14)", borderRadius: 8 }} />}
                <div style={{ position: "absolute", left: cx, top: baseY - hm, width: 46, height: hm, background: BLUE, borderRadius: "6px 6px 0 0" }} />
                <div style={{ position: "absolute", left: cx + 52, top: baseY - hw, width: 46, height: hw, background: PINK, borderRadius: "6px 6px 0 0" }} />
                <div style={{ position: "absolute", left: cx - 8, top: baseY + 12, width: 116, textAlign: "center", fontSize: 24, fontWeight: 800, color: femaleUp ? PINK : SUB }}>{gr.g}</div>
                {last && f > d + 14 && <>
                  <div style={{ position: "absolute", left: cx - 28, top: baseY - hm - 40, width: 100, textAlign: "center", fontSize: 32, fontWeight: 900, color: BLUE }}>63%</div>
                  <div style={{ position: "absolute", left: cx + 28, top: baseY - hw - 40, width: 100, textAlign: "center", fontSize: 32, fontWeight: 900, color: PINK }}>50%</div>
                </>}
              </div>
            );
          })}
        </div>
      </Card>
      <Ill file="g1_two_of_two" size={230} delay={60} left={425} top={898} amp={7} />
      <Band delay={185} top={1230} file="g1_woman_young" bg="#FBE7E2" border={RED} isize={150} size={40}>
        50歳までは女性が<span style={{ color: RED }}>約2.4倍</span><br /><span style={{ fontSize: 34 }}>70歳頃まで女性が多い＝<span style={{ color: RED }}>特に注意</span></span>
      </Band>
    </BG2>
  );
};

// ══ 図解2（12.3–19.5s）：数年前より“治りやすく” = 5年生存率 61.8→68.9% ══
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const drawn = interpolate(f, [60, 120], [0, 1], clamp);
  return (
    <BG2>
      <SfxTrack gain={SFX_GAIN} cues={[{ file: "up6", at: 2, volume: 0.42 }, { file: "user/u03s", at: 60, volume: 0.36 }, { file: "user/u04", at: 108, volume: 0.44 }, { file: "user/u10", at: 140, volume: 0.4 }]} />
      <Head size={50}>数年前より、がんは<br /><Mark2 delay={16}>“治りやすく”</Mark2>なった</Head>
      <Card delay={10} top={468} header="全がんの5年生存率（約20年で）">
        <div style={{ position: "relative", height: 360 }}>
          <svg width="884" height="300" style={{ position: "absolute", left: 0, top: 50 }}>
            <line x1="40" y1="250" x2="844" y2="250" stroke={TRACK} strokeWidth="3" />
            <DrawLine d="M100 225 L800 70" delay={60} dur={46} color={GREEN} w={15} />
            {drawn > 0.9 && <path d="M770 52 L814 66 L792 106" fill="none" stroke={GREEN} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          <div style={{ position: "absolute", left: 40, top: 300, fontSize: 44, fontWeight: 900, color: SUB }}>61.8<span style={{ fontSize: 26 }}>%</span></div>
          <PopIn delay={100} style={{ position: "absolute", left: 590, top: 20, fontSize: 92, fontWeight: 900, color: GREEN }}>
            <CountUp delay={100} to={68.9} dur={24} />%
          </PopIn>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <div style={{ flex: 1, background: "#EAF2FB", borderRadius: 16, padding: "12px 0", textAlign: "center", fontSize: 32, fontWeight: 900, color: BLUE }}>男性 +13pt</div>
          <div style={{ flex: 1, background: "#FCEAF1", borderRadius: 16, padding: "12px 0", textAlign: "center", fontSize: 32, fontWeight: 900, color: PINK }}>女性 +8pt</div>
        </div>
      </Card>
      <Band delay={140} top={1200} file="g2_recovered_smile" bg="#E4F6EC" border={GREEN} isize={180} size={46}>
        長く生きられる人が<br /><span style={{ color: GREEN }}>増えています</span>
      </Band>
    </BG2>
  );
};

// ══ 図解3（19.5–44.0s）：入院は短く、通院が主流に（3フェーズ）══
const P3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <BG2>
      <SfxTrack gain={SFX_GAIN} cues={[{ file: "user/u07", at: 2, volume: 0.42 }, { file: "user/u02s", at: 104, volume: 0.36 }, { file: "user/u02s", at: 120, volume: 0.36 }, { file: "user/u10", at: 150, volume: 0.4 }, { file: "user/u03", at: 250, volume: 0.4 }, { file: "up6", at: 280, volume: 0.42 }, { file: "user/u03", at: 398, volume: 0.4 }, { file: "user/u08", at: 500, volume: 0.42 }, { file: "user/u10", at: 605, volume: 0.4 }]} />
      <Head size={52}>入院は短く、通院が主流に</Head>
      {/* rel104–247：入院短く・通院しながら */}
      <Phase a={0} b={247}>
        <div style={{ position: "absolute", left: 70, top: 470, width: 940, display: "flex", gap: 30 }}>
          <PopIn delay={104} style={{ flex: 1 }}><Float delay={104} amp={4}><div style={{ fontFamily: FONT, background: "#fff", borderRadius: 30, boxShadow: "0 16px 34px rgba(80,60,20,0.13)", padding: "66px 0", textAlign: "center", borderTop: `12px solid ${BLUE}` }}><div style={{ fontSize: 52, fontWeight: 900 }}>入院</div><div style={{ fontSize: 68, fontWeight: 900, color: BLUE, marginTop: 6 }}>短く ↓</div></div></Float></PopIn>
          <PopIn delay={120} style={{ flex: 1 }}><Float delay={120} amp={4}><div style={{ fontFamily: FONT, background: "#fff", borderRadius: 30, boxShadow: "0 16px 34px rgba(80,60,20,0.13)", padding: "66px 0", textAlign: "center", borderTop: `12px solid ${GREEN}` }}><div style={{ fontSize: 52, fontWeight: 900 }}>通院</div><div style={{ fontSize: 68, fontWeight: 900, color: GREEN, marginTop: 6 }}>主流に ↑</div></div></Float></PopIn>
        </div>
        <Band delay={150} top={900} file="g3_commute_hospital" bg="#E4F6EC" border={GREEN} isize={240} size={50}>いまは<span style={{ color: GREEN }}>通院しながら</span><br />治療する時代</Band>
      </Phase>
      {/* rel247–391：ホルモン療法5〜10年 */}
      <Phase a={247} b={391}>
        <Card delay={255} top={460} header="乳がんのホルモン療法の期間">
          <div style={{ position: "relative", height: 170 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 54, height: 52, borderRadius: 999, background: TRACK }} />
            <div style={{ position: "absolute", left: 0, top: 54, height: 52, borderRadius: 999, background: ORANGE, width: interpolate(f, [278, 335], [0, 884], clamp) }} />
            <div style={{ position: "absolute", left: 8, top: 120, fontSize: 26, fontWeight: 800, color: SUB }}>0年</div>
            <div style={{ position: "absolute", right: 8, top: 116, fontSize: 40, fontWeight: 900, color: ORANGE }}>5〜10年つづくことも</div>
          </div>
        </Card>
        <PopIn delay={300} style={{ position: "absolute", left: 70, top: 870, width: 940 }}>
          <Float delay={300} amp={3}>
            <div style={{ fontFamily: FONT, background: "#FFF6E2", border: `3px solid ${ORANGE}`, borderRadius: 26, padding: "22px 30px", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 96, fontWeight: 900, color: ORANGE, lineHeight: 1 }}>5〜10年</div>
                <div style={{ fontSize: 40, fontWeight: 900, color: INK, marginTop: 10 }}>薬を飲み続けることも</div>
              </div>
              <Img src={staticFile("gen/g3_pills_longterm.png")} style={{ width: 200, height: 200, objectFit: "contain", flexShrink: 0 }} />
            </div>
          </Float>
        </PopIn>
      </Phase>
      {/* rel391–737：再発→薬変更→数年→備え重要 */}
      <Phase a={391} b={737}>
        <Band delay={398} top={436} file="g3_relapse_change" bg="#FBE7E2" border={RED} isize={190} size={46}>再発・転移すれば<br /><span style={{ color: RED }}>薬を変えて治療</span></Band>
        <PopIn delay={500} style={{ position: "absolute", left: 70, top: 700, width: 940 }}>
          <Float delay={500} amp={3}><div style={{ fontFamily: FONT, background: INK, borderRadius: 30, padding: "26px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#fff" }}>薬を変えながら</div>
            <div style={{ fontSize: 78, fontWeight: 900, color: MK }}>数年がかり</div>
          </div></Float>
        </PopIn>
        <Band delay={605} top={940} file="ic_shield" bg="#E4F6EC" border={GREEN} isize={150} size={42}>長い通院・薬への<br /><span style={{ color: GREEN }}>備えが重要</span></Band>
      </Phase>
    </BG2>
  );
};

// ══ 図解4（44.0–54.0s）：高額療養費があっても、じわじわかかる ══
const P4: React.FC = () => (
  <BG2>
    <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.42 }, { file: "user/u05s", at: 40, volume: 0.36 }, { file: "user/u05s", at: 100, volume: 0.36 }, { file: "user/u04", at: 175, volume: 0.44 }]} />
    <Head size={42}>高額療養費制度があっても、<br />じわじわかかる</Head>
    <Card delay={14} top={430} header="高額療養費制度は“医療費”だけ" pad="20px 26px">
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={staticFile("gen/ic_insurance_card.png")} style={{ width: 118, height: 118, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.35 }}>上限があるのは医療費だけ。<br /><span style={{ color: RED }}>差額ベッド・交通費は対象外</span></div>
      </div>
    </Card>
    <PopIn delay={100} style={{ position: "absolute", left: 70, top: 690, width: 940 }}>
      <Float delay={100} amp={3}>
        <div style={{ fontFamily: FONT, background: "#FFF6E2", border: `3px solid ${ORANGE}`, borderRadius: 26, padding: "18px 26px", display: "flex", alignItems: "center", gap: 18 }}>
          <Img src={staticFile("gen/g4_extra_costs_set.png")} style={{ width: 150, height: 150, objectFit: "contain", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: INK }}>差額ベッド代は<span style={{ color: ORANGE }}>1日 約6,700円</span><span style={{ fontSize: 26, color: SUB }}>（平均）</span></div>
            <div style={{ fontSize: 32, fontWeight: 900, color: RED, marginTop: 6 }}>高いと1日1万円超のケースも</div>
          </div>
        </div>
      </Float>
    </PopIn>
    <PopIn delay={175} style={{ position: "absolute", left: 70, top: 930, width: 940 }}>
      <Float delay={175} amp={4}>
        <div style={{ fontFamily: FONT, background: INK, borderRadius: 30, padding: "28px 24px", textAlign: "center", display: "flex", alignItems: "center", gap: 18, justifyContent: "center" }}>
          <Img src={staticFile("gen/g4_money_fly.png")} style={{ width: 160, height: 160, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#fff" }}>医療費以外で</div>
            <div style={{ fontSize: 78, fontWeight: 900, color: MK }}>年<CountUp delay={175} to={100} dur={26} />万円</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: "#fff" }}>近く飛ぶ覚悟も</div>
          </div>
        </div>
      </Float>
    </PopIn>
  </BG2>
);

// ══ 図解5（54.0–64.2s）：公的保険の“対象外”の費用もある ══
const P5: React.FC = () => (
  <BG2>
    <SfxTrack gain={SFX_GAIN} cues={[{ file: "up6", at: 2, volume: 0.42 }, { file: "user/u03s", at: 125, volume: 0.36 }, { file: "user/u03s", at: 165, volume: 0.36 }, { file: "user/u08", at: 235, volume: 0.42 }]} />
    <Head size={48}>公的保険の<Mark2 delay={16}>“対象外”</Mark2>の<br />費用もある</Head>
    <Band delay={14} top={456} file="g5_free_drug" bg="#fff" border={TRACK} isize={160} size={42}>公的保険で<br /><span style={{ color: ORANGE }}>全部はカバーされない</span></Band>
    <div style={{ position: "absolute", left: 80, right: 80, top: 686 }}>
      {[{ t: "先進医療の技術料", ic: "ic_hospital", d: 125 }, { t: "自由診療・未承認薬", ic: "ic_pill_iv", d: 165 }, { t: "＝ぜんぶ対象外", ic: "ic_warning", d: 225, hi: true }].map((r, i) => (
        <PopIn key={i} delay={r.d} style={{ marginBottom: 16 }}>
          <Float delay={r.d} amp={3}><div style={{ fontFamily: FONT, background: r.hi ? INK : "#fff", border: `3px solid ${r.hi ? INK : ORANGE}`, borderRadius: 20, padding: "12px 24px", fontSize: 42, fontWeight: 900, color: r.hi ? MK : INK, display: "flex", alignItems: "center", gap: 18, boxShadow: "0 10px 22px rgba(80,60,20,0.1)" }}><Img src={staticFile(`gen/${r.ic}.png`)} style={{ width: 84, height: 84, objectFit: "contain", flexShrink: 0, background: "#fff", borderRadius: 14 }} /><span style={{ flex: 1, textAlign: "center" }}>{r.t}</span></div></Float>
        </PopIn>
      ))}
    </div>
    <Band delay={235} top={1176} file="g5_coverage_gap" bg="#FBE7E2" border={RED} isize={150} size={40} flip>未承認薬は<span style={{ color: RED }}>86.3%</span>が<br /><span style={{ color: RED }}>月100万円超</span></Band>
  </BG2>
);

// ══ 図解6（64.2–86.3s）：収入減が“長く続く”（3フェーズ）══
const P6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <BG2>
      <SfxTrack gain={SFX_GAIN} cues={[{ file: "user/u07", at: 2, volume: 0.42 }, { file: "user/u04", at: 92, volume: 0.44 }, { file: "user/u10", at: 125, volume: 0.4 }, { file: "user/u03", at: 190, volume: 0.4 }, { file: "user/u04", at: 240, volume: 0.44 }, { file: "user/u03", at: 302, volume: 0.4 }, { file: "user/u10", at: 410, volume: 0.4 }, { file: "up6", at: 505, volume: 0.42 }, { file: "finish", at: 550, volume: 0.5 }]} />
      <Head size={46}>本当の怖さは、収入減が<br /><Mark2 delay={16}>“長く続く”</Mark2>こと</Head>
      {/* rel90–183：収入減った約半数 */}
      <Phase a={0} b={183}>
        <div style={{ position: "absolute", left: 70, top: 470, width: 460, display: "flex", justifyContent: "center" }}>
          <PopIn delay={88}><Donut delay={92} pct={49.4} size={430} color={RED} big="約半数" small="が減収" /></PopIn>
        </div>
        <Ill file="g6_income_worry" size={320} delay={100} left={610} top={520} amp={9} />
        <Band delay={125} top={1010} bg="#FBE7E2" border={RED} size={46}>がんのあと、本人の<span style={{ color: RED }}>約半数が減収</span></Band>
      </Phase>
      {/* rel183–300：傷病手当2/3 */}
      <Phase a={183} b={300}>
        <div style={{ position: "absolute", left: 70, top: 470, width: 460, display: "flex", justifyContent: "center" }}>
          <PopIn delay={190}><Donut delay={205} pct={66.6} size={430} color={ORANGE} big="2/3" small="だけ" /></PopIn>
        </div>
        <Ill file="g6_sick_allowance" size={320} delay={200} left={610} top={520} amp={8} />
        <Band delay={240} top={1000} bg="#FFF6E2" border={ORANGE} size={44}>傷病手当金でも<span style={{ color: ORANGE }}>給料の約2/3</span><br /><span style={{ fontSize: 34, color: RED }}>しかも最長1年6か月まで</span></Band>
      </Phase>
      {/* rel300–662：教育/老後の時期に貯金切り崩し→長く続く */}
      <Phase a={300} b={662}>
        <Card delay={305} top={398} header="貯めたい時期に、逆に減っていく">
          <div style={{ position: "relative", height: 300 }}>
            <svg width="884" height="268" style={{ position: "absolute", inset: 0 }}>
              <line x1="30" y1="238" x2="854" y2="238" stroke={TRACK} strokeWidth="3" />
              <DrawLine d="M70 200 L820 56" delay={315} dur={58} color={GREEN} w={10} />
              <DrawLine d="M70 64 L820 226" delay={340} dur={58} color={RED} w={12} />
            </svg>
            <PopIn delay={355} style={{ position: "absolute", left: 560, top: 36, fontSize: 30, fontWeight: 900, color: GREEN }}>貯めるべき↗</PopIn>
            <PopIn delay={375} style={{ position: "absolute", left: 560, top: 212, fontSize: 30, fontWeight: 900, color: RED }}>現実の貯金↘</PopIn>
            <div style={{ position: "absolute", left: 20, top: 256, display: "flex", alignItems: "center", gap: 10, fontSize: 25, fontWeight: 800, color: SUB }}>
              <Img src={staticFile("gen/ic_schoolbag.png")} style={{ width: 52, height: 52, objectFit: "contain" }} />
              <Img src={staticFile("gen/ic_elderly_couple.png")} style={{ width: 52, height: 52, objectFit: "contain" }} />
              教育・老後にお金がかかる時期なのに…
            </div>
          </div>
        </Card>
        <Band delay={410} top={852} file="g6_savings_empty" bg="#fff" border={RED} isize={140} size={40}>貯金を<span style={{ color: RED }}>切り崩しながら</span><br />何年も続く</Band>
        <PopIn delay={548} style={{ position: "absolute", left: 70, top: 1060, width: 940 }}>
          <Float delay={548} amp={3}><div style={{ fontFamily: FONT, background: INK, borderRadius: 30, padding: "30px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#fff" }}>治療費 ＋ 収入の減少が</div>
            <div style={{ fontSize: 62, fontWeight: 900, color: MK, marginTop: 8 }}>“長く続く”のが怖い</div>
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
  </AbsoluteFill>
);
