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

// 白カード（投資準拠・ヘッダ任意）
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

// ══ 図解1：ヒーローカード＋チャートカード＋2.4倍バンド（カード型・縦を埋める）══
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const groups = [
    { g: "〜40", m: 1.1, w: 2.3 }, { g: "〜50", m: 2.7, w: 6.4 }, { g: "〜60", m: 7.4, w: 12.6 },
    { g: "〜70", m: 20.3, w: 21.3 }, { g: "〜80", m: 41.8, w: 33.2 }, { g: "生涯", m: 63.3, w: 50.8 },
  ];
  const CW = 860, bAreaH = 300, baseY = bAreaH, x0 = 40, gw = (CW - 80) / 6;
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, ...groups.map((_, i) => ({ file: "pop" as const, at: 120 + i * 16, volume: 0.26 })), { file: "up1", at: 250, volume: 0.34 }]} />
      <Head>がんは<Mark2 delay={16}>2人に1人</Mark2>の時代</Head>
      {/* ヒーローカード：イラスト＋見出し数字 */}
      <Card delay={10} top={378} pad="20px 26px">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Img src={staticFile("gen/g1_two_of_two.png")} style={{ width: 200, height: 200, objectFit: "contain", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 40, fontWeight: 900, color: A2.ink }}>いまや<span style={{ color: RED }}>2人に1人</span>の時代</div>
            <div style={{ fontSize: 44, fontWeight: 900, marginTop: 10 }}>男性<span style={{ color: BLUE }}>63%</span>　女性<span style={{ color: PINK }}>50%</span></div>
          </div>
        </div>
      </Card>
      {/* チャートカード */}
      <Card delay={90} top={668} header="年代別のがん罹患リスク（男性/女性）">
        <div style={{ position: "relative", height: bAreaH + 40 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: baseY, height: 3, background: A2.track }} />
          {groups.map((gr, i) => {
            const cx = x0 + i * gw, d = 120 + i * 16;
            const hm = interpolate(f, [d, d + 14], [0, (gr.m / 70) * bAreaH], clamp);
            const hw = interpolate(f, [d + 5, d + 19], [0, (gr.w / 70) * bAreaH], clamp);
            const last = gr.g === "生涯";
            return (
              <div key={gr.g}>
                <div style={{ position: "absolute", left: cx, top: baseY - hm, width: 44, height: hm, background: BLUE, borderRadius: "6px 6px 0 0" }} />
                <div style={{ position: "absolute", left: cx + 50, top: baseY - hw, width: 44, height: hw, background: PINK, borderRadius: "6px 6px 0 0" }} />
                <div style={{ position: "absolute", left: cx - 8, top: baseY + 10, width: 110, textAlign: "center", fontSize: 22, fontWeight: 800, color: A2.sub }}>{gr.g}</div>
                {last && f > d + 14 && <>
                  <div style={{ position: "absolute", left: cx - 30, top: baseY - hm - 38, width: 100, textAlign: "center", fontSize: 30, fontWeight: 900, color: BLUE }}>63%</div>
                  <div style={{ position: "absolute", left: cx + 24, top: baseY - hw - 38, width: 100, textAlign: "center", fontSize: 30, fontWeight: 900, color: PINK }}>50%</div>
                </>}
              </div>
            );
          })}
          {/* 50歳までの差を丸で強調 */}
          {f > 250 && <div style={{ position: "absolute", left: x0 + gw - 12, top: baseY - 60, width: 80, height: 76, border: `4px solid ${RED}`, borderRadius: "50%", opacity: interpolate(f, [250, 262], [0, 1], clamp) }} />}
        </div>
      </Card>
      {/* 2.4倍 バンド＋若い女性（カード内に一体化） */}
      <PopIn delay={250} style={{ position: "absolute", left: 80, top: 1150, width: 920 }}>
        <Float delay={250} amp={3}>
          <div style={{ fontFamily: FONT, background: "#FBE7E2", border: `3px solid ${RED}`, borderRadius: 24, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <Img src={staticFile("gen/g1_woman_young.png")} style={{ width: 130, height: 130, objectFit: "contain", flexShrink: 0 }} />
            <div style={{ fontSize: 40, fontWeight: 900, color: A2.ink, lineHeight: 1.3 }}>50歳までは<br />女性が<span style={{ color: RED }}>約2.4倍</span></div>
          </div>
        </Float>
      </PopIn>
    </BG2>
  );
};

