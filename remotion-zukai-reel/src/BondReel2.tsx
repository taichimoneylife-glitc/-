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
import { BD_LAB, BD_STOCK, BD_BOND } from "./bondData";
import { BOND_MOUTH } from "./bondMouth";
import { Ring, Ripple, HandCircle, Chain, Burst as Rays } from "./components/marke";

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
  const step = Math.floor(f / 3) * 3;
  const v = Math.round(interpolate(step, [F(at), F(at) + dur], [from, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const land = interpolate(f - F(at) - dur, [0, 2, 5], [-10, 4, 0], clamp);
  return <span style={{ display: "inline-block", transform: `translateY(${f >= F(at) + dur ? land : 0}px)` }}>{v.toLocaleString("en-US")}</span>;
};

// ── 強調の動き（山場ごとに使い分ける・放射線ばかりにしない） ──
// ひび割れ：当たった所からガラスにひびが走る
const Crack: React.FC<{ at: number; x: number; y: number; s?: number; until?: number }> = ({ at, x, y, s = 1, until = 999 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 6) return null;
  const p = interpolate(f - F(at), [0, 5], [0, 1], { ...clamp, easing: OUTE });
  const o = 1 - interpolate(f, [F(until), F(until) + 6], [0, 1], clamp);
  const P = ["M0 0 L60 -40 L95 -38 L150 -95", "M0 0 L-55 -30 L-80 -75 L-140 -90", "M0 0 L-40 50 L-95 70 L-120 130", "M0 0 L50 45 L70 110 L130 150", "M60 -40 L80 0 L130 10", "M-55 -30 L-100 0"];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: o, pointerEvents: "none" }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {P.map((d, i) => <path key={i} d={d} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />)}
        <circle r={10 * p} fill={INK} />
      </g>
    </svg>
  );
};
// 四すみのカギで寄る（画面の角から集まって止まる＋倍率）
const Corners: React.FC<{ at: number; until?: number; x: number; y: number; w: number; h: number; c?: string; zoom?: string }> = ({ at, until = 999, x, y, w, h, c = RED, zoom }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 5) return null;
  const p = interpolate(f - F(at), [0, 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const o = 1 - interpolate(f, [F(until), F(until) + 5], [0, 1], clamp);
  const L = 54;
  const box = { x0: x + (0 - x) * (1 - p), y0: y + (300 - y) * (1 - p), x1: x + w + (1080 - x - w) * (1 - p), y1: y + h + (1500 - y - h) * (1 - p) };
  const k = (cx: number, cy: number, dx: number, dy: number) => <path d={`M${cx} ${cy + dy * L} L${cx} ${cy} L${cx + dx * L} ${cy}`} fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {k(box.x0, box.y0, 1, 1)}{k(box.x1, box.y0, -1, 1)}{k(box.x0, box.y1, 1, -1)}{k(box.x1, box.y1, -1, -1)}
      </svg>
      {zoom && p > 0.9 ? <div style={{ position: "absolute", left: box.x1 - 110, top: box.y1 + 10, background: c, color: "#fff", ...K, fontSize: 26, borderRadius: 8, padding: "0 10px" }}>{zoom}</div> : null}
    </div>
  );
};
// パタッと返る札（縦に回って止まる）
const Flip: React.FC<{ at: number; x: number; y: number; children: React.ReactNode }> = ({ at, x, y, children }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const r = interpolate(f - F(at), [0, 6, 9, 12], [-95, 12, -5, 0], clamp);
  return <div style={{ position: "absolute", left: x, top: y, perspective: 900 }}><div style={{ transform: `rotateX(${r}deg)`, transformOrigin: "50% 0%" }}>{children}</div></div>;
};
// 数えるハンコ（1・2・3…と順に押される）
const CountBadge: React.FC<{ at: number; x: number; y: number; n: number; until?: number }> = ({ at, x, y, n, until = 999 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 5) return null;
  const k = interpolate(f - F(at), [0, 3, 6], [2.2, 0.85, 1], clamp);
  const o = interpolate(f - F(at), [0, 2], [0, 1], clamp) * (1 - interpolate(f, [F(until), F(until) + 5], [0, 1], clamp));
  return <div style={{ position: "absolute", left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: "50%", background: RED, border: "4px solid #fff", boxShadow: `0 0 0 4px ${RED}`, color: "#fff", ...K, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k}) rotate(${(1 - Math.min(1, k)) * 40}deg)`, opacity: o }}>{n}</div>;
};
// 円グラフが埋まっていく（数字は段で増える）
const Donut: React.FC<{ at: number; x: number; y: number; r: number; v: number; c: string; label: string }> = ({ at, x, y, r, v, c, label }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const fs = Math.floor(f / 3) * 3;
  const p = interpolate(fs, [F(at), F(at) + 18], [0, v], { ...clamp, easing: Easing.out(Easing.cubic) });
  const k = interpolate(f - F(at), [0, 4, 8], [0.4, 1.08, 1], clamp);
  const C = 2 * Math.PI * r;
  return (
    <div style={{ position: "absolute", left: x - r - 20, top: y - r - 20, width: 2 * r + 40, height: 2 * r + 40, transform: `scale(${k})` }}>
      <svg width={2 * r + 40} height={2 * r + 40}>
        <circle cx={r + 20} cy={r + 20} r={r} fill="#fff" stroke={RED} strokeWidth={34} />
        <circle cx={r + 20} cy={r + 20} r={r} fill="none" stroke={c} strokeWidth={34} strokeDasharray={`${C * p} ${C}`} transform={`rotate(-90 ${r + 20} ${r + 20})`} />
        <circle cx={r + 20} cy={r + 20} r={r + 19} fill="none" stroke={INK} strokeWidth={4} />
        <circle cx={r + 20} cy={r + 20} r={r - 19} fill="none" stroke={INK} strokeWidth={4} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...SER, fontSize: 44, color: c }}>{Math.round(p * 100)}<span style={{ ...K, fontSize: 22 }}>%</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 2 * r + 40, textAlign: "center", ...K, fontSize: 22, color: SUB, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
};

// ════════ p1 暴落でいくら減る？（0–17.24） ════════
// 株のタンク：水面がゆれる・下に蛇口
const TK = { x: 80, y: 520, w: 440, h: 660 };
const StockTank: React.FC<{ level: number; red: boolean; tap: number; shake: number }> = ({ level, red, tap, shake }) => {
  const f = useCurrentFrame();
  const H = TK.h - 40, hh = H * level;
  const top = TK.h - 20 - hh;
  const wave = Array.from({ length: 21 }).map((_, i) => `${20 + i * ((TK.w - 40) / 20)},${top + Math.sin(i * 0.9 + f / 4) * (6 + (red ? 6 : 0))}`).join(" ");
  const c1 = red ? RED : STK;
  return (
    <div style={{ position: "absolute", left: TK.x + shake, top: TK.y, width: TK.w, height: TK.h }}>
      <svg width={TK.w + 120} height={TK.h + 160} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <rect x={6} y={6} width={TK.w - 12} height={TK.h - 12} rx={30} fill="#fff" stroke={INK} strokeWidth={6} />
        {hh > 2 ? <polygon points={`20,${TK.h - 20} ${wave} ${TK.w - 20},${TK.h - 20}`} fill={c1} opacity={0.92} /> : null}
        {red ? <rect x={20} y={TK.h - 20 - H} width={TK.w - 40} height={H * (1 - 0.634) - 2} fill="none" stroke={RED} strokeWidth={4} strokeDasharray="14 10" opacity={0.7} /> : null}
        {[0.25, 0.5, 0.75].map((k) => <line key={k} x1={TK.w - 50} x2={TK.w - 20} y1={TK.h - 20 - H * k} y2={TK.h - 20 - H * k} stroke={INK} strokeWidth={3} opacity={0.4} />)}
        {/* 蛇口 */}
        <rect x={TK.w - 8} y={TK.h - 110} width={70} height={34} rx={8} fill={INK} />
        <rect x={TK.w + 40} y={TK.h - 110} width={30} height={64} rx={6} fill={INK} />
        <rect x={TK.w + 20} y={TK.h - 136} width={70} height={18} rx={6} fill={tap > 0 ? RED : SUB} transform={`rotate(${tap * 70} ${TK.w + 55} ${TK.h - 127})`} />
        {tap > 0 ? Array.from({ length: 6 }).map((_, i) => { const d = ((f * 6 + i * 40) % 240); return <circle key={i} cx={TK.w + 55} cy={TK.h - 40 + d} r={12} fill={c1} opacity={tap * (1 - d / 240)} />; }) : null}
      </svg>
      <div style={{ position: "absolute", left: 30, top: 22, ...K, fontSize: 56, color: "#fff", WebkitTextStroke: `3px ${INK}`, paintOrder: "stroke" }}>株</div>
    </div>
  );
};
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const fill = interpolate(f, [F(0.3), F(1.8)], [0, 1], { ...clamp, easing: OUTE });
  const crash = interpolate(f, [F(6.42), F(9.72)], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const level = fill * (1 - 0.366 * crash);
  const red = crash > 0.02;
  const shake = f > F(5.16) && f < F(9.6) ? Math.sin(f * 2.3) * (f < F(6.42) ? 4 : 9) : 0;
  const tap = interpolate(f, [F(15.34), F(15.34) + 8], [0, 1], clamp);
  const fs = Math.floor(f / 3) * 3;
  const fillS = interpolate(fs, [F(0.3), F(1.8)], [0, 1], { ...clamp, easing: OUTE });
  const crashS = interpolate(fs, [F(6.42), F(9.72)], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const card = Math.round(500 * fillS - 183 * crashS);
  return (
    <>
      <Head at={0} tag="例えば" title={<>教育資金を<span style={{ color: STK }}>株で500万円</span></>} />
      <StockTank level={level} red={red} tap={tap} shake={shake} />
      <Crack at={9.72} until={15.2} x={300} y={760} s={1.3} />
      {/* 白いカード：数字が段で動く */}
      <At at={0.4} x={110} y={410} mode="pop"><div style={{ background: "#fff", border: `6px solid ${red ? RED : STK}`, borderRadius: 20, padding: "0 26px", boxShadow: `6px 8px 0 ${INK}`, whiteSpace: "nowrap" }}><span style={{ ...SER, fontSize: 80, color: red ? RED : STK }}>{card}</span><span style={{ ...K, fontSize: 34 }}>万円</span></div></At>
      {/* 現金（生活費） */}
      <div style={{ position: "absolute", left: 640, top: 960, width: 360, height: 220, background: "#fff", border: `5px solid ${INK}`, borderRadius: 24, boxShadow: `7px 9px 0 ${INK}`, ...swoop(f, 3.2, 1) }}>
        <div style={{ position: "absolute", left: 22, top: 12, ...K, fontSize: 38, color: CASH }}>現金</div>
        <div style={{ position: "absolute", left: 24, top: 66, ...B, fontSize: 26, color: SUB }}>生活費だけ</div>
        <div style={{ position: "absolute", left: 170, bottom: 20, width: 160, height: 110 + Math.sin(f / 9) * 3, borderRadius: 12, background: CASH }} />
      </div>
      <At at={3.6} until={5.0} x={640} y={880} mode="drop"><Tag c={CASH} size={30}>教育資金には使えない</Tag></At>
      {/* リーマンショック＋スマホで驚く夫婦 */}
      <At at={5.16} until={12.4} x={590} y={420} mode="slam"><Stamp size={50}>リーマンショック</Stamp></At>
      <At at={5.3} until={12.4} x={630} y={510} mode="spring"><Img2 n="bk_parent_phone_shock" s={300} /></At>
      <Ripple at={5.3} x={780} y={660} c={RED} />
      <At at={6.42} until={12.4} x={580} y={790} mode="slam"><span style={{ ...SER, fontSize: 130, color: RED, textShadow: "4px 4px 0 #fff" }}>−37<span style={{ fontSize: 64 }}>%</span></span></At>
      {/* 317 */}
      <Spot at={9.72} until={12.4} rect={[90, 395, 400, 130]} r={22} color={RED} />
      <Ring at={9.8} until={12.4} x={290} y={460} r={110} c={RED} />
      <Chain at={10.1} x={300} y0={1190} y1={1210} until={12.4}><div style={{ transform: "translateX(-150px)" }}><Tag c={RED} size={34}>1年で 約183万円 減った</Tag></div></Chain>
      {/* 入学金・授業料は待ってくれない */}
      <At at={12.58} until={15.2} x={600} y={430} mode="slam"><Img2 n="bk_calendar_due" s={230} /></At>
      <Ring at={12.9} until={15.2} x={720} y={560} r={44} c={RED} w={7} />
      <At at={12.9} until={15.2} x={730} y={600} mode="spring"><Img2 n="bk_parent_bill" s={280} /></At>
      <At at={13.3} until={15.2} x={560} y={885} mode="drop"><Pill c={INK} size={28}>入学金・授業料は 待ってくれない</Pill></At>
      {/* 下がったところで売る */}
      <At at={15.34} x={640} y={560} mode="slam"><Img2 n="bk_sell_low" s={330} /></At>
      <At at={15.4} x={560} y={1140} mode="drop"><Tag c={RED} size={30}>317万円のまま 取り崩す</Tag></At>
      <At at={15.6} x={60} y={1215} mode="slam"><Big bg="#fff" fg={RED} size={46}>下がったところで 売るしかない</Big></At>
      <Foot at={9.72} y={1320}>※米国株S&P500・配当込み、2008年の年間リターン（−36.55%）で計算</Foot>
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
const TY = 520, RH = 80, TW = 980, TX = 50;
const COLX = TX + TW * (4 / 5.25), COLW = TW * (1.25 / 5.25);
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const red = f >= F(26.48);
  const intro = f < F(20.0);
  const sand = interpolate(f, [F(18.6), F(20.0)], [0, 180], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <>
      <Head at={17.24} tag="落とし穴" title={<>戻るまで <span style={{ color: RED }}>何年も</span></>} />
      {/* 導入：谷から山の旗を見上げる */}
      {f < F(20.4) ? (
        <div style={{ opacity: 1 - interpolate(f, [F(20.0), F(20.4)], [0, 1], clamp) }}>
          <At at={17.4} x={110} y={470} mode="slam"><Img2 n="bk_mountain_climb" s={620} /></At>
          <At at={18.1} x={640} y={470} mode="drop"><Tag c={INK} size={30}>元の値段（最高値）</Tag></At>
          <At at={18.3} x={140} y={1010} mode="drop"><Tag c={RED} size={30}>暴落した 今ここ</Tag></At>
          <At at={18.6} x={780} y={760} mode="spring"><div style={{ transform: `rotate(${sand}deg)` }}><Img2 n="bk_hourglass_long" s={220} /></div></At>
          <At at={18.8} x={140} y={1110} mode="slam"><Big bg="#fff" fg={RED} size={44}>登り直すのに 何年も</Big></At>
        </div>
      ) : null}
      {!intro ? (
        <div style={{ position: "absolute", left: TX, top: TY, width: TW, background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, boxShadow: `8px 10px 0 ${INK}`, overflow: "hidden", ...swoop(f, 20.0, 1) }}>
          <div style={{ display: "flex", background: INK, color: "#fff", ...K, fontSize: 27, height: 60, alignItems: "center" }}>
            {["暴落", "下がった幅", "下がった期間", "最高値に戻るまで"].map((h, i) => <div key={h} style={{ flex: i ? (i === 3 ? 1.25 : 1) : 2, padding: "0 12px", textAlign: i ? "center" : "left", whiteSpace: "nowrap" }}>{h}</div>)}
          </div>
          {ROWS.map(([n, d, p, r, y, jp], i) => {
            const t = 20.14 + i * 0.22;
            const k = interpolate(f - F(t), [0, 7], [0, 1], { ...clamp, easing: OUTE });
            const over = red && !jp && y > 3;
            const live = (i === 4 && f >= F(22.62)) || (i === 3 && f >= F(24.76));
            const bw = interpolate(f - F(26.48) - i * 3, [0, 10], [0, 1], { ...clamp, easing: OUTE }) * Math.min(1, y / 10);
            return (
              <div key={n} style={{ position: "relative", display: "flex", alignItems: "center", height: RH, borderTop: jp ? `5px solid ${INK}` : "2px solid #EEE6CC", background: over ? "#FDE5E0" : jp ? "#F4EFE3" : live ? "#FFF6D8" : "#fff", opacity: k, transform: `translateX(${(1 - k) * 80}px)` }}>
                {!jp && red ? <div style={{ position: "absolute", left: COLX - TX + 8, top: 12, height: RH - 24, width: (COLW - 16) * bw, borderRadius: 8, background: y > 3 ? "rgba(232,85,59,0.35)" : "rgba(46,158,107,0.3)" }} /> : null}
                <div style={{ flex: 2, padding: "0 12px", ...K, fontSize: 30, whiteSpace: "nowrap" }}>{n}</div>
                <div style={{ flex: 1, textAlign: "center", ...B, fontSize: 31, color: RED }}>{d}</div>
                <div style={{ flex: 1, textAlign: "center", ...B, fontSize: 28 }}>{p}</div>
                <div style={{ position: "relative", flex: 1.25, textAlign: "center", ...K, fontSize: over || live ? 37 : 31, color: over ? RED : INK }}>{r}</div>
              </div>
            );
          })}
        </div>
      ) : null}
      {/* 3年の線 */}
      {red ? <div style={{ position: "absolute", left: COLX + 8 + (COLW - 16) * 0.3, top: TY + 60, width: 0, height: RH * 7 * interpolate(f - F(26.48), [0, 8], [0, 1], clamp), borderLeft: `4px dashed ${INK}` }} /> : null}
      <At at={26.6} until={29.3} x={COLX + (COLW - 16) * 0.3 - 30} y={TY + 60 + RH * 7 + 4} mode="drop"><span style={{ ...K, fontSize: 24, color: INK, background: YEL, padding: "0 10px", borderRadius: 8 }}>3年</span></At>
      <HandCircle at={23.0} until={24.6} x={COLX + COLW / 2} y={TY + 60 + RH * 4 + RH / 2} r={105} ry={46} />
      <HandCircle at={25.1} until={26.3} x={COLX + COLW / 2} y={TY + 60 + RH * 3 + RH / 2} r={105} ry={46} />
      <Spot at={26.48} until={29.3} rect={[COLX - 4, TY, COLW + 8, 60 + RH * 7]} r={14} color={RED} />
      <At at={26.9} until={29.3} x={COLX} y={TY - 58} mode="drop"><Tag c={RED} size={30}>3年より長い？</Tag></At>
      {[0, 1, 3, 4].map((r, k) => <CountBadge key={r} at={27.0 + k * 0.45} x={COLX + COLW - 34} y={TY + 60 + RH * r + RH / 2} n={k + 1} until={30.6} />)}
      <Flip at={29.42} x={60} y={1200}><Big bg={RED} fg="#fff" size={52}>7回のうち4回は 3年で戻らず</Big></Flip>
      {!intro ? <At at={20.3} x={880} y={250} mode="spring"><Img2 n="bk_hourglass_long" s={130} /></At> : null}
      <Foot at={20.14} y={1320}>※米国株S&P500は株価だけ（配当なし）。「戻る」＝暴落前の最高値に戻ること。日本は日経平均で、7回には入れていません</Foot>
    </>
  );
};

// ════════ p3 使う前の暴落でも（30.98–49.32）＝本物の折れ線 ════════
const I0 = BD_LAB.indexOf("2006-07"), IC = BD_LAB.indexOf("2007-12"), IE = BD_LAB.indexOf("2010-12"), I1 = BD_LAB.indexOf("2011-12");
const CX0 = 110, CW = 900, CY0 = 500, CH = 520, LO = 250, HI = 580;
const cx = (i: number) => CX0 + ((i - I0) / (I1 - I0)) * CW, cy = (v: number) => CY0 + CH - ((v - LO) / (HI - LO)) * CH;
const P3: React.FC = () => {
  const f = useCurrentFrame();
  const drawTo = Math.round(interpolate(f, [F(36.66), F(38.86)], [IC, IE], { ...clamp, easing: Easing.inOut(Easing.quad) }));
  const pre = Math.round(interpolate(f, [F(31.2), F(33.0)], [I0, IC], clamp));
  const ex = cx(IE), ey = cy(BD_STOCK[IE]);
  const fan = interpolate(f, [F(45.68), F(46.78) + 0.5], [0, 1], { ...clamp, easing: OUTE });
  const br = interpolate(f, [F(34.68), F(34.68) + 14], [0, 1], { ...clamp, easing: OUTE });
  const live = f >= F(36.66) && f < F(38.86);
  const dv = BD_STOCK[drawTo];
  const FY = CY0 + CH + 50;
  const flag = (i: number, at: number, img: string, label: string, c: string) => (
    <At at={at} x={cx(i) - 95} y={FY} mode="drop"><div style={{ width: 190, textAlign: "center" }}><Img2 n={img} s={170} /><div style={{ marginTop: -6 }}><Tag c={c} size={28}>{label}</Tag></div></div></At>
  );
  return (
    <>
      <Head at={30.98} tag="例えば" title={<>中3の冬に <span style={{ color: RED }}>暴落</span></>} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {[300, 400, 500].map((v) => <g key={v} opacity={interpolate(f, [F(31.0), F(31.4)], [0, 1], clamp)}><line x1={CX0} x2={CX0 + CW} y1={cy(v)} y2={cy(v)} stroke={v === 500 ? STK : "#E6DDBE"} strokeWidth={v === 500 ? 5 : 2} strokeDasharray={v === 500 ? "14 10" : undefined} /><text x={CX0 - 12} y={cy(v) + 9} textAnchor="end" fontSize={26} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{v}</text></g>)}
        {["2007", "2008", "2009", "2010", "2011"].map((y) => <text key={y} x={cx(BD_LAB.indexOf(`${y}-01`))} y={CY0 + CH + 34} textAnchor="middle" fontSize={26} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700} opacity={interpolate(f, [F(31.0), F(31.4)], [0, 1], clamp)}>{y}</text>)}
        {/* 3年の幅 */}
        {br > 0 ? <g><rect x={cx(IC)} y={CY0 - 10} width={(cx(IE) - cx(IC)) * br} height={CH + 20} rx={16} fill={YEL} opacity={0.22} /><line x1={cx(IC)} x2={cx(IC) + (cx(IE) - cx(IC)) * br} y1={CY0 + CH + 6} y2={CY0 + CH + 6} stroke={INK} strokeWidth={6} /></g> : null}
        <polyline points={BD_STOCK.slice(I0, pre + 1).map((v, k) => `${cx(I0 + k)},${cy(v)}`).join(" ")} fill="none" stroke={STK} strokeWidth={7} strokeLinejoin="round" opacity={0.6} />
        {f >= F(36.66) ? <polyline points={BD_STOCK.slice(IC, drawTo + 1).map((v, k) => `${cx(IC + k)},${cy(v)}`).join(" ")} fill="none" stroke={RED} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" /> : null}
        {f >= F(36.66) ? <circle cx={cx(drawTo)} cy={cy(dv)} r={14} fill={RED} stroke="#fff" strokeWidth={4} /> : null}
        {f >= F(39.6) ? <g opacity={interpolate(f, [F(39.6), F(40.0)], [0, 1], clamp)}><line x1={ex} y1={cy(500)} x2={ex} y2={ey} stroke={RED} strokeWidth={5} /><path d={`M${ex - 12} ${cy(500) + 14} L${ex} ${cy(500)} L${ex + 12} ${cy(500) + 14}`} stroke={RED} strokeWidth={5} fill="none" /></g> : null}
        {fan > 0 ? [-140, -70, 0, 70, 150].map((d, k) => <line key={k} x1={ex} y1={ey} x2={ex + 90 * fan} y2={ey + d * fan} stroke={SUB} strokeWidth={4} strokeDasharray="10 8" />) : null}
      </svg>
      <At at={31.0} until={46.6} x={CX0 + 20} y={cy(500) - 50} mode="fade"><span style={{ ...K, fontSize: 28, color: STK }}>500万円</span></At>
      {/* 点についていく数字 */}
      {live ? <div style={{ position: "absolute", left: cx(drawTo) - 70, top: cy(dv) + 24, background: "#fff", border: `4px solid ${RED}`, borderRadius: 12, padding: "0 12px", ...SER, fontSize: 40, color: RED, whiteSpace: "nowrap" }}>{Math.round(dv)}<span style={{ ...K, fontSize: 20 }}>万</span></div> : null}
      {/* 学年の旗 */}
      {flag(IC, 31.4, "bk_kid_jhs3", "中3の冬", INK)}
      {flag(BD_LAB.indexOf("2009-06"), 35.0, "bk_kid_hs", "高校", SUB)}
      {flag(IE, 35.3, "bk_kid_univ", "大学入学", RED)}
      <At at={34.9} until={36.5} x={(cx(IC) + cx(IE)) / 2 - 90} y={CY0 + CH - 70} mode="slam"><span style={{ ...K, fontSize: 44, color: INK, background: YEL, border: `4px solid ${INK}`, borderRadius: 14, padding: "0 18px" }}>あと3年</span></At>
      <At at={33.0} x={cx(IC) - 50} y={cy(520) - 110} mode="slam"><Stamp size={42}>暴落</Stamp></At>
      <Ring at={33.0} until={35.0} x={cx(IC)} y={cy(BD_STOCK[IC])} r={50} c={RED} w={7} />
      {/* 「まだ大丈夫」→ 青ざめる → 子どもも不安 */}
      <At at={31.6} until={38.8} x={800} y={200} mode="spring"><Img2 n="bk_parent_relax" s={220} /></At>
      <At at={32.0} until={38.8} x={560} y={410} mode="drop"><div style={{ background: "#fff", border: `4px solid ${INK}`, borderRadius: 18, padding: "4px 14px", ...B, fontSize: 28 }}>まだ時間あるし大丈夫</div></At>
      <At at={38.86} until={45.5} x={800} y={200} mode="slam"><Img2 n="bk_parent_relax_crack" s={220} /></At>
      {/* 山場 */}
      <Burst at={38.86} cx={ex} cy={ey} r0={180} />
      <Corners at={39.0} until={41.9} x={ex - 150} y={cy(500) - 40} w={300} h={ey - cy(500) + 90} zoom="×2" />
      <At at={38.86} until={45.5} x={ex - 360} y={ey - 230} mode="slam"><div style={{ background: "#fff", border: `6px solid ${RED}`, borderRadius: 20, padding: "6px 22px", boxShadow: `6px 8px 0 ${INK}`, whiteSpace: "nowrap" }}><span style={{ ...B, fontSize: 30 }}>3年たっても 約</span><span style={{ ...SER, fontSize: 92, color: RED }}><Num at={38.9} from={317} to={460} dur={22} /></span><span style={{ ...K, fontSize: 34 }}>万円</span></div></At>
      <HandCircle at={39.8} until={45.5} x={ex} y={(cy(500) + ey) / 2} r={46} ry={56} />
      <At at={40.2} until={46.6} x={ex - 250} y={(cy(500) + ey) / 2 + 20} mode="drop"><Tag c={RED} size={28}>500万円に まだ届かない</Tag></At>
      <At at={42.38} x={50} y={1235} mode="slam"><Big bg="#fff" fg={RED} size={44}>危ないのは 使う年の暴落だけじゃない</Big></At>
      <At at={45.6} x={790} y={200} mode="slam"><Img2 n="bk_kid_jhs3_worry" s={240} /></At>
      <At at={46.78} x={ex + 40} y={ey - 160} mode="slam"><span style={{ ...SER, fontSize: 150, color: RED }}>？</span></At>
      <At at={46.9} x={470} y={430} mode="drop"><Pill c={INK} size={30}>戻るまで どれくらい？ わからない</Pill></At>
      <Foot at={36.66} y={1330}>※2007年末に500万円。S&P500・配当込み・ドル建て。月の動き＝Shiller（イェール大）の月次データ、年末の値＝Damodaran（NYU）の年間リターン</Foot>
    </>
  );
};
// ════════ p4 だから僕は、債券も（49.32–63.84） ════════
// 株と債券を1つのチャートに（2007年半ば〜2013年・2007年末＝500万円）
const J0 = BD_LAB.indexOf("2007-06"), J1 = BD_LAB.length - 1;
const QX = 130, QW = 860, QY = 600, QH = 440, QLO = 280, QHI = 740;
const qx = (i: number) => QX + ((i - J0) / (J1 - J0)) * QW, qy = (v: number) => QY + QH - ((v - QLO) / (QHI - QLO)) * QH;
const JA0 = BD_LAB.indexOf("2008-06"), JA1 = BD_LAB.indexOf("2010-12"), JAm = BD_LAB.indexOf("2009-06");
const JB0 = BD_LAB.indexOf("2012-06"), JBm = BD_LAB.indexOf("2013-06");
// お金がチャートの線から学費へ落ちていく
const Coins: React.FC<{ at: number; until: number; x0: number; y0: number; x1: number; y1: number; c: string }> = ({ at, until, x0, y0, x1, y1, c }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until)) return null;
  return (
    <>
      {Array.from({ length: 4 }).map((_, k) => {
        const d = (f - F(at) - k * 8) % 32;
        if (f - F(at) < k * 8 || d < 0) return null;
        const p = interpolate(d, [0, 22], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        const o = interpolate(d, [0, 3, 20, 26], [0, 1, 1, 0], clamp);
        return <div key={k} style={{ position: "absolute", left: x0 + (x1 - x0) * p - 22, top: y0 + (y1 - y0) * p - 22, width: 44, height: 44, borderRadius: "50%", background: YEL, border: `4px solid ${c}`, opacity: o, ...K, fontSize: 24, color: c, display: "flex", alignItems: "center", justifyContent: "center" }}>¥</div>;
      })}
    </>
  );
};
const P4: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const phaseA = t >= 55.12 && t < 58.64, phaseB = t >= 58.64;
  const n = Math.round(interpolate(f, [F(49.8), F(51.6)], [J0 + 1, J1], { ...clamp, easing: Easing.inOut(Easing.quad) }));
  const band = (i0: number, i1: number, at: number, c: string) => {
    const k = interpolate(f, [F(at), F(at) + 8], [0, 1], { ...clamp, easing: OUTE });
    return <rect x={qx(i0)} y={QY - 10} width={(qx(i1) - qx(i0)) * k} height={QH + 20} rx={18} fill={c} opacity={0.16} />;
  };
  const pt = (arr: number[], i: number) => [qx(i), qy(arr[i])] as const;
  const [bAx, bAy] = pt(BD_BOND, JAm), [sAx, sAy] = pt(BD_STOCK, JAm), [sBx, sBy] = pt(BD_STOCK, JBm);
  const payX = phaseB ? sBx : bAx;
  return (
    <>
      <Head at={49.32} tag="僕の場合" title={<>株と一緒に <span style={{ color: BND }}>債券</span>も</>} c={BND} />
      {/* NISA → 債券 500万円 */}
      <At at={51.86} x={130} y={450} mode="drop"><Pill c={STK} size={34}>NISAの一部</Pill></At>
      <Arrow at={52.4} x1={420} y1={480} x2={520} y2={480} color={INK} />
      <At at={52.8} x={540} y={430} mode="slam"><div style={{ background: "#fff", border: `6px solid ${BND}`, borderRadius: 18, padding: "2px 22px", whiteSpace: "nowrap", boxShadow: `5px 7px 0 ${INK}` }}><span style={{ ...K, fontSize: 30, color: BND }}>債券 </span><span style={{ ...SER, fontSize: 64, color: BND }}><Num at={53.0} to={500} dur={14} /></span><span style={{ ...K, fontSize: 28 }}>万円</span></div></At>
      <Ripple at={52.9} x={720} y={474} c={BND} />
      <At at={53.4} x={900} y={420} mode="spring"><Img2 n="bk_bond_paper" s={120} /></At>
      {/* 1つのチャート */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {phaseA ? band(JA0, JA1, 55.12, RED) : null}
        {phaseB ? band(JB0, J1, 58.64, BND) : null}
        <g opacity={interpolate(f, [F(49.5), F(49.9)], [0, 1], clamp)}>
          {[300, 500, 700].map((v) => <g key={v}><line x1={QX} x2={QX + QW} y1={qy(v)} y2={qy(v)} stroke={v === 500 ? INK : "#E6DDBE"} strokeWidth={v === 500 ? 3 : 2} strokeDasharray={v === 500 ? "12 10" : undefined} opacity={v === 500 ? 0.5 : 1} /><text x={QX - 12} y={qy(v) + 9} textAnchor="end" fontSize={26} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{v}</text></g>)}
          {["2008", "2009", "2010", "2011", "2012", "2013"].map((y) => <text key={y} x={qx(BD_LAB.indexOf(`${y}-01`))} y={QY + QH + 38} textAnchor="middle" fontSize={24} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{y}</text>)}
        </g>
        <polyline points={BD_STOCK.slice(J0, n + 1).map((v, k) => `${qx(J0 + k)},${qy(v)}`).join(" ")} fill="none" stroke={STK} strokeWidth={phaseB ? 10 : 7} strokeLinejoin="round" strokeLinecap="round" opacity={phaseA ? 0.45 : 1} />
        <polyline points={BD_BOND.slice(J0, n + 1).map((v, k) => `${qx(J0 + k)},${qy(v)}`).join(" ")} fill="none" stroke={BND} strokeWidth={phaseA ? 10 : 7} strokeLinejoin="round" strokeLinecap="round" opacity={phaseB ? 0.45 : 1} />
      </svg>
      <At at={51.0} x={qx(J1) - 60} y={qy(BD_STOCK[J1]) - 54} mode="pop"><Tag c={STK} size={28}>株</Tag></At>
      <At at={51.0} x={qx(J1) - 70} y={qy(BD_BOND[J1]) + 14} mode="pop"><Tag c={BND} size={28}>債券</Tag></At>
      <At at={49.6} x={QX} y={QY - 48} mode="fade"><span style={{ ...B, fontSize: 24, color: SUB }}>2007年末に500万円ずつ持っていたら（万円）</span></At>
      {/* 場面A：株↓ → 債券から使う */}
      <At at={55.3} until={58.6} x={qx(JA0) + 10} y={QY - 4} mode="drop"><Tag c={RED} size={28}>株が下がっている間</Tag></At>
      <At at={55.6} until={58.6} x={sAx - 60} y={sAy + 26} mode="slam"><div style={{ ...K, fontSize: 34, color: RED, border: `5px solid ${RED}`, borderRadius: 12, padding: "0 14px", background: "#fff", transform: "rotate(6deg)" }}>株は待つ</div></At>
      <Ring at={55.4} until={58.6} x={bAx} y={bAy} r={40} c={BND} w={7} />
      <Coins at={55.8} until={58.6} x0={bAx} y0={bAy} x1={bAx} y1={1110} c={BND} />
      <At at={55.8} until={58.6} x={bAx + 40} y={bAy - 70} mode="drop"><Tag c={BND} size={30}>債券から使う</Tag></At>
      {/* 場面B：株↑ → 株から使う */}
      <At at={58.8} x={qx(JB0) - 150} y={QY + QH - 40} mode="drop"><Tag c={BND} size={28}>株が上がっている時</Tag></At>
      <Ring at={58.8} until={60.6} x={sBx} y={sBy} r={40} c={STK} w={7} />
      <Coins at={59.0} until={60.6} x0={sBx} y0={sBy} x1={sBx} y1={1110} c={STK} />
      <At at={59.2} until={60.6} x={sBx - 300} y={sBy - 20} mode="drop"><Tag c={STK} size={30}>株から使う</Tag></At>
      <At at={49.5} until={55.6} x={780} y={1060} mode="spring"><Img2 n="bk_parent_choose" s={230} /></At>
      {/* 学費 */}
      {t >= 55.8 && t < 60.6 ? <div style={{ position: "absolute", left: payX - 100, top: 1070, transition: "none" }}><Img2 n="bk_parent_pay" s={200} /></div> : null}
      <Flip at={60.64} x={60} y={1170}><Big size={44}>状況に合わせて 柔軟に！</Big></Flip>
      <At at={61.2} x={820} y={1080} mode="spring"><Img2 n="bk_family_relief" s={190} /></At>
      <Foot at={50.0} y={1300}>※過去の例。S&P500（配当込み）と米国10年債（利息込み）、ドル建て。Shiller・Damodaranのデータ。割合や値動きは人によって違います</Foot>
    </>
  );
};
// ════════ p5 なんで暴落で債券が上がる？（63.84–82.66） ════════
const MiniCard: React.FC<{ x: number; at: number; dir: 1 | -1; c: string; label: string; up: boolean }> = ({ x, at, dir, c, label, up }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [F(at) + 4, F(at) + 22], [0, 1], { ...clamp, easing: OUTE });
  const pts = up ? [[40, 230], [110, 200], [170, 210], [240, 140], [330, 70]] : [[40, 70], [110, 110], [170, 95], [240, 190], [330, 240]];
  const n = 1 + p * (pts.length - 1);
  const shown = pts.slice(0, Math.floor(n) + 1).map((q, i) => (i === Math.floor(n) && i > 0 ? [pts[i - 1][0] + (q[0] - pts[i - 1][0]) * (n % 1), pts[i - 1][1] + (q[1] - pts[i - 1][1]) * (n % 1)] : q));
  return (
    <div style={{ position: "absolute", left: x, top: 520, width: 440, height: 400, background: "#fff", border: `6px solid ${INK}`, borderRadius: 26, boxShadow: `8px 10px 0 ${INK}`, ...swoop(f, at, dir) }}>
      <div style={{ position: "absolute", left: 26, top: 14, ...K, fontSize: 52, color: c }}>{label}</div>
      <div style={{ position: "absolute", right: 26, top: 6, ...K, fontSize: 80, color: up ? BND : RED }}>{up ? "↑" : "↓"}</div>
      <svg width={430} height={390} style={{ position: "absolute", left: 20, top: 70 }}>
        <polyline points={shown.map((q) => q.join(",")).join(" ")} fill="none" stroke={up ? BND : RED} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const intro = t < 68.4;
  const part2 = t >= 74.6;
  const tilt = 14 * interpolate(f, [F(72.04), F(72.04) + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const S0 = 540, SY = 1000, SR = 320;
  const lx = S0 - SR * Math.cos((tilt * Math.PI) / 180), ly = SY + SR * Math.sin((tilt * Math.PI) / 180);
  const rx = S0 + SR * Math.cos((tilt * Math.PI) / 180), ry = SY - SR * Math.sin((tilt * Math.PI) / 180);
  const AX = 800;
  const bar = (x: number, v: number, c: string, at: number, label: string) => {
    const p = interpolate(f, [F(at), F(at) + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.2)) });
    const h = Math.abs(v) * 10 * p;
    return (
      <>
        <div style={{ position: "absolute", left: x, top: v > 0 ? AX - h : AX, width: 300, height: h, background: c, border: p > 0.02 ? `5px solid ${INK}` : undefined, boxSizing: "border-box", borderRadius: v > 0 ? "20px 20px 0 0" : "0 0 20px 20px", boxShadow: "inset 0 -10px 0 rgba(0,0,0,0.12)" }} />
        {p > 0.05 ? <div style={{ position: "absolute", left: x - 40, width: 380, top: v > 0 ? AX - h - 120 : AX + h + 4, textAlign: "center", ...SER, fontSize: 108, color: c, textShadow: "4px 4px 0 #fff" }}>{v > 0 ? "+" : "−"}<Num at={at} to={Math.abs(Math.round(v))} dur={15} />%</div> : null}
        <div style={{ position: "absolute", left: x - 30, width: 360, top: v > 0 ? AX + 14 : AX - 60, textAlign: "center", ...K, fontSize: 38, opacity: Math.min(1, p * 3) }}>{label}</div>
      </>
    );
  };
  return (
    <>
      <Head at={63.84} tag="なぜ？" title={<>暴落で <span style={{ color: BND }}>債券が上がる</span> 理由</>} c={BND} />
      {intro ? (
        <>
          <At at={63.9} x={60} y={420} mode="drop"><Pill c={RED} size={34}>景気が悪くなると…</Pill></At>
          <MiniCard x={50} at={64.2} dir={-1} c={STK} label="株" up={false} />
          {t >= 65.94 ? <MiniCard x={590} at={65.94} dir={1} c={BND} label="債券" up /> : null}
          <At at={66.3} x={560} y={950} mode="slam"><Stamp c={BND} size={44} bg="#F1FBF5">上がる傾向</Stamp></At>
          <At at={64.4} x={80} y={950} mode="drop"><Tag c={RED} size={32}>下がる</Tag></At>
        </>
      ) : !part2 ? (
        <>
          {/* 流れ：景気悪化 → 中央銀行が金利を下げる → 債券の価値↑ */}
          <At at={68.54} x={40} y={440} mode="drop"><Pill c={RED} size={34}>景気悪化</Pill></At>
          <Arrow at={68.8} x1={260} y1={470} x2={330} y2={470} color={INK} />
          <At at={68.9} x={330} y={380} mode="slam"><Img2 n="bk_bank_building_rate" s={210} /></At>
          <Ring at={69.0} until={71.8} x={435} y={485} r={115} c={CASH} />
          <At at={69.4} x={570} y={440} mode="drop"><Pill c={CASH} size={34}>金利を下げる</Pill></At>
          <At at={69.8} x={570} y={520} mode="rise"><span style={{ ...B, fontSize: 26, color: SUB }}>アメリカの政策金利<br /><span style={{ ...SER, fontSize: 44, color: CASH }}>4.75% → ほぼ0%</span><br />（2007年9月→2008年12月）</span></At>
          {/* シーソー */}
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(f, [F(71.0), F(71.4)], [0, 1], clamp) }}>
            <path d={`M${S0} ${SY + 20} L${S0 - 70} ${SY + 170} L${S0 + 70} ${SY + 170} Z`} fill={INK} />
            <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={INK} strokeWidth={20} strokeLinecap="round" />
          </svg>
          {f >= F(71.0) ? (
            <>
              <div style={{ position: "absolute", left: lx - 130, top: ly - 190, width: 260, height: 170, borderRadius: 22, background: CASH, border: `6px solid ${INK}`, boxShadow: `6px 8px 0 ${INK}`, color: "#fff", ...K, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", lineHeight: 1.1 }}><div>金利</div><div style={{ fontSize: 64 }}>{tilt > 3 ? "↓" : ""}</div></div>
              <div style={{ position: "absolute", left: rx - 150, top: ry - 190, width: 300, height: 170, borderRadius: 22, background: BND, border: `6px solid ${INK}`, boxShadow: `6px 8px 0 ${INK}`, color: "#fff", ...K, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", lineHeight: 1.1 }}><div>債券の価値</div><div style={{ fontSize: 64 }}>{tilt > 3 ? "↑" : ""}</div></div>
            </>
          ) : null}
          <Ripple at={72.3} x={rx} y={ry - 100} c={BND} />
          <At at={72.6} x={130} y={1200} mode="drop"><span style={{ ...B, fontSize: 30, color: INK, background: "#fff", padding: "6px 18px", borderRadius: 14, border: `4px solid ${INK}` }}>前に買った「利息の高い債券」の価値が上がる</span></At>
        </>
      ) : (
        <>
          <At at={74.76} x={60} y={420} mode="slam"><Stamp size={46}>2008年 リーマンショックの年</Stamp></At>
          <div style={{ position: "absolute", left: 80, top: AX - 3, width: 920, height: 6, background: INK }} />
          {bar(170, -36.6, STK, 76.54, "株")}
          {bar(610, 20.1, BND, 79.34, "米国10年国債")}
          <Ripple at={79.6} x={760} y={600} c={BND} n={3} />
          <At at={79.7} x={400} y={560} mode="spring"><Img2 n="bk_bond_paper" s={150} /></At>
          <At at={80.2} x={560} y={1000} mode="drop"><Tag c={BND} size={34}>株と 逆に動いた</Tag></At>
          <Foot at={76.54} y={1320}>※2008年の年間リターン（配当・利息込み）：S&P500 −36.55%、米国10年債 +20.10%（Damodaran・NYU）</Foot>
        </>
      )}
    </>
  );
};

// ════════ p6 約8割（82.66–90.86） ════════
const DOWN: [number, boolean][] = [[1929, true], [1930, true], [1931, false], [1932, true], [1934, true], [1937, true], [1939, true], [1940, true], [1941, false], [1946, true], [1953, true], [1957, true], [1962, true], [1966, true], [1969, false], [1973, true], [1974, true], [1977, true], [1981, true], [1990, true], [2000, true], [2001, true], [2002, true], [2008, true], [2018, false], [2022, false]];
const P6: React.FC = () => {
  const f = useCurrentFrame();
  const plusN = DOWN.filter(([, p], i) => p && f >= F(84.2) + i * 1.2).length;
  return (
    <>
      <Head at={82.66} tag="過去98年" title={<>株が下がった <span style={{ color: RED }}>26年</span></>} />
      <At at={84.2} x={60} y={420} mode="drop"><span style={{ ...K, fontSize: 32 }}><span style={{ color: BND }}>■</span> 債券プラス　<span style={{ color: RED }}>■</span> 債券マイナス</span></At>
      <At at={84.2} x={700} y={405} mode="pop"><span style={{ ...K, fontSize: 30 }}>債券プラス </span><span style={{ ...SER, fontSize: 58, color: BND }}>{plusN}</span><span style={{ ...K, fontSize: 30 }}>回</span></At>
      <div style={{ position: "absolute", left: 50, top: 500, display: "grid", gridTemplateColumns: "repeat(6, 152px)", gap: 16 }}>
        {DOWN.map(([y, plus], i) => {
          const at = F(82.9) + i * 2;
          const flip = F(84.2) + i * 1.2;
          const on = f >= flip;
          const k = interpolate(f - at, [0, 3, 6], [0, 1.12, 1], clamp);
          const fl = interpolate(f - flip, [0, 3, 6], [1, 0, 1], clamp);
          const hot = y === 2022 && f >= F(86.26);
          return <div key={y} style={{ height: 96, borderRadius: 18, background: !on ? "#fff" : plus ? BND : RED, color: on ? "#fff" : INK, border: `5px solid ${INK}`, ...K, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k * (hot ? 1.15 : 1)}) scaleX(${fl})`, boxShadow: hot ? `0 0 0 8px ${YEL}` : `5px 6px 0 ${INK}`, zIndex: hot ? 2 : 1 }}>{y}</div>;
        })}
      </div>
      <Donut at={85.6} x={930} y={1180} r={78} v={21 / 26} c={BND} label="26回中21回" />
      <At at={85.6} until={88.0} x={40} y={1130} mode="slam"><div style={{ background: "#fff", border: `7px solid ${BND}`, borderRadius: 22, padding: "4px 28px", boxShadow: `7px 9px 0 ${INK}`, whiteSpace: "nowrap" }}><span style={{ ...K, fontSize: 36 }}>債券プラス </span><span style={{ ...SER, fontSize: 104, color: BND }}>約8</span><span style={{ ...K, fontSize: 46 }}>割</span><span style={{ ...B, fontSize: 28, color: SUB }}>（26回中21回）</span></div></At>
      <HandCircle at={86.4} until={90.6} x={50 + 168 + 76} y={500 + 4 * 112 + 48} r={92} ry={62} />
      <Chain at={88.1} x={294} y0={1060} y1={1120}><div style={{ transform: "translateX(-60px)" }}><Stamp size={40}>株も債券も 下がった年も</Stamp></div></Chain>
      <Foot at={83.0} y={1320}>※1928〜2025年（98年間）でS&P500（配当込み）がマイナスの26年のうち、米国10年債（利息込み）がプラスは21年（Damodaran・NYU）。2022年は物価を抑えるために金利が大きく上がり、株も債券も下がりました</Foot>
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
      <Ring at={92.4} until={93.4} x={gx(iLow)} y={gy(UST10Y[iLow])} r={50} c={RED} w={6} />
      <Spot at={93.6} until={96.4} rect={[gx(iEnd) - 340, gy(UST10Y[iEnd]) - 180, 390, 240]} r={22} color={RED} />
      <At at={94.0} until={96.4} x={gx(iEnd) - 330} y={gy(UST10Y[iEnd]) + 80} mode="drop"><Tag c={RED} size={30}>2020年より ずっと高い</Tag></At>
      <Ripple at={93.6} x={gx(iEnd)} y={gy(UST10Y[iEnd])} c={RED} />
      <At at={93.6} x={gx(iEnd) - 320} y={gy(UST10Y[iEnd]) - 170} mode="slam"><span style={{ ...SER, fontSize: 96, color: RED }}>約5%</span><span style={{ ...K, fontSize: 30 }}> 今</span></At>
      <At at={95.5} x={90} y={1150} mode="drop"><Pill c={BND} size={34}>増やしやすい</Pill></At>
      <At at={96.6} x={400} y={1150} mode="drop"><Pill c={CASH} size={34}>暴落の備えにも</Pill></At>
      <At at={98.2} x={260} y={1240} mode="slam"><Big bg="#fff" fg={BND} size={40}>債券も 選択肢に入れやすい</Big></At>
      <Foot at={91.2} y={1330}>※FRED（米セントルイス連銀）DGS10の月平均。2026年11月時点で5%前後。将来の金利や受取額を約束するものではありません</Foot>
    </>
  );
};

