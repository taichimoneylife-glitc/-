import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { B } from "./MileLifePlan";
import { K, SER } from "./components/zukaiKit";

// ════════════════════════════════════════════════════════════════════
//  アメックスのポイント「行き先ルートマップ」の図解（絵コンテ用）
//  1秒＝1場面。真ん中にアメックスのポイント、行き先へ線。損するルートは赤、得するルートは青。
//  数字はすべて2026年11月 公式で確認したもの（ゴールド・プリファード＝プラス自動登録）
// ════════════════════════════════════════════════════════════════════
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INK = A2.ink, RED = "#E8553B", BLUE = "#2F7BD9", GRAY = "#B9B2A0", SUB = "#8C8471", GOLD = "#E9B82E";

type Kind = "loss" | "gain";
type Node = { id: string; label: string; sub?: string; value: string; unit: string; kind: Kind; ang: number };
const NODES: Node[] = [
  { id: "jal", label: "JALマイル", value: "4,000", unit: "マイル", kind: "loss", ang: -122 },
  { id: "ana", label: "ANAマイル", value: "10,000", unit: "マイル", kind: "gain", ang: -56 },
  { id: "hotel", label: "ホテル", sub: "ヒルトン／マリオット", value: "12,500／9,900", unit: "pt", kind: "gain", ang: -2 },
  { id: "fee", label: "年会費", value: "10,000", unit: "円", kind: "gain", ang: 58 },
  { id: "rakuten", label: "楽天ポイント", value: "約4,670", unit: "円分", kind: "loss", ang: 122 },
  { id: "card", label: "カード代金", sub: "Amazon", value: "5,000", unit: "円", kind: "loss", ang: 180 },
  { id: "gift", label: "商品券", sub: "Vポイント・PayPay", value: "3,000", unit: "円分", kind: "loss", ang: -152 },
];
const CX = 540, CY = 790, RX = 345, RY = 380;
const pos = (a: number) => [CX + Math.cos((a * Math.PI) / 180) * RX, CY + Math.sin((a * Math.PI) / 180) * RY] as const;

// 場面ごとに「色が付いている行き先」「数字を見せる行き先」「光らせる行き先」
type Stage = { title: React.ReactNode; on: string[]; show: string[]; hi?: string; done?: boolean };
const STAGES: Record<number, Stage> = {
  1: { title: <>行き先で<span style={{ color: RED }}>価値</span>が変わる</>, on: [], show: [] },
  2: { title: <>損するルート①</>, on: ["gift"], show: ["gift"], hi: "gift" },
  3: { title: <>損するルート②</>, on: ["gift", "card"], show: ["gift", "card"], hi: "card" },
  4: { title: <>同じマイルでも…</>, on: ["gift", "card", "jal", "ana"], show: ["gift", "card", "jal", "ana"], hi: "jal" },
  5: { title: <>得するルート①</>, on: ["gift", "card", "jal", "ana"], show: ["gift", "card", "jal", "ana"], hi: "ana" },
  7: { title: <>得するルート②</>, on: ["gift", "card", "jal", "ana", "hotel"], show: ["gift", "card", "jal", "ana", "hotel"], hi: "hotel" },
  8: { title: <>得するルート③</>, on: ["gift", "card", "jal", "ana", "hotel", "fee"], show: ["gift", "card", "jal", "ana", "hotel", "fee"], hi: "fee" },
  9: { title: <>やることはこれだけ</>, on: NODES.map((n) => n.id), show: NODES.map((n) => n.id), done: true },
};

const Paper: React.FC = () => <AbsoluteFill style={{ background: A2.bg, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }} />;
const Sticky: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 120, top: 250, display: "flex", alignItems: "center", gap: 22 }}>
    <div style={{ position: "relative", background: "#FFE58A", padding: "12px 24px 8px", transform: "rotate(-4deg)", boxShadow: "3px 6px 12px rgba(90,70,20,0.2)", ...K, fontSize: 34, color: INK }}>
      <div style={{ position: "absolute", left: "50%", top: -14, width: 80, height: 26, marginLeft: -40, background: "rgba(255,255,255,0.65)", transform: "rotate(4deg)" }} />
      アメックス
    </div>
    <div style={{ ...K, fontSize: 56, color: INK }}>{children}</div>
  </div>
);
const Caption: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 130, width: 820, top: 1360, height: 100, borderRadius: 999, background: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center", ...B, fontSize: 40, color: INK }}>{children}</div>
);