// 円ドーナツ（0→pct%まで ドドッと満ちる）
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
        <div style={{ fontSize: 96, fontWeight: 900, color }}>{big}</div>
        {small ? <div style={{ fontSize: 34, fontWeight: 900, color: A2.sub, marginTop: -8 }}>{small}</div> : null}
      </div>
    </div>
  );
};

// ══ 図解2：生存率カード（大きく・改善は線の上）＋増加バンド（画面いっぱい）══
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const drawn = interpolate(f, [40, 100], [0, 1], clamp);
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "up6", at: 40, volume: 0.34 }, { file: "correct", at: 105, volume: 0.32 }]} />
      <Head>がんは“治る時代”へ</Head>
      <Card delay={10} top={380} header="5年生存率は上がっている" pad="30px 30px">
        <div style={{ position: "relative", height: 540 }}>
          <svg width="860" height="540" style={{ position: "absolute", inset: 0 }}>
            <line x1="40" y1="500" x2="820" y2="500" stroke={A2.track} strokeWidth="3" />
            <DrawLine d="M80 470 L770 150" delay={40} dur={46} color={A2.green} w={16} />
            {drawn > 0.9 && <path d="M738 128 L782 142 L760 184" fill="none" stroke={A2.green} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          {/* 以前（線の始点・大きく） */}
          <div style={{ position: "absolute", left: 30, top: 400, fontSize: 48, fontWeight: 900, color: A2.sub }}>以前</div>
          {/* 今（線の終点・特大） */}
          <PopIn delay={100} style={{ position: "absolute", left: 640, top: 40, fontSize: 80, fontWeight: 900, color: A2.green }}>今</PopIn>
          {/* 改善 ↗（線とかぶらない左上） */}
          <PopIn delay={70} style={{ position: "absolute", left: 120, top: 120, fontSize: 60, fontWeight: 900, color: A2.green }}>改善 ↗</PopIn>
        </div>
      </Card>
      <PopIn delay={120} style={{ position: "absolute", left: 80, top: 1070, width: 920 }}>
        <Float delay={120} amp={3}>
          <div style={{ fontFamily: FONT, background: "#E4F6EC", border: `4px solid ${A2.green}`, borderRadius: 28, padding: "20px 26px", display: "flex", alignItems: "center", gap: 20 }}>
            <Img src={staticFile("gen/g2_recovered_smile.png")} style={{ width: 210, height: 210, objectFit: "contain", flexShrink: 0 }} />
            <div style={{ fontSize: 54, fontWeight: 900, color: A2.ink, lineHeight: 1.25 }}>長く生きられる人が<br /><span style={{ color: A2.green }}>増えています</span></div>
          </div>
        </Float>
      </PopIn>
    </BG2>
  );
};

// 横長バンド（イラスト＋テキスト一体・カード風）
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

