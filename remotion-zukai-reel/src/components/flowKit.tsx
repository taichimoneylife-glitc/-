import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

// ════════════════════════════════════════════════════════════════════
//  参考⑫（Claudeのフォルダの動画）の動きを、1コマずつ実測した数字のまま部品にしたもの
//  数字の出どころ：.claude/skills/zukai-reel/references/ref-12-claude-folder-flow.md の「部品ごとの動きの実測」
//  すべて 30fps・1080x1920 のpx。配列の1つ＝1コマ。
// ════════════════════════════════════════════════════════════════════

// 配列の k コマ目（範囲外は端の値）。小数のコマは前後を直線でつなぐ
export const at = (arr: number[], k: number) => {
  if (k <= 0) return arr[0];
  if (k >= arr.length - 1) return arr[arr.length - 1];
  const i = Math.floor(k), t = k - i;
  return arr[i] + (arr[i + 1] - arr[i]) * t;
};
// 1コマごとの移動量の列 → 0〜1 の進み具合（累積）
const cumul = (d: number[]) => { const s = d.reduce((a, b) => a + b, 0); let c = 0; return [0, ...d.map((x) => (c += x) / s)]; };

// ── カメラの動き（1コマごとの移動量・実測）──
export const PROFILE = {
  scroll: cumul([13, 21, 32, 43, 60, 75, 80, 63, 48, 36, 24, 15]),            // ふつうに下へ（12コマ・山80px）
  recallUp: cumul([3, 17, 63, 115, 275, 397, 227, 103, 18, 3]),              // 回想で上へ戻る（10コマ）
  recallBack: cumul([1, 8, 24, 90, 157, 327, 408, 228, 108, 24]),            // 回想から戻る（10コマ）
  side: cumul([1, 4, 12, 26, 48, 86, 162, 254, 230, 144, 57, 24, 12]),       // クリックして横へ（13コマ）
  slide: cumul([20, 60, 128, 68]),                                        // 札が並ぶときの横すべり（4コマ・後半の強いブレーキ）
  marke: cumul([-6, -12, -12, -12, 90, 180, 260, 320, 380, 6, 6]),                // マーケ博士の章の切り替え：ため4f→加速5f→ピタ2f（声の約0.4秒前に始める）
  lineShort: cumul([72, 117, 78, 32, 8]),                                    // 短い線（5コマ）
  lineLong: cumul([57, 51, 63, 70, 78, 60, 56, 48, 36, 30, 24, 12, 6, 6]),   // グラフの線（14コマ）
};
// 1コマの移動量（ブレの強さに使う）
const speedAt = (p: number[], k: number, dist: number) => Math.abs((at(p, k + 1) - at(p, k)) * dist);

// カメラ：キー＝{f: 始まるコマ, x, y, z?, p: 使う形}。返すのは今の位置と、そのコマの速さ（ブレ用）
export type CamKey = { f: number; x: number; y: number; z?: number; p?: keyof typeof PROFILE | "zoomOut" | "zoomIn" };
// 引き・寄り（1コマごとの倍率・実測）→ 0〜1 の進み具合
const ZOOM_OUT = [0.99, 0.98, 1.01, 0.99, 0.965, 0.955, 0.94, 0.94, 0.95, 0.955, 0.965, 0.98, 0.98, 0.99];
const ZOOM_IN = [1.02, 1.03, 1.045, 1.06, 1.075, 1.095, 1.125, 1.095, 1.07, 1.05, 1.035, 1.02, 1.01];
const zprog = (z: number[]) => { const L = z.map((s) => Math.log(s)); const tot = L.reduce((a, b) => a + b, 0); let c = 0; return [0, ...L.map((x) => (c += x) / tot)]; };
const ZP = { zoomOut: zprog(ZOOM_OUT), zoomIn: zprog(ZOOM_IN) };
export const camAt = (keys: CamKey[], f: number) => {
  let x = keys[0].x, y = keys[0].y, z = keys[0].z ?? 1, v = 0;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    const prof = (k.p && k.p in ZP ? ZP[k.p as "zoomOut"] : PROFILE[(k.p as keyof typeof PROFILE) ?? "scroll"]);
    const t = f - k.f, p = at(prof, t), p1 = at(prof, t + 1);
    const nz = k.z ?? z, dist = Math.hypot(k.x - x, k.y - y);
    v = Math.abs(p1 - p) * dist;
    x = x + (k.x - x) * p; y = y + (k.y - y) * p; z = z + (nz - z) * p;
  }
  return { x, y, z, v };
};
// ブレ：1コマの移動量に合わせて（実測では 80px/コマで文字がはっきり流れる）
export const motionBlur = (v: number) => (v > 20 ? Math.min(22, v / 10) : 0); // 本物は 100px/コマで文字が読めないくらい流れる

