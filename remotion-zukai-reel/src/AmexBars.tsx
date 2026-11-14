import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { B } from "./MileLifePlan";
import { K, SER } from "./components/zukaiKit";

// ════════════════════════════════════════════════════════════════════
//  アメックスのポイント：横棒グラフ＋「1ポイント＝1円」の基準線（絵コンテ用・1秒＝1場面）
//  ・円で使う段：1万ポイント＝1万円の位置に点線。そこまで届かない分は赤い点線の「損した分」
//  ・旅行で使う段：マイル／ホテルのポイントは単位が違うので別の段（同じ長さの基準＝1万）
//  数字は2026年11月 公式（ゴールド・プリファード＝プラス自動登録）
// ════════════════════════════════════════════════════════════════════
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INK = A2.ink, RED = "#E8553B", BLUE = "#2F7BD9", GRAY = "#C9C2B0", SUB = "#8C8471", GOLD = "#E9B82E", PAPER = A2.bg;

const Paper: React.FC = () => <AbsoluteFill style={{ background: PAPER, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }} />;
const Head: React.FC<{ tag: string; children: React.ReactNode }> = ({ tag, children }) => (
  <div style={{ position: "absolute", left: 110, top: 250, display: "flex", alignItems: "center", gap: 22 }}>
    <div style={{ position: "relative", background: "#FFE58A", padding: "12px 24px 8px", transform: "rotate(-4deg)", boxShadow: "3px 6px 12px rgba(90,70,20,0.2)", ...K, fontSize: 32, color: INK, whiteSpace: "nowrap" }}>
      <div style={{ position: "absolute", left: "50%", top: -14, width: 80, height: 26, marginLeft: -40, background: "rgba(255,255,255,0.65)", transform: "rotate(4deg)" }} />
      {tag}
    </div>
    <div style={{ ...K, fontSize: 52, color: INK, whiteSpace: "nowrap" }}>{children}</div>
  </div>
);
const Caption: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 130, width: 820, top: 1360, height: 100, borderRadius: 999, background: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center", ...B, fontSize: 40, color: INK }}>{children}</div>
);

// ── 円の段 ──
type Row = { id: string; label: string; sub?: string; v: number; txt: string };
const YEN: Row[] = [
  { id: "gift", label: "商品券", sub: "Vポイント・PayPay", v: 3000, txt: "3,000円" },
  { id: "rakuten", label: "楽天ポイント", v: 4670, txt: "約4,670円分" },
  { id: "card", label: "カード代金", sub: "Amazon", v: 5000, txt: "5,000円" },
  { id: "fee", label: "年会費", v: 10000, txt: "10,000円" },
];
const BX = 300, BW = 620; // 棒の左端と、1万円までの長さ
const YenBars: React.FC<{ top: number; show: string[]; hi?: string; d: number; dim?: string[]; check?: boolean }> = ({ top, show, hi, d, dim = [], check }) => {
  const rowH = 170;
  return (
    <div style={{ position: "absolute", left: 0, top, width: 1080 }}>
      {/* 1円ライン */}
      <div style={{ position: "absolute", left: BX + BW, top: -40, height: YEN.length * rowH + 30, borderLeft: `5px dashed ${BLUE}` }} />
      <div style={{ position: "absolute", left: BX + BW - 150, top: -110, width: 300, textAlign: "center", ...K, fontSize: 30, color: BLUE }}>1ポイント＝1円<br /><span style={{ ...B, fontSize: 22 }}>（1万円）</span></div>
      {YEN.map((r, i) => {
        const shown = show.includes(r.id), isHi = hi === r.id;
        const g = isHi ? interpolate(d, [2, 14], [0, 1], { ...clamp, easing: OUT }) : 1;
        const w = (r.v / 10000) * BW * (shown ? g : 0);
        const loss = 10000 - r.v;
        const good = r.v >= 10000;
        const c = good ? BLUE : RED;
        const faded = dim.includes(r.id);
        return (
          <div key={r.id} style={{ position: "absolute", left: 0, top: i * rowH, width: 1080, height: rowH, opacity: faded ? 0.35 : 1 }}>
            <div style={{ position: "absolute", left: 30, width: 250, top: 38, textAlign: "right" }}>
              <div style={{ ...K, fontSize: 40, color: shown ? INK : SUB, lineHeight: 1.1 }}>{r.label}</div>
              {r.sub ? <div style={{ ...B, fontSize: 22, color: SUB }}>{r.sub}</div> : null}
            </div>
            {/* 棒の下地 */}
            <div style={{ position: "absolute", left: BX, top: 30, width: BW, height: 100, borderRadius: 12, background: "rgba(255,255,255,0.55)", border: `3px solid ${GRAY}`, boxSizing: "border-box" }} />
            {shown ? <div style={{ position: "absolute", left: BX, top: 30, width: w, height: 100, borderRadius: 12, background: c, boxShadow: `4px 5px 0 ${INK}`, border: `4px solid ${INK}`, boxSizing: "border-box" }} /> : null}
            {/* 損した分 */}
            {shown && !good && g > 0.95 ? (
              <div style={{ position: "absolute", left: BX + w + 6, top: 38, width: BW - w - 12, height: 84, borderRadius: 10, border: `4px dashed ${RED}`, background: "rgba(232,85,59,0.08)", display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 38, color: RED, opacity: interpolate(d - (isHi ? 14 : 0), [0, 6], [isHi ? 0 : 1, 1], clamp) }}>−{loss.toLocaleString()}円</div>
            ) : null}
            {/* 値 */}
            {shown ? <div style={{ position: "absolute", left: BX + 14, top: 50, ...SER, fontSize: 40, color: "#fff", whiteSpace: "nowrap", opacity: g > 0.6 ? 1 : 0, textShadow: "0 2px 0 rgba(0,0,0,0.25)" }}>{r.txt}</div> : null}
            {check && good ? <div style={{ position: "absolute", left: BX + BW - 80, top: 48, width: 64, height: 64, borderRadius: "50%", background: BLUE, color: "#fff", ...K, fontSize: 40, textAlign: "center", lineHeight: "64px" }}>✓</div> : null}
          </div>
        );
      })}
    </div>
  );
};

