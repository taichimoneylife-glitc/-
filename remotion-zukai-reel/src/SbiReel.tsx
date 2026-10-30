import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT, FONT_BLACK } from "./components/font";
import { A2 } from "./components/kit2";
import { SfxTrack } from "./components/sfx";
import { B, GenSlot } from "./MileLifePlan";
import { Scene, Stamp, PopIn, Pic, Captions } from "./BourakuReel";
import { Camera, CamKey, camAt, Spot, ghostIn as ghostBase, SpeedLines } from "./components/cam";
import { SBI_MOUTH } from "./sbiMouth";

// ════════════════════════════════════════════════════════════════════
//  SBI証券の乗っ取り対策 4つ（図解のみリール：冒頭と締めは太一イラストが口パク）
//  音声＝public/sbi-narration.wav（61.9秒）。中身はSBI証券の公式ページと実際の画面で確認済み。
//  画面は実際の画面を元に描き直した「画面イメージ」（口座番号などは出さない）。
//  取引制限受付フォームは「無断転載・改変禁止」の記載があるため、画面は描かず自作の図で見せる。
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
  const lv = SBI_MOUTH.charCodeAt(Math.min(SBI_MOUTH.length - 1, f)) - 48;
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

// ── 実際の画面（たいちさんの口座のスクショ。口座番号は塗りつぶし済み） ──
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
        <Img src={staticFile(`sbi_screens/${s.src}.jpg`)} style={{ position: "absolute", left: 0, top: -s.cy0 * k, width: s.w }} />
      </div>
    </Ghost>
  );
};
const PK_MUST: Shot = { src: "pk_must", iw: 1179, x: 160, y: 480, w: 760, cy0: 0, cy1: 900 };
const PK_ADD: Shot = { src: "pk_add", iw: 1179, x: 160, y: 480, w: 760, cy0: 760, cy1: 1640 };
const PW_CHG: Shot = { src: "pw_change", iw: 1179, x: 160, y: 480, w: 760, cy0: 820, cy1: 1700 };
const PW_TOP: Shot = { src: "pw_top", iw: 1179, x: 160, y: 560, w: 760, cy0: 300, cy1: 1000 };
const APP_T: Shot = { src: "app_table", iw: 872, x: 120, y: 500, w: 840, cy0: 0, cy1: 512 };
const APP_D: Shot = { src: "app_done", iw: 663, x: 120, y: 480, w: 840, cy0: 0, cy1: 477 };
const ACC: Shot = { src: "accounts", iw: 1179, x: 160, y: 500, w: 760, cy0: 1400, cy1: 2117 };
const FAQ: Shot = { src: "faq_head", iw: 1179, x: 110, y: 230, w: 860, cy0: 0, cy1: 560 };

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

