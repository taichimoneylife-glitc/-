import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, Img, useCurrentFrame, interpolate } from "remotion";
import { BG2, A2, Head, Mark2, Big, SAFE } from "./components/kit2";
import { Float, CountUp, PopIn, Appear, DrawLine } from "./components/kit";
import { SfxTrack } from "./components/sfx";

// ══════════════════════════════════════════════════════════
//  車リール v2（図解10ページ）＝ 音声 public/car-narration-v2.m4a に同期
//  尺 65.02s / 30fps / 1951f。投資リール(ToushiReel)品質へUP。
//  使用画像は「車で作った s系8枚」＋「車スタイル新規7枚(s_*)」のみ。がん画像は不使用。
//  ページ切替＝上へスライドアウト。カードには必ずイラスト。数字はカウントUP/バー/天秤。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>
);

const SlideTrans: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const IN = 8, OUT = 12;
  const inY = interpolate(f, [0, IN], [48, 0], clamp);
  const inO = interpolate(f, [0, IN], [0, 1], clamp);
  const outY = interpolate(f, [dur - OUT, dur], [0, -100], clamp);
  const outO = interpolate(f, [dur - OUT, dur], [1, 0], clamp);
  return <AbsoluteFill style={{ transform: `translateY(${inY + outY}px)`, opacity: Math.min(inO, outO) }}>{children}</AbsoluteFill>;
};

const img = (f: string) => staticFile(`gen/${f}`);
const Ill: React.FC<{ file: string; size: number; delay: number; left: number; top: number; amp?: number }> = ({ file, size, delay, left, top, amp = 8 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: size, height: size }}>
    <Float delay={delay} amp={amp}><Img src={img(file)} style={{ width: size, height: size, objectFit: "contain" }} /></Float>
  </PopIn>
);

const HeadPlain: React.FC<{ delay: number; title: React.ReactNode; size?: number }> = ({ delay, title, size = 56 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: SAFE.x0, top: SAFE.top + 4, width: SAFE.x1 - SAFE.x0, textAlign: "center" }}>
    <div style={{ fontSize: size, fontWeight: 800, color: A2.ink, letterSpacing: 2, lineHeight: 1.25 }}>{title}</div>
    <div style={{ width: 132, height: 12, borderRadius: 999, background: A2.green, margin: "14px auto 0" }} />
  </PopIn>
);

const Line: React.FC<{ delay: number; top: number; size?: number; children: React.ReactNode }> = ({ delay, top, size = 44, children }) => (
  <Appear delay={delay} style={{ position: "absolute", left: SAFE.x0, top, width: SAFE.x1 - SAFE.x0, textAlign: "center" }}>
    <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.4, color: A2.ink }}>{children}</div>
  </Appear>
);

const Band: React.FC<{ delay: number; top: number; children: React.ReactNode; color?: string; size?: number }> = ({ delay, top, children, color = A2.marker, size = 46 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 90, top, width: 900 }}>
    <Float delay={delay} amp={3}>
      <div style={{ background: color, borderRadius: 24, padding: "24px 22px", textAlign: "center", fontSize: size, fontWeight: 800, lineHeight: 1.35 }}>{children}</div>
    </Float>
  </PopIn>
);

