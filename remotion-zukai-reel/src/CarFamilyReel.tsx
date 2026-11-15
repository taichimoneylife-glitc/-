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
//  家族シリーズ①「車編」：お金が残る家族と、残らない家族（たいちさんの声 public/car3-narration.wav 113.3秒・1.1倍・間を詰めた版。時刻はWで置きかえ）
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
// 時間の置きかえ：台本の時刻はAI音声(car2)で決めた → たいちさんの声(car3-narration.wav・1.1倍)の時刻へ、言葉の頭どうしを線でつなぐ
const WARP: [number, number][] = [[0,0.0],[1.5,1.38],[2.34,2.52],[3.76,4.15],[5.92,6.53],[7.62,8.17],[9.1,9.63],[10.36,11.12],[11.2,11.98],[12.24,13.29],[13.94,14.81],[14.74,15.67],[15.26,16.42],[16.32,17.35],[17.84,19.25],[19.56,22.16],[21.22,23.8],[23.94,26.33],[24.8,27.31],[27.1,29.31],[28.34,30.55],[29.88,32.29],[31.2,33.53],[32.84,35.38],[35.3,38.36],[37.28,40.71],[38.9,42.25],[40.16,43.43],[41.92,45.22],[43.74,46.8],[45.38,48.87],[47.14,50.23],[48.66,51.89],[49.84,53.19],[52.84,56.21],[53.54,57.28],[55.66,59.2],[56.74,60.35],[59.66,63.49],[61.48,65.51],[63.78,68.06],[66.04,70.8],[68.56,74.18],[71.96,77.86],[74.5,80.55],[76.88,83.2],[78.68,85.1],[81.48,87.71],[83.12,89.37],[84.84,91.47],[87.32,94.02],[88.7,95.34],[90.56,97.12],[92.06,98.99],[93.34,100.47],[94.76,101.65],[97.06,104.43],[98.98,106.68],[100.28,107.94],[101.68,109.93],[103.9,112.39],[105.38,114.01],[107.34,116.09],[109.5,118.54],[110.36,119.4],[112.2,121.53]];
const W = (t: number) => {
  for (let i = 1; i < WARP.length; i++) if (t <= WARP[i][0]) { const [a0, b0] = WARP[i - 1], [a1, b1] = WARP[i]; return b0 + ((t - a0) / (a1 - a0)) * (b1 - b0); }
  return t + (WARP[WARP.length - 1][1] - WARP[WARP.length - 1][0]);
};
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