// ── 旅行の段（単位が違うので別の段。基準＝1万） ──
type TRow = { id: string; label: string; v: number; txt: string; c: string };
const TRAVEL: TRow[] = [
  { id: "jal", label: "JALマイル", v: 4000, txt: "4,000マイル", c: RED },
  { id: "ana", label: "ANAマイル", v: 10000, txt: "10,000マイル", c: BLUE },
  { id: "hilton", label: "ヒルトン", v: 12500, txt: "12,500pt", c: BLUE },
  { id: "marriott", label: "マリオット", v: 9900, txt: "9,900pt", c: BLUE },
];
const TravelBars: React.FC<{ top: number; show: string[]; hi?: string[]; d: number; scale?: number; only?: string[] }> = ({ top, show, hi = [], d, only }) => {
  const rowH = 170;
  const rows = only ? TRAVEL.filter((r) => only.includes(r.id)) : TRAVEL;
  return (
    <div style={{ position: "absolute", left: 0, top, width: 1080 }}>
      {rows.map((r, i) => {
        const shown = show.includes(r.id), isHi = hi.includes(r.id);
        const g = isHi ? interpolate(d - (r.id === "ana" ? 6 : 0), [2, 16], [0, 1], { ...clamp, easing: OUT }) : 1;
        const w = Math.min(1.25, r.v / 10000) * (BW * 0.62) * (shown ? g : 0);
        return (
          <div key={r.id} style={{ position: "absolute", left: 0, top: i * rowH, width: 1080, height: rowH }}>
            <div style={{ position: "absolute", left: 30, width: 250, top: 50, textAlign: "right", ...K, fontSize: 40, color: shown ? INK : SUB }}>{r.label}</div>
            {shown ? <div style={{ position: "absolute", left: BX, top: 30, width: w, height: 100, borderRadius: 12, background: r.c, border: `4px solid ${INK}`, boxShadow: `4px 5px 0 ${INK}`, boxSizing: "border-box" }} /> : null}
            {shown && g > 0.6 ? <div style={{ position: "absolute", left: BX + w + 16, top: 42, ...SER, fontSize: 50, color: r.c, whiteSpace: "nowrap" }}>{r.txt}</div> : null}
          </div>
        );
      })}
    </div>
  );
};

