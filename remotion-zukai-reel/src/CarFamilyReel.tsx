import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { GenSlot } from "./MileLifePlan";
import { Captions } from "./BourakuReel";
import { BounceText } from "./components/fx";
import { TypeIn, wipeIn } from "./components/zukaiKit";
import { F, clamp, out, K, B, SER, M, pop, yen, cnt, R, In, Tag, Stamp, Paper2, SectionPill, Pill2, HandCircle, Dim, shake } from "./components/marke";

// ════════════════════════════════════════════════════════════════════
//  家族シリーズ①「車編」：お金が残る家族と、残らない家族（AIナレーション public/car1-narration.mp3 102.2秒）
//  型＝参考⑦（同じ条件の2人・部品が1〜2秒ごとに足される・人ごとに色を固定）＋これまでの演出（ノート背景・シュッと切り替え・段で上がる数字・ハンコ・手書きの丸）
//  色：A家＝オレンジ／B家＝緑（最後まで固定）
//  数字（計算で確認済み・仮定の試算）：
//   A：600万円・残クレ5年・5.5%・残価300万 → 月71,053円／5年の利息 約126万（うち残価分 約83万）
//      2台目 630万（精算30万を上乗せ）→ 月76,784円／10年の利息 約257万／10年の支払い 約887万
//   B：300万円・銀行ローン10年・2.5% → 月28,281円／利息 約39万／差額 42,773円を積立（元本 5年 約257万・10年 約513万）
// ════════════════════════════════════════════════════════════════════
const A = M.orange, G = M.green;
const Hero: React.FC<{ w?: number; bg?: string; sh?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ w = 900, bg = "#fff", sh = G, children, style }) => (
  <div style={{ width: w, background: bg, border: `6px solid ${M.ink}`, borderRadius: 22, boxShadow: `10px 10px 0 ${sh}`, boxSizing: "border-box", position: "relative", overflow: "hidden", ...style }}>{children}</div>
);
const Bar: React.FC<{ title: React.ReactNode; bg?: string }> = ({ title, bg = G }) => (
  <div style={{ background: bg, color: "#fff", padding: "8px 22px", ...K, fontSize: 34, textAlign: "center" }}>{title}</div>
);
const Note: React.FC<{ at: number; children: React.ReactNode; top?: number }> = ({ at, children, top = 1250 }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return <div style={{ position: "absolute", left: 60, width: 960, top, ...B, fontSize: 22, lineHeight: 1.45, color: M.sub, opacity: interpolate(f - F(at), [0, 6], [0, 1], clamp) }}>{children}</div>;
};
const stepN = (f: number, at: number, to: number, dur: number, from: number) => (f < F(at) ? from : cnt(F(at) + Math.floor((f - F(at)) / 3) * 3, at, to, dur, from)); // 3fごとに段で上がる
const Head: React.FC<{ at: number; c: string; pill: string; icon?: string; children?: React.ReactNode }> = ({ at, c, pill, icon = "●", children }) => (
  <>
    <SectionPill c={c} at={at} icon={icon}>{pill}</SectionPill>
    {children ? <In at={at + 0.15} x={0} y={385} center mode="ghost"><span style={{ ...K, fontSize: 50 }}>{children}</span></In> : null}
  </>
);
// 家族のカード（色の帯つき）
const Fam: React.FC<{ who: "A" | "B"; img: string; size?: number; w?: number; children?: React.ReactNode; title?: React.ReactNode }> = ({ who, img, size = 280, w = 440, children, title }) => {
  const c = who === "A" ? A : G;
  return <Hero w={w} sh={c}><Bar bg={c} title={title ?? `${who}家`} /><div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 14px" }}><GenSlot name={img} size={size} />{children}</div></Hero>;
};
// 半円のメーター（毎月の支払い）
const Meter: React.FC<{ v: number; max?: number; c: string; label?: React.ReactNode }> = ({ v, max = 100000, c, label }) => {
  const p = Math.max(0, Math.min(1, v / max));
  const r = 200, cx = 260, cy = 240, th = Math.PI * (1 - p);
  const arc = `M${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <div style={{ width: 520, textAlign: "center" }}>
      <svg width={520} height={280} viewBox="0 0 520 280">
        <path d={arc} fill="none" stroke="#EDE5C4" strokeWidth={48} strokeLinecap="round" />
        {p > 0.005 ? <path d={arc} fill="none" stroke={c} strokeWidth={48} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 2`} /> : null}
        {[0, 0.25, 0.5, 0.75, 1].map((k) => { const a = Math.PI * (1 - k); return <line key={k} x1={cx + (r - 40) * Math.cos(a)} y1={cy - (r - 40) * Math.sin(a)} x2={cx + (r - 54) * Math.cos(a)} y2={cy - (r - 54) * Math.sin(a)} stroke={M.sub} strokeWidth={5} strokeLinecap="round" />; })}
        <text x={cx - r} y={cy + 40} textAnchor="middle" style={{ ...B, fontSize: 22, fill: M.sub }}>0</text>
        <text x={cx + r} y={cy + 40} textAnchor="middle" style={{ ...B, fontSize: 22, fill: M.sub }}>10万</text>
        <line x1={cx} y1={cy} x2={cx + (r - 62) * Math.cos(th)} y2={cy - (r - 62) * Math.sin(th)} stroke={M.ink} strokeWidth={11} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={20} fill={M.ink} />
      </svg>
      <div style={{ marginTop: -18 }}><span style={{ ...K, fontSize: 34 }}>月 </span><span style={{ ...SER, fontSize: 76, color: c, lineHeight: 1.05 }}>{yen(v)}</span><span style={{ ...K, fontSize: 34 }}>円</span></div>
      {label}
    </div>
  );
};
const Bubble: React.FC<{ children: React.ReactNode; w?: number; tail?: "l" | "r" | "b"; size?: number }> = ({ children, w, tail = "b", size = 40 }) => (
  <div style={{ position: "relative", width: w, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 26, padding: "14px 26px", boxShadow: `6px 6px 0 ${M.ink}`, ...K, fontSize: size, lineHeight: 1.3, boxSizing: "border-box" }}>
    {children}
    <div style={{ position: "absolute", ...(tail === "b" ? { left: 90, bottom: -30 } : tail === "l" ? { left: -30, top: 40 } : { right: -30, top: 40 }), width: 0, height: 0, ...(tail === "b" ? { borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `30px solid ${M.ink}` } : tail === "l" ? { borderTop: "16px solid transparent", borderBottom: "16px solid transparent", borderRight: `30px solid ${M.ink}` } : { borderTop: "16px solid transparent", borderBottom: "16px solid transparent", borderLeft: `30px solid ${M.ink}` }) }} />
  </div>
);
const Chip: React.FC<{ c: string; children: React.ReactNode; size?: number }> = ({ c, children, size = 34 }) => (
  <span style={{ display: "inline-block", background: "#fff", border: `4px solid ${c}`, color: M.ink, borderRadius: 12, padding: "4px 16px", ...K, fontSize: size, boxShadow: `4px 4px 0 ${M.ink}`, whiteSpace: "nowrap" }}>{children}</span>
);
// 札が順に足される行
const Line: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const f = useCurrentFrame();
  return <div style={{ ...K, fontSize: 32, lineHeight: 1.5, ...(f >= F(at) ? wipeIn(f, F(at)) : { opacity: 0 }) }}>{children}</div>;
};