// 中身イラスト付きカード（ハブの先ノード）
const IllCard: React.FC<{ delay: number; left: number; top: number; w: number; file: string; label: React.ReactNode; picked?: boolean; bad?: boolean; imgH?: number }>
  = ({ delay, left, top, w, file, label, picked, bad, imgH = 150 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: w }}>
    <Float delay={delay} amp={4}>
      <div style={{ position: "relative", background: picked ? "#E4F6EC" : bad ? "#FBE7E2" : "#fff", border: `4px solid ${picked ? A2.green : bad ? A2.coral : A2.track}`, borderRadius: 24, boxShadow: "0 12px 26px rgba(80,60,20,0.12)", padding: "16px 0 16px", textAlign: "center" }}>
        <Img src={img(file)} style={{ width: imgH, height: imgH, objectFit: "contain" }} />
        <div style={{ fontSize: 40, fontWeight: 800, color: picked ? A2.green : A2.ink, marginTop: 2 }}>{label}</div>
        {picked ? <div style={{ position: "absolute", top: -18, right: -14, width: 56, height: 56, borderRadius: "50%", background: A2.green, color: "#fff", fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(46,158,107,0.4)" }}>✓</div> : null}
        {bad ? <div style={{ position: "absolute", top: -18, right: -14, width: 56, height: 56, borderRadius: "50%", background: A2.coral, color: "#fff", fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(239,125,87,0.4)" }}>✕</div> : null}
      </div>
    </Float>
  </PopIn>
);

// 数字チップ（カウントUP付き）
const NumChip: React.FC<{ delay: number; left: number; top: number; w: number; cap: string; to: number; prefix?: string; suffix?: string; color?: string; dur?: number }>
  = ({ delay, left, top, w, cap, to, prefix = "", suffix = "", color = A2.ink, dur = 18 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: w }}>
    <Float delay={delay} amp={3}>
      <div style={{ background: "#fff", border: `3px solid ${A2.track}`, borderRadius: 22, boxShadow: "0 8px 18px rgba(80,60,20,0.08)", padding: "16px 0", textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: A2.sub }}>{cap}</div>
        <div style={{ fontSize: 58, fontWeight: 800, color }}>{prefix}<CountUp delay={delay} to={to} dur={dur} />{suffix}</div>
      </div>
    </Float>
  </PopIn>
);

// ── S1 フック：車→現金一括/銀行ローン（0–6.64s / 199f）──
const S1: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "whoosh2", at: 2, volume: 0.36 }, { file: "pop", at: 8, volume: 0.3 }, { file: "thunk", at: 60, volume: 0.28 }, { file: "tap", at: 70, volume: 0.3 }, { file: "coin", at: 95, volume: 0.34 }, { file: "bell", at: 135, volume: 0.36 }]} />
    <Head delay={2} top={250} size={64}>500万円の車、どう<Mark2 delay={18}>買う？</Mark2></Head>
    <Ill file="s1_car.png" size={300} delay={8} left={390} top={380} amp={9} />
    <Svg>
      <DrawLine d="M540 700 L540 760" delay={60} dur={8} color={A2.ink} w={6} />
      <DrawLine d="M270 800 L810 800" delay={66} dur={12} color={A2.ink} w={6} />
      <DrawLine d="M270 800 L270 860 M810 800 L810 860" delay={78} dur={8} color={A2.ink} w={6} />
    </Svg>
    <IllCard delay={70} left={70} top={870} w={420} file="s_cash.png" label="現金一括" bad imgH={150} />
    <IllCard delay={95} left={590} top={870} w={420} file="s_bankloan.png" label="銀行ローン" picked imgH={150} />
    <Band delay={135} top={1340} color={A2.marker} size={48}>結論、僕は<span style={{ color: A2.green }}>あえてローン</span>で買う</Band>
  </BG2>
);

// ── S2 ローンの条件（6.64–12.24s / 168f）──
const S2: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "whoosh2", at: 2, volume: 0.36 }, { file: "pop", at: 8, volume: 0.3 }, { file: "tap", at: 40, volume: 0.3 }, { file: "tap", at: 60, volume: 0.3 }, { file: "tap", at: 80, volume: 0.3 }, { file: "coin", at: 110, volume: 0.36 }]} />
    <HeadPlain delay={2} title="ローンの条件" size={54} />
    <Ill file="s2_wallet.png" size={240} delay={8} left={420} top={380} amp={7} />
    <NumChip delay={40} left={70} top={680} w={285} cap="金利" to={2} suffix="%" color={A2.green} />
    <NumChip delay={60} left={398} top={680} w={285} cap="期間" to={10} suffix="年" color={A2.ink} />
    <NumChip delay={80} left={726} top={680} w={285} cap="車両価格" to={500} suffix="万" color={A2.ink} />
    <Svg><DrawLine d="M540 900 L540 960" delay={104} dur={8} color={A2.coral} w={6} /></Svg>
    <PopIn delay={110} style={{ position: "absolute", left: 160, top: 970, width: 760 }}>
      <Float delay={110} amp={3}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, background: "#FBE7E2", border: `4px solid ${A2.coral}`, borderRadius: 24, padding: "22px 26px" }}>
          <Img src={img("s_interest.png")} style={{ width: 130, height: 130, objectFit: "contain" }} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: A2.sub }}>利息はおよそ</div>
            <div style={{ fontSize: 76, fontWeight: 800, color: A2.coral }}>＋<CountUp delay={110} to={50} dur={18} />万円</div>
          </div>
        </div>
      </Float>
    </PopIn>
  </BG2>
);

