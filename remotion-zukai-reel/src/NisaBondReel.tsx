import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { B, GenSlot } from "./MileLifePlan";
import { SfxTrack } from "./components/sfx";
import { Board, Panel, Stop, Stepper, panelXY, PW, PH } from "./components/board";
import { F, K, SER, pop, R as RM, Lines as LinesM, At, Arrow, Cross, Count, enter, wipeIn, TCtx, TypeIn } from "./components/zukaiKit";
import { Scene, Captions } from "./BourakuReel";
import { ghostIn, Spot, Camera, CamKey } from "./components/cam";
import { UST10Y } from "./ust10y";
import { NB_MOUTH } from "./nisaBondMouth";

// ════════════════════════════════════════════════════════════════════
//  NISAを売って債券に移した理由（図解パート・76.4秒。冒頭と締めは実写トーク）
//  音声＝public/nisabond-narration.wav。作り＝参考リール②（マーケ博士）の「1枚の地図」＋左下のステップ表示、色は太一の黄色ノート。
//  数字：500万円×年5%複利 → 16年後 約1,091万円／30年後 約2,161万円。米国10年債＝FRED DGS10の月平均（2020年8月 0.52%が最低、2026年10月 約5%）。
//  画像 nb_*（太一と同じ絵柄で依頼中）は、届くまで点線の枠で表示される。
// ════════════════════════════════════════════════════════════════════

