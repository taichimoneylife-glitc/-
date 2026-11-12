import React from "react";
import { AbsoluteFill, Img, Series, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TapCard } from "./components/tapCard";
import { FONT } from "./components/font";
import { GenSlot } from "./MileLifePlan";
import { F, clamp, out, K, B, SER, M, pop, yen, cnt, R, In, Sticker, Tag, Stamp, Paper2, SectionPill, Chain, Pill2, HandCircle, Spotlight } from "./components/marke";

// ════════════════════════════════════════════════════════════════════
//  住宅ローン②「金利が上がったときの対策」図解（録音前の静止画チェック用）
//  1ページ＝6秒。時刻はページの中だけの秒（録音が来たら声に合わせて付け直す）
//  数字（計算で確認済み・仮定の試算）：残高3,500万・残り35年・1.2%→(2.5年後)1.7%→(5年後)2.2%・5年/125%ルール
//   今の返済102,096円／300万繰上げ(返済額軽減型)93,345円
//   5年後 118,698円 vs 108,524円（月 約1万円）／20年間の利息 約91.5万円減
// ════════════════════════════════════════════════════════════════════
const PAGE = 6;
const Hero: React.FC<{ w?: number; h?: number; bg?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ w = 900, h, bg = "#fff", children, style }) => (
  <div style={{ width: w, height: h, background: bg, border: `6px solid ${M.ink}`, borderRadius: 22, boxShadow: `10px 10px 0 ${M.green}`, boxSizing: "border-box", position: "relative", overflow: "hidden", ...style }}>{children}</div>
);
const HeroBar: React.FC<{ title: React.ReactNode; icon?: string; bg?: string }> = ({ title, icon = "▤", bg = M.ink }) => (
  <div style={{ background: bg, color: "#fff", padding: "10px 22px", ...B, fontSize: 28, display: "flex", alignItems: "center", gap: 10 }}><span>{icon}</span>{title}</div>
);
const Note: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return <div style={{ position: "absolute", left: 60, width: 700, top: 1250, ...B, fontSize: 21, lineHeight: 1.45, color: M.sub, opacity: interpolate(f - F(at), [0, 6], [0, 1], clamp) }}>{children}</div>;
};
const Num: React.FC<{ n: string; c: string; s?: number }> = ({ n, c, s = 72 }) => (
  <span style={{ display: "inline-flex", width: s, height: s, borderRadius: 14, background: c, border: `4px solid ${M.ink}`, color: "#fff", ...K, fontSize: s * 0.46, alignItems: "center", justifyContent: "center", boxShadow: `4px 4px 0 ${M.ink}`, flex: "none" }}>{n}</span>
);

// ════════ ⓪ 冒頭：上がった人／これから上がる人 ════════
const P0: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <In at={0.1} x={0} y={250} center mode="ghost"><span style={{ ...K, fontSize: 56 }}><R>変動金利</R>で借りている人へ</span></In>
    {([["rl_bill_shock", "もう上がった人", M.red, 0.5, 90], ["r2_worry_calendar", "これから上がる人", M.orange, 0.9, 560]] as const).map(([img, label, c, at, x]) => (
      <In key={img} at={at} x={x} y={360} mode="pop">
        <Hero w={430} style={{ boxShadow: `8px 8px 0 ${c}` }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0 20px" }}>
            <GenSlot name={img} size={300} />
            <span style={{ ...K, fontSize: 38, color: c, marginTop: 6 }}>{label}</span>
          </div>
        </Hero>
      </In>
    ))}
    <In at={1.6} x={0} y={870} center mode="pop"><Tag c={M.yellow} size={34}>どちらも</Tag></In>
    <In at={2.0} x={0} y={950} center mode="pop">
      <span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 24, boxShadow: `10px 10px 0 ${M.ink}`, padding: "14px 44px" }}>
        <span style={{ ...K, fontSize: 64 }}>金利が上がったときの<R>対策</R></span>
      </span>
    </In>
    <HandCircle at={2.8} x={540} y={1010} r={430} c={M.red} w={7} ry={110} />
  </AbsoluteFill>
);

