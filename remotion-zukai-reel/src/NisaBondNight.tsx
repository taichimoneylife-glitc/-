import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./components/font";
import { GenSlot } from "./MileLifePlan";
import { SfxTrack } from "./components/sfx";
import { K, SER, TypeIn, Count } from "./components/zukaiKit";
import { Captions } from "./BourakuReel";
import { UST10Y } from "./ust10y";
import { NB_MOUTH } from "./nisaBondMouth";
import { SUBS } from "./NisaBondReel";

// ════════════════════════════════════════════════════════════════════
//  NISA→債券（雰囲気ちがい版）＝「夜のマネー番組」
//  同じ音声・同じ中身。黄色ノートの反対：濃紺の背景、光る線、画面いっぱいの大きな文字と数字、1場面1メッセージ。
//  理由の切り替えは「REASON 01 / 02 / 03 / 04」の大きなカード。転換はカット＋白い光＋寄り。
//  画面の取り決め：中身は 横150〜930・縦300〜1150、テロップ 1300前後（インスタの右ボタン・下の説明文を避ける）
// ════════════════════════════════════════════════════════════════════

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const BG = "#0B1222", PANEL = "#141E35", TXT = "#F4F1E8", SUB = "#8E98AF";
const STOCK = "#43D6A4", BOND = "#5AA9FF", CASH = "#F5B841", GOLD = "#F5B841", DANGER = "#FF5D5D";
const MONO = "ui-monospace, Menlo, Consolas, monospace";
const glow = (c: string, r = 18) => `drop-shadow(0 0 ${r * 0.4}px ${c}) drop-shadow(0 0 ${r}px ${c}88)`;

// ── 背景：濃紺＋細い方眼＋ゆっくり流れる光の粒 ──
const Night: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, #18284A 0, ${BG} 60%)` }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.045) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.045) 2px, transparent 2px)", backgroundSize: "90px 90px", backgroundPosition: `0 ${(f * 0.6) % 90}px` }} />
      {Array.from({ length: 26 }).map((_, i) => {
        const x = (i * 211) % 1080, y = (((i * 389) % 1920) - f * (0.4 + (i % 5) * 0.15) + 3840) % 1920;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, borderRadius: "50%", background: i % 4 === 0 ? GOLD : "#9DB8FF", opacity: 0.18 + (i % 4) * 0.08 }} />;
      })}
    </AbsoluteFill>
  );
};