// ── S3 総支払い550万 / 損？（12.24–17.76s / 166f）──
const S3: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "whoosh2", at: 2, volume: 0.36 }, { file: "tap", at: 30, volume: 0.3 }, { file: "tap", at: 46, volume: 0.3 }, { file: "thunk", at: 64, volume: 0.3 }, { file: "coin", at: 70, volume: 0.4 }, { file: "pop", at: 108, volume: 0.3 }]} />
    <HeadPlain delay={2} title="総支払い額は？" size={54} />
    {/* 500万 + 50万 = 550万 の足し算図 */}
    <div style={{ position: "absolute", left: 70, top: 470, width: 940, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <PopIn delay={30}><div style={{ background: "#fff", border: `3px solid ${A2.track}`, borderRadius: 20, padding: "20px 24px", textAlign: "center", boxShadow: "0 8px 18px rgba(80,60,20,0.08)" }}><div style={{ fontSize: 28, fontWeight: 800, color: A2.sub }}>車両</div><div style={{ fontSize: 52, fontWeight: 800 }}>500<span style={{ fontSize: 30 }}>万</span></div></div></PopIn>
      <div style={{ fontSize: 54, fontWeight: 800, color: A2.sub }}>＋</div>
      <PopIn delay={46}><div style={{ background: "#FBE7E2", border: `3px solid ${A2.coral}`, borderRadius: 20, padding: "20px 24px", textAlign: "center", boxShadow: "0 8px 18px rgba(80,60,20,0.08)" }}><div style={{ fontSize: 28, fontWeight: 800, color: A2.sub }}>利息</div><div style={{ fontSize: 52, fontWeight: 800, color: A2.coral }}>50<span style={{ fontSize: 30 }}>万</span></div></div></PopIn>
    </div>
    <Svg><DrawLine d="M540 650 L540 720" delay={64} dur={8} color={A2.ink} w={7} /></Svg>
    <PopIn delay={70} style={{ position: "absolute", left: 190, top: 740, width: 700 }}>
      <Float delay={70} amp={4}>
        <div style={{ background: A2.green, borderRadius: 28, padding: "30px 20px", textAlign: "center", boxShadow: "0 14px 30px rgba(46,158,107,0.3)" }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#fff", opacity: 0.9 }}>総支払い額</div>
          <div style={{ fontSize: 96, fontWeight: 800, color: "#fff" }}>約<CountUp delay={70} to={550} dur={22} />万</div>
        </div>
      </Float>
    </PopIn>
    <Band delay={108} top={1120} color="#fff" size={46}>利息の50万円は<span style={{ color: A2.coral }}>損</span>？<br /><span style={{ fontSize: 36, color: A2.sub }}>…と思うかもしれないけど</span></Band>
  </BG2>
);

// ── S4 元手の使い方→運用へ（17.76–23.44s / 170f）──
const S4: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "whoosh2", at: 2, volume: 0.36 }, { file: "pop", at: 10, volume: 0.3 }, { file: "thunk", at: 30, volume: 0.3 }, { file: "whoosh2", at: 60, volume: 0.32 }, { file: "tap", at: 80, volume: 0.32 }, { file: "bell", at: 95, volume: 0.38 }]} />
    <HeadPlain delay={2} title={<>問題は<Mark2 delay={16}>"元手"の使い方</Mark2></>} size={52} />
    <Ill file="s2_wallet.png" size={260} delay={10} left={90} top={520} amp={7} />
    <PopIn delay={30} style={{ position: "absolute", left: 90, top: 790, width: 300, textAlign: "center" }}>
      <div style={{ fontSize: 40, fontWeight: 800 }}>元手<span style={{ color: A2.green }}>500万</span></div>
    </PopIn>
    <Svg>
      <DrawLine d="M400 650 L690 650" delay={60} dur={14} color={A2.green} w={10} />
      <DrawLine d="M660 628 L700 650 L660 672" delay={74} dur={8} color={A2.green} w={10} />
    </Svg>
    <PopIn delay={80} style={{ position: "absolute", left: 650, top: 560, width: 340 }}>
      <Float delay={80} amp={5}>
        <div style={{ background: A2.green, borderRadius: 24, padding: "28px 10px", textAlign: "center", boxShadow: "0 12px 26px rgba(46,158,107,0.3)" }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>運用に<br />回す</div>
        </div>
      </Float>
    </PopIn>
    <Band delay={95} top={1140} color={A2.marker} size={46}>僕なら元手の500万を<span style={{ color: A2.green }}>運用</span>に回す</Band>
  </BG2>
);

