import React from "react";
import { AbsoluteFill, Sequence, staticFile, Img, useCurrentFrame, interpolate } from "remotion";
import { BG2, A2, Head, Mark2, Big, SAFE } from "./components/kit2";
import { SceneFade, Float, CountUp, PopIn, Appear, DrawLine } from "./components/kit";
import { SfxTrack } from "./components/sfx";

// ══════════════════════════════════════════════════════════
//  投資の三大原則リール（図解パート・全9ページ）
//  ルール：どのページもセーフエリア(x48–1032 / y250–1500)を上下いっぱいに充填。
//  ヘッダー帯（上）＋主図解（中央・大）＋イラスト/補足（下まで）の3層を必ず持たせる。
//  文言は確定台本(script_toushi3.md)のまま。イラストは public/gen/*.png（届き次第 IllSlot→Ill 差替）。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>
);

// 透過イラスト（実画像）
const Ill: React.FC<{ file: string; size: number; delay: number; left: number; top: number; amp?: number }> = ({ file, size, delay, left, top, amp = 7 }) => (
  <Float delay={delay} amp={amp} style={{ position: "absolute", left, top, width: size, height: size }}>
    <Img src={staticFile(`gen/${file}`)} style={{ width: size, height: size, objectFit: "contain" }} />
  </Float>
);

// イラスト枠プレースホルダ（画像が来るまで“ここに絵が入る”を見せて埋める）
const IllSlot: React.FC<{ emoji: string; file: string; size: number; delay: number; left: number; top: number }> = ({ emoji, file, size, delay, left, top }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: size }}>
    <Float delay={delay} amp={6}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: "#fff", boxShadow: "0 12px 30px rgba(80,60,20,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.5 }}>{emoji}</div>
    </Float>
    {file ? <div style={{ textAlign: "center", fontSize: 20, color: A2.sub, marginTop: 8, opacity: 0.6 }}>{file}</div> : null}
  </PopIn>
);

// ヘッダー帯（番号タブ＋見出し）
const HeadBar: React.FC<{ delay: number; no?: string; title: string }> = ({ delay, no, title }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: SAFE.x0, top: SAFE.top, width: SAFE.x1 - SAFE.x0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, background: A2.green, borderRadius: 20, padding: "16px 26px", boxShadow: "0 10px 24px rgba(46,158,107,0.25)" }}>
      {no ? <div style={{ width: 62, height: 62, borderRadius: "50%", background: "#fff", color: A2.green, fontWeight: 800, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{no}</div> : null}
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 52, letterSpacing: 1 }}>{title}</div>
    </div>
  </PopIn>
);

const Line: React.FC<{ delay: number; top: number; size?: number; children: React.ReactNode }> = ({ delay, top, size = 46, children }) => (
  <Appear delay={delay} style={{ position: "absolute", left: SAFE.x0, top, width: SAFE.x1 - SAFE.x0, textAlign: "center" }}>
    <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.4, color: A2.ink }}>{children}</div>
  </Appear>
);

const StatementCard: React.FC<{ delay: number; top: number; children: React.ReactNode }> = ({ delay, top, children }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 70, top, width: 940 }}>
    <div style={{ background: "#fff", borderRadius: 26, boxShadow: "0 12px 30px rgba(80,60,20,0.1)", padding: "34px 30px", textAlign: "center", fontSize: 48, fontWeight: 800, lineHeight: 1.45 }}>{children}</div>
  </PopIn>
);

const Band: React.FC<{ delay: number; top: number; children: React.ReactNode; color?: string; size?: number }> = ({ delay, top, children, color = A2.marker, size = 44 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 120, top, width: 840 }}>
    <div style={{ background: color, borderRadius: 22, padding: "22px 20px", textAlign: "center", fontSize: size, fontWeight: 800, lineHeight: 1.35 }}>{children}</div>
  </PopIn>
);

