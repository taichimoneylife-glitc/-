import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, Img, useCurrentFrame, interpolate } from "remotion";
import { BG2, A2, Head, Mark2, Big, SAFE } from "./components/kit2";
import { SceneFade, Float, CountUp, PopIn, Appear, DrawLine } from "./components/kit";
import { SfxTrack } from "./components/sfx";

// ══════════════════════════════════════════════════════════
//  投資の三大原則リール（図解9ページ）＝ 音声 public/toushi-narration.m4a に同期
//  尺 109.67s / 30fps。各ページの from/dur は文字起こしのタイムスタンプ準拠。
//  番号(丸数字)は原則ページ(長期=1/積立=2/分散=3)のみ。他は番号なしの整った見出し。
//  イラストは public/gen/p*.png（透過済み）。効果音は出現ごと・控えめ音量・多彩。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>
);

// 透過イラスト（登場pop＋常時ふわふわ）
const Ill: React.FC<{ file: string; size: number; delay: number; left: number; top: number; amp?: number }> = ({ file, size, delay, left, top, amp = 8 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: size, height: size }}>
    <Float delay={delay} amp={amp}>
      <Img src={staticFile(`gen/${file}`)} style={{ width: size, height: size, objectFit: "contain" }} />
    </Float>
  </PopIn>
);

// 見出し（番号あり＝原則ページ）
const HeadNum: React.FC<{ delay: number; no: string; title: string }> = ({ delay, no, title }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: SAFE.x0, top: SAFE.top, width: SAFE.x1 - SAFE.x0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 20, background: A2.green, borderRadius: 999, padding: "14px 22px", boxShadow: "0 12px 26px rgba(46,158,107,0.28)" }}>
      <div style={{ width: 66, height: 66, borderRadius: "50%", background: "#fff", color: A2.green, fontWeight: 800, fontSize: 42, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{no}</div>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 54, letterSpacing: 2 }}>{title}</div>
    </div>
  </PopIn>
);

// 見出し（番号なし＝整ったセクション見出し：中央・下線アクセント）
const HeadPlain: React.FC<{ delay: number; title: string; size?: number }> = ({ delay, title, size = 56 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: SAFE.x0, top: SAFE.top + 4, width: SAFE.x1 - SAFE.x0, textAlign: "center" }}>
    <div style={{ fontSize: size, fontWeight: 800, color: A2.ink, letterSpacing: 2 }}>{title}</div>
    <div style={{ width: 132, height: 12, borderRadius: 999, background: A2.green, margin: "14px auto 0" }} />
  </PopIn>
);

const Line: React.FC<{ delay: number; top: number; size?: number; children: React.ReactNode }> = ({ delay, top, size = 46, children }) => (
  <Appear delay={delay} style={{ position: "absolute", left: SAFE.x0, top, width: SAFE.x1 - SAFE.x0, textAlign: "center" }}>
    <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.4, color: A2.ink }}>{children}</div>
  </Appear>
);

const StatementCard: React.FC<{ delay: number; top: number; children: React.ReactNode }> = ({ delay, top, children }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 70, top, width: 940 }}>
    <Float delay={delay} amp={4}>
      <div style={{ background: "#fff", borderRadius: 26, boxShadow: "0 12px 30px rgba(80,60,20,0.1)", padding: "34px 30px", textAlign: "center", fontSize: 48, fontWeight: 800, lineHeight: 1.45 }}>{children}</div>
    </Float>
  </PopIn>
);

const Band: React.FC<{ delay: number; top: number; children: React.ReactNode; color?: string; size?: number }> = ({ delay, top, children, color = A2.marker, size = 44 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 120, top, width: 840 }}>
    <Float delay={delay} amp={3}>
      <div style={{ background: color, borderRadius: 22, padding: "22px 20px", textAlign: "center", fontSize: size, fontWeight: 800, lineHeight: 1.35 }}>{children}</div>
    </Float>
  </PopIn>
);

