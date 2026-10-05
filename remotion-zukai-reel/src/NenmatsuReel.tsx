import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 年末調整リール「完全再現」= 1画面で完結する積み上げ連結図解
//   ・白背景。スクロール/場面転換なし。全ノードが同じ1枚に収まる
//   ・喋り(想定)に合わせて要素が1個ずつ足されていき、消えずに残る
//   ・最後に全体図が1画面に完成する
//   ・アクセントはオレンジ(年末調整・還付)、対象外はグレー(自営業)
//   ・下部に大きい青テロップ(読み上げ想定で順次切替)
//   ・アイコンは全部コード内SVG。音声なし(練習・今後のテンプレ用)
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#FFFFFF",
  ink: "#223049",
  sub: "#6B7686",
  orange: "#F0872A",
  orangeBg: "#FDEBD8",
  gray: "#AAB4C0",
  grayBg: "#EEF1F4",
  line: "#C9D2DD",
  blue: "#1F6FEB",
};

const FPS_LOCAL = 30;

// 全体 35秒。要素は ~720fまでに全部出て、以降は完成図を保持
export const NEN_FRAMES = 1050;

const CX = 540;

// ── 共通アニメ ───────────────────────────────────────
const useS = (delay: number, dur = 20, cfg: Parameters<typeof spring>[0]["config"] = { damping: 14, stiffness: 140, mass: 0.8 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};

const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useS(delay);
  return <div style={{ opacity: Math.min(1, s * 1.9), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};

// つなぎ線（上ノード下端→下ノード上端）。board座標・固定。
const Link: React.FC<{ x1: number; y1: number; x2: number; y2: number; delay: number; color?: string; dash?: boolean }> = ({ x1, y1, x2, y2, delay, color = C.line, dash }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const midY = (y1 + y2) / 2;
  const d = `M${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  return (
    <path d={d} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
      pathLength={1} strokeDasharray={dash ? "8 10" : 1} strokeDashoffset={dash ? 0 : 1 - p}
      opacity={dash ? p : p > 0.001 ? 1 : 0} />
  );
};

// ── アイコン（コード内SVG） ─────────────────────────
type I = { s?: number; color?: string };
const IPerson: React.FC<I> = ({ s = 40, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="15" r="9" fill={color} /><path d="M8 42c0-9 7-15 16-15s16 6 16 15" fill={color} /></svg>
);
const IFamily: React.FC<I> = ({ s = 44, color = C.ink }) => (
  <svg width={s} height={s * 0.86} viewBox="0 0 56 48"><circle cx="18" cy="14" r="7" fill={color} /><path d="M6 40c0-7 5-12 12-12s12 5 12 12" fill={color} /><circle cx="40" cy="17" r="5.5" fill={color} /><path d="M30 40c0-6 4-10 10-10s10 4 10 10" fill={color} /></svg>
);
const ICalc: React.FC<I> = ({ s = 40, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><rect x="9" y="5" width="30" height="38" rx="5" fill={color} /><rect x="14" y="10" width="20" height="7" rx="2" fill="#fff" /><circle cx="16" cy="25" r="2.4" fill="#fff" /><circle cx="24" cy="25" r="2.4" fill="#fff" /><circle cx="32" cy="25" r="2.4" fill="#fff" /><circle cx="16" cy="33" r="2.4" fill="#fff" /><circle cx="24" cy="33" r="2.4" fill="#fff" /><circle cx="32" cy="33" r="2.4" fill="#fff" /></svg>
);
const IEnvelope: React.FC<I> = ({ s = 40, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><rect x="5" y="11" width="38" height="26" rx="4" fill={color} /><path d="M7 14l17 12 17-12" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ICoin: React.FC<I> = ({ s = 40, color = C.orange }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill={color} /><text x="24" y="31" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff" fontFamily={FONT}>¥</text></svg>
);
const ICalendar: React.FC<I> = ({ s = 40, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><rect x="7" y="9" width="34" height="32" rx="5" fill={color} /><rect x="7" y="9" width="34" height="9" rx="5" fill={C.orange} /><rect x="14" y="5" width="4" height="8" rx="2" fill={color} /><rect x="30" y="5" width="4" height="8" rx="2" fill={color} /><rect x="13" y="24" width="6" height="5" rx="1.5" fill="#fff" /><rect x="22" y="24" width="6" height="5" rx="1.5" fill="#fff" /><rect x="31" y="24" width="4" height="5" rx="1.5" fill="#fff" /><rect x="13" y="32" width="6" height="5" rx="1.5" fill="#fff" /><rect x="22" y="32" width="6" height="5" rx="1.5" fill="#fff" /></svg>
);
const IHouse: React.FC<I> = ({ s = 40, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><path d="M24 7L7 21v20h34V21z" fill={color} /><rect x="20" y="29" width="8" height="12" fill="#fff" /></svg>
);
const IShield: React.FC<I> = ({ s = 40, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><path d="M24 5l15 6v12c0 11-7 17-15 20-8-3-15-9-15-20V11z" fill={color} /><path d="M17 24l5 5 10-11" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IPiggy: React.FC<I> = ({ s = 40, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><ellipse cx="23" cy="26" rx="17" ry="13" fill={color} /><circle cx="16" cy="24" r="2.2" fill="#fff" /><rect x="20" y="11" width="10" height="4" rx="2" fill={color} /><rect x="12" y="37" width="4" height="6" fill={color} /><rect x="30" y="37" width="4" height="6" fill={color} /><path d="M40 22c4 0 4 7 0 7" fill={color} /></svg>
);

// ── 連結ノード（コンパクト・1行完結） ─────────────────
const Node: React.FC<{
  x: number; y: number; w: number; delay: number;
  icon?: React.ReactNode; title: string; tag?: string; tagBg?: string;
  dim?: boolean; hero?: boolean; stack?: boolean; h?: number;
}> = ({ x, y, w, delay, icon, title, tag, tagBg, dim, hero, stack, h = 104 }) => {
  const border = dim ? C.gray : hero ? C.orange : C.ink;
  const txt = dim ? C.gray : C.ink;
  const tagEl = tag && <div style={{ flexShrink: 0, padding: "5px 15px", borderRadius: 999, fontSize: 26, fontWeight: 800, color: "#fff", background: tagBg ?? C.orange }}>{tag}</div>;
  return (
    <Pop delay={delay} style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h }}>
      <div style={{
        width: "100%", height: "100%", boxSizing: "border-box",
        display: "flex", flexDirection: stack ? "column" : "row", alignItems: "center", justifyContent: "center", gap: stack ? 8 : 14,
        background: hero ? C.orangeBg : "#fff", border: `${hero ? 5 : 4}px solid ${border}`, borderRadius: 18,
        padding: "0 18px", boxShadow: "0 6px 16px rgba(34,48,73,0.09)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {icon && <div style={{ flexShrink: 0, opacity: dim ? 0.65 : 1, display: "flex" }}>{icon}</div>}
          <div style={{ fontSize: hero ? 42 : 37, fontWeight: 800, color: txt, lineHeight: 1.12, textAlign: "center", whiteSpace: "nowrap" }}>{title}</div>
          {!stack && tagEl}
        </div>
        {stack && tagEl}
      </div>
    </Pop>
  );
};

// チェック項目チップ（家族/保険/iDeCo/住宅ローン）
const Chip: React.FC<{ x: number; y: number; w: number; delay: number; icon: React.ReactNode; label: string }> = ({ x, y, w, delay, icon, label }) => (
  <Pop delay={delay} style={{ position: "absolute", left: x - w / 2, top: y - 52, width: w, height: 104 }}>
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: C.orangeBg, border: `3px solid ${C.orange}`, borderRadius: 14 }}>
      {icon}
      <div style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>{label}</div>
    </div>
  </Pop>
);

// ── 下部の大きい青テロップ ───────────────────────────
type Tel = { at: number; text: string };
const BottomTelop: React.FC<{ cues: Tel[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  let cur = cues[0];
  for (const c of cues) if (f >= c.at) cur = c;
  const s = spring({ frame: f - cur.at, fps: FPS_LOCAL, config: { damping: 18 }, durationInFrames: 14 });
  return (
    <div style={{ position: "absolute", left: 50, right: 50, bottom: 70, display: "flex", justifyContent: "center" }}>
      <div style={{ opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 22}px)`, background: C.blue, color: "#fff", borderRadius: 18, padding: "20px 30px", maxWidth: 960, textAlign: "center", boxShadow: "0 10px 26px rgba(31,111,235,0.28)" }}>
        <span style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.22, whiteSpace: "pre-line" }}>{cur.text}</span>
      </div>
    </div>
  );
};

