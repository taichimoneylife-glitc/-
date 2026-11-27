import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { B, GenSlot } from "./MileLifePlan";
import { SfxTrack } from "./components/sfx";
import { Stepper } from "./components/board";
import { F, K, SER, At } from "./components/zukaiKit";
import { Captions } from "./BourakuReel";
import { Spot, Camera, CamKey } from "./components/cam";
import { Ring, Ripple, HandCircle, Burst as Rays } from "./components/marke";
import { TapCard } from "./components/tapCard";
import { clamp, OUTE, INK, RED, SUB, BND, CASH, YEL, Tag, Pill, Stamp, Big, Foot, Num, Crack, Corners, Flip, Alarm, Shards } from "./components/emphKit";
import { PAPA_MOUTH } from "./papaMouth";

// ════════════════════════════════════════════════════════════════════
//  パパ育休で「手取り実質10割」になる取り方（図解パート・声 public/papa-narration.wav 91.9秒）
//  設計書：assets/papa_ikukyu_blueprint.md／台本：assets/script_papa_ikukyu.md
//  主役＝12月・1月のカレンダー1枚。最後まで同じカレンダーに、塗り・帯・ハンコが足されていく
//  良い話＝光・ハンコ（放射線は「手取り10割」の1回）／悪い話＝ひび・かけら・赤い点滅・灰色
// ════════════════════════════════════════════════════════════════════
const GRN = "#2E9E6B", ORG = "#F2A35E", BLU = "#4A8FD6", TINT = "#DDF1E4";
const t30 = (f: number) => f / 30;