// ════════ 1 冒頭（0–5.92）：同じ2家族のカード → VS → 将来どうなる？ → 車の選び方 ════════
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const LAND = [600, 300, 150, 76, 38, 18, 8, 3, 0]; // 入り＝毎フレーム約半分になる急ブレーキ
  const land = (at: number) => { const k = f - F(at); return k < 0 ? 2000 : LAND[Math.min(LAND.length - 1, k)]; };
  const up = interpolate(f, [F(W(3.62)), F(W(3.62)) + 8], [0, 1], out);
  return (
    <AbsoluteFill>
      <Paper2 />
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", lineHeight: 1.1 }}>
        <span style={{ display: "inline-flex" }}><BounceText text="お金が残る" at={0} size={86} color={G} stroke={false} step={1} /><BounceText text="家族と" at={5} size={86} stroke={false} step={1} /></span><br />
        <span style={{ display: "inline-flex" }}><BounceText text="残らない" at={F(W(1.5))} size={86} color={A} stroke={false} step={1} /><BounceText text="家族" at={F(W(1.5)) + 5} size={86} stroke={false} step={1} /></span>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translateY(${-60 * up}px) scale(${1 - 0.12 * up})`, transformOrigin: "540px 500px" }}>
        <div style={{ position: "absolute", left: 590, top: 520 + land(0) }}><Fam who="B" img="car_b_family_2" size={300} w={430} title="B家" /></div>
        <div style={{ position: "absolute", left: 60, top: 520 + land(W(1.5)) }}><Fam who="A" img="car_a_family_2" size={300} w={430} title="A家" /></div>
        <In at={W(1.75)} x={0} y={700} center mode="pop"><span style={{ display: "inline-block", background: M.red, color: "#fff", border: `5px solid ${M.ink}`, borderRadius: 999, width: 110, height: 110, lineHeight: "100px", textAlign: "center", ...K, fontSize: 54, boxShadow: `5px 5px 0 ${M.ink}` }}>VS</span></In>
        <In at={W(2.34)} x={0} y={940} center mode="pop"><span style={{ display: "inline-block", background: M.yellow, border: `5px solid ${M.ink}`, borderRadius: 16, padding: "6px 30px", ...K, fontSize: 50, boxShadow: `5px 5px 0 ${M.ink}` }}>将来 どうなる？</span></In>
      </div>
      <In at={W(3.76)} x={70} y={960} mode="throw" from="d" rot={-4}><GenSlot name="car_two_roads" size={330} /></In>
      {f >= F(W(4.0)) ? <div style={{ position: "absolute", left: 420, top: 1040 }}>
        <Tag c={M.yellow} size={30}>家族シリーズ</Tag>
        <div style={{ marginTop: 12, display: "inline-flex" }}><BounceText text="車の選び方" at={F(W(4.4))} size={84} stroke={false} /></div>
      </div> : null}
    </AbsoluteFill>
  );
};

// ════════ 2 前提（5.92–12.24）：プロフィールに1行ずつ足される ════════
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const S = 5.92, a = (t: number) => W(t) - W(S);
  const prof = (who: "A" | "B", x: number, at: number) => (
    <In at={at} x={x} y={470} mode="throw" from={who === "A" ? "l" : "r"} rot={who === "A" ? -6 : 6}>
      <Fam who={who} img={`car_${who.toLowerCase()}_family_2`} size={220} w={450}>
        <div style={{ width: 380, marginTop: 6 }}>
          <Line at={a(8.12)}>👫 夫婦 27歳</Line>
          <Line at={a(9.1)}>👶 子ども 2歳・1人</Line>
          <Line at={a(10.36)}>💴 世帯年収 <span style={{ ...SER, fontSize: 44, color: who === "A" ? A : G }}>{yen(stepN(f, a(11.1), 600, 0.45, 0))}</span>万円</Line>
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
      <In at={a(11.7)} x={0} y={790} center mode="pop"><span style={{ ...K, fontSize: 90, color: M.red }}>＝</span></In>
      <Stamp at={a(11.75)} x={330} y={1120} text="条件は同じ" size={70} rot={-6} />
    </AbsoluteFill>
  );
};

// ════════ 3 A家の車（12.24–17.84）：600万円・残クレ・5年 → メーターが月7.1万円まで回る ════════
const P3: React.FC = () => {
  const f = useCurrentFrame();
  const S = 12.24, a = (t: number) => W(t) - W(S);
  const v = stepN(f, a(16.6), 71053, 0.9, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家の車" icon="🚗" />
      <In at={0.2} x={40} y={360} mode="throw" from="l" rot={-6}><GenSlot name="car_a_minivan" size={470} /></In>
      <In at={a(12.9)} x={560} y={400} mode="pop" rot={4}><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${A}`, borderRadius: 18, padding: "6px 24px", boxShadow: `6px 6px 0 ${M.ink}` }}><span style={{ ...K, fontSize: 34 }}>約</span><span style={{ ...SER, fontSize: 96, color: A }}>600</span><span style={{ ...K, fontSize: 40 }}>万円</span></span></In>
      <In at={a(13.94)} x={590} y={560} mode="pop"><Chip c={A}>大きなミニバン</Chip></In>
      <Stamp at={a(14.74)} x={600} y={650} text="残クレ" size={86} c={A} rot={-8} />
      <In at={a(15.26)} x={630} y={790} mode="pop"><Chip c={A} size={40}>5年契約</Chip></In>
      <In at={a(16.2)} x={280} y={860} mode="rise"><Meter v={v} c={A} /></In>
      <HandCircle at={a(17.5)} x={540} y={1162} r={250} ry={70} c={M.red} />
      <Note at={a(16.2)} top={1262}>※例：金利5.5%・5年（60回）・最後に残す額（残価）300万円で試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 4 月々が安い理由（17.84–24.80）：600万円の棒が割れる → 残した300万円にも利息 ════════
const P4: React.FC = () => {
  const f = useCurrentFrame();
  const S = 17.84, a = (t: number) => W(t) - W(S);
  const split = interpolate(f, [F(a(18.96)), F(a(18.96)) + 9], [0, 1], out);
  const intA = interpolate(f, [F(a(23.94)), F(a(23.94)) + 12], [0, 1], out);
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
      {f >= F(a(18.96)) ? <div style={{ position: "absolute", left: 90 + BW / 2 + 15, top: 800, width: BW / 2 - 15, textAlign: "center", ...K, fontSize: 30, opacity: split }}>5年後に<R c={A}>返すか・払うか</R></div> : null}
      <HandCircle at={a(22.12)} x={765} y={675} r={220} ry={130} c={M.red} />
      {f >= F(a(23.94)) ? (
        <>
          {[0, 1].map((i) => (
            <div key={i} style={{ position: "absolute", left: 90 + i * (BW / 2 + 15), width: BW / 2 - 15, top: 500 + (1 - intA) * -200, opacity: intA, textAlign: "center" }}>
              <span style={{ display: "inline-block", background: M.red, color: "#fff", border: `5px solid ${M.ink}`, borderRadius: 12, padding: "4px 22px", ...K, fontSize: 36, boxShadow: `4px 4px 0 ${M.ink}` }}>＋利息</span>
            </div>
          ))}
        </>
      ) : null}
      <In at={a(22.12)} x={0} y={880} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 22, padding: "14px 34px", boxShadow: `8px 8px 0 ${M.red}`, ...K, fontSize: 48, lineHeight: 1.35, textAlign: "center" }}>残した<R c={A}>300万円</R>にも<br /><R>5年間ずっと利息</R>がかかる</span></In>
      <In at={a(24.2)} x={0} y={1100} center mode="pop"><Pill2 c={M.yellow} size={36}><span style={{ color: M.ink }}>5年の利息 約<R>126万円</R>（うち残価分 約83万円）</span></Pill2></In>
      <Note at={a(24.2)} top={1200}>※例：600万円・金利5.5%・5年・残価300万円で試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 5 自分のものではない（24.80–31.20）→「月々払えるなら大丈夫」 ════════
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const S = 24.8, a = (t: number) => W(t) - W(S);
  const gray = interpolate(f, [F(a(29.88)), F(a(29.88)) + 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="📄">払い終わるまで…</Head>
      <In at={0.4} x={50} y={450} mode="throw" from="l" rot={-6}><GenSlot name="car_paper_owner" size={340} /></In>
      <In at={a(25.6)} x={420} y={470} mode="throw" from="r" rot={5}>
        <div style={{ width: 590, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 16, boxShadow: `6px 6px 0 ${M.ink}`, overflow: "hidden" }}>
          <div style={{ background: M.sub, color: "#fff", padding: "6px 18px", ...K, fontSize: 26 }}>車の書類（イメージ）</div>
          <div style={{ padding: "12px 20px", ...K, fontSize: 32, lineHeight: 1.6 }}>
            <div>所有者：<R c={M.red}>販売店・信販会社など</R></div>
            <div>使用者：<R c={A}>A家</R></div>
          </div>
        </div>
      </In>
      <HandCircle at={a(27.1)} x={720} y={598} r={260} ry={42} c={M.red} />
      <Stamp at={a(27.4)} x={470} y={700} text="自分のものではない" size={52} rot={-5} />
      <div style={{ filter: `grayscale(${gray})`, opacity: 1 - 0.25 * gray }}>
        <In at={a(28.34)} x={60} y={830} mode="pop"><GenSlot name="car_a_happy_drive" size={420} /></In>
        <In at={a(28.4)} x={480} y={880} mode="pop" rot={4}><Bubble tail="l" w={560} size={42}><TypeIn at={F(a(28.4))} step={2}>月々払えるなら<br />大丈夫！</TypeIn></Bubble></In>
      </div>
      <In at={a(30.4)} x={520} y={1100} mode="ghost"><span style={{ ...K, fontSize: 40, color: M.sub }}>…と、思っていました</span></In>
    </AbsoluteFill>
  );
};