// ── 本体（1画面・積み上げ） ──────────────────────────
export const NenmatsuReel: React.FC = () => {
  // ノード座標（全部1画面に収める。y: 190〜1560）とreveal frame
  const Y = {
    hub: 210, emp: 360, self: 360, tenbiki: 520, calc: 670,
    kazoku: 820, chip: 965, hagaki: 1130, ok: 1270, salary: 1410, kampu: 1555,
  };
  const d = {
    hub: 12, emp: 60, self: 85, tenbiki: 140, calc: 205,
    kazoku: 280, chip: 340, hagaki: 470, ok: 540, salary: 610, kampu: 690,
  };

  const telops: Tel[] = [
    { at: 12, text: "日本で働く人は" },
    { at: 60, text: "会社員なら「年末調整」" },
    { at: 140, text: "毎月ざっくり天引きされてる" },
    { at: 205, text: "年末にまとめて答え合わせ\n＝ 年末調整" },
    { at: 280, text: "書くのは家族のことなど" },
    { at: 340, text: "家族・保険・iDeCo・住宅ローン" },
    { at: 470, text: "保険会社のハガキを見ながら" },
    { at: 540, text: "答えるだけでOK" },
    { at: 610, text: "12月か1月の給料と一緒に" },
    { at: 690, text: "今年は減税分も\nまとめて戻ってくるよ" },
  ];

  const half = 232; // branch node width
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      {/* ヘッダー */}
      <div style={{ position: "absolute", top: 54, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: C.ink, borderBottom: `6px solid ${C.orange}`, paddingBottom: 4 }}>
          会社員の「年末調整」まるわかり
        </span>
      </div>

      {/* つなぎ線（固定・全部1枚） */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Link x1={CX} y1={Y.hub + 52} x2={272} y2={Y.emp - 65} delay={d.emp - 6} color={C.orange} />
        <Link x1={CX} y1={Y.hub + 52} x2={808} y2={Y.self - 65} delay={d.self - 6} color={C.gray} dash />
        <Link x1={272} y1={Y.emp + 65} x2={CX} y2={Y.tenbiki - 52} delay={d.tenbiki - 6} />
        <Link x1={CX} y1={Y.tenbiki + 52} x2={CX} y2={Y.calc - 52} delay={d.calc - 6} />
        <Link x1={CX} y1={Y.calc + 52} x2={CX} y2={Y.kazoku - 52} delay={d.kazoku - 6} />
        <Link x1={CX} y1={Y.kazoku + 52} x2={CX} y2={Y.chip - 52} delay={d.chip - 6} />
        <Link x1={CX} y1={Y.chip + 52} x2={CX} y2={Y.hagaki - 52} delay={d.hagaki - 6} />
        <Link x1={CX} y1={Y.hagaki + 52} x2={CX} y2={Y.ok - 52} delay={d.ok - 6} />
        <Link x1={CX} y1={Y.ok + 52} x2={CX} y2={Y.salary - 52} delay={d.salary - 6} />
        <Link x1={CX} y1={Y.salary + 52} x2={CX} y2={Y.kampu - 60} delay={d.kampu - 6} color={C.orange} />
      </svg>

      {/* ノード */}
      <Node x={CX} y={Y.hub} w={440} delay={d.hub} icon={<IFamily s={46} />} title="日本で働く人" />
      <Node x={272} y={Y.emp} w={300} h={130} stack delay={d.emp} icon={<IPerson s={32} />} title="会社員" tag="年末調整" tagBg={C.orange} />
      <Node x={808} y={Y.self} w={300} h={130} stack delay={d.self} icon={<IPerson s={32} color={C.gray} />} title="自営業" tag="確定申告" tagBg={C.gray} dim />
      <Node x={CX} y={Y.tenbiki} w={560} delay={d.tenbiki} icon={<ICoin s={42} />} title="毎月ざっくり天引き" />
      <Node x={CX} y={Y.calc} w={620} delay={d.calc} icon={<ICalc s={42} />} title="年末に答え合わせ" tag="＝年末調整" tagBg={C.orange} />
      <Node x={CX} y={Y.kazoku} w={540} delay={d.kazoku} title="書くのは家族のことなど" />

      {/* チェック項目4つ（横並び） */}
      <Chip x={CX - 363} y={Y.chip} w={228} delay={d.chip} icon={<IFamily s={38} />} label="家族" />
      <Chip x={CX - 121} y={Y.chip} w={228} delay={d.chip + 20} icon={<IShield s={34} />} label="保険" />
      <Chip x={CX + 121} y={Y.chip} w={228} delay={d.chip + 40} icon={<IPiggy s={34} />} label="iDeCo" />
      <Chip x={CX + 363} y={Y.chip} w={228} delay={d.chip + 60} icon={<IHouse s={34} />} label="住宅ローン" />

      <Node x={CX} y={Y.hagaki} w={600} delay={d.hagaki} icon={<IEnvelope s={42} />} title="保険会社のハガキを見て" />
      <Node x={CX} y={Y.ok} w={420} delay={d.ok} title="答えるだけでOK" />
      <Node x={CX} y={Y.salary} w={600} delay={d.salary} icon={<ICalendar s={42} />} title="12月 or 1月の給料と" />
      <Node x={CX} y={Y.kampu} w={680} delay={d.kampu} hero h={120} icon={<ICoin s={54} />} title="今年は減税分も" tag="還付" tagBg={C.orange} />

      <BottomTelop cues={telops} />
    </AbsoluteFill>
  );
};