// ── カレンダーの位置 ──
// 1か月を大きく1つだけ見せる（必要な時だけ1月へ横にすべる／2か月を並べる）。座標はカレンダーの中の座標
const CW = 128, CH = 80, CX0 = 92, CY = 372, HEAD = 104, GT = HEAD, MW = CW * 7, GAP = 70, CALH = HEAD + CH * 6;
const MONTHS = [
  { label: "2026年 12月", start: 2, days: 31, x: 0, base: 0 },
  { label: "2027年 1月", start: 5, days: 31, x: MW + GAP, base: 31 },
];
const cell = (dn: number) => {
  const mi = dn < 31 ? 0 : 1; const M = MONTHS[mi]; const d = dn - M.base;
  const idx = M.start + d; return { x: M.x + (idx % 7) * CW, y: GT + Math.floor(idx / 7) * CH, mi, d: d + 1 };
};
// 見せ方：[秒, 左端に来る位置, 倍率]
const BOTH = MW / (MW * 2 + GAP);
const VIEW: [number, number, number][] = [[0, 0, 1], [52.25, MW + GAP, 1], [54.0, 0, BOTH], [56.3, 0, 1], [64.55, MW + GAP, 1], [66.5, 0, 1]];
const viewAt = (f: number) => {
  let x = 0, sc = 1;
  for (const [t, vx, vs] of VIEW) {
    const A = F(t); if (f < A) break;
    const p = interpolate(f, [A, A + 10], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
    x = x + (vx - x) * p; sc = sc + (vs - sc) * p;
  }
  return { x, sc };
};
const D = (m: 12 | 1, d: number) => (m === 12 ? d - 1 : 30 + d); // 日付 → 12/1からの通し番号

// ── 育休の帯（時間で塗られる・消える） ──
type Band = { from: number; to: number; at: number; grow: number; c: string; until: number; shrinkAt?: number; shrink?: number };
const BANDS: Band[] = [
  { from: 0, to: 13, at: 4.18, grow: 0.95, c: GRN, until: 36.86 },
  { from: 14, to: 27, at: 9.28, grow: 1.5, c: GRN, until: 36.86 },
  { from: 28, to: 40, at: 31.12, grow: 0.8, c: ORG, until: 36.86 },
  { from: 0, to: 13, at: 36.86, grow: 0, c: GRN, until: 37.22 },
  { from: 0, to: 12, at: 37.22, grow: 0, c: GRN, until: 38.14 },
  { from: 0, to: 12, at: 38.14, grow: 0, c: ORG, until: 41.2 },
  { from: 0, to: 30, at: 45.24, grow: 0.6, c: "#BFD8F2", until: 46.94 },
  { from: D(12, 25), to: D(12, 31), at: 46.94, grow: 0.35, c: BLU, until: 47.92 },
  { from: 0, to: 13, at: 47.92, grow: 0.5, c: BLU, until: 50.68 },
  { from: 0, to: 13, at: 51.68, grow: 0.5, c: BLU, until: 56.3 },
  { from: D(1, 1), to: D(1, 14), at: 52.66, grow: 0.6, c: BLU, until: 56.3 },
  { from: D(12, 18), to: D(12, 31), at: 59.26, grow: 0.5, c: BLU, until: 63.26 },
  { from: D(12, 2), to: D(1, 3), at: 63.26, grow: 2.6, c: BLU, until: 68.98 },
  { from: 0, to: 13, at: 80.6, grow: 0.45, c: GRN, until: 84.48, shrinkAt: 81.4, shrink: 0.8 },
];
const bandAt = (dn: number, t: number) => {
  let hit: Band | null = null;
  for (const b of BANDS) {
    if (t < b.at || t >= b.until || dn < b.from || dn > b.to) continue;
    const n = b.to - b.from + 1;
    const p = b.grow > 0 ? (t - b.at) / b.grow : 1;
    if (dn - b.from >= Math.floor(p * n + 0.0001) && p < 1) continue;
    if (b.shrinkAt !== undefined && t >= b.shrinkAt) {
      const q = Math.min(1, (t - b.shrinkAt) / (b.shrink ?? 1));
      if (dn - b.from >= Math.round((1 - q) * n)) continue;
    }
    hit = b;
  }
  return hit;
};
// 数えた日数（帯の先の白い丸）
const COUNTERS: { at: number; until: number; from: number; to: number; dur: number; dnBase: number; label?: string }[] = [
  { at: 4.18, until: 6.8, from: 1, to: 14, dur: 0.95, dnBase: 0 },
  { at: 9.28, until: 14.4, from: 14, to: 28, dur: 1.5, dnBase: 0 },
  { at: 36.86, until: 41.2, from: 14, to: 13, dur: 0.4, dnBase: 0 },
  { at: 63.26, until: 68.98, from: 1, to: 33, dur: 2.6, dnBase: 1 },
];

const Calendar: React.FC = () => {
  const f = useCurrentFrame();
  const t = t30(f);
  const enter = interpolate(f, [F(0.1), F(0.1) + 10], [0, 1], { ...clamp, easing: OUTE });
  const away = interpolate(t, [68.98, 69.4, 80.44, 80.9], [1, 0, 0, 1], clamp);
  const gone = 1 - interpolate(t, [88.0, 88.4], [0, 1], clamp);
  const dim = t >= 14.48 && t < 30.4 ? 0.55 : 1;
  const qmark = t >= 84.48;
  const tintOn = (dn: number) => t >= 2.86 + dn * 0.012 && dn <= 56;
  const glow8 = (t >= 52.66 && t < 54.2) ? 0.5 + 0.5 * Math.sin(f / 3) : 0;
  const vw = viewAt(f);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * away * gone * dim, transform: `translateY(${(1 - enter) * 120}px)` }}>
     <div style={{ position: "absolute", left: CX0 - 40, top: CY - 70, width: MW + 80, height: CALH + 110, overflow: "hidden" }}>
     <div style={{ position: "absolute", left: 40, top: 70, transform: `translateX(${-vw.x * vw.sc}px) scale(${vw.sc})`, transformOrigin: "0 0" }}>
      {MONTHS.map((M, mi) => (
        <div key={mi} style={{ position: "absolute", left: M.x - 12, top: -12, width: MW + 24, height: CALH + 24, background: "#fff", border: `5px solid ${INK}`, borderRadius: 26, boxShadow: `7px 9px 0 ${INK}` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 6, textAlign: "center", ...K, fontSize: 44, color: INK }}>{M.label}</div>
          {"日月火水木金土".split("").map((w, i) => <div key={w} style={{ position: "absolute", left: 12 + i * CW, top: 66, width: CW, textAlign: "center", ...B, fontSize: 26, color: i === 0 ? RED : i === 6 ? CASH : SUB }}>{w}</div>)}
        </div>
      ))}
      {Array.from({ length: 62 }).map((_, dn) => {
        const p = cell(dn);
        const b = bandAt(dn, t);
        const lost = dn === 13 && t >= 37.22 && t < 38.6;
        const col = (p.x - MONTHS[p.mi].x) / CW;
        return (
          <div key={dn} style={{ position: "absolute", left: p.x + 4, top: p.y + 4, width: CW - 8, height: CH - 8, borderRadius: 14, background: b ? b.c : tintOn(dn) ? TINT : "transparent", boxShadow: glow8 > 0 && dn <= 56 ? `0 0 0 ${2 + 3 * glow8}px rgba(46,158,107,0.45)` : undefined, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ ...K, fontSize: 34, color: b && b.c !== "#BFD8F2" ? "#fff" : col === 0 ? RED : col === 6 ? CASH : INK }}>{qmark ? "?" : p.d}</span>
            {lost ? <div style={{ position: "absolute", inset: -4, border: `5px solid ${RED}`, borderRadius: 14, opacity: 1 - interpolate(t, [38.2, 38.6], [0, 1], clamp) }}><span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 60, color: RED }}>✕</span></div> : null}
          </div>
        );
      })}
      {/* 12/1 赤ちゃん */}
      {t >= 1.0 && t < 84.48 ? <div style={{ position: "absolute", left: cell(0).x + 82, top: cell(0).y - 18, fontSize: 38, transform: `scale(${interpolate(f - F(1.0), [0, 4, 8], [0, 1.3, 1], clamp)})` }}>👶</div> : null}
      {/* 日数カウンター */}
      {COUNTERS.map((c, i) => {
        if (t < c.at || t >= c.until) return null;
        const fs = Math.floor(f / 2) * 2;
        const v = Math.round(interpolate(fs, [F(c.at), F(c.at + c.dur)], [c.from, c.to], clamp));
        const p = cell(c.dnBase + v - 1);
        return <div key={i} style={{ position: "absolute", left: p.x + CW - 40, top: p.y - 24, minWidth: 76, height: 50, padding: "0 12px", borderRadius: 25, background: "#fff", border: `4px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 30, color: INK, boxShadow: `3px 4px 0 ${INK}`, zIndex: 3 }}>{v}日</div>;
      })}
      <MonthStamp mi={0} at={46.22} until={50.68} />
      <MonthStamp mi={0} at={54.3} until={56.3} />
      <MonthStamp mi={1} at={54.6} until={56.3} />
      <MonthStamp mi={0} at={59.9} until={68.98} />
      <BonusBag />
      {t >= 54.3 && t < 56.3 ? <Ripple at={54.3} x={MW - 60} y={20} c={BLU} /> : null}
      {t >= 54.6 && t < 56.3 ? <Ripple at={54.6} x={MW * 2 + GAP - 60} y={20} c={BLU} /> : null}
      <Corners at={46.94} until={47.9} x={cell(D(12, 31)).x - 14} y={cell(D(12, 31)).y - 14} w={CW + 28} h={CH + 28} zoom="×2" />
      <HandCircle at={47.2} until={47.9} x={cell(D(12, 31)).x + CW / 2} y={cell(D(12, 31)).y + CH / 2} r={62} ry={46} c={RED} w={7} />
      {t >= 66.9 && t < 68.98 ? <Ripple at={66.9} x={cell(D(12, 10)).x + 64} y={cell(D(12, 10)).y + 30} c={BLU} n={3} /> : null}
     </div>
     </div>
    </div>
  );
};

// 月の免除ハンコ
const MonthStamp: React.FC<{ mi: 0 | 1; at: number; until: number }> = ({ mi, at, until }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f >= F(until)) return null;
  const k = interpolate(f - F(at), [0, 3, 6], [2.2, 0.88, 1], clamp);
  return <div style={{ position: "absolute", left: MONTHS[mi].x + MW - 110, top: -40, width: 120, height: 120, borderRadius: "50%", border: `6px solid ${BLU}`, background: "rgba(255,255,255,0.92)", color: BLU, ...K, fontSize: 36, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", transform: `rotate(-12deg) scale(${k})`, zIndex: 4 }}><div style={{ fontSize: 24 }}>まるごと</div><div>免除</div></div>;
};

// ボーナス袋（12/10のマス）
const BonusBag: React.FC = () => {
  const f = useCurrentFrame();
  const t = t30(f);
  if (t < 56.6 || t >= 68.98) return null;
  const p = cell(D(12, 10));
  const k = interpolate(f - F(56.6), [0, 4, 8], [0, 1.3, 1], clamp);
  const bad = t >= 61.3 && t < 66.86;
  const ok = t >= 66.86;
  return (
    <div style={{ position: "absolute", left: p.x + 66, top: p.y + 2, width: 82, height: 104, transformOrigin: "0 0", transform: `scale(${k * (bad ? 0.62 : 0.72)})`, filter: bad ? "grayscale(1)" : undefined, opacity: bad ? 0.7 : 1, zIndex: 4 }}>
      <svg width={82} height={104}><rect x={6} y={4} width={70} height={96} rx={8} fill="#FFFDF6" stroke={INK} strokeWidth={4} /><path d="M6 46 L76 46" stroke={RED} strokeWidth={6} /><path d="M6 54 L76 54" stroke="#D9A43A" strokeWidth={4} /><path d="M41 30 l10 16 l-10 16 l-10 -16 Z" fill={RED} stroke={INK} strokeWidth={2} /></svg>
      {bad ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 80, color: RED, filter: "none" }}>✕</div> : null}
      {ok ? <div style={{ position: "absolute", left: -6, top: 20, width: 94, height: 94, borderRadius: "50%", border: `5px solid ${BLU}`, background: "rgba(255,255,255,0.9)", color: BLU, ...K, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(-12deg) scale(${interpolate(f - F(66.86), [0, 3, 6], [2, 0.9, 1], clamp)})` }}>免除</div> : null}
    </div>
  );
};

