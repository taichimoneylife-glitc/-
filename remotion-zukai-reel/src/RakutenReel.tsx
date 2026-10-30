import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT, FONT_BLACK } from "./components/font";
import { A2 } from "./components/kit2";
import { SfxTrack } from "./components/sfx";
import { B, GenSlot } from "./MileLifePlan";
import { Scene, Stamp, PopIn, Pic, Captions } from "./BourakuReel";
import { Camera, CamKey, camAt, Spot, ghostIn as ghostBase, SpeedLines } from "./components/cam";
import { RAKUTEN_MOUTH } from "./rakutenMouth";

// ════════════════════════════════════════════════════════════════════
//  楽天証券の乗っ取り対策 4つ（図解のみリール：冒頭と締めは太一イラストが口パク）
//  音声＝public/rakuten-narration.wav（60.4秒）。中身は楽天証券の公式ページで確認済み。
//  画面は楽天証券の公式ページ（取引やサービスの一時的な利用停止／パスキー設定ガイド）に載っている画面。
// ════════════════════════════════════════════════════════════════════

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const K = { fontFamily: FONT_BLACK, fontWeight: 900 as const };
const INK = A2.ink, SH = "#E3B53C", NAVY = "#1B2A7A", BLUE = A2.green, YEL = A2.marker, RED = A2.red, GREEN = A2.green, LAV = A2.bg, SUB = A2.sub;
const pop = (f: number, at: number) => interpolate(f - at, [0, 3, 6], [0.3, 1.2, 1], clamp);

// ── 背景：方眼 ──
// ── 背景：黄色いノート（罫線＋左の余白線） ──
const Bg: React.FC = () => (
  <AbsoluteFill style={{ background: LAV, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }}>
    <div style={{ position: "absolute", left: 70, top: 0, bottom: 0, width: 4, background: "rgba(239,125,87,0.35)" }} />
  </AbsoluteFill>
);

const Ghost: React.FC<{ at: number; until?: number; style?: React.CSSProperties; enter?: "ghost" | "slide"; children: React.ReactNode }> = ({ at, until = 999, style, enter = "ghost", children }) => {
  const f = useCurrentFrame();
  const A = F(at), Z = F(until);
  if (f < A || f >= Z + 5) return null;
  const g = enter === "slide" ? slideIn(f, A) : ghostIn(f, A);
  // 消え方：少し縮んで上へ抜ける
  const o = interpolate(f, [Z, Z + 5], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", ...style, ...g, opacity: (g.opacity as number) * (1 - o) }}>
      <div style={{ display: style?.display, justifyContent: style?.justifyContent, alignItems: style?.alignItems, gap: style?.gap, width: style?.display ? "100%" : undefined, transform: o > 0 ? `translateY(${-40 * o}px) scale(${1 - 0.08 * o})` : undefined }}>{children}</div>
    </div>
  );
};
const c = (col: string, t: React.ReactNode) => <span style={{ color: col }}>{t}</span>;
// 出方：うっすら大きめ → くっきり＋下からポンと跳ねて止まる（少し傾きが戻る）
const ghostIn = (f: number, A: number) => {
  const g = ghostBase(f, A);
  const d = f - A;
  const y = interpolate(d, [0, 4, 8, 12], [36, -8, 2, 0], clamp);
  const r = interpolate(d, [0, 5, 10], [-3, 1, 0], clamp);
  const sc = interpolate(d, [0, 2, 5, 9], [1.16, 1.06, 0.96, 1], clamp);
  return { opacity: g.opacity, transform: `translateY(${y}px) rotate(${r}deg) scale(${sc})` };
};
// 実際の画面の出方：下からシュッと上がってきて、少し傾いて止まる
const slideIn = (f: number, A: number) => {
  const d = f - A;
  return {
    opacity: interpolate(d, [0, 3], [0, 1], clamp),
    transform: `translateY(${interpolate(d, [0, 6, 10, 14], [260, -14, 4, 0], clamp)}px) rotate(${interpolate(d, [0, 7, 14], [6, -1, 0], clamp)}deg)`,
    filter: d < 5 ? `blur(${interpolate(d, [0, 5], [8, 0], clamp)}px)` : undefined,
  };
};