// ── 毎月出せる額の棒（A家は全部が車／B家は車のローン＋先に積立） ──
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
                <div style={{ position: "absolute", left: wl + 12 * sp, top: 0, width: W - wl - 12 * sp, height: 150, background: "#fff", border: `6px solid ${G}`, borderRadius: 16, boxShadow: `6px 6px 0 ${M.ink}`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - sp) * -20}px)` }}><span style={{ ...K, fontSize: 26, color: G }}>先に積立</span><span style={{ ...SER, fontSize: 60, color: G }}>4.3<span style={{ ...K, fontSize: 28 }}>万円</span></span></div>
              </>
            )}
          </div>
        </div>
      </In>
    );
  };
  return <>{row("A", 490, aAt)}{row("B", 700, bAt)}</>;
};

// ════════ 6 B家：毎月出せるのは同じ月7万くらい → 身の丈に合った車を（31.20–37.28） ════════
const P6: React.FC = () => {
  const S = 31.2, a = (t: number) => W(t) - W(S);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={G} pill="B家" icon="💡">毎月出せるのは<R c={M.red}>同じ</R></Head>
      <MonthRows bAt={0.3} aAt={a(32.84)} />
      <In at={a(33.36)} x={0} y={640} center mode="pop"><span style={{ ...K, fontSize: 44, color: M.red, marginLeft: 160 }}>＝ 同じ額</span></In>
      <In at={a(35.3)} x={0} y={940} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 22, padding: "14px 34px", boxShadow: `8px 8px 0 ${G}`, ...K, fontSize: 50 }}>でも車は <R c={G}>身の丈</R>に合ったものを</span></In>
    </AbsoluteFill>
  );
};

// ════════ 7 B家の車（37.28–41.92）：300万円・銀行ローン10年 → メーターが月2.8万円 ════════
const P7: React.FC = () => {
  const f = useCurrentFrame();
  const S = 37.28, a = (t: number) => W(t) - W(S);
  const v = stepN(f, a(40.58), 28281, 0.8, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={G} pill="B家の車" icon="🚙" />
      <In at={0.2} x={600} y={380} mode="throw" from="r" rot={6}><GenSlot name="car_b_minivan" size={420} /></In>
      <In at={a(37.64)} x={70} y={410} mode="pop" rot={-4}><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${G}`, borderRadius: 18, padding: "6px 24px", boxShadow: `6px 6px 0 ${M.ink}` }}><span style={{ ...K, fontSize: 34 }}>約</span><span style={{ ...SER, fontSize: 96, color: G }}>300</span><span style={{ ...K, fontSize: 40 }}>万円</span></span></In>
      <In at={a(38.46)} x={90} y={570} mode="pop"><Chip c={G}>ミニバン</Chip></In>
      <In at={a(38.9)} x={90} y={650} mode="pop"><Chip c={G} size={40}>銀行ローン</Chip></In>
      <In at={a(39.7)} x={350} y={650} mode="pop"><Chip c={G} size={40}>10年</Chip></In>
      <In at={a(40.16)} x={280} y={860} mode="rise"><Meter v={v} c={G} /></In>
      <HandCircle at={a(41.4)} x={540} y={1162} r={250} ry={70} c={G} />
      <Note at={a(40.16)} top={1262}>※例：金利2.5%・10年（120回）で試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 8 残りの4.3万円は先に積立（41.92–45.38） ════════