// 付箋の見出し（場面ごとに入れ替わる）
const HEADS: [number, number, string, React.ReactNode, string][] = [
  [0, 6.8, "結論", <>パパ育休で <span style={{ color: GRN }}>手取り10割</span> の条件</>, GRN],
  [6.84, 36.8, "例えば", <>12月1日生まれ・<span style={{ color: GRN }}>28日</span>休むと</>, GRN],
  [36.86, 41.15, "注意", <><span style={{ color: RED }}>13日</span>だと上乗せ0円</>, RED],
  [41.2, 56.25, "保険料", <>免除は <span style={{ color: BLU }}>1か月分まるごと</span></>, BLU],
  [56.3, 68.9, "ボーナス", <>ボーナスの保険料は <span style={{ color: RED }}>別ルール</span></>, RED],
  [68.98, 80.4, "対象外", <>個人事業主・<span style={{ color: RED }}>フリーランス</span></>, RED],
  [80.44, 84.4, "ちなみに", <>パパが取らないと <span style={{ color: RED }}>ママも</span></>, RED],
  [84.48, 88.0, "相談", <>自分の場合は？</>, GRN],
];
const Heads: React.FC = () => {
  const f = useCurrentFrame();
  const t = t30(f);
  const h = HEADS.find(([a, b]) => t >= a && t < b + 0.2);
  if (!h) return null;
  const [a, b, tag, title, c] = h;
  const k = interpolate(f - F(a), [0, 6, 10], [1.5, 0.95, 1], clamp), o = interpolate(f - F(a), [0, 3], [0, 1], clamp) * (1 - interpolate(t, [b, b + 0.2], [0, 1], clamp));
  const typed = Math.floor(interpolate(f - F(a) - 6, [0, 14], [0, 1], clamp) * 100);
  return (
    <div style={{ position: "absolute", left: 60, top: 262, display: "flex", alignItems: "center", gap: 22, opacity: o }}>
      <div style={{ position: "relative", background: "#FFE58A", padding: "12px 22px 8px", transform: `rotate(-4deg) scale(${k})`, boxShadow: "3px 6px 12px rgba(90,70,20,0.2)", ...K, fontSize: 34, color: c, whiteSpace: "nowrap" }}>
        <div style={{ position: "absolute", left: "50%", top: -14, width: 80, height: 26, marginLeft: -40, background: "rgba(255,255,255,0.65)", transform: "rotate(4deg)" }} />{tag}
      </div>
      <span style={{ ...K, fontSize: 52, color: INK, whiteSpace: "nowrap", clipPath: `inset(0 ${100 - typed}% 0 0)` }}>{title}</span>
    </div>
  );
};