// ── P1 全体像（0–7.3s / 220f）─────────────
const P1: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "swipe", at: 2, volume: 0.13 }, { file: "pop", at: 6, volume: 0.11 }, { file: "up6", at: 12, volume: 0.11 }, { file: "up2", at: 22, volume: 0.11 }, { file: "up3", at: 32, volume: 0.09 }, { file: "up1", at: 95, volume: 0.14 }]} />
    <Head delay={2} top={250} size={70}>投資の<Mark2 delay={16}>三大原則</Mark2></Head>
    <Ill file="p1_hero.png" size={230} delay={6} left={425} top={370} amp={9} />
    <Svg>
      <DrawLine d="M250 640 L830 640" delay={14} dur={12} color={A2.ink} w={6} />
      <DrawLine d="M250 640 L250 700 M540 620 L540 700 M830 640 L830 700" delay={22} dur={8} color={A2.ink} w={6} />
    </Svg>
    {[
      { d: 12, name: "長期", cx: 250, f: "p1_longterm.png" },
      { d: 22, name: "積立", cx: 540, f: "p1_tsumitate.png" },
      { d: 32, name: "分散", cx: 830, f: "p1_bunsan.png" },
    ].map((n) => (
      <PopIn key={n.name} delay={n.d} style={{ position: "absolute", left: n.cx - 150, top: 710, width: 300 }}>
        <Float delay={n.d} amp={4}>
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 10px 24px rgba(80,60,20,0.12)", padding: "14px 0 18px", textAlign: "center" }}>
            <Img src={staticFile(`gen/${n.f}`)} style={{ width: 190, height: 190, objectFit: "contain" }} />
            <div style={{ fontSize: 44, fontWeight: 800 }}>{n.name}<span style={{ fontSize: 28, color: A2.sub }}>投資</span></div>
          </div>
        </Float>
      </PopIn>
    ))}
    <Band delay={95} top={1140} color={A2.marker} size={48}>リスクを抑えながら<br />安定したリターンが期待できる</Band>
  </BG2>
);

// ── P2 長期投資 導入（7.3–11.8s / 133f）────
const P2: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.16 }, { file: "pop", at: 8, volume: 0.13 }, { file: "up6", at: 30, volume: 0.13 }, { file: "count", at: 44, volume: 0.09 }, { file: "swipe", at: 95, volume: 0.09 }]} />
    <HeadNum delay={2} no="1" title="長期投資" />
    <Ill file="p2_tree_grow.png" size={420} delay={8} left={330} top={390} />
    <StatementCard delay={30} top={900}>
      運用期間が<Mark2 delay={44}>長期</Mark2>になるほど<br /><Mark2 delay={60} color="#CDEBD9">元本割れの可能性が低くなる</Mark2>
    </StatementCard>
    <Line delay={95} top={1330} size={36}><span style={{ color: A2.sub }}>…と言われています</span></Line>
  </BG2>
);

// ── P3 運用期間別リターン（11.8–24.1s / 371f）──
const P3: React.FC = () => {
  const rows = [
    { d: 90, y: 470, term: "1年", tot: 27, lose: 9 },
    { d: 112, y: 620, term: "5年", tot: 23, lose: 7 },
    { d: 134, y: 770, term: "10年", tot: 18, lose: 4 },
    { d: 168, y: 920, term: "15年", tot: 13, lose: 0 },
    { d: 200, y: 1070, term: "20年", tot: 8, lose: 0 },
  ];
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.16 }, { file: "swipe", at: 10, volume: 0.09 }, { file: "up3", at: 90, volume: 0.11 }, { file: "up4", at: 112, volume: 0.11 }, { file: "up6", at: 134, volume: 0.11 }, { file: "up1", at: 168, volume: 0.16 }, { file: "up1", at: 200, volume: 0.16 }, { file: "up2", at: 245, volume: 0.14 }]} />
      <HeadPlain delay={2} title="運用期間別リターン" size={52} />
      <Line delay={10} top={400} size={31}><span style={{ color: A2.sub }}>外国株式に100万円を投資 ／ 元本を割った回数</span></Line>
      {rows.map((r) => {
        const zero = r.lose === 0;
        return (
          <PopIn key={r.term} delay={r.d} style={{ position: "absolute", left: 60, top: r.y, width: 960 }}>
            <Float delay={r.d} amp={3}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, background: zero ? "#E4F6EC" : "#fff", border: `3px solid ${zero ? A2.green : A2.track}`, borderRadius: 20, padding: "16px 26px", boxShadow: "0 8px 18px rgba(80,60,20,0.08)" }}>
                <div style={{ width: 150, fontSize: 46, fontWeight: 800, color: zero ? A2.green : A2.ink }}>{r.term}</div>
                <div style={{ flex: 1, fontSize: 40, fontWeight: 700, color: A2.sub }}>{r.tot}回中</div>
                <div style={{ fontSize: 64, fontWeight: 800, color: zero ? A2.green : A2.coral }}>{r.lose}<span style={{ fontSize: 34 }}>回</span></div>
                {zero ? <div style={{ background: A2.green, color: "#fff", fontSize: 28, fontWeight: 800, padding: "6px 14px", borderRadius: 12 }}>割れなし</div> : null}
              </div>
            </Float>
          </PopIn>
        );
      })}
      {/* 減少を示す下向き矢印（描画） */}
      <Svg>
        <DrawLine d="M1000 500 L1000 1130" delay={150} dur={40} color={A2.green} w={7} />
        <DrawLine d="M982 1108 L1000 1140 L1018 1108" delay={195} dur={8} color={A2.green} w={7} />
      </Svg>
      <PopIn delay={245} style={{ position: "absolute", left: 70, top: 1270, width: 940 }}>
        <Float delay={245} amp={3}>
          <div style={{ background: A2.marker, borderRadius: 22, padding: "22px 20px", textAlign: "center", fontSize: 40, fontWeight: 800 }}>長く持つほど、割れる可能性はぐっと下がる</div>
        </Float>
      </PopIn>
    </BG2>
  );
};