// ── 札がポンと出る（「早い」の実測：大きさ・濃さ・くっきり）──
const POP_S = [0, 0.13, 0.42, 1.05, 1.02, 1.01, 1.0];
const POP_O = [0.32, 0.64, 0.92, 0.99, 0.98, 1, 1];
const POP_SHARP = [0.11, 0.24, 0.42, 0.82, 0.91, 0.97, 1];
export const pillPop = (f: number, start: number): React.CSSProperties => {
  const k = f - start;
  if (k < 0) return { opacity: 0 };
  const sh = at(POP_SHARP, k);
  return { opacity: at(POP_O, k), transform: `scale(${at(POP_S, k)})`, filter: sh < 0.98 ? `blur(${(1 - sh) * 10}px)` : undefined };
};

// ── 大見出しが左から流れ込んでピントが合う（「コスパ最強」：本物と1コマずつ並べて合わせた値）──
// 出始めの2コマは左へ大きくずれたまま強くぼけ、3コマ目でほぼ位置へ、あとはピントだけ合っていく
const T_X = [-120, -150, -170, -60, -40, -12, 0];
const T_Y = [45, 40, 30, 15, 12, 8, 0];
const T_S = [1.45, 1.3, 1.02, 1, 1];
const T_O = [0.4, 0.6, 0.9, 1];
const T_BLUR = [12, 11, 8, 5, 4, 2, 0.8, 0];
export const titleSlam = (f: number, start: number): React.CSSProperties => {
  const k = f - start;
  if (k < 0) return { opacity: 0 };
  const b = at(T_BLUR, k);
  return { opacity: at(T_O, k), transform: `translate(${at(T_X, k)}px, ${at(T_Y, k)}px) scale(${at(T_S, k)})`, filter: b > 0.2 ? `blur(${b}px)` : undefined };
};

// ── 札がふわっと出る（1つ目の札「安い」：大きさはそのまま、ぼけて薄く→カメラが止まった所でくっきり）──
const FADE_O = [0.3, 0.35, 0.6, 1];
const FADE_B = [8, 8, 10, 0];
const FADE_S = [1.55, 1.5, 1.2, 1];
export const pillFade = (f: number, start: number): React.CSSProperties => {
  const k = f - start;
  if (k < 0) return { opacity: 0 };
  const b = at(FADE_B, k);
  return { opacity: at(FADE_O, k), transform: `scale(${at(FADE_S, k)})`, filter: b > 0.2 ? `blur(${b}px)` : undefined };
};

// ── 言葉（2〜3文字のかたまり）がふっと出る（「動画が」の実測）──
const W_O = [0.38, 1];
const W_Y = [10, 10, 6, 4, 2, 1, 0];
const W_B = [4, 0.5, 0];
export const wordIn = (f: number, start: number): React.CSSProperties => {
  const k = f - start;
  if (k < 0) return { opacity: 0 };
  return { opacity: at(W_O, k), transform: `translateY(${at(W_Y, k)}px)`, filter: at(W_B, k) > 0.1 ? `blur(${at(W_B, k)}px)` : undefined };
};
// 文を言葉ごとに出す。words＝[言葉, 出るコマ]
export const Words: React.FC<{ words: [string, number][]; style?: React.CSSProperties }> = ({ words, style }) => {
  const f = useCurrentFrame();
  return <span style={{ display: "inline-flex", ...style }}>{words.map(([w, s], i) => <span key={i} style={{ display: "inline-block", ...wordIn(f, s) }}>{w}</span>)}</span>;
};

