import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { B, GenSlot } from "./MileLifePlan";
import { SfxTrack } from "./components/sfx";
import { Board, Panel, Stop, Stepper } from "./components/board";
import { F, K, SER, Lines as LinesM, At, Arrow, Cross, TCtx, TypeIn, R as RM } from "./components/zukaiKit";
import { Captions } from "./BourakuReel";
import { Spot, Camera, CamKey } from "./components/cam";
import { UST10Y } from "./ust10y";
import { BD_LAB, BD_STOCK } from "./bondData";
import { BOND_MOUTH } from "./bondMouth";

// ════════════════════════════════════════════════════════════════════
//  教育資金×債券 v2（一から作り直し）＝「NISA売りました」（src/NisaBondReel.tsx）と同じ作り
//  1枚の地図（ページ8枚）をカメラが渡る／付箋の見出し＋打ち込まれる言葉＋マーカー／ここぞで集中線・スポット・寄り
//  右下のたいちは気持ちが動く所だけひょこっと出る／下に字幕（キーワードはマーカー）／右上に進み具合
//  声：public/bond-narration.wav（107.5秒）。台本：assets/script_bond_education.md
//  色：株＝オレンジ／債券＝緑／現金＝青／危ない所＝赤
// ════════════════════════════════════════════════════════════════════
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUTE = Easing.bezier(0.16, 1, 0.3, 1);
const INK = A2.ink, RED = A2.red, SUB = A2.sub, STK = "#EF7D57", BND = "#2E9E6B", CASH = "#4A8FD6", YEL = "#F2C14E";

