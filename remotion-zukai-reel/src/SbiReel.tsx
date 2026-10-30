import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT, FONT_BLACK } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { B, GenSlot } from "./MileLifePlan";
import { Scene, Stamp, PopIn, Pic, Captions } from "./BourakuReel";
import { Camera, CamKey, Spot, ghostIn, SpeedLines } from "./components/cam";
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
const INK = "#1B1F3B", SH = "#2C42C9", NAVY = "#1B2A7A", BLUE = "#2F5BF0", YEL = "#FFC23A", RED = "#EE4646", GREEN = "#21A35B", LAV = "#ECEDFA", SUB = "#6B7092";
const pop = (f: number, at: number) => interpolate(f - at, [0, 3, 6], [0.3, 1.2, 1], clamp);

// ── 背景：方眼 ──
const Bg: React.FC = () => (
  <AbsoluteFill style={{ background: LAV, backgroundImage: "linear-gradient(rgba(60,70,170,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(60,70,170,0.07) 2px, transparent 2px)", backgroundSize: "56px 56px" }} />
);

const Ghost: React.FC<{ at: number; until?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, until = 999, style, children }) => {
  const f = useCurrentFrame();
  const A = F(at), Z = F(until);
  if (f < A || f >= Z + 3) return null;
  const g = ghostIn(f, A);
  return <div style={{ position: "absolute", ...style, ...g, opacity: (g.opacity as number) * (1 - interpolate(f, [Z, Z + 3], [0, 1], clamp)) }}>{children}</div>;
};
const c = (col: string, t: React.ReactNode) => <span style={{ color: col }}>{t}</span>;

// 道順の札＋見出し（番号つき）
const Head: React.FC<{ at: number; no: string; crumb: string; big?: boolean; children: React.ReactNode }> = ({ at, no, crumb, big, children }) => (
  <>
    <Ghost at={at} style={{ left: 0, top: 232, width: 1080, textAlign: "center" }}>
      <span style={{ display: "inline-block", background: INK, color: "#fff", borderRadius: 999, padding: "8px 30px", ...B, fontSize: 30, boxShadow: `0 6px 0 ${SH}` }}>{crumb}</span>
    </Ghost>
    <Ghost at={at + 0.05} style={{ left: 0, top: 300, width: 1080, textAlign: "center", whiteSpace: "nowrap" }}>
      <span style={{ display: "inline-block", width: 92, height: 92, borderRadius: "50%", background: BLUE, border: `5px solid ${INK}`, color: "#fff", ...K, fontSize: 56, lineHeight: "82px", verticalAlign: "middle", marginRight: 18, boxShadow: `0 6px 0 ${INK}` }}>{no}</span>
      <span style={{ ...K, fontSize: big ? 84 : 64, color: INK, verticalAlign: "middle", textShadow: `0 7px 0 #B8C2F7` }}>{children}</span>
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
          <span style={{ display: "inline-block", background: NAVY, color: "#fff", borderRadius: 999, padding: "10px 40px", ...K, fontSize: 44 }}>SBI証券を使っている人</span>
        </Ghost>
        <Ghost at={1.6} style={{ left: 0, top: 330, width: 1080, textAlign: "center", whiteSpace: "nowrap" }}>
          <span style={{ ...K, fontSize: 80, color: INK, textShadow: "0 8px 0 #B8C2F7" }}>証券口座の<span style={{ color: RED }}>乗っ取り</span>対策</span>
        </Ghost>
        <Ghost at={3.26} style={{ left: 0, top: 466, width: 1080, textAlign: "center" }}>
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
  const keys: CamKey[] = [{ t: 0, x: 540, y: 860, s: 1, d: 1 }, { t: 11.5, x: 540, y: 760, s: 1.14, d: 7 }, { t: 14.9, x: 540, y: 860, s: 1, d: 7 }];
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
        {/* 画面：パスキー認証（原則必須化） */}
        {f >= F(11.28) ? (
          <div style={{ ...SCR, left: 140, top: 480, width: 800, height: 600, ...ghostIn(f, F(11.28)) }}>
            <ScrHead t="パスキー認証" />
            <div style={{ margin: "24px 26px", border: "3px solid #C9CFE6", borderRadius: 18, padding: "20px 24px" }}>
              <div style={{ ...K, fontSize: 32, color: INK }}><span style={{ color: "#2E8C7A" }}>❗</span> 6/30よりパスキー認証の設定を原則必須化いたしました。</div>
              <div style={{ ...B, fontSize: 24, color: SUB, marginTop: 10 }}>不正ログイン対策のため、パスキー認証の設定を強く推奨しております。</div>
            </div>
            <SecTitle t="パスキーの新規追加" />
            <div style={{ margin: "0 26px", ...B, fontSize: 24, color: SUB }}>取引パスワードを入力のうえ「認証コードを送信」</div>
            <div style={{ margin: "16px 120px 0", height: 62, border: "3px solid #B9BFD6", borderRadius: 12, ...B, fontSize: 26, color: "#9AA0BC", lineHeight: "56px", paddingLeft: 20 }}>取引パスワード</div>
            <div style={{ margin: "14px 120px 0", height: 62, background: NAVY, borderRadius: 12, ...K, fontSize: 28, color: "#fff", textAlign: "center", lineHeight: "62px" }}>認証コードを送信 ＞</div>
          </div>
        ) : null}
        <Spot at={12.3} until={14.9} rect={[160, 548, 760, 168]} r={18} />
        {/* 使っている端末で登録 */}
        <Ghost at={14.94} style={{ left: 0, top: 1100, width: 1080, display: "flex", justifyContent: "center", gap: 40, alignItems: "center" }}>
          <div style={{ ...BOXS, display: "flex", alignItems: "center", gap: 18, padding: "10px 28px" }}><PhoneIcon s={90} /><span style={{ fontSize: 34 }}>スマホ</span><Check at={16.44} s={56} /></div>
          <div style={{ ...BOXS, display: "flex", alignItems: "center", gap: 18, padding: "10px 28px" }}><PcIcon s={90} /><span style={{ fontSize: 34 }}>パソコン</span><Check at={16.6} s={56} /></div>
        </Ghost>
        <Side poses={[[6.64, "taichi_point_up"], [9.08, "taichi_idea"], [11.28, "taichi_point_left"], [14.94, "taichi_ok_hand"]]} />
      </Camera>
    </Scene>
  );
};

