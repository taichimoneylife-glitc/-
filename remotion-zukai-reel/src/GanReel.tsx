import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, Img, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { BG2, A2, Mark2, Big } from "./components/kit2";
import { Float, CountUp, PopIn, Appear, DrawLine } from "./components/kit";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  がんのリアル編（がん保険①）図解リール — 完全版設計図(gan1_blueprint.md)準拠
//  音声 public/gan1-narration.m4a（86.3s/図解1〜6）に同期。GAN_FRAMES=2589。
//  改訂タイトル／数字を主役／連結図解(アイコン+線)／フルフレーム／常時モーション。
//  効果音は SFX_GAIN(一括つまみ)＋ライブラリ音(低〜中・まんべんなく・高音は各シーン1回)。
// ══════════════════════════════════════════════════════════
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const GAN_FRAMES = 2589;
// ★効果音の音量つまみ（ここ1か所で全効果音を調整／0=無音）
export const SFX_GAIN = 0.55;
const BLUE = "#4A90D9", PINK = "#EC7FA0", RED = "#E8553B", ORANGE = "#EF7D4E";
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>;

const SlideTrans: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const inY = interpolate(f, [0, 8], [40, 0], clamp), inO = interpolate(f, [0, 8], [0, 1], clamp);
  const outY = interpolate(f, [dur - 12, dur], [0, -80], clamp), outO = interpolate(f, [dur - 12, dur], [1, 0], clamp);
  const z = interpolate(f, [0, dur], [1, 1.03], clamp);
  return <AbsoluteFill style={{ transform: `translateY(${inY + outY}px) scale(${z})`, transformOrigin: "50% 45%", opacity: Math.min(inO, outO) }}>{children}</AbsoluteFill>;
};
const Phase: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [a, a + 10], [0, 1], clamp), interpolate(f, [b - 10, b], [1, 0], clamp));
  if (o <= 0) return null;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
const Head: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 50 }) => (
  <PopIn delay={2} style={{ position: "absolute", left: 50, top: 256, width: 980, textAlign: "center" }}>
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: 900, color: A2.ink, letterSpacing: 1, lineHeight: 1.25 }}>{children}</div>
    <div style={{ width: 120, height: 10, borderRadius: 999, background: A2.green, margin: "12px auto 0" }} />
  </PopIn>
);
const Ill: React.FC<{ file: string; size: number; delay: number; left: number; top: number; amp?: number }> = ({ file, size, delay, left, top, amp = 8 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: size, height: size }}>
    <Float delay={delay} amp={amp}><Img src={staticFile(`gen/${file}.png`)} style={{ width: size, height: size, objectFit: "contain" }} /></Float>
  </PopIn>
);
// アイコン付き小ノード（連結図解の線の先）
const Node: React.FC<{ delay: number; left: number; top: number; w: number; file: string; label: React.ReactNode; color?: string }> = ({ delay, left, top, w, file, label, color = A2.track }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: w }}>
    <Float delay={delay} amp={4}>
      <div style={{ fontFamily: FONT, background: "#fff", border: `3px solid ${color}`, borderRadius: 20, boxShadow: "0 10px 22px rgba(80,60,20,0.1)", padding: "12px 0 10px", textAlign: "center" }}>
        <Img src={staticFile(`gen/${file}.png`)} style={{ width: 96, height: 96, objectFit: "contain" }} />
        <div style={{ fontSize: 30, fontWeight: 900, color: A2.ink, marginTop: 2 }}>{label}</div>
      </div>
    </Float>
  </PopIn>
);

