import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { K, B, SER, M, F as F0 } from "./components/marke";
import { GenSlot } from "./MileLifePlan";
import { Stepper } from "./components/board";
import { TypeIn } from "./components/zukaiKit";
import { SfxTrack } from "./components/sfx";
import { TapCard } from "./components/tapCard";
import { camAt, CamKey, motionBlur, titleSlam, GrowPath, cardIn, at } from "./components/flowKit";
import { enter } from "./components/motionLib";
import { KODOMO_MOUTH } from "./kodomoMouth";
import { KODOMO_WARP } from "./kodomoWarp";

// 1回目の録音の時刻（台本の目安）→ 今の音声（少し早口）の時刻へ。文字起こしの言葉をつき合わせて作った表で直線補間
const W = (t: number) => {
  const A = KODOMO_WARP;
  let i = 0; while (i + 2 < A.length && t >= A[i + 1][0]) i++;
  const [o0, n0] = A[i], [o1, n1] = A[i + 1];
  return n0 + ((n1 - n0) * (t - o0)) / (o1 - o0);
};
const F = (t: number) => F0(W(t));

// ════════════════════════════════════════════════════════════════════
//  子どもNISA（声 public/kodomo-narration.wav 83.2秒・図解＋締め）台本：assets/script_kodomo_nisa.md v2
//  形：図解パート全体が1冊のノート。カメラが線を追って下へ進む（戻らない）。
//  今回の上げ幅：
//   ・字幕＝カラオケ式（話している所まで色が付く）＋大事な言葉にマーカーが引かれる
//   ・数字は「回って止まる」（1,800万円・2027年1月・18歳）
//   ・物が飛んで、ぶつかって、跳ね返る（一括✕）／コインが1枚ずつ落ちて積み上がる
//   ・大事な所は画面ごと揺れる・光る・寄る（ハンコ・合体の光・集中線）
// ════════════════════════════════════════════════════════════════════
const G = M.green, O = M.orange, INK = M.ink, RED = M.red, YEL = "#FFE15A";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const p01 = (f: number, a: number, b: number, e = OUT) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const SAFE = 0.86, SAFE_X = 40, SAFE_Y = 120;
export const KODOMO_REEL_FRAMES = F(83.4);

// ── カメラ（中身の中心 cy を画面の上寄り 720 に映す）──
const ck = (t: number, x: number, cy: number, z = 1, p: CamKey["p"] = "scroll"): CamKey => ({ f: F(t), x, y: cy + 200 / z, z, p });
const CAM: CamKey[] = [
  { f: 0, x: 540, y: 700 + 200 / 1.18, z: 1.18 },
  ck(3.2, 540, 690, 1, "zoomOut"),
  ck(7.1, 540, 1720, 1, "marke"),                      // ① 何？
  ck(13.5, 540, 2330),                      // 比較表
  ck(17.85, 430, 2370, 1.1, "slide"),       // こどもNISAの列に寄る
  ck(20.0, 560, 2390, 1, "slide"),          // 18歳で自動的に移行
  ck(22.85, 540, 3520, 1, "marke"),                      // ② デメリット
  ck(33.0, 540, 4260),                      // 例：お年玉
  ck(39.2, 540, 5180, 1, "marke"),          // ③ なんで？（ため→加速→ピタ）
  ck(45.6, 540, 5580, 1, "slide"),          // 教育資金は親
  ck(51.8, 540, 5740, 1.05, "zoomIn"),      // まずは親のNISA
  ck(53.85, 540, 6680, 1, "marke"),                      // ④ どう使う？
  ck(63.9, 560, 7000, 1, "slide"),          // 18歳で渡す
  ck(66.8, 540, 7620),                      // 画面を一緒に見る
  ck(71.5, 540, 7700, 1.08, "zoomIn"),      // 金融教育
];
const PUNCH = [18.0, 26.75, 38.15, 44.2, 52.05, 71.6]; // 大事な言葉の瞬間に、画面ごと少しグッと寄る
const SHAKES = [23.75, 26.75, 38.2, 52.1];   // 画面ごと揺れる所
const shakeAt = (f: number) => {
  let x = 0, y = 0;
  for (const s of SHAKES) { const k = f - F(s); if (k >= 0 && k < 9) { const a = (9 - k) * 2.6; x += Math.sin(k * 2.9) * a; y += Math.cos(k * 3.7) * a * 0.6; } }
  return { x, y };
};

// ── 部品 ──
const Head: React.FC<{ y: number; t: number; no: string; title: string; c?: string }> = ({ y, t, no, title, c = RED }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 70, top: y, display: "flex", alignItems: "center", gap: 18 }}>
      <span style={{ background: c, color: "#fff", borderRadius: 999, padding: "6px 26px", ...K, fontSize: 38, display: "inline-block", ...enter(f, F(t), "stamp", "kire") }}>{no}</span>
      <span style={{ ...K, fontSize: 62, color: INK }}>{f >= F(t) + 4 ? <TypeIn at={F(t) + 4} step={1.4}>{title}</TypeIn> : null}</span>
    </div>
  );
};
// マーカー：左から一気に引かれる
const Marker: React.FC<{ t: number; children: React.ReactNode; c?: string }> = ({ t, children, c = YEL }) => {
  const f = useCurrentFrame();
  const p = p01(f, F(t), F(t) + 7);
  return <span style={{ position: "relative", display: "inline-block" }}><span style={{ position: "absolute", left: -6, right: -6, bottom: 4, height: "42%", background: c, transformOrigin: "0 50%", transform: `scaleX(${p}) skewX(-8deg)`, borderRadius: 6, zIndex: 0 }} /><span style={{ position: "relative" }}>{children}</span></span>;
};
// 数字が回って止まる（桁ごとに少しずつ遅れて止まる）
const Roll: React.FC<{ t: number; text: string; dur?: number }> = ({ t, text, dur = 12 }) => {
  const f = useCurrentFrame();
  let d = 0;
  return <>{text.split("").map((ch, i) => {
    if (!/[0-9]/.test(ch)) return <span key={i}>{ch}</span>;
    const stop = F(t) + dur + d * 3; d++;
    const k = f - F(t);
    if (k < 0) return <span key={i} style={{ opacity: 0 }}>{ch}</span>;
    const shown = f >= stop ? ch : String((Number(ch) + 3 + Math.floor((stop - f) * 1.7) * 7) % 10);
    const land = f >= stop ? interpolate(f - stop, [0, 2, 5], [-10, 4, 0], clamp) : 0;
    return <span key={i} style={{ display: "inline-block", transform: `translateY(${land}px)`, filter: f < stop ? "blur(1.5px)" : undefined }}>{shown}</span>;
  })}</>;
};
// 光の輪（合体・ハンコの瞬間）
const Burst: React.FC<{ t: number; x: number; y: number; c?: string; r?: number; n?: number }> = ({ t, x, y, c = YEL, r = 170, n = 12 }) => {
  const f = useCurrentFrame();
  const k = f - F(t);
  if (k < 0 || k > 14) return null;
  const p = p01(f, F(t), F(t) + 12);
  return (
    <svg width={r * 3} height={r * 3} style={{ position: "absolute", left: x - r * 1.5, top: y - r * 1.5, overflow: "visible", pointerEvents: "none" }}>
      <circle cx={r * 1.5} cy={r * 1.5} r={r * (0.3 + 0.9 * p)} fill="none" stroke={c} strokeWidth={14 * (1 - p)} />
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2, r1 = r * (0.5 + 0.7 * p), r2 = r * (0.75 + 0.85 * p);
        return <line key={i} x1={r * 1.5 + Math.cos(a) * r1} y1={r * 1.5 + Math.sin(a) * r1} x2={r * 1.5 + Math.cos(a) * r2} y2={r * 1.5 + Math.sin(a) * r2} stroke={c} strokeWidth={10 * (1 - p)} strokeLinecap="round" />;
      })}
    </svg>
  );
};
const Img: React.FC<{ name: string; x: number; y: number; size: number; t: number; pat?: Parameters<typeof enter>[2]; tempo?: Parameters<typeof enter>[3]; style?: React.CSSProperties }> = ({ name, x, y, size, t, pat = "pop", tempo = "std", style }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: x, top: y, ...enter(f, F(t), pat, tempo), ...style }}><GenSlot name={name} size={size} /></div>;
};
const Chip: React.FC<{ c?: string; children: React.ReactNode; size?: number; bg?: string }> = ({ c = RED, children, size = 38, bg = "#fff" }) => (
  <span style={{ display: "inline-block", background: bg, border: `5px solid ${c}`, borderRadius: 16, padding: "8px 22px", ...K, fontSize: size, color: INK, boxShadow: `5px 5px 0 ${INK}`, whiteSpace: "nowrap" }}>{children}</span>
);
const Pos: React.FC<{ x: number; y: number; t: number; pat?: Parameters<typeof enter>[2]; tempo?: Parameters<typeof enter>[3]; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, t, pat = "pop", tempo = "std", children, style }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: x, top: y, ...enter(f, F(t), pat, tempo), ...style }}>{children}</div>;
};
const Stamp: React.FC<{ x: number; y: number; t: number; c?: string; size?: number; rot?: number; children: React.ReactNode }> = ({ x, y, t, c = RED, size = 54, rot = -6, children }) => (
  <Pos x={x} y={y} t={t} pat="stamp" tempo="kire"><span style={{ display: "inline-block", border: `8px solid ${c}`, color: c, background: "rgba(255,255,255,0.95)", borderRadius: 18, padding: "6px 28px", ...K, fontSize: size, transform: `rotate(${rot}deg)`, whiteSpace: "nowrap" }}>{children}</span></Pos>
);
const Note: React.FC<{ x: number; y: number; t: number; w?: number; children: React.ReactNode }> = ({ x, y, t, w = 900, children }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: x, top: y, width: w, ...B, fontSize: 24, color: M.sub, lineHeight: 1.4, ...cardIn(f, F(t)) }}>{children}</div>;
};