// ════════ ①-1 まずやること：固定費と資産形成 ════════
const P1: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <SectionPill at={0.1} no="01" icon="✓">まずやること</SectionPill>
    <In at={0.5} x={90} y={410} mode="pop">
      <Hero>
        <HeroBar title="固定費の見直し" icon="①" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "14px 20px 6px" }}>
          {([["r2_smartphone_bill", "スマホ"], ["r2_subscription_tablet", "サブスク"], ["r2_insurance_papers", "保険"]] as const).map(([n, l]) => (
            <div key={n} style={{ textAlign: "center" }}><GenSlot name={n} size={170} /><div style={{ ...K, fontSize: 32 }}>{l}</div></div>
          ))}
        </div>
        <div style={{ textAlign: "center", padding: "6px 0 18px" }}><Pill2 c={M.yellow} size={34}><span style={{ color: M.ink }}>→ 家計に<R>余力</R>をつくる</span></Pill2></div>
      </Hero>
    </In>
    <In at={1.8} x={90} y={860} mode="pop">
      <Hero>
        <HeroBar title="資産形成" icon="②" />
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 26px 20px" }}>
          <GenSlot name="r2_seedling_coins" size={170} />
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {["長期", "積立", "分散"].map((t, i) => <React.Fragment key={t}>{i ? <span style={{ ...K, fontSize: 36 }}>×</span> : null}<Pill2 c={M.green} size={36}>{t}</Pill2></React.Fragment>)}
            </div>
            <div style={{ ...K, fontSize: 34, marginTop: 14 }}>余裕があれば <R>積立額UP</R></div>
          </div>
        </div>
      </Hero>
    </In>
    <Stamp at={3.2} x={700} y={330} text="まずやる" size={62} />
  </AbsoluteFill>
);

// ════════ ①-2 株 と 債券：債券にスポット ════════
const P1b: React.FC = () => {
  const f = useCurrentFrame();
  const dim = interpolate(f, [F(2.0), F(2.0) + 8], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill at={0.1} no="01" icon="✓">まずやること</SectionPill>
      <In at={0.4} x={0} y={410} center mode="ghost"><span style={{ ...K, fontSize: 48 }}>運用というと…</span></In>
      <In at={0.8} x={70} y={510} mode="pop">
        <div style={{ opacity: 1 - 0.55 * dim, filter: `grayscale(${dim})` }}>
          <Hero w={440}><HeroBar title="株" icon="📈" /><div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}><GenSlot name="r2_stock_chart" size={300} /></div><div style={{ textAlign: "center", ...K, fontSize: 32, paddingBottom: 18 }}>イメージが強い</div></Hero>
        </div>
      </In>
      <In at={1.4} x={570} y={510} mode="pop">
        <Hero w={440} style={{ boxShadow: `10px 10px 0 ${M.yellow}`, transform: `scale(${1 + 0.06 * dim})` }}><HeroBar title="債券" icon="📜" bg={M.green} /><div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}><GenSlot name="r2_bond_certificate" size={300} /></div><div style={{ textAlign: "center", ...K, fontSize: 32, paddingBottom: 18 }}><R>今こそ</R>選択肢に</div></Hero>
      </In>
      <In at={2.4} x={0} y={1010} center mode="pop">
        <span style={{ display: "inline-block", background: M.yellow, border: `6px solid ${M.ink}`, borderRadius: 22, boxShadow: `8px 8px 0 ${M.ink}`, padding: "14px 36px", ...K, fontSize: 46 }}>金利が上がっている今は<R>債券</R>もおすすめ</span>
      </In>
      <HandCircle at={2.6} x={790} y={735} r={240} ry={275} c={M.red} w={8} />
      <Note at={2.4}>※満期まで持つ前提</Note>
    </AbsoluteFill>
  );
};

