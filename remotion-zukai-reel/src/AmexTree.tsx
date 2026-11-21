import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { B } from "./MileLifePlan";
import { K, SER } from "./components/zukaiKit";

// ════════════════════════════════════════════════════════════════════
//  アメックスのポイント：ツリー（扶養の壁と同じ「上から3つに分かれる」形）※絵コンテ用・1秒＝1場面
//  1万ポイント → ✈航空会社 ／ 🏨ホテル ／ 💳その他 の3つに分けて、それぞれ全部の交換先と「1万ポイントだと」を並べる
//  数字は2026年11月 公式（ゴールド・プリファード＝プラス自動登録）。ロゴは使わず色の札（ロゴ画像をもらえば差し替え）
// ════════════════════════════════════════════════════════════════════
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const INK = A2.ink, RED = "#E8553B", BLUE = "#2F7BD9", SUB = "#8C8471", GOLD = "#E9B82E", GREEN = "#2E9E6B";

type Item = { name: string; sub?: string; v: string; unit: string; best?: boolean; worst?: boolean; badge?: { t: string; c: string } };
type Col = { key: string; icon: string; title: string; c: string; items: Item[]; note: string };
const COLS: Col[] = [
  { key: "air", icon: "✈", title: "航空会社", c: BLUE, note: "ANAは参加費 年5,500円・年4万マイルまで", items: [
    { name: "ANA", v: "10,000", unit: "マイル", best: true, badge: { t: "ANA", c: "#13448F" } },
    { name: "海外", sub: "ほか11社", v: "8,000", unit: "マイル", badge: { t: "その他", c: "#6B7FA6" } },
    { name: "JAL", v: "4,000", unit: "マイル", worst: true, badge: { t: "JAL", c: "#C8102E" } },
  ] },
  { key: "hotel", icon: "🏨", title: "ホテル", c: GREEN, note: "1ポイントの価値はホテルや日にちで変わる", items: [
    { name: "ヒルトン", v: "12,500", unit: "pt", best: true },
    { name: "マリオット", v: "9,900", unit: "pt" },
    { name: "ALL Accor", sub: "アコー", v: "約2,857", unit: "pt", worst: true },
  ] },
  { key: "other", icon: "💳", title: "その他", c: GOLD, note: "旅行代金＝航空・ホテル代など", items: [
    { name: "年会費", v: "10,000", unit: "円", best: true },
    { name: "旅行代金", v: "8,000", unit: "円" },
    { name: "カード代金", sub: "Amazon", v: "5,000", unit: "円" },
    { name: "楽天ポイント", v: "約4,670", unit: "円分" },
    { name: "商品券", sub: "Vpt・PayPay", v: "3,000", unit: "円分", worst: true },
  ] },
];
const CW = 300, GAP = 15, X0 = (1080 - (CW * 3 + GAP * 2)) / 2;
const colX = (i: number) => X0 + i * (CW + GAP);
const ROOT_Y = 280, HEAD_Y = 500, ITEM_Y = 615, IH = 134;

const Paper: React.FC = () => <AbsoluteFill style={{ background: A2.bg, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }} />;
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 11, stiffness: 160, mass: 0.7 }, durationInFrames: 12 });
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, ...style }}>{children}</div>;
};
const Caption: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 130, width: 820, top: 1360, height: 100, borderRadius: 999, background: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center", ...B, fontSize: 40, color: INK }}>{children}</div>
);

const ItemCard: React.FC<{ it: Item; col: Col; fade: boolean; glow: boolean }> = ({ it, col, fade, glow }) => {
  const f = useCurrentFrame();
  const vc = it.best ? col.c === GOLD ? "#B38A12" : col.c : it.worst ? RED : INK;
  return (
    <div style={{ position: "relative", height: IH - 14, background: it.best ? "#fff" : "rgba(255,255,255,0.88)", border: `${it.best ? 5 : 3}px solid ${it.best ? col.c : "#D6CDB6"}`, borderRadius: 18, boxShadow: glow ? `0 0 0 ${6 + 3 * Math.sin(f / 4)}px ${col.c}55, 5px 6px 0 ${col.c}` : it.best ? `4px 5px 0 ${col.c}` : "none", padding: "8px 14px", boxSizing: "border-box", opacity: fade ? 0.3 : 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, whiteSpace: "nowrap", overflow: "hidden" }}>
        {it.badge ? <span style={{ background: it.badge.c, color: "#fff", borderRadius: 6, padding: "0 10px", ...K, fontSize: 24, fontStyle: "italic", flex: "none" }}>{it.badge.t}</span> : null}
        {!(it.badge && it.badge.t === it.name) ? <span style={{ ...K, fontSize: it.name.length > 6 ? 26 : 30, color: INK }}>{it.name}</span> : null}
        {it.sub ? <span style={{ ...B, fontSize: 17, color: SUB }}>{it.sub}</span> : null}
      </div>
      <div style={{ textAlign: "right", ...SER, fontSize: 48, lineHeight: 1, color: vc, whiteSpace: "nowrap" }}>{it.v}<span style={{ ...B, fontSize: 20 }}>{it.unit}</span></div>
      {it.best ? <div style={{ position: "absolute", left: -10, top: -14, background: col.c === GOLD ? "#B38A12" : col.c, color: "#fff", borderRadius: 999, padding: "0 10px", ...K, fontSize: 16 }}>いちばん</div> : null}
    </div>
  );
};

