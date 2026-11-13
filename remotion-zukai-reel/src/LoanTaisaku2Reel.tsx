import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { GenSlot } from "./MileLifePlan";
import { Captions } from "./BourakuReel";
import { TapCard } from "./components/tapCard";
import { BounceText } from "./components/fx";
import { TypeIn, wipeIn } from "./components/zukaiKit";
import { F, clamp, out, K, B, SER, M, pop, yen, cnt, R, In, Tag, Stamp, Paper2, SectionPill, Pill2, HandCircle, shake } from "./components/marke";
import { RL2_MOUTH } from "./rl2Mouth";

// ════════════════════════════════════════════════════════════════════
//  住宅ローン②「金利が上がったときの対策」v1（台本確定版・音声 public/rl2-narration.wav 98.1秒）
//  1ページ＝声の区切り。ページの中の時刻は「そのページの頭からの秒」。
//  数字（計算で確認済み・仮定の試算）：残高3,500万・残り35年・1.2%→(2年後)1.7%→(5年後)2.2%・5年/125%ルール
//   5年後の返済 119,028円 → 500万繰上げ(返済額軽減型) 102,024円（月 約1.7万円）／20年間の利息 154.1万円減
//   500万円×1.05^20＝1,326.6万円（複利・税引前）
// ════════════════════════════════════════════════════════════════════
const G = M.green;
const Hero: React.FC<{ w?: number; bg?: string; sh?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ w = 900, bg = "#fff", sh = G, children, style }) => (
  <div style={{ width: w, background: bg, border: `6px solid ${M.ink}`, borderRadius: 22, boxShadow: `10px 10px 0 ${sh}`, boxSizing: "border-box", position: "relative", overflow: "hidden", ...style }}>{children}</div>
);
const Bar: React.FC<{ title: React.ReactNode; icon?: string; bg?: string }> = ({ title, icon = "▤", bg = G }) => (
  <div style={{ background: bg, color: "#fff", padding: "10px 22px", ...B, fontSize: 28, display: "flex", alignItems: "center", gap: 10 }}><span>{icon}</span>{title}</div>
);
const Note: React.FC<{ at: number; children: React.ReactNode; top?: number }> = ({ at, children, top = 1240 }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return <div style={{ position: "absolute", left: 60, width: 720, top, ...B, fontSize: 21, lineHeight: 1.45, color: M.sub, opacity: interpolate(f - F(at), [0, 6], [0, 1], clamp) }}>{children}</div>;
};
const Check: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  return <span style={{ width: 52, height: 52, borderRadius: 10, border: `5px solid ${M.ink}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", background: "#fff" }}>
    {f >= F(at) ? <svg width={40} height={40} viewBox="0 0 40 40"><path d="M6 21 L16 31 L35 8" fill="none" stroke={M.red} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(f - F(at), [0, 6], [0, 1], clamp)} /></svg> : null}
  </span>;
};

// ════════ 1 冒頭（0–6.62）：参考⑪の型＝銀行アプリの「金利変更のお知らせ」を再現 → 寄る → 横にシュッ → 引いて赤い枠と線 ════════
// 動きの数字は marke-motion-grammar.md（入り＝毎フレーム約半分になる急ブレーキ、寄り8f、横のシュッ8f、引き6f、赤枠3f、線5f）
type CamK = { t: number; cx: number; cy: number; s: number; d: number };
const CAM: CamK[] = [{ t: 0, cx: 540, cy: 860, s: 1, d: 1 }, { t: 0.78, cx: 540, cy: 700, s: 1.75, d: 8 }, { t: 2.04, cx: 540, cy: 905, s: 1.75, d: 8 }, { t: 3.2, cx: 540, cy: 860, s: 1, d: 6 }];
const camAt = (f: number) => {
  let c = { cx: CAM[0].cx, cy: CAM[0].cy, s: CAM[0].s }, v = 0;
  for (let i = 1; i < CAM.length; i++) {
    const k = CAM[i], a0 = F(k.t);
    if (f < a0) break;
    const p = interpolate(f, [a0, a0 + k.d], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    const p1 = interpolate(f - 1, [a0, a0 + k.d], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    const prev = { ...c };
    c = { cx: prev.cx + (k.cx - prev.cx) * p, cy: prev.cy + (k.cy - prev.cy) * p, s: prev.s + (k.s - prev.s) * p };
    v = Math.abs((k.cy - prev.cy) * (p - p1)) + Math.abs((k.s - prev.s) * (p - p1)) * 500;
  }
  return { ...c, v };
};
const stepN = (f: number, at: number, to: number, dur: number, from: number) => cnt(F(at) + Math.floor((f - F(at)) / 3) * 3, at, to, dur, from); // 3fごとに段で上がる
const Row: React.FC<{ label: string; from: string; to: React.ReactNode; boxAt: number; y: number }> = ({ label, from, to, boxAt, y }) => {
  const f = useCurrentFrame();
  const bx = interpolate(f, [F(boxAt), F(boxAt) + 3], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: y, height: 150, background: "#F6F7FA", borderRadius: 18, padding: "16px 22px", boxSizing: "border-box" }}>
      <div style={{ ...B, fontSize: 24, color: M.sub }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}><span style={{ ...B, fontSize: 30, color: M.sub }}>{from} →</span>{to}</div>
      {bx > 0 ? <div style={{ position: "absolute", inset: -8, border: `6px solid ${M.red}`, borderRadius: 22, clipPath: `inset(0 ${(1 - bx) * 100}% 0 0)` }} /> : null}
    </div>
  );
};
const CHIPS: [string, string][] = [["固定費", G], ["資産形成", G], ["繰上げ返済", M.orange], ["借り換え", M.orange]];
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const c = camAt(f);
  // スマホの入り：下から、毎フレーム約半分になる急ブレーキ（8f）＋速さに合わせたブレ
  const LAND = [600, 300, 150, 76, 38, 18, 8, 3, 0];
  const iy = LAND[Math.min(LAND.length - 1, f)];
  const iv = f < LAND.length - 1 ? LAND[f] - LAND[f + 1] : 0;
  // 4.8秒：スマホが上へ抜ける（ため4f → 加速）
  const ex = f < F(4.62) ? 0 : (() => { const k = f - F(4.62); const T = [6, 18, 30, 42, -48, -228, -488, -808, -1188, -1700]; return T[Math.min(T.length - 1, k)]; })();
  const exV = f >= F(4.62) + 4 ? Math.min(60, (f - F(4.62) - 3) * 12) : 0;
  const rate = f >= F(1.35) ? stepN(f, 1.35, 1.7, 0.4, 1.2) : 1.2;
  const pay = f >= F(2.4) ? stepN(f, 2.4, 119028, 0.6, 102096) : 102096;
  const blur = Math.min(14, (iv + c.v) / 18) + exV / 4;
  const sc = 540 - c.cx * c.s, sy = 860 - c.cy * c.s;
  const lineP = interpolate(f, [F(3.4), F(3.4) + 5], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Paper2 />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${sc}px, ${sy + iy + ex}px) scale(${c.s})`, transformOrigin: "0 0", filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
        {/* スマホ（架空の銀行アプリ。実在の名前・ロゴは出さない） */}
        <div style={{ position: "absolute", left: 230, top: 330, width: 620, height: 1060, background: "#fff", border: `14px solid ${M.ink}`, borderRadius: 64, boxShadow: `14px 14px 0 rgba(0,0,0,0.12)`, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: "50%", top: 14, width: 170, height: 34, marginLeft: -85, background: M.ink, borderRadius: 20 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 70, padding: "0 30px", display: "flex", alignItems: "center", gap: 10, ...K, fontSize: 30 }}><span>🏠</span>住宅ローン<span style={{ marginLeft: "auto", ...B, fontSize: 22, color: M.sub }}>〇〇銀行</span></div>
          <div style={{ position: "absolute", left: 30, right: 30, top: 140, background: "#FFF3F0", border: `3px solid ${M.red}`, borderRadius: 16, padding: "12px 18px", ...K, fontSize: 28, color: M.red, transform: `translateY(${interpolate(f, [F(0.35), F(0.35) + 6], [-160, 0], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) })}px)`, opacity: f >= F(0.35) ? 1 : 0 }}>🔔【重要】適用金利変更のお知らせ</div>
          <Row label="適用金利（変動）" from="1.2%" y={300} boxAt={1.6} to={<span style={{ ...SER, fontSize: 64, color: f >= F(1.35) ? M.red : M.ink }}>{rate.toFixed(1)}%</span>} />
          <Row label="毎月の返済額" from="102,096円" y={500} boxAt={2.7} to={<span style={{ ...SER, fontSize: 56, color: f >= F(2.4) ? M.red : M.ink }}>{yen(pay)}円</span>} />
          <div style={{ position: "absolute", left: 30, right: 30, top: 700, ...B, fontSize: 22, color: M.gray }}>※イメージ（例：残高3,500万円・35年）</div>
          {/* 2つの赤枠をつなぐカギ型の線 */}
          <svg width={620} height={1060} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <path d="M560 380 L600 380 L600 580 L560 580" fill="none" stroke={M.red} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lineP} />
          </svg>
        </div>
        {f >= F(3.55) ? <div style={{ position: "absolute", left: 0, right: 0, top: 1100, textAlign: "center", transform: `scale(${pop(f, F(3.55))})` }}><span style={{ display: "inline-block", background: M.red, color: "#fff", border: `5px solid ${M.ink}`, borderRadius: 16, padding: "10px 30px", ...K, fontSize: 46, boxShadow: `6px 6px 0 ${M.ink}` }}>返済額、もう上がってない？</span></div> : null}
        {f >= F(3.78) ? <div style={{ position: "absolute", left: 40, top: 860, transform: `scale(${pop(f, F(3.78))}) rotate(-6deg)` }}><GenSlot name="r2_worry_calendar" size={230} /><div style={{ ...K, fontSize: 30, background: "#fff", border: `4px solid ${M.ink}`, borderRadius: 12, padding: "4px 12px", marginTop: -10 }}>これから上がる人も</div></div> : null}
      </div>
      {/* 4.8秒〜：タイトル＋4つの札がバラバラに落ちて1列にそろう */}
      {f >= F(4.8) ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 430, textAlign: "center" }}>
            <span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 24, boxShadow: `10px 10px 0 ${G}`, padding: "14px 36px" }}>
              <span style={{ display: "inline-flex" }}><BounceText text="金利が上がったときの" at={F(4.8)} size={62} stroke={false} /><BounceText text="対策" at={F(4.8) + 18} size={62} color={M.red} stroke={false} /></span>
            </span>
          </div>
          {CHIPS.map(([t, col], i) => {
            const at = F(5.15) + i * 3;
            const fall = interpolate(f, [at, at + 7], [-900, 0], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
            const align = interpolate(f, [F(5.95), F(5.95) + 7], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
            const rx = [-30, 40, -20, 30][i], ry = [40, -20, 60, 10][i], rr = [-14, 10, -8, 16][i];
            const x = 70 + i * 240;
            return f >= at ? <div key={t} style={{ position: "absolute", left: x + rx * (1 - align), top: 640 + ry * (1 - align) + fall, transform: `rotate(${rr * (1 - align)}deg)`, width: 220, textAlign: "center", background: "#fff", border: `5px solid ${M.ink}`, borderTop: `16px solid ${col}`, borderRadius: 14, boxShadow: `5px 5px 0 ${M.ink}`, padding: "16px 0", ...K, fontSize: 34 }}><div style={{ ...K, fontSize: 22, color: col }}>0{i + 1}</div>{t}</div> : null;
          })}
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ════════ 2 まずやる（6.62–10.04） ════════
const P2: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <SectionPill c={G} at={0.05} no="01" icon="✓">まずやること</SectionPill>
    <In at={0.36} x={70} y={420} mode="throw" from="l" rot={-6}>
      <Hero w={450}><Bar title="固定費の見直し" icon="①" /><div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "16px 0" }}><GenSlot name="r2_smartphone_bill" size={130} /><GenSlot name="r2_subscription_tablet" size={130} /><GenSlot name="r2_insurance_papers" size={130} /></div></Hero>
    </In>
    <In at={1.32} x={560} y={420} mode="throw" from="r" rot={6}>
      <Hero w={450}><Bar title="資産形成" icon="②" /><div style={{ display: "flex", justifyContent: "center", padding: "10px 0 12px" }}><GenSlot name="r2_seedling_coins" size={150} /></div></Hero>
    </In>
    <In at={0.9} x={0} y={500} center mode="pop"><span style={{ ...K, fontSize: 70 }}>＋</span></In>
    <Stamp at={2.38} x={300} y={760} text="まずやる！" size={92} />
  </AbsoluteFill>
);