// ── 打ち込み（1文字ずつ・フェードなし）──
// 見出し：3〜4コマに1文字（実測 3,4,3,3,4,3,3,3,4）。入力欄：5コマに1文字から2コマに1文字へ加速
export const HEAD_GAPS = [3, 4, 3, 3, 4, 3, 3, 3, 4];
export const INPUT_GAPS = [5, 5, 5, 5, 5, 4, 6, 6, 4, 4, 4, 4, 2, 3, 2, 2, 2, 3];
export const typedCount = (f: number, start: number, gaps: number[]) => {
  if (f < start) return 0;
  let t = start, n = 0;
  while (true) { const g = gaps[Math.min(n, gaps.length - 1)]; if (f < t) return n; n++; t += g; if (n > 999) return n; }
};
export const Typed: React.FC<{ text: string; start: number; gaps?: number[]; caret?: boolean; caretColor?: string; style?: React.CSSProperties }> = ({ text, start, gaps = HEAD_GAPS, caret = true, caretColor = "currentColor", style }) => {
  const f = useCurrentFrame();
  const n = Math.min(text.length, typedCount(f, start, gaps));
  const blink = Math.floor((f - start) / 15) % 2 === 0;
  return <span style={style}>{text.slice(0, n)}{caret && f >= start && (n < text.length || blink) ? <span style={{ display: "inline-block", width: "0.06em", height: "1em", background: caretColor, verticalAlign: "-0.1em", marginLeft: "0.04em" }} /> : null}</span>;
};

// ── 線が伸びる（短い線5コマ・長い線14コマ。真ん中が一番速い）──
export const lineProg = (f: number, start: number, kind: "lineShort" | "lineLong" = "lineShort") => at(PROFILE[kind], f - start);
export const GrowPath: React.FC<{ d: string; start: number; kind?: "lineShort" | "lineLong"; color?: string; w?: number; glow?: boolean }> = ({ d, start, kind = "lineShort", color = "#FFF4DC", w = 5, glow = true }) => {
  const f = useCurrentFrame();
  const p = lineProg(f, start, kind);
  if (p <= 0) return null;
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} style={glow ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined} />;
};

// ── 吸い込まれる（大きさ 13コマで24%へ・一度上がってから落ちる弧）──
const SUCK_S = [1, 0.998, 0.991, 0.978, 0.956, 0.923, 0.876, 0.813, 0.733, 0.627, 0.5, 0.389, 0.3, 0.24];
const SUCK_Y = [0, -16, -37, -66, -102, -147, -196, -220, -210, -167, -95, -28, 35, 78];
export const suckIn = (f: number, start: number, dropTo = 78): React.CSSProperties => {
  const k = f - start;
  if (k < 0) return {};
  if (k > SUCK_S.length) return { opacity: 0 };
  const y = at(SUCK_Y, k) * (k > 9 ? 1 : 1) + (dropTo - 78) * Math.max(0, (k - 7) / 6);
  return { transform: `translateY(${y}px) scale(${at(SUCK_S, k)})`, filter: k > 2 && k < 12 ? `blur(${Math.min(6, Math.abs(at(SUCK_Y, k + 1) - at(SUCK_Y, k)) / 12)}px)` : undefined, opacity: k >= SUCK_S.length - 1 ? 0 : 1 };
};

// ── カードが出る（3コマぼけて薄く→最後の大きさで現れて4コマで12px上がる）──
const C_O = [0.15, 0.35, 0.6, 1];
const C_B = [10, 7, 4, 0];
const C_Y = [24, 20, 16, 12, 6, 4, 1, 0];
export const cardIn = (f: number, start: number): React.CSSProperties => {
  const k = f - start;
  if (k < 0) return { opacity: 0 };
  return { opacity: at(C_O, k), transform: `translateY(${at(C_Y, k)}px)`, filter: at(C_B, k) > 0.2 ? `blur(${at(C_B, k)}px)` : undefined };
};