// ── P1 全体像 ─────────────────────────────
const P1: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up7", at: 6, volume: 0.1 }, { file: "up3", at: 40, volume: 0.12 }, { file: "up6", at: 55, volume: 0.12 }, { file: "up10", at: 70, volume: 0.12 }]} />
    <Head delay={4} top={250} size={72}>投資の<Mark2 delay={20}>三大原則</Mark2></Head>
    <Line delay={22} top={410} size={40}>この3つを意識するだけで</Line>
    <Svg>
      <DrawLine d="M540 480 L540 560" delay={30} dur={8} color={A2.ink} w={6} />
      <DrawLine d="M250 560 L830 560" delay={36} dur={12} color={A2.ink} w={6} />
      <DrawLine d="M250 560 L250 640 M540 560 L540 640 M830 560 L830 640" delay={46} dur={8} color={A2.ink} w={6} />
    </Svg>
    {[
      { d: 40, name: "長期", cx: 250, e: "🌳" },
      { d: 55, name: "積立", cx: 540, e: "🐖" },
      { d: 70, name: "分散", cx: 830, e: "🧺" },
    ].map((n) => (
      <PopIn key={n.name} delay={n.d} style={{ position: "absolute", left: n.cx - 150, top: 650, width: 300 }}>
        <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 10px 24px rgba(80,60,20,0.12)", padding: "26px 0", textAlign: "center" }}>
          <div style={{ fontSize: 100 }}>{n.e}</div>
          <div style={{ fontSize: 46, fontWeight: 800, marginTop: 8 }}>{n.name}<span style={{ fontSize: 30, color: A2.sub }}>投資</span></div>
        </div>
      </PopIn>
    ))}
    <Band delay={92} top={1070} color={A2.marker} size={50}>リスクを抑えながら<br />安定したリターンが期待できる</Band>
    <Line delay={112} top={1360} size={40}><span style={{ color: A2.sub }}>まずは1つずつ見ていきましょう</span></Line>
  </BG2>
);

// ── P2 長期投資（導入）─────────────────────
const P2: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up2", at: 6, volume: 0.1 }, { file: "up3", at: 30, volume: 0.12 }, { file: "up6", at: 60, volume: 0.12 }]} />
    <HeadBar delay={4} no="1" title="長期投資" />
    <IllSlot emoji="🌳" file="t1_tree.png" size={380} delay={16} left={350} top={400} />
    <StatementCard delay={40} top={860}>
      運用期間が<Mark2 delay={54}>長期</Mark2>になるほど<br /><Mark2 delay={70} color="#CDEBD9">元本割れの可能性が低くなる</Mark2>
    </StatementCard>
    {/* 下部：短期↔長期の対比で埋める */}
    <PopIn delay={90} style={{ position: "absolute", left: 70, top: 1140, width: 940 }}>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1, background: "#FBE7E2", border: `3px solid ${A2.coral}`, borderRadius: 20, padding: "24px 10px", textAlign: "center" }}>
          <div style={{ fontSize: 60 }}>📉</div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>短期</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: A2.coral }}>値動きが大きい</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 50, color: A2.sub }}>→</div>
        <div style={{ flex: 1, background: "#E4F6EC", border: `3px solid ${A2.green}`, borderRadius: 20, padding: "24px 10px", textAlign: "center" }}>
          <div style={{ fontSize: 60 }}>📈</div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>長期</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: A2.green }}>安定しやすい</div>
        </div>
      </div>
    </PopIn>
  </BG2>
);