// ════════ 3 資産形成（10.04–15.50） ════════
const P3: React.FC = () => {
  const f = useCurrentFrame();
  const up = interpolate(f, [F(3.94), F(4.6)], [0, 1], out);
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill c={G} at={0.05} no="01" icon="🌱">資産形成</SectionPill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center", gap: 18 }}>
        {([["長期", 0.7], ["積立", 1.22], ["分散", 1.54]] as const).map(([t, at]) => f >= F(at) ? (
          <span key={t} style={{ transform: `scale(${pop(f, F(at))})`, background: G, color: "#fff", border: `5px solid ${M.ink}`, borderRadius: 18, boxShadow: `6px 6px 0 ${M.ink}`, padding: "16px 34px", ...K, fontSize: 60 }}>{t}</span>
        ) : <span key={t} style={{ width: 210 }} />)}
      </div>
      <In at={2.0} x={0} y={600} center mode="ghost"><span style={{ ...K, fontSize: 44 }}>で <R>コツコツ続ける</R></span></In>
      <In at={2.9} x={90} y={720} mode="pop"><GenSlot name="p4_coins_grow" size={330} /></In>
      {f >= F(3.94) ? (
        <div style={{ position: "absolute", left: 470, top: 760 }}>
          <div style={{ ...B, fontSize: 30, color: M.sub }}>余裕があるなら</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <div style={{ width: 60, height: 80 + 180 * up, background: `linear-gradient(${G}, #7FCFA6)`, border: `5px solid ${M.ink}`, borderRadius: 10 }} />
            <span style={{ ...K, fontSize: 64, color: G, transform: `scale(${pop(f, F(4.3))})` }}>積立額UP↑</span>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ════════ 4 ここから本題（15.50–17.92） ════════
const P4: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <In at={0.05} x={0} y={330} center mode="pop"><span style={{ display: "inline-block", background: G, borderRadius: 18, padding: "12px 40px", transform: "rotate(-2deg)", boxShadow: `6px 6px 0 ${M.ink}` }}><BounceText text="ここから" at={F(0.1)} size={70} color="#fff" stroke={false} /><BounceText text="本題" at={F(0.1) + 10} size={70} color={M.yellow} stroke={false} /></span></In>
    {([["r2_house_return_coins", "繰上げ返済", M.orange, 1.26, 90], ["rl_bank", "借り換え", G, 2.0, 560]] as const).map(([img, l, c, at, x]) => (
      <In key={l} at={at} x={x} y={520} mode="throw" from={x < 300 ? "l" : "r"}>
        <Hero w={430} sh={c}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 24px" }}><GenSlot name={img} size={300} /><span style={{ ...K, fontSize: 50, color: c, marginTop: 6 }}>{l}</span></div></Hero>
      </In>
    ))}
  </AbsoluteFill>
);

// ════════ 5 言い切り：繰上げ返済はおすすめしません（17.92–19.96） ════════
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [F(1.2), F(1.2) + 7], [0, 1], out);
  return (
    <AbsoluteFill style={{ transform: shake(f, 1.2, 16) }}>
      <Paper2 />
      <In at={0.05} x={290} y={360} mode="pop">
        <Hero w={500} sh={M.orange}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 24px", filter: `grayscale(${x * 0.6})` }}><GenSlot name="r2_house_return_coins" size={360} /><span style={{ ...K, fontSize: 56, color: M.orange }}>繰上げ返済</span></div></Hero>
      </In>
      {f >= F(1.2) ? <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M330 400 L750 850" stroke={M.red} strokeWidth={30} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, x * 2)} />
        <path d="M750 400 L330 850" stroke={M.red} strokeWidth={30} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, x * 2 - 1)} />
      </svg> : null}
      <Stamp at={1.2} x={190} y={950} text="僕はおすすめしません" size={78} />
    </AbsoluteFill>
  );
};