// ════════ p8 資産分散（100.68–107.6） ════════
const MiniTank: React.FC<{ x: number; at: number; c: string; label: string; lv: number; role: string; hop: number }> = ({ x, at, c, label, lv, role, hop }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [F(at), F(at) + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.5)) });
  const W = 260, H = 380, top = 30 + (H - 60) * (1 - lv * Math.min(1, k * 1.2));
  const wave = Array.from({ length: 13 }).map((_, i) => `${16 + i * ((W - 32) / 12)},${top + Math.sin(i * 0.9 + f / 4 + x) * 6}`).join(" ");
  return (
    <div style={{ position: "absolute", left: x, top: 560, width: W, height: H + 120, opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * 120 + interpolate(f - F(hop), [0, 4, 8, 11, 14], [0, -46, 0, -12, 0], clamp)}px)` }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={5} y={5} width={W - 10} height={H - 10} rx={26} fill="#fff" stroke={INK} strokeWidth={6} />
        <polygon points={`16,${H - 16} ${wave} ${W - 16},${H - 16}`} fill={c} />
      </svg>
      <div style={{ position: "absolute", left: 0, width: W, top: 20, textAlign: "center", ...K, fontSize: 56, color: "#fff", WebkitTextStroke: `3px ${INK}`, paintOrder: "stroke" }}>{label}</div>
      <div style={{ position: "absolute", left: -20, width: W + 40, top: H + 12, textAlign: "center", ...K, fontSize: 28, color: c, lineHeight: 1.25, whiteSpace: "pre-line" }}>{role}</div>
    </div>
  );
};
const P8: React.FC = () => {
  const f = useCurrentFrame();
  const pipe = interpolate(f, [F(103.02), F(103.02) + 12], [0, 1], { ...clamp, easing: OUTE });
  const PY = 560 + 300;
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 290, ...K, fontSize: 66, color: INK, whiteSpace: "nowrap" }}><TypeIn at={F(100.68)}>どれか<R>1つだけ</R>ではなく</TypeIn></div>
      {/* 管（3つがつながる） */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {[[330, 410], [670, 750]].map(([a, b], i) => <g key={i}><rect x={a} y={PY - 18} width={(b - a) * pipe} height={36} fill="#D9D2BC" stroke={INK} strokeWidth={5} />{pipe > 0.9 ? Array.from({ length: 3 }).map((_, j) => <circle key={j} cx={a + ((f * 3 + j * 27) % (b - a))} cy={PY} r={8} fill={YEL} />) : null}</g>)}
      </svg>
      <MiniTank x={70} at={100.9} c={STK} label="株" lv={0.8} role={"増やす\n物価に負けない"} hop={103.3} />
      <MiniTank x={410} at={101.2} c={BND} label="債券" lv={0.6} role={"暴落の備え\n利息で増やす"} hop={103.45} />
      <MiniTank x={750} at={101.5} c={CASH} label="現金" lv={0.45} role="すぐ使う" hop={103.6} />
      <Ripple at={103.3} x={200} y={600} c={STK} />
      <Ripple at={103.45} x={540} y={600} c={BND} />
      <Ripple at={103.6} x={880} y={600} c={CASH} />
      <At at={103.02} x={50} y={1150} mode="wipe"><Big size={52}>何が起きても対応できる 資産分散</Big></At>
      <At at={105.34} x={760} y={330} mode="spring"><Img2 n="bk_parent_balance" s={240} /></At>
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
  p4: [{ t: 60.64, x: 540, y: 1000, s: 1.03, d: 5 }],
  p5: [{ t: 79.34, x: 560, y: 900, s: 1.05, d: 5 }, { t: 81.6, ...HOME, d: 12 }],
  p6: [{ t: 85.6, x: 480, y: 1000, s: 1.05, d: 5 }, { t: 88.0, ...HOME, d: 10 }],
  p8: [{ t: 103.02, x: 540, y: 1000, s: 1.05, d: 5 }, { t: 103.6, x: 540, y: 980, s: 1.02, d: 20 }],
};

// 右下のたいち：気持ちが動く所だけひょこっと（最後は口パクで話す）
const APPEAR: [number, number, string][] = [
  [6.42, 11.5, "taichi_scared"], [26.48, 30.6, "taichi_worry"], [58.64, 63.4, "taichi_thumbs_up"], [100.68, 107.6, "__talk"],
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