// ── 冒頭：1万ポイントのうち7,000円分が消える ──
const Opening: React.FC<{ d: number }> = ({ d }) => {
  const keep = interpolate(d, [6, 18], [1, 0.3], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 300, textAlign: "center", ...K, fontSize: 60, color: INK }}>アメックスの<span style={{ ...SER, color: GOLD }}>1万</span>ポイント</div>
      {/* 1万円分の棒（お札10枚）→ 3枚だけ残る */}
      <div style={{ position: "absolute", left: 140, top: 470, width: 800, display: "flex", gap: 10 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const gone = i >= 3;
          const k = gone ? interpolate(d - 6 - (9 - i) * 1.2, [0, 8], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) }) : 0;
          return <div key={i} style={{ flex: 1, height: 300, borderRadius: 12, background: gone ? "#F5D58A" : "#E9B82E", border: `4px solid ${gone ? RED : INK}`, borderStyle: gone && k > 0.5 ? "dashed" : "solid", boxSizing: "border-box", opacity: gone ? 1 - 0.75 * k : 1, transform: `translateY(${-k * 40}px) rotate(${k * (i % 2 ? 10 : -10)}deg)`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 30, color: INK, writingMode: "vertical-rl" }}>1,000円</div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 110, top: 800, width: 290, textAlign: "center", ...K, fontSize: 30, color: INK }}>残るのは</div>
      <div style={{ position: "absolute", left: 90, top: 840, width: 340, textAlign: "center", ...SER, fontSize: 80, color: INK, whiteSpace: "nowrap" }}>3,000<span style={{ ...B, fontSize: 32 }}>円分</span></div>
      <div style={{ position: "absolute", left: 470, top: 830, width: 470, textAlign: "center", opacity: 1 - keep * 0 }}>
        <div style={{ ...K, fontSize: 34, color: RED }}>消えるのは</div>
        <div style={{ ...SER, fontSize: 110, color: RED, lineHeight: 1.05 }}>7,000<span style={{ ...B, fontSize: 40 }}>円分</span></div>
      </div>
      <div style={{ position: "absolute", left: 160, top: 1090, width: 760, textAlign: "center", ...B, fontSize: 34, color: SUB }}>商品券・Vポイント・PayPayに替えた場合</div>
      <div style={{ position: "absolute", left: 300, top: 1170, transform: "rotate(-4deg)", border: `7px solid ${RED}`, borderRadius: 16, padding: "4px 30px", ...SER, fontSize: 58, color: RED, background: "#FFF6F2" }}>7割が消える</div>
    </>
  );
};

// ── マイルの価値（たとえば） ──
const MileValue: React.FC = () => (
  <>
    <Head tag="1万マイルの価値">たとえば</Head>
    <div style={{ position: "absolute", left: 150, top: 420, width: 780, height: 280, background: "#fff", border: `6px solid ${INK}`, borderRadius: 26, boxShadow: `7px 9px 0 ${INK}`, overflow: "hidden" }}>
      <div style={{ height: 66, background: BLUE, color: "#fff", ...K, fontSize: 32, display: "flex", alignItems: "center", padding: "0 30px" }}>✈ 片道の航空券</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", height: 214 }}>
        <div style={{ ...K, fontSize: 64, color: INK }}>羽田</div><div style={{ ...K, fontSize: 56, color: SUB }}>→</div><div style={{ ...K, fontSize: 64, color: INK }}>那覇</div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 140, top: 760, width: 800, display: "flex", justifyContent: "space-between" }}>
      <div style={{ width: 360, textAlign: "center", background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, padding: "16px 0" }}><div style={{ ...B, fontSize: 28, color: SUB }}>お金で買うと</div><div style={{ ...SER, fontSize: 80, color: RED }}>3万<span style={{ ...B, fontSize: 34, color: INK }}>円</span></div></div>
      <div style={{ width: 360, textAlign: "center", background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, padding: "16px 0" }}><div style={{ ...B, fontSize: 28, color: SUB }}>マイルなら</div><div style={{ ...SER, fontSize: 80, color: BLUE }}>9,500<span style={{ ...B, fontSize: 28, color: INK }}>マイル</span></div></div>
    </div>
    <div style={{ position: "absolute", left: 220, top: 1010, width: 640, textAlign: "center", background: "#FFE58A", padding: "16px 0", transform: "rotate(-2deg)", boxShadow: "3px 6px 12px rgba(90,70,20,0.2)", ...K, fontSize: 56, color: INK }}>1マイル 約<span style={{ ...SER, color: RED, fontSize: 76 }}>3</span>円</div>
    <div style={{ position: "absolute", left: 160, top: 1150, width: 760, textAlign: "center", ...B, fontSize: 24, color: SUB }}>※この例の場合。運賃や必要マイルは日によって変わります</div>
  </>
);