// ════════ 6 前提（19.96–23.02） ════════
const STEPS: [number, number, string, number][] = [[0, 1.2, "今", 1.5], [1, 1.7, "2年後", 1.95], [2, 2.2, "5年後", 2.4]];
const P6: React.FC = () => {
  const f = useCurrentFrame();
  const W = 840, H = 300, x0 = 60, y0 = 40;
  const yOf = (r: number) => y0 + H - ((r - 0.6) / 1.8) * H;
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill c={G} at={0.05} no="02" icon="🏠">繰上げ返済の例</SectionPill>
      <In at={0.1} x={70} y={390} mode="pop"><Tag c={M.red} size={28}>仮定の試算</Tag></In>
      <In at={0.7} x={70} y={450} mode="rise">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, width: 940 }}>
          {["残高 3,500万円", "残り 35年", "変動金利", "5年ルール・125%ルールあり", "500万円を返済額軽減型で"].map((t, i) => <span key={t} style={{ background: "#fff", border: `3px solid ${M.ink}`, borderRadius: 10, padding: "6px 14px", ...B, fontSize: 30, ...(f >= F(0.7 + i * 0.12) ? wipeIn(f, F(0.7 + i * 0.12)) : { opacity: 0 }) }}>{t}</span>)}
        </div>
      </In>
      <In at={1.4} x={40} y={620} mode="ghost"><span style={{ ...K, fontSize: 36, marginLeft: 30 }}>金利が<R>このように</R>上がったら</span></In>
      <svg width={1000} height={420} style={{ position: "absolute", left: 40, top: 680, overflow: "visible" }}>
        <line x1={x0} y1={y0 + H} x2={x0 + W} y2={y0 + H} stroke={M.ink} strokeWidth={5} />
        {STEPS.map(([i, r, l, at]) => {
          const w = W / 3, p = interpolate(f - F(at), [0, 9], [0, 1], out);
          return f >= F(at) ? (
            <g key={i}>
              <rect x={x0 + i * w + 14} y={y0 + H - (y0 + H - yOf(r)) * p} width={w - 28} height={(y0 + H - yOf(r)) * p} rx={10} fill={i === 0 ? "#E3EFE8" : i === 1 ? "#FCE6C9" : "#F9D2CB"} stroke={M.ink} strokeWidth={5} />
              <text x={x0 + i * w + w / 2} y={yOf(r) - 16} textAnchor="middle" opacity={p} style={{ ...K, fontSize: 52, fill: i === 2 ? M.red : M.ink }}>{r}%</text>
              <text x={x0 + i * w + w / 2} y={y0 + H + 46} textAnchor="middle" style={{ ...K, fontSize: 34, fill: M.sub }}>{l}</text>
            </g>
          ) : null;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ════════ 7 500万円を繰上げ返済（23.02–30.88） ════════
const P7: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill c={G} at={0.05} no="02" icon="🏠">500万円を繰上げ返済</SectionPill>
      <In at={0.0} x={70} y={380} mode="pop"><Tag c={M.red} size={24}>仮定の試算</Tag></In>
      <In at={1.86} x={0} y={440} center mode="ghost"><span style={{ ...K, fontSize: 40 }}>5年後の毎月の返済</span></In>
      <In at={1.9} x={70} y={520} mode="throw" from="l">
        <Hero w={430} sh={M.gray}><Bar title="繰上げなし" icon="—" bg={M.sub} /><div style={{ textAlign: "center", padding: "14px 0 18px" }}><span style={{ ...SER, fontSize: 96 }}>11.9</span><span style={{ ...K, fontSize: 38 }}>万円</span></div></Hero>
      </In>
      <In at={2.1} x={0} y={600} center mode="pop"><span style={{ ...K, fontSize: 52, color: M.red }}>VS</span></In>
      <In at={2.3} x={580} y={520} mode="throw" from="r">
        <Hero w={430}><Bar title="500万円繰上げ" icon="↩" /><div style={{ textAlign: "center", padding: "14px 0 18px" }}><span style={{ ...SER, fontSize: 96, color: G }}>10.2</span><span style={{ ...K, fontSize: 38 }}>万円</span></div></Hero>
      </In>
      <In at={3.2} x={0} y={790} center mode="pop"><Pill2 c={M.yellow} size={44}><span style={{ color: M.ink }}>月 約<R>1.7万円</R>軽く</span></Pill2></In>
      {f >= F(4.78) ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", transform: `scale(${pop(f, F(4.78))})` }}>
          <span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 24, boxShadow: `10px 10px 0 ${M.ink}`, padding: "8px 36px" }}>
            <span style={{ ...K, fontSize: 38 }}>20年間の支払利息 </span><span style={{ ...SER, fontSize: 104, color: M.red, lineHeight: 1.1 }}>約{yen(stepN(f, 6.52, 154, 0.7, 0))}万円</span><span style={{ ...K, fontSize: 44 }}>減</span>
          </span>
        </div>
      ) : null}
      <HandCircle at={6.9} x={600} y={990} r={300} ry={95} c={M.red} />
      <Note at={0.2}>※金利が2年後に1.7%、5年後に2.2%へ上がり、今すぐ500万円を返済額軽減型で繰上げた場合の試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 8 山場：繰上げ vs 米国債（30.88–42.90） ════════