// ════════ 1 冒頭（0–5.62）：同じ2家族のカード → VS → 車の選び方 ════════
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const LAND = [600, 300, 150, 76, 38, 18, 8, 3, 0]; // 入り＝毎フレーム約半分になる急ブレーキ
  const land = (at: number) => { const k = f - F(at); return k < 0 ? 2000 : LAND[Math.min(LAND.length - 1, k)]; };
  const up = interpolate(f, [F(3.45), F(3.45) + 8], [0, 1], out);
  return (
    <AbsoluteFill>
      <Paper2 />
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", lineHeight: 1.1 }}>
        <span style={{ display: "inline-flex" }}><BounceText text="お金が残る" at={0} size={86} color={G} stroke={false} step={1} /><BounceText text="家族と" at={5} size={86} stroke={false} step={1} /></span><br />
        <span style={{ display: "inline-flex" }}><BounceText text="残らない" at={F(1.1)} size={86} color={A} stroke={false} step={1} /><BounceText text="家族" at={F(1.1) + 5} size={86} stroke={false} step={1} /></span>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translateY(${-60 * up}px) scale(${1 - 0.12 * up})`, transformOrigin: "540px 500px" }}>
        <div style={{ position: "absolute", left: 590, top: 520 + land(0) }}><Fam who="B" img="car_b_family_2" size={300} w={430} title="お金が残る？" /></div>
        <div style={{ position: "absolute", left: 60, top: 520 + land(1.1) }}><Fam who="A" img="car_a_family_2" size={300} w={430} title="残らない？" /></div>
        <In at={1.6} x={0} y={700} center mode="pop"><span style={{ display: "inline-block", background: M.red, color: "#fff", border: `5px solid ${M.ink}`, borderRadius: 999, width: 110, height: 110, lineHeight: "100px", textAlign: "center", ...K, fontSize: 54, boxShadow: `5px 5px 0 ${M.ink}` }}>VS</span></In>
        <In at={2.15} x={360} y={540} mode="pop" rot={-10}><span style={{ ...K, fontSize: 110, color: A }}>?</span></In>
        <In at={2.4} x={900} y={540} mode="pop" rot={10}><span style={{ ...K, fontSize: 110, color: G }}>?</span></In>
      </div>
      <In at={3.58} x={70} y={930} mode="throw" from="d" rot={-4}><GenSlot name="car_two_roads" size={330} /></In>
      {f >= F(3.9) ? <div style={{ position: "absolute", left: 420, top: 1010 }}>
        <Tag c={M.yellow} size={30}>家族シリーズ</Tag>
        <div style={{ marginTop: 12, display: "inline-flex" }}><BounceText text="車の選び方" at={F(4.2)} size={84} stroke={false} /></div>
      </div> : null}
    </AbsoluteFill>
  );
};

// ════════ 2 前提（5.62–12.56）：プロフィールに1行ずつ足される ════════
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const S = 5.62, a = (t: number) => t - S;
  const prof = (who: "A" | "B", x: number, at: number) => (
    <In at={at} x={x} y={470} mode="throw" from={who === "A" ? "l" : "r"} rot={who === "A" ? -6 : 6}>
      <Fam who={who} img={`car_${who.toLowerCase()}_family_2`} size={220} w={450}>
        <div style={{ width: 380, marginTop: 6 }}>
          <Line at={a(8.26)}>👫 夫婦 27歳</Line>
          <Line at={a(9.08)}>👶 子ども 2歳・1人</Line>
          <Line at={a(10.42)}>💴 世帯年収 <span style={{ ...SER, fontSize: 44, color: who === "A" ? A : G }}>{yen(stepN(f, a(11.1), 600, 0.45, 0))}</span>万円</Line>
        </div>
      </Fam>
    </In>
  );
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={M.ink} pill="前提" icon="📋">同じ収入の<R c={M.red}>2組の家族</R></Head>
      {prof("A", 60, 0.75)}
      {prof("B", 570, 1.0)}
      <In at={a(11.9)} x={0} y={790} center mode="pop"><span style={{ ...K, fontSize: 90, color: M.red }}>＝</span></In>
      <Stamp at={a(11.95)} x={330} y={1120} text="条件は同じ" size={70} rot={-6} />
    </AbsoluteFill>
  );
};

// ════════ 3 A家の車（12.56–18.96）：600万円・残クレ・5年 → メーターが月7.1万円まで回る ════════
const P3: React.FC = () => {
  const f = useCurrentFrame();
  const S = 12.56, a = (t: number) => t - S;
  const v = stepN(f, a(17.06), 71053, 1.0, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家の車" icon="🚗" />
      <In at={0.2} x={40} y={360} mode="throw" from="l" rot={-6}><GenSlot name="car_a_minivan" size={470} /></In>
      <In at={a(13.4)} x={560} y={400} mode="pop" rot={4}><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${A}`, borderRadius: 18, padding: "6px 24px", boxShadow: `6px 6px 0 ${M.ink}` }}><span style={{ ...K, fontSize: 34 }}>約</span><span style={{ ...SER, fontSize: 96, color: A }}>600</span><span style={{ ...K, fontSize: 40 }}>万円</span></span></In>
      <In at={a(14.32)} x={590} y={560} mode="pop"><Chip c={A}>大きなミニバン</Chip></In>
      <Stamp at={a(15.06)} x={600} y={650} text="残クレ" size={86} c={A} rot={-8} />
      <In at={a(16.04)} x={630} y={790} mode="pop"><Chip c={A} size={40}>5年契約</Chip></In>
      <In at={a(16.9)} x={280} y={860} mode="rise"><Meter v={v} c={A} /></In>
      <HandCircle at={a(18.1)} x={540} y={1162} r={250} ry={70} c={M.red} />
      <Note at={a(16.9)} top={1262}>※例：金利5.5%・5年（60回）・最後に残す額（残価）300万円で試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 4 月々が安い理由（18.96–25.72）：600万円の棒が割れる → 残した300万円にも利息 ════════