// ════════ つなぎ：ここから本題 ════════
const P2: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <In at={0.1} x={0} y={330} center mode="pop"><span style={{ display: "inline-block", background: M.ink, color: "#fff", borderRadius: 18, padding: "12px 40px", ...K, fontSize: 70, transform: "rotate(-2deg)" }}>ここから<span style={{ color: M.yellow }}>本題</span></span></In>
    {([["r2_house_return_coins", "繰上げ返済", M.orange, 0.7, 90], ["rl_bank", "借り換え", M.green, 1.1, 560]] as const).map(([img, l, c, at, x]) => (
      <In key={l} at={at} x={x} y={520} mode="pop">
        <Hero w={430} style={{ boxShadow: `8px 8px 0 ${c}` }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 24px" }}>
            <GenSlot name={img} size={300} />
            <span style={{ ...K, fontSize: 50, color: c, marginTop: 6 }}>{l}</span>
          </div>
        </Hero>
      </In>
    ))}
    <In at={1.8} x={0} y={1040} center mode="pop"><Pill2 c="#fff" size={38}>どっちも <R>メリット・デメリット</R> がある</Pill2></In>
  </AbsoluteFill>
);

// ════════ ② 繰上げ返済シミュレーション（仮定の試算） ════════
const STEPS: [number, number, string][] = [[0, 1.2, "今"], [1, 1.7, "2年半後"], [2, 2.2, "5年後"]];
const RateSteps: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const W = 400, H = 170, x0 = 40, y0 = 20;
  const yOf = (r: number) => y0 + H - ((r - 0.8) / 1.6) * H;
  return (
    <svg width={W + 80} height={H + 70} style={{ overflow: "visible" }}>
      <line x1={x0} y1={y0 + H} x2={x0 + W} y2={y0 + H} stroke={M.ink} strokeWidth={4} />
      {STEPS.map(([i, r, l]) => {
        const a = at + i * 0.45; const on = f >= F(a);
        const w = W / 3;
        return on ? (
          <g key={i} style={{ opacity: interpolate(f - F(a), [0, 5], [0, 1], clamp) }}>
            <rect x={x0 + i * w + 6} y={yOf(r)} width={w - 12} height={y0 + H - yOf(r)} rx={8} fill={i === 0 ? "#E3EFE8" : i === 1 ? "#FCE6C9" : "#F9D2CB"} stroke={M.ink} strokeWidth={4} />
            <text x={x0 + i * w + w / 2} y={yOf(r) - 12} textAnchor="middle" style={{ ...K, fontSize: 34, fill: i === 2 ? M.red : M.ink }}>{r}%</text>
            <text x={x0 + i * w + w / 2} y={y0 + H + 40} textAnchor="middle" style={{ ...B, fontSize: 26, fill: M.sub }}>{l}</text>
          </g>
        ) : null;
      })}
    </svg>
  );
};
const P3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill at={0.1} no="02" icon="🏠">繰上げ返済</SectionPill>
      <In at={0.3} x={70} y={390} mode="pop"><Tag c={M.red} size={26}>仮定の試算</Tag></In>
      <In at={0.4} x={70} y={450} mode="pop">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, width: 440 }}>
          {["残高3,500万円", "残り35年", "変動金利", "5年・125%ルールあり", "300万円を繰上げ"].map((t) => <span key={t} style={{ background: "#fff", border: `3px solid ${M.ink}`, borderRadius: 10, padding: "4px 12px", ...B, fontSize: 24 }}>{t}</span>)}
        </div>
      </In>
      <In at={0.8} x={540} y={400} mode="pop"><div><div style={{ ...B, fontSize: 24, color: M.sub, marginLeft: 40 }}>金利がこう上がったら</div><RateSteps at={0.9} /></div></In>
      <In at={2.0} x={60} y={690} mode="pop">
        <div style={{ width: 960, background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 20, boxShadow: `8px 8px 0 ${M.ink}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 1fr", ...K, fontSize: 28 }}>
            <div style={{ background: M.ink }} />
            <div style={{ background: M.green, color: "#fff", textAlign: "center", padding: "10px 0" }}>返済額軽減型</div>
            <div style={{ background: M.sub, color: "#fff", textAlign: "center", padding: "10px 0" }}>期間短縮型</div>
            {([
              ["5年後の毎月の返済", <><span style={{ ...B, fontSize: 24 }}>11.9万 → </span><span style={{ ...SER, fontSize: 44, color: M.green }}>10.9万</span></>, <span style={{ ...B, fontSize: 28 }}>変わらない</span>],
              ["返済期間", <span style={{ ...B, fontSize: 28 }}>変わらない</span>, <span style={{ ...SER, fontSize: 40 }}>約3年8か月短く</span>],
              ["20年間の利息", <span style={{ ...SER, fontSize: 48, color: M.red }}>約92万円減</span>, <span style={{ ...SER, fontSize: 40 }}>約143万円減</span>],
            ] as [string, React.ReactNode, React.ReactNode][]).map(([h, a, b], i) => (
              <React.Fragment key={h}>
                <div style={{ borderTop: `3px solid ${M.ink}`, padding: "14px 16px", fontSize: 28, display: "flex", alignItems: "center" }}>{h}</div>
                <div style={{ borderTop: `3px solid ${M.ink}`, borderLeft: `3px solid ${M.ink}`, background: "#F2FAF5", display: "flex", alignItems: "center", justifyContent: "center", opacity: f >= F(2.4 + i * 0.5) ? 1 : 0 }}>{a}</div>
                <div style={{ borderTop: `3px solid ${M.ink}`, borderLeft: `3px solid ${M.ink}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: f >= F(2.6 + i * 0.5) ? 1 : 0 }}>{b}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </In>
      <In at={2.2} x={360} y={640} mode="pop"><Tag c={M.yellow} size={24}>台本の例</Tag></In>
      <In at={3.8} x={60} y={1080} mode="pop"><Pill2 c={M.yellow} size={34}><span style={{ color: M.ink }}>5年後 月 約<R>1万円</R>軽く・20年で約<R>92万円</R>減</span></Pill2></In>
      <Note at={0.3}>※仮定の試算：金利が2年半後に1.7%、5年後に2.2%へ上がり、今すぐ300万円を繰上げた場合。時期や金利の動きで効果は変わります</Note>
    </AbsoluteFill>
  );
};