// ── P4 複利（24.1–45.7s / 646f）────────────
const P4: React.FC = () => {
  const f = useCurrentFrame();
  const base = 420;
  const h30 = interpolate(f, [240, 300], [0, 340], clamp);
  const h40 = interpolate(f, [340, 400], [0, 178], clamp);
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.16 }, { file: "pop", at: 10, volume: 0.13 }, { file: "count", at: 105, volume: 0.09 }, { file: "up6", at: 150, volume: 0.11 }, { file: "swipe", at: 228, volume: 0.09 }, { file: "pop", at: 235, volume: 0.13 }, { file: "correct", at: 270, volume: 0.13 }, { file: "pop", at: 340, volume: 0.11 }, { file: "correct", at: 370, volume: 0.13 }, { file: "up1", at: 468, volume: 0.18 }, { file: "up2", at: 561, volume: 0.13 }]} />
      <HeadPlain delay={2} title="複利の効果" size={54} />
      <Ill file="p4_snowball.png" size={200} delay={10} left={70} top={360} />
      <Appear delay={95} style={{ position: "absolute", left: 300, top: 400, width: 710 }}>
        <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.4 }}>複利＝<Mark2 delay={110}>利息が利息を生む</Mark2><div style={{ fontSize: 30, color: A2.sub, marginTop: 8 }}>毎月3万円・年利5％で積立</div></div>
      </Appear>
      <Ill file="p4_coins_grow.png" size={150} delay={150} left={470} top={560} amp={6} />
      <Ill file="p4_person30.png" size={190} delay={235} left={30} top={760} />
      <Ill file="p4_person40.png" size={175} delay={340} left={870} top={800} />
      <div style={{ position: "absolute", left: 0, top: 620, width: 1080, height: 480 }}>
        {[
          { cx: 380, h: h30, col: A2.green, cap: "30歳スタート", val: 3400, d: 250 },
          { cx: 700, h: h40, col: A2.sub, cap: "40歳スタート", val: 1780, d: 350 },
        ].map((b) => (
          <div key={b.cap}>
            <div style={{ position: "absolute", left: b.cx - 100, top: base - b.h, width: 200, height: b.h, background: b.col, borderRadius: "14px 14px 0 0" }} />
            <PopIn delay={b.d + 20} style={{ position: "absolute", left: b.cx - 170, top: base - b.h - 66, width: 340, textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: b.col }}>約<CountUp delay={b.d + 20} to={b.val} dur={20} />万</div>
            </PopIn>
            <div style={{ position: "absolute", left: b.cx - 170, top: base + 14, width: 340, textAlign: "center", fontSize: 32, fontWeight: 800 }}>{b.cap}</div>
          </div>
        ))}
      </div>
      <Band delay={468} top={1160} size={44}>10年の差が <Big delay={470} to={1600} prefix="約" suffix="万" size={58} color={A2.red} dur={18} />の差</Band>
      <Line delay={561} top={1350} size={44}>だから<Mark2 delay={575}>早く始めることが重要</Mark2></Line>
    </BG2>
  );
};