// ── テロップ（下安全帯 y1360・中央寄せ・幅制御）──
type Cue = { f: number; runs: { t: string; c?: string; mark?: boolean }[] };
const CUES: Cue[] = [
  { f: 0, runs: [{ t: "がんは今や" }, { t: "2人に1人", mark: true }, { t: "の時代" }] },
  { f: 96, runs: [{ t: "生涯では男性", }, { t: "63%", c: BLUE }, { t: "・女性", }, { t: "50%", c: PINK }] },
  { f: 173, runs: [{ t: "見落としがちなのが…" }] },
  { f: 235, runs: [{ t: "50歳までは女性が", }, { t: "約2.4倍", c: RED }] },
  { f: 320, runs: [{ t: "70歳頃まで女性が多い", mark: true }] },
  { f: 369, runs: [{ t: "医療は大きく進歩" }] },
  { f: 440, runs: [{ t: "5年生存率", }, { t: "61.8→68.9%", c: A2.green }] },
  { f: 510, runs: [{ t: "長く生きられる人が増加", c: A2.green }] },
  { f: 584, runs: [{ t: "ただし、ここからが重要" }] },
  { f: 640, runs: [{ t: "がん治療は大きく変わった" }] },
  { f: 688, runs: [{ t: "入院は短く", c: BLUE }, { t: "、通院が主流に" }] },
  { f: 831, runs: [{ t: "乳がんのホルモン療法は" }] },
  { f: 905, runs: [{ t: "6〜10年", c: ORANGE }, { t: "が最多" }] },
  { f: 975, runs: [{ t: "再発・転移は", }, { t: "40.2%", c: RED }] },
  { f: 1040, runs: [{ t: "薬を変えて", c: ORANGE }, { t: "数年続く" }] },
  { f: 1186, runs: [{ t: "長い通院・薬への", }, { t: "備え", mark: true }, { t: "が重要" }] },
  { f: 1321, runs: [{ t: "「高額療養費があるから安心」" }] },
  { f: 1381, runs: [{ t: "確かに大事な制度。でも…" }] },
  { f: 1440, runs: [{ t: "差額ベッドは", }, { t: "日6,714円", c: ORANGE }] },
  { f: 1492, runs: [{ t: "医療費以外で", }, { t: "年100万円", c: RED }, { t: "近く" }] },
  { f: 1620, runs: [{ t: "公的保険で" }] },
  { f: 1680, runs: [{ t: "対象外の費用", mark: true }, { t: "もある" }] },
  { f: 1741, runs: [{ t: "未承認薬は" }, { t: "86.3%", c: RED }, { t: "が…" }] },
  { f: 1840, runs: [{ t: "1か月", }, { t: "100万円超", c: RED }] },
  { f: 1927, runs: [{ t: "一番怖いのが…" }] },
  { f: 1980, runs: [{ t: "収入の減少", c: RED }] },
  { f: 2017, runs: [{ t: "減った人は", }, { t: "約半数", c: RED }] },
  { f: 2110, runs: [{ t: "傷病手当金が出ても" }] },
  { f: 2160, runs: [{ t: "給料の", }, { t: "約3分の2", c: ORANGE }] },
  { f: 2227, runs: [{ t: "貯めたい時期なのに…" }] },
  { f: 2333, runs: [{ t: "貯金を", }, { t: "切り崩す43.7%", c: RED }] },
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
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, lineHeight: 1.25, color: A2.ink, background: "rgba(255,255,255,0.82)", borderRadius: 18, padding: "14px 30px", maxWidth: 940, textAlign: "center", boxShadow: "0 8px 20px rgba(80,60,20,0.12)" }}>
        {cue.runs.map((r, k) => r.mark
          ? <span key={k} style={{ background: A2.marker, borderRadius: 8, padding: "2px 10px" }}>{r.t}</span>
          : <span key={k} style={{ color: r.c || A2.ink }}>{r.t}</span>)}
      </div>
    </div>
  );
};

