import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { K, B, SER, M } from "./components/marke";
import { GenSlot } from "./MileLifePlan";
import { Stepper } from "./components/board";
import { TypeIn } from "./components/zukaiKit";
import { camAt, CamKey, motionBlur, pillPop, titleSlam, Words, GrowPath, cardIn, at } from "./components/flowKit";
import { enter, stagger } from "./components/motionLib";

// ════════════════════════════════════════════════════════════════════
//  子どもNISA 図解の試作 v2
//  形：図解パート全体が1枚のノート。カメラが線を追って下へ進む（ページの切り替えなし・戻らない）
//  中身：NISA→債券（NisaBondReel）の見せ方＝章の見出し（赤い札＋打ち込み）・左下の進み具合・右下に太一がひょこっと・大事な数字でグッと寄る
//  画像は点線の枠（届いたら差し替わる）。声なし。
// ════════════════════════════════════════════════════════════════════
const G = M.green, O = M.orange, INK = M.ink, RED = M.red;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CAM: CamKey[] = [
  { f: 0, x: 540, y: 640, z: 1 },
  { f: 62, x: 540, y: 1560, z: 1, p: "scroll" },     // ① 子どもNISAとは
  { f: 104, x: 470, y: 1700, z: 1.1, p: "slide" },     // 600万の箱にグッと寄る
  { f: 134, x: 560, y: 1980, z: 0.95, p: "scroll" },   // 時間の棒へ
  { f: 186, x: 540, y: 2600, z: 1, p: "scroll" },      // 全体像の表
  { f: 238, x: 560, y: 2840, z: 1.08, p: "slide" },    // 引き出しの行に寄る
  { f: 268, x: 540, y: 3390, z: 1, p: "scroll" },      // ② デメリット3つ
  { f: 356, x: 540, y: 4440, z: 1, p: "scroll" },      // ③ 教育資金は？（下へ進むだけ）
];