// ════════ ③ 繰上げる前に確認（デメリット） ════════
const ROWS3: [string, string, React.ReactNode, React.ReactNode][] = [
  ["rl_hourglass", "住宅ローン控除", <>残高が減ると<R>控除も減る</R></>, <>期間短縮型で通算10年未満になると控除なし</>],
  ["rl_wallet_lock", "手元に残すお金", <>返したお金は<R>戻ってこない</R></>, null],
  ["r2_umbrella_couple", "団信", <>もしもの時に消えるローンを<R>先に自分で払う</R></>, null],
  ["r2_family_future", "年齢・これからのお金", <>教育費・老後資金は大丈夫？</>, null],
  ["r2_stock_chart", "資産運用の機会", <>返したお金は<R>運用に回せない</R></>, null],
];
const P4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill at={0.1} no="02" icon="⚠">繰上げる前に確認</SectionPill>
      <In at={0.3} x={0} y={380} center mode="ghost"><span style={{ ...K, fontSize: 42 }}>でも <R>デメリット</R> もある</span></In>
      {ROWS3.map(([img, label, main, sub], i) => {
        const at = 0.7 + i * 0.5;
        return (
          <In key={label} at={at} x={60} y={450 + i * 138} mode="pop">
            <div style={{ width: 960, height: 126, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 18, boxShadow: `6px 6px 0 ${M.ink}`, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", boxSizing: "border-box" }}>
              <span style={{ width: 52, height: 52, borderRadius: 10, border: `5px solid ${M.ink}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 40, color: M.red, flex: "none" }}>{f >= F(at + 0.3) ? "✓" : ""}</span>
              <GenSlot name={img} size={110} />
              <div style={{ flex: 1 }}>
                <div style={{ ...K, fontSize: 25, color: M.sub }}>{label}</div>
                <div style={{ ...K, fontSize: 33, lineHeight: 1.2 }}>{main}</div>
                {sub ? <div style={{ ...B, fontSize: 21, color: M.sub, marginTop: 2 }}>※{sub}</div> : null}
              </div>
            </div>
          </In>
        );
      })}
      <In at={3.4} x={60} y={1150} mode="pop"><Pill2 c={M.yellow} size={34}><span style={{ color: M.ink }}>メリット・デメリットを比べて <R>家庭ごとに判断</R></span></Pill2></In>
    </AbsoluteFill>
  );
};

// ════════ ④ 借り換え＝天びん ════════
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const grow = interpolate(f, [F(2.6), F(3.4)], [1, 1.25], out);
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill at={0.1} no="03" icon="🏦">借り換え</SectionPill>
      <In at={0.3} x={0} y={390} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 16, padding: "8px 28px", ...K, fontSize: 44 }}>「金利が安い」<R>だけで決めない</R></span></In>
      <In at={0.6} x={290} y={500} mode="pop"><GenSlot name="r2_balance_scale" size={500} /></In>
      <In at={1.0} x={40} y={600} mode="pop">
        <div style={{ width: 330, transform: `scale(${grow})`, transformOrigin: "50% 100%" }}>
          <Sticker pad="14px 16px" style={{ textAlign: "center", border: `5px solid ${M.green}` }}>
            <div style={{ ...K, fontSize: 30, color: M.green }}>得する分</div>
            <div style={{ ...K, fontSize: 34 }}>金利差で減る利息</div>
          </Sticker>
        </div>
      </In>
      <In at={1.5} x={710} y={600} mode="pop">
        <div style={{ width: 330 }}>
          <Sticker pad="14px 16px" style={{ textAlign: "center", border: `5px solid ${M.red}` }}>
            <div style={{ ...K, fontSize: 30, color: M.red }}>かかる分</div>
            <div style={{ ...K, fontSize: 32, lineHeight: 1.25 }}>諸費用・団信<br />手続き</div>
          </Sticker>
        </div>
      </In>
      <In at={1.8} x={820} y={820} mode="pop"><GenSlot name="r2_stamp_calculator" size={170} /></In>
      <In at={2.4} x={60} y={1030} mode="pop">
        <Hero w={960} bg="#F2FAF5" style={{ boxShadow: `8px 8px 0 ${M.green}` }}>
          <div style={{ padding: "16px 24px", ...K, fontSize: 32, lineHeight: 1.35 }}>
            <span style={{ color: M.green }}>ローン残高</span>が多く、<span style={{ color: M.green }}>残りの期間</span>が長いほど<br />左の皿（得する分）が<R>重くなる</R>
          </div>
        </Hero>
      </In>
    </AbsoluteFill>
  );
};


// ════════ ⑥-2 諸費用の決まり方（レシート）：合計の金額は出さない ════════
const FEES: [string, string, string][] = [
  ["事務手数料", "借入額の○％ または 定額", "差がいちばん大きい"],
  ["保証料", "0円 または 借入額で決まる", "手数料と型がセット"],
  ["抵当権の登記（新）", "借入額 × 0.4％", "税金・どこでも同じ"],
  ["抵当権の登記（抹消）", "土地・建物 各1,000円", "税金・どこでも同じ"],
  ["印紙", "借入額で決まる", "電子契約なら0円"],
  ["司法書士", "見積もり", "事務所で違う"],
  ["今のローンの完済手数料", "0円〜", "今の銀行と契約しだい"],
];
const P5b: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill at={0.1} no="03" icon="🧾">借り換えの諸費用</SectionPill>
      <In at={0.3} x={0} y={380} center mode="ghost"><span style={{ ...K, fontSize: 42 }}>諸費用は <R>銀行ごとに決まり方が違う</R></span></In>
      <In at={0.5} x={60} y={450} mode="pop">
        <div style={{ width: 960, background: "#FFFDF6", border: `5px solid ${M.ink}`, borderRadius: 8, boxShadow: `8px 8px 0 ${M.ink}`, padding: "10px 26px 14px", boxSizing: "border-box", clipPath: "polygon(0 0,100% 0,100% 100%,97% 98%,94% 100%,91% 98%,88% 100%,85% 98%,82% 100%,79% 98%,76% 100%,73% 98%,70% 100%,67% 98%,64% 100%,61% 98%,58% 100%,55% 98%,52% 100%,49% 98%,46% 100%,43% 98%,40% 100%,37% 98%,34% 100%,31% 98%,28% 100%,25% 98%,22% 100%,19% 98%,16% 100%,13% 98%,10% 100%,7% 98%,4% 100%,0 98%)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", rowGap: 4, ...K }}>
            <div style={{ fontSize: 24, color: M.sub, padding: "4px 0" }}>項目</div><div style={{ fontSize: 24, color: M.sub, padding: "4px 0" }}>決まり方</div>
            {FEES.map(([k, v, n], i) => f >= F(0.8 + i * 0.3) ? (
              <React.Fragment key={k}>
                <div style={{ borderTop: `3px dashed ${M.gray}`, padding: "7px 0", fontSize: 27 }}>{k}</div>
                <div style={{ borderTop: `3px dashed ${M.gray}`, padding: "5px 0", display: "flex", alignItems: "baseline", gap: 14 }}>
                  <div style={{ fontSize: 27, color: i === 0 ? M.red : M.ink }}>{v}</div>
                  <div style={{ ...B, fontSize: 19, color: M.sub }}>{n}</div>
                </div>
              </React.Fragment>
            ) : <React.Fragment key={k}><div style={{ height: 50 }} /><div /></React.Fragment>)}
          </div>
          <div style={{ borderTop: `4px double ${M.ink}`, marginTop: 6, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", ...K, fontSize: 32 }}>
            <span>合計</span><span style={{ color: M.red }}>銀行・借入額・物件で変わる</span>
          </div>
        </div>
      </In>
      <In at={3.2} x={60} y={1160} mode="pop"><Pill2 c={M.yellow} size={34}><span style={{ color: M.ink }}>だから <R>見積もり</R>を取って確認</span></Pill2></In>
    </AbsoluteFill>
  );
};

// ════════ ⑥-3 本当にプラス？（引き算）：諸費用は空欄の見積もり ════════
const P5c: React.FC = () => {
  const f = useCurrentFrame();
  const Eq: React.FC<{ at: number; label: string; v: number; big?: boolean }> = ({ at, label, v, big }) => (
    <In at={at} x={60} y={0} mode="pop" style={{ position: "relative", left: 0, top: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 380, background: "#fff", border: `5px solid ${M.green}`, borderRadius: 16, padding: "10px 14px", textAlign: "center" }}>
          <div style={{ ...B, fontSize: 22, color: M.sub }}>{label}</div>
          <div style={{ ...K, fontSize: 24 }}>減る利息</div>
          <div style={{ ...SER, fontSize: big ? 64 : 52, color: M.green, lineHeight: 1.1 }}>約{yen(cnt(f, at, v, 0.6))}万円</div>
        </div>
        <span style={{ ...K, fontSize: 56 }}>−</span>
        <div style={{ width: 230, height: 140, border: `5px dashed ${M.red}`, borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFF6F3" }}>
          <div style={{ ...K, fontSize: 26, color: M.red }}>見積もりの</div><div style={{ ...K, fontSize: 30, color: M.red }}>諸費用</div>
        </div>
        <span style={{ ...K, fontSize: 56 }}>＝</span>
        <span style={{ ...K, fontSize: 40 }}>＋？</span>
      </div>
    </In>
  );
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill at={0.1} no="03" icon="＝">本当にプラス？</SectionPill>
      <In at={0.3} x={60} y={390} mode="pop"><span style={{ ...B, fontSize: 26, color: M.sub }}>たとえば 残り3,000万円・25年なら</span></In>
      <div style={{ position: "absolute", left: 0, top: 450 }}><Eq at={0.6} label="金利 1.5% → 1.0%（0.5%差）" v={208} big /></div>
      <div style={{ position: "absolute", left: 0, top: 650 }}><Eq at={1.6} label="金利 1.5% → 1.2%（0.3%差）" v={125} /></div>
      <In at={2.6} x={60} y={860} mode="pop"><Pill2 c={M.yellow} size={36}><span style={{ color: M.ink }}>金利の差が小さいと <R>費用で消える</R>ことも</span></Pill2></In>
      <In at={3.0} x={60} y={960} mode="pop">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <GenSlot name="r2_umbrella_couple" size={130} />
          <Sticker pad="12px 20px"><span style={{ ...K, fontSize: 32 }}>団信は<R>入り直し</R>＝審査がある</span></Sticker>
        </div>
      </In>
      <Note at={0.6}>※金利が今のまま続いた場合の試算</Note>
    </AbsoluteFill>
  );
};

// ════════ ⑤ 金利交渉 ════════
const P6: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <SectionPill at={0.1} no="03" icon="💬">金利交渉</SectionPill>
    <In at={0.3} x={0} y={390} center mode="pop"><Tag c={M.red} size={34}>意外と知られていない</Tag></In>
    <In at={0.6} x={240} y={560} mode="pop"><GenSlot name="r2_bank_counter" size={600} /></In>
    <In at={1.2} x={60} y={470} mode="pop" rot={-6}>
      <div style={{ position: "relative", background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 26, padding: "16px 28px", boxShadow: `6px 6px 0 ${M.ink}` }}>
        <span style={{ ...K, fontSize: 44 }}>金利を<R>下げられませんか？</R></span>
        <div style={{ position: "absolute", left: 120, bottom: -30, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `30px solid ${M.ink}` }} />
      </div>
    </In>
    <In at={2.0} x={0} y={1150} center mode="pop"><Pill2 c={M.yellow} size={38}><span style={{ color: M.ink }}>借り換えの前に、<R>今の銀行</R>へ</span></Pill2></In>
    <Note at={2.0}>※必ず下がるわけではありません。応じてもらえるかは銀行・契約内容によります</Note>
  </AbsoluteFill>
);

// ════════ ⑥ まとめ ════════
const Box: React.FC<{ c: string; children: React.ReactNode; w?: number }> = ({ c, children, w = 410 }) => (
  <div style={{ width: w, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 18, boxShadow: `6px 6px 0 ${c}`, padding: "16px 0", textAlign: "center", ...K, fontSize: 40 }}>{children}</div>
);
const P7: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <SectionPill at={0.1} icon="✓">まとめ</SectionPill>
    <In at={0.4} x={0} y={390} center mode="pop"><Tag c={M.green} size={30}><span style={{ color: "#fff" }}>まずやる</span></Tag></In>
    <In at={0.6} x={90} y={460} mode="pop"><Box c={M.green}>固定費の見直し</Box></In>
    <In at={0.7} x={0} y={470} center mode="pop"><span style={{ ...K, fontSize: 56 }}>＋</span></In>
    <In at={0.8} x={580} y={460} mode="pop"><Box c={M.green}>資産形成</Box></In>
    <In at={1.2} x={0} y={590} center mode="pop"><span style={{ ...K, fontSize: 60, color: M.sub }}>↓</span></In>
    <In at={1.4} x={0} y={680} center mode="pop"><Tag c={M.orange} size={30}><span style={{ color: "#fff" }}>そのうえで検討</span></Tag></In>
    <In at={1.6} x={90} y={750} mode="pop"><Box c={M.orange}>繰上げ返済</Box></In>
    <In at={1.8} x={580} y={750} mode="pop"><Box c={M.orange}>借り換え</Box></In>
    <In at={2.2} x={0} y={880} center mode="pop"><span style={{ ...K, fontSize: 60, color: M.sub }}>↓</span></In>
    <In at={2.4} x={0} y={970} center mode="pop"><Pill2 c={M.yellow} size={40}><span style={{ color: M.ink }}>メリット・デメリットを見て判断</span></Pill2></In>
    <In at={3.0} x={70} y={1060} mode="pop"><GenSlot name="r2_signpost" size={200} /></In>
    <In at={3.2} x={290} y={1100} mode="pop"><span style={{ ...K, fontSize: 40, lineHeight: 1.3 }}>住宅ローンは<br /><R>家庭ごとに戦略が変わる</R></span></In>
  </AbsoluteFill>
);

// ════════ ⑦ CTA：NISA→債券リールの締めと同じ（実際のプロフ → リンク一覧 → 公式LINE を指でタップ） ════════
const P8: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Paper2 />
      <div style={{ position: "absolute", inset: -60, opacity: 0.25 * interpolate(f, [F(0.3), F(0.8)], [0, 1], clamp), filter: "blur(12px)" }}><Img src={staticFile("cta_nisabond/site.webp")} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
      <In at={0.05} until={2.6} x={0} y={300} center mode="ghost"><span style={{ ...K, fontSize: 50 }}>自分の場合は<R>どうしたらいい？</R></span></In>
      <TapCard at={0.3} until={2.6} src="cta_nisabond/igprofile.jpg" iw={1178} ih={915} x={90} y={380} w={900} hit={[0.03, 0.9, 0.52, 0.085]} dimAt={0.8} tapAt={1.5} label={<>プロフの<span style={{ color: M.red }}>リンク</span>から</>} labelAt={1.2} />
      <TapCard at={2.7} src="cta_nisabond/links.jpg" iw={1179} ih={525} x={90} y={420} w={900} hit={[0.02, 0.03, 0.96, 0.3]} dimAt={2.9} tapAt={3.4} label={<><span style={{ color: "#06C755" }}>公式LINE</span>を追加して</>} labelAt={3.1} labelTop={900} labelLeft={150} />
    </AbsoluteFill>
  );
};

const PAGES: React.FC[] = [P0, P1, P1b, P2, P3, P4, P5, P5b, P5c, P6, P7, P8];
export const LOAN_TAISAKU_STILL_FRAMES = F(PAGE) * PAGES.length;
const SAFE = 0.9, SAFE_X = 540 - 540 * SAFE, SAFE_Y = 300 - 280 * SAFE;
export const LoanTaisakuStills: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.paper, fontFamily: FONT }}>
    <AbsoluteFill style={{ background: M.paper, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${SAFE_X}px, ${SAFE_Y}px) scale(${SAFE})`, transformOrigin: "0 0" }}>
      <Series>
        {PAGES.map((P, i) => <Series.Sequence key={i} durationInFrames={F(PAGE)}><P /></Series.Sequence>)}
      </Series>
    </div>
    {/* 字幕と太一が入る場所（目安） */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, bottom: 0, background: `linear-gradient(${M.paper}00, ${M.paper} 50px)` }} />
    <div style={{ position: "absolute", left: 60, right: 300, top: 1370, height: 110, border: `3px dashed ${M.gray}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", ...B, fontSize: 26, color: M.gray }}>字幕の場所</div>
    <div style={{ position: "absolute", left: 800, top: 1095, width: 250, height: 250 }}><GenSlot name="taichi_talk_closed" size={250} /></div>
  </AbsoluteFill>
);