// ── 窓が傾いたまま下から上がってまっすぐになる（上の線 267px→0 を10コマ・傾き→平ら）──
const WIN_Y = [267, 195, 136, 82, 48, 27, 12, 6, 1, 0];
const WIN_RX = [28, 22, 16, 11, 7, 4, 2, 1, 0, 0];
const WIN_S = [0.94, 0.955, 0.97, 0.98, 0.99, 0.995, 1, 1, 1, 1];
const WIN_B = [6, 5, 4, 3, 2, 1, 0.5, 0, 0, 0];
const WIN_O = [0.35, 0.6, 0.8, 0.95, 1];
export const windowRise = (f: number, start: number): React.CSSProperties => {
  const k = f - start;
  if (k < 0) return { opacity: 0 };
  return { opacity: at(WIN_O, k), transform: `perspective(1400px) translateY(${at(WIN_Y, k)}px) rotateX(${at(WIN_RX, k)}deg) scale(${at(WIN_S, k)})`, transformOrigin: "50% 100%", filter: at(WIN_B, k) > 0.2 ? `blur(${at(WIN_B, k)}px)` : undefined };
};

// ── 四角の粒になって消える（残り 100→85→80→60→25→15→0% を6コマ）──
const DIS = [1, 0.85, 0.8, 0.6, 0.25, 0.15, 0]; // 本物と並べて合わせた：1コマ目から崩れ始め、6コマで消える
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// 部品を grid×grid の四角に切って、決まった順に消す（消える前に少し外へずれる）
export const Dissolve: React.FC<{ start: number; w: number; h: number; cell?: number; children: React.ReactNode }> = ({ start, w, h, cell = 18, children }) => {
  const f = useCurrentFrame();
  const k = f - start;
  if (k < 0) return <>{children}</>;
  if (k >= DIS.length - 1) return null;
  const keep = at(DIS, k);
  const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c, rr = rnd(i);
    if (rr > keep) continue;
    const dx = (rnd(i + 7) - 0.5) * 30 * (1 - keep), dy = (rnd(i + 13) - 0.5) * 30 * (1 - keep);
    cells.push(<div key={i} style={{ position: "absolute", left: c * cell + dx, top: r * cell + dy, width: cell, height: cell, overflow: "hidden" }}><div style={{ position: "absolute", left: -c * cell, top: -r * cell, width: w, height: h }}>{children}</div></div>);
  }
  return <div style={{ position: "relative", width: w, height: h }}>{cells}</div>;
};

// ── 網目（ハーフトーン）で画面が切り替わる（先頭のx：19,139,298,478,619,799,979,1080 を8コマ・点の間隔30px）──
const HT_X = [19, 139, 298, 478, 619, 799, 979, 1080, 1260, 1440];
export const HalftoneWipe: React.FC<{ start: number; color?: string; pitch?: number; band?: number }> = ({ start, color = "#B8160F", pitch = 30, band = 620 }) => {
  const f = useCurrentFrame();
  const k = f - start;
  if (k < 0) return null;
  const front = at(HT_X, k);
  const cols = Math.ceil(1080 / pitch), rows = Math.ceil(1920 / pitch);
  const dots: React.ReactNode[] = [];
  for (let c = 0; c < cols; c++) {
    const x = c * pitch + pitch / 2;
    const d = front - x; // 先頭からどれだけ後ろか
    if (d < 0 || d > band) continue;
    const r = (pitch / 2) * Math.min(1.45, 0.2 + d / band * 1.25);
    for (let rI = 0; rI < rows; rI++) dots.push(<circle key={c * 999 + rI} cx={x} cy={rI * pitch + pitch / 2} r={r} fill={color} />);
  }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <rect x={0} y={0} width={Math.max(0, front - band)} height={1920} fill={color} />
      {dots}
    </svg>
  );
};

// ── 冒頭：上から紙の色が下りてきて写真を消す（写真の上端 y：実測）──
const WIPE_TOP = [555, 564, 570, 560, 560, 591, 648, 816, 925, 1128, 1179, 1206, 1222, 1234, 1243, 1248, 1251];
export const curtainTop = (f: number, start = 0) => at(WIPE_TOP, f - start);