const P7b: React.FC = () => {
  const S = 41.92, a = (t: number) => W(t) - W(S);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={G} pill="B家" icon="🌱">残りは<R c={G}>先に積立</R></Head>
      <MonthRows aAt={0.1} bAt={0.1} splitAt={a(42.42)} />
      <In at={a(44.4)} x={130} y={900} mode="pop"><GenSlot name="car_b_piggy" size={330} /></In>
      <In at={a(43.74)} x={480} y={960} mode="pop"><Pill2 c={G} size={40}>毎月 <span style={{ color: M.yellow }}>先に</span> 積立</Pill2></In>
      <Stamp at={a(44.6)} x={520} y={1080} text="使う前に よける" size={54} c={G} rot={-5} />
      <Note at={a(42.42)} top={1262}>※71,053円 − 28,281円 ＝ 42,772円（約4.3万円）</Note>
    </AbsoluteFill>
  );
};

// ════════ 9 5年後（45.38–48.66）：時間の棒が5年まで進む → A家の残クレが終わる ════════
const P8: React.FC = () => {
  const f = useCurrentFrame();
  const S = 45.38, a = (t: number) => W(t) - W(S);
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
      <In at={a(47.0)} x={70} y={690} mode="throw" from="l" rot={-5}><GenSlot name="car_a_minivan" size={430} /></In>
      <In at={a(47.14)} x={540} y={760} mode="pop"><Pill2 c={A} size={42}>A家の残クレ</Pill2></In>
      <Stamp at={a(48.2)} x={560} y={880} text="契約おわり" size={72} c={A} rot={-7} />
    </AbsoluteFill>
  );
};

// ════════ 10 選べる道は3つ（48.66–55.66）→「買い取る」に × ════════
const P8b: React.FC = () => {
  const f = useCurrentFrame();
  const S = 48.66, a = (t: number) => W(t) - W(S);
  const x = interpolate(f, [F(a(53.98)), F(a(53.98)) + 7], [0, 1], out);
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
    <AbsoluteFill style={{ transform: shake(f, a(53.98), 12) }}>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家の5年後" icon="🔀">選べる道は<R c={A}>3つ</R></Head>
      {card(0, a(50.12), "↩️", "車を返す", "条件を満たせば終わり。車は手元に残らない")}
      {card(1, a(50.66), "💴", <>買い取る <span style={{ ...SER, fontSize: 44, color: A }}>約300</span><span style={{ fontSize: 30 }}>万円</span></>, "残りを払って自分の車にする")}
      {card(2, a(52.84), "🔁", "乗り換える", "次の車の契約を結ぶ")}
      <Stamp at={a(54.9)} x={250} y={1080} text="300万円は手元にない" size={56} rot={-5} />
      <Note at={a(52.84)} top={1210}>※買い取りは、残りを分割で払う（再ローン）方法もあります</Note>
    </AbsoluteFill>
  );
};

// ════════ 11 返すときの条件 → 精算40万円（55.66–63.78） ════════
const P9: React.FC = () => {
  const f = useCurrentFrame();
  const S = 55.66, a = (t: number) => W(t) - W(S);
  const rc = interpolate(f, [F(a(59.66)), F(a(59.66)) + 12], [700, 0], out);
  const tot = stepN(f, a(61.48), 40, 0.5, 0);
  return (
    <AbsoluteFill style={{ transform: shake(f, a(62.7), 10) }}>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🔍">返すときの<R c={A}>条件</R></Head>
      <In at={0.3} x={40} y={450} mode="throw" from="l" rot={-5}><GenSlot name="car_odometer" size={380} /></In>
      <div style={{ position: "absolute", left: 470, top: 470 }}>
        <Line at={a(56.74)}>✔ 走行距離（上限あり）</Line>
        <Line at={a(57.5)}>✔ 傷・へこみ</Line>
        <Line at={a(57.98)}>✔ におい（たばこ・ペット）</Line>
        <Line at={a(58.54)}><span style={{ color: M.red }}>✔ 細かい条件がある</span></Line>
      </div>
      {f >= F(a(59.66)) ? (
        <div style={{ position: "absolute", left: 250, top: 830 + rc, width: 580, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 8, boxShadow: `8px 8px 0 ${M.ink}`, padding: "16px 28px 18px", boxSizing: "border-box", transform: "rotate(-2deg)" }}>
          <div style={{ ...K, fontSize: 32, textAlign: "center", borderBottom: `4px dashed ${M.gray}`, paddingBottom: 6 }}>🧾 精算のお知らせ</div>
          <div style={{ ...K, fontSize: 32, lineHeight: 1.6, marginTop: 6 }}>
            <div style={{ opacity: f >= F(a(60.52)) ? 1 : 0 }}>・走行距離の超過</div>
            <div style={{ opacity: f >= F(a(61.08)) ? 1 : 0 }}>・傷の修理</div>
          </div>
          <div style={{ borderTop: `4px solid ${M.ink}`, marginTop: 6, paddingTop: 4, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}><span style={{ ...K, fontSize: 34 }}>合計</span><span><span style={{ ...K, fontSize: 32 }}>約</span><span style={{ ...SER, fontSize: 90, color: M.red }}>{f >= F(a(61.48)) ? yen(tot) : "--"}</span><span style={{ ...K, fontSize: 36 }}>万円</span></span></div>
        </div>
      ) : null}
      <Stamp at={a(62.9)} x={600} y={1150} text="精算が必要" size={58} rot={-8} />
      <Note at={a(59.66)} top={1262}>※精算があるか・いくらかは、契約（残価保証の条件）や車の状態で変わります（この例では約40万円）</Note>
    </AbsoluteFill>
  );
};

// ════════ 12 その40万円も手元にない → ディーラー（63.78–68.56） ════════
const P10: React.FC = () => {
  const S = 63.78, a = (t: number) => W(t) - W(S);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="💦" />
      <In at={0.15} x={40} y={400} mode="pop"><GenSlot name="car_a_dealer_worry" size={500} /></In>
      <In at={a(64.12)} x={50} y={1130} mode="pop" rot={-3}><Pill2 c="#fff" size={40}>👛 その40万円も<R>手元にない</R></Pill2></In>
      <In at={a(66.04)} x={560} y={700} mode="throw" from="r" rot={6}><GenSlot name="car_dealer_smile" size={400} /></In>
      <In at={a(66.6)} x={470} y={430} mode="pop" rot={3}><Bubble tail="b" w={560} size={42}><TypeIn at={F(a(66.6))} step={2}>月々ほぼ同じで<br />乗り換えられますよ♪</TypeIn></Bubble></In>
    </AbsoluteFill>
  );
};