const Img: React.FC<{ n: string; s: number }> = ({ n, s }) => <GenSlot name={n} size={s} />;
// 表情の差し替え（同じ位置で画像だけ変わる・切り替えの瞬間に少しはねる）
const Swap: React.FC<{ x: number; y: number; s: number; seq: [number, string][]; until: number; from?: "l" | "r" }> = ({ x, y, s, seq, until, from = "l" }) => {
  const f = useCurrentFrame();
  const t = t30(f);
  if (t < seq[0][0] || t >= until + 0.3) return null;
  let cur = seq[0]; seq.forEach((q) => { if (t >= q[0]) cur = q; });
  const inP = interpolate(f - F(seq[0][0]), [0, 9], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const outP = interpolate(t, [until, until + 0.3], [0, 1], clamp);
  const pop = interpolate(f - F(cur[0]), [0, 3, 7], [1.08, 0.97, 1], clamp);
  const bob = Math.sin(f / 9) * 4;
  const dx = (from === "l" ? -1 : 1) * 500;
  return <div style={{ position: "absolute", left: x + (1 - inP) * dx, top: y + bob, opacity: 1 - outP, transform: `scale(${pop})`, transformOrigin: "50% 100%" }}><Img n={cur[1]} s={s} /></div>;
};

// ── 下の説明：1日あたりの手取り（棒） ──
const BX = 60, BY = 990, BW = 960, BH = 300, BASE = BY + BH - 46, PX = 190 / 11000;
const LX0 = BX + 110, RX0 = BX + 420;
const BarsCard: React.FC = () => {
  const f = useCurrentFrame();
  const t = t30(f);
  if (t < 14.48 || t >= 36.9) return null;
  const inP = interpolate(f - F(14.48), [0, 10], [0, 1], { ...clamp, easing: OUTE });
  const outP = interpolate(t, [36.5, 36.9], [0, 1], clamp);
  const g67 = interpolate(f - F(18.02), [0, 12], [0, 1], { ...clamp, easing: OUTE });
  const drop13 = interpolate(f - F(19.4), [0, 8], [-160, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const off13 = interpolate(t, [33.68, 34.3], [0, 1], clamp);
  const ghost = interpolate(f - F(24.98), [0, 8], [0, 1], clamp);
  const fallTax = Math.max(0, f - F(25.9)), fallSoc = Math.max(0, f - F(26.5));
  const LX = BX + 110, RX = BX + 420, BWD = 200;
  const h = (v: number) => v * PX;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * 80}px)` }}>
      <div style={{ position: "absolute", left: BX, top: BY, width: BW, height: BH, background: "#fff", border: `5px solid ${INK}`, borderRadius: 24, boxShadow: `7px 9px 0 ${INK}` }} />
      <div style={{ position: "absolute", left: BX + 24, top: BY + 14, ...K, fontSize: 30, color: INK }}>1日あたりの手取り</div>
      <div style={{ position: "absolute", left: BX + 30, top: BASE, width: BW - 60, height: 5, background: INK }} />
      {/* 普段の手取り */}
      {ghost > 0 && fallSoc < 30 ? <div style={{ position: "absolute", left: LX, top: BASE - h(11000), width: BWD, height: h(11000), border: `4px dashed ${SUB}`, borderRadius: 10, opacity: ghost }} /> : null}
      {ghost > 0 && fallTax < 26 ? <div style={{ position: "absolute", left: LX, top: BASE - h(11000) + fallTax * fallTax * 0.9, width: BWD, height: h(800), background: "#C9C2B0", border: `3px solid ${INK}`, borderRadius: 8, opacity: ghost * (1 - fallTax / 26), transform: `rotate(${fallTax * 1.5}deg)`, ...B, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>税金</div> : null}
      {ghost > 0 && fallSoc < 26 ? <div style={{ position: "absolute", left: LX, top: BASE - h(10200) + fallSoc * fallSoc * 0.9, width: BWD, height: h(1600), background: "#B5AE9C", border: `3px solid ${INK}`, borderRadius: 8, opacity: ghost * (1 - fallSoc / 26), transform: `rotate(${-fallSoc * 1.2}deg)`, ...B, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>社会保険料</div> : null}
      <div style={{ position: "absolute", left: LX, top: BASE - h(8600), width: BWD, height: h(8600), background: SUB, border: `4px solid ${INK}`, borderRadius: "10px 10px 0 0" }} />
      <div style={{ position: "absolute", left: LX - 30, width: BWD + 60, top: BASE + 8, textAlign: "center", ...K, fontSize: 24 }}>普段の手取り</div>
      <div style={{ position: "absolute", left: LX, width: BWD, top: BASE - h(8600) + 12, textAlign: "center", ...SER, fontSize: 34, color: "#fff" }}>約8,600円</div>
      {ghost > 0.5 && fallSoc < 30 ? <div style={{ position: "absolute", left: LX - 20, width: BWD + 40, top: BASE - h(11000) - 36, textAlign: "center", ...B, fontSize: 22, color: SUB }}>額面 11,000円</div> : null}
      {/* 手当 */}
      <div style={{ position: "absolute", left: RX, top: BASE - h(7370) * g67, width: BWD, height: h(7370) * g67, background: ORG, border: g67 > 0 ? `4px solid ${INK}` : undefined, borderRadius: off13 > 0.5 ? "10px 10px 0 0" : 0 }}>{g67 > 0.9 ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 40, color: "#fff" }}>67%</div> : null}</div>
      {t >= 19.4 ? <div style={{ position: "absolute", left: RX, top: BASE - h(8800) + drop13 - off13 * 90, width: BWD, height: h(1430), background: GRN, border: `4px solid ${INK}`, borderRadius: "10px 10px 0 0", opacity: 1 - off13, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 30, color: "#fff" }}>＋13%</div> : null}
      <div style={{ position: "absolute", left: RX - 30, width: BWD + 60, top: BASE + 8, textAlign: "center", ...K, fontSize: 24 }}>育休の手当</div>
      {t >= 21.12 && t < 33.68 ? <div style={{ position: "absolute", left: RX - 40, width: BWD + 80, top: BASE - h(8800) - 48, textAlign: "center", ...SER, fontSize: 36, color: GRN }}>80%＝8,800円</div> : null}
      {t >= 33.68 ? <div style={{ position: "absolute", left: RX - 40, width: BWD + 80, top: BASE - h(7370) - 48, textAlign: "center", ...SER, fontSize: 34, color: ORG }}>67%＝7,370円</div> : null}
      {t >= 21.3 && t < 33.68 ? <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><line x1={LX} x2={RX + BWD} y1={BASE - h(8700)} y2={BASE - h(8700)} stroke={GRN} strokeWidth={5} strokeDasharray="12 9" opacity={interpolate(f - F(21.3), [0, 6], [0, 1], clamp)} /></svg> : null}
      {/* 出生後休業支援給付金 */}
      {t >= 22.14 && t < 33.68 ? <div style={{ position: "absolute", left: RX + BWD + 16, top: BASE - h(8800) + 4, opacity: interpolate(f - F(22.14), [0, 5], [0, 1], clamp) }}>
        <div style={{ position: "absolute", left: 0, top: 18, width: 40 * interpolate(f - F(22.14), [0, 5], [0, 1], clamp), height: 5, background: INK }} />
        <div style={{ position: "absolute", left: 32, top: 10, width: 20, height: 20, borderRadius: "50%", background: YEL, border: `4px solid ${INK}` }} />
      </div> : null}
      {t >= 22.3 && t < 33.68 ? <At at={22.3} x={RX + BWD + 62} y={BASE - h(8800) - 14} mode="pop"><div style={{ background: GRN, color: "#fff", borderRadius: 14, padding: "6px 14px", ...K, fontSize: 24, lineHeight: 1.25, border: `4px solid ${INK}` }}>出生後休業<br />支援給付金<div style={{ ...B, fontSize: 18 }}>（2025年4月〜）</div></div></At> : null}
      {/* 税金0円・社会保険料0円 */}
      {t >= 25.9 && t < 33.68 ? <At at={25.9} x={RX + BWD + 64} y={BASE - 150} mode="pop"><Tag c={GRN} size={24}>✓ 税金 0円</Tag></At> : null}
      {t >= 26.5 && t < 33.68 ? <At at={26.5} x={RX + BWD + 64} y={BASE - 100} mode="pop"><Tag c={GRN} size={24}>✓ 社会保険料 0円</Tag></At> : null}
      {/* 29日目から */}
      {t >= 34.3 ? <At at={34.3} x={RX + BWD + 50} y={BASE - 190} mode="drop"><div style={{ background: "#FFF4E6", border: `4px solid ${ORG}`, borderRadius: 16, padding: "8px 16px", ...K, fontSize: 26, color: INK, lineHeight: 1.3, whiteSpace: "nowrap" }}>普段の手取りの<br /><span style={{ ...SER, fontSize: 40, color: ORG }}>約86%</span>＝8割ちょっと</div></At> : null}
    </div>
  );
};

// 給料明細（保険料の免除）
const Payslip: React.FC = () => {
  const f = useCurrentFrame();
  const t = t30(f);
  if (t < 41.3 || t >= 47.2) return null;
  const inP = interpolate(f - F(41.3), [0, 10], [0, 1], { ...clamp, easing: OUTE });
  const outP = interpolate(t, [46.8, 47.2], [0, 1], clamp);
  const strike = (at: number) => interpolate(f - F(at), [0, 6], [0, 1], clamp);
  const rows: [string, string, number][] = [["厚生年金", "約3.1万円", 42.3], ["健康保険", "約1.7万円", 42.7]];
  return (
    <div style={{ position: "absolute", left: 60, top: 990, width: 520, height: 300, opacity: inP * (1 - outP), transform: `translateX(${(1 - inP) * -300}px) rotate(-1.5deg)` }}>
      <div style={{ position: "absolute", inset: 0, background: "#fff", border: `5px solid ${INK}`, borderRadius: 20, boxShadow: `6px 8px 0 ${INK}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 16, textAlign: "center", ...K, fontSize: 32 }}>給料から引かれる保険料（月）</div>
      {rows.map(([n, v, at], i) => (
        <div key={n} style={{ position: "absolute", left: 40, right: 40, top: 76 + i * 70, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "3px dashed #E2DCC8", ...K, fontSize: 34 }}>
          <span>{n}</span><span style={{ ...SER, color: RED }}>{v}</span>
          <div style={{ position: "absolute", left: -10, top: 30, height: 6, width: `${strike(at) * 104}%`, background: BLU, borderRadius: 3 }} />
        </div>
      ))}
      {t >= 43.2 ? <div style={{ position: "absolute", right: 24, bottom: 20, width: 120, height: 120, borderRadius: "50%", border: `7px solid ${BLU}`, color: BLU, ...K, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(-14deg) scale(${interpolate(f - F(43.2), [0, 3, 6], [2.2, 0.9, 1], clamp)})`, background: "rgba(255,255,255,0.85)" }}>免除</div> : null}
      <div style={{ position: "absolute", left: 40, bottom: 26, ...B, fontSize: 22, color: SUB }}>※月給33万円・会社員本人の分</div>
    </div>
  );
};

// 12か月の箱（国民年金）
const TwelveBoxes: React.FC = () => {
  const f = useCurrentFrame();
  const t = t30(f);
  if (t < 76.9 || t >= 80.44) return null;
  return (
    <div style={{ position: "absolute", left: 70, top: 1080, width: 940 }}>
      <div style={{ display: "flex", gap: 10 }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const on = f >= F(78.62) + i * 2;
          const k = interpolate(f - (F(76.9) + i * 1.5), [0, 3, 6], [0, 1.15, 1], clamp);
          return <div key={i} style={{ width: 68, height: 68, borderRadius: 12, border: `4px solid ${INK}`, background: on ? GRN : "#fff", color: on ? "#fff" : INK, ...K, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})` }}>{i + 1}</div>;
        })}
      </div>
      <div style={{ marginTop: 14, textAlign: "center", ...K, fontSize: 34, opacity: interpolate(f - F(79.7), [0, 6], [0, 1], clamp) }}>国民年金の保険料 <span style={{ color: GRN, ...SER, fontSize: 48 }}>最大12か月</span> 免除</div>
    </div>
  );
};