const P8: React.FC = () => {
  const f = useCurrentFrame();
  const big = interpolate(f, [F(4.78), F(5.3)], [0, 1], out);
  const v = f >= F(9.78) ? stepN(f, 9.78, 1327, 1.3, 500) : 500;
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill c={G} at={0.05} no="02" icon="⚖">500万円の使い方</SectionPill>
      <In at={0.96} x={0} y={380} center mode="ghost"><span style={{ ...K, fontSize: 42 }}>もし <R>500万円</R> の余裕資金があるなら</span></In>
      {/* 左：繰上げ */}
      <In at={0.3} x={60} y={470} mode="throw" from="l">
        <div style={{ transform: `scale(${1 - 0.18 * big})`, transformOrigin: "0 0", filter: `grayscale(${big * 0.8})`, opacity: 1 - 0.35 * big }}>
          <Hero w={420} sh={M.orange}><Bar title="繰上げ返済" icon="🏠" bg={M.orange} /><div style={{ textAlign: "center", padding: "16px 0 20px" }}><div style={{ ...B, fontSize: 26, color: M.sub }}>20年間の利息</div><div style={{ ...SER, fontSize: 70 }}>約154<span style={{ ...K, fontSize: 32 }}>万円減</span></div></div></Hero>
        </div>
      </In>
      {/* 右：米国債 */}
      <In at={4.78} x={500} y={440} mode="throw" from="r">
        <div style={{ transform: `scale(${1 + 0.08 * big})`, transformOrigin: "100% 0" }}>
          <Hero w={500} sh={M.yellow}>
            <Bar title={<span>債券（米国債）</span>} icon="📜" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0 0" }}><GenSlot name="r2_us_flag" size={120} /><GenSlot name="r2_us_bond" size={170} /></div>
            <div style={{ textAlign: "center", ...K, fontSize: 32, opacity: f >= F(6.66) ? 1 : 0 }}>年5％で20年間</div>
            <div style={{ textAlign: "center", padding: "0 0 14px" }}><span style={{ ...K, fontSize: 26 }}>500万円 → </span>{f >= F(9.78) ? <><span style={{ ...SER, fontSize: 60, color: G, lineHeight: 1.1 }}>約{yen(v)}</span><span style={{ ...K, fontSize: 30 }}>万円</span></> : <span style={{ ...SER, fontSize: 60, color: M.gray, lineHeight: 1.1 }}>？</span>}</div>
          </Hero>
        </div>
      </In>
      {f >= F(11.0) ? <div style={{ position: "absolute", left: 560, top: 960, transform: `scale(${pop(f, F(11.0))})` }}><Pill2 c={M.yellow} size={36}><span style={{ color: M.ink }}>運用益 約<R>827万円</R></span></Pill2></div> : null}
      <HandCircle at={11.0} x={760} y={812} r={235} ry={62} c={M.red} />
      {/* 為替：ドルと円のシーソーが揺れる */}
      <In at={10.6} x={70} y={980} mode="pop">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ transform: `rotate(${Math.sin(f / 8) * 8}deg)` }}><GenSlot name="nb_seesaw" size={200} /></div>
          <span style={{ ...K, fontSize: 30 }}><span style={{ color: G }}>$</span>⇄<span style={{ color: M.red }}>¥</span> 為替で増減も</span>
        </div>
      </In>
      <Note at={10.6} top={1160}>※利息も年5%で運用し続けた場合（複利）・税引前。米国債はドル建てのため、円に戻すときの為替で円での金額が増えたり減ったりします（為替リスク）</Note>
    </AbsoluteFill>
  );
};