const P4: React.FC = () => {
  const f = useCurrentFrame();
  const S = 18.96, a = (t: number) => t - S;
  const split = interpolate(f, [F(a(20.5)), F(a(20.5)) + 9], [0, 1], out);
  const intA = interpolate(f, [F(a(24.56)), F(a(24.56)) + 12], [0, 1], out);
  const W = 900, gap = 30 * split;
  const part = (x: number, w: number, bg: string, label: React.ReactNode, sub: React.ReactNode, hatch?: boolean) => (
    <div style={{ position: "absolute", left: x, top: 0, width: w, height: 190, background: hatch ? `repeating-linear-gradient(-45deg, #fff 0 16px, #FBE3D8 16px 32px)` : bg, border: `6px solid ${M.ink}`, borderRadius: 16, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `6px 6px 0 ${M.ink}` }}>
      <div style={{ ...K, fontSize: 30, color: hatch ? M.ink : "#fff" }}>{label}</div>
      <div><span style={{ ...SER, fontSize: 70, color: hatch ? A : "#fff" }}>{sub}</span><span style={{ ...K, fontSize: 32, color: hatch ? M.ink : "#fff" }}>万円</span></div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🚗">月々が<R c={A}>安い</R>のは？</Head>
      <In at={0.3} x={90} y={580} mode="rise">
        <div style={{ position: "relative", width: W, height: 200 }}>
          {split < 0.02 ? part(0, W, A, "車の値段", "約600") : (
            <>
              {part(0, W / 2 - gap / 2, A, "5年で払っていく", "300")}
              {part(W / 2 + gap / 2, W / 2 - gap / 2, A, "最後に残す（残価）", "300", true)}
            </>
          )}
        </div>
      </In>
      {f >= F(a(20.5)) ? <div style={{ position: "absolute", left: 90 + W / 2 + 15, top: 800, width: W / 2 - 15, textAlign: "center", ...K, fontSize: 30, opacity: split }}>5年後に<R c={A}>返すか・払うか</R></div> : null}
      <HandCircle at={a(22.92)} x={765} y={675} r={220} ry={130} c={M.red} />
      {/* 利息：両方の上に赤い札が乗る */}
      {f >= F(a(24.56)) ? (
        <>
          {[0, 1].map((i) => (
            <div key={i} style={{ position: "absolute", left: 90 + i * (W / 2 + 15), width: W / 2 - 15, top: 500 + (1 - intA) * -200, opacity: intA, textAlign: "center" }}>
              <span style={{ display: "inline-block", background: M.red, color: "#fff", border: `5px solid ${M.ink}`, borderRadius: 12, padding: "4px 22px", ...K, fontSize: 36, boxShadow: `4px 4px 0 ${M.ink}` }}>＋利息</span>
            </div>
          ))}
        </>
      ) : null}
      <In at={a(22.92)} x={0} y={880} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 22, padding: "14px 34px", boxShadow: `8px 8px 0 ${M.red}`, ...K, fontSize: 48, lineHeight: 1.35, textAlign: "center" }}>残した<R c={A}>300万円</R>にも<br /><R>5年間ずっと利息</R>がかかる</span></In>
      <In at={a(24.9)} x={0} y={1100} center mode="pop"><Pill2 c={M.yellow} size={36}><span style={{ color: M.ink }}>5年の利息 約<R>126万円</R>（うち残価分 約83万円）</span></Pill2></In>
      <Note at={a(24.9)} top={1200}>※例：600万円・金利5.5%・5年・残価300万円で試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 5 自分のものではない（25.72–32.90）→「月々払えるなら大丈夫」 ════════
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const S = 25.72, a = (t: number) => t - S;
  const gray = interpolate(f, [F(a(30.66)), F(a(30.66)) + 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="📄">払い終わるまで…</Head>
      <In at={0.4} x={50} y={450} mode="throw" from="l" rot={-6}><GenSlot name="car_paper_owner" size={340} /></In>
      <In at={a(26.6)} x={420} y={470} mode="throw" from="r" rot={5}>
        <div style={{ width: 590, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 16, boxShadow: `6px 6px 0 ${M.ink}`, overflow: "hidden" }}>
          <div style={{ background: M.sub, color: "#fff", padding: "6px 18px", ...K, fontSize: 26 }}>車の書類（イメージ）</div>
          <div style={{ padding: "12px 20px", ...K, fontSize: 32, lineHeight: 1.6 }}>
            <div>所有者：<R c={M.red}>販売店・信販会社など</R></div>
            <div>使用者：<R c={A}>A家</R></div>
          </div>
        </div>
      </In>
      <HandCircle at={a(27.66)} x={720} y={598} r={260} ry={42} c={M.red} />
      <Stamp at={a(27.9)} x={470} y={700} text="自分のものではない" size={52} rot={-5} />
      {/* 「月々払えるなら大丈夫」 */}
      <div style={{ filter: `grayscale(${gray})`, opacity: 1 - 0.25 * gray }}>
        <In at={a(29.14)} x={60} y={830} mode="pop"><GenSlot name="car_a_happy_drive" size={420} /></In>
        <In at={a(29.2)} x={480} y={880} mode="pop" rot={4}><Bubble tail="l" w={560} size={42}><TypeIn at={F(a(29.2))} step={2}>月々払えるなら<br />大丈夫！</TypeIn></Bubble></In>
      </div>
      <In at={a(31.3)} x={520} y={1100} mode="ghost"><span style={{ ...K, fontSize: 40, color: M.sub }}>…と、思っていました</span></In>
    </AbsoluteFill>
  );
};