// LINEのトーク画面風（ロゴは出さない）
const ChatMock: React.FC = () => {
  const f = useCurrentFrame();
  const t = t30(f);
  if (t < 89.7) return null;
  const inP = interpolate(f - F(89.7), [0, 9], [0, 1], { ...clamp, easing: OUTE });
  const word = "育休相談";
  const n = Math.floor(interpolate(f - F(90.2), [0, 16], [0, word.length], clamp));
  const sent = t >= 91.05;
  return (
    <div style={{ position: "absolute", left: 150, top: 380, width: 520, height: 820, transform: `translateY(${(1 - inP) * 500}px)`, opacity: inP }}>
      <div style={{ position: "absolute", inset: 0, background: "#fff", border: `8px solid ${INK}`, borderRadius: 54, boxShadow: `8px 10px 0 ${INK}`, overflow: "hidden" }}>
        <div style={{ height: 96, background: "#06C755", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 32 }}>たいち｜公式LINE</div>
        <div style={{ position: "absolute", left: 24, top: 130, background: "#EFEFEF", borderRadius: 20, padding: "12px 18px", ...B, fontSize: 24, color: INK, maxWidth: 380 }}>友だち追加ありがとうございます！<br />気になることを送ってください</div>
        {sent ? <div style={{ position: "absolute", right: 24, top: 290, background: "#8DE055", borderRadius: 22, padding: "14px 24px", ...K, fontSize: 40, color: INK, transform: `scale(${interpolate(f - F(91.05), [0, 3, 6], [0.4, 1.12, 1], clamp)})`, transformOrigin: "100% 50%" }}>育休相談</div> : null}
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 26, height: 80, borderRadius: 40, border: `4px solid #D6D6D6`, display: "flex", alignItems: "center", padding: "0 26px", ...K, fontSize: 38, color: INK }}>{sent ? "" : word.slice(0, n)}{!sent && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: "#06C755" }}>|</span> : null}</div>
      </div>
    </div>
  );
};

