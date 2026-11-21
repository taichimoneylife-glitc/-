import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { GenSlot } from "./MileLifePlan";
import { Captions } from "./BourakuReel";
import { BounceText } from "./components/fx";
import { TypeIn, wipeIn } from "./components/zukaiKit";
import { CAR3_MOUTH } from "./car3Mouth";
import { F, clamp, out, K, B, SER, M, pop, yen, cnt, R, In, Tag, Stamp, Paper2, SectionPill, Pill2, HandCircle, Dim, shake } from "./components/marke";

// ════════════════════════════════════════════════════════════════════
//  家族シリーズ①「車編」：お金が残る家族と、残らない家族（声 public/car7-narration.wav 123.0秒・録ったままの速さ）
//  型＝参考⑦（同じ条件の2人・部品が1〜2秒ごとに足される・人ごとに色を固定）＋これまでの演出（ノート背景・シュッと切り替え・段で上がる数字・ハンコ・手書きの丸）
//  色：A家＝オレンジ／B家＝緑（最後まで固定）
//  数字（計算で確認済み・仮定の試算）：
//   A：600万円・残クレ5年・5.5%・残価300万 → 月71,053円／5年の利息 約126万（うち残価分 約83万）
//      2台目 640万（精算40万を上乗せ）→ 月78,694円／10年の利息 約258万／10年の支払い 約898万
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
  return <div style={{ position: "absolute", left: 60, width: 720, top, ...B, fontSize: 22, lineHeight: 1.45, color: M.sub, opacity: interpolate(f - F(at), [0, 6], [0, 1], clamp) }}>{children}</div>;
};
const stepN = (f: number, at: number, to: number, dur: number, from: number) => (f < F(at) ? from : cnt(F(at) + Math.floor((f - F(at)) / 3) * 3, at, to, dur, from)); // 3fごとに段で上がる
const W = (t: number) => t; // 今の音声の時刻をそのまま使う
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
const Line: React.FC<{ at: number; children: React.ReactNode; size?: number }> = ({ at, children, size = 32 }) => {
  const f = useCurrentFrame();
  return <div style={{ ...K, fontSize: size, lineHeight: 1.5, ...(f >= F(at) ? wipeIn(f, F(at)) : { opacity: 0 }) }}>{children}</div>;
};

// ════════ 1 冒頭（0–5.14）：同じ2家族のカード → VS → 将来どうなる？ → 車の買い方 ════════
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const LAND = [600, 300, 150, 76, 38, 18, 8, 3, 0]; // 入り＝毎フレーム約半分になる急ブレーキ
  const land = (at: number) => { const k = f - F(at); return k < 0 ? 2000 : LAND[Math.min(LAND.length - 1, k)]; };
  const up = interpolate(f, [F(3.8), F(3.8) + 8], [0, 1], out);
  return (
    <AbsoluteFill>
      <Paper2 />
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", lineHeight: 1.1 }}>
        <span style={{ display: "inline-flex" }}><BounceText text="お金が残る" at={0} size={86} color={G} stroke={false} step={1} /><BounceText text="家族と" at={5} size={86} stroke={false} step={1} /></span><br />
        <span style={{ display: "inline-flex" }}><BounceText text="残らない" at={F(1.32)} size={86} color={A} stroke={false} step={1} /><BounceText text="家族" at={F(1.32) + 5} size={86} stroke={false} step={1} /></span>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translateY(${-60 * up}px) scale(${1 - 0.12 * up})`, transformOrigin: "540px 500px" }}>
        <div style={{ position: "absolute", left: 590, top: 520 + land(0) }}><Fam who="B" img="car_b_family_2" size={300} w={430} title="B家" /></div>
        <div style={{ position: "absolute", left: 60, top: 520 + land(1.32) }}><Fam who="A" img="car_a_family_2" size={300} w={430} title="A家" /></div>
        <In at={1.6} x={0} y={700} center mode="pop"><span style={{ display: "inline-block", background: M.red, color: "#fff", border: `5px solid ${M.ink}`, borderRadius: 999, width: 110, height: 110, lineHeight: "100px", textAlign: "center", ...K, fontSize: 54, boxShadow: `5px 5px 0 ${M.ink}` }}>VS</span></In>
        <In at={2.48} x={0} y={940} center mode="pop"><span style={{ display: "inline-block", background: M.yellow, border: `5px solid ${M.ink}`, borderRadius: 16, padding: "6px 30px", ...K, fontSize: 50, boxShadow: `5px 5px 0 ${M.ink}` }}>将来 どうなる？</span></In>
      </div>
      <In at={3.94} x={70} y={960} mode="throw" from="d" rot={-4}><GenSlot name="car_two_roads" size={330} /></In>
      {f >= F(4.0) ? <div style={{ position: "absolute", left: 420, top: 1040 }}>
        <Tag c={M.yellow} size={30}>家族シリーズ</Tag>
        <div style={{ marginTop: 12, display: "inline-flex" }}><BounceText text="車の買い方" at={F(4.28)} size={84} stroke={false} /></div>
      </div> : null}
    </AbsoluteFill>
  );
};

// ════════ 2 前提（5.14–10.76）：プロフィールに1行ずつ足される ════════
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const S = 5.14, a = (t: number) => t - S;
  const prof = (who: "A" | "B", x: number, at: number) => (
    <In at={at} x={x} y={470} mode="throw" from={who === "A" ? "l" : "r"} rot={who === "A" ? -6 : 6}>
      <Fam who={who} img={`car_${who.toLowerCase()}_family_2`} size={220} w={450}>
        <div style={{ width: 380, marginTop: 6 }}>
          <Line at={a(7.02)}>👫 夫婦 27歳</Line>
          <Line at={a(8.32)}>👶 子ども 2歳・1人</Line>
          <Line at={a(9.4)}>💴 世帯年収 <span style={{ ...SER, fontSize: 44, color: who === "A" ? A : G }}>{yen(stepN(f, a(10.0), 600, 0.4, 0))}</span>万円</Line>
        </div>
      </Fam>
    </In>
  );
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={M.ink} pill="前提" icon="📋">同じ収入の<R c={M.red}>2組の家族</R></Head>
      {prof("A", 60, 0.5)}
      {prof("B", 570, 0.75)}
      <In at={a(10.3)} x={0} y={790} center mode="pop"><span style={{ ...K, fontSize: 90, color: M.red }}>＝</span></In>
      <Stamp at={a(10.35)} x={330} y={1120} text="条件は同じ" size={70} rot={-6} />
    </AbsoluteFill>
  );
};

// ════════ 3 A家の車（10.76–15.96）：600万円・残クレ・5年 → メーターが月7.1万円まで回る ════════
const P3: React.FC = () => {
  const f = useCurrentFrame();
  const S = 10.76, a = (t: number) => t - S;
  const v = stepN(f, a(15.1), 71053, 0.7, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家の車" icon="🚗" />
      <In at={0.2} x={40} y={360} mode="throw" from="l" rot={-6}><GenSlot name="car_a_minivan" size={470} /></In>
      <In at={a(11.58)} x={560} y={400} mode="pop" rot={4}><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${A}`, borderRadius: 18, padding: "6px 24px", boxShadow: `6px 6px 0 ${M.ink}` }}><span style={{ ...K, fontSize: 34 }}>約</span><span style={{ ...SER, fontSize: 96, color: A }}>600</span><span style={{ ...K, fontSize: 40 }}>万円</span></span></In>
      <In at={a(12.56)} x={590} y={560} mode="pop"><Chip c={A}>大きなミニバン</Chip></In>
      <Stamp at={a(13.38)} x={600} y={650} text="残クレ" size={86} c={A} rot={-8} />
      <In at={a(13.88)} x={630} y={790} mode="pop"><Chip c={A} size={40}>5年契約</Chip></In>
      <In at={a(14.6)} x={280} y={860} mode="rise"><Meter v={v} c={A} /></In>
      <HandCircle at={a(15.7)} x={540} y={1162} r={250} ry={70} c={M.red} />
      <Note at={a(14.6)} top={1262}>※例：金利5.5%・5年（60回）・頭金なしで試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 4 残価設定50%（15.96–22.36）：600万円の棒が割れる → 残した300万円にも利息 ════════