// 道順の札＋見出し（番号つき）
const Head: React.FC<{ at: number; no: string; crumb: string; big?: boolean; children: React.ReactNode }> = ({ at, no, crumb, big, children }) => (
  <>
    <Ghost at={at} style={{ left: 0, top: 232, width: 1080, textAlign: "center" }}>
      <span style={{ display: "inline-block", background: INK, color: "#fff", borderRadius: 999, padding: "8px 30px", ...B, fontSize: 30, boxShadow: `0 6px 0 ${SH}` }}>{crumb}</span>
    </Ghost>
    <Ghost at={at + 0.05} style={{ left: 0, top: 300, width: 1080, textAlign: "center", whiteSpace: "nowrap" }}>
      <span style={{ display: "inline-block", width: 92, height: 92, borderRadius: "50%", background: BLUE, transform: `rotate(${interpolate(useCurrentFrame() - F(at), [0, 8], [-180, 0], { ...clamp, easing: Easing.out(Easing.back(2)) })}deg)`, border: `5px solid ${INK}`, color: "#fff", ...K, fontSize: 56, lineHeight: "82px", verticalAlign: "middle", marginRight: 18, boxShadow: `0 6px 0 ${INK}` }}>{no}</span>
      <span style={{ ...K, fontSize: big ? 84 : 64, color: INK, verticalAlign: "middle", textShadow: `0 6px 0 ${YEL}` }}>{children}</span>
    </Ghost>
  </>
);

// 説明の箱（点 → 線 → うっすら大きめ → くっきり）
const BOXS: React.CSSProperties = { background: "#fff", border: `5px solid ${INK}`, borderRadius: 18, boxShadow: `0 8px 0 ${SH}`, padding: "14px 32px", textAlign: "center", ...B, color: INK, lineHeight: 1.32, whiteSpace: "pre" };
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
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
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

// 太一（体は動かさず口だけ）
const Mouth: React.FC<{ x: number; y: number; size: number; pose?: string }> = ({ x, y, size, pose }) => {
  const f = useCurrentFrame();
  const lv = RAKUTEN_MOUTH.charCodeAt(Math.min(RAKUTEN_MOUTH.length - 1, f)) - 48;
  const img = pose ?? (f % 90 > 86 && lv === 0 ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 2) % 3 ? "taichi_talk_open" : "taichi_talk_mid") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed");
  return <div style={{ position: "absolute", left: x, top: y, width: size, height: size }}><GenSlot name={img} size={size} /></div>;
};
// 端にいる小さな太一（場面ごとに表情を差し替え）
const Side: React.FC<{ poses: [number, string][] }> = ({ poses }) => {
  const f = useCurrentFrame();
  let name = poses[0][1], at = poses[0][0];
  poses.forEach(([t, n]) => { if (f >= F(t)) { name = n; at = t; } });
  const s = interpolate(f - F(at), [0, 3, 7], [0.85, 1.06, 1], clamp);
  return <div style={{ position: "absolute", left: 790, top: 1060 + Math.sin(f / 8) * 5, width: 270, height: 270, transform: `scale(${s})`, transformOrigin: "50% 100%" }}><GenSlot name={name} size={270} /></div>;
};

// ── 画面イメージ（実際の画面を元に描き直し） ──
const SCR: React.CSSProperties = { position: "absolute", background: "#fff", border: `6px solid ${INK}`, borderRadius: 30, boxShadow: `10px 12px 0 ${SH}`, overflow: "hidden", boxSizing: "border-box" };
const ScrHead: React.FC<{ t: string }> = ({ t }) => (
  <div style={{ background: NAVY, color: "#fff", padding: "16px 26px", ...B, fontSize: 30, display: "flex", justifyContent: "space-between" }}><span>{t}</span><span style={{ fontSize: 20, opacity: 0.7, alignSelf: "center" }}>画面イメージ</span></div>
);
const SecTitle: React.FC<{ t: string }> = ({ t }) => (
  <div style={{ margin: "22px 26px 10px", paddingTop: 10, borderTop: `5px solid ${BLUE}`, ...K, fontSize: 34, color: INK }}>{t}</div>
);

// ── 実際の画面（楽天証券の公式ページの画面） ──
type Shot = { src: string; iw: number; x: number; y: number; w: number; cy0: number; cy1: number };
const sr = (s: Shot, r: [number, number, number, number]): [number, number, number, number] => {
  const k = s.w / s.iw;
  return [s.x + r[0] * k, s.y + (r[1] - s.cy0) * k, (r[2] - r[0]) * k, (r[3] - r[1]) * k];
};
const ShotView: React.FC<{ s: Shot; at: number; until?: number }> = ({ s, at, until = 999 }) => {
  const k = s.w / s.iw;
  return (
    <Ghost at={at} until={until} style={{ left: s.x - 6, top: s.y - 6 }} enter="slide">
      <div style={{ position: "relative", width: s.w, height: (s.cy1 - s.cy0) * k, overflow: "hidden", border: `6px solid ${INK}`, borderRadius: 24, boxShadow: `9px 11px 0 ${SH}`, background: "#fff" }}>
        <Img src={staticFile(`rakuten_screens/${s.src}.png`)} style={{ position: "absolute", left: 0, top: -s.cy0 * k, width: s.w }} />
      </div>
    </Ghost>
  );
};
// 世界の座標 → 画面の座標（カメラが止まった後）
const toScr = (keys: CamKey[], t: number, p: [number, number]): [number, number] => {
  const k = camAt(F(t) + 20, keys);
  return [(p[0] - k.x) * k.s + 540, (p[1] - k.y) * k.s + 960];
};

