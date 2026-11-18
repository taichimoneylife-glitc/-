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
  ck(7.5, 540, 1720),                      // ① 何？
  ck(13.5, 540, 2260, 1, "slide"),          // 1,800万円の箱
  ck(17.9, 540, 2780),                      // 0歳→18歳
  ck(21.2, 540, 2560, 1.0, "slide"),        // 大人のNISAへ戻る（少しだけ上に寄る＝合体の光）
  ck(23.2, 540, 3520),                      // ② デメリット
  ck(33.0, 540, 4260),                      // 例：お年玉
  ck(39.5, 540, 5060),                      // ③ なんで？
  ck(45.7, 540, 5560, 1, "slide"),          // 教育資金は親
  ck(51.8, 540, 5900, 1.06, "zoomIn"),      // まずは親のNISA
  ck(54.2, 540, 6680),                      // ④ どう使う？
  ck(63.9, 560, 7000, 1, "slide"),          // 18歳で渡す
  ck(66.8, 540, 7620),                      // 画面を一緒に見る
  ck(71.5, 540, 7700, 1.08, "zoomIn"),      // 金融教育
];
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

// ① 子どもNISAって何？
const BOXX = 150, BOXY = 2130, BOXW = 780, BOXH = 300;
const S1: React.FC<{ f: number }> = ({ f }) => {
  // 積立枠（緑）：光る → 抜けて時間の棒へ → 18歳で大人の箱へ戻る
  const glow = interpolate(f, [F(16.9), F(17.1), F(17.8)], [0, 1, 0.6], clamp);
  const go = at([0, 0.06, 0.2, 0.45, 0.7, 0.86, 0.95, 0.99, 1], (f - F(18.0)) / 1.2);
  const back = at([0, 0.03, 0.1, 0.3, 0.6, 0.85, 0.96, 1], (f - F(21.4)) / 1.3);
  const gx0 = BOXX + 18, gy0 = BOXY + 165, gx1 = 120, gy1 = 2650;
  const gx = f < F(21.4) ? gx0 + (gx1 - gx0) * go : gx1 + (gx0 - gx1) * back;
  const gy = f < F(21.4) ? gy0 + (gy1 - gy0) * go - Math.sin(go * Math.PI) * 120 : gy1 + (gy0 - gy1) * back - Math.sin(back * Math.PI) * 220;
  const gs = f < F(21.4) ? 1 - 0.45 * go : 0.55 + 0.45 * back;
  // 0歳→18歳の歩み
  const walk = p01(f, F(18.3), F(20.6), Easing.inOut(Easing.cubic));
  const age = Math.round(walk * 18);
  const kid = age < 6 ? "kn_child_hug_piggy" : age < 12 ? "kn_kid_elementary" : "kn_teen_sign";
  return (
    <>
      <Head y={1560} t={7.65} no="①" title="子どもNISAって何？" c={G} />
      {/* 2027年1月：数字が回って止まる */}
      <Pos x={90} y={1690} t={10.45} pat="flip" tempo="std">
        <div style={{ background: INK, color: "#fff", borderRadius: 18, padding: "10px 28px", ...SER, fontSize: 84, boxShadow: `8px 8px 0 ${G}`, display: "inline-block" }}><Roll t={10.5} text="2027" /><span style={{ ...K, fontSize: 44 }}>年</span><Roll t={11.3} text="1" dur={8} /><span style={{ ...K, fontSize: 44 }}>月〜</span></div>
      </Pos>
      <Pos x={150} y={1830} t={11.0}><span style={{ ...B, fontSize: 26, color: M.sub }}>スタート（予定）</span></Pos>
      <Pos x={600} y={1700} t={12.4} pat="slideL" tempo="brake"><Chip c={G} size={42}>子ども用のNISA</Chip></Pos>
      <Img name="kn_family_baby" x={740} y={1770} size={230} t={12.6} pat="pop" tempo="bounce" />
      {/* 大人の新NISA 1,800万円 */}
      <Pos x={BOXX} y={BOXY - 80} t={13.7} pat="wipe" tempo="brake"><span style={{ ...K, fontSize: 46 }}>大人の新NISA <span style={{ ...SER, fontSize: 64, color: O }}>{f >= F(15.0) ? <Roll t={15.0} text="1,800" dur={10} /> : null}</span><span style={{ fontSize: 36 }}>万円</span>の枠</span></Pos>
      <div style={{ position: "absolute", left: BOXX, top: BOXY, width: BOXW, height: BOXH, border: `7px solid ${INK}`, borderRadius: 20, background: O, boxShadow: `10px 10px 0 ${INK}`, ...cardIn(f, F(14.0)) }}>
        <div style={{ position: "absolute", left: 300, top: 30, ...K, fontSize: 40, color: "#fff" }}>成長投資枠など</div>
        <div style={{ position: "absolute", left: 18, top: 165, width: 360, height: 112, border: `4px dashed rgba(255,255,255,0.8)`, borderRadius: 14, opacity: f >= F(18.0) && f < F(22.4) ? 1 : 0 }} />
      </div>
      {/* 緑の積立枠（動く） */}
      <div style={{ position: "absolute", left: gx, top: gy, width: 360, height: 112, transform: `scale(${gs})`, transformOrigin: "0 0", background: G, border: `5px solid ${INK}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 38, color: "#fff", boxShadow: `0 0 ${40 * glow}px ${16 * glow}px ${YEL}`, opacity: f < F(14.3) ? 0 : 1, zIndex: 3 }}>つみたて投資枠</div>
      <Burst t={22.45} x={BOXX + 200} y={BOXY + 220} c={YEL} r={200} />
      {/* 時間の棒 0歳→18歳 */}
      <svg width={1080} height={3200} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M120 2830 L960 2830" start={F(17.95)} kind="lineLong" color={G} w={16} glow={false} />
        <GrowPath d="M960 2800 C1050 2660 1010 2470 900 2440" start={F(21.0)} kind="lineShort" color={RED} w={8} glow={false} />
        <GrowPath d="M540 2980 L540 3300" start={F(22.9)} kind="lineLong" color={INK} w={6} glow={false} />
      </svg>
      <Pos x={95} y={2855} t={18.0}><span style={{ ...K, fontSize: 38 }}>0歳</span></Pos>
      <Pos x={900} y={2855} t={18.2}><span style={{ ...K, fontSize: 38, color: RED }}>18歳</span></Pos>
      {f >= F(18.3) ? <div style={{ position: "absolute", left: 120 + walk * 780, top: 2590, transform: "translateX(-50%)" }}>
        <GenSlot name={kid} size={200} />
        <div style={{ textAlign: "center", ...SER, fontSize: 46, color: G, marginTop: -8 }}>{age}<span style={{ ...K, fontSize: 28 }}>歳</span></div>
      </div> : null}
      <Pos x={250} y={2920} t={18.2} pat="slideUp" tempo="brake"><span style={{ ...K, fontSize: 48, color: G }}><Marker t={18.5}>0歳から使える</Marker></span></Pos>
      <Pos x={660} y={2370} t={21.4} pat="pop" tempo="bounce"><Chip c={RED} size={34}>18歳で大人のNISAへ</Chip></Pos>
      <Note x={120} y={3010} t={19.0}>※2027年1月から始まる予定の制度です。600万円の枠は、大人の1,800万円の中に含まれる予定です</Note>
    </>
  );
};

// ② デメリット3つ
const SLOT = [40, 375, 710];
const S2: React.FC<{ f: number }> = ({ f }) => {
  // 自由度メーター：高 → 低
  const needle = interpolate(f, [F(31.9), F(32.25), F(32.5), F(32.7)], [55, -72, -55, -60], clamp);
  // お年玉・ご祝儀：飛んで → ぶつかって跳ね返る
  const fly = (t0: number, fromX: number, dir: number) => {
    const p = p01(f, F(t0), F(38.15), Easing.in(Easing.quad));
    const b = p01(f, F(38.15), F(38.15) + 12, Easing.out(Easing.quad));
    const x = fromX + (450 - fromX) * p - dir * 260 * b;
    const y = 4280 - Math.sin(p * Math.PI) * 160 + b * -60 + Math.pow(b, 2) * 260;
    const r = (1 - p) * dir * -20 + b * dir * -90;
    return { left: x, top: y, transform: `rotate(${r}deg)`, opacity: 1 - p01(f, F(38.15) + 10, F(38.15) + 16) };
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
      {/* 例：お年玉・お祝い → 一括 ✕ で跳ね返る → コインで少しずつ */}
      <Pos x={70} y={4160} t={33.05} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 42 }}>例えば…</span></Pos>
      {f >= F(34.0) ? <div style={{ position: "absolute", ...fly(34.0, 40, 1) }}><GenSlot name="kn_otoshidama" size={250} /></div> : null}
      {f >= F(34.6) ? <div style={{ position: "absolute", ...fly(34.6, 860, -1) }}><GenSlot name="kn_gift_envelope" size={250} /></div> : null}
      <Pos x={360} y={4520} t={35.9} pat="rubber" tempo="bounce"><div style={{ width: 360, height: 210, background: "#fff", border: `6px solid ${G}`, borderRadius: 22, boxShadow: `8px 8px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={{ ...K, fontSize: 30, color: M.sub }}>子どものお金として</span><span style={{ ...K, fontSize: 46, color: G }}>子どもNISA</span></div></Pos>
      {/* 見えない壁 → ぶつかった瞬間に出る */}
      {f >= F(38.15) ? <div style={{ position: "absolute", left: 340, top: 4440, width: 400, height: 14, background: RED, borderRadius: 8, opacity: interpolate(f - F(38.15), [0, 2, 30, 40], [0, 1, 1, 0.4], clamp), boxShadow: `0 0 24px ${RED}` }} /> : null}
      <Stamp x={410} y={4330} t={38.2} size={64}>一括 ✕</Stamp>
      {/* コインが1枚ずつ（積立だけ） */}
      {Array.from({ length: 6 }).map((_, i) => {
        const s0 = F(38.9) + i * 4;
        if (f < s0) return null;
        const p = p01(f, s0, s0 + 7, Easing.in(Easing.quad));
        return <div key={i} style={{ position: "absolute", left: 500 + (i % 3 - 1) * 26, top: 4380 + p * 150, opacity: 1 - p01(f, s0 + 6, s0 + 9) }}><GenSlot name="kn_coin" size={70} /></div>;
      })}
    </>
  );
};

// ③ なんで縛りが多い？ → 教育資金は親
const S3: React.FC<{ f: number }> = ({ f }) => {
  const struggle = f > F(44.0) && f < F(45.6) ? Math.sin(f * 1.9) * 7 : 0;
  return (
    <>
      <svg width={1080} height={6200} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 4760 L540 4900" start={F(39.3)} kind="lineShort" color={INK} w={6} glow={false} />
        {/* 教育資金 → 子どもNISA（✕） / → 親（○） */}
        <GrowPath d="M330 5700 C330 5600 250 5520 230 5420" start={F(46.95)} kind="lineShort" color={RED} w={8} glow={false} />
        <GrowPath d="M560 5770 C700 5770 760 5770 800 5770" start={F(47.3)} kind="lineShort" color={O} w={10} glow={false} />
      </svg>
      <Head y={4920} t={39.65} no="③" title="なんで縛りが多い？" />
      {/* ?マークがふわふわ */}
      {[0, 1, 2].map((i) => <Pos key={i} x={760 + i * 90} y={4840 - i * 40} t={40.1 + i * 0.12} pat="spin" tempo="bounce"><span style={{ ...K, fontSize: 70 - i * 10, color: RED, display: "inline-block", transform: `translateY(${Math.sin(f / 8 + i) * 8}px)` }}>？</span></Pos>)}
      <Img name="kn_child_hug_piggy" x={110} y={5060} size={260} t={41.7} pat="pop" tempo="bounce" />
      <Pos x={110} y={5330} t={42.1} pat="slideUp" tempo="brake"><Chip c={G} size={40}>子どものお金</Chip></Pos>
      <Img name="kn_parent_cant_open" x={560} y={5040} size={340} t={43.45} pat="whip" tempo="brake" style={{ marginLeft: struggle }} />
      <Pos x={520} y={5390} t={44.25} pat="slideUp" tempo="brake"><span style={{ ...K, fontSize: 40, color: RED }}>親が自由に<Marker t={44.6} c="#FFC9C2">引き出せない</Marker></span></Pos>
      {/* 教育資金は親が払う */}
      <Pos x={60} y={5520} t={45.8} pat="wipe" tempo="brake"><span style={{ ...K, fontSize: 48 }}>つまり…</span></Pos>
      <Img name="kn_school_items" x={200} y={5620} size={260} t={46.85} pat="drop" tempo="bounce" />
      <Pos x={180} y={5880} t={47.0}><span style={{ ...K, fontSize: 38 }}>教育資金</span></Pos>
      <Stamp x={250} y={5500} t={47.75} size={46} rot={8}>✕ 使いにくい</Stamp>
      <Img name="kn_parent_school_pay" x={720} y={5620} size={280} t={46.7} pat="slideL" tempo="brake" />
      <Pos x={740} y={5900} t={46.9}><Chip c={O} size={36}>払うのは親</Chip></Pos>
      {/* まずは親のNISA */}
      <Pos x={470} y={6000} t={50.45} pat="pop" tempo="bounce"><Chip c={O} size={34}>一部を株で用意するなら</Chip></Pos>
      <Img name="kn_parent_phone_nisa" x={80} y={5980} size={300} t={52.0} pat="rubber" tempo="bounce" />
      <Stamp x={370} y={6090} t={52.05} c={O} size={66}>まずは親のNISA</Stamp>
      <Burst t={52.05} x={700} y={6150} c={O} r={260} n={16} />
      <svg width={1080} height={6600} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <GrowPath d="M540 6260 L540 6560" start={F(53.9)} kind="lineLong" color={INK} w={6} glow={false} />
      </svg>
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
  [0.0, "まず結論から言うと"], [1.44, "子どもNISAは !教育資金目的! ではなくて"], [4.32, "あくまで *将来の子どものお金* として"], [6.2, "使うのが良いと思います"],
  [7.56, "そもそも 子どもNISAって何？っていうと"], [10.54, "*2027年1月* から始まる"], [12.42, "子ども用のNISA"],
  [13.66, "大人の新NISA *1,800万円* の枠のうち"], [16.94, "*つみたて投資枠* を"], [17.94, "*0歳から* 使えるようにしたイメージです"],
  [20.12, "18歳になると"], [21.34, "そのまま *大人のNISA* に移ります"],
  [23.28, "ただ !デメリット! が3つあって"], [25.54, "!12歳まで! は 原則引き出せない"], [27.56, "12歳を過ぎても !子どもの同意! が必要"],
  [30.14, "しかも !積み立てのみ! なので"], [32.04, "自由度が低いです"], [33.04, "例えば お年玉やお祝いの一部を"],
  [35.94, "子どものお金として 置いておきたくても"], [38.16, "!一括! では入れられないです"],
  [39.6, "なんでこんなに 縛りが多いかっていうと"], [41.7, "あくまで *子どものお金* だから"], [43.46, "親が自由に 引き出せない仕組みになっています"],
  [45.8, "つまり !親が払う教育資金! には使いにくい"], [48.66, "なので 教育資金を一部株で用意するなら"], [52.04, "まずは *親のNISA* を使うのが良いと思います"],
  [54.3, "では 子どもNISAは どう使えばいいのかっていうと"], [57.04, "あくまで 子どものお金だから"], [59.0, "*1万円でも 数千円でも* いいので"],
  [61.44, "子どもの将来のために 積み立てて置いてあげる"], [63.98, "それを将来 *子どもに渡してあげる* イメージです"],
  [66.9, "「こうやってお金が増えるんだよ」って"], [68.92, "実際の画面を元に 一緒に話すことで"], [71.6, "*金融教育* にも繋がると思います"],
  [73.6, "ということで 子どもNISAの概要や注意点"], [76.56, "使い方など *ガイド* にまとめました"], [78.5, "欲しい方は プロフのリンクから"], [80.3, "*公式LINE* を追加して"], [82.02, "ここから受け取ってください"],
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
  const n = parts.filter((p) => p.ch !== " ").length;
  const spoken = interpolate(t, [s, s + (e - s) * 0.92], [0, n], clamp);
  const k = f - F(s);
  const inS = interpolate(k, [0, 2, 5], [0.9, 1.04, 1], clamp);
  let idx = 0;
  return (
    <div style={{ position: "absolute", left: 40, width: 720, top: 1185, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(255,255,255,0.94)", border: `5px solid ${INK}`, borderRadius: 22, padding: "12px 26px", boxShadow: `6px 6px 0 ${INK}`, maxWidth: 700, textAlign: "center", transform: `scale(${inS})`, ...K, fontSize: 40, lineHeight: 1.32 }}>
        {parts.map((p, j) => {
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
  const blur = motionBlur(c.v);
  const drift = Math.sin(f / 50) * 6; // ずっと少しだけ息をしている
  return (
    <AbsoluteFill style={{ background: M.paper, overflow: "hidden" }}>
      <Audio src={staticFile("kodomo-narration.wav")} />
      <SfxTrack cues={CUES} />
      {/* 安全な枠：右のいいね列（x>950）・下の名前と説明（y>1450）・上のリール表示（y<150）をよける */}
      <div style={{ position: "absolute", left: SAFE_X, top: SAFE_Y, width: 1080, height: 1920, transform: `scale(${SAFE})`, transformOrigin: "0 0", overflow: "hidden" }}>
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