// ── 各章 ──
// 結論
const S0: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Head y={330} t={0.1} no="結論" title="子どもNISAは" />
    <div style={{ position: "absolute", left: 0, top: 470, width: 1080, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", background: "#fff", border: `7px solid ${INK}`, borderRadius: 28, boxShadow: `12px 12px 0 ${G}`, padding: "30px 46px", textAlign: "center", minWidth: 780, ...cardIn(f, F(1.9)) }}>
        <div style={{ position: "relative", display: "inline-block", ...K, fontSize: 64, color: M.sub, ...enter(f, F(2.05), "focus", "std") }}>
          教育資金目的
          <svg width={420} height={90} style={{ position: "absolute", left: -20, top: 0, overflow: "visible" }}>
            <GrowPath d="M0 52 C120 40 260 58 400 36" start={F(3.3)} kind="lineShort" color={RED} w={12} glow={false} />
          </svg>
        </div>
        <div style={{ ...K, fontSize: 40, color: M.sub, margin: "6px 0 2px", opacity: p01(f, F(3.6), F(3.9)) }}>ではなく</div>
        <div style={{ ...titleSlam(f, F(4.6)) }}>
          <div style={{ ...K, fontSize: 52 }}>将来の</div>
          <div style={{ ...K, fontSize: 96, color: G, lineHeight: 1.1 }}><Marker t={5.35}>子どものお金</Marker></div>
          <div style={{ ...K, fontSize: 56, marginTop: 6, opacity: p01(f, F(6.1), F(6.4)) }}>として使う</div>
        </div>
      </div>
    </div>
    <Img name="kn_child_hug_piggy" x={60} y={790} size={250} t={5.4} pat="rubber" tempo="bounce" />
    <Burst t={5.4} x={185} y={900} c={G} />
    <svg width={1080} height={1600} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <GrowPath d="M540 1150 L540 1520" start={F(7.0)} kind="lineLong" color={INK} w={6} glow={false} />
    </svg>
  </>
);

// 光が右回りに走る枠：枠が描かれる → 光の粒が枠の上を時計回りにぐるぐる回り続ける
const rrect = (x0: number, y0: number, x1: number, y1: number, r = 16) =>
  `M${x0 + r} ${y0} H${x1 - r} Q${x1} ${y0} ${x1} ${y0 + r} V${y1 - r} Q${x1} ${y1} ${x1 - r} ${y1} H${x0 + r} Q${x0} ${y1} ${x0} ${y1 - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`;
const GlowBox: React.FC<{ box: [number, number, number, number]; start: number; c?: string; w?: number; speed?: number }> = ({ box, start, c = RED, w = 7, speed = 0.022 }) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const d = rrect(...box);
  const p = at([0, 0.06, 0.16, 0.3, 0.46, 0.62, 0.76, 0.87, 0.95, 1], f - start);
  const head = -(f - start) * speed; // 時計回りに進む
  const seg = (len: number, width: number, color: string, op: number, blur?: number) => (
    <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${len} ${1 - len}`} strokeDashoffset={head + len} opacity={op * p01(f, start + 6, start + 12)} style={blur ? { filter: `blur(${blur}px)` } : undefined} />
  );
  return (
    <g>
      {/* 土台の枠（描かれていく） */}
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.85} />
      {/* 走る光：ぼんやりした尾 → 明るい芯 → 白い先頭 */}
      {seg(0.22, w * 4, c, 0.55, 8)}
      {seg(0.12, w * 1.6, "#FF9A8A", 0.95)}
      {seg(0.035, w * 1.2, "#fff", 1)}
    </g>
  );
};
// ① 子どもNISAって何？（大人の新NISAとの比較表：右の大人の枠 → つみたて投資枠の子ども版として左に こどもNISA が入る → 18歳で自動的に移行）
const TY = 2130, HH = 92, RH = 108, CX = [40, 245, 510, 775, 1040];
const ROWS2: [string, React.ReactNode, React.ReactNode, React.ReactNode][] = [
  ["対象年齢", <Marker t={18.3}>0〜17歳</Marker>, "18歳以上", "18歳以上"],
  ["年間投資枠", "60万円", "120万円", "240万円"],
  ["非課税で\n持てる上限", "600万円", null, null],
  ["引き出し", <span style={{ color: RED, fontSize: 28, lineHeight: 1.25 }}>12歳まで原則✕<br />以降は条件つき</span>, "制限なし", "制限なし"],
];
const S1: React.FC<{ f: number }> = ({ f }) => {
  const cell = (c: number, r: number, t: number, child: React.ReactNode, bg = "#fff", key?: string) => (
    <div key={key ?? `${c}-${r}`} style={{ position: "absolute", left: CX[c], top: TY + HH + r * RH, width: CX[c + 1] - CX[c], height: RH, background: bg, borderTop: `3px solid ${INK}`, borderLeft: c ? `3px solid ${INK}` : undefined, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", ...K, fontSize: c === 0 ? 28 : 36, whiteSpace: "pre-line", lineHeight: 1.2, boxSizing: "border-box", ...enter(f, F(t), c === 1 ? "drop" : "slideL", c === 1 ? "bounce" : "brake") }}>{child}</div>
  );
  const kidCol = F(17.95);
  const arrow = p01(f, F(20.15), F(20.15) + 10);
  return (
    <>
      <Head y={1560} t={7.65} no="①" title="子どもNISAって何？" c={G} />
      <Pos x={90} y={1690} t={10.45} pat="flip" tempo="std">
        <div style={{ background: INK, color: "#fff", borderRadius: 18, padding: "10px 28px", ...SER, fontSize: 84, boxShadow: `8px 8px 0 ${G}`, display: "inline-block" }}><Roll t={10.5} text="2027" /><span style={{ ...K, fontSize: 44 }}>年</span><Roll t={11.3} text="1" dur={8} /><span style={{ ...K, fontSize: 44 }}>月〜</span></div>
      </Pos>
      <Pos x={150} y={1830} t={11.0}><span style={{ ...B, fontSize: 26, color: M.sub }}>スタート（予定）</span></Pos>
      <Pos x={600} y={1700} t={12.4} pat="slideL" tempo="brake"><Chip c={G} size={42}>子ども用のNISA</Chip></Pos>
      <Img name="kn_family_baby" x={760} y={1760} size={200} t={12.6} pat="pop" tempo="bounce" />

      {/* 上の帯：大人の新NISA（右2列）／つみたて投資枠（真ん中から左へ伸びて こどもNISA の上まで） */}
      <div style={{ position: "absolute", left: CX[2], top: TY - 150, width: CX[4] - CX[2], height: 62, background: O, border: `4px solid ${INK}`, borderRadius: "14px 14px 0 0", color: "#fff", ...K, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", ...enter(f, F(13.7), "wipe", "brake") }}>大人の新NISA　総枠 <span style={{ ...SER, fontSize: 44, margin: "0 4px" }}>{f >= F(14.9) ? <Roll t={14.9} text="1,800" dur={10} /> : "　"}</span>万円</div>
      {f >= F(17.0) ? <div style={{ position: "absolute", left: CX[1], top: TY - 78, width: CX[3] - CX[1], height: 62, background: YEL, border: `4px solid ${INK}`, borderRadius: "14px 14px 0 0", ...K, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", transformOrigin: "100% 50%", transform: `scaleX(${0.5 + 0.5 * p01(f, F(17.0), F(17.0) + 9)})` }}>つみたて投資枠</div> : <div style={{ position: "absolute", left: CX[2], top: TY - 78, width: CX[3] - CX[2], height: 62, background: "#FFF3B8", border: `4px solid ${INK}`, borderRadius: "14px 14px 0 0", ...K, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", ...enter(f, F(13.9), "wipe", "brake") }}>つみたて投資枠</div>}
      {/* 見出しの行 */}
      <div style={{ position: "absolute", left: CX[0], top: TY, width: CX[1] - CX[0], height: HH, background: "#EFE8D4", border: `3px solid ${INK}`, ...cardIn(f, F(13.8)) }} />
      <div style={{ position: "absolute", left: CX[1], top: TY, width: CX[2] - CX[1], height: HH, background: G, border: `3px solid ${INK}`, color: "#fff", ...K, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", ...enter(f, kidCol, "drop", "bounce") }}>こどもNISA</div>
      <div style={{ position: "absolute", left: CX[2], top: TY, width: CX[3] - CX[2], height: HH, background: "#FFF3B8", border: `3px solid ${INK}`, ...K, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", ...enter(f, F(13.9), "slideL", "brake") }}>大人</div>
      <div style={{ position: "absolute", left: CX[3], top: TY, width: CX[4] - CX[3], height: HH, background: "#FFE2CF", border: `3px solid ${INK}`, ...K, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", ...enter(f, F(14.0), "slideL", "brake") }}>成長投資枠</div>
      {/* 表の中身（大人の2列が先、こどもNISAの列があとから落ちてくる） */}
      <div style={{ position: "absolute", left: CX[0] - 4, top: TY - 4, width: CX[4] - CX[0] + 8, height: HH + RH * 4 + 8, border: `6px solid ${INK}`, borderRadius: 8, boxShadow: `10px 10px 0 ${G}`, pointerEvents: "none", ...cardIn(f, F(13.8)) }} />
      {ROWS2.map(([k, kid, tsu, gro], r) => (
        <React.Fragment key={k}>
          {cell(0, r, 13.85 + r * 0.1, k, "#F6F1E2")}
          {r === 2 ? (
            <div style={{ position: "absolute", left: CX[2], top: TY + HH + r * RH, width: CX[4] - CX[2], height: RH, background: "#fff", borderTop: `3px solid ${INK}`, borderLeft: `3px solid ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingLeft: 250, boxSizing: "border-box", ...K, fontSize: 34, lineHeight: 1.15, ...enter(f, F(14.1 + r * 0.1), "slideL", "brake") }}>
              <span>総枠 1,800万円</span><span style={{ fontSize: 22, color: M.sub }}>（成長は1,200万円まで）</span>
            </div>
          ) : (<>{cell(2, r, 14.0 + r * 0.1, tsu)}{cell(3, r, 14.1 + r * 0.1, gro)}</>)}
          {cell(1, r, 17.95 + (r + 1) * 0.1, r === 2 ? <span style={{ ...SER, fontSize: 52, color: G }}>600<span style={{ ...K, fontSize: 28 }}>万円</span></span> : kid, "#EAF6E2")}
        </React.Fragment>
      ))}
      {/* こどもNISAの列を光らせる */}
      {f >= kidCol ? <div style={{ position: "absolute", left: CX[1] - 6, top: TY - 6, width: CX[2] - CX[1] + 12, height: HH + RH * 4 + 12, border: `8px solid ${G}`, borderRadius: 10, boxShadow: `0 0 ${30 * interpolate(f, [kidCol + 6, kidCol + 14, F(20)], [0, 1, 0.3], clamp)}px ${YEL}`, pointerEvents: "none", opacity: p01(f, kidCol + 4, kidCol + 8) }} /> : null}
      {/* 18歳で自動的に移行（600万円 → 1,800万円の枠へ） */}
      {f >= F(20.15) ? <div style={{ position: "absolute", left: CX[1] + 205, top: TY + HH + 2 * RH + 20, width: 330 * arrow, height: 68, overflow: "hidden", zIndex: 5 }}>
        <div style={{ width: 330, height: 68, background: INK, color: "#fff", clipPath: "polygon(0 18%, 82% 18%, 82% 0, 100% 50%, 82% 100%, 82% 82%, 0 82%)", ...K, fontSize: 26, display: "flex", alignItems: "center", paddingLeft: 18, boxSizing: "border-box" }}>18歳で自動的に移行</div>
      </div> : null}
      <Burst t={21.4} x={(CX[2] + CX[4]) / 2} y={TY + HH + 2.5 * RH} c={YEL} r={220} />
      <svg width={1080} height={3400} style={{ position: "absolute", inset: 0, overflow: "visible", zIndex: 6, pointerEvents: "none" }}>
        <GrowPath d="M540 2760 L540 3300" start={F(22.9)} kind="lineLong" color={INK} w={6} glow={false} />
        {/* 赤ペン：1,800万円の枠 → 非課税で持てる上限の行 → こどもNISAの600万円 */}
        <GlowBox box={[494, 1964, 1056, 2056]} start={F(14.95)} />
        <GlowBox box={[508, 2436, 1042, 2548]} start={F(15.9)} />
        <GlowBox box={[244, 2436, 512, 2548]} start={F(18.7)} />
      </svg>
      <Note x={60} y={TY + HH + RH * 4 + 26} t={19.0} w={960}>※こどもNISAは2027年1月から始まる予定の制度です。600万円は大人の1,800万円の中に含まれる予定です（別に増えるわけではありません）</Note>
    </>
  );
};