// ════════ 9 借りる側 → 貸す側（42.90–47.26） ════════
const P9: React.FC = () => {
  const f = useCurrentFrame();
  const flip = interpolate(f, [F(1.98), F(2.5)], [180, 0], out);
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill c={G} at={0.05} icon="⇄">立場を変える</SectionPill>
      <In at={1.0} x={60} y={420} mode="throw" from="l">
        <Hero w={430} sh={M.orange}><Bar title="住宅ローン" icon="🏠" bg={M.orange} /><div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0 18px" }}><GenSlot name="r2_borrow_person" size={260} /><span style={{ ...K, fontSize: 44 }}>お金を<span style={{ color: M.orange }}>借りる側</span></span><span style={{ ...B, fontSize: 24, color: M.sub }}>金利を払う</span></div></Hero>
      </In>
      <div style={{ position: "absolute", left: 470, top: 640, ...K, fontSize: 110, color: M.red, transform: `rotateY(${flip}deg)`, opacity: f >= F(1.98) ? 1 : 0 }}>➜</div>
      <In at={3.38} x={590} y={420} mode="throw" from="r">
        <Hero w={430}><Bar title="債券" icon="📜" /><div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0 18px" }}><GenSlot name="r2_lend_person" size={260} /><span style={{ ...K, fontSize: 44 }}>お金を<span style={{ color: G }}>貸す側</span></span><span style={{ ...B, fontSize: 24, color: M.sub }}>金利を受け取る</span></div></Hero>
      </In>
      <HandCircle at={3.8} x={805} y={720} r={250} ry={300} c={G} />
    </AbsoluteFill>
  );
};

// ════════ 10 上がった金利でお金を増やす（47.26–53.18） ════════
const P10: React.FC = () => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [F(2.14), F(2.5)], [0, 1], out);
  return (
    <AbsoluteFill>
      <Paper2 />
      <In at={0.3} x={0} y={430} center mode="pop">
        <span style={{ position: "relative", display: "inline-block", ...K, fontSize: 64, color: M.sub }}>
          金利が上がる ＝ ただの負担
          <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 12, background: M.red, borderRadius: 6, transform: `scaleX(${strike})`, transformOrigin: "0 50%" }} />
        </span>
      </In>
      <In at={2.48} x={0} y={600} center mode="pop"><span style={{ ...K, fontSize: 60, color: M.sub }}>↓</span></In>
      <In at={2.6} x={0} y={700} center mode="pop">
        <span style={{ display: "inline-block", background: M.yellow, border: `6px solid ${M.ink}`, borderRadius: 24, boxShadow: `10px 10px 0 ${M.ink}`, padding: "18px 40px" }}>
          <span style={{ display: "inline-flex" }}><BounceText text="上がった金利で" at={F(2.6)} size={66} stroke={false} /></span><br />
          <span style={{ display: "inline-flex" }}><BounceText text="お金を" at={F(3.2)} size={66} stroke={false} /><BounceText text="増やす" at={F(3.6)} size={66} color={G} stroke={false} /></span>
        </span>
      </In>
      <In at={4.1} x={160} y={1000} mode="pop"><Pill2 c="#fff" size={40}>僕は<R>こっちの考え方</R>が好き 👍</Pill2></In>
    </AbsoluteFill>
  );
};

// ════════ 11 繰上げる前に確認（53.18–63.10） ════════
const ROWS: [string, string, React.ReactNode, number][] = [
  ["rl_hourglass", "住宅ローン控除", <>残高が減ると<R>控除も減る</R></>, 1.78],
  ["rl_wallet_lock", "手元に残すお金", <>返したお金は<R>戻ってこない</R></>, 2.78],
  ["r2_umbrella_couple", "団信（団体信用生命保険）", <>返済が早く終わる分、<R>保障も早く終わる</R></>, 4.22],
  ["r2_worry_calendar", "年齢", <>完済の時期・老後とのバランス</>, 4.82],
  ["r2_family_future", "今後必要になるお金", <>教育費・老後資金は大丈夫？</>, 5.32],
];
const P11: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <SectionPill c={G} at={0.1} no="02" icon="⚠">繰上げ返済をするなら</SectionPill>
    {ROWS.map(([img, label, main, at], i) => (
      <In key={label} at={at} x={60} y={390 + i * 138} mode="throw" from="r" rot={3}>
        <div style={{ width: 960, height: 126, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 18, boxShadow: `6px 6px 0 ${M.ink}`, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", boxSizing: "border-box" }}>
          <Check at={at + 0.3} />
          <GenSlot name={img} size={110} />
          <div style={{ flex: 1 }}><div style={{ ...K, fontSize: 25, color: M.sub }}>{label}</div><div style={{ ...K, fontSize: 33, lineHeight: 1.2 }}>{main}</div></div>
        </div>
      </In>
    ))}
    <In at={6.4} x={60} y={1100} mode="pop"><Pill2 c={M.yellow} size={40}><span style={{ color: M.ink }}>ここまで考えて <R>判断</R></span></Pill2></In>
    <Note at={1.9} top={1190}>※期間短縮型で、返済期間が通算10年未満になると住宅ローン控除は受けられなくなります</Note>
  </AbsoluteFill>
);

// ════════ 12 借り換え＝天びん（63.10–73.62）：言った言葉がおもりとして皿に落ちる ════════
const WEIGHTS: [string, "l" | "r", number][] = [["金利差", "l", 5.08], ["諸費用", "r", 5.8], ["団信", "r", 6.28], ["残りの返済期間", "l", 6.96], ["ローン残高", "l", 8.26], ["手続き", "r", 9.26]];
const P12: React.FC = () => {
  const f = useCurrentFrame();
  let tilt = 0;
  WEIGHTS.forEach(([, s, at]) => { const k = interpolate(f, [F(at), F(at) + 6, F(at) + 12], [0, 1.4, 1], clamp); tilt += (s === "l" ? -1 : 1) * 3 * k; });
  const cnt2 = { l: 0, r: 0 };
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill c={G} at={0.1} no="03" icon="🏦">借り換え</SectionPill>
      <In at={3.8} x={0} y={380} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 16, padding: "8px 28px", ...K, fontSize: 42 }}>「金利が低い」<R>だけで決めない</R></span></In>
      <In at={0.6} x={280} y={650} mode="pop"><div style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "50% 80%" }}><GenSlot name="r2_balance_scale" size={520} /></div></In>
      <In at={0.9} x={60} y={716} mode="pop"><span style={{ ...K, fontSize: 28, color: G }}>得する側</span></In>
      <In at={0.9} x={870} y={716} mode="pop"><span style={{ ...K, fontSize: 28, color: M.red }}>かかる側</span></In>
      {WEIGHTS.map(([t, s, at]) => {
        const n = cnt2[s]++;
        if (f < F(at)) return null;
        const drop = interpolate(f, [F(at), F(at) + 8], [-300, 0], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
        const x = s === "l" ? 40 : 700;
        return <div key={t} style={{ position: "absolute", left: x, top: 920 - n * 78 + drop, width: 340, textAlign: "center" }}><span style={{ display: "inline-block", background: s === "l" ? "#E3F4EA" : "#FDE7E2", border: `5px solid ${s === "l" ? G : M.red}`, borderRadius: 14, padding: "6px 18px", ...K, fontSize: 32, boxShadow: `4px 4px 0 ${M.ink}` }}>{t}</span></div>;
      })}
      {/* 諸費用：「諸費用」と言った所で、中身の札（左）と、事務手数料の例（右）が出る */}
      <In at={5.8} x={70} y={455} mode="throw" from="r" rot={4}>
        <div style={{ width: 940, background: "#fff", border: `5px solid ${M.red}`, borderRadius: 16, boxShadow: `6px 6px 0 ${M.ink}`, overflow: "hidden" }}>
          <div style={{ background: M.red, color: "#fff", padding: "5px 16px", ...K, fontSize: 25 }}>🧾 かかることがある諸費用（例）</div>
          <div style={{ display: "flex", gap: 14, padding: "8px 16px 6px" }}>
            <div style={{ flex: "none", width: 420 }}>
              {(["事務手数料・保証料", "登記費用（登録免許税・司法書士）", "印紙税", "今のローンの完済手数料"] as const).map((t, i) => (
                <div key={t} style={{ ...B, fontSize: 22, lineHeight: 1.42, opacity: f >= F(6.0 + i * 0.12) ? 1 : 0 }}>・{t}</div>
              ))}
            </div>
            <div style={{ flex: 1, background: "#FFF6F3", border: `3px dashed ${M.red}`, borderRadius: 12, padding: "6px 12px", textAlign: "center", opacity: f >= F(6.9) ? 1 : 0, transform: f >= F(6.9) ? `scale(${pop(f, F(6.9))})` : undefined }}>
              <div style={{ ...B, fontSize: 21, color: M.sub }}>例：残り<b style={{ color: M.ink }}>4,000万円</b>を借り換え</div>
              <div style={{ ...K, fontSize: 22 }}>事務手数料（定率型 <R>2.2%</R>）なら</div>
              <div><span style={{ ...SER, fontSize: 58, color: M.red, lineHeight: 1.1 }}>約{yen(f >= F(7.3) ? stepN(f, 7.3, 88, 0.5, 0) : 0)}</span><span style={{ ...K, fontSize: 28 }}>万円</span></div>
            </div>
          </div>
          <div style={{ ...B, fontSize: 18, color: M.sub, padding: "0 16px 6px", opacity: f >= F(6.6) ? 1 : 0 }}>など ※定額型（数万円）の銀行もあります。銀行・契約により、かからない費用もあります</div>
        </div>
      </In>
      <In at={9.6} x={60} y={1185} mode="pop"><Pill2 c={M.yellow} size={36}><span style={{ color: M.ink }}>全部含めて <R>本当にプラス？</R></span></Pill2></In>
      <Note at={5.8} top={1262}>※諸費用は、銀行・借入額・物件で変わります。見積もりで確認を</Note>
    </AbsoluteFill>
  );
};