const P4: React.FC = () => {
  const f = useCurrentFrame();
  const S = 15.96, a = (t: number) => t - S;
  const split = interpolate(f, [F(a(17.36)), F(a(17.36)) + 9], [0, 1], out);
  const intA = interpolate(f, [F(a(21.36)), F(a(21.36)) + 12], [0, 1], out);
  const BW = 900, gap = 30 * split;
  const part = (x: number, w: number, bg: string, label: React.ReactNode, sub: React.ReactNode, hatch?: boolean) => (
    <div style={{ position: "absolute", left: x, top: 0, width: w, height: 190, background: hatch ? `repeating-linear-gradient(-45deg, #fff 0 16px, #FBE3D8 16px 32px)` : bg, border: `6px solid ${M.ink}`, borderRadius: 16, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `6px 6px 0 ${M.ink}` }}>
      <div style={{ ...K, fontSize: 30, color: hatch ? M.ink : "#fff" }}>{label}</div>
      <div><span style={{ ...SER, fontSize: 70, color: hatch ? A : "#fff" }}>{sub}</span><span style={{ ...K, fontSize: 32, color: hatch ? M.ink : "#fff" }}>万円</span></div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🚗">残価設定 <R c={A}>50%</R></Head>
      <In at={0.4} x={0} y={452} center mode="ghost"><span style={{ ...B, fontSize: 27, color: M.sub }}>残クレ＝5年後の車の価値（残価）を最後に残して、残りを分割で払うローン</span></In>
      <In at={0.3} x={90} y={580} mode="rise">
        <div style={{ position: "relative", width: BW, height: 200 }}>
          {split < 0.02 ? part(0, BW, A, "車の値段", "約600") : (
            <>
              {part(0, BW / 2 - gap / 2, A, "5年で払っていく", "300")}
              {part(BW / 2 + gap / 2, BW / 2 - gap / 2, A, "最後に残す（残価50%）", "300", true)}
            </>
          )}
        </div>
      </In>
      {f >= F(a(17.36)) ? <div style={{ position: "absolute", left: 90 + BW / 2 + 15, top: 800, width: BW / 2 - 15, textAlign: "center", ...K, fontSize: 30, opacity: split }}>5年後に<R c={A}>返すか・払うか</R></div> : null}
      <HandCircle at={a(19.32)} x={765} y={675} r={220} ry={130} c={M.red} />
      {f >= F(a(21.36)) ? (
        <>
          {[0, 1].map((i) => (
            <div key={i} style={{ position: "absolute", left: 90 + i * (BW / 2 + 15), width: BW / 2 - 15, top: 522 + (1 - intA) * -200, opacity: intA, textAlign: "center" }}>
              <span style={{ display: "inline-block", background: M.red, color: "#fff", border: `5px solid ${M.ink}`, borderRadius: 12, padding: "4px 22px", ...K, fontSize: 36, boxShadow: `4px 4px 0 ${M.ink}` }}>＋利息</span>
            </div>
          ))}
        </>
      ) : null}
      <In at={a(19.32)} x={0} y={880} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 22, padding: "14px 34px", boxShadow: `8px 8px 0 ${M.red}`, ...K, fontSize: 48, lineHeight: 1.35, textAlign: "center" }}>残した<R c={A}>300万円</R>にも<br /><R>5年間ずっと利息</R>がかかる</span></In>
      <In at={a(21.5)} x={0} y={1050} center mode="pop"><Pill2 c={M.yellow} size={34}><span style={{ color: M.ink }}>月7.1万円 ＝ 元本 約5万円 ＋ <R>利息 約2.1万円</R></span></Pill2></In>
      <In at={a(21.9)} x={0} y={1140} center mode="ghost"><span style={{ ...K, fontSize: 28 }}>5年の利息 約<R>126万円</R>（うち残価分 約83万円）</span></In>
      <Note at={a(21.5)} top={1210}>※例：600万円・金利5.5%・5年・頭金なし・残価300万円で試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 5「月々払えるから大丈夫」（22.36–25.14） ════════
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const S = 22.36, a = (t: number) => t - S;
  const gray = interpolate(f, [F(a(23.68)), F(a(23.68)) + 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🚗" />
      <div style={{ filter: `grayscale(${gray})`, opacity: 1 - 0.25 * gray }}>
        <In at={0.1} x={40} y={560} mode="pop"><GenSlot name="car_a_happy_drive" size={520} /></In>
        <In at={0.2} x={470} y={400} mode="pop" rot={4}><Bubble tail="b" w={560} size={46}><TypeIn at={F(0.2)} step={2}>月々払えるから<br />大丈夫！</TypeIn></Bubble></In>
      </div>
      <In at={a(24.28)} x={520} y={1120} mode="ghost"><span style={{ ...K, fontSize: 40, color: M.sub }}>…と、思っていました</span></In>
    </AbsoluteFill>
  );
};

