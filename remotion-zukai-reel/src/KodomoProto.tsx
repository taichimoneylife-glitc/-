import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { K, B, SER, M, yen } from "./components/marke";
import { camAt, CamKey, motionBlur, pillPop, titleSlam, Words, GrowPath, cardIn, at } from "./components/flowKit";

// ════════════════════════════════════════════════════════════════════
//  子どもNISA：図解①〜③の動きの試作（画像なし・声なし）
//  ねらい：画面を止めずに「1枚の長い地図」をカメラで追う。部品はカメラが動いている間に出る。
//  速さは参考⑫の実測（flowKit）。見た目はノート。
// ════════════════════════════════════════════════════════════════════
const G = M.green, O = M.orange;
const INK = M.ink;

// カメラ（地図の上の、画面の真ん中に映す点）
const CAM: CamKey[] = [
  { f: 0, x: 540, y: 700, z: 1 },
  { f: 52, x: 540, y: 1650, z: 1, p: "scroll" },          // ② 箱へ
  { f: 112, x: 420, y: 1830, z: 1.12, p: "slide" },       // 600万の箱に寄る
  { f: 150, x: 640, y: 2050, z: 0.92, p: "scroll" },      // 時間の棒へ
  { f: 228, x: 540, y: 2950, z: 1, p: "scroll" },         // 表へ
  { f: 290, x: 540, y: 3330, z: 1.18, p: "zoomIn" },       // ③ 引き出しの行に寄る
  { f: 352, x: 540, y: 3170, z: 1.18, p: "slide" },        // 買い方の行へすべる
  { f: 400, x: 540, y: 1700, z: 0.8, p: "recallUp" },     // 回想：箱まで一気に戻る
  { f: 432, x: 540, y: 2950, z: 1, p: "recallBack" },     // また表へ
];