// マーカーつきの赤い強調（打ち込まれたあとに黄色い線が引かれる）
const R: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const t = React.useContext(TCtx);
  if (t.A < 0) return <RM>{children}</RM>;
  const w = interpolate(f - (t.A + t.n + 2), [0, 8], [0, 100], { ...clamp, easing: OUTE });
  return <span style={{ position: "relative", display: "inline-block" }}><span style={{ position: "absolute", left: -4, bottom: "6%", height: "30%", width: `calc(${w}% + ${w > 0 ? 8 : 0}px)`, background: "rgba(255,201,60,0.55)", borderRadius: 6 }} /><span style={{ position: "relative" }}><RM>{children}</RM></span></span>;
};
const Lines: React.FC<React.ComponentProps<typeof LinesM>> = (p) => <LinesM anim="type" {...p} />;
const Img2: React.FC<{ n: string; s: number }> = ({ n, s }) => <GenSlot name={n} size={s} />;
const Tag: React.FC<{ c: string; children: React.ReactNode; size?: number }> = ({ c, children, size = 30 }) => (
  <span style={{ display: "inline-block", background: c, color: "#fff", borderRadius: 999, padding: "4px 22px", ...K, fontSize: size, whiteSpace: "nowrap" }}>{children}</span>
);
const Pill: React.FC<{ c: string; children: React.ReactNode; size?: number; fg?: string }> = ({ c, children, size = 30, fg = "#fff" }) => (
  <span style={{ display: "inline-block", background: c, color: fg, border: `4px solid ${INK}`, borderRadius: 999, padding: "4px 22px", ...K, fontSize: size, whiteSpace: "nowrap", boxShadow: `4px 5px 0 ${INK}` }}>{children}</span>
);
const Stamp: React.FC<{ c?: string; size?: number; rot?: number; bg?: string; children: React.ReactNode }> = ({ c = RED, size = 56, rot = -4, bg = "#FFF6F2", children }) => (
  <span style={{ display: "inline-block", border: `7px solid ${c}`, borderRadius: 18, padding: "4px 34px", ...SER, fontSize: size, color: c, background: bg, transform: `rotate(${rot}deg)`, whiteSpace: "nowrap" }}>{children}</span>
);
const Big: React.FC<{ bg?: string; fg?: string; size?: number; children: React.ReactNode }> = ({ bg = YEL, fg = INK, size = 58, children }) => (
  <span style={{ display: "inline-block", background: bg, border: `7px solid ${INK}`, borderRadius: 22, padding: "8px 36px", ...K, fontSize: size, color: fg, boxShadow: `7px 9px 0 ${INK}`, transform: "rotate(-3deg)", whiteSpace: "nowrap" }}>{children}</span>
);
const Foot: React.FC<{ at: number; children: React.ReactNode; y?: number }> = ({ at, children, y = 1250 }) => (
  <At at={at} x={60} y={y} mode="rise"><div style={{ maxWidth: 940, display: "inline-block", background: "#FFF8E3", border: "2px solid #E8D9A8", borderRadius: 14, padding: "6px 16px", ...B, fontSize: 22, lineHeight: 1.45, color: SUB }}>{children}</div></At>
);
// 付箋の見出し（テープで貼られてペタッ）＋打ち込まれる題
const Head: React.FC<{ at: number; tag: string; title: React.ReactNode; c?: string }> = ({ at, tag, title, c = RED }) => {
  const f = useCurrentFrame();
  const A = F(at);
  if (f < A) return null;
  const k = interpolate(f - A, [0, 6, 10], [1.5, 0.95, 1], clamp), o = interpolate(f - A, [0, 3], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 60, top: 270, display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", background: "#FFE58A", padding: "14px 24px 10px", transform: `rotate(-4deg) scale(${k})`, opacity: o, boxShadow: "3px 6px 12px rgba(90,70,20,0.2)", ...K, fontSize: 38, color: c, whiteSpace: "nowrap" }}>
        <div style={{ position: "absolute", left: "50%", top: -16, width: 90, height: 30, marginLeft: -45, background: "rgba(255,255,255,0.65)", transform: "rotate(4deg)" }} />
        {tag}
      </div>
      <span style={{ ...K, fontSize: 58, color: INK, display: "inline-block", whiteSpace: "nowrap" }}><TypeIn at={A + 8} step={1.5}>{title}</TypeIn></span>
    </div>
  );
};
// 箱が横からシュッと入る
const swoop = (f: number, at: number, dir: 1 | -1): React.CSSProperties => {
  const d = f - F(at);
  if (d < 0) return { opacity: 0 };
  const p = interpolate(d, [0, 9], [0, 1], { ...clamp, easing: OUTE });
  return { transform: `translateX(${(1 - p) * 700 * dir}px) rotate(${(1 - p) * 6 * dir}deg)`, filter: p < 0.9 ? `blur(${(1 - p) * 8}px)` : undefined };
};
// 集中線
const Burst: React.FC<{ at: number; dur?: number; r0?: number; cx?: number; cy?: number }> = ({ at, dur = 22, r0 = 330, cx = 540, cy = 860 }) => {
  const f = useCurrentFrame();
  const d = f - F(at);
  if (d < 0 || d > dur) return null;
  const o = interpolate(d, [0, 3, dur - 6, dur], [0, 1, 1, 0], clamp);
  const grow = interpolate(d, [0, 6], [0.6, 1], { ...clamp, easing: OUTE });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: o, pointerEvents: "none" }}>
      {Array.from({ length: 56 }).map((_, i) => {
        const a = (i / 56) * Math.PI * 2 + ((i * 37) % 7) * 0.01;
        const jit = ((i * 53 + d * 17) % 11) / 11;
        const r1 = (r0 + jit * 90) / grow, r2 = 1500, w = 0.006 + ((i * 29) % 5) * 0.003;
        const p = (r: number, aa: number) => `${cx + Math.cos(aa) * r},${cy + Math.sin(aa) * r}`;
        return <polygon key={i} points={`${p(r1, a)} ${p(r2, a - w)} ${p(r2, a + w)}`} fill={INK} opacity={0.16 + (i % 3) * 0.06} />;
      })}
    </svg>
  );
};
// 数字：段で上がって言った瞬間に止まる
const Num: React.FC<{ at: number; from?: number; to: number; dur?: number }> = ({ at, from = 0, to, dur = 14 }) => {
  const f = useCurrentFrame();
  const step = Math.floor(f / 2) * 2;
  const v = Math.round(interpolate(step, [F(at), F(at) + dur], [from, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const land = interpolate(f - F(at) - dur, [0, 2, 5], [-10, 4, 0], clamp);
  return <span style={{ display: "inline-block", transform: `translateY(${f >= F(at) + dur ? land : 0}px)` }}>{v.toLocaleString("en-US")}</span>;
};

// ════════ p1 暴落でいくら減る？（0–17.24） ════════
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const crash = interpolate(f, [F(6.42), F(9.72)], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const H = 520, h = H * (1 - 0.366 * crash);
  const shake = f > F(6.42) && f < F(9.9) ? Math.sin(f * 2.3) * 7 * (1 - crash * 0.5) : 0;
  const red = crash > 0.02;
  const sell = interpolate(f, [F(15.34), F(15.34) + 14], [0, 1], { ...clamp, easing: OUTE });
  return (
    <>
      <Head at={0} tag="例えば" title={<>教育資金を<span style={{ color: STK }}>株で500万円</span></>} />
      <Lines y={420} size={46} lines={[[3.2, <>残りは<R>生活費の現金</R>だけ、という家庭</>]]} />
      {/* 株の箱（500万円の柱） */}
      <div style={{ position: "absolute", left: 70, top: 560, width: 470, height: 640, background: "#fff", border: `5px solid ${INK}`, borderRadius: 26, boxShadow: `8px 10px 0 ${INK}`, ...swoop(f, 0.3, -1) }}>
        <div style={{ position: "absolute", left: 26, top: 16, ...K, fontSize: 44, color: STK }}>株</div>
        <div style={{ position: "absolute", left: 300, top: 18, ...SER, fontSize: 40, color: red ? RED : STK }}><Num at={9.72} from={500} to={red ? 317 : 500} dur={red ? 26 : 1} /><span style={{ ...K, fontSize: 24 }}>万円</span></div>
        <div style={{ position: "absolute", left: 120, bottom: 24, width: 230, height: h, borderRadius: "18px 18px 8px 8px", background: red ? `linear-gradient(${RED}, ${STK})` : STK, transform: `translateX(${shake}px)`, boxShadow: "inset 0 -10px 0 rgba(0,0,0,0.12)" }} />
        {crash > 0 ? <div style={{ position: "absolute", left: 120, bottom: 24 + h, width: 230, height: H - h, border: `4px dashed ${RED}`, borderBottom: "none", borderRadius: "18px 18px 0 0", boxSizing: "border-box", opacity: 0.7 }} /> : null}
      </div>
      {/* 現金の箱 */}
      <div style={{ position: "absolute", left: 600, top: 880, width: 400, height: 320, background: "#fff", border: `5px solid ${INK}`, borderRadius: 26, boxShadow: `8px 10px 0 ${INK}`, ...swoop(f, 3.4, 1) }}>
        <div style={{ position: "absolute", left: 26, top: 16, ...K, fontSize: 40, color: CASH }}>現金</div>
        <div style={{ position: "absolute", left: 30, top: 80, ...B, fontSize: 26, color: SUB }}>生活費</div>
        <div style={{ position: "absolute", left: 140, bottom: 24, width: 200, height: 150, borderRadius: 14, background: CASH, boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.12)" }} />
      </div>
      {/* リーマンショック */}
      <At at={5.16} until={12.4} x={600} y={570} mode="slam"><Stamp size={52}>リーマンショック</Stamp></At>
      <At at={6.42} until={12.4} x={640} y={690} mode="slam"><span style={{ ...SER, fontSize: 120, color: RED }}>−37<span style={{ fontSize: 60 }}>%</span></span></At>
      <Burst at={9.72} cy={880} r0={300} />
      <Spot at={9.72} until={12.4} rect={[90, 560, 440, 120]} r={20} color={RED} />
      <At at={10.0} until={12.4} x={600} y={830} mode="drop"><Tag c={RED} size={34}>1年で約183万円 減</Tag></At>
      {/* 入学金・授業料は待ってくれない */}
      <At at={12.58} x={620} y={560} mode="spring"><Img2 n="bk_calendar_due" s={200} /></At>
      <At at={12.9} x={800} y={600} mode="drop"><Img2 n="bk_parent_bill" s={230} /></At>
      <At at={13.4} x={610} y={790} mode="drop"><Pill c={INK} size={30}>入学金・授業料</Pill></At>
      {/* 下がったところで売る */}
      {sell > 0 ? <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><path d={`M420 ${1200 - h + 30} C 520 ${1150 - h}, 560 ${1040 - h * 0.2}, 640 ${1030}`} fill="none" stroke={RED} strokeWidth={7} strokeDasharray="16 12" strokeDashoffset={-f * 2} opacity={sell} /></svg> : null}
      <At at={15.34} x={70} y={1210 - 10} mode="slam"><Big bg="#fff" fg={RED} size={44}>下がったところで 売るしかない</Big></At>
      <Foot at={9.72} y={1300}>※米国株S&P500・配当込み、2008年の年間リターン（−36.55%）で計算</Foot>
    </>
  );
};

// ════════ p2 戻るまで何年も（17.24–30.98）★暴落の表は全部出す ════════
const ROWS: [string, string, string, string, number, boolean?][] = [
  ["世界恐慌（1929年）", "−86%", "約2年9か月", "約25年", 25],
  ["オイルショック（1973年）", "−48%", "約1年9か月", "約7年半", 7.5],
  ["ブラックマンデー（1987年）", "−34%", "約3か月", "約1年11か月", 1.9],
  ["ITバブル崩壊（2000年）", "−49%", "約2年7か月", "約7年", 7],
  ["リーマンショック（2007年）", "−57%", "約1年5か月", "約5年半", 5.5],
  ["コロナショック（2020年）", "−34%", "約1か月", "約6か月", 0.5],
  ["2022年（インフレ・利上げ）", "−25%", "約9か月", "約2年", 2],
  ["日本 バブル崩壊（1989年）", "−82%", "約19年", "約34年", 34, true],
];
const TY = 560, RH = 70;
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const red = f >= F(26.48);
  return (
    <>
      <Head at={17.24} tag="落とし穴" title={<>戻るまで <span style={{ color: RED }}>何年も</span></>} />
      <Lines y={420} size={46} lines={[[18.6, <>株は大きく下がると、<R>戻るのに時間がかかる</R></>]]} />
      <div style={{ position: "absolute", left: 50, top: TY, width: 980, background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, boxShadow: `8px 10px 0 ${INK}`, overflow: "hidden", ...swoop(f, 18.3, 1) }}>
        <div style={{ display: "flex", background: INK, color: "#fff", ...K, fontSize: 25, height: 56, alignItems: "center" }}>
          {["暴落", "下がった幅", "下がった期間", "最高値に戻るまで"].map((h, i) => <div key={h} style={{ flex: i ? (i === 3 ? 1.25 : 1) : 2, padding: "0 12px", textAlign: i ? "center" : "left", whiteSpace: "nowrap" }}>{h}</div>)}
        </div>
        {ROWS.map(([n, d, p, r, y, jp], i) => {
          const t = 20.14 + i * 0.16;
          const k = interpolate(f - F(t), [0, 7], [0, 1], { ...clamp, easing: OUTE });
          const over = red && !jp && y > 3;
          const live = (i === 4 && f >= F(22.62)) || (i === 3 && f >= F(24.76));
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", height: RH, borderTop: jp ? `5px solid ${INK}` : "2px solid #EEE6CC", background: over ? "#FDE5E0" : jp ? "#F4EFE3" : live ? "#FFF6D8" : "#fff", opacity: k, transform: `translateX(${(1 - k) * 80}px)` }}>
              <div style={{ flex: 2, padding: "0 12px", ...K, fontSize: 27, whiteSpace: "nowrap" }}>{n}</div>
              <div style={{ flex: 1, textAlign: "center", ...B, fontSize: 28, color: RED }}>{d}</div>
              <div style={{ flex: 1, textAlign: "center", ...B, fontSize: 26 }}>{p}</div>
              <div style={{ flex: 1.25, textAlign: "center", ...K, fontSize: over || live ? 34 : 28, color: over ? RED : INK }}>{r}</div>
            </div>
          );
        })}
      </div>
      <Spot at={22.62} until={24.6} rect={[50, TY + 56 + RH * 4, 980, RH]} r={10} />
      <Spot at={24.76} until={26.3} rect={[50, TY + 56 + RH * 3, 980, RH]} r={10} />
      <At at={26.6} x={70} y={TY + 56 + RH * 8 + 30} mode="drop"><span style={{ ...B, fontSize: 24, color: RED }}>■ 赤＝戻るまで 3年より長かった暴落（日本を除く7回のうち）</span></At>
      <Burst at={29.42} cy={1150} r0={320} />
      <At at={29.42} x={70} y={1150} mode="slam"><Big bg={RED} fg="#fff" size={50}>7回のうち4回は 3年で戻らず</Big></At>
      <At at={20.4} x={860} y={300} mode="spring"><Img2 n="bk_hourglass_long" s={150} /></At>
      <Foot at={20.14} y={1300}>※米国株S&P500は株価だけ（配当なし）。「戻る」＝暴落前の最高値に戻ること。日本は日経平均で、7回には入れていません</Foot>
    </>
  );
};

// ════════ p3 使う前の暴落でも（30.98–49.32）＝本物の折れ線 ════════
const I0 = BD_LAB.indexOf("2006-07"), IC = BD_LAB.indexOf("2007-12"), IE = BD_LAB.indexOf("2010-12"), I1 = BD_LAB.indexOf("2011-12");
const CX0 = 120, CW = 880, CY0 = 560, CH = 420, LO = 250, HI = 580;
const cx = (i: number) => CX0 + ((i - I0) / (I1 - I0)) * CW, cy = (v: number) => CY0 + CH - ((v - LO) / (HI - LO)) * CH;
const P3: React.FC = () => {
  const f = useCurrentFrame();
  const drawTo = Math.round(interpolate(f, [F(36.66), F(38.86)], [IC, IE], { ...clamp, easing: Easing.inOut(Easing.quad) }));
  const pre = Math.round(interpolate(f, [F(31.2), F(32.4)], [I0, IC], clamp));
  const ex = cx(IE), ey = cy(BD_STOCK[IE]);
  const fan = interpolate(f, [F(45.68), F(46.78) + 0.5], [0, 1], { ...clamp, easing: OUTE });
  const flag = (i: number, at: number, img: string, label: string, c: string) => (
    <At at={at} x={cx(i) - 70} y={CY0 + CH + 46} mode="drop"><div style={{ width: 140, textAlign: "center" }}><Img2 n={img} s={120} /><div style={{ marginTop: -4 }}><Tag c={c} size={24}>{label}</Tag></div></div></At>
  );
  return (
    <>
      <Head at={30.98} tag="例えば" title={<>中3の冬に <span style={{ color: RED }}>暴落</span></>} />
      <Lines y={420} size={46} lines={[[34.68, <>大学入学まで、<R>あと3年</R></>]]} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {[300, 400, 500].map((v) => <g key={v} opacity={interpolate(f, [F(31.0), F(31.4)], [0, 1], clamp)}><line x1={CX0} x2={CX0 + CW} y1={cy(v)} y2={cy(v)} stroke={v === 500 ? STK : "#E6DDBE"} strokeWidth={v === 500 ? 5 : 2} strokeDasharray={v === 500 ? "14 10" : undefined} /><text x={CX0 - 12} y={cy(v) + 9} textAnchor="end" fontSize={26} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{v}</text></g>)}
        {["2007", "2008", "2009", "2010", "2011"].map((y) => <text key={y} x={cx(BD_LAB.indexOf(`${y}-01`))} y={CY0 + CH + 34} textAnchor="middle" fontSize={24} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700} opacity={interpolate(f, [F(31.0), F(31.4)], [0, 1], clamp)}>{y}</text>)}
        <polyline points={BD_STOCK.slice(I0, pre + 1).map((v, k) => `${cx(I0 + k)},${cy(v)}`).join(" ")} fill="none" stroke={STK} strokeWidth={6} strokeLinejoin="round" opacity={0.5} />
        {f >= F(36.66) ? <polyline points={BD_STOCK.slice(IC, drawTo + 1).map((v, k) => `${cx(IC + k)},${cy(v)}`).join(" ")} fill="none" stroke={RED} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" /> : null}
        {f >= F(36.66) ? <circle cx={cx(drawTo)} cy={cy(BD_STOCK[drawTo])} r={12} fill={RED} /> : null}
        {/* 500万に届かない差 */}
        {f >= F(39.6) ? <g opacity={interpolate(f, [F(39.6), F(40.0)], [0, 1], clamp)}><line x1={ex} y1={cy(500)} x2={ex} y2={ey} stroke={RED} strokeWidth={5} /><path d={`M${ex - 12} ${cy(500) + 14} L${ex} ${cy(500)} L${ex + 12} ${cy(500) + 14}`} stroke={RED} strokeWidth={5} fill="none" /></g> : null}
        {/* その先は読めない */}
        {fan > 0 ? [-120, -60, 0, 60, 130].map((d, k) => <line key={k} x1={ex} y1={ey} x2={ex + 110 * fan} y2={ey + d * fan} stroke={SUB} strokeWidth={4} strokeDasharray="10 8" />) : null}
      </svg>
      <At at={31.0} x={CX0 + CW - 150} y={cy(500) - 46} mode="fade"><span style={{ ...K, fontSize: 26, color: STK }}>500万円</span></At>
      {/* 学年の旗 */}
      {flag(IC, 31.4, "bk_kid_jhs3", "中3の冬", INK)}
      {flag(BD_LAB.indexOf("2009-06"), 35.2, "bk_kid_hs", "高校", SUB)}
      {flag(IE, 35.6, "bk_kid_univ", "3年後", RED)}
      <At at={33.0} x={cx(IC) - 40} y={cy(500) - 120} mode="slam"><Stamp size={40}>暴落</Stamp></At>
      {/* 山場 */}
      <Burst at={38.86} cx={ex} cy={ey} r0={180} />
      <At at={38.86} until={45.5} x={ex - 330} y={ey - 210} mode="slam"><div style={{ background: "#fff", border: `6px solid ${RED}`, borderRadius: 20, padding: "6px 22px", boxShadow: `6px 8px 0 ${INK}`, whiteSpace: "nowrap" }}><span style={{ ...B, fontSize: 28 }}>3年たっても 約</span><span style={{ ...SER, fontSize: 84, color: RED }}><Num at={38.9} from={317} to={460} dur={22} /></span><span style={{ ...K, fontSize: 32 }}>万円</span></div></At>
      <At at={40.2} x={ex + 22} y={(cy(500) + ey) / 2 - 22} mode="drop"><Tag c={RED} size={24}>まだ届かない</Tag></At>
      {/* 「まだ大丈夫」→ 青ざめる */}
      <At at={35.0} until={38.8} x={820} y={240} mode="spring"><Img2 n="bk_parent_relax" s={200} /></At>
      <At at={35.4} until={38.8} x={560} y={330} mode="drop"><div style={{ background: "#fff", border: `4px solid ${INK}`, borderRadius: 18, padding: "4px 14px", ...B, fontSize: 26 }}>まだ時間あるし大丈夫</div></At>
      <At at={38.86} until={45.5} x={820} y={240} mode="slam"><Img2 n="bk_parent_relax_crack" s={200} /></At>
      {/* つまり */}
      <At at={42.38} x={70} y={1240} mode="slam"><Big bg="#fff" fg={RED} size={42}>危ないのは 使う年の暴落だけじゃない</Big></At>
      <At at={46.78} x={ex + 70} y={ey - 120} mode="slam"><span style={{ ...SER, fontSize: 130, color: RED }}>？</span></At>
      <At at={46.9} x={560} y={460} mode="drop"><Pill c={INK} size={28}>戻るまで どれくらい？ わからない</Pill></At>
      <Foot at={36.66} y={1340}>※2007年末に500万円。S&P500・配当込み・ドル建て。月の動き＝Shiller（イェール大）の月次データ、年末の値＝Damodaran（NYU）の年間リターン</Foot>
    </>
  );
};

// ════════ p4 だから僕は、債券も（49.32–63.84） ════════
const Box: React.FC<{ x: number; at: number; dir: 1 | -1; c: string; label: string; up: boolean; on: boolean; wait: boolean; children?: React.ReactNode }> = ({ x, at, dir, c, label, up, on, wait, children }) => {
  const f = useCurrentFrame();
  const glow = on ? 0.5 + 0.5 * Math.sin(f / 4) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: 640, width: 440, height: 400, background: on ? "#FFFDF2" : "#fff", border: `5px solid ${INK}`, borderRadius: 24, boxSizing: "border-box", boxShadow: on ? `0 0 0 8px ${YEL}, 0 0 ${24 + 14 * glow}px ${YEL}` : `7px 9px 0 ${INK}`, ...swoop(f, at, dir), filter: wait ? "grayscale(0.5)" : undefined, opacity: wait ? 0.75 : 1 }}>
      <div style={{ position: "absolute", left: 24, top: 16, ...K, fontSize: 44, color: c }}>{label}</div>
      <svg width={430} height={390} style={{ position: "absolute", left: 0, top: 0 }}>
        <polyline points={up ? "40,300 120,260 200,270 280,200 380,120" : "40,140 120,170 200,160 280,250 380,320"} fill="none" stroke={up ? BND : RED} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </div>
  );
};
const P4: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const phaseA = t >= 55.12 && t < 58.64, phaseB = t >= 58.64;
  return (
    <>
      <Head at={49.32} tag="僕の場合" title={<>株と一緒に <span style={{ color: BND }}>債券</span>も</>} c={BND} />
      <At at={49.6} x={70} y={420} mode="spring"><Img2 n="taichi_one_finger" s={170} /></At>
      {/* NISA → 債券 500万円 */}
      <At at={51.86} x={250} y={450} mode="drop"><Pill c={STK} size={34}>NISAの一部</Pill></At>
      <Arrow at={52.4} x1={540} y1={480} x2={640} y2={480} color={INK} />
      <At at={52.8} x={660} y={430} mode="slam"><div style={{ background: "#fff", border: `6px solid ${BND}`, borderRadius: 18, padding: "2px 22px", whiteSpace: "nowrap", boxShadow: `5px 7px 0 ${INK}` }}><span style={{ ...K, fontSize: 30, color: BND }}>債券 </span><span style={{ ...SER, fontSize: 64, color: BND }}><Num at={53.0} to={500} dur={14} /></span><span style={{ ...K, fontSize: 28 }}>万円</span></div></At>
      <At at={53.4} x={890} y={540} mode="spring"><Img2 n="bk_bond_paper" s={120} /></At>
      {/* 2つの箱 */}
      <Box x={60} at={55.0} dir={-1} c={STK} label="株" up={phaseB} on={phaseB} wait={phaseA}>{phaseA ? <div style={{ position: "absolute", right: 24, top: 20, ...K, fontSize: 34, color: RED, border: `5px solid ${RED}`, borderRadius: 12, padding: "0 14px", background: "#fff", transform: "rotate(6deg)" }}>待つ</div> : null}</Box>
      <Box x={580} at={55.2} dir={1} c={BND} label="債券" up on={phaseA} wait={false} />
      {phaseA ? <Cross at={55.6} x={180} y={760} s={190} /> : null}
      {/* 学費へ */}
      <At at={55.8} until={60.5} x={400} y={1060} mode="spring"><Img2 n="bk_parent_pay" s={240} /></At>
      {phaseA ? <Arrow at={55.9} x1={800} y1={1045} x2={640} y2={1120} color={BND} /> : null}
      {phaseB ? <Arrow at={58.8} x1={280} y1={1045} x2={420} y2={1120} color={STK} /> : null}
      <At at={55.5} until={58.6} x={600} y={570} mode="drop"><Tag c={RED} size={30}>株↓ → 債券から使う</Tag></At>
      <At at={58.64} x={70} y={570} mode="drop"><Tag c={BND} size={30}>株↑ → 株から使う</Tag></At>
      <Burst at={60.64} cy={1200} r0={320} />
      <At at={60.64} x={60} y={1170} mode="slam"><Big size={44}>状況に合わせて 柔軟に！</Big></At>
      <At at={61.2} x={860} y={1040} mode="spring"><Img2 n="bk_family_relief" s={190} /></At>
    </>
  );
};

