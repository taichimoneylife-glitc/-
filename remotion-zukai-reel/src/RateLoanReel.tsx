import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT, FONT_BLACK, FONT_SERIF } from "./components/font";
import { A2 } from "./components/kit2";
import { SfxTrack } from "./components/sfx";
import { B, GenSlot } from "./MileLifePlan";
import { Stamp, Captions } from "./BourakuReel";
import { Camera, CamKey, Spot, ghostIn as ghostBase, SpeedLines } from "./components/cam";
import { Board, type Panel, type Stop } from "./components/board";

// ════════════════════════════════════════════════════════════════════
//  住宅ローン①「金利が上がると何が起こる？」完全図解（マーケ博士版）
//  音声＝public/rl-narration.wav（109.0秒）。図解のみ（キャラは感情の所だけ端に小さく）。
//  ページ＝1枚の大きな地図の上に並べ、章が変わるたびに「縮む→流れる→戻る」で移動（Board）。
//  数字（計算で確認済み）：5,000万・30年・0.5%＝149,595円/月（元金128,761・利息20,833）
//   1.5%では同じ返済で元金87,095・利息62,500／5年利息115.4万→355.3万／残高+239.8万
//   5年後の返済178,279円（+28,684円・1.25倍上限186,993円の内）／総支払+860.5万
//  画像（rl_*）は生成待ち。無い間は名前入りの点線の枠が出る（gen-manifest で自動で入る）
// ════════════════════════════════════════════════════════════════════

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const K = { fontFamily: FONT_BLACK, fontWeight: 900 as const };
const SER = { fontFamily: FONT_SERIF, fontWeight: 900 as const };
const INK = A2.ink, SH = "#E3B53C", BLUE = "#2F7BD9", YEL = A2.marker, RED = A2.red, GREEN = A2.green, LAV = A2.bg, SUB = A2.sub;
const pop = (f: number, at: number) => interpolate(f - at, [0, 3, 6], [0.3, 1.2, 1], clamp);
const cnt = (f: number, at: number, to: number, dur = 0.6, from = 0) => from + (to - from) * interpolate(f - F(at), [0, F(dur)], [0, 1], out);
const yen = (v: number) => Math.round(v).toLocaleString("ja-JP");
const c = (col: string, t: React.ReactNode) => <span style={{ color: col }}>{t}</span>;
const r = (t: React.ReactNode) => <span style={{ ...SER, color: RED }}>{t}</span>; // キーワード＝赤の明朝

// 出方：うっすら大きめ → くっきり＋下からポンと跳ねて止まる
const ghostIn = (f: number, A: number) => {
  const g = ghostBase(f, A);
  const d = f - A;
  const y = interpolate(d, [0, 4, 8, 12], [36, -8, 2, 0], clamp);
  const rot = interpolate(d, [0, 5, 10], [-3, 1, 0], clamp);
  const sc = interpolate(d, [0, 2, 5, 9], [1.16, 1.06, 0.96, 1], clamp);
  return { opacity: g.opacity, transform: `translateY(${y}px) rotate(${rot}deg) scale(${sc})` };
};
const Ghost: React.FC<{ at: number; until?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, until = 999, style, children }) => {
  const f = useCurrentFrame();
  const A = F(at), Z = F(until);
  if (f < A || f >= Z + 5) return null;
  const g = ghostIn(f, A);
  const o = interpolate(f, [Z, Z + 5], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", ...style, ...g, opacity: (g.opacity as number) * (1 - o) }}>
      <div style={{ display: style?.display, justifyContent: style?.justifyContent, alignItems: style?.alignItems, gap: style?.gap, width: style?.display ? "100%" : undefined, transform: o > 0 ? `translateY(${-40 * o}px) scale(${1 - 0.08 * o})` : undefined }}>{children}</div>
    </div>
  );
};

// 章の見出し：道順の札（赤）＋番号＋大見出し（左寄せ・マーケ博士の型）
const Head: React.FC<{ at: number; no: string; crumb: string; children: React.ReactNode }> = ({ at, no, crumb, children }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Ghost at={at} style={{ left: 90, top: 232 }}>
        <span style={{ display: "inline-block", background: RED, color: "#fff", borderRadius: 12, padding: "6px 22px", ...K, fontSize: 30 }}>STEP {no}</span>
        <span style={{ marginLeft: 16, ...B, fontSize: 28, color: SUB }}>{crumb}</span>
      </Ghost>
      <Ghost at={at + 0.08} style={{ left: 90, top: 300, whiteSpace: "nowrap" }}>
        <span style={{ display: "inline-block", width: 86, height: 86, borderRadius: "50%", background: INK, color: "#fff", ...K, fontSize: 52, lineHeight: "86px", textAlign: "center", verticalAlign: "middle", marginRight: 18, transform: `rotate(${interpolate(f - F(at), [0, 8], [-180, 0], { ...clamp, easing: Easing.out(Easing.back(2)) })}deg)` }}>{no}</span>
        <span style={{ ...K, fontSize: 66, color: INK, verticalAlign: "middle", textShadow: `0 6px 0 ${YEL}` }}>{children}</span>
      </Ghost>
    </>
  );
};