// ── P3 運用期間別リターン（ポンポン）──────────
const P3: React.FC = () => {
  const rows = [
    { d: 30, y: 470, term: "1年", tot: 27, lose: 9 },
    { d: 55, y: 620, term: "5年", tot: 23, lose: 7 },
    { d: 80, y: 770, term: "10年", tot: 18, lose: 4 },
    { d: 110, y: 920, term: "15年", tot: 13, lose: 0 },
    { d: 140, y: 1070, term: "20年", tot: 8, lose: 0 },
  ];
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up3", at: 30, volume: 0.1 }, { file: "up3", at: 55, volume: 0.1 }, { file: "up3", at: 80, volume: 0.1 }, { file: "up6", at: 110, volume: 0.13 }, { file: "up6", at: 140, volume: 0.13 }]} />
      <HeadBar delay={4} no="3" title="運用期間別リターン" />
      <Line delay={14} top={392} size={31}><span style={{ color: A2.sub }}>外国株式に100万円を投資 ／ 元本を割った回数</span></Line>
      {rows.map((r) => {
        const zero = r.lose === 0;
        return (
          <PopIn key={r.term} delay={r.d} style={{ position: "absolute", left: 60, top: r.y, width: 960 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, background: zero ? "#E4F6EC" : "#fff", border: `3px solid ${zero ? A2.green : A2.track}`, borderRadius: 20, padding: "16px 26px", boxShadow: "0 8px 18px rgba(80,60,20,0.08)" }}>
              <div style={{ width: 150, fontSize: 46, fontWeight: 800, color: zero ? A2.green : A2.ink }}>{r.term}</div>
              <div style={{ flex: 1, fontSize: 40, fontWeight: 700, color: A2.sub }}>{r.tot}回中</div>
              <div style={{ fontSize: 64, fontWeight: 800, color: zero ? A2.green : A2.coral }}>{r.lose}<span style={{ fontSize: 34 }}>回</span></div>
              {zero ? <div style={{ background: A2.green, color: "#fff", fontSize: 28, fontWeight: 800, padding: "6px 14px", borderRadius: 12 }}>割れなし</div> : null}
            </div>
          </PopIn>
        );
      })}
      <Band delay={165} top={1270} size={42}>長く持つほど、割れる可能性はぐっと下がる</Band>
    </BG2>
  );
};

// ── P4 複利の効果 ─────────────────────────
const P4: React.FC = () => {
  const f = useCurrentFrame();
  const base = 420; // バー下端(コンテナ内)
  const h30 = interpolate(f, [72, 112], [0, 340], clamp);
  const h40 = interpolate(f, [82, 122], [0, 204], clamp);
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up2", at: 6, volume: 0.1 }, { file: "up9", at: 72, volume: 0.12 }, { file: "up6", at: 150, volume: 0.13 }]} />
      <HeadBar delay={4} no="4" title="複利の効果" />
      <IllSlot emoji="⛄" file="t2_snowball.png" size={200} delay={14} left={80} top={360} />
      <Appear delay={24} style={{ position: "absolute", left: 310, top: 400, width: 700 }}>
        <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.4 }}>複利＝<Mark2 delay={40}>利息が利息を生む</Mark2><div style={{ fontSize: 30, color: A2.sub, marginTop: 8 }}>毎月2万円・年利3％で積立</div></div>
      </Appear>
      {/* 2本バー比較 */}
      <div style={{ position: "absolute", left: 0, top: 620, width: 1080, height: 480 }}>
        {[
          { cx: 340, h: h30, col: A2.green, cap: "30歳スタート", val: 1483, d: 74 },
          { cx: 740, h: h40, col: A2.sub, cap: "40歳スタート", val: 892, d: 84 },
        ].map((b) => (
          <div key={b.cap}>
            <div style={{ position: "absolute", left: b.cx - 110, top: base - b.h, width: 220, height: b.h, background: b.col, borderRadius: "14px 14px 0 0" }} />
            <PopIn delay={b.d + 34} style={{ position: "absolute", left: b.cx - 170, top: base - b.h - 70, width: 340, textAlign: "center" }}>
              <div style={{ fontSize: 50, fontWeight: 800, color: b.col }}>約<CountUp delay={b.d + 34} to={b.val} dur={20} />万</div>
            </PopIn>
            <div style={{ position: "absolute", left: b.cx - 170, top: base + 14, width: 340, textAlign: "center", fontSize: 34, fontWeight: 800 }}>{b.cap}</div>
          </div>
        ))}
      </div>
      <Band delay={150} top={1160} size={44}>10年の差が <Big delay={152} to={600} prefix="約" suffix="万" size={64} color={A2.red} dur={18} />の差</Band>
      <Line delay={178} top={1350} size={44}>だから<Mark2 delay={190}>早く始めることが重要</Mark2></Line>
    </BG2>
  );
};