// ════════ 13 金利交渉（73.62–81.34） ════════
const P13: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <In at={0.38} x={0} y={320} center mode="pop"><Tag c={M.red} size={34}>意外と知られていない</Tag></In>
    <In at={1.7} x={0} y={400} center mode="pop"><span style={{ display: "inline-flex" }}><BounceText text="金利交渉" at={F(1.7)} size={96} stroke={false} /></span></In>
    <In at={2.6} x={240} y={580} mode="pop"><GenSlot name="r2_bank_counter" size={600} /></In>
    <In at={4.9} x={50} y={540} mode="pop" rot={-6}>
      <div style={{ position: "relative", background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 26, padding: "16px 28px", boxShadow: `6px 6px 0 ${M.ink}` }}>
        <span style={{ ...K, fontSize: 44 }}><TypeIn at={F(4.95)} step={2}>金利を下げられませんか？</TypeIn></span>
        <div style={{ position: "absolute", left: 120, bottom: -30, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `30px solid ${M.ink}` }} />
      </div>
    </In>
    <In at={6.98} x={60} y={1120} mode="pop"><Pill2 c={M.yellow} size={38}><span style={{ color: M.ink }}>借り換えの前に、<R>今の銀行</R>へ</span></Pill2></In>
    <Note at={6.98} top={1210}>※必ず下がるわけではありません</Note>
  </AbsoluteFill>
);

// ════════ 14 まとめ＝ツリー（81.34–91.60） ════════
const Leaf: React.FC<{ c: string; children: React.ReactNode; w?: number }> = ({ c, children, w = 380 }) => (
  <div style={{ width: w, background: "#fff", border: `5px solid ${M.ink}`, borderLeft: `14px solid ${c}`, borderRadius: 14, boxShadow: `5px 5px 0 ${M.ink}`, padding: "12px 16px", boxSizing: "border-box", ...K, fontSize: 36 }}>{children}</div>
);
const TL: React.FC<{ at: number; d: string; c: string }> = ({ at, d, c }) => {
  const f = useCurrentFrame();
  return <path d={d} fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(f, [F(at), F(at) + 9], [0, 1], out)} />;
};
const P14: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <SectionPill c={G} at={0.05} icon="✓">まとめ</SectionPill>
    <svg width={1080} height={1400} style={{ position: "absolute", left: 0, top: 0 }}>
      <TL at={0.4} d="M540 470 L540 500 L280 500 L280 535" c={M.ink} />
      <TL at={2.9} d="M540 500 L800 500 L800 535" c={M.ink} />
      <TL at={0.7} d="M130 625 L130 700 L170 700" c={G} />
      <TL at={1.7} d="M130 700 L130 830 L170 830" c={G} />
      <TL at={3.5} d="M650 625 L650 700 L690 700" c={M.orange} />
      <TL at={4.2} d="M650 700 L650 830 L690 830" c={M.orange} />
      <TL at={4.9} d="M360 900 L360 950 L540 950 L540 985" c={M.ink} />
      <TL at={4.9} d="M860 900 L860 950 L540 950" c={M.ink} />
    </svg>
    <In at={0.1} x={0} y={385} center mode="pop"><span style={{ display: "inline-block", background: M.yellow, border: `5px solid ${M.ink}`, borderRadius: 16, padding: "6px 30px", ...K, fontSize: 40 }}>金利が上がったときの対策</span></In>
    <In at={0.5} x={100} y={535} mode="pop"><span style={{ display: "inline-block", background: G, color: "#fff", border: `5px solid ${M.ink}`, borderRadius: 999, padding: "8px 30px", ...K, fontSize: 38, boxShadow: `5px 5px 0 ${M.ink}` }}>① まずやる</span></In>
    <In at={0.8} x={170} y={655} mode="pop"><Leaf c={G}>固定費の見直し</Leaf></In>
    <In at={1.84} x={170} y={785} mode="pop"><Leaf c={G}>資産形成</Leaf></In>
    <In at={3.04} x={600} y={535} mode="pop"><span style={{ display: "inline-block", background: M.orange, color: "#fff", border: `5px solid ${M.ink}`, borderRadius: 999, padding: "8px 30px", ...K, fontSize: 38, boxShadow: `5px 5px 0 ${M.ink}` }}>② そのうえで検討</span></In>
    <In at={3.64} x={690} y={655} mode="pop"><Leaf c={M.orange} w={340}>繰上げ返済</Leaf></In>
    <In at={4.38} x={690} y={785} mode="pop"><Leaf c={M.orange} w={340}>借り換え</Leaf></In>
    <In at={5.08} x={0} y={985} center mode="pop"><Pill2 c={M.yellow} size={40}><span style={{ color: M.ink }}>メリット・デメリットを押さえて検討</span></Pill2></In>
    <In at={8.1} x={70} y={1070} mode="pop"><GenSlot name="r2_signpost" size={170} /></In>
    <In at={8.1} x={260} y={1100} mode="pop"><span style={{ ...K, fontSize: 40, lineHeight: 1.3 }}>住宅ローンは<br /><R>家庭ごとに戦略が変わる</R></span></In>
  </AbsoluteFill>
);