// 白い箱（点 → 線 → うっすら大きめ → くっきり）
const BOXS: React.CSSProperties = { background: "#fff", border: `5px solid ${INK}`, borderRadius: 18, boxShadow: `0 8px 0 ${SH}`, padding: "14px 30px", textAlign: "center", ...B, color: INK, lineHeight: 1.32, whiteSpace: "pre" };
const Box: React.FC<{ at: number; until?: number; to: [number, number]; from?: [number, number]; size?: number; bg?: string; children: React.ReactNode }> = ({ at, until = 999, to, from, size = 42, bg = "#fff", children }) => {
  const f = useCurrentFrame();
  const A = F(at), Z = F(until);
  if (f < A || f >= Z + 3) return null;
  const o = 1 - interpolate(f, [Z, Z + 3], [0, 1], clamp);
  const lineP = from ? interpolate(f, [A, A + 4], [0, 1], out) : 1;
  const boxA = from ? A + 3 : A;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      {from ? (
        <svg width={1080} height={3000} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <line x1={from[0]} y1={from[1]} x2={from[0] + (to[0] - from[0]) * lineP} y2={from[1] + (to[1] - from[1]) * lineP} stroke={INK} strokeWidth={5} />
          <circle cx={from[0]} cy={from[1]} r={11} fill={YEL} stroke={INK} strokeWidth={4} />
        </svg>
      ) : null}
      {f >= boxA ? (
        <div style={{ position: "absolute", left: to[0], top: to[1], transform: "translate(-50%, -50%)" }}>
          <div style={{ ...BOXS, background: bg, fontSize: size, ...ghostIn(f, boxA) }}>{children}</div>
        </div>
      ) : null}
    </div>
  );
};

// 画像（生成待ちの間は名前入りの点線の枠）
const Pic: React.FC<{ at: number; until?: number; n: string; x: number; y: number; s: number }> = ({ at, until, n, x, y, s }) => (
  <Ghost at={at} until={until} style={{ left: x, top: y }}><GenSlot name={n} size={s} /></Ghost>
);

// 下向きの矢印（線が伸びる）
const Arrow: React.FC<{ at: number; x: number; y: number; len?: number; col?: string }> = ({ at, x, y, len = 70, col = INK }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const p = interpolate(f - F(at), [0, 5], [0, 1], out);
  return (
    <svg width={60} height={len + 20} style={{ position: "absolute", left: x - 30, top: y, overflow: "visible" }}>
      <line x1={30} y1={0} x2={30} y2={len * p} stroke={col} strokeWidth={8} strokeLinecap="round" />
      {p > 0.9 ? <path d={`M12 ${len - 14} L30 ${len + 6} L48 ${len - 14}`} fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </svg>
  );
};

// 小さな注意書き（グレー）
const Note: React.FC<{ at: number; until?: number; y?: number; children: React.ReactNode }> = ({ at, until = 999, y = 1210, children }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until)) return null;
  return <div style={{ position: "absolute", left: 90, right: 90, top: y, ...B, fontSize: 22, color: SUB, lineHeight: 1.4, opacity: interpolate(f - F(at), [0, 6], [0, 1], clamp) }}>{children}</div>;
};

// 積み上げの棒（元金＋利息＝返済額）。h＝全体の高さ
const StackBar: React.FC<{ at: number; x: number; base: number; h: number; total: number; prin: number; label: string; hiAt?: number }> = ({ at, x, base, h, total, prin, label, hiAt }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const p = interpolate(f - F(at), [0, 12], [0, 1], out);
  const hp = h * (prin / total) * p, hi = h * (1 - prin / total) * p;
  const hl = hiAt !== undefined && f >= F(hiAt);
  return (
    <>
      <div style={{ position: "absolute", left: x, top: base - hp - hi, width: 260, height: hi, background: RED, border: `5px solid ${INK}`, borderBottom: "none", borderRadius: "16px 16px 0 0", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 30, color: "#fff" }}>{p > 0.9 ? `利息 ${yen(total - prin)}` : ""}</div>
      <div style={{ position: "absolute", left: x, top: base - hp, width: 260, height: hp, background: BLUE, border: `5px solid ${INK}`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: hl ? `0 0 0 8px ${YEL}` : undefined }}>
        <div style={{ ...B, fontSize: 26 }}>元金</div>
        <div style={{ ...K, fontSize: 48 }}>{yen(hl ? cnt(f, hiAt!, prin, 0.5, prin * 0.6) : prin * p)}</div>
      </div>
      <div style={{ position: "absolute", left: x - 20, width: 300, top: base + 16, textAlign: "center", ...K, fontSize: 34, color: INK }}>{label}</div>
      <div style={{ position: "absolute", left: x - 20, width: 300, top: base - hp - hi - 64, textAlign: "center", ...K, fontSize: 38, color: INK, opacity: p }}>約15万円</div>
    </>
  );
};