// 章の見出し：赤い札がドン → 題名を打ち込み → 下に線がのびる
const Head: React.FC<{ y: number; at: number; no: string; title: string }> = ({ y, at, no, title }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 80, top: y, display: "flex", alignItems: "center", gap: 18 }}>
      <span style={{ background: RED, color: "#fff", borderRadius: 999, padding: "6px 26px", ...K, fontSize: 36, display: "inline-block", ...enter(f, at, "stamp", "kire") }}>{no}</span>
      <span style={{ ...K, fontSize: 60, color: INK }}>{f >= at + 4 ? <TypeIn at={at + 4} step={1.5}>{title}</TypeIn> : null}</span>
    </div>
  );
};
const Box: React.FC<{ w: number; h: number; c: string; label: string; v: string; glow?: number }> = ({ w, h, c, label, v, glow = 0 }) => (
  <div style={{ width: w, height: h, background: c, border: `6px solid ${INK}`, borderRadius: 18, boxShadow: `8px 8px 0 ${INK}${glow > 0 ? `, 0 0 ${34 * glow}px ${14 * glow}px ${M.yellow}` : ""}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", boxSizing: "border-box" }}>
    <span style={{ ...K, fontSize: 32 }}>{label}</span>
    <span><span style={{ ...SER, fontSize: 92 }}>{v}</span><span style={{ ...K, fontSize: 36 }}>万円</span></span>
  </div>
);
const Chip: React.FC<{ c?: string; children: React.ReactNode; size?: number }> = ({ c = RED, children, size = 36 }) => (
  <span style={{ display: "inline-block", background: "#fff", border: `5px solid ${c}`, borderRadius: 16, padding: "8px 22px", ...K, fontSize: size, color: INK, boxShadow: `5px 5px 0 ${INK}`, whiteSpace: "nowrap" }}>{children}</span>
);
const ROWS: [string, React.ReactNode][] = [
  ["始まる", "2027年1月"], ["対象年齢", "0〜17歳"], ["年間投資枠", "60万円（月5万円）"], ["非課税保有限度額", "600万円"],
  ["買い方", <span style={{ color: RED }}>積立のみ</span>], ["口座", "子どもの名義・管理は親"],
  ["引き出し", <><span style={{ color: RED }}>12歳まで原則✕</span><br /><span style={{ fontSize: 30 }}>12歳〜 子どもの同意が必要</span></>],
];
const DEMERITS: [string, string, number][] = [["12歳まで原則引き出せない", "kn_piggy_locked", 282], ["12歳〜も子どもの同意が必要", "kn_teen_sign", 300], ["積立のみ（一括✕）", "kn_otoshidama", 318]];

// 右下の太一：気持ちが動く所だけ横からひょこっと
const APPEAR: [number, number, string][] = [[14, 56, "taichi_idea"], [244, 268, "taichi_worry"], [390, 430, "taichi_thumbs_up"]];
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  const a = APPEAR.find(([s, e]) => f >= s - 2 && f < e + 8);
  if (!a) return null;
  const [s, e, name] = a;
  const inP = interpolate(f, [s - 2, s + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const outP = interpolate(f, [e, e + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return <div style={{ position: "absolute", left: 790 + (1 - inP) * 380 + outP * 380, top: 1340 + Math.sin(f / 10) * 3, width: 240, height: 240 }}><GenSlot name={name} size={240} /></div>;
};

export const KODOMO_PROTO2_FRAMES = 440;
export const KodomoProto2: React.FC = () => {
  const f = useCurrentFrame();
  const c = camAt(CAM, f);
  const blur = motionBlur(c.v);
  // 600万の箱：光る → 小さくなって時間の棒へ → 18歳で戻る
  const glow = interpolate(f, [108, 114, 132, 140], [0, 1, 1, 0.3], clamp);
  const S = [0, 0.03, 0.1, 0.33, 0.63, 0.85, 0.95, 0.99, 1];
  const mv = at(S, f - 140), back = at(S, f - 176);
  const bx = 300 + (120 - 300) * mv, by = 1760 + (1975 - 1760) * mv;
  const x = f < 176 ? bx : bx + (300 - bx) * back, y = f < 176 ? by : by + (1760 - by) * back;
  const sc = f < 140 ? 1 : f < 176 ? 1 - 0.4 * mv : 0.6 + 0.4 * back;
  return (
    <AbsoluteFill style={{ background: M.paper, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 5200, transform: `translate(${540 - c.x * c.z}px, ${960 - c.y * c.z}px) scale(${c.z})`, transformOrigin: "0 0", filter: blur ? `blur(${blur}px)` : undefined }}>
        <div style={{ position: "absolute", inset: -400, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} />
        <div style={{ position: "absolute", left: 70, top: -400, width: 4, height: 6000, background: "rgba(239,125,87,0.35)" }} />
        {/* 1本の線（章と章をつなぐ。カメラはこの線を追って下へ） */}
        <svg width={1080} height={5200} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <GrowPath d="M540 930 L540 1300" start={50} kind="lineLong" color={INK} w={6} glow={false} />
          <GrowPath d="M110 2010 L900 2010" start={146} kind="lineLong" color={G} w={14} glow={false} />
          <GrowPath d="M930 2010 C1000 1880 980 1760 790 1770" start={172} kind="lineShort" color={RED} w={8} glow={false} />
          <GrowPath d="M540 2080 L540 2240" start={180} kind="lineShort" color={INK} w={6} glow={false} />
          <GrowPath d="M540 3070 L540 3180" start={262} kind="lineShort" color={INK} w={6} glow={false} />
          {/* デメリットの3本の枝 */}
          <GrowPath d="M540 3300 L540 3340 L200 3340 L200 3380" start={276} kind="lineShort" color={RED} w={6} glow={false} />
          <GrowPath d="M540 3340 L540 3380" start={294} kind="lineShort" color={RED} w={6} glow={false} />
          <GrowPath d="M540 3340 L880 3340 L880 3380" start={312} kind="lineShort" color={RED} w={6} glow={false} />
          <GrowPath d="M540 3900 L540 4080" start={350} kind="lineLong" color={INK} w={6} glow={false} />
        </svg>

        {/* 結論 */}
        <Head y={320} at={2} no="結論" title="子どもNISAは" />
        <div style={{ position: "absolute", left: 0, top: 470, width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#fff", border: `7px solid ${INK}`, borderRadius: 28, boxShadow: `12px 12px 0 ${G}`, padding: "28px 44px", textAlign: "center", ...titleSlam(f, 14) }}>
            <div style={{ ...K, fontSize: 52, color: M.sub, textDecoration: "line-through", textDecorationColor: RED, textDecorationThickness: 8 }}>教育資金</div>
            <div style={{ ...K, fontSize: 88 }}><span style={{ color: G }}>子どものお金</span>として</div>
            <div style={{ ...K, fontSize: 64 }}>使うもの</div>
          </div>
        </div>

        {/* ① 子どもNISAとは */}
        <Head y={1330} at={70} no="①" title="子どもNISAとは？" />
        <div style={{ position: "absolute", left: 300, top: 1460, ...K, fontSize: 36 }}><Words words={[["大人の新NISA", 78], ["　1,800万円", 84]]} /></div>
        <div style={{ position: "absolute", left: 300, top: 1520, ...pillPop(f, 80) }}><Box w={480} h={230} c={O} label="成長投資枠も使える" v="1,200" /></div>
        <div style={{ position: "absolute", left: x, top: y, transform: `${(pillPop(f, 86).transform as string) ?? ""} scale(${sc})`, transformOrigin: "0 0", opacity: pillPop(f, 86).opacity }}><Box w={480} h={200} c={G} label="積立" v="600" glow={glow} /></div>
        <div style={{ position: "absolute", left: 800, top: 1830, ...B, fontSize: 32, color: G, ...pillPop(f, 112) }}>← この600万円を</div>
        <div style={{ position: "absolute", left: 90, top: 2030, ...K, fontSize: 34, ...pillPop(f, 150) }}>0歳</div>
        <div style={{ position: "absolute", left: 860, top: 2030, ...K, fontSize: 34, ...pillPop(f, 156) }}>18歳</div>
        <div style={{ position: "absolute", left: 230, top: 2070, ...K, fontSize: 46, color: G }}><Words words={[["0歳から", 158], ["先に使える", 162]]} /></div>
        <div style={{ position: "absolute", left: 640, top: 1770, ...K, fontSize: 32, color: RED }}><Words words={[["18歳で", 178], ["大人のNISAへ", 182]]} /></div>
        {/* 全体像の表（だんだん速く並ぶ） */}
        <div style={{ position: "absolute", left: 90, top: 2260, width: 900, background: "#fff", border: `6px solid ${INK}`, borderRadius: 20, boxShadow: `10px 10px 0 ${G}`, overflow: "hidden", ...cardIn(f, 190) }}>
          <div style={{ background: G, color: "#fff", ...K, fontSize: 40, padding: "10px 24px" }}>子どもNISA 全体像</div>
          {ROWS.map(([k, v], i) => (
            <div key={k} style={{ display: "flex", borderTop: i ? `3px dashed ${M.gray}` : undefined, minHeight: 88, alignItems: "center", ...enter(f, 196 + stagger(i, ROWS.length, 3, "accel"), "slideL", "brake") }}>
              <span style={{ width: 330, ...K, fontSize: 32, padding: "0 20px", color: M.sub }}>{k}</span>
              <span style={{ flex: 1, ...K, fontSize: 38, lineHeight: 1.15 }}>{v}</span>
            </div>
          ))}
        </div>
        <svg width={1080} height={5200} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
          <GrowPath d="M430 2860 C700 2840 1000 2850 995 2915 C990 2985 640 2995 430 2980 C330 2965 340 2870 470 2857" start={250} kind="lineLong" color={RED} w={9} glow={false} />
        </svg>
        <div style={{ position: "absolute", left: 100, top: 3020, ...B, fontSize: 24, color: M.sub, ...cardIn(f, 200) }}>※600万円は大人の1,800万円の中に含まれる予定です（別に増えるわけではありません）</div>

        {/* ② デメリット3つ（線が3本に分かれて札が生まれる） */}
        <Head y={3200} at={272} no="②" title="デメリットは3つ" />
        {DEMERITS.map(([t, img, s], i) => (
          <div key={t} style={{ position: "absolute", left: [30, 370, 710][i], top: 3390, width: 340, display: "flex", flexDirection: "column", alignItems: "center", ...enter(f, s, "drop", "bounce") }}>
            <GenSlot name={img} size={230} />
            <div style={{ marginTop: -6, background: "#fff", border: `5px solid ${RED}`, borderRadius: 14, padding: "8px 10px", ...K, fontSize: 28, textAlign: "center", boxShadow: `5px 5px 0 ${INK}`, width: 300 }}>{t}</div>
          </div>
        ))}
        <div style={{ position: "absolute", left: 100, top: 3800, ...B, fontSize: 24, color: M.sub, ...cardIn(f, 324) }}>※やむを得ない場合の例外あり／12歳からは子どものための支出のみ・同意は書面</div>

        {/* ③ 教育資金は？（カメラは戻らない。上の3つが小さな札になって飛んでくる） */}
        <Head y={4110} at={366} no="③" title="教育資金は？" />
        {DEMERITS.map(([t], i) => {
          const s0 = 372 + i * 4;
          const p = at([0, 0.32, 0.56, 0.73, 0.84, 0.91, 0.95, 0.98, 1], f - s0);
          if (f < s0) return null;
          return <div key={t} style={{ position: "absolute", left: 560 * p + (1 - p) * [30, 370, 710][i], top: 4250 + i * 78 + (1 - p) * -600, transform: `scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * (i - 1) * 12}deg)`, transformOrigin: "0 0" }}><Chip size={28}>{t}</Chip></div>;
        })}
        <div style={{ position: "absolute", left: 120, top: 4360, ...enter(f, 392, "pop", "std") }}><GenSlot name="kn_parent_cant_open" size={360} /></div>
        <div style={{ position: "absolute", left: 520, top: 4520, ...K, fontSize: 46, lineHeight: 1.35 }}><Words words={[["子どものお金", 396], ["だから", 402]]} /><br /><span style={{ color: RED }}><Words words={[["親が自由に", 408], ["出せない", 412]]} /></span></div>
        <div style={{ position: "absolute", left: 130, top: 4760, ...enter(f, 418, "stamp", "kire") }}><span style={{ display: "inline-block", border: `8px solid ${O}`, color: O, background: "rgba(255,255,255,0.95)", borderRadius: 16, padding: "6px 26px", ...K, fontSize: 52, transform: "rotate(-6deg)" }}>教育資金は まず親のNISA</span></div>
      </div>

      {/* 左下：進み具合（NISA→債券と同じ） */}
      <div style={{ position: "absolute", left: 0, top: 0, transform: "scale(0.82)", transformOrigin: "0 1920px" }}>
        <Stepper labels={["概要", "デメリット", "教育資金", "使い方"]} steps={[2.3, 9.1, 12.2, 99]} x={30} y={1640} color={G} />
      </div>
      <Chara />
      <div style={{ position: "absolute", left: 20, top: 20, ...B, fontSize: 22, color: M.sub, background: "rgba(255,255,255,0.7)", padding: "4px 10px", borderRadius: 8 }}>試作v2（画像・声なし）f{f}</div>
    </AbsoluteFill>
  );
};