// ── P5 積立投資 導入（45.7–51.9s / 186f）───
const P5: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.16 }, { file: "pop", at: 8, volume: 0.13 }, { file: "up6", at: 40, volume: 0.13 }, { file: "up4", at: 100, volume: 0.11 }]} />
    <HeadNum delay={2} no="2" title="積立投資" />
    <Ill file="p5_piggy.png" size={380} delay={8} left={350} top={400} />
    <StatementCard delay={40} top={880}>
      一定の金額で買い続けることで<br /><Mark2 delay={58}>価格変動に一喜一憂せず</Mark2>続けられる
    </StatementCard>
    <PopIn delay={100} style={{ position: "absolute", left: 260, top: 1160, width: 560 }}>
      <Float delay={100} amp={5}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <Img src={staticFile("gen/p5_calendar_coin.png")} style={{ width: 200, height: 200, objectFit: "contain" }} />
          <div style={{ fontSize: 40, fontWeight: 800, color: A2.green, lineHeight: 1.3 }}>毎月コツコツ<br />少額でOK</div>
        </div>
      </Float>
    </PopIn>
  </BG2>
);

// ── P6 ドルコスト（51.9–68.0s / 483f）──────
const P6: React.FC = () => {
  const cols = [
    { price: 250, qty: 120 }, { price: 400, qty: 75 }, { price: 250, qty: 120 },
    { price: 200, qty: 150 }, { price: 150, qty: 200 },
  ];
  const pts = [
    { f: "p6_calm.png", t: "タイミングを気にしなくていい" },
    { f: "p6_scale.png", t: "購入価格を平準化できる" },
    { f: "p5_calendar_coin.png", t: "少額から始められる" },
  ];
  const cardTop = 400, cardH = 320, baseY = 262;
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.16 }, { file: "up3", at: 30, volume: 0.09 }, { file: "up4", at: 36, volume: 0.09 }, { file: "up6", at: 42, volume: 0.09 }, { file: "up2", at: 48, volume: 0.09 }, { file: "up1", at: 54, volume: 0.11 }, { file: "swipe", at: 90, volume: 0.11 }, { file: "up6", at: 205, volume: 0.13 }, { file: "count", at: 255, volume: 0.09 }, { file: "pop", at: 320, volume: 0.13 }, { file: "up2", at: 380, volume: 0.13 }, { file: "up1", at: 430, volume: 0.14 }]} />
      <HeadPlain delay={2} title="ドル・コスト平均法" size={50} />
      <div style={{ position: "absolute", left: 70, top: cardTop, width: 940, height: cardH, background: "#fff", borderRadius: 22, boxShadow: "0 10px 24px rgba(80,60,20,0.08)" }}>
        {cols.map((c, i) => {
          const cx = 94 + i * 190, barW = 118, h = c.qty;
          const high = c.price >= 300;
          return (
            <PopIn key={i} delay={30 + i * 6} style={{ position: "absolute", left: cx - barW / 2, top: 0, width: barW }}>
              <div style={{ position: "absolute", left: 0, top: baseY - h - 40, width: barW, textAlign: "center", fontSize: 28, fontWeight: 800, color: high ? A2.coral : A2.green }}>{c.price}円</div>
              <div style={{ position: "absolute", left: 9, top: baseY - h, width: barW - 18, height: h, background: A2.marker, border: "2px solid #E6C63E", borderRadius: "8px 8px 0 0" }} />
              <div style={{ position: "absolute", left: 0, top: baseY + 6, width: barW, textAlign: "center", fontSize: 24, fontWeight: 800, color: A2.sub }}>{c.qty}口</div>
            </PopIn>
          );
        })}
      </div>
      <Line delay={90} top={760} size={38}>高い時は<span style={{ color: A2.coral }}>少なく</span>／安い時は<span style={{ color: A2.green }}>多く</span>買う</Line>
      {/* 毎月コツコツ買うイメージ＋平準化 */}
      <PopIn delay={205} style={{ position: "absolute", left: 90, top: 850, width: 900 }}>
        <Float delay={205} amp={4}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, background: A2.marker, borderRadius: 22, padding: "14px 26px" }}>
            <Img src={staticFile("gen/p6_wave_buy.png")} style={{ width: 130, height: 130, objectFit: "contain" }} />
            <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.3 }}>毎月コツコツ買うと<br /><span style={{ color: A2.green }}>購入価格が平準化</span></div>
          </div>
        </Float>
      </PopIn>
      <Line delay={255} top={1030} size={34}><span style={{ color: A2.sub }}>積立のメリット</span></Line>
      {pts.map((p, i) => (
        <PopIn key={i} delay={320 + i * 55} style={{ position: "absolute", left: 90, top: 1100 + i * 118, width: 900 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: `3px solid ${A2.green}`, borderRadius: 18, padding: "10px 22px", boxShadow: "0 6px 16px rgba(80,60,20,0.08)" }}>
            <Img src={staticFile(`gen/${p.f}`)} style={{ width: 80, height: 80, objectFit: "contain" }} />
            <div style={{ fontSize: 38, fontWeight: 800 }}>{p.t}</div>
          </div>
        </PopIn>
      ))}
    </BG2>
  );
};