// ── 場面の器：カット＋白い光＋最初に少し寄って戻る ──
const Shot: React.FC<{ a: number; b: number; children: React.ReactNode; punch?: boolean }> = ({ a, b, children, punch = true }) => {
  const f = useCurrentFrame();
  if (f < F(a) || f >= F(b)) return null;
  const d = f - F(a);
  const k = punch ? interpolate(d, [0, 7], [1.07, 1], { ...clamp, easing: OUT }) : 1;
  const fl = interpolate(d, [0, 4], [0.55, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${k})` }}>{children}</AbsoluteFill>
      {fl > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: fl }} /> : null}
    </AbsoluteFill>
  );
};
const appear = (f: number, at: number, kind: "up" | "pop" | "fade" | "slam" = "up"): React.CSSProperties => {
  const d = f - F(at);
  if (d < 0) return { opacity: 0 };
  if (kind === "pop") return { transform: `scale(${interpolate(d, [0, 4, 7], [0.4, 1.1, 1], clamp)})`, opacity: interpolate(d, [0, 2], [0, 1], clamp) };
  if (kind === "fade") return { opacity: interpolate(d, [0, 8], [0, 1], clamp) };
  if (kind === "slam") { const sh = d >= 4 && d < 12 ? Math.sin(d * 2.7) * (12 - d) * 1.4 : 0; return { transform: `translate(${sh}px,0) scale(${interpolate(d, [0, 4, 7], [2.2, 0.94, 1], { ...clamp, easing: Easing.in(Easing.quad) })})`, opacity: interpolate(d, [0, 2], [0, 1], clamp) }; }
  return { transform: `translateY(${interpolate(d, [0, 9], [50, 0], { ...clamp, easing: OUT })}px)`, opacity: interpolate(d, [0, 5], [0, 1], clamp), filter: d < 6 ? `blur(${(6 - d) * 1.5}px)` : undefined };
};
const At: React.FC<{ at: number; until?: number; x: number; y: number; w?: number; kind?: "up" | "pop" | "fade" | "slam"; center?: boolean; children: React.ReactNode }> = ({ at, until = 999, x, y, w, kind = "up", center, children }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f >= F(until) + 5) return null;
  const o = 1 - interpolate(f, [F(until), F(until) + 5], [0, 1], clamp);
  const st = appear(f, at, kind);
  return <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: center ? "center" : undefined, ...st, opacity: ((st.opacity as number) ?? 1) * o }}>{children}</div>;
};
// 大きな見出し（1文字ずつ立ち上がる）
const Big: React.FC<{ at: number; y: number; size?: number; children: React.ReactNode; color?: string }> = ({ at, y, size = 76, children, color = TXT }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return <div style={{ position: "absolute", left: 150, width: 780, top: y, textAlign: "center", ...K, fontSize: size, lineHeight: 1.25, color }}><TypeIn at={F(at)} step={1.2}>{children}</TypeIn></div>;
};
const Hi: React.FC<{ c?: string; children: React.ReactNode }> = ({ c = GOLD, children }) => <span style={{ color: c, filter: glow(c, 10) }}>{children}</span>;
const Label: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = SUB }) => <span style={{ fontFamily: MONO, fontSize: 26, letterSpacing: 4, color: c }}>{children}</span>;
// 光る円の上に絵
const Disc: React.FC<{ n: string; s: number; c?: string }> = ({ n, s, c = "#5AA9FF" }) => (
  <div style={{ position: "relative", width: s, height: s }}>
    <div style={{ position: "absolute", inset: s * 0.06, borderRadius: "50%", background: `radial-gradient(circle, ${c}55 0, ${c}10 60%, transparent 70%)` }} />
    <GenSlot name={n} size={s} />
  </div>
);
// 注目の所だけ明るく（それ以外を暗く）
const Focus: React.FC<{ at: number; until: number; x: number; y: number; r: number; c?: string }> = ({ at, until, x, y, r, c = GOLD }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f >= F(until) + 6) return null;
  const p = interpolate(f, [F(at), F(at) + 6], [0, 1], { ...clamp, easing: OUT }) * (1 - interpolate(f, [F(until), F(until) + 6], [0, 1], clamp));
  const rr = r * (1.6 - 0.6 * p);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}px ${y}px, transparent ${rr}px, rgba(3,6,14,${0.72 * p}) ${rr + 30}px)` }} />
      <div style={{ position: "absolute", left: x - rr, top: y - rr, width: rr * 2, height: rr * 2, borderRadius: "50%", border: `5px solid ${c}`, opacity: p, boxShadow: `0 0 30px ${c}, inset 0 0 20px ${c}55` }} />
    </AbsoluteFill>
  );
};

// ── 理由のカード（REASON 01 など） ──
const Reason: React.FC<{ at: number; n: string; title: string; sub?: string }> = ({ at, n, title, sub }) => {
  const f = useCurrentFrame();
  const d = f - F(at);
  const fill = interpolate(d, [8, 16], [0, 1], clamp);
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 470, ...appear(f, at, "fade") }}><Label c={GOLD}>REASON</Label></div>
      <div style={{ position: "absolute", left: 140, top: 500, ...K, fontSize: 330, lineHeight: 1, color: `rgba(245,184,65,${fill})`, WebkitTextStroke: `5px ${GOLD}`, filter: glow(GOLD, 22), transform: `translateX(${interpolate(d, [0, 10], [-120, 0], { ...clamp, easing: OUT })}px)`, opacity: interpolate(d, [0, 4], [0, 1], clamp) }}>{n}</div>
      <div style={{ position: "absolute", left: 150, width: 800, top: 860, ...K, fontSize: 92, lineHeight: 1.2, color: TXT }}>{f >= F(at) + 6 ? title.split("\n").map((ln, i) => <div key={i}><TypeIn at={F(at) + 6 + i * 8} step={2}>{ln}</TypeIn></div>) : null}</div>
      {sub ? <At at={at + 0.6} x={150} y={990}><span style={{ ...K, fontSize: 40, color: SUB }}>{sub}</span></At> : null}
      <div style={{ position: "absolute", left: 150, top: 1100, height: 6, width: 780 * interpolate(d, [4, 18], [0, 1], { ...clamp, easing: OUT }), background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
    </>
  );
};