// ════════ 13 精算金を次のローンに乗せる（68.56–71.96） ════════
const P11: React.FC = () => {
  const f = useCurrentFrame();
  const S = 68.56, a = (t: number) => W(t) - W(S);
  const slide = interpolate(f, [F(a(70.9)), F(a(70.9)) + 10], [0, 1], out);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🔁">泣く泣く…</Head>
      <In at={a(70.34)} x={90} y={700} mode="rise">
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <div style={{ width: 640, height: 170, background: A, border: `6px solid ${M.ink}`, borderRadius: "16px 0 0 16px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}><span style={{ ...K, fontSize: 28 }}>次の車のローン</span><span style={{ ...SER, fontSize: 70 }}>600<span style={{ ...K, fontSize: 30 }}>万円</span></span></div>
          <div style={{ width: 220, height: 170, border: `6px dashed ${M.red}`, borderLeft: "none", borderRadius: "0 16px 16px 0", boxSizing: "border-box" }} />
        </div>
      </In>
      <In at={a(69.48)} x={0} y={0} mode="pop">
        <div style={{ position: "absolute", left: 360 + 370 * slide, top: 450 + 256 * slide, width: 220, height: 158, background: "#FDE7E2", border: `6px solid ${M.red}`, borderRadius: 14, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `rotate(${-8 * (1 - slide)}deg)`, boxShadow: slide < 1 ? `6px 6px 0 ${M.ink}` : undefined }}>
          <span style={{ ...K, fontSize: 26 }}>精算金</span><span style={{ ...SER, fontSize: 60, color: M.red }}>40<span style={{ ...K, fontSize: 26 }}>万円</span></span>
        </div>
      </In>
      {f >= F(a(70.9)) + 10 ? <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", transform: `scale(${pop(f, F(a(70.9)) + 10)})` }}><span style={{ ...K, fontSize: 44 }}>借りる額 </span><span style={{ ...SER, fontSize: 96, color: M.red }}>640</span><span style={{ ...K, fontSize: 44 }}>万円に</span></div> : null}
      <Stamp at={a(71.28)} x={330} y={1080} text="乗り換え" size={76} c={A} rot={-6} />
    </AbsoluteFill>
  );
};

// ════════ 14 月7.9万円に増える → 残クレループ（71.96–76.88） ════════
const P12: React.FC = () => {
  const f = useCurrentFrame();
  const S = 71.96, a = (t: number) => W(t) - W(S);
  const v = stepN(f, a(72.8), 78694, 0.9, 71053);
  const spin = f >= F(a(74.5)) ? (f - F(a(74.5))) * 2.2 : 0;
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="📈" />
      <In at={0.15} x={280} y={360} mode="rise"><Meter v={v} c={A} label={<div style={{ ...K, fontSize: 30, color: M.sub }}>7.1万円 → <R>7.9万円</R></div>} /></In>
      <In at={a(74.04)} x={760} y={480} mode="pop" rot={8}><span style={{ ...K, fontSize: 64, color: M.red }}>UP↑</span></In>
      <In at={a(74.5)} x={290} y={790} mode="pop"><div style={{ transform: `rotate(${Math.sin(spin / 20) * 4}deg)` }}><GenSlot name="car_a_loop" size={500} /></div></In>
      <Stamp at={a(75.72)} x={190} y={1150} text="残クレループ" size={88} c={M.red} rot={-6} />
      <Note at={a(72.8)} top={1290}>※例：640万円・金利5.5%・5年・残価300万円で試算</Note>
    </AbsoluteFill>
  );
};

// ════════ 15 B家は乗り続け、積立は260万円（76.88–81.48） ════════
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
  const S = 76.88, a = (t: number) => W(t) - W(S);
  const v = stepN(f, a(79.86), 260, 0.8, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={G} pill="B家" icon="🌱" />
      <In at={0.2} x={30} y={420} mode="throw" from="l" rot={-5}><GenSlot name="car_b_family_7" size={500} /></In>
      <In at={a(77.46)} x={60} y={940} mode="pop"><Pill2 c={G} size={38}>同じ車に 乗り続ける</Pill2></In>
      <In at={a(78.68)} x={640} y={440} mode="rise"><Piggy v={v} max={510} /></In>
      <Note at={a(79.86)} top={1150}>※元本（積み立てたお金）のみ。運用で増えた分は入れていません</Note>
    </AbsoluteFill>
  );
};