// ── 毎月出せる額の棒（A家は全部が車／B家は車のローン＋積立投資） ──
const MonthRows: React.FC<{ aAt: number; bAt: number; splitAt?: number }> = ({ aAt, bAt, splitAt }) => {
  const f = useCurrentFrame();
  const sp = splitAt === undefined ? 0 : interpolate(f, [F(splitAt), F(splitAt) + 9], [0, 1], out);
  const W = 760, wl = W * (28281 / 71053);
  const row = (who: "A" | "B", y: number, at: number) => {
    const c = who === "A" ? A : G;
    return (
      <In at={at} x={60} y={y} mode="throw" from="l" rot={-3}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 150, ...K, fontSize: 44, color: c, textAlign: "right" }}>{who}家</span>
          <div style={{ position: "relative", width: W, height: 150 }}>
            {who === "A" || sp < 0.02 ? (
              <div style={{ position: "absolute", inset: 0, background: c, border: `6px solid ${M.ink}`, borderRadius: 16, boxShadow: `6px 6px 0 ${M.ink}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, color: "#fff", fontSize: 34 }}>月 約<span style={{ ...SER, fontSize: 72, margin: "0 6px" }}>7.1</span>万円{who === "A" ? <span style={{ fontSize: 28, marginLeft: 10 }}>→ 全部 車</span> : null}</div>
            ) : (
              <>
                <div style={{ position: "absolute", left: 0, top: 0, width: wl - 12 * sp, height: 150, background: G, border: `6px solid ${M.ink}`, borderRadius: 16, boxShadow: `6px 6px 0 ${M.ink}`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}><span style={{ ...K, fontSize: 24 }}>車のローン</span><span style={{ ...SER, fontSize: 54 }}>2.8<span style={{ ...K, fontSize: 26 }}>万</span></span></div>
                <div style={{ position: "absolute", left: wl + 12 * sp, top: 0, width: W - wl - 12 * sp, height: 150, background: "#fff", border: `6px solid ${G}`, borderRadius: 16, boxShadow: `6px 6px 0 ${M.ink}`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - sp) * -20}px)` }}><span style={{ ...K, fontSize: 26, color: G }}>積立投資</span><span style={{ ...SER, fontSize: 60, color: G }}>4.3<span style={{ ...K, fontSize: 28 }}>万円</span></span></div>
              </>
            )}
          </div>
        </div>
      </In>
    );
  };
  return <>{row("A", 490, aAt)}{row("B", 700, bAt)}</>;
};

// ════════ 6 一方B家：毎月出せるのは同じ月7万円くらい → 身の丈に合った車を（25.14–31.96） ════════
const P6: React.FC = () => {
  const S = 25.14, a = (t: number) => t - S;
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={G} pill="一方 B家" icon="💡">毎月 車に出せるのは<R c={M.red}>同じ</R></Head>
      <MonthRows bAt={0.6} aAt={a(27.48)} />
      <In at={a(28.36)} x={0} y={640} center mode="pop"><span style={{ ...K, fontSize: 44, color: M.red, marginLeft: 160 }}>＝ 同じ額</span></In>
      <In at={a(29.84)} x={0} y={940} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 22, padding: "14px 34px", boxShadow: `8px 8px 0 ${G}`, ...K, fontSize: 50 }}>でも車は <R c={G}>身の丈</R>に合ったものを</span></In>
    </AbsoluteFill>
  );
};