// ════════ 15 CTA（91.60–98.06）：プロフ → 公式LINE → 面談予約 ════════
const P15: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Paper2 />
      <div style={{ position: "absolute", inset: -60, opacity: 0.25 * interpolate(f, [F(0.3), F(0.8)], [0, 1], clamp), filter: "blur(12px)" }}><Img src={staticFile("cta_nisabond/site.webp")} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
      <In at={0.05} until={3.6} x={0} y={300} center mode="ghost"><span style={{ ...K, fontSize: 50 }}>自分の場合は<R>どうしたらいい？</R></span></In>
      <TapCard at={0.3} until={3.6} src="cta_nisabond/igprofile.jpg" iw={1178} ih={915} x={90} y={380} w={900} hit={[0.03, 0.9, 0.52, 0.085]} dimAt={2.6} tapAt={3.18} label={<>プロフの<span style={{ color: M.red }}>リンク</span>から</>} labelAt={3.0} />
      <TapCard at={3.65} until={4.75} src="cta_nisabond/links.jpg" iw={1179} ih={525} x={90} y={420} w={900} hit={[0.02, 0.03, 0.96, 0.3]} dimAt={3.75} tapAt={4.1} label={<><span style={{ color: "#06C755" }}>公式LINE</span>を追加して</>} labelAt={3.8} labelTop={900} labelLeft={150} />
      <TapCard at={4.8} src="cta_nisabond/site.webp" iw={2000} ih={1349} x={90} y={400} w={900} hit={[0.665, 0.03, 0.315, 0.47]} dimAt={4.95} tapAt={5.25} label={<>個別相談は<span style={{ color: M.red }}>ここ</span>から！</>} labelAt={5.0} labelTop={1050} labelLeft={110} call={<>リッチメニューの「面談予約」</>} callAt={5.5} rot={1} />
    </AbsoluteFill>
  );
};

// ── ページの切り替え（marke-motion-grammar.md の数字）──
// 出る：最後の10f＝ため4f（+6,+18,+30,+42）→ 加速6f（-48,-228,-488,-808,-1188,-1700）＋ブレ。章の頭でない時は「ため」なし
// 入る：最初の8f＝+762 → 438,252,144,78,42,18,6,0（毎フレーム約0.58倍）＋ブレ
const EXIT_C = [6, 18, 30, 42, -48, -228, -488, -808, -1188, -1700];
const EXIT_S = [0, 0, 0, 0, -48, -228, -488, -808, -1188, -1700];
const ENTER = [762, 438, 252, 144, 78, 42, 18, 6, 0];
const PageMove: React.FC<{ dur: number; chapterNext: boolean; first: boolean; children: React.ReactNode }> = ({ dur, chapterNext, first, children }) => {
  const f = useCurrentFrame();
  let y = 0, v = 0;
  if (!first && f < ENTER.length) { y = ENTER[f]; v = f + 1 < ENTER.length ? ENTER[f] - ENTER[f + 1] : 0; }
  const ex = chapterNext ? EXIT_C : EXIT_S;
  const k = f - (dur - ex.length);
  if (k >= 0 && dur > 30) { y = ex[k]; v = Math.abs(ex[k] - (ex[k - 1] ?? 0)); }
  const blur = v > 40 ? Math.min(18, v / 22) : 0;
  return <AbsoluteFill style={{ transform: `translateY(${y}px)`, filter: blur ? `blur(${blur}px)` : undefined }}>{first ? children : <Sequence from={-4} layout="none">{children}</Sequence>}</AbsoluteFill>; // 中身を4f先に出して、着地した時にはもう見えているように
};
const CHAPTER = new Set([1, 3, 5, 7, 10, 11, 12, 13, 14]); // 次のページが章の頭（まずやる・本題・繰上げの例・500万円の使い方・繰上げ前の確認・借り換え・交渉・まとめ・CTA）
export const RL2_PAGES: [number, React.FC][] = [[0, P1], [6.62, P2], [10.04, P3], [15.5, P4], [17.92, P5], [19.96, P6], [23.02, P7], [30.88, P8], [42.9, P9], [47.26, P10], [53.18, P11], [63.1, P12], [73.62, P13], [81.34, P14], [91.6, P15]];
export const LOANTAISAKU2_FRAMES = F(98.3);

// 右下の太一：口パク＋まばたき
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  const lv = RL2_MOUTH.charCodeAt(Math.min(RL2_MOUTH.length - 1, f)) - 48;
  const blink = f % 96 > 92 && lv === 0;
  const name = blink ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 3) % 4 ? "taichi_talk_open" : "taichi_talk_mid") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  return <div style={{ position: "absolute", left: 800, top: 1095 + Math.sin(f / 10) * 5, width: 250, height: 250 }}><GenSlot name={name} size={250} /></div>;
};