// ── S5 株か債券か→債券を選ぶ（23.44–31.92s / 255f）──
const S5: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "whoosh2", at: 2, volume: 0.36 }, { file: "thunk", at: 20, volume: 0.3 }, { file: "tap", at: 40, volume: 0.32 }, { file: "coin", at: 55, volume: 0.34 }, { file: "correct", at: 150, volume: 0.36 }, { file: "bell", at: 195, volume: 0.36 }]} />
    <HeadPlain delay={2} title="何で運用する？" size={54} />
    <Line delay={20} top={400} size={38}><span style={{ color: A2.sub }}>株か、債券か</span></Line>
    <IllCard delay={40} left={70} top={500} w={440} file="s3_stock.png" label="株" imgH={200} />
    <IllCard delay={55} left={570} top={500} w={440} file="s3_bond.png" label="債券" imgH={200} />
    <Svg><DrawLine d="M790 870 L790 930" delay={140} dur={8} color={A2.green} w={7} /></Svg>
    <Band delay={150} top={960} color="#E4F6EC" size={44}>リスクを取りたくないので<br /><span style={{ color: A2.green }}>安定的な「債券」を選ぶ</span></Band>
    <Line delay={195} top={1340} size={40}>数年後にいくらになるか<Mark2 delay={210}>計画できる</Mark2></Line>
  </BG2>
);

// ── S6 子育て世代の備え（31.92–40.12s / 246f）──
const S6: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "whoosh2", at: 2, volume: 0.36 }, { file: "pop", at: 10, volume: 0.3 }, { file: "thunk", at: 60, volume: 0.28 }, { file: "tap", at: 70, volume: 0.3 }, { file: "tap", at: 88, volume: 0.3 }, { file: "tap", at: 106, volume: 0.3 }, { file: "bell", at: 130, volume: 0.38 }]} />
    <Head delay={2} top={250} size={58}>子育て世代こそ<Mark2 delay={20}>計画的に</Mark2></Head>
    <Ill file="s4_family.png" size={300} delay={10} left={390} top={360} amp={7} />
    <Svg>
      <DrawLine d="M540 690 L540 740" delay={60} dur={8} color={A2.ink} w={6} />
      <DrawLine d="M210 780 L870 780" delay={66} dur={14} color={A2.ink} w={6} />
      <DrawLine d="M210 780 L210 840 M540 780 L540 840 M870 780 L870 840" delay={80} dur={8} color={A2.ink} w={6} />
    </Svg>
    <IllCard delay={70} left={60} top={850} w={300} file="s_education.png" label="教育資金" imgH={130} />
    <IllCard delay={88} left={390} top={850} w={300} file="s_elder.png" label="老後資金" imgH={130} />
    <IllCard delay={106} left={720} top={850} w={300} file="s_reserve.png" label="特別費" imgH={130} />
    <Band delay={130} top={1300} color={A2.marker} size={46}>備えを<span style={{ color: A2.green }}>計画的に</span>準備する必要がある</Band>
  </BG2>
);