// ════════ 7 B家の車（31.96–36.94）：300万円・銀行ローン10年 → メーターが月2.8万円 ════════
const P7: React.FC = () => {
  const f = useCurrentFrame();
  const S = 31.96, a = (t: number) => t - S;
  const v = stepN(f, a(35.5), 28281, 0.8, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={G} pill="B家の車" icon="🚙" />
      <In at={0.2} x={600} y={380} mode="throw" from="r" rot={6}><GenSlot name="car_b_minivan" size={420} /></In>
      <In at={a(32.36)} x={70} y={410} mode="pop" rot={-4}><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${G}`, borderRadius: 18, padding: "6px 24px", boxShadow: `6px 6px 0 ${M.ink}` }}><span style={{ ...K, fontSize: 34 }}>約</span><span style={{ ...SER, fontSize: 96, color: G }}>300</span><span style={{ ...K, fontSize: 40 }}>万円</span></span></In>
      <In at={a(33.14)} x={90} y={570} mode="pop"><Chip c={G}>ミニバン</Chip></In>
      <In at={a(33.74)} x={90} y={650} mode="pop"><Chip c={G} size={40}>銀行ローン</Chip></In>
      <In at={a(34.62)} x={350} y={650} mode="pop"><Chip c={G} size={40}>10年</Chip></In>
      <In at={a(35.02)} x={280} y={860} mode="rise"><Meter v={v} c={G} /></In>
      <HandCircle at={a(36.4)} x={540} y={1162} r={250} ry={70} c={G} />
      <Note at={a(35.02)} top={1262}>※例：金利2.5%・10年（120回）で試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 8 残りの4.3万円は積立投資へ（36.94–39.90） ════════
const P7b: React.FC = () => {
  const S = 36.94, a = (t: number) => t - S;
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={G} pill="B家" icon="🌱">残りは<R c={G}>積立投資</R>へ</Head>
      <MonthRows aAt={0.1} bAt={0.1} splitAt={a(37.2)} />
      <In at={a(38.56)} x={130} y={900} mode="pop"><GenSlot name="car_b_piggy" size={330} /></In>
      <In at={a(38.9)} x={480} y={980} mode="pop"><Pill2 c={G} size={40}>毎月 4.3万円を 積立投資</Pill2></In>
      <Note at={a(37.2)} top={1262}>※71,053円 − 28,281円 ＝ 42,772円（約4.3万円）</Note>
    </AbsoluteFill>
  );
};

// ════════ 9 5年後（39.90–42.82）：時間の棒が5年まで進む → A家の残クレが終わる ════════
const P8: React.FC = () => {
  const f = useCurrentFrame();
  const S = 39.9, a = (t: number) => t - S;
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
      <In at={a(41.2)} x={70} y={690} mode="throw" from="l" rot={-5}><GenSlot name="car_a_minivan" size={430} /></In>
      <In at={a(41.34)} x={540} y={760} mode="pop"><Pill2 c={A} size={42}>A家の残クレ</Pill2></In>
      <Stamp at={a(42.22)} x={560} y={880} text="契約おわり" size={72} c={A} rot={-7} />
    </AbsoluteFill>
  );
};

const NoteBox: React.FC<{ at: number; y: number; title: React.ReactNode; children: React.ReactNode }> = ({ at, y, title, children }) => (
  <In at={at} x={60} y={y} mode="rise">
    <div style={{ width: 800, background: "rgba(255,255,255,0.95)", border: `4px dashed ${M.ink}`, borderRadius: 18, padding: "12px 22px", boxSizing: "border-box" }}>
      <div style={{ ...K, fontSize: 38, lineHeight: 1.3 }}>{title}</div>
      <div style={{ ...B, fontSize: 30, color: M.ink, lineHeight: 1.45, marginTop: 4 }}>{children}</div>
    </div>
  </In>
);

// ════════ 10 選べる道は3つ（42.82–50.16）→「買い取る」に × ════════
const P8b: React.FC = () => {
  const f = useCurrentFrame();
  const S = 42.82, a = (t: number) => t - S;
  const x = interpolate(f, [F(a(48.3)), F(a(48.3)) + 7], [0, 1], out);
  const card = (i: number, at: number, icon: string, t: React.ReactNode, sub: React.ReactNode) => (
    <In at={at} x={70} y={480 + i * 190} mode="throw" from="r" rot={3}>
      <div style={{ width: 940, height: 160, background: i === 1 && x > 0 ? "#F1EDE0" : "#fff", border: `6px solid ${M.ink}`, borderLeft: `20px solid ${A}`, borderRadius: 18, boxShadow: `6px 6px 0 ${M.ink}`, display: "flex", alignItems: "center", gap: 22, padding: "0 26px", boxSizing: "border-box", position: "relative" }}>
        <span style={{ ...K, fontSize: 40, color: A }}>{"①②③"[i]}</span>
        <span style={{ fontSize: 64 }}>{icon}</span>
        <div><div style={{ ...K, fontSize: 48 }}>{t}</div><div style={{ ...B, fontSize: 26, color: M.sub }}>{sub}</div></div>
        {i === 1 && x > 0 ? <svg width={940} height={160} style={{ position: "absolute", left: -20, top: -6 }}><path d="M300 20 L640 140" stroke={M.red} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, x * 2)} /><path d="M640 20 L300 140" stroke={M.red} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, x * 2 - 1)} /></svg> : null}
      </div>
    </In>
  );
  return (
    <AbsoluteFill style={{ transform: shake(f, a(48.3), 12) }}>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家の5年後" icon="🔀">選べる道は<R c={A}>3つ</R></Head>
      {card(0, a(43.92), "↩️", "車を返す", "車は残らない。条件を超えると精算")}
      {card(1, a(44.92), "💴", <>買い取る <span style={{ ...SER, fontSize: 44, color: A }}>約300</span><span style={{ fontSize: 30 }}>万円</span></>, "一括か、再ローン（また利息がかかる）")}
      {card(2, a(47.1), "🔁", "乗り換える", "精算額は次のローンに乗ることも")}
      <Stamp at={a(49.14)} x={250} y={1035} text="300万円は手元にない" size={56} rot={-5} />
      <NoteBox at={a(47.6)} y={1165} title={<>※ <R c={A}>売る</R>こともできます。ただし…</>}>車の名義は、まだローン会社。<br />売ったお金で<b>先に残りのローンを返す</b>。<br />足りなければ<b>差額は自分で払う</b>（契約による）</NoteBox>
    </AbsoluteFill>
  );
};

// ════════ 11 返すときの条件 → 精算40万円（50.16–58.38） ════════
const P9: React.FC = () => {
  const f = useCurrentFrame();
  const S = 50.16, a = (t: number) => t - S;
  const rc = interpolate(f, [F(a(54.0)), F(a(54.0)) + 12], [700, 0], out);
  const tot = stepN(f, a(56.12), 40, 0.5, 0);
  return (
    <AbsoluteFill style={{ transform: shake(f, a(57.4), 10) }}>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🔍">さらに 返すときの<R c={A}>条件</R></Head>
      <In at={0.3} x={40} y={450} mode="throw" from="l" rot={-5}><GenSlot name="car_odometer" size={380} /></In>
      <div style={{ position: "absolute", left: 450, top: 470 }}>
        <Line size={28} at={a(51.28)}>✔ 走行距離（例：月1,000kmまで）</Line>
        <Line size={28} at={a(52.12)}>✔ 傷・へこみ・修復歴</Line>
        <Line size={28} at={a(52.4)}>✔ 改造・内装の汚れ・におい</Line>
        <Line size={28} at={a(52.64)}><span style={{ color: M.red }}>→ 超えると追加で精算</span></Line>
      </div>
      {f >= F(a(54.0)) ? (
        <div style={{ position: "absolute", left: 250, top: 830 + rc, width: 580, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 8, boxShadow: `8px 8px 0 ${M.ink}`, padding: "16px 28px 18px", boxSizing: "border-box", transform: "rotate(-2deg)" }}>
          <div style={{ ...K, fontSize: 32, textAlign: "center", borderBottom: `4px dashed ${M.gray}`, paddingBottom: 6 }}>🧾 精算のお知らせ</div>
          <div style={{ ...K, fontSize: 32, lineHeight: 1.6, marginTop: 6 }}>
            <div style={{ opacity: f >= F(a(54.56)) ? 1 : 0 }}>・走行距離の超過</div>
            <div style={{ opacity: f >= F(a(55.58)) ? 1 : 0 }}>・傷の修理</div>
          </div>
          <div style={{ borderTop: `4px solid ${M.ink}`, marginTop: 6, paddingTop: 4, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}><span style={{ ...K, fontSize: 34 }}>合計</span><span><span style={{ ...K, fontSize: 32 }}>約</span><span style={{ ...SER, fontSize: 90, color: M.red }}>{f >= F(a(56.12)) ? yen(tot) : "--"}</span><span style={{ ...K, fontSize: 36 }}>万円</span></span></div>
        </div>
      ) : null}
      <Stamp at={a(57.62)} x={600} y={1150} text="精算が必要" size={58} rot={-8} />
      <Note at={a(54.0)} top={1262}>※精算があるか・いくらかは、契約（残価保証の条件）や車の状態で変わります（この例では約40万円）</Note>
    </AbsoluteFill>
  );
};

// ════════ 12 その40万円も払えない → ディーラー（58.38–64.82） ════════
const P10: React.FC = () => {
  const S = 58.38, a = (t: number) => t - S;
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="💦" />
      <In at={0.15} x={40} y={400} mode="pop"><GenSlot name="car_a_dealer_worry" size={500} /></In>
      <In at={a(59.9)} x={50} y={1130} mode="pop" rot={-3}><Pill2 c="#fff" size={40}>👛 その40万円も<R>払えない</R></Pill2></In>
      <In at={a(61.24)} x={560} y={700} mode="throw" from="r" rot={6}><GenSlot name="car_dealer_smile" size={400} /></In>
      <In at={a(62.2)} x={470} y={430} mode="pop" rot={3}><Bubble tail="b" w={560} size={42}><TypeIn at={F(a(62.2))} step={2}>月々ほぼ同じで<br />乗り換えられますよ♪</TypeIn></Bubble></In>
    </AbsoluteFill>
  );
};

// ════════ 13 精算金40万円も次のローンに乗せる（64.82–69.70） ════════
const P11: React.FC = () => {
  const f = useCurrentFrame();
  const S = 64.82, a = (t: number) => t - S;
  const slide = interpolate(f, [F(a(67.58)), F(a(67.58)) + 10], [0, 1], out);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🔁">新しい車に乗り換え</Head>
      <In at={a(66.92)} x={90} y={700} mode="rise">
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <div style={{ width: 640, height: 170, background: A, border: `6px solid ${M.ink}`, borderRadius: "16px 0 0 16px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}><span style={{ ...K, fontSize: 28 }}>次の車のローン</span><span style={{ ...SER, fontSize: 70 }}>600<span style={{ ...K, fontSize: 30 }}>万円</span></span></div>
          <div style={{ width: 220, height: 170, border: `6px dashed ${M.red}`, borderLeft: "none", borderRadius: "0 16px 16px 0", boxSizing: "border-box" }} />
        </div>
      </In>
      <In at={a(65.36)} x={0} y={0} mode="pop">
        <div style={{ position: "absolute", left: 360 + 370 * slide, top: 450 + 256 * slide, width: 220, height: 158, background: "#FDE7E2", border: `6px solid ${M.red}`, borderRadius: 14, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `rotate(${-8 * (1 - slide)}deg)`, boxShadow: slide < 1 ? `6px 6px 0 ${M.ink}` : undefined }}>
          <span style={{ ...K, fontSize: 26 }}>精算金</span><span style={{ ...SER, fontSize: 60, color: M.red }}>40<span style={{ ...K, fontSize: 26 }}>万円</span></span>
        </div>
      </In>
      {f >= F(a(67.58)) + 10 ? <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", transform: `scale(${pop(f, F(a(67.58)) + 10)})` }}><span style={{ ...K, fontSize: 44 }}>借りる額 </span><span style={{ ...SER, fontSize: 96, color: M.red }}>640</span><span style={{ ...K, fontSize: 44 }}>万円に</span></div> : null}
      <Stamp at={a(68.96)} x={330} y={1080} text="乗り換え" size={76} c={A} rot={-6} />
    </AbsoluteFill>
  );
};

// ════════ 14 月7.9万円に増える → 次の残クレへ＝残クレループ（69.70–75.20） ════════
const P12: React.FC = () => {
  const f = useCurrentFrame();
  const S = 69.7, a = (t: number) => t - S;
  const v = stepN(f, a(70.78), 78694, 0.9, 71053);
  const spin = f >= F(a(72.44)) ? (f - F(a(72.44))) * 2.2 : 0;
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="📈" />
      <In at={0.15} x={280} y={360} mode="rise"><Meter v={v} c={A} label={<div style={{ ...K, fontSize: 30, color: M.sub }}>7.1万円 → <R>7.9万円</R></div>} /></In>
      <In at={a(71.92)} x={760} y={480} mode="pop" rot={8}><span style={{ ...K, fontSize: 64, color: M.red }}>UP↑</span></In>
      <In at={a(72.44)} x={290} y={790} mode="pop"><div style={{ transform: `rotate(${Math.sin(spin / 20) * 4}deg)` }}><GenSlot name="car_a_loop" size={500} /></div></In>
      <Stamp at={a(74.28)} x={190} y={1150} text="残クレループ" size={88} c={M.red} rot={-6} />
      <Note at={a(70.78)} top={1290}>※例：640万円・金利5.5%・5年・残価300万円で試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 15 一方B家は乗り続け、積立元本は260万円（75.20–80.34） ════════
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
  const S = 75.2, a = (t: number) => t - S;
  const v = stepN(f, a(79.08), 260, 0.8, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={G} pill="一方 B家" icon="🌱" />
      <In at={0.2} x={30} y={420} mode="throw" from="l" rot={-5}><GenSlot name="car_b_family_7" size={500} /></In>
      <In at={a(76.14)} x={60} y={940} mode="pop"><Pill2 c={G} size={38}>同じ車に 乗り続ける</Pill2></In>
      <In at={a(77.46)} x={640} y={420} mode="rise"><Piggy v={v} max={510} /></In>
      <In at={a(79.7)} x={560} y={900} mode="pop" rot={-3}><div style={{ background: "#fff", border: `5px solid ${G}`, borderRadius: 16, boxShadow: `5px 5px 0 ${M.ink}`, padding: "8px 20px", textAlign: "center" }}><div style={{ ...K, fontSize: 26, color: M.sub }}>年利5%で運用できたら</div><div><span style={{ ...K, fontSize: 28 }}>約</span><span style={{ ...SER, fontSize: 64, color: G }}>291</span><span style={{ ...K, fontSize: 28 }}>万円</span><span style={{ ...K, fontSize: 26, color: G }}>（＋34万）</span></div></div></In>
      <Note at={a(79.7)} top={1150}>※元本＝積み立てたお金。年利5%は仮定（毎月42,772円・月複利・税引前）。運用は元本割れすることもあります</Note>
    </AbsoluteFill>
  );
};

// ════════ 16 10年後：B家は銀行ローン完済、車は完全に自分のもの／積立元本510万円（80.34–87.78） ════════
const P14: React.FC = () => {
  const f = useCurrentFrame();
  const S = 80.34, a = (t: number) => t - S;
  const prog = interpolate(f, [F(0.3), F(1.1)], [0.5, 1], out);
  const v = stepN(f, a(86.64), 510, 0.8, 260);
  return (
    <AbsoluteFill>
      <Paper2 />
      <In at={0.25} x={0} y={290} center mode="pop"><span style={{ display: "inline-block", background: M.ink, borderRadius: 18, padding: "10px 46px", transform: "rotate(-2deg)", boxShadow: `6px 6px 0 ${G}` }}><BounceText text="10年後" at={F(0.3)} size={88} color={M.yellow} stroke={false} /></span></In>
      <div style={{ position: "absolute", left: 90, top: 470, width: 900 }}>
        <div style={{ height: 30, background: "#EDE5C4", border: `5px solid ${M.ink}`, borderRadius: 16, overflow: "hidden" }}><div style={{ width: `${prog * 100}%`, height: "100%", background: `repeating-linear-gradient(-45deg, ${M.yellow} 0 18px, #F6CF4A 18px 36px)` }} /></div>
        <div style={{ position: "absolute", right: 0, top: 40, ...K, fontSize: 34 }}>子ども <span style={{ ...SER, fontSize: 50, color: M.red }}>12</span>歳</div>
      </div>
      <In at={a(82.18)} x={20} y={560} mode="throw" from="l" rot={-4}><GenSlot name="car_b_family_12" size={540} /></In>
      <Stamp at={a(83.3)} x={70} y={1030} text="銀行ローン 完済！" size={56} c={G} rot={-6} />
      <In at={a(84.62)} x={80} y={1130} mode="pop"><Pill2 c={G} size={36}>車は 完全に自分のもの</Pill2></In>
      <In at={a(85.6)} x={660} y={560} mode="rise"><Piggy v={v} max={664} /></In>
      <In at={a(86.9)} x={630} y={1000} mode="pop" rot={-3}><div style={{ background: "#fff", border: `5px solid ${G}`, borderRadius: 16, boxShadow: `5px 5px 0 ${M.ink}`, padding: "8px 20px", textAlign: "center" }}><div style={{ ...K, fontSize: 26, color: M.sub }}>年利5%で運用できたら</div><div><span style={{ ...K, fontSize: 28 }}>約</span><span style={{ ...SER, fontSize: 64, color: G }}>664</span><span style={{ ...K, fontSize: 28 }}>万円</span><span style={{ ...K, fontSize: 26, color: G }}>（＋151万）</span></div></div></In>
      <Note at={a(86.64)} top={1220}>※元本 約42,772円×120か月＝約513万円。年利5%は仮定（月複利・税引前）</Note>
    </AbsoluteFill>
  );
};

// ════════ 17 一方A家は2台目の残クレの終わり（87.78–90.48） ════════
const P14b: React.FC = () => {
  const S = 87.78, a = (t: number) => t - S;
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="一方 A家" icon="🚗">2台目の<R c={A}>残クレ</R>も終わり</Head>
      <In at={0.2} x={140} y={470} mode="pop"><GenSlot name="car_a_family_12" size={620} /></In>
      <Stamp at={a(89.6)} x={560} y={1060} text="2台目も契約おわり" size={50} c={A} rot={-6} />
    </AbsoluteFill>
  );
};