// ════════ 冒頭（0–6.64） ════════
const TABS: [string, string, number][] = [["01", "パスキー\nを登録", 4.96], ["02", "パスワード\nログイン停止", 5.32], ["03", "使わない\nアプリ確認", 5.6], ["04", "使わない\n取引を止める", 5.98]];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const keys: CamKey[] = [{ t: 6.2, x: 540, y: 780, s: 1.22, d: 7 }];
  return (
    <Scene a={0} b={6.64} inT="punch" outT="zoom">
      <Bg />
      <Camera keys={keys}>
        <Ghost at={0.05} style={{ left: 0, top: 236, width: 1080, textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 18, background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, padding: "14px 34px", boxShadow: `0 8px 0 ${SH}` }}>
            <Img src={staticFile("logos/sbi.png")} style={{ width: 360 }} />
            <span style={{ ...K, fontSize: 44, color: INK }}>を使っている人</span>
          </span>
        </Ghost>
        <Ghost at={1.6} style={{ left: 0, top: 360, width: 1080, textAlign: "center", whiteSpace: "nowrap" }}>
          <span style={{ ...K, fontSize: 80, color: INK, textShadow: `0 7px 0 ${YEL}` }}>証券口座の<span style={{ color: RED }}>乗っ取り</span>対策</span>
        </Ghost>
        <Ghost at={3.26} style={{ left: 0, top: 486, width: 1080, textAlign: "center" }}>
          <span style={{ display: "inline-block", background: YEL, border: `5px solid ${INK}`, borderRadius: 16, padding: "6px 34px", ...K, fontSize: 52, color: INK, boxShadow: `0 7px 0 ${INK}` }}>ちゃんとできていますか？</span>
        </Ghost>
        {/* 口だけ動く太一 → 4つの設定が出たら下へ */}
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${interpolate(f, [F(4.4), F(4.4) + 8], [0, 380], out)}px)` }}>
          <Mouth x={250} y={600} size={580} />
        </div>
        {/* 4つの設定 */}
        {TABS.map(([no, t, at], i) => f >= F(at) ? (
          <div key={no} style={{ position: "absolute", left: 92 + i * 228, top: 700, width: 212, ...ghostIn(f, F(at)), transform: `translateY(${interpolate(f - F(at), [0, 5], [-40, 0], out)}px)` }}>
            <div style={{ background: [BLUE, "#7A4FD8", "#F08A24", RED][i], border: `5px solid ${INK}`, borderBottom: "none", borderRadius: "14px 14px 0 0", textAlign: "center", color: "#fff", ...K, fontSize: 34 }}>{no}</div>
            <div style={{ background: "#fff", border: `5px solid ${INK}`, height: 128, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", ...B, fontSize: 28, lineHeight: 1.3, whiteSpace: "pre", color: INK, boxShadow: `0 8px 0 ${SH}` }}>{t}</div>
          </div>
        ) : null)}
        {f >= F(4.46) ? <Ghost at={4.46} style={{ left: 0, top: 590, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 58, color: INK }}>やっておきたい設定 {c(BLUE, "4つ")}</span></Ghost> : null}
      </Camera>
      <SpeedLines at={6.4} dur={8} />
    </Scene>
  );
};

// ════════ ① パスキーを登録（6.64–17.46） ════════
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [F(8.5), F(8.5) + 6], [0, 100], out);
  const keys: CamKey[] = [{ t: 0, x: 540, y: 860, s: 1, d: 1 }, { t: 11.5, x: 540, y: 640, s: 1.3, d: 7 }, { t: 14.9, x: 540, y: 860, s: 1, d: 7 }];
  return (
    <Scene a={6.64} b={17.46}>
      <Bg />
      <Camera keys={keys}>
        <Head at={6.64} no="1" big crumb="セキュリティ設定 → パスキー認証">パスキーを登録</Head>
        {/* パスワード → 顔・指紋 */}
        <Ghost at={7.94} until={11.28} style={{ left: 0, top: 500, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 }}>
          <div style={{ position: "relative", ...BOXS, fontSize: 46, ...K }}>
            <span style={{ letterSpacing: 6 }}>＊＊＊＊＊＊</span>
            <div style={{ fontSize: 26, ...B, color: SUB }}>パスワード</div>
            <span style={{ position: "absolute", left: 10, top: "46%", height: 10, borderRadius: 5, background: RED, width: `calc(${strike}% - 20px)` }} />
          </div>
          <span style={{ ...K, fontSize: 70, color: INK, opacity: f >= F(8.6) ? 1 : 0 }}>→</span>
        </Ghost>
        <Ghost at={9.08} until={11.28} style={{ left: 610, top: 470 }}>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ ...BOXS, padding: 18 }}><FaceIcon s={120} /><div style={{ fontSize: 28 }}>顔認証</div></div>
            {f >= F(9.86) ? <div style={{ ...BOXS, padding: 18, ...ghostIn(f, F(9.86)) }}><FingerIcon s={120} /><div style={{ fontSize: 28 }}>指紋</div></div> : null}
          </div>
        </Ghost>
        <Box at={10.26} until={11.28} to={[540, 860]} size={44}>パスワードの代わりに{"\n"}{c(BLUE, "顔や指紋でログイン")}する仕組み</Box>
        {/* 実際の画面：原則必須化 → 新規追加 */}
        <ShotView s={PK_MUST} at={11.28} until={14.94} />
        <Spot at={12.3} until={14.9} rect={sr(PK_MUST, [80, 205, 1100, 335])} r={18} />
        <ShotView s={PK_ADD} at={14.94} />
        <Spot at={15.3} rect={sr(PK_ADD, [220, 1265, 960, 1615])} r={18} />
        <Box at={15.8} from={[540, sr(PK_ADD, [0, 1615, 0, 0])[1]]} to={[400, 1200]} size={38}>{c(BLUE, "使っている端末")}で登録</Box>
        <Side poses={[[6.64, "taichi_point_up"], [9.08, "taichi_idea"], [11.28, "taichi_point_left"], [14.94, "taichi_ok_hand"]]} />
      </Camera>
    </Scene>
  );
};

// ════════ ② パスワードログインを止める（17.46–30.26） ════════
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const flip = interpolate(f, [F(24.4), F(24.4) + 6], [0, 1], out);
  const keys: CamKey[] = [{ t: 0, x: 540, y: 860, s: 1, d: 1 }, { t: 22.54, x: 540, y: 820, s: 1.1, d: 7 }, { t: 26.5, x: 540, y: 820, s: 1.08, d: 7 }];
    return (
    <Scene a={17.46} b={30.26} inT="drop">
      <Bg />
      <Camera keys={keys}>
        <Head at={17.46} no="2" crumb="ログインパスワード無効設定">パスワードログインを止める</Head>
        {/* 入口が2つ：パスキー と パスワード */}
        <Ghost at={19.36} until={22.54} style={{ left: 120, top: 500, width: 840 }}>
          <div style={{ display: "flex", gap: 30 }}>
            <div style={{ flex: 1, ...BOXS, padding: "22px 10px" }}><FaceIcon s={110} /><div style={{ fontSize: 36 }}>パスキー</div><div style={{ marginTop: 10 }}><Check at={19.9} /></div></div>
            <div style={{ flex: 1, ...BOXS, padding: "22px 10px", borderColor: f >= F(20.44) ? RED : INK, boxShadow: `0 8px 0 ${f >= F(20.44) ? RED : SH}` }}>
              <div style={{ ...K, fontSize: 56, height: 110, lineHeight: "110px", letterSpacing: 4 }}>＊＊＊＊</div><div style={{ fontSize: 36 }}>パスワード</div>
              {f >= F(21.26) ? <div style={{ marginTop: 10, display: "inline-block", background: RED, color: "#fff", borderRadius: 999, padding: "4px 22px", fontSize: 30, transform: `scale(${pop(f, F(21.26))})` }}>まだ使える…</div> : <div style={{ height: 52 }} />}
            </div>
          </div>
        </Ghost>
        {/* 実際の画面：ログインパスワード無効設定 */}
        <ShotView s={PW_CHG} at={22.54} until={26.62} />
        <Spot at={22.9} until={24.04} rect={sr(PW_CHG, [40, 835, 1140, 1390])} r={16} />
        <Spot at={24.04} until={26.5} rect={sr(PW_CHG, [220, 1515, 960, 1680])} r={16} />
        {/* 注意：画面のピンクの線の所 */}
        <ShotView s={PW_TOP} at={26.62} />
        <Spot at={26.9} rect={sr(PW_TOP, [40, 740, 1110, 930])} r={14} color={RED} />
        <Ghost at={26.62} style={{ left: 0, top: 470, width: 1080, textAlign: "center" }}><span style={{ display: "inline-block", background: RED, color: "#fff", borderRadius: 999, padding: "6px 34px", ...K, fontSize: 44 }}>ただし注意</span></Ghost>
        <div style={{ position: "absolute", inset: 0 }}><Stamp at={29.94} x={230} y={1010} text="パスキーは消さない" color={RED} size={60} rot={-4} /></div>
        <Side poses={[[17.46, "taichi_explain_both"], [20.44, "taichi_notice"], [22.54, "taichi_point_left"], [24.66, "taichi_thumbs_up"]]} />
      </Camera>
        <Box at={24.66} until={26.5} from={toScr(keys, 24.66, [540, sr(PW_CHG, [0, 1680, 0, 0])[1]])} to={[400, 1200]} size={38}>{c(BLUE, "パスキー中心")}のログインに</Box>
    </Scene>
  );
};

// ════════ ③ 使わないアプリを確認（30.26–40.02） ════════
const _APPS = ["SBI証券Plus", "国内株アプリ", "投信つみたてアプリ", "米国株アプリ", "FXアプリ", "先物・オプションアプリ", "店頭CFDアプリ", "HYPER SBI 2"];
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const keys: CamKey[] = [{ t: 0, x: 540, y: 860, s: 1, d: 1 }, { t: 31.82, x: 540, y: 760, s: 1.25, d: 7 }, { t: 35.2, x: 540, y: 860, s: 1, d: 7 }];
  return (
    <Scene a={30.26} b={40.02}>
      <Bg />
      <Camera keys={keys}>
        <Head at={30.26} no="3" crumb="アプリ・ツールのログイン制限設定">使わないアプリを確認</Head>
        <ShotView s={APP_T} at={30.6} until={37.3} />
        <Spot at={32.0} until={35.2} rect={sr(APP_T, [0, 205, 872, 292])} r={12} />
        <ShotView s={APP_D} at={37.3} />
        <Spot at={37.6} rect={sr(APP_D, [462, 108, 660, 448])} r={12} color={RED} />
        <Side poses={[[30.26, "taichi_think_chin"], [32.6, "taichi_hmm_doubt"], [37.3, "taichi_ok_circle"]]} />
      </Camera>
        <Box at={32.6} until={35.2} from={toScr(keys, 32.6, [540, sr(APP_T, [0, 292, 0, 0])[1]])} to={[400, 1200]} size={38}>{c(BLUE, "米国株やFX")}など{"\n"}使っていないアプリはない？</Box>
        <Box at={38.0} from={toScr(keys, 38.0, [sr(APP_D, [560, 0, 0, 0])[0], sr(APP_D, [0, 448, 0, 0])[1]])} to={[400, 1200]} size={38}>「{c(RED, "ログイン不可")}」になっているか{"\n"}確認しておく</Box>
      <Ghost at={34.0} until={37.2} style={{ left: 0, top: 1170, width: 1080, textAlign: "center" }}><span style={{ ...B, fontSize: 24, color: SUB }}>※パスキーを設定していれば、制限してもパスキーではログインできます</span></Ghost>
    </Scene>
  );
};

// ════════ ④ 使わない取引を止める（40.02–56.08）※フォームの画面は使わず、自作の図 ════════
const TRADES: [string, boolean][] = [["国内株式・投資信託", false], ["外国株式", true], ["FX", true], ["先物・オプション", true], ["CFD", true]];
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const dark = interpolate(f, [F(48.12), F(48.12) + 4], [0, 1], clamp) * (1 - interpolate(f, [F(53.2), F(53.2) + 5], [0, 1], clamp));
  return (
    <Scene a={40.02} b={56.08} inT="punch">
      <Bg />
      <Head at={40.02} no="4" crumb="取引制限受付フォーム">使わない取引を止める</Head>
      <ShotView s={ACC} at={40.6} until={44.92} />
      <Spot at={42.02} until={44.9} rect={sr(ACC, [0, 1770, 1179, 2060])} r={12} />
      <Box at={42.4} until={44.9} from={[540, sr(ACC, [0, 2060, 0, 0])[1]]} to={[400, 1200]} size={38}>使っていなくても{"\n"}{c(RED, "開設済")}になっていることも</Box>
      {/* 自分の取引に合わせて止める（自作の図） */}
      {TRADES.map(([t, stop], i) => {
        const at = F(44.92) + i * 3;
        if (f < at) return null;
        const on = stop && f >= F(46.5) + (i - 1) * 4;
        return (
          <div key={t} style={{ position: "absolute", left: 130, top: 500 + i * 118, width: 820, height: 96, background: "#fff", border: `5px solid ${on ? RED : INK}`, borderRadius: 18, boxShadow: `0 7px 0 ${on ? RED : SH}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", boxSizing: "border-box", ...ghostIn(f, at) }}>
            <span style={{ ...B, fontSize: 36, color: INK }}>{t}</span>
            {on ? <span style={{ background: RED, color: "#fff", borderRadius: 999, padding: "4px 26px", ...K, fontSize: 32, transform: `scale(${pop(f, F(46.5) + (i - 1) * 4)})` }}>止める</span>
              : <span style={{ background: "#E7E9F5", color: SUB, borderRadius: 999, padding: "4px 26px", ...B, fontSize: 30 }}>{stop ? "使ってない…" : "使っている"}</span>}
          </div>
        );
      })}
      <Ghost at={44.92} until={48.0} style={{ left: 0, top: 1110, width: 1080, textAlign: "center" }}><span style={{ ...BOXS, display: "inline-block", fontSize: 38 }}>「取引制限受付フォーム」から{c(RED, "取引ごと")}に</span></Ghost>
      <Side poses={[[40.02, "taichi_explain_both"], [44.92, "taichi_point_left"], [48.12, "taichi_stop_hand"], [53.3, "taichi_ok_hand"]]} />
      {/* 普段使っている取引まで止めると… */}
      {dark > 0 ? (
        <AbsoluteFill style={{ background: `rgba(30,31,46,${0.9 * dark})` }}>
          <div style={{ position: "absolute", left: 130, top: 500, width: 820, height: 96, background: "#fff", border: `6px solid ${YEL}`, borderRadius: 18, boxShadow: `0 0 26px ${YEL}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", boxSizing: "border-box" }}>
            <span style={{ ...B, fontSize: 36, color: INK }}>国内株式・投資信託</span>
            {f >= F(49.86) ? <span style={{ background: RED, color: "#fff", borderRadius: 999, padding: "4px 26px", ...K, fontSize: 32, transform: `scale(${pop(f, F(49.86))})` }}>止める？</span> : null}
          </div>
          <Ghost at={48.6} style={{ left: 0, top: 650, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 52, color: "#fff" }}>普段使っている取引まで止めると</span></Ghost>
          <Ghost at={50.46} style={{ left: 0, top: 760, width: 1080, display: "flex", justifyContent: "center", gap: 30 }}>
            {["注文", "積立"].map((t, i) => (
              <div key={t} style={{ ...BOXS, fontSize: 46, ...K, position: "relative", ...ghostIn(f, F(i ? 51.02 : 50.46)) }}>{t}<span style={{ position: "absolute", right: -22, top: -26, ...K, fontSize: 64, color: RED }}>✕</span></div>
            ))}
          </Ghost>
          <Ghost at={51.6} style={{ left: 0, top: 920, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 48, color: YEL }}>に影響することも</span></Ghost>
        </AbsoluteFill>
      ) : null}
      <Box at={53.3} to={[540, 1170]} size={42} bg={YEL}>{c(BLUE, "自分が使っている取引")}を{"\n"}確認してから設定</Box>
      <Ghost at={53.4} style={{ left: 0, top: 1278, width: 1080, textAlign: "center" }}><span style={{ ...B, fontSize: 22, color: SUB }}>※「国内株式・投資信託」を停止すると、投資信託の積立買付も停止（フォームの注意書きより）</span></Ghost>
    </Scene>
  );
};

// ════════ 締め（56.08–61.9） ════════
const Close: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene a={56.08} b={62.4} inT="zoom" outT="zoom">
      <Bg />
      <ShotView s={FAQ} at={56.1} />
      <Ghost at={57.06} style={{ left: 0, top: 680, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 50, color: INK }}>どれも{c(BLUE, "SBI証券の公式ページ")}で紹介</span></Ghost>
      {["パスキー", "パスワード", "アプリ", "取引"].map((t, i) => (
        <Ghost key={t} at={57.3 + i * 0.12} style={{ left: 40 + i * 255, top: 775, width: 240, textAlign: "center", whiteSpace: "nowrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `4px solid ${INK}`, borderRadius: 999, padding: "6px 18px", ...B, fontSize: 28 }}><Check at={60.94 + i * 0.12} s={34} />{t}</span>
        </Ghost>
      ))}
      <Mouth x={340} y={850} size={400} />
      <Ghost at={59.78} style={{ left: 0, top: 1180, width: 1080, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: YEL, border: `5px solid ${INK}`, borderRadius: 16, padding: "8px 36px", ...K, fontSize: 48, color: INK, boxShadow: `0 7px 0 ${INK}` }}>保存して、今日のうちに確認！</span>
      </Ghost>
    </Scene>
  );
};

// 字幕（話した言葉どおり）
const SUBS: [number, string][] = [
  [0, "*SBI証券*を使っている人"], [1.6, "証券口座の!乗っ取り!対策"], [3.26, "ちゃんとできていますか？"], [4.46, "やっておきたい設定を*4つ*解説します"],
  [6.64, "1つ目 *パスキーの登録*"], [7.94, "パスワードの代わりに"], [9.08, "*顔認証*や*指紋*でログインする仕組みです"], [11.28, "SBI証券でもパスキー設定が"], [13.24, "!原則必須!になっているので"], [14.94, "まずは使っている端末で"], [16.44, "*登録*しておきましょう"],
  [17.46, "2つ目 *パスワードでのログイン*を止める"], [19.36, "パスキーを登録しても"], [20.44, "パスワードログインが!残っている!場合があります"], [22.54, "*ログインパスワード無効設定*をしておけば"], [24.66, "*パスキー中心*のログインに切り替えられます"], [26.62, "もし保存しているパスキーを消すと"], [28.34, "!ログインできなくなる!ことがあるので注意"],
  [30.26, "3つ目 *使わないアプリ*を確認"], [31.82, "米国株やFXなど"], [33.38, "使っていないアプリやツールがある人は"], [35.24, "*アプリ・ツールのログイン制限設定*で"], [37.3, "!ログインできない状態!になっているか"], [39.04, "確認しておきましょう"],
  [40.02, "4つ目 *使わない取引*を止める"], [42.02, "外国株やFXなど"], [43.36, "使っていない取引がある人は"], [44.92, "*取引制限受付フォーム*から"], [46.52, "取引ごとに制限できます"], [48.12, "ただし普段使っている取引まで止めると"], [50.46, "!注文や積立!に影響する可能性があるので"], [53.3, "*自分が使っている取引*は"], [54.56, "確認してから設定してください"],
  [56.08, "今回の対策はどれも"], [57.44, "*SBI証券の公式ページ*で紹介されています"], [59.78, "*保存*して今日のうちに"], [60.94, "確認しておきましょう"],
];

const CUES: { file: string; at: number; volume: number }[] = [
  { file: "user/intro", at: 0, volume: 0.7 }, // 冒頭の音源
  { file: "user/u04", at: F(1.6), volume: 0.34 },
  { file: "user/u05", at: F(3.26), volume: 0.26 },
  ...TABS.map(([, , t]) => ({ file: "user/u02s", at: F(t), volume: 0.22 })),
  { file: "user/u03s", at: F(6.2), volume: 0.26 },
  ...[6.64, 17.46, 30.26, 40.02, 56.08].map((t) => ({ file: "user/u03", at: F(t), volume: 0.26 })),
  { file: "user/u02s", at: F(7.94), volume: 0.22 }, { file: "user/u05s", at: F(9.08), volume: 0.24 }, { file: "user/u02s", at: F(9.86), volume: 0.22 },
  { file: "user/u02s", at: F(11.28), volume: 0.22 }, { file: "user/u03s", at: F(11.5), volume: 0.22 }, { file: "user/u05", at: F(12.3), volume: 0.26 },
  { file: "user/u05s", at: F(16.44), volume: 0.24 }, { file: "user/u05s", at: F(16.6), volume: 0.2 },
  { file: "user/u02s", at: F(19.36), volume: 0.22 }, { file: "user/u04", at: F(21.26), volume: 0.28 },
  { file: "user/u02s", at: F(22.54), volume: 0.22 }, { file: "user/u03s", at: F(22.54), volume: 0.22 }, { file: "user/u06", at: F(24.04), volume: 0.34 }, { file: "user/u05", at: F(24.66), volume: 0.26 },
  { file: "user/u04", at: F(26.62), volume: 0.32 }, { file: "user/u04", at: F(28.0), volume: 0.32 }, { file: "user/u04", at: F(29.94), volume: 0.34 },
  { file: "user/u02s", at: F(30.6), volume: 0.22 }, { file: "user/u03s", at: F(31.82), volume: 0.22 }, { file: "user/u05s", at: F(32.0), volume: 0.24 },
  ...[37.3, 37.5, 37.7, 37.9].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })), { file: "user/u05", at: F(38.0), volume: 0.26 },
  ...[0, 1, 2, 3, 4].map((i) => ({ file: "user/u02s", at: F(42.0) + i * 4, volume: 0.18 })),
  ...[0, 1, 2, 3].map((i) => ({ file: "user/u05s", at: F(46.5) + i * 4, volume: 0.2 })),
  { file: "user/u04", at: F(48.12), volume: 0.3 }, { file: "user/u04", at: F(49.86), volume: 0.28 }, { file: "user/u05", at: F(50.46), volume: 0.24 },
  { file: "user/u05", at: F(53.3), volume: 0.28 },
  { file: "user/u02s", at: F(57.3), volume: 0.2 }, ...[0, 1, 2, 3].map((i) => ({ file: "user/u05s", at: F(60.94 + i * 0.12), volume: 0.18 })),
  { file: "user/u10", at: F(59.78), volume: 0.3 },
  // 追加：画面・箱・スポット・カメラ・文字の出現
  { file: "user/u02s", at: F(0.05), volume: 0.14 },
  { file: "user/u02s", at: F(4.46), volume: 0.14 },
  { file: "user/u02s", at: F(10.26), volume: 0.2 },
  { file: "user/u03s", at: F(14.9), volume: 0.2 },
  { file: "user/u05s", at: F(15.3), volume: 0.2 },
  { file: "user/u02s", at: F(15.8), volume: 0.2 },
  { file: "user/u05s", at: F(22.9), volume: 0.2 },
  { file: "user/u03s", at: F(26.5), volume: 0.2 },
  { file: "user/u05s", at: F(26.9), volume: 0.2 },
  { file: "user/u02s", at: F(32.6), volume: 0.2 },
  { file: "user/u02s", at: F(34.0), volume: 0.14 },
  { file: "user/u03s", at: F(35.2), volume: 0.2 },
  { file: "user/u03s", at: F(37.3), volume: 0.22 },
  { file: "user/u05s", at: F(37.6), volume: 0.2 },
  { file: "user/u03s", at: F(40.6), volume: 0.22 },
  { file: "user/u02s", at: F(42.4), volume: 0.2 },
  { file: "user/u02s", at: F(44.92), volume: 0.14 },
  { file: "user/u02s", at: F(48.6), volume: 0.14 },
  { file: "user/u02s", at: F(51.6), volume: 0.14 },
  { file: "user/u03s", at: F(56.1), volume: 0.22 },
  { file: "user/u02s", at: F(57.06), volume: 0.14 },
];

// 場面が変わる瞬間の白い光
const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const o = interpolate(f - F(at), [0, 1, 6], [0, 0.55, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} /> : null;
};

export const SBI_FRAMES = F(62.4);
export const SbiReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: LAV, fontFamily: FONT }}>
    <Audio src={staticFile("sbi-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Hook /><S1 /><S2 /><S3 /><S4 /><Close />
    {[6.64, 17.46, 30.26, 40.02, 56.08].map((t) => <SpeedLines key={t} at={t} dur={10} />)}
    {[6.64, 17.46, 30.26, 40.02].map((t) => <Flash key={t} at={t} />)}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1310, bottom: 0, background: `linear-gradient(${LAV}00, ${LAV} 70px)` }} />
    <Captions subs={SUBS} end={61.9} maxW={900} size={0.9} />
  </AbsoluteFill>
);