// ── P7 分散投資 導入（68.0–71.6s / 108f）───
const P7: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.16 }, { file: "pop", at: 8, volume: 0.13 }, { file: "up6", at: 16, volume: 0.13 }, { file: "up2", at: 34, volume: 0.13 }]} />
    <HeadNum delay={2} no="3" title="分散投資" />
    {[
      { d: 8, f: "p7_assets_mix.png", n: "資産の分散", cx: 300 },
      { d: 16, f: "p7_world.png", n: "地域の分散", cx: 780 },
    ].map((c) => (
      <PopIn key={c.n} delay={c.d} style={{ position: "absolute", left: c.cx - 150, top: 430, width: 300 }}>
        <Float delay={c.d} amp={7}>
          <Img src={staticFile(`gen/${c.f}`)} style={{ width: 300, height: 300, objectFit: "contain" }} />
        </Float>
        <div style={{ textAlign: "center", fontSize: 38, fontWeight: 800, marginTop: 6 }}>{c.n}</div>
      </PopIn>
    ))}
    <StatementCard delay={34} top={880}>
      資産や地域を分散させることで<br /><Mark2 delay={50}>リスクの軽減</Mark2>が期待できる
    </StatementCard>
  </BG2>
);

// ── P8 卵は一つのカゴに盛るな（71.6–87.2s / 469f）──
const P8: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.16 }, { file: "up3", at: 60, volume: 0.13 }, { file: "up6", at: 150, volume: 0.13 }, { file: "up1", at: 300, volume: 0.16 }]} />
    <HeadPlain delay={2} title="卵は一つのカゴに盛るな" size={46} />
    <PopIn delay={60} style={{ position: "absolute", left: 60, top: 430, width: 960 }}>
      <Float delay={60} amp={5}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#FBE7E2", border: `3px solid ${A2.coral}`, borderRadius: 22, padding: "18px 24px" }}>
          <Img src={staticFile("gen/p8_eggs_one.png")} style={{ width: 220, height: 220, objectFit: "contain" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 40, fontWeight: 800 }}>一つのカゴに全部</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: A2.red, marginTop: 6 }}>落ちたら全部割れる</div>
          </div>
        </div>
      </Float>
    </PopIn>
    <PopIn delay={150} style={{ position: "absolute", left: 60, top: 760, width: 960 }}>
      <Float delay={150} amp={5}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#E4F6EC", border: `3px solid ${A2.green}`, borderRadius: 22, padding: "18px 24px" }}>
          <Img src={staticFile("gen/p8_eggs_split.png")} style={{ width: 260, height: 220, objectFit: "contain" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 40, fontWeight: 800 }}>複数のカゴに分ける</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: A2.green, marginTop: 6 }}>一つ落ちても他は無事</div>
          </div>
        </div>
      </Float>
    </PopIn>
    <Band delay={300} top={1160} size={46}>投資も同じ。<span style={{ color: A2.ink }}>いろいろな所に分ける</span></Band>
  </BG2>
);