// 字幕（話した言葉どおり・*黄色マーカー* !赤!）
const SUBS: [number, string][] = [
  [0, "住宅ローン *変動金利*で借りている人"], [2.04, "すでに返済額が上がっている人も"], [3.78, "これから上がる人も"], [4.8, "どう*対策*すればいいのか解説します"],
  [6.62, "まず*固定費の見直し*と*資産形成*"], [8.78, "これは!まずやってほしい!です"], [10.04, "資産形成は*長期・積立・分散*で"], [12.04, "コツコツ続ける"], [12.96, "余裕があるなら"], [13.98, "*積立額*を増やすのもありです"],
  [15.5, "で ここからが本題"], [16.76, "*繰上げ返済*と*借り換え*"], [17.92, "僕は繰上げ返済は!おすすめしません!"],
  [19.96, "例えば これらの条件で"], [21.46, "金利がこのように上がった場合"], [23.02, "*500万円*を繰上げ返済すると"], [24.88, "5年後の返済額は"], [26.04, "月約*1万7,000円*下がって"], [27.8, "20年間で支払う利息も"], [29.26, "約!154万円!減ります"],
  [30.88, "一方で もし*500万円*の"], [32.52, "余裕資金があるなら"], [33.66, "僕だったら 繰上げ返済ではなくて"], [35.66, "*債券*の購入を検討します"], [36.98, "例えば 年5%で20年間運用すると"], [39.7, "500万円が約!1,327万円!"], [42.1, "になる計算です"],
  [42.9, "住宅ローンだと お金を*借りる側*"], [44.88, "でも債券を持てば"], [45.88, "お金を*貸す側*に回れます"], [47.26, "金利が上がるのを"], [48.26, "ただの負担で終わらせずに"], [49.74, "*上がった金利*で お金を増やす"], [51.36, "僕はこっちの考え方が好きです"],
  [53.18, "それに 繰上げ返済をするなら"], [54.96, "*住宅ローン控除*"], [55.96, "*手元に残すお金*"], [57.4, "*団信*"], [58.0, "*年齢*や*今後必要になるお金*"], [59.6, "ここまで考えて"], [60.5, "本当に繰上げ返済をするのか"], [62.2, "*判断*してください"],
  [63.1, "次に*借り換え*"], [64.26, "今より低い金利を見つけたから"], [65.86, "すぐ借り換えるっていう"], [66.9, "単純な話でもありません"], [68.18, "*金利差* *諸費用*や*団信*"], [70.06, "*残りの返済期間* *ローン残高*"], [72.36, "*手続き*なども変わってきます"],
  [73.62, "そして 意外と知られていないのが"], [75.32, "!金利交渉!"], [76.24, "借り換える前に"], [77.46, "今借りている銀行に"], [78.52, "金利を下げられないか"], [79.8, "交渉してみるのも一つの手です"],
  [81.34, "まとめると"], [81.94, "*固定費の見直し*と*資産形成*は"], [83.72, "まずやる"], [84.38, "そのうえで"], [84.98, "繰上げ返済も借り換えも"], [86.42, "*メリット・デメリット*を押さえて"], [87.72, "検討してください"], [88.68, "住宅ローンは"], [89.44, "*家庭によって戦略*が大きく変わります"],
  [91.6, "自分の場合はどうしたらいいのか"], [93.14, "気になる方は ご希望があれば"], [94.78, "プロフから*公式LINE*を追加して"], [96.42, "*個別相談*にお申し込みください"],
];

const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  ...RL2_PAGES.slice(1).map(([t]) => s("u03s", t - 0.42, 0.24)),
  s("u02s", 0.35, 0.18), s("u03s", 0.78, 0.2), s("u05s", 1.6, 0.24), s("u03s", 2.04, 0.22), s("u05s", 2.7, 0.24), s("u03s", 3.2, 0.18), s("u04", 3.55, 0.28), s("u02s", 3.78, 0.18), s("u05", 4.8, 0.24), ...[0, 1, 2, 3].map((i) => s("u02s", 5.15 + i * 0.1, 0.14)), s("u05s", 5.95, 0.2),
  s("u02s", 6.98, 0.18), s("u02s", 7.94, 0.18), s("u04", 9.0, 0.3),
  s("u02s", 10.74, 0.16), s("u02s", 11.26, 0.16), s("u02s", 11.58, 0.16), s("u06", 13.98, 0.22),
  s("u02s", 16.76, 0.18), s("u02s", 17.5, 0.18), s("u04", 19.12, 0.32),
  s("u02s", 21.46, 0.14), s("u02s", 21.91, 0.14), s("u02s", 22.36, 0.16),
  s("u02s", 24.92, 0.18), s("u05s", 26.22, 0.22), s("u06", 27.8, 0.22), s("u09", 29.54, 0.3),
  s("u02s", 35.66, 0.2), s("u06", 40.66, 0.26), s("u09", 41.9, 0.3),
  s("u02s", 44.14, 0.2), s("u05", 44.88, 0.22), s("u02s", 46.28, 0.2),
  s("u05s", 49.4, 0.24), s("u05", 49.74, 0.24), s("u10", 51.36, 0.24),
  s("u02s", 54.96, 0.16), s("u02s", 55.96, 0.16), s("u02s", 57.4, 0.16), s("u02s", 58.0, 0.16), s("u02s", 58.5, 0.16), s("u05", 62.2, 0.22),
  ...[68.18, 68.9, 69.38, 70.06, 71.36, 72.36].map((t) => s("u05s", t, 0.2)), s("u04", 75.32, 0.28),
  s("u02s", 78.52, 0.16), s("u05", 85.0, 0.2), s("u05", 86.42, 0.22), s("u10", 89.44, 0.24), s("u07", 94.78, 0.24),
];

const SAFE = 0.9, SAFE_X = 540 - 540 * SAFE, SAFE_Y = 300 - 280 * SAFE;
export const LoanTaisaku2Reel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.paper, fontFamily: FONT }}>
    <Audio src={staticFile("rl2-narration.wav")} />
    <SfxTrack cues={CUES} />
    <AbsoluteFill style={{ background: M.paper, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${SAFE_X}px, ${SAFE_Y}px) scale(${SAFE})`, transformOrigin: "0 0" }}>
      {RL2_PAGES.map(([t, P], i) => {
        const st = i === 0 ? 0 : t - 0.12;
        const end = i + 1 < RL2_PAGES.length ? RL2_PAGES[i + 1][0] - 0.12 : 98.3;
        const dur = F(end) - F(st);
        return <Sequence key={i} from={F(st)} durationInFrames={dur}><PageMove dur={dur} first={i === 0} chapterNext={CHAPTER.has(i + 1) && i + 1 < RL2_PAGES.length}><P /></PageMove></Sequence>;
      })}
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, bottom: 0, background: `linear-gradient(${M.paper}00, ${M.paper} 50px)` }} />
    <Chara />
    <Captions subs={SUBS} end={98.0} maxW={740} size={0.78} kcol={{ g: M.red, r: M.red }} top={1352} swap />
  </AbsoluteFill>
);