// ════════ ② パスワードログインを止める（17.46–30.26） ════════
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const flip = interpolate(f, [F(24.4), F(24.4) + 6], [0, 1], out);
  const keys: CamKey[] = [{ t: 0, x: 540, y: 860, s: 1, d: 1 }, { t: 22.54, x: 540, y: 820, s: 1.1, d: 7 }, { t: 26.5, x: 540, y: 860, s: 1, d: 7 }];
  const dark = interpolate(f, [F(26.62), F(26.62) + 4], [0, 1], clamp);
  return (
    <Scene a={17.46} b={30.26}>
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
        {/* 画面：ログインパスワード無効設定 */}
        {f >= F(22.54) ? (
          <div style={{ ...SCR, left: 140, top: 480, width: 800, height: 640, ...ghostIn(f, F(22.54)) }}>
            <ScrHead t="ログインパスワード無効設定" />
            <SecTitle t="現在の設定内容" />
            <div style={{ margin: "0 26px", ...B, fontSize: 24, color: SUB }}>現在の設定内容</div>
            <div style={{ margin: "4px 26px 0", ...B, fontSize: 32, color: INK }}>設定しない（ログインパスワード利用可）</div>
            <div style={{ textAlign: "center", ...K, fontSize: 48, color: BLUE, margin: "8px 0" }}>↓</div>
            <div style={{ margin: "0 26px", ...B, fontSize: 24, color: SUB }}>変更後の設定内容</div>
            <div style={{ margin: "4px 26px 0", ...B, fontSize: 32, color: flip > 0.5 ? RED : INK }}>設定する（ログインパスワード利用不可）</div>
            <div style={{ margin: "34px 150px 0", height: 76, background: NAVY, borderRadius: 14, ...K, fontSize: 34, color: "#fff", textAlign: "center", lineHeight: "76px", transform: `scale(${f >= F(24.04) ? interpolate(f - F(24.04), [0, 3, 6], [1, 0.92, 1], clamp) : 1})` }}>変更(パスキー認証)</div>
          </div>
        ) : null}
        <Spot at={22.9} until={24.04} rect={[160, 670, 760, 250]} r={16} />
        <Spot at={24.04} until={26.5} rect={[284, 1000, 512, 92]} r={16} />
        <Box at={24.66} until={26.5} from={[540, 1092]} to={[540, 1200]} size={40}>{c(BLUE, "パスキー中心")}のログインに切り替え</Box>
        <Side poses={[[17.46, "taichi_explain_both"], [20.44, "taichi_notice"], [22.54, "taichi_point_left"], [24.66, "taichi_thumbs_up"]]} />
      </Camera>
      {/* 注意：パスキーを消すとログインできない */}
      {dark > 0 ? (
        <AbsoluteFill style={{ background: `rgba(30,31,46,${0.82 * dark})` }}>
          <Ghost at={26.7} style={{ left: 0, top: 470, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 60, color: "#fff" }}>ただし注意</span></Ghost>
          <Ghost at={27.0} style={{ left: 290, top: 580 }}>
            <div style={{ position: "relative", width: 500, height: 300, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 }}>
              <div style={{ ...BOXS, padding: 16 }}><FaceIcon s={120} /><div style={{ fontSize: 26 }}>保存したパスキー</div></div>
              {f >= F(28.0) ? <span style={{ ...K, fontSize: 120, color: RED, transform: `scale(${pop(f, F(28.0))})` }}>✕</span> : null}
            </div>
          </Ghost>
          <Ghost at={28.34} style={{ left: 0, top: 920, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 56, color: "#fff" }}>消すと<span style={{ color: YEL }}>ログインできなくなる</span>ことも</span></Ghost>
          <div style={{ position: "absolute", inset: 0 }}><Stamp at={29.94} x={250} y={1060} text="パスキーは消さない" color={RED} size={60} rot={-4} /></div>
        </AbsoluteFill>
      ) : null}
    </Scene>
  );
};