// ════════ 6 B家の車（32.90–38.26）：300万円・銀行ローン10年 → メーターが月2.8万円 ════════
const P6: React.FC = () => {
  const f = useCurrentFrame();
  const S = 32.9, a = (t: number) => t - S;
  const v = stepN(f, a(36.42), 28281, 0.9, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={G} pill="B家の車" icon="🚙" />
      <In at={0.2} x={600} y={380} mode="throw" from="r" rot={6}><GenSlot name="car_b_minivan" size={420} /></In>
      <In at={a(33.7)} x={70} y={410} mode="pop" rot={-4}><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${G}`, borderRadius: 18, padding: "6px 24px", boxShadow: `6px 6px 0 ${M.ink}` }}><span style={{ ...K, fontSize: 34 }}>約</span><span style={{ ...SER, fontSize: 96, color: G }}>300</span><span style={{ ...K, fontSize: 40 }}>万円</span></span></In>
      <In at={a(34.6)} x={90} y={570} mode="pop"><Chip c={G}>ミニバン</Chip></In>
      <In at={a(35.24)} x={90} y={650} mode="pop"><Chip c={G} size={40}>銀行ローン</Chip></In>
      <In at={a(35.84)} x={350} y={650} mode="pop"><Chip c={G} size={40}>10年</Chip></In>
      <In at={a(36.2)} x={280} y={860} mode="rise"><Meter v={v} c={G} /></In>
      <HandCircle at={a(37.6)} x={540} y={1162} r={250} ry={70} c={G} />
      <Note at={a(36.2)} top={1262}>※例：金利2.5%・10年（120回）で試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 7 毎月出せるのは同じ7.1万円（38.26–45.84）：B家の棒だけ割れる → 4.3万円を先に積立 ════════
const P7: React.FC = () => {
  const f = useCurrentFrame();
  const S = 38.26, a = (t: number) => t - S;
  const sp = interpolate(f, [F(a(42.4)), F(a(42.4)) + 9], [0, 1], out);
  const W = 760, wl = W * (28281 / 71053);
  const row = (who: "A" | "B", y: number, at: number) => {
    const c = who === "A" ? A : G;
    return (
      <In at={at} x={60} y={y} mode="throw" from="l" rot={-3}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 150, ...K, fontSize: 44, color: c, textAlign: "right" }}>{who}家</span>
          <div style={{ position: "relative", width: W, height: 150 }}>
            {who === "A" || sp < 0.02 ? (
              <div style={{ position: "absolute", inset: 0, background: c, border: `6px solid ${M.ink}`, borderRadius: 16, boxShadow: `6px 6px 0 ${M.ink}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, color: "#fff", fontSize: 34 }}>月 <span style={{ ...SER, fontSize: 72, margin: "0 6px" }}>7.1</span>万円{who === "A" ? <span style={{ fontSize: 28, marginLeft: 10 }}>→ 全部 車</span> : null}</div>
            ) : (
              <>
                <div style={{ position: "absolute", left: 0, top: 0, width: wl - 12 * sp, height: 150, background: G, border: `6px solid ${M.ink}`, borderRadius: 16, boxShadow: `6px 6px 0 ${M.ink}`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}><span style={{ ...K, fontSize: 24 }}>車のローン</span><span style={{ ...SER, fontSize: 54 }}>2.8<span style={{ ...K, fontSize: 26 }}>万</span></span></div>
                <div style={{ position: "absolute", left: wl + 12 * sp, top: 0, width: W - wl - 12 * sp, height: 150, background: "#fff", border: `6px solid ${G}`, borderRadius: 16, boxShadow: `6px 6px 0 ${M.ink}`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - sp) * -20}px)` }}><span style={{ ...K, fontSize: 26, color: G }}>先に積立</span><span style={{ ...SER, fontSize: 60, color: G }}>4.3<span style={{ ...K, fontSize: 28 }}>万円</span></span></div>
              </>
            )}
          </div>
        </div>
      </In>
    );
  };
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={G} pill="B家" icon="💡">毎月出せるのは<R c={M.red}>同じ</R></Head>
      {row("A", 490, a(39.5))}
      {row("B", 700, a(40.3))}
      <In at={a(40.9)} x={0} y={640} center mode="pop"><span style={{ ...K, fontSize: 44, color: M.red, marginLeft: 160 }}>＝ 同じ額</span></In>
      <In at={a(44.3)} x={130} y={900} mode="pop"><GenSlot name="car_b_piggy" size={330} /></In>
      <In at={a(43.96)} x={480} y={960} mode="pop"><Pill2 c={G} size={40}>毎月 <span style={{ color: M.yellow }}>先に</span> 積立</Pill2></In>
      <Stamp at={a(44.6)} x={520} y={1080} text="使う前に よける" size={54} c={G} rot={-5} />
      <Note at={a(42.4)} top={1262}>※71,053円 − 28,281円 ＝ 42,772円（約4.3万円）</Note>
    </AbsoluteFill>
  );
};

// ════════ 8 5年後（45.84–49.50）：時間の棒が5年まで進む → A家の残クレが終わる ════════
const P8: React.FC = () => {
  const f = useCurrentFrame();
  const S = 45.84, a = (t: number) => t - S;
  const prog = interpolate(f, [F(0.1), F(0.9)], [0, 0.5], out);
  const age = Math.round(2 + 5 * (prog / 0.5));
  return (
    <AbsoluteFill>
      <Paper2 />
      <In at={0.05} x={0} y={300} center mode="pop"><span style={{ display: "inline-block", background: M.ink, borderRadius: 18, padding: "10px 46px", transform: "rotate(-2deg)", boxShadow: `6px 6px 0 ${M.red}` }}><BounceText text="5年後" at={F(0.1)} size={92} color={M.yellow} stroke={false} /></span></In>
      <div style={{ position: "absolute", left: 90, top: 520, width: 900 }}>
        <div style={{ height: 40, background: "#EDE5C4", border: `5px solid ${M.ink}`, borderRadius: 20, overflow: "hidden" }}><div style={{ width: `${prog * 100}%`, height: "100%", background: `repeating-linear-gradient(-45deg, ${M.yellow} 0 18px, #F6CF4A 18px 36px)` }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", ...K, fontSize: 30, marginTop: 8, color: M.sub }}><span>今</span><span style={{ color: M.ink }}>5年</span><span>10年</span></div>
        <div style={{ position: "absolute", left: `${prog * 100}%`, top: -78, transform: "translateX(-50%)", ...K, fontSize: 34, whiteSpace: "nowrap" }}>子ども <span style={{ ...SER, fontSize: 52, color: M.red }}>{age}</span>歳</div>
      </div>
      <In at={a(47.7)} x={70} y={690} mode="throw" from="l" rot={-5}><GenSlot name="car_a_minivan" size={430} /></In>
      <In at={a(47.86)} x={540} y={760} mode="pop"><Pill2 c={A} size={42}>A家の残クレ</Pill2></In>
      <Stamp at={a(48.74)} x={560} y={880} text="契約おわり" size={72} c={A} rot={-7} />
    </AbsoluteFill>
  );
};