// ════════ 16 10年後：B家は完済して自分の車に／積立510万円（81.48–87.32） ════════
const P14: React.FC = () => {
  const f = useCurrentFrame();
  const S = 81.48, a = (t: number) => W(t) - W(S);
  const prog = interpolate(f, [F(0.1), F(0.9)], [0.5, 1], out);
  const v = stepN(f, a(86.02), 510, 0.8, 260);
  return (
    <AbsoluteFill>
      <Paper2 />
      <In at={0.05} x={0} y={290} center mode="pop"><span style={{ display: "inline-block", background: M.ink, borderRadius: 18, padding: "10px 46px", transform: "rotate(-2deg)", boxShadow: `6px 6px 0 ${G}` }}><BounceText text="10年後" at={F(0.1)} size={88} color={M.yellow} stroke={false} /></span></In>
      <div style={{ position: "absolute", left: 90, top: 470, width: 900 }}>
        <div style={{ height: 30, background: "#EDE5C4", border: `5px solid ${M.ink}`, borderRadius: 16, overflow: "hidden" }}><div style={{ width: `${prog * 100}%`, height: "100%", background: `repeating-linear-gradient(-45deg, ${M.yellow} 0 18px, #F6CF4A 18px 36px)` }} /></div>
        <div style={{ position: "absolute", right: 0, top: 40, ...K, fontSize: 34 }}>子ども <span style={{ ...SER, fontSize: 50, color: M.red }}>12</span>歳</div>
      </div>
      <In at={a(83.0)} x={20} y={560} mode="throw" from="l" rot={-4}><GenSlot name="car_b_family_12" size={540} /></In>
      <Stamp at={a(84.08)} x={70} y={1070} text="完済！自分の車に" size={58} c={G} rot={-6} />
      <In at={a(84.84)} x={660} y={600} mode="rise"><Piggy v={v} max={510} /></In>
      <Note at={a(86.02)} top={1200}>※元本のみ（約42,772円×120か月＝約513万円）</Note>
    </AbsoluteFill>
  );
};

// ════════ 17 10年で払った利息（87.32–92.06）：棒の高さで比べる ════════
const P15: React.FC = () => {
  const f = useCurrentFrame();
  const S = 87.32, a = (t: number) => W(t) - W(S);
  const hA = interpolate(f, [F(a(88.7)), F(a(88.7)) + 14], [0, 1], out), hB = interpolate(f, [F(a(90.56)), F(a(90.56)) + 10], [0, 1], out);
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
      {col(200, H * hA, A, "A家", stepN(f, a(89.2), 260, 0.6, 0), f >= F(a(89.0)))}
      {col(620, H * (40 / 260) * hB, G, "B家", stepN(f, a(91.08), 40, 0.4, 0), f >= F(a(90.9)))}
      <Note at={a(88.7)} top={1200}>※A家：1台目（600万円）と2台目（640万円）の利息の合計 約258万円／B家：約39万円</Note>
    </AbsoluteFill>
  );
};

// ════════ 18 A家が車に払ったのは約900万円 → それでもまだ自分のものではない（92.06–97.06） ════════
const P16: React.FC = () => {
  const f = useCurrentFrame();
  const S = 92.06, a = (t: number) => W(t) - W(S);
  const v = stepN(f, a(93.34), 900, 1.0, 0);
  return (
    <AbsoluteFill>
      <Paper2 />
      <Head at={0.05} c={A} pill="A家" icon="🧾">10年で<R c={A}>車に払った</R>のは</Head>
      <In at={a(93.1)} x={0} y={480} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 24, boxShadow: `10px 10px 0 ${A}`, padding: "4px 40px" }}><span style={{ ...K, fontSize: 44 }}>約</span><span style={{ ...SER, fontSize: 150, color: A, lineHeight: 1.1 }}>{yen(v)}</span><span style={{ ...K, fontSize: 52 }}>万円</span></span></In>
      <In at={a(93.9)} x={0} y={710} center mode="ghost"><span style={{ ...B, fontSize: 30, color: M.sub }}>月7.1万円×5年 ＋ 月7.9万円×5年</span></In>
      <In at={a(94.76)} x={40} y={790} mode="pop"><div style={{ filter: "grayscale(0.25)" }}><GenSlot name="car_a_family_12" size={470} /></div></In>
      <In at={a(95.14)} x={540} y={860} mode="throw" from="r" rot={5}><Bubble tail="l" w={490} size={38}>それでも車は<br /><R>まだ自分のもの</R><br /><R>ではない</R></Bubble></In>
      <Stamp at={a(96.0)} x={560} y={1130} text="所有者は販売店など" size={44} rot={-5} />
    </AbsoluteFill>
  );
};