// ════════ 冒頭（0–11.28） ════════
const Hook: React.FC = () => {
  return (
    <>
      <Ghost at={0.05} style={{ left: 90, top: 250 }}><span style={{ ...K, fontSize: 58, color: INK }}>住宅ローン金利が上がっても</span></Ghost>
      <Ghost at={1.62} style={{ left: 90, top: 336 }}><span style={{ ...K, fontSize: 84, color: INK, textShadow: `0 7px 0 ${YEL}` }}>{r("返済額")}が変わってない人</span></Ghost>
      <Pic at={0.4} until={3.3} n="rl_couple_relax" x={240} y={500} s={600} />
      <Pic at={3.34} n="rl_house_cloud" x={240} y={500} s={600} />
      <Stamp at={3.64} x={250} y={760} text="マジで危険" color={RED} size={92} rot={-6} />
      <Ghost at={4.68} until={9.3} style={{ left: 90, top: 1110 }}>
        <span style={{ ...BOXS, display: "inline-block", fontSize: 44 }}>金利が上がると{c(RED, "何が起こる？")}</span>
      </Ghost>
      <Ghost at={9.4} style={{ left: 90, top: 1120 }}>
        <span style={{ display: "inline-block", background: INK, color: "#fff", borderRadius: 999, padding: "8px 30px", ...B, fontSize: 34 }}>対策は 次の動画で</span>
      </Ghost>
    </>
  );
};