// ════════ 9 返すときの条件 → 精算30万円（49.50–57.20） ════════
const P9: React.FC = () => {
  const f = useCurrentFrame();
  const S = 49.5, a = (t: number) => t - S;
  const rc = interpolate(f, [F(a(52.7)), F(a(52.7)) + 12], [700, 0], out);
  const tot = stepN(f, a(54.54), 30, 0.5, 0);
  return (
    <AbsoluteFill style={{ transform: shake(f, a(55.3), 10) }}>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🔍">返すときの<R c={A}>条件</R></Head>
      <In at={0.3} x={40} y={450} mode="throw" from="l" rot={-5}><GenSlot name="car_odometer" size={380} /></In>
      <div style={{ position: "absolute", left: 470, top: 480 }}>
        <Line at={a(50.36)}>✔ 走行距離（上限あり）</Line>
        <Line at={a(50.96)}>✔ 傷・へこみ</Line>
        <Line at={a(51.6)}><span style={{ color: M.red }}>✔ 細かい条件がある</span></Line>
      </div>
      {f >= F(a(52.7)) ? (
        <div style={{ position: "absolute", left: 250, top: 830 + rc, width: 580, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 8, boxShadow: `8px 8px 0 ${M.ink}`, padding: "16px 28px 18px", boxSizing: "border-box", transform: "rotate(-2deg)" }}>
          <div style={{ ...K, fontSize: 32, textAlign: "center", borderBottom: `4px dashed ${M.gray}`, paddingBottom: 6 }}>🧾 精算のお知らせ</div>
          <div style={{ ...K, fontSize: 32, lineHeight: 1.6, marginTop: 6 }}>
            <div style={{ opacity: f >= F(a(53.58)) ? 1 : 0 }}>・走行距離の超過</div>
            <div style={{ opacity: f >= F(a(54.0)) ? 1 : 0 }}>・傷の修理</div>
          </div>
          <div style={{ borderTop: `4px solid ${M.ink}`, marginTop: 6, paddingTop: 4, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}><span style={{ ...K, fontSize: 34 }}>合計</span><span><span style={{ ...K, fontSize: 32 }}>約</span><span style={{ ...SER, fontSize: 90, color: M.red }}>{f >= F(a(54.54)) ? yen(tot) : "--"}</span><span style={{ ...K, fontSize: 36 }}>万円</span></span></div>
        </div>
      ) : null}
      <Stamp at={a(55.6)} x={600} y={1150} text="精算が必要" size={58} rot={-8} />
      <Note at={a(52.7)} top={1262}>※精算の金額は、契約・車の状態で変わります（この例では約30万円）</Note>
    </AbsoluteFill>
  );
};

// ════════ 10 手元にお金がない → ディーラー「月々ほぼ同じで乗り換えられますよ」（57.20–62.64） ════════
const P10: React.FC = () => {
  const S = 57.2, a = (t: number) => t - S;
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="💦" />
      <In at={0.15} x={40} y={400} mode="pop"><GenSlot name="car_a_dealer_worry" size={500} /></In>
      <In at={a(57.76)} x={50} y={930} mode="pop" rot={-3}><Pill2 c="#fff" size={40}>👛 手元にお金が<R>残っていない</R></Pill2></In>
      <In at={a(59.34)} x={600} y={880} mode="throw" from="r" rot={6}><GenSlot name="car_dealer_smile" size={420} /></In>
      <In at={a(60.3)} x={470} y={430} mode="pop" rot={3}><Bubble tail="b" w={560} size={42}><TypeIn at={F(a(60.3))} step={2}>月々ほぼ同じで<br />乗り換えられますよ♪</TypeIn></Bubble></In>
    </AbsoluteFill>
  );
};