// ════════ 19 締め①：乗りたい車に乗るのは自由 → でも数字で見ると残クレは損しやすい（97.06–101.68） ════════
const P17: React.FC = () => {
  const f = useCurrentFrame();
  const S = 97.06, a = (t: number) => W(t) - W(S);
  const dim = interpolate(f, [F(a(98.98)), F(a(98.98)) + 8], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill c={M.ink} at={0.05} icon="✓">まとめ</SectionPill>
      <div style={{ opacity: 1 - 0.45 * dim, transform: `scale(${1 - 0.08 * dim})`, transformOrigin: "540px 400px" }}>
        <In at={0.15} x={60} y={390} mode="throw" from="l" rot={-5}><GenSlot name="car_a_minivan" size={330} /></In>
        <In at={0.3} x={690} y={410} mode="throw" from="r" rot={5}><GenSlot name="car_b_minivan" size={300} /></In>
        <In at={a(98.12)} x={0} y={700} center mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 22, padding: "10px 34px", boxShadow: `8px 8px 0 ${M.yellow}`, ...K, fontSize: 52 }}>乗りたい車に乗るのは <R c={G}>自由</R></span></In>
      </div>
      <In at={a(99.42)} x={0} y={860} center mode="ghost"><span style={{ ...K, fontSize: 46 }}>でも <R>数字</R>で見ると</span></In>
      <Stamp at={a(100.28)} x={110} y={960} text="残クレは損しやすい買い方" size={64} rot={-4} />
      <In at={a(100.9)} x={0} y={1140} center mode="pop"><span style={{ ...B, fontSize: 30, color: M.sub }}>10年の利息　<R c={A}>A家 約260万円</R>　／　<R c={G}>B家 約40万円</R></span></In>
    </AbsoluteFill>
  );
};

// ════════ 20 締め②：なるべく損をしないためには（101.68–109.50） ════════
const P17b: React.FC = () => {
  const S = 101.68, a = (t: number) => W(t) - W(S);
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
      <In at={0.15} x={0} y={385} center mode="ghost"><span style={{ ...K, fontSize: 50 }}>車で<R>なるべく損をしない</R>ためには</span></In>
      {tip(500, a(103.9), "①", "car_dealer_smile", <><R c={G}>リセールバリュー</R>を考える</>, "売るときに値段が下がりにくい車を選ぶ")}
      {tip(820, a(105.38), "②", "car_b_piggy", <>低金利の<R c={G}>銀行ローン</R>を長めに<br />＋ <R c={G}>運用</R>と組み合わせる</>, "")}
      <HandCircle at={a(108.74)} x={600} y={960} r={380} ry={150} c={M.red} />
    </AbsoluteFill>
  );
};