// ════════ ① 金利が上がる仕組み（11.28–23.56）：上から下へつながる流れ＋カメラが下へ ════════
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const node = (at: number, y: number, img: string, title: React.ReactNode, sub: React.ReactNode) => (
    <Ghost at={at} style={{ left: 110, top: y, width: 860, display: "flex", alignItems: "center", gap: 22 }}>
      <GenSlot name={img} size={150} />
      <div style={{ ...BOXS, textAlign: "left", flex: 1, padding: "12px 24px" }}><div style={{ ...K, fontSize: 38 }}>{title}</div><div style={{ ...B, fontSize: 26, color: SUB, marginTop: 2 }}>{sub}</div></div>
    </Ghost>
  );
  return (
    <>
      <Head at={11.28} no="1" crumb="変動金利">金利が上がる{r("仕組み")}</Head>
      {node(13.4, 440, "rl_central_bank", <>日銀が{c(RED, "政策金利")}を上げる</>, "金融政策")}
      <Arrow at={15.2} x={540} y={600} len={40} />
      {node(15.34, 660, "rl_bank", <>銀行の{c(RED, "短期プライムレート")}などが上がる</>, "銀行が決める金利")}
      <Arrow at={17.9} x={540} y={820} len={40} />
      {node(18.08, 880, "rl_loan_papers", <>住宅ローンの{c(RED, "基準金利")}も上がる</>, "変動金利の元になる金利")}
      {/* 基準金利 − 優遇幅 ＝ 自分の金利 */}
      <Ghost at={20.5} style={{ left: 90, top: 1060, width: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <span style={{ ...BOXS, fontSize: 34, ...K, padding: "8px 20px" }}>基準金利</span>
        <span style={{ ...K, fontSize: 52, color: INK }}>−</span>
        <span style={{ ...BOXS, fontSize: 34, ...K, padding: "4px 18px", display: "inline-flex", alignItems: "center", gap: 8 }}><GenSlot name="rl_discount_tag" size={60} />優遇幅</span>
        {f >= F(21.96) ? <><span style={{ ...K, fontSize: 52, color: INK }}>＝</span><span style={{ display: "inline-block", background: YEL, border: `5px solid ${INK}`, borderRadius: 16, padding: "8px 22px", ...K, fontSize: 38, color: INK, boxShadow: `0 6px 0 ${INK}`, transform: `scale(${pop(f, F(21.96))})` }}>{r("自分の金利")}</span></> : null}
      </Ghost>
      <Spot at={21.96} rect={[90, 1040, 900, 120]} dim={0.45} />
    </>
  );
};

// ════════ ② 5年ルール・125％ルール（23.56–38.04） ════════
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const base = 1020, w = 120, gap = 18, x0 = 110, H = 260;
  const capY = base - H * 1.25;
  return (
    <>
      <Head at={23.56} no="2" crumb="返済額のルール">{r("5年")}ルール・{r("125%")}ルール</Head>
      <Ghost at={23.92} until={27.0} style={{ left: 90, top: 470 }}><span style={{ ...K, fontSize: 52, color: INK }}>金利が上がっても<br />返済額は{c(RED, "すぐ上がるとは限らない")}</span></Ghost>
      {/* 年ごとの返済額の棒：1〜5年は同じ高さ（据え置き）→ 6年目は1.25倍まで */}
      {f >= F(27.16) ? Array.from({ length: 6 }).map((_, i) => {
        const at = 27.16 + i * 0.18 + (i === 5 ? 3.0 : 0);
        if (f < F(at)) return null;
        const p = interpolate(f - F(at), [0, 8], [0, 1], out);
        const h = (i === 5 ? H * 1.19 : H) * p;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x0 + i * (w + gap), top: base - h, width: w, height: h, background: i === 5 ? RED : BLUE, border: `5px solid ${INK}`, borderBottom: "none", borderRadius: "12px 12px 0 0", boxSizing: "border-box" }} />
            <div style={{ position: "absolute", left: x0 + i * (w + gap), width: w, top: base + 12, textAlign: "center", ...B, fontSize: 26, color: INK }}>{i + 1}年</div>
          </React.Fragment>
        );
      }) : null}
      {f >= F(27.16) ? <div style={{ position: "absolute", left: 90, right: 90, top: base, height: 5, background: INK }} /> : null}
      {/* 5年間 据え置き の囲み */}
      {f >= F(28.6) ? <div style={{ position: "absolute", left: x0 - 14, top: base - H - 30, width: 5 * (w + gap) + 10, height: H + 30, border: `5px dashed ${GREEN}`, borderRadius: 18, opacity: interpolate(f - F(28.6), [0, 6], [0, 1], clamp) }} /> : null}
      <Ghost at={28.78} style={{ left: x0, top: base - H - 110 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 10, background: GREEN, color: "#fff", borderRadius: 999, padding: "6px 24px", ...K, fontSize: 36 }}>5年間 据え置き</span></Ghost>
      <Pic at={29.0} until={32.3} n="rl_wallet_lock" x={600} y={430} s={170} />
      {/* 1.25倍の天井 */}
      {f >= F(31.9) ? <div style={{ position: "absolute", left: x0 + 5 * (w + gap) - 30, width: w + 80, top: capY, borderTop: `6px dashed ${RED}`, opacity: interpolate(f - F(31.9), [0, 6], [0, 1], clamp) }} /> : null}
      <Ghost at={32.16} style={{ left: 760, top: capY - 120 }}><span style={{ ...BOXS, display: "inline-block", fontSize: 34, borderColor: RED }}>それまでの{"\n"}{c(RED, "1.25倍")}まで</span></Ghost>
      <Pic at={32.4} until={35.1} n="rl_balloon_ceiling" x={430} y={430} s={170} />
      <Stamp at={33.76} x={300} y={1080} text="125%ルール" color={RED} size={64} rot={-4} />
      {/* でも安心ではない（画面を暗くして一言） */}
      <Spot at={35.22} rect={[160, 470, 760, 420]} dim={0.7} color={RED} />
      <Ghost at={35.22} style={{ left: 160, top: 470, width: 760, height: 420, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <GenSlot name="rl_sofa_relax" size={260} />
        <span style={{ ...K, fontSize: 54, color: INK, background: "#fff", padding: "10px 20px", borderRadius: 16, lineHeight: 1.3 }}>変わらないから<br />{c(RED, "安心")}…<br />ではない</span>
      </Ghost>
      <Note at={33.4} until={38.04}>※5年ルール・125％ルールは、金融機関や返済方式によって適用されない場合があります</Note>
    </>
  );
};