// ════════ ③ 使わないアプリを確認（30.26–40.02） ════════
const APPS = ["SBI証券Plus", "国内株アプリ", "投信つみたてアプリ", "米国株アプリ", "FXアプリ", "先物・オプションアプリ", "店頭CFDアプリ", "HYPER SBI 2"];
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const RY = 600, RH = 58;
  const keys: CamKey[] = [{ t: 0, x: 540, y: 860, s: 1, d: 1 }, { t: 31.82, x: 540, y: 880, s: 1.1, d: 7 }, { t: 35.2, x: 540, y: 860, s: 1, d: 7 }];
  const off = (i: number) => (i === 3 ? F(37.3) : i === 4 ? F(37.5) : i === 5 ? F(37.7) : i === 6 ? F(37.9) : 99999);
  return (
    <Scene a={30.26} b={40.02}>
      <Bg />
      <Camera keys={keys}>
        <Head at={30.26} no="3" crumb="アプリ・ツールのログイン制限設定">使わないアプリを確認</Head>
        {f >= F(30.6) ? (
          <div style={{ ...SCR, left: 120, top: 480, width: 840, height: 600, ...ghostIn(f, F(30.6)) }}>
            <ScrHead t="アプリ・ツールのログイン制限設定" />
            <div style={{ display: "flex", background: "#F3F1DE", ...B, fontSize: 24, color: INK, height: 50, lineHeight: "50px", borderBottom: "2px solid #DDD" }}>
              <div style={{ width: 460, textAlign: "center" }}>アプリ・ツール</div><div style={{ flex: 1, textAlign: "center" }}>ログイン</div>
            </div>
            {APPS.map((a, i) => {
              const ng = f >= off(i);
              return (
                <div key={a} style={{ position: "absolute", left: 0, top: RY - 480 + i * RH - 4, width: 828, height: RH, display: "flex", alignItems: "center", borderBottom: "2px solid #EEE", ...B, fontSize: 28, color: INK }}>
                  <div style={{ width: 460, textAlign: "center" }}>{a}</div>
                  <div style={{ flex: 1, textAlign: "center", color: ng ? RED : INK, ...(ng ? K : {}), transform: ng ? `scale(${pop(f, off(i))})` : undefined }}>{ng ? "ログイン不可" : "ログイン可"}</div>
                </div>
              );
            })}
          </div>
        ) : null}
        <Spot at={32.0} until={35.2} rect={[132, RY + 3 * RH + 2, 816, RH * 2 - 6]} r={12} />
        <Box at={32.6} until={35.2} from={[540, RY + 5 * RH]} to={[400, 1160]} size={38}>{c(BLUE, "米国株やFX")}など{"\n"}使っていないアプリはない？</Box>
        <Spot at={37.3} until={40.0} rect={[590, RY + 3 * RH + 2, 358, RH * 4 - 6]} r={12} color={RED} />
        <Box at={38.0} from={[770, RY + 7 * RH]} to={[400, 1160]} size={38}>「{c(RED, "ログイン不可")}」になっているか{"\n"}確認しておく</Box>
        <Side poses={[[30.26, "taichi_think_chin"], [32.6, "taichi_hmm_doubt"], [37.3, "taichi_ok_circle"]]} />
      </Camera>
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
    <Scene a={40.02} b={56.08}>
      <Bg />
      <Head at={40.02} no="4" crumb="取引制限受付フォーム">使わない取引を止める</Head>
      {/* 自分の取引に合わせて止める（自作の図） */}
      {TRADES.map(([t, stop], i) => {
        const at = F(42.0) + i * 4;
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
      <Ghost at={56.1} style={{ left: 110, top: 240, width: 860 }}>
        <div style={{ ...SCR, position: "relative", width: 860 }}>
          <div style={{ background: `linear-gradient(90deg, #3E66C8, ${NAVY})`, color: "#fff", padding: "22px 30px", ...K, fontSize: 38, lineHeight: 1.3 }}>不正なアクセスを防止するための対策を教えてください</div>
          <div style={{ padding: "14px 30px", ...B, fontSize: 24, color: SUB }}>SBI証券 よくあるご質問（画面イメージ）</div>
        </div>
      </Ghost>
      <Ghost at={57.06} style={{ left: 0, top: 500, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 50, color: INK }}>どれも{c(BLUE, "SBI証券の公式ページ")}で紹介</span></Ghost>
      {["パスキー", "パスワード", "アプリ", "取引"].map((t, i) => (
        <Ghost key={t} at={57.3 + i * 0.12} style={{ left: 40 + i * 255, top: 600, width: 240, textAlign: "center", whiteSpace: "nowrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `4px solid ${INK}`, borderRadius: 999, padding: "6px 18px", ...B, fontSize: 28 }}><Check at={60.94 + i * 0.12} s={34} />{t}</span>
        </Ghost>
      ))}
      <Mouth x={290} y={700} size={500} />
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
  { file: "dadan", at: F(1.6), volume: 0.34 },
  { file: "user/u05", at: F(3.26), volume: 0.26 },
  ...TABS.map(([, , t]) => ({ file: "user/u02s", at: F(t), volume: 0.22 })),
  { file: "whoosh2", at: F(6.2), volume: 0.26 },
  ...[6.64, 17.46, 30.26, 40.02, 56.08].map((t) => ({ file: "user/u03", at: F(t), volume: 0.26 })),
  { file: "user/u02s", at: F(7.94), volume: 0.22 }, { file: "user/u05s", at: F(9.08), volume: 0.24 }, { file: "user/u02s", at: F(9.86), volume: 0.22 },
  { file: "user/u02s", at: F(11.28), volume: 0.22 }, { file: "whoosh2", at: F(11.5), volume: 0.22 }, { file: "user/u05", at: F(12.3), volume: 0.26 },
  { file: "user/u05s", at: F(16.44), volume: 0.24 }, { file: "user/u05s", at: F(16.6), volume: 0.2 },
  { file: "user/u02s", at: F(19.36), volume: 0.22 }, { file: "thunk", at: F(21.26), volume: 0.28 },
  { file: "user/u02s", at: F(22.54), volume: 0.22 }, { file: "whoosh2", at: F(22.54), volume: 0.22 }, { file: "tap", at: F(24.04), volume: 0.34 }, { file: "user/u05", at: F(24.66), volume: 0.26 },
  { file: "thud", at: F(26.62), volume: 0.32 }, { file: "dadan", at: F(28.0), volume: 0.32 }, { file: "thud", at: F(29.94), volume: 0.34 },
  { file: "user/u02s", at: F(30.6), volume: 0.22 }, { file: "whoosh2", at: F(31.82), volume: 0.22 }, { file: "user/u05s", at: F(32.0), volume: 0.24 },
  ...[37.3, 37.5, 37.7, 37.9].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })), { file: "user/u05", at: F(38.0), volume: 0.26 },
  ...[0, 1, 2, 3, 4].map((i) => ({ file: "user/u02s", at: F(42.0) + i * 4, volume: 0.18 })),
  ...[0, 1, 2, 3].map((i) => ({ file: "user/u05s", at: F(46.5) + i * 4, volume: 0.2 })),
  { file: "thud", at: F(48.12), volume: 0.3 }, { file: "thunk", at: F(49.86), volume: 0.28 }, { file: "user/u05", at: F(50.46), volume: 0.24 },
  { file: "user/u05", at: F(53.3), volume: 0.28 },
  { file: "user/u02s", at: F(57.3), volume: 0.2 }, ...[0, 1, 2, 3].map((i) => ({ file: "user/u05s", at: F(60.94 + i * 0.12), volume: 0.18 })),
  { file: "user/u10", at: F(59.78), volume: 0.3 },
];

export const SBI_FRAMES = F(62.4);
export const SbiReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: LAV, fontFamily: FONT }}>
    <Audio src={staticFile("sbi-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Hook /><S1 /><S2 /><S3 /><S4 /><Close />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1310, bottom: 0, background: `linear-gradient(${LAV}00, ${LAV} 70px)` }} />
    <Captions subs={SUBS} end={61.9} maxW={900} size={0.9} />
  </AbsoluteFill>
);