// ════════ p5 なんで暴落で債券が上がる？（63.84–82.66） ════════
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const part2 = t >= 74.6;
  const tilt = 14 * interpolate(f, [F(72.04), F(72.04) + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const S0 = 540, SY = 980, SR = 300;
  const lx = S0 - SR * Math.cos((tilt * Math.PI) / 180), ly = SY + SR * Math.sin((tilt * Math.PI) / 180);
  const rx = S0 + SR * Math.cos((tilt * Math.PI) / 180), ry = SY - SR * Math.sin((tilt * Math.PI) / 180);
  const bar = (x: number, v: number, c: string, at: number, label: string) => {
    const p = interpolate(f, [F(at), F(at) + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.2)) });
    const AX = 880, h = Math.abs(v) * 7 * p;
    return (
      <>
        <div style={{ position: "absolute", left: x, top: v > 0 ? AX - h : AX, width: 230, height: h, background: c, borderRadius: v > 0 ? "18px 18px 0 0" : "0 0 18px 18px", boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.12)" }} />
        {p > 0.05 ? <div style={{ position: "absolute", left: x - 40, width: 310, top: v > 0 ? AX - h - 110 : AX + h + 6, textAlign: "center", ...SER, fontSize: 96, color: c }}>{v > 0 ? "+" : "−"}<Num at={at} to={Math.abs(v)} dur={14} />%</div> : null}
        <div style={{ position: "absolute", left: x - 30, width: 290, top: v > 0 ? AX + 14 : AX - 52, textAlign: "center", ...K, fontSize: 32, opacity: p }}>{label}</div>
      </>
    );
  };
  return (
    <>
      <Head at={63.84} tag="なぜ？" title={<>暴落で <span style={{ color: BND }}>債券が上がる</span> 理由</>} c={BND} />
      <Lines y={420} size={44} lines={[[65.94, <>歴史的に見ると、<R>債券は上がる傾向</R></>]]} />
      {!part2 ? (
        <>
          {/* 流れ：景気悪化 → 金利↓ → 債券の価値↑ */}
          <At at={68.54} x={60} y={560} mode="drop"><Pill c={RED} size={30}>景気悪化</Pill></At>
          <Arrow at={68.9} x1={260} y1={585} x2={340} y2={585} color={INK} />
          <At at={69.0} x={350} y={540} mode="spring"><Img2 n="bk_bank_building_rate" s={170} /></At>
          <At at={69.4} x={520} y={560} mode="drop"><Pill c={CASH} size={30}>金利を下げる</Pill></At>
          <Arrow at={72.04} x1={770} y1={585} x2={840} y2={585} color={INK} />
          <At at={72.2} x={850} y={560} mode="drop"><Pill c={BND} size={30}>債券↑</Pill></At>
          <At at={69.8} x={350} y={720} mode="rise"><span style={{ ...B, fontSize: 26, color: SUB }}>アメリカの政策金利 4.75% → ほぼ0%（2007年9月→2008年12月）</span></At>
          {/* シーソー */}
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(f, [F(71.0), F(71.4)], [0, 1], clamp) }}>
            <path d={`M${S0} ${SY + 20} L${S0 - 60} ${SY + 150} L${S0 + 60} ${SY + 150} Z`} fill={INK} />
            <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={INK} strokeWidth={18} strokeLinecap="round" />
          </svg>
          {f >= F(71.0) ? (
            <>
              <div style={{ position: "absolute", left: lx - 120, top: ly - 170, width: 240, height: 150, borderRadius: 20, background: CASH, border: `5px solid ${INK}`, boxShadow: `5px 7px 0 ${INK}`, color: "#fff", ...K, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", lineHeight: 1.1 }}><div>金利</div><div style={{ fontSize: 56 }}>{tilt > 3 ? "↓" : ""}</div></div>
              <div style={{ position: "absolute", left: rx - 130, top: ry - 170, width: 260, height: 150, borderRadius: 20, background: BND, border: `5px solid ${INK}`, boxShadow: `5px 7px 0 ${INK}`, color: "#fff", ...K, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", lineHeight: 1.1 }}><div>債券の価値</div><div style={{ fontSize: 56 }}>{tilt > 3 ? "↑" : ""}</div></div>
            </>
          ) : null}
          <At at={72.4} x={360} y={1160} mode="drop"><span style={{ ...B, fontSize: 28, color: INK, background: "#fff", padding: "4px 16px", borderRadius: 12, border: `3px solid ${INK}` }}>前に買った「利息の高い債券」の価値が上がる</span></At>
        </>
      ) : (
        <>
          <At at={74.76} x={60} y={540} mode="slam"><Stamp size={44}>2008年 リーマンショックの年</Stamp></At>
          <div style={{ position: "absolute", left: 120, top: 880, width: 840, height: 6, background: INK }} />
          {bar(220, -36.6, STK, 76.54, "株")}
          {bar(640, 20.1, BND, 79.34, "10年国債")}
          <Burst at={79.34} cx={755} cy={720} r0={260} />
          <At at={79.6} x={860} y={560} mode="spring"><Img2 n="bk_bond_paper" s={150} /></At>
          <Foot at={76.54} y={1300}>※2008年の年間リターン（配当・利息込み）：S&P500 −36.55%、米国10年債 +20.10%（Damodaran・NYU）</Foot>
        </>
      )}
    </>
  );
};

// ════════ p6 約8割（82.66–90.86） ════════
const DOWN: [number, boolean][] = [[1929, true], [1930, true], [1931, false], [1932, true], [1934, true], [1937, true], [1939, true], [1940, true], [1941, false], [1946, true], [1953, true], [1957, true], [1962, true], [1966, true], [1969, false], [1973, true], [1974, true], [1977, true], [1981, true], [1990, true], [2000, true], [2001, true], [2002, true], [2008, true], [2018, false], [2022, false]];
const P6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Head at={82.66} tag="過去98年" title={<>株が下がった <span style={{ color: RED }}>26年</span></>} />
      <Lines y={420} size={44} lines={[[82.9, <>そのうち<R>約8割</R>で、債券はプラス</>]]} />
      <div style={{ position: "absolute", left: 70, top: 560, display: "grid", gridTemplateColumns: "repeat(6, 148px)", gap: 14 }}>
        {DOWN.map(([y, plus], i) => {
          const at = F(82.9) + i * 2;
          const flip = F(84.2) + i * 1.2;
          const on = f >= flip;
          const k = interpolate(f - at, [0, 3, 6], [0, 1.12, 1], clamp);
          const fl = interpolate(f - flip, [0, 3, 6], [1, 0, 1], clamp);
          const hot = y === 2022 && f >= F(86.26);
          return <div key={y} style={{ height: 80, borderRadius: 16, background: !on ? "#fff" : plus ? BND : RED, color: on ? "#fff" : INK, border: `4px solid ${INK}`, ...K, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k * (hot ? 1.15 : 1)}) scaleX(${fl})`, boxShadow: hot ? `0 0 0 8px ${YEL}` : `4px 5px 0 ${INK}`, zIndex: hot ? 2 : 1 }}>{y}</div>;
        })}
      </div>
      <Burst at={85.6} cy={1180} r0={280} />
      <At at={85.6} x={70} y={1110} mode="slam"><div style={{ background: "#fff", border: `6px solid ${BND}`, borderRadius: 22, padding: "4px 26px", boxShadow: `6px 8px 0 ${INK}`, whiteSpace: "nowrap" }}><span style={{ ...K, fontSize: 32 }}>債券プラス </span><span style={{ ...SER, fontSize: 90, color: BND }}>約8</span><span style={{ ...K, fontSize: 40 }}>割</span><span style={{ ...B, fontSize: 26, color: SUB }}>（26回中21回）</span></div></At>
      <At at={88.1} x={620} y={1140} mode="slam"><Stamp size={36}>株も債券も 下がった年も</Stamp></At>
      <Foot at={83.0} y={1300}>※1928〜2025年（98年間）でS&P500（配当込み）がマイナスの26年のうち、米国10年債（利息込み）がプラスは21年（Damodaran・NYU）。2022年は物価を抑えるために金利が大きく上がり、株も債券も下がりました</Foot>
    </>
  );
};

// ════════ p7 今の金利（90.86–100.68） ════════
const GX = 90, GY = 600, GW = 900, GH = 500, YMAX = 7;
const gx = (i: number) => GX + (i / (UST10Y.length - 1)) * GW, gy = (v: number) => GY + GH - (v / YMAX) * GH;
const iLow = UST10Y.indexOf(Math.min(...UST10Y)), iEnd = UST10Y.length - 1;
const P7: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.max(2, Math.round(interpolate(f, [F(91.2), F(93.4)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) }) * UST10Y.length));
  const blink = f >= F(93.6) ? 0.55 + 0.45 * Math.sin((f - F(93.6)) / 3) : 0;
  return (
    <>
      <Head at={90.86} tag="そして今" title={<>アメリカ10年国債の <span style={{ color: BND }}>金利</span></>} c={BND} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {f >= F(91.0) ? <>
          {[0, 2, 4, 6].map((v) => <g key={v}><line x1={GX} y1={gy(v)} x2={GX + GW} y2={gy(v)} stroke="#E6DDBE" strokeWidth={2} /><text x={GX - 14} y={gy(v) + 10} textAnchor="end" fontSize={26} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{v}%</text></g>)}
          {[2000, 2010, 2020].map((y) => <text key={y} x={gx((y - 2000) * 12)} y={GY + GH + 40} textAnchor="middle" fontSize={26} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{y}</text>)}
          <polyline points={UST10Y.slice(0, n).map((v, i) => `${gx(i)},${gy(v)}`).join(" ")} fill="none" stroke={BND} strokeWidth={7} strokeLinejoin="round" />
        </> : null}
        {blink > 0 ? <circle cx={gx(iEnd)} cy={gy(UST10Y[iEnd])} r={18 + 10 * blink} fill={RED} opacity={0.35 + 0.5 * blink} /> : null}
      </svg>
      <At at={91.0} x={60} y={GY - 70} mode="fade"><span style={{ ...B, fontSize: 28, color: SUB }}>米国10年債の利回り（月平均）</span></At>
      <Spot at={92.4} until={93.4} rect={[gx(iLow) - 70, gy(UST10Y[iLow]) - 60, 140, 110]} r={18} />
      <At at={92.5} until={93.5} x={gx(iLow) - 150} y={gy(UST10Y[iLow]) + 60} mode="drop"><Tag c={INK}>2020年 0.52%</Tag></At>
      <Burst at={93.6} cx={gx(iEnd)} cy={gy(UST10Y[iEnd])} r0={200} />
      <At at={93.6} x={gx(iEnd) - 320} y={gy(UST10Y[iEnd]) - 170} mode="slam"><span style={{ ...SER, fontSize: 96, color: RED }}>約5%</span><span style={{ ...K, fontSize: 30 }}> 今</span></At>
      <At at={95.5} x={90} y={1150} mode="drop"><Pill c={BND} size={34}>増やしやすい</Pill></At>
      <At at={96.6} x={400} y={1150} mode="drop"><Pill c={CASH} size={34}>暴落の備えにも</Pill></At>
      <At at={98.2} x={260} y={1240} mode="slam"><Big bg="#fff" fg={BND} size={40}>債券も 選択肢に入れやすい</Big></At>
      <Foot at={91.2} y={1330}>※FRED（米セントルイス連銀）DGS10の月平均。2026年11月時点で5%前後。将来の金利や受取額を約束するものではありません</Foot>
    </>
  );
};

// ════════ p8 資産分散（100.68–107.6） ════════
const P8: React.FC = () => {
  const f = useCurrentFrame();
  const inB = (at: number) => interpolate(f, [F(at), F(at) + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.5)) });
  const join = interpolate(f, [F(103.02), F(103.02) + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) });
  const ring = f >= F(103.3) ? interpolate(f - F(103.3), [0, 14], [0, 1], clamp) : 0;
  const ball = (x0: number, x1: number, c: string, label: string, at: number, from: number) => {
    const k = inB(at);
    const x = x0 + (x1 - x0) * join;
    return <div style={{ position: "absolute", left: x - 130 + (1 - k) * from, top: 640, width: 260, height: 260, borderRadius: "50%", background: c, border: `6px solid ${INK}`, boxShadow: `8px 10px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 64, color: "#fff", opacity: Math.min(1, k * 2), transform: `scale(${0.6 + 0.4 * k})` }}>{label}</div>;
  };
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 300, ...K, fontSize: 62, color: INK, whiteSpace: "nowrap" }}><TypeIn at={F(100.68)}>どれか<R>1つだけ</R>ではなく</TypeIn></div>
      {ring > 0 ? <div style={{ position: "absolute", left: 540 - 330 * (0.7 + 0.5 * ring), top: 770 - 330 * (0.7 + 0.5 * ring), width: 660 * (0.7 + 0.5 * ring), height: 660 * (0.7 + 0.5 * ring), borderRadius: "50%", border: `8px solid ${YEL}`, opacity: 1 - ring }} /> : null}
      {ball(220, 330, STK, "株", 100.9, -700)}
      {ball(540, 540, BND, "債券", 101.2, 0)}
      {ball(860, 750, CASH, "現金", 101.5, 700)}
      <At at={101.0} x={130} y={930} mode="drop"><div style={{ width: 200, textAlign: "center", ...K, fontSize: 26, color: STK }}>増やす<br />物価に負けない</div></At>
      <At at={101.3} x={440} y={930} mode="drop"><div style={{ width: 200, textAlign: "center", ...K, fontSize: 26, color: BND }}>暴落の備え<br />利息で増やす</div></At>
      <At at={101.6} x={760} y={930} mode="drop"><div style={{ width: 200, textAlign: "center", ...K, fontSize: 26, color: CASH }}>すぐ使う</div></At>
      <Burst at={103.02} cy={1150} r0={340} dur={26} />
      <At at={103.02} x={60} y={1080} mode="slam"><Big size={50}>何が起きても対応できる 資産分散</Big></At>
      <At at={105.34} x={760} y={380} mode="spring"><Img2 n="bk_parent_balance" s={240} /></At>
    </>
  );
};