// ════════ 18 10年で払った利息（90.48–95.64）：棒の高さで比べる ════════
const P15: React.FC = () => {
  const f = useCurrentFrame();
  const S = 90.48, a = (t: number) => t - S;
  const hA = interpolate(f, [F(a(92.22)), F(a(92.22)) + 14], [0, 1], out), hB = interpolate(f, [F(a(94.06)), F(a(94.06)) + 10], [0, 1], out);
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
      <Head at={0.05} c={M.ink} pill="10年間で払った利息" icon="💸" />
      <div style={{ position: "absolute", left: 120, top: base, width: 840, height: 6, background: M.ink }} />
      {col(200, H * hA, A, "A家", stepN(f, a(92.8), 260, 0.6, 0), f >= F(a(92.6)))}
      {col(620, H * (40 / 260) * hB, G, "B家", stepN(f, a(94.6), 40, 0.4, 0), f >= F(a(94.4)))}
      <Note at={a(92.22)} top={1200}>※A家：1台目（600万円）と2台目（640万円）の利息の合計 約258万円／B家：約39万円</Note>
    </AbsoluteFill>
  );
};

// ════════ 19 A家が払ったのは約900万円 → それでも2台目の残価約300万円が残っている（95.64–106.14） ════════
const P16: React.FC = () => {
  const f = useCurrentFrame();
  const S = 95.64, a = (t: number) => t - S;
  const v = stepN(f, a(98.22), 900, 0.9, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🧾">10年間で<R c={A}>車のローンに払った</R>金額</Head>
      <In at={a(97.9)} x={0} y={470} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 24, boxShadow: `10px 10px 0 ${A}`, padding: "4px 40px" }}><span style={{ ...K, fontSize: 44 }}>約</span><span style={{ ...SER, fontSize: 150, color: A, lineHeight: 1.1 }}>{yen(v)}</span><span style={{ ...K, fontSize: 52 }}>万円</span></span></In>
      <In at={a(98.9)} x={0} y={700} center mode="ghost"><span style={{ ...B, fontSize: 30, color: M.sub }}>月7.1万円×5年 ＋ 月7.9万円×5年</span></In>
      <In at={a(99.3)} x={40} y={790} mode="pop"><GenSlot name="car_paper_owner" size={380} /></In>
      <In at={a(99.74)} x={450} y={800} mode="throw" from="r" rot={4}>
        <div style={{ width: 560, background: "#fff", border: `6px solid ${A}`, borderRadius: 18, boxShadow: `6px 6px 0 ${M.ink}`, padding: "12px 20px", textAlign: "center" }}>
          <div style={{ ...K, fontSize: 32 }}>それでも まだ残っている</div>
          <div><span style={{ ...K, fontSize: 32 }}>2台目の残価 約</span><span style={{ ...SER, fontSize: 80, color: A }}>300</span><span style={{ ...K, fontSize: 34 }}>万円</span></div>
        </div>
      </In>
      <Stamp at={a(104.56)} x={50} y={1120} text="自分のものにするなら さらに支払い" size={42} rot={-4} />
    </AbsoluteFill>
  );
};