// ── S7 株(暴落) vs 債券(約束)（40.12–44.96s / 145f）──
const S7: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "whoosh2", at: 2, volume: 0.36 }, { file: "thunk", at: 30, volume: 0.32 }, { file: "coin", at: 60, volume: 0.34 }, { file: "bell", at: 110, volume: 0.38 }]} />
    <HeadPlain delay={2} title="株と債券のちがい" size={52} />
    <PopIn delay={30} style={{ position: "absolute", left: 60, top: 440, width: 960 }}>
      <Float delay={30} amp={4}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#FBE7E2", border: `4px solid ${A2.coral}`, borderRadius: 24, padding: "20px 24px" }}>
          <Img src={img("s3_stock.png")} style={{ width: 180, height: 180, objectFit: "contain" }} />
          <div><div style={{ fontSize: 44, fontWeight: 800 }}>株</div><div style={{ fontSize: 38, fontWeight: 800, color: A2.red, marginTop: 4 }}>暴落のリスクもある</div></div>
        </div>
      </Float>
    </PopIn>
    <PopIn delay={60} style={{ position: "absolute", left: 60, top: 740, width: 960 }}>
      <Float delay={60} amp={4}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#E4F6EC", border: `4px solid ${A2.green}`, borderRadius: 24, padding: "20px 24px" }}>
          <Img src={img("s3_bond.png")} style={{ width: 180, height: 180, objectFit: "contain" }} />
          <div><div style={{ fontSize: 44, fontWeight: 800 }}>債券</div><div style={{ fontSize: 38, fontWeight: 800, color: A2.green, marginTop: 4 }}>原則、約束された資産</div></div>
        </div>
      </Float>
    </PopIn>
    <Band delay={110} top={1120} color={A2.marker} size={46}>債券は<span style={{ color: A2.green }}>計画的</span>に備えられる</Band>
  </BG2>
);

// ── S8 米国債5%（44.96–50.18s / 156f）──
const S8: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "whoosh2", at: 2, volume: 0.36 }, { file: "pop", at: 10, volume: 0.32 }, { file: "coin", at: 44, volume: 0.4 }]} />
    <HeadPlain delay={2} title="いまの米国債は？" size={54} />
    <Ill file="s4_usa.png" size={300} delay={10} left={390} top={360} amp={8} />
    <PopIn delay={44} style={{ position: "absolute", left: 160, top: 760, width: 760 }}>
      <Float delay={44} amp={4}>
        <div style={{ background: A2.green, borderRadius: 28, padding: "32px 20px", textAlign: "center", boxShadow: "0 14px 30px rgba(46,158,107,0.3)" }}>
          <div style={{ fontSize: 38, fontWeight: 800, color: "#fff", opacity: 0.9 }}>金利は約</div>
          <div style={{ fontSize: 150, fontWeight: 800, color: "#fff", lineHeight: 1 }}><CountUp delay={44} to={5} dur={14} />%</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: "#fff" }}>と高水準</div>
        </div>
      </Float>
    </PopIn>
  </BG2>
);