// ② デメリット3つ
const SLOT = [40, 375, 710];
const S2: React.FC<{ f: number }> = ({ f }) => {
  // 自由度メーター：高 → 低
  const needle = interpolate(f, [F(31.9), F(32.25), F(32.5), F(32.7)], [55, -72, -55, -60], clamp);
  // 例：子どもNISAのアプリ画面。お年玉・ご祝儀が「一括で入れる」へ飛ぶ → エラーで弾かれる → 「毎月つみたて」にだけコインが落ちる
  const HIT = F(38.15);
  const fly = (t0: number, fromX: number, dir: number) => {
    const p = p01(f, F(t0), F(t0) + 14);
    const b = p01(f, HIT, HIT + 12, Easing.out(Easing.quad));
    const x = fromX + (380 - fromX) * p - dir * 300 * b;
    const y = 4470 - Math.sin(p * Math.PI) * 120 - (f < HIT ? Math.sin((f - F(t0)) / 6) * 6 : 0) - b * 80 + b * b * 300;
    const r = (1 - p) * dir * -25 + b * dir * -100;
    return { left: x, top: y, transform: `rotate(${r}deg) scale(${1 - 0.35 * p})`, opacity: 1 - p01(f, HIT + 10, HIT + 16) };
  };
  return (
    <>
      <Head y={3360} t={23.7} no="②" title="デメリット" />
      <Stamp x={640} y={3350} t={24.3} size={60}>3つ</Stamp>
      {/* 3つの空き枠 → 1つずつ埋まる */}
      {SLOT.map((x, i) => (
        <div key={i} style={{ position: "absolute", left: x, top: 3500, width: 330, height: 520, border: `4px dashed ${M.gray}`, borderRadius: 22, ...enter(f, F(24.4) + i * 3, "pop", "std") }}>
          <div style={{ position: "absolute", left: 14, top: 10, ...SER, fontSize: 64, color: "rgba(0,0,0,0.12)" }}>{i + 1}</div>
        </div>
      ))}
      <Pos x={SLOT[0]} y={3500} t={25.5} pat="drop" tempo="bounce"><div style={{ width: 330, height: 520, background: "#fff", border: `6px solid ${RED}`, borderRadius: 22, boxShadow: `8px 8px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20, boxSizing: "border-box", transform: f > F(26.6) && f < F(26.6) + 8 ? `rotate(${Math.sin((f - F(26.6)) * 2.5) * 3}deg)` : undefined }}>
        <GenSlot name="kn_piggy_locked" size={250} /><div style={{ ...SER, fontSize: 64, color: RED, marginTop: 10 }}>〜12<span style={{ ...K, fontSize: 34 }}>歳</span></div><div style={{ ...K, fontSize: 32, textAlign: "center", lineHeight: 1.3 }}>原則<br />引き出せない</div></div></Pos>
      <Pos x={SLOT[1]} y={3500} t={27.55} pat="drop" tempo="bounce"><div style={{ width: 330, height: 520, background: "#fff", border: `6px solid ${RED}`, borderRadius: 22, boxShadow: `8px 8px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20, boxSizing: "border-box" }}>
        <GenSlot name="kn_teen_sign" size={250} /><div style={{ ...SER, fontSize: 64, color: RED, marginTop: 10 }}>12<span style={{ ...K, fontSize: 34 }}>歳〜</span></div><div style={{ ...K, fontSize: 32, textAlign: "center", lineHeight: 1.3 }}>子どもの<br /><Marker t={29.3} c="#FFC9C2">同意が必要</Marker></div></div></Pos>
      <Pos x={SLOT[2]} y={3500} t={30.75} pat="drop" tempo="bounce"><div style={{ width: 330, height: 520, background: "#fff", border: `6px solid ${RED}`, borderRadius: 22, boxShadow: `8px 8px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 34, boxSizing: "border-box" }}>
        <svg width={260} height={160} viewBox="-130 -140 260 160" style={{ overflow: "visible" }}>
          <path d="M-110 0 A110 110 0 0 1 110 0" fill="none" stroke="#E6DFCC" strokeWidth={34} />
          <path d="M-110 0 A110 110 0 0 1 -55 -95" fill="none" stroke={RED} strokeWidth={34} />
          <path d="M55 -95 A110 110 0 0 1 110 0" fill="none" stroke={G} strokeWidth={34} />
          <line x1={0} y1={0} x2={0} y2={-95} stroke={INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${needle})`} />
          <circle cx={0} cy={0} r={14} fill={INK} />
          <text x={-118} y={30} fontSize={24} fontWeight={900} fill={RED}>低</text><text x={96} y={30} fontSize={24} fontWeight={900} fill={G}>高</text>
        </svg>
        <div style={{ ...K, fontSize: 30, color: M.sub, marginTop: 14 }}>自由度</div>
        <div style={{ ...SER, fontSize: 54, color: RED, marginTop: 4 }}>積立のみ</div>
        <div style={{ ...K, fontSize: 30, marginTop: 4 }}>一括 ✕</div></div></Pos>
      <svg width={1080} height={4800} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M875 4030 L875 4110 L540 4110 L540 4150" start={F(32.9)} kind="lineShort" color={RED} w={6} glow={false} />
      </svg>
      {/* 例：アプリの画面 */}
      <Pos x={70} y={4160} t={33.05} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 42 }}>例えば…</span></Pos>
      <Pos x={250} y={4220} t={33.3} pat="slideUp" tempo="brake">
        <div style={{ width: 580, height: 560, background: "#fff", border: `10px solid ${INK}`, borderRadius: 50, boxShadow: `12px 12px 0 ${G}`, position: "relative", overflow: "hidden", transform: f >= HIT && f < HIT + 9 ? `translateX(${Math.sin((f - HIT) * 2.6) * (9 - (f - HIT)) * 2.4}px)` : undefined }}>
          <div style={{ background: G, color: "#fff", ...K, fontSize: 34, padding: "26px 30px 16px" }}>こどもNISA　入金</div>
          <div style={{ padding: "14px 30px", ...B, fontSize: 24, color: M.sub }}>口座の名義：子ども</div>
          <div style={{ margin: "10px 30px", height: 104, borderRadius: 18, border: `5px solid ${f >= HIT ? RED : "#B9B2A0"}`, background: f >= HIT ? "#FFE4E0" : "#F2EFE6", display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 40, color: f >= HIT ? RED : "#8C8471", transform: f >= F(37.6) && f < F(37.6) + 4 ? "scale(0.95)" : undefined }}>{f >= HIT ? "✕ 一括はできません" : "一括で入れる"}</div>
          <div style={{ margin: "18px 30px", height: 104, borderRadius: 18, border: `5px solid ${G}`, background: "#EAF6E2", display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 40, color: G, boxShadow: f >= F(38.8) ? `0 0 ${(18 * (1 + Math.sin(f / 4))) / 2}px ${G}` : undefined }}>毎月つみたてのみ</div>
          {f >= F(37.5) && f < HIT + 6 ? <div style={{ position: "absolute", left: 320, top: 250, width: 70, height: 70, borderRadius: "50%", border: `6px solid ${INK}`, transform: `scale(${0.6 + 0.6 * p01(f, F(37.5), F(37.5) + 8)})`, opacity: 1 - p01(f, F(37.5) + 6, HIT + 6) }} /> : null}
        </div>
      </Pos>
      {f >= HIT ? <div style={{ position: "absolute", left: 270, top: 4140 + 70 * p01(f, HIT, HIT + 8, Easing.out(Easing.back(1.6))), width: 540, background: RED, color: "#fff", borderRadius: 18, padding: "16px 22px", ...K, fontSize: 34, textAlign: "center", boxShadow: "0 10px 24px rgba(0,0,0,0.25)", opacity: p01(f, HIT, HIT + 3), zIndex: 6 }}>⚠ 積立のみ：一括では入れられません</div> : null}
      {/* 子ども：お年玉を入れようとする → 弾かれて「えっ！」 */}
      <Img name="kn_kid_elementary" x={0} y={4330} size={340} t={33.4} pat="slideL" tempo="brake" style={{ transform: f >= HIT && f < HIT + 10 ? `rotate(${Math.sin((f - HIT) * 2.2) * 6}deg)` : undefined, zIndex: 4 }} />
      {f >= HIT + 4 ? <div style={{ position: "absolute", left: 40, top: 4370, zIndex: 7, ...enter(f, HIT + 4, "pop", "bounce") }}><span style={{ display: "inline-block", background: "#fff", border: `5px solid ${INK}`, borderRadius: 24, padding: "4px 18px", ...K, fontSize: 40 }}>えっ！</span></div> : null}
      {f >= F(34.0) ? <div style={{ position: "absolute", zIndex: 5, ...fly(34.0, 120, 1) }}><GenSlot name="kn_otoshidama" size={220} /></div> : null}
      {f >= F(34.6) ? <div style={{ position: "absolute", zIndex: 5, ...fly(34.6, 900, -1) }}><GenSlot name="kn_gift_envelope" size={220} /></div> : null}
      {Array.from({ length: 6 }).map((_, i) => {
        const s0 = F(38.9) + i * 4;
        if (f < s0) return null;
        const p = p01(f, s0, s0 + 7, Easing.in(Easing.quad));
        return <div key={i} style={{ position: "absolute", left: 500 + ((i % 3) - 1) * 40, top: 4560 + p * 120, opacity: 1 - p01(f, s0 + 6, s0 + 9), zIndex: 6 }}><GenSlot name="kn_coin" size={64} /></div>;
      })}
    </>
  );
};