// ── P5 積立投資（導入）─────────────────────
const P5: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up2", at: 6, volume: 0.1 }, { file: "up3", at: 30, volume: 0.12 }, { file: "up6", at: 60, volume: 0.12 }]} />
    <HeadBar delay={4} no="2" title="積立投資" />
    <IllSlot emoji="🐖" file="t3_piggy.png" size={380} delay={16} left={350} top={400} />
    <StatementCard delay={40} top={860}>
      一定の金額で買い続けることで<br /><Mark2 delay={58}>価格変動に一喜一憂せず</Mark2>続けられる
    </StatementCard>
    {/* 下部：毎月コツコツを可視化して埋める */}
    <PopIn delay={92} style={{ position: "absolute", left: 70, top: 1150, width: 940 }}>
      <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 10px 24px rgba(80,60,20,0.08)", padding: "26px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 40, fontWeight: 800 }}>
          {["1月", "2月", "3月", "…"].map((m, i) => (
            <React.Fragment key={m}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 54 }}>🪙</div>
                <div style={{ fontSize: 30, color: A2.sub, fontWeight: 700 }}>{m}</div>
              </div>
              {i < 3 ? <div style={{ color: A2.green, fontSize: 40 }}>→</div> : null}
            </React.Fragment>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 34, fontWeight: 800, marginTop: 10, color: A2.green }}>毎月コツコツ・少額でOK</div>
      </div>
    </PopIn>
  </BG2>
);

// ── P6 ドルコスト平均法 ───────────────────
const P6: React.FC = () => {
  // 価格が高い→口数少ない／安い→口数多い を1列ずつ（棒＝口数）
  const cols = [
    { price: 250, qty: 120 },
    { price: 400, qty: 75 },
    { price: 250, qty: 120 },
    { price: 200, qty: 150 },
    { price: 150, qty: 200 },
  ];
  const pts = ["🕐 投資タイミングを気にしなくていい", "⚖️ 購入価格を平準化できる", "🪙 少額から始められる"];
  const cardTop = 400, cardH = 360, baseY = 300; // カード内座標
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up3", at: 30, volume: 0.1 }, { file: "up6", at: 60, volume: 0.12 }, { file: "up6", at: 90, volume: 0.12 }, { file: "up6", at: 110, volume: 0.12 }]} />
      <HeadBar delay={4} no="6" title="ドル・コスト平均法" />
      <div style={{ position: "absolute", left: 70, top: cardTop, width: 940, height: cardH, background: "#fff", borderRadius: 22, boxShadow: "0 10px 24px rgba(80,60,20,0.08)" }}>
        {cols.map((c, i) => {
          const cx = 94 + i * 190; // カード内x（列中心）
          const barW = 120, h = c.qty; // 200口→200px
          const high = c.price >= 300;
          return (
            <PopIn key={i} delay={20 + i * 7} style={{ position: "absolute", left: cx - barW / 2, top: 0, width: barW }}>
              <div style={{ position: "absolute", left: 0, top: baseY - h - 44, width: barW, textAlign: "center", fontSize: 30, fontWeight: 800, color: high ? A2.red : A2.green }}>{c.price}円</div>
              <div style={{ position: "absolute", left: 10, top: baseY - h, width: barW - 20, height: h, background: A2.marker, border: "2px solid #E6C63E", borderRadius: "8px 8px 0 0" }} />
              <div style={{ position: "absolute", left: 0, top: baseY + 8, width: barW, textAlign: "center", fontSize: 26, fontWeight: 800, color: A2.sub }}>{c.qty}口</div>
            </PopIn>
          );
        })}
      </div>
      <Line delay={70} top={800} size={38}>高い時は<span style={{ color: A2.coral }}>少なく</span>／安い時は<span style={{ color: A2.green }}>多く</span>買い<Mark2 delay={86}>平準化</Mark2></Line>
      {pts.map((p, i) => (
        <PopIn key={i} delay={95 + i * 12} style={{ position: "absolute", left: 90, top: 920 + i * 118, width: 900 }}>
          <div style={{ background: "#fff", border: `3px solid ${A2.green}`, borderRadius: 18, padding: "22px 26px", fontSize: 40, fontWeight: 800, boxShadow: "0 6px 16px rgba(80,60,20,0.08)" }}>{p}</div>
        </PopIn>
      ))}
    </BG2>
  );
};