// ════════ 20 締め①：乗りたい車に乗るのは自由／残クレ自体が悪いわけではない → ただ月々払えるからで選ぶと…（106.14–113.98） ════════
const P17: React.FC = () => {
  const S = 106.14, a = (t: number) => t - S;
  const ROWS: [string, React.ReactNode, React.ReactNode, number][] = [
    ["車に払った額", <>約<b>900</b>万円</>, <>約<b>339</b>万円</>, 0.3],
    ["払った利息", <>約<b>260</b>万円</>, <>約<b>40</b>万円</>, 0.75],
    ["車", <>まだ自分のもの<br />ではない（残価300万）</>, <>自分のもの</>, 1.2],
    ["積立", <>0円</>, <>元本 約<b>510</b>万円<br /><span style={{ fontSize: 22 }}>5%運用なら 約664万円</span></>, 1.65],
  ];
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill c={M.ink} at={0.05} icon="✓">10年後の比較</SectionPill>
      <div style={{ position: "absolute", left: 60, top: 380, width: 960 }}>
        <div style={{ display: "flex", ...K, fontSize: 30, color: "#fff" }}><span style={{ width: 220 }} /><span style={{ flex: 1, background: A, borderRadius: "14px 14px 0 0", textAlign: "center", padding: "4px 0", marginRight: 8 }}>A家（残クレ）</span><span style={{ flex: 1, background: G, borderRadius: "14px 14px 0 0", textAlign: "center", padding: "4px 0" }}>B家（銀行ローン＋積立）</span></div>
        {ROWS.map(([l, x, y, at]) => (
          <In key={l} at={at} x={0} y={0} mode="rise" style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "stretch", borderBottom: `3px dashed ${M.gray}`, minHeight: 88 }}>
              <span style={{ width: 220, ...K, fontSize: 30, display: "flex", alignItems: "center" }}>{l}</span>
              <span style={{ flex: 1, ...K, fontSize: 30, color: A, background: "#FFF3EC", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", marginRight: 8, lineHeight: 1.2 }}><div>{x}</div></span>
              <span style={{ flex: 1, ...K, fontSize: 30, color: G, background: "#EAF6EF", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", lineHeight: 1.2 }}><div>{y}</div></span>
            </div>
          </In>
        ))}
      </div>
      <In at={a(106.94)} x={0} y={790} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 22, padding: "8px 30px", boxShadow: `8px 8px 0 ${M.yellow}`, ...K, fontSize: 44 }}>乗りたい車に乗るのは <R c={G}>自由</R></span></In>
      <In at={a(107.54)} x={0} y={888} center mode="ghost"><span style={{ ...K, fontSize: 34, color: M.sub }}>残クレ自体が悪いわけではない</span></In>
      <In at={a(109.58)} x={0} y={942} center mode="ghost"><span style={{ ...K, fontSize: 40 }}>ただ「<R c={A}>月々払えるから</R>」で選ぶと</span></In>
      <Stamp at={a(111.52)} x={110} y={1000} text="総支払額で大きく損しやすい" size={56} rot={-4} />
      <NoteBox at={a(107.0)} y={1135} title={<>車の買い方は <R c={G}>いろいろ</R></>}>現金一括・銀行ローン・残クレ など、<b>選ぶのは自由</b>。<br />大事なのは<b>総額で比べること</b></NoteBox>
    </AbsoluteFill>
  );
};