// ③ なんで縛りが多い？ → 教育資金は親（人物は使わず、口座のカードと線で見せる）
const Acct: React.FC<{ c: string; title: string; rows: [string, React.ReactNode][]; w?: number; children?: React.ReactNode }> = ({ c, title, rows, w = 420, children }) => (
  <div style={{ width: w, background: "#fff", border: `6px solid ${INK}`, borderRadius: 24, boxShadow: `9px 9px 0 ${c}`, overflow: "hidden", position: "relative" }}>
    <div style={{ background: c, color: "#fff", ...K, fontSize: 36, padding: "16px 24px" }}>{title}</div>
    {rows.map(([k, v], i) => (
      <div key={k} style={{ display: "flex", alignItems: "center", padding: "12px 24px", borderTop: i ? `3px dashed ${M.gray}` : undefined, ...K, fontSize: 30 }}><span style={{ width: 130, color: M.sub, fontSize: 26 }}>{k}</span><span>{v}</span></div>
    ))}
    {children}
  </div>
);
const S3: React.FC<{ f: number }> = ({ f }) => {
  const LOCK = F(44.2);
  const rattle = f >= LOCK && f < LOCK + 24 ? Math.sin((f - LOCK) * 2.4) * (24 - (f - LOCK)) * 0.35 : 0;
  const pull = p01(f, F(43.5), LOCK, Easing.in(Easing.cubic));
  const bounce = p01(f, LOCK, LOCK + 10, Easing.out(Easing.back(2)));
  const nisa = p01(f, F(49.0), F(49.0) + 12, Easing.out(Easing.back(1.4))); // 親 → 親のNISA にめくれる
  return (
    <>
      <svg width={1080} height={6200} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 4760 L540 4900" start={F(39.3)} kind="lineShort" color={INK} w={6} glow={false} />
      </svg>
      <Head y={4920} t={39.65} no="③" title="なんで縛りが多い？" />
      {[0, 1, 2].map((i) => <Pos key={i} x={780 + i * 80} y={4860 - i * 40} t={40.1 + i * 0.12} pat="spin" tempo="bounce"><span style={{ ...K, fontSize: 70 - i * 10, color: RED, display: "inline-block", transform: `translateY(${Math.sin(f / 8 + i) * 8}px)` }}>？</span></Pos>)}
      {/* 子どもの口座 */}
      <Pos x={60} y={5060} t={41.7} pat="whip" tempo="brake" style={{ marginLeft: rattle }}>
        <Acct c={G} title="子どもの口座" rows={[["名義", "子ども"], ["お金", <span style={{ color: G }}>子どものもの</span>], ["引き出し", <span style={{ color: RED }}>12歳まで原則✕</span>]]}>
          {f >= LOCK ? <div style={{ position: "absolute", right: 14, top: 8, fontSize: 64, transform: `scale(${2 - bounce}) rotate(${(1 - bounce) * -20}deg)` }}>🔒</div> : null}
        </Acct>
      </Pos>
      {/* 親 → あとで親のNISAへめくれる */}
      <Pos x={600} y={5060} t={45.9} pat="whip" tempo="brake">
        <div style={{ transform: `perspective(1200px) rotateY(${nisa < 0.5 ? nisa * 180 : (nisa - 1) * 180}deg)` }}>
          {nisa < 0.5 ? <Acct c={O} title="親" w={400} rows={[["教育資金", "親が払う"], ["引き出し", "自由"]]} />
            : <Acct c={O} title="親のNISA" w={400} rows={[["引き出し", "いつでも"], ["使い道", "自由"]]}>
                <svg width={380} height={110} style={{ display: "block", margin: "0 auto 10px" }}><GrowPath d="M20 95 L90 80 L150 86 L220 50 L290 58 L360 15" start={F(49.4)} kind="lineLong" color={O} w={9} glow={false} /></svg>
              </Acct>}
        </div>
      </Pos>
      {/* 親が子どもの口座から引き出そうとして、鍵で弾かれる */}
      {/* 親：子どもの口座の鍵を引っぱる → 開かずにガタガタ → 汗 → はけて、親のカードに入れ替わる */}
      {f >= F(43.3) && f < F(46.2) ? <div style={{ position: "absolute", left: 470 - 30 * pull + (f >= LOCK ? Math.sin(f * 1.7) * 9 * (1 - p01(f, LOCK + 20, LOCK + 34)) : 0) + 700 * p01(f, F(45.7), F(46.2), Easing.in(Easing.cubic)), top: 5050, zIndex: 4, ...enter(f, F(43.3), "whip", "brake") }}>
        <GenSlot name="kn_parent_cant_open" size={330} />
        {f >= LOCK + 6 ? <div style={{ position: "absolute", right: 10, top: 0, ...K, fontSize: 54, transform: `translateY(${Math.sin(f / 4) * 4}px)` }}>💦</div> : null}
      </div> : null}
      <Pos x={150} y={5430} t={44.4} pat="slideUp" tempo="brake"><span style={{ ...K, fontSize: 42, color: RED }}>親が自由に<Marker t={44.7} c="#FFC9C2">引き出せない仕組み</Marker></span></Pos>
      {/* 教育資金 */}
      <Pos x={60} y={5560} t={45.8} pat="wipe" tempo="brake"><span style={{ ...K, fontSize: 46 }}>つまり…</span></Pos>
      <Pos x={360} y={5660} t={46.85} pat="drop" tempo="bounce">
        <div style={{ width: 420, background: "#fff", border: `6px solid ${INK}`, borderRadius: 18, boxShadow: `9px 9px 0 ${INK}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <GenSlot name="kn_school_items" size={130} />
          <div><div style={{ ...K, fontSize: 40 }}>教育資金</div><div style={{ ...B, fontSize: 24, color: M.sub }}>入学金・授業料など</div><div style={{ ...K, fontSize: 30, color: O }}>払うのは 親</div></div>
        </div>
      </Pos>
      <svg width={1080} height={6600} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M250 5400 C250 5540 280 5660 330 5720" start={F(47.6)} kind="lineShort" color={RED} w={8} glow={false} />
        <GrowPath d="M800 5390 C800 5540 790 5660 750 5720" start={F(50.3)} kind="lineLong" color={O} w={12} glow={false} />
        <GrowPath d="M540 6040 L540 6560" start={F(53.9)} kind="lineLong" color={INK} w={6} glow={false} />
      </svg>
      <Stamp x={270} y={5520} t={47.75} size={38} rot={-8}>✕ 使いにくい</Stamp>
      <Img name="kn_parent_school_pay" x={-10} y={5700} size={260} t={47.1} pat="slideL" tempo="brake" />
      <Pos x={690} y={5480} t={50.45} pat="pop" tempo="bounce"><Chip c={O} size={28}>一部を株で用意するなら</Chip></Pos>
      {/* スポットライト：まわりを少し暗く */}
      {f >= F(51.9) ? <div style={{ position: "absolute", left: -600, top: 5000, width: 2280, height: 1700, background: "radial-gradient(circle at 1140px 960px, rgba(0,0,0,0) 330px, rgba(40,30,10,0.42) 560px)", opacity: interpolate(f, [F(51.9), F(51.9) + 8, F(53.7), F(53.7) + 8], [0, 1, 1, 0], clamp), pointerEvents: "none", zIndex: 8 }} /> : null}
      <div style={{ position: "absolute", left: 40, top: 5820, zIndex: 9, ...enter(f, F(51.95), "zoomIn", "brake") }}><GenSlot name="kn_parent_phone_nisa" size={300} /></div>
      <div style={{ position: "absolute", left: 0, top: 0, zIndex: 9 }}><Stamp x={330} y={5900} t={52.05} c={O} size={72}>まずは親のNISA</Stamp></div>
      <Burst t={52.05} x={560} y={5960} c={O} r={280} n={16} />
    </>
  );
};

// ④ どう使う？
const S4: React.FC<{ f: number }> = ({ f }) => {
  // 18年分の棒が1本ずつ伸びる（積立の山）
  const bars = Array.from({ length: 18 });
  const grow = (i: number) => p01(f, F(61.4) + i * 2.2, F(61.4) + i * 2.2 + 8, Easing.out(Easing.back(1.4)));
  // 画面の中のグラフと数字
  const cnt = interpolate(f, [F(67.9), F(69.3)], [108, 175], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <>
      <Head y={6590} t={54.3} no="④" title="じゃあどう使う？" c={G} />
      <Pos x={90} y={6720} t={57.1} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 46 }}>あくまで <span style={{ color: G }}><Marker t={57.7}>子どものお金</Marker></span></span></Pos>
      {/* 1万円でも、数千円でも：コインがポトポト */}
      <Pos x={120} y={6830} t={59.0} pat="drop" tempo="bounce"><Chip c={G} size={40}>月1万円</Chip></Pos>
      <Pos x={430} y={6830} t={59.85} pat="drop" tempo="bounce"><Chip c={G} size={40}>数千円</Chip></Pos>
      <Pos x={690} y={6830} t={60.4} pat="pop" tempo="kire"><span style={{ ...K, fontSize: 44 }}>でもOK</span></Pos>
      {/* 0歳→18歳の積立の山 */}
      <div style={{ position: "absolute", left: 90, top: 6960, width: 900, height: 330 }}>
        {bars.map((_, i) => <div key={i} style={{ position: "absolute", left: i * 46, bottom: 0, width: 34, height: 18 + i * 15, background: i === 17 ? YEL : G, border: `3px solid ${INK}`, borderRadius: 6, transformOrigin: "50% 100%", transform: `scaleY(${grow(i)})`, opacity: f >= F(61.4) + i * 2.2 ? 1 : 0 }} />)}
        <div style={{ position: "absolute", left: 0, top: 336, width: 860, height: 6, background: INK, borderRadius: 3, opacity: f >= F(61.3) ? 1 : 0 }} />
        <div style={{ position: "absolute", left: -10, top: 350, ...K, fontSize: 30, opacity: f >= F(61.3) ? 1 : 0 }}>0歳</div>
        <div style={{ position: "absolute", left: 760, top: 350, ...K, fontSize: 30, color: RED, opacity: f >= F(63.9) ? 1 : 0 }}>18歳</div>
      </div>
      <Img name="kn_coin_stack" x={720} y={6790} size={220} t={63.3} pat="pop" tempo="bounce" />
      <Img name="kn_handover_18" x={560} y={7150} size={330} t={64.4} pat="slideL" tempo="brake" />
      <Pos x={140} y={7340} t={65.5} pat="pop" tempo="bounce"><span style={{ ...K, fontSize: 48 }}>将来、<span style={{ color: G }}><Marker t={65.9}>子どもに渡す</Marker></span></span></Pos>
      {/* 実際の画面：スマホの中でグラフが伸びる */}
      <Pos x={330} y={7470} t={66.85} pat="slideUp" tempo="brake">
        <div style={{ width: 420, height: 560, background: "#fff", border: `10px solid ${INK}`, borderRadius: 54, boxShadow: `12px 12px 0 ${G}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 150, top: 14, width: 100, height: 14, background: INK, borderRadius: 7 }} />
          <div style={{ position: "absolute", left: 30, top: 60, ...B, fontSize: 24, color: M.sub }}>子どもの口座</div>
          <div style={{ position: "absolute", left: 30, top: 92, ...SER, fontSize: 70, color: G }}>{f >= F(67.9) ? Math.round(cnt) : 108}<span style={{ ...K, fontSize: 32 }}>万円</span></div>
          <div style={{ position: "absolute", left: 30, top: 178, ...B, fontSize: 22, color: M.sub }}>積み立てた額 108万円</div>
          <svg width={400} height={300} style={{ position: "absolute", left: 0, top: 230 }}>
            <GrowPath d="M30 260 L90 230 L140 238 L190 190 L240 200 L290 140 L340 100 L370 60" start={F(67.2)} kind="lineLong" color={G} w={10} glow={false} />
          </svg>
        </div>
      </Pos>
      <Img name="kn_parent_kid_phone" x={-30} y={7600} size={360} t={68.9} pat="slideL" tempo="brake" />
      <Img name="kn_kid_surprised_grow" x={760} y={7590} size={280} t={67.6} pat="rubber" tempo="bounce" />
      <Pos x={700} y={7520} t={67.75} pat="pop" tempo="bounce"><span style={{ ...K, fontSize: 40, color: RED, display: "inline-block", transform: "rotate(8deg)" }}>増えてる！</span></Pos>
      <Stamp x={300} y={8090} t={71.6} c={G} size={70} rot={-4}>金融教育にも</Stamp>
      <Burst t={71.6} x={640} y={8140} c={G} r={280} n={18} />
      <Note x={110} y={8250} t={69.5}>※月5,000円を0歳から18年・年5%で増えた場合の計算例（月ごとの複利・税金なし）。将来の結果を約束するものではありません</Note>
    </>
  );
};