// アイコン（SVG）
const FaceIcon: React.FC<{ s: number; col?: string }> = ({ s, col = BLUE }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={col} strokeWidth={7} strokeLinecap="round">
    <path d="M8 30 V14 Q8 8 14 8 H30 M70 8 H86 Q92 8 92 14 V30 M92 70 V86 Q92 92 86 92 H70 M30 92 H14 Q8 92 8 86 V70" />
    <path d="M36 38 V44 M64 38 V44 M50 40 V58 H45 M36 68 Q50 78 64 68" />
  </svg>
);
const FingerIcon: React.FC<{ s: number; col?: string }> = ({ s, col = BLUE }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={col} strokeWidth={6} strokeLinecap="round">
    <path d="M24 34 Q50 4 76 34" /><path d="M18 56 Q16 22 50 18 Q84 22 82 56" /><path d="M30 80 Q26 66 28 52 Q30 32 50 32 Q70 32 70 52 Q70 66 74 78" />
    <path d="M42 88 Q38 72 40 54 Q42 44 50 44 Q58 44 58 54 Q58 70 62 86" /><path d="M50 56 Q50 76 54 92" />
  </svg>
);
const PhoneIcon: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><rect x={28} y={6} width={44} height={88} rx={9} fill="#fff" stroke={INK} strokeWidth={6} /><rect x={42} y={13} width={16} height={5} rx={2.5} fill={INK} /></svg>
);
const PcIcon: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><rect x={10} y={16} width={80} height={52} rx={6} fill="#fff" stroke={INK} strokeWidth={6} /><path d="M38 68 L34 84 H66 L62 68" fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" /></svg>
);
const Check: React.FC<{ at: number; s?: number; col?: string }> = ({ at, s = 64, col = GREEN }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return <span style={{ display: "inline-block", width: s, height: s, borderRadius: "50%", background: col, border: `4px solid ${INK}`, color: "#fff", ...K, fontSize: s * 0.55, textAlign: "center", lineHeight: `${s - 8}px`, boxSizing: "border-box", transform: `scale(${pop(f, F(at))})` }}>✓</span>;
};

// 画面（楽天証券の公式ページより）
const PK_C: Shot = { src: "pk_create", iw: 622, x: 280, y: 480, w: 520, cy0: 150, cy1: 900 };
const PK_S: Shot = { src: "pk_save", iw: 622, x: 280, y: 480, w: 520, cy0: 300, cy1: 1090 };
const MENU: Shot = { src: "menu", iw: 254, x: 300, y: 500, w: 480, cy0: 150, cy1: 410 };
const SEC: Shot = { src: "security", iw: 622, x: 260, y: 480, w: 560, cy0: 380, cy1: 980 };
const LT: Shot = { src: "lock_types", iw: 622, x: 240, y: 480, w: 600, cy0: 90, cy1: 720 };