// 見た目の切り替え：marke＝参考リール②寄り（地図・左寄せ・赤の明朝）／taichi＝太一の元の図解寄り（場面転換・中央寄せ・マーカー・下に字幕）
const Look = React.createContext<"marke" | "taichi">("marke");
const R: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const look = React.useContext(Look);
  const f = useCurrentFrame();
  const t = React.useContext(TCtx);
  if (look === "marke") {
    if (t.A < 0) return <RM>{children}</RM>;
    const w = interpolate(f - (t.A + t.n + 2), [0, 8], [0, 100], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
    return <span style={{ position: "relative", display: "inline-block" }}><span style={{ position: "absolute", left: -4, bottom: "6%", height: "30%", width: `calc(${w}% + ${w > 0 ? 8 : 0}px)`, background: "rgba(255,201,60,0.55)", borderRadius: 6 }} /><span style={{ position: "relative" }}><RM>{children}</RM></span></span>;
  }
  return <span style={{ position: "relative", display: "inline-block" }}><span style={{ position: "absolute", left: -4, right: -4, bottom: "4%", height: "38%", background: A2.marker, borderRadius: 6 }} /><span style={{ position: "relative", color: A2.green }}>{children}</span></span>;
};
const Lines: React.FC<React.ComponentProps<typeof LinesM>> = (p) => {
  const look = React.useContext(Look);
  return look === "marke" ? <LinesM anim="type" {...p} /> : <LinesM {...p} center x={0} />;
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const INK = A2.ink, RED = A2.red, STOCK = "#2E9E6B", BOND = "#4A8FD6", CASH = "#E9B82E", SUB = A2.sub;
const Img2: React.FC<{ n: string; s: number }> = ({ n, s }) => <GenSlot name={n} size={s} />;
const Tag: React.FC<{ c: string; children: React.ReactNode; size?: number }> = ({ c, children, size = 30 }) => (
  <span style={{ display: "inline-block", background: c, color: "#fff", borderRadius: 999, padding: "4px 22px", ...K, fontSize: size, whiteSpace: "nowrap" }}>{children}</span>
);
const Head: React.FC<{ n: number; at: number; title: string }> = ({ n, at, title }) => {
  const f = useCurrentFrame();
  const look = React.useContext(Look);
  if (f < F(at)) return null;
  if (look === "taichi") {
    const p = interpolate(f - F(at), [0, 8], [0, 1], out);
    return (
      <div style={{ position: "absolute", left: 0, top: 250, width: 1080, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 18}px)` }}>
        <div style={{ ...B, fontSize: 64, color: INK }}><span style={{ color: A2.green }}>{["①", "②", "③", "④"][n - 1]}</span> {title}</div>
        <div style={{ width: interpolate(f - F(at), [4, 12], [0, 140], out), height: 12, borderRadius: 999, background: A2.green, margin: "12px auto 0" }} />
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: 60, top: 300, display: "flex", alignItems: "center", gap: 20 }}>
      <span style={{ background: RED, color: "#fff", borderRadius: 999, padding: "6px 28px", ...K, fontSize: 36, display: "inline-block", ...enter("slam", f, F(at) + 6) }}>理由 {n}</span>
      <span style={{ ...K, fontSize: 62, color: INK, display: "inline-block" }}><TypeIn at={F(at) + 8} step={1.5}>{title}</TypeIn></span>
    </div>
  );
};
// 箱がシュッと入ってくる（横から・少し傾いて・ぶれながら）
const swoop = (f: number, at: number, dir: 1 | -1): React.CSSProperties => {
  const d = f - F(at);
  if (d < 0) return { opacity: 0 };
  const p = interpolate(d, [0, 9], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return { transform: `translateX(${(1 - p) * 700 * dir}px) rotate(${(1 - p) * 6 * dir}deg)`, filter: p < 0.9 ? `blur(${(1 - p) * 8}px)` : undefined };
};
const Foot: React.FC<{ at: number; children: React.ReactNode; y?: number }> = ({ at, children, y = 1290 }) => (
  <At at={at} x={60} y={y} mode="rise"><div style={{ maxWidth: 940, display: "inline-block", background: "#FFF8E3", border: "2px solid #E8D9A8", borderRadius: 14, padding: "6px 16px", ...B, fontSize: 23, lineHeight: 1.45, color: SUB }}>{children}</div></At>
);

// ── 10マスのブロック（1マス＝10%） ──
type Mix = [number, number, number]; // 株・債券・現金その他
const mixAt = (t: number): Mix => (t >= 10.42 ? [5, 3, 2] : t >= 5.9 ? [8, 1, 1] : t >= 5.14 ? [7, 2, 1] : [6, 2, 2]);
const Blocks: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const f = useCurrentFrame();
  const d0 = f - F(at);
  if (d0 < 0) return null;
  const sw = interpolate(d0, [0, 9], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const t = f / 30;
  const m = mixAt(t);
  const crash = t >= 8.46 && t < 10.42;
  const cols = Array.from({ length: 10 }).map((_, i) => (i < m[0] ? STOCK : i < m[0] + m[1] ? BOND : CASH));
  const flipAt = t >= 10.42 ? F(10.42) : t >= 5.9 ? F(5.9) : t >= 5.14 ? F(5.14) : -99;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 960, background: "#fff", border: `5px solid ${INK}`, borderRadius: 26, boxShadow: "8px 10px 0 #E3B53C", padding: "26px 28px", boxSizing: "border-box", transform: `translateX(${(1 - sw) * -1150}px) skewX(${(1 - sw) * -16}deg)`, filter: sw < 0.9 ? `blur(${(1 - sw) * 10}px)` : undefined }}>
      <div style={{ display: "flex", gap: 10 }}>
        {cols.map((c, i) => {
          const sink = crash && c === STOCK ? interpolate(f - F(8.46) - i * 1.5, [0, 6, 9], [0, 34, 26], { ...clamp, easing: Easing.in(Easing.quad) }) : 0;
          const shake = crash && c === STOCK ? Math.sin((f + i * 3) * 1.9) * 5 + sink : 0;
          const flip = flipAt > 0 ? interpolate(f - flipAt - i, [0, 4, 8], [1, 0, 1], clamp) : 1;
          const inK = interpolate(d0 - 6 - i * 1.3, [0, 4, 7], [0, 1.15, 1], clamp);
          return <div key={i} style={{ flex: 1, height: 120, borderRadius: 12, background: crash && c === STOCK ? RED : c, transform: `translateY(${shake}px) scaleX(${flip}) scale(${inK})`, boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.12)" }} />;
        })}
      </div>
      <div style={{ display: "flex", gap: 34, marginTop: 18, ...B, fontSize: 32, color: INK, ...enter("rise", f, F(at) + 18) }}>
        {([["株", STOCK, m[0]], ["債券", BOND, m[1]], ["現金その他", CASH, m[2]]] as [string, string, number][]).map(([l, c, v]) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><span style={{ width: 26, height: 26, borderRadius: 6, background: c }} />{l} <span style={{ ...SER, color: c, fontSize: 44 }}>{v * 10}</span>%</span>
        ))}
      </div>
    </div>
  );
};

// ── P1 理由① 資産分散（0–11.8） ──
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const crashP = interpolate(f, [F(8.46), F(8.46) + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <>
      <Head n={1} at={0} title="資産分散" />
      <Lines y={420} size={50} lines={[[1.4, <>僕はこれからも<R>投資信託</R>を積み立てていく</>], [4.4, <>今後さらに<R>株の割合</R>が増えていく</>]]} />
      <At at={1.6} x={70} y={600} mode="spring"><Img2 n="nb_phone_invest" s={230} /></At>
      <At at={1.9} x={330} y={640} mode="drop"><Tag c={STOCK} size={34}>毎月 積立</Tag></At>
      <Arrow at={2.4} x1={340} y1={760} x2={560} y2={760} color={STOCK} />
      <At at={2.6} until={8.46} x={590} y={690} mode="spring" origin="0 50%"><span style={{ ...K, fontSize: 52, color: STOCK }}>株 ↑↑</span></At>
      {f >= F(8.46) && f < F(10.42) ? <div style={{ position: "absolute", left: 590, top: 690, transform: `translateY(${crashP * 30}px)` }}><span style={{ ...K, fontSize: 52, color: RED }}>株 ↓↓</span></div> : null}
      <Blocks x={60} y={890} at={3.2} />
      <At at={8.6} until={10.4} x={800} y={672} mode="slam"><span style={{ display: "inline-block", border: `6px solid ${RED}`, borderRadius: 14, padding: "0 20px", ...SER, fontSize: 60, color: RED, background: "#FFF6F2", transform: "rotate(-6deg)" }}>暴落</span></At>
      <At at={8.5} until={10.4} x={830} y={470} mode="drop"><Img2 n="nb_storm" s={190} /></At>
      <At at={10.6} x={240} y={1185} mode="slam"><span style={{ display: "inline-block", border: `7px solid ${RED}`, borderRadius: 18, padding: "4px 40px", ...SER, fontSize: 64, color: RED, background: "#FFF6F2", transform: "rotate(-4deg)" }}>資産を分散</span></At>
    </>
  );
};

// ── P2 理由② 今の高金利（11.8–24.42）米国10年債の折れ線 ──
const GX = 90, GY = 620, GW = 900, GH = 480, YMAX = 7;
const gx = (i: number) => GX + (i / (UST10Y.length - 1)) * GW, gy = (v: number) => GY + GH - (v / YMAX) * GH;
const iLow = UST10Y.indexOf(Math.min(...UST10Y)), iEnd = UST10Y.length - 1;
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const L = interpolate(f, [F(13.6), F(15.6)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const n = Math.max(2, Math.round(L * UST10Y.length));
  const blink = f >= F(17.94) ? 0.55 + 0.45 * Math.sin((f - F(17.94)) / 3) : 0;
  return (
    <>
      <Head n={2} at={11.8} title="今の高金利" />
      <Lines y={420} size={46} lines={[[13.6, <>債券の金利は<R>日々変わる</R></>]]} />
      <At at={13.0} x={60} y={GY - 60} mode="fade"><span style={{ ...B, fontSize: 28, color: SUB }}>米国10年債の利回り（月平均）</span></At>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {f >= F(13.2) ? <>
          {[0, 2, 4, 6].map((v) => <g key={v}><line x1={GX} y1={gy(v)} x2={GX + GW} y2={gy(v)} stroke="#E6DDBE" strokeWidth={2} /><text x={GX - 14} y={gy(v) + 10} textAnchor="end" fontSize={26} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{v}%</text></g>)}
          {[2000, 2010, 2020].map((y) => { const i = (y - 2000) * 12; return <text key={y} x={gx(i)} y={GY + GH + 40} textAnchor="middle" fontSize={26} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{y}</text>; })}
          <polyline points={UST10Y.slice(0, n).map((v, i) => `${gx(i)},${gy(v)}`).join(" ")} fill="none" stroke={BOND} strokeWidth={6} strokeLinejoin="round" />
        </> : null}
        {blink > 0 ? <circle cx={gx(iEnd)} cy={gy(UST10Y[iEnd])} r={18 + 10 * blink} fill={RED} opacity={0.35 + 0.5 * blink} /> : null}
      </svg>
      <Spot at={16.68} until={17.9} rect={[gx(iLow) - 70, gy(UST10Y[iLow]) - 60, 140, 110]} r={18} />
      <At at={16.9} until={17.9} x={gx(iLow) - 150} y={gy(UST10Y[iLow]) + 60} mode="drop"><Tag c={INK}>2020年 0.52%</Tag></At>
      <Spot at={18.0} until={20.4} rect={[gx(iEnd) - 330, gy(UST10Y[iEnd]) - 175, 380, 235]} r={22} color={RED} />
      <At at={18.6} until={20.4} x={gx(iEnd) - 300} y={gy(UST10Y[iEnd]) + 80} mode="drop"><Tag c={RED} size={32}>今は高い水準</Tag></At>
      <At at={18.14} x={gx(iEnd) - 300} y={gy(UST10Y[iEnd]) - 150} mode="slam"><span style={{ ...SER, fontSize: 84, color: RED }}>約5%</span><span style={{ ...B, fontSize: 28, color: INK }}> 今</span></At>
      <At at={20.6} x={650} y={440} mode="slam"><span style={{ display: "inline-block", border: `6px solid ${RED}`, borderRadius: 14, padding: "2px 26px", ...SER, fontSize: 52, color: RED, background: "#FFF6F2", transform: "rotate(-6deg)" }}>期間限定</span></At>
      <Foot at={13.6} y={1250}>※出典：FRED（米セントルイス連銀）DGS10。2026年10月時点</Foot>
    </>
  );
};

// ── P3 理由③ 500万円（24.42–36.38） ──
const Stack: React.FC<{ at: number; h: number; c: string; label: string }> = ({ at, h, c, label }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const k = interpolate(f - F(at), [0, 8], [0, 1], out);
  return <div style={{ height: h * k, background: c, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 46, color: "#fff", overflow: "hidden", boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.12)" }}>{label}</div>;
};
const P3: React.FC = () => (
  <>
    <Head n={3} at={24.42} title="将来のお金を見える化" />
    <Lines y={420} size={48} lines={[[25.18, <>将来のお金を<R>ある程度確定</R>させたかった</>]]} />
    <div style={{ position: "absolute", left: 120, top: 560, width: 320, height: 620, display: "flex", flexDirection: "column-reverse", gap: 8 }}>
      <Stack at={28.76} h={330} c={BOND} label="300万円" />
      <Stack at={30.98} h={220} c="#2F6FB8" label="+200万円" />
    </div>
    <At at={25.5} until={28.5} x={600} y={560} mode="spring"><Img2 n="nb_calendar" s={300} /></At>
    <At at={26.2} until={28.5} x={560} y={890} mode="drop"><Tag c={INK} size={40}>何年後に いくら？</Tag></At>
    <At at={28.9} x={130} y={1190} mode="rise"><span style={{ ...B, fontSize: 28, color: SUB }}>もともと</span></At>
    <At at={32.22} x={520} y={700} mode="slam"><div style={{ ...B, fontSize: 40, color: INK }}>合計<br /><span style={{ ...SER, fontSize: 150, color: BOND, lineHeight: 1 }}><Count at={32.4} to={500} dur={12} /></span><span style={{ ...K, fontSize: 52 }}>万円</span></div></At>
    <At at={33.84} x={520} y={980} mode="drop"><Tag c={RED} size={40}>5%超の水準で運用</Tag></At>
    <At at={30.0} x={760} y={1060} mode="spring"><Img2 n="nb_bond_paper" s={220} /></At>
    <Foot at={33.4}>※ドル建て・満期まで持った場合。円での金額は為替で変わります</Foot>
  </>
);

// ── P4 16年後・30年後（36.38–45.26）柱の高さ＝金額の比（500：1,091：2,161）。金額は柱の上、絵はその上 ──
const BASE = 1062, H0 = 110, H1 = 240, H2 = 475;
const P4: React.FC = () => {
  const f = useCurrentFrame();
  const g1 = interpolate(f, [F(38.1), F(38.1) + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const g2 = interpolate(f, [F(39.74), F(39.74) + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.2)) });
  const col = (x: number, h: number, c: string) => <div style={{ position: "absolute", left: x, top: BASE - h, width: 200, height: h, borderRadius: "16px 16px 0 0", background: c, boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.1)" }} />;
  const money = (cx: number, top: number, v: number, at: number, mode: "slam" | "drop" | "rise") => (
    <At at={at} x={cx - 200} y={top} mode={mode}><div style={{ width: 400, textAlign: "center", whiteSpace: "nowrap" }}><span style={{ ...B, fontSize: 30 }}>約</span><span style={{ ...SER, fontSize: 64, color: BOND }}><Count at={at} from={500} to={v} dur={mode === "slam" ? 22 : 16} /></span><span style={{ ...B, fontSize: 30 }}>万円</span></div></At>
  );
  return (
    <>
      <Lines y={330} size={48} lines={[[36.38, <>何年後に<R>いくら</R>になるか、わかる</>]]} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><line x1={60} y1={BASE} x2={60 + 960 * interpolate(f, [F(36.2), F(36.2) + 12], [0, 1], out)} y2={BASE} stroke={INK} strokeWidth={6} strokeLinecap="round" /></svg>
      {col(100, H0, BOND)}
      {f >= F(38.1) ? col(440, H0 + (H1 - H0) * g1, BOND) : null}
      {f >= F(39.74) ? col(780, H0 + (H2 - H0) * g2, BOND) : null}
      <At at={36.4} x={60} y={1080} mode="rise"><div style={{ width: 280, textAlign: "center", ...K, fontSize: 34 }}>今<br /><span style={{ ...B, fontSize: 26, color: SUB }}>子ども2歳と0歳</span></div></At>
      <At at={36.6} x={115} y={690} mode="spring"><Img2 n="nb_kid_toddler" s={170} /></At>
      <At at={36.6} x={100} y={BASE - H0 - 82} mode="drop"><div style={{ width: 200, textAlign: "center", ...SER, fontSize: 52, color: BOND }}>500万</div></At>
      <At at={38.1} x={440} y={1080} mode="rise"><div style={{ width: 200, textAlign: "center", ...K, fontSize: 34 }}>16年後<br /><span style={{ ...B, fontSize: 26, color: SUB }}>18歳・大学</span></div></At>
      <At at={37.34} x={420} y={560} mode="spring"><Img2 n="nb_kid_student" s={170} /></At>
      <At at={37.6} x={590} y={640} mode="drop"><Img2 n="nb_grad_cap" s={90} /></At>
      {money(540, BASE - H1 - 92, 1091, 38.4, "drop")}
      <At at={39.74} x={780} y={1080} mode="rise"><div style={{ width: 200, textAlign: "center", ...K, fontSize: 34 }}>30年後<br /><span style={{ ...B, fontSize: 26, color: SUB }}>老後</span></div></At>
      <At at={39.9} x={805} y={335} mode="spring"><Img2 n="nb_elderly_couple" s={150} /></At>
      {money(880, BASE - H2 - 92, 2161, 40.1, "slam")}
      <At at={42.7} x={350} y={1180} mode="drop"><Tag c={STOCK} size={36}>教育資金</Tag></At>
      <At at={43.78} x={640} y={1180} mode="drop"><Tag c={CASH} size={36}>老後資金</Tag></At>
      <Foot at={38.4} y={1270}>※500万円を年5%で複利運用した場合の目安。ドル建て・満期まで持った場合／円での金額は為替で変わります</Foot>
    </>
  );
};

// ── P5 暴落していたら債券から（45.26–52.3） ──
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const cr = interpolate(f, [F(47.5), F(47.5) + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <>
      <Lines y={330} size={48} lines={[[45.26, <>もし<R>教育費が必要な時</R>に</>], [47.08, <>株が<R>暴落</R>していたら？</>]]} />
      <div style={{ position: "absolute", left: 80, top: 600, width: 400, height: 380, background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, boxSizing: "border-box", ...swoop(f, 45.4, -1) }}>
        <div style={{ position: "absolute", left: 24, top: 16, ...K, fontSize: 40, color: STOCK }}>株</div>
        <svg width={390} height={370} style={{ position: "absolute", left: 0, top: 0 }}><polyline points={`30,280 100,230 170,250 240,170 ${240 + 110 * cr},${170 + 170 * cr}`} fill="none" stroke={cr > 0 ? RED : STOCK} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <At at={47.5} until={49.6} x={330} y={470} mode="drop"><Img2 n="nb_storm" s={170} /></At>
      <Cross at={48.66} x={190} y={680} s={200} />
      <At at={48.86} x={110} y={1000} mode="slam"><span style={{ ...K, fontSize: 38, color: RED }}>無理に売らない</span></At>
      <div style={{ position: "absolute", left: 600, top: 600, width: 400, height: 380, background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, boxSizing: "border-box", ...swoop(f, 45.6, 1) }}>
        <div style={{ position: "absolute", left: 24, top: 16, ...K, fontSize: 40, color: BOND }}>債券</div>
        <div style={{ position: "absolute", left: 110, top: 110 }}><Img2 n="nb_bond_box" s={180} /></div>
      </div>
      <Spot at={49.66} until={52.0} rect={[590, 590, 420, 400]} r={26} color={CASH} />
      <Arrow at={50.2} x1={800} y1={1000} x2={800} y2={1110} color={BOND} />
      <At at={50.4} x={640} y={1110} mode="drop"><Img2 n="nb_envelope_money" s={150} /></At>
      <At at={50.6} x={800} y={1150} mode="spring" origin="0 50%"><Tag c={BOND} size={30}>債券側から使う</Tag></At>
    </>
  );
};

// ── P6 株と債券を持つ理由（52.3–65.22） ──
const P6: React.FC = () => {
  const f = useCurrentFrame();
  const fan = interpolate(f, [F(53.0), F(55.0)], [0, 1], out);
  const line = interpolate(f, [F(59.5), F(61.3)], [0, 1], out);
  const ends = [-170, -90, -20, 50, 120];
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 330, width: 1080, textAlign: React.useContext(Look) === "taichi" ? "center" : "left", paddingLeft: React.useContext(Look) === "taichi" ? 0 : 60, boxSizing: "border-box", ...K, fontSize: 58, color: INK }}><TypeIn at={F(52.0)}>株と債券を<R>両方</R>持つ理由</TypeIn></div>
      {/* 株：シミュレーション（点線が広がる） */}
      <div style={{ position: "absolute", left: 60, top: 470, width: 470, height: 600, background: "#fff", border: `5px solid ${INK}`, borderRadius: 24, boxSizing: "border-box", ...swoop(f, 52.3, -1) }}>
        <div style={{ position: "absolute", left: 24, top: 16, ...K, fontSize: 44, color: STOCK }}>株</div>
        <svg width={460} height={590} style={{ position: "absolute", left: 0, top: 0 }}>
          {f >= F(52.3) ? ends.map((e, i) => <line key={i} x1={50} y1={330} x2={50 + 360 * fan} y2={330 + (e - 40) * fan} stroke={STOCK} strokeWidth={5} strokeDasharray="12 10" opacity={0.85} />) : null}
          <circle cx={50} cy={330} r={10} fill={STOCK} />
        </svg>
        <At at={52.72} x={40} y={440} mode="type"><span style={{ ...B, fontSize: 30, color: INK }}>「年利5%なら…」</span></At>
        <At at={55.66} x={40} y={500} mode="type"><span style={{ ...B, fontSize: 28, color: SUB }}>過去の実績をもとにした</span></At>
        <At at={53.4} x={350} y={455} mode="spring"><Img2 n="nb_calculator" s={105} /></At>
      </div>
      <At at={57.16} x={90} y={1090} mode="slam"><span style={{ display: "inline-block", border: `6px solid ${STOCK}`, borderRadius: 14, padding: "2px 22px", ...SER, fontSize: 44, color: STOCK, background: "#F2FBF6", transform: "rotate(-4deg)" }}>シミュレーション</span></At>
      {/* 債券：満期でゴールが決まっている */}
      <div style={{ position: "absolute", left: 550, top: 470, width: 470, height: 600, background: "#fff", border: `5px solid ${INK}`, borderRadius: 24, boxSizing: "border-box", ...swoop(f, 52.5, 1) }}>
        <div style={{ position: "absolute", left: 24, top: 16, ...K, fontSize: 44, color: BOND }}>債券</div>
        <svg width={460} height={590} style={{ position: "absolute", left: 0, top: 0 }}>
          {f >= F(58.46) ? <line x1={50} y1={360} x2={50 + 340 * line} y2={360 - 150 * line} stroke={BOND} strokeWidth={8} strokeLinecap="round" /> : null}
          <circle cx={50} cy={360} r={10} fill={BOND} />
          {line > 0.95 ? <circle cx={390} cy={210} r={16} fill={RED} /> : null}
        </svg>
        <At at={59.5} x={250} y={130} mode="drop"><span style={{ ...B, fontSize: 28, color: INK }}>満期 🏁</span></At>
        <At at={60.8} x={40} y={440} mode="type"><span style={{ ...B, fontSize: 30, color: INK }}>何年後にいくらか</span></At>
        <At at={61.6} x={40} y={500} mode="type"><span style={{ ...B, fontSize: 28, color: SUB }}>満期まで持つ前提なら</span></At>
        <At at={58.7} x={335} y={450} mode="spring"><Img2 n="nb_bond_paper" s={120} /></At>
      </div>
      <At at={63.14} x={600} y={1090} mode="slam"><span style={{ display: "inline-block", border: `6px solid ${BOND}`, borderRadius: 14, padding: "2px 22px", ...SER, fontSize: 44, color: BOND, background: "#F1F6FD", transform: "rotate(-4deg)" }}>計画が立てやすい</span></At>
      <Foot at={60.0} y={1210}>※ドル建て・満期まで持った場合。円での金額は為替で変わります</Foot>
    </>
  );
};

// ── P7 まとめ（70.7–76.4） ──
const P7: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, top: 330, width: 1080, textAlign: React.useContext(Look) === "taichi" ? "center" : "left", paddingLeft: React.useContext(Look) === "taichi" ? 0 : 60, boxSizing: "border-box", ...K, fontSize: 60, color: INK }}><TypeIn at={F(70.6)}><R>株</R>と<R>債券</R>、両方を持つと</TypeIn></div>
    <At at={71.0} x={250} y={470} mode="spring"><Img2 n="nb_family" s={580} /></At>
    <Lines y={1030} size={52} lines={[[72.94, <><R>将来のお金</R>も</>], [73.9, <><R>今使っていいお金</R>も</>], [75.16, "計画しやすくなる"]]} />
  </>
);

// ════════ 地図の並び ════════
const PANELS: Panel[] = [
  { id: "p1", col: 0, row: 0 }, { id: "p2", col: 1, row: 0 }, { id: "p3", col: 2, row: 0 },
  { id: "p4", col: 2, row: 1 }, { id: "p5", col: 1, row: 1 }, { id: "p6", col: 0, row: 1 }, { id: "p7", col: 0, row: 2 },
];
const MAPIDS = ["p1", "p2", "p3", "p4", "p5", "p6"];
const STOPS: Stop[] = [
  { id: "p1", trans: 0 }, { id: "p2", trans: 11.45, kind: "kick" }, { id: "p3", trans: 24.0, kind: "kick" }, { id: "p4", trans: 36.15, kind: "fast" },
  { id: "p5", trans: 45.05, kind: "fast" }, { id: "p6", trans: 51.85, kind: "kick" }, { id: "__map", trans: 65.0, scale: 0.2, ids: MAPIDS, oy: 300 }, { id: "p7", trans: 70.5 },
];
const LINKS: [string, string][] = PANELS.slice(1).map((p, i) => [PANELS[i].id, p.id]);
const BODY: Record<string, React.FC> = { p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7 };
// ページの中の寄り・引き（緩急）。d＝動く長さ（f）：短い＝ドン、長い＝じわっ
const HOME = { x: 540, y: 960, s: 1 };
const PUNCH: Record<string, CamKey[]> = {
  p1: [{ t: 8.46, x: 540, y: 930, s: 1.06, d: 5 }, { t: 10.42, ...HOME, d: 12 }],
  p2: [{ t: 18.14, x: 540, y: 900, s: 1.08, d: 6 }, { t: 20.3, ...HOME, d: 14 }],
  p3: [{ t: 32.3, x: 560, y: 940, s: 1.06, d: 4 }, { t: 33.7, ...HOME, d: 12 }],
  p4: [{ t: 40.1, x: 600, y: 950, s: 1.04, d: 50 }, { t: 42.5, ...HOME, d: 14 }],
  p5: [{ t: 47.5, x: 380, y: 860, s: 1.22, d: 5 }, { t: 49.66, x: 700, y: 860, s: 1.22, d: 6 }, { t: 50.3, ...HOME, d: 12 }],
  p7: [{ t: 72.9, x: 540, y: 900, s: 1.04, d: 90 }],
};

// まとめの全体マップ：見出し＋各理由に赤い枠
const MapLayer: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(65.2) || f >= F(70.6)) return null;
  const ps = PANELS.filter((p) => MAPIDS.includes(p.id));
  const xs = ps.map((p) => panelXY(p)[0]), ys = ps.map((p) => panelXY(p)[1]);
  const cx = (Math.min(...xs) + Math.max(...xs) + PW) / 2, cy = (Math.min(...ys) + Math.max(...ys) + PH) / 2 + 300, s = 0.2;
  return (
    <>
      {["p1", "p2", "p3", "p6"].map((id, i) => {
        const [x, y] = panelXY(PANELS.find((q) => q.id === id)!);
        const at = F([66.4, 68.24, 68.9, 70.0][i]);
        if (f < at) return null;
        return <div key={id} style={{ position: "absolute", left: 540 + (x - cx) * s - 6, top: 960 + (y - cy) * s - 6, width: PW * s + 12, height: PH * s + 12, border: `7px solid ${RED}`, borderRadius: 16, background: "rgba(232,85,59,0.07)", transform: `scale(${pop(f, at) * interpolate(f - at, [0, 6, 16], [1, 1.07, 1.03], clamp)}) translateY(${interpolate(f - at, [0, 6, 16], [0, -14, -6], clamp)}px)`, boxShadow: `0 ${interpolate(f - at, [0, 8], [0, 22], clamp)}px 30px rgba(120,40,20,0.25), 0 0 0 ${interpolate(f - at, [0, 4, 12], [0, 18, 0], clamp)}px rgba(232,85,59,0.25)` }} />;
      })}
      <div style={{ position: "absolute", left: 0, top: 230, width: 1080, padding: "26px 150px", background: "rgba(251,246,216,0.94)", boxSizing: "border-box" }}>
        <Lines x={150} y={26} size={46} lines={[[65.22, "まとめると、"], [66.4, <>これから<R>株の割合</R>が増えていく中で</>], [68.24, <><R>高金利の今</R>、一部を債券に移しました</>]]} />
        <div style={{ height: 150 }} />
      </div>
    </>
  );
};

// 右下の太一：ずっとは出さず、気持ちが動く所だけ（横からひょこっと出て、引っこむ）
const APPEAR: [number, number, string][] = [
  [7.5, 10.4, "taichi_scared"], [20.6, 24.2, "taichi_thumbs_up"], [45.26, 49.6, "taichi_worry"], [49.66, 52.05, "taichi_idea"], [71.0, 76.9, "__talk"],
];
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  const a = APPEAR.find(([s0, e]) => f >= F(s0) - 2 && f < F(e) + 8);
  if (!a) return null;
  const [s0, e, name] = a;
  const inP = interpolate(f, [F(s0) - 2, F(s0) + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const outP = interpolate(f, [F(e), F(e) + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const look = React.useContext(Look);
  // 締めは口だけ動いて話す（声の大きさ NB_MOUTH に合わせる）
  let img = name;
  if (name === "__talk") {
    const lv = NB_MOUTH.charCodeAt(Math.min(NB_MOUTH.length - 1, f)) - 48;
    const blink = f % 84 >= 80 && lv === 0;
    img = blink ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 2) % 3 === 0 ? "taichi_talk_mid" : "taichi_talk_open") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  }
  const sq = interpolate(f - F(s0), [6, 10, 14], [1, 0.94, 1], clamp); // 着地で少しつぶれる
  const bob = Math.sin(f / 10) * 3;
  const big = name === "__talk";
  const S = big ? 250 : 200;
  return look === "marke"
    ? <div style={{ position: "absolute", left: (big ? 690 : 730) + (1 - inP) * 380 + outP * 380, top: (big ? 1090 : 1140) + bob, width: S, height: S, transform: `scaleY(${sq}) scaleX(${2 - sq})`, transformOrigin: "50% 100%" }}><GenSlot name={img} size={S} /></div>
    : <div style={{ position: "absolute", left: 680 + (1 - inP) * 420 + outP * 420, top: 1390, width: 400, height: 400 }}><GenSlot name={name} size={400} /></div>;
};

// 効果音（たいちさん指定の音だけ）
const CUES: { file: string; at: number; volume: number }[] = [
  ...[11.6, 24.2, 36.1, 45.0, 52.05, 65.0, 70.5].map((t) => ({ file: "user/u03s", at: F(t), volume: 0.24 })),
  ...[0, 11.8, 24.42].map((t) => ({ file: "user/u03", at: F(t), volume: 0.24 })),
  ...[1.6, 2.6, 5.14, 5.9].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })),
  ...[3.2, 45.4, 52.3].map((t) => ({ file: "user/u03s", at: F(t), volume: 0.22 })),
  { file: "user/u04", at: F(8.6), volume: 0.28 }, { file: "user/u05", at: F(10.6), volume: 0.28 },
  { file: "user/u05s", at: F(16.68), volume: 0.22 }, { file: "user/u05", at: F(18.14), volume: 0.26 }, { file: "user/u04", at: F(20.6), volume: 0.26 },
  ...[28.76, 30.98].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })), { file: "user/u05", at: F(32.4), volume: 0.26 }, { file: "user/u02s", at: F(33.84), volume: 0.2 },
  ...[38.4, 40.1].map((t) => ({ file: "user/u05s", at: F(t), volume: 0.22 })), ...[42.7, 43.78].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })),
  { file: "user/u04", at: F(47.5), volume: 0.26 }, { file: "user/u05s", at: F(49.66), volume: 0.22 }, { file: "user/u02s", at: F(50.6), volume: 0.2 },
  { file: "user/u04", at: F(57.16), volume: 0.24 }, { file: "user/u04", at: F(63.14), volume: 0.24 },
  ...[66.4, 68.24, 68.9, 70.0].map((t) => ({ file: "user/u05s", at: F(t), volume: 0.2 })), { file: "user/u10", at: F(75.16), volume: 0.28 },
];

// ── 太一版：まとめ（65.22–70.72）＝3つの理由にチェック ──
const SumT: React.FC = () => {
  const f = useCurrentFrame();
  const items: [string, string, number][] = [["①", "株の割合が増えていく中で", 66.4], ["②", "高金利の今", 68.24], ["③", "一部を債券に移した", 69.08]];
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 260, width: 1080, textAlign: "center", ...B, fontSize: 64, color: INK }}><span style={{ color: A2.green }}>まとめ</span></div>
      {items.map(([n, t, at], i) => f >= F(at) ? (
        <div key={n} style={{ position: "absolute", left: 110, top: 440 + i * 200, width: 860, height: 160, background: "#fff", borderRadius: 34, boxShadow: "0 18px 40px rgba(80,60,20,0.12)", display: "flex", alignItems: "center", gap: 26, padding: "0 40px", boxSizing: "border-box", ...ghostIn(f, F(at)) }}>
          <span style={{ ...K, fontSize: 60, color: A2.green }}>{n}</span><span style={{ ...K, fontSize: 48, color: INK }}>{t}</span>
          <span style={{ marginLeft: "auto", width: 70, height: 70, borderRadius: "50%", background: A2.green, color: "#fff", ...K, fontSize: 44, textAlign: "center", lineHeight: "70px", transform: `scale(${pop(f, F(at) + 6)})` }}>✓</span>
        </div>
      ) : null)}
    </>
  );
};
const SUBS: [number, string][] = [
  [0, "1つ目は*資産分散*"], [1.4, "僕はこれからも投資信託を積み立てていきます"], [4.0, "なので今後さらに*株の割合*が増えていくのは"], [6.6, "わかりきっています"], [7.5, "株に偏るほど!暴落した時の影響!も大きいので"], [10.42, "*資産を分散*しました"],
  [11.8, "2つ目は今の*高金利*"], [13.6, "債券の金利は*日々変わって*います"], [15.66, "高い時もあれば、低い時もある"], [17.5, "つまり今の高金利は"], [18.9, "ずっと続くとは限らないし"], [20.6, "ある意味!期間限定!"], [21.88, "だから高金利の今、*債券に移しました*"],
  [24.42, "3つ目は将来のお金を"], [26.18, "*ある程度確定*させたかったから"], [27.9, "僕はもともと300万円を債券に入れていて"], [30.6, "今回200万円を追加"], [32.22, "合計*500万円*"], [33.38, "どちらも*5%を超える水準*で運用しています"],
  [36.38, "例えば子どもが18歳になる*16年後*"], [38.88, "さらに今から*30年後*"], [40.48, "いくらくらいになるのか、ある程度わかるので"], [42.7, "*教育資金*にも*老後資金*にも使えるし"],
  [45.26, "もし教育費が必要な時に"], [47.08, "株が!暴落!していたら"], [48.66, "株を無理に売らず"], [49.66, "*債券側から使う*っていう選択肢も持てます"],
  [52.3, "株は「年利5%で増えたら」と計算しても"], [55.28, "あくまで過去の実績をもとにした"], [57.16, "将来の*シミュレーション*"], [58.46, "一方で債券は、満期まで持つ前提なら"], [60.8, "数年後にいくらくらいになるのか"], [62.62, "原則約束された資産だから*計画的*"],
  [65.22, "まとめると、これから株の割合が増えていく中で"], [68.24, "*高金利の今*、一部を債券に移しました"], [70.72, "株と債券、*両方を持つ*ことで"], [72.94, "将来のお金も、今使っていいお金も"], [75.16, "*計画しやすく*なります"],
];
export const NisaBondReelT: React.FC = () => (
  <Look.Provider value="taichi">
    <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
      <Audio src={staticFile("nisabond-narration.wav")} />
      <SfxTrack cues={CUES} />
      <Scene a={0} b={11.8} inT="punch"><P1 /></Scene>
      <Scene a={11.8} b={24.42} inT="drop"><P2 /></Scene>
      <Scene a={24.42} b={36.38}><P3 /></Scene>
      <Scene a={36.38} b={45.26} inT="zoom"><P4 /></Scene>
      <Scene a={45.26} b={52.3} inT="drop"><P5 /></Scene>
      <Scene a={52.3} b={65.22}><P6 /></Scene>
      <Scene a={65.22} b={70.72} inT="zoom"><SumT /></Scene>
      <Scene a={70.72} b={76.9} inT="zoom" outT="zoom"><P7 /></Scene>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, bottom: 0, background: `linear-gradient(${A2.bg}00, ${A2.bg} 60px)` }} />
      <Captions subs={SUBS} end={76.4} maxW={900} size={0.9} />
      <Chara />
    </AbsoluteFill>
  </Look.Provider>
);

// テロップの下じき（白い帯で読みやすく。最初にスッと伸びる）
const CapBand: React.FC = () => {
  const f = useCurrentFrame();
  const w = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) }) * (1 - interpolate(f, [F(76.4), F(76.4) + 8], [0, 1], clamp));
  return <div style={{ position: "absolute", left: 540 - 410 * w, width: 820 * w, top: 1340, height: 112, borderRadius: 999, background: "rgba(255,255,255,0.72)", boxShadow: "0 6px 18px rgba(120,90,20,0.10)" }} />;
};
// 左下の進み具合：全体マップの間は引っこめる
const StepperWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [F(65.0), F(65.0) + 6, F(70.5), F(70.5) + 8], [1, 0, 0, 1], clamp);
  return <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${STEP_S}) translateY(${(1 - o) * -60}px)`, transformOrigin: "0 0", opacity: o }}>{children}</div>;
};
// インスタの右のボタン・下の文章にかからないよう、図は少し小さく（左右に余白）
//  リールの見えない所（1080×1920のうち）：上 約220px（名前・音源）、下 約420px（説明文）、右 約140px（いいね・コメント・シェア）
//  → 図は 横 150〜930px ／ 縦 300〜1110px に収める（元の 60〜1020 を 0.81倍して左右150pxずつ空ける）
const STEP_S = 0.6; // 右上の進み具合の大きさ
const SAFE = 0.81, SAFE_X = 150 - 60 * 0.81, SAFE_Y = 300 - 300 * 0.81;
export const NISABOND_FRAMES = F(76.9);
export const NisaBondReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
    <Audio src={staticFile("nisabond-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Board streaks panels={PANELS} stops={STOPS} links={LINKS} paper={{ background: A2.bg, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }}>
      {(id) => { const C = BODY[id]; const body = <div style={{ position: "absolute", inset: 0, transform: `translate(${SAFE_X}px, ${SAFE_Y}px) scale(${SAFE})`, transformOrigin: "0 0" }}><C /></div>; return PUNCH[id] ? <Camera keys={PUNCH[id]}>{body}</Camera> : <AbsoluteFill>{body}</AbsoluteFill>; }}
    </Board>
    <MapLayer />
    <StepperWrap><Stepper labels={["分散", "高金利", "見える化", "株と債券"]} steps={[0, 11.8, 24.42, 52.3]} x={616 / STEP_S} y={226 / STEP_S} color={RED} /></StepperWrap>
    <Chara />
    {/* 下のテロップ（横150〜930pxに収める・インスタの説明文より上） */}
    <CapBand />
    <Captions subs={SUBS} end={76.4} maxW={740} size={0.78} kcol={{ g: RED, r: RED }} top={1352} swap />
  </AbsoluteFill>
);