const Card: React.FC<{ delay: number; top: number; left?: number; width?: number; header?: React.ReactNode; headColor?: string; pad?: string; children: React.ReactNode }> = ({ delay, top, left = 80, width = 920, header, headColor = A2.green, pad = "24px 28px", children }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width }}>
    <Float delay={delay} amp={3}>
      <div style={{ background: "#fff", borderRadius: 28, boxShadow: "0 16px 38px rgba(80,60,20,0.14)", overflow: "hidden", fontFamily: FONT }}>
        {header ? <div style={{ background: headColor, color: "#fff", fontWeight: 900, fontSize: 32, padding: "16px 28px", textAlign: "center" }}>{header}</div> : null}
        <div style={{ padding: pad }}>{children}</div>
      </div>
    </Float>
  </PopIn>
);
const IllBand: React.FC<{ delay: number; top: number; file: string; bg: string; border: string; children: React.ReactNode; size?: number; flip?: boolean }> = ({ delay, top, file, bg, border, children, size = 170, flip }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 80, top, width: 920 }}>
    <Float delay={delay} amp={3}>
      <div style={{ fontFamily: FONT, background: bg, border: `3px solid ${border}`, borderRadius: 24, padding: "16px 24px", display: "flex", flexDirection: flip ? "row-reverse" : "row", alignItems: "center", gap: 18 }}>
        <Img src={staticFile(`gen/${file}.png`)} style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: 40, fontWeight: 900, color: A2.ink, lineHeight: 1.3, textAlign: flip ? "right" : "left" }}>{children}</div>
      </div>
    </Float>
  </PopIn>
);
const Donut: React.FC<{ delay: number; pct: number; size?: number; color?: string; big: React.ReactNode; small?: React.ReactNode }> = ({ delay, pct, size = 440, color = RED, big, small }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 34], [0, pct], clamp);
  const sw = 54, r = size / 2 - sw / 2, c = 2 * Math.PI * r, cx = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, fontFamily: FONT }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cx} r={r} stroke={A2.track} strokeWidth={sw} fill="none" />
        <circle cx={cx} cy={cx} r={r} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} transform={`rotate(-90 ${cx} ${cx})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 92, fontWeight: 900, color }}>{big}</div>
        {small ? <div style={{ fontSize: 34, fontWeight: 900, color: A2.sub, marginTop: -8 }}>{small}</div> : null}
      </div>
    </div>
  );
};

// ══ 図解1：2人に1人・年代別ペア棒（〜70まで女性が上を強調）＋女性注意バンド ══
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const groups = [
    { g: "〜40", m: 1.1, w: 2.3 }, { g: "〜50", m: 2.7, w: 6.4 }, { g: "〜60", m: 7.4, w: 12.6 },
    { g: "〜70", m: 20.3, w: 21.3 }, { g: "〜80", m: 41.8, w: 33.2 }, { g: "生涯", m: 63.3, w: 50.8 },
  ];
  const bAreaH = 300, baseY = bAreaH, x0 = 40, gw = (860 - 80) / 6;
  return (
    <BG2>
      <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.42 }, { file: "user/u02s", at: 120, volume: 0.36 }, { file: "user/u02s", at: 168, volume: 0.36 }, { file: "user/u04", at: 255, volume: 0.42 }, { file: "user/u10", at: 300, volume: 0.4 }]} />
      <Head>がんは<Mark2 delay={16}>2人に1人</Mark2>。<br />しかも女性は若くから</Head>
      <Card delay={10} top={398} pad="18px 24px">
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Img src={staticFile("gen/g1_two_of_two.png")} style={{ width: 180, height: 180, objectFit: "contain", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 38, fontWeight: 900, color: A2.ink }}>いまや<span style={{ color: RED }}>2人に1人</span></div>
            <div style={{ fontSize: 44, fontWeight: 900, marginTop: 8 }}>男性<span style={{ color: BLUE }}>63%</span>　女性<span style={{ color: PINK }}>50%</span></div>
          </div>
        </div>
      </Card>
      <Card delay={90} top={660} header="年代別のがん罹患リスク（男性/女性）">
        <div style={{ position: "relative", height: bAreaH + 40 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: baseY, height: 3, background: A2.track }} />
          {groups.map((gr, i) => {
            const cx = x0 + i * gw, d = 110 + i * 14;
            const hm = interpolate(f, [d, d + 14], [0, (gr.m / 70) * bAreaH], clamp);
            const hw = interpolate(f, [d + 5, d + 19], [0, (gr.w / 70) * bAreaH], clamp);
            const femaleUp = gr.w > gr.m; // 女性が上回る年代
            const last = gr.g === "生涯";
            return (
              <div key={gr.g}>
                {femaleUp && f > d && <div style={{ position: "absolute", left: cx - 10, top: 0, width: 108, height: baseY, background: "rgba(236,127,160,0.12)", borderRadius: 8 }} />}
                <div style={{ position: "absolute", left: cx, top: baseY - hm, width: 44, height: hm, background: BLUE, borderRadius: "6px 6px 0 0" }} />
                <div style={{ position: "absolute", left: cx + 50, top: baseY - hw, width: 44, height: hw, background: PINK, borderRadius: "6px 6px 0 0" }} />
                <div style={{ position: "absolute", left: cx - 8, top: baseY + 10, width: 110, textAlign: "center", fontSize: 22, fontWeight: 800, color: femaleUp ? PINK : A2.sub }}>{gr.g}</div>
                {last && f > d + 14 && <>
                  <div style={{ position: "absolute", left: cx - 30, top: baseY - hm - 38, width: 100, textAlign: "center", fontSize: 30, fontWeight: 900, color: BLUE }}>63%</div>
                  <div style={{ position: "absolute", left: cx + 24, top: baseY - hw - 38, width: 100, textAlign: "center", fontSize: 30, fontWeight: 900, color: PINK }}>50%</div>
                </>}
              </div>
            );
          })}
        </div>
      </Card>
      <PopIn delay={255} style={{ position: "absolute", left: 80, top: 1140, width: 920 }}>
        <Float delay={255} amp={3}>
          <div style={{ fontFamily: FONT, background: "#FBE7E2", border: `3px solid ${RED}`, borderRadius: 24, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <Img src={staticFile("gen/g1_woman_young.png")} style={{ width: 120, height: 120, objectFit: "contain", flexShrink: 0 }} />
            <div style={{ fontSize: 38, fontWeight: 900, color: A2.ink, lineHeight: 1.3 }}>50歳までは女性が<span style={{ color: RED }}>約2.4倍</span><br /><span style={{ fontSize: 32 }}>70歳頃まで女性が多い＝<span style={{ color: RED }}>特に注意</span></span></div>
          </div>
        </Float>
      </PopIn>
    </BG2>
  );
};

// ══ 図解2：数年前より"治りやすく"なった ＝ 5年生存率 61.8→68.9% を主役 ══
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const drawn = interpolate(f, [60, 120], [0, 1], clamp);
  return (
    <BG2>
      <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.42 }, { file: "up6", at: 55, volume: 0.4 }, { file: "user/u04", at: 100, volume: 0.44 }, { file: "user/u10", at: 150, volume: 0.4 }]} />
      <Head size={48}>数年前より、がんは<br /><Mark2 delay={16}>“治りやすく”</Mark2>なった</Head>
      <Card delay={10} top={430} header="全がんの5年生存率（約20年で）">
        <div style={{ position: "relative", height: 300 }}>
          <svg width="840" height="230" style={{ position: "absolute", left: 0, top: 70 }}>
            <line x1="40" y1="200" x2="800" y2="200" stroke={A2.track} strokeWidth="3" />
            <DrawLine d="M90 180 L760 60" delay={60} dur={46} color={A2.green} w={14} />
            {drawn > 0.9 && <path d="M730 44 L772 54 L752 92" fill="none" stroke={A2.green} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          <div style={{ position: "absolute", left: 30, top: 250, fontSize: 40, fontWeight: 900, color: A2.sub }}>61.8<span style={{ fontSize: 26 }}>%</span></div>
          <PopIn delay={100} style={{ position: "absolute", left: 560, top: 10, fontSize: 84, fontWeight: 900, color: A2.green }}>
            <CountUp delay={100} to={68.9} dur={24} />%
          </PopIn>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
          <div style={{ flex: 1, background: "#EAF2FB", borderRadius: 14, padding: "10px 0", textAlign: "center", fontSize: 30, fontWeight: 900, color: BLUE }}>男性 +13pt</div>
          <div style={{ flex: 1, background: "#FCEAF1", borderRadius: 14, padding: "10px 0", textAlign: "center", fontSize: 30, fontWeight: 900, color: PINK }}>女性 +8pt</div>
        </div>
      </Card>
      <IllBand delay={150} top={1080} file="g2_recovered_smile" bg="#E4F6EC" border={A2.green} size={190}>
        長く生きられる人が<br /><span style={{ color: A2.green }}>増えています</span>
      </IllBand>
    </BG2>
  );
};

// ══ 図解3（24.5s）：入院は短く、通院が主流に（フェーズ切替・数字入り）══
const P3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <BG2>
      <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.42 }, { file: "user/u02s", at: 40, volume: 0.36 }, { file: "user/u02s", at: 60, volume: 0.36 }, { file: "user/u03", at: 258, volume: 0.4 }, { file: "up6", at: 290, volume: 0.42 }, { file: "user/u03", at: 528, volume: 0.4 }, { file: "user/u08", at: 590, volume: 0.42 }]} />
      <Head size={50}>入院は短く、通院が主流に</Head>
      <Phase a={0} b={255}>
        <div style={{ position: "absolute", left: 80, top: 400, width: 920, display: "flex", gap: 22 }}>
          <PopIn delay={40} style={{ flex: 1 }}><Float delay={40} amp={4}><div style={{ fontFamily: FONT, background: "#fff", borderRadius: 24, boxShadow: "0 12px 28px rgba(80,60,20,0.12)", padding: "26px 0", textAlign: "center", borderTop: `8px solid ${BLUE}` }}><div style={{ fontSize: 40, fontWeight: 900 }}>入院</div><div style={{ fontSize: 46, fontWeight: 900, color: BLUE }}>短く ↓</div></div></Float></PopIn>
          <PopIn delay={60} style={{ flex: 1 }}><Float delay={60} amp={4}><div style={{ fontFamily: FONT, background: "#fff", borderRadius: 24, boxShadow: "0 12px 28px rgba(80,60,20,0.12)", padding: "26px 0", textAlign: "center", borderTop: `8px solid ${A2.green}` }}><div style={{ fontSize: 40, fontWeight: 900 }}>通院</div><div style={{ fontSize: 46, fontWeight: 900, color: A2.green }}>主流に ↑</div></div></Float></PopIn>
        </div>
        <IllBand delay={90} top={720} file="g3_commute_hospital" bg="#E4F6EC" border={A2.green}>いまは<span style={{ color: A2.green }}>通院しながら</span>治療する時代</IllBand>
      </Phase>
      <Phase a={255} b={525}>
        <Card delay={265} top={400} header="乳がんのホルモン療法の期間">
          <div style={{ position: "relative", height: 150 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 50, height: 46, borderRadius: 999, background: A2.track }} />
            <div style={{ position: "absolute", left: 0, top: 50, height: 46, borderRadius: 999, background: ORANGE, width: interpolate(f, [290, 345], [0, 860], clamp) }} />
            <div style={{ position: "absolute", left: 6, top: 108, fontSize: 24, fontWeight: 800, color: A2.sub }}>0年</div>
            <div style={{ position: "absolute", right: 6, top: 104, fontSize: 36, fontWeight: 900, color: ORANGE }}>6〜10年が最多</div>
          </div>
        </Card>
        <IllBand delay={300} top={760} file="g3_pills_longterm" bg="#FFF6E2" border={ORANGE} flip><span style={{ color: ORANGE }}>6〜10年</span>、薬を飲み続けることも</IllBand>
      </Phase>
      <Phase a={525} b={737}>
        <IllBand delay={540} top={430} file="g3_relapse_change" bg="#FBE7E2" border={RED} size={260}>再発・転移は<br /><span style={{ color: RED }}>40.2%</span>に</IllBand>
        <PopIn delay={590} style={{ position: "absolute", left: 80, top: 820, width: 920 }}>
          <Float delay={590} amp={3}><div style={{ fontFamily: FONT, background: A2.ink, borderRadius: 28, padding: "34px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#fff" }}>薬を変えながら</div>
            <div style={{ fontSize: 84, fontWeight: 900, color: A2.marker }}>数年がかり</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#fff" }}>になることも</div>
          </div></Float>
        </PopIn>
      </Phase>
    </BG2>
  );
};

// ══ 図解4：高額療養費があっても、じわじわかかる（差額ベッド6,714円＋年100万）══
const P4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <BG2>
      <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.42 }, { file: "user/u02s", at: 40, volume: 0.36 }, { file: "user/u05s", at: 95, volume: 0.36 }, { file: "user/u04", at: 170, volume: 0.44 }]} />
      <Head size={44}>高額療養費があっても、<br />じわじわかかる</Head>
      <PopIn delay={16} style={{ position: "absolute", left: 80, top: 430, width: 920 }}>
        <Float delay={16} amp={3}>
          <div style={{ fontFamily: FONT, background: "#fff", border: `3px solid ${A2.green}`, borderRadius: 24, padding: "16px 22px", display: "flex", alignItems: "center", gap: 16 }}>
            <Img src={staticFile("gen/ic_insurance_card.png")} style={{ width: 120, height: 120, objectFit: "contain" }} />
            <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.3 }}>高額療養費は“医療費”に上限。<br /><span style={{ color: RED }}>医療費以外は対象外</span></div>
          </div>
        </Float>
      </PopIn>
      <IllBand delay={95} top={650} file="g4_extra_costs_set" bg="#FFF6E2" border={ORANGE} size={150} flip>差額ベッドは<span style={{ color: ORANGE }}>日6,714円</span><br />交通費・ウィッグも</IllBand>
      <PopIn delay={170} style={{ position: "absolute", left: 80, top: 880, width: 920 }}>
        <Float delay={170} amp={4}>
          <div style={{ fontFamily: FONT, background: A2.ink, borderRadius: 28, padding: "26px 24px", textAlign: "center", display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
            <Img src={staticFile("gen/g4_money_fly.png")} style={{ width: 150, height: 150, objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: 34, fontWeight: 900, color: "#fff" }}>医療費以外で</div>
              <div style={{ fontSize: 74, fontWeight: 900, color: A2.marker }}>年<CountUp delay={170} to={100} dur={26} />万円</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>近く飛ぶ覚悟も</div>
            </div>
          </div>
        </Float>
      </PopIn>
    </BG2>
  );
};

// ══ 図解5：公的保険の"対象外"の費用もある（未承認薬 86.3%が月100万超）══
const P5: React.FC = () => (
  <BG2>
    <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.42 }, { file: "user/u02s", at: 110, volume: 0.36 }, { file: "user/u02s", at: 150, volume: 0.36 }, { file: "user/u08", at: 200, volume: 0.42 }]} />
    <Head size={48}>公的保険の<Mark2 delay={16}>“対象外”</Mark2>の<br />費用もある</Head>
    <IllBand delay={10} top={430} file="g5_free_drug" bg="#fff" border={A2.track} size={170}>保険が効かない<br /><span style={{ color: ORANGE }}>自由診療</span>もある</IllBand>
    <div style={{ position: "absolute", left: 90, right: 90, top: 660 }}>
      {[{ t: "先進医療の技術料", d: 110 }, { t: "自由診療・未承認薬", d: 150 }, { t: "＝ぜんぶ対象外", d: 195, hi: true }].map((r, i) => (
        <PopIn key={i} delay={r.d} style={{ marginBottom: 16 }}>
          <Float delay={r.d} amp={3}><div style={{ fontFamily: FONT, background: r.hi ? A2.ink : "#fff", border: `3px solid ${r.hi ? A2.ink : ORANGE}`, borderRadius: 18, padding: "18px 0", fontSize: 40, fontWeight: 900, color: r.hi ? A2.marker : A2.ink, textAlign: "center", boxShadow: "0 10px 22px rgba(80,60,20,0.1)" }}>{r.t}</div></Float>
        </PopIn>
      ))}
    </div>
    <PopIn delay={200} style={{ position: "absolute", left: 80, top: 1120, width: 920 }}>
      <Float delay={200} amp={3}>
        <div style={{ fontFamily: FONT, background: "#FBE7E2", border: `4px solid ${RED}`, borderRadius: 24, padding: "18px 22px", textAlign: "center", fontSize: 42, fontWeight: 900 }}>未承認薬は<span style={{ color: RED }}>86.3%</span>が<span style={{ color: RED }}>月100万円超</span></div>
      </Float>
    </PopIn>
  </BG2>
);

// ══ 図解6（22s）：収入減が"長く続く"（約半数→2/3→ライフプラン対比）══
const P6: React.FC = () => {
  const f = useCurrentFrame();
  // ライフプラン対比：貯めるべき(点線↗) と 現実の貯金(実線↘) が交差
  const planP = interpolate(f, [455, 520], [0, 1], clamp);
  const saveP = interpolate(f, [475, 545], [0, 1], clamp);
  return (
    <BG2>
      <SfxTrack gain={SFX_GAIN} cues={[{ file: "up5", at: 2, volume: 0.42 }, { file: "user/u04", at: 55, volume: 0.44 }, { file: "user/u10", at: 120, volume: 0.4 }, { file: "user/u03", at: 225, volume: 0.4 }, { file: "user/u04", at: 245, volume: 0.44 }, { file: "up6", at: 520, volume: 0.42 }, { file: "finish", at: 560, volume: 0.5 }]} />
      <Head size={46}>本当の怖さは、収入減が<br /><Mark2 delay={16}>“長く続く”</Mark2>こと</Head>
      <Phase a={0} b={215}>
        <div style={{ position: "absolute", left: 60, top: 420, width: 500, display: "flex", justifyContent: "center" }}>
          <PopIn delay={40}><Donut delay={55} pct={49.4} size={440} color={RED} big="約半数" small="が減収" /></PopIn>
        </div>
        <Ill file="g6_income_worry" size={300} delay={70} left={620} top={470} amp={9} />
        <PopIn delay={120} style={{ position: "absolute", left: 80, top: 940, width: 920 }}>
          <Float delay={120} amp={4}><div style={{ fontFamily: FONT, background: "#FBE7E2", border: `4px solid ${RED}`, borderRadius: 28, padding: "24px 26px", textAlign: "center", fontSize: 46, fontWeight: 900, color: A2.ink }}>がんのあと、本人の<span style={{ color: RED }}>49.4%が減収</span></div></Float>
        </PopIn>
      </Phase>
      <Phase a={215} b={435}>
        <div style={{ position: "absolute", left: 60, top: 420, width: 500, display: "flex", justifyContent: "center" }}>
          <PopIn delay={225}><Donut delay={245} pct={66.6} size={440} color={ORANGE} big="2/3" small="だけ" /></PopIn>
        </div>
        <Ill file="g6_sick_allowance" size={300} delay={240} left={620} top={470} amp={8} />
        <PopIn delay={300} style={{ position: "absolute", left: 80, top: 940, width: 920 }}>
          <Float delay={300} amp={4}><div style={{ fontFamily: FONT, background: "#FFF6E2", border: `4px solid ${ORANGE}`, borderRadius: 28, padding: "24px 26px", textAlign: "center", fontSize: 44, fontWeight: 900, color: A2.ink }}>傷病手当金でも<span style={{ color: ORANGE }}>給料の約2/3</span></div></Float>
        </PopIn>
      </Phase>
      {/* フェーズ3：ライフプラン対比（貯めるべき↗ vs 貯金↘ 交差）＋43.7% */}
      <Phase a={435} b={662}>
        <Card delay={445} top={388} header="貯めたい時期に、逆に減っていく">
          <div style={{ position: "relative", height: 300 }}>
            <svg width="840" height="280" style={{ position: "absolute", inset: 0 }}>
              <line x1="30" y1="250" x2="810" y2="250" stroke={A2.track} strokeWidth="3" />
              {/* 貯めるべき：右肩上がり点線 */}
              <DrawLine d="M60 220 L780 50" delay={455} dur={60} color={A2.green} w={9} />
              {/* 現実の貯金：右肩下がり実線 */}
              <DrawLine d="M60 70 L780 240" delay={475} dur={60} color={RED} w={11} />
            </svg>
            {planP > 0.6 && <div style={{ position: "absolute", left: 540, top: 40, fontSize: 30, fontWeight: 900, color: A2.green }}>貯めるべき↗</div>}
            {saveP > 0.6 && <div style={{ position: "absolute", left: 540, top: 225, fontSize: 30, fontWeight: 900, color: RED }}>現実の貯金↘</div>}
            <div style={{ position: "absolute", left: 20, top: 262, fontSize: 24, fontWeight: 800, color: A2.sub }}>教育・老後にお金がかかる時期</div>
          </div>
        </Card>
        <PopIn delay={520} style={{ position: "absolute", left: 80, top: 760, width: 920 }}>
          <Float delay={520} amp={3}><div style={{ fontFamily: FONT, background: "#fff", border: `3px solid ${RED}`, borderRadius: 22, padding: "16px 20px", textAlign: "center", fontSize: 38, fontWeight: 900 }}>家計維持は<span style={{ color: RED }}>貯蓄切り崩し43.7%</span></div></Float>
        </PopIn>
        <PopIn delay={560} style={{ position: "absolute", left: 80, top: 900, width: 920 }}>
          <Float delay={560} amp={4}><div style={{ fontFamily: FONT, background: A2.ink, borderRadius: 28, padding: "30px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 46, fontWeight: 900, color: "#fff" }}>治療費 ＋ 収入の減少</div>
            <div style={{ fontSize: 58, fontWeight: 900, color: A2.marker, marginTop: 8 }}>“長く続く”のが怖い</div>
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