// ════════ 地図 ════════
const PANELS: Panel[] = [
  { id: "p1", col: 0, row: 0 }, { id: "p2", col: 1, row: 0 }, { id: "p3", col: 2, row: 0 },
  { id: "p4", col: 2, row: 1 }, { id: "p5", col: 1, row: 1 }, { id: "p6", col: 0, row: 1 },
  { id: "p7", col: 0, row: 2 }, { id: "p8", col: 1, row: 2 },
];
const STOPS: Stop[] = [
  { id: "p1", trans: 0 }, { id: "p2", trans: 16.85, kind: "kick" }, { id: "p3", trans: 30.6, kind: "kick" }, { id: "p4", trans: 48.9, kind: "kick" },
  { id: "p5", trans: 63.45, kind: "fast" }, { id: "p6", trans: 82.25, kind: "kick" }, { id: "p7", trans: 90.45, kind: "fast" }, { id: "p8", trans: 100.3, kind: "kick" },
];
const LINKS: [string, string][] = PANELS.slice(1).map((p, i) => [PANELS[i].id, p.id]);
const BODY: Record<string, React.FC> = { p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8 };
const HOME = { x: 540, y: 960, s: 1 };
const PUNCH: Record<string, CamKey[]> = {
  p1: [{ t: 9.72, x: 420, y: 900, s: 1.06, d: 5 }, { t: 12.4, ...HOME, d: 14 }],
  p2: [{ t: 22.62, x: 540, y: 960, s: 1.05, d: 8 }, { t: 29.42, x: 540, y: 1020, s: 1.07, d: 5 }, { t: 30.3, ...HOME, d: 10 }],
  p3: [{ t: 38.86, x: 640, y: 880, s: 1.08, d: 6 }, { t: 42.2, ...HOME, d: 14 }, { t: 46.78, x: 640, y: 900, s: 1.05, d: 6 }, { t: 48.6, ...HOME, d: 10 }],
  p4: [{ t: 52.8, x: 760, y: 520, s: 1.1, d: 6 }, { t: 54.6, ...HOME, d: 12 }, { t: 60.64, x: 540, y: 1060, s: 1.06, d: 5 }],
  p5: [{ t: 79.34, x: 560, y: 900, s: 1.05, d: 5 }, { t: 81.6, ...HOME, d: 12 }],
  p6: [{ t: 85.6, x: 480, y: 1000, s: 1.05, d: 5 }, { t: 88.0, ...HOME, d: 10 }],
  p7: [{ t: 93.6, x: 820, y: 700, s: 1.12, d: 6 }, { t: 95.3, ...HOME, d: 12 }],
  p8: [{ t: 103.02, x: 540, y: 1000, s: 1.05, d: 5 }, { t: 103.6, x: 540, y: 980, s: 1.02, d: 20 }],
};