// ── 締め（ガイド）：特典の表紙＋後ろでスライドが流れる ──
const Guide: React.FC<{ f: number }> = ({ f }) => {
  if (f < F(73.5)) return null;
  const inP = p01(f, F(73.5), F(73.5) + 12);
  const outP = p01(f, F(78.4), F(78.4) + 8, Easing.in(Easing.cubic));
  const flip = p01(f, F(73.9), F(73.9) + 12, Easing.out(Easing.back(1.3)));
  const items: [string, number][] = [["制度の基本", 75.1], ["注意点", 75.8], ["使い方", 76.6]];
  return (
    <AbsoluteFill style={{ background: M.paper, clipPath: `circle(${inP * 1500}px at 540 700)`, transform: `translateY(${outP * -1900}px)` }}>
      {/* 後ろ：中身のスライドが流れる（ぼかして暗めに） */}
      <Sequence from={F(73.5)} layout="none">
        <OffthreadVideo src={staticFile("cta_nisabond/slides.mp4")} muted playbackRate={1.4} style={{ position: "absolute", left: -60, top: -40, width: 1200, height: 1380, objectFit: "cover", filter: "blur(5px) brightness(0.9)", transform: `scale(${1.05 + 0.04 * p01(f, F(73.5), F(78.4), Easing.linear)})` }} />
      </Sequence>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(251,246,216,0.35), rgba(251,246,216,0.55) 60%, rgba(251,246,216,0.95) 70%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", ...K, fontSize: 60 }}><span style={{ background: "rgba(255,255,255,0.9)", padding: "6px 20px", borderRadius: 14 }}><Marker t={74.4}>ガイドにまとめました</Marker></span></div>
      {/* 表紙：くるっと回って出る */}
      <div style={{ position: "absolute", left: 60, top: 360, width: 960, transform: `perspective(1600px) rotateY(${(1 - flip) * -75}deg) rotate(${-2 * flip}deg) scale(${0.85 + 0.15 * flip})`, opacity: flip > 0.02 ? 1 : 0, boxShadow: "0 24px 50px rgba(60,45,10,0.35)", border: `8px solid #fff`, borderRadius: 18, overflow: "hidden" }}>
        <Img2 />
      </div>
      <div style={{ position: "absolute", left: 640, top: 310, ...enter(f, F(74.6), "stamp", "kire") }}><span style={{ display: "inline-block", background: YEL, ...K, fontSize: 40, padding: "10px 24px", transform: "rotate(6deg)", boxShadow: "4px 6px 10px rgba(0,0,0,0.15)" }}>作りました！</span></div>
      <div style={{ position: "absolute", left: 90, top: 950, display: "flex", gap: 22 }}>
        {items.map(([t, s0]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: `5px solid ${G}`, borderRadius: 16, padding: "10px 18px", boxShadow: `5px 5px 0 ${INK}`, ...enter(f, F(s0), "drop", "bounce") }}>
            <span style={{ ...K, fontSize: 40, color: G }}>✓</span><span style={{ ...K, fontSize: 38 }}>{t}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
const Img2: React.FC = () => <img src={staticFile("cta_kodomo/cover.jpg")} style={{ width: "100%", display: "block" }} />;

// ── 字幕（カラオケ式：話している所まで濃くなる。*緑* !赤! はマーカーつき）──
const SUBS: [number, string][] = [
  // 「/」＝改行の位置（意味のかたまりで切る。1行に収まらない時だけ2行。単語の途中で折り返さない）
  [0.0, "まず結論から言うと"], [1.44, "子どもNISAは/!教育資金目的! ではなくて"], [4.32, "あくまで/*将来の子どものお金* として"], [6.2, "使うのが良いと思います"],
  [7.56, "そもそも/子どもNISAって何？っていうと"], [10.54, "*2027年1月* から始まる"], [12.42, "子ども用のNISA"],
  [13.66, "大人の新NISA/*1,800万円* の枠のうち"], [16.94, "*つみたて投資枠* を"], [17.94, "*0歳から* 使えるように/したイメージです"],
  [20.12, "18歳になると"], [21.34, "そのまま/*大人のNISA* に移ります"],
  [23.28, "ただ !デメリット! が3つあって"], [25.54, "!12歳まで! は/原則引き出せない"], [27.56, "12歳を過ぎても/!子どもの同意! が必要"],
  [30.14, "しかも !積み立てのみ! なので"], [32.04, "自由度が低いです"], [33.04, "例えば/お年玉やお祝いの一部を"],
  [35.94, "子どものお金として/置いておきたくても"], [38.16, "!一括! では入れられないです"],
  [39.6, "なんでこんなに/縛りが多いかっていうと"], [41.7, "あくまで/*子どものお金* だから"], [43.46, "親が自由に引き出せない/仕組みになっています"],
  [45.8, "つまり/!親が払う教育資金! には使いにくい"], [48.66, "なので 教育資金を/一部株で用意するなら"], [52.04, "まずは *親のNISA* を/使うのが良いと思います"],
  [54.3, "では 子どもNISAは/どう使えばいいのかっていうと"], [57.04, "あくまで/子どものお金だから"], [59.0, "*1万円でも 数千円でも*/いいので"],
  [61.44, "子どもの将来のために/積み立てて置いてあげる"], [63.98, "それを将来/*子どもに渡してあげる* イメージです"],
  [66.9, "「こうやって/お金が増えるんだよ」って"], [68.92, "実際の画面を元に/一緒に話すことで"], [71.6, "*金融教育* にも/繋がると思います"],
  [73.6, "ということで/子どもNISAの概要や注意点"], [76.56, "使い方など/*ガイド* にまとめました"], [78.5, "欲しい方は/プロフのリンクから"], [80.3, "*公式LINE* を追加して"], [82.02, "ここから受け取ってください"],
];
const END = 83.3;
// 今の時刻 → 1回目の録音の時刻（字幕の表は1回目の時刻で書いてある）
const W0 = (t: number) => {
  const A = KODOMO_WARP;
  let i = 0; while (i + 2 < A.length && t >= A[i + 1][1]) i++;
  const [o0, n0] = A[i], [o1, n1] = A[i + 1];
  return o0 + ((o1 - o0) * (t - n0)) / (n1 - n0);
};
const Karaoke: React.FC = () => {
  const f = useCurrentFrame();
  const t = W0(f / 30);
  let i = -1;
  SUBS.forEach(([s], k) => { if (t >= s) i = k; });
  if (i < 0 || t > END) return null;
  const [s, raw] = SUBS[i];
  const e = i + 1 < SUBS.length ? SUBS[i + 1][0] : END;
  // 文字ごとの色と、話している所までの割合
  const parts: { ch: string; c: string | null }[] = [];
  let mode: string | null = null;
  for (const ch of raw) {
    if (ch === "*" || ch === "!") { mode = mode ? null : ch; continue; }
    parts.push({ ch, c: mode === "*" ? G : mode === "!" ? RED : null });
  }
  const n = parts.filter((p) => p.ch !== " " && p.ch !== "/").length;
  const longest = Math.max(...raw.replace(/[*!]/g, "").split("/").map((l) => l.length));
  const size = Math.min(42, Math.floor(650 / longest));
  const spoken = interpolate(t, [s, s + (e - s) * 0.92], [0, n], clamp);
  const k = f - F(s);
  const inS = interpolate(k, [0, 2, 5], [0.9, 1.04, 1], clamp);
  let idx = 0;
  return (
    <div style={{ position: "absolute", left: 40, width: 720, top: 1185, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(255,255,255,0.94)", border: `5px solid ${INK}`, borderRadius: 22, padding: "12px 26px", boxShadow: `6px 6px 0 ${INK}`, maxWidth: 700, textAlign: "center", whiteSpace: "nowrap", transform: `scale(${inS})`, ...K, fontSize: size, lineHeight: 1.32 }}>
        {parts.map((p, j) => {
          if (p.ch === "/") return <br key={j} />;
          if (p.ch === " ") return <span key={j}> </span>;
          const on = idx++ < spoken;
          const col = on ? (p.c ?? INK) : "#C9C2B0";
          return <span key={j} style={{ color: col, background: on && p.c ? (p.c === G ? "rgba(255,225,90,0.55)" : "rgba(255,190,180,0.6)") : undefined }}>{p.ch}</span>;
        })}
      </div>
    </div>
  );
};

// 右下のたいち（口パク）
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= F(END)) return null;
  const lv = KODOMO_MOUTH.charCodeAt(Math.min(KODOMO_MOUTH.length - 1, f)) - 48;
  const blink = f % 96 > 92 && lv === 0;
  const name = blink ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 3) % 4 ? "taichi_talk_open" : "taichi_talk_mid") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  return <div style={{ position: "absolute", left: 760, top: 1190 + Math.sin(f / 10) * 4, width: 200, height: 200 }}><GenSlot name={name} size={200} /></div>;
};

// 効果音（たいちさんの音 u01〜u10 のみ・0秒には置かない）
const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  s("u02s", 0.15, 0.16), s("u04", 3.3, 0.24), s("u05", 4.6, 0.24), s("u06", 5.4, 0.2),
  s("u03s", 7.5, 0.2), s("u02s", 7.7, 0.16), s("u05s", 10.5, 0.2), s("u02s", 12.4, 0.16), s("u03s", 13.5, 0.18), s("u05s", 15.0, 0.2), s("u06", 16.95, 0.2),
  s("u03s", 18.0, 0.18), s("u10", 21.4, 0.2), s("u09", 22.45, 0.24),
  s("u03s", 23.2, 0.2), s("u04", 23.75, 0.3), s("u05s", 24.3, 0.2), s("u04", 25.5, 0.26), s("u07", 26.75, 0.2), s("u04", 27.55, 0.26), s("u04", 30.75, 0.26), s("u06", 32.2, 0.2),
  s("u03s", 33.0, 0.18), s("u02s", 34.0, 0.16), s("u02s", 34.6, 0.16), s("u05s", 35.9, 0.2), s("u04", 38.15, 0.32),
  ...[0, 1, 2, 3, 4, 5].map((i) => s("u02s", 38.9 + (i * 4) / 30 + 0.2, 0.1)),
  s("u03s", 39.5, 0.2), s("u02s", 39.7, 0.16), s("u05s", 41.7, 0.2), s("u07", 43.45, 0.2), s("u05s", 46.85, 0.2), s("u04", 47.75, 0.26),
  s("u02s", 50.45, 0.16), s("u09", 52.05, 0.28),
  s("u03s", 54.2, 0.2), s("u02s", 54.3, 0.16), s("u05s", 59.0, 0.2), s("u05s", 59.85, 0.2), s("u10", 61.4, 0.18), s("u06", 64.4, 0.2),
  s("u03s", 66.8, 0.18), s("u05", 67.9, 0.22), s("u06", 68.9, 0.2), s("u09", 71.6, 0.26),
  s("u03s", 73.5, 0.2), s("u02s", 75.1, 0.16), s("u02s", 75.8, 0.16), s("u02s", 76.6, 0.16), s("u07", 78.4, 0.2), s("u06", 82.0, 0.2),
];