// ════════ 11 精算金を次のローンに乗せる（62.64–66.22） ════════
const P11: React.FC = () => {
  const f = useCurrentFrame();
  const S = 62.64, a = (t: number) => t - S;
  const slide = interpolate(f, [F(a(64.9)), F(a(64.9)) + 10], [0, 1], out);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🔁">泣く泣く…</Head>
      {/* 次の車のローンの棒 */}
      <In at={a(64.3)} x={90} y={700} mode="rise">
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <div style={{ width: 640, height: 170, background: A, border: `6px solid ${M.ink}`, borderRadius: "16px 0 0 16px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}><span style={{ ...K, fontSize: 28 }}>次の車のローン</span><span style={{ ...SER, fontSize: 70 }}>600<span style={{ ...K, fontSize: 30 }}>万円</span></span></div>
          <div style={{ width: 220, height: 170, border: `6px dashed ${M.red}`, borderLeft: "none", borderRadius: "0 16px 16px 0", boxSizing: "border-box" }} />
        </div>
      </In>
      {/* 精算30万円の札が、棒の空いた所へすべり込む */}
      <In at={a(63.74)} x={0} y={0} mode="pop">
        <div style={{ position: "absolute", left: 360 + 370 * slide, top: 450 + 256 * slide, width: 220, height: 158, background: "#FDE7E2", border: `6px solid ${M.red}`, borderRadius: 14, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `rotate(${-8 * (1 - slide)}deg)`, boxShadow: slide < 1 ? `6px 6px 0 ${M.ink}` : undefined }}>
          <span style={{ ...K, fontSize: 26 }}>精算金</span><span style={{ ...SER, fontSize: 60, color: M.red }}>30<span style={{ ...K, fontSize: 26 }}>万円</span></span>
        </div>
      </In>
      {f >= F(a(64.9)) + 10 ? <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", transform: `scale(${pop(f, F(a(64.9)) + 10)})` }}><span style={{ ...K, fontSize: 44 }}>借りる額 </span><span style={{ ...SER, fontSize: 96, color: M.red }}>630</span><span style={{ ...K, fontSize: 44 }}>万円に</span></div> : null}
      <Stamp at={a(65.22)} x={330} y={1080} text="乗り換え" size={76} c={A} rot={-6} />
    </AbsoluteFill>
  );
};

// ════════ 12 月7.7万円に増える → 残クレループ（66.22–71.72） ════════
const P12: React.FC = () => {
  const f = useCurrentFrame();
  const S = 66.22, a = (t: number) => t - S;
  const v = stepN(f, a(67.06), 76784, 0.9, 71053);
  const spin = f >= F(a(69.0)) ? (f - F(a(69.0))) * 2.2 : 0;
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="📈" />
      <In at={0.15} x={280} y={360} mode="rise"><Meter v={v} c={A} label={<div style={{ ...K, fontSize: 30, color: M.sub }}>7.1万円 → <R>7.7万円</R></div>} /></In>
      <In at={a(68.18)} x={760} y={480} mode="pop" rot={8}><span style={{ ...K, fontSize: 64, color: M.red }}>UP↑</span></In>
      <In at={a(69.0)} x={290} y={790} mode="pop"><div style={{ transform: `rotate(${Math.sin(spin / 20) * 4}deg)` }}><GenSlot name="car_a_loop" size={500} /></div></In>
      <Stamp at={a(70.4)} x={190} y={1150} text="残クレループ" size={88} c={M.red} rot={-6} />
      <Note at={a(67.06)} top={1290}>※例：630万円・金利5.5%・5年・残価300万円で試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 13 B家は乗り続け、積立は260万円（71.72–76.30） ════════
const Piggy: React.FC<{ v: number; max: number; c?: string }> = ({ v, max, c = G }) => (
  <div style={{ width: 300, textAlign: "center" }}>
    <div style={{ position: "relative", width: 180, height: 300, margin: "0 auto", border: `6px solid ${M.ink}`, borderRadius: "22px 22px 30px 30px", background: "#fff", overflow: "hidden", boxShadow: `6px 6px 0 ${M.ink}` }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${(v / max) * 100}%`, background: `repeating-linear-gradient(0deg, ${M.yellow} 0 14px, #F6CF4A 14px 18px)` }} />
    </div>
    <div style={{ marginTop: 8 }}><span style={{ ...K, fontSize: 28 }}>積立 元本 約</span><br /><span style={{ ...SER, fontSize: 88, color: c, lineHeight: 1.05 }}>{yen(v)}</span><span style={{ ...K, fontSize: 34 }}>万円</span></div>
  </div>
);
const P13: React.FC = () => {
  const f = useCurrentFrame();
  const S = 71.72, a = (t: number) => t - S;
  const v = stepN(f, a(74.3), 260, 0.8, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={G} pill="B家" icon="🌱" />
      <In at={0.2} x={30} y={420} mode="throw" from="l" rot={-5}><GenSlot name="car_b_family_7" size={500} /></In>
      <In at={a(72.44)} x={60} y={940} mode="pop"><Pill2 c={G} size={38}>同じ車に 乗り続ける</Pill2></In>
      <In at={a(73.44)} x={640} y={440} mode="rise"><Piggy v={v} max={510} /></In>
      <Note at={a(74.3)} top={1150}>※元本（積み立てたお金）のみ。運用で増えた分は入れていません</Note>
    </AbsoluteFill>
  );
};

// ════════ 14 10年後：B家は完済して自分の車に／積立510万円（76.30–82.34） ════════
const P14: React.FC = () => {
  const f = useCurrentFrame();
  const S = 76.3, a = (t: number) => t - S;
  const prog = interpolate(f, [F(0.1), F(0.9)], [0.5, 1], out);
  const v = stepN(f, a(80.54), 510, 0.8, 260);
  return (
    <AbsoluteFill>
      <Paper2 />
      <In at={0.05} x={0} y={290} center mode="pop"><span style={{ display: "inline-block", background: M.ink, borderRadius: 18, padding: "10px 46px", transform: "rotate(-2deg)", boxShadow: `6px 6px 0 ${G}` }}><BounceText text="10年後" at={F(0.1)} size={88} color={M.yellow} stroke={false} /></span></In>
      <div style={{ position: "absolute", left: 90, top: 470, width: 900 }}>
        <div style={{ height: 30, background: "#EDE5C4", border: `5px solid ${M.ink}`, borderRadius: 16, overflow: "hidden" }}><div style={{ width: `${prog * 100}%`, height: "100%", background: `repeating-linear-gradient(-45deg, ${M.yellow} 0 18px, #F6CF4A 18px 36px)` }} /></div>
        <div style={{ position: "absolute", right: 0, top: 40, ...K, fontSize: 34 }}>子ども <span style={{ ...SER, fontSize: 50, color: M.red }}>12</span>歳</div>
      </div>
      <In at={a(77.6)} x={20} y={560} mode="throw" from="l" rot={-4}><GenSlot name="car_b_family_12" size={540} /></In>
      <Stamp at={a(78.5)} x={70} y={1070} text="完済！自分の車に" size={58} c={G} rot={-6} />
      <In at={a(79.6)} x={660} y={600} mode="rise"><Piggy v={v} max={510} /></In>
      <Note at={a(80.54)} top={1200}>※元本のみ（約42,772円×120か月＝約513万円）</Note>
    </AbsoluteFill>
  );
};

// ════════ 15 10年で払った利息（82.34–87.06）：棒の高さで比べる ════════
const P15: React.FC = () => {
  const f = useCurrentFrame();
  const S = 82.34, a = (t: number) => t - S;
  const hA = interpolate(f, [F(a(83.6)), F(a(83.6)) + 14], [0, 1], out), hB = interpolate(f, [F(a(85.22)), F(a(85.22)) + 10], [0, 1], out);
  const H = 560, base = 1100;
  const col = (x: number, h: number, c: string, lab: string, v: number, show: boolean) => (
    <>
      <div style={{ position: "absolute", left: x, top: base - h, width: 260, height: h, background: c, border: h > 2 ? `6px solid ${M.ink}` : undefined, borderBottom: "none", borderRadius: "14px 14px 0 0", boxSizing: "border-box" }} />
      {show ? <div style={{ position: "absolute", left: x - 60, width: 380, top: base - h - 110, textAlign: "center" }}><span style={{ ...K, fontSize: 30 }}>約</span><span style={{ ...SER, fontSize: 90, color: c }}>{yen(v)}</span><span style={{ ...K, fontSize: 34 }}>万円</span></div> : null}
      <div style={{ position: "absolute", left: x, width: 260, top: base + 14, textAlign: "center", ...K, fontSize: 44, color: c }}>{lab}</div>
    </>
  );
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={M.ink} pill="10年で払った利息" icon="💸" />
      <div style={{ position: "absolute", left: 120, top: base, width: 840, height: 6, background: M.ink }} />
      {col(200, H * hA, A, "A家", stepN(f, a(84.04), 260, 0.6, 0), f >= F(a(83.9)))}
      {col(620, H * (40 / 260) * hB, G, "B家", stepN(f, a(85.84), 40, 0.4, 0), f >= F(a(85.6)))}
      <Note at={a(83.6)} top={1200}>※A家：1台目（600万円）と2台目（630万円）の利息の合計 約257万円／B家：約39万円</Note>
    </AbsoluteFill>
  );
};

// ════════ 16 A家が車に払ったのは約890万円 → それでもまだ自分のものではない（87.06–92.94） ════════
const P16: React.FC = () => {
  const f = useCurrentFrame();
  const S = 87.06, a = (t: number) => t - S;
  const v = stepN(f, a(88.48), 890, 1.0, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🧾">10年で<R c={A}>車に払った</R>のは</Head>
      <In at={a(88.2)} x={0} y={480} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 24, boxShadow: `10px 10px 0 ${A}`, padding: "4px 40px" }}><span style={{ ...K, fontSize: 44 }}>約</span><span style={{ ...SER, fontSize: 150, color: A, lineHeight: 1.1 }}>{yen(v)}</span><span style={{ ...K, fontSize: 52 }}>万円</span></span></In>
      <In at={a(88.9)} x={0} y={710} center mode="ghost"><span style={{ ...B, fontSize: 30, color: M.sub }}>月7.1万円×5年 ＋ 月7.7万円×5年</span></In>
      <In at={a(90.2)} x={40} y={790} mode="pop"><div style={{ filter: "grayscale(0.25)" }}><GenSlot name="car_a_family_12" size={470} /></div></In>
      <In at={a(90.94)} x={540} y={860} mode="throw" from="r" rot={5}><Bubble tail="l" w={490} size={38}>それでも車は<br /><R>まだ自分のもの</R><br /><R>ではない</R></Bubble></In>
      <Stamp at={a(91.9)} x={560} y={1130} text="所有者は販売店など" size={44} rot={-5} />
    </AbsoluteFill>
  );
};

// ════════ 17 まとめ：同じ7万円でも、行き先が違えば（92.94–99.94） ════════
const P17: React.FC = () => {
  const f = useCurrentFrame();
  const S = 92.94, a = (t: number) => t - S;
  const br = interpolate(f, [F(a(94.2)), F(a(94.2)) + 10], [0, 1], out);
  return (
    <AbsoluteFill>
      <Paper2 />
      <In at={0.05} x={0} y={300} center mode="pop"><span style={{ display: "inline-block", background: M.yellow, border: `6px solid ${M.ink}`, borderRadius: 999, padding: "8px 40px", boxShadow: `6px 6px 0 ${M.ink}` }}><span style={{ ...K, fontSize: 40 }}>同じ </span><span style={{ ...SER, fontSize: 70 }}>7</span><span style={{ ...K, fontSize: 40 }}>万円でも</span></span></In>
      <svg width={1080} height={700} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M540 410 L540 450 L280 450 L280 500" fill="none" stroke={A} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - br} />
        <path d="M540 450 L800 450 L800 500" fill="none" stroke={G} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - br} />
      </svg>
      <In at={a(94.5)} x={60} y={500} mode="throw" from="l" rot={-4}><Fam who="A" img="car_a_loop" size={230} w={440} title="A家 → 車"><div style={{ ...K, fontSize: 30 }}>残るもの：<R c={M.red}>ローン</R></div></Fam></In>
      <In at={a(94.8)} x={580} y={500} mode="throw" from="r" rot={4}><Fam who="B" img="car_b_piggy" size={230} w={440} title="B家 → 積立"><div style={{ ...K, fontSize: 30 }}>残るもの：<R c={G}>車＋積立</R></div></Fam></In>
      <HandCircle at={a(95.9)} x={800} y={822} r={190} ry={48} c={G} />
      <In at={a(97.04)} x={0} y={1010} center mode="pop">
        <span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 24, boxShadow: `10px 10px 0 ${G}`, padding: "14px 36px", textAlign: "center" }}>
          <span style={{ display: "inline-flex" }}><BounceText text="車は" at={F(a(97.04))} size={60} stroke={false} /><BounceText text="身の丈" at={F(a(97.04)) + 6} size={60} color={A} stroke={false} /><BounceText text="で" at={F(a(97.04)) + 18} size={60} stroke={false} /></span><br />
          <span style={{ display: "inline-flex" }}><BounceText text="浮いた分は" at={F(a(98.1))} size={60} stroke={false} /><BounceText text="先に積立へ" at={F(a(98.6))} size={60} color={G} stroke={false} /></span>
        </span>
      </In>
    </AbsoluteFill>
  );
};