// ════════ 21 締め②：なるべく損を減らすなら（113.98–120.80） ════════
const P17b: React.FC = () => {
  const S = 113.98, a = (t: number) => t - S;
  const tip = (y: number, at: number, no: string, img: string, title: React.ReactNode, sub: React.ReactNode) => (
    <In at={at} x={60} y={y} mode="throw" from="r" rot={3}>
      <div style={{ width: 960, height: 280, background: "#fff", border: `6px solid ${M.ink}`, borderLeft: `20px solid ${G}`, borderRadius: 20, boxShadow: `8px 8px 0 ${M.ink}`, display: "flex", alignItems: "center", gap: 18, padding: "0 24px", boxSizing: "border-box" }}>
        <span style={{ ...K, fontSize: 56, color: G }}>{no}</span>
        <GenSlot name={img} size={220} />
        <div style={{ flex: 1 }}><div style={{ ...K, fontSize: 40, lineHeight: 1.3, whiteSpace: "nowrap" }}>{title}</div><div style={{ ...B, fontSize: 26, color: M.sub, marginTop: 6 }}>{sub}</div></div>
      </div>
    </In>
  );
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill c={M.ink} at={0.05} icon="✓">まとめ</SectionPill>
      <In at={0.15} x={0} y={385} center mode="ghost"><span style={{ ...K, fontSize: 50 }}>車で<R>なるべく損を減らす</R>なら</span></In>
      {tip(500, a(116.26), "①", "car_dealer_smile", <><R c={G}>リセールバリュー</R>を考える</>, "売るときに値段が下がりにくい車を選ぶ")}
      {tip(820, a(117.82), "②", "car_b_piggy", <>低金利の<R c={G}>銀行ローン</R>と<br /><R c={G}>資産形成</R>を組み合わせる</>, "")}
      <HandCircle at={a(120.2)} x={600} y={960} r={380} ry={150} c={M.red} />
    </AbsoluteFill>
  );
};

// ════════ 22 保存とフォロー（120.80–122.98） ════════
const P18: React.FC = () => {
  const f = useCurrentFrame();
  const S = 120.8, a = (t: number) => t - S;
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
      {btn(90, a(121.6), "🔖", "保存", M.yellow)}
      {btn(590, a(122.06), "➕", "フォロー", G)}
    </AbsoluteFill>
  );
};

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
export const CAR1_END = 123.0;
export const CAR1_PAGES: [number, React.FC][] = [[0, P1], [5.14, P2], [10.76, P3], [15.96, P4], [22.36, P5], [25.14, P6], [31.96, P7], [36.94, P7b], [39.9, P8], [42.82, P8b], [50.16, P9], [58.38, P10], [64.82, P11], [69.7, P12], [75.2, P13], [80.34, P14], [87.78, P14b], [90.48, P15], [95.64, P16], [106.14, P17], [113.98, P17b], [120.8, P18]];
const CHAPTER = new Set([2, 5, 8, 15, 19]); // 次のページが章の頭（A家・B家・5年後・10年後・まとめ）
export const CARFAMILY_FRAMES = F(CAR1_END);

// 字幕（話した言葉どおり・!A家の言葉! *B家の言葉* ~全体~）
const SUBS: [number, string][] = [
  [0, "*お金が残る家族*と"], [1.32, "!残らない家族!"], [2.48, "将来どうなるのか？"], [3.94, "今回は ~車の買い方~"],
  [5.14, "同じ収入の 2組の家族で"], [7.02, "夫婦27歳"], [8.32, "2歳の子どもが1人"], [9.4, "世帯年収は ~600万円~"],
  [10.76, "!A家!が選んだのは"], [11.58, "約600万円の 大きなミニバン"], [13.38, "!残クレ!で 5年契約"], [14.8, "月々 約!7万1,000円!"],
  [15.96, "残価設定は !50%!"], [17.36, "約!300万円!を 残しました"], [18.94, "でも その300万円にも"], [20.48, "5年間ずっと !利息! がかかります"],
  [22.36, "「月々払えるから大丈夫」"], [23.68, "A家は そう思っていました"],
  [25.14, "一方 *B家*は"], [26.16, "毎月 車に出せるのは"], [27.48, "A家と同じ 月*7万円*くらい"], [29.6, "でも *身の丈*に合った車を買おうと考えて"],
  [31.96, "約300万円のミニバンを"], [33.74, "*銀行ローン*で 10年"], [35.02, "月々 約*2万8,000円*"],
  [36.94, "残りの *4万3,000円*は"], [38.56, "*積み立て投資*に回しました"],
  [39.9, "~5年後~ 子どもは7歳"], [41.34, "A家の残クレが 終わります"],
  [42.82, "選べる道は ~3つ~"], [43.92, "車を返すか"], [44.92, "残りの300万円を払って買い取るか"], [47.1, "乗り換えるか"], [48.02, "でも !300万円! は手元にはありません"],
  [50.16, "さらに 返すときには"], [51.28, "!走行距離!や!傷!など"], [52.64, "契約上の条件があります"], [54.0, "今回は 走行距離の超過と傷で"], [56.12, "約!40万円!の精算が"], [57.62, "必要になりました"],
  [58.38, "でも その40万円も"], [59.9, "払うことはできませんでした"], [61.24, "ディーラーから"], [62.2, "「月々ほぼ同じで 乗り換えられますよ」"], [64.24, "と言われ"],
  [64.82, "A家は 精算金40万円も"], [66.92, "次のローンに乗せて"], [68.02, "新しい車に乗り換えました"], [69.7, "月々の支払いは 約!7万9,000円!に"], [71.92, "増えました"], [72.44, "こうして 次の残クレ"], [73.78, "これが !残クレループ! です"],
  [75.2, "一方 *B家*は 同じ車に乗り続けています"], [77.46, "5年間で積み立てた元本は"], [79.08, "約*260万円*"],
  [80.34, "そして ~10年後~"], [81.34, "子どもは12歳"], [82.18, "B家は *銀行ローン完済*"], [84.08, "車は *完全に自分のもの* です"], [85.6, "積み立てた元本は 約*510万円*"],
  [87.78, "一方 A家は"], [88.54, "2台目の!残クレ!の 終わりを迎えます"],
  [90.48, "10年間で払った利息は"], [92.22, "A家が 約!260万円!"], [94.06, "B家が 約*40万円*"],
  [95.64, "A家が10年間で"], [96.78, "車のローンに払った金額は"], [98.22, "約!900万円!"], [99.3, "それでも 2台目の残価"], [100.56, "約!300万円!が 残っています"],
  [102.16, "つまり その車を"], [103.24, "自分のものにするなら"], [104.56, "さらに支払いが必要です"],
  [106.14, "乗りたい車に乗るのは ~自由~"], [107.54, "残クレ自体が 悪いわけではありません"], [109.58, "ただ「月々払えるから」で選ぶと"], [111.52, "総支払額は"], [112.4, "!大きく損する!可能性が高いです"],
  [113.98, "車の購入で"], [114.9, "なるべく損を減らすなら"], [116.26, "*リセールバリュー*を考えること"], [117.82, "低金利の*銀行ローン*と"], [119.2, "*資産形成*を組み合わせること"],
  [120.8, "忘れないように"], [121.6, "*保存*と*フォロー*を しておいてください"],
];