// ── P7 分散投資（導入）─────────────────────
const P7: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up2", at: 6, volume: 0.1 }, { file: "up3", at: 30, volume: 0.12 }, { file: "up6", at: 60, volume: 0.12 }]} />
    <HeadBar delay={4} no="3" title="分散投資" />
    {[
      { d: 16, e: "💴", n: "資産の分散", cx: 300 },
      { d: 26, e: "🌏", n: "地域の分散", cx: 780 },
    ].map((c) => (
      <PopIn key={c.n} delay={c.d} style={{ position: "absolute", left: c.cx - 130, top: 420, width: 260 }}>
        <div style={{ width: 260, height: 260, borderRadius: "50%", background: "#fff", boxShadow: "0 12px 30px rgba(80,60,20,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 130 }}>{c.e}</div>
        <div style={{ textAlign: "center", fontSize: 38, fontWeight: 800, marginTop: 12 }}>{c.n}</div>
      </PopIn>
    ))}
    <StatementCard delay={44} top={820}>
      資産や地域を分散させることで<br /><Mark2 delay={60}>リスクの軽減</Mark2>が期待できる
    </StatementCard>
    {/* 下部：分散の中身プレビューで埋める */}
    <PopIn delay={90} style={{ position: "absolute", left: 70, top: 1120, width: 940 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { k: "資産", v: "現金・株・債券・ゴールド" },
          { k: "地域", v: "日本・米国・新興国 …" },
        ].map((r) => (
          <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 18, background: "#fff", borderRadius: 18, padding: "18px 24px", boxShadow: "0 6px 16px rgba(80,60,20,0.07)" }}>
            <div style={{ background: A2.green, color: "#fff", fontSize: 30, fontWeight: 800, padding: "8px 20px", borderRadius: 12 }}>{r.k}</div>
            <div style={{ fontSize: 38, fontWeight: 800 }}>{r.v}</div>
          </div>
        ))}
      </div>
    </PopIn>
  </BG2>
);