// ── ルートマップ ──
const RouteMap: React.FC<{ st: Stage; d: number }> = ({ st, d }) => {
  const grow = interpolate(d, [0, 10], [0, 1], { ...clamp, easing: OUT });
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <marker id="aR" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={RED} /></marker>
          <marker id="aB" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={BLUE} /></marker>
        </defs>
        {NODES.map((n) => {
          const [x, y] = pos(n.ang);
          const on = st.on.includes(n.id), isHi = st.hi === n.id;
          const c = !on ? GRAY : n.kind === "loss" ? RED : BLUE;
          const k = isHi ? grow : 1;
          const ex = CX + (x - CX) * 0.72, ey = CY + (y - CY) * 0.72;
          const sx = CX + (x - CX) * 0.33, sy = CY + (y - CY) * 0.33;
          return (
            <line key={n.id} x1={sx} y1={sy} x2={sx + (ex - sx) * (on ? k : 1)} y2={sy + (ey - sy) * (on ? k : 1)} stroke={c} strokeWidth={on ? (n.kind === "gain" ? 14 : 9) : 5} strokeDasharray={on ? undefined : "12 10"} strokeLinecap="round" markerEnd={on ? `url(#${n.kind === "loss" ? "aR" : "aB"})` : undefined} opacity={on ? 1 : 0.8} />
          );
        })}
      </svg>
      {/* 真ん中 */}
      <div style={{ position: "absolute", left: CX - 130, top: CY - 130, width: 260, height: 260, borderRadius: "50%", background: "#fff", border: `6px solid ${INK}`, boxShadow: `6px 8px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ ...B, fontSize: 26, color: SUB }}>アメックスの</div>
        <div style={{ ...B, fontSize: 30, color: INK }}>ポイント</div>
        <div style={{ ...SER, fontSize: 76, color: GOLD, lineHeight: 1.05 }}>1万</div>
      </div>
      {/* 行き先 */}
      {NODES.map((n) => {
        const [x, y] = pos(n.ang);
        const on = st.on.includes(n.id), show = st.show.includes(n.id), isHi = st.hi === n.id;
        const c = n.kind === "loss" ? RED : BLUE;
        const W = 290;
        const pk = isHi ? interpolate(d, [4, 9, 13], [0.6, 1.12, 1], clamp) : 1;
        const x0 = Math.max(70, Math.min(1010 - W, x - W / 2));
        const crossed = st.done && n.kind === "loss";
        return (
          <div key={n.id} style={{ position: "absolute", left: x0, top: y - 80, width: W, minHeight: 140, background: "#fff", border: `5px solid ${on ? c : GRAY}`, borderRadius: 22, boxShadow: on ? `5px 6px 0 ${c}` : "none", padding: "10px 14px", boxSizing: "border-box", textAlign: "center", transform: `scale(${pk})`, opacity: crossed ? 0.5 : 1 }}>
            <div style={{ ...K, fontSize: 38, color: on ? INK : SUB, lineHeight: 1.15 }}>{n.label}</div>
            {n.sub ? <div style={{ ...B, fontSize: 22, color: SUB }}>{n.sub}</div> : null}
            {show ? <div style={{ ...SER, fontSize: n.value.length > 7 ? 32 : 54, color: c, lineHeight: 1.2, marginTop: 2, whiteSpace: "nowrap" }}>{n.value}<span style={{ ...B, fontSize: 20 }}>{n.unit}</span></div> : <div style={{ ...K, fontSize: 40, color: GRAY }}>？</div>}
            {crossed ? <svg width={W} height={150} style={{ position: "absolute", left: -5, top: -5 }}><line x1={30} y1={20} x2={W - 30} y2={130} stroke={RED} strokeWidth={10} strokeLinecap="round" /><line x1={W - 30} y1={20} x2={30} y2={130} stroke={RED} strokeWidth={10} strokeLinecap="round" /></svg> : null}
          </div>
        );
      })}
    </>
  );
};

// ── 冒頭（場面0）：1万ポイントが3つの値段に ──
const Opening: React.FC<{ d: number }> = ({ d }) => {
  const rows: [string, string, string, boolean][] = [["商品券に替えると", "3,000", "円分", false], ["支払いに使うと", "5,000", "円", false], ["ANAマイルなら", "10,000", "マイル", true]];
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 300, textAlign: "center", ...K, fontSize: 64, color: INK }}>同じ<span style={{ ...SER, color: GOLD }}>1万</span>ポイントでも</div>
      {rows.map(([l, v, u, best], i) => (
        <div key={l} style={{ position: "absolute", left: 140, width: 800, top: 470 + i * 230, height: 190, background: best ? "#EEF5FF" : "#fff", border: `6px solid ${best ? BLUE : INK}`, borderRadius: 30, boxShadow: `7px 9px 0 ${best ? BLUE : INK}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", boxSizing: "border-box", opacity: interpolate(d - i * 3, [0, 4], [0, 1], clamp), transform: `translateY(${interpolate(d - i * 3, [0, 8], [40, 0], { ...clamp, easing: OUT })}px) ${best ? "scale(1.04)" : ""}` }}>
          <span style={{ ...K, fontSize: 40, color: INK }}>{l}</span>
          <span style={{ ...SER, fontSize: best ? 92 : 80, color: best ? BLUE : RED, whiteSpace: "nowrap" }}>{v}<span style={{ ...B, fontSize: 34, color: INK }}>{u}</span></span>
        </div>
      ))}
      <div style={{ position: "absolute", left: 610, top: 1180, transform: "rotate(-6deg)", border: `7px solid ${RED}`, borderRadius: 16, padding: "4px 26px", ...SER, fontSize: 56, color: RED, background: "#FFF6F2" }}>3倍以上の差</div>
    </>
  );
};