// ════════ ③ 返済額の中身が変わる（38.04–59.32） ════════
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const base = 1060, H = 400, T = 149595;
  return (
    <>
      <Head at={38.04} no="3" crumb="同じ返済額でも">返済額の{r("中身")}が変わる</Head>
      <Ghost at={38.4} style={{ left: 90, top: 440, display: "flex", gap: 14 }}>
        {[["借入", "5,000万円", 38.4], ["期間", "30年", 39.36], ["金利", "0.5%", 40.04]].map(([l, v, at]) => (
          <span key={l as string} style={{ ...BOXS, padding: "8px 22px", ...ghostIn(f, F(at as number)), display: "inline-block" }}><span style={{ ...B, fontSize: 22, color: SUB }}>{l}</span><br /><span style={{ ...K, fontSize: 40 }}>{v}</span></span>
        ))}
      </Ghost>
      <StackBar at={42.02} x={150} base={base} h={H} total={T} prin={128761} label="金利 0.5%" hiAt={45.8} />
      <StackBar at={47.24} x={640} base={base} h={H} total={T} prin={87095} label="金利 1.5%" hiAt={51.94} />
      <Ghost at={49.52} until={53.6} style={{ left: 440, top: 640 }}><span style={{ ...K, fontSize: 70, color: INK }}>＝</span></Ghost>
      <Box at={52.2} until={53.6} to={[540, 1170]} size={40}>元金に回るお金が{c(RED, "約4.2万円")}減る</Box>
      {/* つまり：負担を後ろに先送り */}
      <Ghost at={53.72} style={{ left: 70, top: 1140, display: "flex", alignItems: "center", gap: 14 }}>
        <GenSlot name="rl_push_box_back" size={130} />
        <span style={{ ...BOXS, fontSize: 36, background: YEL }}>負担を{r("後ろに先送り")}しているだけ</span>
      </Ghost>
    </>
  );
};

// ════════ ④ 5年後どうなる？（59.32–83.28）：下へカメラが流れて3つを見せる ════════
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const keys: CamKey[] = [{ t: 0, x: 540, y: 960, s: 1, d: 1 }, { t: 66.76, x: 540, y: 1700, s: 1, d: 8 }, { t: 76.32, x: 540, y: 2500, s: 1, d: 8 }];
  const bar = (at: number, y: number, w: number, col: string, v: number, label: string) => f >= F(at) ? (
    <>
      <div style={{ position: "absolute", left: 300, top: y, height: 100, width: w * interpolate(f - F(at), [0, 12], [0, 1], out), background: col, border: `5px solid ${INK}`, borderRadius: 16, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: 90, top: y + 26, ...K, fontSize: 36, color: INK }}>{label}</div>
      <div style={{ position: "absolute", left: 320, top: y + 14, ...K, fontSize: 52, color: "#fff" }}>{yen(cnt(f, at, v))}万円</div>
    </>
  ) : null;
  return (
    <Camera keys={keys}>
      <Head at={59.32} no="4" crumb="先送りした結果">{r("5年後")}どうなる？</Head>
      <Pic at={61.32} n="rl_hourglass" x={810} y={220} s={180} />
      {/* 5年で払う利息 */}
      <Ghost at={62.62} style={{ left: 90, top: 470 }}><span style={{ ...K, fontSize: 46, color: INK }}>5年で払う{c(RED, "利息")}</span></Ghost>
      {bar(64.08, 580, 210, BLUE, 115, "0.5%")}
      {bar(65.26, 720, 650, RED, 355, "1.5%")}
      <Box at={66.2} to={[540, 940]} size={40}>利息が{c(RED, "約3倍")}に</Box>
      {/* 残高が多く残る */}
      <Ghost at={66.76} style={{ left: 90, top: 1300 }}><span style={{ ...K, fontSize: 46, color: INK }}>5年後のローン残高</span></Ghost>
      <Pic at={67.2} n="rl_heavy_backpack" x={120} y={1400} s={300} />
      <Ghost at={68.14} style={{ left: 470, top: 1460 }}><span style={{ ...BOXS, display: "inline-block", fontSize: 40 }}>{"約"}<span style={{ ...K, fontSize: 80, color: RED }}>240</span>{"万円\n多く残る"}</span></Ghost>
      {/* 5年後の返済額 */}
      <Ghost at={70.16} style={{ left: 90, top: 1800, display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ ...BOXS, fontSize: 30 }}>今の返済<br /><span style={{ ...K, fontSize: 52 }}>約15万円</span></span>
        <span style={{ ...K, fontSize: 64, color: INK }}>→</span>
        {f >= F(73.1) ? <span style={{ ...BOXS, fontSize: 30, borderColor: RED, ...ghostIn(f, F(73.1)) }}>5年後<br /><span style={{ ...K, fontSize: 52, color: RED }}>約17.8万円</span></span> : null}
      </Ghost>
      <Stamp at={74.76} x={560} y={1990} text="月+2.9万円" color={RED} size={60} rot={-5} />
      <Pic at={70.6} n="rl_bill_shock" x={110} y={1990} s={240} />
      {/* 最終的に */}
      <Ghost at={78.86} style={{ left: 0, top: 2280, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 46, color: INK }}>金利1.5%が続くと、最終的に</span></Ghost>
      <Pic at={79.4} n="rl_money_mountain" x={390} y={2360} s={300} />
      {f >= F(79.96) ? <div style={{ position: "absolute", left: 0, right: 0, top: 2660, textAlign: "center", ...SER, fontSize: 150, color: RED, lineHeight: 1, transform: `scale(${pop(f, F(79.96))})` }}>+{yen(cnt(f, 79.96, 861, 0.9))}<span style={{ ...K, fontSize: 64 }}>万円</span></div> : null}
      <Note at={80.0} until={83.28} y={2840}>※5,000万円・30年・金利0.5％で借りた直後に1.5％へ上がり、その後も1.5％が続く前提の試算。実際の返済額の見直し時期は、金融機関・契約内容によって異なります</Note>
    </Camera>
  );
};