// ════════ 18 保存とフォロー（99.94–102.23） ════════
const P18: React.FC = () => {
  const f = useCurrentFrame();
  const S = 99.94, a = (t: number) => t - S;
  const btn = (x: number, at: number, icon: string, t: string, c: string) => (
    <In at={at} x={x} y={620} mode="pop">
      <div style={{ width: 400, height: 260, background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 30, boxShadow: `10px 10px 0 ${c}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: f >= F(at + 0.45) && f < F(at + 0.45) + 6 ? "scale(0.92)" : undefined }}>
        <span style={{ fontSize: 100 }}>{icon}</span><span style={{ ...K, fontSize: 50 }}>{t}</span>
      </div>
    </In>
  );
  return (
    <AbsoluteFill>
      <Paper2 />
      <In at={0.05} x={0} y={400} center mode="ghost"><span style={{ ...K, fontSize: 54 }}>忘れないように</span></In>
      {btn(90, a(100.6), "🔖", "保存", M.yellow)}
      {btn(590, a(101.0), "➕", "フォロー", G)}
      <In at={a(101.2)} x={0} y={980} center mode="pop"><Tag c={M.yellow} size={32}>家族シリーズ 次回もお楽しみに</Tag></In>
    </AbsoluteFill>
  );
};

// ════════ 19 社長の1カット（撮影待ちの仮の画面） ════════
const P19: React.FC = () => (
  <AbsoluteFill style={{ background: "#3A372F" }}>
    <div style={{ position: "absolute", left: 90, right: 90, top: 560, border: `6px dashed ${M.yellow}`, borderRadius: 30, padding: "40px 40px", textAlign: "center", color: "#fff" }}>
      <div style={{ ...K, fontSize: 44, color: M.yellow }}>🎥 社長カット（撮影後に差し替え）</div>
      <div style={{ ...K, fontSize: 42, lineHeight: 1.5, marginTop: 24 }}>「僕は車は乗れればいい派。<br />だから身の丈に合った車にして、<br />浮いた分は積み立てに回してます」</div>
    </div>
  </AbsoluteFill>
);

// ── ページの切り替え（marke-motion-grammar.md の数字：住宅ローン②と同じ）──
const EXIT_C = [6, 18, 30, 42, -48, -228, -488, -808, -1188, -1700];
const EXIT_S = [0, 0, 0, 0, -48, -228, -488, -808, -1188, -1700];
const ENTER = [762, 438, 252, 144, 78, 42, 18, 6, 0];
const PageMove: React.FC<{ dur: number; chapterNext: boolean; first: boolean; last: boolean; children: React.ReactNode }> = ({ dur, chapterNext, first, last, children }) => {
  const f = useCurrentFrame();
  let y = 0, v = 0;
  if (!first && f < ENTER.length) { y = ENTER[f]; v = f + 1 < ENTER.length ? ENTER[f] - ENTER[f + 1] : 0; }
  const ex = chapterNext ? EXIT_C : EXIT_S;
  const k = f - (dur - ex.length);
  if (!last && k >= 0 && dur > 30) { y = ex[k]; v = Math.abs(ex[k] - (ex[k - 1] ?? 0)); }
  const blur = v > 40 ? Math.min(18, v / 22) : 0;
  return <AbsoluteFill style={{ transform: `translateY(${y}px)`, filter: blur ? `blur(${blur}px)` : undefined }}>{first ? children : <Sequence from={-4} layout="none">{children}</Sequence>}</AbsoluteFill>;
};
export const CAR1_END = 102.3, CAR1_BOSS = 5.0;
export const CAR1_PAGES: [number, React.FC][] = [[0, P1], [5.62, P2], [12.56, P3], [18.96, P4], [25.72, P5], [32.9, P6], [38.26, P7], [45.84, P8], [49.5, P9], [57.2, P10], [62.64, P11], [66.22, P12], [71.72, P13], [76.3, P14], [82.34, P15], [87.06, P16], [92.94, P17], [99.94, P18]];
const CHAPTER = new Set([2, 5, 7, 13, 16]); // 次のページが章の頭（A家・B家・5年後・10年後・まとめ）
export const CARFAMILY_FRAMES = F(CAR1_END + CAR1_BOSS);

// 字幕（AIの読み間違いは直した字で・!A家の言葉! *B家の言葉* ~全体~）
const SUBS: [number, string][] = [
  [0, "*お金が残る家族*と"], [1.1, "!残らない家族!"], [2.0, "どっちになるか 見てください"], [3.58, "今回は ~車の選び方~ です"],
  [5.62, "同じ収入の 2組の家族"], [7.72, "どちらも 夫婦27歳"], [9.08, "2歳の子どもが1人"], [10.42, "世帯年収は ~600万円~ です"],
  [12.56, "!A家!は 約600万円の"], [14.32, "大きなミニバンを !残クレ! で"], [16.04, "5年契約で"], [17.06, "月々 約!7万1,000円!"],
  [18.96, "月々が安いのは"], [20.02, "最後に 約!300万円!を"], [21.28, "残しているから"], [22.26, "でも その300万円にも"], [23.9, "5年間ずっと !利息! がかかります"],
  [25.72, "しかも 残クレの車は"], [27.1, "払い終わるまで"], [27.66, "!自分のものではありません!"], [29.14, "「月々払えるなら大丈夫」"], [30.66, "A家は そう思っていました"],
  [32.9, "*B家*は 約300万円のミニバンを"], [35.24, "*銀行ローン*で 10年で"], [36.42, "月々 約*2万8,000円*"],
  [38.26, "B家も 毎月出せるのは"], [39.58, "A家と同じ 月*7万1,000円*と"], [41.24, "決めていました"], [42.24, "残りの 約*4万3,000円*は"], [43.96, "毎月 *先に積み立て* ました"],
  [45.84, "~5年後~"], [46.94, "子どもは7歳"], [47.86, "A家の残クレが 終わります"],
  [49.5, "返すときには"], [50.36, "!走行距離!や!傷!に"], [51.28, "細かい条件があります"], [52.7, "走行距離の超過と傷で"], [54.34, "約!30万円!の精算が"], [55.6, "必要と言われました"],
  [57.2, "でも 手元にお金は 残っていません"], [59.34, "ディーラーで"], [60.44, "「月々ほぼ同じで 乗り換えられますよ」"],
  [62.64, "A家は 泣く泣く"], [63.74, "精算金を 次のローンに乗せて"], [65.22, "乗り換えました"], [66.22, "月々は 約!7万7,000円!に"], [68.18, "増えました"], [69.0, "これが 抜け出しにくい"], [70.4, "!残クレループ! です"],
  [71.72, "*B家*は 同じ車に乗り続け"], [73.44, "積み立ては 元本 約*260万円*"],
  [76.3, "~10年後~ 子どもは12歳"], [77.76, "B家の車は *自分のもの* に"], [79.6, "積み立ては 元本 約*510万円*"],
  [82.34, "10年で払った利息は"], [83.6, "A家が 約!260万円!"], [85.22, "B家は 約*40万円*"],
  [87.06, "A家が 車に払ったのは"], [88.48, "約!890万円!"], [90.22, "それでも 車はまだ"], [91.32, "自分のものではありません"],
  [92.94, "同じ7万円でも"], [94.2, "行き先が違えば"], [95.18, "10年後に *残るもの* が変わります"], [97.04, "車は ~身の丈~ で"], [98.1, "浮いた分は *先に積立へ*"],
  [99.94, "忘れないように"], [100.6, "*保存*と*フォロー*を しておいてください"],
];

const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  ...CAR1_PAGES.slice(1).map(([t]) => s("u03s", t - 0.42, 0.22)),
  s("u02s", 1.1, 0.18), s("u04", 1.6, 0.26), s("u02s", 2.15, 0.16), s("u02s", 2.4, 0.16), s("u05", 3.58, 0.22),
  s("u02s", 6.4, 0.16), s("u02s", 8.0, 0.14), s("u02s", 8.8, 0.14), s("u06", 10.9, 0.2), s("u04", 11.7, 0.28),
  s("u02s", 13.2, 0.18), s("u02s", 14.1, 0.16), s("u04", 14.85, 0.28), s("u02s", 15.8, 0.16), s("u06", 16.85, 0.22), s("u05s", 17.9, 0.22),
  s("u05s", 20.3, 0.22), s("u05s", 22.7, 0.2), s("u04", 24.4, 0.26),
  s("u02s", 26.4, 0.18), s("u05s", 27.45, 0.2), s("u04", 27.7, 0.26), s("u02s", 28.95, 0.18), s("u10", 30.5, 0.2),
  s("u02s", 33.5, 0.18), s("u02s", 35.0, 0.16), s("u02s", 35.6, 0.16), s("u06", 36.2, 0.22), s("u05s", 37.4, 0.2),
  s("u02s", 39.3, 0.18), s("u02s", 40.1, 0.18), s("u05s", 42.2, 0.24), s("u05", 43.8, 0.22), s("u04", 44.4, 0.26),
  s("u09", 45.84, 0.26), s("u02s", 47.6, 0.18), s("u04", 48.5, 0.28),
  s("u02s", 50.1, 0.14), s("u02s", 50.7, 0.14), s("u02s", 51.35, 0.14), s("u05s", 52.5, 0.22), s("u06", 54.3, 0.22), s("u04", 55.35, 0.3),
  s("u02s", 57.5, 0.18), s("u02s", 59.1, 0.18), s("u07", 60.1, 0.2),
  s("u02s", 63.5, 0.18), s("u05s", 64.65, 0.22), s("u04", 65.0, 0.28),
  s("u06", 66.85, 0.22), s("u02s", 67.95, 0.18), s("u05", 68.8, 0.22), s("u04", 70.2, 0.3),
  s("u02s", 72.2, 0.16), s("u06", 74.1, 0.22),
  s("u09", 76.3, 0.26), s("u04", 78.3, 0.28), s("u06", 80.3, 0.22),
  s("u05s", 83.4, 0.22), s("u05s", 85.0, 0.22),
  s("u06", 88.25, 0.24), s("u02s", 90.0, 0.16), s("u04", 91.7, 0.28),
  s("u05", 94.0, 0.22), s("u10", 95.7, 0.22), s("u05", 96.85, 0.24),
  s("u02s", 100.4, 0.18), s("u07", 100.8, 0.22), s("u02s", 100.95, 0.16),
];

const SAFE = 0.9, SAFE_X = 540 - 540 * SAFE, SAFE_Y = 300 - 280 * SAFE;
export const CarFamilyReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.paper, fontFamily: FONT }}>
    <Audio src={staticFile("car1-narration.mp3")} />
    <SfxTrack cues={CUES} />
    <AbsoluteFill style={{ background: M.paper, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${SAFE_X}px, ${SAFE_Y}px) scale(${SAFE})`, transformOrigin: "0 0" }}>
      {CAR1_PAGES.map(([t, P], i) => {
        const st = i === 0 ? 0 : t - 0.12;
        const last = i + 1 >= CAR1_PAGES.length;
        const end = last ? CAR1_END : CAR1_PAGES[i + 1][0] - 0.12;
        const dur = F(end) - F(st);
        return <Sequence key={i} from={F(st)} durationInFrames={dur}><PageMove dur={dur} first={i === 0} last={last} chapterNext={CHAPTER.has(i + 1)}><P /></PageMove></Sequence>;
      })}
    </div>
    <Sequence from={F(CAR1_END)}><P19 /></Sequence>
    <Sequence durationInFrames={F(CAR1_END)}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, bottom: 0, background: `linear-gradient(${M.paper}00, ${M.paper} 50px)` }} />
      <Captions subs={SUBS} end={CAR1_END} maxW={740} size={0.78} kcol={{ g: G, r: A, b: M.red }} top={1352} swap />
    </Sequence>
  </AbsoluteFill>
);