// ══ 図解3（24.5s）：フェーズ切替・カード型 ══
const P3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "up3", at: 40, volume: 0.3 }, { file: "up4", at: 60, volume: 0.3 }, { file: "swipe", at: 250, volume: 0.3 }, { file: "up6", at: 290, volume: 0.32 }, { file: "swipe", at: 520, volume: 0.3 }, { file: "pop", at: 560, volume: 0.3 }]} />
      <Head size={50}>治療は“長くて通院”</Head>
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
            <div style={{ position: "absolute", right: 6, top: 104, fontSize: 36, fontWeight: 900, color: ORANGE }}>5〜10年</div>
          </div>
        </Card>
        <IllBand delay={300} top={760} file="g3_pills_longterm" bg="#FFF6E2" border={ORANGE} flip><span style={{ color: ORANGE }}>5〜10年</span>、薬を飲み続けることも</IllBand>
      </Phase>
      <Phase a={525} b={737}>
        <IllBand delay={540} top={430} file="g3_relapse_change" bg="#FBE7E2" border={RED} size={280}>再発・転移すれば<br /><span style={{ color: RED }}>薬を変えて治療</span></IllBand>
        <PopIn delay={590} style={{ position: "absolute", left: 80, top: 820, width: 920 }}>
          <Float delay={590} amp={3}><div style={{ fontFamily: FONT, background: A2.ink, borderRadius: 28, padding: "34px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#fff" }}>治療は</div>
            <div style={{ fontSize: 84, fontWeight: 900, color: A2.marker }}>数年がかり</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#fff" }}>になることも</div>
          </div></Float>
        </PopIn>
      </Phase>
    </BG2>
  );
};

// ══ 図解4：高額療養費カード＋年100万カード ══
const P4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "pop", at: 40, volume: 0.3 }, { file: "count", at: 160, volume: 0.3 }, { file: "up1", at: 190, volume: 0.36 }]} />
      <Head size={48}>高額療養費があっても、かかる</Head>
      <Card delay={20} top={390} header="高額療養費は“医療費”だけ" headColor={A2.green}>
        <div style={{ fontSize: 34, fontWeight: 900, color: A2.ink, textAlign: "center", lineHeight: 1.35 }}>大事な制度。でも<span style={{ color: RED }}>“医療費以外”は対象外</span></div>
      </Card>
      <IllBand delay={60} top={620} file="g4_woman_bills_worry" bg="#fff" border={A2.track}>通院が年単位で続くと<br />出費が<span style={{ color: RED }}>じわじわ増える</span></IllBand>
      <PopIn delay={160} style={{ position: "absolute", left: 80, top: 850, width: 920 }}>
        <Float delay={160} amp={4}>
          <div style={{ fontFamily: FONT, background: A2.ink, borderRadius: 28, padding: "28px 24px", textAlign: "center", display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
            <Img src={staticFile("gen/g4_money_fly.png")} style={{ width: 150, height: 150, objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: 34, fontWeight: 900, color: "#fff" }}>医療費以外で</div>
              <div style={{ fontSize: 74, fontWeight: 900, color: A2.marker }}>年<CountUp delay={160} to={100} dur={26} />万円</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>近く飛ぶ覚悟も</div>
            </div>
          </div>
        </Float>
      </PopIn>
    </BG2>
  );
};

// ══ 図解5：対象外が積み重なる（カード型スタック＋イラスト）══
const P5: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "up3", at: 110, volume: 0.3 }, { file: "up4", at: 150, volume: 0.3 }, { file: "up1", at: 195, volume: 0.36 }]} />
    <Head size={50}>公的保険で“全部”は守れない</Head>
    <IllBand delay={10} top={400} file="g5_free_drug" bg="#fff" border={A2.track} size={180}>保険が効かない<br /><span style={{ color: ORANGE }}>自由診療</span>もある</IllBand>
    <div style={{ position: "absolute", left: 90, right: 90, top: 640 }}>
      {[{ t: "先進医療の技術料", d: 110 }, { t: "自由診療・未承認薬", d: 150 }, { t: "＝ぜんぶ対象外", d: 195, hi: true }].map((r, i) => (
        <PopIn key={i} delay={r.d} style={{ marginBottom: 18 }}>
          <Float delay={r.d} amp={3}><div style={{ fontFamily: FONT, background: r.hi ? A2.ink : "#fff", border: `3px solid ${r.hi ? A2.ink : ORANGE}`, borderRadius: 18, padding: "20px 0", fontSize: 42, fontWeight: 900, color: r.hi ? A2.marker : A2.ink, textAlign: "center", boxShadow: "0 10px 22px rgba(80,60,20,0.1)" }}>{r.t}</div></Float>
        </PopIn>
      ))}
    </div>
    <Ill file="g5_coverage_gap" size={190} delay={210} left={100} top={1120} amp={6} />
  </BG2>
);