// ════════ 本体（図解はすべて1枚の上） ════════
const Body: React.FC = () => {
  const f = useCurrentFrame();
  const t = t30(f);
  return (
    <>
      <Calendar />
      <Heads />
      {/* 8週間の札 */}
      <At at={3.0} until={6.8} x={380} y={1000} mode="drop"><Pill c={GRN} size={30}>生まれてから8週間（1/26まで）</Pill></At>
      {/* ① 結論 */}
      <At at={1.1} until={4.1} x={60} y={1000} mode="spring"><Img n="pk_family_newborn" s={270} /></At>
      <Swap x={60} y={1000} s={250} seq={[[4.18, "pk_dad_calendar_ok"]]} until={6.75} />
      {t < 6.8 ? <Flip at={5.42} x={380} y={1100}><div style={{ display: "flex", gap: 20 }}><div style={{ background: "#fff", border: `5px solid ${GRN}`, borderRadius: 20, padding: "10px 22px", ...K, fontSize: 40, boxShadow: `5px 6px 0 ${INK}` }}>①8週間以内</div><div style={{ background: "#fff", border: `5px solid ${GRN}`, borderRadius: 20, padding: "10px 22px", ...K, fontSize: 40, boxShadow: `5px 6px 0 ${INK}` }}>②14日以上</div></div></Flip> : null}
      {t < 6.8 ? <HandCircle at={5.8} until={6.75} x={660} y={1135} r={290} ry={66} c={RED} /> : null}
      {/* ② 例えば・28日・10割 */}
      <Rays at={13.56} until={16.0} cx={540} cy={1120} />
      <Swap x={60} y={1000} s={260} seq={[[11.56, "pk_dad_hold_baby"]]} until={14.4} />
      <At at={13.56} until={14.45} x={380} y={1080} mode="slam"><Big size={60}>手取り 実質10割！</Big></At>
      <BarsCard />
      {t >= 29.18 && t < 31.0 ? <Ring at={29.18} until={30.9} x={(LX0 + RX0 + 200) / 2} y={BASE - 150} r={250} c={GRN} /> : null}
      {t < 36.86 ? <Foot at={15.0} y={1300}>※月給33万円の例（休む前6か月の給料の平均・ボーナスは入らない）。上乗せは最大28日分。月給が約50万円を超えると上限があり10割に届きません。181日目からは50%</Foot> : null}
      {/* ③ 13日 */}
      <Swap x={60} y={1000} s={250} seq={[[36.86, "pk_dad_calendar_ok"], [37.22, "pk_dad_calendar_oops"]]} until={41.15} />
      <Spot at={40.0} until={41.1} rect={[CX0 - 14, CY - 14, MW + 28, CALH + 28]} r={26} color={RED} />
      <Alarm at={39.9} until={41.1} x={880} y={250} />
      <At at={38.2} until={41.15} x={380} y={1060} mode="drop"><div style={{ background: "#fff", border: `6px solid ${RED}`, borderRadius: 20, padding: "8px 26px", boxShadow: `6px 8px 0 ${INK}`, whiteSpace: "nowrap" }}><span style={{ ...K, fontSize: 32 }}>上乗せ </span><span style={{ ...SER, fontSize: 80, color: RED }}>{t >= 40.0 ? <Num at={40.0} from={20000} to={0} dur={12} /> : "約20,000"}</span><span style={{ ...K, fontSize: 32 }}>円</span></div></At>
      <Crack at={40.05} until={41.1} x={680} y={1110} s={1.0} />
      <Shards at={40.1} x={680} y={1110} c={RED} />
      {t < 41.2 ? <Foot at={38.2} y={1300}>※月給33万円の例。14日なら上乗せは約2万円（13%×14日）。14日は、生まれてから8週間の中の合計</Foot> : null}
      {/* ④ 保険料 */}
      <Payslip />
      <At at={44.16} until={45.2} x={640} y={1010} mode="pop"><div style={{ background: "#EEE", border: `4px solid ${SUB}`, borderRadius: 16, padding: "8px 20px", ...K, fontSize: 36, color: SUB }}>14日分だけ？</div></At>
      {t >= 44.9 && t < 45.3 ? <div style={{ position: "absolute", left: 720, top: 990, ...K, fontSize: 110, color: RED }}>✕</div> : null}
      <At at={45.24} until={46.9} x={640} y={1010} mode="slam"><div style={{ background: BLU, color: "#fff", border: `5px solid ${INK}`, borderRadius: 18, padding: "8px 24px", ...K, fontSize: 40, boxShadow: `5px 6px 0 ${INK}` }}>1か月分まるごと</div></At>
      <At at={46.22} until={46.9} x={660} y={1110} mode="pop"><span style={{ ...SER, fontSize: 64, color: BLU }}>約4.8万円</span></At>
      <At at={46.94} until={50.6} x={70} y={1010} mode="drop"><Pill c={BLU} size={36}>① 月末を含む</Pill></At>
      <At at={47.92} until={50.6} x={70} y={1100} mode="drop"><Pill c={BLU} size={36}>② 同じ月に14日以上</Pill></At>
      <At at={48.3} until={50.6} x={560} y={1020} mode="pop"><div style={{ ...K, fontSize: 36, lineHeight: 1.35, textAlign: "center", background: "#fff", border: `4px solid ${BLU}`, borderRadius: 18, padding: "10px 22px" }}>どちらかで<br /><span style={{ color: BLU }}>その月まるごと免除</span></div></At>
      <Swap x={50} y={1010} s={290} seq={[[50.68, "pk_dad_submit"]]} until={56.25} />
      <At at={51.2} until={54.1} x={400} y={1030} mode="drop"><div style={{ width: 560, background: "#FFF8E3", border: `4px solid ${INK}`, borderRadius: 16, padding: "10px 18px", ...K, fontSize: 28, lineHeight: 1.4 }}>📝 2回に分けるなら<br />最初にまとめて会社に申し出（原則2週間前まで）</div></At>
      <Spot at={54.16} until={56.2} rect={[CX0 - 16, CY - 30, MW + 32, CALH * BOTH + 50]} r={26} color={BLU} />
      <At at={55.14} until={56.25} x={320} y={800} mode="slam"><div style={{ background: "#fff", border: `6px solid ${BLU}`, borderRadius: 20, padding: "6px 24px", boxShadow: `6px 8px 0 ${INK}`, whiteSpace: "nowrap" }}><span style={{ ...K, fontSize: 30 }}>2か月分 </span><span style={{ ...SER, fontSize: 60, color: BLU }}>約9.6万円</span></div></At>
      {t < 56.3 ? <Foot at={41.6} y={1300}>※月給33万円の例。免除は会社が手続き。免除されても将来の年金は減りません。育休中に働いた日は14日に入りません。住民税は免除になりません</Foot> : null}
      {/* ⑤ ボーナス */}
      <Swap x={60} y={1000} s={260} seq={[[56.6, "pk_dad_bonus_happy"], [61.3, "pk_dad_bonus_sad"], [66.86, "pk_dad_bonus_happy"]]} until={68.9} />
      <At at={61.3} until={63.2} x={380} y={1060} mode="drop"><div style={{ background: "#F1EEE6", border: `5px solid ${SUB}`, borderRadius: 18, padding: "10px 22px", ...K, fontSize: 38, color: SUB, whiteSpace: "nowrap" }}>14日だと ボーナス分は ✕</div></At>
      <At at={63.26} until={68.9} x={380} y={1010} mode="drop"><Pill c={BLU} size={32}>月末を含めて 1か月を超える</Pill></At>
      <At at={65.24} until={66.8} x={380} y={1090} mode="drop"><Tag c={SUB} size={28}>1/1まで＝ちょうど1か月 ✕</Tag></At>
      <At at={65.9} until={66.8} x={380} y={1150} mode="pop"><Tag c={BLU} size={28}>1/2から＝1か月を超える ○</Tag></At>
      <At at={66.86} until={68.9} x={360} y={1100} mode="slam"><div style={{ background: "#fff", border: `6px solid ${BLU}`, borderRadius: 20, padding: "6px 24px", boxShadow: `6px 8px 0 ${INK}`, whiteSpace: "nowrap" }}><span style={{ ...K, fontSize: 28 }}>ボーナスの保険料 </span><span style={{ ...SER, fontSize: 60, color: BLU }}>約7.4万円</span><span style={{ ...K, fontSize: 28 }}> 免除</span></div></At>
      {t < 68.98 ? <Foot at={57.0} y={1300}>※ボーナス52万円の例。産後パパ育休は最大28日なので、1か月を超えるなら普通の育休で。最初の28日は上乗せで10割</Foot> : null}
      {/* ⑥ フリーランス */}
      <At at={69.2} until={80.3} x={70} y={420} mode="drop"><div style={{ width: 400, background: "#fff", border: `5px solid ${GRN}`, borderRadius: 22, padding: "18px 10px", textAlign: "center", boxShadow: `6px 8px 0 ${INK}`, ...K, fontSize: 36 }}>会社員<div style={{ ...B, fontSize: 24, color: SUB }}>雇用保険あり</div><div style={{ ...K, fontSize: 60, color: GRN }}>✓</div></div></At>
      <Swap x={560} y={430} s={380} seq={[[71.0, "pk_freelance_worry"], [75.14, "pk_freelance_relief"]]} until={80.3} from="r" />
      {t >= 72.74 && t < 74.38 ? <div style={{ position: "absolute", left: 540, top: 410, width: 420, height: 420, background: "rgba(150,150,150,0.35)", borderRadius: 30 }} /> : null}
      <At at={72.74} until={74.38} x={560} y={850} mode="slam"><Stamp c={SUB} size={40} bg="#F1EEE6">雇用保険なし → 対象外</Stamp></At>
      {t < 80.3 ? <Flip at={74.38} x={110} y={760}><div style={{ background: RED, color: "#fff", borderRadius: 14, padding: "8px 22px", ...K, fontSize: 36, border: `4px solid ${INK}` }}>NEW 2026年10月〜</div></Flip> : null}
      <TwelveBoxes />
      {t < 80.44 ? <Foot at={71.0} y={1300}>※国民年金の育児期間の免除。所得の条件なし・届け出が必要。免除の期間も年金は減りません。国民健康保険料は対象外。パート・契約社員も雇用保険に入っていれば会社員と同じ</Foot> : null}
      {/* ⑦ ママ */}
      <Swap x={660} y={1060} s={230} seq={[[80.7, "pk_mom_baby_smile"], [82.42, "pk_mom_baby_worry"]]} until={84.4} from="r" />
      <Swap x={60} y={1070} s={240} seq={[[81.36, "pk_dad_at_work"]]} until={84.4} />
      {t >= 80.7 && t < 84.4 ? (() => {
        const p = interpolate(f - F(80.9), [0, 8], [0, 1], clamp), br = t >= 82.42;
        return <>
          <div style={{ position: "absolute", left: 90, top: 1000, background: t >= 81.4 ? "#CFCAC0" : GRN, color: "#fff", borderRadius: 14, padding: "6px 18px", ...K, fontSize: 30, border: `4px solid ${INK}`, whiteSpace: "nowrap" }}>パパの14日{t >= 81.4 ? " ✕" : ""}</div>
          <div style={{ position: "absolute", left: 330, top: 1022, width: 300 * p, height: 8, background: br ? RED : INK, opacity: br ? 0.5 : 1, backgroundImage: br ? "repeating-linear-gradient(90deg, #fff 0 18px, transparent 18px 34px)" : undefined }} />
          {p > 0.95 ? <div style={{ position: "absolute", left: 630, top: 1000, background: br ? "#CFCAC0" : GRN, color: "#fff", borderRadius: 14, padding: "6px 18px", ...K, fontSize: 30, border: `4px solid ${INK}`, whiteSpace: "nowrap" }}>ママの上乗せ{br ? " ✕" : ""}</div> : null}
        </>;
      })() : null}
      <Crack at={82.42} until={84.4} x={480} y={1026} s={0.8} />
      {t < 84.4 ? <Foot at={81.0} y={1300}>※パパが会社員の場合。ママが専業主婦や自営業なら、パパは自分の14日だけで10割。ママの期間は生まれてから16週間以内</Foot> : null}
      {/* ⑧ 締め */}
      <At at={84.6} until={88.0} x={370} y={995} mode="spring"><Img n="pk_family_happy_baby" s={300} /></At>
      <TapCard at={88.02} until={89.65} src="cta_jidou/profile.jpg" iw={1179} ih={872} x={90} y={420} w={900} hit={[0.02, 0.915, 0.5, 0.075]} dimAt={88.4} tapAt={89.0} label={<>プロフの<span style={{ color: "#06C755" }}>公式LINE</span>から</>} />
      <ChatMock />
      <Swap x={800} y={880} s={200} seq={[[89.8, "pk_dad_phone_line"]]} until={92.2} from="r" />
      <At at={90.3} x={560} y={1110} mode="slam"><Big bg="#06C755" fg="#fff" size={52}>「育休相談」</Big></At>
      <At at={91.1} x={660} y={560} mode="spring"><Img n="pk_online_consult" s={360} /></At>
    </>
  );
};