const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  ...CAR1_PAGES.slice(1).map(([t]) => s("u03s", t - 0.42, 0.22)),
  s("u02s", 1.32, 0.18), s("u04", 1.6, 0.26), s("u05s", 2.48, 0.2), s("u05", 3.94, 0.22),
  s("u02s", 5.6, 0.16), s("u02s", 6.8, 0.14), s("u02s", 8.1, 0.14), s("u06", 9.8, 0.2), s("u04", 10.15, 0.28),
  s("u02s", 11.35, 0.18), s("u02s", 12.35, 0.16), s("u04", 13.15, 0.28), s("u02s", 13.65, 0.16), s("u06", 14.9, 0.22), s("u05s", 15.5, 0.22),
  s("u05s", 17.15, 0.22), s("u05s", 19.1, 0.2), s("u04", 21.15, 0.26),
  s("u02s", 22.4, 0.18), s("u10", 23.5, 0.2),
  s("u02s", 25.6, 0.18), s("u02s", 27.25, 0.18), s("u05s", 28.15, 0.2), s("u05", 29.6, 0.22),
  s("u02s", 32.15, 0.18), s("u02s", 32.9, 0.16), s("u02s", 33.5, 0.16), s("u02s", 34.4, 0.16), s("u06", 35.3, 0.22), s("u05s", 36.2, 0.2),
  s("u05s", 37.0, 0.24), s("u02s", 38.35, 0.18), s("u05", 38.7, 0.22),
  s("u09", 39.9, 0.26), s("u02s", 41.1, 0.18), s("u04", 42.0, 0.28),
  s("u02s", 43.7, 0.18), s("u02s", 44.7, 0.18), s("u02s", 46.9, 0.18), s("u04", 48.1, 0.3), s("u04", 48.9, 0.26),
  s("u02s", 51.05, 0.14), s("u02s", 51.9, 0.14), s("u02s", 52.4, 0.14), s("u05s", 53.8, 0.22), s("u06", 55.9, 0.22), s("u04", 57.4, 0.3),
  s("u02s", 59.7, 0.18), s("u02s", 61.0, 0.18), s("u07", 62.0, 0.2),
  s("u02s", 65.15, 0.18), s("u05s", 66.7, 0.22), s("u05s", 67.4, 0.22), s("u04", 68.75, 0.28),
  s("u06", 70.55, 0.22), s("u02s", 71.7, 0.18), s("u05", 72.25, 0.22), s("u04", 74.05, 0.3),
  s("u02s", 75.95, 0.16), s("u06", 78.85, 0.22),
  s("u09", 80.34, 0.26), s("u04", 83.1, 0.28), s("u02s", 84.4, 0.18), s("u06", 86.4, 0.22),
  s("u02s", 88.0, 0.18), s("u04", 89.4, 0.26),
  s("u05s", 92.0, 0.22), s("u05s", 93.85, 0.22),
  s("u06", 98.0, 0.24), s("u02s", 99.1, 0.16), s("u05s", 99.55, 0.2), s("u04", 104.35, 0.28),
  s("u05", 106.75, 0.22), s("u05s", 109.4, 0.2), s("u04", 111.3, 0.3),
  s("u05s", 116.05, 0.22), s("u05s", 117.6, 0.22), s("u10", 120.0, 0.22),
  s("u02s", 121.4, 0.18), s("u07", 121.85, 0.22), s("u02s", 122.0, 0.16),
];

// 右下のたいち：口パク＋まばたき（マーケ博士のように話している形）
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  const lv = CAR3_MOUTH.charCodeAt(Math.min(CAR3_MOUTH.length - 1, f)) - 48;
  const blink = f % 96 > 92 && lv === 0;
  const name = blink ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 3) % 4 ? "taichi_talk_open" : "taichi_talk_mid") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  return <div style={{ position: "absolute", left: 800, top: 1095 + Math.sin(f / 10) * 5, width: 250, height: 250 }}><GenSlot name={name} size={250} /></div>;
};

const SAFE = 0.9, SAFE_X = 540 - 540 * SAFE, SAFE_Y = 300 - 280 * SAFE;
export const CarFamilyReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.paper, fontFamily: FONT }}>
    <Audio src={staticFile("car7-narration.wav")} />
    <SfxTrack cues={CUES} />
    <AbsoluteFill style={{ background: M.paper, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${SAFE_X}px, ${SAFE_Y}px) scale(${SAFE})`, transformOrigin: "0 0" }}>
      {CAR1_PAGES.map(([t, P], i) => {
        const st = i === 0 ? 0 : W(t) - 0.12;
        const last = i + 1 >= CAR1_PAGES.length;
        const end = last ? CAR1_END : W(CAR1_PAGES[i + 1][0]) - 0.12;
        const dur = F(end) - F(st);
        return <Sequence key={i} from={F(st)} durationInFrames={dur}><PageMove dur={dur} first={i === 0} last={last} chapterNext={CHAPTER.has(i + 1)}><P /></PageMove></Sequence>;
      })}
    </div>
    <Sequence durationInFrames={F(CAR1_END)}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, bottom: 0, background: `linear-gradient(${M.paper}00, ${M.paper} 50px)` }} />
      <Chara />
      <Captions subs={SUBS.map(([t, x]) => [W(t), x] as [number, string])} end={CAR1_END} maxW={740} size={0.78} kcol={{ g: G, r: A, b: M.red }} top={1352} swap />
    </Sequence>
  </AbsoluteFill>
);