// ── 資産の割合のバー（横1本・10マス） ──
type Mix = [number, number, number];
const mixAt = (t: number): Mix => (t >= 10.42 ? [5, 3, 2] : t >= 5.9 ? [8, 1, 1] : t >= 5.14 ? [7, 2, 1] : [6, 2, 2]);
const MixBar: React.FC<{ y: number; at: number; crash?: [number, number] }> = ({ y, at, crash }) => {
  const f = useCurrentFrame();
  const t = f / 30, d = f - F(at);
  if (d < 0) return null;
  const m = mixAt(t);
  const inCrash = crash && t >= crash[0] && t < crash[1];
  return (
    <div style={{ position: "absolute", left: 150, top: y, width: 780 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const c = i < m[0] ? STOCK : i < m[0] + m[1] ? BOND : CASH;
          const isS = c === STOCK;
          const k = interpolate(d - i * 1.2, [0, 5], [0, 1], { ...clamp, easing: OUT });
          const sink = inCrash && isS ? interpolate(f - F(crash![0]) - i, [0, 8], [0, 70], { ...clamp, easing: Easing.in(Easing.quad) }) : 0;
          const sh = inCrash && isS ? Math.sin(f * 1.7 + i) * 5 : 0;
          const col = inCrash && isS ? DANGER : c;
          return <div key={i} style={{ flex: 1, height: 170, borderRadius: 14, background: col, boxShadow: `0 0 24px ${col}88, inset 0 -10px 0 rgba(0,0,0,0.18)`, transform: `translate(${sh}px, ${sink + (1 - k) * 80}px) scaleY(${k})`, opacity: k, transition: "none" }} />;
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26, ...appear(f, at + 0.5, "fade") }}>
        {([["株", STOCK, m[0]], ["債券", BOND, m[1]], ["現金その他", CASH, m[2]]] as [string, string, number][]).map(([l, c, v]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ ...K, fontSize: 30, color: SUB }}>{l}</div>
            <div style={{ ...K, fontSize: 78, color: c, filter: glow(c, 10), lineHeight: 1.1 }}>{v * 10}<span style={{ fontSize: 36 }}>%</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ════════ 場面 ════════
const S1: React.FC = () => <Reason at={0} n="01" title="資産分散" />;
const S2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Big at={1.2} y={300} size={58}>これからも<Hi>積み立て</Hi>を続ける</Big>
      <At at={1.6} x={390} y={420}><Disc n="nb_phone_invest" s={300} c={STOCK} /></At>
      <At at={4.0} x={150} y={420} w={780} kind="fade"><div /></At>
      <MixBar y={760} at={3.2} />
      {f >= F(4.4) ? <Big at={4.4} y={1110} size={50}><Hi c={STOCK}>株の割合</Hi>がどんどん増える</Big> : null}
    </>
  );
};
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const d = f - F(7.5);
  const sh = d >= F(8.46) - F(7.5) && d < F(9.4) - F(7.5) ? Math.sin(f * 2.3) * 14 : 0;
  const gl = f >= F(8.46) && f < F(8.46) + 10;
  return (
    <AbsoluteFill style={{ transform: `translate(${sh}px, ${sh * 0.4}px)` }}>
      {f >= F(8.46) ? <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${DANGER}33 0, transparent 60%)` }} /> : null}
      <Big at={7.5} y={300} size={58}>株に偏るほど…</Big>
      <MixBar y={460} at={7.5} crash={[8.46, 10.42]} />
      {f >= F(8.5) ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 790, textAlign: "center", ...appear(f, 8.5, "slam") }}>
          {gl ? <span style={{ position: "absolute", left: 0, right: 0, ...K, fontSize: 230, color: "#00E5FF", opacity: 0.6, transform: "translate(-10px, 4px)" }}>暴落</span> : null}
          <span style={{ position: "relative", ...K, fontSize: 230, color: DANGER, filter: glow(DANGER, 26) }}>暴落</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
const S4: React.FC = () => (
  <>
    <MixBar y={460} at={10.42} />
    <At at={10.6} x={150} y={850} w={780} center kind="slam"><span style={{ display: "inline-block", border: `6px solid ${GOLD}`, borderRadius: 18, padding: "6px 40px", ...K, fontSize: 86, color: GOLD, filter: glow(GOLD, 14), transform: "rotate(-3deg)" }}>資産を分散</span></At>
  </>
);
const S5: React.FC = () => <Reason at={11.8} n="02" title="今の高金利" />;
// 米国10年債
const GX = 150, GY = 470, GW = 780, GH = 560, YMAX = 7;
const gx = (i: number) => GX + (i / (UST10Y.length - 1)) * GW, gy = (v: number) => GY + GH - (v / YMAX) * GH;
const iLow = UST10Y.indexOf(Math.min(...UST10Y)), iEnd = UST10Y.length - 1;
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const L = interpolate(f, [F(13.6), F(15.6)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const n = Math.max(2, Math.round(L * UST10Y.length));
  const pts = UST10Y.slice(0, n).map((v, i) => `${gx(i)},${gy(v)}`).join(" ");
  return (
    <>
      <Big at={13.4} y={300} size={58}>債券の金利は<Hi c={BOND}>日々変わる</Hi></Big>
      <div style={{ position: "absolute", left: GX, top: GY - 50, ...appear(f, 13.5, "fade") }}><Label>US 10Y TREASURY</Label></div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 2, 4, 6].map((v) => <g key={v}><line x1={GX} y1={gy(v)} x2={GX + GW} y2={gy(v)} stroke="rgba(255,255,255,0.08)" strokeWidth={2} /><text x={GX + GW} y={gy(v) - 8} textAnchor="end" fontSize={24} fill={SUB} fontFamily="monospace">{v}%</text></g>)}
        {[2000, 2010, 2020].map((y) => <text key={y} x={gx((y - 2000) * 12)} y={GY + GH + 40} textAnchor="middle" fontSize={24} fill={SUB} fontFamily="monospace">{y}</text>)}
        <polygon points={`${GX},${GY + GH} ${pts} ${gx(n - 1)},${GY + GH}`} fill="url(#ar)" />
        <defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={BOND} stopOpacity={0.35} /><stop offset="1" stopColor={BOND} stopOpacity={0} /></linearGradient></defs>
        <polyline points={pts} fill="none" stroke={BOND} strokeWidth={6} strokeLinejoin="round" style={{ filter: glow(BOND, 12) }} />
        {n > 2 && n < UST10Y.length ? <circle cx={gx(n - 1)} cy={gy(UST10Y[n - 1])} r={10} fill="#fff" /> : null}
      </svg>
      <Focus at={16.6} until={17.9} x={gx(iLow)} y={gy(UST10Y[iLow])} r={90} c={BOND} />
      <At at={16.8} until={17.9} x={gx(iLow) - 130} y={gy(UST10Y[iLow]) + 100} kind="pop"><div style={{ ...K, fontSize: 40, color: TXT, background: PANEL, border: `3px solid ${BOND}`, borderRadius: 14, padding: "4px 20px" }}>2020年 <span style={{ color: BOND }}>0.52%</span></div></At>
      <Focus at={18.0} until={20.5} x={gx(iEnd)} y={gy(UST10Y[iEnd])} r={110} c={GOLD} />
      <At at={18.14} x={360} y={gy(UST10Y[iEnd]) - 190} kind="slam"><div style={{ ...K, fontSize: 150, color: GOLD, filter: glow(GOLD, 24), lineHeight: 1 }}>約5%<span style={{ fontSize: 44, color: TXT }}> 今</span></div></At>
    </>
  );
};
const S7: React.FC = () => (
  <>
    <Big at={20.5} y={340} size={50}>高い時もあれば、低い時もある</Big>
    <At at={20.6} x={150} y={560} w={780} center kind="slam"><span style={{ display: "inline-block", border: `8px solid ${DANGER}`, borderRadius: 22, padding: "10px 46px", ...K, fontSize: 130, color: DANGER, filter: glow(DANGER, 18), transform: "rotate(-5deg)" }}>期間限定</span></At>
    <Big at={21.88} y={880} size={72}>高金利の<Hi>今</Hi>、債券へ</Big>
  </>
);
const S8: React.FC = () => <Reason at={24.42} n="03" title={"将来のお金を\n見える化"} />;
const S9: React.FC = () => {
  const f = useCurrentFrame();
  const h1 = interpolate(f, [F(28.0), F(28.0) + 12], [0, 330], { ...clamp, easing: OUT });
  const h2 = interpolate(f, [F(30.6), F(30.6) + 12], [0, 220], { ...clamp, easing: OUT });
  return (
    <>
      <div style={{ position: "absolute", left: 180, top: 1080 - h1 - h2 - 8, width: 260, height: h2, borderRadius: 16, background: "#3D86E6", boxShadow: `0 0 30px ${BOND}88`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 44, color: "#fff", overflow: "hidden" }}>+200万</div>
      <div style={{ position: "absolute", left: 180, top: 1080 - h1, width: 260, height: h1, borderRadius: 16, background: BOND, boxShadow: `0 0 30px ${BOND}88`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 44, color: "#fff", overflow: "hidden" }}>300万</div>
      <div style={{ position: "absolute", left: 150, top: 1084, width: 340, height: 5, background: "rgba(255,255,255,0.3)" }} />
      <At at={32.22} x={480} y={560}><Label c={SUB}>TOTAL</Label></At>
      <At at={32.3} x={470} y={600} kind="slam"><div style={{ ...K, fontSize: 200, lineHeight: 1, color: BOND, filter: glow(BOND, 22) }}><Count at={32.4} to={500} dur={14} /><span style={{ fontSize: 60, color: TXT }}>万円</span></div></At>
      <At at={33.84} x={490} y={830} kind="pop"><div style={{ ...K, fontSize: 46, color: BG, background: GOLD, borderRadius: 999, padding: "8px 30px", boxShadow: `0 0 26px ${GOLD}` }}>5%超の水準で運用</div></At>
      <At at={33.4} x={150} y={1130} kind="fade"><span style={{ ...K, fontSize: 24, color: SUB }}>※ドル建て・満期まで持った場合。円での金額は為替で変わります</span></At>
    </>
  );
};
// 16年後・30年後（横の時間軸＋光る柱）
const S10: React.FC = () => {
  const f = useCurrentFrame();
  const BASE = 1040;
  const cols: [number, number, string, string, number, string, string][] = [
    [215, 90, "今", "子ども2歳と0歳", 36.4, "nb_kid_toddler", ""],
    [455, 200, "16年後", "18歳・大学", 38.1, "nb_kid_student", "1091"],
    [695, 400, "30年後", "老後", 39.74, "nb_elderly_couple", "2161"],
  ];
  return (
    <>
      <Big at={36.2} y={300} size={56}>何年後に<Hi>いくら</Hi>になるか</Big>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><line x1={150} y1={BASE} x2={150 + 780 * interpolate(f, [F(36.3), F(36.3) + 14], [0, 1], { ...clamp, easing: OUT })} y2={BASE} stroke="rgba(255,255,255,0.4)" strokeWidth={4} /></svg>
      {cols.map(([x, h, top, sub, at, img, v], i) => {
        const g = interpolate(f, [F(at), F(at) + (i === 2 ? 26 : 14)], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.2)) });
        if (f < F(at)) return null;
        const H = 90 + (h - 90) * g;
        const c = i === 2 ? GOLD : BOND;
        return (
          <React.Fragment key={top}>
            <div style={{ position: "absolute", left: x, top: BASE - H, width: 170, height: H, borderRadius: "14px 14px 0 0", background: `linear-gradient(${c}, ${c}66)`, boxShadow: `0 0 30px ${c}77` }} />
            <div style={{ position: "absolute", left: x - 40, width: 250, top: BASE - H - 70, textAlign: "center", ...K, fontSize: i === 2 ? 58 : 48, color: c, filter: glow(c, 10), whiteSpace: "nowrap" }}>{v ? <><span style={{ fontSize: 26, color: TXT }}>約</span><Count at={at + 0.3} from={500} to={Number(v)} dur={i === 2 ? 22 : 16} /><span style={{ fontSize: 26, color: TXT }}>万円</span></> : <>500<span style={{ fontSize: 26, color: TXT }}>万円</span></>}</div>
            <div style={{ position: "absolute", left: x + 20, top: BASE - h - 210, ...appear(f, at + 0.2, "pop") }}><Disc n={img} s={130} c={c} /></div>
            <div style={{ position: "absolute", left: x - 40, width: 250, top: BASE + 16, textAlign: "center", ...appear(f, at, "up") }}><div style={{ ...K, fontSize: 36, color: TXT }}>{top}</div><div style={{ ...K, fontSize: 24, color: SUB }}>{sub}</div></div>
          </React.Fragment>
        );
      })}
      <At at={42.7} x={240} y={1150} kind="pop"><span style={{ ...K, fontSize: 36, color: BG, background: BOND, borderRadius: 999, padding: "6px 26px" }}>教育資金</span></At>
      <At at={43.78} x={560} y={1150} kind="pop"><span style={{ ...K, fontSize: 36, color: BG, background: GOLD, borderRadius: 999, padding: "6px 26px" }}>老後資金</span></At>
    </>
  );
};
// 暴落していたら（左：株が落ちる／右：債券から使う）
const S11: React.FC = () => {
  const f = useCurrentFrame();
  const cr = interpolate(f, [F(47.5), F(47.5) + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const card = (x: number, c: string, title: string, inner: React.ReactNode, at: number, dim: boolean) => (
    <div style={{ position: "absolute", left: x, top: 520, width: 370, height: 420, borderRadius: 26, background: PANEL, border: `3px solid ${c}`, boxShadow: `0 0 30px ${c}55`, opacity: dim ? 0.35 : 1, ...appear(f, at, "up") }}>
      <div style={{ position: "absolute", left: 26, top: 18, ...K, fontSize: 44, color: c }}>{title}</div>{inner}
    </div>
  );
  const bondOn = f >= F(49.66);
  return (
    <>
      <Big at={45.0} y={300} size={54}>もし<Hi>教育費が必要な時</Hi>に</Big>
      {f >= F(47.0) ? <Big at={47.0} y={390} size={54}>株が<Hi c={DANGER}>暴落</Hi>していたら？</Big> : null}
      {card(150, cr > 0 ? DANGER : STOCK, "株", <svg width={370} height={420} style={{ position: "absolute", left: 0, top: 0 }}><polyline points={`30,330 100,270 170,290 240,200 ${240 + 100 * cr},${200 + 170 * cr}`} fill="none" stroke={cr > 0 ? DANGER : STOCK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" style={{ filter: glow(cr > 0 ? DANGER : STOCK, 10) }} /></svg>, 45.3, bondOn)}
      {card(560, BOND, "債券", <div style={{ position: "absolute", left: 95, top: 110 }}><Disc n="nb_bond_box" s={190} c={BOND} /></div>, 45.5, false)}
      <At at={48.66} until={49.6} x={150} y={960} w={370} center kind="slam"><span style={{ ...K, fontSize: 48, color: DANGER }}>無理に売らない</span></At>
      {bondOn ? <div style={{ position: "absolute", left: 560, top: 520, width: 370, height: 420, borderRadius: 26, boxShadow: `0 0 0 8px ${GOLD}, 0 0 50px ${GOLD}`, opacity: 0.5 + 0.5 * Math.abs(Math.sin(f / 6)) }} /> : null}
      <At at={50.4} x={650} y={960} kind="up"><Disc n="nb_envelope_money" s={180} c={GOLD} /></At>
      <At at={50.6} x={150} y={1010} kind="pop"><span style={{ ...K, fontSize: 44, color: BG, background: GOLD, borderRadius: 999, padding: "8px 30px", boxShadow: `0 0 26px ${GOLD}` }}>債券側から使う</span></At>
    </>
  );
};
const S12: React.FC = () => <Reason at={52.3} n="04" title={"株と債券を\n両方持つ理由"} />;
const S13: React.FC = () => {
  const f = useCurrentFrame();
  const fan = interpolate(f, [F(54.0), F(56.0)], [0, 1], { ...clamp, easing: OUT });
  const line = interpolate(f, [F(59.5), F(61.3)], [0, 1], { ...clamp, easing: OUT });
  return (
    <>
      {/* 左：株＝点線がばらける（シミュレーション） */}
      <div style={{ position: "absolute", left: 150, top: 330, ...appear(f, 53.8, "fade") }}><Label c={STOCK}>STOCK</Label></div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {[-200, -110, -30, 50, 130].map((e, i) => <line key={i} x1={170} y1={560} x2={170 + 740 * fan} y2={560 + (e - 20) * fan} stroke={STOCK} strokeWidth={5} strokeDasharray="14 12" opacity={0.85} style={{ filter: glow(STOCK, 8) }} />)}
        <circle cx={170} cy={560} r={12} fill={STOCK} />
        {/* 右：債券＝満期まで1本 */}
        {f >= F(58.3) ? <><line x1={170} y1={1000} x2={170 + 720 * line} y2={1000 - 160 * line} stroke={BOND} strokeWidth={10} strokeLinecap="round" style={{ filter: glow(BOND, 14) }} /><circle cx={170} cy={1000} r={12} fill={BOND} />{line > 0.97 ? <circle cx={890} cy={840} r={22} fill={GOLD} style={{ filter: glow(GOLD, 16) }} /> : null}</> : null}
      </svg>
      <At at={57.16} x={420} y={430} kind="slam"><span style={{ display: "inline-block", border: `5px solid ${STOCK}`, borderRadius: 14, padding: "2px 24px", ...K, fontSize: 52, color: STOCK, transform: "rotate(-4deg)" }}>シミュレーション</span></At>
      <div style={{ position: "absolute", left: 150, top: 770, ...appear(f, 58.3, "fade") }}><Label c={BOND}>BOND</Label></div>
      <At at={59.5} x={810} y={760} kind="pop"><span style={{ ...K, fontSize: 32, color: GOLD }}>満期</span></At>
      <At at={63.14} x={430} y={1040} kind="slam"><span style={{ display: "inline-block", border: `5px solid ${BOND}`, borderRadius: 14, padding: "2px 24px", ...K, fontSize: 52, color: BOND, transform: "rotate(-4deg)" }}>計画が立てやすい</span></At>
      <At at={60.0} x={150} y={1150} kind="fade"><span style={{ ...K, fontSize: 22, color: SUB }}>※ドル建て・満期まで持った場合。円での金額は為替で変わります</span></At>
    </>
  );
};
// まとめ：4つが光って並ぶ
const S14: React.FC = () => {
  const f = useCurrentFrame();
  const items: [string, string, number][] = [["01", "資産分散", 66.4], ["02", "今の高金利", 68.24], ["03", "将来の見える化", 68.9], ["04", "株と債券を両方", 70.0]];
  return (
    <>
      <Big at={65.2} y={300} size={60}>まとめると</Big>
      {items.map(([n, t, at], i) => {
        const on = f >= F(at);
        return (
          <div key={n} style={{ position: "absolute", left: 150, top: 450 + i * 170, width: 780, height: 140, borderRadius: 24, background: PANEL, border: `3px solid ${on ? GOLD : "rgba(255,255,255,0.12)"}`, boxShadow: on ? `0 0 30px ${GOLD}66` : "none", display: "flex", alignItems: "center", gap: 30, padding: "0 34px", boxSizing: "border-box", ...appear(f, 65.3 + i * 0.12, "up") }}>
            <span style={{ fontFamily: MONO, fontSize: 40, color: on ? GOLD : SUB }}>{n}</span>
            <span style={{ ...K, fontSize: 52, color: on ? TXT : SUB }}>{t}</span>
            <span style={{ marginLeft: "auto", width: 66, height: 66, borderRadius: "50%", background: on ? GOLD : "transparent", border: `3px solid ${on ? GOLD : SUB}`, color: BG, ...K, fontSize: 40, textAlign: "center", lineHeight: "62px", transform: `scale(${on ? interpolate(f - F(at), [0, 4, 7], [0.4, 1.2, 1], clamp) : 1})` }}>{on ? "✓" : ""}</span>
          </div>
        );
      })}
    </>
  );
};
const S15: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Big at={70.72} y={300} size={64}><Hi c={STOCK}>株</Hi>と<Hi c={BOND}>債券</Hi>、両方を持つと</Big>
      <At at={71.0} x={290} y={420} kind="pop"><Disc n="nb_family" s={500} c={GOLD} /></At>
      {f >= F(72.94) ? <Big at={72.94} y={930} size={54}><Hi>将来のお金</Hi>も</Big> : null}
      {f >= F(73.9) ? <Big at={73.9} y={1010} size={54}><Hi>今使っていいお金</Hi>も</Big> : null}
    </>
  );
};

// 太一：気持ちが動く所だけ右下から。締めは口が動いて話す
const APPEAR: [number, number, string][] = [[7.5, 10.4, "taichi_scared"], [20.6, 24.2, "taichi_thumbs_up"], [45.26, 49.6, "taichi_worry"], [49.66, 52.05, "taichi_idea"], [71.0, 76.9, "__talk"]];
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  const a = APPEAR.find(([s0, e]) => f >= F(s0) - 2 && f < F(e) + 8);
  if (!a) return null;
  const [s0, e, name] = a;
  const inP = interpolate(f, [F(s0) - 2, F(s0) + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const outP = interpolate(f, [F(e), F(e) + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  let img = name;
  if (name === "__talk") {
    const lv = NB_MOUTH.charCodeAt(Math.min(NB_MOUTH.length - 1, f)) - 48;
    img = f % 84 >= 80 && lv === 0 ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 2) % 3 === 0 ? "taichi_talk_mid" : "taichi_talk_open") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  }
  const S = name === "__talk" ? 260 : 210;
  return (
    <div style={{ position: "absolute", left: 690 + (1 - inP) * 420 + outP * 420, top: 1120 - (S - 210) + Math.sin(f / 10) * 3, width: S, height: S }}>
      <div style={{ position: "absolute", inset: 20, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}44 0, transparent 65%)` }} />
      <GenSlot name={img} size={S} />
    </div>
  );
};