// 右下のたいち：気持ちが動く所だけひょこっと（最後は口パクで話す）
const APPEAR: [number, number, string][] = [
  [6.42, 11.5, "taichi_scared"], [26.48, 30.6, "taichi_worry"], [38.86, 42.2, "taichi_surprise"], [58.64, 63.4, "taichi_thumbs_up"], [85.6, 88.0, "taichi_idea"], [100.68, 107.6, "__talk"],
];
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  const a = APPEAR.find(([s0, e]) => f >= F(s0) - 2 && f < F(e) + 8);
  if (!a) return null;
  const [s0, e, name] = a;
  const inP = interpolate(f, [F(s0) - 2, F(s0) + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const outP = interpolate(f, [F(e), F(e) + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  let img = name;
  if (name === "__talk") {
    const lv = BOND_MOUTH.charCodeAt(Math.min(BOND_MOUTH.length - 1, f)) - 48;
    img = f % 84 >= 80 && lv === 0 ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 2) % 3 === 0 ? "taichi_talk_mid" : "taichi_talk_open") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  }
  const sq = interpolate(f - F(s0), [6, 10, 14], [1, 0.94, 1], clamp);
  const bob = Math.sin(f / 10) * 3;
  return <div style={{ position: "absolute", left: 755 + (1 - inP) * 380 + outP * 380, top: 1142 + bob, width: 200, height: 200, transform: `scaleY(${sq}) scaleX(${2 - sq})`, transformOrigin: "50% 100%" }}><GenSlot name={img} size={200} /></div>;
};

// 字幕（*緑*＝良い所、!赤!＝注意）
const SUBS: [number, string][] = [
  [0.0, "例えば、教育資金を*株で500万円*用意して"], [3.2, "残りは現金だけ、という家庭"], [5.16, "!リーマンショック!のとき"], [6.42, "米国株は1年で!約37%!下がり"], [9.72, "500万円が!約317万円!になりました"], [12.58, "入学金や授業料は待ってくれないので"], [15.34, "!下がったところで売る!しかないこともあります"],
  [17.24, "でも、ここが!落とし穴!"], [18.6, "株が大きく下がると"], [20.14, "元に戻るまで!何年も!かかることがあります"], [22.62, "リーマンショックでは約5年半"], [24.76, "ITバブルでは約7年"], [26.48, "過去の大きな暴落7回のうち4回は"], [29.42, "!3年たっても戻っていません!"],
  [30.98, "例えば、子どもが中学3年の冬に暴落が始まったとします"], [34.68, "大学入学までは、あと3年"], [36.66, "暴落の前に500万円あった株は"], [38.86, "3年たっても、!約460万円!までしか戻っていません"], [42.38, "つまり、危ないのは使う年の暴落だけではなくて"], [45.68, "暴落したあと"], [46.78, "!戻るまでにどれくらいかかるかわからない!ことです"],
  [49.32, "だから僕は、株と一緒に*債券*も持っています"], [51.86, "NISAの一部を売って債券に移して、今は*500万円*"], [55.12, "株が下がっている間は*債券を使い*、株が戻るまで待つ"], [58.64, "株が上がっていれば、株から使う"], [60.64, "その時の状況に合わせて、*柔軟に対応*しやすくなります"],
  [63.84, "景気の悪化で株が下がるときは"], [65.94, "歴史的に見ると*債券が上がる傾向*にあります"], [68.54, "暴落のときは、景気を支えるために金利が下がりやすく"], [72.04, "金利が下がると、*債券の価値が上がる*からです"], [74.76, "実際、リーマンショックの年は"], [76.54, "株が!約37%!下がった一方で"], [79.34, "アメリカの10年国債は*約20%*上がりました"],
  [82.66, "米国株が下がった年の、*約8割*で債券はプラス"], [86.26, "ただ2022年のように"], [88.1, "!株も債券も一緒に下がった!年もあります"], [90.86, "そして今、アメリカの10年国債の金利は*5%前後*"], [95.5, "資産を増やしやすく、暴落の備えにもなりやすいので"], [98.2, "債券も*選択肢に入れやすい*と思います"],
  [100.68, "つまり、どれか1つだけではなくて"], [103.02, "何が起きても対応できる*資産分散*が"], [105.34, "個人的には一番大事だと思っています"],
];
const END = 107.6;

// 効果音（中音が普段・高い音はキメの4回だけ）
const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  ...STOPS.slice(1).map((x) => s("u03s", x.trans, 0.22)),
  s("u02s", 0.4, 0.18), s("u02s", 3.5, 0.18), s("u05s", 5.16, 0.2), s("u07", 6.42, 0.16), s("u04", 9.72, 0.26), s("u02s", 12.6, 0.18), s("u05s", 15.34, 0.2),
  s("u02s", 20.14, 0.16), s("u05s", 22.62, 0.18), s("u05s", 24.76, 0.18), s("u04", 29.42, 0.26),
  s("u02s", 31.4, 0.16), s("u05s", 33.0, 0.2), s("u07", 36.66, 0.14), s("u04", 38.86, 0.28), s("u05s", 42.38, 0.2), s("u02s", 46.78, 0.18),
  s("u05", 52.8, 0.22), s("u02s", 55.0, 0.16), s("u05s", 55.6, 0.18), s("u05s", 58.7, 0.18), s("u10", 60.64, 0.24),
  s("u02s", 68.54, 0.16), s("u02s", 69.4, 0.16), s("u05s", 72.2, 0.18), s("u05s", 74.76, 0.2), s("u05", 76.54, 0.2), s("u04", 79.34, 0.26),
  s("u04", 85.6, 0.26), s("u05s", 88.1, 0.2), s("u05", 93.6, 0.24), s("u02s", 95.5, 0.16), s("u02s", 96.6, 0.16), s("u05s", 98.2, 0.2),
  s("u02s", 100.9, 0.16), s("u02s", 101.2, 0.16), s("u02s", 101.5, 0.16), s("u10", 103.02, 0.26),
];