// ── S9 10年後810万 / +260万（50.18–59.36s / 276f）クライマックス──
const S9: React.FC = () => {
  const f = useCurrentFrame();
  const base = 1120, maxH = 560;
  const h550 = interpolate(f, [60, 120], [0, maxH * 550 / 810], clamp);
  const h810 = interpolate(f, [120, 190], [0, maxH], clamp);
  return (
    <BG2>
      <SfxTrack cues={[{ file: "whoosh2", at: 2, volume: 0.36 }, { file: "pop", at: 10, volume: 0.3 }, { file: "thunk", at: 60, volume: 0.3 }, { file: "bell", at: 120, volume: 0.32 }, { file: "coin", at: 180, volume: 0.38 }, { file: "correct", at: 210, volume: 0.42 }]} />
      <HeadPlain delay={2} title="10年後、どうなる？" size={54} />
      <Ill file="s5_growth.png" size={170} delay={10} left={455} top={330} amp={6} />
      {/* バー比較 */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
        {[
          { cx: 340, h: h550, col: A2.sub, cap: "車の総支払い", val: 550, d: 90, prefix: "" },
          { cx: 740, h: h810, col: A2.green, cap: "10年後の運用", val: 810, d: 150, prefix: "約" },
        ].map((b) => (
          <div key={b.cap}>
            <div style={{ position: "absolute", left: b.cx - 110, top: base - b.h, width: 220, height: b.h, background: b.col, borderRadius: "16px 16px 0 0", boxShadow: "0 -4px 0 rgba(0,0,0,0.05) inset" }} />
            <PopIn delay={b.d + 30} style={{ position: "absolute", left: b.cx - 180, top: base - b.h - 76, width: 360, textAlign: "center" }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: b.col }}>{b.prefix}<CountUp delay={b.d + 30} to={b.val} dur={20} />万</div>
            </PopIn>
            <div style={{ position: "absolute", left: b.cx - 180, top: base + 14, width: 360, textAlign: "center", fontSize: 32, fontWeight: 800 }}>{b.cap}</div>
          </div>
        ))}
      </div>
      <Band delay={210} top={1270} color={A2.marker} size={50}>差し引いても <Big delay={214} to={260} prefix="＋" suffix="万" size={64} color={A2.red} dur={18} />のプラス</Band>
    </BG2>
  );
};

// ── S10 天秤→結論（59.36–65.02s / 170f）──
const S10: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "whoosh2", at: 2, volume: 0.36 }, { file: "pop", at: 10, volume: 0.3 }, { file: "tap", at: 24, volume: 0.3 }, { file: "coin", at: 44, volume: 0.34 }, { file: "bell", at: 95, volume: 0.38 }, { file: "finish", at: 120, volume: 0.46 }]} />
    <HeadPlain delay={2} title="どっちが大きい？" size={54} />
    <Ill file="s_scale.png" size={240} delay={10} left={420} top={360} amp={6} />
    <div style={{ position: "absolute", left: 60, top: 640, width: 960, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <PopIn delay={24}><div style={{ background: "#FBE7E2", border: `3px solid ${A2.coral}`, borderRadius: 22, padding: "20px 26px", textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 800, color: A2.sub }}>利息</div><div style={{ fontSize: 52, fontWeight: 800, color: A2.coral }}>−50万</div></div></PopIn>
      <div style={{ fontSize: 48, fontWeight: 800, color: A2.sub }}>&lt;</div>
      <PopIn delay={44}><div style={{ background: "#E4F6EC", border: `3px solid ${A2.green}`, borderRadius: 22, padding: "20px 26px", textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 800, color: A2.sub }}>運用益</div><div style={{ fontSize: 52, fontWeight: 800, color: A2.green }}>＋260万</div></div></PopIn>
    </div>
    <Ill file="s5_trophy.png" size={210} delay={95} left={435} top={930} amp={7} />
    <Band delay={120} top={1240} color={A2.green} size={52}><span style={{ color: "#fff" }}>長期で見れば<br />トータルで"得"</span></Band>
  </BG2>
);

const SCENES: { c: React.FC; from: number; dur: number }[] = [
  { c: S1, from: 0, dur: 181 },
  { c: S2, from: 181, dur: 151 },
  { c: S3, from: 332, dur: 152 },
  { c: S4, from: 484, dur: 154 },
  { c: S5, from: 638, dur: 233 },
  { c: S6, from: 871, dur: 175 },
  { c: S7, from: 1046, dur: 180 },
  { c: S8, from: 1226, dur: 97 },
  { c: S9, from: 1323, dur: 252 },
  { c: S10, from: 1575, dur: 206 },
];

export const CAR_V5_FRAMES = 1781; // 59.35s @30fps（倍速・録り直しv3）

export const CarReelV5: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg }}>
    <Audio src={staticFile("car-narration-v3.m4a")} />
    {SCENES.map(({ c: C, from, dur }, i) => (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <SlideTrans dur={dur}><C /></SlideTrans>
      </Sequence>
    ))}
  </AbsoluteFill>
);