// ══ 図解6（22s）：フェーズ切替・カード型 ══
const P6: React.FC = () => {
  const f = useCurrentFrame();
  const savArrow = interpolate(f, [440, 510], [0, 1], clamp);
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.3 }, { file: "up1", at: 90, volume: 0.34 }, { file: "pop", at: 220, volume: 0.3 }, { file: "up6", at: 440, volume: 0.32 }, { file: "finish", at: 560, volume: 0.42 }]} />
      <Head size={50}>一番怖いのは“収入の減少”</Head>
      {/* フェーズ1：円グラフ 約半数＋悲しむ人（画面いっぱい） */}
      <Phase a={0} b={215}>
        <div style={{ position: "absolute", left: 60, top: 400, width: 500, display: "flex", justifyContent: "center" }}>
          <PopIn delay={40}><Donut delay={55} pct={52} size={460} color={RED} big="約半数" small="以上" /></PopIn>
        </div>
        <Ill file="g6_income_worry" size={320} delay={70} left={610} top={450} amp={9} />
        <PopIn delay={120} style={{ position: "absolute", left: 80, top: 940, width: 920 }}>
          <Float delay={120} amp={4}><div style={{ fontFamily: FONT, background: "#FBE7E2", border: `4px solid ${RED}`, borderRadius: 28, padding: "24px 26px", textAlign: "center", fontSize: 48, fontWeight: 900, color: A2.ink }}>がんのあと、<span style={{ color: RED }}>収入が減った</span></div></Float>
        </PopIn>
      </Phase>
      {/* フェーズ2：傷病手当 2/3（大きく） */}
      <Phase a={215} b={435}>
        <div style={{ position: "absolute", left: 60, top: 400, width: 500, display: "flex", justifyContent: "center" }}>
          <PopIn delay={225}><Donut delay={245} pct={66.6} size={460} color={ORANGE} big="2/3" small="だけ" /></PopIn>
        </div>
        <Ill file="g6_sick_allowance" size={320} delay={240} left={610} top={450} amp={8} />
        <PopIn delay={300} style={{ position: "absolute", left: 80, top: 940, width: 920 }}>
          <Float delay={300} amp={4}><div style={{ fontFamily: FONT, background: "#FFF6E2", border: `4px solid ${ORANGE}`, borderRadius: 28, padding: "24px 26px", textAlign: "center", fontSize: 46, fontWeight: 900, color: A2.ink }}>傷病手当金でも<span style={{ color: ORANGE }}>給料の約2/3</span></div></Float>
        </PopIn>
      </Phase>
      {/* フェーズ3：貯金↓＋一撃（画面いっぱい） */}
      <Phase a={435} b={662}>
        <Card delay={445} top={390} header="貯金を切り崩し続ける…">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Img src={staticFile("gen/g6_savings_empty.png")} style={{ width: 240, height: 240, objectFit: "contain", flexShrink: 0 }} />
            <div style={{ flex: 1, position: "relative", height: 220 }}>
              <svg width="440" height="220"><line x1="10" y1="40" x2="420" y2="190" stroke={RED} strokeWidth="11" strokeLinecap="round" strokeDasharray={440} strokeDashoffset={440 * (1 - savArrow)} />{savArrow > 0.9 && <path d="M390 168 L424 194 L392 208" fill="none" stroke={RED} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />}</svg>
              <div style={{ position: "absolute", right: 0, top: 150, fontSize: 38, fontWeight: 900, color: RED }}>終わりが<br />見えない</div>
            </div>
          </div>
        </Card>
        <PopIn delay={520} style={{ position: "absolute", left: 80, top: 870, width: 920 }}>
          <Float delay={520} amp={4}><div style={{ fontFamily: FONT, background: A2.ink, borderRadius: 28, padding: "34px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#fff" }}>治療費 ＋ 収入の減少</div>
            <div style={{ fontSize: 60, fontWeight: 900, color: A2.marker, marginTop: 10 }}>“長く続く”のが怖い</div>
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