// 場面：0＝幹と3つの枝 ／ 1＝航空会社 ／ 2＝ホテル ／ 3＝その他 ／ 4＝お得にするには（ANA・ヒルトン・年会費だけ光る）
const CAPS = ["行き先は大きく3つ", "航空会社なら ANAが一番", "ホテルなら ヒルトン", "それ以外は 年会費が一番", "お得にするなら この3つ"];
export const AMEXTREE_FRAMES = 150;
export const AmexTree: React.FC = () => {
  const f = useCurrentFrame();
  const sc = Math.min(4, Math.floor(f / 30)), d = f - sc * 30;
  const draw = (p: number) => interpolate(p, [0, 1], [0, 1], clamp);
  const lineP = draw(interpolate(sc === 0 ? d : 30, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const rootX = 540;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Paper />
      {/* 幹 */}
      <div style={{ position: "absolute", left: rootX - 320, top: ROOT_Y, width: 640, height: 130, whiteSpace: "nowrap", background: "#fff", border: `6px solid ${INK}`, borderRadius: 30, boxShadow: `7px 9px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <span style={{ ...B, fontSize: 32, color: SUB }}>アメックスの</span><span style={{ ...SER, fontSize: 70, color: GOLD }}>1万</span><span style={{ ...K, fontSize: 36, color: INK }}>ポイント</span>
      </div>
      {/* 枝 */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {COLS.map((c, i) => {
          const x = colX(i) + CW / 2;
          const p = `M${rootX},${ROOT_Y + 136} L${rootX},${ROOT_Y + 180} L${x},${ROOT_Y + 180} L${x},${HEAD_Y}`;
          return <path key={c.key} d={p} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lineP} />;
        })}
      </svg>
      {/* 3つの見出し */}
      {COLS.map((c, i) => (
        <Pop key={c.key} at={sc === 0 ? 8 + i * 4 : -30} style={{ position: "absolute", left: colX(i), top: HEAD_Y, width: CW }}>
          <div style={{ height: 84, borderRadius: 999, background: c.c, border: `5px solid ${INK}`, boxShadow: `5px 6px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, ...K, fontSize: 38, color: "#fff" }}>
            <span>{c.icon}</span>{c.title}
          </div>
        </Pop>
      ))}
      {/* 中身 */}
      {COLS.map((c, i) => {
        const shown = sc >= i + 1;
        if (!shown) return null;
        const fresh = sc === i + 1;
        return (
          <div key={c.key} style={{ position: "absolute", left: colX(i), top: ITEM_Y, width: CW }}>
            {c.items.map((it, k) => (
              <Pop key={it.name} at={fresh ? 2 + k * 3 : -30} style={{ marginBottom: 12 }}>
                <ItemCard it={it} col={c} fade={sc === 4 && !it.best} glow={sc === 4 && !!it.best} />
              </Pop>
            ))}
            {sc < 4 ? <div style={{ ...B, fontSize: 21, color: SUB, lineHeight: 1.4, marginTop: 2 }}>※{c.note}</div> : null}
          </div>
        );
      })}
      {sc === 4 ? (
        <Pop at={6} style={{ position: "absolute", left: 200, top: 1268 }}>
          <div style={{ background: "#FFE58A", padding: "12px 34px", transform: "rotate(-2deg)", boxShadow: "3px 6px 12px rgba(90,70,20,0.2)", ...K, fontSize: 40, color: INK, whiteSpace: "nowrap" }}>ANA ・ ヒルトン ・ 年会費</div>
        </Pop>
      ) : null}
      <Caption>{CAPS[sc]}</Caption>
    </AbsoluteFill>
  );
};