// ════════ ⑤ 未払利息（83.28–91.24） ════════
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const base = 1040, payH = 380;
  const intH = interpolate(f, [F(84.7), F(86.4)], [200, 480], out);
  return (
    <>
      <Head at={83.28} no="5" crumb="金利が大きく上がると">{r("未払利息")}</Head>
      {f >= F(84.4) ? <>
        <div style={{ position: "absolute", left: 160, top: base - payH, width: 260, height: payH, background: BLUE, border: `5px solid ${INK}`, borderRadius: "16px 16px 0 0", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 40, color: "#fff" }}>返済額</div>
        <div style={{ position: "absolute", left: 560, top: base - intH, width: 260, height: intH, background: RED, border: `5px solid ${INK}`, borderRadius: "16px 16px 0 0", boxSizing: "border-box", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 30, ...K, fontSize: 40, color: "#fff" }}>利息</div>
        <div style={{ position: "absolute", left: 120, right: 120, top: base, height: 5, background: INK }} />
        <div style={{ position: "absolute", left: 130, width: 720, top: base - payH, borderTop: `5px dashed ${INK}` }} />
      </> : null}
      {/* はみ出した分＝払いきれない利息 */}
      {f >= F(87.06) ? <div style={{ position: "absolute", left: 556, top: base - intH - 4, width: 268, height: intH - payH + 4, background: `repeating-linear-gradient(-45deg, ${YEL} 0 16px, #fff 16px 32px)`, border: `5px solid ${RED}`, borderRadius: "16px 16px 0 0", opacity: interpolate(f - F(87.06), [0, 6], [0, 1], clamp) }} /> : null}
      <Box at={87.3} from={[690, base - payH - 50]} to={[790, 470]} size={34}>払いきれない利息</Box>
      <Ghost at={88.6} style={{ left: 120, top: 1110, display: "flex", alignItems: "center", gap: 18 }}>
        <GenSlot name="rl_snowball" size={140} />
        <span style={{ ...BOXS, fontSize: 36 }}>次へ{c(RED, "繰り越し")}</span>
      </Ghost>
      <Stamp at={89.94} x={560} y={1120} text="未払利息" color={RED} size={64} rot={-5} />
    </>
  );
};