// 右下のたいち（気持ちが動く所だけ）
const APPEAR: [number, number, string][] = [[13.56, 16.0, "taichi_thumbs_up"], [40.0, 42.4, "taichi_scared"], [54.16, 56.2, "taichi_ok_circle"], [61.3, 63.1, "taichi_worry"], [82.42, 84.3, "taichi_worry"]];
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  const a = APPEAR.find(([s0, e]) => f >= F(s0) - 2 && f < F(e) + 8);
  if (!a) return null;
  const [s0, e, name] = a;
  const inP = interpolate(f, [F(s0) - 2, F(s0) + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const outP = interpolate(f, [F(e), F(e) + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const lv = PAPA_MOUTH.charCodeAt(Math.min(PAPA_MOUTH.length - 1, f)) - 48;
  void lv;
  return <div style={{ position: "absolute", left: 755 + (1 - inP) * 380 + outP * 380, top: 1142 + Math.sin(f / 10) * 3, width: 200, height: 200 }}><GenSlot name={name} size={200} /></div>;
};

// 字幕（*緑*＝得、!赤!＝注意）
const SUBS: [number, string][] = [
  [0.0, "パパが*手取り10割*で育休を取るには"], [2.28, "生まれてから*8週間以内*に"], [4.18, "*14日以上*取ること"], [5.42, "これが一番大事です"],
  [6.84, "例えば、12月1日に生まれたとします"], [9.28, "1日から28日まで休むと"], [11.56, "この28日間は、手取りが*実質10割*"],
  [14.48, "なんで10割かっていうと"], [15.94, "14日以上取ると、給料の67%に"], [19.4, "*13%*が上乗せされて*80%*"], [22.14, "これが*出生後休業支援給付金*っていう制度"],
  [24.98, "しかも手当には、税金も社会保険料も"], [27.28, "*かからない*ので"], [28.24, "手取りで見ると、*実質10割*になります"],
  [30.5, "ちなみに29日目からは67%に戻って"], [34.3, "実質、手取りの*8割ちょっと*になります"],
  [36.86, "逆に、!13日!だと67%だけで"], [40.0, "上乗せは!0円!"],
  [41.2, "それと、育休中の社会保険料の免除に関しては"], [44.16, "ここがポイントで"], [45.24, "免除は*1か月まるごと*"],
  [46.94, "*月末*を含むか"], [47.92, "同じ月に*14日以上*休めばいいので"], [50.68, "産後パパ育休を14日ずつ"], [52.66, "別の月に2回取れば"], [54.16, "*2か月分*が、まるごと免除になります"],
  [56.3, "同じように、ボーナスの保険料にもルールがあって"], [59.26, "ボーナス月に14日休んでも"], [61.3, "ボーナス分は!免除されません!"],
  [63.26, "ボーナス月の月末を含めて"], [65.24, "*1か月を超えて*休むと"], [66.86, "ボーナスの保険料も*免除*になります"],
  [68.98, "とはいえ、これは会社員の話で"], [71.0, "個人事業主やフリーランスは"], [72.74, "雇用保険がないので!対象外!"],
  [74.38, "その代わり2026年10月から"], [76.9, "国民年金の保険料が"], [78.62, "*最大1年免除*になりました"],
  [80.44, "ちなみに、パパが14日取らないと"], [82.42, "ママも!手取り10割にはなりません!"],
  [84.48, "自分の場合はいくらもらえるのか？"], [86.76, "何日取るといいのか？"], [88.02, "気になる方はプロフの*公式LINE*に"], [90.2, "*「育休相談」*と送ってください"],
];
const END = 91.95;

// 効果音（u01〜u10だけ・最初の1秒は鳴らさない・高い音は大の3回だけ）
const s = (file: string, t: number, volume = 0.2) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  s("u02s", 1.1, 0.16), s("u05s", 3.0, 0.16), s("u02s", 5.1, 0.16), s("u05s", 5.42, 0.2),
  s("u03s", 6.84, 0.2), s("u02s", 10.8, 0.16), s("u04", 13.56, 0.26),
  s("u03s", 14.48, 0.18), s("u05s", 18.02, 0.16), s("u05", 19.4, 0.2), s("u02s", 21.12, 0.16), s("u02s", 22.3, 0.16), s("u07", 25.9, 0.12), s("u07", 26.5, 0.12), s("u05s", 29.18, 0.18), s("u02s", 34.3, 0.16),
  s("u03s", 36.86, 0.2), s("u07", 37.22, 0.16), s("u10", 40.0, 0.24),
  s("u03s", 41.2, 0.2), s("u05s", 43.2, 0.18), s("u05", 45.24, 0.2), s("u02s", 46.22, 0.16), s("u02s", 46.94, 0.16), s("u02s", 47.92, 0.16), s("u02s", 51.2, 0.16), s("u04", 54.3, 0.24), s("u05s", 54.6, 0.18),
  s("u03s", 56.3, 0.2), s("u02s", 59.9, 0.16), s("u07", 61.3, 0.16), s("u02s", 63.26, 0.16), s("u05", 66.86, 0.22),
  s("u03s", 68.98, 0.2), s("u02s", 71.0, 0.16), s("u07", 72.74, 0.16), s("u05s", 74.38, 0.18), s("u02s", 78.62, 0.16),
  s("u03s", 80.44, 0.2), s("u02s", 81.36, 0.16), s("u07", 82.42, 0.16),
  s("u03s", 84.48, 0.2), s("u02s", 89.0, 0.18), s("u02s", 91.05, 0.18), s("u10", 90.3, 0.22),
];

const CamKeys: CamKey[] = [
  { t: 13.56, x: 540, y: 930, s: 1.03, d: 6 }, { t: 14.4, x: 540, y: 960, s: 1, d: 10 },
];
const CapBand: React.FC = () => {
  const f = useCurrentFrame();
  const w = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: OUTE }) * (1 - interpolate(f, [F(END), F(END) + 8], [0, 1], clamp));
  return <div style={{ position: "absolute", left: 540 - 410 * w, width: 820 * w, top: 1340, height: 112, borderRadius: 999, background: "rgba(255,255,255,0.72)", boxShadow: "0 6px 18px rgba(120,90,20,0.10)" }} />;
};
const STEP_S = 0.6;
const SAFE = 0.9, SAFE_X = 540 - 540 * 0.9, SAFE_Y = 300 - 280 * 0.9;
export const PAPA_FRAMES = F(END + 0.4);
export const PapaReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }}>
    <Audio src={staticFile("papa-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Camera keys={CamKeys}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${SAFE_X}px, ${SAFE_Y}px) scale(${SAFE})`, transformOrigin: "0 0" }}><Body /></div>
    </Camera>
    <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${STEP_S})`, transformOrigin: "0 0" }}><Stepper labels={["10割", "13日", "保険料", "ボーナス", "注意"]} steps={[0, 36.86, 41.2, 56.3, 68.98]} x={600 / STEP_S} y={140 / STEP_S} color={GRN} /></div>
    <Chara />
    <CapBand />
    <Captions subs={SUBS} end={END} maxW={740} size={0.78} kcol={{ g: BND, r: RED }} top={1352} swap />
  </AbsoluteFill>
);