// ── 場面6：マイルの価値（たとえば） ──
const MileValue: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 330, textAlign: "center", ...K, fontSize: 56, color: INK }}>1万マイルの価値は？</div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 420, textAlign: "center", ...B, fontSize: 34, color: SUB }}>航空券の値段 ÷ 必要なマイル</div>
    {/* 航空券 */}
    <div style={{ position: "absolute", left: 150, top: 540, width: 780, height: 300, background: "#fff", border: `6px solid ${INK}`, borderRadius: 26, boxShadow: `7px 9px 0 ${INK}`, overflow: "hidden" }}>
      <div style={{ height: 70, background: BLUE, color: "#fff", ...K, fontSize: 34, display: "flex", alignItems: "center", padding: "0 30px" }}>✈ たとえば 片道</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", height: 230 }}>
        <div style={{ textAlign: "center" }}><div style={{ ...K, fontSize: 64, color: INK }}>羽田</div><div style={{ ...B, fontSize: 24, color: SUB }}>HND</div></div>
        <div style={{ ...K, fontSize: 60, color: SUB }}>→</div>
        <div style={{ textAlign: "center" }}><div style={{ ...K, fontSize: 64, color: INK }}>那覇</div><div style={{ ...B, fontSize: 24, color: SUB }}>OKA</div></div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 150, top: 900, width: 780, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <span style={{ ...SER, fontSize: 84, color: RED }}>3万<span style={{ ...B, fontSize: 36, color: INK }}>円</span></span>
      <span style={{ ...K, fontSize: 60, color: INK }}>÷</span>
      <span style={{ ...SER, fontSize: 84, color: BLUE }}>9,500<span style={{ ...B, fontSize: 30, color: INK }}>マイル</span></span>
    </div>
    <div style={{ position: "absolute", left: 220, top: 1060, width: 640, textAlign: "center", background: "#FFE58A", padding: "16px 0", transform: "rotate(-2deg)", boxShadow: "3px 6px 12px rgba(90,70,20,0.2)", ...K, fontSize: 56, color: INK }}>1マイル 約<span style={{ ...SER, color: RED, fontSize: 76 }}>3</span>円</div>
    <div style={{ position: "absolute", left: 220, top: 1205, width: 640, textAlign: "center", ...B, fontSize: 24, color: SUB }}>※この例の場合。運賃は日によって変わります</div>
  </>
);

// ── 締め（場面9）の下のルール ──
const Rules: React.FC = () => (
  <div style={{ position: "absolute", left: 140, top: 1240, width: 800, display: "flex", gap: 20 }}>
    {([["✈ 旅行するなら", "ANAマイル", BLUE], ["💳 しないなら", "年会費", GOLD]] as const).map(([a, b, c]) => (
      <div key={b} style={{ flex: 1, background: "#fff", border: `5px solid ${c}`, borderRadius: 22, boxShadow: `5px 6px 0 ${c}`, padding: "10px 0", textAlign: "center" }}>
        <div style={{ ...B, fontSize: 24, color: SUB }}>{a}</div>
        <div style={{ ...K, fontSize: 40, color: INK }}>{b}</div>
      </div>
    ))}
  </div>
);

const CAPS: Record<number, React.ReactNode> = {
  0: <>同じ1万ポイントでも、<span style={{ color: RED }}>3倍以上</span>の差</>,
  1: <>どこに替えるかで、価値がまったく変わる</>,
  2: <>商品券・Vポイントは <span style={{ color: RED }}>3,000円分</span></>,
  3: <>カードの支払い・Amazonは <span style={{ color: RED }}>5,000円</span></>,
  4: <>JALは ANAの <span style={{ color: RED }}>2.5分の1</span></>,
  5: <>ANAなら <span style={{ color: BLUE }}>1万マイル</span>に</>,
  6: <>たとえば 1マイル約3円の計算</>,
  7: <>旅行先のホテル代にも使える</>,
  8: <>年会費なら <span style={{ color: BLUE }}>1万円分</span></>,
  9: <>旅行ならANA、しないなら年会費</>,
};

export const AMEXMAP_FRAMES = 300;
export const AmexMap: React.FC = () => {
  const f = useCurrentFrame();
  const sc = Math.min(9, Math.floor(f / 30)), d = f - sc * 30;
  const st = STAGES[sc];
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Paper />
      {sc === 0 ? <Opening d={d} /> : sc === 6 ? <MileValue /> : <><Sticky>{st.title}</Sticky><RouteMap st={st} d={d} />{sc === 5 ? <div style={{ position: "absolute", left: 610, top: 330, ...B, fontSize: 24, color: SUB }}>参加費 年5,500円／年4万マイルまで</div> : null}{st.done ? <Rules /> : null}</>}
      {sc === 4 ? <div style={{ position: "absolute", left: 300, top: 1235, transform: "rotate(-4deg)", border: `7px solid ${RED}`, borderRadius: 16, padding: "4px 26px", ...SER, fontSize: 52, color: RED, background: "#FFF6F2" }}>ANAの2.5分の1</div> : null}
      <Caption>{CAPS[sc]}</Caption>
    </AbsoluteFill>
  );
};