// ════════ ⑥ まとめ（91.24–104.26） ════════
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const rows: [number, React.ReactNode][] = [[92.0, <>返済額は{c(BLUE, "すぐ上がらない")}ことがある</>], [95.18, <>でも負担は{c(RED, "消えていない")}</>], [97.36, <>{r("後ろに先送り")}されているだけ</>]];
  return (
    <>
      <Head at={92.6} no="6" crumb="まとめ">変わらない≠{r("安心")}</Head>
      {rows.map(([at, t], i) => (
        <Ghost key={i} at={at} style={{ left: 110, top: 470 + i * 120, display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 56, height: 56, borderRadius: "50%", background: INK, color: "#fff", ...K, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{i + 1}</span>
          <span style={{ ...K, fontSize: 44, color: INK }}>{t}</span>
        </Ghost>
      ))}
      <Ghost at={99.3} style={{ left: 110, top: 880, width: 860, display: "flex", alignItems: "center", gap: 20 }}>
        <GenSlot name="rl_contract_magnifier" size={200} />
        <div style={{ ...BOXS, background: YEL, flex: 1, fontSize: 40, whiteSpace: "normal", textAlign: "left" }}>
          <span style={{ display: "inline-block", width: 50, height: 50, borderRadius: 10, border: `5px solid ${INK}`, verticalAlign: "middle", marginRight: 12, textAlign: "center", ...K, fontSize: 38, lineHeight: "40px", color: GREEN, background: "#fff" }}>{f >= F(102.84) ? "✓" : ""}</span>
          自分の住宅ローンの{r("契約内容")}を確認
        </div>
      </Ghost>
    </>
  );
};

// ════════ 締め（104.26–109） ════════
const Close: React.FC = () => (
  <>
    <Ghost at={104.26} style={{ left: 0, top: 380, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 58, color: INK }}>金利が上がっている今</span></Ghost>
    <Ghost at={105.82} style={{ left: 0, top: 470, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 78, color: INK, textShadow: `0 7px 0 ${YEL}` }}>どう{r("対策")}する？</span></Ghost>
    <Pic at={106.2} n="rl_couple_check" x={290} y={620} s={500} />
    <Ghost at={107.42} style={{ left: 0, top: 1140, width: 1080, textAlign: "center" }}>
      <span style={{ display: "inline-block", background: RED, color: "#fff", borderRadius: 999, padding: "10px 40px", ...K, fontSize: 46 }}>次の動画で解説します</span>
    </Ghost>
  </>
);

// 端の太一（感情の所だけ・場面ごとに表情を差し替え）
const SIDE: [number, number, string][] = [[3.34, 11.0, "taichi_scared"], [35.4, 38.0, "taichi_wave_no"], [99.3, 104.2, "taichi_point_up"]];
const Side: React.FC = () => {
  const f = useCurrentFrame();
  const cur = SIDE.find(([a, b]) => f >= F(a) && f < F(b));
  if (!cur) return null;
  const s = interpolate(f - F(cur[0]), [0, 3, 7], [0.6, 1.08, 1], clamp) * interpolate(f, [F(cur[1]) - 5, F(cur[1])], [1, 0], clamp);
  return <div style={{ position: "absolute", left: 800, top: 1050 + Math.sin(f / 8) * 5, width: 250, height: 250, transform: `scale(${s})`, transformOrigin: "50% 100%" }}><GenSlot name={cur[2]} size={250} /></div>;
};

// ── 地図（ページの並び）：上の段 左→右、下の段 右→左 ──
const PANELS: Panel[] = [
  { id: "hook", col: 0, row: 0 }, { id: "s1", col: 1, row: 0 }, { id: "s2", col: 2, row: 0 }, { id: "s3", col: 3, row: 0 },
  { id: "s4", col: 3, row: 1 }, { id: "s5", col: 2, row: 1 }, { id: "s6", col: 1, row: 1 }, { id: "close", col: 0, row: 1 },
];
const LINKS: [string, string][] = [["hook", "s1"], ["s1", "s2"], ["s2", "s3"], ["s3", "s4"], ["s4", "s5"], ["s5", "s6"], ["s6", "close"]];
const STOPS: Stop[] = [
  { id: "hook", trans: 0 }, { id: "s1", trans: 11.1, kind: "kick" }, { id: "s2", trans: 23.4, kind: "kick" }, { id: "s3", trans: 37.9, kind: "kick" },
  { id: "s4", trans: 59.15, kind: "kick" }, { id: "s5", trans: 83.1, kind: "kick" },
  // まとめの頭：地図全体まで引いて、ここまでの全部を見せてから まとめへ
  { id: "__map", trans: 91.0, scale: 0.2 }, { id: "s6", trans: 92.3, kind: "kick" }, { id: "close", trans: 104.1, kind: "fast" },
];
const PAGES: Record<string, React.FC> = { hook: Hook, s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, close: Close };

// 字幕（*黄色マーカー* !赤!）
const SUBS: [number, string][] = [
  [0, "住宅ローン金利が上がっても"], [1.62, "*返済額*が変わってない人"], [3.34, "これ!マジで危険!です"], [4.68, "今回は金利が上がると"], [6.26, "住宅ローンに*何が起こるのか*"], [8.02, "わかりやすく解説します"], [9.4, "対策は次の動画で話します"],
  [11.28, "まず変動金利が"], [12.36, "どうやって上がるのか"], [13.4, "日銀が*政策金利*を上げる"], [15.34, "すると銀行の*短期プライムレート*などが上がって"], [18.08, "住宅ローンの*基準金利*も上がります"], [19.96, "そこから*優遇幅*を引いたものが"], [21.96, "自分に*適用される金利*です"],
  [23.56, "ただ金利が上がっても"], [25.1, "返済額は!すぐ上がるとは限りません!"], [27.16, "*5年ルール*で"], [28.06, "返済額は5年間据え置き"], [29.8, "さらに5年後に見直すときも"], [31.54, "それまでの*1.25倍*まで"], [33.4, "これが*125%ルール*です"], [35.22, "でも返済額が変わらないから"], [36.98, "!安心ではありません!"],
  [38.04, "例えば*5,000万円*を30年"], [40.04, "金利*0.5%*で借りると"], [42.02, "毎月の返済は約15万円"], [44.28, "そのうち*元金*に回るのは"], [45.8, "約12万9,000円"], [47.24, "でも金利*1.5%*になると"], [49.52, "同じ約15万円でも"], [50.92, "元金に回るのは"], [51.94, "!約8万7,000円!まで減ります"], [53.72, "つまり返済額が変わっていないだけで"], [56.0, "金利上昇の負担を"], [57.28, "!後ろに先送り!しているだけなんです"],
  [59.32, "ではその負担を先送りした結果"], [61.32, "*5年後*どうなるのか"], [62.62, "5年で払う利息は"], [63.8, "約115万円から!約355万円!"], [66.76, "さらにローン残高も"], [68.14, "!約240万円!多く残ります"], [70.16, "そして5年後の返済額は"], [72.0, "約15万円から約17万8,000円に"], [74.66, "月!約2万9,000円!アップ"], [76.32, "金利1.5%がそのまま続けば"], [78.86, "最終的には"], [79.96, "!約861万円!支払いが増える計算です"],
  [83.28, "さらに金利が大きく上がると"], [84.7, "返済額より*利息*の方が多くなって"], [87.06, "払いきれなかった利息が"], [88.6, "!繰り越される!こともあります"], [89.94, "これが*未払利息*です"],
  [91.24, "まとめると金利が上がっても"], [93.02, "返済額はすぐ上がらないことがあります"], [95.18, "でも負担がなくなったわけではなくて"], [97.36, "!後ろに先送り!されているだけ"], [99.3, "だからまずは自分の住宅ローンが"], [101.2, "どのような*契約内容*なのか"], [102.84, "必ず確認してください"],
  [104.26, "では金利が上がっている今"], [105.82, "どう対策すればいいのか"], [107.42, "*次の動画*で解説します"],
];

const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  // 0秒には鳴らさない
  s("u02s", 1.62, 0.2), s("u04", 3.64, 0.3), s("u02s", 4.68, 0.16), s("u02s", 9.4, 0.16),
  ...STOPS.slice(1).map((st) => s("u03s", st.trans, 0.26)),
  ...[13.4, 15.34, 18.08, 20.5].map((t) => s("u02s", t, 0.2)), s("u05", 21.96, 0.26),
  ...[27.16, 27.34, 27.52, 27.7, 27.88].map((t) => s("u02s", t, 0.14)), s("u05s", 28.78, 0.22), s("u06", 30.16, 0.3), s("u05s", 32.16, 0.22), s("u04", 33.76, 0.3), s("u05", 35.22, 0.24),
  ...[38.4, 39.36, 40.04].map((t) => s("u02s", t, 0.18)), s("u05s", 42.02, 0.22), s("u05", 45.8, 0.24), s("u05s", 47.24, 0.22), s("u04", 51.94, 0.28), s("u05", 53.72, 0.26),
  s("u02s", 62.62, 0.18), s("u05s", 64.08, 0.22), s("u04", 65.26, 0.28), s("u05s", 68.14, 0.22), s("u02s", 70.16, 0.18), s("u05", 73.1, 0.24), s("u04", 74.76, 0.3), s("u09", 79.96, 0.3),
  s("u05s", 84.7, 0.22), s("u04", 87.06, 0.28), s("u02s", 88.6, 0.18), s("u04", 89.94, 0.3),
  ...[92.0, 95.18, 97.36].map((t) => s("u02s", t, 0.2)), s("u05", 99.3, 0.24), s("u10", 102.84, 0.28),
  s("u02s", 105.82, 0.18), s("u07", 107.42, 0.26),
];

const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const o = interpolate(f - F(at), [0, 1, 6], [0, 0.45, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} /> : null;
};

export const RATELOAN_FRAMES = F(109.4);
export const RateLoanReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: LAV, fontFamily: FONT }}>
    <Audio src={staticFile("rl-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Board streaks panels={PANELS} stops={STOPS} links={LINKS} paper={{ background: LAV, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }}>
      {(id) => { const C = PAGES[id]; return <AbsoluteFill><C /></AbsoluteFill>; }}
    </Board>
    {[11.28, 23.56, 38.04, 59.32, 83.28, 92.6].map((t) => <SpeedLines key={t} at={t} dur={10} />)}
    {[11.28, 23.56, 38.04, 59.32, 83.28].map((t) => <Flash key={t} at={t} />)}
    <Side />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, bottom: 0, background: `linear-gradient(${LAV}00, ${LAV} 60px)` }} />
    <Captions subs={SUBS} end={108.9} maxW={900} size={0.9} />
  </AbsoluteFill>
);