const CAPS: string[] = [
  "1万ポイントが、3,000円分に", "1ポイント＝1円が基準", "商品券・Vポイントは 3,000円分", "カードの支払い・Amazonは 5,000円",
  "JALは ANAの2.5分の1", "ANAなら 1万マイル", "たとえば 1マイル約3円の計算", "ホテル代にも使える", "年会費なら 1ポイント＝1円", "旅行ならANA、しないなら年会費",
];
export const AMEXBARS_FRAMES = 300;
export const AmexBars: React.FC = () => {
  const f = useCurrentFrame();
  const sc = Math.min(9, Math.floor(f / 30)), d = f - sc * 30;
  let body: React.ReactNode = null;
  if (sc === 0) body = <Opening d={d} />;
  else if (sc >= 1 && sc <= 3) body = <><Head tag="円で使うと">1万ポイントの価値</Head><YenBars top={500} show={sc === 1 ? [] : sc === 2 ? ["gift"] : ["gift", "card"]} hi={sc === 2 ? "gift" : sc === 3 ? "card" : undefined} d={d} /></>;
  else if (sc === 4 || sc === 5) body = <><Head tag="マイルにすると">同じマイルでも…</Head><TravelBars top={480} only={["jal", "ana"]} show={sc === 4 ? ["jal", "ana"] : ["jal", "ana"]} hi={sc === 4 ? ["jal", "ana"] : []} d={d} />
    {sc === 4 ? <div style={{ position: "absolute", left: 300, top: 900, transform: "rotate(-4deg)", border: `7px solid ${RED}`, borderRadius: 16, padding: "4px 30px", ...SER, fontSize: 56, color: RED, background: "#FFF6F2" }}>ANAの2.5分の1</div> : <div style={{ position: "absolute", left: 300, top: 900, ...B, fontSize: 30, color: SUB }}>参加費 年5,500円／移行は年4万マイルまで</div>}</>;
  else if (sc === 6) body = <MileValue />;
  else if (sc === 7) body = <><Head tag="旅行で使うと">ホテルにも</Head><TravelBars top={480} show={["jal", "ana", "hilton", "marriott"]} hi={["hilton", "marriott"]} d={d} /></>;
  else if (sc === 8) body = <><Head tag="円で使うと">1万ポイントの価値</Head><YenBars top={500} show={["gift", "card", "fee"]} hi="fee" d={d} dim={[]} check /></>;
  else body = (
    <>
      <Head tag="やることは">これだけ</Head>
      <div style={{ position: "absolute", left: 120, top: 430, width: 840, display: "flex", flexDirection: "column", gap: 34 }}>
        {([["✈", "旅行に行くなら", "ANAマイル", "1万ポイント → 1万マイル", BLUE], ["💳", "行かないなら", "年会費に充てる", "1万ポイント → 1万円", GOLD], ["✕", "使わない", "商品券・カード代金", "1万ポイント → 3,000〜5,000円", RED]] as const).map(([ic, a, b, c, col]) => (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 26, background: "#fff", border: `6px solid ${col}`, borderRadius: 28, boxShadow: `6px 8px 0 ${col}`, padding: "22px 30px", opacity: col === RED ? 0.8 : 1 }}>
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: col, color: "#fff", ...K, fontSize: 50, textAlign: "center", lineHeight: "96px", flex: "none" }}>{ic}</div>
            <div><div style={{ ...B, fontSize: 28, color: SUB }}>{a}</div><div style={{ ...K, fontSize: 52, color: INK, textDecoration: col === RED ? "line-through" : "none", textDecorationColor: RED }}>{b}</div><div style={{ ...B, fontSize: 26, color: col === GOLD ? "#B38A12" : col }}>{c}</div></div>
          </div>
        ))}
      </div>
    </>
  );
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Paper />
      {body}
      <Caption>{CAPS[sc]}</Caption>
    </AbsoluteFill>
  );
};