// ════════ 冒頭（0–6.5） ════════
const TABS: [string, string, number][] = [["01", "パスキー\nを登録", 4.82], ["02", "取引\nロック", 5.16], ["03", "出金先\nロック", 5.52], ["04", "注文\n通知", 5.9]];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const keys: CamKey[] = [{ t: 6.1, x: 540, y: 780, s: 1.22, d: 7 }];
  return (
    <Scene a={0} b={6.5} inT="punch" outT="zoom">
      <Bg />
      <Camera keys={keys}>
        <Ghost at={0.05} style={{ left: 0, top: 216, width: 1080, textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 18, background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, padding: "10px 34px", boxShadow: `0 8px 0 ${SH}` }}>
            <Img src={staticFile("logos/rakuten.png")} style={{ height: 110 }} />
            <span style={{ ...K, fontSize: 44, color: INK }}>を使っている人</span>
          </span>
        </Ghost>
        <Ghost at={1.84} style={{ left: 0, top: 380, width: 1080, textAlign: "center", whiteSpace: "nowrap" }}>
          <span style={{ ...K, fontSize: 80, color: INK, textShadow: `0 7px 0 ${YEL}` }}>証券口座の<span style={{ color: RED }}>乗っ取り</span>対策</span>
        </Ghost>
        <Ghost at={3.16} style={{ left: 0, top: 500, width: 1080, textAlign: "center" }}>
          <span style={{ display: "inline-block", background: YEL, border: `5px solid ${INK}`, borderRadius: 16, padding: "6px 34px", ...K, fontSize: 52, color: INK, boxShadow: `0 7px 0 ${INK}` }}>ちゃんとできていますか？</span>
        </Ghost>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${interpolate(f, [F(4.3), F(4.3) + 8], [0, 380], out)}px)` }}>
          <Mouth x={250} y={610} size={580} />
        </div>
        {TABS.map(([no, t, at], i) => f >= F(at) ? (
          <div key={no} style={{ position: "absolute", left: 92 + i * 228, top: 720, width: 212, ...ghostIn(f, F(at)) }}>
            <div style={{ background: [GREEN, "#7A4FD8", "#F08A24", RED][i], border: `5px solid ${INK}`, borderBottom: "none", borderRadius: "14px 14px 0 0", textAlign: "center", color: "#fff", ...K, fontSize: 34 }}>{no}</div>
            <div style={{ background: "#fff", border: `5px solid ${INK}`, height: 128, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", ...B, fontSize: 32, lineHeight: 1.3, whiteSpace: "pre", color: INK, boxShadow: `0 8px 0 ${SH}` }}>{t}</div>
          </div>
        ) : null)}
        {f >= F(4.38) ? <Ghost at={4.38} style={{ left: 0, top: 610, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 58, color: INK }}>やっておきたい設定 {c(BLUE, "4つ")}</span></Ghost> : null}
      </Camera>
    </Scene>
  );
};

// ════════ ① パスキーを登録（6.5–16.6） ════════
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [F(8.4), F(8.4) + 6], [0, 100], out);
  const keys: CamKey[] = [{ t: 0, x: 540, y: 860, s: 1, d: 1 }, { t: 12.46, x: 540, y: 700, s: 1.2, d: 7 }, { t: 14.7, x: 540, y: 860, s: 1, d: 7 }];
  return (
    <Scene a={6.5} b={16.6}>
      <Bg />
      <Camera keys={keys}>
        <Head at={6.5} no="1" big crumb="ログイン後の案内 → パスキーを作成する">パスキーを登録</Head>
        <Ghost at={7.9} until={11.52} style={{ left: 0, top: 500, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 }}>
          <div style={{ position: "relative", ...BOXS, fontSize: 46, ...K }}>
            <span style={{ letterSpacing: 6 }}>＊＊＊＊＊＊</span>
            <div style={{ fontSize: 26, ...B, color: SUB }}>パスワード</div>
            <span style={{ position: "absolute", left: 10, top: "46%", height: 10, borderRadius: 5, background: RED, width: `calc(${strike}% - 20px)` }} />
          </div>
          <span style={{ ...K, fontSize: 70, color: INK, opacity: f >= F(8.6) ? 1 : 0 }}>→</span>
        </Ghost>
        <Ghost at={9.1} until={11.52} style={{ left: 610, top: 470 }}>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ ...BOXS, padding: 18 }}><FaceIcon s={120} /><div style={{ fontSize: 28 }}>顔認証</div></div>
            {f >= F(9.82) ? <div style={{ ...BOXS, padding: 18, ...ghostIn(f, F(9.82)) }}><FingerIcon s={120} /><div style={{ fontSize: 28 }}>指紋</div></div> : null}
          </div>
        </Ghost>
        <Box at={10.52} until={11.52} to={[540, 860]} size={44}>パスワードの代わりに{"\n"}{c(BLUE, "顔や指紋でログイン")}する仕組み</Box>
        <ShotView s={PK_C} at={11.52} until={15.5} />
        <Spot at={12.46} until={14.7} rect={sr(PK_C, [30, 195, 592, 290])} r={14} />
        <Spot at={14.76} until={15.5} rect={sr(PK_C, [70, 765, 560, 890])} r={14} />
        <ShotView s={PK_S} at={15.5} />
        <Spot at={15.8} rect={sr(PK_S, [25, 930, 600, 1045])} r={16} />
        <Side poses={[[6.5, "taichi_point_up"], [9.1, "taichi_idea"], [11.52, "taichi_point_left"], [14.76, "taichi_ok_hand"]]} />
      </Camera>
      <Box at={12.6} until={14.7} to={[540, 1210]} size={40} bg={YEL}>楽天証券でもパスキー認証が{"\n"}{c(RED, "順次必須")}に</Box>
      <Box at={14.9} to={[400, 1210]} size={40}>{c(BLUE, "まだの人")}は登録を</Box>
    </Scene>
  );
};

// ════════ ② 取引ロック（16.6–29.6） ════════
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const keys: CamKey[] = [{ t: 0, x: 540, y: 860, s: 1, d: 1 }, { t: 22.3, x: 540, y: 700, s: 1.2, d: 7 }, { t: 25.9, x: 540, y: 860, s: 1, d: 7 }];
  const dark = interpolate(f, [F(26.04), F(26.04) + 4], [0, 1], clamp);
  return (
    <Scene a={16.6} b={29.6} inT="drop">
      <Bg />
      <Camera keys={keys}>
        <Head at={16.6} no="2" big crumb="マイメニュー → セキュリティ設定">取引ロック</Head>
        <ShotView s={MENU} at={17.76} until={18.9} />
        <Spot at={18.0} until={18.9} rect={sr(MENU, [2, 300, 252, 352])} r={10} />
        <ShotView s={SEC} at={18.9} until={20.14} />
        <Spot at={19.1} until={19.6} rect={sr(SEC, [292, 428, 612, 522])} r={14} />
        <Spot at={19.6} until={20.14} rect={sr(SEC, [60, 865, 562, 955])} r={12} />
        <ShotView s={LT} at={20.14} />
        <Spot at={22.3} until={26.0} rect={sr(LT, [28, 278, 594, 470])} r={14} />
        <Side poses={[[16.6, "taichi_explain_both"], [17.76, "taichi_point_left"], [20.14, "taichi_think_chin"], [22.3, "taichi_idea"], [24.76, "taichi_ok_hand"]]} />
      </Camera>
      <Box at={17.9} until={20.14} to={[540, 1220]} size={38}>使わない取引を{c(RED, "一時的に止める")}</Box>
      <Box at={20.3} until={22.3} to={[440, 1220]} size={38}>{c(BLUE, "投資信託の積立だけ")}の人なら</Box>
      <Box at={24.76} until={26.0} to={[440, 1220]} size={40} bg={YEL}>{c(GREEN, "積立は続けたまま")}</Box>
      {dark > 0 ? (
        <AbsoluteFill style={{ background: `rgba(46,44,38,${0.86 * dark})` }}>
          <Ghost at={26.1} style={{ left: 0, top: 470, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 56, color: "#fff" }}>止められるのは</span></Ghost>
          {([["投資信託の売却", 26.04], ["外国株式", 27.38], ["出金", 28.36]] as [string, number][]).map(([t, at], i) => (
            <Ghost key={t} at={at} style={{ left: 190, top: 600 + i * 150, width: 700 }}>
              <div style={{ ...BOXS, fontSize: 52, ...K, display: "flex", justifyContent: "space-between", alignItems: "center" }}>{t}<span style={{ color: RED, fontSize: 64 }}>✕</span></div>
            </Ghost>
          ))}
          <Ghost at={24.0} style={{ left: 0, top: 1070, width: 1080, textAlign: "center" }}><span style={{ ...B, fontSize: 30, color: YEL }}>「投資信託の買付以外を停止」の場合</span></Ghost>
        </AbsoluteFill>
      ) : null}
    </Scene>
  );
};

// ════════ ③ 出金先のロック（29.6–38.86）※電話で頼む設定なので図で ════════
const S3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene a={29.6} b={38.86}>
      <Bg />
      <Head at={29.6} no="3" big crumb="カスタマーサービスセンターに連絡">出金先のロック</Head>
      {/* 電話 → 出金先口座の変更にロック */}
      <Ghost at={31.02} style={{ left: 110, top: 520 }}>
        <div style={{ ...BOXS, padding: "18px 26px", display: "flex", alignItems: "center", gap: 16 }}><PhoneIcon s={110} /><span style={{ fontSize: 34, textAlign: "left" }}>カスタマー{"\n"}サービスセンター</span></div>
      </Ghost>
      {f >= F(32.48) ? <div style={{ position: "absolute", left: 520, top: 585, ...K, fontSize: 70, color: INK, transform: `translateX(${interpolate(f - F(32.48), [0, 6], [-30, 0], out)}px)`, opacity: interpolate(f - F(32.48), [0, 4], [0, 1], clamp) }}>→</div> : null}
      <Ghost at={33.06} style={{ left: 610, top: 490 }}>
        <div style={{ position: "relative", ...BOXS, padding: "18px 26px", width: 330, boxSizing: "border-box" }}>
          <div style={{ fontSize: 30, color: SUB }}>出金先口座の</div>
          <div style={{ ...K, fontSize: 46 }}>変更</div>
          {f >= F(34.46) ? <div style={{ position: "absolute", right: -90, top: -80, transform: `scale(${pop(f, F(34.46))}) rotate(-8deg)` }}><GenSlot name="bouraku_lock" size={150} /></div> : null}
        </div>
      </Ghost>
      {/* 万が一ログインされても */}
      <Ghost at={35.06} style={{ left: 0, top: 800, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 48, color: INK }}>万が一 <span style={{ color: RED }}>ログインされても</span></span></Ghost>
      <Ghost at={36.34} style={{ left: 330, top: 880 }}><Pic name="ic_shield" size={300} /></Ghost>
      <Box at={36.74} to={[540, 1220]} size={42} bg={YEL}>お金の{c(RED, "出口")}は勝手に{"\n"}変えられない</Box>
      <Side poses={[[29.6, "taichi_explain_both"], [33.06, "taichi_point_left"], [35.06, "taichi_notice"], [36.74, "taichi_ok_hand"]]} />
    </Scene>
  );
};

// ════════ ④ 注文通知（38.86–49.74） ════════
const GOODS = ["国内株式", "投資信託", "米国株式"];
const S4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene a={38.86} b={49.74} inT="punch">
      <Bg />
      <Head at={38.86} no="4" big crumb="セキュリティ設定 → 注文通知">注文通知</Head>
      {/* ログイン通知と注文通知 */}
      <Ghost at={40.3} until={45.08} style={{ left: 110, top: 520, width: 860, display: "flex", gap: 30 }}>
        <div style={{ flex: 1, ...BOXS, padding: "24px 10px" }}><div style={{ ...K, fontSize: 40 }}>ログイン通知</div><div style={{ marginTop: 14 }}><Check at={41.12} s={70} /></div><div style={{ fontSize: 30, color: GREEN, marginTop: 8 }}>原則 設定済み</div></div>
        {f >= F(43.0) ? <div style={{ flex: 1, ...BOXS, padding: "24px 10px", borderColor: RED, boxShadow: `0 8px 0 ${RED}`, ...ghostIn(f, F(43.0)) }}><div style={{ ...K, fontSize: 40 }}>注文通知</div><div style={{ ...K, fontSize: 70, color: RED, lineHeight: "78px" }}>！</div><div style={{ fontSize: 30, color: RED, marginTop: 8 }}>自分で設定が必要</div></div> : null}
      </Ghost>
      {/* 商品ごとに「通知する」 */}
      {f >= F(45.08) ? GOODS.map((g, i) => {
        const at = F(45.08) + i * 4, on = f >= F(45.88) + i * 5;
        return (
          <div key={g} style={{ position: "absolute", left: 160, top: 500 + i * 120, width: 760, height: 98, background: "#fff", border: `5px solid ${INK}`, borderRadius: 18, boxShadow: `0 7px 0 ${SH}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", boxSizing: "border-box", ...ghostIn(f, at) }}>
            <span style={{ ...B, fontSize: 38, color: INK }}>{g}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 14, ...B, fontSize: 30, color: on ? GREEN : SUB }}>
              {on ? "通知する" : "通知しない"}
              <span style={{ position: "relative", width: 96, height: 50, borderRadius: 999, border: `4px solid ${INK}`, background: on ? GREEN : "#D9D4C4", boxSizing: "border-box" }}>
                <span style={{ position: "absolute", top: 4, left: on ? 50 : 4, width: 34, height: 34, borderRadius: "50%", background: "#fff", border: `3px solid ${INK}`, boxSizing: "border-box" }} />
              </span>
            </span>
          </div>
        );
      }) : null}
      {/* 身に覚えのない注文の通知 */}
      <Ghost at={47.8} style={{ left: 150, top: 900, width: 780 }}>
        <div style={{ ...BOXS, textAlign: "left", display: "flex", alignItems: "center", gap: 20, borderColor: RED, boxShadow: `0 8px 0 ${RED}` }}>
          <span style={{ display: "inline-block", width: 70, height: 50, border: `5px solid ${INK}`, borderRadius: 8, position: "relative" }}><span style={{ position: "absolute", left: 4, right: 4, top: 4, height: 22, borderBottom: `5px solid ${INK}`, transform: "skewY(20deg)" }} /></span>
          <span style={{ fontSize: 32 }}>【注文受付】身に覚えのない注文…？</span>
        </div>
      </Ghost>
      <Box at={48.44} to={[400, 1200]} size={40} bg={YEL}>{c(RED, "すぐ気づける")}</Box>
      <Side poses={[[38.86, "taichi_explain_both"], [43.0, "taichi_notice"], [45.08, "taichi_point_left"], [47.8, "taichi_surprise"]]} />
    </Scene>
  );
};