// ── P9 資産と地域の分散（87.2–109.4s / 674f）──
const P9: React.FC = () => {
  const stocks = ["全世界株式", "全米株式", "その他の株式"];
  const assets = [
    { f: "p9_cash.png", n: "現金" }, { f: "p9_stock.png", n: "株" },
    { f: "p9_bond.png", n: "債券" }, { f: "p9_gold.png", n: "ゴールド" },
  ];
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up5", at: 2, volume: 0.16 }, { file: "swipe", at: 10, volume: 0.09 }, { file: "up3", at: 90, volume: 0.11 }, { file: "up4", at: 104, volume: 0.11 }, { file: "up6", at: 118, volume: 0.11 }, { file: "up7", at: 175, volume: 0.11 }, { file: "up2", at: 200, volume: 0.13 }, { file: "count", at: 250, volume: 0.09 }, { file: "up4", at: 262, volume: 0.11 }, { file: "up6", at: 278, volume: 0.11 }, { file: "up1", at: 294, volume: 0.11 }, { file: "up3", at: 310, volume: 0.11 }, { file: "finish", at: 340, volume: 0.18 }]} />
      <HeadPlain delay={2} title="本当の“資産の分散”" size={50} />
      <Line delay={10} top={400} size={37}>株の中だけで分散していませんか？</Line>
      <PopIn delay={90} style={{ position: "absolute", left: 90, top: 480, width: 900 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
          {stocks.map((s, i) => (
            <PopIn key={s} delay={90 + i * 14}>
              <div style={{ background: A2.coral, color: "#fff", fontWeight: 800, fontSize: 36, padding: "12px 26px", borderRadius: 14, boxShadow: "0 6px 16px rgba(80,60,20,0.16)" }}>{s}</div>
            </PopIn>
          ))}
        </div>
      </PopIn>
      <Ill file="p9_stock_crash.png" size={150} delay={175} left={70} top={620} amp={4} />
      <PopIn delay={200} style={{ position: "absolute", left: 230, top: 640, width: 760 }}>
        <Float delay={200} amp={4}>
          <div style={{ background: "#FBE7E2", border: `3px solid ${A2.red}`, borderRadius: 18, padding: "18px 20px", textAlign: "center", fontSize: 38, fontWeight: 800, color: A2.red }}>“株だけ”の分散は<br />落ちる時は一気に落ちる</div>
        </Float>
      </PopIn>
      <Svg><DrawLine d="M540 800 L540 860" delay={236} dur={10} color={A2.green} w={7} /></Svg>
      <Line delay={244} top={876} size={40}>本当の分散は<Mark2 delay={258}>異なる資産の組み合わせ</Mark2></Line>
      <div style={{ position: "absolute", left: 0, top: 970, width: 1080, display: "flex", justifyContent: "center", gap: 20 }}>
        {assets.map((a, i) => (
          <PopIn key={a.n} delay={262 + i * 16}>
            <Float delay={262 + i * 16} amp={4}>
              <div style={{ width: 210, background: "#fff", border: `3px solid ${A2.green}`, borderRadius: 20, padding: "14px 0 14px", textAlign: "center", boxShadow: "0 8px 18px rgba(80,60,20,0.1)" }}>
                <Img src={staticFile(`gen/${a.f}`)} style={{ width: 130, height: 130, objectFit: "contain" }} />
                <div style={{ fontSize: 34, fontWeight: 800 }}>{a.n}</div>
              </div>
            </Float>
          </PopIn>
        ))}
      </div>
      <Band delay={330} top={1310} size={42}>値動きの違う資産でリスクが下がる</Band>
    </BG2>
  );
};

const SCENES: { c: React.FC; from: number; dur: number }[] = [
  { c: P1, from: 0, dur: 220 },
  { c: P2, from: 220, dur: 133 },
  { c: P3, from: 353, dur: 371 },
  { c: P4, from: 724, dur: 646 },
  { c: P5, from: 1370, dur: 186 },
  { c: P6, from: 1556, dur: 483 },
  { c: P7, from: 2039, dur: 108 },
  { c: P8, from: 2147, dur: 469 },
  { c: P9, from: 2616, dur: 674 },
];

export const TOUSHI_FRAMES = 3290; // 109.67s @30fps

export const ToushiReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg }}>
    <Audio src={staticFile("toushi-narration.m4a")} />
    {SCENES.map(({ c: C, from, dur }, i) => (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <SceneFade dur={dur}><C /></SceneFade>
      </Sequence>
    ))}
  </AbsoluteFill>
);