const Box: React.FC<{ w: number; h: number; c: string; label: string; v: string; glow?: number }> = ({ w, h, c, label, v, glow = 0 }) => (
  <div style={{ width: w, height: h, background: c, border: `6px solid ${INK}`, borderRadius: 18, boxShadow: `8px 8px 0 ${INK}${glow > 0 ? `, 0 0 ${30 * glow}px ${12 * glow}px ${M.yellow}` : ""}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", boxSizing: "border-box" }}>
    <span style={{ ...K, fontSize: 32 }}>{label}</span>
    <span><span style={{ ...SER, fontSize: 92 }}>{v}</span><span style={{ ...K, fontSize: 36 }}>万円</span></span>
  </div>
);

const ROWS: [string, React.ReactNode][] = [
  ["始まる", "2027年1月"],
  ["対象年齢", "0〜17歳"],
  ["年間投資枠", "60万円（月5万円）"],
  ["非課税保有限度額", "600万円"],
  ["買い方", <><span style={{ color: M.red }}>積立のみ</span></>],
  ["口座", "子どもの名義・管理は親"],
  ["引き出し", <><span style={{ color: M.red }}>12歳まで原則✕</span><br /><span style={{ fontSize: 30 }}>12歳〜 子どもの同意が必要</span></>],
];

export const KODOMO_PROTO_FRAMES = 480;
export const KodomoProto: React.FC = () => {
  const f = useCurrentFrame();
  const c = camAt(CAM, f);
  const blur = motionBlur(c.v);
  // 600万の箱：f118 で光る → f150 で時間の棒の上へすべる（slide の形）
  const glow = interpolate(f, [118, 124, 140, 150], [0, 1, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mv = at([0, 0.03, 0.1, 0.33, 0.63, 0.85, 0.95, 0.99, 1], f - 150);
  const bx = 300 + (130 - 300) * mv, by = 1830 + (2080 - 1830) * mv;
  const back = at([0, 0.03, 0.1, 0.33, 0.63, 0.85, 0.95, 0.99, 1], f - 200); // 18歳で戻る
  const bx2 = bx + (300 - bx) * back, by2 = by + (1830 - by) * back;
  return (
    <AbsoluteFill style={{ background: M.paper, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 4200, transform: `translate(${540 - c.x * c.z}px, ${960 - c.y * c.z}px) scale(${c.z})`, transformOrigin: "0 0", filter: blur ? `blur(${blur}px)` : undefined }}>
        {/* ノートの地図（カメラと一緒に動く＝動いているのが分かる） */}
        <div style={{ position: "absolute", inset: -400, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} />
        <div style={{ position: "absolute", left: 70, top: -400, width: 4, height: 5000, background: "rgba(239,125,87,0.35)" }} />
        {/* 1本の線（上から下まで） */}
        <svg width={1080} height={4200} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <GrowPath d="M540 850 L540 1380" start={46} kind="lineLong" color={INK} w={6} glow={false} />
          <GrowPath d="M640 2340 L640 2600 L540 2600 L540 2700" start={222} kind="lineLong" color={INK} w={6} glow={false} />
          {/* 時間の棒 */}
          <GrowPath d="M110 2240 L900 2240" start={156} kind="lineLong" color={G} w={14} glow={false} />
          {/* 18歳 → 大人の箱へ戻る矢印 */}
          <GrowPath d="M930 2240 C1000 2100 980 1900 760 1840" start={196} kind="lineShort" color={M.red} w={8} glow={false} />
        </svg>

        {/* ① 結論 */}
        <div style={{ position: "absolute", left: 0, top: 420, width: 1080, textAlign: "center" }}>
          <div style={{ ...B, fontSize: 40, color: M.sub, display: "inline-flex" }}><Words words={[["まず先に、", 2], ["僕の結論", 6]]} /></div>
        </div>
        <div style={{ position: "absolute", left: 0, top: 520, width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#fff", border: `7px solid ${INK}`, borderRadius: 28, boxShadow: `12px 12px 0 ${G}`, padding: "26px 40px", textAlign: "center", ...titleSlam(f, 12) }}>
            <div style={{ ...K, fontSize: 46, color: M.sub }}>子どもNISAは</div>
            <div style={{ ...K, fontSize: 84 }}><span style={{ color: G }}>子どものお金</span>として</div>
            <div style={{ ...K, fontSize: 64 }}>使うもの</div>
          </div>
        </div>

        {/* ② 大人の新NISA＝縦に積んだ箱2つ */}
        <div style={{ position: "absolute", left: 0, top: 1420, width: 1080, textAlign: "center", ...B, fontSize: 40 }}><Words words={[["大人の新NISA", 66], ["　1,800万円", 72]]} /></div>
        <div style={{ position: "absolute", left: 300, top: 1500, ...pillPop(f, 64) }}><Box w={480} h={300} c={O} label="成長投資枠も使える" v="1,200" /></div>
        {/* 600万の箱（動く） */}
        <div style={{ position: "absolute", left: bx2, top: f < 200 ? by : by2, ...pillPop(f, 70), transform: `${(pillPop(f, 70).transform as string) ?? ""} scale(${f < 150 ? 1 : f < 200 ? 1 - 0.38 * mv : 0.62 + 0.38 * back})`, transformOrigin: "0 0" }}>
          <Box w={480} h={220} c={G} label="積立" v="600" glow={glow} />
        </div>
        <div style={{ position: "absolute", left: 800, top: 1900, ...B, fontSize: 32, color: G, ...pillPop(f, 122) }}>← この600万円を</div>
        {/* 時間の棒のラベル */}
        <div style={{ position: "absolute", left: 90, top: 2262, ...K, fontSize: 34, ...pillPop(f, 160) }}>0歳</div>
        <div style={{ position: "absolute", left: 860, top: 2262, ...K, fontSize: 34, ...pillPop(f, 166) }}>18歳</div>
        <div style={{ position: "absolute", left: 120, top: 2310, ...K, fontSize: 44, color: G }}><Words words={[["0歳から", 172], ["先に使える", 176]]} /></div>
        <div style={{ position: "absolute", left: 640, top: 2000, ...K, fontSize: 34, color: M.red }}><Words words={[["18歳で", 204], ["大人のNISAへ", 208]]} /></div>

        {/* ② 全体像の表（3コマおきに1行） */}
        <div style={{ position: "absolute", left: 90, top: 2720, width: 900, background: "#fff", border: `6px solid ${INK}`, borderRadius: 20, boxShadow: `10px 10px 0 ${G}`, overflow: "hidden", ...cardIn(f, 232) }}>
          <div style={{ background: G, color: "#fff", ...K, fontSize: 40, padding: "10px 24px" }}>子どもNISA 全体像</div>
          {ROWS.map(([k, v], i) => (
            <div key={k} style={{ display: "flex", borderTop: i ? `3px dashed ${M.gray}` : undefined, minHeight: 92, alignItems: "center", ...cardIn(f, 238 + i * 3) }}>
              <span style={{ width: 330, ...K, fontSize: 32, padding: "0 20px", color: M.sub }}>{k}</span>
              <span style={{ flex: 1, ...K, fontSize: 38, lineHeight: 1.15 }}>{v}</span>
            </div>
          ))}
        </div>
        {/* ③ 赤ペンの丸（行に寄ってから） */}
        <svg width={1080} height={4200} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
          <GrowPath d="M430 3335 C700 3315 1000 3325 995 3390 C990 3460 640 3470 430 3455 C330 3440 340 3345 470 3332" start={306} kind="lineLong" color={M.red} w={9} glow={false} />
          <GrowPath d="M430 3160 C580 3145 700 3150 695 3200 C690 3245 560 3250 430 3240 C360 3230 370 3165 470 3158" start={366} kind="lineLong" color={M.red} w={9} glow={false} />
        </svg>
        <div style={{ position: "absolute", left: 110, top: 3480, ...K, fontSize: 44, color: M.red, ...pillPop(f, 318) }}>デメリット ① ②</div>
        <div style={{ position: "absolute", left: 720, top: 3165, ...K, fontSize: 44, color: M.red, ...pillPop(f, 378) }}>デメリット③</div>
      </div>
      <div style={{ position: "absolute", left: 20, top: 20, ...B, fontSize: 24, color: M.sub, background: "rgba(255,255,255,0.7)", padding: "4px 10px", borderRadius: 8 }}>試作（画像なし）f{f} {yen(c.v)}px/f</div>
    </AbsoluteFill>
  );
};