const CUES: { file: string; at: number; volume: number }[] = [
  ...[0, 11.8, 24.42, 52.3].map((t) => ({ file: "user/u03", at: F(t), volume: 0.26 })),
  ...[1.2, 7.5, 10.42, 13.4, 20.5, 27.9, 36.2, 45.0, 53.8, 65.2, 70.72].map((t) => ({ file: "user/u03s", at: F(t), volume: 0.22 })),
  ...[3.2, 5.14, 5.9].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })),
  { file: "user/u04", at: F(8.5), volume: 0.3 }, { file: "user/u05", at: F(10.6), volume: 0.28 },
  { file: "user/u05s", at: F(16.6), volume: 0.22 }, { file: "user/u05", at: F(18.14), volume: 0.28 }, { file: "user/u04", at: F(20.6), volume: 0.28 },
  ...[28.0, 30.6].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })), { file: "user/u05", at: F(32.3), volume: 0.28 }, { file: "user/u02s", at: F(33.84), volume: 0.2 },
  ...[38.4, 40.0].map((t) => ({ file: "user/u05s", at: F(t), volume: 0.22 })), ...[42.7, 43.78].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })),
  { file: "user/u04", at: F(47.5), volume: 0.26 }, { file: "user/u05s", at: F(49.66), volume: 0.22 }, { file: "user/u02s", at: F(50.6), volume: 0.2 },
  { file: "user/u04", at: F(57.16), volume: 0.26 }, { file: "user/u04", at: F(63.14), volume: 0.26 },
  ...[66.4, 68.24, 68.9, 70.0].map((t) => ({ file: "user/u05s", at: F(t), volume: 0.2 })), { file: "user/u10", at: F(75.16), volume: 0.28 },
];

const SHOTS: [number, number, React.FC][] = [
  [0, 1.2, S1], [1.2, 7.5, S2], [7.5, 10.42, S3], [10.42, 11.8, S4], [11.8, 13.4, S5], [13.4, 20.5, S6], [20.5, 24.42, S7],
  [24.42, 27.9, S8], [27.9, 36.2, S9], [36.2, 45.0, S10], [45.0, 52.3, S11], [52.3, 53.8, S12], [53.8, 65.2, S13], [65.2, 70.72, S14], [70.72, 77, S15],
];
export const NISABOND_NIGHT_FRAMES = F(76.9);
export const NisaBondNight: React.FC = () => (
  <AbsoluteFill style={{ background: BG, fontFamily: FONT }}>
    <Audio src={staticFile("nisabond-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Night />
    {SHOTS.map(([a, b, C]) => <Shot key={a} a={a} b={b}><C /></Shot>)}
    <Chara />
    <Captions subs={SUBS} end={76.4} maxW={780} size={0.86} top={1290} swap kcol={{ "": TXT, g: GOLD, r: DANGER, b: BOND }} shadow="0 2px 10px rgba(0,0,0,0.9)" mark="rgba(245,184,65,0.18)" />
  </AbsoluteFill>
);