// ════════ 21 保存とフォロー（109.50–112.15） ════════
const P18: React.FC = () => {
  const f = useCurrentFrame();
  const S = 109.5, a = (t: number) => W(t) - W(S);
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
      {btn(90, a(110.36), "🔖", "保存", M.yellow)}
      {btn(590, a(110.82), "➕", "フォロー", G)}
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
export const CAR1_END = 121.53;
export const CAR1_PAGES: [number, React.FC][] = [[0, P1], [5.92, P2], [12.24, P3], [17.84, P4], [24.8, P5], [31.2, P6], [37.28, P7], [41.92, P7b], [45.38, P8], [48.66, P8b], [55.66, P9], [63.78, P10], [68.56, P11], [71.96, P12], [76.88, P13], [81.48, P14], [87.32, P15], [92.06, P16], [97.06, P17], [101.68, P17b], [109.5, P18]];
const CHAPTER = new Set([2, 5, 8, 15, 18]); // 次のページが章の頭（A家・B家・5年後・10年後・まとめ）
export const CARFAMILY_FRAMES = F(CAR1_END);

// 字幕（AIの読み間違いは直した字で・!A家の言葉! *B家の言葉* ~全体~）
const SUBS: [number, string][] = [
  [0, "*お金が残る家族*と"], [1.5, "!残らない家族!"], [2.34, "将来どうなるか 見てください"], [3.76, "今回は ~車の選び方~ です"],
  [5.92, "同じ収入の 2組の家族"], [7.62, "どちらも 夫婦27歳"], [9.1, "2歳の子どもが1人"], [10.36, "世帯年収は ~600万円~"],
  [12.24, "!A家!は 約600万円の"], [13.94, "大きなミニバンを !残クレ! で"], [15.26, "5年契約で"], [16.32, "月々 約!7万1,000円!"],
  [17.84, "残価設定は !50%!"], [18.96, "最後に 車の値段の半分"], [19.56, "約!300万円!を 残しました"], [21.22, "でも その300万円にも"], [23.14, "5年間ずっと !利息! がかかります"],
  [24.8, "しかも 残クレの車は"], [26.34, "払い終わるまで"], [27.1, "!自分のものではありません!"], [28.34, "「月々払えるなら大丈夫」"], [29.88, "A家は そう思っていました"],
  [31.2, "*B家*も 毎月出せるのは"], [32.84, "A家と同じ 月*7万*くらいと"], [34.56, "決めていましたが"], [35.3, "*身の丈*に合った車を買おうと考え"],
  [37.28, "約300万円のミニバンを"], [38.9, "*銀行ローン*で 10年"], [40.16, "月々 約*2万8,000円*"],
  [41.92, "残りの 約*4万3,000円*は"], [43.74, "毎月 *先に積み立て* ました"],
  [45.38, "~5年後~ 子どもは7歳"], [47.14, "A家の残クレが 終わります"],
  [48.66, "選べる道は ~3つ~"], [49.84, "車を返すか"], [50.66, "残りの約300万円を払って買い取るか"], [52.84, "乗り換えるか"], [53.54, "でも !300万円! は手元にありません"],
  [55.66, "返すときには"], [56.74, "!走行距離!や!傷!や!におい!などに"], [58.54, "細かい条件があります"], [59.66, "走行距離の超過と傷で"], [61.48, "約!40万円!の精算が"], [62.9, "必要と言われました"],
  [63.78, "その40万円も 手元には残っていません"], [66.04, "ディーラーで"], [66.68, "「月々ほぼ同じで 乗り換えられますよ」"],
  [68.56, "A家は 泣く泣く"], [69.48, "精算金を 次のローンに乗せて"], [71.28, "乗り換えました"], [71.96, "月々は 約!7万9,000円!に"], [74.04, "増えました"], [74.5, "これが 抜け出しにくい"], [75.72, "!残クレループ! です"],
  [76.88, "*B家*は 同じ車に乗り続け"], [78.68, "積み立ては 元本 約*260万円*"],
  [81.48, "~10年後~ 子どもは12歳"], [83.12, "B家の車は *自分のもの* に"], [84.84, "積み立ては 元本 約*510万円*"],
  [87.32, "10年で払った利息は"], [88.7, "A家が 約!260万円!"], [90.56, "B家は 約*40万円*"],
  [92.06, "A家が 車に払ったのは"], [93.34, "約!900万円!"], [94.76, "それでも 車はまだ"], [95.8, "自分のものではありません"],
  [97.06, "乗りたい車に乗るのは ~自由~ です"], [98.98, "でも 数字で見ると"], [100.28, "!残クレ!は 損しやすい買い方"],
  [101.68, "車の購入で"], [102.6, "なるべく損をしないためには"], [103.9, "*リセールバリュー*を考えることや"], [105.38, "低金利の*銀行ローン*を長めに組んで"], [107.34, "*運用*と組み合わせることが大切です"],
  [109.5, "忘れないように"], [110.36, "*保存*と*フォロー*を しておいてください"],
];

const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(W(t)), volume });
const CUES = [
  ...CAR1_PAGES.slice(1).map(([t]) => s("u03s", t - 0.42, 0.22)),
  s("u02s", 1.5, 0.18), s("u04", 1.75, 0.26), s("u05s", 2.34, 0.2), s("u05", 3.76, 0.22),
  s("u02s", 6.7, 0.16), s("u02s", 7.9, 0.14), s("u02s", 8.85, 0.14), s("u06", 10.9, 0.2), s("u04", 11.5, 0.28),
  s("u02s", 12.65, 0.18), s("u02s", 13.7, 0.16), s("u04", 14.5, 0.28), s("u02s", 15.0, 0.16), s("u06", 16.4, 0.22), s("u05s", 17.3, 0.22),
  s("u05s", 19.35, 0.22), s("u05s", 21.9, 0.2), s("u04", 23.75, 0.26),
  s("u02s", 25.4, 0.18), s("u05s", 26.9, 0.2), s("u04", 27.2, 0.26), s("u02s", 28.15, 0.18), s("u10", 29.7, 0.2),
  s("u02s", 31.5, 0.18), s("u02s", 32.6, 0.18), s("u05s", 33.15, 0.2), s("u05", 35.1, 0.22),
  s("u02s", 37.45, 0.18), s("u02s", 38.25, 0.16), s("u02s", 38.7, 0.16), s("u02s", 39.5, 0.16), s("u06", 40.4, 0.22), s("u05s", 41.2, 0.2),
  s("u05s", 42.2, 0.24), s("u05", 43.55, 0.22), s("u02s", 44.2, 0.18), s("u04", 44.4, 0.26),
  s("u09", 45.38, 0.26), s("u02s", 46.8, 0.18), s("u04", 48.0, 0.28),
  s("u02s", 49.9, 0.18), s("u02s", 50.45, 0.18), s("u02s", 52.6, 0.18), s("u04", 53.75, 0.3), s("u04", 54.7, 0.26),
  s("u02s", 56.5, 0.14), s("u02s", 57.3, 0.14), s("u02s", 57.75, 0.14), s("u02s", 58.3, 0.14), s("u05s", 59.45, 0.22), s("u06", 61.25, 0.22), s("u04", 62.65, 0.3),
  s("u02s", 63.9, 0.18), s("u02s", 65.8, 0.18), s("u07", 66.4, 0.2),
  s("u02s", 69.25, 0.18), s("u05s", 70.1, 0.22), s("u05s", 70.7, 0.22), s("u04", 71.05, 0.28),
  s("u06", 72.55, 0.22), s("u02s", 73.8, 0.18), s("u05", 74.3, 0.22), s("u04", 75.5, 0.3),
  s("u02s", 77.25, 0.16), s("u06", 79.6, 0.22),
  s("u09", 81.48, 0.26), s("u04", 83.85, 0.28), s("u06", 85.8, 0.22),
  s("u05s", 88.5, 0.22), s("u05s", 90.35, 0.22),
  s("u06", 93.1, 0.24), s("u02s", 94.55, 0.16), s("u04", 95.8, 0.28),
  s("u05", 97.9, 0.22), s("u05s", 99.2, 0.2), s("u04", 100.05, 0.3),
  s("u05s", 103.7, 0.22), s("u05s", 105.15, 0.22), s("u10", 108.5, 0.22),
  s("u02s", 110.15, 0.18), s("u07", 110.6, 0.22), s("u02s", 110.8, 0.16),
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
    <Audio src={staticFile("car3-narration.wav")} />
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