export const KodomoReel: React.FC = () => {
  const f = useCurrentFrame();
  const c = camAt(CAM, f);
  const sh = shakeAt(f);
  const punch = PUNCH.reduce((a, t) => { const k = f - F(t); return k >= 0 && k < 12 ? a + at([0, 0.06, 0.075, 0.06, 0.04, 0.025, 0.014, 0.007, 0.003, 0], k) : a; }, 0);
  const blur = motionBlur(c.v);
  const drift = Math.sin(f / 50) * 6; // ずっと少しだけ息をしている
  return (
    <AbsoluteFill style={{ background: M.paper, overflow: "hidden" }}>
      <Audio src={staticFile("kodomo-narration.wav")} />
      <SfxTrack cues={CUES} />
      {/* 安全な枠：右のいいね列（x>950）・下の名前と説明（y>1450）・上のリール表示（y<150）をよける */}
      <div style={{ position: "absolute", left: SAFE_X, top: SAFE_Y, width: 1080, height: 1920, transform: `scale(${SAFE})`, transformOrigin: "0 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + punch})`, transformOrigin: "540px 700px" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 9000, transform: `translate(${540 - c.x * c.z + sh.x + drift}px, ${960 - c.y * c.z + sh.y}px) scale(${c.z})`, transformOrigin: "0 0", filter: blur ? `blur(${blur}px)` : undefined }}>
        <div style={{ position: "absolute", inset: -600, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} />
        <div style={{ position: "absolute", left: 60, top: -600, width: 4, height: 10000, background: "rgba(239,125,87,0.35)" }} />
        {f < F(25) ? <S0 f={f} /> : null}
        {f > F(6) && f < F(40) ? <S1 f={f} /> : null}
        {f > F(22) && f < F(56) ? <S2 f={f} /> : null}
        {f > F(38) && f < F(75) ? <S3 f={f} /> : null}
        {f > F(53) ? <S4 f={f} /> : null}
      </div>
      </div>
      </div>
      {f >= F(78.4) ? <AbsoluteFill style={{ background: M.paper, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} /> : null}
      <Guide f={f} />
      <TapCard at={W(78.45)} until={W(80.25)} src="cta_nisabond/igprofile.jpg" iw={1178} ih={915} x={90} y={380} w={900} hit={[0.03, 0.9, 0.52, 0.085]} dimAt={W(78.8)} tapAt={W(79.5)} label={<>プロフの<span style={{ color: RED }}>リンク</span>から</>} labelAt={W(79.1)} />
      <TapCard at={W(80.3)} until={W(81.95)} src="cta_nisabond/links.jpg" iw={1179} ih={525} x={90} y={420} w={900} hit={[0.02, 0.03, 0.96, 0.3]} dimAt={W(80.5)} tapAt={W(80.95)} label={<><span style={{ color: "#06C755" }}>公式LINE</span>を追加して</>} labelAt={W(80.6)} labelTop={900} labelLeft={150} />
      <TapCard at={W(82.0)} src="cta_nisabond/site.webp" iw={2000} ih={1349} x={90} y={400} w={900} hit={[0.34, 0.52, 0.32, 0.45]} dimAt={W(82.1)} tapAt={W(82.4)} label={<>ここから<span style={{ color: RED }}>受け取り</span></>} labelAt={W(82.2)} labelTop={1050} labelLeft={110} rot={1} />
      {/* 下：字幕の帯（ノートが透けないように） */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, bottom: 0, background: `linear-gradient(${M.paper}00, ${M.paper} 50px)` }} />
      <Karaoke />
      <div style={{ position: "absolute", left: 0, top: 0, transform: "scale(0.55)", transformOrigin: "0 0", opacity: f < F(73.4) ? 1 : 0 }}>
        <Stepper labels={["結論", "概要", "デメリット", "教育資金", "使い方"]} steps={[0, 7.56, 23.28, 39.6, 54.3].map(W)} x={73} y={2490} color={G} />
      </div>
      <Chara />
    </AbsoluteFill>
  );
};