// ── P8 卵は一つのカゴに盛るな ─────────────
const P8: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "up2", at: 6, volume: 0.1 }, { file: "up6", at: 40, volume: 0.12 }, { file: "up10", at: 80, volume: 0.12 }]} />
    <HeadBar delay={4} no="8" title="卵は一つのカゴに盛るな" />
    <IllSlot emoji="🧺" file="t4_eggs.png" size={300} delay={14} left={390} top={370} />
    <PopIn delay={44} style={{ position: "absolute", left: 60, top: 740, width: 960 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#FBE7E2", border: `3px solid ${A2.coral}`, borderRadius: 20, padding: "26px 28px" }}>
        <div style={{ fontSize: 64 }}>🥚</div>
        <div style={{ flex: 1, fontSize: 38, fontWeight: 800 }}>一つのカゴに全部入れる</div>
        <div style={{ fontSize: 34, fontWeight: 800, color: A2.red }}>落ちたら全部割れる</div>
      </div>
    </PopIn>
    <PopIn delay={80} style={{ position: "absolute", left: 60, top: 940, width: 960 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#E4F6EC", border: `3px solid ${A2.green}`, borderRadius: 20, padding: "26px 28px" }}>
        <div style={{ fontSize: 64 }}>🧺🧺</div>
        <div style={{ flex: 1, fontSize: 38, fontWeight: 800 }}>複数のカゴに分ける</div>
        <div style={{ fontSize: 34, fontWeight: 800, color: A2.green }}>一つ落ちても他は無事</div>
      </div>
    </PopIn>
    <Band delay={112} top={1220} size={46}>投資も同じ。<span style={{ color: A2.ink }}>いろいろな所に分ける</span></Band>
  </BG2>
);

// ── P9 資産と地域の分散（本題）───────────
const P9: React.FC = () => {
  const stocks = ["全世界株", "全米株", "S&P500", "NASDAQ", "日経"];
  const assets = [
    { e: "💵", n: "現金" },
    { e: "📈", n: "株" },
    { e: "📜", n: "債券" },
    { e: "🥇", n: "ゴールド" },
  ];
  return (
    <BG2>
      <SfxTrack cues={[{ file: "up3", at: 20, volume: 0.1 }, { file: "up6", at: 70, volume: 0.12 }, { file: "up10", at: 120, volume: 0.13 }, { file: "up1", at: 160, volume: 0.14 }]} />
      <HeadBar delay={4} no="9" title="本当の“資産の分散”" />
      <Line delay={14} top={392} size={38}>株の中だけで分散していませんか？</Line>
      {/* 株タグ：重ならず読める並び（flex wrap） */}
      <PopIn delay={22} style={{ position: "absolute", left: 90, top: 470, width: 900 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
          {stocks.map((s) => (
            <div key={s} style={{ background: A2.coral, color: "#fff", fontWeight: 800, fontSize: 36, padding: "12px 24px", borderRadius: 14, boxShadow: "0 6px 16px rgba(80,60,20,0.16)" }}>{s}</div>
          ))}
        </div>
      </PopIn>
      <PopIn delay={70} style={{ position: "absolute", left: 90, top: 640, width: 900 }}>
        <div style={{ background: "#FBE7E2", border: `3px solid ${A2.red}`, borderRadius: 18, padding: "20px 0", textAlign: "center", fontSize: 40, fontWeight: 800, color: A2.red }}>“株だけ”の分散 → 落ちる時は一気に落ちる</div>
      </PopIn>
      <Svg><DrawLine d="M540 770 L540 840" delay={110} dur={10} color={A2.green} w={7} /></Svg>
      <Line delay={116} top={856} size={40}>本当の分散は<Mark2 delay={130}>異なる資産の組み合わせ</Mark2></Line>
      <div style={{ position: "absolute", left: 0, top: 960, width: 1080, display: "flex", justifyContent: "center", gap: 22 }}>
        {assets.map((a, i) => (
          <PopIn key={a.n} delay={130 + i * 10}>
            <div style={{ width: 208, background: "#fff", border: `3px solid ${A2.green}`, borderRadius: 20, padding: "22px 0", textAlign: "center", boxShadow: "0 8px 18px rgba(80,60,20,0.1)" }}>
              <div style={{ fontSize: 72 }}>{a.e}</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>{a.n}</div>
            </div>
          </PopIn>
        ))}
      </div>
      <Band delay={175} top={1290} size={42}>値動きの違う資産でリスクが下がる</Band>
    </BG2>
  );
};

const SCENES: { c: React.FC; dur: number }[] = [
  { c: P1, dur: 240 },
  { c: P2, dur: 180 },
  { c: P3, dur: 360 },
  { c: P4, dur: 390 },
  { c: P5, dur: 180 },
  { c: P6, dur: 390 },
  { c: P7, dur: 180 },
  { c: P8, dur: 300 },
  { c: P9, dur: 420 },
];

export const TOUSHI_FRAMES = SCENES.reduce((a, s) => a + s.dur, 0); // 2640

export const ToushiReel: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: A2.bg }}>
      {SCENES.map(({ c: C, dur }, i) => {
        const el = (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneFade dur={dur}><C /></SceneFade>
          </Sequence>
        );
        from += dur;
        return el;
      })}
    </AbsoluteFill>
  );
};