// ════════ 締め（49.74–60.44） ════════
const Close: React.FC = () => {
  const f = useCurrentFrame();
  const dark = interpolate(f, [F(53.36), F(53.36) + 4], [0, 1], clamp) * (1 - interpolate(f, [F(58.2), F(58.2) + 5], [0, 1], clamp));
  return (
    <Scene a={49.74} b={61.0} inT="zoom" outT="zoom">
      <Bg />
      <Ghost at={49.8} style={{ left: 0, top: 260, width: 1080, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, padding: "16px 40px", boxShadow: `0 8px 0 ${SH}` }}><Img src={staticFile("logos/rakuten.png")} style={{ height: 150 }} /></span>
      </Ghost>
      <Ghost at={50.74} style={{ left: 0, top: 500, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 50, color: INK }}>どれも{c(RED, "楽天証券の公式ページ")}で紹介</span></Ghost>
      {["パスキー", "取引ロック", "出金先ロック", "注文通知"].map((t, i) => (
        <Ghost key={t} at={51.0 + i * 0.12} style={{ left: 30 + i * 258, top: 600, width: 250, textAlign: "center", whiteSpace: "nowrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `4px solid ${INK}`, borderRadius: 999, padding: "6px 14px", ...B, fontSize: 26 }}><Check at={52.0 + i * 0.12} s={32} />{t}</span>
        </Ghost>
      ))}
      <Mouth x={300} y={720} size={480} />
      {/* もし乗っ取られたかも → 電話番号 */}
      {dark > 0 ? (
        <AbsoluteFill style={{ background: `rgba(46,44,38,${0.88 * dark})` }}>
          <Ghost at={53.4} style={{ left: 0, top: 440, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 56, color: "#fff" }}>もし<span style={{ color: YEL }}>乗っ取られたかも</span>と思ったら</span></Ghost>
          <Ghost at={55.24} style={{ left: 120, top: 580, width: 840 }}>
            <div style={{ background: "#fff", border: `6px solid ${YEL}`, borderRadius: 26, boxShadow: `0 0 30px ${YEL}`, padding: "22px 20px", textAlign: "center" }}>
              <div style={{ ...B, fontSize: 30, color: SUB }}>自動音声ダイヤル（24時間・通話料無料）</div>
              <div style={{ ...K, fontSize: 104, color: RED, letterSpacing: 2, lineHeight: 1.15 }}>0120-852-638</div>
            </div>
          </Ghost>
          <Ghost at={56.74} style={{ left: 0, top: 860, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 52, color: "#fff" }}>ログインや取引を<span style={{ color: YEL }}>止められる</span></span></Ghost>
          <Ghost at={57.2} style={{ left: 0, top: 960, width: 1080, textAlign: "center" }}><span style={{ ...B, fontSize: 26, color: "#ddd" }}>※全部止めると投資信託の積立もエラーに。解除は登録した電話番号から</span></Ghost>
        </AbsoluteFill>
      ) : null}
      <Ghost at={58.32} style={{ left: 0, top: 1190, width: 1080, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: YEL, border: `5px solid ${INK}`, borderRadius: 16, padding: "8px 36px", ...K, fontSize: 48, color: INK, boxShadow: `0 7px 0 ${INK}` }}>保存して、今日のうちに確認！</span>
      </Ghost>
    </Scene>
  );
};

// 字幕（話した言葉どおり）
const SUBS: [number, string][] = [
  [0, "*楽天証券*を使っている人"], [1.84, "証券口座の!乗っ取り!対策"], [3.16, "ちゃんとできていますか？"], [4.38, "やっておきたい設定を*4つ*解説します"],
  [6.5, "1つ目 *パスキーの登録*"], [7.9, "パスワードの代わりに"], [9.1, "*顔認証*や*指紋*などでログインする仕組みです"], [11.52, "楽天証券でもパスキー認証が"], [13.48, "!順次必須!になっているので"], [14.76, "まだの人は*登録*しておきましょう"],
  [16.6, "2つ目 *取引ロック*"], [17.76, "使わない取引を*一時的に止める*ことができます"], [20.14, "投資信託の積立だけしている人なら"], [22.3, "*投資信託の買付以外を停止*にすると"], [24.76, "*積立は続けたまま*"], [26.04, "投資信託の売却や!外国株式!"], [28.36, "!出金!などを止められます"],
  [29.6, "3つ目 *出金先のロック*"], [31.02, "カスタマーサービスセンターに連絡すると"], [33.06, "*出金先口座の変更*を止められます"], [35.06, "万が一ログインされても"], [36.34, "お金の出口は!勝手に変えられない!ようにできます"],
  [38.86, "4つ目 *注文通知*"], [40.3, "ログイン通知は原則設定されていますが"], [43.0, "注文通知は!自分で設定!が必要です"], [45.08, "商品ごとに*通知する*にしておけば"], [47.14, "身に覚えのない注文にも"], [48.44, "*すぐ気づきやすく*なります"],
  [49.74, "今回の対策はどれも"], [51.06, "*楽天証券の公式ページ*で紹介されています"], [53.36, "もし!乗っ取られたかも!と思ったら"], [55.24, "この番号に電話をかければ"], [56.74, "ログインや取引を*止められます*"], [58.32, "*保存*して今日のうちに確認しておきましょう"],
];

// 効果音（たいちさん指定の音だけ：user/u02s・u03・u03s・u04・u05・u05s・u06・u10）
const CUES: { file: string; at: number; volume: number }[] = [
  { file: "user/u04", at: F(1.84), volume: 0.3 },
  { file: "user/u05", at: F(3.16), volume: 0.26 },
  ...TABS.map(([, , t]) => ({ file: "user/u02s", at: F(t), volume: 0.22 })),
  { file: "user/u03s", at: F(6.1), volume: 0.24 },
  ...[6.5, 16.6, 29.6, 38.86, 49.74].map((t) => ({ file: "user/u03", at: F(t), volume: 0.26 })),
  // ①
  ...[7.9, 9.82].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })), { file: "user/u05s", at: F(9.1), volume: 0.22 }, { file: "user/u02s", at: F(10.52), volume: 0.2 },
  { file: "user/u03s", at: F(11.52), volume: 0.22 }, { file: "user/u05s", at: F(12.46), volume: 0.22 }, { file: "user/u04", at: F(13.48), volume: 0.26 },
  { file: "user/u05s", at: F(14.76), volume: 0.2 }, { file: "user/u03s", at: F(15.5), volume: 0.2 }, { file: "user/u05", at: F(15.8), volume: 0.24 },
  // ②
  { file: "user/u03s", at: F(17.76), volume: 0.2 }, { file: "user/u05s", at: F(18.0), volume: 0.2 }, { file: "user/u03s", at: F(18.9), volume: 0.2 }, { file: "user/u06", at: F(19.6), volume: 0.26 },
  { file: "user/u03s", at: F(20.14), volume: 0.22 }, { file: "user/u02s", at: F(20.3), volume: 0.18 }, { file: "user/u05", at: F(22.3), volume: 0.26 }, { file: "user/u02s", at: F(24.76), volume: 0.2 },
  ...[26.04, 27.38, 28.36].map((t) => ({ file: "user/u04", at: F(t), volume: 0.24 })),
  // ③
  { file: "user/u02s", at: F(31.02), volume: 0.2 }, { file: "user/u02s", at: F(33.06), volume: 0.2 }, { file: "user/u04", at: F(34.46), volume: 0.28 },
  { file: "user/u02s", at: F(35.06), volume: 0.18 }, { file: "user/u05s", at: F(36.34), volume: 0.22 }, { file: "user/u05", at: F(36.74), volume: 0.26 },
  // ④
  { file: "user/u02s", at: F(40.3), volume: 0.2 }, { file: "user/u05s", at: F(41.12), volume: 0.2 }, { file: "user/u04", at: F(43.0), volume: 0.26 },
  ...[0, 1, 2].map((i) => ({ file: "user/u02s", at: F(45.08) + i * 4, volume: 0.18 })), ...[0, 1, 2].map((i) => ({ file: "user/u06", at: F(45.88) + i * 5, volume: 0.22 })),
  { file: "user/u05", at: F(47.8), volume: 0.26 }, { file: "user/u02s", at: F(48.44), volume: 0.2 },
  // 締め
  { file: "user/u02s", at: F(50.74), volume: 0.2 }, ...[0, 1, 2, 3].map((i) => ({ file: "user/u05s", at: F(52.0 + i * 0.12), volume: 0.16 })),
  { file: "user/u04", at: F(53.36), volume: 0.28 }, { file: "user/u05", at: F(55.24), volume: 0.28 }, { file: "user/u02s", at: F(56.74), volume: 0.2 },
  { file: "user/u10", at: F(58.32), volume: 0.3 },
];

// 場面が変わる瞬間の白い光
const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const o = interpolate(f - F(at), [0, 1, 6], [0, 0.55, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} /> : null;
};

export const RAKUTEN_FRAMES = F(61.0);
export const RakutenReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: LAV, fontFamily: FONT }}>
    <Audio src={staticFile("rakuten-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Hook /><S1 /><S2 /><S3 /><S4 /><Close />
    {[6.5, 16.6, 29.6, 38.86, 49.74].map((t) => <SpeedLines key={t} at={t} dur={10} />)}
    {[6.5, 16.6, 29.6, 38.86].map((t) => <Flash key={t} at={t} />)}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1310, bottom: 0, background: `linear-gradient(${LAV}00, ${LAV} 70px)` }} />
    <Captions subs={SUBS} end={60.44} maxW={900} size={0.9} />
  </AbsoluteFill>
);