const CapBand: React.FC = () => {
  const f = useCurrentFrame();
  const w = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: OUTE }) * (1 - interpolate(f, [F(END), F(END) + 8], [0, 1], clamp));
  return <div style={{ position: "absolute", left: 540 - 410 * w, width: 820 * w, top: 1340, height: 112, borderRadius: 999, background: "rgba(255,255,255,0.72)", boxShadow: "0 6px 18px rgba(120,90,20,0.10)" }} />;
};
const STEP_S = 0.6;
const SAFE = 0.9, SAFE_X = 540 - 540 * 0.9, SAFE_Y = 300 - 280 * 0.9;
export const BOND2_FRAMES = F(END + 0.4);
export const BondReel2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
    <Audio src={staticFile("bond-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Board streaks panels={PANELS} stops={STOPS} links={LINKS} paper={{ background: A2.bg, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }}>
      {(id) => { const C = BODY[id]; const body = <div style={{ position: "absolute", inset: 0, transform: `translate(${SAFE_X}px, ${SAFE_Y}px) scale(${SAFE})`, transformOrigin: "0 0" }}><C /></div>; return PUNCH[id] ? <Camera keys={PUNCH[id]}>{body}</Camera> : <AbsoluteFill>{body}</AbsoluteFill>; }}
    </Board>
    <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${STEP_S})`, transformOrigin: "0 0" }}><Stepper labels={["暴落", "戻るまで", "使う前", "債券も", "分散"]} steps={[0, 17.24, 30.98, 49.32, 82.66]} x={600 / STEP_S} y={140 / STEP_S} color={RED} /></div>
    <Chara />
    <CapBand />
    <Captions subs={SUBS} end={END} maxW={740} size={0.78} kcol={{ g: BND, r: RED }} top={1352} swap />
  </AbsoluteFill>
);
